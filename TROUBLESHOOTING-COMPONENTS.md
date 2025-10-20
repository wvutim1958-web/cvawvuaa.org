# Troubleshooting WVU Components Not Loading

## Quick Diagnostic Steps

The component loader now has detailed console logging. Follow these steps to diagnose the issue:

### 1. Open Browser Developer Tools

**Chrome/Edge/Firefox:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Safari:**
- Press `Cmd+Option+C`
- Or enable Developer menu: Safari → Preferences → Advanced → Check "Show Develop menu"

### 2. Go to the Console Tab

Look for messages like:
```
Loading WVU components...
Masthead fetch response: 200
Masthead loaded successfully
Navigation fetch response: 200
Navigation loaded successfully  
Footer fetch response: 200
Footer loaded successfully
```

### 3. Check for Errors

Look for any RED error messages. Common issues:

#### A) **Fetch Failed (404 Not Found)**
```
Error loading masthead: TypeError: Failed to fetch
```
**Solution:** The includes files might not be deployed yet. Wait 2-3 minutes for GitHub Pages to rebuild.

#### B) **CORS Error**
```
Access to fetch at '.../includes/masthead.html' blocked by CORS policy
```
**Solution:** This shouldn't happen with same-origin requests, but if it does, we need to restructure.

#### C) **Element Not Found**
```
Element #wvu-masthead not found
```
**Solution:** The page structure is wrong. The div IDs are missing.

#### D) **No Logs At All**
**Solution:** The component-loader.js script isn't loading or executing.
- Check Network tab for `component-loader.js` - should show status 200
- Check for JavaScript errors preventing execution

### 4. Check Network Tab

1. Click the **Network** tab in Developer Tools
2. Refresh the page (`F5` or `Ctrl+R`)
3. Filter by "JS" or "Doc"
4. Look for these requests:

| File | Expected Status | Size |
|------|----------------|------|
| component-loader.js | 200 OK | ~2 KB |
| masthead.html | 200 OK | ~1 KB |
| navigation.html | 200 OK | ~3 KB |
| footer.html | 200 OK | ~4 KB |
| wvu-navigation.js | 200 OK | ~2 KB |

**If any show 404:** The file isn't on the server yet. Wait for GitHub Pages deployment.

**If any show CORS error:** We need to restructure the component loading.

### 5. Wait for GitHub Pages Deployment

GitHub Pages can take **2-5 minutes** to rebuild and deploy after a commit.

Check deployment status:
1. Go to: https://github.com/wvutim1958-web/cvawvuaa.org/actions
2. Look for the latest workflow run
3. Wait for it to show a green checkmark ✓

### 6. Hard Refresh After Deployment

Once GitHub Pages shows deployment complete:

**Chrome/Edge:**
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

**Firefox:**
- `Ctrl+F5` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

**Safari:**
- `Cmd+Option+R`

### 7. Report What You See

Send me the console output, specifically:
- ✅ What logs appear (if any)
- ❌ What error messages appear (if any)
- 🌐 What the Network tab shows for the fetch requests
- ⏱️ How long it's been since the last git push

---

## Expected Behavior (When Working)

When everything is working, you should see:

**In the browser:**
- Full WVU masthead with logo and title
- Complete navigation menu with dropdowns
- Breadcrumbs (except on homepage)
- Full footer with contact info

**In the console:**
```
Loading WVU components...
Masthead fetch response: 200
Masthead loaded successfully
Navigation fetch response: 200
Navigation loaded successfully
Footer fetch response: 200
Footer loaded successfully
```

**In the Network tab:**
- All files showing green/200 status
- No red/failed requests

---

## Temporary Workaround

If components still don't load after 5 minutes and debugging, we can switch to an inline approach where the HTML is embedded directly in each page instead of loaded via fetch. This will work immediately but makes updates harder.

Let me know what the console shows!
