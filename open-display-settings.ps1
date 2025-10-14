# Quick Display Settings Opener
# Opens Windows Display Settings with a nice interface

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          OPENING DISPLAY SETTINGS...                     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "⚙️  Launching Windows Display Settings..." -ForegroundColor Yellow

try {
    # Method 1: Using Start-Process with ms-settings URI
    Start-Process "ms-settings:display"
    Write-Host "✅ Display Settings opened successfully!`n" -ForegroundColor Green
    
    Write-Host "📋 WHAT TO DO IN DISPLAY SETTINGS:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "`n1️⃣  ARRANGE MONITORS:" -ForegroundColor Yellow
    Write-Host "   • Drag rectangles to match your desk layout" -ForegroundColor White
    Write-Host "   • [HP 22`"] [ViewSonic 27`"] [Sceptre 24`"]" -ForegroundColor Gray
    
    Write-Host "`n2️⃣  SET MAIN DISPLAY:" -ForegroundColor Yellow
    Write-Host "   • Click ViewSonic (center monitor)" -ForegroundColor White
    Write-Host "   • Check 'Make this my main display'" -ForegroundColor White
    
    Write-Host "`n3️⃣  ADJUST SCALING:" -ForegroundColor Yellow
    Write-Host "   • ViewSonic 27`": 125% (or 100%)" -ForegroundColor White
    Write-Host "   • HP 22`": 100%" -ForegroundColor White
    Write-Host "   • Sceptre 24`": 100%" -ForegroundColor White
    
    Write-Host "`n4️⃣  VERIFY REFRESH RATES:" -ForegroundColor Yellow
    Write-Host "   • Click 'Advanced display'" -ForegroundColor White
    Write-Host "   • ViewSonic should be 165Hz" -ForegroundColor White
    Write-Host "   • Others at their maximum rates" -ForegroundColor White
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "`n💡 Tip: See MONITOR-SETUP-GUIDE.md for detailed instructions`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Could not open Display Settings automatically." -ForegroundColor Red
    Write-Host "`n📝 Manual Method:" -ForegroundColor Yellow
    Write-Host "   1. Right-click on desktop" -ForegroundColor White
    Write-Host "   2. Click 'Display settings'`n" -ForegroundColor White
}
