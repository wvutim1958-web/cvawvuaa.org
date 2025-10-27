# Sentry Error Tracking Setup Guide

## Current Status
Sentry is configured but **NOT ENABLED** (commented out in includes/sentry-snippet.html).

## Why Enable Sentry?
- Track JavaScript errors across your site
- Monitor Firebase connection issues
- Get alerts when users encounter errors
- Detailed error reports with stack traces
- Performance monitoring

## Setup Steps

### 1. Sign Up for Sentry (FREE)
1. Go to https://sentry.io
2. Sign up for a free account
3. Create a new project
   - Platform: **JavaScript**
   - Project name: **CVCWVUAA Website**

### 2. Get Your DSN
1. In Sentry dashboard, go to **Settings** > **Projects**
2. Click on your project
3. Go to **Client Keys (DSN)**
4. Copy the DSN (looks like: `https://abc123@o123456.ingest.sentry.io/789012`)

### 3. Enable Sentry on Your Site

Edit `/workspaces/cvawvuaa.org/includes/sentry-snippet.html`:

**Find this (lines 11-17):**
```html
<!--
<script>
  window.SENTRY_DSN = 'YOUR_SENTRY_DSN'; // Replace with your Sentry DSN
</script>
<script src="https://browser.sentry-cdn.com/7.119.0/bundle.min.js" integrity="sha384-tJ8Z5KqiKdLwYbVq1c3aPVqSjKVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVq" crossorigin="anonymous"></script>
<script src="/js/sentry-config.js"></script>
-->
```

**Replace with:**
```html
<script>
  window.SENTRY_DSN = 'YOUR_ACTUAL_DSN_HERE'; // Paste your DSN from Sentry
</script>
<script src="https://browser.sentry-cdn.com/7.119.0/bundle.min.js" integrity="sha384-tJ8Z5KqiKdLwYbVq1c3aPVqSjKVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVq" crossorigin="anonymous"></script>
<script src="/js/sentry-config.js"></script>
```

### 4. Add Sentry to Your Pages

The snippet needs to be included in HTML pages. Add this line **before the closing `</body>` tag** in:

**Main Public Pages:**
- `index.html`
- `contact.html`
- `membership.html`
- `media.html`
- `alumni-spotlight-submit.html`
- `events/rsvp.html`
- `news.html`
- `events.html`

**Admin Pages (critical for error tracking):**
- `admin/index.html`
- `admin/member-database.html`
- `admin/financial-ledger.html`
- `admin/news-manager.html`
- `admin/event-manager.html`
- All other admin/*.html files

**Add this line:**
```html
<!-- Sentry Error Tracking -->
<script>
  // Load Sentry snippet inline for admin pages
  if (window.SENTRY_DSN) {
    Sentry.init({
      dsn: window.SENTRY_DSN,
      environment: window.location.hostname === 'cvawvuaa.org' ? 'production' : 'development',
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    });
  }
</script>
```

### 5. Test Sentry

After deployment, test that Sentry is working:

```javascript
// Open browser console on your site and run:
throw new Error("Test Sentry Error");
```

You should see this error appear in your Sentry dashboard within a few seconds.

## What Sentry Will Track

✅ **Automatically tracked:**
- JavaScript runtime errors
- Promise rejections
- Network failures
- Firebase connection errors
- Performance issues

✅ **Information collected:**
- Error message and stack trace
- Browser and OS information
- Page URL where error occurred
- User actions leading to error
- Environment (production/development)

## Privacy & Data

Sentry does NOT collect:
- Personal information
- Form inputs
- Passwords
- Email content

It ONLY tracks technical errors and performance data.

## Sentry Dashboard

After enabling, you can:
1. View all errors at https://sentry.io
2. Set up email alerts for critical errors
3. See which pages have the most errors
4. Track error trends over time
5. Get detailed stack traces for debugging

## Cost

**FREE tier includes:**
- 5,000 errors/month
- 1 team member
- 30-day error history
- Email alerts

This is more than enough for the CVCWVUAA website.

## Next Steps

1. ✅ Sign up for Sentry
2. ✅ Get your DSN
3. ✅ Uncomment and update `includes/sentry-snippet.html`
4. ✅ Add Sentry to critical pages (especially admin)
5. ✅ Deploy and test
6. ✅ Configure email alerts in Sentry dashboard

## Current Configuration

The Sentry config (`/js/sentry-config.js`) is already set up with:
- Environment detection (production vs development)
- Performance monitoring (10% sample rate)
- Session replay on errors
- Common error filtering (browser extensions, etc.)

All you need to do is:
1. Get your DSN
2. Uncomment the snippet
3. Add to HTML pages
4. Deploy

---

**Need help?** The configuration is ready - just needs to be activated!
