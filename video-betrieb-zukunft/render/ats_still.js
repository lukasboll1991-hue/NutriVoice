// Stills of the ATS spot at given times: node render/ats_still.js <spot> <t1,t2,...> <outprefix>
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [spot, ts, pre] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto('file://' + path.resolve('src/ats.html') + `?spot=${spot}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  for (const t of ts.split(',').map(Number)) {
    await page.evaluate(x => window.__seek(x), t);
    await page.screenshot({ path: `${pre}_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 80 });
  }
  await browser.close();
})();
