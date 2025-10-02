Write-Host "🔐 Starting Password Backup..." -ForegroundColor Cyan

$OutputDir = ".\password-backup" 

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "Extracting passwords..."
& .\password-extractor.ps1 -OutputPath $OutputDir -IncludeBrowsers -IncludeWindows

$CSVFile = Join-Path $OutputDir "all-passwords.csv"

if (Test-Path $CSVFile) {
    Write-Host "Creating booklet..."
    & .\create-password-booklet.ps1 -InputCSV $CSVFile -OutputPath $OutputDir -GroupByCategory -IncludeIndex
    
    $HTMLFile = Join-Path $OutputDir "password-booklet.html"
    if (Test-Path $HTMLFile) {
        Write-Host "✅ Success! Opening booklet..." -ForegroundColor Green
        Start-Process $HTMLFile
        Write-Host "Use Ctrl+P to print, then delete: Remove-Item '$OutputDir' -Recurse -Force"
    }
} else {
    Write-Host "❌ No passwords found. Try manual browser export to: $OutputDir"
}

Write-Host "Done!"