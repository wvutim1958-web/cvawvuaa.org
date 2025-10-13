# Quick Guide: Add cvcwvuaa.org to Your Netlify Site

**Created:** October 10, 2025  
**Goal:** Point your Bluehost domain (cvcwvuaa.org) to your existing Netlify site (cvawvuaa.org)

---

## 🎯 WHAT YOU'RE DOING

You already have **cvawvuaa.org** working perfectly on Netlify. Now you're adding **cvcwvuaa.org** as a second domain pointing to the same site.

**Result:** Both domains will show the same website, same content, same everything!

---

## ⏱️ TIME REQUIRED

- **Setup Time:** 15 minutes
- **DNS Propagation:** 15 minutes to 4 hours
- **Total:** Usually working within 1 hour

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### PART 1: Add Domain in Netlify (5 minutes)

1. **Go to Netlify Dashboard**
   - Open: [https://app.netlify.com](https://app.netlify.com)
   - Log in with your account

2. **Select Your Site**
   - Find your **cvawvuaa** site
   - Click on it to open the site dashboard

3. **Open Domain Settings**
   - Click **Domain settings** in the top menu
   - Or click **Set up a custom domain** button

4. **Add the Domain**
   - Click **Add domain alias** (or **Add custom domain**)
   - Enter: `cvcwvuaa.org`
   - Click **Verify**

5. **Confirm Ownership**
   - Netlify will check if you own the domain
   - It may show a warning - that's okay!
   - Click **Add domain** to proceed

6. **Note the DNS Records**
   - Netlify will show you what DNS records to add
   - Keep this page open - you'll need these values!
   - Should show:
     ```
     A Record: 75.2.60.5
     CNAME: (for www subdomain)
     ```

---

### PART 2: Update DNS in Bluehost (10 minutes)

1. **Log into Bluehost**
   - Go to: [https://www.bluehost.com](https://www.bluehost.com)
   - Click **Login** (top right)
   - Enter your credentials

2. **Navigate to DNS Settings**
   - Click **Domains** in the left sidebar
   - Click **Manage** (or **Domain Management**)
   - Find **cvcwvuaa.org** in your list
   - Click the **⚙️** icon or **Manage** button next to it
   - Look for **DNS** or **DNS Zone Editor** or **Advanced DNS**

3. **Delete Old Records** (Important!)
   - Find any existing **A Records** for `@` or blank host
   - Find any existing **CNAME Records** for `www`
   - Delete these old records (they point to old WordPress hosting)
   - ⚠️ **Don't delete MX records** (email) or TXT records

4. **Add New A Record** (for root domain)
   - Click **Add Record** or **Add DNS Record**
   - Fill in:
     ```
     Type: A
     Host: @ (or leave blank, or type "cvcwvuaa.org")
     Points to / Value: 75.2.60.5
     TTL: 14400 (or 4 hours, or automatic)
     ```
   - Click **Save** or **Add Record**

5. **Add New CNAME Record** (for www)
   - Click **Add Record** again
   - Fill in:
     ```
     Type: CNAME
     Host: www
     Points to / Value: cvawvuaa.org.
     TTL: 14400 (or 4 hours, or automatic)
     ```
   - ⚠️ **Note the trailing dot** after `.org.` - this is important!
   - Click **Save** or **Add Record**

6. **Verify Your Changes**
   - Your DNS records should now show:
     - `A` → `@` → `75.2.60.5`
     - `CNAME` → `www` → `cvawvuaa.org.`
   - Click **Save All Changes** if there's a final save button

---

### PART 3: Enable SSL in Netlify (Automatic)

1. **Return to Netlify Dashboard**
   - Go back to your site's **Domain settings** page
   - Scroll to the **HTTPS** section

2. **Verify DNS Configuration**
   - Click **Verify DNS configuration**
   - Netlify will check if your Bluehost DNS is pointing correctly
   - ⏳ If it says "DNS not configured yet" - wait 10-15 minutes and try again

3. **Enable HTTPS** (usually automatic)
   - Once DNS is verified, Netlify will auto-provision an SSL certificate
   - This takes 1-5 minutes
   - You'll see a status change to **Certificate active** or similar

4. **Force HTTPS** (recommended)
   - Find the setting **Force HTTPS** or **Redirect HTTP to HTTPS**
   - Toggle it **ON**
   - This ensures all traffic uses secure HTTPS

---

## ✅ TESTING & VERIFICATION

### Wait for DNS Propagation
- **Minimum wait:** 15 minutes
- **Average wait:** 1-2 hours
- **Maximum wait:** 48 hours (rare)

### Test Your Domain

After waiting at least 15 minutes:

1. **Open Incognito/Private Browser Window** (avoids cache)

2. **Test these URLs:**
   - ✅ `http://cvcwvuaa.org` → should redirect to HTTPS
   - ✅ `https://cvcwvuaa.org` → should show your site
   - ✅ `http://www.cvcwvuaa.org` → should redirect to HTTPS
   - ✅ `https://www.cvcwvuaa.org` → should show your site
   - ✅ Look for green padlock 🔒 in browser

3. **Check DNS Propagation:**
   - Go to: [https://dnschecker.org](https://dnschecker.org)
   - Enter: `cvcwvuaa.org`
   - Should show IP: `75.2.60.5` in most/all locations
   - Green checkmarks = propagated ✅

4. **Verify Both Domains Work:**
   - `cvawvuaa.org` → your site ✅
   - `cvcwvuaa.org` → your site ✅
   - Both should show identical content

---

## 🔧 TROUBLESHOOTING

### "DNS not configured" in Netlify
- **Wait longer** - DNS takes time to propagate
- Check your A record points to `75.2.60.5` exactly
- Check your CNAME has trailing dot: `cvawvuaa.org.`
- Try **Verify DNS configuration** button again after 30 mins

### "This site can't be reached" or timeout error
- DNS hasn't propagated yet - wait 1-2 hours
- Check [dnschecker.org](https://dnschecker.org) - if not green everywhere, wait
- Clear your browser cache or use Incognito mode
- Try from your phone (different network)

### Certificate/SSL error or "Not secure"
- SSL takes 5-10 minutes after DNS propagates
- In Netlify, go to **Domain settings** → **HTTPS**
- Click **Provision certificate** if it's not automatic
- Wait 5-10 minutes and reload the page

### Old WordPress site still shows
- Your browser has cached the old site
- Clear browser cache: Ctrl+Shift+Delete (Windows)
- Use Incognito/Private mode
- Wait for DNS to fully propagate (up to 24 hours)

### "Already claimed by another account"
- Someone else may have added this domain to Netlify
- Contact Netlify support to claim ownership
- You may need to verify via DNS TXT record

---

## 🎨 OPTIONAL: Set Primary Domain

After both domains are working, you can choose which one is "primary":

1. In Netlify **Domain settings**
2. Find **Primary domain** section
3. Choose either:
   - `cvawvuaa.org` (current) - **RECOMMENDED**
   - `cvcwvuaa.org` (old domain)
4. The non-primary domain will auto-redirect to primary

**Recommendation:** Keep `cvawvuaa.org` as primary (it's shorter and current)

---

## 💰 COST SAVINGS AFTER SETUP

Once both domains work on Netlify:

### Can Cancel from Bluehost:
- ❌ WordPress hosting ($5-30/month saved!)
- ❌ SSL certificate (Netlify provides free SSL)
- ❌ Website builder tools

### Must Keep with Bluehost:
- ✅ **Domain registration** for cvcwvuaa.org (~$15/year)
  - You're just changing DNS, not canceling the domain!

### How to Cancel WordPress Hosting:
1. Wait 30 days after DNS change (to ensure it works)
2. Log into Bluehost
3. Go to **Hosting** → **Manage**
4. Cancel hosting plan (but keep domain registration)
5. **Important:** Tell them "I only want to keep the domain registration, cancel hosting"

---

## 📊 POST-SETUP CHECKLIST

After DNS propagates and everything works:

- [ ] Both domains load your site:
  - [ ] `cvcwvuaa.org` works
  - [ ] `www.cvcwvuaa.org` works  
  - [ ] `cvawvuaa.org` still works
  - [ ] `www.cvawvuaa.org` still works

- [ ] HTTPS works on all URLs (green padlock 🔒)

- [ ] Update marketing materials:
  - [ ] Email signatures
  - [ ] Business cards (if any mention the domain)
  - [ ] Social media profiles
  - [ ] Google My Business

- [ ] Set up Google Search Console for cvcwvuaa.org
  - Monitor search traffic from old domain
  - See if any backlinks point to old domain

- [ ] Consider canceling Bluehost hosting after 30 days
  - Keep domain registration active!

---

## 📞 NEED HELP?

### Bluehost Support
- **Phone:** 1-888-401-4678 (24/7)
- **Live Chat:** Available in dashboard
- **Say:** "I need to update DNS records for cvcwvuaa.org to point to Netlify. I need to add an A record to 75.2.60.5"

### Netlify Support
- **Support Email:** support@netlify.com
- **Forums:** [https://answers.netlify.com](https://answers.netlify.com)
- **Docs:** [https://docs.netlify.com/domains-https/custom-domains/](https://docs.netlify.com/domains-https/custom-domains/)
- **Say:** "I'm trying to add cvcwvuaa.org as a domain alias to my existing site"

---

## 🎉 BENEFITS ONCE COMPLETE

✅ **Both domains work** - cvcwvuaa.org and cvawvuaa.org  
✅ **Free SSL certificates** - automatic HTTPS  
✅ **No WordPress costs** - save $5-30/month  
✅ **Faster website** - Netlify CDN vs shared hosting  
✅ **Better security** - no WordPress vulnerabilities  
✅ **One site to manage** - update in one place, both domains show it  
✅ **GitHub auto-deploy** - still works perfectly  

---

## 📝 BLUEHOST DNS SCREENSHOT GUIDE

**When you're in Bluehost DNS settings, look for:**

### Before (DELETE these):
```
A Record:
Host: @
Points to: [some old IP like 192.x.x.x or 50.x.x.x]
❌ DELETE THIS

CNAME Record:
Host: www
Points to: [old WordPress URL]
❌ DELETE THIS
```

### After (ADD these):
```
A Record:
Host: @
Points to: 75.2.60.5
✅ ADD THIS

CNAME Record:
Host: www
Points to: cvawvuaa.org.
✅ ADD THIS
```

### Keep these (DON'T DELETE):
```
MX Records - for email (if you use Bluehost email)
TXT Records - for domain verification
NS Records - nameservers (don't touch these!)
```

---

**Questions? Problems? Update this guide with solutions you found!** 🏔️💙💛

**Last Updated:** October 10, 2025
