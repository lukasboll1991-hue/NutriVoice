/* Betrieb Zukunft – master timeline.
 * One paused GSAP timeline drives every frame; window.__seek(t) renders time t.
 * Sound cues are collected in window.SFX so the audio mix uses the same clock. */
(function () {
const $ = s => document.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const T = TIMING.cues, W = T.w, CAP = TIMING.captions;
const SFX = [];
const sfx = (t, name, g = 1, pan = 0, p = 1) => SFX.push({ t: +(+t).toFixed(3), name, g, pan, p });
const fmt = v => Math.round(v).toLocaleString('de-DE');
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ---------- static build ---------- */
const grid = $('#grid');
const VX = []; for (let i = 0; i < 12; i++) VX.push(96 + i * 146); VX.push(1824);
VX.forEach((x, i) => { const d = document.createElement('div'); d.className = 'v' + (i === 0 || i === 12 ? ' m' : ''); d.style.left = x + 'px'; grid.appendChild(d); });
[96, 236, 900, 984].forEach((y, k) => { const d = document.createElement('div'); d.className = 'h' + (k === 0 || k === 3 ? ' m' : ''); d.style.top = y + 'px'; grid.appendChild(d); });
[[96, 96], [1824, 96], [96, 984], [1824, 984], [948, 96], [948, 984]].forEach(([x, y]) => { const c = document.createElement('div'); c.className = 'cross'; c.style.left = x + 'px'; c.style.top = y + 'px'; grid.appendChild(c); });
$('#qrbox').innerHTML = window.QR_SVG;
const wave = $('#wave'); for (let i = 0; i < 46; i++) wave.appendChild(document.createElement('i'));
// S5 headline words
const s5w = CAP[12].words;
$('#s5-head').innerHTML = s5w.map(w => `<span class="mask" style="display:inline-block"><span class="w">${w.w}</span></span>`).join(' ');

function build() {
const RECT = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
const M = {
  win: RECT($('#win')), mehmet: RECT($('#cMehmet')), piotr: RECT($('#cPiotr')), lena: RECT($('#cLena')),
  ki: RECT($('#kichip')), tiles: $$('#s3e .ag').map(RECT), chips: $$('#chips .chip').map(RECT),
};
// project a rect through a .cam scale (origin 960/594) plus an inner y offset
const proj = (r, s, dy = 0) => { const ox = 960, oy = 594; return { left: ox + (r.left - ox) * s, top: oy + (r.top + dy - oy) * s, width: r.width * s, height: r.height * s }; };
const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
const vis = (sel, a, b) => { tl.set(sel, { visibility: 'visible' }, a); if (b !== undefined) tl.set(sel, { visibility: 'hidden' }, b); };
const clipIn = (el, t, d = 0.6, ease = 'expo.out') => tl.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease }, t);
const rise = (els, t, d = 0.8, st = 0.08) => tl.fromTo(els, { yPercent: 112 }, { yPercent: 0, duration: d, stagger: st, ease: 'expo.out' }, t);
const stageRect = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
const toolCol = (id, t) => {
  const c = $(id);
  clipIn(c.querySelector('.num'), t, 0.5);
  rise(c.querySelectorAll('.title .mask > span'), t + 0.06, 0.85, 0.07);
  tl.fromTo(c.querySelector('.rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, t + 0.2);
  tl.fromTo(c.querySelector('.sub'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, t + 0.32);
  sfx(t + 0.06, 'swish', 0.35, 0.4);
};
const shake = (sel, t, amp = 5) => {
  tl.to(sel, { keyframes: [{ x: amp, y: -amp * .6, duration: .04 }, { x: -amp * .8, y: amp * .5, duration: .05 }, { x: amp * .5, y: -amp * .3, duration: .05 }, { x: 0, y: 0, duration: .1, ease: 'power2.out' }], ease: 'none' }, t);
};

/* ---------- opening: grid + top bar ---------- */
const vl = $$('#grid .v'), hl = $$('#grid .h'), cr = $$('#grid .cross');
tl.fromTo(vl, { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.022 }, 0);
tl.fromTo(hl, { scaleX: 0 }, { scaleX: 1, duration: 1.0, stagger: 0.06 }, 0.08);
tl.fromTo(cr, { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.03, ease: 'back.out(3)' }, 0.35);
tl.fromTo('#brand', { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 0.18);
tl.fromTo('#chapterRoll', { y: 20 }, { y: 0, duration: 0.6 }, 0.3);
tl.fromTo('#topurl', { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 0.26);
sfx(0.0, 'swish_low', 0.5, 0);
[T.cut12, T.s3a, T.s4, T.s5, T.s6].forEach((t, i) => { tl.to('#chapterRoll', { y: -18 * (i + 1), duration: 0.55, ease: 'expo.inOut' }, t - 0.1); sfx(t, 'tick', 0.25, 0.3, 1.6); });

/* ---------- S1 · status quo ---------- */
vis('#s1', 0, T.cut12);
tl.fromTo('#s1 .cam', { scale: 1 }, { scale: 1.035, duration: T.cut12, ease: 'sine.inOut' }, 0);
tl.fromTo('#s1-panel', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8 }, 0.12);
tl.fromTo('#s1-dispo', { y: 780 }, { y: 0, duration: 0.95, ease: 'back.out(1.15)' }, 0.36);
tl.to('#s1-dispo', { y: 44, duration: 1.7, ease: 'sine.inOut' }, 3.5);
tl.fromTo('#s1-panel .tag', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 1.1);
sfx(0.36, 'rise', 0.5, -0.4);
clipIn('#s1-label', 0.5, 0.6);
[['#inv1', T.spb * 2], ['#inv2', T.spb * 3]].forEach(([el, t]) => {
  tl.fromTo(el, { x: 90, clipPath: 'inset(0% 0% 0% 100%)' }, { x: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75 }, t);
  sfx(t, 'swish', 0.55, 0.5); sfx(t + 0.1, 'thunk', 0.35, 0.5);
});
clipIn('#s1-sum', 0.95, 0.5);
tl.fromTo('#s1-total', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 1.0);
const c1 = { v: 0 };
tl.to(c1, { v: 2500, duration: 0.45, ease: 'power2.out', onUpdate: () => $('#s1-num').textContent = fmt(c1.v) }, 1.05);
tl.to(c1, { v: 4000, duration: 0.5, ease: 'power2.out', onUpdate: () => $('#s1-num').textContent = fmt(c1.v) }, 1.56);
for (let t = 1.06; t < 2.05; t += 0.055) sfx(t, 'tick', 0.18 + 0.1 * rnd(t), 0.5, 1 + (t - 1) * 0.3);
gsap.set('#stD, #stB', { scaleX: -1 });
gsap.set('.st', { transformOrigin: '50% 100%' });
[['#stC', 4], ['#stA', 5], ['#stB', 6], ['#stD', 7]].forEach(([el, b], i) => {
  const t = T.spb * b;
  tl.fromTo(el, { y: 560 }, { y: 0, duration: 0.65, ease: 'back.out(1.25)' }, t);
  tl.to(el, { scaleY: 1.07, duration: 1.6, ease: 'sine.inOut' }, 3.6);
  sfx(t, 'paper', 0.55, [-0.5, 0.1, 0.3, -0.1][i]); sfx(t + 0.14, 'thunk', 0.4, 0, 0.8);
});
clipIn('#s1-year', T.spb * 6, 0.7); clipIn('#s1-case', T.spb * 6.5, 0.7);
// exit: everything flies out, then hard cut
const ex = 5.26;
tl.to(['#stC', '#stA', '#stB', '#stD'], { y: -1150, rotation: i => [-14, 9, 17, -8][i], duration: 0.3, ease: 'power3.in', stagger: 0.025 }, ex);
tl.to(['#inv1', '#inv2', '#s1-total'], { x: 520, duration: 0.3, ease: 'power3.in', stagger: 0.03 }, ex + 0.02);
tl.to('#s1-dispo', { y: 820, duration: 0.3, ease: 'power3.in' }, ex + 0.05);
sfx(ex + 0.06, 'whoosh', 0.42, 0);

/* ---------- S2 · die Idee ---------- */
vis('#s2', T.cut12, T.s3a + 0.05);
tl.set(vl, { x: i => (rnd(i) - 0.5) * 70 }, T.cut12);
tl.set(hl, { y: i => (rnd(i + 9) - 0.5) * 50 }, T.cut12);
tl.to(vl, { x: 0, duration: 0.9, ease: 'elastic.out(1,0.42)', stagger: 0.014 }, T.cut12 + 0.03);
tl.to(hl, { y: 0, duration: 0.9, ease: 'elastic.out(1,0.42)', stagger: 0.04 }, T.cut12 + 0.05);
[0.04, 0.13, 0.25].forEach((d, i) => sfx(T.cut12 + d, 'snap', 0.5 - i * 0.1, [-0.4, 0.4, 0][i]));
clipIn('#s2-label', 5.95, 0.6);
rise('#s2-l0', 5.84, 0.7);
tl.to('#s2-l0', { yPercent: -112, duration: 0.3, ease: 'power3.in' }, W.ihre - 0.3);
rise('#s2-l1', W.ihre - 0.06, 0.85); sfx(W.ihre - 0.06, 'swish', 0.4, -0.2);
rise('#s2-l2', 7.84, 0.85); sfx(7.84, 'swish', 0.45, 0.2);
tl.fromTo('#s2-ul', { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, W.gehoert - 0.05); sfx(W.gehoert - 0.05, 'tick', 0.4, 0, 1.3);
tl.fromTo('#s2-cell', { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, 7.98); sfx(7.98, 'pop', 0.35, 0.6, 0.6);
tl.fromTo('#s2 .cam', { x: 0 }, { x: -36, duration: 3.6, ease: 'sine.inOut' }, T.cut12);
// mask: grid cell opens into S3a
vis('#s3a', T.mask23, T.s3b + 0.06);
tl.fromTo('#s3a', { clipPath: 'inset(700px 96px 180px 1264px)' }, { clipPath: 'inset(0px 0px 0px 0px)', duration: T.s3a - T.mask23, ease: 'power4.inOut' }, T.mask23);
tl.set('#edge', { opacity: 1, left: 1264, top: 700, width: 560, height: 200 }, T.mask23);
tl.to('#edge', { left: -6, top: -6, width: 1932, height: 1092, duration: T.s3a - T.mask23, ease: 'power4.inOut' }, T.mask23);
tl.set('#edge', { opacity: 0 }, T.s3a + 0.01);
sfx(T.mask23, 'whoosh_big', 0.7, 0.3);

/* ---------- S3a · ATS ---------- */
const win = $('#win');
const wr = { x: M.win.left, y: M.win.top };
const rel = r => ({ x: r.left - wr.x, y: r.top - wr.y, w: r.width, h: r.height });
const rM = rel(M.mehmet), rP = rel(M.piotr), rL = rel(M.lena);
const dy = rP.h + 10;
gsap.set('#drag', { left: rM.x, top: rM.y, width: rM.w });
tl.fromTo(win, { y: 70, scale: 0.955 }, { y: 0, scale: 1, duration: 1.0 }, T.mask23 + 0.06);
tl.fromTo([...$$('#win .cc.k'), $('#drag')], { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.03 }, T.s3a + 0.02);
toolCol('#t3a', T.s3a + 0.2);
const cur = $('#cursor');
const grab = { x: wr.x + rM.x + 92, y: wr.y + rM.y + 30 };
const dx = rP.x - rM.x;
tl.fromTo(cur, { x: 1560, y: 1000, opacity: 0 }, { x: grab.x, y: grab.y - 1, opacity: 1, duration: 0.55, ease: 'power3.inOut' }, 10.12);
tl.to(cur, { scale: 0.84, duration: 0.07, ease: 'power2.out' }, 10.68); sfx(10.68, 'click', 0.6, -0.1);
tl.to('#drag', { scale: 1.05, rotation: 3, boxShadow: '0 30px 40px -18px rgba(5,40,53,.45)', duration: 0.25, ease: 'back.out(2)' }, 10.7);
tl.to('#drag', { x: dx, y: rP.y - rM.y, duration: 0.62, ease: 'power2.inOut' }, 10.8);
tl.to(cur, { x: grab.x + dx, y: grab.y + (rP.y - rM.y) - 3, duration: 0.62, ease: 'power2.inOut' }, 10.8);
tl.to(['#cLena', '#win .cc.lo'], { y: -(rL.y - rM.y), duration: 0.45, ease: 'back.out(1.5)', stagger: 0.04 }, 10.86);
tl.to(['#cPiotr', '#cJulia'], { y: dy, duration: 0.45, ease: 'back.out(1.5)', stagger: 0.04 }, 11.0);
sfx(10.8, 'swish', 0.3, 0);
tl.to('#drag', { scale: 1, rotation: 0, boxShadow: '0 4px 10px -8px rgba(5,40,53,.3)', duration: 0.45, ease: 'back.out(2.6)' }, 11.44);
tl.to(cur, { scale: 1, duration: 0.12 }, 11.46); sfx(11.44, 'drop', 0.55, 0);
const c3 = { v: 4 };
tl.to(c3, { v: 5, duration: 0.01, ease: 'none', onUpdate: () => $('#cnt3').textContent = Math.round(c3.v) }, 11.46);
tl.to(cur, { x: grab.x + dx + 220, y: grab.y + 280, duration: 0.6, ease: 'power2.inOut' }, 11.62);
tl.fromTo('#toast', { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.7)' }, 11.6); sfx(11.64, 'ping', 0.55, 0.3);
tl.to(win, { y: -6, duration: 2.6, ease: 'sine.inOut' }, 9.8);

/* wipe A → B (double bar) */
gsap.set(['#wipeA', '#wipeB'], { x: -1920 });
tl.to('#wipeA', { x: 0, duration: 0.2, ease: 'power3.in' }, T.s3b - 0.19);
tl.to('#wipeB', { x: 0, duration: 0.2, ease: 'power3.in' }, T.s3b - 0.14);
tl.to('#wipeB', { x: 1920, duration: 0.26, ease: 'power3.out' }, T.s3b + 0.07);
tl.to('#wipeA', { x: 1920, duration: 0.28, ease: 'power3.out' }, T.s3b + 0.12);
sfx(T.s3b - 0.19, 'whoosh', 0.75, -0.6);

/* ---------- S3b · WhatsApp bot ---------- */
const B0 = T.s3b + 0.06;
vis('#s3b', B0, T.s3c);
tl.fromTo('#s3b .cam', { scale: 1 }, { scale: 1.03, duration: T.s3c - B0, ease: 'sine.inOut' }, B0);
tl.fromTo(['#s3b-panel', '#s3b .popout'], { x: -90 }, { x: 0, duration: 0.8 }, B0);
tl.fromTo('#s3b-person', { y: 560 }, { y: 0, duration: 0.9, ease: 'back.out(1.2)' }, B0 + 0.06);
tl.fromTo('#phone', { y: 170, rotation: 6 }, { y: 0, rotation: 0, duration: 0.95 }, B0 + 0.04);
tl.fromTo('#s3b-panel .tag', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, B0 + 0.7);
sfx(B0 + 0.04, 'swish_low', 0.5, -0.2);
toolCol('#t3b', B0 + 0.2);
rise('#t3b .stat .mask > span', W.uhr - 0.12, 0.8); sfx(W.uhr - 0.12, 'thunk', 0.45, 0.6);
const ms = $$('#chat .m'), gap = 8;
const hs = ms.map(m => m.offsetHeight);
const R = k => hs.slice(k).reduce((a, h) => a + h + gap, 0);
const typH = $('#typing').offsetHeight;
gsap.set('#chat', { y: R(0) });
gsap.set('#typing', { opacity: 0, scale: 0.6, transformOrigin: '0% 100%' });
const chat = [[12.62, 'send'], [13.5, 'ping', 13.08], [14.06, 'send'], [14.68, 'ping', 14.3], [15.22, 'send'], [15.6, 'pop']];
chat.forEach(([t, s, typ], k) => {
  if (typ) {
    tl.to('#chat', { y: R(k) - typH - gap, duration: 0.3, ease: 'power3.out' }, typ);
    tl.to('#typing', { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, typ);
    tl.to('#typing', { opacity: 0, scale: 0.6, duration: 0.1, ease: 'power2.in' }, t - 0.06);
  }
  tl.to('#chat', { y: R(k + 1), duration: 0.42, ease: 'back.out(1.3)' }, t);
  const out = ms[k].classList.contains('out');
  tl.fromTo(ms[k], { scale: 0.7, opacity: 0, transformOrigin: out ? '100% 100%' : (s === 'pop' ? '50% 100%' : '0% 100%') }, { scale: 1, opacity: 1, duration: 0.38, ease: 'back.out(2)' }, t);
  sfx(t, s, s === 'send' ? 0.35 : 0.5, 0.1);
});
tl.fromTo('#atsnote', { x: -150, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65 }, 15.68); sfx(15.7, 'swish', 0.35, 0.5);

/* ---------- S3c · Stundennachweise (hard cut) ---------- */
vis('#s3c', T.s3c, T.s3d);
tl.fromTo('#s3c .cam', { scale: 1.01 }, { scale: 1.035, duration: T.s3d - T.s3c, ease: 'sine.inOut' }, T.s3c);
tl.fromTo('#s3c-person', { y: 300 }, { y: 0, duration: 0.75 }, T.s3c);
tl.fromTo('#ball', { y: -680, rotation: -55 }, { y: 0, rotation: 0, duration: 0.24, ease: 'power2.in' }, T.s3c);
tl.to('#ball', { scaleY: 0.86, scaleX: 1.08, transformOrigin: '50% 90%', duration: 0.05, ease: 'power2.out' }, T.s3c + 0.24);
tl.to('#ball', { scaleY: 1, scaleX: 1, duration: 0.35, ease: 'elastic.out(1,0.4)' }, T.s3c + 0.29);
sfx(T.s3c + 0.24, 'paperthud', 0.75, 0.1);
toolCol('#t3c', T.s3c + 0.18);
tl.to('#ball', { scale: 0.2, rotation: 150, opacity: 0, duration: 0.26, ease: 'power3.in' }, 16.86);
gsap.set('#ring', { opacity: 0 });
tl.fromTo('#ring', { width: 10, height: 10, marginLeft: -5, marginTop: -5 }, { width: 680, height: 680, marginLeft: -340, marginTop: -340, duration: 0.55, ease: 'expo.out' }, 17.0);
tl.to('#ring', { opacity: 1, duration: 0.04, ease: 'none' }, 17.0);
tl.to('#ring', { opacity: 0, duration: 0.45, ease: 'power2.out' }, 17.06);
tl.fromTo('#sheet', { scale: 0.3, rotation: -18, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.62, ease: 'back.out(1.35)' }, 17.0);
sfx(16.9, 'whoosh_pop', 0.6, 0.1);
const rts = $$('#sheet .rt');
rts.slice(0, 5).forEach((r, i) => { tl.fromTo(r, { scale: 0 }, { scale: 1, duration: 0.32, ease: 'back.out(3)' }, 17.42 + i * 0.12); sfx(17.42 + i * 0.12, 'tick', 0.4, 0.15, 1 + i * 0.08); });
const sig = $('#sigpath'), sl = sig.getTotalLength();
gsap.set(sig, { strokeDasharray: sl, strokeDashoffset: sl });
tl.to(sig, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 17.55); sfx(17.55, 'scratch', 0.25, 0.1, 1.3);
tl.fromTo(rts[5], { scale: 0 }, { scale: 1, duration: 0.32, ease: 'back.out(3)' }, 18.04); sfx(18.04, 'tick', 0.4, 0.1, 1.45);
const hrs = { v: 0 };
tl.to(hrs, { v: 39.5, duration: 0.5, ease: 'power2.out', onUpdate: () => $('#hrs').textContent = hrs.v.toFixed(1).replace('.', ',') }, 17.5);
tl.fromTo('#stamp', { scale: 2.3, rotation: -22, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.17, ease: 'power4.in' }, 18.08);
sfx(18.25, 'stamp', 0.5, 0.2); shake('#s3c .cam', 18.25, 5);
tl.fromTo('#wa3c', { scale: 0.7, y: 24, opacity: 0, transformOrigin: '0% 0%' }, { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, 18.44); sfx(18.46, 'ping', 0.55, -0.4);
rise('#t3c .stat .mask > span', 17.65, 0.8); sfx(17.65, 'thunk', 0.4, 0.6);
tl.fromTo('#t3c .statlabel', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 17.85);
tl.to('#sheet', { y: -8, duration: 2.2, ease: 'sine.inOut' }, 17.2);

/* ---------- S3d · Gespräch & Einstellung (match cut on the card) ---------- */
vis('#s3d', T.s3d, T.s3e + 0.32);
gsap.set('#iv', { y: -8 });
tl.fromTo('#s3d .cam', { scale: 1.035 }, { scale: 1.06, duration: 3.6, ease: 'sine.inOut' }, T.s3d);
tl.to('#iv', { y: -16, duration: 3.4, ease: 'sine.inOut' }, T.s3d);
tl.fromTo('#akte', { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, T.s3d + 0.04);
tl.fromTo('#onb', { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, W.einstellung - 0.05);
sfx(T.s3d + 0.04, 'swish', 0.35, -0.5);
toolCol('#t3d', T.s3d + 0.16);
$$('#iv .trl').forEach((p, i) => { const t = [19.48, 19.95, 20.42, 20.88][i]; clipIn(p, t, 0.42, 'power2.out'); sfx(t, 'type', 0.22, 0.05); });
tl.fromTo('#kichip', { scale: 0.6, opacity: 0, transformOrigin: '0% 50%' }, { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(2)' }, 21.12); sfx(21.12, 'blip', 0.5, 0);
const av = $$('#akte .v');
gsap.set(av, { opacity: 0, x: 14 });
av.forEach((v, i) => { const t = 21.3 + i * 0.14; tl.to(v, { opacity: 1, x: 0, duration: 0.35 }, t); tl.fromTo(v.querySelector('.tick'), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t + 0.05); sfx(t + 0.05, 'tick', 0.35, -0.5, 1 + i * 0.07); });
const oi = $$('#onb .it');
gsap.set(oi, { opacity: 0.4 }); gsap.set($$('#onb .tick'), { scale: 0 });
oi.forEach((it, i) => { const t = 21.92 + i * 0.15; tl.to(it, { opacity: 1, duration: 0.2 }, t); tl.to(it.querySelector('.tick'), { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t); sfx(t, 'tick', 0.4, -0.4, 1.2 + i * 0.1); });

/* mask: KI chip opens into the agent hub */
const m0 = T.s3e - 0.2, md = 0.5;
const kp = proj(M.ki, 1.0597, -16);
const kr = { left: kp.left, top: kp.top, width: kp.width, height: kp.height, right: kp.left + kp.width, bottom: kp.top + kp.height };
vis('#s3e', m0, 26.85);
tl.fromTo('#s3e', { clipPath: `inset(${kr.top}px ${1920 - kr.right}px ${1080 - kr.bottom}px ${kr.left}px round 22px)` }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: md, ease: 'power4.inOut' }, m0);
tl.set('#edge', { opacity: 1, left: kr.left, top: kr.top, width: kr.width, height: kr.height }, m0);
tl.to('#edge', { left: -6, top: -6, width: 1932, height: 1092, duration: md, ease: 'power4.inOut' }, m0);
tl.set('#edge', { opacity: 0 }, m0 + md + 0.01);
sfx(m0, 'whoosh_big', 0.4, -0.2);

/* ---------- S3e · Agenten ---------- */
const tiles = $$('#s3e .ag'), all6 = [...tiles, $('#agadd')];
tl.fromTo('#s3e .cam', { scale: 1 }, { scale: 1.03, duration: 3.4, ease: 'sine.inOut' }, m0);
tl.fromTo(all6, { y: 46, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.65, stagger: 0.07, ease: 'back.out(1.4)' }, T.s3e + 0.02);
all6.forEach((_, i) => sfx(T.s3e + 0.02 + i * 0.07, 'pop', 0.22, -0.6 + i * 0.2, 1 + i * 0.05));
toolCol('#t3e', T.s3e + 0.2);
tiles.forEach((tile, i) => {
  const el = tile.querySelector('.task'), txt = el.dataset.t, o = { n: 0 };
  tl.to(o, { n: txt.length, duration: 0.75, ease: 'power1.inOut', onUpdate: () => el.textContent = txt.slice(0, Math.round(o.n)) }, 23.35 + i * 0.12);
  tl.fromTo(tile.querySelector('.bar i'), { scaleX: 0 }, { scaleX: [0.92, 0.7, 1, 0.84, 0.95][i], duration: 1.7 + i * 0.15, ease: 'power2.inOut' }, 23.6 + i * 0.1);
});
sfx(23.35, 'type', 0.2, 0);

/* collapse: tiles become the five chips of S4 */
const chipEls = $$('#chips .chip');
const P0 = T.pull34;
gsap.set(chipEls, { opacity: 0 });
// the real tiles shrink into the chips; their content fades while they move, the chip label fades in
tl.to('#t3e', { x: -60, opacity: 0, duration: 0.28, ease: 'power2.in' }, P0);
tl.to('#agadd', { scale: 0.6, opacity: 0, duration: 0.25, ease: 'power2.in' }, P0);
const CS = 1.03, inv = r => ({ left: 960 + (r.left - 960) / CS, top: 594 + (r.top - 594) / CS, width: r.width / CS, height: r.height / CS });
tiles.forEach((tile, i) => {
  const kids = [...tile.children];
  const lab = document.createElement('div');
  lab.innerHTML = chipEls[i].innerHTML.replace('<i></i>', '<i style="width:9px;height:9px;border-radius:50%;background:#2C8964;box-shadow:0 0 0 4px rgba(44,137,100,.16)"></i>');
  lab.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;font-size:19px;white-space:nowrap;opacity:0';
  tile.appendChild(lab);
  const b = inv(M.chips[i]), t = P0 + i * 0.035, land = t + 0.62;
  tl.to(kids, { opacity: 0, duration: 0.22, ease: 'power2.in' }, t);
  tl.to(tile, { left: b.left, top: b.top, width: b.width, height: b.height, padding: 0, borderRadius: 23, duration: 0.62, ease: 'expo.inOut' }, t);
  tl.to(lab, { opacity: 1, duration: 0.2, ease: 'power2.out' }, t + 0.4);
  tl.set(tile, { visibility: 'hidden' }, land);
  tl.set(chipEls[i], { opacity: 1 }, land);
  tl.fromTo(chipEls[i], { scale: 1.12 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, land);
  sfx(land, 'tick', 0.35, 0.4, 1 + i * 0.06);
});
sfx(P0, 'whoosh', 0.6, 0.3);

/* ---------- S4 · der Beweis ---------- */
const S4 = 26.2;
vis('#s4', S4, T.wipe45 + 0.27);
tl.fromTo('#s4 .cam', { scale: 1 }, { scale: 1.04, duration: T.wipe45 - S4, ease: 'sine.inOut' }, S4);
tl.fromTo('#s4-panel', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75 }, 26.3);
tl.fromTo('#s4-lukas', { y: 780 }, { y: 0, duration: 0.95, ease: 'back.out(1.15)' }, 26.56);
tl.to('#s4-lukas', { y: -14, duration: 11, ease: 'sine.inOut' }, 27.6);
tl.fromTo('#s4-panel .tag', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 27.35);
sfx(26.3, 'swish_low', 0.5, -0.4); sfx(26.56, 'rise', 0.45, -0.4);
clipIn('#s4-label', 27.2, 0.7);
// intro headline synced to "Aufgebaut bei einem Personaldienstleister in Hamburg", then it clears for the numbers
const introLines = [['Aufgebaut', 'bei', 'einem'], ['Personaldienst-'], ['leister', 'in', 'Hamburg.']];
const p8 = CAP[8].words; // Aufgebaut bei einem Personaldienstleister in Hamburg –
const wt = { Aufgebaut: p8[0].s, bei: p8[1].s, einem: p8[2].s, 'Personaldienst-': p8[3].s, leister: p8[3].s + 0.45, in: p8[4].s, 'Hamburg.': p8[5].s };
$('#s4-intro').innerHTML = introLines.map(l => '<div>' + l.map(w => `<span class="mask" style="display:inline-block"><span class="w" data-w="${w}">${w.replace('Hamburg.', '<em style="font-style:normal;color:var(--signal)">Hamburg.</em>')}</span></span>`).join(' ') + '</div>').join('');
$$('#s4-intro .w').forEach(w => rise(w, wt[w.dataset.w] - 0.05, 0.75));
tl.to('#s4-intro .w', { yPercent: -115, duration: 0.45, ease: 'power3.in', stagger: 0.025 }, W.extern - 0.5);
sfx(W.extern - 0.5, 'swish', 0.3, 0.4);
tl.fromTo('#sticker', { scale: 1.7, rotation: 9, opacity: 0 }, { scale: 1, rotation: -4, opacity: 1, duration: 0.2, ease: 'power4.in' }, W.ohne);
sfx(W.ohne + 0.18, 'stamp', 0.5, -0.2, 1.25);
rise('#lead1 .mask > span', W.extern - 0.06, 0.8);
rise('#before', W.rund - 0.1, 0.7);
const c4 = { v: 0 };
tl.to(c4, { v: 4000, duration: 0.7, ease: 'power2.out', onUpdate: () => $('#s4-before').textContent = fmt(c4.v) }, W.rund - 0.05);
for (let t = W.rund - 0.04; t < W.rund + 0.65; t += 0.05) sfx(t, 'tick', 0.16 + 0.08 * rnd(t), 0.4, 1.1);
gsap.set('#strike', { scaleX: 0, rotation: -3 });
tl.to('#strike', { scaleX: 1, duration: 0.36, ease: 'power3.out' }, W.selbst); sfx(W.selbst, 'scratch', 0.6, 0.4);
tl.to('#before', { opacity: 0.5, duration: 0.5, ease: 'power2.out' }, W.selbst + 0.2);
rise('#lead2 .mask > span', W.selbst + 0.04, 0.8);
tl.fromTo('#after', { scale: 1.5, opacity: 0, y: -24 }, { scale: 1, opacity: 1, y: 0, duration: 0.16, ease: 'power4.in' }, T.hit500 - 0.16);
tl.fromTo('#after', { scale: 0.96 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,0.35)', immediateRender: false }, T.hit500);
sfx(T.hit500, 'impact', 1.0, 0); shake('#s4 .cam', T.hit500, 6);
tl.to(vl, { backgroundColor: 'rgba(44,137,100,.45)', duration: 0.06, ease: 'none' }, T.hit500);
tl.to(vl, { backgroundColor: i => (i === 0 || i === 12) ? 'rgba(5,40,53,.22)' : 'rgba(5,40,53,.075)', duration: 0.7, ease: 'power2.out' }, T.hit500 + 0.08);
tl.to(chipEls, { keyframes: [{ y: -9, duration: 0.18, ease: 'power2.out' }, { y: 0, duration: 0.5, ease: 'back.out(3)' }], stagger: 0.05 }, T.hit500 + 0.35);

/* column wipe S4 → S5 */
const cb = $$('.cbar');
gsap.set(cb, { scaleY: 0, transformOrigin: '50% 100%' });
tl.to(cb, { scaleY: 1, duration: 0.26, ease: 'power3.in', stagger: 0.06 }, T.wipe45 - 0.15);
tl.set(cb, { transformOrigin: '50% 0%' }, T.wipe45 + 0.24);
tl.to(cb, { scaleY: 0, duration: 0.32, ease: 'power3.out', stagger: 0.06 }, T.wipe45 + 0.26);
[0, 0.06, 0.12].forEach((d, i) => sfx(T.wipe45 - 0.15 + d, 'swish', 0.4, [-0.6, 0, 0.6][i], 0.9 + i * 0.1));

/* ---------- S5 · drei Wege ---------- */
const S5 = T.wipe45 + 0.25;
vis('#s5', S5, T.fold56 + 0.3);
tl.fromTo('#s5 .cam', { x: 0 }, { x: -24, duration: T.fold56 - S5, ease: 'sine.inOut' }, S5);
clipIn('#s5-label', S5 + 0.1, 0.6);
$$('#s5-head .w').forEach((w, i) => rise(w, s5w[i].s - 0.05, 0.7));
const ways = ['#way1', '#way2', '#way3'].map(s => $(s));
ways.forEach((w, i) => {
  tl.fromTo(w.querySelector('.top'), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, S5 + 0.5 + i * 0.12);
  tl.fromTo(w.querySelector('.n'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 0.14, duration: 0.9 }, S5 + 0.6 + i * 0.1);
  gsap.set(w.querySelector('.n'), { transformOrigin: '0% 100%' });
  gsap.set(w.querySelector('p'), { opacity: 0, y: 16 });
  gsap.set(w.querySelector('.ill'), { opacity: 0 });
});
sfx(S5 + 0.5, 'swish', 0.3, 0);
const activate = (i, t) => {
  const w = ways[i];
  tl.to(w.querySelector('.n'), { opacity: 1, color: '#2C8964', duration: 0.35, ease: 'power2.out' }, t);
  tl.fromTo(w.querySelector('.n'), { scale: 1.1 }, { scale: 1, duration: 0.6, ease: 'back.out(2.2)', immediateRender: false }, t);
  rise(w.querySelector('h3 .mask > span'), t + 0.05, 0.75);
  tl.to(w.querySelector('p'), { opacity: 1, y: 0, duration: 0.6 }, t + 0.16);
  tl.to(w.querySelector('.ill'), { opacity: 1, duration: 0.01 }, t + 0.3);
  sfx(t, 'hit', 0.55, [-0.5, 0, 0.5][i]);
  if (i > 0) {
    const p = ways[i - 1];
    tl.to(p.querySelector('.n'), { color: '#052835', opacity: 0.3, duration: 0.4, ease: 'power2.out' }, t);
    tl.to([p.querySelector('h3'), p.querySelector('p'), p.querySelector('.ill')], { opacity: 0.4, duration: 0.4, ease: 'power2.out' }, t);
  }
};
activate(0, W.weg1);
const st = $$('#way1 .steps > div');
gsap.set(st, { opacity: 0.35 }); gsap.set($$('#way1 .tick'), { scale: 0 });
st.forEach((d, i) => { const t = W.weg1 + 0.55 + i * 0.3; tl.to(d, { opacity: 1, duration: 0.25 }, t); tl.to(d.querySelector('.tick'), { scale: 1, duration: 0.32, ease: 'back.out(3)' }, t); sfx(t, 'tick', 0.4, -0.5, 1 + i * 0.1); });
activate(1, W.weg2);
$$('#way2 .b').forEach((b, i) => { const t = W.weg2 + 0.28 + i * 0.17; tl.fromTo(b, { y: -150, rotation: [-12, 8, -6][i], opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' }, t); sfx(t + 0.2, 'thunk', 0.45, 0, 1 + i * 0.1); });
tl.to('#way2 .frame', { borderColor: 'rgba(44,137,100,.8)', duration: 0.4, ease: 'power2.out' }, W.weg2 + 0.9);
activate(2, W.weg3);
tl.fromTo('#way3 .mini', { scale: 0.86, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6 }, W.weg3 + 0.28);
tl.fromTo('#way3 .ln', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.6, stagger: 0.08 }, W.weg3 + 0.45);
tl.fromTo('#way3 .badge', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.5)' }, W.mass); sfx(W.mass, 'pop', 0.5, 0.5, 0.9);
ways.slice(0, 2).forEach(w => {
  tl.to(w.querySelector('.n'), { opacity: 1, duration: 0.5, ease: 'power2.out' }, 49.35);
  tl.to([w.querySelector('h3'), w.querySelector('p'), w.querySelector('.ill')], { opacity: 1, duration: 0.5, ease: 'power2.out' }, 49.35);
});

/* fold S5 → S6 */
const F = T.fold56;
ways.forEach((w, i) => { const ox = 960 - [96, 680, 1264][i]; tl.to(w, { scaleX: 0, transformOrigin: `${ox}px 50%`, duration: 0.3, ease: 'power4.in' }, F - 0.02 + i * 0.02); });
tl.to(['#s5-label', '#s5-head'], { y: -50, opacity: 0, duration: 0.28, ease: 'power2.in' }, F - 0.05);
sfx(F - 0.08, 'whoosh_rev', 0.6, 0);

/* ---------- S6 · Kontakt ---------- */
vis('#s6', F + 0.22);
const ring = $('#ringpath'), rl = ring.getTotalLength();
gsap.set(ring, { strokeDasharray: rl, strokeDashoffset: rl });
tl.to(ring, { strokeDashoffset: 0, duration: 1.0 }, F + 0.24);
tl.fromTo('#logoimg', { scale: 0.55, rotation: -25, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.95, ease: 'back.out(1.5)' }, T.s6 - 0.12);
// logo lands in the centre on "Betrieb Zukunft", then makes room for the headline
tl.fromTo('#endlogo', { x: 649, y: 89, scale: 1.12 }, { x: 0, y: 0, scale: 1, duration: 0.75, ease: 'expo.inOut' }, W.einfacher - 0.42);
sfx(W.einfacher - 0.42, 'swish_low', 0.35, -0.3);
sfx(T.s6, 'impact', 0.8, 0, 1.15);
CAP[17].words.forEach((w, i) => { rise($$('#endhead .w')[i], w.s - 0.04, 0.7); });
sfx(W.guenstiger, 'swish', 0.3, 0.3);
$$('.pill').forEach((p, i) => { tl.fromTo(p, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, T.pills[i]); sfx(T.pills[i], 'pop', 0.5, -0.3 + i * 0.3, 1 + i * 0.12); });
tl.fromTo('#cta .btn', { y: 34, opacity: 0, clipPath: 'inset(0% 100% 0% 0% round 46px)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 46px)', duration: 0.8 }, T.cta);
const ar = $('#arrow'), al = ar.getTotalLength();
gsap.set(ar, { strokeDasharray: al, strokeDashoffset: al });
tl.to(ar, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, T.cta + 0.35);
const url = $('#url'), ut = url.textContent, uo = { n: 0 };
url.textContent = '';
tl.to(uo, { n: ut.length, duration: 0.6, ease: 'power1.inOut', onUpdate: () => url.textContent = ut.slice(0, Math.round(uo.n)) }, T.cta + 0.28);
tl.fromTo('#qr', { scale: 0.82, y: 24, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' }, T.cta + 0.14);
sfx(T.cta, 'swish', 0.5, 0.2); sfx(T.cta + 0.3, 'click', 0.4, 0.3); sfx(T.cta + 0.2, 'type', 0.18, 0.4);
tl.to('#topurl', { opacity: 0, duration: 0.4, ease: 'power2.out' }, T.cta);
tl.to('#cta .btn', { scale: 1.035, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 58.2);
tl.fromTo('#s6 .cam', { scale: 1 }, { scale: 1.02, duration: 60 - F, ease: 'sine.inOut' }, F);
tl.set({}, {}, T.dur);
return tl;
}

/* ---------- per-frame procedural layers ---------- */
const capEl = $('#cap');
let capCur = -2;
function captions(t) {
  let idx = -1;
  for (let i = 0; i < CAP.length; i++) {
    const p = CAP[i];
    if (p.scene === 6 || i === 8 || i === 12) continue; // these lines are already on screen as kinetic headlines
    const next = CAP[i + 1];
    const until = Math.min(next ? next.start - 0.12 : 1e9, p.end + 0.7);
    if (t >= p.start - 0.12 && t < until) idx = i;
  }
  if (t >= T.fold56 - 0.1) idx = -1;
  if (idx !== capCur) {
    capCur = idx;
    capEl.innerHTML = idx < 0 ? '' : CAP[idx].words.map(w => `<span>${w.w}</span>`).join(' ');
  }
  if (idx < 0) return;
  const p = CAP[idx], k = Math.min(1, Math.max(0, (t - (p.start - 0.12)) / 0.18));
  const e = 1 - Math.pow(1 - k, 3);
  capEl.style.opacity = e; capEl.style.transform = `translateY(${(1 - e) * 14}px)`;
  [...capEl.children].forEach((s, i) => {
    const w = p.words[i];
    s.className = t >= w.e + 0.04 ? 'on' : (t >= w.s - 0.02 ? 'now' : '');
  });
}
const waveBars = [...wave.children];
function proc(t) {
  const f = Math.round(t * 30);
  const g1 = $('#grain1'), g2 = $('#grain2');
  g1.style.transform = `translate(${Math.round((rnd(f) - 0.5) * 100)}px,${Math.round((rnd(f + 7) - 0.5) * 100)}px)`;
  g2.style.transform = `translate(${Math.round((rnd(f + 3) - 0.5) * 100)}px,${Math.round((rnd(f + 11) - 0.5) * 100)}px)`;
  $('#gridwrap').style.transform = `translate(${(Math.sin(t * 0.42) * 5).toFixed(2)}px,${(Math.cos(t * 0.31) * 4).toFixed(2)}px)`;
  if (t > T.s3d - 0.1 && t < T.s3e + 0.4) {
    const live = t - T.s3d;
    waveBars.forEach((b, i) => {
      const env = 0.55 + 0.45 * Math.sin(live * 2.1 + i * 0.05);
      const v = Math.abs(Math.sin(live * 9.3 + i * 0.71) * 0.6 + Math.sin(live * 15.7 + i * 1.37) * 0.4) * env;
      b.style.height = (12 + v * 88).toFixed(1) + '%';
      b.style.opacity = (0.35 + v * 0.65).toFixed(2);
    });
    const s = 12 * 60 + 34 + Math.max(0, Math.floor(live));
    $('#timer').textContent = `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  if (t > T.s3b && t < T.s3c) {
    $$('#typing i').forEach((d, i) => { d.style.transform = `translateY(${(-Math.max(0, Math.sin(t * 9 - i * 0.9)) * 5).toFixed(1)}px)`; });
  }
  if (t > T.s3e - 0.3 && t < T.pull34 + 0.1) {
    $$('#s3e .st i').forEach((d, i) => { d.style.opacity = (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 5 + i))).toFixed(2); });
  }
  captions(t);
}

let tl;
window.__seek = t => { tl.seek(t, false); proc(t); };
document.fonts.ready.then(() => {
  tl = build();
  window.SFX = SFX.sort((a, b) => a.t - b.t);
  window.__dur = T.dur;
  window.__seek(0);
  window.__ready = true;
});
})();
