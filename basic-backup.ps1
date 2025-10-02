# Basic Password Backup Runner
Write-Host "🔐 Password Backup System" -ForegroundColor Cyan

$OutputPath = ".\password-backup"

# Create directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "Step 1: Running password extractor..."
try {
    .\password-extractor.ps1 -OutputPath $OutputPath -IncludeBrowsers -IncludeWindows
    Write-Host "Password extraction completed."
} catch {
    Write-Host "Error in password extraction: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try manual browser export to $OutputPath folder"
}

$CSVPath = "$OutputPath\all-passwords.csv"
if (Test-Path $CSVPath) {
    Write-Host "Step 2: Creating booklet..."
    try {
        .\create-password-booklet.ps1 -InputCSV $CSVPath -OutputPath $OutputPath -GroupByCategory -IncludeIndex
        
        $HTMLPath = "$OutputPath\password-booklet.html"
        if (Test-Path $HTMLPath) {
            Write-Host "✅ Success! Opening booklet..." -ForegroundColor Green
            Start-Process $HTMLPath
            Write-Host "Print with Ctrl+P, then delete folder: Remove-Item '$OutputPath' -Recurse -Force"
        }
    } catch {
        Write-Host "Error creating booklet: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "No password data found. Export manually from browsers to $OutputPath"
}
}