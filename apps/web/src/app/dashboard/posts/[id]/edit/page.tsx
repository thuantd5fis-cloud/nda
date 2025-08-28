'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { LoadingIcon, ErrorIcon, RocketIcon, TrashIcon, CharacterCountIcon, SettingsIcon, SearchIcon, ClipboardIcon, BulbIcon } from '@/components/icons';
import { useConfirm } from '@/hooks/use-confirm';
import { WorkflowActions } from '@/components/ui/workflow-actions';
import { EnhancedWorkflowActions } from '@/components/ui/enhanced-workflow-actions';
import { ApprovalDebugPanel } from '@/components/debug/approval-debug-panel';
import { useAuthStore } from '@/lib/stores/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';

interface PostFormData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'review' | 'rejected' | 'archived';
  categoryId: string;
  tags: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  views: number;
}

// Removed mock data - now using real API

// Mock data for existing post
const getMockPost = (id: string): PostFormData => ({
  id,
  title: 'Hướng dẫn Next.js 14 App Router cho người mới bắt đầu',
  content: `# Giới thiệu về Next.js 14

Next.js 14 đã ra mắt với nhiều tính năng mới hấp dẫn, đặc biệt là App Router - một cách tiếp cận hoàn toàn mới để xây dựng ứng dụng React.

## App Router là gì?

App Router là hệ thống routing mới của Next.js, được xây dựng dựa trên React Server Components và cung cấp:

- **Server Components**: Render trên server, giảm bundle size
- **Streaming**: Load nội dung theo từng phần
- **Suspense**: Better loading states
- **Nested Layouts**: Layout lồng nhau linh hoạt

## Cấu trúc thư mục

\`\`\`
app/
├── layout.tsx
├── page.tsx
├── about/
│   └── page.tsx
└── blog/
    ├── layout.tsx
    ├── page.tsx
    └── [slug]/
        └── page.tsx
\`\`\`

Mỗi thư mục trong \`app\` directory đại diện cho một route segment.

## Các tính năng chính

### 1. Server Components
Mặc định, tất cả components trong App Router đều là Server Components:

\`\`\`tsx
// app/page.tsx
export default function HomePage() {
  // Code này chạy trên server
  return <h1>Welcome to Next.js 14!</h1>
}
\`\`\`

### 2. Client Components
Khi cần interactivity, thêm 'use client' directive:

\`\`\`tsx
'use client'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
\`\`\`

### 3. Data Fetching
Fetch data trực tiếp trong Server Components:

\`\`\`tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
\`\`\`

## Kết luận

Next.js 14 với App Router mang đến trải nghiệm phát triển tuyệt vời với performance được cải thiện đáng kể. Hãy bắt đầu migration dự án của bạn ngay hôm nay!`,
  excerpt: 'Tìm hiểu về Next.js 14 App Router - hệ thống routing mới với Server Components, Streaming và nhiều tính năng powerful khác.',
  status: 'published',
  categoryId: '4',
  tags: ['Next.js', 'React', 'JavaScript', 'Web Development'],
  featuredImage: '/images/nextjs-14-hero.jpg',
  metaTitle: 'Next.js 14 App Router: Hướng dẫn đầy đủ cho người mới bắt đầu',
  metaDescription: 'Hướng dẫn chi tiết về Next.js 14 App Router, Server Components, data fetching và các best practices mới nhất.',
  slug: 'huong-dan-nextjs-14-app-router',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  author: 'Nguyễn Văn Dev',
  views: 1245,
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { confirmDelete, toast } = useConfirm();
  const { canSubmitForReview } = usePermissions();
  const { canSeeApprovalActions, debugInfo } = useEnhancedPermissions();
  const [formData, setFormData] = useState<PostFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Fetch real categories and tags  
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags({ limit: 1000 }),
  });

  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const availableTags = Array.isArray(tagsResponse?.data) ? tagsResponse.data : [];

  // Fetch post data using React Query
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', params.id],
    queryFn: () => apiClient.getPost(params.id as string),
    enabled: !!params.id,
  });

  if(post) {

  console.log('canSubmitForReview',post.status, canSubmitForReview({
    id: post.id,
    status: post.status,
      createdBy: post.createdBy,
      title: post.title
    }));
  }

  // Transform API data to form data when loaded
  useEffect(() => {
    if (post) {
      setFormData({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status.toLowerCase() as 'draft' | 'published' | 'review' | 'rejected' | 'archived',
        categoryId: post.postCategories.length > 0 ? post.postCategories[0].category.id : '',
        tags: post.postTags.map((pt: any) => pt.tag.name),
        featuredImage: post.featuredImage || '',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        slug: post.slug,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author?.fullName || 'Unknown',
        views: post._count.analyticsViews,
      });
    }
  }, [post]);

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    if (!formData) return;
    
    setFormData(prev => ({ ...prev!, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && value) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Remove multiple dashes
        .trim();
      setFormData(prev => ({ ...prev!, slug }));
    }
  };

  const handleTagToggle = (tag: string) => {
    if (!formData) return;
    
    setFormData(prev => ({
      ...prev!,
      tags: prev!.tags.includes(tag)
        ? prev!.tags.filter(t => t !== tag)
        : [...prev!.tags, tag]
    }));
  };

  const handleSubmit = async (status?: 'draft' | 'published' | 'review' | 'archived') => {
    if (!formData || !formData.title || !formData.content || !post) {
      toast.error('Vui lòng nhập tiêu đề và nội dung bài viết');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare update data for API
      const updateData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        status: (status || formData.status).toUpperCase(),
        slug: formData.slug,
        featuredImage: formData.featuredImage,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        categoryIds: formData.categoryId ? [formData.categoryId] : [],
        tagIds: formData.tags.map(tagName => {
          const tag = availableTags.find(t => t.name === tagName);
          return tag?.id;
        }).filter(Boolean) as string[],
      };
      
      // Real API call
      await apiClient.updatePost(post.id, updateData);
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      
      toast.success(`Bài viết đã được ${
        status === 'published' ? 'xuất bản' : 
        status === 'archived' ? 'lưu trữ' : 
        status === 'review' ? 'gửi duyệt' : 
        'cập nhật'
      } thành công!`);
      router.push(`/dashboard/posts/${post.id}`);
    } catch (error) {
      console.error('Update post error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = await confirmDelete(
      'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      {
        title: 'Xác nhận xóa bài viết'
      }
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    
    try {
      // Real API call
      await apiClient.deletePost(post.id);
      toast.success('Bài viết đã được xóa thành công!');
      router.push('/dashboard/posts');
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Có lỗi xảy ra khi xóa bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 mb-4 flex justify-center">
            <LoadingIcon className="w-12 h-12" />
          </div>
          <div className="text-lg font-medium text-gray-900">Đang tải bài viết...</div>
        </div>
      </div>
    );
  }

  if (error || !post || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-400 mb-4 flex justify-center">
            <ErrorIcon className="w-16 h-16" />
          </div>
          <div className="text-lg font-medium text-gray-900">
            {error ? 'Có lỗi xảy ra khi tải bài viết' : 'Không tìm thấy bài viết'}
          </div>
          <Button onClick={() => router.push('/dashboard/posts')} className="mt-4">
            ← Quay về danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header and Action Buttons */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 px-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
            <p className="text-gray-600 mt-2">
              Cập nhật nội dung và cài đặt cho bài viết của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              ← Quay lại
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              💾 Lưu thay đổi
            </Button>
             
            {/* Original conditional button */}
            {(() => {
              console.log('🐛 [DEBUG] Button visibility check:');
              console.log('🐛 post:', post);
              console.log('🐛 post.status:', post?.status);
              console.log('🐛 post.status === "DRAFT":', post?.status === 'DRAFT');
              console.log('🐛 post.status.toUpperCase() === "DRAFT":', post?.status.toUpperCase() === 'DRAFT');
              console.log('🐛 user:', user);
              
              const canSubmit = post ? canSubmitForReview({
                id: post.id,
                status: post.status,
                createdBy: post.createdBy,
                title: post.title
              }) : false;
              console.log('🐛 canSubmitForReview result:', canSubmit);
              
              // Try both uppercase and exact match
              const isDraftStatus = post && (post.status === 'DRAFT' || post.status.toUpperCase() === 'DRAFT');
              const shouldShow = isDraftStatus && canSubmit;
              console.log('🐛 isDraftStatus:', isDraftStatus);
              console.log('🐛 shouldShow button:', shouldShow);
              
              return shouldShow; // Restore original logic
            })() && (
              <Button
                variant="outline"
                onClick={() => handleSubmit('review')}
                disabled={isSubmitting}
                className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingIcon className="w-4 h-4" />
                    Đang gửi...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    📝 Gửi duyệt
                  </div>
                )}
              </Button>
            )}
            
            {/* Enhanced Workflow Actions - Role-based visibility */}
            {post && canSeeApprovalActions() && (
              <EnhancedWorkflowActions
                post={{
                  id: post.id,
                  status: post.status,
                  createdBy: post.createdBy,
                  title: post.title,
                }}
                currentUserId={user?.id}
                showDebugInfo={process.env.NODE_ENV === 'development'}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['post', post.id] });
                  queryClient.invalidateQueries({ queryKey: ['posts'] });
                }}
              />
            )}
            
            {/* Legacy Workflow Actions for comparison (development only) */}
            {process.env.NODE_ENV === 'development' && post && (
              <div className="opacity-50 border border-dashed border-gray-300 p-2 rounded">
                <div className="text-xs text-gray-500 mb-1">Legacy Actions:</div>
                <WorkflowActions
                  post={post}
                  currentUserId={user?.id}
                  compact={true}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['post', post.id] });
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

      {/* Enhanced Permissions Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔐 Enhanced Permissions Debug</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-yellow-700">
            <div>
              <div><strong>User Level:</strong> {debugInfo.userLevel}</div>
              <div><strong>Highest Role:</strong> {debugInfo.highestRole}</div>
              <div><strong>All Roles:</strong> {debugInfo.roles.join(', ') || 'None'}</div>
            </div>
            <div>
              <div><strong>Can See Approval Actions:</strong> {canSeeApprovalActions() ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Required Level:</strong> ≥ 5 (copy_editor+)</div>
              <div><strong>Excluded Roles:</strong> author, writer, contributor</div>
            </div>
          </div>
        </div>
      )}

      {/* Post Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-blue-600">ID: {formData.id}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">Tác giả: {formData.author}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">Lượt xem: {formData.views.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">
                Tạo: {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-sm text-blue-600">
                Sửa: {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <div className="flex items-center gap-2">
              <TrashIcon className="w-4 h-4" />
              Xóa bài viết
            </div>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="content"
          label="📝 Nội dung"
          isActive={activeTab === 'content'}
          onClick={setActiveTab}
        />
        <TabButton
          id="settings"
          label="⚙️ Cài đặt"
          isActive={activeTab === 'settings'}
          onClick={setActiveTab}
        />
        <TabButton
          id="seo"
          label="🔍 SEO"
          isActive={activeTab === 'seo'}
          onClick={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'content' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài viết *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="text-lg"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đường dẫn (Slug)
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    /posts/
                  </span>
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="duong-dan-bai-viet"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Viết tóm tắt ngắn gọn về bài viết..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài viết *
                </label>
                <div className="border border-gray-300 rounded-md">
                  {/* Toolbar */}
                  <div className="border-b border-gray-300 p-3 bg-gray-50 rounded-t-md">
                    <div className="flex items-center gap-2 text-sm">
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <strong>B</strong>
                      </button>
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <em>I</em>
                      </button>
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        🔗
                      </button>
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        📷
                      </button>
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        📋
                      </button>
                    </div>
                  </div>
                  
                  {/* Editor Area */}
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Bắt đầu viết nội dung bài viết của bạn..."
                    rows={20}
                    className="w-full p-4 border-0 focus:outline-none focus:ring-0 resize-none rounded-b-md font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Sử dụng Markdown để định dạng văn bản (TipTap editor sẽ được tích hợp trong phiên bản tiếp theo)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thẻ (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.tags.includes(tag.name)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {availableTags.length === 0 && (
                  <p className="text-sm text-gray-500">Đang tải tags...</p>
                )}
                {formData.tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Đã chọn: {formData.tags.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                {formData.featuredImage ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={formData.featuredImage}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <button
                        onClick={() => handleInputChange('featuredImage', '')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    </div>
                    <Input
                      value={formData.featuredImage}
                      onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                      placeholder="URL ảnh đại diện"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600">Click để chọn ảnh hoặc kéo thả vào đây</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                    <Input
                      type="url"
                      placeholder="Hoặc nhập URL ảnh"
                      className="mt-3"
                      onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <Input
                  value={formData.metaTitle || formData.title}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="Tiêu đề SEO (tối đa 60 ký tự)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.metaTitle || formData.title).length}/60 ký tự
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription || formData.excerpt}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Mô tả SEO (tối đa 160 ký tự)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.metaDescription || formData.excerpt).length}/160 ký tự
                </p>
              </div>

              {/* SEO Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem trước kết quả tìm kiếm
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.metaTitle || formData.title}
                  </div>
                  <div className="text-green-700 text-sm">
                    https://example.com/posts/{formData.slug}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.metaDescription || formData.excerpt}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái bài viết</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <div>
                  <div className="font-medium">Bản nháp</div>
                  <div className="text-sm text-gray-500">Lưu để chỉnh sửa sau</div>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="status"
                  value="review"
                  checked={formData.status === 'review'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <div>
                  <div className="font-medium">Chờ duyệt</div>
                  <div className="text-sm text-gray-500">Gửi cho editor duyệt</div>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <div>
                  <div className="font-medium">Đã xuất bản</div>
                  <div className="text-sm text-gray-500">Hiển thị công khai</div>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="status"
                  value="archived"
                  checked={formData.status === 'archived'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <div>
                  <div className="font-medium">Lưu trữ</div>
                  <div className="text-sm text-gray-500">Ẩn khỏi công khai</div>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số từ:</span>
                <span className="font-medium">
                  {formData.content.split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ký tự:</span>
                <span className="font-medium">{formData.content.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian đọc:</span>
                <span className="font-medium">
                  ~{Math.ceil(formData.content.split(/\s+/).filter(word => word.length > 0).length / 200)} phút
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tags:</span>
                <span className="font-medium">{formData.tags.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt xem:</span>
                <span className="font-medium">{formData.views.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tạo bài viết</div>
                <div className="text-gray-500">
                  {formData.createdAt ? new Date(formData.createdAt).toLocaleString('vi-VN') : 'N/A'}
                </div>
                <div className="text-gray-500">bởi {formData.author}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Cập nhật gần nhất</div>
                <div className="text-gray-500">
                  {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Debug Panel for Approval Issues */}
        {process.env.NODE_ENV === 'development' && post && (
          <ApprovalDebugPanel 
            post={post}
          />
        )}
      </div>
    </div>
  );
}
