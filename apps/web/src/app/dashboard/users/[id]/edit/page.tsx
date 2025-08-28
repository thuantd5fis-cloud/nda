'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface UserFormData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  bio: string;
  position: string;
  organization: string;
  website: string;
  linkedin: string;
  twitter: string;
  github: string;
  lastLogin: string;
  loginCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

const availableRoles = [
  { value: 'super_admin', label: 'Super Admin', description: 'Toàn quyền hệ thống' },
  { value: 'admin', label: 'Admin', description: 'Quyền quản trị' },
  { value: 'editor', label: 'Editor', description: 'Chỉnh sửa và quản lý nội dung' },
  { value: 'author', label: 'Author', description: 'Tạo nội dung' },
  { value: 'moderator', label: 'Moderator', description: 'Kiểm duyệt nội dung' },
  { value: 'viewer', label: 'Viewer', description: 'Chỉ xem' },
];

// Mock data for existing user
const getMockUser = (id: string): UserFormData => ({
  id,
  email: 'nguyenvana@example.com',
  fullName: 'Nguyễn Văn A',
  phone: '0901234567',
  avatar: '/images/users/user-1.jpg',
  roles: ['editor', 'author'],
  isActive: true,
  emailVerified: true,
  twoFactorEnabled: false,
  bio: 'Là một developer với 5 năm kinh nghiệm trong phát triển web và mobile apps. Đam mê công nghệ mới và luôn sẵn sàng học hỏi.',
  position: 'Senior Developer',
  organization: 'Tech Company Ltd',
  website: 'https://nguyenvana.dev',
  linkedin: 'https://linkedin.com/in/nguyenvana',
  twitter: 'https://twitter.com/nguyenvana',
  github: 'https://github.com/nguyenvana',
  lastLogin: '2024-01-20T15:30:00Z',
  loginCount: 127,
  postsCount: 23,
  createdAt: '2023-06-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
});

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { confirmWarning, toast } = useConfirm();
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch user data using React Query
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', params.id],
    queryFn: () => apiClient.getUser(params.id as string),
    enabled: !!params.id,
  });

  // Transform API data to form data when loaded
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || '',
        avatar: user.avatar || '',
        roles: user.userRoles?.map(ur => ur.role.name) || [],
        isActive: user.status === 'ACTIVE',
        emailVerified: user.emailVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        bio: user.bio || '',
        position: user.position || '',
        organization: user.organization || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        github: user.github || '',
        lastLogin: user.lastLoginAt || '',
        loginCount: user.loginCount || 0,
        postsCount: user._count?.posts || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [field]: value }));
  };

  const handleRoleToggle = (role: string) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      roles: prev!.roles.includes(role)
        ? prev!.roles.filter(r => r !== role)
        : [...prev!.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.email || !formData.fullName) {
      alert('Vui lòng nhập email và họ tên');
      return;
    }

    if (formData.roles.length === 0) {
      alert('Vui lòng chọn ít nhất một vai trò');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const userData = { 
        ...formData,
        updatedAt: new Date().toISOString()
      };
      console.log('Updating user:', userData);
      
      // Real API call
      const updatedUser = await apiClient.updateUser(user!.id, {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        avatar: formData.avatar,
        bio: formData.bio,
        position: formData.position,
        organization: formData.organization,
        website: formData.website,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        github: formData.github,
        status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
      });
      
      console.log('✅ User updated successfully:', updatedUser);
      alert('Thông tin người dùng đã được cập nhật thành công!');
      router.push('/dashboard/users');
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    if (formData.postsCount > 0) {
      alert(`Không thể xóa người dùng này vì còn ${formData.postsCount} bài viết. Vui lòng chuyển nhượng hoặc xóa các bài viết trước.`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${formData.fullName}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Real API call
      await apiClient.deleteUser(user!.id);
      console.log('✅ User deleted successfully');
      alert('Người dùng đã được xóa thành công!');
      router.push('/dashboard/users');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData) return;
    
    const confirmed = await confirmWarning(
      'Bạn có chắc chắn muốn reset mật khẩu cho người dùng này?',
      {
        title: 'Xác nhận reset mật khẩu',
        confirmText: 'Reset'
      }
    );

    if (confirmed) {
      try {
        // Real API call
        await apiClient.resetUserPassword(user!.id);
        console.log('✅ Password reset successfully');
        toast.success('Mật khẩu mới đã được gửi qua email!');
      } catch (error) {
        toast.error('Có lỗi xảy ra khi reset mật khẩu');
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

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-900">Không tìm thấy người dùng</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin và quyền hạn người dùng
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
            onClick={handleResetPassword}
            disabled={isSubmitting}
          >
            🔑 Reset mật khẩu
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isSubmitting || formData.postsCount > 0}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Xóa người dùng
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {formData.fullName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-blue-900">{formData.fullName}</div>
                <div className="text-sm text-blue-600">{formData.email}</div>
              </div>
            </div>
            <div className="text-sm text-blue-600 space-y-1">
              <div>ID: {formData.id}</div>
              <div>Bài viết: {formData.postsCount}</div>
              <div>Đăng nhập: {formData.loginCount} lần</div>
            </div>
            <div className="text-sm text-blue-600 space-y-1">
              <div>Tạo: {new Date(formData.createdAt).toLocaleDateString('vi-VN')}</div>
              <div>Sửa: {new Date(formData.updatedAt).toLocaleDateString('vi-VN')}</div>
              <div>Đăng nhập cuối: {new Date(formData.lastLogin).toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="basic"
          label="👤 Thông tin cơ bản"
          isActive={activeTab === 'basic'}
          onClick={setActiveTab}
        />
        <TabButton
          id="roles"
          label="🔐 Vai trò & Quyền"
          isActive={activeTab === 'roles'}
          onClick={setActiveTab}
        />
        <TabButton
          id="profile"
          label="📝 Hồ sơ"
          isActive={activeTab === 'profile'}
          onClick={setActiveTab}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'basic' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Thay đổi email có thể ảnh hưởng đến đăng nhập
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0901234567"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ
                  </label>
                  <Input
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Developer, Manager, ..."
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổ chức
                </label>
                <Input
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Tên công ty hoặc tổ chức"
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1"
                  />
                  {formData.avatar && (
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Giới thiệu về người dùng..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vai trò & Quyền hạn</h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Chọn vai trò cho người dùng. Một người dùng có thể có nhiều vai trò.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRoles.map(role => (
                    <label
                      key={role.value}
                      className={`
                        flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${formData.roles.includes(role.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role.value)}
                        onChange={() => handleRoleToggle(role.value)}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Cài đặt bảo mật</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.emailVerified}
                      onChange={(e) => handleInputChange('emailVerified', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium">Email đã xác thực</div>
                      <div className="text-sm text-gray-500">Đánh dấu email đã được xác thực</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorEnabled}
                      onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium">Bật xác thực 2 yếu tố</div>
                      <div className="text-sm text-gray-500">Yêu cầu 2FA khi đăng nhập</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Liên kết mạng xã hội</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌐 Website
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💼 LinkedIn
                  </label>
                  <Input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🐦 Twitter
                  </label>
                  <Input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🐱 GitHub
                  </label>
                  <Input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái tài khoản</h3>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div>
                <div className="font-medium">Kích hoạt tài khoản</div>
                <div className="text-sm text-gray-500">Cho phép đăng nhập</div>
              </div>
            </label>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số bài viết:</span>
                <span className="font-medium">{formData.postsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đăng nhập:</span>
                <span className="font-medium">{formData.loginCount} lần</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email verified:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  formData.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {formData.emailVerified ? 'Có' : 'Không'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">2FA:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  formData.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.twoFactorEnabled ? 'Bật' : 'Tắt'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Thao tác</h3>
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? '⏳ Đang cập nhật...' : '✅ Cập nhật người dùng'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/users')}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Warning */}
          {formData.postsCount > 0 && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Lưu ý</h3>
              <p className="text-sm text-yellow-800">
                Người dùng này có {formData.postsCount} bài viết. Không thể xóa cho đến khi chuyển nhượng hoặc xóa tất cả bài viết.
              </p>
            </div>
          )}

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tham gia</div>
                <div className="text-gray-500">
                  {new Date(formData.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Cập nhật gần nhất</div>
                <div className="text-gray-500">
                  {new Date(formData.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Đăng nhập cuối</div>
                <div className="text-gray-500">
                  {new Date(formData.lastLogin).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
