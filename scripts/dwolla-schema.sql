-- Add Dwolla-specific fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dwolla_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ssn_last_4 TEXT;

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    provider TEXT NOT NULL CHECK (provider IN ('square', 'dwolla', 'stripe')),
    provider_transaction_id TEXT,
    funding_source_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create funding_sources table for Dwolla bank accounts
CREATE TABLE IF NOT EXISTS funding_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    dwolla_funding_source_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'balance')),
    bank_account_type TEXT CHECK (bank_account_type IN ('checking', 'savings')),
    status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'pending', 'removed')),
    last_four TEXT,
    routing_number TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_transaction_id ON transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_funding_sources_user_id ON funding_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_sources_dwolla_id ON funding_sources(dwolla_funding_source_id);

-- Create RLS policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for funding_sources
ALTER TABLE funding_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funding sources" ON funding_sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funding sources" ON funding_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funding sources" ON funding_sources
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to increment user balance
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET balance = COALESCE(balance, 0) + amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update transaction timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_funding_sources_modtime
    BEFORE UPDATE ON funding_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Add balance column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance DECIMAL(12, 2) DEFAULT 0.00;
