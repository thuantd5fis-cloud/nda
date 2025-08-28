# 🚀 CMS API Documentation - Updated

## 📋 Overview
API backend đã được cập nhật hoàn toàn để hỗ trợ tất cả các tính năng mới trong frontend. Bao gồm 8 modules chính với full CRUD operations.

## 🗄️ Database Schema Updates

### Enhanced Models:
- **User**: Thêm profile fields, social links, security settings
- **Tag**: Thêm description, color, status
- **Asset**: Metadata, usage tracking, thumbnails
- **Event**: Registration management, payment tracking
- **Member**: Expertise, certifications, mentoring
- **FAQ**: SEO optimization, feedback system

### New Models:
- **EventRegistration**: Quản lý đăng ký sự kiện
- **MentoringSession**: Tracking phiên mentoring  
- **FAQFeedback**: Hệ thống feedback cho FAQ
- **AssetUsage**: Tracking việc sử dụng assets

## 🔗 API Endpoints

### 👤 Users API
```
POST   /users                    - Tạo user mới
GET    /users                    - List users với filtering
GET    /users/stats              - Thống kê users
GET    /users/:id                - Chi tiết user
PATCH  /users/:id                - Cập nhật user
DELETE /users/:id                - Xóa user
POST   /users/:id/reset-password - Reset password
```

### 📝 Posts API  
```
POST   /posts                    - Tạo post mới
GET    /posts                    - List posts với filtering
GET    /posts/stats              - Thống kê posts
GET    /posts/:id                - Chi tiết post
GET    /posts/:id/analytics      - Analytics post
PATCH  /posts/:id                - Cập nhật post
DELETE /posts/:id                - Xóa post
```

### 🏷️ Tags API
```
POST   /tags                     - Tạo tag mới
GET    /tags                     - List tags với filtering
GET    /tags/stats               - Thống kê tags
GET    /tags/:id                 - Chi tiết tag
PATCH  /tags/:id                 - Cập nhật tag
DELETE /tags/:id                 - Xóa tag
```

### 📁 Categories API
```
GET    /categories               - List categories
GET    /categories/:id           - Chi tiết category
```

### 🖼️ Assets API
```
POST   /assets                   - Upload asset mới
GET    /assets                   - List assets với filtering
GET    /assets/stats             - Thống kê assets
GET    /assets/:id               - Chi tiết asset
PATCH  /assets/:id               - Cập nhật metadata
DELETE /assets/:id               - Xóa asset
POST   /assets/:id/track-usage   - Track usage
DELETE /assets/:id/usage         - Remove usage
POST   /assets/:id/download      - Increment download count
```

### 📅 Events API
```
POST   /events                   - Tạo event mới
GET    /events                   - List events với filtering
GET    /events/stats             - Thống kê events
GET    /events/:id               - Chi tiết event
PATCH  /events/:id               - Cập nhật event
DELETE /events/:id               - Xóa event
POST   /events/:id/register      - Đăng ký event
DELETE /events/:id/register      - Hủy đăng ký
GET    /events/:id/registrations - List đăng ký
PATCH  /events/registrations/:id/payment - Update payment status
```

### 👥 Members API
```
POST   /members                  - Tạo member mới
GET    /members                  - List members với filtering
GET    /members/stats            - Thống kê members
GET    /members/:id              - Chi tiết member
PATCH  /members/:id              - Cập nhật member
DELETE /members/:id              - Xóa member
POST   /members/:id/mentoring    - Tạo phiên mentoring
GET    /members/:id/mentoring    - Lịch sử mentoring
PATCH  /members/mentoring/:id/status - Update mentoring status
POST   /members/:id/sync-crm     - Đồng bộ CRM
```

### ❓ FAQs API
```
POST   /faqs                     - Tạo FAQ mới
GET    /faqs                     - List FAQs với filtering
GET    /faqs/search              - Tìm kiếm FAQs
GET    /faqs/stats               - Thống kê FAQs
GET    /faqs/:id                 - Chi tiết FAQ
PATCH  /faqs/:id                 - Cập nhật FAQ
DELETE /faqs/:id                 - Xóa FAQ
POST   /faqs/:id/feedback        - Tạo feedback
POST   /faqs/reorder             - Sắp xếp lại thứ tự
```

## 🔐 Authentication
Tất cả endpoints đều được bảo vệ bằng JWT Authentication (trừ một số endpoints public như search FAQs).

### Login Credentials:
- **Email**: admin@example.com
- **Password**: Admin@123

## 📊 Query Parameters

### Common Parameters:
- `page`: Số trang (default: 1)
- `limit`: Số items per page (default: 10)  
- `search`: Tìm kiếm text
- `status`: Filter theo trạng thái

### Specific Filters:
- **Users**: `role`, `location`
- **Posts**: `categoryId`, `tagId`, `authorId`, `featured`
- **Events**: `tags`, `location`
- **Members**: `expertise`, `isExpert`, `isActive`
- **FAQs**: `category`, `priority`, `tags`, `isPublished`
- **Assets**: `type`, `tags`

## 🎯 Key Features

### 🔍 Advanced Search & Filtering
- Full-text search across multiple fields
- Category và tag filtering
- Status và role-based filtering
- Pagination support

### 📈 Analytics & Tracking
- View tracking cho posts
- Download tracking cho assets
- Usage tracking cho assets
- Login history cho users

### 🎫 Event Management
- Registration với payment tracking
- Attendee management
- Capacity limits
- Registration deadlines

### 👨‍🏫 Mentoring System
- Expert/member distinction
- Mentoring session tracking
- Expertise categorization
- Certification management

### ❓ FAQ System
- SEO optimization với keywords
- Feedback system
- Priority ordering
- Category organization

### 🖼️ Asset Management
- Metadata extraction
- Usage tracking across entities
- Thumbnail generation
- Download analytics

## 🛠️ Technical Details

### Database:
- **PostgreSQL** với Prisma ORM
- **Full relations** giữa các entities
- **Soft deletes** với validation
- **Audit trails** cho tracking changes

### Validation:
- **class-validator** cho input validation
- **DTO classes** cho type safety
- **Error handling** comprehensive
- **Business logic validation**

### Performance:
- **Pagination** cho tất cả list endpoints
- **Selective field loading** với Prisma select
- **Efficient queries** với proper indexing
- **Caching ready** với Redis support

## 🚀 Status: PRODUCTION READY

✅ **Database**: Schema updated và seeded
✅ **API Modules**: 8/8 modules hoàn chỉnh  
✅ **Endpoints**: 50+ endpoints functional
✅ **Validation**: Input validation hoàn chỉnh
✅ **Error Handling**: Comprehensive error responses
✅ **Authentication**: JWT-based security
✅ **Documentation**: API documentation complete

### 🎊 **API BACKEND HOÀN TOÀN ĐỒNG BỘ VỚI FRONTEND!**
