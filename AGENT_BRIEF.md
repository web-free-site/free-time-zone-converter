# Cursor agent brief — free-time-zone-converter

Target: https://free-time-zone-converter.web-free.site
Repo name (wrangler `name`): `free-time-zone-converter`
English name: "Free Time Zone Converter". English primary.

Follow every rule in the attached `agent-brief-common.md`, with one SEO override below. Do not write the tool from scratch. Do not deploy. Do not switch models. Push to `main` of this repo when the work is done.

**SEO / language override (takes precedence over the common brief):** do **not** add a French or Swahili landing page, UI translation, or how-to pages. How-to and legal pages are English only. You may omit `hreflang` fr.

This is a **time zone converter** with a **world clock** and a simple **meeting planner**. Users convert a date and time between zones (DST-aware via the browser `Intl` / IANA data), see live city clocks, and find overlapping hours. No accounts, no paid API.

## Recommended base (use this)

- Repo: https://github.com/aashishbharti04/worldclock
- License: MIT (keep `LICENSE`, credit Aashish Bharti in the footer and on `/about`)
- Stars: 0
- Last commit: 18 Jun 2026, 09:14 Africa/Kigali — `9536cc3fb1` on `main`
- Official demo: `https://aashishbharti04.github.io/worldclock/`
- Stack: a complete vanilla HTML/JS static site (zero npm dependencies): live world clocks, DST-aware offsets, and a meeting-planner grid for overlapping working hours. 100% in the browser.
- Cloudflare: yes — static assets / Workers with assets. You must add prerendered HTML for every public page (no bare SPA fallback).
- Verification (this box, 23 Nov 2026, Africa/Kigali): GitHub API. `LICENSE` is a real MIT file (Copyright (c) 2026 Aashish Bharti). Root is `index.html` + `assets` + `docs`; no server, no paid API.
- Why this one: MIT with a real `LICENSE` file, a complete working website that already covers the three high-demand jobs (converter, world clock, meeting overlap), and a live demo.

## Backup (MIT; more stars; converter-first)

- Repo: https://github.com/ArjunSharda/TimeConv
- License: MIT (LICENSE file, Copyright (c) 2022 Arjun Sharda)
- Stars: 24
- Last commit: 19 Aug 2026, 14:41 Africa/Kigali — `e103dd3401` on `main`
- Official demo: `https://arjunsharda.github.io/TimeConv/`
- Static GitHub Pages converter (HTML under `docs/`). If you use this base, add a live world-clock view and a basic meeting overlap, still 100% client-side.

## Do not use these

- Chrome extensions, CLIs, Home Assistant cards, or apps that spoof the system clock.
- Tools that need a paid timezone API or a server.

## What to build on top of aashishbharti04/worldclock

1. Import the base into this repo, keep the MIT license, and credit Aashish Bharti. Omit GitHub Actions workflows if any (the token lacks the `workflow` scope — do not restore them).
2. Rebrand to "Free Time Zone Converter". English primary. No FR/SW translations of the site. The home page must convert a time between two or more time zones (searchable IANA / city list) and show live world clocks. Keep the meeting-planner overlap as a first-class section or prerendered `/meeting-planner`. Do not invent or hard-code stale offsets; use the browser's timezone data so DST is correct.
3. Keep everything 100% in the browser. No accounts, no paid APIs, no API keys.
4. Adsterra only, never AdSense. Use **only** the placeholder keys in this brief (or real keys if a follow-up provides them). Follow the `free-invoice-generator` pattern: all 10 units, banners in isolated iframes, `public/ads.json`. Never set COEP/COOP headers. Ads must not break conversion or the clocks.
5. SEO: prerendered HTML for every page (no bare SPA fallback); unique title, meta description, canonical, OG; JSON-LD (WebApplication + FAQPage); `sitemap.xml` and `robots.txt` for `https://free-time-zone-converter.web-free.site`; English how-to pages, at least `/world-clock`, `/meeting-planner`, and `/how-to-convert-time-zones` (each with its own title, description and canonical); prerendered `/privacy`, `/terms`, `/about`, `/contact`. Canonicals must be `https://free-time-zone-converter.web-free.site`. No French landing page.
6. Footer: credit the upstream project, and add a link back to the hub `https://web-free.site/?ref=time-zone-converter`.
7. On every prerendered HTML page, before `</body>`, add the More free tools block and the Cloudflare Web Analytics beacon (see below). Implement this with `scripts/inject-more-tools.mjs` hooked into `postbuild` or the end of `npm run build`, so a later rebuild cannot drop the home-page snippets. Do not rely on a one-off manual edit of `dist/` / `out/`.
   - The same **"More free tools"** block used on the other web-free.site tools (`id="wf-more-tools"`). Include a "Guides on this site" column for the how-to pages. List every current hub tool, plus the nine other sites in this batch (50 tools in total). Show **Free Time Zone Converter** as bold text, not a self-link. Every outbound tool/hub link must carry `?ref=time-zone-converter`.
     - **Documents & writing:** Free Word Counter (`https://free-word-counter.web-free.site/?ref=time-zone-converter`), Free PDF Converter (`https://free-pdf-converter.web-free.site/?ref=time-zone-converter`), Free CV Maker (`https://free-cv-maker.web-free.site/?ref=time-zone-converter`), Free Invoice Generator (`https://free-invoice-generator.web-free.site/?ref=time-zone-converter`), Free Typing Test (`https://free-typing-test.web-free.site/?ref=time-zone-converter`), Free Signature Generator (`https://free-signature-generator.web-free.site/?ref=time-zone-converter`), Free Email Signature Generator (`https://free-email-signature-generator.web-free.site/?ref=time-zone-converter`).
     - **Images & codes:** Free QR Code Creator (`https://free-qr-code-creator.web-free.site/?ref=time-zone-converter`), Free Image Resizer (`https://free-image-resizer.web-free.site/?ref=time-zone-converter`), Free Image to Text (`https://free-image-to-text.web-free.site/?ref=time-zone-converter`), Free Background Remover (`https://free-background-remover.web-free.site/?ref=time-zone-converter`), Free Image Compressor (`https://free-image-compressor.web-free.site/?ref=time-zone-converter`), Free HEIC to JPG Converter (`https://free-heic-to-jpg.web-free.site/?ref=time-zone-converter`), Free Image Upscaler (`https://free-image-upscaler.web-free.site/?ref=time-zone-converter`), Free Passport Photo Maker (`https://free-passport-photo-maker.web-free.site/?ref=time-zone-converter`), Free PNG to SVG Converter (`https://free-png-to-svg.web-free.site/?ref=time-zone-converter`), Free Meme Generator (`https://free-meme-generator.web-free.site/?ref=time-zone-converter`), Free Color Picker (`https://free-color-picker.web-free.site/?ref=time-zone-converter`), Free GIF Maker (`https://free-gif-maker.web-free.site/?ref=time-zone-converter`), Free Photo Editor (`https://free-photo-editor.web-free.site/?ref=time-zone-converter`), Free Logo Maker (`https://free-logo-maker.web-free.site/?ref=time-zone-converter`).
     - **Calculators & currency:** Free Online Calculator (`https://free-online-calculator.web-free.site/?ref=time-zone-converter`), Free Currency Converter (`https://free-currency-converter.web-free.site/?ref=time-zone-converter`), Free Unit Converter (`https://free-unit-converter.web-free.site/?ref=time-zone-converter`), Free Loan Calculator (`https://free-loan-calculator.web-free.site/?ref=time-zone-converter`), Free Age Calculator (`https://free-age-calculator.web-free.site/?ref=time-zone-converter`), Free Percentage Calculator (`https://free-percentage-calculator.web-free.site/?ref=time-zone-converter`), Free BMI Calculator (`https://free-bmi-calculator.web-free.site/?ref=time-zone-converter`).
     - **Text & SEO:** Free AI Humanizer (`https://free-ai-humanizer.web-free.site/?ref=time-zone-converter`), Free SEO Generator (`https://free-seo-generator.web-free.site/?ref=time-zone-converter`), Free Backlink Generator (`https://free-backlink-generator.web-free.site/?ref=time-zone-converter`), Free JSON Formatter (`https://free-json-formatter.web-free.site/?ref=time-zone-converter`), Free Text to Speech (`https://free-text-to-speech.web-free.site/?ref=time-zone-converter`), Free Speech to Text (`https://free-speech-to-text.web-free.site/?ref=time-zone-converter`), Free Diff Checker (`https://free-diff-checker.web-free.site/?ref=time-zone-converter`), Free Citation Generator (`https://free-citation-generator.web-free.site/?ref=time-zone-converter`).
     - **Audio & video:** Free Video to MP3 Converter (`https://free-video-to-mp3.web-free.site/?ref=time-zone-converter`), Free MP3 Cutter (`https://free-mp3-cutter.web-free.site/?ref=time-zone-converter`), Free Screen Recorder (`https://free-screen-recorder.web-free.site/?ref=time-zone-converter`), Free Video Compressor (`https://free-video-compressor.web-free.site/?ref=time-zone-converter`), Free Video to GIF Converter (`https://free-video-to-gif.web-free.site/?ref=time-zone-converter`), Free Audio Converter (`https://free-audio-converter.web-free.site/?ref=time-zone-converter`), Free Video Converter (`https://free-video-converter.web-free.site/?ref=time-zone-converter`).
     - **Files:** Free ZIP Tool (`https://free-zip-tool.web-free.site/?ref=time-zone-converter`).
     - **Test data:** Free Fake Address Generator (`https://free-fake-address-generator.web-free.site/?ref=time-zone-converter`), Free Fake Name Generator (`https://free-fake-name-generator.web-free.site/?ref=time-zone-converter`).
     - **Security & passwords:** Free Password Generator (`https://free-password-generator.web-free.site/?ref=time-zone-converter`).
     - **Time:** **Free Time Zone Converter**.
     - **Drawing:** Free Whiteboard (`https://free-whiteboard.web-free.site/?ref=time-zone-converter`).
     - **Random & pickers:** Free Spin Wheel (`https://free-spin-wheel.web-free.site/?ref=time-zone-converter`).
   - The same Cloudflare Web Analytics tag used on the other sites: `<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3e2f5f96ab32442ebb6e6f650615b58a"}'></script><!-- End Cloudflare Web Analytics -->`
8. `wrangler.toml`: `name = "free-time-zone-converter"`, `[assets]` pointing at the static build output (`dist` or `out`). Use `html_handling = "auto-trailing-slash"` and `not_found_handling = "none"`. Custom domain `free-time-zone-converter.web-free.site`. **Do not put `account_id` (or API tokens) in the committed file.** **Do not deploy.** Push to this repo only. Deploy happens from Gentil's box. Add a `.assetsignore` so Worker assets do not publish `AGENT_BRIEF.md`, `wrangler.toml`, `package.json`, `package-lock.json`, `.git/`, `node_modules/`, or other source/config files.
9. Test: production build, run locally, convert a time between at least two zones (include one that observes DST), add two or more city clocks, try the meeting planner, check mobile at 390px, fix bugs. Critique your own result and fix issues.
10. Push everything to `main`. Final report: base repo + license, pages, tests and results, remaining caveats, commit hash.

## Adsterra ad codes

Real Adsterra codes are not ready yet (sites are not live). **Do not invent real-looking keys.** Wire all 10 units and `public/ads.json` with the exact placeholder strings below (32 characters each, prefix `wf23bplaceholder`). After a browser agent writes real keys to `adsterra-codes.md`, a later swap (or a follow-up to you with real keys) will replace them before deploy.

Code formats (KEY = the 32-char placeholder, later a 32-hex hash):
- Popunder: <script data-cfasync="false" src="https://abscloud.org/1/KEY"></script>
- Native Banner: <script async="async" data-cfasync="false" src="https://bauval.org/21/KEY"></script><div id="container-KEY"></div>
- Social Bar: <script data-cfasync="false" src="https://bauval.org/14/KEY"></script>
- Banner WxH: <script>atOptions = {'key':'KEY','format':'iframe','height':H,'width':W,'params':{}};</script><script src="https://bauval.org/22/KEY"></script>
- Smartlink URL: https://araplhn.org/4/KEY

## free-time-zone-converter.web-free.site — site ID 6222778
Popunder cd4687bdff1b34c60ee463408abd0bb3
Native Banner f7b8906ea81d785da3010d106db6928e
Smartlink 6a7faadfa724e1e3351978647be90aeb
Social Bar 148455b1aeb9f355c5f8852502b00f68
468x60 aa94cfbaea5a5bacf2db45a3ea71203c
160x300 4852f67ea6d26e88b4324da1cb7eaaaf
320x50 d56a3e2c4bd87d57b6564d9e8bf93ec3
300x250 dba1845000addb21618c55a79ef1e8eb
160x600 caa9d0b86ba5c047cf433e95ae1b5aad
728x90 475ec419b49bf7852d3feafa3b687924
