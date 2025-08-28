'use client';

import React, { useState } from 'react';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import { usePermissions } from '@/hooks/use-permissions';

interface Post {
  id: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  title: string;
  createdBy: string;
}

interface ApprovalButtonProps {
  post: Post;
  onSuccess?: () => void;
  size?: 'default' | 'icon' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
}

export const ApprovalButton: React.FC<ApprovalButtonProps> = ({
  post,
  onSuccess,
  size = 'sm',
  variant = 'default'
}) => {
  const { toast } = useConfirm();
  const { canDirectApprove } = usePermissions();
  const [isApproving, setIsApproving] = useState(false);

  // Debug logging
  console.log('🔍 [ApprovalButton] Post ID:', post.id);
  console.log('🔍 [ApprovalButton] Post Status:', post.status);
  console.log('🔍 [ApprovalButton] Post Title:', post.title);
  console.log('🔍 [ApprovalButton] Can Direct Approve:', canDirectApprove());
  console.log('🔍 [ApprovalButton] Status Check (=== REVIEW):', post.status === 'REVIEW');
  console.log('🔍 [ApprovalButton] Status Check (uppercase):', post.status?.toString().toUpperCase() === 'REVIEW');

  // Only show for users who can approve and posts that can be approved
  // Handle both uppercase and lowercase status values
  const normalizedStatus = post.status?.toString().toUpperCase();
  const canShow = canDirectApprove() && normalizedStatus === 'REVIEW';
  
  console.log('🔍 [ApprovalButton] Normalized Status:', normalizedStatus);
  console.log('🔍 [ApprovalButton] Can Show Button:', canShow);

  if (!canShow) {
    console.log('🔍 [ApprovalButton] Button HIDDEN - Reason:', 
      !canDirectApprove() ? 'No approve permission' : 'Status is not REVIEW');
    return null;
  }

  console.log('🔍 [ApprovalButton] Button VISIBLE ✅');

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await apiClient.approvePost(post.id);
      toast.success(`Đã phê duyệt bài viết "${post.title}"`);
      onSuccess?.();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể phê duyệt bài viết');
    } finally {
      setIsApproving(false);
    }
  };

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
        <div className="flex items-center gap-1">
          ✅ Phê duyệt
        </div>
      )}
    </Button>
  );
};
