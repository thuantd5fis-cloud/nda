'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from '@cms/ui';

interface FileUpload {
  id: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  mimeType?: string;
  createdAt?: string;
}

interface FileSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileId: string, fileName: string) => void;
  fileType?: 'video' | 'image' | 'document' | 'all';
  title?: string;
  selectedFileId?: string;
}

export default function FileSelectionDialog({
  isOpen,
  onClose,
  onSelect,
  fileType = 'all',
  title = 'Chọn File',
  selectedFileId
}: FileSelectionDialogProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(fileType === 'all' ? '' : fileType);
  
  // Debug initial state
  useEffect(() => {
    console.log('FileSelectionDialog initialized:', { fileType, typeFilter });
    console.log('Initial typeFilter value:', typeFilter);
  }, []);
  const [isMounted, setIsMounted] = useState(false);

  // Get file type icon
  const getFileIcon = (type: string, mimeType: string) => {
    if (type === 'video' || (mimeType && mimeType.startsWith('video/'))) return '📹';
    if (type === 'image' || (mimeType && mimeType.startsWith('image/'))) return '🖼️';
    if (type === 'document' || (mimeType && (mimeType.includes('pdf') || mimeType.includes('document')))) return '📄';
    return '📁';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Generate thumbnail for video
  const VideoThumbnail = ({ file }: { file: FileUpload }) => {
    const [thumbnail, setThumbnail] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (file.fileType === 'video' && file.filePath) {
        // Create video element to generate thumbnail
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.currentTime = 1; // Capture at 1 second
        
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = 160;
          canvas.height = 90;
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/jpeg', 0.7);
            setThumbnail(dataURL);
          }
          setLoading(false);
        };

        video.onerror = () => {
          setLoading(false);
        };

        // Use Minio URL for video
        video.src = `http://localhost:9000/uploads${file.filePath}`;
        video.load();
      } else {
        setLoading(false);
      }
    }, [file]);

    if (file.fileType !== 'video') {
      return (
        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
          {getFileIcon(file.fileType || '', file.mimeType || '')}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
          <div className="text-xs text-gray-500">⏳</div>
        </div>
      );
    }

    if (thumbnail) {
      return (
        <div className="relative w-20 h-12 bg-gray-100 rounded overflow-hidden">
          <img 
            src={thumbnail} 
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-1">
              <div className="text-white text-xs">▶️</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
        <div className="text-2xl">📹</div>
      </div>
    );
  };

  // Fetch files from API
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      let url = 'http://localhost:3001/files-upload';
      
      // Use specific endpoint for videos if available
      if (fileType === 'video') {
        url = 'http://localhost:3001/files-upload/videos';
      } else if (fileType !== 'all') {
        url = `http://localhost:3001/files-upload?type=${fileType}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Files count:', data?.length || 0);
        
        // Ensure all required fields are present
        const processedFiles = (data || []).map((file: any) => ({
          id: file.id,
          fileName: file.fileName || 'Unknown file',
          filePath: file.filePath,
          fileSize: file.fileSize || 0,
          fileType: file.fileType || 'unknown',
          mimeType: file.mimeType || 'application/octet-stream',
          createdAt: file.createdAt,
        }));
        
        console.log('Processed files:', processedFiles);
        setFiles(processedFiles);
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter files based on search and type
  useEffect(() => {
    console.log('Filtering files:', { files: files.length, typeFilter, searchTerm });
    let filtered = files;

    // Filter by type - DISABLE AGAIN FOR NOW
    if (false && typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(file => {
        const matchesFileType = file.fileType === typeFilter;
        const matchesMimeType = file.mimeType && file.mimeType.startsWith(typeFilter + '/');
        console.log('File filter check:', { 
          fileName: file.fileName, 
          fileType: file.fileType, 
          mimeType: file.mimeType, 
          typeFilter, 
          matchesFileType, 
          matchesMimeType 
        });
        return matchesFileType || matchesMimeType;
      });
      console.log('After type filter:', filtered.length);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.fileName && file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    console.log('Final filtered files:', filtered.length);
    setFilteredFiles(filtered);
  }, [files, searchTerm, typeFilter]);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch files when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, fileType]);

  const handleSelect = (file: FileUpload) => {
    onSelect(file.id, file.fileName || 'Unknown file');
    onClose();
  };

  if (!isOpen || !isMounted) return null;

  const dialogContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-4 items-center">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="🔍 Tìm kiếm file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            {fileType === 'all' && (
              <div className="min-w-[150px]">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tất cả loại</option>
                  <option value="video">📹 Video</option>
                  <option value="image">🖼️ Hình ảnh</option>
                  <option value="document">📄 Tài liệu</option>
                </select>
              </div>
            )}

            {/* Stats */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {filteredFiles.length} / {files.length} files
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">⏳ Đang tải danh sách file...</div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <div>
                  {searchTerm || typeFilter 
                    ? 'Không tìm thấy file phù hợp' 
                    : 'Chưa có file nào. Hãy upload file đầu tiên!'
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                    selectedFileId === file.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelect(file)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <VideoThumbnail file={file} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate" title={file.fileName || 'Unknown file'}>
                        {file.fileName || 'Unknown file'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.fileSize || 0)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Unknown date'}
                      </div>
                      {selectedFileId === file.id && (
                        <div className="text-blue-600 text-xs font-medium mt-2">
                          ✓ Đã chọn
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          {selectedFileId && (
            <Button 
              onClick={() => {
                const selectedFile = files.find(f => f.id === selectedFileId);
                if (selectedFile) {
                  handleSelect(selectedFile);
                }
              }}
            >
              Chọn file này
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render dialog at document body level
  if (typeof document !== 'undefined') {
    return createPortal(dialogContent, document.body);
  }

  return null;
}
