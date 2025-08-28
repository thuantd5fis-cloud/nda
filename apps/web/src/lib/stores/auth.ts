import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (retryCount?: number) => Promise<void>;
  clearError: () => void;
  handleUnauthorized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.login(email, password);
          // Store token in localStorage and cookie for middleware
          localStorage.setItem('access_token', response.access_token);
          
          // Set cookie for middleware (without secure flag for development)
          const isProduction = process.env.NODE_ENV === 'production';
          const secureFlag = isProduction ? '; secure' : '';
          document.cookie = `access_token=${response.access_token}; path=/; max-age=${24 * 60 * 60}${secureFlag}; samesite=strict`;
          
          apiClient.setToken(response.access_token);
          
          // Ensure user data includes roles properly formatted
          const userData = {
            ...response.user,
            roles: response.user.userRoles?.map(ur => ur.role.name) || []
          };
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear token from localStorage, cookie and API client
          localStorage.removeItem('access_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          apiClient.setToken(null);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      checkAuth: async (retryCount = 0) => {
        console.log(`🔍 [checkAuth] Starting auth check... (attempt ${retryCount + 1})`);
        const token = localStorage.getItem('access_token');
        console.log('🔍 [checkAuth] Token found:', !!token);
        
        if (!token) {
          console.log('🔍 [checkAuth] No token found, setting unauthenticated');
          set({ isAuthenticated: false, user: null, isLoading: false, error: null });
          apiClient.setToken(null);
          return;
        }

        // Set token in API client
        apiClient.setToken(token);
        set({ isLoading: true, error: null });
        console.log('🔍 [checkAuth] Set loading to true, making API call...');
        
        try {
          const userResponse = await apiClient.getProfile();
          console.log('🔍 [checkAuth] getProfile response:', userResponse);
          
          // Ensure user data includes roles properly formatted (same as login)
          const userData = {
            ...userResponse,
            roles: userResponse.userRoles?.map(ur => ur.role.name) || []
          };
          console.log('🔍 [checkAuth] processed userData:', userData);
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('🔍 [checkAuth] ✅ Authentication successful');
        } catch (error) {
          console.error('🔍 [checkAuth] ❌ Auth check failed:', error);
          
          // Determine if this is a network error or auth error
          const errorMessage = error instanceof Error ? error.message : 'Authentication check failed';
          const isNetworkError = errorMessage.includes('fetch') || 
                                  errorMessage.includes('network') || 
                                  errorMessage.includes('Failed to fetch') ||
                                  errorMessage.includes('NetworkError') ||
                                  errorMessage.includes('ERR_NETWORK');
          
          if (isNetworkError && retryCount < 2) {
            console.warn(`🔍 [checkAuth] Network error detected, retrying in 2s... (${retryCount + 1}/3)`);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: true, // Keep loading during retry
              error: 'Đang thử kết nối lại...',
            });
            
            setTimeout(() => {
              get().checkAuth(retryCount + 1);
            }, 2000);
            return;
          }
          
          if (isNetworkError) {
            console.error('🔍 [checkAuth] Max retries exceeded, network unavailable');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
            });
          } else {
            console.log('🔍 [checkAuth] Auth error, clearing credentials...');
            // Clear invalid token
            localStorage.removeItem('access_token');
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            apiClient.setToken(null);
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null, // Don't show error for auth failures, just redirect
            });
          }
          console.log('🔍 [checkAuth] Error state set with message:', errorMessage);
        }
      },

      clearError: () => set({ error: null }),

      handleUnauthorized: () => {
        // Clear token from localStorage, cookie and API client
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        apiClient.setToken(null);
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Session expired. Please login again.',
        });
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set token in API client if user is authenticated
        if (state?.isAuthenticated) {
          const token = localStorage.getItem('access_token');
          if (token) {
            apiClient.setToken(token);
          }
        }
      },
    }
  )
);
