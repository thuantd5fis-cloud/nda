'use client';

import React, { useState } from 'react';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { Post } from '@/types/api.types';

// Temporary icon replacement
const CheckIcon = (props: any) => <span {...props}>✓</span>;

interface EnhancedApprovalButtonProps {
  post: Post;
  onSuccess?: () => void;
  size?: 'default' | 'icon' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
  compact?: boolean;
}

export const EnhancedApprovalButton: React.FC<EnhancedApprovalButtonProps> = ({
  post,
  onSuccess,
  size = 'sm',
  variant = 'default',
  compact = false
}) => {
  const { toast } = useConfirm();
  const { canApprovePost, canSeeApprovalActions, debugInfo } = useEnhancedPermissions();
  const [isApproving, setIsApproving] = useState(false);

  // Debug logging
  console.log('🎯 [EnhancedApprovalButton] Post:', {
    id: post.id.slice(-4),
    status: post.status,
    title: post.title.slice(0, 30) + '...'
  });
  console.log('🎯 [EnhancedApprovalButton] User debug info:', debugInfo);
  console.log('🎯 [EnhancedApprovalButton] Can see approval actions:', canSeeApprovalActions());
  console.log('🎯 [EnhancedApprovalButton] Can approve this post:', canApprovePost(post));

  // First check: Can user see approval actions at all?
  if (!canSeeApprovalActions()) {
    console.log('🎯 [EnhancedApprovalButton] ❌ HIDDEN - User cannot see approval actions');
    console.log('🎯 [EnhancedApprovalButton] ❌ User level:', debugInfo.userLevel, 'Required: >= 5');
    console.log('🎯 [EnhancedApprovalButton] ❌ User roles:', debugInfo.roles);
    return null;
  }

  // Second check: Can user approve this specific post?
  if (!canApprovePost(post)) {
    console.log('🎯 [EnhancedApprovalButton] ❌ HIDDEN - Cannot approve this post');
    console.log('🎯 [EnhancedApprovalButton] ❌ Reason: Post status is', post.status, '(needs REVIEW)');
    return null;
  }

  console.log('🎯 [EnhancedApprovalButton] ✅ VISIBLE - All checks passed');

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await apiClient.approvePost(post.id);
      toast.success(result.message || `Đã phê duyệt bài viết "${post.title}"`);
      onSuccess?.();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể phê duyệt bài viết');
    } finally {
      setIsApproving(false);
    }
  };

  if (compact) {
    return (
      <Button
        size={size}
        variant={variant}
        onClick={handleApprove}
        disabled={isApproving}
        title="Phê duyệt bài viết"
        className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 px-2"
      >
        {isApproving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <CheckIcon className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleApprove}
      disabled={isApproving}
      className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
    >
      {isApproving ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Đang phê duyệt...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <CheckIcon className="w-4 h-4" />
          Phê duyệt
        </div>
      )}
    </Button>
  );
};
