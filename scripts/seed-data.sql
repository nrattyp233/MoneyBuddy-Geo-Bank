-- Seed data for SecureBank

-- Insert admin account
INSERT INTO admin_account (total_fees_collected, total_penalty_fees) 
VALUES (0.00, 0.00) 
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO users (email, phone, first_name, last_name, password_hash, address, date_of_birth, is_verified) VALUES
('john.doe@example.com', '+1-555-123-4567', 'John', 'Doe', '$2b$10$hash1', '123 Main St, New York, NY 10001', '1990-01-15', TRUE),
('sarah.johnson@example.com', '+1-555-234-5678', 'Sarah', 'Johnson', '$2b$10$hash2', '456 Oak Ave, Los Angeles, CA 90210', '1985-05-22', TRUE),
('mike.wilson@example.com', '+1-555-345-6789', 'Mike', 'Wilson', '$2b$10$hash3', '789 Pine St, Chicago, IL 60601', '1992-11-08', TRUE),
('emma.davis@example.com', '+1-555-456-7890', 'Emma', 'Davis', '$2b$10$hash4', '321 Elm St, Houston, TX 77001', '1988-03-14', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert wallet accounts for users
INSERT INTO accounts (user_id, account_type, balance) 
SELECT id, 'wallet', 
    CASE 
        WHEN email = 'john.doe@example.com' THEN 12450.75
        WHEN email = 'sarah.johnson@example.com' THEN 8750.25
        WHEN email = 'mike.wilson@example.com' THEN 5200.50
        WHEN email = 'emma.davis@example.com' THEN 15600.00
    END
FROM users 
WHERE email IN ('john.doe@example.com', 'sarah.johnson@example.com', 'mike.wilson@example.com', 'emma.davis@example.com');

-- Insert locked savings account for John
INSERT INTO accounts (user_id, account_type, balance, is_locked, lock_duration_months, lock_start_date, lock_end_date, interest_rate, early_withdrawal_penalty, purpose)
SELECT id, 'savings', 5000.00, TRUE, 6, '2024-01-01', '2024-07-01', 3.0, 1.5, 'Emergency Fund'
FROM users 
WHERE email = 'john.doe@example.com';

-- Insert sample transactions
INSERT INTO transactions (transaction_id, sender_id, recipient_id, recipient_email, amount, fee, status, transaction_type, memo) VALUES
('TXN001', 
    (SELECT id FROM users WHERE email = 'john.doe@example.com'),
    (SELECT id FROM users WHERE email = 'sarah.johnson@example.com'),
    'sarah.johnson@example.com',
    250.00, 5.00, 'completed', 'transfer', 'Lunch payment'),
('TXN002',
    (SELECT id FROM users WHERE email = 'john.doe@example.com'),
    (SELECT id FROM users WHERE email = 'mike.wilson@example.com'),
    'mike.wilson@example.com',
    100.00, 2.00, 'pending', 'transfer', 'Birthday gift'),
('TXN003',
    (SELECT id FROM users WHERE email = 'emma.davis@example.com'),
    (SELECT id FROM users WHERE email = 'john.doe@example.com'),
    'john.doe@example.com',
    500.00, 10.00, 'completed', 'transfer', 'Freelance payment');

-- Insert geofence for pending transaction
INSERT INTO geofences (transaction_id, center_lat, center_lng, radius_meters, name)
SELECT id, 40.7128, -74.0060, 1000, 'Downtown NYC'
FROM transactions 
WHERE transaction_id = 'TXN002';

-- Insert time restriction for pending transaction
INSERT INTO time_restrictions (transaction_id, expires_at)
SELECT id, CURRENT_TIMESTAMP + INTERVAL '24 hours'
FROM transactions 
WHERE transaction_id = 'TXN002';

-- Insert security settings for users
INSERT INTO security_settings (user_id, two_factor_enabled, biometric_enabled)
SELECT id, TRUE, FALSE
FROM users;
