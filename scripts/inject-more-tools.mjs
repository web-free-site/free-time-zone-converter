#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { moreToolsBlock, cfBeacon } from './more-tools-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

function injectFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('id="wf-more-tools"')) return false;
  if (!html.includes('</body>')) {
    console.warn('No </body> in', filePath);
    return false;
  }
  const injection = `\n${moreToolsBlock}\n${cfBeacon}\n`;
  html = html.replace('</body>', `${injection}</body>`);
  fs.writeFileSync(filePath, html);
  return true;
}

function walk(dir) {
  let injected = 0;
  let scanned = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      const sub = walk(full);
      injected += sub.injected;
      scanned += sub.scanned;
    } else if (ent.name.endsWith('.html')) {
      scanned += 1;
      if (injectFile(full)) injected += 1;
    }
  }
  return { injected, scanned };
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run build-site.mjs first');
  process.exit(1);
}

const { injected, scanned } = walk(DIST);
console.log(`inject-more-tools: ${injected} of ${scanned} HTML file(s) updated in dist/`);