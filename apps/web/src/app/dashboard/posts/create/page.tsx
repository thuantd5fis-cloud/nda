'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { FileUpload } from '@/components/ui/file-upload';
import { MultilingualEditor, MultilingualContent } from '@/components/ui/multilingual-editor';
import { apiClient } from '@/lib/api';
import { CharacterCountIcon, SettingsIcon, SearchIcon, ClipboardIcon, BulbIcon, RocketIcon, LoadingIcon, LanguageIcon } from '@/components/icons';
import { useConfirm } from '@/hooks/use-confirm';
import { usePermissions } from '@/hooks/use-permissions';
import { PostStatusManager } from '@/components/ui/post-status-manager';
import { RoleBasedStatusSelector } from '@/components/ui/role-based-status-selector';

interface PostFormData {
  status: 'draft' | 'review' | 'published' | 'rejected' | 'archived';
  categoryId: string;
  tags: string[];
  featuredImage?: string;
  multilingualContent: MultilingualContent;
}

// Removed mock data - now using real API

export default function CreatePostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useConfirm();
  const { getAvailableStatuses, canPublishDirectly, canDirectApprove } = usePermissions();
  const [formData, setFormData] = useState<PostFormData>({
    status: 'draft',
    categoryId: '',
    tags: [],
    featuredImage: '',
    multilingualContent: {
      vi: {
        title: '',
        excerpt: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        slug: ''
      },
      en: {
        title: '',
        excerpt: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        slug: ''
      }
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Fetch real categories and tags
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags({ limit: 1000 }),
  });

  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const tags = Array.isArray(tagsResponse?.data) ? tagsResponse.data : [];

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultilingualContentChange = (content: MultilingualContent) => {
    setFormData(prev => ({ ...prev, multilingualContent: content }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (status: 'draft' | 'review' | 'published' | 'rejected' | 'archived') => {
    const viContent = formData.multilingualContent.vi;
    const enContent = formData.multilingualContent.en;
    
    if (!viContent.title || !viContent.content) {
      toast.error('Vui lòng nhập tiêu đề và nội dung tiếng Việt');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create main post (Vietnamese)
      const postData = {
        title: viContent.title,
        content: viContent.content,
        excerpt: viContent.excerpt,
        status: status.toUpperCase(),
        slug: viContent.slug,
        featuredImage: formData.featuredImage,
        metaTitle: viContent.metaTitle,
        metaDescription: viContent.metaDescription,
        locale: 'vi',
        categoryIds: formData.categoryId ? [formData.categoryId] : [],
        tagIds: formData.tags.map(tagName => {
          const tag = tags.find(t => t.name === tagName);
          return tag?.id;
        }).filter(Boolean) as string[],
      };
      
      console.log('Creating post with real API:', postData);
      
      // Real API call
      const createdPost = await apiClient.createPost(postData);
      
      // Create English translation if content exists
      if (enContent.title && enContent.content) {
        const translationData = {
          postId: createdPost.id,
          locale: 'en',
          title: enContent.title,
          slug: enContent.slug,
          excerpt: enContent.excerpt,
          content: enContent.content,
          metaTitle: enContent.metaTitle,
          metaDescription: enContent.metaDescription
        };
        
        console.log('Creating translation:', translationData);
        // Note: You'll need to implement this API endpoint
        // await apiClient.createPostTranslation(translationData);
      }
      
      console.log('✅ Post created successfully:', createdPost);
      
      // Invalidate posts query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast.success(`Bài viết đa ngôn ngữ đã được ${
        status === 'published' ? 'xuất bản' :
        status === 'review' ? 'gửi duyệt' :
        status === 'archived' ? 'lưu trữ' :
        status === 'rejected' ? 'từ chối' : 'lưu nháp'
      } thành công!`);
      router.push('/dashboard/posts');
    } catch (error) {
      console.error('❌ Create post error:', error);
      toast.error('Có lỗi xảy ra khi tạo bài viết: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string | React.ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo bài viết mới</h1>
          <p className="text-gray-600 mt-2">
            Viết và xuất bản nội dung mới cho website của bạn
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
          
          {/* Always show Save Draft for everyone */}
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            💾 Lưu nháp
          </Button>
          
          {/* Submit for Review Button - hiển thị cho tất cả user có quyền tạo bài */}
          <Button
            variant="outline"
            onClick={() => handleSubmit('review')}
            disabled={isSubmitting}
            className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <LoadingIcon className="w-4 h-4" />
                Đang gửi...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                📝 Gửi duyệt
              </div>
            )}
          </Button>
          
          {/* Only show advanced actions for Moderator/Admin/Super Admin */}
          {canPublishDirectly() && (
            <>
              <Button
                variant="outline"
                onClick={() => handleSubmit('archived')}
                disabled={isSubmitting}
              >
                📦 Lưu trữ
              </Button>
              {canDirectApprove() && (
                <Button
                  variant="default"
                  onClick={() => handleSubmit('published')}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingIcon className="w-4 h-4" />
                      Đang phê duyệt...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      ✅ Phê duyệt & Xuất bản
                    </div>
                  )}
                </Button>
              )}
              <Button
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingIcon className="w-4 h-4" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RocketIcon className="w-4 h-4" />
                    Xuất bản
                  </div>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="content"
          label={
            <div className="flex items-center gap-2">
              <LanguageIcon className="w-4 h-4" />
              Nội dung đa ngôn ngữ
            </div>
          }
          isActive={activeTab === 'content'}
          onClick={setActiveTab}
        />
        <TabButton
          id="settings"
          label={
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Cài đặt
            </div>
          }
          isActive={activeTab === 'settings'}
          onClick={setActiveTab}
        />
        <TabButton
          id="seo"
          label={
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4" />
              SEO
            </div>
          }
          isActive={activeTab === 'seo'}
          onClick={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'content' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <MultilingualEditor
                content={formData.multilingualContent}
                onChange={handleMultilingualContentChange}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thẻ (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.tags.includes(tag.name)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500">Đang tải tags...</p>
                )}
                {formData.tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Đã chọn: {formData.tags.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <FileUpload
                  value={formData.featuredImage}
                  onChange={(url) => handleInputChange('featuredImage', url)}
                  placeholder="Click để chọn ảnh đại diện hoặc kéo thả vào đây"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <div className="text-center py-8 text-gray-500">
                <LanguageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">SEO đa ngôn ngữ</h3>
                <p>Cài đặt SEO được quản lý trong tab "Nội dung đa ngôn ngữ"</p>
                <p className="text-sm mt-2">
                  Mỗi ngôn ngữ có Meta Title, Meta Description và Slug riêng biệt
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái bài viết</h3>
            <RoleBasedStatusSelector
              currentStatus={formData.status}
              onStatusChange={(status) => setFormData(prev => ({ ...prev, status: status as any }))}
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
                          <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngôn ngữ:</span>
                <span className="font-medium">
                  {formData.multilingualContent.vi.title ? '🇻🇳' : ''} 
                  {formData.multilingualContent.en.title ? ' 🇺🇸' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số từ (VI):</span>
                <span className="font-medium">
                  {formData.multilingualContent.vi.content.split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số từ (EN):</span>
                <span className="font-medium">
                  {formData.multilingualContent.en.content.split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian đọc:</span>
                <span className="font-medium">
                  ~{Math.ceil(Math.max(
                    formData.multilingualContent.vi.content.split(/\s+/).filter(word => word.length > 0).length,
                    formData.multilingualContent.en.content.split(/\s+/).filter(word => word.length > 0).length
                  ) / 200)} phút
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tags:</span>
                <span className="font-medium">{formData.tags.length}</span>
              </div>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <BulbIcon className="w-5 h-5" />
              Mẹo viết bài
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Viết tiếng Việt trước, sau đó dịch sang tiếng Anh</li>
              <li>• Sử dụng nút dịch tự động để tiết kiệm thời gian</li>
              <li>• Kiểm tra và chỉnh sửa bản dịch cho phù hợp</li>
              <li>• Đảm bảo URL slug khác nhau cho mỗi ngôn ngữ</li>
              <li>• Tối ưu SEO cho từng ngôn ngữ riêng biệt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
