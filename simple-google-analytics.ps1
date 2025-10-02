# Simple Google Analytics Updater
# This script adds the exact Google Analytics tracking code to all HTML files

# Set to $false when ready to update all files
$DryRun = $false

# The exact Google Analytics code from Google
$googleAnalyticsCode = @'
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-G14Q10H6Y2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-G14Q10H6Y2');
</script>
'@

Write-Host "Google Analytics Updater" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
    Write-Host "Set DryRun = `$false to actually update files" -ForegroundColor Yellow
    Write-Host ""
}

# Get all HTML files
$htmlFiles = Get-ChildItem -Path . -Name "*.html" | Where-Object { 
    $_ -notmatch "temp|backup|\.bak" 
}

$updatedCount = 0
$alreadyHasGA = 0
$errorCount = 0

foreach ($file in $htmlFiles) {
    Write-Host "Checking: $file" -ForegroundColor White
    
    try {
        $content = Get-Content -Path $file -Raw
        
        # Check if already has Google Analytics with our ID
        if ($content -match "G-G14Q10H6Y2") {
            Write-Host "  Already has Google Analytics" -ForegroundColor Green
            $alreadyHasGA++
            continue
        }
        
        # Check if has head tag
        if ($content -notmatch "<head>") {
            Write-Host "  No head tag found - skipping" -ForegroundColor Yellow
            $errorCount++
            continue
        }
        
        if ($DryRun) {
            Write-Host "  Would add Google Analytics code" -ForegroundColor Cyan
        } else {
            # Create backup
            Copy-Item -Path $file -Destination "$file.bak" -Force
            
            # Add Google Analytics after head tag
            $newContent = $content -replace "(<head>)", "`$1`n$googleAnalyticsCode"
            
            # Save the file
            Set-Content -Path $file -Value $newContent -Encoding UTF8
            Write-Host "  Added Google Analytics code" -ForegroundColor Green
            $updatedCount++
        }
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "Files checked: $($htmlFiles.Count)" -ForegroundColor White
Write-Host "Already have GA: $alreadyHasGA" -ForegroundColor Green
if ($DryRun) {
    Write-Host "Would update: $($htmlFiles.Count - $alreadyHasGA - $errorCount)" -ForegroundColor Yellow
} else {
    Write-Host "Updated: $updatedCount" -ForegroundColor Green
}
Write-Host "Errors/Skipped: $errorCount" -ForegroundColor Red

if ($DryRun) {
    Write-Host ""
    Write-Host "To actually update files:" -ForegroundColor Yellow
    Write-Host "1. Edit this script file" -ForegroundColor Yellow
    Write-Host "2. Change 'DryRun = `$true' to 'DryRun = `$false'" -ForegroundColor Yellow
    Write-Host "3. Run the script again" -ForegroundColor Yellow
}