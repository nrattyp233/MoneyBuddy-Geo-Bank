# Money Buddy Production Setup Guide

## 🚀 Setting Up PayPal for Production

### Step 1: Create PayPal Business Account
1. **Go to PayPal Developer Portal**: https://developer.paypal.com/
2. **Create a Business Account** (if you don't have one)
3. **Log in to PayPal Developer Dashboard**

### Step 2: Create Production App
1. **Navigate to "My Apps & Credentials"**
2. **Switch to "Live" tab** (not Sandbox)
3. **Click "Create App"**
4. **Fill in details**:
   - App Name: `Money Buddy Production`
   - Select your business account
   - Features: Check "Accept payments"
5. **Copy your Live credentials**:
   - Client ID
   - Client Secret

### Step 3: Configure Webhooks (Important!)
1. **In your app settings, go to "Webhooks"**
2. **Add webhook URL**: `https://your-domain.com/api/webhooks/paypal`
3. **Subscribe to these events**:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `CHECKOUT.ORDER.APPROVED`
   - `CHECKOUT.ORDER.COMPLETED`

### Step 4: Update Environment Variables
Replace your current PayPal variables with production values:

```bash
# PayPal Production Settings
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_client_secret_here
PAYPAL_ENVIRONMENT=production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id_here
```

## 🏗️ Production Deployment Options

### Option 1: Vercel (Recommended - Easy)
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - **Important**: Use production PayPal credentials

### Option 2: Railway (Alternative)
1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

### Option 3: DigitalOcean App Platform
1. **Connect GitHub Repository**
2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. **Add Environment Variables**

## 🔧 Pre-Production Checklist

### 1. Build and Test Locally
```bash
# Build for production
npm run build

# Test production build
npm start
```

### 2. Security Configuration
Update your environment variables:

```bash
# Add to .env.local for production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here
```

### 3. Database Setup (Supabase)
Your Supabase is already configured for production. Verify:
- ✅ RLS (Row Level Security) is enabled
- ✅ API keys are properly scoped
- ✅ Database tables are created

### 4. Domain and SSL
- Set up custom domain
- Ensure SSL certificate is active
- Update PayPal webhook URLs with your domain

## 📋 Production Environment Variables

Create a `.env.production` file:

```bash
# Supabase (Production Ready)
SUPABASE_URL=https://vopslwrrjhwopswtlhzn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHNsd3Jyamh3b3Bzd3RsaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTY2NTIsImV4cCI6MjA2NzMzMjY1Mn0.6ZbcBg1KzfChYJItBHxhimLmo1b4Bl22usjfSeR7gmc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcHNsd3Jyamh3b3Bzd3RsaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc1NjY1MiwiZXhwIjoyMDY3MzMyNjUyfQ.iV8LqlpZYy-V5N4VrMAJjaDDMk2uG2W6fv80LtT8f0o

# MapBox (Production Ready)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoiamx1YzkyMiIsImEiOiJjbWN6NHo3M3Iwd3VpMm1wejZoZTdjMm9hIn0.WvN1Q8aO-cRLfj3bpR9ENg

# PayPal PRODUCTION (Replace with your live credentials)
PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_LIVE_CLIENT_SECRET
PAYPAL_ENVIRONMENT=production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID

# Security
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
```

## 🧪 Testing Production PayPal

### Before Going Live:
1. **Test with small amounts** ($0.01)
2. **Verify webhooks are working**
3. **Check transaction flow**:
   - Deposit → PayPal → Database update
   - Withdrawal → Database → PayPal payout
4. **Test error handling**

### PayPal Sandbox vs Production:
- **Sandbox**: Use test accounts, fake money
- **Production**: Real money, real transactions

## 🚨 Important Security Notes

1. **Never commit production credentials** to git
2. **Use environment variables** for all secrets
3. **Enable 2FA** on PayPal business account
4. **Monitor transactions** regularly
5. **Set up fraud detection** alerts

## 📊 Monitoring and Maintenance

### Set up monitoring for:
- Payment success/failure rates
- API response times
- Database performance
- Error logs

### Regular maintenance:
- Update dependencies monthly
- Monitor PayPal API changes
- Review transaction logs
- Update SSL certificates

## 🎯 Quick Start Commands

```bash
# 1. Build for production
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Or deploy to Railway
railway up

# 4. Test production build locally
npm start
```

## 📞 Support Resources

- **PayPal Developer Support**: https://developer.paypal.com/support/
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Next.js Documentation**: https://nextjs.org/docs

---

## 🔥 Ready to Launch?

1. ✅ Get PayPal live credentials
2. ✅ Choose deployment platform
3. ✅ Set up environment variables
4. ✅ Test with small amounts
5. ✅ Go live! 🚀

**Need help?** Check each step carefully and test thoroughly before processing real money!
