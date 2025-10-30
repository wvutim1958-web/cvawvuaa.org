# Check if Node.js is installed
$nodeVersion = node --version
if (-not $?) {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
$npmVersion = npm --version
if (-not $?) {
    Write-Host "npm is not installed. Please install Node.js which includes npm" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing required packages..." -ForegroundColor Yellow
npm install

# Start the ranking updater
Write-Host "Starting the ranking updater..." -ForegroundColor Green
npm start

# Open the rankings page in default browser
Start-Process "http://localhost:3000/cfb-rankings.html"