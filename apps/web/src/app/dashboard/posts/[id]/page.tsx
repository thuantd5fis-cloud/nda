'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import {
  EyeIcon,
  FolderIcon,
  TagIcon,
  EditIcon,
  TrashIcon,
  ArrowLeftIcon,
  CommentIcon,
  SearchIcon,
  CharacterCountIcon,
  CheckIcon,
  PauseIcon,
  BanIcon,
} from '@/components/icons';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW' | 'REJECTED' | 'ARCHIVED';
  slug: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  updater?: {
    id: string;
    fullName: string;
  };
  postCategories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  postTags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    analyticsViews: number;
  };
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'spam';
  replies?: Comment[];
}

// Mock data
const getMockPost = (id: string): Post => ({
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

Next.js 14 với App Router mang đến trải nghiệm phát triển tuyệt vời với performance được cải thiện đáng kể. Hãy bắt đầu migration dự án của bạn ngay hôm nay!

---

**Tài liệu tham khảo:**
- [Next.js Official Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)`,
  excerpt: 'Tìm hiểu về Next.js 14 App Router - hệ thống routing mới với Server Components, Streaming và nhiều tính năng powerful khác.',
  status: 'PUBLISHED' as const,
  featuredImage: '/images/nextjs-14-hero.jpg',
  metaTitle: 'Next.js 14 App Router: Hướng dẫn đầy đủ cho người mới bắt đầu',
  metaDescription: 'Hướng dẫn chi tiết về Next.js 14 App Router, Server Components, data fetching và các best practices mới nhất.',
  slug: 'huong-dan-nextjs-14-app-router',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  publishedAt: '2024-01-16T09:00:00Z',
  author: {
    id: '2',
    fullName: 'Nguyễn Văn Dev',
    email: 'dev@example.com',
  },
  postCategories: [
    {
      category: {
        id: '4',
        name: 'Web Development',
      }
    }
  ],
  postTags: [
    { tag: { id: '1', name: 'Next.js' } },
    { tag: { id: '2', name: 'React' } },
    { tag: { id: '3', name: 'JavaScript' } },
    { tag: { id: '4', name: 'Web Development' } },
  ],
  _count: {
    analyticsViews: 1245,
  },
});

const getMockComments = (): Comment[] => [
  {
    id: '1',
    content: 'Bài viết rất hữu ích! Cảm ơn tác giả đã chia sẻ. Tôi đang học Next.js và bài này giúp tôi hiểu rõ hơn về App Router.',
    author: 'Trần Văn A',
    authorEmail: 'trana@example.com',
    createdAt: '2024-01-21T10:30:00Z',
    status: 'approved',
    replies: [
      {
        id: '1-1',
        content: 'Mình cũng thấy hay! Đặc biệt là phần giải thích về Server Components.',
        author: 'Lê Thị B',
        authorEmail: 'lethib@example.com',
        createdAt: '2024-01-21T11:00:00Z',
        status: 'approved',
      }
    ]
  },
  {
    id: '2',
    content: 'Có thể viết thêm về performance optimization trong Next.js 14 không ạ?',
    author: 'Nguyễn Văn C',
    authorEmail: 'nguyenc@example.com',
    createdAt: '2024-01-21T14:20:00Z',
    status: 'approved',
  },
  {
    id: '3',
    content: 'Code examples rất clear và dễ hiểu. Thumbs up! 👍',
    author: 'Phạm Thị D',
    authorEmail: 'phamd@example.com',
    createdAt: '2024-01-22T09:15:00Z',
    status: 'pending',
  },
];

const getStatusBadge = (status: Post['status']) => {
  const statusConfig = {
    PUBLISHED: { label: 'Đã xuất bản', color: 'bg-green-100 text-green-800' },
    DRAFT: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800' },
    REVIEW: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
    ARCHIVED: { label: 'Lưu trữ', color: 'bg-blue-100 text-blue-800' },
  };

  const config = statusConfig[status];
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

const getCommentStatusBadge = (status: Comment['status']) => {
  const statusConfig = {
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    spam: { label: 'Spam', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status];
  return (
    <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('content');
  const { confirmDelete, toast } = useConfirm();

  // Fetch post data using React Query
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', params.id],
    queryFn: () => apiClient.getPost(params.id as string),
    enabled: !!params.id,
  });

  // Debug post data
  if (post) {
    console.log('📄 Post data loaded:', post);
    console.log('🖼️ Featured image:', post.featuredImage);
    console.log('🔧 Post object keys:', Object.keys(post));
  }

  // TODO: implement real comments API when backend supports it
  const comments: Comment[] = []; // Temporarily empty until comments API is ready

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = await confirmDelete(
      'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      {
        title: 'Xác nhận xóa bài viết'
      }
    );

    if (!confirmed) return;

    try {
      await apiClient.deletePost(post.id);
      toast.success('Bài viết đã được xóa thành công!');
      router.push('/dashboard/posts');
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const handleCommentAction = (commentId: string, action: 'approve' | 'reject' | 'spam') => {
    // TODO: Implement comment status update API call
    console.log(`Comment ${commentId} action: ${action}`);
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string | React.ReactNode;
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Đang tải bài viết...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết bài viết</h1>
            <p className="text-gray-600 mt-2">
              Xem và quản lý nội dung bài viết của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/posts')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Danh sách bài viết
            </Button>
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <EditIcon className="w-4 h-4" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Post Meta */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
                {getStatusBadge(post.status)}
              </div>
              <p className="text-gray-600 text-lg">{post.excerpt}</p>
            </div>
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-32 h-20 object-cover rounded-lg ml-6"
                onLoad={() => {
                  console.log('🖼️ Detail page image loaded successfully:', post.featuredImage);
                }}
                onError={(e) => {
                  console.error('❌ Detail page image load error:', post.featuredImage);
                  console.error('❌ Error details:', e);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RVJST1I8L3RleHQ+PC9zdmc+';
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tác giả:</span>
              <div className="font-medium">{post.author.fullName}</div>
            </div>
            <div>
              <span className="text-gray-500">Danh mục:</span>
              <div className="font-medium">
                {post.postCategories.length > 0 
                  ? post.postCategories.map((pc: any) => pc.category.name).join(', ')
                  : 'Chưa phân loại'
                }
              </div>
            </div>
            <div>
              <span className="text-gray-500">Slug:</span>
              <div className="font-mono text-xs">{post.slug}</div>
            </div>
            <div>
              <span className="text-gray-500">ID:</span>
              <div className="font-mono text-xs">{post.id}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
            <div>
              <span className="text-gray-500">Tạo:</span>
              <div className="font-medium">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            <div>
              <span className="text-gray-500">Cập nhật:</span>
              <div className="font-medium">{new Date(post.updatedAt).toLocaleDateString('vi-VN')}</div>
            </div>
            {post.publishedAt && (
              <div>
                <span className="text-gray-500">Xuất bản:</span>
                <div className="font-medium">{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
            <div>
              <span className="text-gray-500">Lượt xem:</span>
              <div className="font-medium">{post._count.analyticsViews.toLocaleString()}</div>
            </div>
          </div>

          {post.postTags.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {post.postTags.map((pt: any) => (
                  <span key={pt.tag.id} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {pt.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-3xl font-bold text-gray-900">{post._count.analyticsViews.toLocaleString()}</p>
              </div>
              <div className="text-gray-400">
                <EyeIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danh mục</p>
                <p className="text-3xl font-bold text-blue-600">{post.postCategories.length}</p>
              </div>
              <div className="text-blue-400">
                <FolderIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tags</p>
                <p className="text-3xl font-bold text-green-600">{post.postTags.length}</p>
              </div>
              <div className="text-green-400">
                <TagIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ký tự</p>
                <p className="text-3xl font-bold text-purple-600">{post.content.length.toLocaleString()}</p>
              </div>
              <div className="text-purple-400">
                <CharacterCountIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <TabButton
            id="content"
            label={
              <div className="flex items-center gap-2">
                <CharacterCountIcon className="w-4 h-4" />
                Nội dung
              </div>
            }
            isActive={activeTab === 'content'}
            onClick={setActiveTab}
          />
          <TabButton
            id="comments"
            label={
              <div className="flex items-center gap-2">
                <CommentIcon className="w-4 h-4" />
                Bình luận ({comments.length})
              </div>
            }
            isActive={activeTab === 'comments'}
            onClick={setActiveTab}
          />
          <TabButton
            id="seo"
            label={
              <div className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                SEO
              </div>
            }
            isActive={activeTab === 'seo'}
            onClick={setActiveTab}
          />
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n/g, '<br>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 mt-4">$1</h3>')
                    .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    .replace(/^\*(.*)\*/gim, '<em>$1</em>')
                    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$2</code></pre>')
                    .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
                    .replace(/^\[([^\]]+)\]\(([^)]+)\)$/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
                }}
              />
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{comment.author.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{comment.author}</div>
                        <div className="text-sm text-gray-500">{comment.authorEmail}</div>
                      </div>
                      {getCommentStatusBadge(comment.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCommentAction(comment.id, 'approve')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Duyệt"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCommentAction(comment.id, 'reject')}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Từ chối"
                        >
                          <PauseIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCommentAction(comment.id, 'spam')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Đánh dấu spam"
                        >
                          <BanIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-700 mb-3">{comment.content}</div>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{reply.author}</span>
                              {getCommentStatusBadge(reply.status)}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">{reply.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
                <div className="text-gray-400 mb-4 flex justify-center">
                  <CommentIcon className="w-16 h-16" />
                </div>
                <div className="text-lg font-medium text-gray-900 mb-2">Chưa có bình luận</div>
                <div className="text-gray-500">
                  Bài viết này chưa có bình luận nào từ người đọc
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin SEO</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {post.metaTitle || post.title}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(post.metaTitle || post.title).length}/60 ký tự
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border font-mono text-sm">
                    /posts/{post.slug}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {post.metaDescription || post.excerpt}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(post.metaDescription || post.excerpt).length}/160 ký tự
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xem trước kết quả tìm kiếm
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {post.metaTitle || post.title}
                </div>
                <div className="text-green-700 text-sm">
                  https://example.com/posts/{post.slug}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {post.metaDescription || post.excerpt}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Phân tích SEO</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-sm">Có Meta Title</span>
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-sm">Có Meta Description</span>
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-sm">URL thân thiện</span>
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <span className="text-sm">Có ảnh đại diện</span>
                  <span className="text-yellow-600">{post.featuredImage ? '✅' : '⚠️'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
