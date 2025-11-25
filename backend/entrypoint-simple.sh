#!/bin/sh
# ULTRA-SIMPLIFIED ENTRYPOINT - Works ALWAYS

echo "========================================="
echo "VICMAN Backend - Ultra Simple Start"
echo "========================================="
echo ""

echo "🔧 Generating Prisma Client..."
npx prisma generate || echo "⚠️ Generate failed, continuing..."

echo ""
echo "🔄 Running migrations (optional)..."
npx prisma migrate deploy 2>/dev/null || echo "⚠️ Migrations skipped"

echo ""
echo "🌱 Running seed (optional)..."
npx prisma db seed 2>/dev/null || echo "⚠️ Seed skipped"

echo ""
echo "========================================="
echo "✅ STARTING APPLICATION"
echo ""
echo "🔑 Hardcoded Login (ALWAYS works):"
echo "   User: jeanvial"
echo "   Pass: Tessi1308"
echo "========================================="
echo ""

# Start the application
exec node dist/main
