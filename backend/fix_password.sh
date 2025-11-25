#!/bin/bash
# Script to fix admin password in running Portainer container

echo "Fixing admin password hash in database..."
echo ""
echo "This script will update the admin@pos.com user password hash"
echo "to work with password: admin123"
echo ""

# Update the password hash
docker exec -i $(docker ps -q -f name=vicman.*db) psql -U postgres -d pos_db <<-EOSQL
    UPDATE "User" 
    SET password = '\$2b\$10\$6k2QGicFNV1wK5YkUxE4jeeke/UN1ascMcBC4ghm/7PT0hkKKdFZe'
    WHERE email = 'admin@pos.com';
    
    SELECT 'Password hash updated successfully for: ' || email || ' (User ID: ' || id || ')' as result
    FROM "User" 
    WHERE email = 'admin@pos.com';
EOSQL

echo ""
echo "✓ Password hash updated!"
echo ""
echo "You can now login with:"
echo "  Email: admin@pos.com"
echo "  Password: admin123"
