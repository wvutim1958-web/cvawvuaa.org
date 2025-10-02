# Password Backup System - Quick Start Guide

## 🚀 Get Your Password Booklet in 5 Minutes!

This is the fastest way to create a secure, printable backup of all your saved passwords.

---

## 🎯 What This Does

✅ **Extracts passwords from**:
- Chrome, Firefox, Edge browsers
- Windows Credential Manager  
- WiFi networks
- Saved login data

✅ **Creates professional booklet**:
- Print-optimized HTML format
- Organized by category
- Security warnings included
- Alphabetical index

✅ **Keeps you secure**:
- Detailed security instructions
- Safe cleanup procedures
- Best practices guidance

---

## ⚡ Quick Start (3 Steps)

### **Step 1: Run the Main Script**
```powershell
# Open PowerShell in the folder with the scripts
# Right-click in folder → "Open PowerShell window here"

# Run the complete backup system
.\run-password-backup.ps1
```

### **Step 2: Follow Browser Export Instructions** 
If automatic extraction doesn't work:

**Chrome/Edge**: Settings → Passwords → Export  
**Firefox**: Settings → Privacy & Security → Saved Logins → Export

Save files in the `password-backup` folder when prompted.

### **Step 3: Print Your Booklet**
- Open the generated `password-booklet.html`
- Press **Ctrl+P** or click "Print Booklet"
- Store printed copy securely
- Delete digital files: `Remove-Item "password-backup" -Recurse -Force`

---

## 🛠️ Advanced Options

### **Custom Configuration**
```powershell
# Custom title and location
.\run-password-backup.ps1 -BookletTitle "My Secure Passwords" -OutputPath "C:\MyPasswords"

# Skip browsers, only Windows credentials  
.\run-password-backup.ps1 -SkipBrowsers

# Auto-cleanup after creation
.\run-password-backup.ps1 -CleanupAfter

# Don't open browser automatically
.\run-password-backup.ps1 -OpenWhenDone:$false
```

### **Individual Scripts**
If you need more control:

```powershell
# 1. Extract passwords only
.\password-extractor.ps1 -OutputPath ".\my-backup"

# 2. Create booklet only (if you have CSV data)
.\create-password-booklet.ps1 -InputCSV ".\my-backup\all-passwords.csv"
```

---

## 🔧 Troubleshooting

### **"Execution policy" Error**
```powershell
# Run this first to allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **"Script not found" Error**
Make sure all 4 files are in the same folder:
- `run-password-backup.ps1`
- `password-extractor.ps1`  
- `create-password-booklet.ps1`
- `PASSWORD-SECURITY-GUIDE.md`

### **Browser Passwords Not Found**
- Close all browser windows first
- Try manual export from browser settings
- Run PowerShell as Administrator

### **No Passwords Extracted**
- Check if browsers actually save passwords
- Verify you're logged into browser profiles
- Try manual export method

---

## 📁 File Structure

After running, you'll have:
```
password-backup/
├── all-passwords.csv          (Raw data)
├── password-booklet.html      (Printable version)
└── password-booklet.txt       (Plain text backup)
```

---

## 🔒 Security Reminders

**DO:**
- ✅ Store printed booklet in safe/locked drawer
- ✅ Delete digital files after printing  
- ✅ Update booklet when passwords change
- ✅ Read the security guide first

**DON'T:**
- ❌ Leave booklet in visible locations
- ❌ Create booklet in public places
- ❌ Share digital files via email/cloud
- ❌ Use this for daily password access

---

## 🆘 Need Help?

### **Command Help**
```powershell
.\run-password-backup.ps1 -help
```

### **Common Issues**

**Problem**: Chrome passwords show as encrypted  
**Solution**: Use Chrome's manual export feature

**Problem**: Firefox passwords not found  
**Solution**: Export manually from Firefox settings

**Problem**: Access denied errors  
**Solution**: Run PowerShell as Administrator

**Problem**: Printer formatting issues  
**Solution**: Try printing from different browser

---

## 📚 Related Files

- **`PASSWORD-SECURITY-GUIDE.md`** - Comprehensive security guide
- **`run-password-backup.ps1`** - Main orchestration script  
- **`password-extractor.ps1`** - Password extraction utility
- **`create-password-booklet.ps1`** - Booklet generation tool

---

## ⚠️ Important Notes

1. **This is for emergency backup only** - Use a password manager like Bitwarden for daily use
2. **Keep printed copy secure** - Anyone with access has all your passwords  
3. **Update regularly** - Passwords change frequently
4. **Clean up digital files** - Don't leave password files on computer

---

**🎉 You're ready to go! Run `.\run-password-backup.ps1` to get started!**