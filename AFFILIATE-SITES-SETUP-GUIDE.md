# Cast N Lures & Cast N Lines – Deployment & Monetization Guide

This guide gets your two new sites live fast and ready to earn via affiliate links and Google Shopping comparisons.

## 0) Get your Amazon Associates “tag” (tracking ID)

Your “tag” is your tracking ID (for Amazon.com it usually ends in `-20`). You’ll place this in both site files so links credit to your account.

Steps (about 10–15 minutes):
1. Publish at least one simple page (use `castnlures.html` or `castnlines.html`) so your site is live.
2. Go to https://affiliate-program.amazon.com/welcome and click Sign Up.
3. Complete the application:
  - List your websites: `https://castnlures.com`, `https://castnlines.com` (and any others)
  - Category: Outdoor Recreation / Sports & Outdoors
  - Site description: “Independent fishing gear recommendations with price comparisons.”
  - Traffic sources: SEO, content, social
4. After you’re in, open Account Settings → Manage Tracking IDs → Add Tracking ID.
  - Create separate tags for organization, e.g. `castnlures-20` and `castnlines-20` (US marketplace example)
5. Turn on the SiteStripe (top of Amazon when logged in) to generate product links; confirm your `tag=...-20` appears in URLs.

Important program notes:
- Make at least 3 qualifying sales within 180 days to remain active.
- Always include clear affiliate disclosure on pages (already included in the templates).
- Use `rel="nofollow sponsored"` on affiliate links (already included).
- Don’t place affiliate links in emails, PDFs, or other offline media per Amazon policy.

## 1) Replace placeholders

Open `castnlures.html` and `castnlines.html` and set:
- `AMAZON_TAG` → your Amazon Associates tracking ID (e.g., `castnlures-20`, `castnlines-20`)
- `GA_MEASUREMENT_ID` → optional Google Analytics 4 ID (format: `G-XXXXXXXXXX`)

## 2) Hosting options

- Simple static hosting works great:
  - Cloudflare Pages (free), Netlify (free), GitHub Pages (free), or your existing host
- Upload the two HTML files plus `assets/` images from this repo (`logo.png`, `favicon.png`)

## 3) DNS setup (example)

At your domain registrar for each domain:
- A record → your host IP (if using cPanel/VPS)
- Or set Nameservers → to Cloudflare/Netlify/etc.

Propagation can take 5–30 minutes.

## 4) Affiliate compliance

Both pages include:
- On-page disclosure
- `rel="nofollow sponsored"` on paid links
- Amazon tag parameter auto-injection on product links

Keep an eye on Amazon’s Operating Agreement for policy updates.

## 5) Add products quickly

Edit the `PRODUCTS` array in each file:
- Use real ASINs from Amazon product pages
- Keep short, clear titles
- Set `category`, `price` range, and `keywords` for Google Shopping button

Example:
```js
{ title: 'Rapala Original Floater F07', asin: 'B000EYY9GM', category: 'Crankbaits', price: '$7–$12', keywords: 'Rapala Original Floater F07' }
```

Troubleshooting – tag not showing in the URL:
- Ensure you replaced `AMAZON_TAG` in both HTML files (and saved/deployed the updated files).
- Clear your browser cache or open in a private window.
- If using SiteStripe, copy the “Text” link option and confirm it includes your `tag` parameter.

## 6) SEO basics

- Update `<title>` and `<meta name="description">` with keywords per page
- Add internal links between relevant sections
- Submit sitemaps using Search Console (optional simple sitemap shown below)

Minimal `sitemap.xml` example:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://castnlures.com/</loc></url>
  <url><loc>https://castnlines.com/</loc></url>
  <url><loc>https://castnfish.com/</loc></url>
  <url><loc>https://castnreels.com/</loc></url>
  <url><loc>https://castnaway.com/</loc></url>
  <url><loc>https://castnrod.com/</loc></url>
  
</urlset>
```

Robots file (`robots.txt`):
```
User-agent: *
Disallow:
Sitemap: https://castnlures.com/sitemap.xml
Sitemap: https://castnlines.com/sitemap.xml
```

## 7) Tracking and testing

- After publishing, click “Buy on Amazon” links to confirm your `tag` is present in the URL
- Use the “Compare on Google” button to ensure queries open correctly
- Verify GA4 is receiving pageviews if configured

## 8) Launch checklist

- [ ] Domain resolving to your host
- [ ] Pages uploaded and loading over HTTPS
- [ ] Amazon tag injected on links
- [ ] Disclosure visible
- [ ] Logo and favicon present
- [ ] Basic guides/links added

## 9) Next steps (growth)

- Add 10–20 more products per site to fully cover categories
- Publish 2–3 buyer’s guides per week (Topwater, Braid vs Fluoro, etc.)
- Add comparison pages (e.g., “Best Crankbaits Under $10”)
- Start a simple email list: weekly deals + new reviews
- Consider a deals page that highlights Google Shopping trends and seasonal sales

If you want, I can pre-fill each site with 20 real products and images (with valid ASINs) and create the sitemap/robots for you. Just say the word and tell me your Amazon tag(s).
