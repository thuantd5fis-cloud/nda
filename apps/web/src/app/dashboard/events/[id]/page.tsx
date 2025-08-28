'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import {
  ArrowLeftIcon, CalendarIcon, LocationIcon, UserIcon, ClockIcon,
  EventIcon, CheckIcon, XIcon, EditIcon, TrashIcon, PlusIcon
} from '@/components/icons';

interface Event {
  id: string;
  title: string;
  description: string;
  content: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  venue: string;
  maxAttendees: number;
  capacity: number;
  image: string;
  price: number;
  currency: string;
  isPaid: boolean;
  isPublic: boolean;
  isOnline: boolean;
  meetingUrl: string;
  tags: string[];
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  requiresRegistration: boolean;
  requiresApproval: boolean;
  allowWaitlist: boolean;
  registrationDeadline: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  attendeesCount: number;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  registrations?: Array<{
    id: string;
    fullName: string;
    email: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    registeredAt: string;
  }>;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { confirmWarning } = useConfirm();
  const [activeTab, setActiveTab] = useState('details');

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', params.id],
    queryFn: () => apiClient.getEvent(params.id as string),
  });

  const handleEdit = () => {
    router.push(`/dashboard/events/${params.id}/edit`);
  };

  const handleDelete = async () => {
    const confirmed = await confirmWarning(
      'Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.',
      {
        title: 'Xóa sự kiện',
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    );

    if (confirmed) {
      try {
        await apiClient.deleteEvent(params.id as string);
        router.push('/dashboard/events');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy sự kiện
            </h1>
            <p className="text-gray-600 mb-6">
              Sự kiện không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => router.push('/dashboard/events')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }: {
    id: string;
    label: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/events')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết sự kiện
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <EditIcon className="w-4 h-4" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
              Xóa
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 sticky top-6">
              <TabButton
                id="details"
                label="Chi tiết"
                icon={EventIcon}
                isActive={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
              />
              <TabButton
                id="registrations"
                label="Đăng ký"
                icon={UserIcon}
                isActive={activeTab === 'registrations'}
                onClick={() => setActiveTab('registrations')}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {event.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                      event.status === 'ONGOING' ? 'bg-green-100 text-green-700' :
                      event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {event.status === 'UPCOMING' ? 'Sắp diễn ra' :
                       event.status === 'ONGOING' ? 'Đang diễn ra' :
                       event.status === 'COMPLETED' ? 'Đã hoàn thành' :
                       'Đã hủy'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Thời gian bắt đầu</p>
                        <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                      </div>
                    </div>

                    {event.endDate && (
                      <div className="flex items-start gap-3">
                        <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Thời gian kết thúc</p>
                          <p className="text-sm text-gray-600">{formatDate(event.endDate)}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <LocationIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Địa điểm</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        {event.address && (
                          <p className="text-sm text-gray-500">{event.address}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Số lượng tham gia</p>
                        <p className="text-sm text-gray-600">
                          {event.attendeesCount} / {event.maxAttendees} người
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Mô tả</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'registrations' && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Danh sách đăng ký ({event.attendeesCount})
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {event.registrations && event.registrations.length > 0 ? (
                    event.registrations.map((registration: any) => (
                      <div key={registration.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {registration.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {registration.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              Đăng ký: {formatDate(registration.registeredAt)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            registration.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            registration.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {registration.status === 'CONFIRMED' ? 'Đã xác nhận' :
                             registration.status === 'PENDING' ? 'Chờ xác nhận' :
                             'Đã hủy'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Chưa có người nào đăng ký
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
