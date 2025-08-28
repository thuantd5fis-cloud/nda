'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { ArrowLeftIcon, PauseIcon, PlayIcon, EditIcon, TrashIcon, LoadingIcon, ErrorIcon } from '@/components/icons';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  bio?: string;
  position?: string;
  organization?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  lastLoginAt?: string;
  loginCount?: number;
  createdAt: string;
  updatedAt: string;
  userRoles: Array<{
    role: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  posts?: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    _count: {
      analyticsViews: number;
    };
  }>;
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin', 
  editor: 'Editor',
  author: 'Author',
  moderator: 'Moderator',
  viewer: 'Viewer',
};

// Mock data for user detail
const getMockUser = (id: string): User => ({
  id,
  email: 'nguyenvana@example.com',
  fullName: 'Nguyễn Văn A',
  phone: '0901234567',
  avatar: '/images/users/user-1.jpg',
  roles: ['editor', 'author'],
  isActive: true,
  emailVerified: true,
  twoFactorEnabled: false,
  bio: 'Là một developer với 5 năm kinh nghiệm trong phát triển web và mobile apps. Đam mê công nghệ mới và luôn sẵn sàng học hỏi. Thích chia sẻ kiến thức và tham gia các dự án mã nguồn mở.',
  position: 'Senior Developer',
  organization: 'Tech Company Ltd',
  website: 'https://nguyenvana.dev',
  linkedin: 'https://linkedin.com/in/nguyenvana',
  twitter: 'https://twitter.com/nguyenvana',
  github: 'https://github.com/nguyenvana',
  lastLogin: '2024-01-20T15:30:00Z',
  loginCount: 127,
  postsCount: 23,
  posts: [
    {
      id: '1',
      title: 'Hướng dẫn Next.js 14 App Router',
      status: 'published',
      createdAt: '2024-01-15T10:30:00Z',
      _count: { analyticsViews: 1245 },
    },
    {
      id: '2', 
      title: 'React Server Components Best Practices',
      status: 'draft',
      createdAt: '2024-01-10T14:20:00Z',
      _count: { analyticsViews: 0 },
    },
    {
      id: '3',
      title: 'TypeScript Advanced Patterns',
      status: 'published', 
      createdAt: '2024-01-05T09:15:00Z',
      _count: { analyticsViews: 892 },
    },
    {
      id: '4',
      title: 'State Management with Zustand',
      status: 'review',
      createdAt: '2024-01-02T16:45:00Z',
      _count: { analyticsViews: 0 },
    },
  ],
  loginHistory: [
    {
      id: '1',
      timestamp: '2024-01-20T15:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Hà Nội, Việt Nam',
      success: true,
    },
    {
      id: '2',
      timestamp: '2024-01-20T09:15:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Hà Nội, Việt Nam',
      success: true,
    },
    {
      id: '3',
      timestamp: '2024-01-19T18:45:00Z',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      location: 'TP.HCM, Việt Nam',
      success: false,
    },
    {
      id: '4',
      timestamp: '2024-01-19T14:20:00Z',
      ipAddress: '192.168.1.100', 
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Hà Nội, Việt Nam',
      success: true,
    },
  ],
  createdAt: '2023-06-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
});

const getStatusBadge = (status: string) => {
  const statusConfig = {
    published: { label: 'Đã xuất bản', color: 'bg-green-100 text-green-800' },
    draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800' },
    review: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { confirmDelete, confirmWarning, toast } = useConfirm();

  // Fetch user data using React Query
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', params.id],
    queryFn: () => apiClient.getUser(params.id as string),
    enabled: !!params.id,
  });

  const handleDelete = async () => {
    if (!user) return;
    
    const postsCount = user.posts?.length || 0;
    if (postsCount > 0) {
      toast.error(`Không thể xóa người dùng này vì còn ${postsCount} bài viết. Vui lòng chuyển nhượng hoặc xóa các bài viết trước.`);
      return;
    }

    const confirmed = await confirmDelete(
      `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`,
      {
        title: 'Xác nhận xóa người dùng'
      }
    );

    if (!confirmed) return;

    try {
      await apiClient.deleteUser(user.id);
      toast.success('Người dùng đã được xóa thành công!');
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = user.status === 'ACTIVE' ? 'vô hiệu hóa' : 'kích hoạt';
    
    const confirmed = await confirmWarning(
      `Bạn có chắc chắn muốn ${action} tài khoản này?`,
      {
        title: `Xác nhận ${action} tài khoản`,
        confirmText: action === 'vô hiệu hóa' ? 'Vô hiệu hóa' : 'Kích hoạt'
      }
    );

    if (confirmed) {
      try {
        await apiClient.updateUser(user.id, { status: newStatus });
        toast.success(`Tài khoản đã được ${action} thành công!`);
        // Refetch data to get latest state
        window.location.reload();
      } catch (error) {
        console.error('Toggle user status error:', error);
        toast.error(`Có lỗi xảy ra khi ${action} tài khoản`);
      }
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
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium text-gray-900">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-900">
            {error ? 'Có lỗi xảy ra khi tải thông tin người dùng' : 'Không tìm thấy người dùng'}
          </div>
          <Button onClick={() => router.push('/dashboard/users')} className="mt-4">
            ← Quay về danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết người dùng</h1>
          <p className="text-gray-600 mt-2">
            Xem thông tin chi tiết và quản lý tài khoản người dùng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Danh sách người dùng
          </Button>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600 gap-2"
              title={user.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
            >
              {user.status === 'ACTIVE' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              {user.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </Button>
            <Link href={`/dashboard/users/${user.id}/edit`}>
              <Button 
                variant="outline"
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600 gap-2"
                title="Chỉnh sửa"
              >
                <EditIcon className="w-4 h-4" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={(user.posts?.length || 0) > 0}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-600 gap-2"
              title="Xóa"
            >
              <TrashIcon className="w-4 h-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-full h-full rounded-full object-cover"
                onLoad={() => {
                  console.log('🖼️ Avatar loaded successfully:', user.avatar);
                }}
                onError={(e) => {
                  console.error('❌ Avatar load error:', user.avatar);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              user.fullName.charAt(0)
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'ACTIVE' ? '✅ Kích hoạt' : '❌ Vô hiệu hóa'}
                  </span>
                  {user.emailVerified && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      ✓ Đã xác thực
                    </span>
                  )}
                </div>
                <div className="text-gray-600 mb-3">
                  <div className="flex items-center gap-4">
                    <span>📧 {user.email}</span>
                    {user.phone && <span>📱 {user.phone}</span>}
                  </div>
                  {user.position && user.organization && (
                    <div className="flex items-center gap-2 mt-1">
                      <span>💼 {user.position} tại {user.organization}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.userRoles.map(userRole => (
                    <span key={userRole.role.id} className="inline-flex px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {roleLabels[userRole.role.name] || userRole.role.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <div>ID: {user.id}</div>
                <div>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
                <div>Đăng nhập cuối: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN') : 'Chưa có'}</div>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            {(user.website || user.linkedin || user.twitter || user.github) && (
              <div className="mt-4 flex items-center gap-4">
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:text-blue-800">
                    🌐 Website
                  </a>
                )}
                {user.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800">
                    💼 LinkedIn
                  </a>
                )}
                {user.twitter && (
                  <a href={user.twitter} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800">
                    🐦 Twitter
                  </a>
                )}
                {user.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800">
                    🐱 GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bài viết</p>
              <p className="text-3xl font-bold text-gray-900">{user.posts?.length || 0}</p>
            </div>
            <div className="text-2xl">📝</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đăng nhập</p>
              <p className="text-3xl font-bold text-blue-600">{user.loginCount || 0}</p>
            </div>
            <div className="text-2xl">🔑</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vai trò</p>
              <p className="text-3xl font-bold text-green-600">{user.userRoles.length}</p>
            </div>
            <div className="text-2xl">👤</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">2FA</p>
              <p className={`text-3xl font-bold ${user.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                {user.twoFactorEnabled ? '✓' : '✗'}
              </p>
            </div>
            <div className="text-2xl">🔒</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="overview"
          label="📊 Tổng quan"
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="posts"
          label={`📝 Bài viết (${user.posts?.length || 0})`}
          isActive={activeTab === 'posts'}
          onClick={setActiveTab}
        />
        <TabButton
          id="activity"
          label="🔒 Hoạt động"
          isActive={activeTab === 'activity'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email xác thực:</span>
                <span className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Xác thực 2 yếu tố:</span>
                <span className={`font-medium ${user.twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {user.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái tài khoản:</span>
                <span className={`font-medium ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status === 'ACTIVE' ? 'Kích hoạt' : 'Vô hiệu hóa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tham gia:</span>
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật cuối:</span>
                <span className="font-medium">{new Date(user.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vai trò & Quyền hạn</h3>
            <div className="space-y-3">
              {user.userRoles.map(userRole => {
                const role = userRole.role.name;
                const roleInfo = {
                  super_admin: { label: 'Super Admin', desc: 'Toàn quyền hệ thống', color: 'bg-red-100 text-red-800' },
                  admin: { label: 'Admin', desc: 'Quyền quản trị', color: 'bg-orange-100 text-orange-800' },
                  editor: { label: 'Editor', desc: 'Chỉnh sửa nội dung', color: 'bg-blue-100 text-blue-800' },
                  author: { label: 'Author', desc: 'Tạo nội dung', color: 'bg-green-100 text-green-800' },
                  moderator: { label: 'Moderator', desc: 'Kiểm duyệt', color: 'bg-purple-100 text-purple-800' },
                  viewer: { label: 'Viewer', desc: 'Chỉ xem', color: 'bg-gray-100 text-gray-800' },
                }[role] || { label: role, desc: '', color: 'bg-gray-100 text-gray-800' };

                return (
                  <div key={userRole.role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{roleInfo.label}</div>
                      <div className="text-sm text-gray-500">{roleInfo.desc}</div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bài viết của {user.fullName}</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(user.posts || []).map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post._count.analyticsViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/posts/${post.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁️ Xem
                        </Link>
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          ✏️ Sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(user.posts?.length || 0) === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết</div>
              <div className="text-gray-500">Người dùng này chưa tạo bài viết nào</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lịch sử đăng nhập</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user.loginHistory.map((login) => (
                  <tr key={login.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(login.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {login.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.location || 'Không xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.userAgent.includes('Mobile') ? '📱 Mobile' : '🖥️ Desktop'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        login.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {login.success ? '✅ Thành công' : '❌ Thất bại'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
