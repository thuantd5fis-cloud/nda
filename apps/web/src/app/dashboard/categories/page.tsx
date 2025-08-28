'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { CategoryIcon, ErrorIcon, PlusIcon, EditIcon, TrashIcon, HomeIcon, TreeIcon } from '@/components/icons';
import { useConfirm } from '@/hooks/use-confirm';

const CategoriesTable = ({ categories, onDelete }: { categories: any[], onDelete: (id: string) => void }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <div className="text-gray-400 mb-4 flex justify-center">
            <CategoryIcon className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có danh mục nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu tạo danh mục đầu tiên của bạn
          </p>
          <Link href="/dashboard/categories/create">
            <Button className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Tạo danh mục mới
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
              Tên danh mục
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Danh mục cha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số bài viết
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.metaDescription || 'Không có mô tả'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {category.slug}
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {category.parent?.name || '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category._count?.postCategories || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <Link 
                    href={`/dashboard/categories/${category.id}/edit`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-600"
                    title="Chỉnh sửa"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => onDelete(category.id)}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 -ml-px rounded-r-md hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-600"
                    title="Xóa danh mục"
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

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { confirmDelete, toast } = useConfirm();

  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const handleDelete = async (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    if (!category) return;

    // Check if category has posts
    if (category._count?.postCategories > 0) {
      toast.error(`Không thể xóa danh mục này vì còn ${category._count.postCategories} bài viết. Vui lòng di chuyển các bài viết sang danh mục khác trước.`);
      return;
    }

    const confirmed = await confirmDelete(
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
      {
        title: 'Xác nhận xóa danh mục'
      }
    );

    if (!confirmed) return;

    try {
      console.log('Deleting category:', categoryId);
      await apiClient.deleteCategory(categoryId);
      console.log('✅ Category deleted successfully');
      toast.success('Danh mục đã được xóa thành công!');
      refetch(); // Refresh the list
    } catch (error) {
      console.error('❌ Delete category error:', error);
      toast.error('Có lỗi xảy ra khi xóa danh mục: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const filteredCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Không thể tải danh sách danh mục. Vui lòng thử lại.
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600">
            Tổ chức nội dung theo danh mục và cấu trúc phân cấp
          </p>
        </div>
        <Link href="/dashboard/categories/create">
          <Button>Tạo danh mục mới</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="max-w-lg">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Tìm kiếm danh mục
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên danh mục..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-blue-400">
                <CategoryIcon className="w-8 h-8" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng danh mục
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-blue-500">
                <HomeIcon className="w-8 h-8" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Danh mục gốc
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.filter((c: any) => !c.parentId).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-green-500">
                <TreeIcon className="w-8 h-8" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Danh mục con
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.filter((c: any) => c.parentId).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Danh sách danh mục ({filteredCategories.length})
          </h3>
          <CategoriesTable categories={filteredCategories} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
