/**
 * Adsterra integration (free-invoice-generator pattern, static HTML).
 */
(function () {
  const DEFAULT_BANNER_BASE = 'https://bauval.org/22';
  let adsCache = null;

  async function loadAds() {
    if (adsCache) return adsCache;
    try {
      const res = await fetch('/ads.json');
      adsCache = await res.json();
    } catch {
      adsCache = { enabled: false };
    }
    return adsCache;
  }

  function bannerIframeSrcDoc(key, width, height, scriptBase) {
    const atOptions = JSON.stringify({
      key,
      format: 'iframe',
      height,
      width,
      params: {},
    });
    const src = `${scriptBase.replace(/\/$/, '')}/${key}`;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer-when-downgrade"></head><body style="margin:0;padding:0;overflow:hidden;background:transparent"><script type="text/javascript">var atOptions = ${atOptions};</script><script type="text/javascript" src="${src}"><\/script></body></html>`;
  }

  function injectExternalScript(src, marker, target) {
    if (!src || document.querySelector(`script[data-ad="${marker}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-ad', marker);
    target.appendChild(script);
  }

  function mountBanner(slotEl, def, scriptBase) {
    const iframe = document.createElement('iframe');
    iframe.title = `Advertisement ${slotEl.dataset.adSlot || ''}`;
    iframe.width = def.width;
    iframe.height = def.height;
    iframe.className = 'ad-slot__frame';
    iframe.style.cssText = 'max-width:100%;border:0;overflow:hidden;background:transparent';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms');
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.srcdoc = bannerIframeSrcDoc(def.key, def.width, def.height, scriptBase);
    slotEl.appendChild(iframe);
  }

  async function initAds() {
    const cfg = await loadAds();
    if (!cfg.enabled) return;

    const scriptBase = cfg.bannerScriptBase || DEFAULT_BANNER_BASE;

    if (cfg.socialBar) injectExternalScript(cfg.socialBar, 'social-bar', document.body);
    if (cfg.popunder) injectExternalScript(cfg.popunder, 'popunder', document.head);

    const native = cfg.nativeBanner;
    if (native?.src && native?.containerId) {
      injectExternalScript(native.src, `native-${native.containerId}`, document.body);
    }

    document.querySelectorAll('[data-ad-slot]').forEach((slotEl) => {
      const slot = slotEl.dataset.adSlot;
      const mapped = cfg.slots?.[slot] ?? slot;

      if (mapped === 'nativeBanner' || slot === 'nativeBelowResult') {
        if (native?.containerId) {
          const wrap = document.createElement('div');
          wrap.id = native.containerId;
          wrap.className = 'ad-slot__native';
          slotEl.appendChild(wrap);
        }
        return;
      }

      const def = cfg.banners?.[mapped];
      if (!def?.key) return;
      mountBanner(slotEl, def, scriptBase);
    });

    const smart = document.getElementById('smartlink');
    if (smart && cfg.smartlink?.url) {
      const a = smart.querySelector('a');
      if (a) {
        a.href = cfg.smartlink.url;
        a.textContent = cfg.smartlink.label || 'Sponsored';
        smart.hidden = false;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();