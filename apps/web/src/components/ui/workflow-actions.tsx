'use client';

import { useState } from 'react';
import { Button } from '@cms/ui';
import { usePermissions } from '@/hooks/use-permissions';
import { useConfirm } from '@/hooks/use-confirm';
import { apiClient } from '@/lib/api';
import { Post } from '@/types/api.types';

// Temporary icon replacements
const CheckIcon = (props: any) => <span {...props}>✓</span>;
const XIcon = (props: any) => <span {...props}>✗</span>;
const ArchiveIcon = (props: any) => <span {...props}>📁</span>;
const EyeIcon = (props: any) => <span {...props}>👁️</span>;

interface WorkflowActionsProps {
  post: Post;
  currentUserId?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export const WorkflowActions = ({ 
  post, 
  currentUserId, 
  onSuccess,
  compact = false 
}: WorkflowActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { canPerformWorkflowAction } = usePermissions();
  const { confirm, toast } = useConfirm();

  const isOwner = currentUserId === post.authorId;

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
          // TODO: Add rejection reason dialog
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

      toast.success(result.message);
      onSuccess?.();
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error(`Có lỗi xảy ra khi ${actionName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    {
      action: 'submit-review',
      name: 'Gửi duyệt',
      icon: '📝',
      variant: 'outline' as const,
      color: 'blue',
    },
    {
      action: 'approve',
      name: 'Phê duyệt',
      icon: CheckIcon,
      variant: 'default' as const,
      color: 'green',
    },
    {
      action: 'reject',
      name: 'Từ chối',
      icon: XIcon,
      variant: 'outline' as const,
      color: 'red',
    },
    {
      action: 'publish',
      name: 'Xuất bản',
      icon: EyeIcon,
      variant: 'default' as const,
      color: 'blue',
    },
    {
      action: 'archive',
      name: 'Lưu trữ',
      icon: ArchiveIcon,
      variant: 'outline' as const,
      color: 'gray',
    },
  ];

  const availableActions = actions.filter(({ action }) =>
    canPerformWorkflowAction(action, post.status, isOwner)
  );

  if (availableActions.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {availableActions.map(({ action, name, icon: Icon, variant }) => (
          <Button
            key={action}
            variant={variant}
            size="sm"
            onClick={() => handleWorkflowAction(action, name)}
            disabled={isLoading}
            title={name}
            className="px-2"
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {availableActions.map(({ action, name, icon: Icon, variant }) => (
        <Button
          key={action}
          variant={variant}
          onClick={() => handleWorkflowAction(action, name)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {name}
        </Button>
      ))}
    </div>
  );
};
