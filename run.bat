@echo off
echo 🚀 Starting CMS setup...

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install pnpm first:
    echo npm install -g pnpm
    pause
    exit /b 1
)

REM Check if docker is installed  
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Start database services
echo 🗄️ Starting database services...
docker-compose up postgres redis -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak > nul

REM Copy environment file if not exists
if not exist .env (
    echo 📋 Creating .env file...
    copy env.example .env
    echo ⚠️  Please update .env file with your configurations
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
pnpm -F api db:generate

REM Run database migrations
echo 🗃️ Running database migrations...
pnpm -F api db:migrate

REM Seed database
echo 🌱 Seeding database...
pnpm -F api db:seed

REM Start development servers
echo 🌐 Starting development servers...
echo Frontend: http://localhost:3000
echo API: http://localhost:3001  
echo API Docs: http://localhost:3001/api/docs
echo.
echo Login credentials:
echo Email: admin@example.com
echo Password: Admin@123
echo.

pnpm dev
