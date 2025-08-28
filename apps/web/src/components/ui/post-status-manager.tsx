'use client';

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface Post {
  id: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  createdBy: string;
  title: string;
}

interface PostStatusManagerProps {
  post?: Post;
  currentStatus: string;
  onStatusChange?: (status: string) => void;
  mode: 'create' | 'edit';
}

export const PostStatusManager: React.FC<PostStatusManagerProps> = ({
  post,
  currentStatus,
  onStatusChange,
  mode = 'create'
}) => {
  const { getAvailableStatuses, canPublishDirectly, canEditPost, user } = usePermissions();
  
  // Debug logging  
  console.log('🎯 [PostStatusManager] User:', user);
  console.log('🎯 [PostStatusManager] Mode:', mode);
  console.log('🎯 [PostStatusManager] Available statuses:', getAvailableStatuses());
  console.log('🎯 [PostStatusManager] Can publish directly:', canPublishDirectly());

  const getStatusDisplayInfo = (status: string) => {
    const statusMap = {
      'draft': { label: '📝 Lưu nháp', description: 'Chưa công khai', color: 'bg-gray-100 text-gray-800' },
      'review': { label: '⏳ Chờ duyệt', description: 'Đang chờ phê duyệt', color: 'bg-yellow-100 text-yellow-800' },
      'published': { label: '✅ Đã xuất bản', description: 'Hiển thị công khai', color: 'bg-green-100 text-green-800' },
      'rejected': { label: '❌ Từ chối', description: 'Không được phê duyệt', color: 'bg-red-100 text-red-800' },
      'archived': { label: '📦 Lưu trữ', description: 'Ẩn khỏi công khai', color: 'bg-blue-100 text-blue-800' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const availableStatuses = getAvailableStatuses();
  console.log('🎯 [PostStatusManager] Final available statuses:', availableStatuses);

  // For edit mode, check if user can edit this post
  if (mode === 'edit' && post && !canEditPost(post)) {
    const statusInfo = getStatusDisplayInfo(currentStatus);
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái hiện tại
        </label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <div className="text-sm text-gray-500 mt-1">{statusInfo.description}</div>
        </div>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            💡 <strong>Lưu ý:</strong> Bạn không có quyền chỉnh sửa bài viết này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {mode === 'create' ? 'Trạng thái bài viết' : 'Trạng thái hiện tại'}
      </label>

      {mode === 'edit' && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusDisplayInfo(currentStatus).color}`}>
                {getStatusDisplayInfo(currentStatus).label}
              </span>
            </div>
            {post && (
              <div className="text-xs text-gray-500">
                ID: {post.id}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Selection */}
      {(mode === 'create' || (mode === 'edit' && canPublishDirectly())) && (
        <div className="space-y-3">
          {availableStatuses.map((status) => (
            <label key={status.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={status.value.toLowerCase()}
                checked={currentStatus === status.value.toLowerCase()}
                onChange={(e) => onStatusChange?.(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <div className="flex-1">
                <div className="font-medium">{status.label}</div>
                <div className="text-sm text-gray-500">
                  {getStatusDisplayInfo(status.value.toLowerCase()).description}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Info for Author/Editor */}
      {!canPublishDirectly() && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                📝 Quy trình phê duyệt
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {user?.roles?.includes('author') && !user?.roles?.includes('editor') ? (
                    <>Với vai trò <strong>Author</strong>, bài viết sẽ được tạo ở trạng thái <strong>"Lưu nháp"</strong>. 
                    Sau khi hoàn thành, bạn có thể gửi duyệt để Moderator/Admin phê duyệt xuất bản.</>
                  ) : user?.roles?.includes('editor') ? (
                    <>Với vai trò <strong>Editor</strong>, bạn có thể tạo bài ở trạng thái <strong>"Lưu nháp"</strong> hoặc 
                    <strong>"Chờ duyệt"</strong> để gửi cho Moderator/Admin phê duyệt xuất bản.</>
                  ) : (
                    <>Với vai trò của bạn, bài viết sẽ được tạo ở trạng thái <strong>"Lưu nháp"</strong>. 
                    Sau khi hoàn thành, bạn có thể gửi duyệt để Moderator/Admin phê duyệt xuất bản.</>
                  )}
                </p>
                {mode === 'edit' && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p><strong>Workflow:</strong></p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Chỉnh sửa nội dung ở trạng thái DRAFT hoặc REJECTED</li>
                      <li>Sử dụng nút "📝 Gửi duyệt" để chuyển sang REVIEW</li>
                      <li>Moderator/Admin sẽ phê duyệt hoặc từ chối</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
