# PowerShell Script to fix admin password in running Portainer container
# Run this script on your NAS or where Docker is running

Write-Host "Fixing admin password hash in database..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will update the admin@pos.com user password hash" -ForegroundColor Yellow
Write-Host "to work with password: admin123" -ForegroundColor Yellow
Write-Host ""

# Get the database container name
$dbContainer = docker ps --filter "name=vicman" --filter "name=db" --format "{{.Names}}" | Select-Object -First 1

if (-not $dbContainer) {
    Write-Host "ERROR: Could not find database container!" -ForegroundColor Red
    Write-Host "Make sure the VICMAN stack is running in Portainer" -ForegroundColor Red
    exit 1
}

Write-Host "Found database container: $dbContainer" -ForegroundColor Green
Write-Host ""

# Execute SQL to update password
$sql = @"
UPDATE "User" 
SET password = '\$2b\$10\$6k2QGicFNV1wK5YkUxE4jeeke/UN1ascMcBC4ghm/7PT0hkKKdFZe'
WHERE email = 'admin@pos.com';

SELECT 'Password hash updated successfully for: ' || email || ' (User ID: ' || id || ')' as result
FROM "User" 
WHERE email = 'admin@pos.com';
"@

docker exec -i $dbContainer psql -U postgres -d pos_db -c $sql

Write-Host ""
Write-Host "✓ Password hash updated!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now login with:" -ForegroundColor Cyan
Write-Host "  Email: admin@pos.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
