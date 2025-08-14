-- Conditional Geo-Time Transfer Database Schema
-- MoneyBuddy Geo Bank

-- Users table (extends existing auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    stripe_customer_id VARCHAR(255),
    stripe_account_id VARCHAR(255),
    location_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conditional Transfers table
CREATE TABLE conditional_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_intent_id VARCHAR(255),
    
    -- Geo-fence conditions
    geo_fence JSONB NOT NULL, -- {type: 'circle', center: {lat, lng}, radius_km} or {type: 'polygon', coordinates: [...]}
    geo_fence_address TEXT, -- Human-readable address for UI
    
    -- Time conditions
    time_limit TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'funds_held', 'condition_met', 'released', 'expired', 'refunded')),
    condition_met_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    description TEXT,
    sender_note TEXT,
    recipient_note TEXT,
    
    CONSTRAINT valid_time_limit CHECK (time_limit > created_at)
);

-- Location logs for recipients
CREATE TABLE location_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transfer_id UUID REFERENCES conditional_transfers(id) ON DELETE CASCADE,
    
    -- Location data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy_meters INTEGER,
    
    -- Geo-fence check results
    within_geofence BOOLEAN DEFAULT FALSE,
    distance_from_center_km DECIMAL(8,3),
    
    timestamp TIMESTAMP DEFAULT NOW(),
    source VARCHAR(20) DEFAULT 'gps' CHECK (source IN ('gps', 'ip', 'manual'))
);

-- Transfer status history for audit trail
CREATE TABLE transfer_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES conditional_transfers(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Stripe webhook events log
CREATE TABLE stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    transfer_id UUID REFERENCES conditional_transfers(id) ON DELETE SET NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transfers_sender ON conditional_transfers(sender_id);
CREATE INDEX idx_transfers_recipient ON conditional_transfers(recipient_id);
CREATE INDEX idx_transfers_status ON conditional_transfers(status);
CREATE INDEX idx_transfers_time_limit ON conditional_transfers(time_limit);
CREATE INDEX idx_location_logs_transfer ON location_logs(transfer_id);
CREATE INDEX idx_location_logs_timestamp ON location_logs(timestamp);

-- Functions and triggers for status updates
CREATE OR REPLACE FUNCTION update_transfer_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status change
    INSERT INTO transfer_status_history (transfer_id, old_status, new_status, reason)
    VALUES (NEW.id, OLD.status, NEW.status, 'System update');
    
    -- Update timestamps
    IF NEW.status = 'condition_met' AND OLD.status != 'condition_met' THEN
        NEW.condition_met_at = NOW();
    END IF;
    
    IF NEW.status IN ('released', 'refunded') AND OLD.status NOT IN ('released', 'refunded') THEN
        NEW.completed_at = NOW();
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transfer_status_update
    BEFORE UPDATE ON conditional_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_transfer_status();

-- Sample geo-fence JSON structures
-- Circle: {"type": "circle", "center": {"lat": 40.7128, "lng": -74.0060}, "radius_km": 0.5}
-- Polygon: {"type": "polygon", "coordinates": [[lat1, lng1], [lat2, lng2], [lat3, lng3], [lat1, lng1]]}
