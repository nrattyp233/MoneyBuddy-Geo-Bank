# Dwolla Setup Guide for Money Buddy

This guide will help you set up Dwolla for ACH processing in your Money Buddy app.

## 🏦 Step 1: Create Dwolla Account

1. **Go to Dwolla**: Visit [dwolla.com](https://dwolla.com)
2. **Sign Up**: Create a developer account
3. **Choose Account Type**: Select "Business" for production use
4. **Complete Verification**: Provide business information and documents

## 🔑 Step 2: Get API Credentials

### Sandbox Credentials (for development):
1. Login to [Dashboard](https://dashboard-sandbox.dwolla.com)
2. Go to **Applications** → **Create Application**
3. Get your credentials:
   - **Key**: Your application key
   - **Secret**: Your application secret
   - **Environment**: `sandbox`

### Production Credentials:
1. Complete business verification process
2. Get production credentials from [Production Dashboard](https://dashboard.dwolla.com)

## ⚙️ Step 3: Configure Environment Variables

Add these to your `.env.local`:

```env
# Dwolla ACH Processing
DWOLLA_KEY=your_dwolla_key_here
DWOLLA_SECRET=your_dwolla_secret_here
DWOLLA_ENVIRONMENT=sandbox  # or production
DWOLLA_WEBHOOK_SECRET=your_webhook_secret_here
DWOLLA_MASTER_FUNDING_SOURCE_ID=your_master_account_id
```

## 🎯 Step 4: Set Up Webhooks

1. **Go to Webhooks**: In your Dwolla dashboard
2. **Create Webhook**: Add your webhook URL
   ```
   https://your-domain.com/api/webhooks/dwolla
   ```
3. **Subscribe to Events**:
   - ✅ `customer_transfer_created`
   - ✅ `customer_transfer_completed`
   - ✅ `customer_transfer_failed`
   - ✅ `customer_transfer_cancelled`
   - ✅ `customer_funding_source_added`
   - ✅ `customer_funding_source_verified`
   - ✅ `customer_microdeposits_added`
   - ✅ `customer_microdeposits_completed`
   - ✅ `customer_microdeposits_failed`

## 🗄️ Step 5: Set Up Database

Run the database schema updates:

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U postgres -d postgres -f scripts/dwolla-schema.sql
```

Or use the Supabase dashboard SQL editor to run the contents of `scripts/dwolla-schema.sql`.

## 🧪 Step 6: Test Your Setup

### Test Bank Account Details (Sandbox):
```
Routing Number: 222222226
Account Number: 123456789
Account Type: Checking
```

### Test the Integration:
1. Start your development server: `npm run dev`
2. Navigate to the deposit page
3. Select "Bank Transfer (ACH)" 
4. Enter test bank details
5. Submit a test deposit

## 💰 Step 7: Production Setup

### Business Verification Requirements:
- ✅ Business license or articles of incorporation
- ✅ Tax identification number (EIN)
- ✅ Business bank account
- ✅ Identity verification for business owners

### Master Funding Source:
1. **Create Master Account**: Set up your business bank account in Dwolla
2. **Get Funding Source ID**: Save this as `DWOLLA_MASTER_FUNDING_SOURCE_ID`
3. **Verify Account**: Complete micro-deposit verification

## 🔒 Security Best Practices

- ✅ Never expose secrets in client-side code
- ✅ Use HTTPS for all webhook endpoints
- ✅ Verify webhook signatures
- ✅ Implement proper error handling
- ✅ Log all transactions for audit trails
- ✅ Use environment-specific credentials

## 📊 Pricing Comparison

| Transaction Type | Dwolla | Square |
|------------------|---------|---------|
| ACH Deposit | $0.25 | 2.9% + $0.30 |
| ACH Withdrawal | $0.25 | $1.50 |
| Same-Day ACH | $0.75 | N/A |
| Transfer Limit | $5,000,000 | $10,000 |

## 🚀 Benefits of Dwolla Integration

### For Your Business:
- **95% cost reduction** on large transactions
- **Higher transaction limits** ($5M vs $10K)
- **Better cash flow** with same-day ACH options
- **Simplified compliance** with built-in fraud protection

### For Your Users:
- **Lower fees** mean more money stays in their pocket
- **Bank-grade security** with direct bank connections
- **Familiar experience** using existing bank accounts
- **Transparency** with clear fee structures

## 🔧 Troubleshooting

### Common Issues:

**"Customer creation failed"**:
- Verify all required fields are provided
- Check that address information is valid
- Ensure date of birth is in correct format

**"Funding source creation failed"**:
- Verify routing number is valid (9 digits)
- Check account number format
- Ensure bank supports ACH transfers

**"Transfer failed"**:
- Verify sufficient funds in source account
- Check funding source is verified
- Confirm transfer amount is within limits

### Debug Steps:
1. Check your environment variables
2. Verify webhook endpoint is accessible
3. Review Dwolla dashboard logs
4. Check database transaction records

## 📈 Next Steps

1. **Complete Integration**: Get Dwolla fully working in sandbox
2. **User Testing**: Test with real users in sandbox mode
3. **Production Setup**: Complete business verification
4. **Go Live**: Switch to production credentials
5. **Monitor**: Set up logging and monitoring

Your Money Buddy app now supports low-cost ACH transfers! 🎉

## 🆘 Support

### Dwolla Support:
- [Documentation](https://docs.dwolla.com)
- [Community Forum](https://discuss.dwolla.com)
- [Support Portal](https://support.dwolla.com)

### Money Buddy Support:
- Check application logs in your hosting platform
- Review transaction records in your database
- Monitor webhook delivery status in Dwolla dashboard

ACH processing is now available in your Money Buddy app! 💳🏦
