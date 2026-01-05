-- Updated to use speeclo@gmail.com with correct password hash
DELETE FROM users WHERE email = 'speeclo@gmail.com' OR email = 'admin@lovemedix.com';

-- Insert admin user with email: speeclo@gmail.com, password: Admin@123
-- Bcrypt hash for "Admin@123" with 10 rounds
INSERT INTO users (email, password_hash, full_name, phone, user_type, status, created_at)
VALUES (
  'speeclo@gmail.com',
  '$2a$10$CwTycUXWue0Thq9StjUM0uBP8xnJZZ.vvFZVLJfkXJ3Lqz7Y8Y8qO',
  'Admin',
  '+919999999999',
  'admin',
  'active',
  NOW()
);
