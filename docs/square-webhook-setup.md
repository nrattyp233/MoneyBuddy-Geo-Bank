# Square Webhook Setup Guide for Money Buddy (Production)

This guide will help you set up Square webhooks for real-time payment notifications in Money Buddy's production environment.

## Step 1: Access Square Developer Dashboard

1. Go to [developer.squareup.com](https://developer.squareup.com/)
2. Sign in to your Square Developer account
3. Select your Money Buddy application
4. Navigate to the **Production** environment (not Sandbox)

## Step 2: Configure Webhook Endpoint

### Production Webhook URL:
\`\`\`
https://your-domain.vercel.app/api/webhooks/square
\`\`\`

### Setup Steps:
1. In your Square app dashboard, click **"Webhooks"** in the left sidebar
2. Click **"Create Webhook Endpoint"**
3. Enter your production webhook URL
4. Select **"Production"** environment
5. Click **"Save"**

## Step 3: Subscribe to Events

Subscribe to these essential events for Money Buddy:

### Payment Events:
- ✅ `payment.created` - When a payment is initiated
- ✅ `payment.updated` - When payment status changes (completed/failed)

### Refund Events:
- ✅ `refund.created` - When a refund is initiated
- ✅ `refund.updated` - When refund status changes

### Dispute Events:
- ✅ `dispute.created` - When a chargeback/dispute is filed

### How to Subscribe:
1. Click on your webhook endpoint
2. Click **"Event Types"** tab
3. Select the events listed above
4. Click **"Save Changes"**

## Step 4: Get Webhook Signature Key

1. In your webhook endpoint settings
2. Copy the **"Webhook Signature Key"**
3. Add it to your production environment variables:

\`\`\`env
SQUARE_WEBHOOK_SIGNATURE_KEY=your_production_webhook_signature_key_here
\`\`\`

## Step 5: Production Environment Variables

Update your production `.env` file with these Square settings:

\`\`\`env
# Square Production Configuration
SQUARE_APPLICATION_ID=sq0idp-your-production-app-id
SQUARE_ACCESS_TOKEN=EAAAl_your_production_access_token
SQUARE_ENVIRONMENT=production
SQUARE_WEBHOOK_SIGNATURE_KEY=your_production_webhook_signature_key
\`\`\`

## Step 6: Deploy to Production

1. **Deploy Money Buddy to Vercel:**
   \`\`\`bash
   vercel --prod
   \`\`\`

2. **Add Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add all Square production variables

3. **Verify Deployment:**
   - Ensure your webhook endpoint is accessible
   - Test: `https://your-domain.vercel.app/api/webhooks/square`

## Step 7: Test Webhook Integration

### Test with Real Payments:
1. Make a small test payment ($1.00) through Money Buddy
2. Check your application logs for webhook events
3. Verify payment status updates in your database

### Webhook Testing Tools:
- Use Square's webhook testing tool in the developer dashboard
- Monitor webhook delivery status and retry attempts
- Check webhook logs for any failures

## Step 8: Monitor Webhook Health

### Square Dashboard Monitoring:
1. Go to **Webhooks** → **Your Endpoint**
2. Monitor **"Recent Deliveries"** tab
3. Check for failed deliveries or errors
4. Review retry attempts and success rates

### Application Monitoring:
\`\`\`javascript
// Add to your webhook handler for monitoring
console.log('Webhook received:', {
  type: event.type,
  timestamp: new Date().toISOString(),
  paymentId: event.data?.object?.payment?.id
})
\`\`\`

## Webhook Event Handling

### Payment Created:
\`\`\`javascript
// When a customer makes a payment
case "payment.created":
  // Update user wallet balance
  // Send confirmation email
  // Create transaction record
  break
\`\`\`

### Payment Updated:
\`\`\`javascript
// When payment status changes
case "payment.updated":
  // Handle completed payments
  // Process failed payments
  // Update transaction status
  break
\`\`\`

### Refund Events:
\`\`\`javascript
// When refunds are processed
case "refund.created":
case "refund.updated":
  // Update user balance
  // Send refund notifications
  // Record refund transactions
  break
\`\`\`

## Security Best Practices

### Signature Verification:
- ✅ Always verify webhook signatures
- ✅ Use timing-safe comparison for signatures
- ✅ Reject webhooks with invalid signatures

### HTTPS Requirements:
- ✅ Webhook endpoints must use HTTPS
- ✅ Valid SSL certificate required
- ✅ No self-signed certificates

### Error Handling:
- ✅ Return 200 status for successful processing
- ✅ Return 4xx/5xx for errors (triggers retries)
- ✅ Log all webhook events for debugging

## Troubleshooting

### Common Issues:

**Webhook Not Receiving Events:**
- Verify webhook URL is correct and accessible
- Check that events are properly subscribed
- Ensure production environment is selected

**Signature Verification Failing:**
- Confirm webhook signature key is correct
- Check that signature header is being read properly
- Verify HMAC-SHA256 calculation

**Payment Processing Issues:**
- Check Square application permissions
- Verify production access token is valid
- Ensure payment amounts are in correct format (cents)

### Debug Steps:
1. Check Vercel function logs
2. Monitor Square webhook delivery status
3. Test webhook endpoint manually
4. Verify environment variables are set

## Production Checklist

Before going live:

- ✅ Square account verified and approved for production
- ✅ Production webhook endpoint configured
- ✅ All required events subscribed
- ✅ Webhook signature verification implemented
- ✅ Environment variables set in production
- ✅ SSL certificate valid and active
- ✅ Payment processing tested with real transactions
- ✅ Error handling and logging implemented
- ✅ Monitoring and alerting configured

## Support

### Square Support:
- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Square Developer Community](https://developer.squareup.com/forums)
- Square Developer Support (for production issues)

### Money Buddy Support:
- Check application logs in Vercel dashboard
- Monitor webhook delivery in Square dashboard
- Review transaction records in your database

Your Money Buddy app is now ready for real-time payment processing with Square webhooks! 💳🐵
\`\`\`

\`\`\`plaintext file=".env.local"
# Database Configuration (Supabase)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# Alternative Database (Neon)
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
POSTGRES_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=15
DATABASE_URL_UNPOOLED=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
POSTGRES_URL_NON_POOLING=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
POSTGRES_URL_NO_SSL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=disable
POSTGRES_USER=username
POSTGRES_HOST=ep-example.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=neondb
PGHOST=ep-example.us-east-1.aws.neon.tech
PGHOST_UNPOOLED=ep-example.us-east-1.aws.neon.tech
PGUSER=username
PGPASSWORD=password
PGDATABASE=neondb
NEON_PROJECT_ID=your-neon-project-id

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here

# Square Payment Configuration (PRODUCTION)
SQUARE_APPLICATION_ID=sq0idp-your-production-app-id
SQUARE_ACCESS_TOKEN=EAAAl_your_production_access_token
SQUARE_ENVIRONMENT=production
SQUARE_WEBHOOK_SIGNATURE_KEY=your_production_webhook_signature_key

# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyYour-Google-AI-API-Key

# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-stack-publishable-key
STACK_SECRET_SERVER_KEY=your-stack-secret-key

# NextAuth Configuration (Backup)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-for-local-development

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Custom Application Keys
CUSTOM_KEY=your-custom-application-key
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-for-token-signing

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Webhook URLs
SQUARE_WEBHOOK_URL=https://your-domain.vercel.app/api/webhooks/square
SUPABASE_WEBHOOK_URL=https://your-domain.vercel.app/api/webhooks/supabase

# Feature Flags
ENABLE_GEOFENCING=true
ENABLE_AI_CHAT=true
ENABLE_SAVINGS_LOCK=true
ENABLE_ADMIN_PANEL=true

# Debug Configuration
DEBUG=true
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true
