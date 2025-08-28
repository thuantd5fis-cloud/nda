'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface TagFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
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

export default function CreateTagPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    slug: '',
    description: '',
    color: 'blue',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TagFormData, value: any) => {
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
      alert('Vui lòng nhập tên tag');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const tagData = { ...formData };
      console.log('Creating tag:', tagData);
      
      // Real API call
      const createdTag = await apiClient.createTag({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        color: formData.color,
        isActive: formData.isActive,
      });
      
      console.log('✅ Tag created successfully:', createdTag);
      
      // Invalidate tags query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      alert('Tag đã được tạo thành công!');
      router.push('/dashboard/tags');
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo tag');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo tag mới</h1>
          <p className="text-gray-600 mt-2">
            Thêm tag mới để phân loại nội dung
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

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Tag hiển thị:</span>
                <div className="mt-2">
                  {formData.name ? (
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getColorClass(formData.color)}`}>
                      {formData.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Nhập tên để xem preview</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">URL:</span>
                <div className="font-mono text-sm">
                  /tags/{formData.slug || 'slug'}
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

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Thao tác</h3>
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? '⏳ Đang tạo...' : '✅ Tạo tag'}
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

          {/* Guidelines */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Hướng dẫn</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Tên tag nên ngắn gọn và dễ hiểu</li>
              <li>• Sử dụng màu sắc để phân biệt loại tag</li>
              <li>• Slug tự động tạo từ tên tag</li>
              <li>• Mô tả giúp người dùng hiểu rõ mục đích</li>
              <li>• Tag có thể được sử dụng cho nhiều bài viết</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
