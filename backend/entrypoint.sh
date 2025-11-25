#!/bin/sh
set -e

echo "========================================="
echo "🚀 VICMAN Backend Starting..."
echo "========================================="
echo ""

echo "📊 Environment Check:"
echo "  DATABASE_URL: ${DATABASE_URL:-NOT SET}"
echo "  NODE_ENV: ${NODE_ENV:-development}"
echo "  JWT_SECRET: ${JWT_SECRET:0:15}..."
echo ""

echo "🔍 Verifying build..."
if [ ! -f "dist/main.js" ] && [ ! -f "dist/src/main.js" ]; then
    echo "❌ ERROR: Compiled code not found!"
    echo "   Expected: dist/main.js or dist/src/main.js"
    echo ""
    echo "📂 Folder contents:"
    ls -la
    echo ""
    echo "📂 Dist folder contents:"
    ls -la dist/ 2>/dev/null || echo "dist/ folder not found"
    exit 1
fi
echo "✅ Build verified"
echo ""

echo "🔄 Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

echo ""

echo "🌱 Running database seed..."
# Use npx prisma db seed without ts-node
npx prisma db seed
echo ""

echo "========================================="
echo "✅ Setup Complete!"
echo ""
echo "🔑 GUARANTEED LOGIN:"
echo "   Username: jeanvial"
echo "   Password: Tessi1308"
echo ""
echo "========================================="
echo "🚀 Starting NestJS application..."
echo "========================================="
echo ""

# Try both possible locations for main.js
if [ -f "dist/main.js" ]; then
    exec node dist/main.js
elif [ -f "dist/src/main.js" ]; then
    exec node dist/src/main.js
else
    echo "❌ FATAL: Cannot find main.js"
    exit 1
fi
