'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';

// Event Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const EventCard = ({ event }: { event: any }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-white text-6xl">📅</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <StatusBadge status={event.status} />
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            title="Xem chi tiết"
          >
            👁️
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            title="Chỉnh sửa"
          >
            ✏️
          </Link>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>{event.venue}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="mr-2">👥</span>
            <span>
              {event.attendeesCount || 0}
              {event.maxAttendees && ` / ${event.maxAttendees}`} người tham gia
            </span>
          </div>
          {event.price && event.price > 0 && (
            <div className="flex items-center">
              <span className="mr-2">💰</span>
              <span>{event.price.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch events
  const { data: eventsResponse, isLoading, error } = useQuery({
    queryKey: ['events', { search: searchTerm, status: statusFilter }],
    queryFn: () => apiClient.getEvents({ 
      page: 1, 
      limit: 100, 
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined 
    }),
  });

  // Extract events from paginated response
  const events = eventsResponse?.data || [];
  const pagination = eventsResponse?.pagination;

  // Filter events based on search and status (if not already filtered by API)
  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-500">
            Không thể tải danh sách sự kiện. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sự kiện</h1>
          <p className="text-gray-600">
            Tạo và quản lý các sự kiện, workshop, hội thảo
          </p>
        </div>
        <Link href="/dashboard/events/create">
          <Button>
            ➕ Tạo sự kiện
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng sự kiện
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🔜</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sắp diễn ra
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter((e: any) => e.status?.toLowerCase() === 'upcoming').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">▶️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đang diễn ra
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter((e: any) => e.status?.toLowerCase() === 'ongoing').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đã kết thúc
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter((e: any) => e.status?.toLowerCase() === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc mô tả sự kiện..."
                className="mt-1"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hiển thị
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🔳 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === 'list'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📋 List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Danh sách sự kiện ({filteredEvents.length})
          </h3>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có sự kiện nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Bắt đầu tạo sự kiện đầu tiên của bạn
                </p>
                <Link href="/dashboard/events/create">
                  <Button>Tạo sự kiện mới</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' 
              : 'space-y-4'
            }>
              {filteredEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                trong tổng số <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}