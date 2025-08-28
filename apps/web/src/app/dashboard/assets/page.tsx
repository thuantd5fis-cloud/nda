'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import { 
  ImageIcon, VideoIcon, AudioIcon, DocumentIcon, FolderIcon,
  EyeIcon, DownloadIcon, CopyIcon, TrashIcon, UploadIcon,
  GridIcon, ListIcon, StorageIcon, ErrorIcon
} from '@/components/icons';

// Asset Type Badge Component
const TypeBadge = ({ type }: { type: string }) => {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return <ImageIcon className="w-3 h-3" />;
      case 'video':
        return <VideoIcon className="w-3 h-3" />;
      case 'audio':
        return <AudioIcon className="w-3 h-3" />;
      case 'document':
        return <DocumentIcon className="w-3 h-3" />;
      default:
        return <FolderIcon className="w-3 h-3" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
      <span className="mr-1">{getTypeIcon(type)}</span>
      {type.toUpperCase()}
    </span>
  );
};

// File Size Formatter
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Transform files-upload response to assets format
const transformFileToAsset = (file: any) => {
  // Generate public URL for the file
  const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
  const publicUrl = file.filePath ? `${baseUrl}${file.filePath}` : null;
  
  return {
    id: file.id,
    name: file.fileName || file.name,
    url: publicUrl || file.publicUrl,
    thumbnailUrl: publicUrl || file.publicUrl,
    size: file.fileSize || file.size,
    type: file.fileType || file.type,
    mimeType: file.mimeType,
    createdAt: file.createdAt,
    alt: file.fileName || file.name,
    downloadCount: 0, // files-upload doesn't track downloads yet
    usageCount: 0, // files-upload doesn't track usage yet
    tags: [], // files-upload doesn't have tags yet
    uploader: file.uploader
  };
};

// Asset Grid Item Component
const AssetGridItem = ({ asset }: { asset: any }) => {
  const { toast } = useConfirm();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.success('✅ Đã sao chép link thành công!');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('❌ Không thể sao chép link. Vui lòng thử lại.');
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Asset Preview */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {asset.type?.toLowerCase() === 'image' ? (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.alt || asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400">
              {asset.type?.toLowerCase() === 'video' ? <VideoIcon className="w-12 h-12" /> :
               asset.type?.toLowerCase() === 'audio' ? <AudioIcon className="w-12 h-12" /> :
               asset.type?.toLowerCase() === 'document' ? <DocumentIcon className="w-12 h-12" /> : <FolderIcon className="w-12 h-12" />}
            </div>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/assets/${asset.id}`}
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 hover:text-gray-800"
              title="Xem chi tiết"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={() => window.open(asset.url, '_blank')}
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 hover:text-gray-800"
              title="Tải xuống"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyUrl}
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 hover:text-gray-800"
              title="Sao chép link"
            >
              <CopyIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <TypeBadge type={asset.type} />
        </div>
      </div>

      {/* Asset Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1" title={asset.name}>
          {asset.name}
        </h3>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>{formatFileSize(asset.size)}</span>
            <div className="flex items-center gap-1">
              <DownloadIcon className="w-3 h-3" />
              <span>{asset.downloadCount || 0}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Sử dụng: {asset.usageCount || 0}</span>
            <span>{new Date(asset.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        
        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {asset.tags.slice(0, 2).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {asset.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{asset.tags.length - 2}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Asset List Item Component
const AssetListItem = ({ asset }: { asset: any }) => {
  const { toast } = useConfirm();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.success('✅ Đã sao chép link thành công!');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('❌ Không thể sao chép link. Vui lòng thử lại.');
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Asset Preview */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            {asset.type?.toLowerCase() === 'image' ? (
              <img
                src={asset.thumbnailUrl || asset.url}
                alt={asset.alt || asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400">
                  {asset.type?.toLowerCase() === 'video' ? <VideoIcon className="w-8 h-8" /> :
                   asset.type?.toLowerCase() === 'audio' ? <AudioIcon className="w-8 h-8" /> :
                   asset.type?.toLowerCase() === 'document' ? <DocumentIcon className="w-8 h-8" /> : <FolderIcon className="w-8 h-8" />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {asset.name}
            </h3>
            <TypeBadge type={asset.type} />
          </div>
          <div className="text-sm text-gray-500 grid grid-cols-2 gap-4">
            <div>
              <span>Kích thước: {formatFileSize(asset.size)}</span>
            </div>
            <div>
              <span>Tải xuống: {asset.downloadCount || 0} lần</span>
            </div>
            <div>
              <span>Sử dụng: {asset.usageCount || 0} lần</span>
            </div>
            <div>
              <span>Ngày tải: {new Date(asset.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          
          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
                {asset.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{asset.tags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-2">
          <Link href={`/dashboard/assets/${asset.id}`} className="p-2 text-gray-400 hover:text-gray-600" title="Xem chi tiết">
            <EyeIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => window.open(asset.url, '_blank')}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Tải xuống"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyUrl}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Sao chép link"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-400 hover:text-red-600" title="Xóa">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Upload Zone Component
const UploadZone = () => {
  const { toast } = useConfirm();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Upload mutation using files-upload endpoint like homepage settings
  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiClient.uploadFileToStorage(file),
    onSuccess: (result) => {
      toast.success(`✅ Upload thành công: ${result.fileName || result.name || 'file'}`);
      // Refresh files list
      queryClient.invalidateQueries({ queryKey: ['files-upload'] });
      setUploading(false);
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast.error(`❌ Upload thất bại: ${error.message}`);
      setUploading(false);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    console.log('Files dropped:', acceptedFiles);
    
    // Upload files one by one
    for (const file of acceptedFiles) {
      try {
        console.log(`Uploading: ${file.name} (${file.size} bytes)`);
        await uploadMutation.mutateAsync(file);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': [],
      'text/plain': [],
      'application/zip': [],
      'application/x-rar-compressed': [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 
        uploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
        'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-gray-400 mb-4">
        {uploading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        ) : (
          <UploadIcon className="w-12 h-12 mx-auto" />
        )}
      </div>
      <div className="text-lg font-medium text-gray-900 mb-2">
        {uploading ? 'Đang upload...' :
         isDragActive ? 'Thả file vào đây...' : 'Kéo thả file hoặc click để chọn'}
      </div>
      <p className="text-gray-500">
        Hỗ trợ: Ảnh, Video, Audio, PDF, Word, Excel, PowerPoint, Text, ZIP (Tối đa 100MB)
      </p>
      {uploading && (
        <p className="text-blue-600 text-sm mt-2">
          Vui lòng đợi trong khi file được upload...
        </p>
      )}
    </div>
  );
};

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  // Fetch files from files-upload endpoint
  const { data: assetsResponse, isLoading, error } = useQuery({
    queryKey: ['files-upload', { search: searchTerm, type: typeFilter }],
    queryFn: () => apiClient.getFilesFromStorage({ 
      page: 1, 
      limit: 100, 
      fileType: typeFilter !== 'all' ? typeFilter : undefined
    }),
  });

  // Extract assets from response (files-upload returns array directly)
  const rawAssets = Array.isArray(assetsResponse) ? assetsResponse : (assetsResponse?.data || []);
  const pagination = assetsResponse?.pagination || { total: rawAssets.length };

  // Transform files-upload format to assets format
  const assets = rawAssets.map(transformFileToAsset);

  // Filter assets based on search and filters (if not already filtered by API)
  const filteredAssets = assets.filter((asset: any) => {
    const matchesSearch = searchTerm === '' || 
                         (asset.name && asset.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || 
                       (asset.type && asset.type.toLowerCase() === typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500">
          <div className="text-red-500 mb-4">
            <ErrorIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-500">
            Không thể tải danh sách tài nguyên. Vui lòng thử lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài nguyên</h1>
          <p className="text-gray-600">
            Upload và quản lý hình ảnh, video, tài liệu
          </p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} className="inline-flex items-center gap-2">
          <UploadIcon className="w-4 h-4" />
          Upload file
        </Button>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <UploadZone />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng file
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {assets.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ImageIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hình ảnh
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {assets.filter((a: any) => a.type?.toLowerCase() === 'image').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <VideoIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Video
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {assets.filter((a: any) => a.type?.toLowerCase() === 'video').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StorageIcon className="w-8 h-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Dung lượng
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatFileSize(assets.reduce((total: number, asset: any) => total + (asset.size || 0), 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên file..."
                className="mt-1"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Loại file
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Tài liệu</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hiển thị
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border inline-flex items-center justify-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <GridIcon className="w-4 h-4" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b inline-flex items-center justify-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ListIcon className="w-4 h-4" /> List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Thư viện tài nguyên ({filteredAssets.length})
          </h3>
          
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="text-gray-400 mb-4">
                  <FolderIcon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có tài nguyên nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload file đầu tiên để bắt đầu
                </p>
                <Button onClick={() => setShowUpload(true)}>
                  Upload file mới
                </Button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
              : 'space-y-4'
            }>
              {filteredAssets.map((asset: any) => (
                viewMode === 'grid' ? (
                  <AssetGridItem key={asset.id} asset={asset} />
                ) : (
                  <AssetListItem key={asset.id} asset={asset} />
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                trong tổng số <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}