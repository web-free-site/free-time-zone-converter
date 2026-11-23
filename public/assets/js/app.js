import { CITIES, flagEmoji } from "./cities.js";
import {
  zonedParts,
  offsetLabel,
  formatTime,
  formatDate,
  midnightInstant,
  localZone,
  wallTimeToInstant,
  isValidIanaZone,
} from "./tz.js";

const $ = (s) => document.querySelector(s);
const PAGE = window.PAGE_MODE || "home";

// ---------- state ----------
const KEY = "ftzc:v1";
let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.cities) && s.cities.length) return { fmt12: false, workStart: 9, workEnd: 18, ...s };
  } catch { /* ignore */ }
  const tz = localZone();
  const here = CITIES.find((c) => c.tz === tz) || { city: "Local", country: "Your location", cc: "", tz };
  const seed = [here, ...["America/New_York", "Europe/London", "Asia/Tokyo"].map((t) => CITIES.find((c) => c.tz === t)).filter(Boolean)];
  const seen = new Set();
  const cities = seed.filter((c) => c && !seen.has(c.city) && seen.add(c.city));
  return { cities, fmt12: false, workStart: 9, workEnd: 18 };
}
const save = () => localStorage.setItem(KEY, JSON.stringify(state));

let pinned = null;
let convFrom = null;
let convTo = null;

function findCity(q) {
  q = (q || "").trim().toLowerCase();
  if (!q) return null;
  const byCity = CITIES.find((c) => c.city.toLowerCase() === q);
  if (byCity) return byCity;
  const byTz = CITIES.find((c) => c.tz.toLowerCase() === q);
  if (byTz) return byTz;
  if (isValidIanaZone(q)) return { city: q.split("/").pop().replace(/_/g, " "), country: "IANA", cc: "", tz: q };
  const partial = CITIES.find(
    (c) => c.city.toLowerCase().includes(q) || c.tz.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
  );
  return partial || null;
}

// ---------- clocks ----------
function dayNight(hr) { return hr >= 6 && hr < 18 ? "☀️" : "🌙"; }
function renderClocks(now = new Date()) {
  const el = $("#clocks");
  if (!el) return;
  if (!state.cities.length) { el.innerHTML = `<div class="empty">Search above to add your first city 🌐</div>`; return; }
  el.innerHTML = state.cities.map((c, i) => {
    const hr = zonedParts(c.tz, now).hour;
    const ampm = state.fmt12 ? "" : ` · ${formatTime(c.tz, now, true)}`;
    return `<article class="clock ${i === 0 ? "ref" : ""}" data-i="${i}">
      <div class="clock-top">
        <span class="flag">${flagEmoji(c.cc)}</span>
        <div class="clock-place"><b>${c.city}</b><small>${c.country}</small></div>
        <div class="clock-acts">
          <button class="mini-btn ${i === 0 ? "on" : ""}" data-act="ref" title="Set as reference">★</button>
          <button class="mini-btn" data-act="remove" title="Remove">✕</button>
        </div>
      </div>
      <div class="clock-time">${formatTime(c.tz, now, state.fmt12)} <span class="dn">${dayNight(hr)}</span></div>
      <div class="clock-meta">${formatDate(c.tz, now)}${ampm} · ${offsetLabel(c.tz, now)}${i === 0 ? " · reference" : ""}</div>
    </article>`;
  }).join("");
}

// ---------- planner ----------
function hourLabel(hr) { return String(hr).padStart(2, "0"); }
function dateNum(p) { return p.year * 10000 + p.month * 100 + p.day; }

function renderPlanner(now = new Date()) {
  const grid = $("#planner");
  if (!grid) return;
  const ref = state.cities[0];
  if (!ref) { grid.innerHTML = ""; const best = $("#best"); if (best) best.innerHTML = ""; const rn = $("#ref-note"); if (rn) rn.textContent = ""; return; }
  const refNote = $("#ref-note");
  if (refNote) refNote.textContent = `Reference: ${ref.city}`;
  const homeMid = midnightInstant(ref.tz, now);
  const cols = Array.from({ length: 24 }, (_, h) => homeMid + h * 3600000);
  const inRange = (hr) => hr >= state.workStart && hr < state.workEnd;
  const overlap = cols.map((inst) => state.cities.every((c) => inRange(zonedParts(c.tz, inst).hour)));
  const curCol = Math.min(23, Math.max(0, Math.floor((now.getTime() - homeMid) / 3600000)));
  const refDate = dateNum(zonedParts(ref.tz, now));

  let html = `<div class="pg" style="grid-template-columns:170px repeat(24,minmax(34px,1fr))">`;
  html += `<div class="pg-cell pg-corner">City ↓ / Hour →</div>`;
  for (let h = 0; h < 24; h++) {
    const cls = `${overlap[h] ? "ov" : ""} ${h === curCol ? "cur" : ""} ${h === pinned ? "pin" : ""}`;
    html += `<div class="pg-cell pg-head ${cls}" data-col="${h}">${hourLabel(h)}</div>`;
  }
  for (const c of state.cities) {
    html += `<div class="pg-cell pg-label"><span>${flagEmoji(c.cc)} ${c.city}</span><small>${offsetLabel(c.tz, now)}</small></div>`;
    for (let h = 0; h < 24; h++) {
      const p = zonedParts(c.tz, cols[h]);
      const work = inRange(p.hour);
      const dd = dateNum(p) - refDate;
      const tag = dd > 0 ? "<sup>+1</sup>" : dd < 0 ? "<sup>−1</sup>" : "";
      const cls = `${work ? "work" : "off"} ${overlap[h] ? "ov" : ""} ${h === curCol ? "cur" : ""} ${h === pinned ? "pin" : ""}`;
      html += `<div class="pg-cell ${cls}" data-col="${h}">${hourLabel(p.hour)}${tag}</div>`;
    }
  }
  html += `</div>`;
  grid.innerHTML = html;
  renderBest(cols, overlap, homeMid, now);
}

function renderBest(cols, overlap, homeMid, now) {
  const best = $("#best");
  if (!best) return;
  const ref = state.cities[0];
  if (pinned != null) {
    const inst = cols[pinned];
    const rows = state.cities.map((c) =>
      `<li>${flagEmoji(c.cc)} <b>${c.city}</b>: ${formatTime(c.tz, inst, state.fmt12)} · ${formatDate(c.tz, inst)}</li>`).join("");
    best.innerHTML = `<div class="best-card"><h3>📌 Pinned time</h3><ul class="best-list">${rows}</ul>
      <button class="btn ghost sm" id="unpin">Clear pin</button></div>`;
    $("#unpin")?.addEventListener("click", () => { pinned = null; renderPlanner(); });
    return;
  }
  const ranges = [];
  let start = null;
  for (let h = 0; h <= 24; h++) {
    if (h < 24 && overlap[h]) { if (start == null) start = h; }
    else if (start != null) { ranges.push([start, h]); start = null; }
  }
  if (!ranges.length) {
    best.innerHTML = `<div class="best-card warn"><h3>😬 No overlap</h3><p>No hour works for everyone within ${state.workStart}:00–${state.workEnd}:00. Try widening working hours or removing a far-off city.</p></div>`;
    return;
  }
  const items = ranges.map(([a, b]) =>
    `<li>✅ <b>${hourLabel(a)}:00 – ${hourLabel(b)}:00</b> in ${ref.city} — works for all ${state.cities.length} cities</li>`).join("");
  best.innerHTML = `<div class="best-card ok"><h3>🟢 Best meeting windows</h3><ul class="best-list">${items}</ul></div>`;
}

// ---------- search ----------
function renderSuggest(q) {
  const box = $("#suggest");
  if (!box) return;
  q = q.trim().toLowerCase();
  if (!q) { box.hidden = true; return; }
  const have = new Set(state.cities.map((c) => c.city));
  const hits = CITIES.filter((c) => !have.has(c.city) && (c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.tz.toLowerCase().includes(q))).slice(0, 8);
  if (!hits.length) { box.innerHTML = `<div class="sg-empty">No match</div>`; box.hidden = false; return; }
  box.innerHTML = hits.map((c) => `<button class="sg" data-city="${c.city}">${flagEmoji(c.cc)} <b>${c.city}</b> <small>${c.country} · ${offsetLabel(c.tz)}</small></button>`).join("");
  box.hidden = false;
}
function addCity(name) {
  const c = CITIES.find((x) => x.city === name);
  if (c && !state.cities.some((x) => x.city === c.city)) { state.cities.push(c); save(); renderAll(); }
  const search = $("#search");
  if (search) { search.value = ""; }
  const sug = $("#suggest");
  if (sug) sug.hidden = true;
}

// ---------- converter ----------
function convSuggest(inputId, boxId, onPick) {
  const input = $(inputId);
  const box = $(boxId);
  if (!input || !box) return;
  const q = input.value.trim().toLowerCase();
  if (!q) { box.hidden = true; return; }
  const hits = CITIES.filter(
    (c) => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.tz.toLowerCase().includes(q),
  ).slice(0, 8);
  if (!hits.length) { box.innerHTML = `<div class="sg-empty">No match — try IANA format</div>`; box.hidden = false; return; }
  box.innerHTML = hits.map((c) => `<button type="button" class="sg" data-city="${c.city}">${flagEmoji(c.cc)} <b>${c.city}</b> <small>${c.tz}</small></button>`).join("");
  box.hidden = false;
  box.querySelectorAll("[data-city]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const city = CITIES.find((x) => x.city === btn.dataset.city);
      if (city) {
        input.value = `${city.city} (${city.tz})`;
        onPick(city);
        box.hidden = true;
      }
    });
  });
}

function parseConvInstant() {
  const el = $("#conv-dt");
  if (!el || !el.value) return new Date();
  const [d, t] = el.value.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = (t || "00:00").split(":").map(Number);
  if (!convFrom?.tz) return new Date();
  return wallTimeToInstant(convFrom.tz, y, m, day, h, min);
}

function renderConvert() {
  const out = $("#conv-out");
  if (!out) return;
  const from = convFrom || findCity($("#conv-from")?.value.split("(")[0]);
  const to = convTo || findCity($("#conv-to")?.value.split("(")[0]);
  if (!from) {
    out.innerHTML = `<p class="conv-err">Pick a valid <b>From</b> city or IANA zone.</p>`;
    return;
  }
  if (!to) {
    out.innerHTML = `<p class="conv-err">Pick a valid <b>To</b> city or IANA zone.</p>`;
    return;
  }
  convFrom = from;
  convTo = to;
  const instant = parseConvInstant();
  const extra = state.cities
    .filter((c) => c.tz !== from.tz && c.tz !== to.tz)
  const rows = [
    { c: from, label: "Source" },
    { c: to, label: "Target" },
    ...extra.map((c) => ({ c, label: c.city })),
  ];
  out.innerHTML = `<div class="converter-out-card">
    <p class="conv-summary">When it is <b>${formatTime(from.tz, instant, state.fmt12)}</b> on <b>${formatDate(from.tz, instant)}</b> in <b>${from.city}</b> (${offsetLabel(from.tz, instant)}):</p>
    <ul class="best-list">${rows.map(({ c, label }) =>
      c.tz === from.tz
        ? `<li><b>${label}:</b> ${formatTime(c.tz, instant, state.fmt12)} · ${formatDate(c.tz, instant)} · ${offsetLabel(c.tz, instant)}</li>`
        : `<li>${flagEmoji(c.cc)} <b>${label}</b>: ${formatTime(c.tz, instant, state.fmt12)} · ${formatDate(c.tz, instant)} · ${offsetLabel(c.tz, instant)}</li>`,
    ).join("")}</ul>
  </div>`;
}

function initConverter() {
  if (!$("#converter")) return;
  const dt = $("#conv-dt");
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const local = zonedParts(localZone(), now);
  dt.value = `${local.year}-${pad(local.month)}-${pad(local.day)}T${pad(local.hour)}:${pad(local.minute)}`;

  convFrom = state.cities[0] || CITIES.find((c) => c.tz === "America/New_York");
  convTo = state.cities[1] || CITIES.find((c) => c.tz === "Europe/London");
  if (convFrom) $("#conv-from").value = `${convFrom.city} (${convFrom.tz})`;
  if (convTo) $("#conv-to").value = `${convTo.city} (${convTo.tz})`;

  $("#conv-from")?.addEventListener("input", () => convSuggest("#conv-from", "#conv-from-suggest", (c) => { convFrom = c; }));
  $("#conv-to")?.addEventListener("input", () => convSuggest("#conv-to", "#conv-to-suggest", (c) => { convTo = c; }));
  $("#conv-from")?.addEventListener("change", () => { const c = findCity($("#conv-from").value); if (c) convFrom = c; });
  $("#conv-to")?.addEventListener("change", () => { const c = findCity($("#conv-to").value); if (c) convTo = c; });
  $("#conv-run")?.addEventListener("click", renderConvert);
  $("#conv-swap")?.addEventListener("click", () => {
    [convFrom, convTo] = [convTo, convFrom];
    if (convFrom) $("#conv-from").value = `${convFrom.city} (${convFrom.tz})`;
    if (convTo) $("#conv-to").value = `${convTo.city} (${convTo.tz})`;
    renderConvert();
  });
  $("#conv-now")?.addEventListener("click", () => {
    const n = new Date();
    const p = zonedParts(convFrom?.tz || localZone(), n);
    dt.value = `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
    renderConvert();
  });
  renderConvert();
}

// ---------- render ----------
function renderAll() { const now = new Date(); renderClocks(now); renderPlanner(now); }

// ---------- events ----------
$("#search")?.addEventListener("input", (e) => renderSuggest(e.target.value));
$("#search")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { const first = $("#suggest .sg"); if (first) addCity(first.dataset.city); }
  if (e.key === "Escape") { const sug = $("#suggest"); if (sug) sug.hidden = true; }
});
$("#suggest")?.addEventListener("click", (e) => { const b = e.target.closest("[data-city]"); if (b) addCity(b.dataset.city); });
document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) { const sug = $("#suggest"); if (sug) sug.hidden = true; } });

$("#clocks")?.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const card = b.closest("[data-i]"); if (!card) return;
  const i = +card.dataset.i;
  if (b.dataset.act === "remove") { state.cities.splice(i, 1); if (pinned != null) pinned = null; }
  else if (b.dataset.act === "ref") { const [c] = state.cities.splice(i, 1); state.cities.unshift(c); }
  save(); renderAll();
});

$("#planner")?.addEventListener("click", (e) => {
  const c = e.target.closest("[data-col]"); if (!c) return;
  const col = +c.dataset.col; pinned = pinned === col ? null : col; renderPlanner();
});

$("#fmt12")?.addEventListener("change", (e) => { state.fmt12 = e.target.checked; save(); renderAll(); renderConvert(); });
$("#btn-now")?.addEventListener("click", () => { pinned = null; renderAll(); });
const clampWork = () => {
  const ws = $("#work-start");
  const we = $("#work-end");
  if (!ws || !we) return;
  state.workStart = Math.min(23, Math.max(0, +ws.value || 0));
  state.workEnd = Math.min(24, Math.max(state.workStart + 1, +we.value || 24));
  we.value = state.workEnd; save(); renderPlanner();
};
$("#work-start")?.addEventListener("change", clampWork);
$("#work-end")?.addEventListener("change", clampWork);

// ---------- theme ----------
function initTheme() {
  const btn = $("#btn-theme");
  if (!btn) return;
  const saved = localStorage.getItem("ftzc-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  setTheme(saved);
  btn.addEventListener("click", () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
}
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  const btn = $("#btn-theme");
  if (btn) btn.textContent = t === "dark" ? "🌙" : "☀️";
  localStorage.setItem("ftzc-theme", t);
}

// ---------- footer legacy slot (minimal) ----------
function renderFooter() {
  const el = $("#footer");
  if (!el) return;
  el.innerHTML = `<div class="footer-inner"><span>🔒 Private — nothing leaves your browser</span></div>`;
}

// ---------- boot ----------
const fmt = $("#fmt12");
if (fmt) fmt.checked = state.fmt12;
const ws = $("#work-start");
const we = $("#work-end");
if (ws) ws.value = state.workStart;
if (we) we.value = state.workEnd;
initTheme();
renderFooter();
initConverter();
renderAll();
let lastMin = -1;
setInterval(() => {
  const now = new Date();
  if ($("#clocks")) renderClocks(now);
  const min = now.getMinutes();
  if (min !== lastMin && $("#planner")) { lastMin = min; renderPlanner(now); }
}, 1000);