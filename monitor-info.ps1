# Monitor Configuration Info Script
# Shows current display setup on TIMS-ASUS-ROG

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     MONITOR CONFIGURATION - TIMS-ASUS-ROG                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nDetecting displays..." -ForegroundColor Yellow

# Get display information using CIM
$monitors = Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorBasicDisplayParams

Write-Host "`n📊 CONNECTED DISPLAYS:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Get display adapters
$adapters = Get-CimInstance -ClassName Win32_VideoController

foreach ($adapter in $adapters) {
    Write-Host "`n🎮 GPU: $($adapter.Name)" -ForegroundColor Cyan
    Write-Host "   Driver Version: $($adapter.DriverVersion)" -ForegroundColor Gray
    Write-Host "   Video Memory: $([math]::Round($adapter.AdapterRAM / 1GB, 2)) GB" -ForegroundColor Gray
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Try to get monitor details using WMI
Write-Host "`n🖥️  MONITOR DETAILS:" -ForegroundColor Green

try {
    Add-Type -AssemblyName System.Windows.Forms
    $screens = [System.Windows.Forms.Screen]::AllScreens
    
    $displayCount = 1
    foreach ($screen in $screens) {
        Write-Host "`n   Display $displayCount" -ForegroundColor Yellow
        Write-Host "   ├─ Resolution: $($screen.Bounds.Width) x $($screen.Bounds.Height)" -ForegroundColor White
        Write-Host "   ├─ Position: X=$($screen.Bounds.X), Y=$($screen.Bounds.Y)" -ForegroundColor White
        Write-Host "   ├─ Bits Per Pixel: $($screen.BitsPerPixel)" -ForegroundColor White
        
        if ($screen.Primary) {
            Write-Host "   └─ ⭐ PRIMARY DISPLAY" -ForegroundColor Green
        } else {
            Write-Host "   └─ Secondary Display" -ForegroundColor Gray
        }
        
        $displayCount++
    }
} catch {
    Write-Host "   Unable to get detailed screen information." -ForegroundColor Red
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n💡 YOUR MONITOR SETUP:" -ForegroundColor Green
Write-Host "   • ViewSonic XG270QC (27`" @ 165Hz) - Center/Main" -ForegroundColor White
Write-Host "   • HP 22cwa (22`" @ 60Hz) - Left" -ForegroundColor White
Write-Host "   • Sceptre C24 (24`" @ 75Hz) - Right" -ForegroundColor White

Write-Host "`n🎮 SYSTEM INFO:" -ForegroundColor Green
Write-Host "   • Device: $env:COMPUTERNAME" -ForegroundColor White
Write-Host "   • CPU: AMD Ryzen 9 5900HS" -ForegroundColor White
Write-Host "   • RAM: 40 GB" -ForegroundColor White
Write-Host "   • GPU: NVIDIA RTX 3070 Laptop" -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n✨ QUICK ACTIONS:" -ForegroundColor Cyan
Write-Host "   • Press Win + P     = Display projection options" -ForegroundColor Gray
Write-Host "   • Press Win + Shift + Arrow = Move windows between monitors" -ForegroundColor Gray
Write-Host "   • Right-click desktop -> Display Settings = Configure monitors" -ForegroundColor Gray

Write-Host "`n For full guide, see: MONITOR-SETUP-GUIDE.md`n" -ForegroundColor Yellow
