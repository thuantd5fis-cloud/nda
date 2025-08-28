import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class HeaderFooterService {
  constructor(private readonly prisma: PrismaService) {}

  async getHeaderFooterConfig() {
    try {
      // Fetch header and footer settings from database
      const [headerSettings, footerSettings] = await Promise.all([
        this.prisma.settings.findUnique({ where: { category: 'header' } }),
        this.prisma.settings.findUnique({ where: { category: 'footer' } })
      ]);

      // If either not found, throw error with helpful message
      if (!headerSettings) {
        throw new NotFoundException('Header settings not found. Please configure header settings in admin dashboard.');
      }

      if (!footerSettings) {
        throw new NotFoundException('Footer settings not found. Please configure footer settings in admin dashboard.');
      }

      return {
        header: headerSettings.data,
        footer: footerSettings.data,
        success: true,
        message: 'Header and footer configuration retrieved successfully'
      };
      
    } catch (error) {
      console.error('Error fetching header/footer config:', error);
      
      // Return fallback data instead of throwing error for better UX on landing page
      return {
        header: {
          logo: '',
          logoFileId: '',
          menu: [
            { label: 'Trang chủ', url: '/' },
            { label: 'Giới thiệu', url: '/about' },
            { label: 'Liên hệ', url: '/contact' }
          ],
          languages: [
            { code: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳', flagFileId: '' },
            { code: 'en-US', label: 'English', flag: '🇺🇸', flagFileId: '' }
          ]
        },
        footer: {
          logo: '',
          logoFileId: '',
          address: 'Địa chỉ công ty',
          phone: '+84 123 456 789',
          email: 'contact@company.com',
          social: [
            { name: 'Facebook', icon: '📘', url: '#' },
            { name: 'YouTube', icon: '📺', url: '#' }
          ],
          legal: '© 2025 Company Name. All rights reserved.'
        },
        success: false,
        message: 'Using fallback configuration. Please configure header/footer in admin dashboard.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
