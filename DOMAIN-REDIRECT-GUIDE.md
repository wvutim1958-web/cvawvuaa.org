# Domain Redirect Setup Guide
## Redirecting cvcwvuaa.org → cvawvuaa.org

**Created:** October 10, 2025  
**Purpose:** Guide for redirecting the old domain (cvcwvuaa.org) to the current domain (cvawvuaa.org)

---

## 🎯 RECOMMENDED APPROACH: Domain Forwarding

**Why this is best for you:**
- ✅ Simplest setup (5-10 minutes)
- ✅ No WordPress hosting costs
- ✅ All traffic goes to your optimized Netlify site
- ✅ Better SEO (consolidates to one domain)
- ✅ One website to maintain

---

## 📋 OPTION 1: Simple Domain Forwarding (START HERE)

### Step 1: Log into Bluehost

1. Go to [https://www.bluehost.com](https://www.bluehost.com)
2. Click **Login** (top right)
3. Enter your Bluehost credentials
4. You should land on the main dashboard

### Step 2: Access Domain Management

1. On the left sidebar, click **Domains**
2. Click **Manage** (or "Domain Management")
3. Find **cvcwvuaa.org** in your domain list
4. Click the **⚙️ Manage** button next to cvcwvuaa.org

### Step 3: Set Up Domain Forwarding

1. Look for one of these options:
   - **Forwarding**
   - **Redirects**
   - **Domain Forwarding**
   - May be under "Advanced" or "Settings" tab

2. Click **Add Forwarding** or **Set Up Redirect**

3. Fill in the redirect details:
   ```
   From: cvcwvuaa.org
   To: https://cvawvuaa.org
   Type: 301 (Permanent Redirect)
   ```

4. **Important Settings:**
   - ✅ **Include www**: Yes (redirect www.cvcwvuaa.org too)
   - ✅ **301 Redirect**: Yes (this is permanent, tells search engines)
   - ⚠️ **Masking/Cloaking**: NO (let the URL change to cvawvuaa.org)
   - ✅ **Include Path**: Yes (preserves any page URLs)

5. Click **Save** or **Add Redirect**

### Step 4: Verify It Works

Wait 5-10 minutes, then test:

1. Open a browser in **Incognito/Private mode**
2. Type: `cvcwvuaa.org`
3. Should redirect to: `cvawvuaa.org`
4. Also test: `www.cvcwvuaa.org`

---

## 📋 OPTION 2: Point DNS to Netlify (Advanced)

**Use this if:** You want both domains to work independently (cvcwvuaa.org and cvawvuaa.org both show the same site)

### Part A: Configure DNS in Bluehost

1. In Bluehost, go to **Domains** → **Manage**
2. Find **cvcwvuaa.org** → Click **DNS** or **Zone Editor**
3. Look for existing **A Records** and **CNAME Records**

4. **Update or Add these records:**

**A Record (Root Domain):**
```
Type: A
Host: @ (or leave blank)
Points to: 75.2.60.5
TTL: 14400 (or 4 hours)
```

**CNAME Record (www):**
```
Type: CNAME
Host: www
Points to: cvawvuaa.org.
TTL: 14400
```
*(Note the trailing dot after .org)*

5. **Delete any conflicting records:**
   - Remove old A records pointing to other IPs
   - Remove CNAME records pointing to WordPress hosting

6. Click **Save Changes**

### Part B: Add Domain in Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Log in to your account
3. Click on your **cvawvuaa** site
4. Go to **Domain Settings** (or **Domain Management**)
5. Click **Add custom domain** or **Add domain alias**
6. Enter: `cvcwvuaa.org`
7. Click **Verify** then **Add domain**
8. Netlify will show a warning about DNS - that's okay, we configured it in Bluehost
9. Click **Add domain** to confirm

### Part C: Enable SSL Certificate

1. Still in Netlify Domain Settings
2. Scroll to **HTTPS** section
3. Click **Verify DNS Configuration**
4. Wait 5-10 minutes for DNS propagation
5. Click **Provision certificate** (or it may auto-provision)
6. Wait for SSL to show as **Active**

### Part D: Verify It Works

Wait 15-30 minutes for DNS propagation, then test:

1. Go to: `http://cvcwvuaa.org` → should redirect to HTTPS
2. Go to: `https://cvcwvuaa.org` → should show your site
3. Go to: `www.cvcwvuaa.org` → should redirect to cvcwvuaa.org
4. Check SSL: Green padlock should appear

---

## 📋 OPTION 3: Transfer Domain to Netlify DNS (Long-term)

**Use this if:** You want to cancel Bluehost entirely and manage everything in one place

### Step 1: Get Netlify Name Servers

1. In Netlify, go to your site → **Domain Settings**
2. Click **Add custom domain** → `cvcwvuaa.org`
3. Netlify will show you name servers like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
4. **Copy these** (keep this tab open)

### Step 2: Update Name Servers in Bluehost

1. In Bluehost, go to **Domains** → **Manage**
2. Find **cvcwvuaa.org** → Click **Manage**
3. Look for **Name Servers** section
4. Click **Change Name Servers** or **Use Custom Name Servers**
5. Paste the 4 Netlify name servers
6. Click **Save**

⚠️ **Warning:** This can take 24-48 hours to fully propagate

### Step 3: Wait and Verify

1. Wait 4-24 hours
2. Check DNS propagation: [https://dnschecker.org](https://dnschecker.org)
3. Enter: `cvcwvuaa.org`
4. Should show Netlify's IP: `75.2.60.5`

---

## 🔍 TROUBLESHOOTING

### "Domain forwarding not available"
- Your hosting plan may not support forwarding
- Try Option 2 (DNS method) instead
- Or contact Bluehost support to enable forwarding

### "DNS not propagating"
- DNS changes take 15 minutes to 48 hours
- Clear your browser cache
- Try incognito/private mode
- Check [dnschecker.org](https://dnschecker.org)

### "SSL certificate error"
- Make sure DNS points to Netlify correctly
- Wait 30 minutes after DNS change
- In Netlify, try **Provision certificate** again
- Check that HTTPS is enabled in Netlify

### "WordPress login still shows"
- Old WordPress cache may still be active
- Verify redirect is set to **301 Permanent**
- Clear browser cache
- Wait 24 hours for old DNS to expire

### "Redirect creates a loop"
- Make sure you're redirecting FROM cvcwvuaa.org TO cvawvuaa.org
- Not the other way around!
- Check no circular redirects exist in Netlify

---

## 💰 COST SAVINGS

After redirect is working:

### Can Cancel from Bluehost:
- ❌ WordPress hosting ($5-30/month)
- ❌ SSL certificate (if paid separately)
- ❌ WordPress maintenance

### Keep with Bluehost:
- ✅ Domain registration (~$15/year) - **Keep this!**
- You're just changing where the domain points

### Optional:
- Consider transferring domain registration to:
  - Netlify (integrated with your site)
  - Namecheap (~$10/year)
  - Cloudflare (~$9/year)

---

## ✅ POST-SETUP CHECKLIST

Once redirect is working:

- [ ] Test all these URLs redirect properly:
  - [ ] `cvcwvuaa.org` → `cvawvuaa.org`
  - [ ] `www.cvcwvuaa.org` → `cvawvuaa.org`
  - [ ] `http://cvcwvuaa.org` → `https://cvawvuaa.org`

- [ ] Update any printed materials with old domain
- [ ] Update email signatures
- [ ] Update social media profiles (if they mention the old domain)
- [ ] Update Google My Business (if applicable)
- [ ] Set up Google Search Console for both domains (to monitor traffic)

- [ ] Consider canceling WordPress hosting (after 30 days of successful redirect)

---

## 📞 NEED HELP?

**Bluehost Support:**
- Phone: 1-888-401-4678
- Live Chat: Available 24/7 in Bluehost dashboard
- Say: "I need to set up a 301 redirect from cvcwvuaa.org to cvawvuaa.org"

**Netlify Support:**
- Support: [https://www.netlify.com/support/](https://www.netlify.com/support/)
- Forums: [https://answers.netlify.com/](https://answers.netlify.com/)
- Docs: [https://docs.netlify.com/domains-https/custom-domains/](https://docs.netlify.com/domains-https/custom-domains/)

---

## 🎉 BENEFITS OF THIS SETUP

Once complete, you'll have:

✅ **One website to maintain** (cvawvuaa.org on Netlify)  
✅ **Both domains work** (old and new)  
✅ **Better SEO** (search engines see one authoritative domain)  
✅ **No WordPress costs** (free Netlify hosting)  
✅ **Faster site** (Netlify CDN vs Bluehost shared hosting)  
✅ **Better security** (automatic HTTPS, no WordPress vulnerabilities)  
✅ **Auto-deploy** (GitHub → Netlify still works)

---

**Questions?** Update this document with your experience so others can benefit! 🏔️💙💛
