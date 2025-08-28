/**
 * Debug script to test authentication flow
 * Run this in browser console to diagnose auth issues
 */

console.log('🔧 Auth Debug Script Started');

// Check environment
console.log('📍 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  localStorage: localStorage.getItem('access_token') ? 'Has token' : 'No token'
});

// Test API connectivity
async function testApiConnection() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  console.log('🌐 Testing API connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${apiUrl}/health`);
    console.log('🏥 Health check:', healthResponse.ok ? '✅ OK' : '❌ Failed', healthResponse.status);
  } catch (error) {
    console.error('🏥 Health check failed:', error.message);
  }
  
  try {
    // Test auth endpoint without token
    const authResponse = await fetch(`${apiUrl}/auth/me`);
    console.log('🔐 Auth endpoint (no token):', authResponse.status, authResponse.statusText);
  } catch (error) {
    console.error('🔐 Auth endpoint failed:', error.message);
  }
  
  // Test with token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const authWithTokenResponse = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🔑 Auth with token:', authWithTokenResponse.ok ? '✅ Valid' : '❌ Invalid', authWithTokenResponse.status);
    } catch (error) {
      console.error('🔑 Auth with token failed:', error.message);
    }
  }
}

// Clear auth state
function clearAuthState() {
  console.log('🧹 Clearing auth state...');
  localStorage.removeItem('access_token');
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  console.log('✅ Auth state cleared');
}

// Run tests
testApiConnection();

// Export functions for manual use
window.debugAuth = {
  testConnection: testApiConnection,
  clearAuth: clearAuthState,
  showInfo: () => {
    console.log('🔧 Current Auth State:', {
      localStorage: localStorage.getItem('access_token') ? 'Has token' : 'No token',
      cookies: document.cookie.includes('access_token') ? 'Has cookie' : 'No cookie'
    });
  }
};

console.log('💡 Available commands:');
console.log('- debugAuth.testConnection() - Test API connectivity');
console.log('- debugAuth.clearAuth() - Clear all auth data');
console.log('- debugAuth.showInfo() - Show current auth state');
