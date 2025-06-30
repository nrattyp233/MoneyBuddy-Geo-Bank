# Supabase Setup Guide for Money Buddy

This guide will help you set up Supabase as the database for Money Buddy.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Click "Start your project" and sign up
3. Create a new project
4. Choose a region close to your users
5. Set a strong database password

## Step 2: Get Your Credentials

1. Go to your project dashboard
2. Click "Settings" → "API"
3. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## Step 3: Configure Environment Variables

Add to your `.env.local`:

\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

## Step 4: Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Run the setup script from `scripts/supabase-setup.sql`
3. Run the seed script from `scripts/supabase-seed.sql`

## Step 5: Configure Row Level Security

The setup script includes RLS policies for:
- Users can only access their own data
- Transactions are protected by user ownership
- Geofences are user-specific
- Chat messages are private to users

## Step 6: Verify Setup

Test your connection:
1. Restart your development server
2. Try registering a new user
3. Check the `users` table in Supabase
4. Test deposit/withdrawal functionality

## Database Schema

Money Buddy uses these tables:
- `users` - User accounts and balances
- `transactions` - Payment history
- `geofences` - Location-based transfers
- `savings_locks` - Time-locked savings
- `chat_messages` - AI conversation history
- `payment_methods` - Stored payment methods
- `notifications` - User alerts

## Security Features

- Row Level Security (RLS) enabled
- User data isolation
- Encrypted sensitive fields
- Audit trails for all transactions
- Automatic timestamps

Your Supabase database is now ready for Money Buddy! 🗄️🐵
