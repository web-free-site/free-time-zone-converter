# Free Time Zone Converter

Convert times between IANA time zones (DST-aware), view live world clocks, and plan meetings across cities — 100% in your browser.

**Live site (after deploy):** https://free-time-zone-converter.web-free.site

## Base project

Based on [aashishbharti04/worldclock](https://github.com/aashishbharti04/worldclock) (MIT). See `LICENSE`.

## Build

```bash
npm run build
npm run preview
```

`npm run build` writes static pages to `dist/` and injects the shared “More free tools” block plus Cloudflare Web Analytics on every HTML page.

## Deploy

Deploy from Gentil's environment with Wrangler (`wrangler.toml` points at `dist/`). Do not commit `account_id` tokens.