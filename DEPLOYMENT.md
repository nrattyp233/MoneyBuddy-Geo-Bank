# Money Buddy - Production Deployment Guide

This guide covers deploying Money Buddy to production with Supabase database, Mapbox geofencing, Square payments, and all integrated services.

## 🚀 Quick Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Mapbox access token obtained
- [ ] Square payment credentials configured
- [ ] Google AI API key set up
- [ ] Environment variables configured
- [ ] Domain configured (if custom)
- [ ] SSL certificates enabled
- [ ] Database migrations run
- [ ] Production testing completed

## 📋 Prerequisites

### Required Accounts & Services

1. **Vercel Account** - For hosting and deployment
2. **Supabase Account** - For production database
3. **Mapbox Account** - For geofencing maps
4. **Square Developer Account** - For payment processing
5. **Google AI Account** - For AI chat features
6. **Domain Name** (optional) - For custom domain

### Required Tools

- Node.js 18+ and npm
- Git for version control
- Access to your project repository

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

\`\`\`bash
# Visit https://app.supabase.com
# Create new project: money-buddy-production
# Choose region closest to your users
# Generate strong database password
\`\`\`

### 2. Run Database Scripts

\`\`\`sql
-- In Supabase SQL Editor, run:
-- 1. scripts/supabase-setup.sql (creates tables and functions)
-- 2. scripts/supabase-seed.sql (adds demo data - optional)
\`\`\`

### 3. Get Supabase Credentials

\`\`\`env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
\`\`\`

## 🗺️ Mapbox Configuration

### 1. Create Mapbox Account
- Visit [mapbox.com](https://mapbox.com)
- Sign up for free account
- Go to Account → Access Tokens

### 2. Create Access Token
\`\`\`bash
# Create token with these scopes:
# - styles:read
# - fonts:read
# - datasets:read
# - geocoding:read
\`\`\`

### 3. Configure Token
\`\`\`env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
\`\`\`

## 💳 Square Payment Setup

### 1. Square Developer Account
- Visit [developer.squareup.com](https://developer.squareup.com)
- Create developer account
- Create new application

### 2. Get Credentials
\`\`\`env
SQUARE_APPLICATION_ID=your_square_application_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=production  # or 'sandbox' for testing
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key
\`\`\`

### 3. Configure Webhooks
\`\`\`bash
# Webhook URL: https://your-domain.com/api/webhooks/square
# Events: payment.created, payment.updated
\`\`\`

## 🤖 Google AI Setup

### 1. Get API Key
- Visit [ai.google.dev](https://ai.google.dev)
- Create API key for Gemini

### 2. Configure
\`\`\`env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
\`\`\`

## 🌐 Vercel Deployment

### 1. Connect Repository

\`\`\`bash
# Option A: Vercel CLI
npm i -g vercel
vercel --prod

# Option B: Vercel Dashboard
# Visit vercel.com → Import Project → Connect Git Repository
\`\`\`

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

\`\`\`env
# Database
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here

# Square Payments
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=production
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_key

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# App Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
NODE_ENV=production

# Optional: Custom configurations
CUSTOM_KEY=your_custom_value
\`\`\`

### 3. Deploy

\`\`\`bash
# Automatic deployment on git push
git add .
git commit -m "Deploy to production"
git push origin main

# Manual deployment
vercel --prod
\`\`\`

## 🔒 Security Configuration

### 1. Environment Security
\`\`\`bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
\`\`\`

### 2. CORS Configuration
\`\`\`javascript
// In your API routes, ensure CORS is properly configured
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-domain.vercel.app'
]
\`\`\`

### 3. Rate Limiting
\`\`\`javascript
// Implement rate limiting for API endpoints
// Consider using Vercel's Edge Config or Upstash Redis
\`\`\`

## 🌍 Custom Domain (Optional)

### 1. Add Domain in Vercel
- Vercel Dashboard → Domains
- Add your custom domain
- Configure DNS records

### 2. Update Environment Variables
\`\`\`env
NEXTAUTH_URL=https://your-custom-domain.com
\`\`\`

### 3. SSL Certificate
- Vercel automatically provisions SSL certificates
- Verify HTTPS is working

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
\`\`\`bash
# Enable in Vercel Dashboard → Analytics
# Or add to your app:
npm install @vercel/analytics
\`\`\`

### 2. Error Monitoring
\`\`\`bash
# Consider adding Sentry or similar
npm install @sentry/nextjs
\`\`\`

### 3. Database Monitoring
- Use Supabase Dashboard → Reports
- Set up alerts for high usage
- Monitor query performance

## 🧪 Production Testing

### 1. Functionality Tests
\`\`\`bash
# Test all major features:
# ✅ User registration/login
# ✅ Deposit/withdrawal flows
# ✅ Geofenced transfers
# ✅ Map functionality
# ✅ AI chat features
# ✅ Payment processing
\`\`\`

### 2. Performance Tests
\`\`\`bash
# Use tools like:
# - Lighthouse for performance auditing
# - GTmetrix for speed testing
# - WebPageTest for detailed analysis
\`\`\`

### 3. Security Tests
\`\`\`bash
# Verify:
# ✅ HTTPS everywhere
# ✅ Environment variables secure
# ✅ API endpoints protected
# ✅ Database RLS working
\`\`\`

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   \`\`\`bash
   # Check DATABASE_URL format
   # Verify Supabase project is active
   # Ensure password is URL-encoded
   \`\`\`

2. **Mapbox Not Loading**
   \`\`\`bash
   # Verify NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
   # Check token permissions
   # Ensure token starts with 'pk.'
   \`\`\`

3. **Square Payment Failures**
   \`\`\`bash
   # Verify SQUARE_ENVIRONMENT setting
   # Check application ID and access token
   # Ensure webhook URL is accessible
   \`\`\`

4. **Build Failures**
   \`\`\`bash
   # Check for TypeScript errors
   # Verify all dependencies are installed
   # Ensure environment variables are set
   \`\`\`

### Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Mapbox Support**: [docs.mapbox.com](https://docs.mapbox.com)
- **Square Developer**: [developer.squareup.com/support](https://developer.squareup.com/support)

## 📈 Post-Deployment

### 1. Monitor Performance
- Set up uptime monitoring
- Configure error alerts
- Monitor database usage

### 2. User Feedback
- Implement feedback collection
- Monitor user behavior
- Track feature usage

### 3. Scaling Considerations
- Monitor Vercel function usage
- Consider Supabase plan upgrades
- Optimize database queries as needed

## 🎉 Success!

Your Money Buddy app is now live in production! 

**Next Steps:**
1. Share your app with users
2. Monitor performance and usage
3. Iterate based on feedback
4. Scale infrastructure as needed

**Production URL:** `https://your-domain.vercel.app`

---

*Need help? Check the troubleshooting section or reach out to the development team.*
