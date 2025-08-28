'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const getStatusColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(priority)}`}>
      {getPriorityText(priority)}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ isPublished }: { isPublished: boolean }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
    </span>
  );
};

// FAQ Item Component
const FAQItem = ({ faq }: { faq: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="p-6">
        {/* FAQ Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-500">#{faq.order}</span>
              <span className="text-sm text-gray-500">{faq.category}</span>
              <PriorityBadge priority={faq.priority} />
              <StatusBadge isPublished={faq.isPublished} />
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-left text-lg font-medium text-gray-900 hover:text-gray-700 focus:outline-none"
            >
              {faq.question}
            </button>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Link
              href={`/dashboard/faqs/${faq.id}`}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              title="Xem chi tiết"
            >
              👁️
            </Link>
            <Link
              href={`/dashboard/faqs/${faq.id}/edit`}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              title="Chỉnh sửa"
            >
              ✏️
            </Link>
            <button
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
              title="Xóa"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* FAQ Answer (Expanded) */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
            
            {/* Tags */}
            {faq.tags && faq.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {faq.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQ Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="mr-1">👁️</span>
              {faq.viewCount || 0} lượt xem
            </span>
            <span className="flex items-center">
              <span className="mr-1">👍</span>
              {faq.likeCount || 0} hữu ích
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Tạo: {new Date(faq.createdAt).toLocaleDateString('vi-VN')}</span>
            {faq.author && (
              <span>bởi {faq.author.fullName}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch FAQs
  const { data: faqsResponse, isLoading, error } = useQuery({
    queryKey: ['faqs', { search: searchTerm, category: categoryFilter, priority: priorityFilter, isPublished: statusFilter }],
    queryFn: () => apiClient.getFAQs({ 
      page: 1, 
      limit: 100, 
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter.toUpperCase() : undefined,
      isPublished: statusFilter !== 'all' ? statusFilter === 'published' : undefined
    }),
  });

  // Extract FAQs from paginated response
  const faqs = faqsResponse?.data || [];
  const pagination = faqsResponse?.pagination;

  // Filter FAQs based on search and filters (if not already filtered by API)
  const filteredFAQs = faqs.filter((faq: any) => {
    const matchesSearch = searchTerm === '' || 
                         faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || faq.priority?.toLowerCase() === priorityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && faq.isPublished) ||
                         (statusFilter === 'draft' && !faq.isPublished);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Get unique categories for filter
  const categories = [...new Set(faqs.map((faq: any) => faq.category))];

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
            Không thể tải danh sách FAQ. Vui lòng thử lại.
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý FAQ</h1>
          <p className="text-gray-600">
            Quản lý câu hỏi thường gặp và câu trả lời
          </p>
        </div>
        <Link href="/dashboard/faqs/create">
          <Button>
            ➕ Thêm FAQ
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❓</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng FAQ
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {faqs.length}
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
                    Đã xuất bản
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {faqs.filter((f: any) => f.isPublished).length}
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
                <span className="text-2xl">📁</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Danh mục
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.length}
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
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng lượt xem
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {faqs.reduce((total: number, faq: any) => total + (faq.viewCount || 0), 0)}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            {/* Search */}
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo câu hỏi hoặc câu trả lời..."
                className="mt-1"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Độ ưu tiên
              </label>
              <select
                id="priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
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
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Danh sách FAQ ({filteredFAQs.length})
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                📊 Thống kê
              </Button>
              <Button variant="outline" size="sm">
                ↕️ Sắp xếp
              </Button>
            </div>
          </div>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có FAQ nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Bắt đầu tạo FAQ đầu tiên để hỗ trợ người dùng
                </p>
                <Link href="/dashboard/faqs/create">
                  <Button>Tạo FAQ mới</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq: any) => (
                <FAQItem key={faq.id} faq={faq} />
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