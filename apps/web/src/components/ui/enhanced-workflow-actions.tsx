'use client';

import { useState } from 'react';
import { Button } from '@cms/ui';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { useConfirm } from '@/hooks/use-confirm';
import { apiClient } from '@/lib/api';
import { CheckIcon, XIcon, ArchiveIcon, EyeIcon, DocumentIcon } from '@/components/icons';

interface Post {
  id: string;
  status: string;
  createdBy: string;
  title: string;
}

interface EnhancedWorkflowActionsProps {
  post: Post;
  currentUserId?: string;
  onSuccess?: () => void;
  compact?: boolean;
  showDebugInfo?: boolean;
}

export const EnhancedWorkflowActions = ({ 
  post, 
  currentUserId, 
  onSuccess,
  compact = false,
  showDebugInfo = false
}: EnhancedWorkflowActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    getAvailableWorkflowActions, 
    canSeeApprovalActions,
    debugInfo
  } = useEnhancedPermissions();
  const { confirm, toast } = useConfirm();

  const isOwner = currentUserId === post.createdBy;

  console.log('🚀 [EnhancedWorkflowActions] Post:', {
    id: post.id.slice(-4),
    status: post.status,
    title: post.title.slice(0, 30) + '...',
    isOwner
  });
  console.log('🚀 [EnhancedWorkflowActions] User debug info:', debugInfo);
  console.log('🚀 [EnhancedWorkflowActions] Can see approval actions:', canSeeApprovalActions());

  // Get available actions based on enhanced permissions
  const availableActions = getAvailableWorkflowActions(post as any);
  
  console.log('🚀 [EnhancedWorkflowActions] Available actions:', availableActions.map(a => a.key));

  // If user cannot see approval actions and no other actions available, hide component
  if (!canSeeApprovalActions() && availableActions.length === 0) {
    console.log('🚀 [EnhancedWorkflowActions] ❌ HIDDEN - No available actions for user');
    return null;
  }

  const handleWorkflowAction = async (action: string, actionName: string) => {
    const confirmed = await confirm(
      `Bạn có chắc chắn muốn ${actionName.toLowerCase()} bài viết "${post.title}"?`,
      {
        title: `Xác nhận ${actionName}`,
        confirmText: actionName,
      }
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      let result;
      switch (action) {
        case 'submit-review':
          result = await apiClient.submitPostForReview(post.id);
          break;
        case 'approve':
          result = await apiClient.approvePost(post.id);
          break;
        case 'reject':
          // TODO: Add rejection reason dialog in future
          result = await apiClient.rejectPost(post.id);
          break;
        case 'publish':
          result = await apiClient.publishPost(post.id);
          break;
        case 'archive':
          result = await apiClient.archivePost(post.id);
          break;
        default:
          throw new Error('Unknown action');
      }

      toast.success(result.message || `Đã ${actionName.toLowerCase()} bài viết thành công`);
      onSuccess?.();
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error(`Có lỗi xảy ra khi ${actionName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Icon mapping for actions
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submit-review':
        return DocumentIcon;
      case 'approve':
        return CheckIcon;
      case 'reject':
        return XIcon;
      case 'publish':
        return EyeIcon;
      case 'archive':
        return ArchiveIcon;
      default:
        return DocumentIcon;
    }
  };

  // Style mapping for actions
  const getActionStyles = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      case 'reject':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      case 'publish':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'archive':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
      case 'submit-review':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
    }
  };

  if (availableActions.length === 0) {
    return null;
  }

  console.log('🚀 [EnhancedWorkflowActions] ✅ VISIBLE - Rendering', availableActions.length, 'actions');

  return (
    <div className="flex flex-col gap-2">
      {/* Debug Info */}
      {/* {showDebugInfo && (
        <div className="text-xs bg-gray-100 p-2 rounded border">
          <div><strong>Debug Info:</strong></div>
          <div>User Level: {debugInfo.userLevel}</div>
          <div>Highest Role: {debugInfo.highestRole}</div>
          <div>All Roles: {debugInfo.roles.join(', ')}</div>
          <div>Can See Approval: {canSeeApprovalActions() ? 'Yes' : 'No'}</div>
          <div>Available Actions: {availableActions.map(a => a.key).join(', ')}</div>
        </div>
      )} */}

      {/* Actions */}
      <div className={compact ? "flex items-center gap-1" : "flex items-center gap-2"}>
        {availableActions.map((action) => {
          const Icon = getActionIcon(action.key);
          const styles = getActionStyles(action.key);
          
          if (compact) {
            return (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                onClick={() => handleWorkflowAction(action.key, action.label)}
                disabled={isLoading}
                title={action.label}
                className={`px-2 ${styles}`}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          }

          return (
            <Button
              key={action.key}
              variant={action.variant}
              size="sm"
              onClick={() => handleWorkflowAction(action.key, action.label)}
              disabled={isLoading}
              className={`flex items-center gap-2 ${styles}`}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
