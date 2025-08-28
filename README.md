# CMS - Production Ready Content Management System

A modern, full-featured CMS built with Next.js 14, NestJS, and Prisma ORM.

## 🚀 Features

### Content Management
- **Posts Management**: Rich text editor, SEO fields, workflow (Draft → Review → Published/Rejected → Archived)
- **Categories**: Hierarchical structure with parent/child support, SEO optimization, multi-language
- **Tags**: Auto-suggest functionality, easy management
- **Assets**: Image/video/file uploads, automatic optimization, batch operations, previews

### User Management & Authentication
- **RBAC**: 6 roles (super_admin, admin, editor, author, moderator, viewer)
- **JWT Authentication**: Access/refresh token system
- **Session Management**: Configurable timeout, security policies
- **Password Policy**: Strong password requirements

### Additional Features
- **Members/Experts**: CRM sync, personal info, credentials management
- **Events**: CRUD with countdown timers, location management
- **Analytics**: View tracking, Google Analytics integration
- **FAQ**: Drag-and-drop ordering
- **Audit Trails**: Complete history of changes

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Shadcn/ui** + **Tailwind CSS**
- **React Query/TanStack Query**
- **Zustand** (state management)
- **next-intl** (i18n)
- **react-hook-form** + **Zod**
- **TipTap** (Rich text editor)

### Backend
- **NestJS** (TypeScript)
- **Prisma ORM** + **PostgreSQL**
- **Redis** (sessions, caching, rate limiting)
- **Swagger** (API documentation)
- **JWT** authentication
- **Sharp** (image optimization)

### DevOps & Tools
- **Docker** + **Docker Compose**
- **pnpm** (monorepo workspace)
- **ESLint** + **Prettier**
- **Husky** + **lint-staged**
- **Vitest** (unit tests) + **Playwright** (E2E)

## 📦 Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configurations
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### 1. Clone & Install
```bash
git clone <repository-url>
cd cms
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Update database and other configurations in .env
```

### 3. Start with Docker Compose
```bash
# Start all services (PostgreSQL, Redis, API, Web)
docker-compose up -d

# Wait for services to start, then run migrations and seed
pnpm -F api db:migrate
pnpm -F api db:seed
```

### 4. Manual Development Setup (Alternative)
```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Install dependencies
pnpm install

# Generate Prisma client
pnpm -F api db:generate

# Run migrations
pnpm -F api db:migrate

# Seed database
pnpm -F api db:seed

# Start development servers
pnpm dev
```

## 🔐 Default Login

After seeding, you can login with:
- **Email**: `admin@example.com`
- **Password**: `Admin@123`

## 📡 API Documentation

Once the API is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **API Base URL**: http://localhost:3001

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: `pnpm -F api db:studio`

## 🛠 Development Commands

```bash
# Development
pnpm dev                    # Start both frontend and backend
pnpm -F web dev            # Start only frontend
pnpm -F api start:dev      # Start only backend

# Database
pnpm -F api db:generate    # Generate Prisma client
pnpm -F api db:push        # Push schema changes
pnpm -F api db:migrate     # Run migrations
pnpm -F api db:seed        # Seed database
pnpm -F api db:studio      # Open Prisma Studio

# Build
pnpm build                 # Build all apps
pnpm -F web build         # Build frontend only
pnpm -F api build         # Build backend only

# Testing
pnpm test                  # Run all tests
pnpm -F web test:e2e      # Run E2E tests
pnpm lint                  # Run linting
pnpm type-check           # Type checking
```

## 🎯 Key Features Implementation

### 1. Post Management
- Rich text editor with TipTap
- SEO fields (meta title, description, keywords, Open Graph)
- Workflow states with approval process
- Version history and audit trails
- Multi-language support

### 2. Asset Management
- Upload with drag & drop
- Automatic image optimization with Sharp
- Batch operations (delete, rename, move, download as ZIP)
- Preview for images, videos, PDFs, audio
- Grid/list view modes

### 3. User Roles & Permissions (RBAC)
- **super_admin**: Full system access
- **admin**: Administrative access
- **editor**: Content editing and management
- **author**: Content creation
- **moderator**: Content review and moderation
- **viewer**: Read-only access

### 4. Security Features
- JWT with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers
- Session timeout management

## 🧪 Testing

### API Tests
```bash
pnpm -F api test           # Unit tests
pnpm -F api test:e2e       # E2E API tests
pnpm -F api test:cov       # Test coverage
```

### Frontend Tests
```bash
pnpm -F web test           # Unit tests
pnpm -F web test:e2e       # E2E tests with Playwright
```

## 📊 Database Schema

The system includes comprehensive models for:
- Users, Roles, Permissions (RBAC)
- Posts, Categories, Tags (Content)
- Assets (Media management)
- Members, Experts (CRM integration)
- Events, FAQs
- Audit trails, Analytics

## ✅ Frontend Completed Features

### 🎨 **User Interface**
- **🔐 Authentication**: Login/logout flow với JWT tokens
- **📊 Dashboard**: Tổng quan hệ thống với real-time statistics
- **📝 Posts Management**: Danh sách bài viết với advanced filtering
- **📁 Categories**: Quản lý danh mục với parent/child hierarchy
- **🏷️ Tags**: Tag management với usage statistics
- **👥 Users**: User management với RBAC role display
- **🎨 Modern UI**: Shadcn/ui components với Tailwind CSS
- **📱 Responsive**: Optimized cho desktop, tablet, mobile

### 🚀 **Technical Implementation**
- **React Query**: Data fetching và caching
- **Zustand**: State management cho authentication
- **TypeScript**: Type-safe development
- **Form Handling**: react-hook-form với Zod validation
- **API Integration**: RESTful API client với error handling
- **Navigation**: Protected routes với role-based access

## 🔄 CI/CD Ready

The project includes:
- Docker configurations for production
- GitHub Actions workflows (can be added)
- Environment-based configurations
- Health checks and monitoring setup

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using modern web technologies for a production-ready CMS solution.
