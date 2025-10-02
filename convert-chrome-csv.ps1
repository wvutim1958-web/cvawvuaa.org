# Google Chrome CSV to Printable Booklet Converter
# Converts Chrome's exported password CSV into a beautiful, organized, printable booklet

param(
    [string]$InputCSV,
    [string]$OutputPath = ".\password-backup",
    [string]$Title = "Personal Password Reference - Chrome Export"
)

Write-Host "Google Chrome Password Booklet Creator" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Auto-detect Chrome CSV file if not specified
if (!$InputCSV) {
    # Look for common Chrome export names
    $PossibleFiles = @(
        ".\password-backup\Chrome Passwords.csv",
        ".\password-backup\passwords.csv", 
        ".\password-backup\chrome-passwords.csv",
        "$env:USERPROFILE\Downloads\Chrome Passwords.csv",
        "$env:USERPROFILE\Downloads\passwords.csv"
    )
    
    foreach ($File in $PossibleFiles) {
        if (Test-Path $File) {
            $InputCSV = $File
            Write-Host "Found Chrome CSV file: $File" -ForegroundColor Green
            break
        }
    }
    
    if (!$InputCSV) {
        Write-Host "No Chrome CSV file found. Please specify the path:" -ForegroundColor Red
        Write-Host "Usage: .\convert-chrome-csv.ps1 -InputCSV 'path\to\your\chrome-passwords.csv'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Or copy your Chrome CSV file to one of these locations:" -ForegroundColor Yellow
        $PossibleFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
        exit 1
    }
}

# Check if input file exists
if (!(Test-Path $InputCSV)) {
    Write-Host "Error: File not found: $InputCSV" -ForegroundColor Red
    exit 1
}

# Create output directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Read and process Chrome CSV
Write-Host "Reading Chrome password export..." -ForegroundColor Yellow
try {
    $ChromeData = Import-Csv $InputCSV
    Write-Host "Successfully loaded $($ChromeData.Count) password entries!" -ForegroundColor Green
} catch {
    Write-Host "Error reading CSV file: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure this is a proper Chrome password export CSV file." -ForegroundColor Yellow
    exit 1
}

# Convert to our standard format
Write-Host "Converting to standard format..." -ForegroundColor Yellow
$ConvertedPasswords = @()

foreach ($Entry in $ChromeData) {
    # Chrome CSV typically has: name, url, username, password
    $Website = $Entry.url
    if (!$Website) { $Website = $Entry.name }
    
    # Clean up the URL for display
    $CleanWebsite = $Website -replace "^https?://", "" -replace "^www\.", ""
    if ($CleanWebsite.Length -gt 50) {
        $DisplayName = $CleanWebsite.Substring(0, 47) + "..."
    } else {
        $DisplayName = $CleanWebsite
    }
    
    $ConvertedPasswords += [PSCustomObject]@{
        Source = "Chrome Export"
        Website = $Website
        DisplayName = $DisplayName
        Username = $Entry.username
        Password = $Entry.password
        Category = "Browser"
        LastModified = (Get-Date).ToString()
    }
}

# Save converted data
$StandardCSV = Join-Path $OutputPath "all-passwords.csv"
$ConvertedPasswords | Export-Csv -Path $StandardCSV -NoTypeInformation -Encoding UTF8
Write-Host "Converted data saved to: $StandardCSV" -ForegroundColor Green

# Generate statistics
Write-Host ""
Write-Host "Password Statistics:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Total passwords: $($ConvertedPasswords.Count)" -ForegroundColor Green

# Group by domain for statistics
$DomainStats = $ConvertedPasswords | Group-Object { 
    $domain = ($_.Website -replace "^https?://", "" -replace "^www\.", "" -split "/")[0]
    $domain
} | Sort-Object Count -Descending | Select-Object -First 10

Write-Host ""
Write-Host "Top 10 sites by password count:" -ForegroundColor Yellow
foreach ($Stat in $DomainStats) {
    Write-Host "  $($Stat.Name): $($Stat.Count) passwords" -ForegroundColor White
}

# Create the HTML booklet
Write-Host ""
Write-Host "Creating printable booklet..." -ForegroundColor Yellow

$CurrentDate = Get-Date -Format "MMMM dd, yyyy 'at' h:mm tt"
$TotalPasswords = $ConvertedPasswords.Count

$HTMLContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$Title</title>
    <style>
        @page { margin: 0.5in; size: letter; }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
        }
        
        @media screen {
            body { padding: 20px; background: #f5f5f5; }
            .container {
                max-width: 8.5in;
                margin: 0 auto;
                background: white;
                padding: 0.5in;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .no-print { display: block !important; }
        }
        
        @media print {
            .container { width: 100%; margin: 0; padding: 0; box-shadow: none; }
            .no-print { display: none !important; }
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
            page-break-after: avoid;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 22pt;
            font-weight: bold;
            color: #333;
        }
        
        .stats-box {
            background: #e8f4fd;
            border: 2px solid #1976d2;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
        }
        
        .security-warning {
            background: #fff3cd;
            border: 2px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            page-break-inside: avoid;
        }
        
        .password-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        @media print {
            .password-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
        }
        
        .password-entry {
            border: 1px solid #ddd;
            padding: 10px;
            page-break-inside: avoid;
            background: white;
            border-radius: 3px;
        }
        
        .entry-website {
            font-weight: bold;
            font-size: 11pt;
            color: #1976d2;
            margin-bottom: 5px;
            word-break: break-all;
        }
        
        .entry-details {
            font-size: 9pt;
            margin: 3px 0;
        }
        
        .entry-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 60px;
        }
        
        .entry-value {
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        
        .password-value {
            background: #f1f3f4;
            padding: 2px 4px;
            border-radius: 2px;
            border: 1px solid #dadce0;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1976d2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14pt;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .print-button:hover { background: #1565c0; }
        
        .alphabet-section {
            margin: 20px 0;
            page-break-before: always;
        }
        
        .alphabet-section:first-child { page-break-before: auto; }
        
        .alphabet-header {
            background: #f5f5f5;
            padding: 10px 15px;
            margin: 0 0 15px 0;
            border-left: 4px solid #1976d2;
            font-size: 16pt;
            font-weight: bold;
            color: #333;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #333;
            text-align: center;
            font-size: 8pt;
            color: #666;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print Booklet</button>
    
    <div class="container">
        <div class="header">
            <h1>$Title</h1>
            <p>Complete Password Reference</p>
            <p style="font-size: 10pt; color: #666;">Generated on: $CurrentDate</p>
        </div>
        
        <div class="stats-box">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">📊 Your Password Collection</h3>
            <p style="font-size: 14pt; margin: 0;"><strong>$TotalPasswords</strong> passwords organized alphabetically</p>
        </div>
        
        <div class="security-warning">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🔒 SECURITY NOTICE</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 9pt;">
                <li><strong>Keep this document secure</strong> - Store in a safe or locked location</li>
                <li><strong>Limit access</strong> - Only trusted individuals should see this</li>
                <li><strong>Update regularly</strong> - Passwords change frequently</li>
                <li><strong>Destroy old copies</strong> - Shred outdated versions securely</li>
            </ul>
        </div>
"@

# Group passwords alphabetically
$AlphabetGroups = $ConvertedPasswords | Sort-Object DisplayName | Group-Object { 
    $char = $_.DisplayName.Substring(0,1).ToUpper()
    if ($char -match '[A-Z]') { $char } else { '#' }
}

foreach ($Group in $AlphabetGroups) {
    $Letter = $Group.Name
    $HTMLContent += @"
        
        <div class="alphabet-section">
            <div class="alphabet-header">$Letter ($($Group.Count) entries)</div>
            <div class="password-grid">
"@
    
    foreach ($Password in $Group.Group) {
        $HTMLContent += @"
                <div class="password-entry">
                    <div class="entry-website">$($Password.DisplayName)</div>
                    <div class="entry-details">
                        <span class="entry-label">Site:</span> 
                        <span class="entry-value" style="font-size: 8pt;">$($Password.Website)</span>
                    </div>
                    <div class="entry-details">
                        <span class="entry-label">User:</span> 
                        <span class="entry-value">$($Password.Username)</span>
                    </div>
                    <div class="entry-details">
                        <span class="entry-label">Pass:</span> 
                        <span class="entry-value password-value">$($Password.Password)</span>
                    </div>
                </div>
"@
    }
    
    $HTMLContent += @"
            </div>
        </div>
"@
}

$HTMLContent += @"
        
        <div class="footer">
            <p><strong>Personal Password Reference</strong></p>
            <p>$TotalPasswords total entries • Generated $CurrentDate</p>
            <p style="margin-top: 10px; color: #999;">Keep secure • Update regularly • Emergency use only</p>
        </div>
    </div>
</body>
</html>
"@

# Save HTML file
$HTMLPath = Join-Path $OutputPath "chrome-password-booklet.html"
$HTMLContent | Out-File -FilePath $HTMLPath -Encoding UTF8

Write-Host ""
Write-Host "✅ SUCCESS! Your password booklet is ready!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "📊 Processed: $($ConvertedPasswords.Count) passwords" -ForegroundColor Cyan
Write-Host "📁 Data file: $StandardCSV" -ForegroundColor Cyan  
Write-Host "📄 Booklet: $HTMLPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "🖨️ Next steps:" -ForegroundColor Yellow
Write-Host "1. Opening booklet in browser..." -ForegroundColor White
Write-Host "2. Click 'Print Booklet' or press Ctrl+P" -ForegroundColor White
Write-Host "3. Print on standard 8.5x11 paper" -ForegroundColor White
Write-Host "4. Store securely when done" -ForegroundColor White

# Open the booklet
try {
    Start-Process $HTMLPath
    Write-Host ""
    Write-Host "🌐 Booklet opened in your default browser!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "⚠️ Please manually open: $HTMLPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "REMEMBER: Keep your printed booklet secure!" -ForegroundColor Red