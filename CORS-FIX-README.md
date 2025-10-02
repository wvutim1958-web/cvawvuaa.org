# CVCWVUAA Website - Running with Web Server

## 🚨 Important: CORS Error Fix

The "Failed to fetch" error occurs because browsers block API calls from `file://` URLs for security. You need to run the website through a web server.

## ✅ Solution Options:

### Option 1: Use the Provided Batch File
1. **Double-click** `start-server.bat` in this folder
2. **Open** http://localhost:8080/mailchimp-debug.html
3. **Test your Mailchimp integration**

### Option 2: Use Visual Studio Code
1. **Install VS Code** (if you don't have it)
2. **Install "Live Server" extension**
3. **Right-click** any HTML file → "Open with Live Server"

### Option 3: Manual Python Server
1. **Open PowerShell in this folder**
2. **Run**: `python -m http.server 8080`
3. **Open**: http://localhost:8080

## 📋 Then Test Mailchimp:
- **Admin Dashboard**: http://localhost:8080/admin/index.html
- **Mailchimp Debug**: http://localhost:8080/mailchimp-debug.html
- **Mailchimp Fixed**: http://localhost:8080/mailchimp-fixed.html

## 🎯 Why This Works:
- Web servers serve files via `http://` instead of `file://`
- This allows API calls to external services like Mailchimp
- Your website functions exactly as it would when hosted online

## 🔧 Once Working:
After confirming Mailchimp works via web server, you can:
1. Upload to your web hosting
2. Configure Mailchimp on the live site
3. All functionality will work perfectly online