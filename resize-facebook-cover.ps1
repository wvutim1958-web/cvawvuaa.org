# Resize image for Facebook cover photo
# Facebook cover photo dimensions: 820 x 312 pixels

# Check if the image exists
$inputPath = "C:\Users\tcast\Downloads\header.jpg"
$outputPath = "C:\Users\tcast\Downloads\facebook-cover-cvcwvuaa.jpg"

if (!(Test-Path $inputPath)) {
    Write-Host "Error: Image not found at $inputPath" -ForegroundColor Red
    exit
}

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

try {
    # Load the original image
    $originalImage = [System.Drawing.Image]::FromFile($inputPath)
    
    Write-Host "Original image size: $($originalImage.Width) x $($originalImage.Height)" -ForegroundColor Yellow
    
    # Facebook cover photo dimensions
    $targetWidth = 820
    $targetHeight = 312
    
    # Create new bitmap with target dimensions
    $resizedImage = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    
    # Create graphics object for drawing
    $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Calculate how to fit the entire image (no cropping)
    $originalRatio = $originalImage.Width / $originalImage.Height
    $targetRatio = $targetWidth / $targetHeight
    
    if ($originalRatio -gt $targetRatio) {
        # Original is wider - fit by width, add padding top/bottom
        $newWidth = $targetWidth
        $newHeight = [int]($targetWidth / $originalRatio)
        $x = 0
        $y = [int](($targetHeight - $newHeight) / 2)
    } else {
        # Original is taller - fit by height, add padding left/right  
        $newHeight = $targetHeight
        $newWidth = [int]($targetHeight * $originalRatio)
        $x = [int](($targetWidth - $newWidth) / 2)
        $y = 0
    }
    
    # Fill background with white
    $graphics.Clear([System.Drawing.Color]::White)
    
    # Draw the resized image (entire image will be visible)
    $graphics.DrawImage($originalImage, $x, $y, $newWidth, $newHeight)
    
    # Save the resized image
    $resizedImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    Write-Host "✅ Facebook cover photo created successfully!" -ForegroundColor Green
    Write-Host "📁 Saved as: $outputPath" -ForegroundColor Cyan
    Write-Host "📏 New size: $targetWidth x $targetHeight pixels" -ForegroundColor Cyan
    Write-Host "🌐 Ready to upload to Facebook!" -ForegroundColor Green
    
    # Clean up
    $graphics.Dispose()
    $resizedImage.Dispose()
    $originalImage.Dispose()
    
} catch {
    Write-Host "❌ Error processing image: $($_.Exception.Message)" -ForegroundColor Red
}

# Open the folder containing the new image
Start-Process "explorer.exe" -ArgumentList "/select,`"$outputPath`""