# Photo Gallery Import Guide

**Created:** October 11, 2025  
**Purpose:** Import alumni chapter photos from Google Photos to website gallery

---

## 📸 Quick Start

### Step 1: Preview What Will Happen (Dry Run)

```powershell
cd "C:\Users\tcast\Downloads\cvcwvuaa\cvawvuaa.org"
.\scripts\import-photos-to-gallery.ps1 -DryRun
```

This shows you what will be processed **without actually copying files**.

### Step 2: Import Photos

```powershell
.\scripts\import-photos-to-gallery.ps1
```

This copies all photos from Google Photos folders to `assets/gallery/`.

### Step 3: Add to Gallery JSON (Automatic)

```powershell
.\scripts\import-photos-to-gallery.ps1 -AddToJson
```

This copies photos **AND** automatically adds entries to `content/gallery.json`.

---

## 📁 What It Does

### Source Structure:
```
Google Photos/
  ├── 2010 Opener-Coastal Carolina/
  │   ├── Coastal Carolina 002.jpg
  │   ├── Coastal Carolina 003.jpg
  │   └── ...
  ├── 2013 Game Watch Parties/
  ├── Fiesta Bowl/
  └── ...
```

### Destination Structure:
```
assets/gallery/
  ├── 2010/
  │   └── 2010-opener-coastal-carolina/
  │       ├── coastal-carolina-002.jpg
  │       ├── coastal-carolina-003.jpg
  │       └── ...
  ├── 2013/
  │   └── 2013-game-watch-parties/
  │       └── ...
  └── archive/
      └── (events without years)
```

### Gallery JSON Format:
Each photo becomes an entry in `content/gallery.json`:

```json
{
  "type": "image",
  "src": "/assets/gallery/2010/2010-opener-coastal-carolina/coastal-carolina-002.jpg",
  "caption": "Opener-Coastal Carolina",
  "credit": "CVCWVUAA Archive",
  "date": "2010-01-01",
  "tags": [],
  "alt": "Opener-Coastal Carolina photo 1"
}
```

---

## 🎯 What Gets Processed

### ✅ Included:
- `.jpg`, `.jpeg`, `.png`, `.gif` files
- All photos from all subdirectories in Google Photos folder
- Automatic year detection from folder names

### ❌ Excluded:
- `.json` metadata files from Google Photos
- Non-image files
- Hidden files

---

## 🔧 Advanced Options

### Import from Different Source Folder:
```powershell
.\scripts\import-photos-to-gallery.ps1 -SourceFolder "C:\Other\Photos"
```

### Import to Different Destination:
```powershell
.\scripts\import-photos-to-gallery.ps1 -DestinationFolder "C:\Website\images"
```

### Full Custom Import:
```powershell
.\scripts\import-photos-to-gallery.ps1 `
  -SourceFolder "C:\Photos" `
  -DestinationFolder "C:\Website\gallery" `
  -GalleryJsonPath "C:\Website\content\gallery.json" `
  -AddToJson
```

---

## 📊 Year Detection

The script automatically extracts years from folder names:

| Folder Name | Detected Year |
|-------------|---------------|
| `2010 Opener-Coastal Carolina` | 2010 |
| `2013 Game Watch Parties` | 2013 |
| `Photos from 2009` | 2009 |
| `Fiesta Bowl` | archive |
| `An Evening with Coach Bill Stewart` | archive |

Events without detectable years go into the `archive` folder.

---

## 🎨 Caption Generation

Captions are automatically cleaned from folder names:

| Folder Name | Generated Caption |
|-------------|-------------------|
| `2010 Opener-Coastal Carolina` | `Opener-Coastal Carolina` |
| `2013 Game Watch Parties` | `Game Watch Parties` |
| `_Summer Fest_ Family Picnic` | `Summer Fest Family Picnic` |
| `Photos from 2009` | `Alumni Events` |

---

## ✅ Testing After Import

### 1. View Gallery Locally

Open in browser:
```
file:///C:/Users/tcast/Downloads/cvcwvuaa/cvawvuaa.org/gallery/index.html
```

Or start local server:
```powershell
cd "C:\Users\tcast\Downloads\cvcwvuaa\cvawvuaa.org"
python -m http.server 8000
```
Then visit: http://localhost:8000/gallery/

### 2. Filter by Year

The gallery supports year filtering:
- `gallery/index.html` - All years
- `gallery/index.html?year=2010` - Only 2010 photos
- `gallery/index.html?year=2013` - Only 2013 photos

### 3. Verify JSON

Check that entries were added:
```powershell
Get-Content content/gallery.json | ConvertFrom-Json | Measure-Object
```

---

## 🚀 Deploying to Website

After importing and testing locally:

### 1. Add to Git
```powershell
git add assets/gallery/
git add content/gallery.json
```

### 2. Commit
```powershell
git commit -m "Add alumni chapter photos from Google Photos archive"
```

### 3. Push to Netlify
```powershell
git push origin main
```

Netlify will automatically deploy within 1-2 minutes.

### 4. View Live
Visit: https://cvawvuaa.org/gallery/

---

## 📝 Photo Statistics

Based on your Google Photos folder, you have approximately:

- **50+ event folders**
- Spanning years: **2005-2013+**
- Events include:
  - Game watch parties
  - Tailgates
  - Golf classics
  - Holiday parties
  - Community service events
  - Bowl game trips
  - Chalk talk events
  - And many more!

---

## 🔄 Re-Running the Import

If you need to re-import photos (e.g., after adding new ones):

### Option A: Skip Existing
The script will overwrite files with the same name.

### Option B: Clear Gallery First
```powershell
# Backup first!
Copy-Item content/gallery.json content/gallery-backup.json

# Clear assets/gallery folder
Remove-Item assets/gallery/* -Recurse -Force

# Re-import
.\scripts\import-photos-to-gallery.ps1 -AddToJson
```

---

## ❓ Troubleshooting

### "Access Denied" Errors
Run PowerShell as Administrator.

### "Cannot convert to JSON"
Check that gallery.json is valid JSON format.

### Photos Not Showing on Website
1. Check that paths in gallery.json match actual file locations
2. Verify images were copied to `assets/gallery/`
3. Clear browser cache and refresh
4. Check browser console for errors (F12)

### Too Many Photos (Performance)
The script processes all photos at once. For large collections:
1. Process one event folder at a time
2. Use `-SourceFolder` to point to specific subfolder
3. Consider image optimization (see next section)

---

## 🖼️ Optional: Image Optimization

If photos are very large (reduce file sizes for faster loading):

### Using ImageMagick (Windows):

Install: https://imagemagick.org/script/download.php

Then run:
```powershell
# Resize all JPGs to max 1920px wide, compress to 85% quality
Get-ChildItem assets/gallery -Recurse -Include *.jpg,*.jpeg | ForEach-Object {
    magick $_.FullName -resize "1920x1920>" -quality 85 $_.FullName
}
```

### Using PowerShell Built-in:

```powershell
# Basic optimization (requires .NET)
Add-Type -AssemblyName System.Drawing
# (More complex script available if needed)
```

---

## 📧 Questions?

Contact: cvcwvuaa@gmail.com

---

## 🎉 Success!

Once imported, your alumni chapter photos will be:
- ✅ Organized by year and event
- ✅ Browsable on the website
- ✅ Filterable by year
- ✅ Properly credited
- ✅ Preserved for future generations

**Let's Go Mountaineers!** 🏔️💙💛
