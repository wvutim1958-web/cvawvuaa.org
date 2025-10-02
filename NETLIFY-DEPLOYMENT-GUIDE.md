# Netlify Deployment (Personal Account) – Cast N Sites

This guide shows how to deploy `castnlures.com` and `castnlines.com` on your personal Netlify account and keep everything separate from alumni sites.

## Keep accounts and sites separate

- Use your personal Netlify login (not the alumni account) for these projects.
- If you also use GitHub, create or select a personal GitHub repo (not the alumni org) for these 2 sites.
- Each site should be its own Netlify Site for clean DNS, logs, and environment variables.

## Option A: Drag-and-drop deploy (fastest)

1. Zip the files for each site separately:
   - `castnlures.com` → include `castnlures.html` and the `assets/` folder (logo.png, favicon.png)
   - `castnlines.com` → include `castnlines.html` and the `assets/` folder
2. Go to https://app.netlify.com/ → Sites → Drag-and-drop your site folder (unzipped works too).
3. Netlify will assign a temporary subdomain like `castnlures-1234.netlify.app`.
4. Test your site (buttons, affiliate tag injection, Google Shopping links).

## Option B: Connect to Git (recommended)

1. Create a new personal GitHub repo for each site (e.g., `castnlures-site`, `castnlines-site`).
2. Commit the site files:
   - `index.html` (rename `castnlures.html` to `index.html` in that repo)
   - `assets/logo.png`, `assets/favicon.png`
3. In Netlify → Add new site → Import from Git → choose your personal GitHub repo.
4. Build settings for a static site:
   - Build command: (leave blank)
   - Publish directory: `/` (root)
5. Deploy.

## Set your custom domains

For each site in Netlify:
1. Site settings → Domain management → Add custom domain → enter `castnlures.com` (or `castnlines.com`).
2. Choose "Yes, add domain".
3. In your domain registrar (Namecheap/GoDaddy), set DNS:
   - Option 1 (recommended): Set the nameservers to Netlify’s DNS and manage DNS in Netlify.
   - Option 2: Keep your registrar’s DNS and create an A/ALIAS/CNAME record per Netlify’s instructions.
4. In Netlify → Domain → Verify DNS config → Enable HTTPS (Let’s Encrypt). Netlify will auto-provision the TLS cert after DNS propagates.

## Replace your Amazon tag

Edit each file and set your tag:
```js
// castnlures.html
const AMAZON_TAG = 'castnlures-20';

// castnlines.html
const AMAZON_TAG = 'castnlines-20';
```

Deploy, then click any “Buy on Amazon” button and confirm the URL contains `?tag=castnlures-20` (or your tag).

## Analytics (optional)

- If you have GA4, set `GA_MEASUREMENT_ID` in each file and redeploy.
- Alternatively, enable Netlify Analytics (paid) for simple traffic insights without GA.

## Protect alumni separation

- Use different Netlify teams (or just separate sites) for personal vs alumni projects.
- Use different GitHub organizations/repos.
- Keep domains and DNS on your personal registrars separate from alumni domains.

## Quick checklist

- [ ] Deployed from personal Netlify account
- [ ] Custom domain added and HTTPS active
- [ ] Amazon tag set and visible in URLs
- [ ] Google Shopping buttons work
- [ ] No alumni repos, teams, or DNS involved

If you’d like, I can split your current files into two minimal site folders (`castnlures/` and `castnlines/`) ready to push to Git and connect to Netlify.
