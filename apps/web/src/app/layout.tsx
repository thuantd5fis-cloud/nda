import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ApiProvider } from '@/components/providers/api-provider';
import { PopupProvider } from '@/contexts/popup-context';
import { PopupManager } from '@/components/popup/popup-manager';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'CMS Admin Panel',
  description: 'Content Management System Admin Dashboard',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <AuthProvider> 
            <ApiProvider>
              <PopupProvider>
                {children}
                <PopupManager />
              </PopupProvider>
            </ApiProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
