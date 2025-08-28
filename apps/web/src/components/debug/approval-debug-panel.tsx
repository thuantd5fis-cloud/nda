'use client';

import { useState } from 'react';
import { Button } from '@cms/ui';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { useAuthStore } from '@/lib/stores/auth';
import { Post } from '@/types/api.types';

interface ApprovalDebugPanelProps {
  post?: Post;
  show?: boolean;
}

export const ApprovalDebugPanel = ({ post, show = false }: ApprovalDebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(show);
  const { user } = useAuthStore();
  const {
    canApprovePost,
    canSeeApprovalActions,
    getUserRoleLevel,
    getUserHighestRole,
    hasRole,
    debugInfo
  } = useEnhancedPermissions();

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 bg-red-500 text-white border-red-500 hover:bg-red-600 z-50"
      >
        🔧 Debug Approval
      </Button>
    );
  }

  const testPost: Post = post || {
    id: 'test-id',
    title: 'Test Post',
    slug: 'test-post',
    content: 'Test content',
    status: 'REVIEW',
    featured: false,
    viewCount: 0,
    likeCount: 0,
    shareCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'test-user',
    author: {
      id: 'test-user',
      email: 'test@example.com',
      fullName: 'Test User',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-red-500 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-red-600">🔧 Approval Debug Panel</h3>
        <Button
          onClick={() => setIsOpen(false)}
          variant="outline"
          size="sm"
          className="text-red-500 border-red-500"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        {/* User Info */}
        <div className="bg-blue-50 p-2 rounded">
          <h4 className="font-semibold text-blue-800">👤 User Information</h4>
          <div className="text-blue-700">
            <div><strong>Email:</strong> {user?.email || 'Not logged in'}</div>
            <div><strong>Roles:</strong> {user?.roles?.join(', ') || 'None'}</div>
            <div><strong>User Level:</strong> {getUserRoleLevel()}</div>
            <div><strong>Highest Role:</strong> {getUserHighestRole() || 'None'}</div>
            <div><strong>Is Super Admin:</strong> {hasRole('super_admin') ? '✅ Yes' : '❌ No'}</div>
          </div>
        </div>

        {/* Post Info */}
        <div className="bg-yellow-50 p-2 rounded">
          <h4 className="font-semibold text-yellow-800">📄 Post Information</h4>
          <div className="text-yellow-700">
            <div><strong>ID:</strong> {testPost.id}</div>
            <div><strong>Status:</strong> {testPost.status}</div>
            <div><strong>Status Type:</strong> {typeof testPost.status}</div>
            <div><strong>Status Uppercase:</strong> {testPost.status?.toString().toUpperCase()}</div>
            <div><strong>Title:</strong> {testPost.title}</div>
          </div>
        </div>

        {/* Permission Checks */}
        <div className="bg-green-50 p-2 rounded">
          <h4 className="font-semibold text-green-800">✅ Permission Results</h4>
          <div className="text-green-700">
            <div><strong>Can See Approval Actions:</strong> {canSeeApprovalActions() ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Can Approve This Post:</strong> {canApprovePost(testPost) ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Required Level for Approval:</strong> ≥ 5</div>
            <div><strong>Super Admin Override:</strong> {hasRole('super_admin') ? '✅ Active' : '❌ Not Active'}</div>
          </div>
        </div>

        {/* Test Different Statuses */}
        <div className="bg-purple-50 p-2 rounded">
          <h4 className="font-semibold text-purple-800">🧪 Test Different Statuses</h4>
          <div className="space-y-1">
            {(['DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED'] as const).map(status => {
              const testPostWithStatus = { ...testPost, status };
              const canApprove = canApprovePost(testPostWithStatus);
              return (
                <div key={status} className="text-purple-700 text-xs">
                  <strong>{status}:</strong> {canApprove ? '✅ Can Approve' : '❌ Cannot Approve'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Fix */}
        <div className="bg-red-50 p-2 rounded">
          <h4 className="font-semibold text-red-800">🚨 Common Issues & Fixes</h4>
          <div className="text-red-700 text-xs space-y-1">
            <div>• If status shows "review" (lowercase) → should still work</div>
            <div>• If no super_admin role → check database user_roles table</div>
            <div>• If user level is 0 → role mapping issue</div>
            <div>• Button should show for REVIEW posts only</div>
          </div>
        </div>

        {/* Debug Actions */}
        <div className="bg-gray-50 p-2 rounded">
          <h4 className="font-semibold text-gray-800">🔧 Debug Actions</h4>
          <div className="space-y-1">
            <Button
              size="sm"
              onClick={() => {
                console.log('🔧 Manual Debug - User:', user);
                console.log('🔧 Manual Debug - Debug Info:', debugInfo);
                console.log('🔧 Manual Debug - Can See Approval:', canSeeApprovalActions());
                console.log('🔧 Manual Debug - Can Approve Test Post:', canApprovePost(testPost));
              }}
              className="w-full text-xs"
            >
              📋 Log Debug Info to Console
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Force refresh auth store
                window.location.reload();
              }}
              className="w-full text-xs"
            >
              🔄 Refresh Page (Clear Cache)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

