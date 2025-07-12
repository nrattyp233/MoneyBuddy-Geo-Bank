# PayPal Webhook Setup Guide

This guide will help you set up PayPal webhooks to handle payment notifications automatically.

## 1. Webhook Endpoint

Your webhook endpoint is now available at:
- **Local Development**: `http://localhost:3000/api/webhooks/paypal`
- **Production**: `https://your-domain.com/api/webhooks/paypal`

## 2. Configure Webhook in PayPal Developer Dashboard

### Step 1: Access PayPal Developer Dashboard
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal business account
3. Navigate to **My Apps & Credentials**

### Step 2: Select Your App
1. Find your Money Buddy app (the one you created earlier)
2. Click on the app name to open its details

### Step 3: Add Webhook
1. Scroll down to find the **Webhooks** section
2. Click **Add Webhook**
3. Fill in the webhook details:

#### Webhook URL
- **For Testing (Local)**: `http://localhost:3000/api/webhooks/paypal`
- **For Production**: `https://your-vercel-domain.vercel.app/api/webhooks/paypal`

#### Event Types to Subscribe To
Select these event types that your app needs:
- ✅ **PAYMENT.CAPTURE.COMPLETED** - When payment is successfully captured
- ✅ **PAYMENT.CAPTURE.DENIED** - When payment is denied
- ✅ **PAYMENT.CAPTURE.PENDING** - When payment is pending
- ✅ **CHECKOUT.ORDER.APPROVED** - When customer approves the order
- ✅ **CHECKOUT.ORDER.COMPLETED** - When order is completed

### Step 4: Save and Get Webhook ID
1. Click **Save** to create the webhook
2. Copy the **Webhook ID** that's generated
3. Add this to your environment variables

## 3. Update Environment Variables

Add the webhook ID to your `.env.local` file:

```env
# PayPal Webhook Configuration
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

## 4. Testing Webhooks

### Local Testing with ngrok (Recommended)
Since PayPal can't reach `localhost:3000`, use ngrok to expose your local server:

1. **Install ngrok**: `npm install -g ngrok`
2. **Start your Next.js app**: `npm run dev`
3. **In another terminal, expose port 3000**: `ngrok http 3000`
4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)
5. **Update webhook URL in PayPal**: `https://abc123.ngrok.io/api/webhooks/paypal`

### Testing Payments
1. Go to your app's deposit page: `http://localhost:3000/deposit`
2. Enter a small amount (e.g., $1.00)
3. Complete the PayPal payment
4. Check the webhook logs in your terminal
5. Verify the payment is reflected in your app

## 5. Webhook Security (Production)

For production, implement webhook signature verification:

1. **Get Webhook Certificate**: Download from PayPal Developer Dashboard
2. **Verify Signatures**: Use PayPal's SDK to verify webhook authenticity
3. **Environment Variables**: Add webhook secret keys

## 6. Troubleshooting

### Common Issues:
- **404 on webhook**: Ensure the URL is correct and app is deployed
- **Webhook not firing**: Check event type selections in PayPal dashboard
- **SSL issues**: Ensure production URL uses HTTPS

### Debug Steps:
1. Check webhook logs in PayPal Developer Dashboard
2. Monitor your app's console output
3. Verify webhook URL is accessible publicly
4. Test webhook endpoint manually with curl

## 7. Webhook Events Handled

Your app now handles these PayPal events:

| Event | Description | Action |
|-------|-------------|--------|
| `PAYMENT.CAPTURE.COMPLETED` | Payment successful | Update balance, mark transaction complete |
| `PAYMENT.CAPTURE.DENIED` | Payment failed | Mark transaction failed |
| `PAYMENT.CAPTURE.PENDING` | Payment pending | Keep transaction pending |
| `CHECKOUT.ORDER.COMPLETED` | Order completed | Log completion |

## Next Steps

1. **Set up webhook URL in PayPal Dashboard**
2. **Test with small amounts ($1-5)**
3. **Monitor webhook logs**
4. **Deploy to production with proper webhook URL**
5. **Implement webhook signature verification for security**

Your PayPal integration is now complete with webhook support!
