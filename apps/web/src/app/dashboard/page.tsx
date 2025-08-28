'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  PostIcon,
  CategoryIcon,
  TagIcon,
  MemberIcon,
  TrendUpIcon,
  TrendDownIcon,
  PlusIcon,
  EditIcon,
  XIcon,
} from '@/components/icons';

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: IconComponent, description, trend }: StatsCardProps) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="text-gray-400">
            <IconComponent className="w-8 h-8" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? (
                    <TrendUpIcon className="w-4 h-4" />
                  ) : (
                    <TrendDownIcon className="w-4 h-4" />
                  )}
                  <span className="ml-1">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </dd>
            {description && (
              <dd className="text-sm text-gray-600 mt-1">{description}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  </div>
);

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      user: 'Admin User',
      action: 'đã tạo bài viết mới',
      target: 'Sample Post 1',
      time: '2 giờ trước',
      type: 'create',
    },
    {
      id: 2,
      user: 'Editor User',
      action: 'đã cập nhật danh mục',
      target: 'Technology',
      time: '4 giờ trước',
      type: 'update',
    },
    {
      id: 3,
      user: 'Admin User',
      action: 'đã xóa tài nguyên',
      target: 'old-image.jpg',
      time: '1 ngày trước',
      type: 'delete',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Hoạt động gần đây
        </h3>
        <div className="mt-5">
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== activities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activity.type === 'create' ? 'bg-green-500' :
                          activity.type === 'update' ? 'bg-blue-500' : 'bg-red-500'
                        }`}>
                          <div className="text-white">
                            {activity.type === 'create' ? (
                              <PlusIcon className="w-4 h-4" />
                            ) : activity.type === 'update' ? (
                              <EditIcon className="w-4 h-4" />
                            ) : (
                              <XIcon className="w-4 h-4" />
                            )}
                          </div>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {activity.user}
                            </span>{' '}
                            {activity.action}{' '}
                            <span className="font-medium text-gray-900">
                              {activity.target}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  // Fetch dashboard stats
  const { data: postsResponse } = useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.getPosts(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags(),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  // Extract arrays from paginated responses
  const posts = Array.isArray(postsResponse?.data) ? postsResponse.data : Array.isArray(postsResponse) ? postsResponse : [];
  const tags = Array.isArray(tagsResponse?.data) ? tagsResponse.data : Array.isArray(tagsResponse) ? tagsResponse : [];
  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : Array.isArray(usersResponse) ? usersResponse : [];

  const stats = [
    {
      title: 'Tổng bài viết',
      value: posts.length || 0,
      icon: PostIcon,
      description: 'Bài viết được quản lý',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Danh mục',
      value: Array.isArray(categories) ? categories.length : 0,
      icon: CategoryIcon,
      description: 'Danh mục hoạt động',
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Tags',
      value: tags.length || 0,
      icon: TagIcon,
      description: 'Tags được sử dụng',
      trend: { value: 3, isPositive: false },
    },
    {
      title: 'Người dùng',
      value: users.length || 0,
      icon: MemberIcon,
      description: 'Tài khoản đang hoạt động',
      trend: { value: 8, isPositive: true },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng đến với CMS Admin Panel! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý nội dung website của bạn một cách dễ dàng và hiệu quả.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <RecentActivity />

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Thao tác nhanh
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-4">
              <a
                href="/dashboard/posts/create"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <div className="flex-shrink-0">
                  <span className="text-xl">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    Tạo bài viết mới
                  </p>
                  <p className="text-sm text-gray-500">
                    Viết và xuất bản nội dung mới
                  </p>
                </div>
              </a>

              <a
                href="/dashboard/categories"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <div className="flex-shrink-0">
                  <span className="text-xl">📁</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    Quản lý danh mục
                  </p>
                  <p className="text-sm text-gray-500">
                    Tổ chức nội dung theo danh mục
                  </p>
                </div>
              </a>

              <a
                href="/dashboard/assets"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <div className="flex-shrink-0">
                  <span className="text-xl">🖼️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    Upload tài nguyên
                  </p>
                  <p className="text-sm text-gray-500">
                    Quản lý hình ảnh và media
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
