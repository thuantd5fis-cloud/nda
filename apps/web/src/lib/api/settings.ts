import apiClient from '../api';

export interface SettingsData {
  general?: {
    siteName?: string;
    siteUrl?: string;
    siteDescription?: string;
    adminEmail?: string;
    timezone?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
  };
  security?: {
    sessionTimeout?: number;
    maxLoginAttempts?: number;
    passwordMinLength?: number;
    requireUppercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    twoFactorRequired?: boolean;
    ipWhitelist?: string[];
  };
  email?: {
    provider?: 'smtp' | 'ses' | 'sendgrid';
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
    enableEmailNotifications?: boolean;
  };
  storage?: {
    provider?: 'local' | 's3' | 'cloudinary';
    maxFileSize?: number;
    allowedFileTypes?: string[];
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
  };
  seo?: {
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
    googleAnalyticsId?: string;
    googleSearchConsoleId?: string;
    enableSitemap?: boolean;
    enableRobotsTxt?: boolean;
    enableOpenGraph?: boolean;
    enableTwitterCard?: boolean;
  };
  backup?: {
    autoBackup?: boolean;
    backupFrequency?: string;
    retentionDays?: number;
    includeFiles?: boolean;
    backupLocation?: string;
    enableCompression?: boolean;
  };
  content?: {
    enableComments?: boolean;
    moderateComments?: boolean;
    enableTags?: boolean;
    maxTagsPerPost?: number;
    enableCategories?: boolean;
    maxCategoriesPerPost?: number;
    defaultPostStatus?: 'draft' | 'published';
  };
  homePage?: {
    heroBanners?: Array<{
      id?: string;
      type?: 'video' | 'image' | 'animated';
      title?: string;
      subtitle?: string;
      textStyle?: {
        color?: string;
        fontSize?: string;
        animation?: string;
        position?: 'left' | 'center' | 'right';
      };
      media?: string; // File ID for video/image
      backgroundColor?: string;
      gradientOverlay?: string;
      link?: {
        url?: string;
        text?: string;
        openInNewTab?: boolean;
      };
      isActive?: boolean;
      order?: number;
    }>;
    statsNumbers?: {
      members?: number;
      projects?: number;
      partners?: number;
      events?: number;
    };
    globe?: {
      location?: string;
      coordinates?: { lat?: number; lng?: number };
      zoomLevel?: number;
    };
    digitalEraQuotes?: Array<{ text?: string; author?: string }>;
    boardMembers?: Array<{ name?: string; title?: string; image?: string }>;
    partners?: Array<{ name?: string; logo?: string }>;
    events?: string[]; // Array of event IDs
    news?: string[]; // Array of post IDs
    digitalProducts?: {
      image?: string;
      title?: string;
    };
  };
  header?: {
    logo?: string;
    logoFileId?: string;
    menu?: Array<{
      label?: string;
      url?: string;
      children?: Array<{
        label?: string;
        url?: string;
      }>;
    }>;
    languages?: Array<{
      code?: string;
      label?: string;
      flag?: string;
      flagFileId?: string;
    }>;
  };
  footer?: {
    logo?: string;
    logoFileId?: string;
    address?: string;
    phone?: string;
    email?: string;
    social?: Array<{
      name?: string;
      icon?: string;
      url?: string;
    }>;
    legal?: string;
  };
}

export const settingsApi = {
  // Get all settings
  async getAllSettings(): Promise<SettingsData> {
    return await apiClient.getAllSettings() as SettingsData;
  },

  // Get settings by category
  async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    return await apiClient.getSettingsByCategory(category) as Record<string, any>;
  },

  // Update multiple settings in a category
  async updateSettings(category: string, settings: Record<string, any>): Promise<any> {
    return await apiClient.updateSettings(category, settings);
  },

  // Update single setting
  async updateSingleSetting(category: string, key: string, value: any): Promise<any> {
    return await apiClient.updateSingleSetting(category, key, value);
  },

  // Delete setting
  async deleteSetting(category: string, key: string): Promise<any> {
    return await apiClient.deleteSetting(category, key);
  },
};
