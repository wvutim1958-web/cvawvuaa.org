# 🖥️ Tim's 3-Monitor Setup Guide
## ASUS ROG Zephyrus G15 Gaming Laptop

---

## Your Hardware Summary

**Laptop:** ASUS ROG Zephyrus G15 (GA503QR)
- **CPU:** AMD Ryzen 9 5900HS @ 3.3 GHz (8 cores, 16 threads)
- **RAM:** 40GB DDR4
- **GPU:** NVIDIA GeForce RTX 3070 Laptop (Primary for external displays)
- **Integrated GPU:** AMD Radeon Graphics (Laptop display)
- **OS:** Windows 11 Enterprise 24H2

**Monitor Setup:**
1. **Center (Main):** ViewSonic XG270QC - 27" @ 165Hz (Curved Gaming Monitor)
2. **Left:** HP 22cwa - 22" @ 60Hz
3. **Right:** Sceptre C24 - 24" @ 75Hz
4. **Laptop Screen:** Built-in display (can be used or closed)

**All external monitors connected to NVIDIA RTX 3070** ✅

---

## Step-by-Step Setup Instructions

### Step 1: Open Display Settings

**Method 1 (Easy):**
- Right-click anywhere on your desktop
- Click **"Display settings"**

**Method 2 (Keyboard):**
- Press **Windows Key + I** (opens Settings)
- Click **System** → **Display**

---

### Step 2: Arrange Your Monitors

You'll see numbered rectangles representing each display:

**Current Layout (Recommended):**
```
[2: HP 22"]  [1: ViewSonic 27" MAIN]  [3: Sceptre 24"]
        [4: Laptop Screen - Optional]
```

**Instructions:**
1. **Drag the rectangles** in Display Settings to match your physical desk layout
2. **Align the tops** of monitors 1, 2, and 3 so your mouse moves smoothly
3. **Click on Display 1** (ViewSonic 27")
4. Scroll down and check **"Make this my main display"**
5. Click **Apply**

---

### Step 3: Verify Refresh Rates

Your monitors are already optimized:
- ✅ ViewSonic: **165Hz** (Gaming-grade smoothness)
- ✅ HP: **60Hz** (Standard)
- ✅ Sceptre: **75Hz** (Better than standard)

**To verify:**
1. In Display Settings, click each monitor
2. Scroll down to **"Advanced display"**
3. Check the refresh rate
4. If it's not set to maximum, select the highest available

---

### Step 4: Adjust Scaling (Important!)

Different monitor sizes need different scaling for comfortable text:

**Recommended Settings:**
- **ViewSonic 27":** 125% (or 100% if you prefer smaller text)
- **HP 22":** 100%
- **Sceptre 24":** 100%

**To adjust:**
1. Click each monitor in Display Settings
2. Find **"Scale"** dropdown
3. Select your preferred percentage
4. Click **Apply**
5. Sign out and back in for best results

---

### Step 5: Configure NVIDIA Settings

1. **Right-click** on desktop → **"NVIDIA Control Panel"**
2. Go to **"Display" → "Set up multiple displays"**
   - Verify all 3 external monitors show as connected ✅
3. Go to **"Adjust desktop color settings"**
   - Adjust each monitor's brightness/contrast to match
   - Recommended: Set all to similar brightness levels

---

### Step 6: Taskbar Configuration

**Option A: Taskbar on all monitors (Default)**
- Shows taskbar on all 3 displays
- Each shows windows open on that monitor

**Option B: Taskbar only on main (Cleaner)**
1. Right-click taskbar → **Taskbar settings**
2. Expand **"Taskbar behaviors"**
3. Uncheck **"Show my taskbar on all displays"**

**Recommended:** Option A for productivity

---

### Step 7: Set Up Laptop Lid Behavior

Since you have 3 external monitors, you may want to close the laptop:

1. Open **Settings** (Win + I)
2. Go to **System → Power → Screen and sleep**
3. Click **"Additional power settings"** (on the right)
4. Click **"Choose what closing the lid does"**
5. Set **"When I close the lid"** to **"Do nothing"**
6. Click **Save changes**

This lets you close the laptop and still use all 3 external monitors.

---

## Optimal Workspace Layout for Your Work

### For Website/Newsletter Development:

**Center Monitor (27" ViewSonic - Main):**
- **VS Code** - Your primary coding workspace
- october-2025-newsletter.html editing
- Main work area - largest, best quality

**Left Monitor (22" HP):**
- **Web Browser** - Live preview of website
- Preview newsletter in browser
- Mailchimp for email campaigns
- Reference documentation

**Right Monitor (24" Sceptre):**
- **File Explorer** - Navigate your files
- **Windows Terminal** - Git commands, PowerShell
- **Image viewers** - View photos for gallery
- **Email** - Keep email visible

---

## Windows 11 Keyboard Shortcuts for 3 Monitors

### Window Snapping:
- **Win + Left Arrow** = Snap window to left half
- **Win + Right Arrow** = Snap window to right half
- **Win + Up Arrow** = Maximize window
- **Win + Down Arrow** = Minimize/Restore window

### Move Windows Between Monitors:
- **Win + Shift + Left Arrow** = Move window to left monitor
- **Win + Shift + Right Arrow** = Move window to right monitor
- **Repeat** to cycle through all monitors

### Virtual Desktops:
- **Win + Tab** = See all windows across monitors
- **Win + Ctrl + D** = Create new virtual desktop
- **Win + Ctrl + Left/Right** = Switch between desktops

### Other Useful:
- **Win + P** = Project options (duplicate, extend, etc.)
- **Alt + Tab** = Switch between open windows
- **Win + D** = Show desktop (minimize all)

---

## Recommended Software: PowerToys (FREE!)

**Microsoft PowerToys** makes multi-monitor work MUCH easier:

### Installation:
```powershell
winget install Microsoft.PowerToys
```

Or download from: https://github.com/microsoft/PowerToys/releases

### Best Features for 3 Monitors:

**1. FancyZones:**
- Create custom window layouts across all 3 monitors
- Snap windows to pre-defined zones
- Perfect for coding workflow

**2. PowerToys Run (Alt + Space):**
- Quick launcher for apps
- Search files instantly
- Calculator built-in

**3. Keyboard Manager:**
- Remap keys
- Create custom shortcuts

---

## Troubleshooting

### Problem: Mouse "jumps" between monitors
**Solution:** Align monitor tops in Display Settings

### Problem: Different text sizes on each monitor
**Solution:** Adjust scaling per monitor (Step 4)

### Problem: Window opens on wrong monitor
**Solution:** 
- Windows "remembers" where apps were last opened
- Open app, move to desired monitor, close it there
- Next time it opens on that monitor

### Problem: Monitor not detected
**Solution:**
1. Check cable connection (HDMI/DisplayPort)
2. Right-click desktop → Display Settings → **Detect**
3. Update NVIDIA drivers
4. Try different cable/port

### Problem: Low refresh rate on gaming monitor
**Solution:**
1. Display Settings → Advanced display
2. Select 165Hz for ViewSonic
3. Use DisplayPort cable if possible (not HDMI)

---

## Monitor Management Scripts

See the PowerShell scripts I've created:
- `monitor-single.ps1` - Switch to single monitor (ViewSonic only)
- `monitor-triple.ps1` - Enable all 3 monitors
- `monitor-info.ps1` - Show current monitor configuration

---

## Performance Notes

**Your RTX 3070 can easily handle:**
- ✅ 3 monitors simultaneously
- ✅ 4K video playback on all screens
- ✅ Multiple browsers with dozens of tabs
- ✅ VS Code + heavy web development
- ✅ Photo editing across screens

**No performance concerns** with your 40GB RAM and Ryzen 9 CPU!

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  Tim's 3-Monitor Command Center             │
├─────────────────────────────────────────────┤
│  CENTER: Code & Primary Work                │
│  LEFT:   Browser Preview & Reference        │
│  RIGHT:  Files, Terminal, Tools             │
├─────────────────────────────────────────────┤
│  Win + Shift + Arrow = Move windows         │
│  Win + Tab           = See everything       │
│  Win + P             = Display options      │
└─────────────────────────────────────────────┘
```

---

## My Recommendation

**✅ KEEP ALL 3 MONITORS!**

With your hardware, you have MORE than enough power. The productivity boost for website development is huge:

- See code + preview + tools simultaneously
- No constant window switching
- Perfect for your newsletter work
- Great for photo gallery management

Give it **one week** with proper setup. If still frustrated, you can always disable side monitors temporarily.

---

## Need Help?

If you have questions or need to adjust something, just ask! The setup is worth the initial learning curve.

**Last Updated:** October 13, 2025
**System:** TIMS-ASUS-ROG
