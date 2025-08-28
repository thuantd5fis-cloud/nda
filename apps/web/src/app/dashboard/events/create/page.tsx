'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface EventFormData {
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
}

const eventTags = [
  'Hội thảo', 'Workshop', 'Đào tạo', 'Networking', 'Triển lãm', 
  'Hội nghị', 'Meetup', 'Webinar', 'Khởi nghiệp', 'Công nghệ',
  'AI', 'Blockchain', 'Marketing', 'Design', 'Programming'
];

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useConfirm();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    maxAttendees: 100,
    image: '',
    price: 0,
    isPaid: false,
    isPublic: true,
    tags: [],
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    requiresRegistration: true,
    registrationDeadline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof EventFormData, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startDate) {
      toast.error('Vui lòng nhập tiêu đề, mô tả và thời gian bắt đầu');
      return;
    }

    if (new Date(formData.startDate) < new Date()) {
      toast.error('Thời gian bắt đầu không thể là quá khứ');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const eventData = { 
        ...formData,
        createdAt: new Date().toISOString()
      };
      console.log('Creating event:', eventData);
      
      // Real API call
      const createdEvent = await apiClient.createEvent({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        address: formData.address,
        capacity: formData.capacity,
        price: formData.price,
        currency: formData.currency,
        image: formData.image,
        tags: formData.tags,
        isOnline: formData.isOnline,
        meetingUrl: formData.meetingUrl,
        status: 'DRAFT',
        requiresApproval: formData.requiresApproval,
        allowWaitlist: formData.allowWaitlist,
      });
      
      console.log('✅ Event created successfully:', createdEvent);
      toast.success('Sự kiện đã được tạo thành công!');
      router.push('/dashboard/events');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo sự kiện');
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

  // Generate default registration deadline (1 day before start)
  const defaultDeadline = formData.startDate ? 
    new Date(new Date(formData.startDate).getTime() - 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 16) : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo sự kiện mới</h1>
          <p className="text-gray-600 mt-2">
            Tổ chức và quản lý sự kiện, hội thảo, workshop
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
        {/* Main Form */}
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
                {formData.tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Đã chọn: {formData.tags.join(', ')}</p>
                  </div>
                )}
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
                  Để 0 nếu không giới hạn số lượng
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
                    value={formData.registrationDeadline || defaultDeadline}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mặc định là 1 ngày trước khi sự kiện bắt đầu
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước sự kiện</h3>
            <div className="space-y-3">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Event"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {formData.title || 'Tên sự kiện'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formData.description.slice(0, 100) || 'Mô tả sự kiện...'}
                  {formData.description.length > 100 && '...'}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {formData.startDate && (
                  <div className="flex items-center gap-2">
                    <span>🕒</span>
                    <span>{new Date(formData.startDate).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                {formData.location && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{formData.location}</span>
                  </div>
                )}
                {formData.isPaid && (
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>{formData.price.toLocaleString()} VNĐ</span>
                  </div>
                )}
                {formData.maxAttendees > 0 && (
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>Tối đa {formData.maxAttendees} người</span>
                  </div>
                )}
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {formData.tags.length > 3 && (
                    <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{formData.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
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
                {isSubmitting ? '⏳ Đang tạo...' : '✅ Tạo sự kiện'}
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

          {/* Guidelines */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Mẹo tổ chức</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Tên sự kiện nên rõ ràng và thu hút</li>
              <li>• Mô tả chi tiết nội dung và lợi ích</li>
              <li>• Chọn thời gian phù hợp với đối tượng</li>
              <li>• Địa điểm dễ tiếp cận và thuận tiện</li>
              <li>• Đặt hạn đăng ký trước 1-2 ngày</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
