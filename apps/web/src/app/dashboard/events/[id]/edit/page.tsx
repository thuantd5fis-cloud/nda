'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input } from '@cms/ui';
import { useConfirm } from '@/hooks/use-confirm';

interface EventFormData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  maxAttendees: number;
  image: string;
  price: number;
  isPaid: boolean;
  isPublic: boolean;
  tags: string[];
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  requiresRegistration: boolean;
  registrationDeadline: string;
  status: string;
  attendeesCount: number;
  createdAt: string;
  updatedAt: string;
}

const eventTags = [
  'Hội thảo', 'Workshop', 'Đào tạo', 'Networking', 'Triển lãm', 
  'Hội nghị', 'Meetup', 'Webinar', 'Khởi nghiệp', 'Công nghệ',
  'AI', 'Blockchain', 'Marketing', 'Design', 'Programming'
];

// Mock data for existing event
const getMockEvent = (id: string): EventFormData => ({
  id,
  title: 'Workshop: Phát triển Web với Next.js 14',
  description: 'Học cách xây dựng ứng dụng web hiện đại với Next.js 14, React Server Components và App Router. Workshop thực hành từ cơ bản đến nâng cao, phù hợp cho developers muốn nâng cao kỹ năng.',
  startDate: '2024-02-15T09:00',
  endDate: '2024-02-15T17:00',
  location: 'Hà Nội',
  venue: 'FPT Tower, 17 Duy Tân, Cầu Giấy',
  maxAttendees: 50,
  image: '/images/events/nextjs-workshop.jpg',
  price: 500000,
  isPaid: true,
  isPublic: true,
  tags: ['Workshop', 'Programming', 'Công nghệ'],
  organizer: 'Tech Community VN',
  contactEmail: 'events@techcommunity.vn',
  contactPhone: '0901234567',
  website: 'https://nextjs-workshop.com',
  requiresRegistration: true,
  registrationDeadline: '2024-02-13T23:59',
  status: 'upcoming',
  attendeesCount: 32,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
});

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { confirmDelete, toast } = useConfirm();
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    // Simulate loading event data
    const loadEvent = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const event = getMockEvent(params.id as string);
        setFormData(event);
      } catch (error) {
        alert('Không thể tải thông tin sự kiện');
        router.push('/dashboard/events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [params.id, router]);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.title || !formData.description || !formData.startDate) {
      alert('Vui lòng nhập tiêu đề, mô tả và thời gian bắt đầu');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const eventData = { 
        ...formData,
        updatedAt: new Date().toISOString()
      };
      console.log('Updating event:', eventData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Sự kiện đã được cập nhật thành công!');
      router.push('/dashboard/events');
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật sự kiện');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    if (formData.attendeesCount > 0) {
      alert(`Không thể xóa sự kiện này vì đã có ${formData.attendeesCount} người đăng ký. Vui lòng hủy sự kiện thay vì xóa.`);
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Sự kiện đã được xóa thành công!');
      router.push('/dashboard/events');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa sự kiện');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!formData) return;
    
    const statusNames = {
      upcoming: 'Sắp diễn ra',
      ongoing: 'Đang diễn ra', 
      completed: 'Đã kết thúc',
      cancelled: 'Đã hủy'
    };

    const currentName = statusNames[formData.status as keyof typeof statusNames];
    const newName = statusNames[newStatus as keyof typeof statusNames];

    if (window.confirm(`Bạn có chắc chắn muốn thay đổi trạng thái từ "${currentName}" thành "${newName}"?`)) {
      try {
        setFormData(prev => prev ? { ...prev, status: newStatus } : null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        alert(`Trạng thái sự kiện đã được cập nhật thành "${newName}"!`);
      } catch (error) {
        alert('Có lỗi xảy ra khi cập nhật trạng thái');
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' },
      ongoing: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' },
      completed: { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium text-gray-900">Đang tải sự kiện...</div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-gray-900">Không tìm thấy sự kiện</div>
          <Button onClick={() => router.push('/dashboard/events')} className="mt-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sự kiện</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin sự kiện và quản lý trạng thái
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
            disabled={isSubmitting || formData.attendeesCount > 0}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Xóa sự kiện
          </Button>
        </div>
      </div>

      {/* Event Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm text-blue-600">ID: {formData.id}</span>
            </div>
            <div>
              <span className="text-sm text-blue-600">Người đăng ký: {formData.attendeesCount}</span>
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
            {getStatusBadge(formData.status)}
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý trạng thái</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleChangeStatus('upcoming')}
            disabled={formData.status === 'upcoming'}
            className="text-blue-600 border-blue-600"
          >
            📅 Sắp diễn ra
          </Button>
          <Button
            variant="outline"
            onClick={() => handleChangeStatus('ongoing')}
            disabled={formData.status === 'ongoing'}
            className="text-green-600 border-green-600"
          >
            🟢 Đang diễn ra
          </Button>
          <Button
            variant="outline"
            onClick={() => handleChangeStatus('completed')}
            disabled={formData.status === 'completed'}
            className="text-gray-600 border-gray-600"
          >
            ✅ Đã kết thúc
          </Button>
          <Button
            variant="outline"
            onClick={() => handleChangeStatus('cancelled')}
            disabled={formData.status === 'cancelled'}
            className="text-red-600 border-red-600"
          >
            ❌ Hủy sự kiện
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="basic"
          label="📝 Thông tin cơ bản"
          isActive={activeTab === 'basic'}
          onClick={setActiveTab}
        />
        <TabButton
          id="details"
          label="📍 Chi tiết & Địa điểm"
          isActive={activeTab === 'details'}
          onClick={setActiveTab}
        />
        <TabButton
          id="registration"
          label="🎫 Đăng ký & Phí"
          isActive={activeTab === 'registration'}
          onClick={setActiveTab}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Same as create but with existing data */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'basic' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sự kiện *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tên sự kiện..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả sự kiện *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về sự kiện..."
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bắt đầu *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Thay đổi thời gian có thể ảnh hưởng đến người đăng ký
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian kết thúc
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Event Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh sự kiện
                </label>
                <div className="space-y-3">
                  <Input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thẻ sự kiện
                </label>
                <div className="flex flex-wrap gap-2">
                  {eventTags.map(tag => (
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
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết & Địa điểm</h3>
              
              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố/Tỉnh
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Hà Nội, TP.HCM, ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm cụ thể
                  </label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Tên địa điểm, địa chỉ..."
                  />
                </div>
              </div>

              {/* Organizer Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị tổ chức
                </label>
                <Input
                  value={formData.organizer}
                  onChange={(e) => handleInputChange('organizer', e.target.value)}
                  placeholder="Tên đơn vị/tổ chức"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email liên hệ
                  </label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="0901234567"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website sự kiện
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://event-website.com"
                />
              </div>

              {/* Max Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số người tham gia tối đa
                </label>
                <Input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hiện có {formData.attendeesCount} người đăng ký
                </p>
              </div>
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Đăng ký & Phí tham gia</h3>
              
              {/* Registration Settings */}
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresRegistration}
                    onChange={(e) => handleInputChange('requiresRegistration', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium">Yêu cầu đăng ký</div>
                    <div className="text-sm text-gray-500">Người tham gia cần đăng ký trước</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium">Sự kiện công khai</div>
                    <div className="text-sm text-gray-500">Hiển thị với mọi người</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPaid}
                    onChange={(e) => handleInputChange('isPaid', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium">Sự kiện có phí</div>
                    <div className="text-sm text-gray-500">Người tham gia cần thanh toán phí</div>
                  </div>
                </label>
              </div>

              {/* Price */}
              {formData.isPaid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phí tham gia (VNĐ)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="100000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Thay đổi giá có thể ảnh hưởng đến người đã đăng ký
                  </p>
                </div>
              )}

              {/* Registration Deadline */}
              {formData.requiresRegistration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn chót đăng ký
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  />
                </div>
              )}
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
                <span className="text-gray-600">Người đăng ký:</span>
                <span className="font-medium">{formData.attendeesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giới hạn:</span>
                <span className="font-medium">{formData.maxAttendees || 'Không giới hạn'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tỷ lệ lấp đầy:</span>
                <span className="font-medium">
                  {formData.maxAttendees ? 
                    `${Math.round((formData.attendeesCount / formData.maxAttendees) * 100)}%` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                {getStatusBadge(formData.status)}
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
                {isSubmitting ? '⏳ Đang cập nhật...' : '✅ Cập nhật sự kiện'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/events')}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Warning */}
          {formData.attendeesCount > 0 && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Lưu ý</h3>
              <p className="text-sm text-yellow-800">
                Sự kiện này đã có {formData.attendeesCount} người đăng ký. Thay đổi thông tin có thể ảnh hưởng đến người tham gia.
              </p>
            </div>
          )}

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tạo sự kiện</div>
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
