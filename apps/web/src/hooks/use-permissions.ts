import { useAuthStore } from '@/lib/stores/auth';

interface Post {
  id: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  createdBy: string;
  title: string;
}

export const usePermissions = () => {
  const { user } = useAuthStore();
  console.log('🚨 [usePermissions] DEBUG - User:', user);
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const canCreatePost = (): boolean => {
    return hasAnyRole(['author', 'editor', 'moderator', 'adm in', 'super_admin']);
  };

  const canEditPost = (post: Post): boolean => {
    // Own posts can be edited if in DRAFT or REJECTED status
    if (post.createdBy === user?.id) {
      return ['DRAFT', 'REJECTED'].includes(post.status);
    }
    
    // Moderator, Admin, Super Admin can edit any post
    return hasAnyRole(['moderator', 'admin', 'super_admin']);
  };

  const canSubmitForReview = (post: Post): boolean => {
    console.log('🔍 [canSubmitForReview] DEBUG:');
    console.log('🔍 post.status:', post.status);
    console.log('🔍 user?.id:', user?.id);
    console.log('🔍 post.createdBy:', post.createdBy);
    console.log('🔍 user?.roles:', user?.roles);
    console.log('🔍 FULL USER OBJECT:', user);
    
    // Only DRAFT posts can be submitted
    if (post.status !== 'DRAFT') {
      console.log('🔍 ❌ Post status is not DRAFT');
      return false;
    }
    
    // Own posts can submit OR Moderator+ can submit any post
    const isOwner = post.createdBy === user?.id;
    const hasHigherRole = hasAnyRole(['moderator', 'admin', 'super_admin']);
    const hasAuthorOrEditor = hasAnyRole(['author', 'editor']);
    
    console.log('🔍 isOwner:', isOwner);
    console.log('🔍 hasHigherRole:', hasHigherRole);
    console.log('🔍 hasAuthorOrEditor:', hasAuthorOrEditor);
    
    const result = (isOwner && hasAuthorOrEditor) || hasHigherRole;
    console.log('🔍 Final result:', result);
    
    return result;
  };

  const canApprovePost = (post: Post): boolean => {
    // Only REVIEW posts can be approved
    if (post.status !== 'REVIEW') return false;
    
    // Only Moderator, Admin, Super Admin can approve
    return hasAnyRole(['moderator', 'admin', 'super_admin']);
  };

  const canDirectApprove = (): boolean => {
    // Roles that can approve posts directly
    return hasAnyRole(['moderator', 'admin', 'super_admin']);
  };

  const canPerformWorkflowAction = (action: string, postStatus: string, isOwner: boolean): boolean => {
    switch (action) {
      case 'submit-review':
        // Can submit for review if post is DRAFT and user owns it OR has higher roles
        return (postStatus === 'DRAFT' || postStatus === 'draft') && 
               (isOwner || hasAnyRole(['moderator', 'admin', 'super_admin']));
      
      case 'approve':
        // Can approve if post is REVIEW and user has approval permission
        return (postStatus === 'REVIEW' || postStatus === 'review') && 
               hasAnyRole(['moderator', 'admin', 'super_admin']);
      
      case 'reject':
        // Can reject if post is REVIEW and user has rejection permission
        return (postStatus === 'REVIEW' || postStatus === 'review') && 
               hasAnyRole(['moderator', 'admin', 'super_admin']);
      
      case 'publish':
        // Can publish if post is DRAFT/REVIEW and user has publishing permission
        return (postStatus === 'DRAFT' || postStatus === 'draft' || 
                postStatus === 'REVIEW' || postStatus === 'review') && 
               hasAnyRole(['moderator', 'admin', 'super_admin']);
      
      case 'archive':
        // Can archive if post is PUBLISHED and user has archiving permission
        return (postStatus === 'PUBLISHED' || postStatus === 'published') && 
               hasAnyRole(['moderator', 'admin', 'super_admin']);
      
      default:
        return false;
    }
  };

  const canRejectPost = (post: Post): boolean => {
    // Only REVIEW posts can be rejected
    if (post.status !== 'REVIEW') return false;
    
    // Only Moderator, Admin, Super Admin can reject
    return hasAnyRole(['moderator', 'admin', 'super_admin']);
  };

  const canArchivePost = (post: Post): boolean => {
    // Only Moderator, Admin, Super Admin can archive
    return hasAnyRole(['moderator', 'admin', 'super_admin']);
  };

  const canPublishDirectly = (): boolean => {
    // Only Moderator, Admin, Super Admin can publish directly
    return hasAnyRole(['moderator', 'admin', 'super_admin']);
  };

  const getAvailableStatuses = (): Array<{value: string, label: string}> => {
    const userRoles = user?.roles || [];
    
    console.log('🚨 [getAvailableStatuses] DEBUG - User:', user);
    console.log('🚨 [getAvailableStatuses] DEBUG - User roles:', userRoles);
    
    // Author chỉ được tạo bài ở trạng thái DRAFT
    const isAuthor = userRoles.includes('author');
    const isEditor = userRoles.includes('editor');
    const isHigherRole = userRoles.includes('moderator') || userRoles.includes('admin') || userRoles.includes('super_admin');
    
    console.log('🚨 [getAvailableStatuses] DEBUG - isAuthor:', isAuthor);
    console.log('🚨 [getAvailableStatuses] DEBUG - isEditor:', isEditor);
    console.log('🚨 [getAvailableStatuses] DEBUG - isHigherRole:', isHigherRole);
    
    if (isAuthor && !isEditor && !isHigherRole) {
      console.log('🚨 [getAvailableStatuses] DEBUG - Returning DRAFT only for author');
      return [{ value: 'DRAFT', label: 'Lưu nháp' }];
    }

    if (isEditor && !isHigherRole) {
      console.log('🚨 [getAvailableStatuses] DEBUG - Returning DRAFT and REVIEW for editor');
      return [
        { value: 'DRAFT', label: 'Lưu nháp' },
        { value: 'REVIEW', label: 'Chờ duyệt' }
      ];
    }

    console.log('🚨 [getAvailableStatuses] DEBUG - Returning all statuses for higher roles');
    // Moderator, Admin, Super Admin có thể tạo bài ở tất cả trạng thái
    return [
      { value: 'DRAFT', label: 'Lưu nháp' },
      { value: 'REVIEW', label: 'Chờ duyệt' },
      { value: 'PUBLISHED', label: 'Đã xuất bản' },
      { value: 'REJECTED', label: 'Từ chối' },
      { value: 'ARCHIVED', label: 'Lưu trữ' }
    ];
  };

  const getWorkflowActions = (post: Post) => {
    const actions = [];

    if (canSubmitForReview(post)) {
      actions.push({
        key: 'submit-review',
        label: 'Gửi duyệt',
        variant: 'primary' as const,
        icon: '📝'
      });
    }

    if (canApprovePost(post)) {
      actions.push({
        key: 'approve',
        label: 'Phê duyệt',
        variant: 'success' as const,
        icon: '✅'
      });
    }

    if (canRejectPost(post)) {
      actions.push({
        key: 'reject',
        label: 'Từ chối',
        variant: 'danger' as const,
        icon: '❌'
      });
    }

    if (canArchivePost(post)) {
      actions.push({
        key: 'archive',
        label: 'Lưu trữ',
        variant: 'secondary' as const,
        icon: '📦'
      });
    }

    return actions;
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    canCreatePost,
    canEditPost,
    canSubmitForReview,
    canApprovePost,
    canRejectPost,
    canArchivePost,
    canPublishDirectly,
    canDirectApprove,
    canPerformWorkflowAction,
    getAvailableStatuses,
    getWorkflowActions,
  };
};