// Render the YouTube channel banner (2560×1440) plus a check image of the device crops.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
  await page.goto('file://' + path.resolve('src/banner.html'));
  await page.waitForFunction(() => window.__ready === true);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'out/banner_raw.png' });
  await browser.close();
})();
