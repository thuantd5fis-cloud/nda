Bạn là **Senior Full-Stack Engineer**. Hãy tạo một **CMS chuẩn production** theo mô tả tính năng ở phần “YÊU CẦU CHỨC NĂNG (GIỮ NGUYÊN TEXT)” bên dưới.

## Tech stack (mặc định – có thể giữ nguyên)
- **Frontend**: Next.js 14 (App Router, TypeScript), Shadcn, React Query/TanStack Query, Zustand (state nhẹ), i18n (next-intl), form với `react-hook-form`.
- **Backend**: NestJS (TypeScript), REST API, class-validator, Swagger.
- **Auth**: JWT (access/refresh), RBAC theo vai trò.
- **DB**: PostgreSQL + Prisma ORM.
- **Storage**: Local + adapter S3 (tùy biến). Upload qua presigned URL.
- **Media**: Sharp (image optimize), ffmpeg (nếu cần preview video), PDF/Audio preview.
- **Logs/Audit**: Bảng audit_trails + middleware ghi lịch sử thay đổi.
- **Testing**: Vitest/Jest + Playwright (smoke E2E).
- **CI**: Dockerfile + docker-compose + GitHub Actions (lint, test, migrate).
- **Others**: ESLint, Prettier, Husky, Commitlint.
## Kiến trúc & Deliverables
1. **Monorepo** (pnpm):
apps/
web/ # Next.js (admin UI)
api/ # NestJS (REST)
packages/
ui/ # components dùng chung
config/ # eslint, tsconfig, types
2. **Seeder** dữ liệu mẫu: 3 user (admin, editor, viewer), 5 category, 10 tag, 10 post, 5 asset, 3 event, 5 FAQ.
3. **Swagger** cho toàn bộ API tại `/api/docs`.
4. **RBAC** 6 vai trò: `super_admin`, `admin`, `editor`, `author`, `moderator`, `viewer`.
5. **Audit log** mọi thao tác CRUD có lưu “ai – khi nào – trước/sau”.
6. **Migration & Run**
- `pnpm i`
- cấu hình `.env` (DB_URL, JWT_SECRET, MINIO_*)
- `pnpm -w run dev` (web + api)
7. **Testing**: ít nhất 10 test API (posts, auth, assets) + 3 test E2E (login, tạo post, phân quyền).
## Schema dữ liệu (Prisma – tóm tắt)
- `User(id, email, password_hash, full_name, status, createdAt, updatedAt)`
- `Role(id, name)` — `UserRole(userId, roleId)`
- `Session(id, userId, ip, userAgent, createdAt, expiresAt)`
- `Permission(id, resource, action)` — `RolePermission(roleId, permissionId)` (tuỳ chọn nếu cần fine-grained)
- `Category(id, name, slug, parentId?, metaTitle?, metaDescription?, openGraph?, locale, createdAt, updatedAt)`
- `Tag(id, name, slug, createdAt)`
- `Post(id, title, slug, excerpt, content, status[DRAFT|REVIEW|PUBLISHED|REJECTED|ARCHIVED], allowComments, isFeatured, requireLogin, type, locale, publishedAt, createdBy, updatedBy, metaTitle?, metaDescription?, keywords?, openGraph?)`
  - `PostCategory(postId, categoryId)`, `PostTag(postId, tagId)`
- `Asset(id, type[image|video|file|audio|pdf], filename, path, size, width?, height?, duration?, optimized, createdBy, createdAt, updatedAt)`
- `Member(id, crmId?, fullName, email?, phone?, org?, degreeTitle?, position?, bio?, avatarAssetId?, createdAt, updatedAt)`
- `Expert(id, memberId, specialties?, publications?, …)`
- `Event(id, title, content, startAt, endAt, location, countdownAt?, createdAt, updatedAt)`
- `FAQ(id, question, answer, order, createdAt, updatedAt)`
- `AuditTrail(id, userId, entity, entityId, action, beforeJson, afterJson, createdAt)`
- `AnalyticsView(id, entity, entityId, date, views)` (điểm tích hợp Google Analytics)
## API endpoints (REST – ví dụ)
- **Auth**: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.
- **Users/Roles**: CRUD `/users`, `/roles`, `/permissions`; đổi mật khẩu, khoá tài khoản.

- **Posts**
  - `GET /posts` (filter: status, category, tag, q, date range, locale, type, pagination)
  - `POST /posts` | `PUT /posts/:id` | `DELETE /posts/:id`
  - `POST /posts/:id/submit-review`, `POST /posts/:id/publish`, `POST /posts/:id/reject`, `POST /posts/:id/archive`
  - **History**: `GET /posts/:id/history`

- **Categories**: CRUD, hỗ trợ cây parent/child, đa ngôn ngữ (`locale`).
- **Tags**: CRUD + `GET /tags/suggest?q=…` (auto-suggest).

- **Assets**
  - `POST /assets/presign` (S3), `POST /assets` (local)
  - `GET /assets?view=grid|list&tab=image|video|audio|pdf|file`
  - Batch: `POST /assets/batch-delete`, `POST /assets/batch-move`, `POST /assets/batch-rename`, `POST /assets/batch-download` (ZIP)
  - Preview: optimize ảnh (Sharp), thumbnail video, PDF first-page

- **Members/Experts**
  - `POST /crm/sync` (mock đồng bộ từ CRM)
  - `CRUD /members`, `CRUD /experts`

- **Events**
  - `CRUD /events` + trường `countdownAt` (đếm ngược phía FE)

- **Analytics**
  - Hook tích hợp GA; `GET /analytics/summary?from=&to=`

- **FAQ**: CRUD `/faqs`.
## Admin UI (Next.js +shadcn)
- **Đăng nhập/đăng xuất**, quản lý phiên, timeout.
- **Dashboard**: thẻ thống kê (bài viết, danh mục, tag, sự kiện, người dùng), biểu đồ cột & tròn (Chart.js/ECharts), biểu đồ truy cập theo giờ/ngày.
- **Bài viết**: list + bộ lọc; trang tạo/sửa (Rich Text Editor – tiptap/quill), SEO fields (Meta title/description, keywords, Open Graph), các flag (allow comments, featured, require login), chọn **loại bài viết**, **danh mục**, **tag**, lịch sử trạng thái; workflow Draft → Review → Published/Rejected → Archived.
- **Danh mục**: cây parent/child, SEO fields, đa ngôn ngữ.
- **Tag**: list + autosuggest khi gõ.
- **Tài nguyên**: grid/list, phóng to ảnh/video, xem trước PDF/âm thanh, tabs theo loại; **batch actions** (xoá/di chuyển/tải về/đổi tên/ZIP); **tự động optimize ảnh/video** nếu quá lớn.
- **Hội viên/Chuyên gia**: đồng bộ từ CRM; form thông tin cá nhân, học hàm học vị, đơn vị công tác.
- **Sự kiện/Hoạt động**: CRUD + thời gian, địa điểm, **đếm ngược** tới `countdownAt`.
- **Báo cáo thống kê**: lượt truy cập, lượt xem bài viết theo ngày/tháng/năm; thống kê nội dung (bài viết/hoạt động/sự kiện); trường cấu hình Google Analytics ID.
- **Xác thực & Phân quyền**: CRUD tài khoản; RBAC **6 vai trò**; cấu hình **Session timeout** và **chính sách mật khẩu mạnh**.
- **FAQ**: CRUD + order kéo-thả.
## Validation & Bảo mật
- Mật khẩu: tối thiểu 8 ký tự, gồm chữ hoa/thường/số/ký tự đặc biệt.
- Ratelimit đăng nhập, lock tạm nếu sai quá 5 lần/15 phút.
- CSRF (nếu dùng cookie), CORS cấu hình domain.
- XSS sanitize nội dung rich-text (DOMPurify server-side).
- RBAC guard tất cả route; phân quyền theo resource/action.
- Lưu **history** & **audit** cho các entity chính.

## YÊU CẦU CHỨC NĂNG (GIỮ NGUYÊN TEXT)
CMS

QUẢN LÝ BÀI VIẾT
Tạo/sửa/xóa bài viết với Rich Text Editor
List bài viết
SEO: Meta title/description, keywords
Cài đặt: Cho phép bình luận, bài nổi bật, yêu cầu đăng nhập
Quy trình: Draft → Review → Published/Rejected → Archived
Bài viết phải chỉ được theo loại bài viết và danh mục bài viết, theo tag
Có lịch sử thay đổi trạng thái

QUẢN LÝ DANH MỤC
Tạo/sửa/xóa danh mục có cấp bậc (parent/child)
List danh mục
SEO: Meta title/description, keywords, Open Graph
Cho phép thêm nội dung đa ngôn ngữ ví dụ: tiếng anh

QUẢN LÝ TAG
Tạo/sửa/xóa tags với auto-suggest
List tag

QUẢN LÝ TÀI NGUYÊN
Tạo/Sửa/Xóa tài nguyên (Hình ảnh, Video, file ..etc)
Tự động Optimized ảnh, video nếu kích thước quá lớn
Xem dạng lưới/danh sách, phóng to ảnh/video, xem trước PDF/âm thanh, phân loại theo tab
Chọn nhiều file cùng lúc, xóa/di chuyển/tải về/đổi tên hàng loạt, xuất file ZIP

QUẢN LÝ HỘI VIÊN/CHUYÊN GIA
Đồng bộ Hội viên từ CRM
Tạo/sửa/xóa chuyên gia,
Chuyên gia bao gồm Thông tin cá nhân, học hàm học vị, đơn vị công tác

QUẢN LÝ SỰ KIỆN, HOẠT ĐỘNG
Tạo/Sửa/xóa sự kiện hoạt động
List danh sách sự kiện hoạt động
Thông tin về sự kiện: như nội dung, ngày giờ, địa điểm
Cho phép set đếm ngược đến ngày xảy ra sự kiện

BÁO CÁO THỐNG KÊ
Thống kê lượt truy cập, lượt xem bài viết theo ngày/tháng năm
Thống kê nội dung: bài viết, hoạt động, sự kiện…
Có thể add google analytic

QUẢN LÝ XÁC THỰC & PHÂN QUYỀN
Quản lý tài khoản
Quản lý phiên đăng nhập
Quản lý phân quyền
CRUD tài khoản admin và phân quyền RBAC cho 6 vai trò
Session timeout và chính sách mật khẩu mạnh

QUẢN LÝ FAQ
Tạo/Sửa/Xóa FAQ
List FAQ

## Tiêu chí hoàn thành
- Chạy được bằng docker-compose, có seeder, đăng nhập được bằng `admin@example.com / Admin@123`.
- Tạo/sửa/xóa được Post với đủ workflow + lịch sử.
- Upload ảnh lớn tự động optimize; xem trước PDF/âm thanh; batch ZIP ok.
- RBAC hoạt động đúng 6 vai trò; session timeout cấu hình được.
- Trang báo cáo hiển thị dữ liệu mẫu + có trường cấu hình GA ID.

**Hãy bắt đầu scaffold mã nguồn, sinh các tệp cần thiết, và giải thích ngắn gọn các bước chạy trong README.**
