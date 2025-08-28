import { useAuthStore } from '@/lib/stores/auth';
import { Post } from '@/types/api.types';

// Enhanced Role Hierarchy (Level 1-10, càng cao càng có quyền)
const ROLE_HIERARCHY = {
  'contributor': 1,
  'junior_writer': 2,
  'writer': 3,
  'senior_writer': 4,
  'content_specialist': 4,
  'copy_editor': 5,
  'seo_specialist': 5,
  'fact_checker': 5,
  'technical_reviewer': 6,
  'content_editor': 6,
  'senior_editor': 7,
  'managing_editor': 8,
  'editor_in_chief': 9,
  'publisher': 10,
  
  // Legacy roles mapping to new hierarchy
  'author': 3,        // Map to writer level
  'editor': 5,        // Map to copy_editor level  
  'moderator': 7,     // Map to senior_editor level
  'admin': 8,         // Map to managing_editor level
  'super_admin': 10   // Map to publisher level
} as const;

// Roles that can approve posts (Level 5+)
const APPROVAL_ROLES = [
  'copy_editor',
  'seo_specialist', 
  'fact_checker',
  'technical_reviewer',
  'content_editor',
  'senior_editor',
  'managing_editor',
  'editor_in_chief',
  'publisher',
  
  // Legacy roles with approval rights
  'editor',      // Legacy editor role
  'moderator',   // Legacy moderator role  
  'admin',       // Legacy admin role
  'super_admin'  // Legacy super admin role
] as const;

// Roles that CANNOT see approval buttons (Author tier)
const NON_APPROVAL_ROLES = [
  'contributor',
  'junior_writer', 
  'writer',
  'senior_writer',
  'content_specialist',
  'author'  // Legacy author role
] as const;

export const useEnhancedPermissions = () => {
  const { user } = useAuthStore();

  console.log('🔐 [Enhanced Permissions] User:', user);
  console.log('🔐 [Enhanced Permissions] User roles:', user?.roles);

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const getUserRoleLevel = (): number => {
    if (!user?.roles || user.roles.length === 0) return 0;
    
    // Return highest level from all user roles
    return Math.max(
      ...user.roles.map(role => ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0)
    );
  };

  const getUserHighestRole = (): string | null => {
    if (!user?.roles || user.roles.length === 0) return null;
    
    let highestRole = null;
    let highestLevel = 0;
    
    for (const role of user.roles) {
      const level = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;
      if (level > highestLevel) {
        highestLevel = level;
        highestRole = role;
      }
    }
    
    return highestRole;
  };

  // Enhanced approval permissions
  const canApprovePost = (post: Post): boolean => {
    console.log('🔐 [canApprovePost] ===== DEBUGGING APPROVAL PERMISSION =====');
    console.log('🔐 [canApprovePost] Post status (raw):', post.status);
    console.log('🔐 [canApprovePost] Post status (type):', typeof post.status);
    console.log('🔐 [canApprovePost] User:', user);
    console.log('🔐 [canApprovePost] User roles:', user?.roles);
    
    // Case-insensitive status check for REVIEW posts
    const normalizedStatus = post.status?.toString().toUpperCase();
    console.log('🔐 [canApprovePost] Normalized status:', normalizedStatus);
    
    if (normalizedStatus !== 'REVIEW') {
      console.log('🔐 [canApprovePost] ❌ Post not in REVIEW status');
      console.log('🔐 [canApprovePost] ❌ Expected: REVIEW, Got:', normalizedStatus);
      return false;
    }
    
    console.log('🔐 [canApprovePost] ✅ Post is in REVIEW status');
    
    // Check if user has any approval role
    const hasApprovalRole = hasAnyRole([...APPROVAL_ROLES]);
    console.log('🔐 [canApprovePost] Has approval role:', hasApprovalRole);
    console.log('🔐 [canApprovePost] Approval roles list:', [...APPROVAL_ROLES]);
    
    // Get user level for debug
    const userLevel = getUserRoleLevel();
    console.log('🔐 [canApprovePost] User level:', userLevel);
    
    // Check individual role levels
    if (user?.roles) {
      for (const role of user.roles) {
        const level = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;
        console.log(`🔐 [canApprovePost] Role "${role}" has level:`, level);
      }
    }
    
    // Special check for super_admin
    if (hasRole('super_admin')) {
      console.log('🔐 [canApprovePost] 🚀 User is SUPER ADMIN - should have full access');
      return true;
    }
    
    // User must have approval role AND sufficient level
    const canApprove = hasApprovalRole && userLevel >= 5;
    
    console.log('🔐 [canApprovePost] Has approval role check:', hasApprovalRole);
    console.log('🔐 [canApprovePost] Level check (>=5):', userLevel >= 5);
    console.log('🔐 [canApprovePost] 🎯 FINAL RESULT:', canApprove);
    console.log('🔐 [canApprovePost] ========================================');
    
    return canApprove;
  };

  // Check if user can see approval buttons at all
  const canSeeApprovalActions = (): boolean => {
    console.log('🔐 [canSeeApprovalActions] ===== DEBUGGING VISIBILITY PERMISSION =====');
    console.log('🔐 [canSeeApprovalActions] User:', user);
    console.log('🔐 [canSeeApprovalActions] User roles:', user?.roles);
    
    // Special case for super_admin - always show
    if (hasRole('super_admin')) {
      console.log('🔐 [canSeeApprovalActions] 🚀 User is SUPER ADMIN - full visibility');
      return true;
    }
    
    // User must have approval-level role (Level 5+)
    const userLevel = getUserRoleLevel();
    const hasApprovalLevelRole = userLevel >= 5;
    const hasApprovalRole = hasAnyRole([...APPROVAL_ROLES]);
    
    // Explicitly exclude author-tier roles from seeing approval actions
    const isAuthorTierOnly = hasAnyRole([...NON_APPROVAL_ROLES]) && userLevel < 5;
    
    console.log('🔐 [canSeeApprovalActions] User level:', userLevel);
    console.log('🔐 [canSeeApprovalActions] Has approval level role (>=5):', hasApprovalLevelRole);
    console.log('🔐 [canSeeApprovalActions] Has any approval role:', hasApprovalRole);
    console.log('🔐 [canSeeApprovalActions] Is author-tier only:', isAuthorTierOnly);
    console.log('🔐 [canSeeApprovalActions] Approval roles:', [...APPROVAL_ROLES]);
    console.log('🔐 [canSeeApprovalActions] Non-approval roles:', [...NON_APPROVAL_ROLES]);
    
    const canSee = hasApprovalLevelRole && !isAuthorTierOnly;
    console.log('🔐 [canSeeApprovalActions] 🎯 FINAL RESULT:', canSee);
    console.log('🔐 [canSeeApprovalActions] ========================================');
    
    return canSee;
  };

  // Enhanced workflow action permissions
  const canPerformWorkflowAction = (action: string, postStatus: string, isOwner: boolean): boolean => {
    const userLevel = getUserRoleLevel();
    
    console.log('🔐 [canPerformWorkflowAction] ===== DEBUGGING WORKFLOW ACTION =====');
    console.log('🔐 [canPerformWorkflowAction] Action:', action);
    console.log('🔐 [canPerformWorkflowAction] Post status (raw):', postStatus);
    console.log('🔐 [canPerformWorkflowAction] Post status (type):', typeof postStatus);
    console.log('🔐 [canPerformWorkflowAction] Is owner:', isOwner);
    console.log('🔐 [canPerformWorkflowAction] User level:', userLevel);
    console.log('🔐 [canPerformWorkflowAction] User roles:', user?.roles);
    
    // Special case for super_admin - can do anything
    if (hasRole('super_admin')) {
      console.log('🔐 [canPerformWorkflowAction] 🚀 User is SUPER ADMIN - full access');
      
      // But still respect basic workflow rules
      const normalizedStatus = postStatus?.toString().toUpperCase();
      
      switch (action) {
        case 'approve':
        case 'reject':
          const result = normalizedStatus === 'REVIEW';
          console.log('🔐 [canPerformWorkflowAction] Super admin approve/reject for REVIEW posts:', result);
          return result;
        case 'archive':
          const canArchiveResult = normalizedStatus === 'PUBLISHED';
          console.log('🔐 [canPerformWorkflowAction] Super admin archive for PUBLISHED posts:', canArchiveResult);
          return canArchiveResult;
        default:
          return true; // Super admin can do other actions
      }
    }
    
    // Normalize status for comparison
    const normalizedStatus = postStatus?.toString().toUpperCase();
    console.log('🔐 [canPerformWorkflowAction] Normalized status:', normalizedStatus);
    
    switch (action) {
      case 'submit-review':
        // Can submit for review if post is DRAFT and user owns it OR has higher roles
        const canSubmit = normalizedStatus === 'DRAFT' && (isOwner || userLevel >= 5);
        console.log('🔐 [canPerformWorkflowAction] Can submit:', canSubmit);
        return canSubmit;
      
      case 'approve':
        // Can approve if post is REVIEW and user has approval permission (Level 5+)
        const canApprove = normalizedStatus === 'REVIEW' && userLevel >= 5;
        console.log('🔐 [canPerformWorkflowAction] Can approve:', canApprove);
        return canApprove;
      
      case 'reject':
        // Can reject if post is REVIEW and user has rejection permission (Level 5+)
        const canReject = normalizedStatus === 'REVIEW' && userLevel >= 5;
        console.log('🔐 [canPerformWorkflowAction] Can reject:', canReject);
        return canReject;
      
      case 'publish':
        // Can publish if post is DRAFT/REVIEW and user has publishing permission (Level 6+)
        const canPublish = (normalizedStatus === 'DRAFT' || normalizedStatus === 'REVIEW') && userLevel >= 6;
        console.log('🔐 [canPerformWorkflowAction] Can publish:', canPublish);
        return canPublish;
      
      case 'archive':
        // Can archive if post is PUBLISHED and user has archiving permission (Level 6+)
        const canArchive = normalizedStatus === 'PUBLISHED' && userLevel >= 6;
        console.log('🔐 [canPerformWorkflowAction] Can archive:', canArchive);
        return canArchive;
      
      default:
        console.log('🔐 [canPerformWorkflowAction] Unknown action');
        return false;
    }
  };

  // Legacy compatibility functions
  const canDirectApprove = (): boolean => {
    return canSeeApprovalActions();
  };

  const canCreatePost = (): boolean => {
    return getUserRoleLevel() >= 1; // All roles can create posts
  };

  const canEditPost = (post: Post): boolean => {
    // Own posts can be edited if in DRAFT or REJECTED status
    if (post.authorId === user?.id) {
      return ['DRAFT', 'REJECTED'].includes(post.status);
    }
    
    // Higher level users can edit any post
    return getUserRoleLevel() >= 6;
  };

  const getAvailableWorkflowActions = (post: Post) => {
    const actions: Array<{
      key: string;
      label: string;
      variant: 'default' | 'outline';
      icon: string;
      color: string;
    }> = [];
    const isOwner = post.authorId === user?.id;

    // Only show approval actions to users who can see them
    if (!canSeeApprovalActions()) {
      console.log('🔐 [getAvailableWorkflowActions] User cannot see approval actions');
      return actions;
    }

    // Chỉ hiển thị 2 action: Phê duyệt và Từ chối
    if (canPerformWorkflowAction('approve', post.status, isOwner)) {
      actions.push({
        key: 'approve',
        label: 'Phê duyệt',
        variant: 'default' as const,
        icon: '✅',
        color: 'green'
      });
    }

    if (canPerformWorkflowAction('reject', post.status, isOwner)) {
      actions.push({
        key: 'reject',
        label: 'Từ chối',
        variant: 'outline' as const,
        icon: '❌',
        color: 'red'
      });
    }

    console.log('🔐 [getAvailableWorkflowActions] Available actions (phê duyệt/từ chối only):', actions.map(a => a.key));
    return actions;
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    getUserRoleLevel,
    getUserHighestRole,
    canCreatePost,
    canEditPost,
    canApprovePost,
    canSeeApprovalActions,
    canPerformWorkflowAction,
    canDirectApprove, // Legacy compatibility
    getAvailableWorkflowActions,
    
    // Role tier checks
    isAuthorTier: () => getUserRoleLevel() <= 4,
    isEditorialTier: () => getUserRoleLevel() >= 5 && getUserRoleLevel() <= 6,
    isManagementTier: () => getUserRoleLevel() >= 7,
    
    // Debug info
    debugInfo: {
      userLevel: getUserRoleLevel(),
      highestRole: getUserHighestRole(),
      roles: user?.roles || []
    }
  };
};
