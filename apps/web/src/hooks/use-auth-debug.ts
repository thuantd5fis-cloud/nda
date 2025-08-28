import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { checkApiHealth, getDiagnosticInfo, getHealthStatusMessage } from '@/lib/health-check';

/**
 * Debug hook to monitor auth state changes
 * Use this in development to understand auth flow issues
 */
export const useAuthDebug = () => {
  const { isAuthenticated, isLoading, user, error } = useAuthStore();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 [AuthDebug] State changed:', {
        isAuthenticated,
        isLoading,
        hasUser: !!user,
        userEmail: user?.email,
        error: error
      });
    }
  }, [isAuthenticated, isLoading, user, error]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check for potential issues
      if (!isLoading && !isAuthenticated && !error) {
        console.warn('🔧 [AuthDebug] ⚠️ Potential issue: Not loading, not authenticated, but no error');
        console.warn('🔧 [AuthDebug] 💡 This could mean:');
        console.warn('🔧 [AuthDebug]   - API server is not running');
        console.warn('🔧 [AuthDebug]   - Token is invalid');
        console.warn('🔧 [AuthDebug]   - Network connection issue');
        console.warn('🔧 [AuthDebug]   - API endpoint /auth/me not working');
        
        // Run health check
        checkApiHealth().then(health => {
          const message = getHealthStatusMessage(health);
          console.log('🔧 [AuthDebug] 🏥 Health check result:', message);
          if (!health.isOnline) {
            getDiagnosticInfo();
          }
        }).catch(err => {
          console.error('🔧 [AuthDebug] Health check failed:', err);
        });
      }

      if (isAuthenticated && !user) {
        console.warn('🔧 [AuthDebug] ⚠️ Potential issue: Authenticated but no user data');
      }

      if (error) {
        console.log('🔧 [AuthDebug] 📄 Error state detected:', error);
        if (error.includes('kết nối')) {
          console.warn('🔧 [AuthDebug] 💡 Network error - check if API server is running on port 3001');
        }
      }

      // Check localStorage vs store consistency
      const token = localStorage.getItem('access_token');
      if (token && !isAuthenticated && !isLoading && !error) {
        console.warn('🔧 [AuthDebug] ⚠️ Token exists in localStorage but store shows unauthenticated without error');
        console.warn('🔧 [AuthDebug] 💡 Try clearing localStorage: localStorage.clear()');
      }

      if (!token && isAuthenticated) {
        console.warn('🔧 [AuthDebug] ⚠️ Store shows authenticated but no token in localStorage');
      }
    }
  }, [isAuthenticated, isLoading, user, error]);
};
