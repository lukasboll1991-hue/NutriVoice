// Export the sound-cue list without rendering frames
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: process.env.F === '45' ? { width: 1080, height: 1350 } : { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve('src/video.html') + (process.env.F === '45' ? '?f=45' : '')); await p.waitForFunction(() => window.__ready === true);
  fs.writeFileSync('out/sfx.json', JSON.stringify(await p.evaluate(() => window.SFX))); await b.close(); console.log('sfx.json written');
})();
