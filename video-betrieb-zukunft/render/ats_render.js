// Render the ATS spot: node render/ats_render.js <spot main|pitch> <out.mp4> [--sfx-only | --from=SECONDS [--to=SECONDS]]
// Also writes out/sfx_ats_<spot>.json (sound cues on the same clock).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const [spot, outFile, flag] = process.argv.slice(2);
  const fps = 30;
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto('file://' + path.resolve('src/ats.html') + `?spot=${spot}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))));
  const dur = await page.evaluate(() => window.__dur);
  fs.writeFileSync(`out/sfx_ats_${spot}.json`, JSON.stringify(await page.evaluate(() => window.SFX)));
  if (flag === '--sfx-only') { await browser.close(); console.log('sfx only', spot); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const from = flag && flag.startsWith('--from=') ? Math.round(parseFloat(flag.slice(7)) * fps) : 0;
  const to = process.argv[5] && process.argv[5].startsWith('--to=') ? Math.round(parseFloat(process.argv[5].slice(5)) * fps) : null;
  const n1 = to !== null ? to : Math.round(dur * fps), t0 = Date.now();
  for (let n = from; n < n1; n++) {
    await page.evaluate(t => window.__seek(t), n / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 150 === 0) console.log(`${spot} frame ${n}/${n1} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', outFile, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
