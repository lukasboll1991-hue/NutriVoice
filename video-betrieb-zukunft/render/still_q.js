// Render a page with a query string to PNG: node render/still_q.js src/page.html "f=a" out/file.png [scale]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [src, q, dst, scale] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: Number(scale || 1) });
  await page.goto('file://' + path.resolve(src) + (q ? '?' + q : ''));
  await page.waitForFunction(() => window.__ready === true);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const missing = await page.evaluate(() => [...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family + ' ' + f.status));
  if (missing.length) console.log('font status:', missing);
  await page.screenshot({ path: dst });
  await browser.close();
})();
