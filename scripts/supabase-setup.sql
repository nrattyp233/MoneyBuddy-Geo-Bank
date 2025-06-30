-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_locks_updated_at BEFORE UPDATE ON savings_locks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own geofences" ON geofences FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own geofences" ON geofences FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own savings locks" ON savings_locks FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own savings locks" ON savings_locks FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own payment methods" ON payment_methods FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create function to check if a point is within a geofence
CREATE OR REPLACE FUNCTION is_within_geofence(
    check_lat DECIMAL(10, 8),
    check_lng DECIMAL(11, 8),
    geofence_lat DECIMAL(10, 8),
    geofence_lng DECIMAL(11, 8),
    radius_meters INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    distance_meters DECIMAL;
BEGIN
    -- Calculate distance using Haversine formula
    distance_meters := (
        6371000 * acos(
            cos(radians(check_lat)) * 
            cos(radians(geofence_lat)) * 
            cos(radians(geofence_lng) - radians(check_lng)) + 
            sin(radians(check_lat)) * 
            sin(radians(geofence_lat))
        )
    );
    
    RETURN distance_meters <= radius_meters;
END;
$$ LANGUAGE plpgsql;

-- Create function to get active geofences for a location
CREATE OR REPLACE FUNCTION get_active_geofences_at_location(
    check_lat DECIMAL(10, 8),
    check_lng DECIMAL(11, 8)
) RETURNS TABLE (
    geofence_id UUID,
    name VARCHAR(255),
    amount DECIMAL(12, 2),
    recipient_email VARCHAR(255),
    distance_meters DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.amount,
        g.recipient_email,
        (6371000 * acos(
            cos(radians(check_lat)) * 
            cos(radians(g.center_lat)) * 
            cos(radians(g.center_lng) - radians(check_lng)) + 
            sin(radians(check_lat)) * 
            sin(radians(g.center_lat))
        )) as distance_meters
    FROM geofences g
    WHERE 
        g.is_active = true 
        AND g.is_claimed = false
        AND (g.expires_at IS NULL OR g.expires_at > NOW())
        AND is_within_geofence(check_lat, check_lng, g.center_lat, g.center_lng, g.radius);
END;
$$ LANGUAGE plpgsql;
