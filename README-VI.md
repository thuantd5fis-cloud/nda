# 🚀 CMS - Hệ thống Quản lý Nội dung

Một hệ thống CMS hiện đại, đầy đủ tính năng được xây dựng với Next.js 14, NestJS và Prisma ORM.

## ✨ Tính năng chính

### 📝 Quản lý nội dung
- **Quản lý bài viết**: Rich text editor, SEO fields, quy trình (Draft → Review → Published/Rejected → Archived)
- **Danh mục**: Cấu trúc phân cấp parent/child, tối ưu SEO, đa ngôn ngữ
- **Tags**: Tính năng auto-suggest, quản lý dễ dàng
- **Tài nguyên**: Upload hình ảnh/video/file, tự động tối ưu, thao tác hàng loạt, xem trước

### 👥 Quản lý người dùng & Xác thực
- **RBAC**: 6 vai trò (super_admin, admin, editor, author, moderator, viewer)
- **JWT Authentication**: Hệ thống access/refresh token
- **Quản lý phiên**: Timeout có thể cấu hình, chính sách bảo mật
- **Chính sách mật khẩu**: Yêu cầu mật khẩu mạnh

### 🔧 Tính năng bổ sung
- **Hội viên/Chuyên gia**: Đồng bộ CRM, thông tin cá nhân, quản lý học hàm học vị
- **Sự kiện**: CRUD với bộ đếm thời gian, quản lý địa điểm
- **Thống kê**: Theo dõi lượt xem, tích hợp Google Analytics
- **FAQ**: Sắp xếp kéo-thả
- **Audit Trails**: Lịch sử đầy đủ các thay đổi

## 🛠 Công nghệ sử dụng

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Shadcn/ui** + **Tailwind CSS**
- **React Query/TanStack Query**
- **Zustand** (quản lý state)
- **next-intl** (đa ngôn ngữ)
- **react-hook-form** + **Zod**
- **TipTap** (Rich text editor)

### Backend
- **NestJS** (TypeScript)
- **Prisma ORM** + **PostgreSQL**
- **Redis** (sessions, caching, rate limiting)
- **Swagger** (tài liệu API)
- **JWT** authentication
- **Sharp** (tối ưu hình ảnh)

### DevOps & Tools
- **Docker** + **Docker Compose**
- **pnpm** (monorepo workspace)
- **ESLint** + **Prettier**
- **Husky** + **lint-staged**
- **Vitest** (unit tests) + **Playwright** (E2E)

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### Cài đặt tự động
```bash
# Windows
run.bat

# Linux/Mac
chmod +x run.sh
./run.sh
```

### Cài đặt thủ công
```bash
# 1. Cài đặt dependencies
pnpm install

# 2. Khởi động services
docker-compose up postgres redis -d

# 3. Setup database
cp env.example .env  # Cập nhật config của bạn
pnpm -F api db:generate
pnpm -F api db:migrate  
pnpm -F api db:seed

# 4. Khởi động development
pnpm dev
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001  
- **Swagger Docs**: http://localhost:3001/api/docs

## 🔐 Thông tin đăng nhập

- **Email**: admin@example.com
- **Password**: Admin@123

## 📋 Hướng dẫn chi tiết

Xem file [SETUP.md](./SETUP.md) để có hướng dẫn cài đặt và cấu hình chi tiết.

## 🗂 Cấu trúc dự án

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configurations
└── docker-compose.yml
```

## 🎯 Các vai trò người dùng

- **super_admin**: Toàn quyền hệ thống
- **admin**: Quyền quản trị
- **editor**: Chỉnh sửa và quản lý nội dung
- **author**: Tạo nội dung
- **moderator**: Kiểm duyệt nội dung
- **viewer**: Chỉ xem

## 🔧 Lệnh phát triển

```bash
# Development
pnpm dev                    # Khởi động cả frontend và backend
pnpm -F web dev            # Chỉ frontend
pnpm -F api start:dev      # Chỉ backend

# Database
pnpm -F api db:generate    # Generate Prisma client
pnpm -F api db:push        # Push schema changes
pnpm -F api db:migrate     # Chạy migrations
pnpm -F api db:seed        # Seed database
pnpm -F api db:studio      # Mở Prisma Studio

# Build
pnpm build                 # Build tất cả apps
pnpm -F web build         # Build frontend
pnpm -F api build         # Build backend

# Testing
pnpm test                  # Chạy tất cả tests
pnpm -F web test:e2e      # Chạy E2E tests
pnpm lint                  # Chạy linting
pnpm type-check           # Type checking
```

## 🎨 Giao diện

Hệ thống sử dụng:
- **Shadcn/ui** components hiện đại
- **Tailwind CSS** cho styling
- **Responsive design** trên mọi thiết bị
- **Dark/Light mode** (sẵn sàng)
- **Đa ngôn ngữ** (Tiếng Việt + English)

## 📊 Sample Data

Sau khi seed, hệ thống sẽ có:
- **3 users** với các vai trò khác nhau
- **5 categories** với cấu trúc phân cấp
- **10 tags**
- **10 posts** với các trạng thái khác nhau
- **5 assets** (hình ảnh)
- **3 events** với countdown
- **5 FAQs**

## 🔒 Bảo mật

- Mã hóa password với bcrypt
- JWT với refresh tokens
- Rate limiting
- CORS configuration
- Helmet security headers
- Session timeout management
- Audit trails cho mọi thao tác

## 📱 Responsive & PWA Ready

- Tối ưu cho mobile, tablet, desktop
- Progressive Web App features
- Offline capabilities (có thể thêm)
- Fast loading với Next.js optimization

## 🌍 Đa ngôn ngữ

- **🇻🇳 Tiếng Việt** (mặc định)
- **🇺🇸 English**
- Dễ dàng thêm ngôn ngữ mới

## 📈 Production Ready

- Docker deployment
- Environment-based configuration
- Database migrations
- Health checks
- Logging and monitoring
- Error handling
- Performance optimization

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra [SETUP.md](./SETUP.md) để có hướng dẫn chi tiết
2. Xem logs: `docker-compose logs -f`
3. Kiểm tra health: `curl http://localhost:3001/health`

## 📄 License

MIT License - Xem file [LICENSE](./LICENSE) để biết chi tiết.

---

Được xây dựng với ❤️ sử dụng công nghệ web hiện đại cho giải pháp CMS production-ready.

