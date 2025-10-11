# Import Alumni Photos to Website Gallery
# This script processes photos from Google Photos folders and adds them to the website gallery

param(
    [string]$SourceFolder = "C:\Users\tcast\Downloads\cvcwvuaa\cvawvuaa.org\Google Photos",
    [string]$DestinationFolder = "C:\Users\tcast\Downloads\cvcwvuaa\cvawvuaa.org\assets\gallery",
    [string]$GalleryJsonPath = "C:\Users\tcast\Downloads\cvcwvuaa\cvawvuaa.org\content\gallery.json",
    [switch]$DryRun,
    [switch]$AddToJson
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CVCWVUAA Photo Gallery Importer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if source folder exists
if (-not (Test-Path $SourceFolder)) {
    Write-Host "❌ Error: Source folder not found: $SourceFolder" -ForegroundColor Red
    exit 1
}

# Create destination folder if it doesn't exist
if (-not (Test-Path $DestinationFolder)) {
    Write-Host "📁 Creating destination folder: $DestinationFolder" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $DestinationFolder -Force | Out-Null
}

# Get all subdirectories (event folders)
$eventFolders = Get-ChildItem -Path $SourceFolder -Directory | Where-Object { $_.Name -ne "user-generated-memory-titles.json" }

Write-Host "📂 Found $($eventFolders.Count) event folders to process" -ForegroundColor Green
Write-Host ""

$totalPhotos = 0
$processedPhotos = 0
$skippedFiles = 0
$newGalleryEntries = @()

# Function to extract year from folder name
function Get-YearFromFolderName {
    param([string]$FolderName)
    
    # Try to extract 4-digit year from folder name
    if ($FolderName -match '\b(20\d{2}|19\d{2})\b') {
        return $matches[1]
    }
    
    # Common event mappings to years
    $yearMappings = @{
        "2009" = 2009
        "2010" = 2010
        "2013" = 2013
        "Photos from 2005" = 2005
        "Photos from 2007" = 2007
        "Photos from 2008" = 2008
        "Photos from 2009" = 2009
        "Photos from 2010" = 2010
        "Photos from 2013" = 2013
    }
    
    foreach ($key in $yearMappings.Keys) {
        if ($FolderName -like "*$key*") {
            return $yearMappings[$key]
        }
    }
    
    # Default to "archive" if no year found
    return "archive"
}

# Function to create safe filename
function Get-SafeFileName {
    param([string]$FileName)
    
    $safe = $FileName -replace '[^\w\-\.]', '-'
    $safe = $safe -replace '-+', '-'
    $safe = $safe.ToLower()
    return $safe
}

# Function to create caption from folder name
function Get-CaptionFromFolder {
    param([string]$FolderName)
    
    # Remove year prefix if present
    $caption = $FolderName -replace '^\d{4}\s*', ''
    
    # Remove "Photos from" prefix
    $caption = $caption -replace '^Photos from \d{4}', 'Alumni Events'
    
    # Replace underscores with spaces
    $caption = $caption -replace '_', ' '
    
    # Clean up
    $caption = $caption.Trim()
    
    return $caption
}

Write-Host "🔄 Processing event folders..." -ForegroundColor Cyan
Write-Host ""

foreach ($eventFolder in $eventFolders) {
    $eventName = $eventFolder.Name
    $year = Get-YearFromFolderName $eventName
    $caption = Get-CaptionFromFolder $eventName
    
    Write-Host "📁 Processing: $eventName" -ForegroundColor Yellow
    Write-Host "   Year: $year" -ForegroundColor Gray
    Write-Host "   Caption: $caption" -ForegroundColor Gray
    
    # Get all image files (skip metadata files)
    $imageFiles = Get-ChildItem -Path $eventFolder.FullName -File | 
                  Where-Object { 
                      $_.Extension -match '\.(jpg|jpeg|png|gif|bmp)$' -and 
                      $_.Name -notmatch '\.json$' 
                  }
    
    $totalPhotos += $imageFiles.Count
    Write-Host "   Found: $($imageFiles.Count) photos" -ForegroundColor Gray
    
    if ($imageFiles.Count -eq 0) {
        Write-Host "   ⚠️  No photos found in this folder" -ForegroundColor DarkYellow
        continue
    }
    
    # Create destination folder structure
    $destYear = if ($year -eq "archive") { "archive" } else { $year }
    $destEventFolder = Get-SafeFileName $eventName
    $destPath = Join-Path $DestinationFolder "$destYear\$destEventFolder"
    
    if (-not $DryRun) {
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        }
    }
    
    Write-Host "   Destination: $destPath" -ForegroundColor Gray
    
    # Process each image
    $photoCount = 0
    foreach ($imageFile in $imageFiles) {
        $photoCount++
        $safeName = Get-SafeFileName $imageFile.Name
        $destFile = Join-Path $destPath $safeName
        
        # Copy file if not in dry run mode
        if (-not $DryRun) {
            try {
                Copy-Item -Path $imageFile.FullName -Destination $destFile -Force
                $processedPhotos++
            } catch {
                Write-Host "   ❌ Error copying $($imageFile.Name): $_" -ForegroundColor Red
                $skippedFiles++
                continue
            }
        } else {
            $processedPhotos++
        }
        
        # Create gallery JSON entry
        $relativePath = "/assets/gallery/$destYear/$destEventFolder/$safeName"
        
        $galleryEntry = [PSCustomObject]@{
            type = "image"
            src = $relativePath
            caption = $caption
            credit = "CVCWVUAA Archive"
            date = "$year-01-01"
            tags = @()
            alt = "$caption photo $photoCount"
        }
        
        $newGalleryEntries += $galleryEntry
    }
    
    Write-Host "   ✅ Processed $photoCount photos" -ForegroundColor Green
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total photos found: $totalPhotos" -ForegroundColor White
Write-Host "Photos processed: $processedPhotos" -ForegroundColor Green
Write-Host "Files skipped: $skippedFiles" -ForegroundColor Yellow
Write-Host "New gallery entries: $($newGalleryEntries.Count)" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No files were actually copied" -ForegroundColor Yellow
    Write-Host "   Run without -DryRun to perform the actual import" -ForegroundColor Yellow
    Write-Host ""
}

# Add to gallery.json if requested
if ($AddToJson -and -not $DryRun) {
    Write-Host "📝 Adding entries to gallery.json..." -ForegroundColor Cyan
    
    if (Test-Path $GalleryJsonPath) {
        try {
            # Load existing gallery.json
            $existingJson = Get-Content $GalleryJsonPath -Raw | ConvertFrom-Json
            
            # Convert to array if not already
            if ($existingJson -isnot [array]) {
                $existingJson = @($existingJson)
            }
            
            # Add new entries
            $combinedEntries = $existingJson + $newGalleryEntries
            
            # Save back to file
            $combinedEntries | ConvertTo-Json -Depth 10 | Set-Content $GalleryJsonPath -Encoding UTF8
            
            Write-Host "✅ Successfully added $($newGalleryEntries.Count) entries to gallery.json" -ForegroundColor Green
            Write-Host "   Total entries now: $($combinedEntries.Count)" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Error updating gallery.json: $_" -ForegroundColor Red
            Write-Host "   Entries were saved to a backup file instead" -ForegroundColor Yellow
            
            # Save to backup file
            $backupPath = Join-Path (Split-Path $GalleryJsonPath) "gallery-new-entries.json"
            $newGalleryEntries | ConvertTo-Json -Depth 10 | Set-Content $backupPath -Encoding UTF8
            Write-Host "   Backup saved to: $backupPath" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  gallery.json not found, creating new file" -ForegroundColor Yellow
        $newGalleryEntries | ConvertTo-Json -Depth 10 | Set-Content $GalleryJsonPath -Encoding UTF8
        Write-Host "✅ Created new gallery.json with $($newGalleryEntries.Count) entries" -ForegroundColor Green
    }
} elseif ($AddToJson -and $DryRun) {
    Write-Host "ℹ️  Would add $($newGalleryEntries.Count) entries to gallery.json (skipped in dry run)" -ForegroundColor Cyan
    
    # Save preview to temp file
    $previewPath = Join-Path $env:TEMP "gallery-preview.json"
    $newGalleryEntries | ConvertTo-Json -Depth 10 | Set-Content $previewPath -Encoding UTF8
    Write-Host "   Preview saved to: $previewPath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
Write-Host ""

# Show next steps
if ($DryRun) {
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Review the dry run results above" -ForegroundColor White
    Write-Host "   2. Run again without -DryRun to copy files:" -ForegroundColor White
    Write-Host "      .\scripts\import-photos-to-gallery.ps1" -ForegroundColor Yellow
    Write-Host "   3. Add -AddToJson to update gallery.json automatically:" -ForegroundColor White
    Write-Host "      .\scripts\import-photos-to-gallery.ps1 -AddToJson" -ForegroundColor Yellow
} else {
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    if (-not $AddToJson) {
        Write-Host "   1. Run with -AddToJson to add entries to gallery.json:" -ForegroundColor White
        Write-Host "      .\scripts\import-photos-to-gallery.ps1 -AddToJson" -ForegroundColor Yellow
    }
    Write-Host "   2. Test the gallery at: https://cvawvuaa.org/gallery/" -ForegroundColor White
    Write-Host "   3. Deploy to Netlify (git add, commit, push)" -ForegroundColor White
}
Write-Host ""
