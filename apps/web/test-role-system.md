# 🧪 Test Script for Enhanced Role System

## 📋 Test Scenarios

### **Test 1: Author Role (Should NOT see approval buttons)**
```bash
# Login with author credentials
Email: author@example.com  
Password: Author@123

Expected Results:
❌ NO approval buttons in posts list
❌ NO approval buttons in edit page  
✅ Can create posts
✅ Can edit own DRAFT posts
✅ Can submit for review
```

### **Test 2: Editor Role (Should see approval buttons)**
```bash
# Login with editor credentials  
Email: editor@example.com
Password: Editor@123

Expected Results:
✅ Approval buttons visible in posts list
✅ Approval buttons visible in edit page
✅ Can approve REVIEW posts
✅ Can reject REVIEW posts
✅ Debug panel shows Level 5
```

### **Test 3: Moderator Role (Should see all workflow actions)**
```bash
# Login with moderator credentials
Email: moderator@example.com  
Password: Moderator@123

Expected Results:
✅ All workflow buttons visible
✅ Can approve, reject, publish, archive
✅ Debug panel shows Level 7
✅ Can see enhanced workflow actions
```

### **Test 4: Admin Role (Should have full access)**
```bash
# Login with admin credentials
Email: admin@example.com
Password: Admin@123

Expected Results:  
✅ Full workflow access
✅ All buttons and actions visible
✅ Debug panel shows Level 8
✅ Can perform all post actions
```

## 🔍 Debug Checklist

### **Console Debug Logs to Check:**
1. `🔐 [Enhanced Permissions] User level: X`
2. `🎯 [EnhancedApprovalButton] ✅ VISIBLE` or `❌ HIDDEN`
3. `🚀 [EnhancedWorkflowActions] Available actions: [...]`
4. `📋 [PostsTable] Enhanced permissions debug: {...}`

### **UI Elements to Verify:**
1. **Posts List Page (`/dashboard/posts`)**
   - Author: NO approval buttons in action column
   - Editor+: Approval buttons visible in action column
   
2. **Post Edit Page (`/dashboard/posts/[id]/edit`)**
   - Author: NO enhanced workflow actions section
   - Editor+: Enhanced workflow actions section visible
   - Development: Debug panel showing permissions

3. **Debug Panels (Development Mode)**
   - Yellow debug panel in edit page
   - Permission level information
   - Role hierarchy display

## 📝 Test Steps

### **Step 1: Setup Test Data**
```sql
-- Ensure test posts exist in different statuses
INSERT INTO posts (status) VALUES 
  ('DRAFT'),
  ('REVIEW'), 
  ('PUBLISHED');
```

### **Step 2: Test Role Visibility**
1. Login as `author@example.com`
2. Go to `/dashboard/posts`
3. Verify NO approval buttons in table
4. Open any post for editing
5. Verify NO enhanced workflow actions
6. Check console for `❌ HIDDEN` logs

### **Step 3: Test Editorial Access**
1. Login as `editor@example.com`
2. Go to `/dashboard/posts`
3. Verify approval buttons appear for REVIEW posts
4. Open a REVIEW post for editing
5. Verify enhanced workflow actions visible
6. Check console for `✅ VISIBLE` logs

### **Step 4: Test Actions Functionality**
1. Login as `editor@example.com`
2. Find a post with status REVIEW
3. Click approval button
4. Verify post status changes to PUBLISHED
5. Check success notification

### **Step 5: Test Role Levels**
1. Check debug panel shows correct user level:
   - Author: Level 3
   - Editor: Level 5  
   - Moderator: Level 7
   - Admin: Level 8
   - Super Admin: Level 10

## 🐛 Troubleshooting Common Issues

### **Issue: Author still sees approval buttons**
```bash
# Check user roles in database
SELECT u.email, r.name, r.level 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'author@example.com';

# Expected: Only 'author' role (Level 3)
```

### **Issue: Editor cannot see approval buttons**
```bash
# Check role assignment
SELECT u.email, r.name, r.level 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id  
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'editor@example.com';

# Expected: 'editor' role (Level 5) or higher
```

### **Issue: Buttons showing for wrong statuses**
```bash
# Check post status
SELECT id, title, status FROM posts WHERE id = 'POST_ID';

# Approval buttons only show for REVIEW status
```

## 📊 Expected Debug Output

### **Author Login:**
```
🔐 [Enhanced Permissions] User level: 3
🎯 [EnhancedApprovalButton] ❌ HIDDEN - User cannot see approval actions
🚀 [EnhancedWorkflowActions] ❌ HIDDEN - No available actions for user
```

### **Editor Login:**
```
🔐 [Enhanced Permissions] User level: 5  
🎯 [EnhancedApprovalButton] ✅ VISIBLE - All checks passed
🚀 [EnhancedWorkflowActions] Available actions: approve, reject
```

### **Moderator Login:**
```
🔐 [Enhanced Permissions] User level: 7
🎯 [EnhancedApprovalButton] ✅ VISIBLE - All checks passed  
🚀 [EnhancedWorkflowActions] Available actions: approve, reject, publish, archive
```

## ✅ Success Criteria

### **✅ Pass Conditions:**
- Author sees NO approval buttons anywhere
- Editor+ sees approval buttons for REVIEW posts
- All role levels display correctly in debug panel
- Workflow actions work correctly for appropriate roles
- Console logs show correct permission checks

### **❌ Fail Conditions:**
- Author can see or use approval buttons
- Editor cannot see approval buttons for REVIEW posts
- Wrong user levels in debug panel
- Workflow actions fail or show errors
- Console shows incorrect permission logic

## 🔄 Test Data Reset

### **Reset Post Statuses:**
```sql
-- Reset some posts to REVIEW for testing
UPDATE posts SET status = 'REVIEW' WHERE id IN (
  SELECT id FROM posts LIMIT 3
);
```

### **Reset User Roles:**
```sql
-- Ensure clean role assignments
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'author@example.com', 
    'editor@example.com', 
    'moderator@example.com'
  )
);

-- Reassign correct roles
INSERT INTO user_roles (user_id, role_id) VALUES
  ((SELECT id FROM users WHERE email = 'author@example.com'), 
   (SELECT id FROM roles WHERE name = 'author')),
  ((SELECT id FROM users WHERE email = 'editor@example.com'), 
   (SELECT id FROM roles WHERE name = 'editor')),
  ((SELECT id FROM users WHERE email = 'moderator@example.com'), 
   (SELECT id FROM roles WHERE name = 'moderator'));
```

---

**Note:** Run tests in development mode to see debug panels and console logs. This ensures the enhanced role system is working correctly before production deployment.
