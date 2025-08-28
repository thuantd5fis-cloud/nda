'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input } from '@cms/ui';

interface FAQFormData {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  priority: number;
  relatedFAQs: string[];
  searchKeywords: string[];
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

const faqCategories = [
  'Tài khoản & Đăng nhập',
  'Bài viết & Nội dung', 
  'Thanh toán & Phí',
  'Sự kiện & Workshop',
  'Mentoring & Tư vấn',
  'Tính năng & Sử dụng',
  'Bảo mật & Quyền riêng tư',
  'Hỗ trợ kỹ thuật',
  'Chính sách & Quy định'
];

const commonTags = [
  'Phổ biến', 'Mới bắt đầu', 'Nâng cao', 'Khẩn cấp', 
  'Thanh toán', 'Tài khoản', 'Bảo mật', 'Kỹ thuật',
  'Chính sách', 'Hướng dẫn', 'Lỗi', 'Cập nhật'
];

// Mock data for existing FAQ
const getMockFAQ = (id: string): FAQFormData => ({
  id,
  question: 'Làm thế nào để đăng bài viết trên hệ thống?',
  answer: 'Để đăng bài viết trên hệ thống, bạn cần làm theo các bước sau:\n\n1. **Đăng nhập tài khoản**: Trước tiên, bạn cần đăng nhập với tài khoản có quyền đăng bài (Author trở lên).\n\n2. **Vào menu Bài viết**: Click vào menu "Bài viết" trên thanh điều hướng chính.\n\n3. **Tạo bài viết mới**: Click nút "Tạo bài viết mới" để mở form soạn thảo.\n\n4. **Điền thông tin**: Nhập tiêu đề, nội dung, chọn danh mục và tags phù hợp.\n\n5. **Gửi duyệt**: Sau khi hoàn thành, click "Gửi duyệt" để Admin kiểm tra và xuất bản.\n\nLưu ý: Bài viết sẽ được review trong vòng 24-48 giờ trước khi xuất bản công khai.',
  category: 'Bài viết & Nội dung',
  tags: ['Hướng dẫn', 'Mới bắt đầu', 'Phổ biến'],
  isPublished: true,
  priority: 2,
  relatedFAQs: [],
  searchKeywords: ['đăng bài', 'tạo bài viết', 'xuất bản', 'gửi duyệt', 'author'],
  viewCount: 1250,
  likeCount: 89,
  createdAt: '2024-01-10T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
});

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState<FAQFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    // Simulate loading FAQ data
    const loadFAQ = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const faq = getMockFAQ(params.id as string);
        setFormData(faq);
      } catch (error) {
        alert('Không thể tải thông tin FAQ');
        router.push('/dashboard/faqs');
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQ();
  }, [params.id, router]);

  const handleInputChange = (field: keyof FAQFormData, value: any) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      tags: prev!.tags.includes(tag)
        ? prev!.tags.filter(t => t !== tag)
        : [...prev!.tags, tag]
    }));
  };

  const handleAddKeyword = () => {
    if (!formData) return;
    const keyword = prompt('Nhập từ khóa tìm kiếm:');
    if (keyword && keyword.trim()) {
      setFormData(prev => ({
        ...prev!,
        searchKeywords: [...prev!.searchKeywords, keyword.trim().toLowerCase()]
      }));
    }
  };

  const handleRemoveKeyword = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      searchKeywords: prev!.searchKeywords.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.question || !formData.answer) {
      alert('Vui lòng nhập câu hỏi và câu trả lời');
      return;
    }

    if (!formData.category) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Auto-generate search keywords from question and answer
      const autoKeywords = [
        ...formData.question.toLowerCase().split(' ').filter(word => word.length > 3),
        ...formData.answer.toLowerCase().split(' ').filter(word => word.length > 3)
      ].slice(0, 10);
      
      const faqData = { 
        ...formData,
        searchKeywords: [...new Set([...formData.searchKeywords, ...autoKeywords])],
        updatedAt: new Date().toISOString()
      };
      console.log('Updating FAQ:', faqData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('FAQ đã được cập nhật thành công!');
      router.push('/dashboard/faqs');
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa FAQ "${formData.question}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('FAQ đã được xóa thành công!');
      router.push('/dashboard/faqs');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
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

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: { text: 'Rất cao', color: 'text-red-600' },
      2: { text: 'Cao', color: 'text-orange-600' },
      3: { text: 'Trung bình', color: 'text-blue-600' },
      4: { text: 'Thấp', color: 'text-gray-600' },
      5: { text: 'Rất thấp', color: 'text-gray-400' }
    };
    return labels[priority as keyof typeof labels] || labels[3];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium text-gray-900">Đang tải FAQ...</div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-900">Không tìm thấy FAQ</div>
          <Button onClick={() => router.push('/dashboard/faqs')} className="mt-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa FAQ</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật nội dung và cài đặt FAQ
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
            disabled={isSubmitting}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Xóa FAQ
          </Button>
        </div>
      </div>

      {/* FAQ Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm text-blue-600">ID: {formData.id}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">Lượt xem: {formData.viewCount}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">Lượt thích: {formData.likeCount}</span>
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-600">Trạng thái:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              formData.isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formData.isPublished ? '✅ Đã xuất bản' : '❌ Nháp'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="basic"
          label="❓ Câu hỏi & Trả lời"
          isActive={activeTab === 'basic'}
          onClick={setActiveTab}
        />
        <TabButton
          id="settings"
          label="⚙️ Cài đặt & Phân loại"
          isActive={activeTab === 'settings'}
          onClick={setActiveTab}
        />
        <TabButton
          id="seo"
          label="🔍 SEO & Từ khóa"
          isActive={activeTab === 'seo'}
          onClick={setActiveTab}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'basic' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Nội dung FAQ</h3>
              
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu hỏi *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="Nhập câu hỏi thường gặp..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Viết câu hỏi rõ ràng và dễ hiểu từ góc nhìn người dùng
                </p>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu trả lời *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => handleInputChange('answer', e.target.value)}
                  placeholder="Nhập câu trả lời chi tiết..."
                  rows={12}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cung cấp câu trả lời đầy đủ, chính xác và dễ hiểu. Có thể sử dụng Markdown.
                </p>
              </div>

              {/* Answer Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem trước câu trả lời
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="prose max-w-none text-sm">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {formData.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Phân loại & Cài đặt</h3>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Chọn danh mục</option>
                  {faqCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ ưu tiên
                </label>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(priority => {
                    const label = getPriorityLabel(priority);
                    return (
                      <label key={priority} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={formData.priority === priority}
                          onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <div>
                          <span className={`font-medium ${label.color}`}>
                            {label.text}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            (Cấp {priority})
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thẻ phân loại
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {formData.tags.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Đã chọn: {formData.tags.join(', ')}
                  </div>
                )}
              </div>

              {/* Published Status */}
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium">Xuất bản</div>
                    <div className="text-sm text-gray-500">
                      FAQ sẽ hiển thị công khai cho người dùng
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tối ưu tìm kiếm</h3>
              
              {/* Search Keywords */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Từ khóa tìm kiếm
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKeyword}
                  >
                    ➕ Thêm từ khóa
                  </Button>
                </div>
                
                {formData.searchKeywords.length > 0 ? (
                  <div className="space-y-2">
                    {formData.searchKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{keyword}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">🔍</div>
                    <p>Chưa có từ khóa nào</p>
                    <p className="text-sm">Thêm từ khóa để người dùng dễ tìm thấy FAQ này</p>
                  </div>
                )}
              </div>

              {/* Performance Analytics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phân tích hiệu suất
                </label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Độ dài câu hỏi:</span>
                      <span className="font-medium ml-2">
                        {formData.question.length} ký tự
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Độ dài trả lời:</span>
                      <span className="font-medium ml-2">
                        {formData.answer.length} ký tự
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lượt xem:</span>
                      <span className="font-medium ml-2 text-blue-600">
                        {formData.viewCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tỷ lệ thích:</span>
                      <span className="font-medium ml-2 text-green-600">
                        {formData.viewCount > 0 
                          ? `${Math.round((formData.likeCount / formData.viewCount) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt xem:</span>
                <span className="font-medium text-blue-600">{formData.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt thích:</span>
                <span className="font-medium text-green-600">{formData.likeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tỷ lệ thích:</span>
                <span className="font-medium">
                  {formData.viewCount > 0 
                    ? `${Math.round((formData.likeCount / formData.viewCount) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ưu tiên:</span>
                <span className={`font-medium ${getPriorityLabel(formData.priority).color}`}>
                  {getPriorityLabel(formData.priority).text}
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
                {isSubmitting ? '⏳ Đang cập nhật...' : '✅ Cập nhật FAQ'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/faqs')}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('isPublished', !formData.isPublished)}
                className="w-full"
              >
                {formData.isPublished ? '👁️‍🗨️ Ẩn FAQ' : '👁️ Hiển thị FAQ'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPriority = formData.priority === 1 ? 3 : 1;
                  handleInputChange('priority', newPriority);
                }}
                className="w-full"
              >
                {formData.priority === 1 ? '⬇️ Giảm ưu tiên' : '⬆️ Tăng ưu tiên'}
              </Button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tạo FAQ</div>
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
