# Stripe Integration for Conditional Transfers

## Payment Flow Architecture

### 1. Payment Intent Strategy

We'll use **PaymentIntent with manual capture** to hold funds temporarily:

```typescript
// 1. Create PaymentIntent (authorize but don't capture)
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: 'usd',
  customer: senderStripeCustomerId,
  payment_method: paymentMethodId,
  confirmation_method: 'manual',
  capture_method: 'manual', // Key: Don't capture immediately
  confirm: true,
  metadata: {
    transfer_type: 'conditional_geofence',
    sender_id: senderId,
    recipient_id: recipientId,
    geofence_data: JSON.stringify(geofence),
    time_limit: timeLimit.toISOString()
  }
});

// 2. Store in database with pending status
await createConditionalTransfer({
  senderId,
  recipientId,
  amount,
  geofence,
  timeLimit,
  stripePaymentIntentId: paymentIntent.id,
  status: 'funds_held'
});
```

### 2. Conditional Release Logic

```typescript
/**
 * Release funds when geo-fence condition is met
 */
async function releaseFunds(transferId: string) {
  const transfer = await getTransfer(transferId);
  
  try {
    // Capture the previously authorized payment
    const capturedPayment = await stripe.paymentIntents.capture(
      transfer.stripe_payment_intent_id,
      {
        amount_to_capture: transfer.amount_in_cents
      }
    );
    
    // Create transfer to recipient's connected account
    const transfer = await stripe.transfers.create({
      amount: transfer.amount_in_cents,
      currency: 'usd',
      destination: recipientStripeAccountId,
      transfer_group: `conditional_transfer_${transferId}`,
      metadata: {
        original_transfer_id: transferId,
        condition_met: 'geofence_entered'
      }
    });
    
    // Update database
    await updateTransferStatus(transferId, 'released');
    
    // Send notifications
    await notifyTransferComplete(transfer);
    
  } catch (error) {
    console.error('Failed to release funds:', error);
    await updateTransferStatus(transferId, 'release_failed');
    throw error;
  }
}
```

### 3. Automatic Refund Logic

```typescript
/**
 * Refund when conditions are not met within time limit
 */
async function refundExpiredTransfer(transferId: string) {
  const transfer = await getTransfer(transferId);
  
  try {
    // Cancel the payment intent (this releases the authorization)
    const cancelledPayment = await stripe.paymentIntents.cancel(
      transfer.stripe_payment_intent_id
    );
    
    // Update database
    await updateTransferStatus(transferId, 'refunded');
    
    // Send notifications
    await notifyTransferExpired(transfer);
    
  } catch (error) {
    console.error('Failed to refund expired transfer:', error);
    
    // If cancellation fails, try explicit refund
    try {
      const refund = await stripe.refunds.create({
        payment_intent: transfer.stripe_payment_intent_id,
        reason: 'expired'
      });
      await updateTransferStatus(transferId, 'refunded');
    } catch (refundError) {
      await updateTransferStatus(transferId, 'refund_failed');
      throw refundError;
    }
  }
}
```

### 4. Webhook Handling

```typescript
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.canceled':
      await handlePaymentCancellation(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
      
    case 'transfer.created':
      await handleTransferCreated(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

### 5. Error Handling & Recovery

```typescript
/**
 * Background job to handle stuck transfers
 */
async function processStuckTransfers() {
  // Find transfers that should have been processed
  const stuckTransfers = await db.query(`
    SELECT * FROM conditional_transfers 
    WHERE status = 'funds_held' 
    AND (
      time_limit < NOW() - INTERVAL '1 hour'  -- Expired over an hour ago
      OR created_at < NOW() - INTERVAL '24 hours'  -- Or very old
    )
  `);
  
  for (const transfer of stuckTransfers) {
    try {
      // Check current Stripe status
      const paymentIntent = await stripe.paymentIntents.retrieve(
        transfer.stripe_payment_intent_id
      );
      
      switch (paymentIntent.status) {
        case 'requires_capture':
          // Still capturable - refund it
          await refundExpiredTransfer(transfer.id);
          break;
          
        case 'succeeded':
          // Already captured but not marked as released
          await updateTransferStatus(transfer.id, 'released');
          break;
          
        case 'canceled':
          // Already canceled
          await updateTransferStatus(transfer.id, 'refunded');
          break;
          
        default:
          console.log(`Unusual payment status: ${paymentIntent.status}`);
      }
      
    } catch (error) {
      console.error(`Failed to process stuck transfer ${transfer.id}:`, error);
    }
  }
}
```

## Stripe Connect Setup

### 1. Connected Accounts for Recipients

```typescript
/**
 * Create Stripe Express account for new users
 */
async function createStripeAccount(userId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: email,
    capabilities: {
      card_payments: {requested: true},
      transfers: {requested: true},
    },
    business_type: 'individual',
    metadata: {
      user_id: userId,
      platform: 'moneybuddy_geo_bank'
    }
  });
  
  // Save account ID to user record
  await updateUserStripeAccount(userId, account.id);
  
  return account;
}

/**
 * Create account link for onboarding
 */
async function createAccountLink(stripeAccountId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${FRONTEND_URL}/profile/stripe/refresh`,
    return_url: `${FRONTEND_URL}/profile/stripe/success`,
    type: 'account_onboarding',
  });
  
  return accountLink.url;
}
```

### 2. Fee Structure

```typescript
const PLATFORM_FEE_PERCENTAGE = 0.029; // 2.9%
const PLATFORM_FEE_FIXED = 30; // 30 cents

/**
 * Calculate fees for conditional transfer
 */
function calculateFees(amountInCents: number) {
  const stripeFee = Math.round(amountInCents * 0.029 + 30);
  const platformFee = Math.round(amountInCents * 0.01); // 1% platform fee
  const totalFees = stripeFee + platformFee;
  const netAmount = amountInCents - totalFees;
  
  return {
    grossAmount: amountInCents,
    stripeFee,
    platformFee,
    totalFees,
    netAmount
  };
}
```

## Security Considerations

1. **Payment Intent Validation**: Always verify payment intent belongs to the authenticated user
2. **Webhook Security**: Verify all webhook signatures
3. **Idempotency**: Use idempotency keys for critical operations
4. **Audit Trail**: Log all payment state changes
5. **Rate Limiting**: Prevent abuse of conditional transfer creation

## Testing Strategy

```typescript
// Test scenarios
const testCases = [
  {
    name: 'successful_geofence_entry',
    scenario: 'User enters geofence within time limit',
    expected: 'Funds released to recipient'
  },
  {
    name: 'time_expired_outside_geofence',
    scenario: 'Time limit expires before geofence entry',
    expected: 'Funds refunded to sender'
  },
  {
    name: 'payment_method_failure',
    scenario: 'Initial payment authorization fails',
    expected: 'Transfer creation fails gracefully'
  },
  {
    name: 'webhook_failure_recovery',
    scenario: 'Webhook delivery fails but status needs updating',
    expected: 'Background job recovers correct state'
  }
];
```
