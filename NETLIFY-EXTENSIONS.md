# Netlify Extensions Setup Guide

This guide will help you set up the recommended Netlify extensions for cvawvuaa.org.

---

## 1. ✅ Netlify Forms (FREE - ALREADY CONFIGURED)

### What's Done:
- ✅ Contact form converted to Netlify Forms
- ✅ Media upload form converted to Netlify Forms
- ✅ Honeypot spam protection enabled

### Next Steps in Netlify Dashboard:

1. **Enable Form Detection**
   - Go to: https://app.netlify.com/sites/cvawvuaa/settings/forms
   - Ensure "Form detection" is ENABLED
   - This should happen automatically on next deploy

2. **Configure Notifications**
   - Go to: https://app.netlify.com/sites/cvawvuaa/settings/forms#form-notifications
   - Click "Add notification"
   - Select "Email notification"
   - Enter: president@cvawvuaa.org
   - Choose which forms to get notified about

3. **View Submissions**
   - After deployment, submissions will appear at:
   - https://app.netlify.com/sites/cvawvuaa/forms

### Benefits:
- ✅ Better spam filtering than FormSubmit.co
- ✅ Submissions stored in Netlify dashboard
- ✅ Export submissions to CSV
- ✅ Webhook support for automation
- ✅ No external dependencies

---

## 2. 💰 Netlify Analytics ($9/month)

### Setup Instructions:

1. **Enable Analytics**
   - Go to: https://app.netlify.com/sites/cvawvuaa/analytics
   - Click "Enable Analytics"
   - Confirm $9/month subscription

2. **What You'll Get:**
   - Page views and unique visitors
   - Top pages and referrers
   - Bandwidth usage
   - Geographic data
   - No performance impact (server-side)
   - No cookies or GDPR issues
   - No code changes needed

3. **Access Your Data:**
   - Dashboard: https://app.netlify.com/sites/cvawvuaa/analytics
   - Data available within hours of enabling

### Benefits:
- ✅ Privacy-friendly (no tracking scripts)
- ✅ 100% accurate (not blocked by ad blockers)
- ✅ No performance impact
- ✅ GDPR compliant
- ✅ Simple, clean interface

---

## 3. ✅ Sentry Error Tracking (FREE tier available)

### Setup Instructions:

1. **Sign Up for Sentry**
   - Go to: https://sentry.io/signup/
   - Choose "Start Free" plan
   - Create an account (FREE for 5,000 errors/month)

2. **Create a Project**
   - Click "Create Project"
   - Platform: Select "JavaScript"
   - Alert frequency: Choose "Alert me on every new issue"
   - Project name: "cvawvuaa-org"
   - Click "Create Project"

3. **Get Your DSN**
   - After creating project, copy your DSN
   - It looks like: `https://abc123@o123456.ingest.sentry.io/987654`
   - Or find it later: Settings > Projects > cvawvuaa-org > Client Keys (DSN)

4. **Enable Sentry on Your Site**
   - Open: `/workspaces/cvawvuaa.org/includes/sentry-snippet.html`
   - Replace `YOUR_SENTRY_DSN` with your actual DSN
   - Uncomment the three script tags
   - Save and commit

5. **Add Snippet Injection in Netlify**
   - Go to: https://app.netlify.com/sites/cvawvuaa/settings/deploys#post-processing
   - Scroll to "Snippet injection"
   - Click "Add snippet"
   - Name: "Sentry Error Tracking"
   - Position: "Before </head>"
   - Paste the content from `/includes/sentry-snippet.html` (uncommented version)
   - Click "Save"

6. **Test Error Tracking**
   - After deployment, open browser console on your site
   - Run: `Sentry.captureMessage('Test error from console');`
   - Check Sentry dashboard for the error

### Benefits:
- ✅ Real-time error alerts
- ✅ Stack traces and context
- ✅ User impact analysis
- ✅ Performance monitoring
- ✅ Integration with Netlify deploys
- ✅ FREE for 5,000 errors/month

---

## Additional Recommended Settings

### Deploy Notifications
1. Go to: https://app.netlify.com/sites/cvawvuaa/settings/notifications
2. Add notification for "Deploy succeeded"
3. Add notification for "Deploy failed"
4. Email: Your email address

### HTTPS Settings
1. Go to: https://app.netlify.com/sites/cvawvuaa/settings/domain
2. Enable "Force HTTPS" (redirects HTTP → HTTPS)
3. Ensure SSL certificate is active

### Asset Optimization
✅ Already enabled in netlify.toml:
- CSS/JS bundling and minification
- HTML minification
- Image compression
- Pretty URLs

---

## Summary of Changes

### Files Modified:
1. `/media.html` - Converted to Netlify Forms
2. `/contact.html` - Converted to Netlify Forms
3. `/js/sentry-config.js` - Created Sentry configuration
4. `/includes/sentry-snippet.html` - Created snippet for injection

### What Happens on Next Deploy:
1. ✅ Forms will start using Netlify Forms instead of FormSubmit.co
2. ✅ Submissions will appear in Netlify dashboard
3. ✅ You'll receive email notifications for form submissions
4. ⏳ Sentry ready to enable (waiting for you to add DSN)
5. ⏳ Analytics ready to enable (waiting for you to subscribe)

---

## Quick Links

- **Forms Dashboard**: https://app.netlify.com/sites/cvawvuaa/forms
- **Analytics**: https://app.netlify.com/sites/cvawvuaa/analytics
- **Sentry Dashboard**: https://sentry.io/organizations/YOUR_ORG/projects/
- **Deploy Settings**: https://app.netlify.com/sites/cvawvuaa/settings
- **Notifications**: https://app.netlify.com/sites/cvawvuaa/settings/notifications

---

## Need Help?

- Netlify Forms Docs: https://docs.netlify.com/forms/setup/
- Netlify Analytics Docs: https://docs.netlify.com/monitor-sites/analytics/
- Sentry JavaScript Docs: https://docs.sentry.io/platforms/javascript/
- Support: Open an issue or contact support through respective platforms
