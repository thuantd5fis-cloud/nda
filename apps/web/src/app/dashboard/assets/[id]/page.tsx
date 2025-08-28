'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { useConfirm } from '@/hooks/use-confirm';
import {
  ImageIcon, VideoIcon, AudioIcon, DocumentIcon, FolderIcon,
  PdfIcon, SpreadsheetIcon, PresentationIcon, ArchiveIcon,
  PostIcon, CalendarIcon, PageIcon, UserProfileIcon, LinkIcon,
  ArrowLeftIcon, EditIcon, TrashIcon, DownloadIcon, CopyIcon, SearchIcon
} from '@/components/icons';
import { apiClient } from '@/lib/api';

// Helper function to build full asset URL
const buildAssetUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // Already a full URL
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${apiBase}${url.startsWith('/') ? url : '/' + url}`;
};

interface Asset {
  id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  tags: string[];
  uploadedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  usageCount: number;
  usedIn: Array<{
    id: string;
    title: string;
    type: 'post' | 'page' | 'profile' | 'event';
    url: string;
  }>;
  downloadCount: number;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    colorSpace?: string;
    hasAlpha?: boolean;
    dpi?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper functions

const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
  if (mimeType.startsWith('video/')) return <VideoIcon className="w-5 h-5" />;
  if (mimeType.startsWith('audio/')) return <AudioIcon className="w-5 h-5" />;
  if (mimeType.includes('pdf')) return <PdfIcon className="w-5 h-5" />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <DocumentIcon className="w-5 h-5" />;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return <SpreadsheetIcon className="w-5 h-5" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <PresentationIcon className="w-5 h-5" />;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return <ArchiveIcon className="w-5 h-5" />;
  return <FolderIcon className="w-5 h-5" />;
};

const getUsageTypeIcon = (type: string) => {
  switch (type) {
    case 'post': return <PostIcon className="w-4 h-4" />;
    case 'event': return <CalendarIcon className="w-4 h-4" />;
    case 'page': return <PageIcon className="w-4 h-4" />;
    case 'profile': return <UserProfileIcon className="w-4 h-4" />;
    default: return <LinkIcon className="w-4 h-4" />;
  }
};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { confirmDelete, toast } = useConfirm();
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    alt: '',
    caption: '',
    description: '',
    tags: [] as string[]
  });

  // Fetch asset data using React Query
  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', params.id],
    queryFn: () => apiClient.getAsset(params.id as string),
    enabled: !!params.id,
  });

  // Initialize edit data when asset loads
  useEffect(() => {
    if (asset) {
      setEditData({
        name: asset.name || '',
        alt: asset.alt || '',
        caption: asset.caption || '',
        description: asset.description || '',
        tags: asset.tags || []
      });
    }
  }, [asset]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Không thể tải thông tin tài nguyên');
      router.push('/dashboard/assets');
    }
  }, [error, router, toast]);

  const handleDelete = async () => {
    if (!asset) return;

    if (asset.usageCount && asset.usageCount > 0) {
      toast.error(`Không thể xóa tài nguyên này vì đang được sử dụng trong ${asset.usageCount} nơi. Vui lòng gỡ khỏi tất cả các vị trí sử dụng trước.`);
      return;
    }

    const confirmed = await confirmDelete(
      `Bạn có chắc chắn muốn xóa tài nguyên "${asset.name}"? Hành động này không thể hoàn tác.`,
      {
        title: 'Xác nhận xóa tài nguyên'
      }
    );

    if (!confirmed) return;

    try {
      await apiClient.deleteAsset(asset.id);
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Tài nguyên đã được xóa thành công!');
      router.push('/dashboard/assets');
    } catch (error) {
      console.error('Delete asset error:', error);
      toast.error('Có lỗi xảy ra khi xóa tài nguyên');
    }
  };

  const handleSaveEdit = async () => {
    if (!asset) return;

    try {
      const updateData = {
        name: editData.name,
        alt: editData.alt,
        caption: editData.caption,
        description: editData.description,
        tags: editData.tags
      };
      
      await apiClient.updateAsset(asset.id, updateData);
      await queryClient.invalidateQueries({ queryKey: ['asset', asset.id] });
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsEditing(false);
      toast.success('Thông tin tài nguyên đã được cập nhật thành công!');
    } catch (error) {
      console.error('Update asset error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleDownload = () => {
    if (asset) {
      // Simulate download
      const link = document.createElement('a');
      link.href = buildAssetUrl(asset.url);
      link.download = asset.originalName;
      link.click();
      
      // Update download count (note: this should ideally be handled by the API)
      console.log('Downloaded:', buildAssetUrl(asset.url));
    }
  };

  const handleCopyUrl = async () => {
    if (!asset) return;
    
    try {
      const fullUrl = buildAssetUrl(asset.url);
      await navigator.clipboard.writeText(fullUrl);
      toast.success('✅ Đã sao chép link thành công!');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('❌ Không thể sao chép link. Vui lòng thử lại.');
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Đang tải thông tin tài nguyên...</div>
          <div className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error ? 'Lỗi tải dữ liệu' : 'Không tìm thấy tài nguyên'}
          </h3>
          <p className="text-gray-500 mb-6">
            {error ? 'Không thể tải thông tin tài nguyên. Vui lòng thử lại.' : 'Tài nguyên không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="space-x-3">
            <Button onClick={() => router.push('/dashboard/assets')} variant="outline">
              <ArrowLeftIcon className="w-4 h-4 mr-2" /> Về danh sách
            </Button>
            {error && (
              <Button onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết tài nguyên</h1>
          <p className="text-gray-600 mt-2">
            Xem và quản lý tài nguyên media
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/assets')}
          >
            ← Danh sách tài nguyên
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="inline-flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" /> Tải xuống
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-2"
          >
            <CopyIcon className="w-4 h-4" /> Sao chép link
          </Button>
          {isEditing ? (
            <>
              <Button onClick={handleSaveEdit}>
                ✅ Lưu thay đổi
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                ❌ Hủy
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={asset.usageCount > 0}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Asset Preview Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước</h3>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-1">
                <div><strong>Original URL:</strong> {asset.url}</div>
                <div><strong>Full URL:</strong> {buildAssetUrl(asset.url)}</div>
                <div><strong>Asset Type:</strong> {asset.type}</div>
              </div>
            )}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {(asset.type === 'image' || asset.type === 'IMAGE' || asset.mimeType?.startsWith('image/')) ? (
                <img
                  src={buildAssetUrl(asset.url)}
                  alt={asset.alt || asset.name}
                  className="max-w-full max-h-full object-contain"
                  onLoad={(e) => {
                    console.log('Image loaded successfully:', buildAssetUrl(asset.url));
                  }}
                  onError={(e) => {
                    console.error('Image load error:', buildAssetUrl(asset.url));
                    console.error('Original URL:', asset.url);
                    console.error('Error details:', e);
                    e.currentTarget.style.display = 'none';
                    const errorDiv = e.currentTarget.parentElement?.querySelector('.hidden');
                    if (errorDiv) {
                      errorDiv.classList.remove('hidden');
                    }
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">{getFileIcon(asset.mimeType)}</div>
                  <div className="text-lg font-medium text-gray-900">{asset.name}</div>
                  <div className="text-sm text-gray-500">{asset.mimeType}</div>
                </div>
              )}
              <div className="hidden text-center">
                <div className="text-red-400 mb-4">
                  <ImageIcon className="w-16 h-16 mx-auto" />
                </div>
                <div className="text-gray-500">Không thể tải preview</div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={handleDownload} className="inline-flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" /> Tải xuống
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyUrl} className="inline-flex items-center gap-2">
                <CopyIcon className="w-4 h-4" /> Sao chép link
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(buildAssetUrl(asset.url), '_blank')} className="inline-flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Mở trong tab mới
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
            
            <div className="space-y-4">
              {/* File Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên file
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="text-gray-900 font-medium">{asset.name}</div>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt text (SEO)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.alt}
                    onChange={(e) => setEditData(prev => ({ ...prev, alt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mô tả ngắn cho SEO..."
                  />
                ) : (
                  <div className="text-gray-700">{asset.alt || 'Chưa có alt text'}</div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.caption}
                    onChange={(e) => setEditData(prev => ({ ...prev, caption: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Caption hiển thị..."
                  />
                ) : (
                  <div className="text-gray-700">{asset.caption || 'Chưa có caption'}</div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mô tả chi tiết về tài nguyên..."
                  />
                ) : (
                  <div className="text-gray-700">{asset.description || 'Chưa có mô tả'}</div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.tags.join(', ')}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="tag1, tag2, tag3..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kích thước</p>
              <p className="text-2xl font-bold text-blue-600">{formatFileSize(asset.size)}</p>
            </div>
            <div className="text-2xl">💾</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sử dụng</p>
              <p className="text-2xl font-bold text-green-600">{asset.usageCount}</p>
            </div>
            <div className="text-2xl">📎</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">vị trí</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-purple-600">{asset.downloadCount}</p>
            </div>
            <div className="text-gray-400">
              <DownloadIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {asset.metadata?.width ? 'Kích thước' : 'Định dạng'}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {asset.metadata?.width 
                  ? `${asset.metadata.width}×${asset.metadata.height}`
                  : asset.metadata?.format || asset.type?.toUpperCase() || 'N/A'
                }
              </p>
            </div>
            <div className="text-gray-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="details"
          label="📋 Chi tiết"
          isActive={activeTab === 'details'}
          onClick={setActiveTab}
        />
        <TabButton
          id="usage"
          label={`📎 Sử dụng (${asset.usageCount})`}
          isActive={activeTab === 'usage'}
          onClick={setActiveTab}
        />
        <TabButton
          id="metadata"
          label="Metadata"
          isActive={activeTab === 'metadata'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin file</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tên gốc:</span>
                <span className="font-medium">{asset.originalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loại:</span>
                <span className="font-medium">{asset.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MIME type:</span>
                <span className="font-mono text-xs">{asset.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kích thước:</span>
                <span className="font-medium">{formatFileSize(asset.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">URL:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs truncate max-w-[200px]">{asset.url}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(asset.url)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin upload</h3>
            <div className="space-y-4">
              {asset.uploadedBy && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {asset.uploadedBy.avatar ? (
                      <img
                        src={asset.uploadedBy.avatar}
                        alt={asset.uploadedBy.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      asset.uploadedBy.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{asset.uploadedBy.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">Người upload</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{new Date(asset.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật cuối:</span>
                  <span className="font-medium">{new Date(asset.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Đang được sử dụng tại ({asset.usageCount || 0} vị trí)
            </h3>
          </div>
          
          <div className="p-6">
            {asset.usedIn && asset.usedIn.length > 0 ? (
              <div className="space-y-3">
                {asset.usedIn.map((usage: any) => (
                  <div key={usage.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-xl mt-1">{getUsageTypeIcon(usage.type)}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{usage.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Loại: {usage.type === 'post' ? 'Bài viết' : 
                               usage.type === 'event' ? 'Sự kiện' : 
                               usage.type === 'page' ? 'Trang' : 'Profile'}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          <Link href={usage.url} className="hover:underline">
                            {usage.url}
                          </Link>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📎</div>
                <div className="text-lg font-medium text-gray-900 mb-2">Chưa được sử dụng</div>
                <div className="text-gray-500">Tài nguyên này chưa được sử dụng ở đâu</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata chi tiết</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <h4 className="font-medium text-gray-900">Thông tin kỹ thuật</h4>
              {asset.metadata?.width && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Kích thước:</span>
                  <span className="font-medium">{asset.metadata.width} × {asset.metadata.height} px</span>
                </div>
              )}
              {asset.metadata?.format && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Định dạng:</span>
                  <span className="font-medium">{asset.metadata.format}</span>
                </div>
              )}
              {asset.metadata?.colorSpace && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Color space:</span>
                  <span className="font-medium">{asset.metadata.colorSpace}</span>
                </div>
              )}
              {typeof asset.metadata?.hasAlpha === 'boolean' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Alpha channel:</span>
                  <span className="font-medium">{asset.metadata.hasAlpha ? 'Có' : 'Không'}</span>
                </div>
              )}
              {asset.metadata?.dpi && (
                <div className="flex justify-between">
                  <span className="text-gray-600">DPI:</span>
                  <span className="font-medium">{asset.metadata.dpi}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <h4 className="font-medium text-gray-900">Thông tin bổ sung</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{asset.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số lần download:</span>
                <span className="font-medium">{asset.downloadCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số lần sử dụng:</span>
                <span className="font-medium">{asset.usageCount || 0}</span>
              </div>
              {asset.thumbnailUrl && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thumbnail:</span>
                  <span className="font-medium">Có</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
