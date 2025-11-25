# Single-stage build for reliability
FROM node:18-alpine

WORKDIR /usr/src/app

# Set environment variables with hardcoded values
ENV DATABASE_URL="postgresql://postgres:postgres_secure_password_2024@db:5432/pos_db"
ENV JWT_SECRET="vicman-jwt-secret-change-in-production-2024"
ENV PORT=3000

# Install OpenSSL and bash for Prisma and scripts
RUN apk add --no-cache openssl bash

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build NestJS application
RUN npm run build

# Verify dist folder exists
RUN ls -la dist/ && ls -la dist/src/ || echo "WARNING: dist folder structure unexpected"

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
