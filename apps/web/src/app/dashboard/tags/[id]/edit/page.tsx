'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface TagFormData {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

const colorOptions = [
  { value: 'blue', label: 'Xanh dương', class: 'bg-blue-500' },
  { value: 'green', label: 'Xanh lá', class: 'bg-green-500' },
  { value: 'yellow', label: 'Vàng', class: 'bg-yellow-500' },
  { value: 'red', label: 'Đỏ', class: 'bg-red-500' },
  { value: 'purple', label: 'Tím', class: 'bg-purple-500' },
  { value: 'pink', label: 'Hồng', class: 'bg-pink-500' },
  { value: 'indigo', label: 'Chàm', class: 'bg-indigo-500' },
  { value: 'gray', label: 'Xám', class: 'bg-gray-500' },
];

// Remove mock data - now using real API

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { confirmDelete, toast } = useConfirm();
  const [formData, setFormData] = useState<TagFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load real tag data from API
    const loadTag = async () => {
      try {
        setIsLoading(true);
        const tag = await apiClient.getTag(params.id as string);
        setFormData({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description || '',
          color: tag.color || 'blue',
          isActive: tag.isActive,
          postCount: tag._count?.postTags || 0,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        });
      } catch (error) {
        console.error('Error loading tag:', error);
        toast.error('Không thể tải tag: ' + (error instanceof Error ? error.message : String(error)));
        router.push('/dashboard/tags');
      } finally {
        setIsLoading(false);
      }
    };

    loadTag();
  }, [params.id, router]);

  const handleInputChange = (field: keyof TagFormData, value: any) => {
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
      toast.error('Vui lòng nhập tên tag');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Real API call
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        color: formData.color,
        isActive: formData.isActive,
      };
      console.log('Updating tag:', updateData);
      
      const updatedTag = await apiClient.updateTag(formData.id, updateData);
      console.log('✅ Tag updated successfully:', updatedTag);
      
      // Invalidate tags query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      toast.success('Tag đã được cập nhật thành công!');
      router.push('/dashboard/tags');
    } catch (error) {
      console.error('❌ Update tag error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tag: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    if (formData.postCount > 0) {
      toast.error(`Không thể xóa tag này vì còn ${formData.postCount} bài viết đang sử dụng. Vui lòng gỡ tag khỏi các bài viết trước.`);
      return;
    }

    const confirmed = await confirmDelete(
      'Bạn có chắc chắn muốn xóa tag này? Hành động này không thể hoàn tác.',
      {
        title: 'Xác nhận xóa tag'
      }
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    
    try {
      // Real API call
      console.log('Deleting tag:', formData.id);
      await apiClient.deleteTag(formData.id);
      console.log('✅ Tag deleted successfully');
      
      // Invalidate tags query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      toast.success('Tag đã được xóa thành công!');
      router.push('/dashboard/tags');
    } catch (error) {
      console.error('❌ Delete tag error:', error);
      toast.error('Có lỗi xảy ra khi xóa tag: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium text-gray-900">Đang tải tag...</div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-900">Không tìm thấy tag</div>
          <Button onClick={() => router.push('/dashboard/tags')} className="mt-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa tag</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin tag
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
            🗑️ Xóa tag
          </Button>
        </div>
      </div>

      {/* Tag Info */}
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
                Tên tag *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên tag..."
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
                  /tags/
                </span>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="duong-dan-tag"
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
                placeholder="Mô tả về tag này..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu sắc
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map(option => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${formData.color === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={option.value}
                      checked={formData.color === option.value}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full ${option.class}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
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
                <div className="font-medium">Kích hoạt tag</div>
                <div className="text-sm text-gray-500">Cho phép sử dụng tag này</div>
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

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Tag hiển thị:</span>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getColorClass(formData.color)}`}>
                    {formData.name}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">URL:</span>
                <div className="font-mono text-sm">
                  /tags/{formData.slug}
                </div>
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
                {isSubmitting ? '⏳ Đang cập nhật...' : '✅ Cập nhật tag'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/tags')}
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
                Tag này được sử dụng trong {formData.postCount} bài viết. Không thể xóa cho đến khi gỡ tag khỏi tất cả bài viết.
              </p>
            </div>
          )}

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tạo tag</div>
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
