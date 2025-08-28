#!/bin/bash

# CMS Launch Script
echo "🚀 Starting CMS setup..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start database services
echo "🗄️ Starting database services..."
docker-compose up postgres -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configurations"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm -F api db:generate

# Run database migrations
echo "🗃️ Running database migrations..."
pnpm -F api db:migrate

# Seed database
echo "🌱 Seeding database..."
pnpm -F api db:seed

# Start development servers
echo "🌐 Starting development servers..."
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:3001"
echo "API Docs: http://localhost:3001/api/docs"
echo ""
echo "Login credentials:"
echo "Email: admin@example.com"
echo "Password: Admin@123"
echo ""

pnpm dev
