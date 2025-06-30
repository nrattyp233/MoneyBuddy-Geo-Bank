# Money Buddy Banking App - Production Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account connected to your GitHub repository
- All environment variables configured
- Database schema deployed to Supabase

### 1. Environment Variables Setup

Add these environment variables in your Vercel dashboard:

#### **Supabase (Required)**
\`\`\`
SUPABASE_URL=https://qzjbfwlozkokftkgixte.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://qzjbfwlozkokftkgixte.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

#### **Square Payments (Required)**
\`\`\`
SQUARE_APPLICATION_ID=sq0idp-fkCfPR6LBlVTJGJfcbzZkQ
SQUARE_ACCESS_TOKEN=your-production-token
SQUARE_ENVIRONMENT=production
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-key
SQUARE_LOCATION_ID=your-location-id
\`\`\`

#### **Mapbox (Required)**
\`\`\`
MAPBOX_ACCESS_TOKEN=your-mapbox-token
\`\`\`

#### **Google AI (Required)**
\`\`\`
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
\`\`\`

#### **NextAuth (Required)**
\`\`\`
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
\`\`\`

### 2. Deploy Commands

#### **Option A: Automatic Deploy (Recommended)**
\`\`\`bash
git add .
git commit -m "Deploy Money Buddy with Supabase fix"
git push origin main
\`\`\`

#### **Option B: Manual Deploy**
\`\`\`bash
vercel --prod
\`\`\`

### 3. Post-Deploy Verification

1. **Check Environment Variables**
   - Visit your Vercel dashboard
   - Verify all environment variables are set
   - Ensure no placeholder values remain

2. **Test Core Features**
   - `/auth/login` - Authentication works
   - `/transfer/geofence` - Maps load without errors
   - `/deposit` - Square payments process
   - `/dashboard` - User data displays correctly

3. **Monitor Logs**
   - Check Vercel function logs for errors
   - Verify Supabase connection is successful
   - Confirm Square webhook processing

### 4. Database Setup

Run these SQL scripts in your Supabase SQL editor:

1. **Create Tables**: Execute `scripts/create-database.sql`
2. **Seed Data**: Execute `scripts/seed-data.sql`
3. **Setup Functions**: Execute `scripts/supabase-setup.sql`

### 5. Webhook Configuration

#### **Square Webhooks**
- URL: `https://your-domain.vercel.app/api/webhooks/square`
- Events: `payment.updated`, `refund.updated`

#### **Supabase Webhooks** (Optional)
- URL: `https://your-domain.vercel.app/api/webhooks/supabase`
- Events: Database changes

## 🔧 Troubleshooting

### Common Issues

1. **"supabaseUrl is required" Error**
   - Ensure both `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` are set
   - Check that values are not placeholder text

2. **Mapbox Token Errors**
   - Verify `MAPBOX_ACCESS_TOKEN` is set (server-side only)
   - Check token has correct scopes in Mapbox dashboard

3. **Square Payment Failures**
   - Confirm `SQUARE_LOCATION_ID` is set
   - Verify production vs sandbox environment settings

4. **Build Failures**
   - Check for TypeScript errors
   - Ensure all imports are correct
   - Verify environment variables don't contain sensitive data in client code

### Performance Optimization

- **Function Timeout**: Set to 30 seconds for payment processing
- **Regions**: Deployed to `iad1` for optimal US performance
- **Caching**: Static assets cached with appropriate headers

## 📊 Monitoring

### Key Metrics to Monitor
- API response times
- Database query performance
- Payment success rates
- User authentication flows
- Geofencing accuracy

### Logging
- All API endpoints log requests and responses
- Database operations are logged with performance metrics
- Payment processing includes detailed transaction logs

## 🔒 Security

### Headers Applied
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `X-XSS-Protection`

### Environment Variable Security
- Server-only variables never exposed to client
- Public variables prefixed with `NEXT_PUBLIC_`
- Service role keys restricted to server-side operations

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All pages load without errors
- ✅ User authentication works
- ✅ Payments process successfully
- ✅ Maps display correctly
- ✅ Database operations complete
- ✅ Webhooks receive and process events
- ✅ No sensitive data exposed in client bundles

Your Money Buddy banking app is now ready for production! 🐵💰
