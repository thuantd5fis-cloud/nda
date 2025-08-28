# 📋 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY CMS

Hướng dẫn chi tiết cài đặt và chạy hệ thống CMS production-ready.

## 🔧 YÊU CẦU HỆ THỐNG

### Phần mềm bắt buộc:
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 
- **Docker** & **Docker Compose**
- **Git**

### Hệ điều hành hỗ trợ:
- Windows 10/11
- macOS 10.15+  
- Ubuntu 18.04+
- CentOS 7+

## 📦 BƯỚC 1: CÀI ĐẶT PHẦN MẦM

### Cài đặt Node.js
```bash
# Tải từ https://nodejs.org (chọn LTS version)
# Hoặc dùng nvm:
nvm install 18
nvm use 18
```

### Cài đặt pnpm
```bash
npm install -g pnpm@latest
```

### Cài đặt Docker
- **Windows**: Tải Docker Desktop từ https://docker.com
- **macOS**: Tải Docker Desktop từ https://docker.com  
- **Ubuntu**: 
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Kiểm tra cài đặt
```bash
node --version    # >= v18.0.0
pnpm --version    # >= 8.0.0
docker --version  # >= 20.0.0
```

## 📥 BƯỚC 2: TẢI VÀ CÀI ĐẶT DỰ ÁN

### Clone dự án
```bash
git clone <repository-url>
cd cms
```

### Cài đặt dependencies
```bash
pnpm install
```

## ⚙️ BƯỚC 3: CẤU HÌNH MÔI TRƯỜNG

### Tạo file cấu hình
```bash
# Copy file mẫu
cp env.example .env

# Windows PowerShell
copy env.example .env
```

### Chỉnh sửa file `.env`
Mở file `.env` và cập nhật các thông số:

```bash
# Database - Giữ nguyên nếu dùng Docker
DATABASE_URL="postgresql://cms_user:cms_password@localhost:5432/cms_db?schema=public"



# JWT - QUAN TRỌNG: Thay đổi secret key
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789

# API
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Upload files
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Google Analytics (tùy chọn)
GOOGLE_ANALYTICS_ID=
```

⚠️ **LƯU Ý QUAN TRỌNG**: 
- Thay đổi `JWT_SECRET` thành một chuỗi bí mật mạnh
- Trong production, cập nhật tất cả password và secret keys

## 🚀 BƯỚC 4: CHẠY DỰ ÁN

### Phương pháp 1: Auto Setup (Khuyến nghị)

#### Windows:
```bash
# Chạy file batch
.\run.bat
```

#### Linux/macOS:
```bash
# Cấp quyền thực thi
chmod +x run.sh

# Chạy script
./run.sh
```

### Phương pháp 2: Setup thủ công

#### Bước 4.1: Khởi động Database
```bash
# Khởi động PostgreSQL
docker-compose up postgres -d

# Kiểm tra services đã chạy
docker-compose ps
```

#### Bước 4.2: Setup Database  
```bash
# Generate Prisma client
pnpm -F api db:generate

# Chạy migrations
pnpm -F api db:migrate

# Seed dữ liệu mẫu
pnpm -F api db:seed
```

#### Bước 4.3: Khởi động ứng dụng
```bash
# Khởi động cả frontend và backend
pnpm dev

# Hoặc khởi động riêng lẻ:
# Frontend only
pnpm -F web dev

# Backend only  
pnpm -F api start:dev
```

## 🌐 TRUY CẬP ỨNG DỤNG

Sau khi setup thành công, bạn có thể truy cập:

### URLs chính:
- **🏠 Frontend (Admin Panel)**: http://localhost:3000
- **🔌 API Backend**: http://localhost:3001  
- **📚 API Documentation**: http://localhost:3001/api/docs
- **🗄️ Database Admin**: `pnpm -F api db:studio`

### Thông tin đăng nhập:
- **📧 Email**: admin@example.com
- **🔑 Password**: Admin@123

### Tài khoản mẫu khác:
- **Admin**: admin2@example.com / Admin@456
- **Editor**: editor@example.com / Editor@123

## 🔍 KIỂM TRA HỆ THỐNG

### Kiểm tra API hoạt động:
```bash
# Test API health
curl http://localhost:3001/auth/me

# Xem API documentation
curl http://localhost:3001/api/docs
```

### Kiểm tra Database:
```bash
# Mở Prisma Studio
pnpm -F api db:studio

# Kiểm tra kết nối DB
pnpm -F api db:migrate status
```

### Kiểm tra Frontend:
- Mở http://localhost:3000
- Đăng nhập với tài khoản admin
- Kiểm tra các trang: Dashboard, Posts, Categories, v.v.

## 🐛 XỬ LÝ SỰ CỐ

### Lỗi thường gặp và cách fix:

#### 1. Port đã được sử dụng
```bash
# Kiểm tra process đang dùng port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (Linux/Mac)
kill -9 <process_id>
```

#### 2. Docker services không khởi động
```bash
# Restart tất cả services
docker-compose down
docker-compose up -d

# Xem logs
docker-compose logs postgres
docker-compose logs postgres
```

#### 3. Database migration lỗi
```bash
# Reset database
docker-compose down
docker volume rm admin_postgres_data
docker-compose up postgres -d

# Chờ 10 giây rồi migrate lại
pnpm -F api db:migrate
pnpm -F api db:seed
```

#### 4. pnpm install lỗi
```bash
# Clear cache
pnpm store prune

# Xóa node_modules và install lại
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

#### 5. Prisma client lỗi
```bash
# Regenerate Prisma client
pnpm -F api db:generate

# Restart TypeScript server trong IDE
```

#### 6. JWT authentication lỗi
- Kiểm tra `JWT_SECRET` trong file `.env`
- Đảm bảo secret key đủ mạnh (ít nhất 32 ký tự)
- Restart API server sau khi thay đổi

## 🔧 CÁC LỆNH HỮU ÍCH

### Development:
```bash
# Khởi động development
pnpm dev

# Khởi động riêng lẻ
pnpm -F web dev          # Frontend only
pnpm -F api start:dev    # Backend only

# Build production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Database:
```bash
# Tạo migration mới
pnpm -F api db:migrate <migration_name>

# Reset database
pnpm -F api db:migrate reset

# Seed lại dữ liệu
pnpm -F api db:seed

# Mở Prisma Studio
pnpm -F api db:studio
```

### Docker:
```bash
# Khởi động tất cả services
docker-compose up -d

# Chỉ database services
docker-compose up postgres -d

# Xem logs
docker-compose logs -f

# Dọn dẹp
docker-compose down
docker-compose down -v  # Xóa luôn volumes
```

### Testing:
```bash
# Unit tests
pnpm test

# E2E tests
pnpm -F web test:e2e

# Test coverage
pnpm -F api test:cov
```

## 📊 MONITORING VÀ LOGS

### Xem logs realtime:
```bash
# API logs
docker-compose logs -f api

# Database logs  
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

### Health checks:
```bash
# API health
curl http://localhost:3001/health

# Database connection
pnpm -F api db:migrate status
```

## 🌍 ĐA NGÔN NGỮ

Hệ thống hỗ trợ đa ngôn ngữ:
- **🇻🇳 Tiếng Việt** (mặc định)
- **🇺🇸 English**

File ngôn ngữ: `apps/web/src/messages/`

## 🎯 TÍNH NĂNG ĐÃ SẴN SÀNG

### ✅ Hoàn thành:
- Authentication & RBAC (6 vai trò)
- User management
- Basic CRUD cho Posts, Categories, Tags, Assets
- API documentation (Swagger)
- Database với sample data
- Docker setup
- Multi-language support

### 🚧 Cần phát triển thêm:
- Rich Text Editor cho bài viết
- File upload với optimization  
- Dashboard với biểu đồ
- Advanced search & filtering
- Real-time notifications
- Email system

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra phần "Xử lý sự cố" ở trên
2. Xem logs để tìm lỗi cụ thể
3. Đảm bảo tất cả services đang chạy
4. Restart toàn bộ hệ thống nếu cần

---

🎉 **Chúc bạn setup thành công CMS!** 

Sau khi hoàn tất, bạn sẽ có một hệ thống CMS production-ready với tất cả tính năng cơ bản để bắt đầu phát triển dự án của mình.
