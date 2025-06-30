-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    savings_balance DECIMAL(12, 2) DEFAULT 0.00,
    password_hash VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounts table (for multiple account types)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings')),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'geofence_transfer', 'refund', 'dispute', 'fee')),
    amount DECIMAL(12, 2) NOT NULL,
    fee DECIMAL(12, 2) DEFAULT 0.00,
    description TEXT,
    recipient_email VARCHAR(255),
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    square_payment_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geofences table
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
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

-- Create savings_locks table
CREATE TABLE IF NOT EXISTS savings_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    lock_duration INTEGER NOT NULL, -- duration in months
    interest_rate DECIMAL(5, 4) NOT NULL, -- annual interest rate as decimal (e.g., 0.0525 for 5.25%)
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unlocks_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    early_withdrawal_penalty DECIMAL(5, 4) DEFAULT 0.02, -- 2% penalty
    purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    session_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank_account')),
    provider VARCHAR(50) NOT NULL, -- 'square', 'stripe', etc.
    provider_id VARCHAR(255) NOT NULL,
    last_four VARCHAR(4),
    brand VARCHAR(50), -- 'visa', 'mastercard', etc.
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('transaction', 'geofence', 'savings', 'security', 'general')),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_square_payment_id ON transactions(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_geofences_user_id ON geofences(user_id);
CREATE INDEX IF NOT EXISTS idx_geofences_active ON geofences(is_active, is_claimed);
CREATE INDEX IF NOT EXISTS idx_geofences_location ON geofences(center_lat, center_lng);
CREATE INDEX IF NOT EXISTS idx_savings_locks_user_id ON savings_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);

-- Create function to check if a point is within a geofence
CREATE OR REPLACE FUNCTION point_in_geofence(
    check_lat DECIMAL(10, 8),
    check_lng DECIMAL(11, 8),
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    radius_meters INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    distance_meters DECIMAL;
BEGIN
    -- Calculate distance using Haversine formula
    distance_meters := (
        6371000 * acos(
            cos(radians(check_lat)) * 
            cos(radians(center_lat)) * 
            cos(radians(center_lng) - radians(check_lng)) + 
            sin(radians(check_lat)) * 
            sin(radians(center_lat))
        )
    );
    
    RETURN distance_meters <= radius_meters;
END;
$$ LANGUAGE plpgsql;

-- Create function to get active geofences at a location
CREATE OR REPLACE FUNCTION get_active_geofences_at_location(
    check_lat DECIMAL(10, 8),
    check_lng DECIMAL(11, 8)
) RETURNS TABLE (
    id UUID,
    user_id UUID,
    name VARCHAR(255),
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    radius INTEGER,
    amount DECIMAL(12, 2),
    recipient_email VARCHAR(255),
    memo TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.user_id,
        g.name,
        g.center_lat,
        g.center_lng,
        g.radius,
        g.amount,
        g.recipient_email,
        g.memo,
        g.expires_at,
        g.created_at
    FROM geofences g
    WHERE g.is_active = true 
        AND g.is_claimed = false
        AND (g.expires_at IS NULL OR g.expires_at > NOW())
        AND point_in_geofence(check_lat, check_lng, g.center_lat, g.center_lng, g.radius);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_locks_updated_at BEFORE UPDATE ON savings_locks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
