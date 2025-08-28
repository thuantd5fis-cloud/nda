# 🔐 Enhanced Role System & Approval Workflow Guide

## 📋 Overview

Hệ thống role được nâng cấp với hierarchy rõ ràng và logic duyệt bài chuyên nghiệp. Button duyệt chỉ hiển thị cho những role có quyền phù hợp.

## 🎯 Role Hierarchy (Level 1-10)

### **Content Creation Tier (Level 1-4)**
- `contributor` (Level 1) - Guest writer
- `junior_writer` (Level 2) - Entry-level writer  
- `writer` (Level 3) - Standard content creator
- `senior_writer` (Level 4) - Experienced writer
- `content_specialist` (Level 4) - Subject matter expert

### **Editorial Tier (Level 5-6)**  
- `copy_editor` (Level 5) - Language & style editor
- `seo_specialist` (Level 5) - SEO optimization expert
- `fact_checker` (Level 5) - Fact checking specialist
- `technical_reviewer` (Level 6) - Technical content reviewer
- `content_editor` (Level 6) - Content structure editor

### **Management Tier (Level 7-10)**
- `senior_editor` (Level 7) - Senior editorial authority
- `managing_editor` (Level 8) - Editorial coordination  
- `editor_in_chief` (Level 9) - Executive editorial authority
- `publisher` (Level 10) - Publishing authority

### **Legacy Role Mapping**
- `author` → Level 3 (writer)
- `editor` → Level 5 (copy_editor)
- `moderator` → Level 7 (senior_editor)
- `admin` → Level 8 (managing_editor)
- `super_admin` → Level 10 (publisher)

## 🚫 Button Visibility Rules

### **WHO CAN SEE APPROVAL BUTTONS:**
✅ **Level 5+**: copy_editor, content_editor, senior_editor, managing_editor, editor_in_chief, publisher
✅ **Legacy roles**: editor, moderator, admin, super_admin

### **WHO CANNOT SEE APPROVAL BUTTONS:**
❌ **Level 1-4**: contributor, junior_writer, writer, senior_writer, content_specialist  
❌ **Legacy role**: author

## 🔄 Available Actions by Role Level

### **Level 1-4 (Author Tier)**
- Create posts
- Edit own posts (DRAFT/REJECTED only)
- Submit for review
- **NO approval actions visible**

### **Level 5 (Editorial Entry)**
- All Level 1-4 actions
- ✅ **Approve posts** (REVIEW → PUBLISHED)
- ✅ **Reject posts** (REVIEW → REJECTED)  
- Edit language/style

### **Level 6 (Content Management)**
- All Level 5 actions
- ✅ **Publish directly** (DRAFT/REVIEW → PUBLISHED)
- ✅ **Archive posts** (PUBLISHED → ARCHIVED)
- Edit content structure

### **Level 7+ (Senior Management)**
- All lower level actions
- ✅ **Emergency publish**
- ✅ **Strategic decisions**
- ✅ **Team management**

## 🛠️ Implementation Details

### **New Components**
1. `useEnhancedPermissions` hook - Advanced role-based logic
2. `EnhancedApprovalButton` - Smart approval button with role checks
3. `EnhancedWorkflowActions` - Complete workflow actions with hierarchy

### **Key Files Modified**
- `apps/web/src/hooks/use-enhanced-permissions.ts`
- `apps/web/src/components/ui/enhanced-approval-button.tsx` 
- `apps/web/src/components/ui/enhanced-workflow-actions.tsx`
- `apps/web/src/app/dashboard/posts/page.tsx` (List page)
- `apps/web/src/app/dashboard/posts/[id]/edit/page.tsx` (Edit page)

### **Permission Check Logic**
```typescript
// Can see approval actions at all?
const canSeeApprovalActions = (): boolean => {
  const userLevel = getUserRoleLevel();
  const hasApprovalLevelRole = userLevel >= 5;
  const isAuthorTierOnly = hasAnyRole([...NON_APPROVAL_ROLES]) && userLevel < 5;
  
  return hasApprovalLevelRole && !isAuthorTierOnly;
};

// Can approve this specific post?
const canApprovePost = (post: Post): boolean => {
  if (post.status !== 'REVIEW') return false;
  
  const userLevel = getUserRoleLevel();
  const canApprove = hasAnyRole([...APPROVAL_ROLES]) && userLevel >= 5;
  
  return canApprove;
};
```

## 🧪 Testing & Debug

### **Development Mode Features**
- Debug panels showing user permissions
- Legacy components alongside new ones for comparison
- Console logging for permission checks
- Role level indicators

### **Testing Different Roles**
1. Login with `author` role → Should NOT see approval buttons
2. Login with `editor` role → Should see approval buttons  
3. Login with `moderator` role → Should see all workflow actions
4. Login with `super_admin` role → Should see all actions

### **Debug Console Output**
```
🔐 [Enhanced Permissions] User level: 5
🎯 [EnhancedApprovalButton] ✅ VISIBLE - All checks passed  
🚀 [EnhancedWorkflowActions] Available actions: approve, reject
📋 [PostsTable] Enhanced permissions debug: {userLevel: 5, roles: ['editor']}
```

## 📊 Migration Path

### **Phase 1: Parallel Running (Current)**
- New enhanced components run alongside legacy ones
- Debug panels for comparison
- Both systems functional

### **Phase 2: Legacy Removal (Future)**
- Remove old components
- Clean up debug code
- Performance optimization

### **Phase 3: Advanced Features (Future)**
- Multi-track review workflows
- Smart reviewer assignment
- Advanced analytics

## 🔧 Configuration

### **Environment Variables**
```env
NODE_ENV=development  # Enables debug panels and legacy comparison
```

### **Role Configuration**
Roles are configured in `ROLE_HIERARCHY` constant in `use-enhanced-permissions.ts`. To add new roles or change levels, update this mapping.

## ❓ Troubleshooting

### **Button not showing for admin/moderator?**
Check console for permission debug logs. Ensure role mapping is correct.

### **Author still seeing approval buttons?**
Verify user has ONLY author role. Mixed roles might cause unexpected behavior.

### **Legacy vs Enhanced differences?**
Use development mode to see both systems side-by-side for comparison.

## 📞 Support

For questions about the enhanced role system:
1. Check console debug logs
2. Use development debug panels
3. Review permission logic in `use-enhanced-permissions.ts`
4. Test with different role combinations

---

**Note:** This is a professional-grade editorial workflow system designed for content management at scale. The role hierarchy follows industry standards for publishing and editorial teams.
