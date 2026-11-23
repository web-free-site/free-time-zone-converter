#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://free-time-zone-converter.web-free.site';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');

const POPUNDER = 'https://abscloud.org/1/cd4687bdff1b34c60ee463408abd0bb3';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function jsonLdApp() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Time Zone Converter',
    url: SITE,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Convert times between IANA time zones with DST-aware accuracy, live world clocks, and a meeting planner — 100% in your browser.',
  };
}

function jsonLdFaq() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does this time zone converter account for daylight saving time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Conversions use your browser’s built-in IANA timezone database via the Intl API, so daylight saving changes are applied automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data sent to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All conversions, clocks, and meeting overlap calculations run locally in your browser. Nothing you enter is uploaded.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the meeting planner find overlap?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The planner compares working hours (default 9:00–18:00) for each city you add and highlights hours when everyone is within that range in their local time.',
        },
      },
    ],
  };
}

function siteNav(themeBtn = '') {
  return `<header class="site-header">
  <div class="site-header__inner">
    <a class="site-title" href="/">Free Time Zone Converter</a>
    <nav class="site-nav" aria-label="Main">
      <a href="/world-clock/">World clock</a>
      <a href="/meeting-planner/">Meeting planner</a>
      <a href="/how-to-convert-time-zones/">How-to</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </nav>
    ${themeBtn}
  </div>
</header>`;
}

function adSlot(name) {
  const between = name === 'betweenToolContent728x90' ? ' between' : '';
  return `<div class="ad-slot${between}" data-ad-slot="${esc(name)}" aria-label="Advertisement"><div class="ad-slot__label">Advertisement</div></div>`;
}

function converterSection() {
  return `<section class="converter" id="converter" aria-labelledby="conv-title">
  <div class="converter-head">
    <h2 id="conv-title">🕐 Convert time between zones</h2>
    <p class="sub">Pick a date and time, choose source and target cities or IANA zones — DST handled automatically.</p>
  </div>
  <div class="converter-form">
    <label class="conv-field">Date &amp; time <input type="datetime-local" id="conv-dt" class="search" /></label>
    <div class="converter-zones">
      <div class="conv-field">
        <label for="conv-from">From</label>
        <div class="search-wrap">
          <input id="conv-from" class="search" type="search" placeholder="e.g. New York, Europe/London…" autocomplete="off" aria-label="From timezone" />
          <div id="conv-from-suggest" class="suggest" hidden></div>
        </div>
      </div>
      <button type="button" class="btn" id="conv-swap" title="Swap zones" aria-label="Swap zones">⇄</button>
      <div class="conv-field">
        <label for="conv-to">To</label>
        <div class="search-wrap">
          <input id="conv-to" class="search" type="search" placeholder="e.g. Tokyo, Asia/Tokyo…" autocomplete="off" aria-label="To timezone" />
          <div id="conv-to-suggest" class="suggest" hidden></div>
        </div>
      </div>
    </div>
    <div class="toolbar-right" style="margin-top:12px">
      <button type="button" class="btn" id="conv-run">Convert</button>
      <button type="button" class="btn ghost" id="conv-now">Use now</button>
    </div>
    <div id="conv-out" class="converter-out" aria-live="polite"></div>
  </div>
  ${adSlot('nativeBelowResult')}
  ${adSlot('content468x60')}
  ${adSlot('content300x250')}
</section>`;
}

function worldClockBlock(heroTitle, heroSub) {
  return `
    <section class="hero">
      <h1>${heroTitle}</h1>
      <p class="sub">${heroSub}</p>
    </section>
    <div class="toolbar">
      <div class="search-wrap">
        <input id="search" class="search" type="search" placeholder="🔎 Add a city (e.g. Tokyo, Berlin, New York)…" autocomplete="off" aria-label="Search cities" />
        <div id="suggest" class="suggest" hidden></div>
      </div>
      <div class="toolbar-right">
        <label class="check"><input type="checkbox" id="fmt12" /> 12-hour</label>
        <button class="btn ghost" id="btn-now">Reset to now</button>
      </div>
    </div>
    <section id="clocks" class="clocks" aria-live="polite"></section>`;
}

function meetingPlannerBlock() {
  return `<section class="planner" id="meeting-planner-section">
      <div class="planner-head">
        <h2>🗓️ Meeting planner</h2>
        <div class="work-controls">
          <label>Working hours</label>
          <input type="number" id="work-start" min="0" max="23" value="9" class="num" aria-label="Work start hour" />
          <span>–</span>
          <input type="number" id="work-end" min="1" max="24" value="18" class="num" aria-label="Work end hour" />
          <span id="ref-note" class="ref-note"></span>
        </div>
      </div>
      <p class="planner-hint">Columns are hours in your reference city. Green = working hours;
        a highlighted column means <b>everyone</b> is within working hours. Click a column to pin a time.</p>
      <div id="planner" class="planner-grid"></div>
      <div id="best" class="best"></div>
    </section>`;
}

function toolChrome({ showConverter = false, showClocks = true, showPlanner = true, heroTitle, heroSub }) {
  const parts = [];
  if (showConverter) parts.push(converterSection());
  if (showClocks) parts.push(worldClockBlock(heroTitle, heroSub));
  if (showPlanner) parts.push(meetingPlannerBlock());
  return parts.join('\n');
}

function siteFooter() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer footer">
  <div class="footer-inner">
    <span>© ${year} Free Time Zone Converter · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="https://web-free.site/?ref=time-zone-converter">More free tools</a></span>
    <span>Based on <a href="https://github.com/aashishbharti04/worldclock" rel="noopener">worldclock</a> by Aashish Bharti (MIT)</span>
  </div>
  <div class="footer-bottom">DST-aware · 100% in your browser · no accounts</div>
</footer>`;
}

function pageShell({
  title,
  description,
  canonical,
  jsonLd = [],
  bodyMain,
  article = false,
  pageMode = 'home',
}) {
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const adsScript = article ? '/wf-ads.js' : '/js/ads.js';
  const modeScript = pageMode ? `<script>window.PAGE_MODE=${JSON.stringify(pageMode)};</script>` : '';
  const themeBtn = article
    ? ''
    : `<button class="icon-btn" id="btn-theme" aria-label="Toggle theme">🌙</button>`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="theme-color" content="#0b1020">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌍</text></svg>" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/css/style.css" />
${ld}
<script data-cfasync="false" src="${POPUNDER}"></script>
<script src="https://ref.web-free.site/r.js" defer></script>
</head>
<body class="has-sidebar${article ? ' article-page' : ''}">
<a class="skip-link" href="#main">Skip to content</a>
${siteNav(themeBtn)}
${adSlot('header728x90')}
<div class="page-layout">
  <main class="main tool-wrap" id="main">
    ${bodyMain}
    ${article ? '' : '<div class="footer-legacy" id="footer"></div>'}
  </main>
  <aside class="page-aside" aria-label="Sidebar">
    ${adSlot('sidebar160x600')}
    ${adSlot('sidebar160x300')}
  </aside>
</div>
${adSlot('betweenToolContent728x90')}
<p id="smartlink" hidden><a href="#" target="_blank" rel="sponsored noopener noreferrer">Sponsored</a></p>
${siteFooter()}
<div class="ad-mobile-sticky">${adSlot('mobileSticky320x50')}</div>
${modeScript}
${article ? `<script src="${adsScript}" defer></script>` : `<script type="module" src="/assets/js/app.js"></script>\n<script src="${adsScript}" defer></script>`}
</body>
</html>`;
}

function homeBody() {
  return `${toolChrome({
    showConverter: true,
    showClocks: true,
    showPlanner: true,
    heroTitle: `What time is it <span class="grad">everywhere</span>?`,
    heroSub:
      'Convert between zones, add cities to compare live times, and find overlapping hours for global meetings — accurate and fully in your browser.',
  })}
<section class="seo-block planner" aria-label="FAQ">
  <h2>Free time zone converter online</h2>
  <p>Convert a specific date and time between any IANA time zones with automatic daylight saving time rules. Add world clocks for cities you care about and use the meeting planner to spot hours when everyone is within working time.</p>
</section>`;
}

function writePage(relDir, html) {
  const dir = relDir ? path.join(DIST, relDir) : DIST;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const ARTICLES = {
  'world-clock': {
    title: 'World Clock — Live Times Across Cities | Free Time Zone Converter',
    description:
      'See the current time in cities worldwide with DST-aware world clocks. Add cities, compare live times, and switch 12-hour or 24-hour format.',
    body: toolChrome({
      showConverter: false,
      showClocks: true,
      showPlanner: false,
      heroTitle: 'Live <span class="grad">world clock</span>',
      heroSub: 'Add cities to compare current local times. All calculations use your browser — private and offline-friendly.',
    }),
    pageMode: 'clocks',
  },
  'meeting-planner': {
    title: 'Meeting Planner — Overlap Across Time Zones | Free Time Zone Converter',
    description:
      'Find the best meeting hours when teammates are in different time zones. Visual grid of working-hour overlap with DST-aware clocks.',
    body: `${worldClockBlock(
      'Meeting <span class="grad">planner</span>',
      'Add cities, set working hours, and highlight when everyone can meet.',
    )}
${meetingPlannerBlock()}`,
    pageMode: 'planner',
  },
  'how-to-convert-time-zones': {
    title: 'How to Convert Time Zones in Your Browser',
    description:
      'Step-by-step guide to converting times between cities and IANA zones with DST, using the free time zone converter.',
    article: true,
    body: `<article class="legal-page">
  <h1>How to convert time zones</h1>
  <p>Use <strong>Free Time Zone Converter</strong> to translate a meeting time from one city to another without memorizing UTC offsets or daylight saving rules.</p>
  <h2>1. Pick date and time</h2>
  <p>On the <a href="/">home page</a>, enter the local date and time you want to convert, or click <strong>Use now</strong> for the current instant.</p>
  <h2>2. Choose zones</h2>
  <p>Search for a city name (for example <em>Chicago</em>) or paste an IANA zone like <code>America/Chicago</code>. Select <strong>From</strong> and <strong>To</strong> targets, then click <strong>Convert</strong>.</p>
  <h2>3. Trust DST handling</h2>
  <p>Results use the browser <code>Intl</code> API and the built-in IANA database, so spring and fall clock changes are applied for you.</p>
  <h2>4. Compare with world clocks</h2>
  <p>Add the same cities to the <a href="/world-clock/">world clock</a> view to see live times side by side.</p>
  <h2>5. Plan overlap</h2>
  <p>Open the <a href="/meeting-planner/">meeting planner</a>, set working hours (default 9:00–18:00), and look for columns highlighted in gold — every city is within working time.</p>
</article>`,
  },
  privacy: {
    title: 'Privacy Policy — Free Time Zone Converter',
    description: 'Privacy policy for free-time-zone-converter.web-free.site.',
    article: true,
    body: `<article class="legal-page">
  <h1>Privacy Policy</h1>
  <p>Free Time Zone Converter runs time conversions, clocks, and meeting overlap in your browser. We do not collect or store the cities or times you enter.</p>
  <h2>Local storage</h2>
  <p>Your city list, theme preference, and planner settings may be saved in <code>localStorage</code> on your device only.</p>
  <h2>Third parties</h2>
  <p>Advertisements are served by Adsterra partners listed in <code>/ads.json</code>. Cloudflare Web Analytics may process anonymous traffic metrics. Those providers have their own privacy policies.</p>
  <h2>Contact</h2>
  <p>Questions: <a href="mailto:gentil@quevvy.com">gentil@quevvy.com</a> or the <a href="/contact/">contact page</a>.</p>
</article>`,
  },
  terms: {
    title: 'Terms of Use — Free Time Zone Converter',
    description: 'Terms of use for free-time-zone-converter.web-free.site.',
    article: true,
    body: `<article class="legal-page">
  <h1>Terms of Use</h1>
  <p>This site is provided free of charge for personal and informational use. Times and offsets are derived from your browser’s timezone data and may differ from official government announcements during transition periods.</p>
  <p>Do not rely on this tool for aviation, legal filings, or contractual deadlines without independent verification. We disclaim liability for losses arising from incorrect conversions or service outages.</p>
</article>`,
  },
  about: {
    title: 'About — Free Time Zone Converter',
    description: 'About Free Time Zone Converter and the open-source worldclock base.',
    article: true,
    body: `<article class="legal-page">
  <h1>About Free Time Zone Converter</h1>
  <p>Free Time Zone Converter helps you convert times between zones, view live world clocks, and find overlapping meeting hours — entirely in your browser with no accounts.</p>
  <h2>Open-source base</h2>
  <p>The world clock and meeting planner UI are based on <a href="https://github.com/aashishbharti04/worldclock" rel="noopener">aashishbharti04/worldclock</a> (MIT). We thank Aashish Bharti and keep the MIT license in this repository.</p>
  <h2>Timezone data</h2>
  <p>All DST rules come from your browser’s built-in IANA timezone database via the <code>Intl</code> API — no paid API or server-side clock.</p>
  <h2>web-free.site</h2>
  <p>Part of the <a href="https://web-free.site/?ref=time-zone-converter">web-free.site</a> collection of free browser tools.</p>
</article>`,
  },
  contact: {
    title: 'Contact — Free Time Zone Converter',
    description: 'Contact for free-time-zone-converter.web-free.site.',
    article: true,
    body: `<article class="legal-page">
  <h1>Contact</h1>
  <p>Email: <a href="mailto:gentil@quevvy.com">gentil@quevvy.com</a></p>
  <p>For privacy, advertising, or bug reports about free-time-zone-converter.web-free.site, include the page URL in your message.</p>
</article>`,
  },
};

function build() {
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  copyRecursive(path.join(PUBLIC, 'assets'), path.join(DIST, 'assets'));
  copyRecursive(path.join(PUBLIC, 'js'), path.join(DIST, 'js'));
  fs.copyFileSync(path.join(PUBLIC, 'ads.json'), path.join(DIST, 'ads.json'));
  fs.copyFileSync(path.join(PUBLIC, 'wf-ads.js'), path.join(DIST, 'wf-ads.js'));
  const indexNow = '65bf76a4fb2aa9b25bed1591af30ff49.txt';
  const indexNowSrc = path.join(PUBLIC, indexNow);
  if (fs.existsSync(indexNowSrc)) fs.copyFileSync(indexNowSrc, path.join(DIST, indexNow));

  writePage(
    '',
    pageShell({
      title: 'Free Time Zone Converter — DST-Aware World Clock & Meeting Planner',
      description:
        'Convert times between IANA time zones with DST handling, view live world clocks, and plan meetings across cities. Free, private, 100% in your browser.',
      canonical: `${SITE}/`,
      jsonLd: [jsonLdApp(), jsonLdFaq()],
      bodyMain: homeBody(),
      pageMode: 'home',
    }),
  );

  for (const [slug, def] of Object.entries(ARTICLES)) {
    writePage(
      slug,
      pageShell({
        title: def.title,
        description: def.description,
        canonical: `${SITE}/${slug}/`,
        jsonLd: def.article ? [jsonLdApp()] : [],
        bodyMain: def.body,
        article: def.article,
        pageMode: def.pageMode || slug,
      }),
    );
  }

  const urls = [
    '/',
    '/world-clock/',
    '/meeting-planner/',
    '/how-to-convert-time-zones/',
    '/privacy/',
    '/terms/',
    '/about/',
    '/contact/',
  ];

  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
  );

  console.log('build-site: wrote', urls.length, 'pages to dist/');
}

build();