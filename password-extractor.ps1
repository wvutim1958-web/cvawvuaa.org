# Password Extractor for Personal Backup
# This script safely extracts saved passwords from browsers and Windows
# for creating a printed backup booklet
# 
# SECURITY NOTE: Run this on your personal computer only!
# Keep the output files secure and delete them after printing!

param(
    [string]$OutputPath = ".\password-backup",
    [switch]$IncludeBrowsers,
    [switch]$IncludeWindows,
    [switch]$CreateHTML,
    [switch]$Verbose
)

# Create output directory
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "🔐 Password Extraction Tool - Personal Backup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize results array
$AllPasswords = @()

# Function to extract Chrome passwords
function Get-ChromePasswords {
    Write-Host "🌐 Extracting Chrome passwords..." -ForegroundColor Yellow
    
    $ChromeDataPath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Login Data"
    $TempDB = "$env:TEMP\chrome_temp.db"
    
    if (Test-Path $ChromeDataPath) {
        try {
            # Copy the database (Chrome locks it when running)
            Copy-Item $ChromeDataPath $TempDB -Force
            
            # Add SQLite assembly (you might need to install this)
            Add-Type -Path "System.Data.SQLite.dll" -ErrorAction SilentlyContinue
            
            $ConnectionString = "Data Source=$TempDB;Version=3;"
            $Connection = New-Object System.Data.SQLite.SQLiteConnection($ConnectionString)
            $Connection.Open()
            
            $Command = $Connection.CreateCommand()
            $Command.CommandText = "SELECT origin_url, username_value, password_value FROM logins"
            
            $Reader = $Command.ExecuteReader()
            $ChromePasswords = @()
            
            while ($Reader.Read()) {
                if ($Reader["username_value"] -and $Reader["origin_url"]) {
                    $ChromePasswords += [PSCustomObject]@{
                        Source = "Chrome"
                        Website = $Reader["origin_url"]
                        Username = $Reader["username_value"]
                        Password = "[Encrypted - Use Chrome to view]"
                        Category = "Browser"
                        LastModified = (Get-Date).ToString()
                    }
                }
            }
            
            $Reader.Close()
            $Connection.Close()
            
            # Clean up temp file
            Remove-Item $TempDB -Force -ErrorAction SilentlyContinue
            
            Write-Host "   Found $($ChromePasswords.Count) Chrome entries" -ForegroundColor Green
            return $ChromePasswords
            
        } catch {
            Write-Host "   ⚠️  Chrome extraction failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   💡 Try closing Chrome and running again, or export manually from Chrome settings" -ForegroundColor Yellow
            return @()
        }
    } else {
        Write-Host "   ℹ️  Chrome not found or no saved passwords" -ForegroundColor Gray
        return @()
    }
}

# Function to extract Firefox passwords (requires manual export)
function Get-FirefoxPasswords {
    Write-Host "🦊 Extracting Firefox passwords..." -ForegroundColor Yellow
    
    $FirefoxProfiles = Get-ChildItem "$env:APPDATA\Mozilla\Firefox\Profiles" -Directory -ErrorAction SilentlyContinue
    
    if ($FirefoxProfiles) {
        Write-Host "   ℹ️  Firefox found, but passwords are encrypted" -ForegroundColor Gray
        Write-Host "   💡 To get Firefox passwords:" -ForegroundColor Yellow
        Write-Host "      1. Open Firefox → Settings → Privacy & Security" -ForegroundColor Yellow
        Write-Host "      2. Click 'Saved Logins' → Three dots menu → Export" -ForegroundColor Yellow
        Write-Host "      3. Save as 'firefox-passwords.csv' in $OutputPath" -ForegroundColor Yellow
        
        # Check if user already exported
        $ExportedFile = Join-Path $OutputPath "firefox-passwords.csv"
        if (Test-Path $ExportedFile) {
            try {
                $FirefoxData = Import-Csv $ExportedFile
                $FirefoxPasswords = @()
                
                foreach ($entry in $FirefoxData) {
                    $FirefoxPasswords += [PSCustomObject]@{
                        Source = "Firefox"
                        Website = $entry.url
                        Username = $entry.username
                        Password = $entry.password
                        Category = "Browser"
                        LastModified = $entry.timeLastUsed
                    }
                }
                
                Write-Host "   Found $($FirefoxPasswords.Count) Firefox entries" -ForegroundColor Green
                return $FirefoxPasswords
            } catch {
                Write-Host "   ⚠️  Error reading Firefox export: $($_.Exception.Message)" -ForegroundColor Red
                return @()
            }
        }
    } else {
        Write-Host "   ℹ️  Firefox not found" -ForegroundColor Gray
    }
    
    return @()
}

# Function to extract Edge passwords
function Get-EdgePasswords {
    Write-Host "🌊 Extracting Edge passwords..." -ForegroundColor Yellow
    
    $EdgeDataPath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Login Data"
    
    if (Test-Path $EdgeDataPath) {
        Write-Host "   ℹ️  Edge found, but extraction requires Chrome-like method" -ForegroundColor Gray
        Write-Host "   💡 To get Edge passwords:" -ForegroundColor Yellow
        Write-Host "      1. Open Edge → Settings → Passwords" -ForegroundColor Yellow
        Write-Host "      2. Click three dots → Export passwords" -ForegroundColor Yellow
        Write-Host "      3. Save as 'edge-passwords.csv' in $OutputPath" -ForegroundColor Yellow
        
        # Check if user already exported
        $ExportedFile = Join-Path $OutputPath "edge-passwords.csv"
        if (Test-Path $ExportedFile) {
            try {
                $EdgeData = Import-Csv $ExportedFile
                $EdgePasswords = @()
                
                foreach ($entry in $EdgeData) {
                    $EdgePasswords += [PSCustomObject]@{
                        Source = "Edge"
                        Website = $entry.url
                        Username = $entry.username
                        Password = $entry.password
                        Category = "Browser"
                        LastModified = (Get-Date).ToString()
                    }
                }
                
                Write-Host "   Found $($EdgePasswords.Count) Edge entries" -ForegroundColor Green
                return $EdgePasswords
            } catch {
                Write-Host "   ⚠️  Error reading Edge export: $($_.Exception.Message)" -ForegroundColor Red
                return @()
            }
        }
    } else {
        Write-Host "   ℹ️  Edge not found" -ForegroundColor Gray
    }
    
    return @()
}

# Function to extract Windows Credential Manager passwords
function Get-WindowsCredentials {
    Write-Host "🪟 Extracting Windows Credential Manager..." -ForegroundColor Yellow
    
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
        Write-Host "   ⚠️  Windows Credential Manager extraction failed: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# Function to get WiFi passwords
function Get-WiFiPasswords {
    Write-Host "📶 Extracting WiFi passwords..." -ForegroundColor Yellow
    
    try {
        $WiFiProfiles = netsh wlan show profiles | Select-String "All User Profile" | ForEach-Object { ($_ -split ":")[1].Trim() }
        $WiFiPasswords = @()
        
        foreach ($Profile in $WiFiProfiles) {
            try {
                $ProfileInfo = netsh wlan show profile name="$Profile" key=clear 2>$null
                $Password = ($ProfileInfo | Select-String "Key Content" | ForEach-Object { ($_ -split ":")[1].Trim() })
                
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
                # Skip profiles that can't be read
            }
        }
        
        Write-Host "   Found $($WiFiPasswords.Count) WiFi network passwords" -ForegroundColor Green
        return $WiFiPasswords
        
    } catch {
        Write-Host "   ⚠️  WiFi password extraction failed: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# Extract passwords based on parameters
if ($IncludeBrowsers -or !$IncludeWindows) {
    $AllPasswords += Get-ChromePasswords
    $AllPasswords += Get-FirefoxPasswords
    $AllPasswords += Get-EdgePasswords
}

if ($IncludeWindows -or !$IncludeBrowsers) {
    $AllPasswords += Get-WindowsCredentials
    $AllPasswords += Get-WiFiPasswords
}

# Export to CSV
$CSVPath = Join-Path $OutputPath "all-passwords.csv"
$AllPasswords | Export-Csv -Path $CSVPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "📄 Results Summary:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Total entries found: $($AllPasswords.Count)" -ForegroundColor Green
Write-Host "Exported to: $CSVPath" -ForegroundColor Green

# Group by category for summary
$Summary = $AllPasswords | Group-Object Category | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) entries" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  SECURITY REMINDERS:" -ForegroundColor Red
Write-Host "======================" -ForegroundColor Red
Write-Host "1. Keep the printed booklet in a secure location (safe, locked drawer)" -ForegroundColor Yellow
Write-Host "2. DELETE digital files after printing: Remove-Item '$OutputPath' -Recurse" -ForegroundColor Yellow  
Write-Host "3. Consider using a password manager for better security" -ForegroundColor Yellow
Write-Host "4. Update your printed booklet regularly" -ForegroundColor Yellow

if ($CreateHTML) {
    Write-Host ""
    Write-Host "🖨️  Creating printable HTML version..." -ForegroundColor Cyan
    
    # This will be created in the next step
    & "$PSScriptRoot\create-password-booklet.ps1" -InputCSV $CSVPath -OutputPath $OutputPath
}

Write-Host ""
Write-Host "✅ Password extraction complete!" -ForegroundColor Green
Write-Host "Next: Run './create-password-booklet.ps1' to create a printable version" -ForegroundColor Cyan