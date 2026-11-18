// Takes light+dark screenshots of the live app for every shots/*.json entry. PII is blurred.
// Usage: HC_PASSWORD=... node scripts/shoot.mjs [module ...]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/Users/pylot/Downloads/herocloud-github/package.json');
const { chromium } = require('playwright-core');
const BASE = process.env.HC_BASE ?? 'http://127.0.0.1:5180';
const EMAIL = process.env.HC_EMAIL ?? 'julia.hartmann@aurum-gold.de';
const only = process.argv.slice(2);
const files = fs.readdirSync('shots').filter((f) => f.endsWith('.json') && (!only.length || only.includes(f.slice(0, -5))));
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/contacts');
await page.getByTestId('login-email').fill(EMAIL);
await page.getByTestId('login-password').fill(process.env.HC_PASSWORD);
await page.getByTestId('login-submit').click();
await page.waitForSelector('[data-testid="login-page"]', { state: 'detached', timeout: 60000 });
const PII = /[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d ()\-]{7,}\d/;
for (const f of files) {
  const mod = f.slice(0, -5);
  fs.mkdirSync(`public/shots/${mod}`, { recursive: true });
  for (const s of JSON.parse(fs.readFileSync(`shots/${f}`, 'utf8'))) {
    for (const theme of ['light', 'dark']) {
      try {
        await page.evaluate((t) => { localStorage.setItem('theme', t); document.documentElement.dataset.theme = t; }, theme);
        await page.goto(BASE + s.path, { waitUntil: 'networkidle' });
        await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
        if (s.waitFor) await page.getByText(s.waitFor).first().waitFor({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(600);
        // blur text nodes that look like emails / phone numbers
        await page.evaluate((src) => {
          const re = new RegExp(src);
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const els = new Set();
          while (w.nextNode()) if (re.test(w.currentNode.nodeValue) && w.currentNode.parentElement) els.add(w.currentNode.parentElement);
          els.forEach((e) => (e.style.filter = 'blur(5px)'));
        }, PII.source);
        await page.screenshot({ path: `public/shots/${mod}/${s.name}-${theme}.png` });
        console.log('ok', mod, s.name, theme);
      } catch (e) { console.log('FAIL', mod, s.name, theme, String(e).split('\n')[0]); }
    }
  }
}
await browser.close();
