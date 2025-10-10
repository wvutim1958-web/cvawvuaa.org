# Download Node.js installer
$nodeUrl = "https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi"
$installerPath = "$env:TEMP\node-installer.msi"

Write-Host "Downloading Node.js installer..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

# Install Node.js
Write-Host "Installing Node.js..." -ForegroundColor Yellow
Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait

# Remove installer
Remove-Item $installerPath

# Verify installation
Write-Host "Verifying Node.js installation..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Test Node.js and npm
node --version
npm --version

Write-Host "Node.js installation complete!" -ForegroundColor Green
Write-Host "Please restart your terminal and run start-rankings.ps1" -ForegroundColor Yellow