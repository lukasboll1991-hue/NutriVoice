// Render stills at given times: node render/preview.js out/prefix 1.5 3 9.6 ...
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [prefix, ...times] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto('file://' + path.resolve('src/video.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))));
  for (const t of times) {
    await page.evaluate(t => window.__seek(t), +t);
    await page.screenshot({ path: `${prefix}_${String(t).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 85 });
  }
  await browser.close();
})();
