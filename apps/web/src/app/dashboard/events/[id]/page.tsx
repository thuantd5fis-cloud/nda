'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';

interface Event {
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
  attendees: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    registeredAt: string;
    paymentStatus: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Mock data for event detail
const getMockEvent = (id: string): Event => ({
  id,
  title: 'Workshop: Phát triển Web với Next.js 14',
  description: 'Học cách xây dựng ứng dụng web hiện đại với Next.js 14, React Server Components và App Router. Workshop thực hành từ cơ bản đến nâng cao, phù hợp cho developers muốn nâng cao kỹ năng.\n\nNội dung bao gồm:\n- Giới thiệu Next.js 14 và App Router\n- React Server Components\n- Streaming và Suspense\n- Data fetching patterns\n- Optimizations và best practices\n- Deployment và performance\n\nYêu cầu:\n- Kiến thức cơ bản về React\n- Laptop cá nhân\n- Node.js đã cài đặt',
  startDate: '2024-02-15T09:00:00Z',
  endDate: '2024-02-15T17:00:00Z',
  location: 'Hà Nội',
  venue: 'FPT Tower, 17 Duy Tân, Cầu Giấy, Hà Nội',
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
  registrationDeadline: '2024-02-13T23:59:00Z',
  status: 'upcoming',
  attendeesCount: 32,
  attendees: [
    {
      id: '1',
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      registeredAt: '2024-01-20T10:30:00Z',
      paymentStatus: 'paid',
    },
    {
      id: '2',
      fullName: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0909876543',
      registeredAt: '2024-01-21T14:15:00Z',
      paymentStatus: 'paid',
    },
    {
      id: '3',
      fullName: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0912345678',
      registeredAt: '2024-01-22T09:45:00Z',
      paymentStatus: 'pending',
    },
    {
      id: '4',
      fullName: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0987654321',
      registeredAt: '2024-01-23T16:20:00Z',
      paymentStatus: 'paid',
    },
  ],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
});

const getStatusBadge = (status: string) => {
  const statusConfig = {
    upcoming: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800', icon: '📅' },
    ongoing: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800', icon: '🟢' },
    completed: { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800', icon: '✅' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${config.color}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const getPaymentStatusBadge = (status: string) => {
  const statusConfig = {
    paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
    pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
    refunded: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
    failed: { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function EventDetailPage() {
  const router = useRouter();
  const { confirmDelete, toast } = useConfirm();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch event data using React Query
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', params.id],
    queryFn: () => apiClient.getEvent(params.id as string),
    enabled: !!params.id,
  });

  const handleDelete = async () => {
    if (!event) return;
    
    if (event.attendeesCount > 0) {
      alert(`Không thể xóa sự kiện này vì đã có ${event.attendeesCount} người đăng ký. Vui lòng hủy sự kiện thay vì xóa.`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event.title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Sự kiện đã được xóa thành công!');
      router.push('/dashboard/events');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa sự kiện');
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
          <div className="text-lg font-medium text-gray-900">Đang tải sự kiện...</div>
        </div>
      </div>
    );
  }

  if (!event) {
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
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết sự kiện</h1>
          <p className="text-gray-600 mt-2">
            Xem thông tin chi tiết và quản lý sự kiện
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/events')}
          >
            ← Danh sách sự kiện
          </Button>
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button variant="outline">
              ✏️ Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={event.attendeesCount > 0}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Xóa
          </Button>
        </div>
      </div>

      {/* Event Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {/* Event Image */}
          <div className="md:w-1/3">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-gray-400 mb-2">📅</div>
                  <div className="text-gray-500">Không có hình ảnh</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Event Info */}
          <div className="md:w-2/3 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(event.status)}
                  {!event.isPublic && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      🔒 Riêng tư
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>ID: {event.id}</div>
                <div>Tạo: {new Date(event.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">🕒</span>
                  <div>
                    <div className="font-medium">
                      {new Date(event.startDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {event.endDate && (
                        ` - ${new Date(event.endDate).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="font-medium">{event.location}</div>
                    {event.venue && <div className="text-sm text-gray-500">{event.venue}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">👥</span>
                  <div>
                    <div className="font-medium">
                      {event.attendeesCount} người đăng ký
                      {event.maxAttendees > 0 && ` / ${event.maxAttendees}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.maxAttendees > 0 
                        ? `Còn ${event.maxAttendees - event.attendeesCount} chỗ`
                        : 'Không giới hạn'
                      }
                    </div>
                  </div>
                </div>

                {event.isPaid && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">💰</span>
                    <div>
                      <div className="font-medium text-green-600">
                        {event.price.toLocaleString()} VNĐ
                      </div>
                      <div className="text-sm text-gray-500">Phí tham gia</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer & Contact */}
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-600">Đơn vị tổ chức</div>
                  <div className="font-medium">{event.organizer}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600">Liên hệ</div>
                  <div className="space-y-1">
                    {event.contactEmail && (
                      <div className="text-sm">
                        📧 <a href={`mailto:${event.contactEmail}`} className="text-blue-600 hover:underline">
                          {event.contactEmail}
                        </a>
                      </div>
                    )}
                    {event.contactPhone && (
                      <div className="text-sm">
                        📱 <a href={`tel:${event.contactPhone}`} className="text-blue-600 hover:underline">
                          {event.contactPhone}
                        </a>
                      </div>
                    )}
                    {event.website && (
                      <div className="text-sm">
                        🌐 <a href={event.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website sự kiện
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {event.requiresRegistration && (
                  <div>
                    <div className="text-sm font-medium text-gray-600">Hạn đăng ký</div>
                    <div className="text-sm">
                      {new Date(event.registrationDeadline).toLocaleString('vi-VN')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Người đăng ký</p>
              <p className="text-3xl font-bold text-blue-600">{event.attendeesCount}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {event.maxAttendees > 0 && `/${event.maxAttendees} slots`}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-3xl font-bold text-green-600">
                {event.isPaid 
                  ? `${(event.attendeesCount * event.price).toLocaleString()}`
                  : '0'
                }
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">VNĐ</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
              <p className="text-3xl font-bold text-purple-600">
                {event.maxAttendees > 0 
                  ? `${Math.round((event.attendeesCount / event.maxAttendees) * 100)}%`
                  : 'N/A'
                }
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ngày còn lại</p>
              <p className="text-3xl font-bold text-orange-600">
                {Math.ceil((new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">ngày</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="overview"
          label="📋 Tổng quan"
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="attendees"
          label={`👥 Người tham gia (${event.attendeesCount})`}
          isActive={activeTab === 'attendees'}
          onClick={setActiveTab}
        />
        <TabButton
          id="settings"
          label="⚙️ Cài đặt"
          isActive={activeTab === 'settings'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sự kiện</h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {event.description}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendees' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách người tham gia ({event.attendeesCount})
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Đã thanh toán: {event.attendees.filter(a => a.paymentStatus === 'paid').length}</span>
                <span>•</span>
                <span>Chờ thanh toán: {event.attendees.filter(a => a.paymentStatus === 'pending').length}</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng ký
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {event.attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {attendee.fullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{attendee.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>📧 {attendee.email}</div>
                      {attendee.phone && <div>📱 {attendee.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(attendee.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attendee.registeredAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {event.attendees.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <div className="text-lg font-medium text-gray-900 mb-2">Chưa có người đăng ký</div>
              <div className="text-gray-500">Sự kiện chưa có người tham gia nào</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt sự kiện</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Loại sự kiện:</span>
                <span className="font-medium">{event.isPublic ? 'Công khai' : 'Riêng tư'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yêu cầu đăng ký:</span>
                <span className="font-medium">{event.requiresRegistration ? 'Có' : 'Không'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Có phí tham gia:</span>
                <span className="font-medium">{event.isPaid ? 'Có' : 'Miễn phí'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giới hạn người tham gia:</span>
                <span className="font-medium">{event.maxAttendees > 0 ? event.maxAttendees : 'Không giới hạn'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div>
                <div className="font-medium text-gray-900">Sự kiện được tạo</div>
                <div className="text-sm text-gray-500">
                  {new Date(event.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Cập nhật gần nhất</div>
                <div className="text-sm text-gray-500">
                  {new Date(event.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
              {event.requiresRegistration && (
                <div>
                  <div className="font-medium text-gray-900">Hạn chót đăng ký</div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.registrationDeadline).toLocaleString('vi-VN')}
                  </div>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">Thời gian diễn ra</div>
                <div className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleString('vi-VN')}
                  {event.endDate && (
                    <> đến {new Date(event.endDate).toLocaleString('vi-VN')}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
