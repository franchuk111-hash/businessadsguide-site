# Business Ads Guide

Static multi-page affiliate funnel for promoting TikTok for Business across multiple GEOs.

## What is included

- Conversion-first homepage
- GEO hub and generated country pages
- How It Works, Why TikTok Ads, Small Business, Agencies, FAQ, Contact
- Privacy Policy, Terms, Advertising / Affiliate Disclaimer
- Blueprint page with strategy and handoff notes
- `sitemap.xml` and `robots.txt`

## Regenerate the FTP / root version

```bash
node scripts/generate.mjs
```

This writes the generated static site into the project root, which matches the current FTP workflow.

## Build the Cloudflare Pages version

```bash
npm run build
```

This writes a clean deploy artifact into `dist/` and includes Cloudflare-specific files:

- `dist/_headers`
- `dist/_redirects`

The generated `dist/` folder is the publish directory for Cloudflare Pages.

## Preview locally

Serve either the project root or `dist/` with any static file server so root-relative links resolve correctly.

Example:

```bash
python3 -m http.server 8000
```

Cloudflare build preview:

```bash
npm run preview:dist
```

Then open:

```text
http://localhost:8000/
```

## Production domain

- Primary domain: `https://businessadsguide.com`

## Cloudflare Pages migration

Recommended setup:

1. Put this project in GitHub.
2. In Cloudflare Pages, create a new project from the repo.
3. Use:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Attach the custom domain `businessadsguide.com`.
5. Add `www.businessadsguide.com` as a secondary domain and configure a Cloudflare redirect to the apex domain.

Notes:

- `wrangler.jsonc` already points Pages at `./dist`.
- `dist/_headers` replaces Apache header logic for Cloudflare Pages.
- `dist/_redirects` normalizes direct `index.html` requests to clean directory URLs.
- `.htaccess` remains available only for the current FTP / Apache workflow.

## Before launch

- Replace placeholder contact details
- Add real analytics / tracking when ready
- Review market-specific compliance requirements before running traffic

## Optional analytics environment variables

The generator supports optional tracking IDs at build time:

- `GA4_MEASUREMENT_ID`
- `GOOGLE_ADS_ID`
- `GOOGLE_SITE_VERIFICATION`

Example:

```bash
GA4_MEASUREMENT_ID=G-XXXXXXX GOOGLE_ADS_ID=AW-XXXXXXX GOOGLE_SITE_VERIFICATION=your_token npm run build
```

If set, the site will inject `gtag.js` and track affiliate CTA clicks using the existing `data-subid` values.
