'use client';

import { useState } from 'react';
import { Button } from '@cms/ui';

interface AnalyticsData {
  pageViews: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  uniqueVisitors: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bounceRate: {
    rate: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  avgSessionDuration: {
    duration: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
    bounceRate: number;
  }>;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    shares: number;
    comments: number;
    category: string;
  }>;
  userActivity: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  referralSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
}

const mockAnalytics: AnalyticsData = {
  pageViews: {
    total: 125430,
    thisMonth: 15420,
    lastMonth: 13200,
    growth: 16.8,
  },
  uniqueVisitors: {
    total: 45620,
    thisMonth: 5240,
    lastMonth: 4890,
    growth: 7.2,
  },
  bounceRate: {
    rate: 32.5,
    thisMonth: 32.5,
    lastMonth: 35.2,
    change: -2.7,
  },
  avgSessionDuration: {
    duration: 245,
    thisMonth: 245,
    lastMonth: 230,
    change: 15,
  },
  topPages: [
    { path: '/dashboard', views: 8420, uniqueViews: 3240, bounceRate: 25.4 },
    { path: '/posts', views: 6580, uniqueViews: 2890, bounceRate: 28.7 },
    { path: '/categories', views: 4320, uniqueViews: 2100, bounceRate: 31.2 },
    { path: '/users', views: 3890, uniqueViews: 1950, bounceRate: 33.8 },
    { path: '/assets', views: 2750, uniqueViews: 1420, bounceRate: 29.6 },
  ],
  topPosts: [
    {
      id: '1',
      title: 'Hướng dẫn sử dụng ReactJS cho người mới bắt đầu',
      views: 12580,
      shares: 450,
      comments: 89,
      category: 'Lập trình',
    },
    {
      id: '2',
      title: 'Xu hướng AI trong năm 2024',
      views: 9840,
      shares: 320,
      comments: 67,
      category: 'Công nghệ',
    },
    {
      id: '3',
      title: 'Best practices cho NextJS Performance',
      views: 7650,
      shares: 280,
      comments: 54,
      category: 'Web Development',
    },
    {
      id: '4',
      title: 'Tối ưu hóa Database với Prisma ORM',
      views: 6420,
      shares: 195,
      comments: 42,
      category: 'Database',
    },
    {
      id: '5',
      title: 'Docker và Kubernetes cho DevOps',
      views: 5890,
      shares: 167,
      comments: 38,
      category: 'DevOps',
    },
  ],
  userActivity: [
    { date: '2024-01-01', views: 420, visitors: 180 },
    { date: '2024-01-02', views: 380, visitors: 165 },
    { date: '2024-01-03', views: 520, visitors: 220 },
    { date: '2024-01-04', views: 480, visitors: 195 },
    { date: '2024-01-05', views: 650, visitors: 280 },
    { date: '2024-01-06', views: 590, visitors: 245 },
    { date: '2024-01-07', views: 720, visitors: 310 },
  ],
  referralSources: [
    { source: 'Google Search', visitors: 2840, percentage: 54.2 },
    { source: 'Direct', visitors: 1420, percentage: 27.1 },
    { source: 'Facebook', visitors: 580, percentage: 11.1 },
    { source: 'LinkedIn', visitors: 240, percentage: 4.6 },
    { source: 'Twitter', visitors: 160, percentage: 3.0 },
  ],
  deviceStats: {
    desktop: 65.4,
    mobile: 28.9,
    tablet: 5.7,
  },
  geographicData: [
    { country: 'Việt Nam', visitors: 3240, percentage: 61.8 },
    { country: 'Hoa Kỳ', visitors: 840, percentage: 16.0 },
    { country: 'Singapore', visitors: 420, percentage: 8.0 },
    { country: 'Nhật Bản', visitors: 320, percentage: 6.1 },
    { country: 'Hàn Quốc', visitors: 280, percentage: 5.3 },
    { country: 'Khác', visitors: 140, percentage: 2.8 },
  ],
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  format = 'number' 
}: { 
  title: string; 
  value: number; 
  change: number; 
  icon: string;
  format?: 'number' | 'percentage' | 'duration';
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'duration':
        return `${Math.floor(val / 60)}m ${val % 60}s`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = change > 0;
  const changeColor = format === 'percentage' && title.includes('Bounce') 
    ? (isPositive ? 'text-red-600' : 'text-green-600')
    : (isPositive ? 'text-green-600' : 'text-red-600');

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${changeColor}`}>
              {isPositive ? '↗' : '↘'} {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, max, color = 'bg-blue-500' }: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [data] = useState<AnalyticsData>(mockAnalytics);

  const handleExportReport = () => {
    alert('Tính năng xuất báo cáo sẽ được phát triển trong phiên bản tiếp theo.');
  };

  const handleConnectGA = () => {
    alert('Tính năng kết nối Google Analytics sẽ được phát triển trong phiên bản tiếp theo.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Phân tích</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi hiệu suất và phân tích hành vi người dùng
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleConnectGA}>
            🔗 Kết nối GA
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            📊 Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lượt xem trang"
          value={data.pageViews.thisMonth}
          change={data.pageViews.growth}
          icon="👁️"
        />
        <StatCard
          title="Người dùng duy nhất"
          value={data.uniqueVisitors.thisMonth}
          change={data.uniqueVisitors.growth}
          icon="👤"
        />
        <StatCard
          title="Tỷ lệ thoát"
          value={data.bounceRate.thisMonth}
          change={data.bounceRate.change}
          icon="↪️"
          format="percentage"
        />
        <StatCard
          title="Thời gian truy cập TB"
          value={data.avgSessionDuration.thisMonth}
          change={data.avgSessionDuration.change}
          icon="⏱️"
          format="duration"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động người dùng</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <div>Biểu đồ hoạt động theo thời gian</div>
              <div className="text-sm mt-1">(Sẽ tích hợp Chart.js)</div>
            </div>
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thiết bị truy cập</h3>
          <div className="space-y-4">
            <ProgressBar
              label="🖥️ Desktop"
              value={data.deviceStats.desktop}
              max={100}
              color="bg-blue-500"
            />
            <ProgressBar
              label="📱 Mobile"
              value={data.deviceStats.mobile}
              max={100}
              color="bg-green-500"
            />
            <ProgressBar
              label="📟 Tablet"
              value={data.deviceStats.tablet}
              max={100}
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trang được xem nhiều nhất</h3>
          <div className="space-y-3">
            {data.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{page.path}</div>
                    <div className="text-sm text-gray-500">
                      {page.uniqueViews.toLocaleString()} unique views
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{page.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{page.bounceRate}% bounce</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết hot nhất</h3>
          <div className="space-y-3">
            {data.topPosts.map((post, index) => (
              <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 line-clamp-2">{post.title}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>👁️ {post.views.toLocaleString()}</span>
                    <span>📤 {post.shares}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources and Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Sources */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nguồn truy cập</h3>
          <div className="space-y-3">
            {data.referralSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" style={{
                    backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                  }} />
                  <span className="font-medium text-gray-900">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{source.visitors.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{source.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa lý người dùng</h3>
          <div className="space-y-3">
            {data.geographicData.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" style={{
                    backgroundColor: `hsl(${120 + index * 30}, 70%, 50%)`
                  }} />
                  <span className="font-medium text-gray-900">{country.country}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{country.visitors.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{country.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Thống kê thời gian thực</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Đang cập nhật</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">24</div>
            <div className="text-sm text-gray-600">Người dùng online</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Lượt xem hôm nay</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-600">Bài viết mới</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">Bình luận mới</div>
          </div>
        </div>
      </div>
    </div>
  );
}
