-- Insert demo users
INSERT INTO users (id, email, name, phone, balance, savings_balance) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'demo@moneybuddy.com', 'Demo User', '+1234567890', 1500.00, 500.00),
    ('550e8400-e29b-41d4-a716-446655440002', 'alice@example.com', 'Alice Johnson', '+1234567891', 2500.00, 1000.00),
    ('550e8400-e29b-41d4-a716-446655440003', 'bob@example.com', 'Bob Smith', '+1234567892', 750.00, 250.00),
    ('550e8400-e29b-41d4-a716-446655440004', 'carol@example.com', 'Carol Davis', '+1234567893', 3200.00, 1500.00)
ON CONFLICT (email) DO NOTHING;

-- Insert demo accounts
INSERT INTO accounts (id, user_id, account_number, account_type, balance) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'MB001234567890', 'checking', 1500.00),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'MB001234567891', 'savings', 500.00),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'MB002234567890', 'checking', 2500.00),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'MB002234567891', 'savings', 1000.00),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'MB003234567890', 'checking', 750.00),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'MB004234567890', 'checking', 3200.00)
ON CONFLICT (account_number) DO NOTHING;

-- Insert demo transactions
INSERT INTO transactions (id, user_id, account_id, type, amount, fee, description, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446
    '550e8400-e29b-41d4-a716-446655440001', 
    '660e8400-e29b-41d4-a716-446655440001', 
    'deposit', 
    500.00, 
    5.00, 
    'Initial deposit via Square', 
    'completed'
),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'withdrawal', 200.00, 2.00, 'ATM withdrawal', 'completed'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'deposit', 1000.00, 10.00, 'Payroll deposit', 'completed'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'transfer', 100.00, 1.00, 'Transfer to Alice', 'completed'),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', 'geofence_transfer', 50.00, 1.00, 'Coffee shop geofence transfer', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert demo geofences (popular NYC locations)
INSERT INTO geofences (id, user_id, transaction_id, name, center_lat, center_lng, radius, amount, recipient_email, memo) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', 'Central Park Coffee', 40.7829, -73.9654, 200, 25.00, 'alice@example.com', 'Coffee meetup fund'),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', NULL, 'Times Square Lunch', 40.7580, -73.9855, 150, 40.00, 'bob@example.com', 'Lunch money for Times Square'),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Brooklyn Bridge Walk', 40.7061, -73.9969, 300, 15.00, 'carol@example.com', 'Walking tour expense'),
    ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', NULL, 'Wall Street Business', 40.7074, -74.0113, 100, 75.00, 'demo@moneybuddy.com', 'Business meeting expense')
ON CONFLICT (id) DO NOTHING;

-- Insert demo savings locks
INSERT INTO savings_locks (id, user_id, amount, lock_duration, interest_rate, unlocks_at) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 200.00, 30, 0.0250, NOW() + INTERVAL '30 days'),
    ('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 500.00, 90, 0.0350, NOW() + INTERVAL '90 days'),
    ('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 1000.00, 180, 0.0450, NOW() + INTERVAL '180 days')
ON CONFLICT (id) DO NOTHING;

-- Insert demo chat messages
INSERT INTO chat_messages (id, user_id, message, response, session_id) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'What is my current balance?', 'Your current checking account balance is $1,500.00 and your savings balance is $500.00. Is there anything else you''d like to know about your account?', 'session_001'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'How do geofenced transfers work?', 'Geofenced transfers are location-based money transfers! You can send money that can only be accessed when the recipient is physically within a specific geographic area that you define. It''s perfect for things like lunch money that can only be used at a specific restaurant, or event funds that can only be accessed at the venue. Would you like me to help you create one?', 'session_001'),
    ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Show me my recent transactions', 'Here are your recent transactions: 1) Payroll deposit: +$1,000.00 (completed), 2) Transfer from Demo User: +$100.00 (completed). Your account is looking healthy! Need help with anything else?', 'session_002')
ON CONFLICT (id) DO NOTHING;

-- Insert demo payment methods
INSERT INTO payment_methods (id, user_id, type, provider, provider_id, last_four, brand, is_default) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'card', 'square', 'sq_card_demo_1', '4242', 'Visa', true),
    ('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'card', 'square', 'sq_card_demo_2', '5555', 'Mastercard', true),
    ('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'bank_account', 'square', 'sq_bank_demo_1', '6789', 'Chase', false)
ON CONFLICT (id) DO NOTHING;

-- Insert demo notifications
INSERT INTO notifications (id, user_id, title, message, type) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Geofence Transfer Created', 'Your geofenced transfer of $25.00 for Central Park Coffee has been created successfully!', 'geofence'),
    ('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Deposit Completed', 'Your deposit of $500.00 has been processed successfully.', 'transaction'),
    ('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Welcome to Money Buddy!', 'Welcome to Money Buddy! Your account has been set up successfully. Start exploring our geofencing features!', 'security'),
    ('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Savings Lock Created', 'Your savings of $1,000.00 has been locked for 180 days at 4.5% interest rate.', 'savings')
ON CONFLICT (id) DO NOTHING;

-- Update sequences to avoid conflicts with demo data
SELECT setval('users_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM users), true);
SELECT setval('accounts_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM accounts), true);
SELECT setval('transactions_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM transactions), true);
SELECT setval('geofences_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM geofences), true);
SELECT setval('savings_locks_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM savings_locks), true);
SELECT setval('chat_messages_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM chat_messages), true);
SELECT setval('payment_methods_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM payment_methods), true);
SELECT setval('notifications_id_seq', (SELECT MAX(EXTRACT(EPOCH FROM created_at)) FROM notifications), true);
