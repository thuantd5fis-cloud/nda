'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@cms/ui';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  priority: number;
  searchKeywords: string[];
  viewCount: number;
  likeCount: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  relatedFAQs: Array<{
    id: string;
    question: string;
    category: string;
  }>;
  feedback: Array<{
    id: string;
    type: 'helpful' | 'not_helpful';
    comment?: string;
    createdAt: string;
    user: {
      name: string;
      avatar: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

// Mock data for FAQ detail
const getMockFAQ = (id: string): FAQ => ({
  id,
  question: 'Làm thế nào để đăng bài viết trên hệ thống?',
  answer: 'Để đăng bài viết trên hệ thống, bạn cần làm theo các bước sau:\n\n**1. Đăng nhập tài khoản**\nTrước tiên, bạn cần đăng nhập với tài khoản có quyền đăng bài (Author trở lên).\n\n**2. Vào menu Bài viết**\nClick vào menu "Bài viết" trên thanh điều hướng chính.\n\n**3. Tạo bài viết mới**\nClick nút "Tạo bài viết mới" để mở form soạn thảo.\n\n**4. Điền thông tin**\n- Nhập tiêu đề hấp dẫn và rõ ràng\n- Viết nội dung chất lượng\n- Chọn danh mục phù hợp\n- Thêm tags liên quan\n- Upload hình ảnh nếu cần\n\n**5. Gửi duyệt**\nSau khi hoàn thành, click "Gửi duyệt" để Admin kiểm tra và xuất bản.\n\n**Lưu ý quan trọng:**\n- Bài viết sẽ được review trong vòng 24-48 giờ\n- Đảm bảo nội dung tuân thủ quy định cộng đồng\n- Sử dụng hình ảnh có bản quyền hợp pháp\n- Kiểm tra chính tả trước khi gửi',
  category: 'Bài viết & Nội dung',
  tags: ['Hướng dẫn', 'Mới bắt đầu', 'Phổ biến'],
  isPublished: true,
  priority: 2,
  searchKeywords: ['đăng bài', 'tạo bài viết', 'xuất bản', 'gửi duyệt', 'author', 'nội dung'],
  viewCount: 1250,
  likeCount: 89,
  author: {
    id: '1',
    name: 'Support Team',
    avatar: '/images/avatars/support.jpg'
  },
  relatedFAQs: [
    {
      id: '2',
      question: 'Làm thế nào để chỉnh sửa bài viết đã đăng?',
      category: 'Bài viết & Nội dung'
    },
    {
      id: '3',
      question: 'Tại sao bài viết của tôi chưa được duyệt?',
      category: 'Bài viết & Nội dung'
    },
    {
      id: '4',
      question: 'Cách thêm hình ảnh vào bài viết?',
      category: 'Bài viết & Nội dung'
    }
  ],
  feedback: [
    {
      id: '1',
      type: 'helpful',
      comment: 'Rất chi tiết và dễ hiểu! Cảm ơn team.',
      createdAt: '2024-01-20T10:30:00Z',
      user: {
        name: 'Nguyễn Văn A',
        avatar: '/images/users/user-1.jpg'
      }
    },
    {
      id: '2',
      type: 'helpful',
      createdAt: '2024-01-19T15:20:00Z',
      user: {
        name: 'Trần Thị B',
        avatar: '/images/users/user-2.jpg'
      }
    },
    {
      id: '3',
      type: 'not_helpful',
      comment: 'Cần thêm ví dụ cụ thể hơn về cách chọn danh mục.',
      createdAt: '2024-01-18T09:45:00Z',
      user: {
        name: 'Lê Văn C',
        avatar: '/images/users/user-3.jpg'
      }
    }
  ],
  createdAt: '2024-01-10T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
});

const getPriorityBadge = (priority: number) => {
  const priorities = {
    1: { text: 'Rất cao', color: 'bg-red-100 text-red-800', icon: '🔥' },
    2: { text: 'Cao', color: 'bg-orange-100 text-orange-800', icon: '⭐' },
    3: { text: 'Trung bình', color: 'bg-blue-100 text-blue-800', icon: '📌' },
    4: { text: 'Thấp', color: 'bg-gray-100 text-gray-800', icon: '📎' },
    5: { text: 'Rất thấp', color: 'bg-gray-50 text-gray-600', icon: '📋' }
  };

  const config = priorities[priority as keyof typeof priorities] || priorities[3];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      <span>{config.icon}</span>
      {config.text}
    </span>
  );
};

export default function FAQDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [faq, setFAQ] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const faqData = getMockFAQ(params.id as string);
        setFAQ(faqData);
      } catch (error) {
        alert('Không thể tải thông tin FAQ');
        router.push('/dashboard/faqs');
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQ();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!faq) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa FAQ "${faq.question}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('FAQ đã được xóa thành công!');
      router.push('/dashboard/faqs');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa FAQ');
    }
  };

  const handleToggleStatus = async () => {
    if (!faq) return;
    
    const action = faq.isPublished ? 'ẩn' : 'hiển thị';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} FAQ này?`)) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setFAQ(prev => prev ? { ...prev, isPublished: !prev.isPublished } : null);
        alert(`FAQ đã được ${action} thành công!`);
      } catch (error) {
        alert(`Có lỗi xảy ra khi ${action} FAQ`);
      }
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

  if (!faq) {
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
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết FAQ</h1>
          <p className="text-gray-600 mt-2">
            Xem chi tiết và quản lý FAQ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/faqs')}
          >
            ← Danh sách FAQ
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
          >
            {faq.isPublished ? '👁️‍🗨️ Ẩn FAQ' : '👁️ Hiển thị FAQ'}
          </Button>
          <Link href={`/dashboard/faqs/${faq.id}/edit`}>
            <Button variant="outline">
              ✏️ Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Xóa
          </Button>
        </div>
      </div>

      {/* FAQ Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  faq.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {faq.isPublished ? '✅ Đã xuất bản' : '❌ Nháp'}
                </span>
                {getPriorityBadge(faq.priority)}
                <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  📁 {faq.category}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {faq.question}
              </h2>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>ID: {faq.id}</span>
                <span>👁️ {faq.viewCount.toLocaleString()} lượt xem</span>
                <span>👍 {faq.likeCount} lượt thích</span>
                <span>Tạo: {new Date(faq.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Tác giả</div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {faq.author.avatar ? (
                      <img
                        src={faq.author.avatar}
                        alt={faq.author.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      faq.author.name.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-medium">{faq.author.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {faq.tags.map((tag: string) => (
              <span key={tag} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                🏷️ {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lượt xem</p>
              <p className="text-3xl font-bold text-blue-600">{faq.viewCount.toLocaleString()}</p>
            </div>
            <div className="text-2xl">👁️</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lượt thích</p>
              <p className="text-3xl font-bold text-green-600">{faq.likeCount}</p>
            </div>
            <div className="text-2xl">👍</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hữu ích</p>
              <p className="text-3xl font-bold text-purple-600">
                {faq.viewCount > 0 
                  ? `${Math.round((faq.likeCount / faq.viewCount) * 100)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Feedback</p>
              <p className="text-3xl font-bold text-orange-600">{faq.feedback.length}</p>
            </div>
            <div className="text-2xl">💬</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="content"
          label="📋 Nội dung"
          isActive={activeTab === 'content'}
          onClick={setActiveTab}
        />
        <TabButton
          id="feedback"
          label={`💬 Feedback (${faq.feedback.length})`}
          isActive={activeTab === 'feedback'}
          onClick={setActiveTab}
        />
        <TabButton
          id="related"
          label={`🔗 Liên quan (${faq.relatedFAQs.length})`}
          isActive={activeTab === 'related'}
          onClick={setActiveTab}
        />
        <TabButton
          id="seo"
          label="🔍 SEO & Từ khóa"
          isActive={activeTab === 'seo'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Câu trả lời</h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {faq.answer}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Phản hồi từ người dùng ({faq.feedback.length})
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👍 Hữu ích: {faq.feedback.filter(f => f.type === 'helpful').length}</span>
                <span>👎 Không hữu ích: {faq.feedback.filter(f => f.type === 'not_helpful').length}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {faq.feedback.length > 0 ? (
              <div className="space-y-4">
                {faq.feedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {feedback.user.avatar ? (
                          <img
                            src={feedback.user.avatar}
                            alt={feedback.user.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          feedback.user.name.charAt(0)
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{feedback.user.name}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            feedback.type === 'helpful' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {feedback.type === 'helpful' ? '👍 Hữu ích' : '👎 Không hữu ích'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        
                        {feedback.comment && (
                          <div className="text-gray-700 text-sm">
                            {feedback.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium text-gray-900 mb-2">Chưa có phản hồi</div>
                <div className="text-gray-500">FAQ này chưa nhận được phản hồi nào</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'related' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              FAQ liên quan ({faq.relatedFAQs.length})
            </h3>
          </div>
          
          <div className="p-6">
            {faq.relatedFAQs.length > 0 ? (
              <div className="space-y-3">
                {faq.relatedFAQs.map((relatedFAQ) => (
                  <div key={relatedFAQ.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Link href={`/dashboard/faqs/${relatedFAQ.id}`} className="block">
                      <div className="flex items-start gap-3">
                        <div className="text-primary text-lg mt-1">❓</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 hover:text-primary transition-colors">
                            {relatedFAQ.question}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            📁 {relatedFAQ.category}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🔗</div>
                <div className="text-lg font-medium text-gray-900 mb-2">Chưa có FAQ liên quan</div>
                <div className="text-gray-500">Chưa thiết lập FAQ nào liên quan đến câu hỏi này</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Keywords */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Từ khóa tìm kiếm ({faq.searchKeywords.length})
            </h3>
            {faq.searchKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {faq.searchKeywords.map((keyword, index) => (
                  <span key={index} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    🔍 {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">🔍</div>
                <p>Chưa có từ khóa nào</p>
              </div>
            )}
          </div>

          {/* Content Analysis */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích nội dung</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Độ dài câu hỏi:</span>
                  <div className="font-medium">{faq.question.length} ký tự</div>
                </div>
                <div>
                  <span className="text-gray-600">Độ dài trả lời:</span>
                  <div className="font-medium">{faq.answer.length} ký tự</div>
                </div>
                <div>
                  <span className="text-gray-600">Số từ câu hỏi:</span>
                  <div className="font-medium">{faq.question.trim().split(' ').length} từ</div>
                </div>
                <div>
                  <span className="text-gray-600">Số từ trả lời:</span>
                  <div className="font-medium">{faq.answer.trim().split(' ').length} từ</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Điểm SEO tổng thể:</div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    faq.question.length > 10 && faq.answer.length > 50 && faq.searchKeywords.length > 3
                      ? 'bg-green-100 text-green-800'
                      : faq.question.length > 5 && faq.answer.length > 20
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {faq.question.length > 10 && faq.answer.length > 50 && faq.searchKeywords.length > 3
                      ? '✅ Tốt'
                      : faq.question.length > 5 && faq.answer.length > 20
                      ? '⚠️ Trung bình'
                      : '❌ Cần cải thiện'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
