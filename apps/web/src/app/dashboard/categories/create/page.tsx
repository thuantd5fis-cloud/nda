'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  metaTitle: string;
  metaDescription: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function CreateCategoryPage() {
  const router = useRouter();
  
  // Fetch categories for parent selection
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });
  const { toast } = useConfirm();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    metaTitle: '',
    metaDescription: '',
    color: '',
    icon: '',
    isActive: true,
    sortOrder: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const categoryData = { ...formData };
      console.log('Creating category:', categoryData);
      
      // Real API call
      const createdCategory = await apiClient.createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parentId: formData.parentId || null,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        color: formData.color,
        icon: formData.icon,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      });
      
      console.log('✅ Category created successfully:', createdCategory);
      toast.success('Danh mục đã được tạo thành công!');
      router.push('/dashboard/categories');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo danh mục mới</h1>
          <p className="text-gray-600 mt-2">
            Thêm danh mục mới để phân loại bài viết
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
                {availableCategories.map((category: any) => (
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
                  {formData.metaTitle || formData.name || 'Tên danh mục'}
                </div>
                <div className="text-green-700 text-sm">
                  https://example.com/categories/{formData.slug || 'duong-dan'}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {formData.metaDescription || formData.description || 'Mô tả danh mục sẽ hiển thị ở đây...'}
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

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Thao tác</h3>
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? '⏳ Đang tạo...' : '✅ Tạo danh mục'}
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

          {/* Guidelines */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Hướng dẫn</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Tên danh mục nên ngắn gọn và dễ hiểu</li>
              <li>• Slug tự động tạo từ tên danh mục</li>
              <li>• Mô tả giúp người dùng hiểu rõ nội dung</li>
              <li>• Danh mục cha tạo cấu trúc phân cấp</li>
              <li>• Thứ tự sắp xếp ảnh hưởng hiển thị</li>
            </ul>
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Tên:</span>
                <div className="font-medium">{formData.name || 'Chưa nhập'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">URL:</span>
                <div className="font-mono text-sm">
                  /categories/{formData.slug || 'slug'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Trạng thái:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.isActive ? 'Kích hoạt' : 'Tạm dừng'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
