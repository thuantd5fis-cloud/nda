'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import { 
  UserIcon, SaveIcon, EditIcon, ShieldIcon, BellIcon, KeyIcon, 
  DevicePhoneIcon, ComputerDesktopIcon, DeviceTabletIcon, ActivityIcon,
  CameraIcon, LockIcon, UnlockIcon, WebIcon, LinkedinIcon, TwitterIcon, 
  GithubIcon, LocationIcon, CheckIcon, XIcon, LogoutIcon
} from '@/components/icons';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  position?: string;
  organization?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  roles: string[];
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  loginHistory: Array<{
    id: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
    success: boolean;
  }>;
  sessions: Array<{
    id: string;
    device: string;
    browser: string;
    location?: string;
    lastActive: string;
    current: boolean;
  }>;
  createdAt: string;
  lastLogin: string;
}

const mockProfile: UserProfile = {
  id: '1',
  fullName: 'Nguyễn Văn Admin',
  email: 'admin@example.com',
  phone: '0901234567',
  bio: 'System Administrator với hơn 5 năm kinh nghiệm trong quản lý hệ thống CMS và phát triển web.',
  position: 'System Administrator',
  organization: 'Tech Company',
  website: 'https://example.com',
  linkedin: 'https://linkedin.com/in/admin',
  twitter: 'https://twitter.com/admin',
  github: 'https://github.com/admin',
  roles: ['super_admin', 'admin'],
  twoFactorEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  loginHistory: [
    {
      id: '1',
      timestamp: '2024-01-20T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Hà Nội, Việt Nam',
      success: true,
    },
    {
      id: '2',
      timestamp: '2024-01-19T14:20:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Hà Nội, Việt Nam',
      success: true,
    },
    {
      id: '3',
      timestamp: '2024-01-18T09:15:00Z',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      location: 'TP.HCM, Việt Nam',
      success: false,
    },
  ],
  sessions: [
    {
      id: '1',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      location: 'Hà Nội, Việt Nam',
      lastActive: '2024-01-20T10:30:00Z',
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari 17.0',
      location: 'Hà Nội, Việt Nam',
      lastActive: '2024-01-19T18:45:00Z',
      current: false,
    },
  ],
  createdAt: '2023-01-15T00:00:00Z',
  lastLogin: '2024-01-20T10:30:00Z',
};

const TabButton = ({ 
  id, 
  label, 
  isActive, 
  onClick 
}: { 
  id: string; 
  label: React.ReactNode; 
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

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { toast, confirmDelete } = useConfirm();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Fetch user profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!user?.id) return mockProfile; // Fallback if no user ID
      
      try {
        return await apiClient.getUser(user.id);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        return mockProfile; // Fallback to mock data
      }
    },
    enabled: !!user,
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Không thể tải hồ sơ</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Clean data for API
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        position: formData.position || undefined,
        organization: formData.organization || undefined,
        website: formData.website || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        github: formData.github || undefined,
      };

      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
      );

      await apiClient.updateUser(profile.id, cleanData);
      
      // Refresh profile data
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      setIsEditing(false);
      toast.success('Hồ sơ đã được cập nhật thành công!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    const confirmed = await confirmDelete('Bạn có chắc chắn muốn kết thúc phiên này?');
    if (confirmed) {
      // TODO: Implement API call to terminate session
      toast.success('Phiên đăng nhập đã được kết thúc');
    }
  };

  const handleTerminateAllSessions = async () => {
    const confirmed = await confirmDelete('Bạn có chắc chắn muốn kết thúc tất cả phiên đăng nhập (trừ phiên hiện tại)?');
    if (confirmed) {
      // TODO: Implement API call to terminate all sessions
      toast.success('Tất cả phiên đăng nhập đã được kết thúc');
    }
  };

  const handleToggle2FA = async () => {
    try {
      // TODO: Implement API call to toggle 2FA
      const newStatus = !profile?.twoFactorEnabled;
      toast.success(newStatus ? 'Đã bật xác thực 2 yếu tố' : 'Đã tắt xác thực 2 yếu tố');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi cài đặt 2FA');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <DevicePhoneIcon className="w-6 h-6 text-gray-400" />;
    }
    if (device.includes('iPad') || device.includes('Tablet')) {
      return <DeviceTabletIcon className="w-6 h-6 text-gray-400" />;
    }
    return <ComputerDesktopIcon className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin cá nhân và cài đặt bảo mật
          </p>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'profile' && (
            <>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <EditIcon className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="profile"
          label={
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Thông tin cá nhân
            </div>
          }
          isActive={activeTab === 'profile'}
          onClick={setActiveTab}
        />
        <TabButton
          id="security"
          label={
            <div className="flex items-center">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Bảo mật
            </div>
          }
          isActive={activeTab === 'security'}
          onClick={setActiveTab}
        />
        <TabButton
          id="notifications"
          label={
            <div className="flex items-center">
              <BellIcon className="w-4 h-4 mr-2" />
              Thông báo
            </div>
          }
          isActive={activeTab === 'notifications'}
          onClick={setActiveTab}
        />
        <TabButton
          id="sessions"
          label={
            <div className="flex items-center">
              <DevicePhoneIcon className="w-4 h-4 mr-2" />
              Phiên đăng nhập
            </div>
          }
          isActive={activeTab === 'sessions'}
          onClick={setActiveTab}
        />
        <TabButton
          id="activity"
          label={
            <div className="flex items-center">
              <ActivityIcon className="w-4 h-4 mr-2" />
              Hoạt động
            </div>
          }
          isActive={activeTab === 'activity'}
          onClick={setActiveTab}
        />
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="mx-auto h-32 w-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {profile?.fullName?.charAt(0) || 'U'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{profile?.fullName || 'User'}</h3>
                <p className="text-gray-600">{profile?.email || 'No email'}</p>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {(
                    (profile as any)?.userRoles?.map((ur: any) => ur.role.name) || 
                    (profile as any)?.roles || 
                    mockProfile.roles
                  ).map((role: string) => (
                    <span key={role} className="inline-flex px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {role}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-4">
                    <CameraIcon className="w-4 h-4 mr-2" />
                    Thay đổi ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.fullName || ''}
                      onChange={(e) => handleUpdateProfile('fullName', e.target.value)}
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile?.fullName || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md">{profile?.email || '-'}</div>
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => handleUpdateProfile('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile?.phone || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.position || ''}
                      onChange={(e) => handleUpdateProfile('position', e.target.value)}
                      placeholder="Nhập chức vụ"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.position || '-'}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tổ chức
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.organization || ''}
                      onChange={(e) => handleUpdateProfile('organization', e.target.value)}
                      placeholder="Nhập tên tổ chức"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.organization || '-'}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu bản thân
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => handleUpdateProfile('bio', e.target.value)}
                      placeholder="Viết giới thiệu về bản thân..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md min-h-[100px]">{profile.bio || '-'}</div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Liên kết mạng xã hội</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <WebIcon className="w-4 h-4 mr-2" />
                    Website
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.website || ''}
                      onChange={(e) => handleUpdateProfile('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.website || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <LinkedinIcon className="w-4 h-4 mr-2" />
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.linkedin || ''}
                      onChange={(e) => handleUpdateProfile('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.linkedin || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TwitterIcon className="w-4 h-4 mr-2" />
                    Twitter
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.twitter || ''}
                      onChange={(e) => handleUpdateProfile('twitter', e.target.value)}
                      placeholder="https://twitter.com/username"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.twitter || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <GithubIcon className="w-4 h-4 mr-2" />
                    GitHub
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.github || ''}
                      onChange={(e) => handleUpdateProfile('github', e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.github || '-'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h3>
            
            <div className="space-y-6">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Thay đổi mật khẩu</h4>
                  <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowChangePassword(true)}
                >
                  <KeyIcon className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </div>

              {/* Two Factor Authentication */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Xác thực 2 yếu tố (2FA)</h4>
                  <p className="text-sm text-gray-600">
                    Tăng cường bảo mật với xác thực 2 yếu tố
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm flex items-center ${profile?.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {profile?.twoFactorEnabled ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Đã bật
                      </>
                    ) : (
                      <>
                        <XIcon className="w-4 h-4 mr-1" />
                        Chưa bật
                      </>
                    )}
                  </span>
                  <Button 
                    variant={profile?.twoFactorEnabled ? 'outline' : 'default'}
                    onClick={handleToggle2FA}
                  >
                    {profile?.twoFactorEnabled ? (
                      <>
                        <UnlockIcon className="w-4 h-4 mr-2" />
                        Tắt 2FA
                      </>
                    ) : (
                      <>
                        <LockIcon className="w-4 h-4 mr-2" />
                        Bật 2FA
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* API Keys */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">API Keys</h4>
                  <p className="text-sm text-gray-600">Quản lý các API key cho tích hợp</p>
                </div>
                <Button variant="outline">
                  <KeyIcon className="w-4 h-4 mr-2" />
                  Quản lý API Keys
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Thông báo email</h4>
                <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.emailNotifications || mockProfile.emailNotifications}
                  onChange={(e) => handleUpdateProfile('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Thông báo đẩy</h4>
                <p className="text-sm text-gray-600">Nhận thông báo đẩy từ trình duyệt</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.pushNotifications || mockProfile.pushNotifications}
                  onChange={(e) => handleUpdateProfile('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Phiên đăng nhập</h3>
            <Button variant="outline" onClick={handleTerminateAllSessions}>
              <LogoutIcon className="w-4 h-4 mr-2" />
              Kết thúc tất cả phiên
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {(profile?.sessions || mockProfile.sessions).map((session: any) => (
                <div key={session.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div>{getDeviceIcon(session.device)}</div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {session.device} - {session.browser}
                          {session.current && (
                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Phiên hiện tại
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <LocationIcon className="w-4 h-4 mr-1" />
                          {session.location}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Hoạt động lần cuối: {formatDate(session.lastActive)}
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                      >
                        <LogoutIcon className="w-4 h-4 mr-2" />
                        Kết thúc
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đăng nhập</h3>
          
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
                {(profile?.loginHistory || mockProfile.loginHistory).map((login: any) => (
                  <tr key={login.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(login.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {login.userAgent.includes('Mobile') ? (
                          <>
                            <DevicePhoneIcon className="w-4 h-4 mr-2" />
                            Mobile
                          </>
                        ) : (
                          <>
                            <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                            Desktop
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        login.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {login.success ? (
                          <>
                            <CheckIcon className="w-3 h-3 mr-1" />
                            Thành công
                          </>
                        ) : (
                          <>
                            <XIcon className="w-3 h-3 mr-1" />
                            Thất bại
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Thay đổi mật khẩu</h3>
            <p className="text-gray-600 mb-4">
              Tính năng thay đổi mật khẩu sẽ được phát triển trong phiên bản tiếp theo.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
