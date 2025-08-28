'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { UserIcon, EyeIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/icons';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'author':
        return 'bg-green-100 text-green-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'author':
        return 'Author';
      case 'moderator':
        return 'Moderator';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
      {getRoleText(role)}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'suspended':
        return 'Bị tạm khóa';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const UsersTable = ({ users, onToggleStatus }: { users: any[], onToggleStatus: (id: string) => void }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <div className="text-gray-400 mb-4 flex justify-center">
            <UserIcon className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có người dùng nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu thêm người dùng đầu tiên
          </p>
          <Link href="/dashboard/users/create">
            <Button className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Thêm người dùng mới
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Người dùng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
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
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {user.userRoles?.map((userRole: any, index: number) => (
                    <RoleBadge key={index} role={userRole.role.name} />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <Link
                    href={`/dashboard/users/${user.id}`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/users/${user.id}/edit`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                    title="Chỉnh sửa"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>
                  <button 
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-600"
                    title={user.status === 'ACTIVE' ? 'Khóa người dùng' : 'Kích hoạt người dùng'}
                    onClick={() => onToggleStatus(user.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  const { confirmWarning, toast } = useConfirm();

  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users', { search: searchTerm, role: roleFilter, status: statusFilter }],
    queryFn: () => apiClient.getUsers({ 
      page: 1, 
      limit: 100, 
      search: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }),
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  // Handle toggle user status
  const handleToggleStatus = async (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = user.status === 'ACTIVE' ? 'khóa' : 'kích hoạt';
    
    const confirmed = await confirmWarning(
      `Bạn có chắc chắn muốn ${action} người dùng "${user.fullName}"?`,
      {
        title: `Xác nhận ${action} người dùng`,
        confirmText: action === 'khóa' ? 'Khóa' : 'Kích hoạt'
      }
    );

    if (!confirmed) return;

    try {
      await apiClient.updateUser(userId, { status: newStatus });
      
      // Refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast.success(`Người dùng đã được ${action} thành công!`);
    } catch (error) {
      console.error('Toggle user status error:', error);
      toast.error(`Có lỗi xảy ra khi ${action} người dùng. Vui lòng thử lại.`);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = searchTerm === '' || 
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || 
                       user.userRoles?.some((ur: any) => ur.role.name === roleFilter);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-500">
            Không thể tải danh sách người dùng. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  // Get role counts
  const roleCounts = users.reduce((acc: any, user: any) => {
    user.userRoles?.forEach((ur: any) => {
      const roleName = ur.role.name;
      acc[roleName] = (acc[roleName] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">
            Quản lý tài khoản và phân quyền người dùng hệ thống
          </p>
        </div>
        <Link href="/dashboard/users/create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Thêm người dùng mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="author">Author</option>
                <option value="moderator">Moderator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="SUSPENDED">Bị khóa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng người dùng
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đang hoạt động
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter((u: any) => u.status === 'ACTIVE').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👑</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Admin
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(roleCounts.super_admin || 0) + (roleCounts.admin || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✏️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Editor/Author
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(roleCounts.editor || 0) + (roleCounts.author || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Danh sách người dùng ({filteredUsers.length})
          </h3>
          <UsersTable users={filteredUsers} onToggleStatus={handleToggleStatus} />
        </div>
      </div>
    </div>
  );
}
