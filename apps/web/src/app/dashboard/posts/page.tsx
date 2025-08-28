'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { PostIcon, ErrorIcon, SuccessIcon, PlusIcon, DocumentIcon, StatusIcon, EyeIcon, EditIcon, TrashIcon } from '@/components/icons';
import { useConfirm } from '@/hooks/use-confirm';
import { usePermissions } from '@/hooks/use-permissions';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { ApprovalButton } from '@/components/ui/approval-button';
import { EnhancedApprovalButton } from '@/components/ui/enhanced-approval-button';
import { EnhancedWorkflowActions } from '@/components/ui/enhanced-workflow-actions';
import { ApprovalDebugPanel } from '@/components/debug/approval-debug-panel';
import { Pagination } from '@/components/ui/pagination';

// Post Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      case 'review':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'archived':
        return 'Lưu trữ';
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

// Posts Table Body Component
const PostsTableBody = ({ posts, onDelete }: { posts: any[], onDelete: (id: string) => void }) => {
  const { canDirectApprove } = usePermissions();
  const { canSeeApprovalActions, debugInfo } = useEnhancedPermissions();
  const queryClient = useQueryClient();
  
  // Debug logging for the table
  console.log('📋 [PostsTableBody] Enhanced permissions debug:', debugInfo);
  
  if (!posts || posts.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <div className="text-gray-400 mb-4 flex justify-center">
                <PostIcon className="w-16 h-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-500 mb-6">
                Bắt đầu tạo bài viết đầu tiên của bạn
              </p>
              <Link href="/dashboard/posts/create">
                <Button className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Tạo bài viết mới
                </Button>
              </Link>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {posts.map((post) => (
        <tr key={post.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {post.title}
                </div>
                <div className="text-sm text-gray-500">
                  {post.excerpt || 'Không có mô tả'}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <StatusBadge status={post.status} />
            {/* Debug Info */}
            <div className="text-xs text-gray-400 mt-1">
              Status: {post.status} | ID: {post.id.slice(-4)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {post.author?.fullName || 'Unknown'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex items-center gap-2">
              {/* Ba action mặc định: Xem, Sửa, Xóa */}
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Link
                  href={`/dashboard/posts/${post.id}`}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                  title="Xem chi tiết"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                  title="Chỉnh sửa"
                >
                  <EditIcon className="w-4 h-4" />
                </Link>
                <button 
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-600"
                  title="Xóa bài viết"
                  onClick={() => onDelete(post.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Action phê duyệt/từ chối - chỉ hiển thị khi có đủ thẩm quyền */}
              {canSeeApprovalActions() && (
                <EnhancedWorkflowActions
                  post={{
                    id: post.id,
                    status: post.status,
                    createdBy: post.createdBy,
                    title: post.title,
                  }}
                  currentUserId={debugInfo.userLevel > 0 ? 'current-user-id' : undefined}
                  compact={true}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                  }}
                />
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { confirmDelete, toast } = useConfirm();
  const { canCreatePost, canDirectApprove } = usePermissions();

  // Fetch posts
  const { data: postsResponse, isLoading, error } = useQuery({
    queryKey: ['posts', { search: searchTerm, status: statusFilter, page: currentPage }],
    queryFn: () => apiClient.getPosts({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }),
  });

  // Extract posts from paginated response
  const posts = postsResponse?.data || [];
  const pagination = postsResponse?.pagination;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle delete post
  const handleDelete = async (postId: string) => {
    const confirmed = await confirmDelete(
      'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      {
        title: 'Xác nhận xóa bài viết'
      }
    );

    if (!confirmed) return;

    try {
      await apiClient.deletePost(postId);
      
      // Refetch posts data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast.success('Bài viết đã được xóa thành công!');
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại.');
    }
  };

  // Debug: Check data structure
  if (process.env.NODE_ENV === 'development') {
    console.log('Posts loaded:', posts.length, 'items');
  }

  // Posts are already filtered by the API based on search and status parameters

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
          <div className="text-red-400 mb-4 flex justify-center">
            <ErrorIcon className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-500">
            Không thể tải danh sách bài viết. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header and Controls */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 space-y-4 pb-4">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản lý bài viết</h1>
            <p className="text-sm text-gray-600">
              Tạo, chỉnh sửa và quản lý tất cả bài viết của bạn
            </p>
          </div>
          {canCreatePost() && (
            <Link href="/dashboard/posts/create">
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Tạo bài viết mới
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Search */}
                <div className="sm:col-span-2">
                  <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm theo tiêu đề hoặc nội dung..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="all">Tất cả</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                    <option value="DRAFT">Bản nháp</option>
                    <option value="REVIEW">Chờ duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="ARCHIVED">Lưu trữ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Stats */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-gray-400">
                    <PostIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">
                        Trang hiện tại
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {posts.length}/{pagination?.total || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-green-400">
                    <SuccessIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">
                        Đã xuất bản
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {posts.filter((p: any) => p.status === 'PUBLISHED').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-gray-400">
                    <DocumentIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">
                        Bản nháp
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {posts.filter((p: any) => p.status === 'DRAFT').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-yellow-400">
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">
                        Chờ duyệt
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {posts.filter((p: any) => p.status === 'REVIEW').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-blue-400">
                    <DocumentIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">
                        Lưu trữ
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {posts.filter((p: any) => p.status === 'ARCHIVED').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content - Only Table */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Posts Table - Fixed header, scrollable content */}
        <div className="bg-white shadow rounded-lg flex-1 flex flex-col min-h-0">
          <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Danh sách bài viết ({pagination?.total || 0})
            </h3>
          </div>
          
          {/* Scrollable Table with Sticky Header */}
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <PostsTableBody posts={posts} onDelete={handleDelete} />
            </table>
          </div>
        </div>

        {/* Debug Panel for Approval Issues */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <ApprovalDebugPanel 
              post={posts.find(p => p.status === 'REVIEW') || undefined}
            />
          </div>
        )}
      </div>

      {/* Fixed Footer with Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Showing X to Y of Z results */}
            <div className="text-sm text-gray-700">
              Hiển thị{' '}
              <span className="font-medium">
                {((pagination.page - 1) * pagination.limit) + 1}
              </span>
              {' '}đến{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>
              {' '}trong tổng số{' '}
              <span className="font-medium">{pagination.total}</span> kết quả
            </div>
            
            {/* Pagination Component */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
