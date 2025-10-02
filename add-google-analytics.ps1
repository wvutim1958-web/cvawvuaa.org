# Google Analytics Updater v2
# This script adds Google Analytics tracking code to all HTML files in the repository
# Enhanced with safety features and better error handling

# Configuration - Set to true to actually modify files
$DryRun = $true # Set to $false when ready to update all files
$BackupFiles = $true # Create backup of files before modifying

# Analytics ID
$analyticsID = "G-G14Q10H6Y2"

# Google Analytics Code
$googleAnalyticsCode = @"
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=$analyticsID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '$analyticsID');
</script>
"@

# Directories to exclude
$excludeDirs = @(
    "node_modules",
    ".git",
    "temp"
)

# Function to check if path contains any excluded directory
function Test-ExcludedPath {
    param (
        [string]$Path
    )
    
    foreach ($dir in $excludeDirs) {
        if ($Path -match [regex]::Escape($dir)) {
            return $true
        }
    }
    return $false
}

# Create a log file
$logFile = "google-analytics-update-log.txt"
"Google Analytics Update Log - $(Get-Date)" | Out-File -FilePath $logFile -Encoding utf8
"Dry Run Mode: $DryRun" | Out-File -FilePath $logFile -Encoding utf8 -Append
"Backup Files: $BackupFiles" | Out-File -FilePath $logFile -Encoding utf8 -Append
"Analytics ID: $analyticsID" | Out-File -FilePath $logFile -Encoding utf8 -Append
"" | Out-File -FilePath $logFile -Encoding utf8 -Append

# Get all HTML files in the repository
Write-Host "Finding HTML files..." -ForegroundColor Cyan
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { -not (Test-ExcludedPath $_.FullName) }
Write-Host "Found $($htmlFiles.Count) HTML files." -ForegroundColor Cyan
"Found $($htmlFiles.Count) HTML files." | Out-File -FilePath $logFile -Encoding utf8 -Append

# Create arrays to track success and errors
$successFiles = @()
$errorFiles = @()
$alreadyUpdatedFiles = @()
$skippedFiles = @()
$corruptedFiles = @()

# Display mode warning
if ($DryRun) {
    Write-Host "`n⚠️  DRY RUN MODE - No files will be modified ⚠️" -ForegroundColor Yellow
    Write-Host "Set `$DryRun = `$false at the top of the script to actually update files.`n" -ForegroundColor Yellow
}

# Process each file
foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..." -ForegroundColor Cyan
    "$($file.Name)" | Out-File -FilePath $logFile -Encoding utf8 -Append
    
    try {
        # Read the file content
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        
        # Skip if file already has our Google Analytics ID
        if ($content -match $analyticsID) {
            Write-Host "  ✓ File already has correct Google Analytics code" -ForegroundColor Green
            "  Already has correct Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
            $alreadyUpdatedFiles += $file.Name
            continue
        }

        # Check if the file has corrupted HTML structure
        $hasValidHeadTag = $content -match "<head>.*?</head>"
        if (-not $hasValidHeadTag) {
            Write-Host "  ⚠️ File may have corrupted HTML structure (missing proper <head> tag)" -ForegroundColor Yellow
            "  Potentially corrupted HTML structure" | Out-File -FilePath $logFile -Encoding utf8 -Append
            $corruptedFiles += $file.Name
            
            # Try to fix common corruption patterns
            if ($DryRun -eq $false) {
                Write-Host "  Attempting to fix HTML structure..." -ForegroundColor Yellow
                
                # Create backup first
                if ($BackupFiles) {
                    Copy-Item -Path $file.FullName -Destination "$($file.FullName).bak" -Force
                }
                
                # Simple fix: if we find a <head tag but it's malformed, try to reconstruct it
                if ($content -match "<head[^>]*>") {
                    $fixedContent = $content -replace "(?s)<head[^>]*>.*?(?=<body|<html|<meta|<title|<link|<script)", "<head>`n$googleAnalyticsCode`n"
                    
                    # Only make changes if the content was actually modified
                    if ($fixedContent -ne $content) {
                        Set-Content -Path $file.FullName -Value $fixedContent -Encoding utf8
                        Write-Host "  ✓ Fixed and updated" -ForegroundColor Green
                        "  Fixed HTML structure and added Google Analytics" | Out-File -FilePath $logFile -Encoding utf8 -Append
                        $successFiles += $file.Name
                        continue
                    }
                }
            }
            
            # If we get here, we couldn't fix it in dry run mode or the fix attempt failed
            continue
        }
        
        # Check if file already has some Google Analytics code (with a different ID)
        if ($content -match "googletagmanager\.com/gtag/js") {
            Write-Host "  Found existing Google Analytics code with different ID" -ForegroundColor Yellow
            "  Replacing existing Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
            
            # In dry run mode, just report
            if ($DryRun) {
                Write-Host "  Would replace existing Google Analytics code" -ForegroundColor Yellow
                $skippedFiles += $file.Name
                continue
            }
            
            # Create backup first
            if ($BackupFiles) {
                Copy-Item -Path $file.FullName -Destination "$($file.FullName).bak" -Force
            }
            
            # Replace existing Google Analytics code with our code
            $pattern = "<script async src=`"https://www\.googletagmanager\.com/gtag/js\?id=[^`"]+`"></script>\s*<script>[^<]*window\.dataLayer[^<]*function gtag[^<]*gtag\([^<]*gtag\([^<]*</script>"
            $updatedContent = $content -replace $pattern, $googleAnalyticsCode
            
            # Only make changes if the content was actually modified
            if ($updatedContent -ne $content) {
                Set-Content -Path $file.FullName -Value $updatedContent -Encoding utf8
                Write-Host "  ✓ Updated existing Google Analytics code" -ForegroundColor Green
                "  Updated existing Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
                $successFiles += $file.Name
            } else {
                Write-Host "  ⚠️ Couldn't replace existing Google Analytics code - pattern not matched" -ForegroundColor Red
                "  Failed to replace existing Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
                $errorFiles += $file.Name
            }
        }
        else {
            Write-Host "  Adding new Google Analytics code" -ForegroundColor Cyan
            "  Adding new Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
            
            # In dry run mode, just report
            if ($DryRun) {
                Write-Host "  Would add Google Analytics code after <head> tag" -ForegroundColor Yellow
                $skippedFiles += $file.Name
                continue
            }
            
            # Create backup first
            if ($BackupFiles) {
                Copy-Item -Path $file.FullName -Destination "$($file.FullName).bak" -Force
            }
            
            # Add Google Analytics code after <head> tag
            $updatedContent = $content -replace "(<head>)", "`${1}`n$googleAnalyticsCode"
            
            # Only make changes if the content was actually modified
            if ($updatedContent -ne $content) {
                Set-Content -Path $file.FullName -Value $updatedContent -Encoding utf8
                Write-Host "  ✓ Added Google Analytics code" -ForegroundColor Green
                "  Added Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
                $successFiles += $file.Name
            } else {
                Write-Host "  ⚠️ Couldn't add Google Analytics code - <head> tag not found" -ForegroundColor Red
                "  Failed to add Google Analytics code" | Out-File -FilePath $logFile -Encoding utf8 -Append
                $errorFiles += $file.Name
            }
        }
    }
    catch {
        Write-Host "  ❌ Error processing file: $_" -ForegroundColor Red
        "  Error: $_" | Out-File -FilePath $logFile -Encoding utf8 -Append
        $errorFiles += $file.Name
    }
}

# Print summary
$summary = @"

==========================================
   Google Analytics Update Summary
==========================================
  Mode: $(if ($DryRun) {"DRY RUN - No files modified"} else {"ACTIVE - Files were updated"})

  ✅ Successfully updated: $(if ($DryRun) {"0 (dry run)"} else {"$($successFiles.Count)"}) files
  ⚠️ Would update (in dry run): $($skippedFiles.Count) files
  ✓ Already up to date: $($alreadyUpdatedFiles.Count) files
  ⚠️ Potentially corrupted HTML: $($corruptedFiles.Count) files
  ❌ Failed to update: $($errorFiles.Count) files
  
  Total HTML files processed: $($htmlFiles.Count)
  
  Log file created: $logFile
==========================================

To actually update files, edit this script and set:
$DryRun = $false at the top of the file

"@

Write-Host $summary -ForegroundColor Cyan

# Log summary
$summary | Out-File -FilePath $logFile -Encoding utf8 -Append

# Provide details on files
if ($successFiles.Count -gt 0 -and -not $DryRun) {
    "Files updated:" | Out-File -FilePath $logFile -Encoding utf8 -Append
    $successFiles | ForEach-Object { "  - $_" | Out-File -FilePath $logFile -Encoding utf8 -Append }
}

if ($skippedFiles.Count -gt 0 -and $DryRun) {
    "Files that would be updated:" | Out-File -FilePath $logFile -Encoding utf8 -Append
    $skippedFiles | ForEach-Object { "  - $_" | Out-File -FilePath $logFile -Encoding utf8 -Append }
}

if ($errorFiles.Count -gt 0) {
    Write-Host "`nFiles that failed:" -ForegroundColor Red
    $errorFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    
    "Files that failed:" | Out-File -FilePath $logFile -Encoding utf8 -Append
    $errorFiles | ForEach-Object { "  - $_" | Out-File -FilePath $logFile -Encoding utf8 -Append }
}

if ($corruptedFiles.Count -gt 0) {
    Write-Host "`nPotentially corrupted HTML files:" -ForegroundColor Yellow
    $corruptedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    
    "Potentially corrupted HTML files:" | Out-File -FilePath $logFile -Encoding utf8 -Append
    $corruptedFiles | ForEach-Object { "  - $_" | Out-File -FilePath $logFile -Encoding utf8 -Append }
}