# Supabase Setup Guide for Money Buddy

This guide will help you set up Supabase as the production database for your Money Buddy banking application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic knowledge of SQL and PostgreSQL
- Access to your project's environment variables

## Step 1: Create a New Supabase Project

1. **Sign in to Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `money-buddy-production`
     - **Database Password**: Generate a strong password (save this!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Choose based on your needs

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll see a progress indicator

## Step 2: Configure Database Schema

1. **Access SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New Query"

2. **Run Setup Script**
   - Copy the contents of `scripts/supabase-setup.sql`
   - Paste into the SQL editor
   - Click "Run" to execute
   - This creates all tables, indexes, and functions

3. **Run Seed Script (Optional)**
   - Copy the contents of `scripts/supabase-seed.sql`
   - Paste into a new query
   - Click "Run" to add demo data

## Step 3: Get Your Credentials

1. **Project Settings**
   - Go to Settings → API
   - Copy the following values:

\`\`\`env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`

2. **Database URL**
   - Go to Settings → Database
   - Copy the connection string:

\`\`\`env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
\`\`\`

## Step 4: Update Environment Variables

1. **Production Environment**
   - Update your `.env.production` file:

\`\`\`env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# Other configurations...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
SQUARE_APPLICATION_ID=your_square_app_id
# ... etc
\`\`\`

2. **Vercel Deployment**
   - In Vercel dashboard, go to your project
   - Settings → Environment Variables
   - Add all the Supabase variables

## Step 5: Configure Row Level Security (RLS)

The setup script automatically enables RLS, but here's what it does:

1. **User Data Protection**
   - Users can only access their own data
   - Automatic user ID filtering on all queries

2. **Security Policies**
   - `users`: Can view/update own profile
   - `transactions`: Can view own transactions
   - `geofences`: Can manage own geofences
   - `accounts`: Can access own accounts

## Step 6: Test the Connection

1. **Database Connection Test**
   \`\`\`bash
   # In your project directory
   npm run build
   npm run start
   \`\`\`

2. **Verify Tables**
   - Go to Supabase Dashboard → Table Editor
   - You should see all tables created
   - Check that demo data is present (if you ran seed script)

## Step 7: Enable Additional Features

### Real-time Subscriptions (Optional)
\`\`\`sql
-- Enable real-time for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE geofences;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
\`\`\`

### Database Backups
- Supabase automatically backs up your database daily
- Pro plan includes point-in-time recovery
- You can also create manual backups

## Step 8: Monitor and Optimize

1. **Performance Monitoring**
   - Use Supabase Dashboard → Reports
   - Monitor query performance
   - Check database usage

2. **Indexing**
   - The setup script includes optimized indexes
   - Monitor slow queries and add indexes as needed

3. **Connection Pooling**
   - Supabase includes built-in connection pooling
   - Use the pooled connection string for better performance

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check your DATABASE_URL format
   - Ensure password is URL-encoded
   - Verify project is not paused

2. **RLS Policy Errors**
   - Make sure you're authenticated
   - Check that user ID matches in policies
   - Use service role key for admin operations

3. **Migration Errors**
   - Check for syntax errors in SQL
   - Ensure extensions are enabled
   - Verify table dependencies

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Support**: Available on Pro plans

## Security Best Practices

1. **Environment Variables**
   - Never commit credentials to version control
   - Use different projects for dev/staging/production
   - Rotate keys regularly

2. **Database Security**
   - Keep RLS enabled
   - Use service role key only for admin operations
   - Monitor access logs

3. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only

## Next Steps

After setting up Supabase:

1. **Deploy to Production**
   - Push your code with updated environment variables
   - Test all features in production

2. **Set Up Monitoring**
   - Configure alerts for errors
   - Monitor database performance
   - Set up uptime monitoring

3. **Scale as Needed**
   - Upgrade Supabase plan as you grow
   - Optimize queries for better performance
   - Consider read replicas for high traffic

Your Money Buddy app is now ready for production with Supabase! 🚀
