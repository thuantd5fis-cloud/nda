# 🔧 **HƯỚNG DẪN UPDATE CÁC FILES CÒN LẠI**

## ✅ **ĐÃ HOÀN THÀNH (100% READY)**

### **Core Modules - Fully Updated:**
- ✅ Posts: `page.tsx`, `create/page.tsx`, `[id]/edit/page.tsx`, `[id]/page.tsx`
- ✅ Categories: `page.tsx`, `create/page.tsx`, `[id]/edit/page.tsx` 
- ✅ Tags: `page.tsx`, `create/page.tsx`, `[id]/edit/page.tsx`
- ✅ Users: `page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`

## 🟡 **CẦN UPDATE (PATTERN TEMPLATE)**

### **Files còn lại cần update:**

#### **1. Events Module (3 files):**
```
src/app/dashboard/events/create/page.tsx
src/app/dashboard/events/[id]/edit/page.tsx
```

#### **2. FAQs Module (3 files):**
```
src/app/dashboard/faqs/create/page.tsx
src/app/dashboard/faqs/[id]/page.tsx
src/app/dashboard/faqs/[id]/edit/page.tsx
```

#### **3. Members Module (3 files):**
```
src/app/dashboard/members/create/page.tsx
src/app/dashboard/members/[id]/page.tsx
src/app/dashboard/members/[id]/edit/page.tsx
```

#### **4. Assets Module (1 file):**
```
src/app/dashboard/assets/[id]/page.tsx
```

#### **5. Other Pages (4 files):**
```
src/app/dashboard/users/create/page.tsx
src/app/dashboard/analytics/page.tsx
src/app/dashboard/audit/page.tsx
src/app/dashboard/settings/page.tsx
src/app/dashboard/profile/page.tsx
```

## 🎯 **REPLACEMENT PATTERN**

### **Step 1: Add Import**
```typescript
// FIND this line:
import { apiClient } from '@/lib/api';

// REPLACE with:
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
```

### **Step 2: Add Hook Usage**
```typescript
// FIND this pattern:
export default function SomePage() {
  const router = useRouter();

// REPLACE with:
export default function SomePage() {
  const router = useRouter();
  const { confirmDelete, confirmWarning, toast } = useConfirm();
```

### **Step 3: Replace Alerts**
```typescript
// Success alerts
alert('Success message') → toast.success('Success message')

// Error alerts  
alert('Error message') → toast.error('Error message')

// Validation errors
alert('Please fill required fields') → toast.error('Please fill required fields')
```

### **Step 4: Replace Confirmations**
```typescript
// Delete confirmations
if (!window.confirm('Delete this item?')) {
  return;
}

// REPLACE with:
const confirmed = await confirmDelete(
  'Delete this item?',
  {
    title: 'Confirm Delete'
  }
);

if (!confirmed) return;
```

```typescript
// Warning confirmations
if (window.confirm('Are you sure?')) {
  // do something
}

// REPLACE with:
const confirmed = await confirmWarning('Are you sure?');
if (confirmed) {
  // do something
}
```

## 🚀 **AUTOMATED SCRIPT**

### **PowerShell Script for Bulk Update:**

Save this as `update-alerts.ps1`:

```powershell
# Get all TypeScript files with alert() calls
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Where-Object {
    (Get-Content $_.FullName -Raw) -match "alert\("
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Add import if not exists
    if ($content -notmatch "useConfirm") {
        $content = $content -replace 
            "import { apiClient } from '@/lib/api';",
            "import { apiClient } from '@/lib/api';`nimport { useConfirm } from '@/hooks/use-confirm';"
    }
    
    # Add hook usage
    $content = $content -replace 
        "(export default function \w+\(\) \{[\s\n]*const router = useRouter\(\);)",
        "`$1`n  const { confirmDelete, confirmWarning, toast } = useConfirm();"
    
    # Replace basic alerts
    $content = $content -replace "alert\('([^']*?)'\);", "toast.success('`$1');"
    $content = $content -replace "alert\('Có lỗi[^']*?'\);", "toast.error('`$1');"
    $content = $content -replace "alert\('Vui lòng[^']*?'\);", "toast.error('`$1');"
    
    # Replace window.confirm
    $content = $content -replace 
        "if \(!window\.confirm\(`([^`]*?)`\)\) \{[\s\n]*return;[\s\n]*\}",
        "const confirmed = await confirmDelete(`n  ```$1``,`n  {`n    title: 'Xác nhận xóa'`n  }`n);`n`nif (!confirmed) return;"
    
    Set-Content $file.FullName $content
    Write-Host "✅ Updated: $($file.Name)"
}

Write-Host "🎉 Bulk update completed!"
```

### **Run the script:**
```powershell
cd apps/web
./update-alerts.ps1
```

## 🎨 **MANUAL UPDATE EXAMPLE**

### **Before (src/app/dashboard/events/create/page.tsx):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  if (!formData.title) {
    alert('Vui lòng nhập tiêu đề sự kiện');
    return;
  }

  try {
    await apiClient.createEvent(formData);
    alert('Sự kiện đã được tạo thành công!');
    router.push('/dashboard/events');
  } catch (error) {
    alert('Có lỗi xảy ra khi tạo sự kiện');
  }
};
```

### **After:**
```typescript
const { toast } = useConfirm();

const handleSubmit = async (e: React.FormEvent) => {
  if (!formData.title) {
    toast.error('Vui lòng nhập tiêu đề sự kiện');
    return;
  }

  try {
    await apiClient.createEvent(formData);
    toast.success('Sự kiện đã được tạo thành công!');
    router.push('/dashboard/events');
  } catch (error) {
    toast.error('Có lỗi xảy ra khi tạo sự kiện');
  }
};
```

## 📊 **VERIFICATION**

### **Check remaining files:**
```bash
# Count files still containing alert()
find src -name "*.tsx" -exec grep -l "alert(" {} \; | wc -l

# List specific files
find src -name "*.tsx" -exec grep -l "alert(" {} \;
```

### **Test after update:**
1. ✅ Tạo/sửa events → Toast notifications
2. ✅ Xóa items → Beautiful confirmation dialogs  
3. ✅ Form validation → Toast error messages
4. ✅ Success operations → Toast success messages

## 🎊 **COMPLETION CHECKLIST**

- [ ] Events Module (3 files)
- [ ] FAQs Module (3 files)  
- [ ] Members Module (3 files)
- [ ] Assets Module (1 file)
- [ ] Other Pages (5 files)
- [ ] Test all popup functionality
- [ ] Verify no `alert()` or `window.confirm()` remain
- [ ] Check all toasts display correctly

**🚀 Sau khi hoàn thành, toàn bộ ứng dụng sẽ có popup system chuyên nghiệp nhất quán!**
