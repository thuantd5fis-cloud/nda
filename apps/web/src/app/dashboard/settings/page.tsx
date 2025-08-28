'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@cms/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, SettingsData } from '@/lib/api/settings';
import { toast } from 'sonner';
import FileSelector from '@/components/FileSelector';
import EventSelector from '@/components/EventSelector';
import PostSelector from '@/components/PostSelector';
import DigitalEraSelector from '@/components/DigitalEraSelector';

// Component to preview logo from file ID
const LogoPreview = ({ fileId, alt }: { fileId: string; alt: string }) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:3001/files-upload/${fileId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const fileData = await response.json();
          // Construct Minio public URL
          const baseUrl = 'http://localhost:9000';
          setLogoUrl(`${baseUrl}${fileData.filePath}`);
        }
      } catch (error) {
        console.error('Error fetching logo URL:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (fileId) {
      fetchLogoUrl();
    }
  }, [fileId]);
  
  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gray-400">⏳</div>;
  }
  
  if (!logoUrl) {
    return <span className="text-gray-400 text-2xl">🖼️</span>;
  }
  
  return (
    <img 
      src={logoUrl}
      alt={alt}
      className="w-full h-full object-contain rounded"
      onError={() => setLogoUrl('')}
    />
  );
};

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  email: {
    provider: 'smtp' | 'ses' | 'sendgrid';
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableEmailNotifications: boolean;
  };
  storage: {
    provider: 'local' | 's3' | 'cloudinary';
    maxFileSize: number;
    allowedFileTypes: string[];
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    googleAnalyticsId?: string;
    googleSearchConsoleId?: string;
    facebookPixelId?: string;
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
  };
  content: {
    enableComments: boolean;
    moderateComments: boolean;
    enableTags: boolean;
    maxTagsPerPost: number;
    enableCategories: boolean;
    maxCategoriesPerPost: number;
    defaultPostStatus: 'draft' | 'published';
  };
  homePage: {
    heroBanners: Array<{
      id: string;
      type: 'video' | 'image' | 'animated';
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
    statsNumbers: {
      members: number;
      projects: number;
      partners: number;
      events: number;
    };
    digitalEraQuotes: Array<{
      id: string;
      text: string;
      author: string;
      order: number;
      isActive: boolean;
      createdAt?: string;
      updatedAt?: string;
    }>;
    globe: {
      location: string;
      coordinates: { lat: number; lng: number };
      zoomLevel: number;
    };
    boardMembers: Array<{ name: string; title: string; image: string }>;
    partners: Array<{ name: string; logo: string }>;
    events: string[]; // Array of event IDs
    news: string[]; // Array of post IDs
    digitalProducts: {
      image: string;
      title: string;
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

const languageOptions = [
  { code: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'th-TH', label: 'ไทย', flag: '🇹🇭' },
  { code: 'id-ID', label: 'Indonesia', flag: '🇮🇩' }
];

const mockSettings: SystemSettings = {
  general: {
    siteName: 'CMS Admin',
    siteDescription: 'Hệ thống quản lý nội dung hiện đại',
    siteUrl: 'https://cms-admin.example.com',
    adminEmail: 'admin@example.com',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    twoFactorRequired: false,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  },
  email: {
    provider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'admin@example.com',
    smtpPassword: '***************',
    fromEmail: 'noreply@example.com',
    fromName: 'CMS Admin',
    enableEmailNotifications: true,
  },
  storage: {
    provider: 'local',
    maxFileSize: 50,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'doc', 'docx'],
  },
  seo: {
    defaultMetaTitle: 'CMS Admin - Hệ thống quản lý nội dung',
    defaultMetaDescription: 'Hệ thống CMS hiện đại với đầy đủ tính năng',
    googleAnalyticsId: 'GA-XXXXXXXXX',
    enableSitemap: true,
    enableRobotsTxt: true,
  },
  content: {
    enableComments: true,
    moderateComments: true,
    enableTags: true,
    maxTagsPerPost: 10,
    enableCategories: true,
    maxCategoriesPerPost: 3,
    defaultPostStatus: 'draft',
  },
  homePage: {
    heroBanners: [
      {
        id: '1',
        type: 'video',
        title: 'Chào mừng đến với tương lai số',
        subtitle: 'Khám phá những công nghệ tiên tiến nhất',
        textStyle: {
          color: '#ffffff',
          fontSize: '48px',
          animation: 'fadeInUp',
          position: 'center'
        },
        media: '550e8400-e29b-41d4-a716-446655440000',
        gradientOverlay: 'linear-gradient(45deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))',
        link: {
          url: '/about',
          text: 'Tìm hiểu thêm',
          openInNewTab: false
        },
        isActive: true,
        order: 1
      }
    ],
    statsNumbers: {
      members: 1500,
      projects: 500,
      partners: 5000,
      events: 1000
    },
    digitalEraQuotes: [], // Will be populated from database
    globe: {
      location: "Paris",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      zoomLevel: 2
    },

    boardMembers: [
      { name: "Lê Minh Tuấn", title: "Chủ tịch", image: "a1b2c3d4-e5f6-4789-8a0b-c1d2e3f4g5h6" },
      { name: "Nguyễn Anh Tuấn", title: "Phó chủ tịch", image: "b2c3d4e5-f6g7-489a-9b0c-d1e2f3g4h5i6" }
    ],
    partners: [
      { name: "Mobifone", logo: "c3d4e5f6-g7h8-490b-a1c2-d3e4f5g6h7i8" },
      { name: "FPT", logo: "d4e5f6g7-h8i9-4a0c-b1d2-e3f4g5h6i7j8" }
    ],
    events: [], // Will be populated with actual event IDs
    news: [], // Will be populated with actual post IDs
    digitalProducts: {
      image: "g7h8i9j0-k1l2-4d3f-e4g5-h6i7j8k9l0m1",
      title: "Hệ thống Thu thập dữ liệu quốc gia"
    }
  },
  header: {
    logo: "",
    logoFileId: "",
    menu: [],
    languages: []
  },
  footer: {
    logo: "",
    logoFileId: "",
    address: "",
    phone: "",
    email: "",
    social: [],
    legal: ""
  }
};

const TabButton = ({ 
  id, 
  label, 
  icon,
  isActive, 
  onClick 
}: { 
  id: string; 
  label: string; 
  icon: string;
  isActive: boolean; 
  onClick: (id: string) => void;
}) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();
  
  // Danh sách mạng xã hội phổ biến
  const socialMediaOptions = [
    { name: 'Facebook', icon: '📘' },
    { name: 'Instagram', icon: '📷' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'YouTube', icon: '📺' },
    { name: 'LinkedIn', icon: '💼' },
    { name: 'TikTok', icon: '🎵' },
    { name: 'Telegram', icon: '✈️' },
    { name: 'Zalo', icon: '💬' },
    { name: 'WhatsApp', icon: '📱' },
    { name: 'Discord', icon: '🎮' },
    { name: 'Pinterest', icon: '📌' },
    { name: 'Snapchat', icon: '👻' },
  ];
  
  // Fetch settings from API
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAllSettings,
  });

  // Fetch digital era quotes
  const { data: digitalEraQuotes } = useQuery({
    queryKey: ['digital-era-quotes'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/digital-era/admin', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        return response.json();
      }
      return [];
    },
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: ({ category, settings }: { category: string; settings: Record<string, any> }) =>
      settingsApi.updateSettings(category, settings),
    // onSuccess removed - will be handled manually to avoid multiple invalidations
    // onError removed - will be handled by individual calls
  });

  // Initialize settings with API data or fallback to mock
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);

  // Debug logs
  console.log('Settings Debug:', {
    settingsData,
    isLoading,
    error,
    currentSettings: settings
  });

  // Update local settings when API data is loaded
  useEffect(() => {
    if (settingsData) {
      setSettings(prev => {
        const newSettings = { ...prev };
        
        if (settingsData.general) {
          newSettings.general = { ...prev.general, ...settingsData.general };
        }
        if (settingsData.security) {
          newSettings.security = { ...prev.security, ...settingsData.security };
        }
        if (settingsData.email) {
          newSettings.email = { ...prev.email, ...settingsData.email };
        }
        if (settingsData.storage) {
          newSettings.storage = { ...prev.storage, ...settingsData.storage };
        }
        if (settingsData.seo) {
          newSettings.seo = { ...prev.seo, ...settingsData.seo };
        }
        if (settingsData.content) {
          newSettings.content = { ...prev.content, ...settingsData.content };
        }
        if (settingsData.homePage) {
          newSettings.homePage = { 
            ...prev.homePage, 
            ...settingsData.homePage,
            // Ensure arrays are properly handled
            events: settingsData.homePage.events || prev.homePage.events,
            news: settingsData.homePage.news || prev.homePage.news,
            digitalEraQuotes: digitalEraQuotes || prev.homePage.digitalEraQuotes
          } as typeof prev.homePage;
        }
        if (settingsData.header) {
          newSettings.header = { ...prev.header, ...settingsData.header };
        }
        if (settingsData.footer) {
          newSettings.footer = { ...prev.footer, ...settingsData.footer };
        }
        
        return newSettings;
      });
    }
  }, [settingsData, digitalEraQuotes]);

  const handleUpdateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Handle nested object updates safely
  const handleUpdateNestedSetting = (section: keyof SystemSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
    setHasChanges(true);
  };

  // Function to sync digital era quotes to database
  const syncDigitalEraQuotes = async (quotes: any[]) => {
    const token = localStorage.getItem('access_token');
    
    // Get current quotes from database
    const currentResponse = await fetch('http://localhost:3001/digital-era/admin', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const currentQuotes = currentResponse.ok ? await currentResponse.json() : [];
    
    // Delete quotes not in the new list
    const quotesToDelete = currentQuotes.filter((current: any) => 
      !quotes.some(quote => quote.id === current.id)
    );
    
    for (const quote of quotesToDelete) {
      await fetch(`http://localhost:3001/digital-era/${quote.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    }
    
    // Create or update quotes
    for (const quote of quotes) {
      if (quote.id.startsWith('temp-')) {
        // Create new quote
        await fetch('http://localhost:3001/digital-era', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: quote.text,
            author: quote.author,
            order: quote.order,
            isActive: quote.isActive,
          }),
        });
      } else {
        // Update existing quote
        await fetch(`http://localhost:3001/digital-era/${quote.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: quote.text,
            author: quote.author,
            order: quote.order,
            isActive: quote.isActive,
          }),
        });
      }
    }
  };

  const handleSaveSettings = async () => {
    console.log('🚀 handleSaveSettings called for tab:', activeTab);
    try {
      if (activeTab === 'layout') {
        // Special handling for layout tab (header + footer)
        const headerData = settings.header;
        const footerData = settings.footer;
        
        console.log('💾 Saving layout settings...', { headerData, footerData });
        
        // Save header and footer with immediate feedback
        const saveResults = { header: false, footer: false };
        
        const checkAndShowSuccess = () => {
          const headerOk = !headerData || saveResults.header;
          const footerOk = !footerData || saveResults.footer;
          
          console.log('🔍 Checking save status:', { 
            headerData: !!headerData, 
            footerData: !!footerData,
            headerOk, 
            footerOk,
            saveResults 
          });
          
          // CHỈ show success khi CẢ 2 đều thành công
          if (headerOk && footerOk) {
            console.log('🎉 ALL layout settings saved successfully');
            
            // ✅ CHỈ invalidate KHI CẢ 2 đều xong - tránh UI flash
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            
            toast.success('Cài đặt Header & Footer đã được lưu thành công!');
            setHasChanges(false);
          }
        };
        
        // Save header first, then footer after delay to avoid mutation conflict
        const saveHeader = () => {
          if (headerData) {
            console.log('📝 Saving header...', headerData);
            console.log('🔍 Header mutation state before:', {
              isPending: updateSettingsMutation.isPending,
              isError: updateSettingsMutation.isError
            });
            
            updateSettingsMutation.mutate({
              category: 'header',
              settings: headerData,
            }, {
              onSuccess: (response) => {
                console.log('✅ Header saved successfully, response:', response);
                saveResults.header = true;
                checkAndShowSuccess();
                
                // Save footer after header completes
                setTimeout(saveFooter, 500);
              },
              onError: (error) => {
                console.error('❌ Header save failed:', error);
                console.error('❌ Error details:', {
                  message: error.message,
                  stack: error.stack
                });
                const errorMessage = error instanceof Error ? error.message : String(error);
                toast.error(`Lỗi lưu Header: ${errorMessage}`);
                saveResults.header = false;
                
                // Still try to save footer
                setTimeout(saveFooter, 500);
              },
              onSettled: () => {
                console.log('🏁 Header mutation settled (completed/failed)');
              }
            });
            
            // Timeout fallback cho header
            setTimeout(() => {
              if (!saveResults.header) {
                console.warn('⏰ Header save timeout - no response after 10s');
              }
            }, 10000);
          } else {
            // No header to save, go directly to footer
            setTimeout(saveFooter, 100);
          }
        };
        
        const saveFooter = () => {
          if (footerData) {
            console.log('📝 Saving footer...', footerData);
            console.log('🔍 Footer mutation state before:', {
              isPending: updateSettingsMutation.isPending,
              isError: updateSettingsMutation.isError
            });
            
            updateSettingsMutation.mutate({
              category: 'footer', 
              settings: footerData,
            }, {
              onSuccess: (response) => {
                console.log('✅ Footer saved successfully, response:', response);
                saveResults.footer = true;
                checkAndShowSuccess();
              },
              onError: (error) => {
                console.error('❌ Footer save failed:', error);
                console.error('❌ Error details:', {
                  message: error.message,
                  stack: error.stack
                });
                const errorMessage = error instanceof Error ? error.message : String(error);
                toast.error(`Lỗi lưu Footer: ${errorMessage}`);
                saveResults.footer = false;
              },
              onSettled: () => {
                console.log('🏁 Footer mutation settled (completed/failed)');
              }
            });
            
            // Timeout fallback cho footer
            setTimeout(() => {
              if (!saveResults.footer) {
                console.warn('⏰ Footer save timeout - no response after 10s');
              }
            }, 10000);
          }
        };
        
        // Start the sequence
        saveHeader();
        
        if (!headerData && !footerData) {
          console.warn('⚠️ No layout data to save');
          toast.warning('Không có dữ liệu layout để lưu');
        }
        
      } else {
        const currentTabSettings = settings[activeTab as keyof SystemSettings];
        
        // Handle digital era quotes separately for homePage
        if (activeTab === 'homePage' && (currentTabSettings as any).digitalEraQuotes) {
          console.log('📝 Saving homePage with digital era quotes...');
          await syncDigitalEraQuotes((currentTabSettings as any).digitalEraQuotes);
          
          // Remove digitalEraQuotes from homePage data before saving
          const { digitalEraQuotes, ...homePageData } = currentTabSettings as any;
          updateSettingsMutation.mutate({
            category: activeTab,
            settings: homePageData,
          }, {
            onSuccess: () => {
              // Refresh data after successful save
              queryClient.invalidateQueries({ queryKey: ['settings'] });
              queryClient.invalidateQueries({ queryKey: ['digital-era-quotes'] });
              
              console.log('✅ HomePage settings saved successfully');
              toast.success('Cài đặt trang chủ đã được lưu thành công!');
              setHasChanges(false);
            },
            onError: (error) => {
              console.error('❌ HomePage save failed:', error);
              const errorMessage = error instanceof Error ? error.message : String(error);
              toast.error(`Lỗi lưu trang chủ: ${errorMessage}`);
            }
          });
          
        } else {
          // Save normal settings
          if (currentTabSettings) {
            console.log(`📝 Saving ${activeTab} settings...`, currentTabSettings);
            updateSettingsMutation.mutate({
              category: activeTab,
              settings: currentTabSettings,
            }, {
              onSuccess: () => {
                console.log(`✅ ${activeTab} settings saved successfully`);
                toast.success('Cài đặt đã được lưu thành công!');
                setHasChanges(false);
              },
              onError: (error) => {
                console.error(`❌ ${activeTab} save failed:`, error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                toast.error(`Lỗi lưu ${activeTab}: ${errorMessage}`);
              }
            });
          } else {
            console.warn('⚠️ No settings to save for tab:', activeTab);
            toast.warning('Không có dữ liệu để lưu');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Có lỗi xảy ra khi lưu cài đặt: ${errorMessage}`);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định?')) {
      setSettings(mockSettings);
      setHasChanges(false);
    }
  };

  const handleTestEmail = () => {
    alert('Đã gửi email test. Vui lòng kiểm tra hộp thư của bạn.');
  };

  const handleTestStorage = () => {
    alert('Kết nối storage thành công!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        Có lỗi xảy ra khi tải cài đặt: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600 mt-2">
            Cấu hình và tùy chỉnh hệ thống theo nhu cầu của bạn
          </p>
        </div>
        <div className="flex items-center gap-4">
          {hasChanges && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-600">⚠️ Có thay đổi chưa lưu</span>
              <Button variant="outline" onClick={handleResetSettings}>
                ↺ Khôi phục
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔘 Save button clicked, mutation state:', {
                    isPending: updateSettingsMutation.isPending,
                    isError: updateSettingsMutation.isError,
                    error: updateSettingsMutation.error
                  });
                  handleSaveSettings();
                }}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
        <TabButton
          id="general"
          label="Cài đặt chung"
          icon="⚙️"
          isActive={activeTab === 'general'}
          onClick={setActiveTab}
        />
        <TabButton
          id="security"
          label="Bảo mật"
          icon="🔒"
          isActive={activeTab === 'security'}
          onClick={setActiveTab}
        />
        <TabButton
          id="email"
          label="Email"
          icon="📧"
          isActive={activeTab === 'email'}
          onClick={setActiveTab}
        />
        <TabButton
          id="storage"
          label="Lưu trữ"
          icon="💾"
          isActive={activeTab === 'storage'}
          onClick={setActiveTab}
        />
        <TabButton
          id="seo"
          label="SEO"
          icon="🔍"
          isActive={activeTab === 'seo'}
          onClick={setActiveTab}
        />
        <TabButton
          id="content"
          label="Nội dung"
          icon="📝"
          isActive={activeTab === 'content'}
          onClick={setActiveTab}
        />
        <TabButton
          id="homePage"
          label="Trang chủ"
          icon="🏠"
          isActive={activeTab === 'homePage'}
          onClick={setActiveTab}
        />
        <TabButton
          id="layout"
          label="Header & Footer"
          icon="🖼️"
          isActive={activeTab === 'layout'}
          onClick={setActiveTab}
        />
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt chung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên website
              </label>
              <Input
                value={settings.general.siteName}
                onChange={(e) => handleUpdateSetting('general', 'siteName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL website
              </label>
              <Input
                value={settings.general.siteUrl}
                onChange={(e) => handleUpdateSetting('general', 'siteUrl', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả website
              </label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) => handleUpdateSetting('general', 'siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email admin
              </label>
              <Input
                type="email"
                value={settings.general.adminEmail}
                onChange={(e) => handleUpdateSetting('general', 'adminEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Múi giờ
              </label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleUpdateSetting('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/London">London (UTC+0)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={settings.general.language}
                onChange={(e) => handleUpdateSetting('general', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Định dạng ngày
              </label>
              <select
                value={settings.general.dateFormat}
                onChange={(e) => handleUpdateSetting('general', 'dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt bảo mật</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian hết hạn phiên (phút)
                </label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleUpdateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lần đăng nhập sai tối đa
                </label>
                <Input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleUpdateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ dài mật khẩu tối thiểu
                </label>
                <Input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleUpdateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Yêu cầu mật khẩu</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.security.requireUppercase}
                    onChange={(e) => handleUpdateSetting('security', 'requireUppercase', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Yêu cầu chữ hoa</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.security.requireNumbers}
                    onChange={(e) => handleUpdateSetting('security', 'requireNumbers', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Yêu cầu số</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.security.requireSpecialChars}
                    onChange={(e) => handleUpdateSetting('security', 'requireSpecialChars', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Yêu cầu ký tự đặc biệt</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorRequired}
                    onChange={(e) => handleUpdateSetting('security', 'twoFactorRequired', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Bắt buộc 2FA</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Whitelist (mỗi dòng một IP/CIDR)
              </label>
              <textarea
                value={settings.security.ipWhitelist.join('\n')}
                onChange={(e) => handleUpdateSetting('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="192.168.1.0/24&#10;10.0.0.0/8"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt Email</h3>
            <Button variant="outline" onClick={handleTestEmail}>
              📧 Test Email
            </Button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Provider
              </label>
              <select
                value={settings.email.provider}
                onChange={(e) => handleUpdateSetting('email', 'provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="smtp">SMTP</option>
                <option value="ses">Amazon SES</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </div>

            {settings.email.provider === 'smtp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <Input
                    value={settings.email.smtpHost}
                    onChange={(e) => handleUpdateSetting('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <Input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleUpdateSetting('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input
                    value={settings.email.smtpUsername}
                    onChange={(e) => handleUpdateSetting('email', 'smtpUsername', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => handleUpdateSetting('email', 'smtpPassword', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <Input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleUpdateSetting('email', 'fromEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <Input
                  value={settings.email.fromName}
                  onChange={(e) => handleUpdateSetting('email', 'fromName', e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.email.enableEmailNotifications}
                onChange={(e) => handleUpdateSetting('email', 'enableEmailNotifications', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Bật thông báo email</span>
            </label>
          </div>
        </div>
      )}

      {/* Storage Settings */}
      {activeTab === 'storage' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt Lưu trữ</h3>
            <Button variant="outline" onClick={handleTestStorage}>
              🔗 Test kết nối
            </Button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Provider
              </label>
              <select
                value={settings.storage.provider}
                onChange={(e) => handleUpdateSetting('storage', 'provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="local">Local Storage</option>
                <option value="s3">Amazon S3</option>
                <option value="cloudinary">Cloudinary</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước file tối đa (MB)
                </label>
                <Input
                  type="number"
                  value={settings.storage.maxFileSize}
                  onChange={(e) => handleUpdateSetting('storage', 'maxFileSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại file được phép
                </label>
                <Input
                  value={settings.storage.allowedFileTypes.join(', ')}
                  onChange={(e) => handleUpdateSetting('storage', 'allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="jpg, png, pdf, doc"
                />
              </div>
            </div>

            {settings.storage.provider === 's3' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    S3 Bucket
                  </label>
                  <Input
                    value={settings.storage.s3Bucket || ''}
                    onChange={(e) => handleUpdateSetting('storage', 's3Bucket', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    S3 Region
                  </label>
                  <Input
                    value={settings.storage.s3Region || ''}
                    onChange={(e) => handleUpdateSetting('storage', 's3Region', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Key
                  </label>
                  <Input
                    value={settings.storage.s3AccessKey || ''}
                    onChange={(e) => handleUpdateSetting('storage', 's3AccessKey', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <Input
                    type="password"
                    value={settings.storage.s3SecretKey || ''}
                    onChange={(e) => handleUpdateSetting('storage', 's3SecretKey', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Settings */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt SEO</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title mặc định
              </label>
              <Input
                value={settings.seo.defaultMetaTitle}
                onChange={(e) => handleUpdateSetting('seo', 'defaultMetaTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description mặc định
              </label>
              <textarea
                value={settings.seo.defaultMetaDescription}
                onChange={(e) => handleUpdateSetting('seo', 'defaultMetaDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <Input
                  value={settings.seo.googleAnalyticsId || ''}
                  onChange={(e) => handleUpdateSetting('seo', 'googleAnalyticsId', e.target.value)}
                  placeholder="GA-XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <Input
                  value={settings.seo.facebookPixelId || ''}
                  onChange={(e) => handleUpdateSetting('seo', 'facebookPixelId', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.seo.enableSitemap}
                  onChange={(e) => handleUpdateSetting('seo', 'enableSitemap', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Tự động tạo sitemap.xml</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.seo.enableRobotsTxt}
                  onChange={(e) => handleUpdateSetting('seo', 'enableRobotsTxt', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Tự động tạo robots.txt</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Content Settings */}
      {activeTab === 'content' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt Nội dung</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.content.enableComments}
                  onChange={(e) => handleUpdateSetting('content', 'enableComments', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Cho phép bình luận</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.content.moderateComments}
                  onChange={(e) => handleUpdateSetting('content', 'moderateComments', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Kiểm duyệt bình luận</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.content.enableTags}
                  onChange={(e) => handleUpdateSetting('content', 'enableTags', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Sử dụng tags</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.content.enableCategories}
                  onChange={(e) => handleUpdateSetting('content', 'enableCategories', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Sử dụng danh mục</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tags tối đa mỗi bài
                </label>
                <Input
                  type="number"
                  value={settings.content.maxTagsPerPost}
                  onChange={(e) => handleUpdateSetting('content', 'maxTagsPerPost', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số danh mục tối đa mỗi bài
                </label>
                <Input
                  type="number"
                  value={settings.content.maxCategoriesPerPost}
                  onChange={(e) => handleUpdateSetting('content', 'maxCategoriesPerPost', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái bài viết mặc định
                </label>
                <select
                  value={settings.content.defaultPostStatus}
                  onChange={(e) => handleUpdateSetting('content', 'defaultPostStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Homepage Settings */}
      {activeTab === 'homePage' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt trang chủ</h3>
          
          {/* Hero Video */}
          {/* Hero Banners */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Banner Đầu Trang (Hero)</h4>
              <Button
                onClick={() => {
                  const newBanner = {
                    id: Date.now().toString(),
                    type: 'image' as const,
                    title: '',
                    subtitle: '',
                    textStyle: {
                      color: '#ffffff',
                      fontSize: '36px',
                      animation: 'fadeInUp',
                      position: 'center' as const
                    },
                    backgroundColor: '#000000',
                    isActive: true,
                    order: settings.homePage.heroBanners.length + 1
                  };
                  const updatedBanners = [...settings.homePage.heroBanners, newBanner];
                  handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
              >
                ➕ Thêm Banner
              </Button>
            </div>
            
            <div className="space-y-6">
              {settings.homePage.heroBanners.map((banner, index) => (
                <div key={banner.id} className="border border-gray-200 rounded-lg p-6 relative">
                  <Button
                    onClick={() => {
                      const updatedBanners = settings.homePage.heroBanners.filter((_, i) => i !== index);
                      handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                    }}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                  >
                    🗑️ Xóa
                  </Button>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-20">
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 mb-3">Cài đặt cơ bản</h5>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại Banner</label>
                        <select
                          value={banner.type}
                          onChange={(e) => {
                            const updatedBanners = [...settings.homePage.heroBanners];
                            updatedBanners[index] = { ...banner, type: e.target.value as any };
                            handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="image">🖼️ Banner tĩnh (Hình ảnh)</option>
                          <option value="video">📹 Banner video</option>
                          <option value="animated">✨ Banner động (Animation)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {banner.type === 'video' ? 'Video' : 'Hình ảnh'}
                        </label>
                        <FileSelector
                          selectedFileId={banner.media || ''}
                          onFileSelect={(fileId) => {
                            const updatedBanners = [...settings.homePage.heroBanners];
                            updatedBanners[index] = { ...banner, media: fileId };
                            handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                          }}
                          fileType={banner.type === 'video' ? 'video' : 'image'}
                          title={`Chọn ${banner.type === 'video' ? 'Video' : 'Hình Ảnh'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                        <Input
                          value={banner.title || ''}
                          onChange={(e) => {
                            const updatedBanners = [...settings.homePage.heroBanners];
                            updatedBanners[index] = { ...banner, title: e.target.value };
                            handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                          }}
                          placeholder="Nhập tiêu đề banner..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phụ đề</label>
                        <Input
                          value={banner.subtitle || ''}
                          onChange={(e) => {
                            const updatedBanners = [...settings.homePage.heroBanners];
                            updatedBanners[index] = { ...banner, subtitle: e.target.value };
                            handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                          }}
                          placeholder="Nhập phụ đề..."
                        />
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 mb-3">Cài đặt nâng cao</h5>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Màu chữ</label>
                          <input
                            type="color"
                            value={banner.textStyle?.color || '#ffffff'}
                            onChange={(e) => {
                              const updatedBanners = [...settings.homePage.heroBanners];
                              updatedBanners[index] = { 
                                ...banner, 
                                textStyle: { ...banner.textStyle, color: e.target.value }
                              };
                              handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                            }}
                            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước chữ</label>
                          <select
                            value={banner.textStyle?.fontSize || '36px'}
                            onChange={(e) => {
                              const updatedBanners = [...settings.homePage.heroBanners];
                              updatedBanners[index] = { 
                                ...banner, 
                                textStyle: { ...banner.textStyle, fontSize: e.target.value }
                              };
                              handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                            }}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="24px">Nhỏ (24px)</option>
                            <option value="36px">Vừa (36px)</option>
                            <option value="48px">Lớn (48px)</option>
                            <option value="64px">Rất lớn (64px)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí text</label>
                          <select
                            value={banner.textStyle?.position || 'center'}
                            onChange={(e) => {
                              const updatedBanners = [...settings.homePage.heroBanners];
                              updatedBanners[index] = { 
                                ...banner, 
                                textStyle: { ...banner.textStyle, position: e.target.value as any }
                              };
                              handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                            }}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="left">Trái</option>
                            <option value="center">Giữa</option>
                            <option value="right">Phải</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hiệu ứng text</label>
                          <select
                            value={banner.textStyle?.animation || 'fadeInUp'}
                            onChange={(e) => {
                              const updatedBanners = [...settings.homePage.heroBanners];
                              updatedBanners[index] = { 
                                ...banner, 
                                textStyle: { ...banner.textStyle, animation: e.target.value }
                              };
                              handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                            }}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="fadeInUp">Fade In Up</option>
                            <option value="fadeInDown">Fade In Down</option>
                            <option value="fadeInLeft">Fade In Left</option>
                            <option value="fadeInRight">Fade In Right</option>
                            <option value="zoomIn">Zoom In</option>
                            <option value="slideInUp">Slide In Up</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                        <Input
                          value={banner.link?.url || ''}
                          onChange={(e) => {
                            const updatedBanners = [...settings.homePage.heroBanners];
                            updatedBanners[index] = { 
                              ...banner, 
                              link: { ...banner.link, url: e.target.value }
                            };
                            handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                          }}
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text nút link</label>
                        <Input
                          value={banner.link?.text || ''}
                          onChange={(e) => {
                            const updatedBanners = [...settings.homePage.heroBanners];
                            updatedBanners[index] = { 
                              ...banner, 
                              link: { ...banner.link, text: e.target.value }
                            };
                            handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                          }}
                          placeholder="Tìm hiểu thêm"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={banner.link?.openInNewTab || false}
                            onChange={(e) => {
                              const updatedBanners = [...settings.homePage.heroBanners];
                              updatedBanners[index] = { 
                                ...banner, 
                                link: { ...banner.link, openInNewTab: e.target.checked }
                              };
                              handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Mở tab mới</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={banner.isActive || false}
                            onChange={(e) => {
                              const updatedBanners = [...settings.homePage.heroBanners];
                              updatedBanners[index] = { ...banner, isActive: e.target.checked };
                              handleUpdateSetting('homePage', 'heroBanners', updatedBanners);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Kích hoạt</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Numbers */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Số liệu thống kê</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thành viên</label>
                <Input
                  type="number"
                  value={settings.homePage.statsNumbers.members}
                  onChange={(e) => handleUpdateSetting('homePage', 'statsNumbers', {
                    ...settings.homePage.statsNumbers,
                    members: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dự án</label>
                <Input
                  type="number"
                  value={settings.homePage.statsNumbers.projects}
                  onChange={(e) => handleUpdateSetting('homePage', 'statsNumbers', {
                    ...settings.homePage.statsNumbers,
                    projects: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đối tác</label>
                <Input
                  type="number"
                  value={settings.homePage.statsNumbers.partners}
                  onChange={(e) => handleUpdateSetting('homePage', 'statsNumbers', {
                    ...settings.homePage.statsNumbers,
                    partners: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sự kiện</label>
                <Input
                  type="number"
                  value={settings.homePage.statsNumbers.events}
                  onChange={(e) => handleUpdateSetting('homePage', 'statsNumbers', {
                    ...settings.homePage.statsNumbers,
                    events: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </div>

          {/* Digital Era Quotes */}
          <div className="mb-6">
            <DigitalEraSelector 
              title="Kỷ nguyên số - Trích dẫn"
              value={settings.homePage.digitalEraQuotes}
              onChange={(quotes) => handleUpdateSetting('homePage', 'digitalEraQuotes', quotes)}
            />
          </div>

          {/* Globe Settings */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Cài đặt Globe</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
                <Input
                  value={settings.homePage.globe.location}
                  onChange={(e) => handleUpdateSetting('homePage', 'globe', {
                    ...settings.homePage.globe,
                    location: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={settings.homePage.globe.coordinates.lat}
                  onChange={(e) => handleUpdateSetting('homePage', 'globe', {
                    ...settings.homePage.globe,
                    coordinates: {
                      ...settings.homePage.globe.coordinates,
                      lat: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={settings.homePage.globe.coordinates.lng}
                  onChange={(e) => handleUpdateSetting('homePage', 'globe', {
                    ...settings.homePage.globe,
                    coordinates: {
                      ...settings.homePage.globe.coordinates,
                      lng: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Digital Products */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Sản phẩm số</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <Input
                  value={settings.homePage.digitalProducts.title}
                  onChange={(e) => handleUpdateSetting('homePage', 'digitalProducts', {
                    ...settings.homePage.digitalProducts,
                    title: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                <FileSelector
                  selectedFileId={settings.homePage.digitalProducts.image}
                  onFileSelect={(fileId) => handleUpdateSetting('homePage', 'digitalProducts', {
                    ...settings.homePage.digitalProducts,
                    image: fileId
                  })}
                  fileType="image"
                  title="Chọn Hình Ảnh Sản Phẩm"
                />
              </div>
            </div>
          </div>

          {/* Board Members */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900">Ban lãnh đạo</h4>
              <Button
                onClick={() => {
                  const newMember = { name: '', title: '', image: '' };
                  const updatedMembers = [...settings.homePage.boardMembers, newMember];
                  handleUpdateSetting('homePage', 'boardMembers', updatedMembers);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
              >
                ➕ Thêm thành viên
              </Button>
            </div>
            {settings.homePage.boardMembers.map((member, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 relative">
                <Button
                  onClick={() => {
                    const updatedMembers = settings.homePage.boardMembers.filter((_, i) => i !== index);
                    handleUpdateSetting('homePage', 'boardMembers', updatedMembers);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                >
                  🗑️ Xóa
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-16">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                    <Input
                      value={member.name}
                      onChange={(e) => {
                        const updatedMembers = [...settings.homePage.boardMembers];
                        updatedMembers[index] = { ...member, name: e.target.value };
                        handleUpdateSetting('homePage', 'boardMembers', updatedMembers);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <Input
                      value={member.title}
                      onChange={(e) => {
                        const updatedMembers = [...settings.homePage.boardMembers];
                        updatedMembers[index] = { ...member, title: e.target.value };
                        handleUpdateSetting('homePage', 'boardMembers', updatedMembers);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
                    <FileSelector
                      selectedFileId={member.image}
                      onFileSelect={(fileId) => {
                        const updatedMembers = [...settings.homePage.boardMembers];
                        updatedMembers[index] = { ...member, image: fileId };
                        handleUpdateSetting('homePage', 'boardMembers', updatedMembers);
                      }}
                      fileType="image"
                      title="Chọn Ảnh Đại Diện"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Partners */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900">Đối tác</h4>
              <Button
                onClick={() => {
                  const newPartner = { name: '', logo: '' };
                  const updatedPartners = [...settings.homePage.partners, newPartner];
                  handleUpdateSetting('homePage', 'partners', updatedPartners);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
              >
                ➕ Thêm đối tác
              </Button>
            </div>
            {settings.homePage.partners.map((partner, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 relative">
                <Button
                  onClick={() => {
                    const updatedPartners = settings.homePage.partners.filter((_, i) => i !== index);
                    handleUpdateSetting('homePage', 'partners', updatedPartners);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                >
                  🗑️ Xóa
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-16">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đối tác</label>
                    <Input
                      value={partner.name}
                      onChange={(e) => {
                        const updatedPartners = [...settings.homePage.partners];
                        updatedPartners[index] = { ...partner, name: e.target.value };
                        handleUpdateSetting('homePage', 'partners', updatedPartners);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <FileSelector
                      selectedFileId={partner.logo}
                      onFileSelect={(fileId) => {
                        const updatedPartners = [...settings.homePage.partners];
                        updatedPartners[index] = { ...partner, logo: fileId };
                        handleUpdateSetting('homePage', 'partners', updatedPartners);
                      }}
                      fileType="image"
                      title="Chọn Logo Đối Tác"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Events */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Sự kiện nổi bật</h4>
            <p className="text-sm text-gray-600 mb-4">
              Chọn các sự kiện từ hệ thống để hiển thị trên trang chủ
            </p>
            <EventSelector
              selectedEventIds={settings.homePage.events}
              onEventsSelect={(eventIds) => handleUpdateSetting('homePage', 'events', eventIds)}
              title="Chọn Sự Kiện Nổi Bật"
              maxSelection={6}
            />
          </div>

          {/* News */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Tin tức nổi bật</h4>
            <p className="text-sm text-gray-600 mb-4">
              Chọn các tin tức từ hệ thống để hiển thị trên trang chủ
            </p>
            <PostSelector
              selectedPostIds={settings.homePage.news}
              onPostsSelect={(postIds) => handleUpdateSetting('homePage', 'news', postIds)}
              title="Chọn Tin Tức Nổi Bật"
              maxSelection={6}
            />
          </div>

        </div>
      )}

      {/* Header & Footer Settings */}
      {activeTab === 'layout' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cấu hình Header & Footer</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Header Section */}
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Header</h4>
              
              {/* Header Logo */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {settings.header?.logoFileId ? (
                      <LogoPreview fileId={settings.header.logoFileId} alt="Header Logo" />
                    ) : (
                      <span className="text-gray-400 text-2xl">🖼️</span>
                    )}
                  </div>
                  <FileSelector
                    selectedFileId={settings.header?.logoFileId || ''}
                    onFileSelect={async (fileId) => {
                      if (fileId) {
                        // Get file info to update both logoFileId and logo URL
                        try {
                          const token = localStorage.getItem('access_token');
                          const response = await fetch(`http://localhost:3001/files-upload/${fileId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (response.ok) {
                            const fileData = await response.json();
                            const logoUrl = `http://localhost:9000${fileData.filePath}`;
                            handleUpdateNestedSetting('header', { logoFileId: fileId, logo: logoUrl });
                          } else {
                            handleUpdateNestedSetting('header', { logoFileId: fileId });
                          }
                        } catch (error) {
                          console.error('Error fetching file info:', error);
                          handleUpdateNestedSetting('header', { logoFileId: fileId });
                        }
                      } else {
                        handleUpdateNestedSetting('header', { logoFileId: '', logo: '' });
                      }
                    }}
                    fileType="image"
                    title="Logo Header"
                    compact={true}
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu điều hướng</label>
                <div className="space-y-3">
                  {(settings.header?.menu || []).map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          value={item.label || ''}
                                                  onChange={(e) => {
                          const newMenu = [...(settings.header?.menu || [])];
                          newMenu[index] = { ...newMenu[index], label: e.target.value };
                          handleUpdateNestedSetting('header', { menu: newMenu });
                        }}
                          placeholder="Tên menu"
                          className="flex-1"
                        />
                        <Input
                          type="url"
                          value={item.url || ''}
                                                  onChange={(e) => {
                          const newMenu = [...(settings.header?.menu || [])];
                          newMenu[index] = { ...newMenu[index], url: e.target.value };
                          handleUpdateNestedSetting('header', { menu: newMenu });
                        }}
                          placeholder="/url"
                          className="flex-1"
                        />
                        <button
                          type="button"
                                                  onClick={() => {
                          const newMenu = (settings.header?.menu || []).filter((_, i) => i !== index);
                          handleUpdateNestedSetting('header', { menu: newMenu });
                        }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                          title="Xóa menu"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {/* Submenu */}
                      <div className="pl-4 border-l-2 border-gray-200">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Menu con</label>
                        <div className="space-y-1">
                          {(item.children || []).map((child: any, childIndex: number) => (
                            <div key={childIndex} className="flex gap-2">
                              <Input
                                type="text"
                                value={child.label || ''}
                                onChange={(e) => {
                                  const newMenu = [...(settings.header?.menu || [])];
                                  const newChildren = [...(newMenu[index].children || [])];
                                  newChildren[childIndex] = { ...newChildren[childIndex], label: e.target.value };
                                  newMenu[index] = { ...newMenu[index], children: newChildren };
                                  handleUpdateNestedSetting('header', { menu: newMenu });
                                }}
                                placeholder="Tên menu con"
                                className="flex-1 text-sm"
                              />
                              <Input
                                type="url"
                                value={child.url || ''}
                                onChange={(e) => {
                                  const newMenu = [...(settings.header?.menu || [])];
                                  const newChildren = [...(newMenu[index].children || [])];
                                  newChildren[childIndex] = { ...newChildren[childIndex], url: e.target.value };
                                  newMenu[index] = { ...newMenu[index], children: newChildren };
                                  handleUpdateNestedSetting('header', { menu: newMenu });
                                }}
                                placeholder="/url-con"
                                className="flex-1 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newMenu = [...(settings.header?.menu || [])];
                                  const newChildren = (newMenu[index].children || []).filter((_: any, i: number) => i !== childIndex);
                                  newMenu[index] = { ...newMenu[index], children: newChildren };
                                  handleUpdateNestedSetting('header', { menu: newMenu });
                                }}
                                className="p-1 text-red-500 hover:text-red-700 text-sm"
                                title="Xóa menu con"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newMenu = [...(settings.header?.menu || [])];
                              const newChildren = [...(newMenu[index].children || []), { label: '', url: '' }];
                              newMenu[index] = { ...newMenu[index], children: newChildren };
                              handleUpdateSetting('header', 'menu', newMenu);
                            }}
                            size="sm"
                            className="text-xs"
                          >
                            + Thêm menu con
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                                          const newMenu = [...(settings.header?.menu || []), { label: '', url: '', children: [] }];
                    handleUpdateNestedSetting('header', { menu: newMenu });
                    }}
                    size="sm"
                  >
                    + Thêm menu
                  </Button>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ hỗ trợ</label>
                <div className="space-y-2">
                  {(settings.header?.languages || []).map((lang: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                        <select
                          value={lang.code || ''}
                          onChange={(e) => {
                            const newLangs = [...(settings.header?.languages || [])];
                            const selectedLang = languageOptions.find(l => l.code === e.target.value);
                            newLangs[index] = { 
                              code: selectedLang?.code || '', 
                              label: selectedLang?.label || '',
                              flag: selectedLang?.flag || '',
                              flagFileId: lang.flagFileId || ''
                            };
                            handleUpdateNestedSetting('header', { languages: newLangs });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Chọn</option>
                          <option value="vi-VN">🇻🇳 Tiếng Việt</option>
                          <option value="en-US">🇺🇸 English</option>
                          <option value="ko-KR">🇰🇷 한국어</option>
                          <option value="ja-JP">🇯🇵 日본語</option>
                          <option value="zh-CN">🇨🇳 中文</option>
                          <option value="th-TH">🇹🇭 ไทย</option>
                          <option value="id-ID">🇮🇩 Indonesia</option>
                        </select>
                        
                        <span className="text-lg w-6 text-center">
                          {lang.flag || '🏳️'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const newLangs = (settings.header?.languages || []).filter((_, i) => i !== index);
                            handleUpdateNestedSetting('header', { languages: newLangs });
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                        
                        <FileSelector
                          compact={true}
                          selectedFileId={lang.flagFileId || ''}
                          onFileSelect={(fileId) => {
                            const newLangs = [...(settings.header?.languages || [])];
                            newLangs[index] = { ...newLangs[index], flagFileId: fileId };
                            handleUpdateNestedSetting('header', { languages: newLangs });
                          }}
                          fileType="image"
                          title=""
                        />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                                          const newLangs = [...(settings.header?.languages || []), { 
                      code: '', 
                      label: '', 
                      flag: '', 
                      flagFileId: '' 
                    }];
                    handleUpdateNestedSetting('header', { languages: newLangs });
                    }}
                    size="sm"
                  >
                    + Thêm ngôn ngữ
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2">Footer</h4>
              
              {/* Footer Logo */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {settings.footer?.logoFileId ? (
                      <LogoPreview fileId={settings.footer.logoFileId} alt="Footer Logo" />
                    ) : (
                      <span className="text-gray-400 text-2xl">🖼️</span>
                    )}
                  </div>
                  <FileSelector
                    selectedFileId={settings.footer?.logoFileId || ''}
                    onFileSelect={async (fileId) => {
                      if (fileId) {
                        // Get file info to update both logoFileId and logo URL
                        try {
                          const token = localStorage.getItem('access_token');
                          const response = await fetch(`http://localhost:3001/files-upload/${fileId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (response.ok) {
                            const fileData = await response.json();
                            const logoUrl = `http://localhost:9000${fileData.filePath}`;
                            handleUpdateNestedSetting('footer', { logoFileId: fileId, logo: logoUrl });
                          } else {
                            handleUpdateNestedSetting('footer', { logoFileId: fileId });
                          }
                        } catch (error) {
                          console.error('Error fetching file info:', error);
                          handleUpdateNestedSetting('footer', { logoFileId: fileId });
                        }
                      } else {
                        handleUpdateNestedSetting('footer', { logoFileId: '', logo: '' });
                      }
                    }}
                    fileType="image"
                    title="Logo Footer"
                    compact={true}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <Input
                    type="text"
                    value={settings.footer?.address || ''}
                    onChange={(e) => handleUpdateNestedSetting('footer', { address: e.target.value })}
                    placeholder="Địa chỉ công ty"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <Input
                      type="tel"
                      value={settings.footer?.phone || ''}
                      onChange={(e) => handleUpdateNestedSetting('footer', { phone: e.target.value })}
                      placeholder="+84 28 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={settings.footer?.email || ''}
                      onChange={(e) => handleUpdateNestedSetting('footer', { email: e.target.value })}
                      placeholder="info@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mạng xã hội</label>
                <div className="space-y-2">
                  {(settings.footer?.social || []).map((item: any, index: number) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={item.name || ''}
                        onChange={(e) => {
                          const selectedSocial = socialMediaOptions.find(option => option.name === e.target.value);
                          const newSocial = [...(settings.footer?.social || [])];
                          newSocial[index] = { 
                            ...newSocial[index], 
                            name: e.target.value,
                            icon: selectedSocial?.icon || item.icon || ''
                          };
                          handleUpdateNestedSetting('footer', { social: newSocial });
                        }}
                        className="w-36 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn mạng xã hội</option>
                        {socialMediaOptions.map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.icon} {option.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="url"
                        value={item.url || ''}
                        onChange={(e) => {
                          const newSocial = [...(settings.footer?.social || [])];
                          newSocial[index] = { ...newSocial[index], url: e.target.value };
                          handleUpdateNestedSetting('footer', { social: newSocial });
                        }}
                        placeholder="URL"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSocial = (settings.footer?.social || []).filter((_, i) => i !== index);
                          handleUpdateNestedSetting('footer', { social: newSocial });
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newSocial = [...(settings.footer?.social || []), { name: '', icon: '', url: '' }];
                      handleUpdateNestedSetting('footer', { social: newSocial });
                    }}
                    size="sm"
                  >
                    + Thêm mạng xã hội
                  </Button>
                </div>
              </div>

              {/* Legal Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bản quyền</label>
                <Input
                  type="text"
                  value={settings.footer?.legal || ''}
                  onChange={(e) => handleUpdateNestedSetting('footer', { legal: e.target.value })}
                  placeholder="© 2024 Công ty ABC"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
