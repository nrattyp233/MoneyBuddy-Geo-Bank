# Stripe Configuration

## Environment Variables

Add these to your `.env.local` file when setting up Stripe:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Setup Instructions

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks for payment processing
4. Add the keys to your environment variables

## Webhook Events

Configure these webhook events in your Stripe dashboard:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Integration Points

- Payment processing in `/app/api/stripe/`
- Frontend components in `/components/stripe-payment.tsx`
- Database schema updates needed for payment records
