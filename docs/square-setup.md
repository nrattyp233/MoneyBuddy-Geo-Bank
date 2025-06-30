# Square API Setup Guide for Money Buddy

This guide will help you set up Square API for real money processing in Money Buddy.

## Step 1: Create a Square Developer Account

1. Go to [developer.squareup.com](https://developer.squareup.com/)
2. Click "Get Started" and sign up for a free developer account
3. Verify your email address and complete account setup

## Step 2: Create a New Application

1. After logging in, go to the [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Click "Create your first application" or "+" to create a new app
3. Enter application details:
   - **Application Name**: "Money Buddy" (or your preferred name)
   - **Description**: "Digital banking app with geofencing and locked savings"
4. Click "Create Application"

## Step 3: Get Your API Credentials

### Sandbox Credentials (for development):
1. In your application dashboard, click on "Sandbox" in the left sidebar
2. You'll find these credentials:
   - **Application ID**: Starts with `sandbox-sq0idb-`
   - **Access Token**: Starts with `EAAAl` (Sandbox token)
   - **Webhook Signature Key**: For webhook verification

### Production Credentials (for live transactions):
1. Click on "Production" in the left sidebar
2. You'll need to complete Square's verification process first
3. Production credentials will be available after approval

## Step 4: Configure Money Buddy

Add these credentials to your `.env.local` file:

\`\`\`env
# Square API Configuration
SQUARE_ACCESS_TOKEN=your_sandbox_access_token_here
SQUARE_APPLICATION_ID=your_application_id_here
SQUARE_ENVIRONMENT=sandbox

# For production, change to:
# SQUARE_ENVIRONMENT=production
\`\`\`

## Step 5: Test Your Setup

1. Restart your development server: `npm run dev`
2. Navigate to the "Deposit Funds" page in Money Buddy
3. Try making a test deposit (sandbox mode uses test card numbers)

## Square Test Card Numbers

For sandbox testing, use these test card numbers:

### Successful Payments:
- **Visa**: `4111 1111 1111 1111`
- **Mastercard**: `5105 1051 0510 5100`
- **American Express**: `3782 8224 6310 005`

### Test Details:
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3-4 digit number
- **ZIP**: Any 5-digit ZIP code

### Declined Payments (for testing):
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 0069`

## Square Pricing

### Sandbox (Development):
- **Free**: Unlimited test transactions
- Perfect for development and testing

### Production:
- **Online Payments**: 2.9% + 30¢ per transaction
- **In-Person**: 2.6% + 10¢ per transaction
- **No monthly fees** or setup costs

## Required Square Products

For Money Buddy, you'll need these Square APIs:

1. **Payments API**: Process credit/debit card payments
2. **Customers API**: Store customer payment methods
3. **Orders API**: Create itemized orders
4. **Webhooks**: Real-time payment notifications

## Webhook Configuration

1. In your Square app dashboard, go to "Webhooks"
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/square`
3. Subscribe to these events:
   - `payment.created`
   - `payment.updated`
   - `refund.created`
   - `refund.updated`

## Security Best Practices

- ✅ Never expose your access token in client-side code
- ✅ Use HTTPS for all API calls
- ✅ Validate webhook signatures
- ✅ Store sensitive data securely
- ✅ Use sandbox for development/testing
- ✅ Implement proper error handling

## Going Live Checklist

Before switching to production:

1. ✅ Complete Square's account verification
2. ✅ Test all payment flows in sandbox
3. ✅ Implement webhook handling
4. ✅ Add proper error handling
5. ✅ Set up monitoring and logging
6. ✅ Update environment variables to production
7. ✅ Test with real payment methods

## Troubleshooting

### Common Issues:

**"Invalid credentials" error:**
- Check that your access token is correct
- Ensure you're using the right environment (sandbox vs production)

**"Application not found" error:**
- Verify your Application ID is correct
- Make sure the app is active in your Square dashboard

**Payment declined:**
- Check if you're using valid test card numbers in sandbox
- Verify the card details format

### Need Help?
- Check [Square's API documentation](https://developer.squareup.com/docs)
- Visit [Square's community forum](https://developer.squareup.com/forums)
- Contact Money Buddy support

## Money Buddy Integration

Once configured, Money Buddy users can:
- ✅ Deposit real money via credit/debit cards
- ✅ Withdraw funds to bank accounts
- ✅ Process geofenced transfers with real money
- ✅ Earn real interest on locked savings
- ✅ Track all transactions with Square receipts

Your Money Buddy app is now ready for real money transactions! 💳🐵
