# Complete Password Backup System
# This script orchestrates the entire process of extracting, organizing, and creating
# a printable password booklet from all your saved passwords

param(
    [string]$OutputPath = ".\password-backup",
    [string]$BookletTitle = "Personal Password Reference",
    [switch]$IncludeBrowsers,
    [switch]$IncludeWindows,
    [switch]$CreateHTML,
    [switch]$CreateText,
    [switch]$GroupByCategory,
    [switch]$IncludeIndex,
    [switch]$OpenWhenDone,
    [switch]$CleanupAfter,
    [switch]$Verbose,
    [switch]$SkipBrowsers,
    [switch]$SkipWindows
)

# Create main function
function Start-PasswordBackup {
    Write-Host ""
    Write-Host "🔐 Complete Password Backup System" -ForegroundColor Cyan
    Write-Host "=================================="  -ForegroundColor Cyan
    Write-Host "Creating a secure, printable backup of all your saved passwords" -ForegroundColor White
    Write-Host ""
    
    # Check if running as Administrator (needed for some extractions)
    $IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (!$IsAdmin) {
        Write-Host "⚠️  Note: Not running as Administrator. Some Windows credentials may not be accessible." -ForegroundColor Yellow
        Write-Host "💡 For complete extraction, run PowerShell as Administrator" -ForegroundColor Yellow
        Write-Host ""
    }
    
    # Create output directory
    if (!(Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }
    
    # Set default values if switches not specified
    if (!$SkipBrowsers) { $IncludeBrowsers = $true }
    if (!$SkipWindows) { $IncludeWindows = $true }
    if (!$CreateHTML.IsPresent -and !$CreateText.IsPresent) { $CreateHTML = $true }
    if (!$GroupByCategory.IsPresent) { $GroupByCategory = $true }
    if (!$IncludeIndex.IsPresent) { $IncludeIndex = $true }
    if (!$OpenWhenDone.IsPresent) { $OpenWhenDone = $true }

    # Step 1: Extract passwords
    Write-Host "📥 Step 1: Extracting saved passwords..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    try {
        $ExtractorScript = Join-Path $PSScriptRoot "password-extractor.ps1"
        if (Test-Path $ExtractorScript) {
            $ExtractParams = @{
                OutputPath = $OutputPath
                IncludeBrowsers = $IncludeBrowsers
                IncludeWindows = $IncludeWindows
                Verbose = $Verbose
            }
            
            & $ExtractorScript @ExtractParams
            
        } else {
            Write-Host "❌ Error: password-extractor.ps1 not found" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error during password extraction: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Check if we have data
    $CSVPath = Join-Path $OutputPath "all-passwords.csv"
    if (!(Test-Path $CSVPath)) {
        Write-Host "❌ No password data found. Please check browser exports or run manually." -ForegroundColor Red
        return $false
    }
    
    $Passwords = Import-Csv $CSVPath
    if ($Passwords.Count -eq 0) {
        Write-Host "⚠️  No passwords found in extraction. Check browser settings and try manual export." -ForegroundColor Yellow
        return $false
    }
    
    Write-Host ""
    Write-Host "📊 Extraction Summary:" -ForegroundColor Cyan
    $Summary = $Passwords | Group-Object Source
    foreach ($Group in $Summary) {
        Write-Host "   $($Group.Name): $($Group.Count) entries" -ForegroundColor Yellow
    }
    
    # Step 2: Create printable booklet
    if ($CreateHTML) {
        Write-Host ""
        Write-Host "📄 Step 2: Creating printable booklet..." -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        
        try {
            $BookletScript = Join-Path $PSScriptRoot "create-password-booklet.ps1"
            if (Test-Path $BookletScript) {
                $BookletParams = @{
                    InputCSV = $CSVPath
                    OutputPath = $OutputPath
                    Title = $BookletTitle
                    GroupByCategory = $GroupByCategory
                    IncludeIndex = $IncludeIndex
                    OpenInBrowser = $false
                }
                
                & $BookletScript @BookletParams
                
            } else {
                Write-Host "❌ Error: create-password-booklet.ps1 not found" -ForegroundColor Red
                return $false
            }
        } catch {
            Write-Host "❌ Error creating booklet: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    
    # Step 3: Show results and next steps
    Write-Host ""
    Write-Host "✅ Password Backup Complete!" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    
    $HTMLPath = Join-Path $OutputPath "password-booklet.html"
    $TXTPath = Join-Path $OutputPath "password-booklet.txt"
    
    Write-Host "📁 Output Location: $OutputPath" -ForegroundColor Cyan
    Write-Host "📄 Files Created:" -ForegroundColor Cyan
    
    if (Test-Path $CSVPath) {
        Write-Host "   📊 all-passwords.csv (raw data)" -ForegroundColor White
    }
    if (Test-Path $HTMLPath) {
        Write-Host "   🌐 password-booklet.html (printable)" -ForegroundColor White
    }
    if (Test-Path $TXTPath) {
        Write-Host "   📝 password-booklet.txt (plain text)" -ForegroundColor White
    }
    
    # Step 4: Show printing instructions
    Write-Host ""
    Write-Host "🖨️ How to Print Your Password Booklet:" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor Yellow
    Write-Host "1. Open: $HTMLPath" -ForegroundColor White
    Write-Host "2. Press Ctrl+P or click the 'Print Booklet' button" -ForegroundColor White
    Write-Host "3. Choose your printer and adjust settings if needed" -ForegroundColor White
    Write-Host "4. Print the booklet" -ForegroundColor White
    Write-Host ""
    
    # Step 5: Security reminders
    Write-Host "🔒 IMPORTANT SECURITY STEPS:" -ForegroundColor Red
    Write-Host "============================" -ForegroundColor Red
    Write-Host "1. 📁 Store printed booklet in a secure location (safe, locked drawer)" -ForegroundColor Yellow
    Write-Host "2. 🗑️  Delete digital files after printing (see cleanup command below)" -ForegroundColor Yellow
    Write-Host "3. 📝 Update booklet when passwords change" -ForegroundColor Yellow
    Write-Host "4. 🚫 Never leave booklet in unsecured locations" -ForegroundColor Yellow
    Write-Host "5. 💻 Consider using a password manager for day-to-day access" -ForegroundColor Yellow
    
    # Step 6: Cleanup instructions
    Write-Host ""
    Write-Host "🧹 Cleanup Commands (run after printing):" -ForegroundColor Magenta
    Write-Host "===========================================" -ForegroundColor Magenta
    Write-Host "Remove all digital files:" -ForegroundColor White
    Write-Host "   Remove-Item '$OutputPath' -Recurse -Force" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or keep only the CSV for future updates:" -ForegroundColor White
    Write-Host "   Remove-Item '$HTMLPath', '$TXTPath'" -ForegroundColor Cyan
    
    # Open booklet if requested
    if ($OpenWhenDone -and (Test-Path $HTMLPath)) {
        Write-Host ""
        Write-Host "🌐 Opening password booklet in browser..." -ForegroundColor Cyan
        try {
            Start-Process $HTMLPath
        } catch {
            Write-Host "⚠️  Could not open browser. Open manually: $HTMLPath" -ForegroundColor Yellow
        }
    }
    
    # Auto cleanup if requested
    if ($CleanupAfter) {
        Write-Host ""
        Write-Host "🧹 Auto-cleanup requested. Removing digital files..." -ForegroundColor Magenta
        try {
            Start-Sleep -Seconds 5  # Give time to read
            Remove-Item $OutputPath -Recurse -Force
            Write-Host "✅ Digital files cleaned up successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not auto-cleanup: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "💡 Please manually delete: $OutputPath" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Your password backup system is complete!" -ForegroundColor Green
    Write-Host "Remember: This is for emergency access - use a password manager for daily use!" -ForegroundColor Yellow
    
    return $true
}

# Browser export instructions function
function Show-BrowserExportInstructions {
    Write-Host ""
    Write-Host "📋 Manual Browser Export Instructions" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🌐 Chrome/Edge:" -ForegroundColor Yellow
    Write-Host "1. Open Settings → Passwords" -ForegroundColor White
    Write-Host "2. Click three dots (⋮) next to 'Saved Passwords'" -ForegroundColor White
    Write-Host "3. Select 'Export passwords...'" -ForegroundColor White
    Write-Host "4. Save as 'chrome-passwords.csv' or 'edge-passwords.csv' in $OutputPath" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🦊 Firefox:" -ForegroundColor Yellow
    Write-Host "1. Open Settings → Privacy & Security" -ForegroundColor White
    Write-Host "2. Click 'Saved Logins' button" -ForegroundColor White
    Write-Host "3. Click three dots (⋯) → Export Logins" -ForegroundColor White
    Write-Host "4. Save as 'firefox-passwords.csv' in $OutputPath" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💡 After exporting, run this script again to create your booklet!" -ForegroundColor Green
}

# Test if we have the required scripts
function Test-RequiredFiles {
    $ExtractorScript = Join-Path $PSScriptRoot "password-extractor.ps1"
    $BookletScript = Join-Path $PSScriptRoot "create-password-booklet.ps1"
    
    $MissingFiles = @()
    
    if (!(Test-Path $ExtractorScript)) {
        $MissingFiles += "password-extractor.ps1"
    }
    
    if (!(Test-Path $BookletScript)) {
        $MissingFiles += "create-password-booklet.ps1"
    }
    
    if ($MissingFiles.Count -gt 0) {
        Write-Host "❌ Missing required files:" -ForegroundColor Red
        foreach ($File in $MissingFiles) {
            Write-Host "   - $File" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "💡 Make sure all password backup scripts are in the same folder." -ForegroundColor Yellow
        return $false
    }
    
    return $true
}

# Main execution
Write-Host "🔐 Password Backup System Initializing..." -ForegroundColor Cyan

# Check for required files
if (!(Test-RequiredFiles)) {
    exit 1
}

# Check parameters and show help if needed
if ($args -contains "-help" -or $args -contains "--help" -or $args -contains "/?" -or $args -contains "-h") {
    Write-Host ""
    Write-Host "🔐 Complete Password Backup System" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Creates a secure, printable backup of all your saved passwords." -ForegroundColor White
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "   .\run-password-backup.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "   -OutputPath <path>        Output directory (default: .\password-backup)" -ForegroundColor White
    Write-Host "   -BookletTitle <title>     Title for the booklet" -ForegroundColor White
    Write-Host "   -IncludeBrowsers          Extract browser passwords (default: true)" -ForegroundColor White
    Write-Host "   -IncludeWindows           Extract Windows credentials (default: true)" -ForegroundColor White
    Write-Host "   -GroupByCategory          Group passwords by type (default: true)" -ForegroundColor White
    Write-Host "   -IncludeIndex             Add alphabetical index (default: true)" -ForegroundColor White
    Write-Host "   -OpenWhenDone             Open booklet in browser (default: true)" -ForegroundColor White
    Write-Host "   -CleanupAfter             Delete digital files after creation" -ForegroundColor White
    Write-Host "   -Verbose                  Show detailed output" -ForegroundColor White
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "   .\run-password-backup.ps1" -ForegroundColor White
    Write-Host "   .\run-password-backup.ps1 -CleanupAfter -Verbose" -ForegroundColor White
    Write-Host "   .\run-password-backup.ps1 -OutputPath 'C:\MyPasswords' -BookletTitle 'My Passwords'" -ForegroundColor White
    exit 0
}

# Check if browser export instructions are needed
if (!$IncludeBrowsers -and !$IncludeWindows) {
    Show-BrowserExportInstructions
    exit 0
}

# Start the backup process
$Success = Start-PasswordBackup

if (!$Success) {
    Write-Host ""
    Write-Host "❌ Password backup failed. Try manual browser export:" -ForegroundColor Red
    Show-BrowserExportInstructions
    exit 1
}

exit 0