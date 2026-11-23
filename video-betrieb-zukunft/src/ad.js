/* Betrieb Zukunft – YouTube ad cuts.
 * ?spot=a (30 s) | b (15 s) | c (6 s bumper), ?f=916 for the vertical Shorts version.
 * Same scene markup and look as the 60 s spot; one paused GSAP timeline, window.__seek(t). */
(function () {
const $ = s => document.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = new URLSearchParams(location.search);
const SPOT = Q.get('spot') || 'a';
const V916 = Q.get('f') === '916';
if (V916) { for (const el of [document.documentElement, document.body]) el.classList.add('v45', 'v916'); }
const SP = AD.spots[SPOT], W = SP.w, CAP = SP.captions, DUR = SP.dur;
const B = n => +(n * AD.spb).toFixed(3);
const SW = V916 ? 1080 : 1920, SH = V916 ? 1920 : 1080, OY = V916 ? 250 : 0;
const GM = V916 ? 60 : 96, GC = V916 ? 140 : 122, NC = V916 ? 6 : 12;
const HL = V916 ? [OY + 96, OY + 190, OY + 1130, OY + 1254] : [96, 236, 900, 984];
const CX = SW / 2, CY = OY + (V916 ? 1350 : 1080) * 0.55;   // .cam origin (50% 55% of the scene box)
const SFX = [];
const sfx = (t, name, g = 1, pan = 0, p = 1) => SFX.push({ t: +(+t).toFixed(3), name, g, pan, p });
const fmt = v => Math.round(v).toLocaleString('de-DE');
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const w = k => { const v = W[k]; if (v === undefined) throw new Error('word ' + k); return v; };

/* ---------- static build ---------- */
const grid = $('#grid');
const VX = []; for (let i = 0; i < NC; i++) VX.push(GM + i * (GC + 24)); VX.push(SW - GM);
VX.forEach((x, i) => { const d = document.createElement('div'); d.className = 'v' + (i === 0 || i === NC ? ' m' : ''); d.style.left = x + 'px'; grid.appendChild(d); });
HL.forEach((y, k) => { const d = document.createElement('div'); d.className = 'h' + (k === 0 || k === 3 ? ' m' : ''); d.style.top = y + 'px'; grid.appendChild(d); });
[[GM, HL[0]], [SW - GM, HL[0]], [GM, HL[3]], [SW - GM, HL[3]], [CX - 12, HL[0]], [CX - 12, HL[3]]].forEach(([x, y]) => { const c = document.createElement('div'); c.className = 'cross'; c.style.left = x + 'px'; c.style.top = y + 'px'; grid.appendChild(c); });
const wave = $('#wave'); for (let i = 0; i < 46; i++) wave.appendChild(document.createElement('i'));
$('#sticker').style.display = 'none';
$('#ring').style.display = 'none';
$('#atsnote').style.display = 'none';
$('#s4-intro') && ($('#s4-intro').style.display = 'none');

function build() {
const RECT = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
const M = { ki: RECT($('#kichip')), tiles: $$('#s3e .ag').map(RECT), chips: $$('#chips .chip').map(RECT), cell: RECT($('#s2-cell')), logo: RECT($('#endlogo')), s2t: RECT($('#s2-type')) };
const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
const vis = (sel, a, b) => { tl.set(sel, { visibility: 'visible' }, a); if (b !== undefined) tl.set(sel, { visibility: 'hidden' }, b); };
const clipIn = (el, t, d = 0.6, ease = 'expo.out') => tl.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease }, t);
const rise = (els, t, d = 0.8, st = 0.08) => tl.fromTo(els, { yPercent: 112 }, { yPercent: 0, duration: d, stagger: st, ease: 'expo.out' }, t);
const toolCol = (id, t, fast = 1) => {
  const c = $(id);
  clipIn(c.querySelector('.num'), t, 0.4 * fast);
  rise(c.querySelectorAll('.title .mask > span'), t + 0.03, 0.6 * fast, 0.05);
  tl.fromTo(c.querySelector('.rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.7 * fast }, t + 0.1);
  tl.fromTo(c.querySelector('.sub'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 * fast }, t + 0.16);
};
const shake = (sel, t, amp = 5) => tl.to(sel, { keyframes: [{ x: amp, y: -amp * .6, duration: .04 }, { x: -amp * .8, y: amp * .5, duration: .05 }, { x: amp * .5, y: -amp * .3, duration: .05 }, { x: 0, y: 0, duration: .1, ease: 'power2.out' }], ease: 'none' }, t);
// clip-path insets are relative to the scene box, which starts at OY in 9:16
const insetOf = r => `inset(${r.top - OY}px ${SW - r.right}px ${OY + (V916 ? 1350 : 1080) - r.bottom}px ${r.left}px)`;
const proj = (r, s, dy = 0) => ({ left: CX + (r.left - CX) * s, top: CY + (r.top + dy - CY) * s, width: r.width * s, height: r.height * s });
const fullEdge = { left: -6, top: OY - 6, width: SW + 12, height: (V916 ? 1350 : 1080) + 12 };

// transition bars start parked off-screen in every spot
gsap.set(['#wipeA', '#wipeB'], { x: -SW });
gsap.set('.cbar', { scaleY: 0 });

/* ---------- opening (grid + bar), everything already readable on frame 0 ---------- */
const vl = $$('#grid .v'), hl = $$('#grid .h'), cr = $$('#grid .cross');
tl.fromTo(vl, { scaleY: 0.35 }, { scaleY: 1, duration: 0.8, stagger: 0.015 }, 0);
tl.fromTo(hl, { scaleX: 0.3 }, { scaleX: 1, duration: 0.9, stagger: 0.04 }, 0);
tl.fromTo(cr, { scale: 0.4 }, { scale: 1, duration: 0.45, stagger: 0.02, ease: 'back.out(3)' }, 0.05);
tl.fromTo('#brand', { x: -12 }, { x: 0, duration: 0.6 }, 0);

/* ---------- sections ---------- */
function hook(t0, tOut) {
  gsap.set('#s0', { visibility: 'visible' });               // visible on frame 0 (thumbnail, skip window)
  tl.set('#s0', { visibility: 'hidden' }, tOut + 0.4);
  tl.fromTo('#s0-type', { scale: 1.06, transformOrigin: '0% 50%' }, { scale: 1, duration: 1.2, ease: 'power2.out' }, t0);   // fully readable on frame 0
  tl.fromTo('#s0-ul', { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, t0 + 0.25);
  tl.fromTo('#s0 .cam', { scale: 1.04 }, { scale: 1, duration: tOut - t0 + 0.3, ease: 'power2.out' }, t0);
  tl.to('#s0-h', { yPercent: -115, duration: 0.35, ease: 'power3.in' }, tOut);
  tl.to('#s0-ul', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.3, ease: 'power3.in' }, tOut);
  sfx(t0 + 0.02, 'impact', 0.4, 0, 1.3); sfx(tOut, 'swish', 0.4, 0);
}
function status(t0, tInv1, tInv2, tCount, tEnd) {
  vis('#s1', t0, tEnd);
  tl.fromTo('#s1 .cam', { scale: 1 }, { scale: 1.03, duration: tEnd - t0, ease: 'sine.inOut' }, t0);
  tl.fromTo('#s1-panel', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, t0);
  tl.fromTo('#s1-dispo', { y: 780 }, { y: 0, duration: 0.75, ease: 'back.out(1.15)' }, t0 + 0.12);
  tl.to('#s1-dispo', { y: 40, duration: tEnd - t0 - 1.4, ease: 'sine.inOut' }, t0 + 1.1);
  tl.fromTo('#s1-panel .tag', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, t0 + 0.5);
  sfx(t0, 'swish_low', 0.3, -0.4); sfx(t0 + 0.12, 'rise', 0.25, -0.4);
  clipIn('#s1-label', t0 + 0.15, 0.5);
  [['#inv1', tInv1], ['#inv2', tInv2]].forEach(([el, t]) => {
    tl.fromTo(el, { x: 90, clipPath: 'inset(0% 0% 0% 100%)' }, { x: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, t);
    sfx(t, 'swish', 0.5, 0.5); sfx(t + 0.08, 'thunk', 0.3, 0.5);
  });
  clipIn('#s1-sum', tInv1 + 0.05, 0.45);
  tl.fromTo('#s1-total', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, tInv1 + 0.05);
  const c = { v: 0 };
  tl.to(c, { v: 4000, duration: tCount - tInv1, ease: 'power2.out', onUpdate: () => $('#s1-num').textContent = fmt(c.v) }, tInv1 + 0.1);
  for (let t = tInv1 + 0.1; t < tCount + 0.05; t += 0.06) sfx(t, 'tick', 0.16 + 0.08 * rnd(t), 0.5, 1.1);
  gsap.set('#stD, #stB', { scaleX: -1 }); gsap.set('.st', { transformOrigin: '50% 100%' });
  const stT = [tInv1 - 0.1, tInv1 + 0.35, tInv2 + 0.3, tCount + 0.2];
  ['#stC', '#stA', '#stB', '#stD'].forEach((el, i) => {
    tl.fromTo(el, { y: 560 }, { y: 0, duration: 0.55, ease: 'back.out(1.25)' }, stT[i]);
    tl.to(el, { scaleY: 1.06, duration: Math.max(0.5, tEnd - stT[3] - 0.6), ease: 'sine.inOut' }, stT[3] + 0.3);
    sfx(stT[i], 'paper', 0.5, [-0.5, 0.1, 0.3, -0.1][i]);
  });
  clipIn('#s1-year', tCount, 0.6); clipIn('#s1-case', tCount + 0.2, 0.6);
  const ex = tEnd - 0.3;
  tl.to(['#stC', '#stA', '#stB', '#stD'], { y: -(SH + 100), rotation: i => [-14, 9, 17, -8][i], duration: 0.28, ease: 'power3.in', stagger: 0.02 }, ex);
  tl.to(['#inv1', '#inv2', '#s1-total'], { x: 520, duration: 0.28, ease: 'power3.in', stagger: 0.03 }, ex + 0.02);
  tl.to('#s1-dispo', { y: 820, duration: 0.28, ease: 'power3.in' }, ex + 0.04);
  sfx(ex + 0.05, 'whoosh', 0.42, 0);
}
function wende(t0, tEnd, label, l1, l2, tLabel, tL1, tL2) {
  vis('#s2', t0, tEnd);
  gsap.set('#s2-cell', { scaleY: 0 });                      // only the cell mask (spot A) opens it
  $('#s2-label').textContent = label; $('#s2-l1').textContent = l1; $('#s2-l2').textContent = l2;
  $('#s2-l0') && ($('#s2-l0').style.display = 'none');
  tl.set(vl, { x: i => (rnd(i) - 0.5) * 60 }, t0); tl.set(hl, { y: i => (rnd(i + 9) - 0.5) * 40 }, t0);
  tl.to(vl, { x: 0, duration: 0.8, ease: 'elastic.out(1,0.42)', stagger: 0.012 }, t0 + 0.02);
  tl.to(hl, { y: 0, duration: 0.8, ease: 'elastic.out(1,0.42)', stagger: 0.03 }, t0 + 0.04);
  [0.03, 0.12, 0.22].forEach((d, i) => sfx(t0 + d, 'snap', 0.45 - i * 0.1, [-0.4, 0.4, 0][i]));
  clipIn('#s2-label', tLabel, 0.6);
  rise('#s2-l1', tL1, 0.8); sfx(tL1, 'swish', 0.4, -0.2);
  rise('#s2-l2', tL2, 0.8); sfx(tL2, 'swish', 0.45, 0.2);
  tl.fromTo('#s2-ul', { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, tL2 + 0.3); sfx(tL2 + 0.3, 'tick', 0.35, 0, 1.3);
  tl.fromTo('#s2 .cam', { x: 0 }, { x: -24, duration: tEnd - t0, ease: 'sine.inOut' }, t0);
}
function cellMask(t0, t1, scene) {       // the green grid cell of S2 opens into the next scene
  tl.to('#s2-cell', { scaleY: 1, duration: 0.45 }, t0 - 0.6); sfx(t0 - 0.6, 'pop', 0.35, 0.6, 0.6);
  const r = { ...M.cell, left: M.cell.left - 20, right: M.cell.right - 20 };
  vis(scene, t0);
  tl.fromTo(scene, { clipPath: insetOf(r) }, { clipPath: 'inset(0px 0px 0px 0px)', duration: t1 - t0, ease: 'power4.inOut' }, t0);
  tl.set('#edge', { opacity: 1, left: r.left, top: r.top, width: r.width, height: r.height }, t0);
  tl.to('#edge', { ...fullEdge, duration: t1 - t0, ease: 'power4.inOut' }, t0);
  tl.set('#edge', { opacity: 0 }, t1 + 0.01);
  sfx(t0, 'whoosh_big', 0.6, 0.3);
}
function wipe(t) {                          // double bar wipe, scenes swap at t
  gsap.set(['#wipeA', '#wipeB'], { x: -SW });
  tl.to('#wipeA', { x: 0, duration: 0.2, ease: 'power3.in' }, t - 0.19);
  tl.to('#wipeB', { x: 0, duration: 0.2, ease: 'power3.in' }, t - 0.14);
  tl.to('#wipeB', { x: SW, duration: 0.26, ease: 'power3.out' }, t + 0.07);
  tl.to('#wipeA', { x: SW, duration: 0.28, ease: 'power3.out' }, t + 0.12);
  sfx(t - 0.19, 'whoosh', 0.42, -0.6);
}
function colWipe(t) {                       // three ink columns, scenes swap at t
  const cb = $$('.cbar');
  gsap.set(cb, { scaleY: 0, transformOrigin: '50% 100%' });
  tl.to(cb, { scaleY: 1, duration: 0.22, ease: 'power3.in', stagger: 0.05 }, t - 0.32);
  tl.set(cb, { transformOrigin: '50% 0%' }, t);
  tl.to(cb, { scaleY: 0, duration: 0.3, ease: 'power3.out', stagger: 0.05 }, t + 0.02);
  [0, 0.05, 0.1].forEach((d, i) => sfx(t - 0.32 + d, 'swish', 0.4, [-0.6, 0, 0.6][i], 0.9 + i * 0.1));
}
function ats(t0, t1, tToast) {
  vis('#s3a', t0, t1);
  tl.fromTo('#win', { y: 60, scale: 0.955 }, { y: 0, scale: 1, duration: 0.8 }, t0 - 0.4);
  $('#cursor').style.display = 'none'; $('#drag').style.display = 'none'; $('#cMehmet').style.visibility = 'inherit';
  tl.fromTo($$('#win .cc.k'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.018 }, t0);
  toolCol('#t3a', t0 + 0.1, 0.8);
  tl.fromTo('#toast', { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }, tToast); sfx(tToast + 0.04, 'ping', 0.5, 0.3);
}
function bot(t0, t1, times) {
  vis('#s3b', t0, t1);
  tl.fromTo(['#s3b-panel', '#s3b .popout'], { x: -80 }, { x: 0, duration: 0.6 }, t0);
  tl.fromTo('#s3b-person', { y: 420 }, { y: 0, duration: 0.7, ease: 'back.out(1.2)' }, t0 + 0.03);
  tl.fromTo('#phone', { y: 140, rotation: 5 }, { y: 0, rotation: 0, duration: 0.75 }, t0 + 0.02);
  tl.fromTo('#s3b-panel .tag', { opacity: 0 }, { opacity: 1, duration: 0.4 }, t0 + 0.3);
  sfx(t0, 'swish_low', 0.45, -0.2);
  toolCol('#t3b', t0 + 0.08, 0.8);
  rise('#t3b .stat .mask > span', t0 + 0.35, 0.7);
  const ms = $$('#chat .m'), gap = 8, hs = ms.map(m => m.offsetHeight);
  const R = k => hs.slice(k).reduce((a, h) => a + h + gap, 0);
  gsap.set('#chat', { y: R(0) }); gsap.set('#typing', { opacity: 0 });
  times.forEach((t, k) => {
    tl.to('#chat', { y: R(k + 1), duration: 0.35, ease: 'back.out(1.3)' }, t);
    const out = ms[k].classList.contains('out');
    tl.fromTo(ms[k], { scale: 0.7, opacity: 0, transformOrigin: out ? '100% 100%' : '0% 100%' }, { scale: 1, opacity: 1, duration: 0.32, ease: 'back.out(2)' }, t);
    sfx(t, out ? 'send' : 'ping', out ? 0.3 : 0.45, 0.1);
  });
}
function stunden(t0, t1, tStamp, tWa) {
  vis('#s3c', t0, t1);
  $('#ball').style.display = 'none';
  tl.fromTo('#s3c-person', { y: 300 }, { y: 0, duration: 0.65 }, t0);
  tl.fromTo('#sheet', { scale: 0.9, y: 30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }, t0);
  sfx(t0, 'whoosh_pop', 0.45, 0.1);
  toolCol('#t3c', t0 + 0.08, 0.8);
  const rts = $$('#sheet .rt');
  rts.forEach((r, i) => { tl.fromTo(r, { scale: 0 }, { scale: 1, duration: 0.28, ease: 'back.out(3)' }, t0 + 0.18 + i * 0.07); if (i < 5) sfx(t0 + 0.18 + i * 0.07, 'tick', 0.35, 0.15, 1 + i * 0.08); });
  const sig = $('#sigpath'), sl = sig.getTotalLength();
  gsap.set(sig, { strokeDasharray: sl, strokeDashoffset: sl });
  tl.to(sig, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.inOut' }, t0 + 0.25);
  const h = { v: 0 };
  tl.to(h, { v: 39.5, duration: 0.4, ease: 'power2.out', onUpdate: () => $('#hrs').textContent = h.v.toFixed(1).replace('.', ',') }, t0 + 0.2);
  tl.fromTo('#stamp', { scale: 2.3, rotation: -22, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.16, ease: 'power4.in' }, tStamp - 0.16);
  sfx(tStamp, 'stamp', 0.33, 0.2); shake('#s3c .cam', tStamp, 4);
  rise('#t3c .stat .mask > span', t0 + 0.3, 0.6);
  tl.fromTo('#t3c .statlabel', { opacity: 0 }, { opacity: 1, duration: 0.4 }, t0 + 0.45);
  if (tWa) { tl.fromTo('#wa3c', { scale: 0.7, y: 24, opacity: 0, transformOrigin: '0% 0%' }, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, tWa); sfx(tWa, 'ping', 0.45, -0.4); }
  else gsap.set('#wa3c', { opacity: 0 });
  tl.to('#sheet', { y: -8, duration: t1 - t0, ease: 'sine.inOut' }, t0 + 0.4);
}
function einstellung(t0, t1) {
  vis('#s3d', t0, t1);
  gsap.set('#iv', { y: -8 });
  tl.fromTo('#akte', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, t0);
  tl.fromTo('#onb', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, t0 + 0.15);
  toolCol('#t3d', t0 + 0.08, 0.8);
  $$('#iv .trl').forEach((p, i) => clipIn(p, t0 + 0.05 + i * 0.1, 0.25, 'power2.out'));
  sfx(t0 + 0.05, 'type', 0.2, 0.05);
  tl.fromTo('#kichip', { scale: 0.6, opacity: 0, transformOrigin: '0% 50%' }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, t0 + 0.35); sfx(t0 + 0.35, 'blip', 0.45, 0);
  const av = $$('#akte .v'); gsap.set(av, { opacity: 0, x: 12 });
  av.forEach((v, i) => { const t = t0 + 0.45 + i * 0.08; tl.to(v, { opacity: 1, x: 0, duration: 0.25 }, t); tl.fromTo(v.querySelector('.tick'), { scale: 0 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t); sfx(t, 'tick', 0.3, -0.5, 1 + i * 0.07); });
  const oi = $$('#onb .it'); gsap.set(oi, { opacity: 0.4 }); gsap.set($$('#onb .tick'), { scale: 0 });
  oi.forEach((it, i) => { const t = t0 + 0.8 + i * 0.09; tl.to(it, { opacity: 1, duration: 0.15 }, t); tl.to(it.querySelector('.tick'), { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t); sfx(t, 'tick', 0.32, -0.4, 1.2 + i * 0.1); });
}
function kiMask(m0, md) {                    // KI chip opens into the agent hub
  const kp = proj(M.ki, 1.0, -8), r = { left: kp.left, top: kp.top, width: kp.width, height: kp.height, right: kp.left + kp.width, bottom: kp.top + kp.height };
  vis('#s3e', m0);
  tl.fromTo('#s3e', { clipPath: insetOf(r).replace(')', ' round 22px)') }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: md, ease: 'power4.inOut' }, m0);
  tl.set('#edge', { opacity: 1, left: r.left, top: r.top, width: r.width, height: r.height }, m0);
  tl.to('#edge', { ...fullEdge, duration: md, ease: 'power4.inOut' }, m0);
  tl.set('#edge', { opacity: 0 }, m0 + md + 0.01);
  sfx(m0, 'whoosh_big', 0.4, -0.2);
}
function agenten(t0, P0) {
  const tiles = $$('#s3e .ag'), all6 = [...tiles, $('#agadd')];
  tl.fromTo(all6, { y: 40, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'back.out(1.4)' }, t0);
  all6.forEach((_, i) => sfx(t0 + i * 0.06, 'pop', 0.2, -0.6 + i * 0.2, 1 + i * 0.05));
  toolCol('#t3e', t0 + 0.15, 0.8);
  tiles.forEach((tile, i) => {
    const el = tile.querySelector('.task'), txt = el.dataset.t, o = { n: 0 };
    tl.to(o, { n: txt.length, duration: 0.6, ease: 'power1.inOut', onUpdate: () => el.textContent = txt.slice(0, Math.round(o.n)) }, t0 + 0.3 + i * 0.1);
    tl.fromTo(tile.querySelector('.bar i'), { scaleX: 0 }, { scaleX: [0.92, 0.7, 1, 0.84, 0.95][i], duration: 1.4 + i * 0.12, ease: 'power2.inOut' }, t0 + 0.4 + i * 0.08);
  });
  sfx(t0 + 0.3, 'type', 0.2, 0);
  // collapse: the tiles shrink into the five chips of the proof scene
  const chipEls = $$('#chips .chip'); gsap.set(chipEls, { opacity: 0 });
  tl.to('#t3e', { x: -60, opacity: 0, duration: 0.28, ease: 'power2.in' }, P0);
  tl.to('#agadd', { scale: 0.6, opacity: 0, duration: 0.25, ease: 'power2.in' }, P0);
  const CS = 1.0, inv = r => ({ left: CX + (r.left - CX) / CS, top: CY + (r.top - CY) / CS - OY, width: r.width / CS, height: r.height / CS });
  tiles.forEach((tile, i) => {
    const kids = [...tile.children], lab = document.createElement('div');
    lab.innerHTML = chipEls[i].innerHTML.replace('<i></i>', '<i style="width:9px;height:9px;border-radius:50%;background:#2C8964;box-shadow:0 0 0 4px rgba(44,137,100,.16)"></i>');
    lab.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;font-size:19px;white-space:nowrap;opacity:0';
    tile.appendChild(lab);
    const b = inv(M.chips[i]), t = P0 + i * 0.035, land = t + 0.6;
    tl.to(kids, { opacity: 0, duration: 0.2, ease: 'power2.in' }, t);
    tl.to(tile, { left: b.left, top: b.top, width: b.width, height: b.height, padding: 0, borderRadius: 23, duration: 0.6, ease: 'expo.inOut' }, t);
    tl.to(lab, { opacity: 1, duration: 0.2, ease: 'power2.out' }, t + 0.38);
    tl.set(tile, { visibility: 'hidden' }, land);
    tl.set(chipEls[i], { opacity: 1 }, land);
    tl.fromTo(chipEls[i], { scale: 1.12 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, land);
    sfx(land, 'tick', 0.3, 0.4, 1 + i * 0.06);
  });
  sfx(P0, 'whoosh', 0.55, 0.3);
}
function proof(t0, tEnd, tStatt, tCount, tSelbst, tHit) {
  vis('#s4', t0, tEnd);
  tl.fromTo('#s4 .cam', { scale: 1 }, { scale: 1.035, duration: tEnd - t0, ease: 'sine.inOut' }, t0);
  tl.fromTo('#s4-panel', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.65 }, t0);
  tl.fromTo('#s4-lukas', { y: 780 }, { y: 0, duration: 0.85, ease: 'back.out(1.15)' }, t0 + 0.2);
  tl.to('#s4-lukas', { y: -12, duration: tEnd - t0 - 1, ease: 'sine.inOut' }, t0 + 1);
  tl.fromTo('#s4-panel .tag', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, t0 + 0.7);
  sfx(t0, 'swish_low', 0.45, -0.4); sfx(t0 + 0.2, 'rise', 0.4, -0.4);
  clipIn('#s4-label', t0 + 0.45, 0.6);
  $('#lead1 .mask > span').textContent = 'Statt rund';
  rise('#lead1 .mask > span', tStatt - 0.05, 0.7);
  rise('#before', tCount - 0.12, 0.6);
  const c = { v: 0 };
  tl.to(c, { v: 4000, duration: 0.55, ease: 'power2.out', onUpdate: () => $('#s4-before').textContent = fmt(c.v) }, tCount - 0.05);
  for (let t = tCount - 0.04; t < tCount + 0.5; t += 0.05) sfx(t, 'tick', 0.15 + 0.08 * rnd(t), 0.4, 1.1);
  gsap.set('#strike', { scaleX: 0, rotation: -3 });
  tl.to('#strike', { scaleX: 1, duration: 0.32, ease: 'power3.out' }, tSelbst); sfx(tSelbst, 'scratch', 0.55, 0.4);
  tl.to('#before', { opacity: 0.5, duration: 0.4, ease: 'power2.out' }, tSelbst + 0.15);
  rise('#lead2 .mask > span', tSelbst + 0.04, 0.7);
  tl.fromTo('#after', { scale: 1.5, opacity: 0, y: -24 }, { scale: 1, opacity: 1, y: 0, duration: 0.16, ease: 'power4.in' }, tHit - 0.16);
  tl.fromTo('#after', { scale: 0.96 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,0.35)', immediateRender: false }, tHit);
  sfx(tHit, 'impact', 1.0, 0); shake('#s4 .cam', tHit, 6);
  tl.to(vl, { backgroundColor: 'rgba(44,137,100,.45)', duration: 0.06, ease: 'none' }, tHit);
  tl.to(vl, { backgroundColor: i => (i === 0 || i === NC) ? 'rgba(5,40,53,.22)' : 'rgba(5,40,53,.075)', duration: 0.7, ease: 'power2.out' }, tHit + 0.08);
}
function foldS2(F) {                         // S2 type folds to the centre (spot B → end card)
  const ox = CX - M.s2t.left;
  tl.to('#s2-type', { scaleX: 0, transformOrigin: `${ox}px 50%`, duration: 0.3, ease: 'power4.in' }, F - 0.3);
  tl.to(['#s2-label', '#s2-ul'], { opacity: 0, duration: 0.2, ease: 'power2.in' }, F - 0.3);
  sfx(F - 0.32, 'whoosh_rev', 0.55, 0);
}
function endcard(t0, o) {
  if (t0 === 0) gsap.set('#s6', { visibility: 'visible' }); else vis('#s6', t0);
  const ring = $('#ringpath'), rl = ring.getTotalLength();
  gsap.set(ring, { strokeDasharray: rl, strokeDashoffset: rl });
  tl.to(ring, { strokeDashoffset: 0, duration: 0.9 }, o.tLogo - (o.headSlide ? 0 : 0.1));
  tl.fromTo('#logoimg', { scale: 0.55, rotation: -25, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.5)' }, o.tLogo);
  sfx(o.tLogo, 'impact', 0.75, 0, 1.15);
  if (o.tMove) {
    tl.fromTo('#endlogo', { x: CX - (M.logo.left + M.logo.width / 2), y: OY + (V916 ? 675 : 540) - (M.logo.top + M.logo.height / 2), scale: 1.12 },
      { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'expo.inOut' }, o.tMove);
    sfx(o.tMove, 'swish_low', 0.35, -0.3);
  }
  clipIn('#e-label', o.tLabel, 0.6);
  const ws = $$('#endhead .w');
  ws.forEach((el, i) => { if (o.headAt0 && i === 0) gsap.set(el, { yPercent: 0 }); else rise(el, o.tHead[i], 0.7); });
  if (o.headSlide) tl.fromTo('#endhead', { x: o.headSlide }, { x: 0, duration: 0.6, ease: 'expo.inOut' }, o.tLogo - 0.55);
  gsap.set('.pills', { display: 'none' });
  tl.fromTo('#cta .btn', { y: 30, opacity: 0, clipPath: 'inset(0% 100% 0% 0% round 46px)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 46px)', duration: 0.7 }, o.tCta);
  const ar = $('#arrow'), al = ar.getTotalLength();
  gsap.set(ar, { strokeDasharray: al, strokeDashoffset: al });
  tl.to(ar, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, o.tCta + 0.3);
  const url = $('#url'), ut = 'betrieb-zukunft.de', uo = { n: 0 }; url.textContent = '';
  tl.to(uo, { n: ut.length, duration: 0.5, ease: 'power1.inOut', onUpdate: () => url.textContent = ut.slice(0, Math.round(uo.n)) }, o.tCta + 0.25);
  sfx(o.tCta, 'swish', 0.5, 0.2); sfx(o.tCta + 0.3, 'click', 0.4, 0.3); sfx(o.tCta + 0.25, 'type', 0.16, 0.4);
  (o.pulse || []).forEach(t => tl.to('#cta .btn', { keyframes: [{ scale: 1.045, duration: 0.25, ease: 'power2.out' }, { scale: 1, duration: 0.45, ease: 'power2.inOut' }] }, t));
  tl.to('#topurl', { opacity: 0, duration: 0.4, ease: 'power2.out' }, o.tCta);
  tl.fromTo('#s6 .cam', { scale: 1 }, { scale: 1.02, duration: DUR - t0, ease: 'sine.inOut' }, t0);
}

/* ---------- spots ---------- */
if (SPOT === 'a') {
  const cut1 = B(11), m0 = B(17), m1 = B(18), cBot = B(20), cStd = B(22), cEin = B(24), km0 = B(26.5), P0 = B(32.5), S4 = P0 + 0.3, cEnd = B(48);
  hook(0, 1.3);
  status(1.25, w('sie'), w('tausende') - 0.3, w('software') + 0.1, cut1);
  wende(cut1, m1 + 0.05, 'Betrieb Zukunft zeigt Ihnen, wie …', 'Ihre Software.', 'Selbst gebaut.', w('betrieb'), w('betrieb') + 0.3, w('eigene'));
  cellMask(m0, m1, '#s3a');
  ats(m1, cBot + 0.06, w('bewerbermanagement') + 0.45);
  wipe(cBot);
  bot(cBot + 0.06, cStd, [cBot + 0.2, cBot + 0.45, cBot + 0.7]);
  stunden(cStd, cEin, cEin - 0.28, null);
  einstellung(cEin, km0 + 0.5);
  kiMask(km0, B(27.5) - km0);
  vis('#s3e', km0, S4 + 0.75);
  agenten(B(27.5) - 0.35, P0);                                   // tiles land while the mask opens
  proof(S4, cEnd + 0.05, w('statt'), w('4000'), w('selbst'), B(45));
  colWipe(cEnd);
  endcard(cEnd, { tLogo: cEnd + 0.08, tMove: w('jetzt') - 0.95, tLabel: w('jetzt') - 0.5, tHead: [w('jetzt') - 0.45, w('jetzt') - 0.32, w('jetzt') - 0.22, w('jetzt') - 0.1], tCta: w('jetzt') + 0.1, pulse: [w('kostenloses') + 1.25, 29.0] });
} else if (SPOT === 'b') {
  const cAts = B(7), cBot = B(9), cStd = B(11), cS2 = B(13.5), F = B(19.5);
  hook(0, 1.05);
  status(1.0, 1.35, 1.75, w('software') + 0.1, cAts);
  ats(cAts, cBot + 0.06, cAts + 0.55);
  wipe(cBot);
  bot(cBot + 0.06, cStd, [cBot + 0.18, cBot + 0.42, cBot + 0.66]);
  stunden(cStd, cS2, cStd + 0.85, null);
  colWipe(cS2);
  wende(cS2, F, 'Betrieb Zukunft', 'Selbst gebaut.', 'Zugeschnitten.', cS2 + 0.15, w('selbst') + 0.02, w('zugeschnitten'));
  foldS2(F);
  endcard(F, { tLogo: F + 0.05, tMove: w('jetzt') - 0.9, tLabel: w('jetzt') - 0.45, tHead: [w('jetzt') - 0.4, w('jetzt') - 0.28, w('jetzt') - 0.18, w('jetzt') - 0.06], tCta: w('jetzt') + 0.12, pulse: [13.6] });
} else {
  // bumper: the campaign line is on screen from frame 0, the logo lands on "Betrieb Zukunft"
  const tLogo = w('betrieb') - 0.25;
  endcard(0, { headAt0: true, headSlide: -584, tLogo, tMove: null, tLabel: tLogo + 0.25, tHead: [0, w('die') - 0.05, w('ihnen') - 0.05, w('gehört') - 0.05], tCta: tLogo + 0.85, pulse: [4.7] });
  tl.fromTo('#endlogo', { opacity: 0 }, { opacity: 1, duration: 0.01 }, tLogo - 0.1);
}
tl.set({}, {}, DUR);
return tl;
}

/* ---------- per-frame procedural layers ---------- */
const capEl = $('#cap');
let capCur = -2;
function captions(t) {
  let idx = -1;
  for (let i = 0; i < CAP.length; i++) {
    const p = CAP[i]; if (p.tag) continue;
    const next = CAP[i + 1];
    const until = Math.min(next ? next.start - 0.1 : 1e9, p.end + 0.5);
    if (t >= p.start - 0.1 && t < until) idx = i;
  }
  if (idx !== capCur) { capCur = idx; capEl.innerHTML = idx < 0 ? '' : CAP[idx].words.map(x => `<span>${x.w}</span>`).join(' '); }
  if (idx < 0) return;
  const p = CAP[idx], k = Math.min(1, Math.max(0, (t - (p.start - 0.1)) / 0.15)), e = 1 - Math.pow(1 - k, 3);
  capEl.style.opacity = e; capEl.style.transform = `translateY(${(1 - e) * 12}px)`;
  [...capEl.children].forEach((s, i) => { const x = p.words[i]; s.className = t >= x.e + 0.04 ? 'on' : (t >= x.s - 0.02 ? 'now' : ''); });
}
const waveBars = [...wave.children];
function proc(t) {
  const f = Math.round(t * 30);
  $('#grain1').style.transform = `translate(${Math.round((rnd(f) - 0.5) * 100)}px,${Math.round((rnd(f + 7) - 0.5) * 100)}px)`;
  $('#grain2').style.transform = `translate(${Math.round((rnd(f + 3) - 0.5) * 100)}px,${Math.round((rnd(f + 11) - 0.5) * 100)}px)`;
  $('#gridwrap').style.transform = `translate(${(Math.sin(t * 0.42) * 5).toFixed(2)}px,${(Math.cos(t * 0.31) * 4).toFixed(2)}px)`;
  waveBars.forEach((b, i) => {
    const env = 0.55 + 0.45 * Math.sin(t * 2.1 + i * 0.05);
    const v = Math.abs(Math.sin(t * 9.3 + i * 0.71) * 0.6 + Math.sin(t * 15.7 + i * 1.37) * 0.4) * env;
    b.style.height = (12 + v * 88).toFixed(1) + '%'; b.style.opacity = (0.35 + v * 0.65).toFixed(2);
  });
  $('#timer').textContent = `00:12:${String(34 + Math.floor(t) % 25).padStart(2, '0')}`;
  $$('#s3e .st i').forEach((d, i) => { d.style.opacity = (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 5 + i))).toFixed(2); });
  captions(t);
}

let tl;
window.__seek = t => { tl.seek(t, false); proc(t); };
document.fonts.ready.then(() => {
  tl = build();
  window.SFX = SFX.sort((a, b) => a.t - b.t);
  window.__dur = DUR;
  window.__seek(0);
  window.__ready = true;
});
})();
