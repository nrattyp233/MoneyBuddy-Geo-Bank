-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable RLS warning for spatial_ref_sys (PostGIS system table)
-- This is a system table that doesn't need RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spatial_ref_sys') THEN
        ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public_spatial_ref_sys_policy" ON public.spatial_ref_sys FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN others THEN
        -- Ignore any errors (table might not exist)
        NULL;
END $$;

-- Create users table (without RLS initially)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    savings_balance DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounts table for banking details
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'checking',
    balance DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'geofence_transfer'
    amount DECIMAL(12, 2) NOT NULL,
    fee DECIMAL(12, 2) DEFAULT 0.00,
    description TEXT,
    recipient_email VARCHAR(255),
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    square_payment_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geofences table
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    radius INTEGER NOT NULL, -- radius in meters
    amount DECIMAL(12, 2) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    memo TEXT,
    is_active BOOLEAN DEFAULT true,
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings_locks table for locked savings
CREATE TABLE IF NOT EXISTS savings_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    lock_duration INTEGER NOT NULL, -- duration in days
    interest_rate DECIMAL(5, 4) DEFAULT 0.0200, -- 2% default
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unlocks_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for AI chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'card', 'bank_account'
    provider VARCHAR(20) NOT NULL, -- 'square', 'stripe', etc.
    provider_id VARCHAR(255) NOT NULL,
    last_four VARCHAR(4),
    brand VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'transaction', 'geofence', 'savings', 'security'
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_geofences_user_id ON geofences(user_id);
CREATE INDEX IF NOT EXISTS idx_geofences_recipient_email ON geofences(recipient_email);
CREATE INDEX IF NOT EXISTS idx_geofences_is_active ON geofences(is_active);
CREATE INDEX IF NOT EXISTS idx_geofences_location ON geofences(center_lat, center_lng);
CREATE INDEX IF NOT EXISTS idx_savings_locks_user_id ON savings_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_locks_unlocks_at ON savings_locks(unlocks_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_geofences_updated_at ON geofences;
DROP TRIGGER IF EXISTS update_savings_locks_updated_at ON savings_locks;
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_locks_updated_at BEFORE UPDATE ON savings_locks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Enable insert for authenticated users only" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable select for users based on user_id" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for users based on user_id" ON users FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for other tables
CREATE POLICY "Enable all for user on accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all for user on transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all for user on geofences" ON geofences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all for user on savings_locks" ON savings_locks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all for user on chat_messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all for user on payment_methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all for user on notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
