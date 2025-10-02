# HTML Password Booklet Generator
# Converts CSV password data into a professional, printable HTML document

param(
    [string]$InputCSV = ".\password-backup\all-passwords.csv",
    [string]$OutputPath = ".\password-backup",
    [string]$Title = "Personal Password Reference",
    [switch]$GroupByCategory,
    [switch]$IncludeIndex
)

Write-Host "Creating Password Booklet" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if input file exists
if (!(Test-Path $InputCSV)) {
    Write-Host "Error: Input file not found: $InputCSV" -ForegroundColor Red
    Write-Host "Run extract-passwords.ps1 first to generate the CSV file" -ForegroundColor Yellow
    exit 1
}

# Import password data
try {
    $Passwords = Import-Csv $InputCSV
    Write-Host "Loaded $($Passwords.Count) password entries" -ForegroundColor Green
} catch {
    Write-Host "Error reading CSV file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create HTML content
$CurrentDate = Get-Date -Format "MMMM dd, yyyy 'at' h:mm tt"

$HTMLContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$Title</title>
    <style>
        @page {
            margin: 0.5in;
            size: letter;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
        }
        
        .no-print {
            display: none !important;
        }
        
        @media screen {
            body {
                padding: 20px;
                background: #f5f5f5;
            }
            
            .no-print {
                display: block !important;
            }
            
            .container {
                max-width: 8.5in;
                margin: 0 auto;
                background: white;
                padding: 0.5in;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
        }
        
        @media print {
            .container {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
            }
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
            font-size: 24pt;
            font-weight: bold;
        }
        
        .header .subtitle {
            font-size: 12pt;
            color: #666;
            margin: 0;
        }
        
        .header .date {
            font-size: 10pt;
            color: #999;
            margin-top: 10px;
        }
        
        .security-warning {
            background: #fff3cd;
            border: 2px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            page-break-inside: avoid;
        }
        
        .security-warning h3 {
            color: #856404;
            margin: 0 0 10px 0;
            font-size: 14pt;
        }
        
        .security-warning ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .security-warning li {
            margin: 5px 0;
            font-size: 10pt;
        }
        
        .category-section {
            page-break-before: always;
            margin: 30px 0;
        }
        
        .category-section:first-of-type {
            page-break-before: auto;
        }
        
        .category-header {
            background: #e9ecef;
            padding: 15px;
            margin: 0 0 20px 0;
            border-left: 5px solid #6c757d;
        }
        
        .category-header h2 {
            margin: 0;
            font-size: 18pt;
            color: #495057;
        }
        
        .category-count {
            font-size: 12pt;
            color: #6c757d;
            font-weight: normal;
        }
        
        .password-entry {
            border: 1px solid #ddd;
            margin: 0 0 15px 0;
            page-break-inside: avoid;
            background: white;
        }
        
        .entry-header {
            background: #f8f9fa;
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            font-size: 12pt;
        }
        
        .entry-content {
            padding: 15px;
        }
        
        .entry-row {
            display: flex;
            margin: 8px 0;
            align-items: flex-start;
        }
        
        .entry-label {
            font-weight: bold;
            min-width: 80px;
            color: #495057;
            font-size: 10pt;
        }
        
        .entry-value {
            flex: 1;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            padding-left: 10px;
        }
        
        .password-value {
            background: #f1f3f4;
            padding: 4px 8px;
            border-radius: 3px;
            border: 1px solid #dadce0;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #333;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14pt;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #0056b3;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Print Booklet</button>
    
    <div class="container">
        <div class="header">
            <h1>$Title</h1>
            <p class="subtitle">Personal Password Reference</p>
            <p class="date">Generated on: $CurrentDate</p>
        </div>
        
        <div class="security-warning no-break">
            <h3>SECURITY NOTICE - PLEASE READ</h3>
            <ul>
                <li><strong>Keep this document secure</strong> - Store in a locked drawer, safe, or secure location</li>
                <li><strong>Limit access</strong> - Only trusted family members should have access</li>
                <li><strong>Update regularly</strong> - Mark changed passwords and update periodically</li>
                <li><strong>Destroy old copies</strong> - Shred outdated versions when creating new ones</li>
                <li><strong>Emergency access only</strong> - This is a backup when digital access isn't available</li>
            </ul>
        </div>
"@

# Group passwords by category if requested
if ($GroupByCategory) {
    $Categories = $Passwords | Group-Object Category | Sort-Object Name
    
    foreach ($Category in $Categories) {
        $HTMLContent += @"
        
        <div class="category-section">
            <div class="category-header no-break">
                <h2>$($Category.Name) <span class="category-count">($($Category.Count) entries)</span></h2>
            </div>
"@
        
        $SortedPasswords = $Category.Group | Sort-Object Website, Username
        
        foreach ($Password in $SortedPasswords) {
            $WebsiteName = $Password.Website
            if ($WebsiteName.Length -gt 50) {
                $WebsiteName = $WebsiteName.Substring(0, 47) + "..."
            }
            
            $HTMLContent += @"
            <div class="password-entry no-break">
                <div class="entry-header">$WebsiteName</div>
                <div class="entry-content">
                    <div class="entry-row">
                        <div class="entry-label">Website:</div>
                        <div class="entry-value">$($Password.Website)</div>
                    </div>
                    <div class="entry-row">
                        <div class="entry-label">Username:</div>
                        <div class="entry-value">$($Password.Username)</div>
                    </div>
                    <div class="entry-row">
                        <div class="entry-label">Password:</div>
                        <div class="entry-value password-value">$($Password.Password)</div>
                    </div>
                    <div class="entry-row">
                        <div class="entry-label">Source:</div>
                        <div class="entry-value">$($Password.Source)</div>
                    </div>
                </div>
            </div>
"@
        }
        
        $HTMLContent += "        </div>`n"
    }
} else {
    # Simple alphabetical listing
    $HTMLContent += @"
        
        <div class="category-section">
            <div class="category-header no-break">
                <h2>All Passwords <span class="category-count">($($Passwords.Count) entries)</span></h2>
            </div>
"@
    
    $SortedPasswords = $Passwords | Sort-Object Website, Username
    
    foreach ($Password in $SortedPasswords) {
        $WebsiteName = $Password.Website
        if ($WebsiteName.Length -gt 50) {
            $WebsiteName = $WebsiteName.Substring(0, 47) + "..."
        }
        
        $HTMLContent += @"
            <div class="password-entry no-break">
                <div class="entry-header">$WebsiteName</div>
                <div class="entry-content">
                    <div class="entry-row">
                        <div class="entry-label">Website:</div>
                        <div class="entry-value">$($Password.Website)</div>
                    </div>
                    <div class="entry-row">
                        <div class="entry-label">Username:</div>
                        <div class="entry-value">$($Password.Username)</div>
                    </div>
                    <div class="entry-row">
                        <div class="entry-label">Password:</div>
                        <div class="entry-value password-value">$($Password.Password)</div>
                    </div>
                    <div class="entry-row">
                        <div class="entry-label">Category:</div>
                        <div class="entry-value">$($Password.Category)</div>
                    </div>
                </div>
            </div>
"@
    }
    
    $HTMLContent += "        </div>`n"
}

# Add footer
$HTMLContent += @"
        
        <div class="footer">
            <p><strong>Personal Password Reference Booklet</strong></p>
            <p>Generated on $CurrentDate - Total Entries: $($Passwords.Count)</p>
            <p style="margin-top: 15px; font-size: 8pt; color: #999;">
                Keep this document secure - Update regularly - Consider using a password manager for enhanced security
            </p>
        </div>
        
    </div>
</body>
</html>
"@

# Save HTML file
$HTMLPath = Join-Path $OutputPath "password-booklet.html"
try {
    $HTMLContent | Out-File -FilePath $HTMLPath -Encoding UTF8
    Write-Host "HTML booklet created: $HTMLPath" -ForegroundColor Green
} catch {
    Write-Host "Error creating HTML file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Password Booklet Created Successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Location: $HTMLPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the HTML file in a web browser" -ForegroundColor White
Write-Host "2. Use Ctrl+P or click 'Print Booklet' to print" -ForegroundColor White
Write-Host "3. Store the printed booklet securely" -ForegroundColor White
Write-Host "4. Delete digital files when done" -ForegroundColor White
Write-Host ""
Write-Host "SECURITY REMINDER: Keep your printed booklet in a secure location!" -ForegroundColor Red