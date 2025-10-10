# Image Optimization Guide

**Created:** October 10, 2025  
**Purpose:** Document image optimization opportunities and recommendations

---

## Large Images Identified

### Priority 1: Watch Party Graphics (Over 1MB Each)
- `wvu-watch-party.png` - 1,904 KB
- `wvu-watch-party-large.png` - 1,476 KB  
- `watch-party-oct-18.png` - 1,418 KB

**Recommendation:** These PNG files are significantly oversized. 
- Convert to WebP format (50-80% size reduction)
- Or optimize PNGs with tools like TinyPNG/OptiPNG
- Target size: <300KB each

### Priority 2: Photo Graphics (250KB - 400KB)
- `mtnr-deals.jpg` - 1,268 KB
- Multiple event photos in `assets/gallery/` and `assets/photos/` folders
- `extra2.jpg` - 256 KB

**Recommendation:** 
- Resize to max 1200px width (sufficient for web display)
- Compress JPEGs to 80-85% quality
- Convert to WebP where supported
- Target size: <150KB each for photos

---

## Optimization Methods

### Option 1: Online Tools (Easiest)
- **TinyPNG** (https://tinypng.com/) - Drag & drop PNG/JPEG compression
- **Squoosh** (https://squoosh.app/) - Google's image compression tool with WebP support
- **Compressor.io** - Online image compressor

### Option 2: PowerShell Scripts
Use ImageMagick or similar tools to batch process:

```powershell
# Resize and compress JPEGs
Get-ChildItem -Path "assets" -Filter *.jpg -Recurse | ForEach-Object {
    magick convert $_.FullName -resize "1200x1200>" -quality 85 $_.FullName
}

# Convert PNGs to WebP
Get-ChildItem -Path "assets" -Filter *.png | ForEach-Object {
    $webpName = $_.FullName -replace '\.png$', '.webp'
    magick convert $_.FullName -quality 85 $webpName
}
```

### Option 3: Manual Compression
1. Open image in photo editor (GIMP, Photoshop, Paint.NET)
2. Resize to reasonable dimensions (1200px max width for hero images)
3. Export with compression:
   - JPEG: 80-85% quality
   - PNG: Use 8-bit color where possible
   - WebP: 80-85% quality

---

## Implementation Strategy

### Phase 1: Critical Images (Do First)
✅ Watch party graphics - used on homepage
✅ `chapter-logo.jpg` - used in social meta tags
✅ `cvc-chapter-group-photo.jpg` - used in about page meta tags

### Phase 2: Gallery Images
- Event photos in `assets/gallery/`
- Alumni photos in `assets/photos/`
- Apply lazy loading: `<img loading="lazy" ...>`

### Phase 3: Background Images
- Hero images like `wvu-stadium.jpg`, `wvu-band.jpg`
- Can be more aggressive with compression (70-75%)

---

## Lazy Loading Implementation

Add `loading="lazy"` attribute to images below the fold:

```html
<!-- Before -->
<img src="/assets/photo.jpg" alt="Description">

<!-- After -->
<img src="/assets/photo.jpg" alt="Description" loading="lazy">
```

### Pages to Update:
- [ ] alumni-spotlight.html (spotlight photos)
- [ ] events.html (event images)
- [ ] about.html (group photos)
- [ ] media.html (all gallery images)

---

## Next-Gen Formats (WebP)

Use `<picture>` element for WebP with fallbacks:

```html
<picture>
  <source srcset="/assets/image.webp" type="image/webp">
  <source srcset="/assets/image.jpg" type="image/jpeg">
  <img src="/assets/image.jpg" alt="Description" loading="lazy">
</picture>
```

---

## Expected Results

**Current Total Size:** ~6-8MB for images folder  
**Target Size:** 2-3MB (60-70% reduction)  
**Benefits:**
- Faster page load times
- Better mobile experience
- Improved SEO/Core Web Vitals
- Lower bandwidth costs

---

## Quick Win Checklist

- [x] Identified largest images
- [ ] Compress watch party graphics (Priority 1)
- [ ] Resize and compress photos over 200KB
- [ ] Add lazy loading to gallery images
- [ ] Convert hero images to WebP with fallbacks
- [ ] Test page load times with Google PageSpeed Insights

---

**Tool Resources:**
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/
- ImageMagick: https://imagemagick.org/
- Google PageSpeed Insights: https://pagespeed.web.dev/
