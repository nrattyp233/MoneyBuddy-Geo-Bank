-- Insert demo users
INSERT INTO users (id, email, name, phone, balance, savings_balance, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@moneybuddy.com', 'Demo User', '+1234567890', 1250.75, 5000.00, true, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'sarah@example.com', 'Sarah Johnson', '+1234567891', 2500.50, 10000.00, true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'mike@example.com', 'Mike Chen', '+1234567892', 750.25, 2500.00, true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'admin@moneybuddy.com', 'Money Buddy Admin', '+1234567893', 10000.00, 50000.00, true, NOW())
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    balance = EXCLUDED.balance,
    savings_balance = EXCLUDED.savings_balance,
    is_verified = EXCLUDED.is_verified;

-- Update admin user
UPDATE users SET is_admin = true WHERE email = 'admin@moneybuddy.com';

-- Insert demo accounts
INSERT INTO accounts (id, user_id, account_number, account_type, balance, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'MB001234567890', 'checking', 1250.75, NOW()),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'MB001234567891', 'savings', 5000.00, NOW()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'MB001234567892', 'checking', 2500.50, NOW()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'MB001234567893', 'savings', 10000.00, NOW())
ON CONFLICT (account_number) DO UPDATE SET
    balance = EXCLUDED.balance;

-- Insert demo transactions
INSERT INTO transactions (user_id, account_id, type, amount, fee, description, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'deposit', 2500.00, 0.00, 'Square deposit from employer', 'completed', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'transfer', -125.00, 2.50, 'Sent to Sarah Johnson', 'completed', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'deposit', 21.67, 0.00, 'Savings interest payment', 'completed', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'deposit', 3000.00, 0.00, 'Square deposit', 'completed', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'withdrawal', -800.00, 0.00, 'Bank transfer withdrawal', 'completed', NOW() - INTERVAL '1 day');

-- Insert demo geofences
INSERT INTO geofences (user_id, name, center_lat, center_lng, radius, amount, recipient_email, memo, is_active, expires_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Central Park Meetup', 40.7829, -73.9654, 200, 50.00, 'sarah@example.com', 'Coffee money for our meetup', true, NOW() + INTERVAL '24 hours', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440000', 'Times Square Gift', 40.7580, -73.9855, 150, 25.00, 'mike@example.com', 'Birthday surprise!', true, NOW() + INTERVAL '48 hours', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 'Brooklyn Bridge Walk', 40.7061, -73.9969, 300, 75.00, 'demo@moneybuddy.com', 'Lunch after our walk', true, NOW() + INTERVAL '72 hours', NOW() - INTERVAL '3 hours');

-- Insert demo savings locks
INSERT INTO savings_locks (user_id, amount, lock_duration, interest_rate, unlocks_at, purpose, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 2000.00, 12, 0.0525, NOW() + INTERVAL '12 months', 'Emergency fund', NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440000', 1500.00, 6, 0.0425, NOW() + INTERVAL '5 months', 'Vacation savings', NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440001', 5000.00, 24, 0.0625, NOW() + INTERVAL '23 months', 'House down payment', NOW() - INTERVAL '1 month');

-- Insert demo chat messages
INSERT INTO chat_messages (user_id, message, response, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'How much money do I have?', 'Hi there! 🐵 You currently have $1,250.75 in your checking account and $5,000.00 in savings. Your total balance is $6,250.75! Looking good! 💰', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Help me save money', 'Great question! 🎯 I see you already have some savings locks set up - that''s awesome! You could try our geofencing feature to set spending limits in certain areas, or create more savings goals. What specific area would you like help with? 🐵💡', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440001', 'What are geofences?', 'Geofences are super cool! 🗺️ They let you send money that can only be collected in specific locations. Perfect for meetups, gifts, or controlling where money gets spent. You can draw custom areas on a map! Want to try creating one? 🐵✨', NOW() - INTERVAL '3 hours');

-- Insert demo payment methods
INSERT INTO payment_methods (user_id, type, provider, provider_id, last_four, brand, is_default, metadata, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'card', 'square', 'sq_card_demo_1234', '4242', 'visa', true, '{"exp_month": 12, "exp_year": 2027}', NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440000', 'bank_account', 'square', 'sq_bank_demo_5678', '6789', 'checking', false, '{"bank_name": "Chase Bank", "account_type": "checking"}', NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440001', 'card', 'square', 'sq_card_demo_9876', '1234', 'mastercard', true, '{"exp_month": 8, "exp_year": 2026}', NOW() - INTERVAL '1 month');

-- Insert demo notifications
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Deposit Completed', 'Your $2,500.00 deposit has been successfully processed! 💰', 'transaction', true, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'Geofence Created', 'Your geofenced transfer to Sarah Johnson is now active at Central Park! 📍', 'geofence', false, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440000', 'Savings Interest', 'You earned $21.67 in savings interest this month! 🎉', 'savings', false, NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440001', 'Welcome to Money Buddy!', 'Thanks for joining Money Buddy! Start exploring our features like geofencing and savings locks. 🐵', 'general', true, NOW() - INTERVAL '5 days');
