'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useAuthDebug } from '@/hooks/use-auth-debug';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, clearError, checkAuth } = useAuthStore();
  
  // Enable debug logging in development
  useAuthDebug();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated and no error
    // (not during initial loading)
    if (!isLoading && !isAuthenticated && !error) {
      console.log('🔄 Dashboard redirecting to login - not authenticated');
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router, error]);

  // Show loading spinner during authentication check OR when redirecting
  if (isLoading || (!isLoading && !isAuthenticated)) {
    const message = isLoading ? (error || 'Đang xác thực...') : 'Đang chuyển hướng...';
    
    // If there's a connection error, show retry option
    if (error && error.includes('kết nối')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4 max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600">{message}</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  clearError();
                  checkAuth();
                }}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Thử lại
              </button>
              <p className="text-sm text-gray-500">
                Kiểm tra kết nối mạng và đảm bảo server đang chạy
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{
        backgroundImage: `url(/images/dashboard-background.png)`,
        backgroundColor: '#1f2937' // Fallback color if image doesn't load
      }}
    >
      {/* Background overlay for better readability - only behind sidebar and header */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-10"></div>
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-transparent backdrop-blur-md">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-3">
            <div className="flex-shrink-0 flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                width={44}
                height={44}
                className="block" 
                tabIndex={0}
                aria-label="Logo"
                role="img"
              />
              <h2 className="text-2x text-white leading-[36px]">Quản trị CMS</h2>
            </div> 
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <Sidebar />
          </div>
        </div> 
      </div>

      {/* Main content */}
      <div className="pl-64 flex flex-col h-screen">
        <Header title={title} />
        
        <main className="flex-1 rounded-tl-2xl bg-white relative z-30 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 pb-0 h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
