'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '@/lib/api';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  placeholder = 'Click để chọn ảnh hoặc kéo thả vào đây',
  className = '',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('🔄 Starting upload:', file.name, file.size);
      const uploadedAsset = await apiClient.uploadFile(file);
      console.log('✅ Upload success:', uploadedAsset);
      console.log('🖼️ Setting URL:', uploadedAsset.url);
      onChange(uploadedAsset.url);
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize,
    multiple: false,
  });

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <>
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Đang upload...</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-600">{placeholder}</p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF tối đa {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          ❌ {uploadError}
        </div>
      )}

      {value && (
        <div className="space-y-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
            onLoad={() => {
              console.log('🖼️ Image loaded successfully:', value);
            }}
            onError={(e) => {
              console.error('❌ Image load error:', value);
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">✅ Đã upload thành công</span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              🗑️ Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
