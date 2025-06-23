-- Enhanced transaction tables for real processing
CREATE TABLE IF NOT EXISTS transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'internal_transfer', 'deposit', 'withdrawal'
    status VARCHAR(20) NOT NULL,
    previous_status VARCHAR(20),
    message TEXT,
    processor_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment processor configurations
CREATE TABLE IF NOT EXISTS payment_processors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- 'stripe', 'plaid', 'square'
    is_active BOOLEAN DEFAULT true,
    config JSONB NOT NULL, -- API keys, endpoints, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Real-time balance tracking
CREATE TABLE IF NOT EXISTS wallet_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    available_balance DECIMAL(15,2) GENERATED ALWAYS AS (balance - pending_balance) STORED,
    last_updated TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1, -- For optimistic locking
    UNIQUE(user_id)
);

-- Transaction holds for pending operations
CREATE TABLE IF NOT EXISTS transaction_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL,
    hold_amount DECIMAL(15,2) NOT NULL,
    hold_type VARCHAR(20) NOT NULL, -- 'withdrawal', 'transfer', 'fee'
    expires_at TIMESTAMP NOT NULL,
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook events from payment processors
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processor VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) NOT NULL, -- External event ID
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(processor, event_id)
);

-- Enhanced external transactions with real processing
ALTER TABLE external_transactions ADD COLUMN IF NOT EXISTS processor_transaction_id VARCHAR(255);
ALTER TABLE external_transactions ADD COLUMN IF NOT EXISTS webhook_event_id UUID REFERENCES webhook_events(id);
ALTER TABLE external_transactions ADD COLUMN IF NOT EXISTS hold_id UUID REFERENCES transaction_holds(id);

-- Function to create or update wallet balance
CREATE OR REPLACE FUNCTION upsert_wallet_balance(p_user_id UUID, p_initial_balance DECIMAL(15,2) DEFAULT 0.00)
RETURNS void AS $$
BEGIN
    INSERT INTO wallet_balances (user_id, balance)
    VALUES (p_user_id, p_initial_balance)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to update balance with optimistic locking
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_user_id UUID,
    p_amount DECIMAL(15,2),
    p_transaction_id UUID,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_version INTEGER;
    new_balance DECIMAL(15,2);
BEGIN
    -- Get current version and balance
    SELECT version, balance INTO current_version, new_balance
    FROM wallet_balances
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- Create wallet if doesn't exist
        PERFORM upsert_wallet_balance(p_user_id, p_amount);
        RETURN true;
    END IF;
    
    new_balance := new_balance + p_amount;
    
    -- Prevent negative balance
    IF new_balance < 0 THEN
        RETURN false;
    END IF;
    
    -- Update with version check
    UPDATE wallet_balances
    SET balance = new_balance,
        version = version + 1,
        last_updated = NOW()
    WHERE user_id = p_user_id AND version = current_version;
    
    -- Check if update succeeded
    IF NOT FOUND THEN
        -- Concurrent update detected, retry
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to create transaction hold
CREATE OR REPLACE FUNCTION create_transaction_hold(
    p_user_id UUID,
    p_transaction_id UUID,
    p_amount DECIMAL(15,2),
    p_hold_type VARCHAR(20),
    p_expires_minutes INTEGER DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
    hold_id UUID;
BEGIN
    INSERT INTO transaction_holds (
        user_id, transaction_id, hold_amount, hold_type, expires_at
    ) VALUES (
        p_user_id, p_transaction_id, p_amount, p_hold_type,
        NOW() + INTERVAL '1 minute' * p_expires_minutes
    ) RETURNING id INTO hold_id;
    
    -- Update pending balance
    UPDATE wallet_balances
    SET pending_balance = pending_balance + p_amount,
        last_updated = NOW()
    WHERE user_id = p_user_id;
    
    RETURN hold_id;
END;
$$ LANGUAGE plpgsql;

-- Function to release transaction hold
CREATE OR REPLACE FUNCTION release_transaction_hold(p_hold_id UUID)
RETURNS void AS $$
DECLARE
    hold_record RECORD;
BEGIN
    SELECT * INTO hold_record
    FROM transaction_holds
    WHERE id = p_hold_id AND released_at IS NULL;
    
    IF FOUND THEN
        -- Release the hold
        UPDATE transaction_holds
        SET released_at = NOW()
        WHERE id = p_hold_id;
        
        -- Update pending balance
        UPDATE wallet_balances
        SET pending_balance = pending_balance - hold_record.hold_amount,
            last_updated = NOW()
        WHERE user_id = hold_record.user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_balances_user_id ON wallet_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_holds_user_id ON transaction_holds(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_holds_expires_at ON transaction_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_transaction_id ON transaction_logs(transaction_id);

-- Insert default payment processor configs (demo values)
INSERT INTO payment_processors (name, config) VALUES
('stripe', '{"publishable_key": "pk_test_demo", "secret_key": "sk_test_demo", "webhook_secret": "whsec_demo"}'),
('plaid', '{"client_id": "demo_client_id", "secret": "demo_secret", "environment": "sandbox"}')
ON CONFLICT DO NOTHING;
