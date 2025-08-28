'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface CategoryFormData {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  sortOrder: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}



export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { confirmDelete, toast } = useConfirm();
  const [formData, setFormData] = useState<CategoryFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch category data using React Query
  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', params.id],
    queryFn: () => apiClient.getCategory(params.id as string),
    enabled: !!params.id,
  });

  // Fetch all categories for parent selection
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Transform API data to form data when loaded
  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder || 1,
        postCount: category._count?.posts || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    }
  }, [category]);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    if (!formData) return;
    
    setFormData(prev => ({ ...prev!, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && value) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Remove multiple dashes
        .trim();
      setFormData(prev => ({ ...prev!, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.name) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parentId: formData.parentId || null,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        // color: formData.color, // Commented out as property doesn't exist
        // icon: formData.icon, // Commented out as property doesn't exist
        // isActive: formData.isActive, // Commented out as property doesn't exist
        // sortOrder: formData.sortOrder, // Commented out as property doesn't exist
      };
      
      console.log('Updating category:', updateData);
      const updatedCategory = await apiClient.updateCategory(formData.id, updateData);
      console.log('✅ Category updated successfully:', updatedCategory);
      
      toast.success('Danh mục đã được cập nhật thành công!');
      router.push('/dashboard/categories');
    } catch (error) {
      console.error('❌ Update category error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật danh mục: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    if (formData.postCount > 0) {
      toast.error(`Không thể xóa danh mục này vì còn ${formData.postCount} bài viết. Vui lòng di chuyển các bài viết sang danh mục khác trước.`);
      return;
    }

    const confirmed = await confirmDelete(
      'Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.',
      {
        title: 'Xác nhận xóa danh mục'
      }
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    
    try {
      console.log('Deleting category:', formData.id);
      await apiClient.deleteCategory(formData.id);
      console.log('✅ Category deleted successfully');
      
      toast.success('Danh mục đã được xóa thành công!');
      router.push('/dashboard/categories');
    } catch (error) {
      console.error('❌ Delete category error:', error);
      toast.error('Có lỗi xảy ra khi xóa danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium text-gray-900">Đang tải danh mục...</div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-900">Không tìm thấy danh mục</div>
          <Button onClick={() => router.push('/dashboard/categories')} className="mt-4">
            ← Quay về danh sách
          </Button>
        </div>
      </div>
    );
  }

  // Filter out current category from parent options
  const availableParents = availableCategories.filter((cat: any) => cat.id !== formData?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin danh mục
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
            onClick={handleDelete}
            disabled={isSubmitting || formData.postCount > 0}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Xóa danh mục
          </Button>
        </div>
      </div>

      {/* Category Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-blue-600">ID: {formData.id}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">Số bài viết: {formData.postCount}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">
                Tạo: {new Date(formData.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-sm text-blue-600">
                Sửa: {new Date(formData.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên danh mục..."
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đường dẫn (Slug)
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  /categories/
                </span>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="duong-dan-danh-muc"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Thay đổi slug có thể ảnh hưởng đến SEO
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả về danh mục này..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục cha
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => handleInputChange('parentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Không có danh mục cha</option>
                {availableParents.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Để trống nếu đây là danh mục gốc
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự sắp xếp
              </label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Số càng nhỏ sẽ hiển thị trước
              </p>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt SEO</h3>
            
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <Input
                value={formData.metaTitle || formData.name}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder="Tiêu đề SEO (tối đa 60 ký tự)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.metaTitle || formData.name).length}/60 ký tự
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription || formData.description}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="Mô tả SEO (tối đa 160 ký tự)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.metaDescription || formData.description).length}/160 ký tự
              </p>
            </div>

            {/* SEO Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xem trước kết quả tìm kiếm
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.metaTitle || formData.name}
                </div>
                <div className="text-green-700 text-sm">
                  https://example.com/categories/{formData.slug}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {formData.metaDescription || formData.description}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái</h3>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div>
                <div className="font-medium">Kích hoạt danh mục</div>
                <div className="text-sm text-gray-500">Cho phép hiển thị công khai</div>
              </div>
            </label>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số bài viết:</span>
                <span className="font-medium">{formData.postCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thứ tự:</span>
                <span className="font-medium">{formData.sortOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.isActive ? 'Kích hoạt' : 'Tạm dừng'}
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
                {isSubmitting ? '⏳ Đang cập nhật...' : '✅ Cập nhật danh mục'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/categories')}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Warning */}
          {formData.postCount > 0 && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Lưu ý</h3>
              <p className="text-sm text-yellow-800">
                Danh mục này có {formData.postCount} bài viết. Không thể xóa cho đến khi di chuyển tất cả bài viết sang danh mục khác.
              </p>
            </div>
          )}

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tạo danh mục</div>
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
