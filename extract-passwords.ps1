# Password Extraction Script
# Safely extracts saved passwords from browsers and Windows for backup purposes
# SECURITY: Use only on your personal computer for emergency backup

param(
    [string]$OutputPath = ".\password-backup",
    [switch]$IncludeBrowsers,
    [switch]$IncludeWindows,
    [switch]$Verbose
)

# Create output directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "Password Extraction Tool - Personal Backup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Initialize results array
$AllPasswords = @()

# Function to get Windows Credential Manager passwords
function Get-WindowsCredentials {
    Write-Host "Getting Windows Credential Manager entries..." -ForegroundColor Yellow
    
    try {
        $Credentials = cmdkey /list 2>$null | Where-Object { $_ -match "Target:|User:" }
        $WindowsPasswords = @()
        
        for ($i = 0; $i -lt $Credentials.Count; $i += 2) {
            if ($Credentials[$i] -match "Target: (.+)") {
                $Target = $matches[1].Trim()
                $Username = ""
                
                if (($i + 1) -lt $Credentials.Count -and $Credentials[$i + 1] -match "User: (.+)") {
                    $Username = $matches[1].Trim()
                }
                
                $WindowsPasswords += [PSCustomObject]@{
                    Source = "Windows Credential Manager"
                    Website = $Target
                    Username = $Username
                    Password = "[Stored in Windows - Use Credential Manager to view]"
                    Category = "Windows"
                    LastModified = (Get-Date).ToString()
                }
            }
        }
        
        Write-Host "   Found $($WindowsPasswords.Count) Windows credential entries" -ForegroundColor Green
        return $WindowsPasswords
        
    } catch {
        Write-Host "   Warning: Windows Credential Manager extraction failed: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# Function to get WiFi passwords
function Get-WiFiPasswords {
    Write-Host "Getting WiFi passwords..." -ForegroundColor Yellow
    
    try {
        $WiFiProfiles = netsh wlan show profiles | Select-String "All User Profile" | ForEach-Object { 
            ($_ -split ":")[1].Trim() 
        }
        $WiFiPasswords = @()
        
        foreach ($Profile in $WiFiProfiles) {
            try {
                $ProfileInfo = netsh wlan show profile name="$Profile" key=clear 2>$null
                $Password = ($ProfileInfo | Select-String "Key Content" | ForEach-Object { 
                    ($_ -split ":")[1].Trim() 
                })
                
                if ($Password) {
                    $WiFiPasswords += [PSCustomObject]@{
                        Source = "WiFi"
                        Website = "WiFi Network"
                        Username = $Profile
                        Password = $Password
                        Category = "Network"
                        LastModified = (Get-Date).ToString()
                    }
                }
            } catch {
                # Skip profiles that cannot be read
            }
        }
        
        Write-Host "   Found $($WiFiPasswords.Count) WiFi network passwords" -ForegroundColor Green
        return $WiFiPasswords
        
    } catch {
        Write-Host "   Warning: WiFi password extraction failed: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# Function to check for browser export files
function Import-BrowserExports {
    Write-Host "Checking for browser export files..." -ForegroundColor Yellow
    
    $BrowserPasswords = @()
    
    # Check for Chrome export
    $ChromeFile = Join-Path $OutputPath "Chrome Passwords.csv"
    if (Test-Path $ChromeFile) {
        try {
            $ChromeData = Import-Csv $ChromeFile
            foreach ($entry in $ChromeData) {
                $BrowserPasswords += [PSCustomObject]@{
                    Source = "Chrome Export"
                    Website = $entry.url
                    Username = $entry.username
                    Password = $entry.password
                    Category = "Browser"
                    LastModified = (Get-Date).ToString()
                }
            }
            Write-Host "   Imported $($ChromeData.Count) Chrome passwords" -ForegroundColor Green
        } catch {
            Write-Host "   Warning: Could not read Chrome export: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Check for Firefox export
    $FirefoxFile = Join-Path $OutputPath "firefox-passwords.csv"
    if (Test-Path $FirefoxFile) {
        try {
            $FirefoxData = Import-Csv $FirefoxFile
            foreach ($entry in $FirefoxData) {
                $BrowserPasswords += [PSCustomObject]@{
                    Source = "Firefox Export"
                    Website = $entry.url
                    Username = $entry.username
                    Password = $entry.password
                    Category = "Browser"
                    LastModified = $entry.timeLastUsed
                }
            }
            Write-Host "   Imported $($FirefoxData.Count) Firefox passwords" -ForegroundColor Green
        } catch {
            Write-Host "   Warning: Could not read Firefox export: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Check for Edge export
    $EdgeFile = Join-Path $OutputPath "edge-passwords.csv"
    if (Test-Path $EdgeFile) {
        try {
            $EdgeData = Import-Csv $EdgeFile
            foreach ($entry in $EdgeData) {
                $BrowserPasswords += [PSCustomObject]@{
                    Source = "Edge Export"
                    Website = $entry.url
                    Username = $entry.username
                    Password = $entry.password
                    Category = "Browser"
                    LastModified = (Get-Date).ToString()
                }
            }
            Write-Host "   Imported $($EdgeData.Count) Edge passwords" -ForegroundColor Green
        } catch {
            Write-Host "   Warning: Could not read Edge export: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($BrowserPasswords.Count -eq 0) {
        Write-Host "   No browser export files found" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   To export browser passwords:" -ForegroundColor Yellow
        Write-Host "   Chrome: Settings > Passwords > Export passwords" -ForegroundColor White
        Write-Host "   Firefox: Settings > Privacy & Security > Saved Logins > Export" -ForegroundColor White
        Write-Host "   Edge: Settings > Passwords > Export passwords" -ForegroundColor White
        Write-Host "   Save files in: $OutputPath" -ForegroundColor Cyan
    }
    
    return $BrowserPasswords
}

# Extract passwords based on parameters
if ($IncludeBrowsers -or !$IncludeWindows) {
    $AllPasswords += Import-BrowserExports
}

if ($IncludeWindows -or !$IncludeBrowsers) {
    $AllPasswords += Get-WindowsCredentials
    $AllPasswords += Get-WiFiPasswords
}

# Export to CSV
$CSVPath = Join-Path $OutputPath "all-passwords.csv"
$AllPasswords | Export-Csv -Path $CSVPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Results Summary:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "Total entries found: $($AllPasswords.Count)" -ForegroundColor Green
Write-Host "Exported to: $CSVPath" -ForegroundColor Green

# Group by category for summary
$Summary = $AllPasswords | Group-Object Category | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) entries" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SECURITY REMINDERS:" -ForegroundColor Red
Write-Host "==================" -ForegroundColor Red
Write-Host "1. Keep the printed booklet in a secure location" -ForegroundColor Yellow
Write-Host "2. DELETE digital files after printing" -ForegroundColor Yellow  
Write-Host "3. Consider using a password manager for better security" -ForegroundColor Yellow

Write-Host ""
Write-Host "Password extraction complete!" -ForegroundColor Green