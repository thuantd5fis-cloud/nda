'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@cms/ui';
import { useAuthStore } from '@/lib/stores/auth';
import {
  DashboardIcon,
  PostIcon,
  CategoryIcon,
  TagIcon,
  AssetIcon,
  MemberIcon,
  EventIcon,
  FAQIcon,
  UserIcon,
  AnalyticsIcon,
  AuditIcon,
  ProfileIcon,
  SettingsIcon,
} from '@/components/icons';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
    description: 'Tổng quan hệ thống',
  },
  {
    name: 'Bài viết',
    href: '/dashboard/posts',
    icon: PostIcon,
    description: 'Quản lý bài viết',
  },
  {
    name: 'Danh mục',
    href: '/dashboard/categories',
    icon: CategoryIcon,
    description: 'Quản lý danh mục',
  },
  {
    name: 'Tags',
    href: '/dashboard/tags',
    icon: TagIcon,
    description: 'Quản lý thẻ',
  },
  {
    name: 'Tài nguyên',
    href: '/dashboard/assets',
    icon: AssetIcon,
    description: 'Quản lý media',
  },
  {
    name: 'Hội viên',
    href: '/dashboard/members',
    icon: MemberIcon,
    description: 'Quản lý hội viên',
  },
  {
    name: 'Sự kiện',
    href: '/dashboard/events',
    icon: EventIcon,
    description: 'Quản lý sự kiện',
  },
  {
    name: 'FAQ',
    href: '/dashboard/faqs',
    icon: FAQIcon,
    description: 'Câu hỏi thường gặp',
  },
  {
    name: 'Người dùng',
    href: '/dashboard/users',
    icon: UserIcon,
    description: 'Quản lý người dùng',
  },
  {
    name: 'Thống kê',
    href: '/dashboard/analytics',
    icon: AnalyticsIcon,
    description: 'Báo cáo thống kê',
  },
  {
    name: 'Audit Trails',
    href: '/dashboard/audit',
    icon: AuditIcon,
    description: 'Lịch sử hoạt động',
  },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <nav className={cn('space-y-1 p-6', className)}>
      <div className="px-3 py-2">
        {/* <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Menu chính
        </h2> */}
      </div>
      
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-[#FFFFFF1C] text-white rounded-sm ' 
                : 'text-gray-800  hover:bg-[#FFFFFF1C]'
            )}
          >
            <div className="mr-3 text-[#E5E7EB]">
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[#E5E7EB] font-medium">{item.name}</div>
            </div>
          </Link>
        );
      })}
      
      <div className="pt-4 mt-4">
        {/* <div className="px-3 py-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tài khoản
          </h2>
        </div> */}
        
        {/* <div className="px-3 py-2">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-800">
                {user?.fullName || 'User'}
              </div>
                          <div className="text-xs text-gray-600">
              {user?.roles?.join(', ') || 'No role'}
            </div>
            </div>
          </div>
        </div> */}
        
        {/* <Link
          href="/dashboard/profile"
          className="group flex items-center px-3 py-2 text-sm font-medium text-gray-800 rounded-md hover:bg-white/50 hover:text-gray-900"
        >
          <div className="mr-3 text-gray-800">
            <ProfileIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium">Hồ sơ</div>
            <div className="text-xs text-gray-600">Thông tin cá nhân</div>
          </div>
        </Link>
        
        <Link
          href="/dashboard/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium text-gray-800 rounded-md hover:bg-white/50 hover:text-gray-900"
        >
          <div className="mr-3 text-gray-800">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium">Cài đặt</div>
            <div className="text-xs text-gray-600">Cấu hình hệ thống</div>
          </div>
        </Link> */}
      </div>
    </nav>
  );
};
