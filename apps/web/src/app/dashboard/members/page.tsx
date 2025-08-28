'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import {
  UsersIcon, StarIcon, CheckIcon, BookIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon,
  GridIcon, TableIcon, FilterIcon, SearchIcon, CompanyIcon, LocationIcon, CalendarIcon,
  ErrorIcon, LoadingIcon, WebIcon, LinkedinIcon, GithubIcon, TwitterIcon, AwardIcon
} from '@/components/icons';

// Status Badge Component
const StatusBadge = ({ status }: { status: boolean }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
      status 
        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-200' 
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      {status ? 'Hoạt động' : 'Tạm dừng'}
    </span>
  );
};

// Expert Badge Component  
const ExpertBadge = ({ isExpert }: { isExpert: boolean }) => {
  if (!isExpert) return null;
  
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200 whitespace-nowrap">
      <StarIcon className="w-3 h-3 mr-1.5 flex-shrink-0" />
      Chuyên gia
    </span>
  );
};

// Avatar Color Generator
const getAvatarColor = (name: string) => {
  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600', 
    'from-purple-500 to-pink-600',
    'from-yellow-500 to-orange-600',
    'from-red-500 to-rose-600',
    'from-indigo-500 to-purple-600',
    'from-teal-500 to-cyan-600',
    'from-orange-500 to-red-600'
  ];
  
  const index = name?.charCodeAt(0) % colors.length || 0;
  return colors[index];
};

// Member Card Component - Enterprise Design
const MemberCard = ({ member }: { member: any }) => {
  const avatarColor = getAvatarColor(member.fullName);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 w-full">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center border-2 border-white shadow-md`}>
              <span className="text-white text-lg font-semibold">
                {member.fullName?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              {/* Name & Title */}
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                  {member.fullName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {member.title || member.position || 'Thành viên'}
                </p>
                <p className="text-sm text-gray-500">
                  {member.email}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex">
                <Link
                  href={`/dashboard/members/${member.id}`}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                  title="Xem chi tiết"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/dashboard/members/${member.id}/edit`}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                  title="Chỉnh sửa"
                >
                  <EditIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex items-center space-x-2 mt-3">
              <StatusBadge status={member.isActive} />
              {member.isExpert && <ExpertBadge isExpert={member.isExpert} />}
            </div>
          </div>
        </div>

        {/* Company & Location */}
        {(member.company || member.location) && (
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            {member.company && (
              <div className="flex items-center">
                <CompanyIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                <span className="truncate">{member.company}</span>
              </div>
            )}
            {member.location && (
              <div className="flex items-center">
                <LocationIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                <span className="truncate">{member.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {member.bio && (
          <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
            {member.bio}
          </p>
        )}
        
        {/* Expertise Tags */}
        {member.expertise && member.expertise.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {member.expertise.slice(0, 3).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
              {member.expertise.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                  +{member.expertise.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <span className="font-medium text-blue-700">{member.articlesCount || 0}</span>
            <span className="ml-1">bài viết</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-green-700">{member.mentoringCount || 0}</span>
            <span className="ml-1">mentoring</span>
          </div>
          {member.experience && (
            <div className="flex items-center">
              <span className="font-medium text-purple-700">{member.experience}</span>
              <span className="ml-1">năm</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Members Table Component
const MembersTable = ({ members }: { members: any[] }) => {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <div className="flex justify-center mb-4">
            <UsersIcon className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thành viên nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu thêm thành viên đầu tiên
          </p>
          <Link href="/dashboard/members/create">
            <Button>Thêm thành viên mới</Button>
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
              Thành viên
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chuyên môn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tham gia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((member) => {
            const avatarColor = getAvatarColor(member.fullName);
            return (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${avatarColor} flex items-center justify-center border border-gray-200`}>
                        <span className="text-white text-sm font-medium">
                          {member.fullName?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                    </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {member.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {member.isExpert ? (
                  <ExpertBadge isExpert={member.isExpert} />
                ) : (
                  <span className="text-sm text-gray-500">Thành viên</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {member.expertise?.slice(0, 2).map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {member.expertise?.length > 2 && (
                    <span className="text-xs text-gray-500">+{member.expertise.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={member.isActive} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.joinDate ? new Date(member.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex">
                  <Link
                    href={`/dashboard/members/${member.id}`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/members/${member.id}/edit`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                    title="Chỉnh sửa"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>
                  <button 
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-600"
                    title="Xóa"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expertFilter, setExpertFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Fetch members
  const { data: membersResponse, isLoading, error } = useQuery({
    queryKey: ['members', { search: searchTerm, isExpert: expertFilter, isActive: statusFilter }],
    queryFn: () => apiClient.getMembers({ 
      page: 1, 
      limit: 100, 
      search: searchTerm || undefined,
      isExpert: expertFilter !== 'all' ? expertFilter === 'expert' : undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined 
    }),
  });

  // Extract members from paginated response
  const members = membersResponse?.data || [];
  const pagination = membersResponse?.pagination;

  // Filter members based on search and filters (if not already filtered by API)
  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = searchTerm === '' || 
                         member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.expertise?.some((exp: string) => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExpert = expertFilter === 'all' || 
                         (expertFilter === 'expert' && member.isExpert) ||
                         (expertFilter === 'member' && !member.isExpert);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.isActive) ||
                         (statusFilter === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesExpert && matchesStatus;
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
          <div className="flex justify-center mb-4">
            <ErrorIcon className="w-16 h-16 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-500">
            Không thể tải danh sách thành viên. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
          <p className="text-gray-600">
            Quản lý thành viên và chuyên gia trong hệ thống
          </p>
        </div>
        <Link href="/dashboard/members/create">
          <Button className="inline-flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Thêm thành viên
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-blue-600">
                  <UsersIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng thành viên
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {members.length}
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
                <div className="text-yellow-600">
                  <StarIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Chuyên gia
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {members.filter((m: any) => m.isExpert).length}
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
                <div className="text-green-600">
                  <CheckIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đang hoạt động
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {members.filter((m: any) => m.isActive).length}
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
                <div className="text-purple-600">
                  <BookIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Mentoring sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {members.reduce((total: number, m: any) => total + (m.mentoringCount || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            {/* Search */}
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, email hoặc chuyên môn..."
                className="mt-1"
              />
            </div>

            {/* Expert Filter */}
            <div>
              <label htmlFor="expert" className="block text-sm font-medium text-gray-700">
                Loại
              </label>
              <select
                id="expert"
                value={expertFilter}
                onChange={(e) => setExpertFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="expert">Chuyên gia</option>
                <option value="member">Thành viên</option>
              </select>
            </div>

            {/* Status Filter */}
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hiển thị
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border inline-flex items-center justify-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b inline-flex items-center justify-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Danh sách thành viên ({filteredMembers.length})
          </h3>
          
          {viewMode === 'grid' ? (
            filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <div className="flex justify-center mb-4">
                    <UsersIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có thành viên nào
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Bắt đầu thêm thành viên đầu tiên
                  </p>
                  <Link href="/dashboard/members/create">
                    <Button>Thêm thành viên mới</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-0 sm:grid sm:gap-6" 
                style={{ 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))'
                }}
              >
                {filteredMembers.map((member: any) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            )
          ) : (
            <MembersTable members={filteredMembers} />
          )}
        </div>
      </div>
    </div>
  );
}