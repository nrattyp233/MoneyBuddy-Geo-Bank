-- Users table with enhanced profile information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    profile_image_url TEXT,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    sender_wallet_id UUID REFERENCES wallets(id),
    receiver_wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(20) NOT NULL, -- 'transfer', 'deposit', 'withdrawal'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'expired', 'returned'
    description TEXT,
    transaction_hash VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Geofencing restrictions table
CREATE TABLE IF NOT EXISTS geofence_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    center_lat DECIMAL(10,8) NOT NULL,
    center_lng DECIMAL(11,8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Time restrictions table
CREATE TABLE IF NOT EXISTS time_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transaction logs for audit trail
CREATE TABLE IF NOT EXISTS transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Security settings table
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT false,
    biometric_enabled BOOLEAN DEFAULT false,
    transaction_pin_hash VARCHAR(255),
    daily_limit DECIMAL(15,2) DEFAULT 10000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 50000.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin account table (created on first user registration)
CREATE TABLE IF NOT EXISTS admin_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    total_fees_collected DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Locked savings accounts table
CREATE TABLE IF NOT EXISTS locked_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    locked_amount DECIMAL(15,2) NOT NULL,
    lock_duration_months INTEGER NOT NULL,
    interest_rate DECIMAL(5,4) DEFAULT 0.0200, -- 2% annual interest
    locked_at TIMESTAMP DEFAULT NOW(),
    unlock_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'withdrawn', 'matured'
    early_withdrawal_fee_rate DECIMAL(5,4) DEFAULT 0.0500, -- 5% penalty
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fee transactions table
CREATE TABLE IF NOT EXISTS fee_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_transaction_id UUID REFERENCES transactions(id),
    fee_type VARCHAR(50) NOT NULL, -- 'transaction_fee', 'early_withdrawal_fee'
    fee_amount DECIMAL(15,2) NOT NULL,
    admin_account_id UUID REFERENCES admin_account(id),
    collected_at TIMESTAMP DEFAULT NOW()
);

-- Update transactions table to include fee information
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15,2);

-- Function to create admin account on first user registration
CREATE OR REPLACE FUNCTION create_admin_account_if_not_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if admin account already exists
    IF NOT EXISTS (SELECT 1 FROM admin_account LIMIT 1) THEN
        -- Create admin wallet first
        INSERT INTO wallets (user_id, balance, wallet_address, created_at)
        VALUES (NEW.id, 0.00, 'admin_' || substring(gen_random_uuid()::text, 1, 8), NOW())
        RETURNING id INTO @wallet_id;
        
        -- Create admin account
        INSERT INTO admin_account (user_id, wallet_id, created_at)
        VALUES (NEW.id, @wallet_id, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create admin account on first user registration
CREATE TRIGGER create_admin_account_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_admin_account_if_not_exists();
