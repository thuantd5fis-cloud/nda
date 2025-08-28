'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth';

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const RoleBasedStatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusChange
}) => {
  const { user } = useAuthStore();
  
  // Debug logs
  console.log('🔥🔥🔥 [RoleBasedStatusSelector] User:', user);
  console.log('🔥🔥🔥 [RoleBasedStatusSelector] User roles:', user?.roles);
  console.log('🔥🔥🔥 [RoleBasedStatusSelector] Is user authenticated?', !!user);
  console.log('🔥🔥🔥 [RoleBasedStatusSelector] User email:', user?.email);
  
  const getAvailableStatusOptions = () => {
    console.log('🔥🔥🔥 [getAvailableStatusOptions] Starting function...');
    
    if (!user) {
      console.log('🔥🔥🔥 NO USER - returning all statuses');
      return getAllStatuses();
    }

    if (!user.roles || user.roles.length === 0) {
      console.log('🔥🔥🔥 NO ROLES - returning all statuses');
      return getAllStatuses();
    }

    const roles = user.roles;
    console.log('🔥🔥🔥 User roles found:', roles);

    const isAuthor = roles.includes('author');
    const isEditor = roles.includes('editor');
    const isModerator = roles.includes('moderator');
    const isAdmin = roles.includes('admin');
    const isSuperAdmin = roles.includes('super_admin');

    console.log('🔥🔥🔥 Role checks:');
    console.log('🔥🔥🔥 - isAuthor:', isAuthor);
    console.log('🔥🔥🔥 - isEditor:', isEditor);
    console.log('🔥🔥🔥 - isModerator:', isModerator);
    console.log('🔥🔥🔥 - isAdmin:', isAdmin);
    console.log('🔥🔥🔥 - isSuperAdmin:', isSuperAdmin);

    // Author chỉ được tạo DRAFT
    if (isAuthor && !isEditor && !isModerator && !isAdmin && !isSuperAdmin) {
      console.log('🔥🔥🔥 AUTHOR DETECTED - returning DRAFT ONLY');
      return [
        { value: 'draft', label: 'Lưu nháp', description: 'Chưa công khai' }
      ];
    }

    // Editor được tạo DRAFT và REVIEW
    if (isEditor && !isModerator && !isAdmin && !isSuperAdmin) {
      console.log('🔥🔥🔥 EDITOR DETECTED - returning DRAFT and REVIEW');
      return [
        { value: 'draft', label: 'Lưu nháp', description: 'Chưa công khai' },
        { value: 'review', label: 'Chờ duyệt', description: 'Đang chờ phê duyệt' }
      ];
    }

    console.log('🔥🔥🔥 HIGHER ROLE DETECTED - returning all statuses');
    return getAllStatuses();
  };

  const getAllStatuses = () => [
    { value: 'draft', label: 'Lưu nháp', description: 'Chưa công khai' },
    { value: 'review', label: 'Chờ duyệt', description: 'Đang chờ phê duyệt' },
    { value: 'published', label: 'Đã xuất bản', description: 'Hiển thị công khai' },
    { value: 'rejected', label: 'Từ chối', description: 'Không được phê duyệt' },
    { value: 'archived', label: 'Lưu trữ', description: 'Ẩn khỏi công khai' }
  ];

  const statusOptions = getAvailableStatusOptions();
  console.log('🔥 Final status options:', statusOptions);

  const isAuthor = user?.roles?.includes('author');
  const isEditor = user?.roles?.includes('editor');
  const isLimitedRole = (isAuthor || isEditor) && 
    !user?.roles?.includes('moderator') && 
    !user?.roles?.includes('admin') && 
    !user?.roles?.includes('super_admin');

  return (
    <div>
      <div className="space-y-3">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="post-status"
              value={option.value}
              checked={currentStatus === option.value}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-500">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      {isLimitedRole && (
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
                  {isAuthor && !isEditor ? (
                    <>Với vai trò <strong>Author</strong>, bài viết sẽ được tạo ở trạng thái <strong>"Lưu nháp"</strong>. 
                    Sau khi hoàn thành, bạn có thể gửi duyệt để Moderator/Admin phê duyệt xuất bản.</>
                  ) : isEditor ? (
                    <>Với vai trò <strong>Editor</strong>, bạn có thể tạo bài ở trạng thái <strong>"Lưu nháp"</strong> hoặc 
                    <strong>"Chờ duyệt"</strong> để gửi cho Moderator/Admin phê duyệt xuất bản.</>
                  ) : (
                    <>Với vai trò của bạn, bài viết sẽ được tạo ở trạng thái <strong>"Lưu nháp"</strong>. 
                    Sau khi hoàn thành, bạn có thể gửi duyệt để Moderator/Admin phê duyệt xuất bản.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
