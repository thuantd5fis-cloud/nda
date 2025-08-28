'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth, isLoading, isAuthenticated, error, clearError } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 [AuthProvider] Starting initialization...');
      await checkAuth();
      setIsInitialized(true);
      console.log('🚀 [AuthProvider] ✅ Initialization complete');
    };
    
    initAuth();
  }, [checkAuth]);

  console.log('🚀 [AuthProvider] Render state:', { 
    isInitialized, 
    isLoading, 
    isAuthenticated,
    error
  });

  // Show loading during initial authentication check
  if (!isInitialized || isLoading) {
    const message = !isInitialized ? 'Đang khởi tạo...' : (error || 'Đang xác thực...');
    console.log('🚀 [AuthProvider] Showing loading screen:', message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">{message}</p>
          
          {error && error.includes('kết nối') && (
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
          )}
        </div>
      </div>
    );
  }

  console.log('🚀 [AuthProvider] Rendering children');
  return <>{children}</>;
};
