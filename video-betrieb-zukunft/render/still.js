// Render one HTML page to a 1920x1080 PNG: node render/still.js src/page.html out/file.png
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [src, dst] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const missing = await page.evaluate(() => [...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family + ' ' + f.status));
  if (missing.length) console.log('font status:', missing);
  await page.screenshot({ path: dst });
  await browser.close();
})();
