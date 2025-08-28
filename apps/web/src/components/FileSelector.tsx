'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@cms/ui';
import FileSelectionDialog from './FileSelectionDialog';

interface FileUpload {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

interface FileSelectorProps {
  selectedFileId?: string;
  onFileSelect: (fileId: string) => void;
  fileType?: 'video' | 'image' | 'document' | 'all';
  title?: string;
  compact?: boolean; // Compact mode for logos
}

export default function FileSelector({ 
  selectedFileId, 
  onFileSelect, 
  fileType = 'video',
  title = 'Chọn File',
  compact = false
}: FileSelectorProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Get selected file name for display
  const getSelectedFileName = async (fileId: string) => {
    if (!fileId) return '';
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/files-upload/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const file = await response.json();
        return file.fileName;
      }
    } catch (error) {
      console.error('Error fetching file info:', error);
    }
    return '';
  };

  // Upload file
  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch('http://localhost:3001/files-upload/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newFile = await response.json();
        setUploadFile(null);
        setShowUpload(false);
        setSelectedFileName(newFile.fileName);
        onFileSelect(newFile.id);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹';
      case 'image': return '🖼️';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  // Get accept attribute for file input
  const getAcceptAttribute = (type: string) => {
    switch (type) {
      case 'video': return 'video/*';
      case 'image': return 'image/*';
      case 'document': return '.pdf,.doc,.docx,.txt';
      default: return '*/*';
    }
  };

  // Load selected file name when selectedFileId changes
  useEffect(() => {
    if (selectedFileId) {
      getSelectedFileName(selectedFileId).then(setSelectedFileName);
    } else {
      setSelectedFileName('');
    }
  }, [selectedFileId]);

  return (
    <div className="space-y-4">
      {compact ? (
        // Compact mode for logos
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => setShowUpload(!showUpload)}
            className="px-3 py-2"
            title={showUpload ? 'Hủy upload' : `Upload ${fileType} mới`}
          >
            {showUpload ? '❌' : '📤'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDialog(true)}
            className="px-3 py-2"
            title="Chọn từ danh sách"
          >
            ⋯
          </Button>
          {selectedFileId && selectedFileName && (
            <span className="text-sm text-gray-600 ml-2">
              ✓ {selectedFileName}
            </span>
          )}
        </div>
      ) : (
        // Standard mode
        <div className="flex justify-between items-center">
          <h4 className="text-md font-medium text-gray-900">{title}</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(true)}
              className="text-sm"
            >
              📋 Chọn từ danh sách
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUpload(!showUpload)}
              className="text-sm"
            >
              {showUpload ? '❌ Hủy upload' : `📤 Upload ${fileType} mới`}
            </Button>
          </div>
        </div>
      )}

      {showUpload ? (
        // Upload Section
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h5 className="font-medium text-gray-900 mb-3">Upload {fileType.charAt(0).toUpperCase() + fileType.slice(1)} Mới</h5>
          <div className="space-y-3">
            <div>
              <input
                type="file"
                accept={getAcceptAttribute(fileType)}
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fileType === 'video' && 'Chỉ chấp nhận file video (MP4, AVI, MOV, WMV, WebM). Tối đa 100MB.'}
                {fileType === 'image' && 'Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WebP). Tối đa 100MB.'}
                {fileType === 'document' && 'Chỉ chấp nhận file tài liệu (PDF, DOC, DOCX, TXT). Tối đa 100MB.'}
              </p>
            </div>
            {uploadFile && (
              <div className="text-sm text-gray-600">
                📁 {uploadFile.name} ({formatFileSize(uploadFile.size)})
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                className="text-sm"
              >
                {isUploading ? '⏳ Đang upload...' : '📤 Upload'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpload(false);
                  setUploadFile(null);
                }}
                className="text-sm"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Selected File Display - Only show in standard mode */}
      {!compact && selectedFileId && selectedFileName && (
        <div className="border border-blue-200 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">
                {getFileIcon(fileType)} {selectedFileName}
              </div>
              <div className="text-xs text-blue-600">
                ID: {selectedFileId}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onFileSelect('');
                setSelectedFileName('');
              }}
              className="text-xs px-2 py-1"
            >
              ❌ Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* File Selection Dialog */}
      <FileSelectionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSelect={(fileId, fileName) => {
          onFileSelect(fileId);
          setSelectedFileName(fileName);
        }}
        fileType={fileType}
        title={title}
        selectedFileId={selectedFileId}
      />
    </div>
  );
}
