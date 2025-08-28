/**
 * Health check utilities for API server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface HealthStatus {
  isOnline: boolean;
  latency?: number;
  error?: string;
}

/**
 * Check if API server is reachable
 */
export const checkApiHealth = async (): Promise<HealthStatus> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        isOnline: true,
        latency,
      };
    } else {
      return {
        isOnline: false,
        latency,
        error: `Server responded with status: ${response.status}`,
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return {
          isOnline: false,
          latency,
          error: 'Connection timeout - server may be slow or unreachable',
        };
      }
      
      return {
        isOnline: false,
        latency,
        error: error.message,
      };
    }

    return {
      isOnline: false,
      latency,
      error: 'Unknown error occurred',
    };
  }
};

/**
 * Get health status with formatted message
 */
export const getHealthStatusMessage = (status: HealthStatus): string => {
  if (status.isOnline) {
    return `🟢 API Server đang hoạt động (${status.latency}ms)`;
  }
  
  if (status.error?.includes('timeout')) {
    return '🟡 Server phản hồi chậm hoặc không thể kết nối';
  }
  
  if (status.error?.includes('Failed to fetch') || status.error?.includes('NetworkError')) {
    return '🔴 Không thể kết nối đến server - kiểm tra server có đang chạy?';
  }
  
  return `🔴 Server lỗi: ${status.error}`;
};

/**
 * Diagnostic information for developers
 */
export const getDiagnosticInfo = () => {
  const info = {
    apiUrl: API_BASE_URL,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side',
    timestamp: new Date().toISOString(),
    localStorage: typeof window !== 'undefined' ? {
      hasToken: !!localStorage.getItem('access_token'),
      tokenPreview: localStorage.getItem('access_token')?.substring(0, 20) + '...',
    } : null,
  };
  
  console.log('🔧 [HealthCheck] Diagnostic Info:', info);
  return info;
};
