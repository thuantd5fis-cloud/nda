'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@cms/ui';
import { FileUpload } from '@/components/ui/file-upload';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface UserFormData {
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  mustChangePassword: boolean;
  passwordOption: 'auto' | 'manual';
  password: string;
  confirmPassword: string;
}

const availableRoles = [
  { value: 'super_admin', label: 'Super Admin', description: 'Toàn quyền hệ thống' },
  { value: 'admin', label: 'Admin', description: 'Quyền quản trị' },
  { value: 'editor', label: 'Editor', description: 'Chỉnh sửa và quản lý nội dung' },
  { value: 'author', label: 'Author', description: 'Tạo nội dung' },
  { value: 'moderator', label: 'Moderator', description: 'Kiểm duyệt nội dung' },
  { value: 'viewer', label: 'Viewer', description: 'Chỉ xem' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useConfirm();
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    fullName: '',
    phone: '',
    avatar: '',
    roles: ['viewer'],
    status: 'ACTIVE',
    emailVerified: false,
    mustChangePassword: true,
    passwordOption: 'auto',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (roleValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleValue]
        : prev.roles.filter(r => r !== roleValue)
    }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái thường');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái hoa');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 số');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.fullName) {
      toast.error('Vui lòng nhập email và họ tên');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }

    if (formData.roles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một vai trò');
      return;
    }

    // Validate manual password if selected
    if (formData.passwordOption === 'manual') {
      if (!formData.password) {
        toast.error('Vui lòng nhập mật khẩu');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }

      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        toast.error(passwordErrors.join('. '));
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const createData = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        avatar: formData.avatar,
        status: formData.status,
        emailVerified: formData.emailVerified,
        mustChangePassword: formData.passwordOption === 'auto' ? true : formData.mustChangePassword,
        roleNames: formData.roles,
        password: formData.passwordOption === 'manual' ? formData.password : undefined,
      };
      
      const result = await apiClient.createUser(createData);

      if (result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
      } else {
        setTemporaryPassword(''); // Show success without password
      }
      toast.success('Tài khoản đã được tạo thành công!');
    } catch (error: any) {
      console.error('Create user error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (temporaryPassword) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Tài khoản đã được tạo thành công!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Email: <strong>{formData.email}</strong></p>
                {temporaryPassword && (
                  <>
                    <p>Mật khẩu tạm thời: <strong className="font-mono bg-green-100 px-2 py-1 rounded">{temporaryPassword}</strong></p>
                    <p className="mt-2">⚠️ Vui lòng lưu mật khẩu này và gửi cho người dùng. Họ sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.</p>
                  </>
                )}
                {!temporaryPassword && formData.passwordOption === 'manual' && (
                  <p className="mt-2">✅ Tài khoản đã được tạo với mật khẩu do bạn thiết lập.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setTemporaryPassword(null);
              setFormData({
                email: '',
                fullName: '',
                phone: '',
                avatar: '',
                roles: ['viewer'],
                status: 'ACTIVE',
                emailVerified: false,
                mustChangePassword: true,
                passwordOption: 'auto',
                password: '',
                confirmPassword: '',
              });
            }}
          >
            Tạo tài khoản khác
          </Button>
          <Button onClick={() => router.push('/dashboard/users')}>
            Về danh sách tài khoản
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
          <h1 className="text-3xl font-bold text-gray-900">Tạo tài khoản mới</h1>
          <p className="text-gray-600 mt-2">
            Tạo tài khoản admin và phân quyền cho người dùng
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          ← Quay lại
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ tên *
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="SUSPENDED">Đình chỉ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <FileUpload
              value={formData.avatar}
              onChange={(url) => handleInputChange('avatar', url)}
              placeholder="Click để tải lên ảnh đại diện"
            />
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Vai trò và quyền hạn</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRoles.map(role => (
              <label key={role.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role.value)}
                  onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{role.label}</div>
                  <div className="text-sm text-gray-500">{role.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Cài đặt bảo mật</h3>
          
          {/* Password Option */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cách tạo mật khẩu
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="passwordOption"
                    value="auto"
                    checked={formData.passwordOption === 'auto'}
                    onChange={(e) => handleInputChange('passwordOption', e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tự động tạo mật khẩu an toàn</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="passwordOption"
                    value="manual"
                    checked={formData.passwordOption === 'manual'}
                    onChange={(e) => handleInputChange('passwordOption', e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Nhập mật khẩu thủ công</span>
                </label>
              </div>
            </div>

            {/* Manual Password Inputs */}
            {formData.passwordOption === 'manual' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu *
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu *
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Yêu cầu mật khẩu:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center">
                      <span className={`mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        {formData.password.length >= 8 ? '✓' : '○'}
                      </span>
                      Ít nhất 8 ký tự
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[a-z]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      Chứa chữ cái thường (a-z)
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      Chứa chữ cái hoa (A-Z)
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/\d/.test(formData.password) ? '✓' : '○'}
                      </span>
                      Chứa số (0-9)
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[@$!%*?&]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      Chứa ký tự đặc biệt (@$!%*?&)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailVerified}
                  onChange={(e) => handleInputChange('emailVerified', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Email đã xác thực</span>
              </label>
            </div>

            {formData.passwordOption === 'manual' && (
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.mustChangePassword}
                    onChange={(e) => handleInputChange('mustChangePassword', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bắt buộc đổi mật khẩu lần đầu đăng nhập</span>
                </label>
              </div>
            )}
          </div>
          
          {formData.passwordOption === 'auto' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Mật khẩu tự động
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Hệ thống sẽ tự động tạo mật khẩu tạm thời đáp ứng chính sách bảo mật:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Ít nhất 8 ký tự</li>
                      <li>Chứa chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                      <li>Người dùng sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </div>
  );
}