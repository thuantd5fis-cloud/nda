# PowerShell script to bulk update alert() and confirm() calls with popup system
Write-Host "🚀 Starting bulk popup system update..." -ForegroundColor Green

# Define files to update
$files = @(
    "src/app/dashboard/events/[id]/edit/page.tsx",
    "src/app/dashboard/faqs/create/page.tsx", 
    "src/app/dashboard/faqs/[id]/page.tsx",
    "src/app/dashboard/faqs/[id]/edit/page.tsx",
    "src/app/dashboard/members/create/page.tsx",
    "src/app/dashboard/members/[id]/page.tsx", 
    "src/app/dashboard/members/[id]/edit/page.tsx",
    "src/app/dashboard/assets/[id]/page.tsx",
    "src/app/dashboard/users/create/page.tsx",
    "src/app/dashboard/analytics/page.tsx",
    "src/app/dashboard/audit/page.tsx",
    "src/app/dashboard/settings/page.tsx",
    "src/app/dashboard/profile/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # 1. Add import if not exists
        if ($content -notmatch "useConfirm") {
            if ($content -match "import.*@/lib/api") {
                $content = $content -replace "(import.*@/lib/api';)", "`$1`nimport { useConfirm } from '@/hooks/use-confirm';"
            }
        }
        
        # 2. Add hook usage in function components
        if ($content -match "export default function \w+\(\) \{") {
            $content = $content -replace "(export default function \w+\(\) \{[^}]*?const router = useRouter\(\);)", "`$1`n  const { confirmDelete, confirmWarning, toast } = useConfirm();"
        }
        
        # 3. Replace success alerts
        $content = $content -replace "alert\('([^']*thành công[^']*)'\);", "toast.success('`$1');"
        $content = $content -replace "alert\('([^']*successfully[^']*)'\);", "toast.success('`$1');"
        
        # 4. Replace error alerts
        $content = $content -replace "alert\('([^']*lỗi[^']*)'\);", "toast.error('`$1');"
        $content = $content -replace "alert\('([^']*không thể[^']*)'\);", "toast.error('`$1');"
        $content = $content -replace "alert\('([^']*Error[^']*)'\);", "toast.error('`$1');"
        
        # 5. Replace validation alerts  
        $content = $content -replace "alert\('([^']*Vui lòng[^']*)'\);", "toast.error('`$1');"
        $content = $content -replace "alert\('([^']*Please[^']*)'\);", "toast.error('`$1');"
        
        # 6. Replace simple window.confirm patterns
        $content = $content -replace "if \(!window\.confirm\('([^']*)'\)\) \{[\s\n]*return;[\s\n]*\}", "const confirmed = await confirmDelete('`$1', { title: 'Xác nhận' });`nif (!confirmed) return;"
        
        # 7. Replace window.confirm with action blocks
        $content = $content -replace "if \(window\.confirm\('([^']*)'\)\) \{", "const confirmed = await confirmDelete('`$1', { title: 'Xác nhận' });`nif (confirmed) {"
        
        # Save if changed
        if ($content -ne $originalContent) {
            Set-Content $file $content -Encoding UTF8
            Write-Host "✅ Updated: $file" -ForegroundColor Green
        } else {
            Write-Host "⚪ No changes needed: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Bulk update completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review updated files" -ForegroundColor White
Write-Host "  2. Fix any TypeScript errors" -ForegroundColor White  
Write-Host "  3. Test popup functionality" -ForegroundColor White
Write-Host "  4. Run: find src -name '*.tsx' -exec grep -l 'alert(' {} \;" -ForegroundColor White
