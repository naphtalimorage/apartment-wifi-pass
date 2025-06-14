
-- Insert sample data plans (only if they don't already exist)
INSERT INTO public.data_plans (name, duration_hours, price_ksh, description, features, popular, is_active) VALUES
('Quick Browse', 2, 50, 'Perfect for quick internet sessions', ARRAY['High-speed internet', 'Unlimited browsing', '2-hour access', 'No data limits'], false, true),
('Daily Pass', 24, 150, 'Full day internet access', ARRAY['High-speed internet', 'Unlimited browsing', '24-hour access', 'No data limits', 'Perfect for work'], true, true),
('Weekly Plan', 168, 800, 'Extended internet access for a full week', ARRAY['High-speed internet', 'Unlimited browsing', '7-day access', 'No data limits', 'Best value', 'Priority support'], false, true),
('Student Special', 12, 80, 'Half-day access perfect for students', ARRAY['High-speed internet', 'Unlimited browsing', '12-hour access', 'No data limits', 'Student friendly'], false, true),
('Business Plan', 72, 400, '3-day access for business needs', ARRAY['High-speed internet', 'Unlimited browsing', '72-hour access', 'No data limits', 'Business support', 'Priority bandwidth'], false, true)
ON CONFLICT (name) DO NOTHING;
