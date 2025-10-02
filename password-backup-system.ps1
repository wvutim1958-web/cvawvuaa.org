# Complete Password Backup System
# Main script that orchestrates the entire password backup process

param(
    [string]$OutputPath = ".\password-backup",
    [string]$Title = "Personal Password Reference"
)

Write-Host ""
Write-Host "Complete Password Backup System" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "Creating a secure, printable backup of all your saved passwords" -ForegroundColor White
Write-Host ""

# Create output directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-Host "Created output directory: $OutputPath" -ForegroundColor Green
}

# Step 1: Extract passwords
Write-Host "Step 1: Extracting saved passwords..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

try {
    & ".\extract-passwords.ps1" -OutputPath $OutputPath -IncludeBrowsers -IncludeWindows
} catch {
    Write-Host "Error during password extraction: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual export instructions:" -ForegroundColor Yellow
    Write-Host "Chrome: Settings > Passwords > Export passwords (save as 'Chrome Passwords.csv')" -ForegroundColor White
    Write-Host "Firefox: Settings > Privacy > Saved Logins > Export (save as 'firefox-passwords.csv')" -ForegroundColor White
    Write-Host "Edge: Settings > Passwords > Export passwords (save as 'edge-passwords.csv')" -ForegroundColor White
    Write-Host "Save all files in: $OutputPath" -ForegroundColor Cyan
}

# Check if we have data
$CSVPath = Join-Path $OutputPath "all-passwords.csv"
if (!(Test-Path $CSVPath)) {
    Write-Host ""
    Write-Host "No password data found. Please export manually from browsers." -ForegroundColor Red
    Write-Host ""
    Write-Host "Browser export instructions:" -ForegroundColor Yellow
    Write-Host "1. Chrome: Settings > Passwords > Export passwords" -ForegroundColor White
    Write-Host "2. Firefox: Settings > Privacy & Security > Saved Logins > Export" -ForegroundColor White
    Write-Host "3. Edge: Settings > Passwords > Export passwords" -ForegroundColor White
    Write-Host "4. Save files in: $OutputPath" -ForegroundColor Cyan
    Write-Host "5. Run this script again" -ForegroundColor Cyan
    exit 1
}

# Check password count
$Passwords = Import-Csv $CSVPath
if ($Passwords.Count -eq 0) {
    Write-Host ""
    Write-Host "No passwords found in data files." -ForegroundColor Red
    Write-Host "Please check browser exports and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Password extraction summary:" -ForegroundColor Cyan
$Summary = $Passwords | Group-Object Source
foreach ($Group in $Summary) {
    Write-Host "   $($Group.Name): $($Group.Count) entries" -ForegroundColor Yellow
}
Write-Host "   Total: $($Passwords.Count) password entries" -ForegroundColor Green

# Step 2: Create printable booklet
Write-Host ""
Write-Host "Step 2: Creating printable booklet..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

try {
    & ".\make-booklet.ps1" -InputCSV $CSVPath -OutputPath $OutputPath -Title $Title -GroupByCategory -IncludeIndex
} catch {
    Write-Host "Error creating booklet: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Open and provide instructions
$HTMLPath = Join-Path $OutputPath "password-booklet.html"
if (Test-Path $HTMLPath) {
    Write-Host ""
    Write-Host "SUCCESS! Your password booklet is ready!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Files created:" -ForegroundColor Cyan
    Write-Host "   Data file: $CSVPath" -ForegroundColor White
    Write-Host "   Booklet:   $HTMLPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. The booklet will open in your web browser" -ForegroundColor White
    Write-Host "2. Click 'Print Booklet' or press Ctrl+P" -ForegroundColor White
    Write-Host "3. Print the document" -ForegroundColor White
    Write-Host "4. Store printed copy in a secure location" -ForegroundColor White
    Write-Host "5. Delete digital files for security:" -ForegroundColor White
    Write-Host "   Remove-Item '$OutputPath' -Recurse -Force" -ForegroundColor Cyan
    Write-Host ""
    
    # Open booklet in browser
    try {
        Start-Process $HTMLPath
        Write-Host "Opening password booklet in your default browser..." -ForegroundColor Cyan
    } catch {
        Write-Host "Could not open browser automatically." -ForegroundColor Yellow
        Write-Host "Please open manually: $HTMLPath" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "IMPORTANT SECURITY REMINDERS:" -ForegroundColor Red
    Write-Host "=============================" -ForegroundColor Red
    Write-Host "- Keep printed booklet in a secure location (safe, locked drawer)" -ForegroundColor Yellow
    Write-Host "- Delete digital files after printing" -ForegroundColor Yellow
    Write-Host "- Update booklet when passwords change" -ForegroundColor Yellow
    Write-Host "- This is for emergency backup only - use a password manager daily" -ForegroundColor Yellow
    
} else {
    Write-Host ""
    Write-Host "Error: Booklet file was not created successfully" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Password backup system complete!" -ForegroundColor Green