-- Permissions System Setup for Supermarket Management System
-- This script adds permissions and user_permissions tables to the existing database

USE g1_supermarket;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Create user_permissions junction table
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (permission_id) 
        REFERENCES permissions(permission_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Insert default permissions
INSERT INTO permissions (permission_name, description) VALUES
('view_dashboard', 'View dashboard and basic statistics'),
('view_sales', 'View sales data and reports'),
('manage_users', 'Create, update, and delete users'),
('manage_products', 'Manage product catalog and inventory'),
('manage_inventory', 'Manage stock levels and inventory'),
('view_reports', 'Access detailed reports and analytics'),
('manage_orders', 'Process and manage customer orders'),
('manage_customers', 'Manage customer information'),
('manage_branches', 'Manage branch information and settings'),
('system_admin', 'Full system administration access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Assign default permissions to existing users based on their roles
-- Administrator gets all permissions
INSERT INTO user_permissions (user_id, permission_id)
SELECT u.user_id, p.permission_id
FROM users u
CROSS JOIN permissions p
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'administrator')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Backend Developer gets development and data access permissions
INSERT INTO user_permissions (user_id, permission_id)
SELECT u.user_id, p.permission_id
FROM users u
CROSS JOIN permissions p
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'backend_developer')
AND p.permission_name IN ('view_dashboard', 'view_sales', 'manage_products', 'manage_inventory', 'view_reports', 'manage_orders')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Business Analyst gets view permissions
INSERT INTO user_permissions (user_id, permission_id)
SELECT u.user_id, p.permission_id
FROM users u
CROSS JOIN permissions p
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'business_analyst')
AND p.permission_name IN ('view_dashboard', 'view_sales', 'view_reports')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(permission_name);

-- Show summary of permissions setup
SELECT 
    'Permissions Setup Complete' as status,
    COUNT(DISTINCT p.permission_id) as total_permissions,
    COUNT(DISTINCT up.user_id) as users_with_permissions,
    COUNT(*) as total_assignments
FROM permissions p
LEFT JOIN user_permissions up ON p.permission_id = up.permission_id;

-- Display permission assignments by role
SELECT 
    r.role_name,
    u.username,
    GROUP_CONCAT(p.permission_name ORDER BY p.permission_name) as permissions
FROM users u
JOIN roles r ON u.role_id = r.role_id
LEFT JOIN user_permissions up ON u.user_id = up.user_id
LEFT JOIN permissions p ON up.permission_id = p.permission_id
GROUP BY r.role_name, u.username
ORDER BY r.role_name, u.username;