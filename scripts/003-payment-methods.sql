-- Payment methods table for debit cards and bank accounts
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'debit_card', 'bank_account'
    name VARCHAR(255) NOT NULL, -- User-defined name like "Chase Checking"
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Debit card details
CREATE TABLE IF NOT EXISTS debit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE CASCADE,
    card_number_encrypted VARCHAR(255) NOT NULL, -- Last 4 digits stored for display
    card_number_last4 VARCHAR(4) NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    card_brand VARCHAR(20) NOT NULL, -- 'visa', 'mastercard', 'amex', 'discover'
    billing_address JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bank account details
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE CASCADE,
    account_number_encrypted VARCHAR(255) NOT NULL,
    account_number_last4 VARCHAR(4) NOT NULL,
    routing_number VARCHAR(9) NOT NULL,
    account_type VARCHAR(20) NOT NULL, -- 'checking', 'savings'
    bank_name VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- External transactions (deposits/withdrawals from/to external accounts)
CREATE TABLE IF NOT EXISTS external_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal'
    amount DECIMAL(15,2) NOT NULL,
    fee_amount DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    description TEXT,
    external_reference VARCHAR(255), -- Reference from payment processor
    processor_response JSONB, -- Response from payment processor
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT
);

-- Internal transfers between users (existing transactions table handles this)
-- But we'll add a transfer_type to distinguish internal vs external
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transfer_type VARCHAR(20) DEFAULT 'internal';
-- 'internal' = user to user, 'deposit' = external to wallet, 'withdrawal' = wallet to external

-- Transaction processing queue for async processing
CREATE TABLE IF NOT EXISTS transaction_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID, -- Can reference transactions or external_transactions
    transaction_table VARCHAR(50) NOT NULL, -- 'transactions' or 'external_transactions'
    priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    processor VARCHAR(50), -- 'stripe', 'plaid', 'internal'
    payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_external_transactions_user_id ON external_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_external_transactions_status ON external_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transaction_queue_status ON transaction_queue(status);
CREATE INDEX IF NOT EXISTS idx_transaction_queue_priority ON transaction_queue(priority);

-- Function to set primary payment method (only one primary per user per type)
CREATE OR REPLACE FUNCTION set_primary_payment_method(method_id UUID)
RETURNS VOID AS $$
DECLARE
    method_user_id UUID;
    method_type VARCHAR(20);
BEGIN
    -- Get the user_id and type of the method being set as primary
    SELECT user_id, type INTO method_user_id, method_type
    FROM payment_methods 
    WHERE id = method_id;
    
    -- Remove primary status from all other methods of the same type for this user
    UPDATE payment_methods 
    SET is_primary = false, updated_at = NOW()
    WHERE user_id = method_user_id 
    AND type = method_type 
    AND id != method_id;
    
    -- Set the specified method as primary
    UPDATE payment_methods 
    SET is_primary = true, updated_at = NOW()
    WHERE id = method_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process external transaction
CREATE OR REPLACE FUNCTION process_external_transaction(
    p_user_id UUID,
    p_payment_method_id UUID,
    p_transaction_type VARCHAR(20),
    p_amount DECIMAL(15,2),
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
    fee_amount DECIMAL(15,2);
    net_amount DECIMAL(15,2);
BEGIN
    -- Calculate fees (example: $2.50 for withdrawals, free for deposits)
    IF p_transaction_type = 'withdrawal' THEN
        fee_amount := 2.50;
        net_amount := p_amount - fee_amount;
    ELSE
        fee_amount := 0.00;
        net_amount := p_amount;
    END IF;
    
    -- Create external transaction record
    INSERT INTO external_transactions (
        user_id, payment_method_id, transaction_type, amount, 
        fee_amount, net_amount, description, status
    ) VALUES (
        p_user_id, p_payment_method_id, p_transaction_type, p_amount,
        fee_amount, net_amount, p_description, 'pending'
    ) RETURNING id INTO transaction_id;
    
    -- Add to processing queue
    INSERT INTO transaction_queue (
        transaction_id, transaction_table, priority, processor, payload
    ) VALUES (
        transaction_id, 'external_transactions', 5, 'stripe',
        jsonb_build_object(
            'user_id', p_user_id,
            'amount', p_amount,
            'type', p_transaction_type
        )
    );
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;
