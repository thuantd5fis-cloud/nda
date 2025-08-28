# 🔧 Debug Super Admin Approval Issue

## 🚨 Issue
Super admin không thấy button duyệt khi post ở trạng thái "chờ duyệt".

## 🔍 Debug Steps

### Step 1: Check Post Status in Database
```sql
-- Check actual post status values
SELECT id, title, status, created_by, created_at 
FROM posts 
WHERE status LIKE '%REVIEW%' OR status LIKE '%review%'
ORDER BY created_at DESC;

-- Look for status variations
SELECT DISTINCT status FROM posts;
```

### Step 2: Check User Role Assignment
```sql
-- Verify super admin role
SELECT u.email, r.name as role_name, r.level
FROM users u
JOIN user_roles ur ON u.id = ur.user_id  
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@example.com'  -- Replace with your email
ORDER BY r.level DESC;
```

### Step 3: Check Console Logs
Open browser DevTools console and look for these logs:
```
🔐 [canSeeApprovalActions] ===== DEBUGGING VISIBILITY PERMISSION =====
🔐 [canApprovePost] ===== DEBUGGING APPROVAL PERMISSION =====
🔐 [canPerformWorkflowAction] ===== DEBUGGING WORKFLOW ACTION =====
```

### Step 4: Manual Post Status Update (If Needed)
```sql
-- Force update a post to REVIEW status for testing
UPDATE posts 
SET status = 'REVIEW', updated_at = NOW()
WHERE id = 'YOUR_POST_ID'
LIMIT 1;
```

## 🧪 Test Scenarios

### Scenario A: Check If Posts Are Actually in REVIEW Status
1. Go to `/dashboard/posts`
2. Look for posts with yellow "Chờ duyệt" badge
3. If no posts show "Chờ duyệt", create one:
   - Create new post as author
   - Submit for review
   - Status should change to REVIEW

### Scenario B: Verify Super Admin Login
1. Login with super admin credentials
2. Check console for user roles
3. Should see: `User roles: ["super_admin"]`

### Scenario C: Force Debug Mode
Add this to your page component temporarily:
```tsx
// Add to your page component for debug
useEffect(() => {
  console.log('🔧 DEBUG MODE - User:', user);
  console.log('🔧 DEBUG MODE - Auth store:', useAuthStore.getState());
}, [user]);
```

## 🔧 Quick Fixes

### Fix 1: Ensure Post Has REVIEW Status
```bash
# Via database
UPDATE posts SET status = 'REVIEW' WHERE title = 'YOUR_POST_TITLE';
```

### Fix 2: Verify Role Hierarchy
```typescript
// Check if ROLE_HIERARCHY has super_admin
const ROLE_HIERARCHY = {
  'super_admin': 10  // Should be level 10
};
```

### Fix 3: Check Legacy vs Enhanced System
In development mode, you should see both:
- Legacy approval button (grayed out)
- Enhanced workflow actions

If only seeing legacy, enhanced system might not be loaded.

## 📋 Expected Debug Output for Super Admin

### When Working Correctly:
```
🔐 [canSeeApprovalActions] User: {roles: ["super_admin"]}
🔐 [canSeeApprovalActions] 🚀 User is SUPER ADMIN - full visibility
🔐 [canSeeApprovalActions] 🎯 FINAL RESULT: true

🔐 [canApprovePost] Post status (raw): REVIEW
🔐 [canApprovePost] 🚀 User is SUPER ADMIN - should have full access  
🔐 [canApprovePost] 🎯 FINAL RESULT: true
```

### When Broken:
```
🔐 [canApprovePost] ❌ Post not in REVIEW status
🔐 [canApprovePost] ❌ Expected: REVIEW, Got: DRAFT
```

## 🚀 Quick Test Commands

### Reset Test Data:
```sql
-- Create a test post in REVIEW status
INSERT INTO posts (id, title, content, slug, status, created_by, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Test REVIEW Post', 'Test content', 'test-review-post', 'REVIEW', 
   (SELECT id FROM users WHERE email = 'admin@example.com'), NOW(), NOW());
```

### Check Enhanced Permissions:
```javascript
// Run in browser console
localStorage.getItem('auth-store') // Check stored auth
```

## 🎯 Common Issues & Solutions

### Issue 1: Post Status is "review" (lowercase)
**Solution**: Status normalization should handle this - check console logs

### Issue 2: User doesn't have super_admin role  
**Solution**: Check database role assignment

### Issue 3: Enhanced system not loading
**Solution**: Check component imports and user refresh

### Issue 4: Cached auth state
**Solution**: Clear localStorage and re-login

---

## 🔧 Immediate Action Plan

1. **Check Console**: Open DevTools, go to posts page, check debug logs
2. **Verify Data**: Run SQL queries to check post status and user roles
3. **Test Specific Post**: Find/create a post with REVIEW status
4. **Force Debug**: Add console.log to see what's happening

**If still not working after these steps, the debug logs will show exactly where the issue is!**

