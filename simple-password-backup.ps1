# Complete Password Backup System - Simple Version
# This script runs the password backup system with minimal complexity

param(
    [string]$OutputPath = ".\password-backup"
)

Write-Host "🔐 Password Backup System" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if required files exist
$ExtractorScript = ".\password-extractor.ps1"
$BookletScript = ".\create-password-booklet.ps1"

if (!(Test-Path $ExtractorScript)) {
    Write-Host "❌ Missing file: password-extractor.ps1" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $BookletScript)) {
    Write-Host "❌ Missing file: create-password-booklet.ps1" -ForegroundColor Red  
    exit 1
}

# Create output directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "📥 Step 1: Extracting passwords..." -ForegroundColor Green
Write-Host ""

# Run password extractor
try {
    & $ExtractorScript -OutputPath $OutputPath -IncludeBrowsers -IncludeWindows
} catch {
    Write-Host "❌ Password extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if we got data
$CSVPath = Join-Path $OutputPath "all-passwords.csv"
if (!(Test-Path $CSVPath)) {
    Write-Host "❌ No password data found. Check browser settings." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Manual browser export instructions:" -ForegroundColor Yellow
    Write-Host "Chrome: Settings → Passwords → Export" -ForegroundColor White
    Write-Host "Firefox: Settings → Privacy → Saved Logins → Export" -ForegroundColor White
    Write-Host "Edge: Settings → Passwords → Export" -ForegroundColor White
    Write-Host ""
    Write-Host "Save exported files in: $OutputPath" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "📄 Step 2: Creating printable booklet..." -ForegroundColor Green
Write-Host ""

# Create booklet
try {
    & $BookletScript -InputCSV $CSVPath -OutputPath $OutputPath -GroupByCategory -IncludeIndex
} catch {
    Write-Host "❌ Booklet creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Open the booklet
$HTMLPath = Join-Path $OutputPath "password-booklet.html"
if (Test-Path $HTMLPath) {
    Write-Host ""
    Write-Host "✅ Password booklet created successfully!" -ForegroundColor Green
    Write-Host "📁 Location: $HTMLPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🖨️ Next steps:" -ForegroundColor Yellow
    Write-Host "1. The booklet will open in your browser" -ForegroundColor White
    Write-Host "2. Press Ctrl+P or click 'Print Booklet'" -ForegroundColor White  
    Write-Host "3. Store printed copy securely" -ForegroundColor White
    Write-Host "4. Delete digital files:" -ForegroundColor White
    Write-Host "   Remove-Item '$OutputPath' -Recurse -Force" -ForegroundColor Cyan
    Write-Host ""
    
    # Open in browser
    try {
        Start-Process $HTMLPath
        Write-Host "🌐 Opening booklet in browser..." -ForegroundColor Cyan
    } catch {
        Write-Host "⚠️ Could not open browser automatically." -ForegroundColor Yellow
        Write-Host "Please open manually: $HTMLPath" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Booklet file not created" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔒 SECURITY REMINDER:" -ForegroundColor Red
Write-Host "Keep your printed booklet secure and delete digital files!" -ForegroundColor Yellow