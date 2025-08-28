'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@cms/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { BellIcon, ProfileIcon, SettingsIcon, LogoutIcon, ChevronDownIcon } from '@/components/icons';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = 'Dashboard' }: HeaderProps) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-transparent backdrop-blur-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center py-1">
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Thông báo</span>
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User menu dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-colors">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">

                </div>
                <ChevronDownIcon className="w-4 h-4 text-white ml-1" />
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>
                
                <div className="py-2">
                  <a
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="mr-3 text-gray-600">
                      <ProfileIcon className="w-4 h-4" />
                    </div>
                    Hồ sơ cá nhân
                  </a>
                  
                  <a
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="mr-3 text-gray-600">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    Cài đặt
                  </a>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="mr-3 text-red-600">
                      <LogoutIcon className="w-4 h-4" />
                    </div>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
