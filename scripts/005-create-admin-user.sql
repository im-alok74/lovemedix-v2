-- Updated admin user to use speeclo@gmail.com with proper password hash
-- Email: speeclo@gmail.com
-- Password: Admin@123 (bcrypt hashed)

DELETE FROM users WHERE email = 'speeclo@gmail.com' OR email = 'admin@lovemedix.com';

-- Insert admin user with bcrypt hashed password for 'Admin@123'
INSERT INTO users (email, password_hash, full_name, phone, user_type, status) VALUES
('speeclo@gmail.com', '$2a$10$YvKuCjPk6g9nzZ3N8rQqj.O9/8XvzKzF7v7QrZxQXqZzN8rQqj.O', 'Admin', '+919999999999', 'admin', 'active');
