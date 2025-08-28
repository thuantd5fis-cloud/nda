'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  priority: number;
  relatedFAQs: string[];
  searchKeywords: string[];
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

export default function CreateFAQPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FAQFormData>({
    question: '',
    answer: '',
    category: '',
    tags: [],
    isPublished: true,
    priority: 3,
    relatedFAQs: [],
    searchKeywords: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof FAQFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddKeyword = () => {
    const keyword = prompt('Nhập từ khóa tìm kiếm:');
    if (keyword && keyword.trim()) {
      setFormData(prev => ({
        ...prev,
        searchKeywords: [...prev.searchKeywords, keyword.trim().toLowerCase()]
      }));
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      searchKeywords: prev.searchKeywords.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question || !formData.answer) {
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
        createdAt: new Date().toISOString()
      };
      console.log('Creating FAQ:', faqData);
      
      // Real API call
      const createdFAQ = await apiClient.createFAQ({
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags: formData.tags,
        priority: formData.priority || 1,
        isPublished: formData.isPublished,
        language: 'vi',
        helpfulCount: 0,
        viewCount: 0,
      });
      
      console.log('✅ FAQ created successfully:', createdFAQ);
      alert('FAQ đã được tạo thành công!');
      router.push('/dashboard/faqs');
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo FAQ');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo FAQ mới</h1>
          <p className="text-gray-600 mt-2">
            Thêm câu hỏi thường gặp để hỗ trợ người dùng
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
                  rows={8}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cung cấp câu trả lời đầy đủ, chính xác và dễ hiểu. Có thể sử dụng Markdown.
                </p>
              </div>

              {/* Answer Preview */}
              {formData.answer && (
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
              )}
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
                <p className="text-xs text-gray-500 mt-2">
                  FAQ có mức độ ưu tiên cao hơn sẽ hiển thị trước trong kết quả tìm kiếm
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thẻ phân loại
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {commonTags.map((tag: string) => (
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
                    <div className="font-medium">Xuất bản ngay</div>
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
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Mẹo:</strong> Hệ thống sẽ tự động tạo từ khóa từ câu hỏi và câu trả lời. 
                    Bạn chỉ cần thêm những từ khóa đặc biệt mà người dùng có thể tìm kiếm.
                  </p>
                </div>
              </div>

              {/* Question Length Analysis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phân tích câu hỏi
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
                      <span className="text-gray-600">Số từ:</span>
                      <span className="font-medium ml-2">
                        {formData.question.trim().split(' ').length} từ
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Độ dài trả lời:</span>
                      <span className="font-medium ml-2">
                        {formData.answer.length} ký tự
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Khả năng tìm thấy:</span>
                      <span className={`font-medium ml-2 ${
                        formData.question.length > 10 && formData.answer.length > 50 
                          ? 'text-green-600' 
                          : formData.question.length > 5 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {formData.question.length > 10 && formData.answer.length > 50 
                          ? 'Tốt' 
                          : formData.question.length > 5 
                          ? 'Trung bình' 
                          : 'Cần cải thiện'
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
          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước FAQ</h3>
            <div className="space-y-4">
              {/* Question Preview */}
              <div>
                <div className="flex items-start gap-3">
                  <div className="text-primary text-lg mt-1">❓</div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formData.question || 'Câu hỏi sẽ hiển thị ở đây...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Preview */}
              <div className="ml-6 pl-4 border-l-2 border-gray-200">
                <div className="text-gray-700 text-sm">
                  {formData.answer 
                    ? formData.answer.slice(0, 150) + (formData.answer.length > 150 ? '...' : '')
                    : 'Câu trả lời sẽ hiển thị ở đây...'
                  }
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
                {formData.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📁 Danh mục:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {formData.category}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">⭐ Ưu tiên:</span>
                  <span className={`font-medium ${getPriorityLabel(formData.priority).color}`}>
                    {getPriorityLabel(formData.priority).text}
                  </span>
                </div>

                {formData.tags.length > 0 && (
                  <div>
                    <span className="text-gray-500 block mb-1">🏷️ Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {formData.tags.length > 3 && (
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{formData.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                {isSubmitting ? '⏳ Đang tạo...' : '✅ Tạo FAQ'}
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

          {/* Guidelines */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Hướng dẫn viết FAQ</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Câu hỏi nên ngắn gọn và rõ ràng</li>
              <li>• Trả lời chi tiết, đầy đủ thông tin</li>
              <li>• Sử dụng ngôn ngữ dễ hiểu</li>
              <li>• Phân loại chính xác theo danh mục</li>
              <li>• Thêm từ khóa phù hợp để dễ tìm kiếm</li>
              <li>• Ưu tiên cao cho câu hỏi phổ biến</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
