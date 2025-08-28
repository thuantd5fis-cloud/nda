'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { TagIcon, ErrorIcon, PostIcon, AnalyticsIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/icons';
import { useConfirm } from '@/hooks/use-confirm';

const TagsGrid = ({ tags, onDelete }: { tags: any[], onDelete: (id: string) => void }) => {
  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <div className="text-gray-400 mb-4 flex justify-center">
            <TagIcon className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có tag nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu tạo tag đầu tiên của bạn
          </p>
          <Link href="/dashboard/tags/create">
            <Button className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Tạo tag mới
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {tag.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                <code className="bg-gray-100 px-1 rounded">
                  {tag.slug}
                </code>
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">
                  {tag._count?.postTags || 0} bài viết
                </span>
              </div>
            </div>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Link 
                href={`/dashboard/tags/${tag.id}/edit`}
                className="relative inline-flex items-center px-2 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                title="Chỉnh sửa"
              >
                <EditIcon className="w-3 h-3" />
              </Link>
              <button 
                onClick={() => onDelete(tag.id)}
                className="relative inline-flex items-center px-2 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-600"
                title="Xóa tag"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { confirmDelete, toast } = useConfirm();

  const { data: tagsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags({ limit: 1000 }), // Get up to 1000 tags
  });

  // Extract tags array from paginated response, with safety checks
  const tags = Array.isArray(tagsResponse?.data) ? tagsResponse.data : Array.isArray(tagsResponse) ? tagsResponse : [];

  const filteredTags = tags.filter((tag: any) =>
    tag.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const handleDelete = async (tagId: string) => {
    const tag = tags.find((t: any) => t.id === tagId);
    if (!tag) return;
    
    // Check if tag has posts
    if (tag._count?.postTags > 0) {
      toast.error(`Không thể xóa tag này vì còn ${tag._count.postTags} bài viết đang sử dụng. Vui lòng gỡ tag khỏi các bài viết trước.`);
      return;
    }

    const confirmed = await confirmDelete(
      `Bạn có chắc chắn muốn xóa tag "${tag.name}"? Hành động này không thể hoàn tác.`,
      {
        title: 'Xác nhận xóa tag'
      }
    );

    if (!confirmed) return;

    try {
      console.log('Deleting tag:', tagId);
      await apiClient.deleteTag(tagId);
      console.log('✅ Tag deleted successfully');
      toast.success('Tag đã được xóa thành công!');
      refetch(); // Refresh the list
    } catch (error) {
      console.error('❌ Delete tag error:', error);
      toast.error('Có lỗi xảy ra khi xóa tag: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

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
            Không thể tải danh sách tags. Vui lòng thử lại.
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tags</h1>
          <p className="text-gray-600">
            Tạo và quản lý tags để phân loại nội dung
          </p>
        </div>
        <Link href="/dashboard/tags/create">
          <Button>Tạo tag mới</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Tìm kiếm tags
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên tag..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Hiển thị {filteredTags.length} trong tổng số {tags.length} tags
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-blue-400">
                <TagIcon className="w-8 h-8" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng tags
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {tags.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-green-400">
                <PostIcon className="w-8 h-8" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tags có bài viết
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {tags.filter((t: any) => t._count?.postTags > 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-purple-400">
                <AnalyticsIcon className="w-8 h-8" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Trung bình bài viết/tag
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {tags.length > 0
                      ? Math.round(
                          tags.reduce((sum: number, t: any) => sum + (t._count?.postTags || 0), 0) /
                          tags.length
                        )
                      : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Tags phổ biến
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags
              .sort((a: any, b: any) => (b._count?.postTags || 0) - (a._count?.postTags || 0))
              .slice(0, 10)
              .map((tag: any) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag.name}
                  <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                    {tag._count?.postTags || 0}
                  </span>
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Tất cả tags ({filteredTags.length})
          </h3>
          <TagsGrid tags={filteredTags} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
