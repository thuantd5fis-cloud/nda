'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@cms/ui';
import { useAuthStore } from '@/lib/stores/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 CMS Admin Panel
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Hệ thống quản lý nội dung hiện đại và chuyên nghiệp
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto mb-8">
            <Link href="/login">
              <Button className="w-full" size="lg">
                🔐 Đăng nhập Admin
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full" size="lg">
                📊 Dashboard
              </Button>
            </Link>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Thông tin đăng nhập mặc định:
            </h3>
            <div className="font-mono text-sm bg-white p-3 rounded border">
              <div><strong>Email:</strong> admin@example.com</div>
              <div><strong>Password:</strong> Admin@123</div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Production-ready CMS built with Next.js 14, NestJS, and Prisma
          </p>
        </div>
      </div>
    </main>
  );
}
