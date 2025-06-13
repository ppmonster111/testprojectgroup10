-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@nutrition.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;
