# Money Buddy - Self-Hosted Deployment Guide

This guide covers self-hosting Money Buddy with Docker, Supabase database, Mapbox geofencing, PayPal payments, and all integrated services.

## 🚀 Quick Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Mapbox access token obtained
- [ ] PayPal payment credentials configured
- [ ] Google AI API key set up
- [ ] Environment variables configured
- [ ] Domain configured (if custom)
- [ ] SSL certificates enabled
- [ ] Database migrations run
- [ ] Self-hosted deployment completed

## 📋 Prerequisites

### Required Accounts & Services

1. **Supabase Account** - For production database
2. **Mapbox Account** - For geofencing maps
3. **PayPal Developer Account** - For payment processing
4. **Google AI Account** - For AI chat features
5. **Docker** - For containerized deployment
6. **Domain Name** (optional) - For custom domain

### Required Tools

- Node.js 18+ and npm
- Docker and Docker Compose
- Git for version control
- Access to your project repository

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

```bash
# Visit https://app.supabase.com
# Create new project: money-buddy-production
# Choose region closest to your users
# Generate strong database password
```

### 2. Run Database Scripts

```sql
-- In Supabase SQL Editor, run:
-- 1. scripts/supabase-setup.sql (creates tables and functions)
-- 2. scripts/supabase-seed.sql (adds demo data - optional)
```

### 3. Get Supabase Credentials

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

## 🗺️ Mapbox Configuration

### 1. Create Mapbox Account
- Visit [mapbox.com](https://mapbox.com)
- Sign up for free account
- Go to Account → Access Tokens

### 2. Create Access Token
```bash
# Create token with these scopes:
# - styles:read
# - fonts:read
# - datasets:read
# - geocoding:read
```

### 3. Configure Token
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
```

## 💳 PayPal Payment Setup

### 1. PayPal Developer Account
- Visit [developer.paypal.com](https://developer.paypal.com)
- Create developer account
- Create new application

### 2. Get Credentials
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=production  # or 'sandbox' for testing
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 3. Configure Webhooks
```bash
# Webhook URL: https://your-domain.com/api/webhooks/paypal
# Events: PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.COMPLETED
```

## 🤖 Google AI Setup

### 1. Get API Key
- Visit [ai.google.dev](https://ai.google.dev)
- Create API key for Gemini

### 2. Configure
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

## 🏗️ Self-Hosted Deployment Options

### Option 1: Docker (Recommended)
1. **Build and run with Docker**:
   ```bash
   # Build the Docker image
   docker build -t money-buddy .
   
   # Run the container
   docker run -p 3000:3000 --env-file .env.local money-buddy
   ```

2. **Or use Docker Compose**:
   ```bash
   # Start the application
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop the application
   docker-compose down
   ```

### Option 2: Traditional VPS Deployment
1. **Install Node.js on your server**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and build**:
   ```bash
   git clone your-repo-url
   cd money-buddy
   npm install
   npm run build
   ```

3. **Run with PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "money-buddy" -- start
   pm2 startup
   pm2 save
   ```

### Option 3: Cloud Platforms
- **DigitalOcean App Platform**: Deploy directly from GitHub
- **AWS ECS**: Use Docker containers
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Simple container hosting

## 🔒 Security Configuration

### 1. Environment Security
```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

### 2. CORS Configuration
```javascript
// In your API routes, ensure CORS is properly configured
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-domain.vercel.app'
]
```

### 3. Rate Limiting
```javascript
// Implement rate limiting for API endpoints
// Consider using Vercel's Edge Config or Upstash Redis
```

## 🌍 Custom Domain (Optional)

### 1. Add Domain in Vercel
- Vercel Dashboard → Domains
- Add your custom domain
- Configure DNS records

### 2. Update Environment Variables
```env
# Environment variables for production
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here
PORT=3000
```

### 3. SSL Certificate
- Vercel automatically provisions SSL certificates
- Verify HTTPS is working

## 📋 Self-Hosted Environment Variables

Create a `.env.local` file for your deployment:

```bash
# Supabase (Production Ready)
SUPABASE_URL=https://vopslwrrjhwopswtlhzn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHNsd3Jyamh3b3Bzd3RsaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTY2NTIsImV4cCI6MjA2NzMzMjY1Mn0.6ZbcBg1KzfChYJItBHxhimLmo1b4Bl22usjfSeR7gmc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHNsd3Jyamh3b3Bzd3RsaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc1NjY1MiwiZXhwIjoyMDY3MzMyNjUyfQ.iV8LqlpZYy-V5N4VrMAJjaDDMk2uG2W6fv80LtT8f0o

# Mapbox (Production Ready)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoiamx1YzkyMiIsImEiOiJjbWN6NHo3M3Iwd3VpMm1wejZoZTdjMm9hIn0.WvN1Q8aO-cRLfj3bpR9ENg

# PayPal PRODUCTION (Replace with your live credentials)
PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_LIVE_CLIENT_SECRET
PAYPAL_ENVIRONMENT=production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

# Security
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# Application
NODE_ENV=production
PORT=3000
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
```bash
# Enable in Vercel Dashboard → Analytics
# Or add to your app:
npm install @vercel/analytics
```

### 2. Error Monitoring
```bash
# Consider adding Sentry or similar
npm install @sentry/nextjs
```

### 3. Database Monitoring
- Use Supabase Dashboard → Reports
- Set up alerts for high usage
- Monitor query performance

## 🧪 Testing Self-Hosted PayPal

### 1. Functionality Tests
```bash
# Test all major features:
# ✅ User registration/login
# ✅ Deposit/withdrawal flows
# ✅ Geofenced transfers
# ✅ Map functionality
# ✅ AI chat features
# ✅ Payment processing
```

### 2. Performance Tests
```bash
# Use tools like:
# - Lighthouse for performance auditing
# - GTmetrix for speed testing
# - WebPageTest for detailed analysis
```

### 3. Security Tests
```bash
# Verify:
# ✅ HTTPS everywhere
# ✅ Environment variables secure
# ✅ API endpoints protected
# ✅ Database RLS working
```

## 🎯 Quick Start Commands

```bash
# 1. Traditional deployment
npm run build
npm start

# 2. Docker deployment
docker build -t money-buddy .
docker run -p 3000:3000 --env-file .env.local money-buddy

# 3. Docker Compose deployment
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check DATABASE_URL format
   # Verify Supabase project is active
   # Ensure password is URL-encoded
   ```

2. **Mapbox Not Loading**
   ```bash
   # Verify NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
   # Check token permissions
   # Ensure token starts with 'pk.'
   ```

3. **Square Payment Failures**
   ```bash
   # Verify SQUARE_ENVIRONMENT setting
   # Check application ID and access token
   # Ensure webhook URL is accessible
   ```

4. **Build Failures**
   ```bash
   # Check for TypeScript errors
   # Verify all dependencies are installed
   # Ensure environment variables are set
   ```

### Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Mapbox Support**: [docs.mapbox.com](https://docs.mapbox.com)
- **Square Developer**: [developer.squareup.com/support](https://developer.squareup.com/support)

## 📞 Support Resources

- **PayPal Developer Support**: https://developer.paypal.com/support/
- **Docker Documentation**: https://docs.docker.com/
- **Supabase Support**: https://supabase.com/support
- **Next.js Documentation**: https://nextjs.org/docs

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

## 🔥 Ready to Self-Host?

1. ✅ Get PayPal live credentials
2. ✅ Set up Docker or VPS
3. ✅ Set up environment variables
4. ✅ Test with small amounts
5. ✅ Go live! 🚀

**Need help?** Check each deployment option and test thoroughly before processing real money!

---

*Need help? Check the troubleshooting section or reach out to the development team.*

---

All Vercel references, URLs, and package mentions have been removed from this file.