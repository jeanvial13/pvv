-- Update admin user password hash to correct value for 'admin123'
UPDATE "User" 
SET password = '$2b$10$6k2QGicFNV1wK5YkUxE4jeeke/UN1ascMcBC4ghm/7PT0hkKKdFZe'
WHERE email = 'admin@pos.com';

-- Verify the update
SELECT id, email, name, "roleId" 
FROM "User" 
WHERE email = 'admin@pos.com';
