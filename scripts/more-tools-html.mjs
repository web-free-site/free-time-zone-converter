/** More free tools block + Cloudflare beacon for free-time-zone-converter (ref=time-zone-converter). */

const REF = 'time-zone-converter';
const HUB = `https://web-free.site/?ref=${REF}`;
const R = (slug, path = '/') => `https://${slug}.web-free.site${path}?ref=${REF}`;

const WF_STYLE = `<style>
    .wf-more-tools{box-sizing:border-box;width:100%;margin:2.5rem 0 0;padding:1.5rem 1rem 5rem;border-top:1px solid rgba(0,0,0,.12);background:rgba(248,249,251,.97);color:#1a1a1a;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5}
    .wf-more-tools *{box-sizing:border-box}
    .wf-more-tools h2{margin:0 0 .35rem;font-size:1.15rem;font-weight:700}
    .wf-more-tools .wf-mt-lead{margin:0 0 1rem;color:#333}
    .wf-more-tools .wf-mt-lead a{color:#0b57d0}
    .wf-more-tools .wf-mt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem 1.25rem}
    .wf-more-tools h3{margin:0 0 .4rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:#444}
    .wf-more-tools ul{margin:0;padding:0;list-style:none}
    .wf-more-tools li{margin:0 0 .25rem}
    .wf-more-tools a{color:#0b57d0;text-decoration:underline}
    .wf-more-tools a:hover{text-decoration:none}
    @media (prefers-color-scheme:dark){
      .wf-more-tools{background:rgba(22,24,28,.96);color:#f2f2f2;border-top-color:rgba(255,255,255,.14)}
      .wf-more-tools .wf-mt-lead,.wf-more-tools h3{color:#c8c8c8}
      .wf-more-tools a{color:#8ab4f8}
    }
  </style>`;

function cat(title, items) {
  const lis = items
    .map((item) => {
      if (typeof item === 'string') return `<li>${item}</li>`;
      const [href, label] = item;
      return `<li><a href="${href}">${label}</a></li>`;
    })
    .join('');
  return `<div class="wf-mt-cat"><h3>${title}</h3><ul>${lis}</ul></div>`;
}

const categories = [
  [
    'Guides on this site',
    [
      ['/world-clock/', 'World clock'],
      ['/meeting-planner/', 'Meeting planner'],
      ['/how-to-convert-time-zones/', 'How to convert time zones'],
    ],
    'wf-mt-guides',
  ],
  [
    'Documents &amp; writing',
    [
      [R('free-word-counter'), 'Free Word Counter'],
      [R('free-pdf-converter'), 'Free PDF Converter'],
      [R('free-cv-maker'), 'Free CV Maker'],
      [R('free-invoice-generator'), 'Free Invoice Generator'],
      [R('free-typing-test'), 'Free Typing Test'],
      [R('free-signature-generator'), 'Free Signature Generator'],
      [R('free-email-signature-generator'), 'Free Email Signature Generator'],
    ],
  ],
  [
    'Images &amp; codes',
    [
      [R('free-qr-code-creator'), 'Free QR Code Creator'],
      [R('free-image-resizer'), 'Free Image Resizer'],
      [R('free-image-to-text'), 'Free Image to Text'],
      [R('free-background-remover'), 'Free Background Remover'],
      [R('free-image-compressor'), 'Free Image Compressor'],
      [R('free-heic-to-jpg'), 'Free HEIC to JPG Converter'],
      [R('free-image-upscaler'), 'Free Image Upscaler'],
      [R('free-passport-photo-maker'), 'Free Passport Photo Maker'],
      [R('free-png-to-svg'), 'Free PNG to SVG Converter'],
      [R('free-meme-generator'), 'Free Meme Generator'],
      [R('free-color-picker'), 'Free Color Picker'],
      [R('free-gif-maker'), 'Free GIF Maker'],
      [R('free-photo-editor'), 'Free Photo Editor'],
      [R('free-logo-maker'), 'Free Logo Maker'],
    ],
  ],
  [
    'Calculators &amp; currency',
    [
      [R('free-online-calculator', '/en/'), 'Free Online Calculator'],
      [R('free-currency-converter'), 'Free Currency Converter'],
      [R('free-unit-converter'), 'Free Unit Converter'],
      [R('free-loan-calculator'), 'Free Loan Calculator'],
      [R('free-age-calculator'), 'Free Age Calculator'],
      [R('free-percentage-calculator'), 'Free Percentage Calculator'],
      [R('free-bmi-calculator'), 'Free BMI Calculator'],
    ],
  ],
  [
    'Text &amp; SEO',
    [
      [R('free-ai-humanizer'), 'Free AI Humanizer'],
      [R('free-seo-generator'), 'Free SEO Generator'],
      [R('free-backlink-generator'), 'Free Backlink Generator'],
      [R('free-json-formatter'), 'Free JSON Formatter'],
      [R('free-text-to-speech'), 'Free Text to Speech'],
      [R('free-speech-to-text'), 'Free Speech to Text'],
      [R('free-diff-checker'), 'Free Diff Checker'],
      [R('free-citation-generator'), 'Free Citation Generator'],
    ],
  ],
  [
    'Audio &amp; video',
    [
      [R('free-video-to-mp3'), 'Free Video to MP3 Converter'],
      [R('free-mp3-cutter'), 'Free MP3 Cutter'],
      [R('free-screen-recorder'), 'Free Screen Recorder'],
      [R('free-video-compressor'), 'Free Video Compressor'],
      [R('free-video-to-gif'), 'Free Video to GIF Converter'],
      [R('free-audio-converter'), 'Free Audio Converter'],
      [R('free-video-converter'), 'Free Video Converter'],
    ],
  ],
  [
    'Files',
    [[R('free-zip-tool'), 'Free ZIP Tool']],
  ],
  [
    'Test data',
    [
      [R('free-fake-address-generator'), 'Free Fake Address Generator'],
      [R('free-fake-name-generator'), 'Free Fake Name Generator'],
    ],
  ],
  [
    'Security &amp; passwords',
    [[R('free-password-generator'), 'Free Password Generator']],
  ],
  [
    'Time',
    ['<strong>Free Time Zone Converter</strong>'],
  ],
  [
    'Drawing',
    [[R('free-whiteboard'), 'Free Whiteboard']],
  ],
  [
    'Random &amp; pickers',
    [[R('free-spin-wheel'), 'Free Spin Wheel']],
  ],
];

const grid = categories
  .map(([title, items, extraClass]) => {
    const cls = extraClass ? ` wf-mt-cat ${extraClass}` : '';
    const html = cat(title, items);
    return extraClass ? html.replace('class="wf-mt-cat"', `class="wf-mt-cat ${extraClass}"`) : html;
  })
  .join('');

export const moreToolsBlock = `<aside id="wf-more-tools" class="wf-more-tools" aria-labelledby="wf-mt-title">
  ${WF_STYLE}
  <h2 id="wf-mt-title">More free tools</h2>
  <p class="wf-mt-lead">These utilities run in your browser. Browse the full list on <a href="${HUB}">web-free.site</a>.</p>
  <div class="wf-mt-grid">
    ${grid}
  </div>
</aside>`;

export const cfBeacon = `<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3e2f5f96ab32442ebb6e6f650615b58a"}'></script><!-- End Cloudflare Web Analytics -->`;