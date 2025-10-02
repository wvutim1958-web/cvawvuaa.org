# 🚀 Netlify Deployment Package Creator
# Run this script to create a deployment-ready folder

# Create deployment directory
$deployPath = "C:\Users\$env:USERNAME\Desktop\castnlines-netlify-deploy"
New-Item -ItemType Directory -Path $deployPath -Force

Write-Host "Creating Netlify deployment package..." -ForegroundColor Green

# Copy the ultimate site as index.html
if (Test-Path "ultimate-index.html") {
    Copy-Item "ultimate-index.html" "$deployPath\index.html"
    Write-Host "✅ Copied ultimate-index.html as index.html" -ForegroundColor Green
} else {
    Write-Host "❌ ultimate-index.html not found!" -ForegroundColor Red
}

# Copy _redirects file
if (Test-Path "_redirects") {
    Copy-Item "_redirects" "$deployPath\_redirects"
    Write-Host "✅ Copied _redirects file" -ForegroundColor Green
} else {
    Write-Host "❌ _redirects file not found!" -ForegroundColor Red
}

# Copy assets folder
if (Test-Path "assets") {
    Copy-Item "assets" "$deployPath\assets" -Recurse
    Write-Host "✅ Copied assets folder with logo and favicon" -ForegroundColor Green
} else {
    Write-Host "❌ assets folder not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎣 NETLIFY DEPLOYMENT READY!" -ForegroundColor Cyan
Write-Host "📁 Deployment folder created at: $deployPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Go to https://app.netlify.com" -ForegroundColor Gray
Write-Host "2. Drag the folder '$deployPath' to Netlify" -ForegroundColor Gray
Write-Host "3. Configure your custom domain: castnlines.com" -ForegroundColor Gray
Write-Host "4. Enable HTTPS in Netlify settings" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Your comprehensive fishing line site will be live!" -ForegroundColor Green

# Open the deployment folder
Start-Process explorer.exe $deployPath