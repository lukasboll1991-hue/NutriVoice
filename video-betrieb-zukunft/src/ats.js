/* ATS feature spot – "Erst das Pflichtprogramm, dann die Kür."
 * ?spot=main (advert, with call to action) | pitch (sales meeting, without).
 * All text, numbers and interface are built here from code; one paused GSAP timeline, window.__seek(t).
 * Interface look = the ATS (lib/design.tsx of the ATS); all people, companies and numbers are invented. */
(function () {
const $ = s => document.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = new URLSearchParams(location.search);
const SPOT = Q.get('spot') || 'main';
const SP = AT.spots[SPOT], W = SP.w, CAP = SP.captions, DUR = SP.dur, ENV = SP.env;
const CTA = SPOT === 'main';
const SFX = [];
const sfx = (t, name, g = 1, pan = 0, p = 1) => SFX.push({ t: +(+t).toFixed(3), name, g, pan, p });
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const w = k => { const v = W[k]; if (v === undefined) throw new Error('word ' + k); return v; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease3 = k => 1 - Math.pow(1 - clamp(k), 3);
const envAt = t => ENV[clamp(Math.round(t * 30), 0, ENV.length - 1)] || 0;
const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const SC = $('#scenes');
const scene = (id, html) => { const s = el(`<div class="scene" id="${id}">${html}</div>`); SC.appendChild(s); return s; };

/* ---------- ATS interface building blocks ---------- */
const ICON = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  ki: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  sales: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  building: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4',
  contact: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 16a4 4 0 0 0-8 0M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  brief: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  task: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  menu: 'M3 6h18M3 12h18M3 18h18',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  cal: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
};
const ic = (n, col) => `<svg viewBox="0 0 24 24" fill="none" stroke="${col || 'currentColor'}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[n]}"/></svg>`;
function sidebar(active) {
  const items = [['dashboard', 'Dashboard'], ['ki', 'KI-Center'], 0, ['inbox', 'Bewerbungen', '48'], ['user', 'Kandidaten'], ['users', 'Mitarbeiter'], ['zap', 'Matching'], 0,
    ['sales', 'Sales'], ['building', 'Unternehmen'], ['contact', 'Ansprechpartner'], ['brief', 'Vakanzen'], ['mail', 'Mailings'], 0, ['msg', 'Kommunikation', '', '6'], ['task', 'Aufgaben']];
  const col = { inbox: '#f2c06b', user: '#8fa6ff', users: '#8fa6ff', zap: '#b59cf7', sales: '#6fd3a1', building: '#6fd3a1', contact: '#6fd3a1', brief: '#6fd3a1', mail: '#6fd3a1' };
  return `<div class="sb"><div class="brand">ATS</div>${items.map(it => it === 0 ? '<div class="sep"></div>' :
    `<div class="nv${it[1] === active ? ' on' : ''}">${ic(it[0], col[it[0]])}<span>${it[1]}</span>${it[2] ? `<span class="n">${it[2]}</span>` : ''}${it[3] ? `<span class="badge">${it[3]}</span>` : ''}</div>`).join('')}</div>`;
}
function topUI(title, col, left0) {
  return `<div class="tb"${left0 ? ' style="left:0"' : ''}>${ic('menu', '#6b7280').replace('<svg', '<svg style="width:20px;height:20px"')}
    <div class="pt"><i style="background:${col}"></i>${title}</div>
    <div class="srch">${ic('search')}Im ATS suchen – Name, Firma, Telefon, PLZ …</div>
    <div style="margin-left:auto;display:flex;gap:9px">
      <div class="ic" style="background:#f1f2f5;color:#6b7280">${ic('bell')}</div>
      <div class="ic" style="background:#e7f6ee;color:#18704a">S</div>
      <div class="ic" style="background:#3b5bdb;color:#fff">${ic('ki', '#fff')}</div></div></div>`;
}
const COLS = { blau: ['#5b7cfa', '#eef1fe', '#dfe6fe', '#2f4fd6'], gelb: ['#e0a33b', '#fdf6ea', '#fbe9c8', '#8a5b00'], lila: ['#8b6cf0', '#f4f0fe', '#e6defd', '#5b3fc4'],
  tuerkis: ['#2fb5c8', '#eaf7f9', '#cdeef3', '#11788a'], gruen: ['#1f9d55', '#ebf7f1', '#d0eedf', '#1e7a46'], grau: ['#9aa0aa', '#f1f2f5', '#e6e8ec', '#4b5563'] };
function board(cols, cls = '') {
  return `<div class="board ${cls}">${cols.map(([name, c, n, cards]) => { const s = COLS[c];
    return `<div class="col" style="background:${s[1]}"><h4><i style="background:${s[0]}"></i>${name}<span class="cnt" style="background:${s[2]};color:${s[3]}">${n}</span></h4>${cards.map(k =>
      `<div class="bc${k.cls ? ' ' + k.cls : ''}"${k.id ? ` id="${k.id}"` : ''}>${k.neu ? '<span class="neu">NEU</span>' : ''}<div class="r1"><div class="av" style="background:${s[2]};color:${s[3]}">${k.i}</div><div><div class="nm">${k.n}</div><div class="bf">${k.b}</div></div></div>
       ${k.o ? `<div class="ort">${ic('pin')}${k.o}</div>` : ''}${k.q || k.t ? `<div class="ft">${k.q ? `<span class="q">${k.q}</span>` : ''}<span class="t">${k.t || ''}</span></div>` : ''}</div>`).join('')}</div>`; }).join('')}</div>`;
}
const winHTML = (id, style, inner, cls = '') => `<div class="win ${cls}" id="${id}" style="${style}">${inner}</div>`;

/* ---------- scene markup ---------- */
// hook
scene('s0', `<div id="hk-label" class="label"><b>Für Personaldienstleister</b></div>
  <div id="hk-ats"><span>A</span><span>T</span><span>S</span></div>
  <div id="hk-line">${['aus', 'dem', 'Alltag', 'eines', 'Personaldienst&shy;leisters.'].map(x => `<span class="m"><span>${x}</span></span>`).join(' ')}</div>
  <div id="hk-ul"></div>
  <div class="persp">${winHTML('hk-win', 'left:1180px;top:170px;width:1240px;height:740px', sidebar('Kandidaten') + topUI('Kandidaten-Pipeline', '#4c6ef5') +
    `<div class="main">${board([['Neuer Kandidat', 'blau', 10, [{ i: 'LS', n: 'Lea Schubert', b: 'Produktionshelferin', o: '22041 Hamburg-Wandsbek' }, { i: 'TA', n: 'Tim Albers', b: 'Elektriker', o: '25421 Pinneberg' }]],
      ['Bewerberpool', 'lila', 4, [{ i: 'NH', n: 'Nadia Haddad', b: 'Verkäuferin', o: '22767 Hamburg-Altona' }]], ['Vorstellungsgespräch', 'tuerkis', 5, [{ i: 'JP', n: 'Jonas Petersen', b: 'Staplerfahrer', o: '21073 Hamburg-Harburg' }]]])}</div>`)}</div>`);
[0, 1, 2].forEach(i => $('#s0').appendChild(el(`<div class="wipecol" id="wc${i}" style="left:${i * 640}px;width:641px"></div>`)));

// 01 portals
const BW_CARDS = {
  'Neu': [{ i: 'JP', n: 'Jonas Petersen', b: 'Staplerfahrer', o: '21073 Hamburg-Harburg', q: 'Indeed', t: 'gerade eben', cls: 'land', neu: 1, id: 'jp-card' },
          { i: 'AK', n: 'Aylin Kaya', b: 'Kommissioniererin', o: '22117 Hamburg-Billstedt', q: 'StepStone', t: 'vor 6 Min' },
          { i: 'MN', n: 'Marek Nowak', b: 'Lagerhelfer', o: '21029 Hamburg-Bergedorf', q: 'Arbeitsagentur', t: 'vor 14 Min' },
          { i: 'LS', n: 'Lea Schubert', b: 'Produktionshelferin', o: '22041 Hamburg-Wandsbek', q: 'Kleinanzeigen', t: 'vor 31 Min' }],
  'In Prüfung': [{ i: 'DV', n: 'Dennis Vogt', b: 'Fachlagerist', o: '22525 Hamburg-Stellingen', q: 'Meta', t: 'vor 1 Std' }, { i: 'SR', n: 'Sofia Rossi', b: 'Reinigungskraft', o: '22305 Hamburg-Barmbek', q: 'Stellenseite', t: 'vor 2 Std' }],
  'Kontaktiert': [{ i: 'TA', n: 'Tim Albers', b: 'Elektriker', o: '25421 Pinneberg', q: 'WhatsApp-Bot', t: 'gestern' }, { i: 'NH', n: 'Nadia Haddad', b: 'Verkäuferin', o: '22767 Hamburg-Altona', q: 'Indeed', t: 'gestern' },
                  { i: 'PW', n: 'Paul Weber', b: 'Maler', o: '22880 Wedel', q: 'StepStone', t: 'gestern' }],
  'Kandidat übernehmen': [{ i: 'OJ', n: 'Ole Jensen', b: 'Schweißer', o: '21129 Hamburg-Finkenwerder', q: 'Arbeitsagentur', t: 'Mo' }],
};
scene('s1', `<div class="bigword" id="s1-big" style="top:430px"><span class="mk" style="display:inline-block;overflow:hidden;padding-bottom:14px;vertical-align:bottom"><span style="display:inline-block">Pflicht&shy;programm<em>.</em></span></span></div>
  <div class="ncol" id="n1"><div class="num"><b>01</b> — Bewerbungen</div><div class="title"><span class="m"><span>Aus allen</span></span><span class="m"><span><em>Portalen.</em></span></span></div><div class="rule"></div>
    <div class="sub">Jede Bewerbung landet mit Quelle im Board – automatisch an der richtigen Niederlassung.</div></div>
  <div class="persp">${winHTML('s1-win', 'left:690px;top:206px;width:1300px;height:700px;transform-origin:0 50%', sidebar('Bewerbungen') + topUI('Bewerbungen', '#d48a14') +
    `<div class="main"><div class="frow"><div class="inp" style="width:250px">Bewerber oder Beruf suchen</div><span class="lbl">Quelle:</span><div class="inp" style="width:130px;color:#16181d">Alle</div>
      <span class="lbl">NL:</span><div class="inp" style="width:120px;color:#16181d">Harburg</div><span style="margin-left:auto" class="lbl" id="s1-total">48 Bewerbungen</span><span class="btn">+ Bewerbung</span></div>
      ${board(Object.entries(BW_CARDS).map(([k, v], i) => [k, ['blau', 'gelb', 'lila', 'gruen'][i], [12, 5, 9, 3][i], v]))}</div>`)}</div>`);
$('#s1-win .col h4 .cnt').id = 's1-neu';
const PCH = [['StepStone', 1290, 128, 'mid', 6.0], ['Kleinanzeigen', 1600, 150, 'far', 6.22], ['Meta', 1770, 430, 'far', 6.44], ['Ihre Stellenseite', 1640, 600, 'mid', 6.66],
  ['WhatsApp-Bot', 1650, 770, 'far', 6.88], ['Bundesagentur für Arbeit', 1310, 874, 'near', null]];
PCH.forEach(([t, x, y, d], i) => $('#s1').appendChild(el(`<div class="pchip ${d}" id="pc${i}" style="left:${x}px;top:${y}px"><i></i>${t}</div>`)));
$('#s1').appendChild(el(`<div class="pchip mid" id="pc-indeed" style="left:1500px;top:330px"><i></i>Indeed</div>`));

// 02 CV
scene('s2', `<div class="ncol" id="n2"><div class="num"><b>02</b> — Lebenslauf</div><div class="title"><span class="m"><span>Lebenslauf rein.</span></span><span class="m"><span><em>Profil fertig.</em></span></span></div><div class="rule"></div>
    <div class="sub">Die KI liest den Lebenslauf aus – inklusive Staplerschein &amp; Co.</div></div>
  <div class="pcard" id="s2-card" style="left:1130px;top:196px;width:690px;height:660px">
    <div class="ph"><div class="av">JP</div><div><div class="nm" id="pf-name">Jonas Petersen</div><div class="sub">Kandidat · Niederlassung Harburg</div></div><span class="st">Neuer Kandidat</span></div>
    <div class="bd">${[['Beruf', 'Staplerfahrer'], ['Wohnort', '21073 Hamburg-Harburg'], ['Verfügbar', 'sofort · Vollzeit'], ['Scheine', '<div class="chipz"><span>Staplerschein ✓</span><span>Schubmaststapler ✓</span><span>Führerschein B</span></div>'],
      ['Sprachen', 'Deutsch C1 · Englisch B1'], ['Berufserfahrung', '<div class="exp"><b>2019 – heute</b> · Staplerfahrer, Lagerlogistik<br><b>2015 – 2019</b> · Lagerhelfer, Spedition</div>'], ['Kenntnisse', 'Wareneingang, Kommissionierung, SAP']]
      .map(([k, v]) => `<div class="k">${k}</div><div class="v"><div class="fv">${v}</div></div>`).join('')}</div>
    <div class="ok" id="pf-ok">✓ Aus Lebenslauf übernommen</div><div class="scanline" id="scan" style="left:0;width:690px;top:0"></div></div>
  <div class="sheet" id="s2-sheet" style="left:700px;top:250px"><span class="file">PDF</span><h5>Lebenslauf</h5><h3>Jonas Petersen</h3>
    ${[1, 1, .8, 0, 1, .9, 1, .7, 0, 1, .85, 1, .6].map(x => x ? `<div class="ln" style="width:${x * 100}%"></div>` : '<div class="ln b"></div>').join('')}</div>`);
for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) $('#s2').appendChild(el(`<div class="cell" style="position:absolute;left:${c * 160}px;top:${r * 180}px;width:161px;height:181px;background:#052835;z-index:80;transform:scale(0)"></div>`));

// 03 overview: three boards fanned
scene('s3', `<div class="ncol" id="n3"><div class="num"><b>03</b> — Überblick</div><div class="title"><span class="m"><span>Alles auf</span></span><span class="m"><span><em>einen Blick.</em></span></span></div><div class="rule"></div>
    <div class="sub">Kandidaten, Kunden und Vakanzen – jeweils als Board zum Ziehen.</div></div>
  <div id="s3-cam" class="abs" style="inset:0">
  ${winHTML('s3-k', 'left:640px;top:150px;width:1240px;height:740px', sidebar('Kandidaten') + topUI('Kandidaten-Pipeline', '#4c6ef5') +
    `<div class="main">${board([['Neuer Kandidat', 'blau', 10, [{ i: 'EH', n: 'Erik Hansen', b: 'Lagerhelfer', o: '22547 Hamburg-Lurup' }, { i: 'RV', n: 'Rafael Varga', b: 'Fachlagerist', o: '22115 Hamburg-Billstedt' }, { i: 'PP', n: 'Priya Patel', b: 'Qualitätsprüferin', o: '22111 Hamburg-Horn' }]],
      ['Bewerberpool', 'lila', 4, [{ i: 'KS', n: 'Kevin Schröder', b: 'Lagerhelfer', o: '22089 Hamburg-Eilbek' }, { i: 'NC', n: 'Nils Carstens', b: 'Bauhelfer', o: '22926 Ahrensburg' }]],
      ['Vorstellungsgespräch', 'tuerkis', 5, [{ i: 'JP', n: 'Jonas Petersen', b: 'Staplerfahrer', o: '21073 Hamburg-Harburg', id: 's3-target' }, { i: 'PW', n: 'Patrick Wendt', b: 'Industriemechaniker', o: '22848 Norderstedt' }]],
      ['Verfügbarer Kandidat', 'gruen', 7, [{ i: 'SH', n: 'Sabrina Hoffmann', b: 'Fachkraft Lagerlogistik', o: '22850 Norderstedt' }, { i: 'DI', n: 'Daniel Ionescu', b: 'Kommissionierer', o: '22547 Hamburg-Eidelstedt' }]]])}</div>`)}
  ${winHTML('s3-u', 'left:720px;top:200px;width:1120px;height:690px', sidebar('Unternehmen') + topUI('Unternehmen', '#229b63') +
    `<div class="main">${board([['Interessent', 'blau', 6, [{ i: 'KL', n: 'Kranich Logistik GmbH', b: 'Logistik · Hamburg' }, { i: 'EV', n: 'Elbdeich Verpackung', b: 'Produktion · Wedel' }]],
      ['Besuchstermin', 'gelb', 2, [{ i: 'NW', n: 'Nordwerk Metall', b: 'Metall · Harburg' }]], ['Kunde', 'gruen', 18, [{ i: 'HK', n: 'Hansekai Kühlhaus', b: 'Lebensmittel · Hamburg' }, { i: 'SB', n: 'Seestern Bau', b: 'Bau · Stade' }]]])}</div>`)}
  ${winHTML('s3-v', 'left:800px;top:250px;width:1040px;height:650px', sidebar('Vakanzen') + topUI('Vakanzen', '#229b63') +
    `<div class="main">${board([['Aktiv', 'gruen', 9, [{ i: 'SF', n: 'Staplerfahrer (m/w/d)', b: 'Kranich Logistik · 3 Plätze' }, { i: 'MA', n: 'Maschinenbediener', b: 'Nordwerk Metall' }]],
      ['Online', 'blau', 6, [{ i: 'KO', n: 'Kommissionierer', b: 'Stellenbörse · Indeed' }]], ['Pausiert', 'grau', 2, [{ i: 'EL', n: 'Elektriker', b: 'Seestern Bau' }]]])}</div>`)}
  </div>`);

// 04 one thread
const MSG = [['wa', 'Hallo Jonas, danke für deine Bewerbung als Staplerfahrer! Passt dir Donnerstag, 10:30 Uhr?', 'WhatsApp · 09:12'],
  ['wa in', 'Ja, passt. Bis Donnerstag!', 'WhatsApp · 09:14'],
  ['em', '<span class="subj">Ihre Unterlagen</span>Könnten Sie uns noch Ihren Staplerschein schicken?', 'E-Mail · 09:20'],
  ['em in', '<span class="subj">Re: Ihre Unterlagen</span>Anbei der Schein.<br><span class="att">staplerschein.pdf</span>', 'E-Mail · 09:41'],
  ['wa', 'Danke, ist angekommen. Bis Donnerstag!', 'WhatsApp · 09:43']];
scene('s4', `<div class="ncol" id="n4"><div class="num"><b>04</b> — Kommunikation</div><div class="title"><span class="m"><span>WhatsApp &amp; E-Mail.</span></span><span class="m"><span><em>Ein Verlauf.</em></span></span></div><div class="rule"></div>
    <div class="sub">Antworten aus Outlook und WhatsApp werden automatisch zugeordnet.</div></div>
  ${winHTML('s4-win', 'left:660px;top:150px;width:1200px;height:760px', sidebar('Kommunikation') + topUI('Kommunikation', '#3b5bdb') +
    `<div class="main"><div class="chat"><div class="chd"><div class="av">JP</div><div><b>Jonas Petersen</b><div style="font-size:13px;color:#6b7280">Kandidat · Staplerfahrer</div></div>
      <div class="sw"><span id="sw-wa" class="on">WhatsApp</span><span id="sw-em">E-Mail</span><span>Interne Notiz</span></div></div>
      <div class="tl" id="s4-tl"></div><div class="msgs">${MSG.map(([c, x, m], i) => `<div class="msg ${c}" id="m${i}">${x}<span class="meta">${m}</span></div>`).join('')}</div></div></div>`)}`);

// 05 three-way split
const CAL_EV = [[0, 1.5, 1.2, 'VG · Jonas P.', '#eef1fe', '#2f4fd6'], [1, 3.2, 1, 'AV intern · Aylin K.', '#fdf6ea', '#8a5b00'], [2, 0.6, 1.3, 'Besuch Kranich Logistik', '#ebf7f1', '#1e7a46'],
  [3, 2.4, 1, 'VG · Dennis V.', '#eef1fe', '#2f4fd6'], [4, 4.2, 1.1, 'Einsatzstart Ole J.', '#f4f0fe', '#5b3fc4'], [2, 4.6, 0.9, 'Rückruf Nordwerk', '#fdf6ea', '#8a5b00']];
scene('s5', `
  <div class="tri" id="mp1" style="left:96px"><div class="mlabel label"><b>Einsätze</b></div>${winHTML('', '', topUI('Mitarbeiter', '#4c6ef5', 1) + `<div class="main" style="left:0">${board([
    ['Im Einsatz', 'gruen', 23, [{ i: 'OJ', n: 'Ole Jensen', b: 'Hansekai Kühlhaus', t: 'seit 02.11.' }, { i: 'PW', n: 'Paul Weber', b: 'Seestern Bau', t: 'seit 14.10.' }, { i: 'SR', n: 'Sofia Rossi', b: 'Nordwerk Metall', t: 'bis 20.12.' }]],
    ['Fehlzeit', 'gelb', 2, [{ i: 'TA', n: 'Tim Albers', b: 'Urlaub bis 05.12.' }]]], 'tight')}</div>`, 'small')}</div>
  <div class="tri" id="mp2" style="left:680px"><div class="mlabel label"><b>Termine</b></div>${winHTML('', '', topUI('Kalender · KW 48', '#d48a14', 1) + `<div class="main" style="left:0"><div class="cal">
    <div class="hd"></div>${['Mo 23.', 'Di 24.', 'Mi 25.', 'Do 26.', 'Fr 27.'].map(d => `<div class="hd">${d}</div>`).join('')}
    <div class="hrs" style="grid-row:2;grid-column:1;position:relative">${['8', '10', '12', '14', '16'].map((h, i) => `<div class="hr" style="position:absolute;right:0;top:${i * 110}px">${h}:00</div>`).join('')}</div>
    ${[0, 1, 2, 3, 4].map(d => `<div class="ccol" style="grid-row:2;height:560px">${CAL_EV.filter(e => e[0] === d).map(e => `<div class="ev" style="top:${e[1] * 110}px;height:${e[2] * 100}px;background:${e[4]};color:${e[5]};border-left:3px solid ${e[5]}">${e[3]}</div>`).join('')}</div>`).join('')}
    </div></div>`, 'small')}</div>
  <div class="tri" id="mp3" style="left:1264px"><div class="mlabel label"><b>Controlling</b></div>${winHTML('', '', topUI('Controlling', '#229b63', 1) + `<div class="main" style="left:0;background:#fff">
    <div class="kpis"><div><small>Bewerbungen · 30 Tage</small><b id="kp1">0</b><em>▲ 18 %</em></div><div><small>Vermittlungen</small><b id="kp2">0</b><em>▲ 4</em></div></div>
    <div class="bars">${[38, 52, 47, 64, 58, 81].map((v, i) => `<i style="height:${v}%"><b>${['Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov'][i]}</b></i>`).join('')}</div></div>`, 'small')}</div>`);

// 06 feature list + stamp
const FEAT = ['Bewerbungs-Board', 'Lebenslauf auslesen', 'Kandidaten-Pipeline', 'Matching-Board', 'Mitarbeiter-Board', 'Unternehmen & Ansprechpartner', 'WhatsApp & E-Mail', 'Outlook-Kalender',
  'Aufgaben', 'Team-Chat', 'Handy-App', 'Push-Meldungen', 'Niederlassungen & Rollen', 'Eigene Stellenbörse', 'Indeed-Feed', 'Profil als PDF', 'Controlling', 'Datenschutz-Fristen', 'Import & Export', 'Automatisierungen'];
scene('s6', `<div class="flist" id="fl1" style="left:96px;top:0">${FEAT.map(f => `<div>${f}</div>`).join('')}</div>
  <div class="flist b" id="fl2" style="left:1240px;top:0">${FEAT.slice().reverse().map(f => `<div>${f}</div>`).join('')}</div>
  <div id="stamp">Pflicht ✓</div><div id="curtain"></div>`);

// Kür
scene('s7', `<div id="k-small" class="label"><b>Jetzt die</b></div><div id="k-big"><span>K</span><span>ü</span><span>r</span><span id="k-dot"></span></div>`);
const ORB_SVG = id => `<svg id="${id}" viewBox="0 0 190 190" width="190" height="190"><defs>
  <radialGradient id="${id}g"><stop offset="0" stop-color="#6fd3a1" stop-opacity=".55"/><stop offset="1" stop-color="#6fd3a1" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}c" cx=".38" cy=".35"><stop offset="0" stop-color="#e9fff2"/><stop offset=".45" stop-color="#8fe3b6"/><stop offset="1" stop-color="#2f9a68"/></radialGradient></defs>
  <circle class="glow" cx="95" cy="95" r="92" fill="url(#${id}g)"/>${[0, 1, 2, 3, 4].map(k => `<path class="rg" fill="none" stroke="#6fd3a1" stroke-opacity="${.85 - k * .14}" stroke-width="1.4"/>`).join('')}
  <circle class="core" cx="95" cy="95" r="20" fill="url(#${id}c)"/></svg>`;

// H1 KI-Assistent
const KAND = [['Jonas Petersen', 'Verfügbarer Kandidat', 91, 'Harburg', 'Stapler, Schubmast'], ['Aylin Kaya', 'Top Kandidat', 86, 'Wilhelmsburg', 'Stapler'], ['Marek Nowak', 'Bewerberpool', 82, 'Neugraben', 'Stapler']];
const lk = (x, y, [n, s, p, ort, sch], i) => `<div class="lk" id="lk${i}" style="left:${x}px;top:${y}px"><div class="kh"><div class="ki" style="background:rgba(143,166,255,.18);color:#8fa6ff">${ic('user')}</div>
    <div><div class="kw" style="color:#8fa6ff">Kandidat</div><div class="kt">${n}</div><div class="ku">Staplerfahrer · ${ort}</div></div></div>
    <div class="kb"><span class="st" style="background:rgba(111,211,161,.18);color:#6fd3a1">${s}</span><dl><dt>Match</dt><dd class="pct" data-p="${p}">0 %</dd><dt>Scheine</dt><dd>${sch}</dd></dl>
    <div class="bt"><span class="h">In den Fokus</span><span>Passende Vakanzen</span></div></div></div>`;
scene('h1', `<div class="ncol" id="nh1"><div class="num"><b>01</b> — KI-Assistent</div><div class="title"><span class="m"><span>Sie sprechen.</span></span><span class="m"><span><em>Er erledigt.</em></span></span></div><div class="rule"></div>
    <div class="sub">Sucht, matcht, plant Termine, schreibt Nachrichten – mit Ihren Vorlagen.</div></div>
  <div class="persp">${winHTML('h1-win', 'left:676px;top:200px;width:1330px;height:712px;transform-origin:0 50%', topUI('KI-Center', '#3b5bdb', 1) +
    `<div class="ls"><div class="lp"><div class="hd"><b>Sprachassistenz</b><span>Beenden</span></div>
      <div class="orbbox" id="orbbox">${ORB_SVG('orb1')}</div>
      <div class="phase" id="phase">Ich höre zu</div><div class="hint">Sprich einfach – ich lege dir alles auf die Bühne.</div>
      <div class="msgs"><div class="bub u" id="u1"></div><div class="bub a" id="a1">Drei passen. Jonas Petersen hat 91 %.</div><div class="bub live" id="u2"></div></div></div>
      <div class="stg"><div class="sh">Bühne <span id="bcount">0 Karten</span></div>${KAND.map((k, i) => lk(18 + i * 282, 64, k, i)).join('')}
        <div class="lk" id="lk3" style="left:18px;top:300px"><div class="kh"><div class="ki" style="background:rgba(242,192,107,.18);color:#f2c06b">${ic('cal')}</div>
        <div><div class="kw" style="color:#f2c06b">Termin</div><div class="kt">VG · Do, 10:30 Uhr</div><div class="ku">Jonas Petersen · Harburg</div></div></div>
        <div class="kb"><dl><dt>Kalender</dt><dd>Outlook ✓</dd><dt>Erinnerung</dt><dd>1 Tag vorher</dd></dl></div></div></div></div>`, 'dark')}</div>
  <div class="fg" id="fg" style="left:1090px;top:452px"><div class="fh" id="fg-h1"><span class="k">Freigabe nötig</span><span class="w"><i></i>WhatsApp</span></div>
    <div class="fh" id="fg-h2" style="position:absolute;left:0;right:0;top:0;background:#1f7a45;border-color:#1f9d55;opacity:0"><span class="k" style="color:#fff">Gesendet ✓</span><span class="w" style="color:#e7f6ee"><i></i>WhatsApp</span></div>
    <div class="fb"><div class="ft2">Nachricht an Jonas Petersen</div>
      <div><div class="fl">Vorlage</div><div class="sel"><span>VG-Einladung</span><span style="color:#6f7795">▾</span></div></div>
      <div><div class="fl">Text</div><div class="txt" id="fg-txt" style="min-height:96px"></div></div>
      <div class="acts"><span class="ja" id="fg-ja">Ausführen</span><span class="nein">Abbrechen</span></div></div></div>`);
$('#scenes').appendChild(el(`<div id="flyorb" style="left:0;top:0;visibility:hidden">${ORB_SVG('orb2')}</div>`));

// H2 dashboard
scene('h2', `<div class="ncol" id="nh2"><div class="num"><b>02</b> — Bewerbungen</div><div class="title"><span class="m"><span>Jede Bewerbung</span></span><span class="m"><span><em>vorbereitet.</em></span></span></div><div class="rule"></div>
    <div class="sub">Kurzbewertung, passende Stellen und Antwortentwurf liegen schon auf dem Dashboard.</div></div>
  <div id="h2-cam" class="abs" style="inset:0"><div class="persp">${winHTML('h2-win', 'left:640px;top:150px;width:1250px;height:760px;transform-origin:0 50%', sidebar('Dashboard') + topUI('Dashboard', '#3b5bdb') +
    `<div class="dash"><h1>Moin Sarah</h1><div class="dt">Donnerstag, 26. November 2026 · 12 Vorschläge offen</div>
      <div class="kibar"><i>${ic('ki', '#fff').replace('<svg', '<svg style="width:18px;height:18px"')}</i>Frag mich etwas oder bitte mich, etwas zu erledigen</div>
      <div class="cols"><div class="left"><div class="sec"><i></i>Bewerbungen <span>3</span></div>
        <div class="vcard" id="vc1"><span class="vpill" id="pill1">Neu</span><span class="vpill" id="pill2" style="background:#e8f6ee;color:#1f7a45;opacity:0">Kontaktiert</span>
          <div class="t">Neue Bewerbung: Dennis Vogt</div><div class="s">Fachlagerist · Hamburg-Stellingen · über Indeed · vor 4 Min</div>
          <div class="xp" id="xp"><div class="lab" id="xl1">Kurzbewertung</div><div class="kb" id="xk">5 Jahre Lager, Staplerschein, wohnt 6 km entfernt – passt gut für Früh- und Spätschicht.</div>
            <div class="lab" id="xl2">Passende Stellen</div><div class="sc"><span id="chip82">Staplerfahrer (m/w/d) · <b>82 %</b></span><span id="chip74">Lagermitarbeiter · <b>74 %</b></span></div>
            <div class="lab" id="xl3">Antwortentwurf · WhatsApp</div><div class="draft" id="draft"></div></div>
          <div class="acts"><span class="p" id="send">Senden</span><span>Ändern</span><span>Anrufen</span><span>Nicht</span></div></div>
        <div class="vcard"><div class="t">Kontaktiert seit 3 Tagen: Aylin Kaya</div><div class="s">Kommissioniererin · übernehmen oder absagen?</div></div>
        <div class="vcard"><div class="t">Neue Bewerbung: Marek Nowak</div><div class="s">Lagerhelfer · über Arbeitsagentur · vor 22 Min</div></div></div>
      <div class="right"><div style="font-size:17px;font-weight:700;margin-bottom:10px">Gerade eben</div><div class="feed">
        <div class="fi" id="fi0" style="opacity:0"><i></i><div><b>Du → Jonas Petersen:</b> VG-Einladung<small>WhatsApp · gerade eben</small></div></div>
        <div class="fi"><i></i><div><b>Kranich Logistik</b> schreibt: „Aw: Profil“<small>Outlook · vor 12 Min</small></div></div>
        <div class="fi"><i></i><div><b>Neue Bewerbung</b> über StepStone<small>vor 31 Min</small></div></div>
        <div class="fi"><i></i><div><b>Nordwerk Metall</b> schreibt: „Termin passt“<small>Outlook · vor 1 Std</small></div></div></div></div></div></div>`)}</div></div>
  <div class="atoast" id="toast" style="left:1010px;top:690px">✓ Gesendet über <b>WhatsApp</b> · Status: Kontaktiert</div>`);

// H3 matching
const DRAFT = 'Hallo Dennis, danke für deine Bewerbung als Fachlagerist! Ab wann könntest du starten – und passt dir ein kurzes Telefonat morgen?';
const MROWS = [['JP', 'Jonas Petersen', 'Staplerfahrer', 91, '12 Min', '4,7 km · Bus', 'blau'], ['AK', 'Aylin Kaya', 'Kommissioniererin', 86, '18 Min', '7,9 km · Auto', 'gelb'],
  ['DV', 'Dennis Vogt', 'Fachlagerist', 82, '9 Min', '6,1 km · Auto', 'lila'], ['MN', 'Marek Nowak', 'Lagerhelfer', 77, '24 Min', '11 km · Bahn', 'tuerkis'], ['OJ', 'Ole Jensen', 'Schweißer', 71, '21 Min', '9,4 km · Auto', 'gruen']];
scene('h3', `<div class="ncol" id="nh3"><div class="num"><b>03</b> — Matching</div><div class="title"><span class="m"><span>Wer passt –</span></span><span class="m"><span><em>und wie weit.</em></span></span></div><div class="rule"></div></div>
  <div id="h3-move" class="abs" style="inset:0"><div class="persp">${winHTML('h3-win', 'left:640px;top:150px;width:1250px;height:740px;transform-origin:0 50%', topUI('Matching', '#7c55e0', 1) + `<div class="mlist" style="top:56px"><div class="mh"><i></i><b>Staplerfahrer (m/w/d)</b><span>Kranich Logistik GmbH · 21079 Hamburg · 3 Plätze</span>
      <span style="margin-left:auto;font-size:14px;color:#5a3bb8;background:#f3effd;padding:6px 11px;border-radius:8px;font-weight:600">22 automatisch gefunden</span></div>
      ${MROWS.map(([i, n, b, p, fz, fd, c], k) => `<div class="mrow" id="mr${k}" style="top:${94 + k * 104}px"><div class="av" style="background:${COLS[c][2]};color:${COLS[c][3]}">${i}</div><div class="nm"><b>${n}</b><small>${b}</small></div>
        <div class="sc"><div class="bar"><u data-p="${p}" style="width:${p}%"></u></div><b class="pp" data-p="${p}">0 %</b></div><div class="fz"><span class="fzv">${fz}</span><small class="fzv">${fd}</small></div>
        <div class="ck"><span>Staplerschein ✓</span><span>Deutsch B1 ✓</span></div><span class="go">Matchanalyse</span></div>`).join('')}</div>`)}</div>
  <div class="mapc" id="map" style="left:120px;top:560px"><svg viewBox="0 0 420 330" id="mapsvg"></svg><div class="cap2">Umkreis 25 km · Fahrzeit</div></div></div>`);
(function drawMap() {
  const s = $('#mapsvg'), NS = 'http://www.w3.org/2000/svg';
  const add = (tag, at) => { const e = document.createElementNS(NS, tag); Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v)); s.appendChild(e); return e; };
  add('rect', { x: 0, y: 0, width: 420, height: 330, fill: '#eef0f3' });
  add('path', { d: 'M-10 230 C 80 200, 140 260, 230 220 S 360 150, 440 180', stroke: '#c9dcf0', 'stroke-width': 26, fill: 'none' }); // river
  for (let i = 0; i < 14; i++) add('path', { d: `M${rnd(i) * 420} ${-10} L ${rnd(i + 30) * 420} 340`, stroke: '#fff', 'stroke-width': 3 + (i % 3), fill: 'none' });
  for (let i = 0; i < 10; i++) add('path', { d: `M-10 ${rnd(i + 60) * 330} L 430 ${rnd(i + 90) * 330}`, stroke: '#fff', 'stroke-width': 2 + (i % 2) * 2, fill: 'none' });
  [130, 90, 50].forEach((r, k) => add('circle', { cx: 210, cy: 170, r, fill: k === 2 ? 'rgba(124,85,224,.10)' : 'none', stroke: 'rgba(124,85,224,.45)', 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }));
  const C = [[150, 120], [300, 110], [260, 240], [120, 250], [345, 205]];
  C.forEach(([x, y], k) => {
    const p = add('path', { class: 'route', d: `M${x} ${y} Q ${(x + 210) / 2 + 20} ${(y + 170) / 2 - 30} 210 170`, stroke: '#7c55e0', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
    const L = p.getTotalLength(); p.setAttribute('stroke-dasharray', L); p.setAttribute('stroke-dashoffset', L); p.dataset.len = L;
    add('circle', { class: 'cdot', cx: x, cy: y, r: 9, fill: ['#5b7cfa', '#e0a33b', '#8b6cf0', '#2fb5c8', '#1f9d55'][k], stroke: '#fff', 'stroke-width': 3 });
  });
  add('circle', { cx: 210, cy: 170, r: 13, fill: '#16181d', stroke: '#fff', 'stroke-width': 4 });
})();

// H4 tablet
scene('h4', `<div class="ncol" id="nh4" style="top:210px"><div class="num"><b>04</b> — Vorstellungsgespräch</div><div class="title"><span class="m"><span>Am Tablet.</span></span><span class="m"><span><em>KI-Protokoll.</em></span></span></div><div class="rule"></div></div>
  <div class="pcard" id="h4-card" style="left:96px;top:560px;width:560px;height:290px"><div class="ph" style="padding:16px 20px"><div class="av" style="width:46px;height:46px;font-size:16px">JP</div><div><div class="nm" style="font-size:20px">Jonas Petersen</div><div class="sub">Profil · VG-Protokoll</div></div></div>
    <div class="bd" style="grid-template-columns:120px 1fr;padding:14px 20px;gap:9px 14px;font-size:15px">${['Scheine', 'Erfahrung', 'Schicht', 'Start'].map((k, i) => `<div class="k">${k}</div><div class="v"><span class="h4v" id="h4v${i}"></span></div>`).join('')}</div>
    <div class="ok" id="h4-ok">✓ Übernommen</div></div>
  <div id="tab"><div class="scr">
    <div class="vs" id="vs1"><div class="vh"><div><b>Qualifikationsbogen</b><br><small>Jonas Petersen · Staplerfahrer</small></div><div class="dots"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div></div>
      ${[['Staplerschein vorhanden?', ['Ja', 'Nein']], ['Schubmaststapler gefahren?', ['Ja', 'Nein']], ['Schichtbereitschaft', ['Früh', 'Spät', 'Nacht']]].map(([q, o], i) =>
        `<div class="q" id="q${i}">${q}<div class="opt">${o.map((x, k) => `<span class="${(k === 0 || (i === 2 && k === 1)) ? 'will' : ''}">${x}</span>`).join('')}</div></div>`).join('')}</div>
    <div class="vs" id="vs2"><div class="vh"><div><b>Unterschrift</b><br><small>Einwilligung &amp; Angaben bestätigt</small></div><div class="dots"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div></div>
      <div class="sig"><svg viewBox="0 0 900 330"><path id="sigpath" d="M90 230 C 120 120, 160 110, 170 200 S 220 260, 250 170 C 270 110, 300 120, 300 190 C 300 240, 340 240, 360 180 C 380 130, 420 140, 430 200 C 440 250, 480 240, 500 170 L 520 120 C 530 180, 560 230, 600 190 C 640 150, 660 180, 700 175 C 740 170, 760 150, 800 160" fill="none" stroke="#16181d" stroke-width="5" stroke-linecap="round"/></svg>
      <div class="base"></div><small>Jonas Petersen · Hamburg, 26.11.2026</small></div></div>
    <div class="vs" id="vs3"><div class="vh"><div><b>Interview</b><br><small>Aufnahme läuft – Kandidat und Disponent</small></div><div class="dots"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div></div>
      <div class="rec"><i></i>REC <small id="rectime">04:12</small></div><div class="wavebox" id="wavebox">${Array.from({ length: 64 }, () => '<u></u>').join('')}</div></div>
    <div class="vs" id="vs4"><div class="vh"><div><b>VG-Protokoll</b><br><small>Entwurf · von der KI aus dem Gespräch</small></div><span style="margin-left:auto;font-size:15px;font-weight:700;color:#5a3bb8;background:#f3effd;padding:6px 12px;border-radius:8px">✦ KI</span></div>
      <div class="proto">${[['Scheine', 'Stapler, Schubmast'], ['Erfahrung', '5 Jahre Lager'], ['Schicht', 'Früh / Spät'], ['Start', '02.12.2026'], ['Eindruck', 'ruhig, zuverlässig']].map(([k, v], i) => `<div id="pr${i}"><b>${k}:</b> ${v}</div>`).join('')}</div></div>
  </div></div>
  ${[0, 1, 2, 3].map(i => `<div class="fly" id="fly${i}">${['Stapler, Schubmast', '5 Jahre Lager', 'Früh / Spät', '02.12.2026'][i]}</div>`).join('')}
  <div id="morphline" class="abs" style="height:3px;background:var(--signal-hi);z-index:50;left:0;top:0;width:10px;opacity:0"></div>`);

// H5 sales
const TROWS = [['Kranich Logistik GmbH', '21079 Hamburg', 'Frau Petra Lindner', 'Personalreferentin', '040 000 2101', 'Einsatzmöglichkeit: Staplerfahrer'],
  ['', '', 'Herr Sven Albrecht', 'Werkleiter', '040 000 2102', 'Einsatzmöglichkeit: Staplerfahrer'], ['Elbdeich Verpackung', '22880 Wedel', 'Frau Kerstin Hoff', 'Personalleiterin', '04103 000 310', 'Offene Vakanz: Lagerhelfer (m/w/d)'],
  ['Hansekai Kühlhaus', '20457 Hamburg', 'Herr Marco Brandt', 'Lagerleiter', '040 000 4470', 'Offene Vakanz: Kommissionierer'], ['Nordwerk Metall', '21073 Hamburg', 'Frau Jana Kluge', 'Schichtleiterin', '040 000 5120', 'Stellenanzeige: Fachlagerist'],
  ['Seestern Bau', '21680 Stade', 'Herr Tobias Rehm', 'Bauleiter', '04141 000 77', 'Branche: Logistik']];
const LANES = [['Abwesend', 'gelb', 3], ['Vertretung', 'blau', 2], ['Interesse', 'gruen', 3], ['Kein Interesse', 'grau', 2]];
const REPLIES = [[2, 'Hansekai Kühlhaus', 'Gerne Profil schicken!'], [0, 'Elbdeich Verpackung', 'Abwesend bis 01.12.'], [1, 'Nordwerk Metall', 'Bitte an Frau Kluge'], [2, 'Kranich Logistik', 'Interesse – Termin?'],
  [3, 'Seestern Bau', 'Aktuell kein Bedarf'], [0, 'Hafenblick Logistik', 'Im Urlaub bis Montag'], [2, 'Mühlenkamp Food', 'Bitte anrufen'], [1, 'Alsterwerk Druck', 'Neuer Ansprechpartner'], [0, 'Wiesenhof Agrar', 'Abwesend'], [3, 'Fleet Montage', 'Kein Interesse']];
scene('h5', `<div class="ncol" id="nh5"><div class="num"><b>05</b> — Vertrieb</div><div class="title"><span class="m"><span>Vertrieb auf</span></span><span class="m"><span><em>Knopfdruck.</em></span></span></div><div class="rule"></div>
    <div class="sub">Telefonlisten mit KI-Suchbegriffen. Mailing-Antworten sortieren sich selbst.</div></div>
  ${winHTML('h5-tl', 'left:640px;top:150px;width:1250px;height:760px', `<div class="tlist"><div class="th"><span class="bk">← Listen</span><b>Staplerfahrer Akquise</b><small>Ansprechpartner</small></div>
    <div class="chips"><span class="lb">Suchbegriffe</span><span>Staplerfahrer</span><span class="ki" id="kc0">✦ Lagerhelfer</span><span class="ki" id="kc1">✦ Kommissionierer</span><span class="ki" id="kc2">✦ Fachlagerist</span></div>
    <div class="prog"><div class="pb"><u id="tprog"></u></div><b id="tcount">0 von 20</b> <span style="color:#9aa0aa;font-size:15px">bearbeitet</span><span class="nx">📞 Nächster: Frau Lindner</span></div>
    <div class="trow hd" style="top:200px"><span class="f">Firma</span><span class="n">Name</span><span class="p">Telefon</span><span class="w">Warum</span><span class="r">Ergebnis</span></div>
    ${TROWS.map(([f, fo, n, np, p, why], i) => `<div class="trow" id="tr${i}" style="top:${244 + i * 70}px"><span class="f">${f}<small>${fo}</small></span><span class="n">${n}<small>${np}</small></span><span class="p">${p}</span><span class="w">${why}</span><span class="r"><span>Nicht erreicht</span><span>Überspringen</span></span></div>`).join('')}</div>`)}
  ${winHTML('h5-ml', 'left:640px;top:150px;width:1250px;height:760px', `<div class="mail"><div class="mh"><b>Mailing: Staplerfahrer – Profil</b><small>48 gesendet · gestern</small></div>
    <div class="cnt"><span class="on">Zu bearbeiten <b id="mc">0</b></span><span>Ohne Reaktion 31</span><span>Erledigt 5</span></div>
    <div class="lanes">${LANES.map(([n, c], i) => `<div class="lane" id="ln${i}" style="background:${COLS[c][1]}"><h4><i style="background:${COLS[c][0]}"></i>${n}<span class="c" id="lc${i}" style="background:${COLS[c][2]};color:${COLS[c][3]}">0</span></h4>${i === 2 ? '<div class="all" id="all">Alle 3 bestätigen</div>' : ''}</div>`).join('')}</div>
    ${REPLIES.map(([l, f, x], i) => `<div class="rc" id="rc${i}"><b>${f}</b><small>${x}</small></div>`).join('')}</div>`)}`);

// end card
scene('end', `<img id="e-logo" src="../assets/logo-alpha.png" alt=""><div id="e-label" class="label"><b>Für Personaldienstleister</b> · von Betrieb Zukunft</div>
  <div id="e-head">${['Ihr', 'eigenes', '<em>ATS.</em>'].map(x => `<span class="m"><span>${x}</span></span>`).join(' ')}</div>
  <div id="e-sub">${['Angepasst', 'an', 'Ihren', 'Betrieb.'].map(x => `<span class="m"><span>${x}</span></span>`).join(' ')}</div>
  ${CTA ? '<div id="e-cta"><i>Jetzt</i>Kostenloses Erstgespräch<u>→</u></div>' : '<div id="e-url">betrieb-zukunft.de</div>'}
  <div id="e-recap">${['KI-Assistent', 'Bewerbungen vorbereitet', 'Matching mit Fahrzeit', 'Vorstellungsgespräch am Tablet', 'Telefonlisten & Mailings'].map((x, i) =>
    `<div class="pchip mid" style="position:absolute;left:${1400 + (i % 2) * 50}px;top:${262 + i * 92}px;height:50px;font-size:20px;padding:0 20px 0 18px;transform:none;filter:none"><i></i>${x}</div>`).join('')}</div>`);

$('#scenes').appendChild(el('<div id="zoomflash" class="abs" style="inset:0;background:#7c55e0;opacity:0;z-index:70"></div>'));

/* ---------- grid lines (paper) ---------- */
const grid = $('#grid');
for (let i = 0; i <= 12; i++) { const x = i < 12 ? 96 + i * 146 : 1824; grid.appendChild(el(`<div class="v${i === 0 || i === 12 ? ' m' : ''}" style="left:${x}px"></div>`)); }
[236, 900].forEach(y => grid.appendChild(el(`<div class="h" style="top:${y}px"></div>`)));
[[96, 236], [1824, 236], [96, 900], [1824, 900]].forEach(([x, y]) => grid.appendChild(el(`<div class="cross" style="left:${x}px;top:${y}px"></div>`)));
$('#stage').appendChild(el(`<svg class="cursor" id="cursor" viewBox="0 0 24 24" style="left:0;top:0;opacity:0"><path d="M4 2l16 9.2-7 1.6 4.2 7.4-3 1.6-4.1-7.4L4 19z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>`));

/* ---------- timeline ---------- */
function build() {
const RECT = e => { const r = (typeof e === 'string' ? $(e) : e).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
// measure everything in its final pose before any from-state is applied
gsap.set('#s1-win', { rotationY: 14, rotationX: -2 });
gsap.set('#h1-win', { rotationY: 12, rotationX: -2 });
gsap.set('#h2-win', { rotationY: 9, rotationX: -2 });
gsap.set('#h3-win', { rotationY: 7, rotationX: -1 });
gsap.set('#hk-win', { rotationY: 16, rotationX: -2 });
$$('.scene').forEach(s => { s.style.visibility = 'visible'; });
$('#draft').textContent = DRAFT;
const xpH = $('#xp').scrollHeight;
const M = {
  jp: RECT('#jp-card'), orb: RECT('#orbbox'), dot: RECT('#k-dot'), fgja: RECT('#fg-ja'), fg: RECT('#fg'), fi0: RECT('#fi0'), target: RECT('#s3-target'),
  send: RECT('#send'), chip82: RECT('#chip82'), map: RECT('#map'),
  pr: [0, 1, 2, 3].map(i => RECT('#pr' + i)), h4v: [0, 1, 2, 3].map(i => RECT('#h4v' + i)), card4: RECT('#h4-card'), tl: RECT('#h5-tl'),
  lanes: [0, 1, 2, 3].map(i => RECT('#ln' + i)), ml: RECT('#h5-ml'),
};
$$('.scene').forEach(s => { s.style.visibility = ''; });
$('#xp').style.height = '0px';
$('#draft').textContent = '';

const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
const vis = (sel, a, b) => { tl.set(sel, { visibility: 'visible' }, a); if (b !== undefined) tl.set(sel, { visibility: 'hidden' }, b); };
const clipIn = (e, t, d = 0.6) => tl.fromTo(e, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d }, t);
const rise = (els, t, d = 0.7, st = 0.08) => tl.fromTo(els, { yPercent: 115 }, { yPercent: 0, duration: d, stagger: st }, t);
const pop = (e, t, d = 0.5, from = 0.85) => tl.fromTo(e, { scale: from, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: 'back.out(1.7)' }, t);
const fadeOut = (e, t, d = 0.35, extra = {}) => tl.to(e, { opacity: 0, duration: d, ease: 'power2.in', ...extra }, t);
const ncol = (id, t, t2) => {
  const c = $(id);
  clipIn(c.querySelector('.num'), t, 0.45);
  const lines = c.querySelectorAll('.title .m > span');
  rise(lines[0], t + 0.03, 0.65); rise(lines[1], t2 !== undefined ? t2 : t + 0.11, 0.65);
  tl.fromTo(c.querySelector('.rule'), { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.7 }, t + 0.12);
  const sub = c.querySelector('.sub'); if (sub) tl.fromTo(sub, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, t + 0.2);
};
const cursorTo = (x, y, t, d = 0.8) => tl.to('#cursor', { x, y, duration: d, ease: 'power2.inOut' }, t);
const click = t => { tl.to('#cursor', { scale: 0.82, duration: 0.07, ease: 'power1.in' }, t - 0.07); tl.to('#cursor', { scale: 1, duration: 0.18, ease: 'back.out(3)' }, t); sfx(t, 'click', 0.9); };

/* S0 hook */
vis('#s0', 0, 4.1);
clipIn('#hk-label', 0.08, 0.5);
$$('#hk-ats span').forEach((s, i) => { tl.fromTo(s, { y: -90, scale: 1.4, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.4)' }, w('ats') - 0.06 + i * 0.09); sfx(w('ats') - 0.04 + i * 0.09, 'thunk', 0.55 + i * 0.1); });
['aus', 'dem', 'alltag', 'eines', 'personaldienstleisters'].forEach((k, i) => rise($$('#hk-line .m > span')[i], w(k) - 0.05, 0.6));
tl.fromTo('#hk-ul', { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, w('personaldienstleisters') + 0.35);
tl.fromTo('#hk-win', { x: 360, opacity: 0 }, { x: 0, opacity: 1, duration: 1.3 }, 1.1); sfx(1.1, 'swish_low', 0.35, 0.5);
tl.to('#hk-win', { x: -60, duration: 2.6, ease: 'none' }, 2.4);
[0, 1, 2].forEach(i => { tl.fromTo('#wc' + i, { yPercent: -100 }, { yPercent: 0, duration: 0.34, ease: 'power3.in' }, 3.58 + i * 0.06); });
sfx(3.6, 'whoosh_big', 0.7);
// S1 is revealed by the same columns moving on down
vis('#s1', 3.94, 10.4);
[0, 1, 2].forEach(i => { $('#s1').appendChild(el(`<div class="wipecol" id="wd${i}" style="left:${i * 640}px;width:641px"></div>`)); tl.fromTo('#wd' + i, { yPercent: 0 }, { yPercent: 100, duration: 0.45, ease: 'power3.out' }, 3.97 + i * 0.06); });
tl.set(['#wd0', '#wd1', '#wd2'], { visibility: 'hidden' }, 4.7);

/* S1 portals */
tl.fromTo('#s1-big .mk > span', { yPercent: 110 }, { yPercent: 0, duration: 0.7 }, w('erst') + 0.02);
tl.to('#s1-big .mk > span', { yPercent: -115, duration: 0.4, ease: 'power3.in' }, w('bewerbungen') - 0.32);
ncol('#n1', w('bewerbungen'));
tl.fromTo('#s1-win', { x: 520, rotationY: 32, opacity: 0 }, { x: 0, rotationY: 14, opacity: 1, duration: 1.1 }, w('bewerbungen') - 0.12); sfx(w('bewerbungen') - 0.1, 'whoosh', 0.55, 0.4);
tl.to('#s1-win', { x: -40, duration: 4.2, ease: 'none' }, w('bewerbungen') + 1.0);
PCH.forEach(([, , , d, t0], i) => {
  const t = t0 === null ? w('arbeitsagentur') - 0.12 : t0;
  tl.fromTo('#pc' + i, { x: 900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 }, t);
  tl.to('#pc' + i, { x: d === 'near' ? -120 : d === 'mid' ? -60 : -28, duration: 3.2, ease: 'none' }, t + 0.9);
  sfx(t + 0.05, 'swish', d === 'near' ? 0.6 : 0.35, 0.5);
});
// Indeed flies into the "Neu" column and becomes the new card
tl.set('#jp-card', { opacity: 0 }, 0);
tl.fromTo('#pc-indeed', { x: 700, y: -120, opacity: 0 }, { x: M.jp.cx - 1500 - 60, y: M.jp.cy - 330 - 29, opacity: 1, duration: 0.55, ease: 'power3.out' }, w('indeed') - 0.45);
tl.to('#pc-indeed', { scale: 0.5, opacity: 0, duration: 0.22, ease: 'power2.in' }, w('indeed') + 0.08);
pop('#jp-card', w('indeed') + 0.12, 0.5, 0.8); sfx(w('indeed') + 0.12, 'pop', 0.8, -0.2);
// out: everything drops away, the CV sheet falls in
fadeOut(['#n1', '#s1-win', ...PCH.map((_, i) => '#pc' + i)], 9.62, 0.35, { y: 40 });

/* S2 CV */
vis('#s2', 9.6, 12.5);
tl.fromTo('#s2-sheet', { y: -820, rotation: -16 }, { y: 0, rotation: -4, duration: 0.5, ease: 'power2.in' }, 9.58);
tl.to('#s2-sheet', { y: -10, duration: 0.18, ease: 'power1.out', yoyo: true, repeat: 1 }, 10.08); sfx(10.06, 'paperthud', 0.45);
ncol('#n2', w('lebenslauf'), w('profil'));
tl.fromTo('#s2-card', { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 10.2);
tl.set('.pcard .fv, #pf-ok', { opacity: 0 }, 0);
tl.to('#s2-sheet', { x: (1130 + 345) - (700 + 190), y: (196 + 330) - (250 + 250), scale: 0.3, rotation: 0, opacity: 0, duration: 0.55, ease: 'power3.inOut' }, 10.62); sfx(10.62, 'whoosh_rev', 0.4);
tl.fromTo('#scan', { y: 0, opacity: 1 }, { y: 650, duration: 0.85, ease: 'power1.inOut' }, 10.95); tl.to('#scan', { opacity: 0, duration: 0.1 }, 11.8); sfx(10.95, 'rise', 0.25);
$$('#s2-card .fv').forEach((f, i) => { tl.fromTo(f, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45 }, w('profil') + i * 0.075); if (i % 2 === 0) sfx(w('profil') + i * 0.075, 'tick', 0.5); });
tl.fromTo('#pf-ok', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, w('profil') + 0.65);
// cell mask to S3
const cells = $$('#s2 .cell'), order = cells.map((c, i) => i).sort((a, b) => rnd(a + 5) - rnd(b + 5));
order.forEach((ci, k) => tl.fromTo(cells[ci], { scale: 0 }, { scale: 1.02, duration: 0.16, ease: 'power2.in' }, 12.12 + k * 0.0042));
sfx(12.12, 'whoosh', 0.5, -0.3);
vis('#s3', 12.44, w('whatsapp'));
for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) $('#s3').appendChild(el(`<div class="cell3" style="position:absolute;left:${c * 160}px;top:${r * 180}px;width:161px;height:181px;background:#052835;z-index:80"></div>`));
const cells3 = $$('#s3 .cell3');
order.forEach((ci, k) => tl.fromTo(cells3[ci], { scale: 1.02 }, { scale: 0, duration: 0.18, ease: 'power2.out' }, 12.46 + k * 0.0042));

/* S3 overview: pull back from one card, the boards fan in */
const ox = M.target.cx, oy = M.target.cy;
tl.fromTo('#s3-cam', { scale: 2.5, transformOrigin: `${ox}px ${oy}px` }, { scale: 1, duration: 1.0, ease: 'expo.out' }, w('kandidaten') - 0.02);
tl.set(['#s3-u', '#s3-v'], { opacity: 0 }, 0);
ncol('#n3', w('kandidaten') + 0.45);
tl.fromTo('#s3-u', { x: 760, opacity: 0, rotation: 2 }, { x: 0, opacity: 1, rotation: 0, duration: 0.8 }, w('kunden') - 0.08); sfx(w('kunden') - 0.06, 'swish', 0.5, 0.4);
tl.to('#s3-k', { x: -50, y: -30, scale: 0.96, duration: 0.8 }, w('kunden') - 0.08);
tl.fromTo('#s3-v', { x: 760, opacity: 0, rotation: 2 }, { x: 0, opacity: 1, rotation: 0, duration: 0.8 }, w('vakanzen') - 0.08); sfx(w('vakanzen') - 0.06, 'swish', 0.5, 0.5);
tl.to('#s3-u', { x: -40, y: -24, scale: 0.97, duration: 0.8 }, w('vakanzen') - 0.08);
tl.to('#s3-k', { x: -90, y: -54, scale: 0.93, duration: 0.8 }, w('vakanzen') - 0.08);
tl.to('#s3-cam', { x: -30, duration: 1.6, ease: 'none' }, w('blick') - 0.4);

/* S4 one thread – hard cut on "WhatsApp" */
vis('#s4', w('whatsapp'), 18.75);
ncol('#n4', w('whatsapp') + 0.02, w('verlauf') - 0.05);
const mt = [w('whatsapp') + 0.06, w('whatsapp') + 0.4, w('email') - 0.02, w('email') + 0.48, w('verlauf') - 0.12];
mt.forEach((t, i) => { tl.fromTo('#m' + i, { y: 24, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }, t); sfx(t, i % 2 ? 'blip' : 'pop', 0.55, i % 2 ? -0.3 : 0.3); });
tl.set('#sw-em', { background: '#16181d', color: '#fff', borderColor: '#16181d' }, w('email') - 0.02);
tl.set('#sw-wa', { background: '#fff', color: '#6b7280', borderColor: '#e6e8ec' }, w('email') - 0.02);
tl.set('#sw-wa', { background: '#16181d', color: '#fff', borderColor: '#16181d' }, w('verlauf'));
tl.fromTo('#s4-tl', { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'power2.out' }, w('verlauf'));
tl.to('#s4-win', { scale: 0.92, opacity: 0, duration: 0.3, ease: 'power2.in' }, w('einsätze') - 0.25);
fadeOut('#n4', w('einsätze') - 0.3, 0.25);

/* S5 three-way split */
vis('#s5', w('einsätze') - 0.2, 20.9);
tl.fromTo('#mp1', { x: -760 }, { x: 0, duration: 0.7 }, w('einsätze') - 0.12); sfx(w('einsätze') - 0.18, 'whoosh', 0.3, -0.6);
tl.fromTo('#mp2', { y: 980 }, { y: 0, duration: 0.7 }, w('termine') - 0.12); sfx(w('termine') - 0.18, 'whoosh', 0.3, 0);
tl.fromTo('#mp3', { x: 760 }, { x: 0, duration: 0.7 }, w('controlling') - 0.12); sfx(w('controlling') - 0.18, 'whoosh', 0.3, 0.6);
$$('#mp2 .ev').forEach((e, i) => pop(e, w('termine') + 0.25 + i * 0.07, 0.35, 0.8));
tl.fromTo('#mp3 .bars i', { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.06 }, w('controlling') + 0.2);
tl.to(['#mp1', '#mp2', '#mp3'], { y: -1150, duration: 0.42, ease: 'power3.in', stagger: 0.04 }, 20.42);

/* S6 feature list + stamp, then the curtain */
vis('#s6', 20.42, 22.5);
tl.fromTo('#fl1', { y: 1180 }, { y: -880, duration: 1.15, ease: 'power3.out' }, 20.45);
tl.fromTo('#fl2', { y: 1500 }, { y: -560, duration: 1.4, ease: 'power3.out' }, 20.45);
tl.fromTo(['#fl1', '#fl2'], { filter: 'blur(7px)' }, { filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 20.6);
sfx(20.45, 'whoosh_big', 0.6);
tl.fromTo('#stamp', { scale: 2.3, opacity: 0, rotation: -14 }, { scale: 1, opacity: 1, rotation: -7, duration: 0.32, ease: 'back.out(2.2)' }, w('drin') - 0.08); sfx(w('drin') + 0.2, 'stamp', 0.6);
tl.to(['#fl1', '#fl2'], { y: '-=60', duration: 1.2, ease: 'none' }, 21.6);
tl.fromTo('#curtain', { yPercent: -101 }, { yPercent: 0, duration: 0.36, ease: 'power3.in' }, w('jetzt') - 0.36); sfx(w('jetzt') - 0.34, 'swish_low', 0.6);

/* night stage from here */
tl.set('#nightwrap', { opacity: 1 }, w('jetzt'));
vis('#s7', w('jetzt'), H_ON() + 0.4);
clipIn('#k-small', w('jetzt') + 0.02, 0.4);
$$('#k-big > span:not(#k-dot)').forEach((s, i) => tl.fromTo(s, { y: 60, scale: 1.25, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }, w('kür') - 0.04 + i * 0.05));
tl.fromTo('#k-dot', { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, w('kür') + 0.1);
sfx(w('kür') - 0.02, 'impact', 0.6);
tl.to(['#k-big > span:not(#k-dot)', '#k-small'], { x: -220, opacity: 0, duration: 0.3, ease: 'power3.in', stagger: 0.025 }, H_ON() - 0.5);
// the dot becomes the assistant's orb
tl.set('#k-dot', { opacity: 0 }, H_ON() - 0.4);
tl.set('#flyorb', { visibility: 'visible' }, H_ON() - 0.4);
tl.fromTo('#flyorb', { x: M.dot.cx - 95, y: M.dot.cy - 95, scale: 92 / 190 * 1.6 }, { x: M.orb.cx - 95, y: M.orb.cy - 95, scale: M.orb.w / 190, duration: 0.6, ease: 'power3.inOut' }, H_ON() - 0.4);
tl.set('#flyorb', { visibility: 'hidden' }, H_ON() + 0.22);
sfx(H_ON() - 0.42, 'whoosh_pop', 0.3);

/* H1 KI-Assistent */
vis('#h1', H_ON() - 0.4, 33.0);
tl.set('#orbbox', { opacity: 0 }, 0); tl.set('#orbbox', { opacity: 1 }, H_ON() + 0.2);
tl.fromTo('#h1-win', { x: 260, opacity: 0, rotationY: 24 }, { x: 0, opacity: 1, rotationY: 12, duration: 0.9 }, H_ON() - 0.12);
ncol('#nh1', H_ON() + 0.12, w('sprechen'));
tl.to('#h1-win', { x: -30, duration: 8, ease: 'none' }, H_ON() + 0.7);
['#lk0', '#lk1', '#lk2'].forEach((k, i) => { tl.fromTo(k, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }, w('sucht') + i * 0.12); sfx(w('sucht') + i * 0.12, 'drop', 0.45, 0.2 + i * 0.2); });
tl.fromTo('#lk3', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }, w('plant')); sfx(w('plant'), 'drop', 0.5, 0.1);
tl.fromTo('#a1', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, w('matcht') + 0.15);
tl.set('#u2', { opacity: 0 }, 0); tl.set('#u2', { opacity: 1 }, w('schreibt') - 0.25);
tl.fromTo('#fg', { y: 50, scale: 0.86, opacity: 0, rotation: -1.5 }, { y: 0, scale: 1, opacity: 1, rotation: -1.5, duration: 0.6, ease: 'back.out(1.4)' }, w('schreibt') - 0.02); sfx(w('schreibt'), 'whoosh_pop', 0.6, 0.3);
tl.set('#cursor', { opacity: 0, x: 1560, y: 1040 }, 0);
tl.set('#cursor', { opacity: 1 }, w('raus') - 0.1);
cursorTo(M.fgja.cx - 6, M.fgja.cy - 6, w('raus') - 0.1, 1.0);
click(w('freigeben') + 0.02);
tl.to('#fg-ja', { scale: 0.93, duration: 0.07, yoyo: true, repeat: 1 }, w('freigeben'));
tl.to('#fg-h2', { opacity: 1, duration: 0.25 }, w('freigeben') + 0.1); sfx(w('freigeben') + 0.7, 'send', 0.45);
tl.to('#cursor', { opacity: 0, duration: 0.25 }, w('freigeben') + 0.5);
// out: the sent message lands in the dashboard's "Gerade eben"
tl.to('#h1-win', { x: -700, opacity: 0, duration: 0.55, ease: 'power3.in' }, 32.55);
fadeOut('#nh1', 32.5, 0.3);
tl.to('#fg', { x: M.fi0.cx - M.fg.cx, y: M.fi0.cy - M.fg.cy, scale: M.fi0.w / M.fg.w, rotation: 0, duration: 0.7, ease: 'power3.inOut' }, 32.62);
tl.to('#fg', { opacity: 0, duration: 0.2 }, 33.22);
sfx(32.78, 'whoosh', 0.3, 0.4);

/* H2 dashboard */
vis('#h2', 32.6, w('passende2') - 0.02);
tl.fromTo('#h2-win', { x: 700, opacity: 0, rotationY: 22 }, { x: 0, opacity: 1, rotationY: 9, duration: 0.9 }, 32.62);
tl.to('#fi0', { opacity: 1, duration: 0.25 }, 33.2);
tl.fromTo('#fi0', { backgroundColor: 'rgba(111,211,161,.35)' }, { backgroundColor: 'rgba(111,211,161,0)', duration: 1.4, ease: 'power1.out' }, 33.25);
ncol('#nh2', w('jede'), w('vorbereitet'));
tl.fromTo('#vc1', { boxShadow: '0 0 0 0px rgba(212,138,20,0)' }, { boxShadow: '0 0 0 4px rgba(212,138,20,.35)', duration: 0.4 }, w('jede'));
tl.to('#xp', { height: xpH, duration: 0.7, ease: 'expo.out' }, w('vorbereitet')); sfx(w('vorbereitet'), 'swish', 0.4);
tl.set(['#xl1', '#xk', '#xl2', '#chip82', '#chip74', '#xl3', '#draft'], { opacity: 0 }, 0);
tl.to('#xl1', { opacity: 1, duration: 0.3 }, w('kurzbewertung') - 0.1);
tl.fromTo('#xk', { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 }, w('kurzbewertung'));
tl.to('#xl2', { opacity: 1, duration: 0.3 }, w('passende') - 0.1);
pop('#chip82', w('passende') + 0.05, 0.45, 0.7); pop('#chip74', w('stellen') + 0.02, 0.45, 0.7); sfx(w('passende') + 0.05, 'pop', 0.6); sfx(w('stellen') + 0.02, 'pop', 0.45);
tl.to(['#xl3', '#draft'], { opacity: 1, duration: 0.3 }, w('antwortentwurf') - 0.1);
tl.set('#cursor', { x: M.send.cx + 220, y: M.send.cy + 170 }, w('antwortentwurf'));
tl.to('#cursor', { opacity: 1, duration: 0.2 }, w('antwortentwurf') + 0.3);
cursorTo(M.send.cx - 4, M.send.cy - 4, w('antwortentwurf') + 0.3, 0.75);
click(w('klick') + 0.02);
tl.to('#send', { scale: 0.92, duration: 0.07, yoyo: true, repeat: 1 }, w('klick'));
tl.to('#pill1', { opacity: 0, duration: 0.15 }, w('raus2') - 0.05); tl.to('#pill2', { opacity: 1, duration: 0.25 }, w('raus2') - 0.05);
tl.fromTo('#toast', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' }, w('raus2')); sfx(w('raus2') + 0.05, 'pop', 0.35);
tl.to('#cursor', { opacity: 0, duration: 0.2 }, w('raus2') + 0.2);
// zoom through the 82 % chip
const zx = M.chip82.cx, zy = M.chip82.cy + xpH * 0;
tl.to('#h2-cam', { scale: 10, transformOrigin: `${zx}px ${zy}px`, duration: 0.55, ease: 'power3.in' }, w('passende2') - 0.5);
fadeOut(['#nh2', '#toast'], w('passende2') - 0.55, 0.2);
tl.to('#zoomflash', { opacity: 1, duration: 0.18, ease: 'power1.in' }, w('passende2') - 0.2);
sfx(w('passende2') - 0.45, 'whoosh', 0.3);

/* H3 matching */
vis('#h3', w('passende2') - 0.02, 46.4);
tl.to('#zoomflash', { opacity: 0, duration: 0.4, ease: 'power1.out' }, w('passende2'));
tl.fromTo('#h3-win', { scale: 1.35, opacity: 0, rotationY: 7 }, { scale: 1, opacity: 1, rotationY: 7, duration: 0.8 }, w('passende2') - 0.05);
ncol('#nh3', w('passende2') + 0.1, w('fahrzeit') - 0.1);
MROWS.forEach((_, k) => tl.fromTo('#mr' + k, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55 }, w('passende2') + 0.15 + k * 0.08));
tl.set('#h3 .bar u', { scaleX: 0, transformOrigin: 'left' }, 0);
tl.to('#h3 .bar u', { scaleX: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, w('trefferquote')); sfx(w('trefferquote'), 'rise', 0.25);
tl.set('#h3 .fzv', { opacity: 0 }, 0);
$$('#h3 .fz').forEach((f, k) => tl.to(f.querySelectorAll('.fzv'), { opacity: 1, duration: 0.3 }, w('fahrzeit') + k * 0.07));
tl.fromTo('#map', { y: 80, opacity: 0, rotation: -2 }, { y: 0, opacity: 1, rotation: -2, duration: 0.8 }, w('matching') - 0.05); sfx(w('matching'), 'whoosh_pop', 0.45, -0.5);
$$('#mapsvg .cdot').forEach((d, k) => pop(d, w('matching') + 0.3 + k * 0.07, 0.35, 0.2));
$$('#mapsvg .route').forEach((p, k) => tl.to(p, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, w('fahrzeit') + k * 0.06));
// push to the tablet
tl.to('#h3-move', { x: -1500, duration: 0.6, ease: 'power3.inOut' }, w('vorstellungsgespräch') - 0.32);
sfx(w('vorstellungsgespräch') - 0.32, 'whoosh', 0.35, -0.3);
fadeOut('#nh3', w('vorstellungsgespräch') - 0.4, 0.22);

/* H4 tablet */
vis('#h4', w('vorstellungsgespräch') - 0.35, 54.6);
tl.fromTo('#tab', { x: 1300, rotation: 4 }, { x: 0, rotation: 0, duration: 0.6, ease: 'power3.inOut' }, w('vorstellungsgespräch') - 0.32);
tl.to('#tab', { rotation: -1.2, y: -6, duration: 7, ease: 'none' }, w('vorstellungsgespräch') + 0.4);
ncol('#nh4', w('vorstellungsgespräch') + 0.3, w('protokoll'));
const VS = ['#vs1', '#vs2', '#vs3', '#vs4'], VT = [0, w('unterschrift') - 0.08, w('aufnahme') - 0.08, w('protokoll') - 0.08];
VS.forEach((v, i) => {
  if (i === 0) { tl.set(v, { opacity: 1 }, 0); return; }
  tl.fromTo(v, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45 }, VT[i]);
  tl.to(VS[i - 1], { x: -80, opacity: 0, duration: 0.3, ease: 'power2.in' }, VT[i] - 0.05);
  sfx(VT[i], 'swish', 0.35, 0.4);
});
$$('#vs1 .q').forEach((q, i) => tl.fromTo(q, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, w('tablet') + i * 0.12));
$$('#vs1 .opt span.will').forEach((s, i) => { tl.set(s, { borderColor: '#229b63', backgroundColor: '#e7f6ee', color: '#18704a' }, w('fragebogen') + 0.05 + i * 0.14); sfx(w('fragebogen') + 0.05 + i * 0.14, 'tick', 0.6); });
const sp = $('#sigpath'), sl = sp.getTotalLength(); sp.style.strokeDasharray = sl; sp.style.strokeDashoffset = sl;
tl.to('#sigpath', { strokeDashoffset: 0, duration: 0.75, ease: 'power1.inOut' }, w('unterschrift') + 0.05); sfx(w('unterschrift') + 0.05, 'scratch', 0.55);
$$('#vs4 .proto div').forEach((d, i) => { tl.fromTo(d, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45 }, w('protokoll') + 0.15 + i * 0.2); sfx(w('protokoll') + 0.15 + i * 0.2, 'type', 0.22); });
tl.fromTo('#h4-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, w('ki') - 0.05);
tl.set(['#h4-ok', '.h4v'], { opacity: 0 }, 0);
[0, 1, 2, 3].forEach(i => {
  const a = M.pr[i], b = M.h4v[i], t = w('direkt') + i * 0.12;
  tl.fromTo('#fly' + i, { x: a.x + 64, y: a.y + 4, opacity: 0, scale: 1 }, { opacity: 1, duration: 0.1 }, t);
  tl.to('#fly' + i, { x: b.x - 6, y: b.y - 10, scale: 0.92, duration: 0.6, ease: 'power3.inOut' }, t + 0.05);
  tl.to('#fly' + i, { opacity: 0, duration: 0.12 }, t + 0.66);
  tl.to('#h4v' + i, { opacity: 1, duration: 0.15 }, t + 0.62);
  $('#h4v' + i).textContent = $('#fly' + i).textContent;
  sfx(t + 0.05, 'swish', 0.15, -0.4);
});
tl.fromTo('#h4-ok', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, w('direkt') + 1.1); sfx(w('direkt') + 1.1, 'ping', 0.25);
// out: the card collapses to a line that becomes the top edge of the call list
const lineT = w('vertrieb') - 0.5;
tl.to('#h4-card', { scaleY: 0.012, duration: 0.24, ease: 'power3.in' }, lineT);
tl.set('#h4-card', { opacity: 0 }, lineT + 0.24);
tl.fromTo('#morphline', { x: M.card4.x, y: M.card4.cy, width: M.card4.w, opacity: 1 }, { x: M.tl.x, y: M.tl.y, width: M.tl.w, duration: 0.42, ease: 'power3.inOut', immediateRender: false }, lineT + 0.24);
tl.to('#morphline', { opacity: 0, duration: 0.2 }, lineT + 0.85);
tl.to('#tab', { x: 1350, duration: 0.45, ease: 'power3.in' }, lineT);
fadeOut('#nh4', lineT, 0.25);
sfx(lineT, 'snap', 0.35); sfx(lineT + 0.24, 'whoosh', 0.28, 0.3);

/* H5 sales */
vis('#h5', lineT + 0.2, 61.0);
tl.fromTo('#h5-tl', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' }, lineT + 0.62);
ncol('#nh5', w('vertrieb') + 0.1, w('knopfdruck'));
[0, 1, 2].forEach(i => { pop('#kc' + i, w('telefonlisten') + 0.1 + i * 0.14, 0.4, 0.6); sfx(w('telefonlisten') + 0.1 + i * 0.14, 'pop', 0.45, 0.3); });
tl.set('#h5 .trow:not(.hd)', { opacity: 0 }, 0);
$$('#h5 .trow:not(.hd)').forEach((r, i) => { tl.fromTo(r, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, w('telefonlisten') + 0.5 + i * 0.07); sfx(w('telefonlisten') + 0.5 + i * 0.07, 'tick', 0.3, 0.2); });
tl.to('#h5 .nx', { scale: 0.93, duration: 0.08, yoyo: true, repeat: 1 }, w('knopfdruck'));
sfx(w('knopfdruck'), 'click', 0.7);
tl.fromTo('#tr0', { backgroundColor: 'rgba(59,91,219,0)' }, { backgroundColor: 'rgba(59,91,219,.08)', duration: 0.3 }, w('knopfdruck') + 0.05);
tl.fromTo('#tprog', { width: '0%' }, { width: '5%', duration: 0.6 }, w('knopfdruck') + 0.5);
tl.set('#h5-ml', { opacity: 0 }, 0);
tl.fromTo('#h5-ml', { x: 1300, opacity: 1 }, { x: 0, opacity: 1, duration: 0.6, immediateRender: false }, w('mailings') - 0.18);
tl.to('#h5-tl', { x: -60, scale: 0.94, opacity: 0, duration: 0.6 }, w('mailings') - 0.18);
sfx(w('mailings') - 0.16, 'whoosh', 0.55, 0.5);
const slots = [0, 0, 0, 0];
REPLIES.forEach(([l], i) => {
  const L = M.lanes[l], k = slots[l]++, t = w('antworten') - 0.1 + i * 0.1;
  const tx = L.x - M.ml.x + 10, ty = L.y - M.ml.y + 44 + k * 84;
  tl.fromTo('#rc' + i, { x: M.ml.w / 2 - 280 + (i % 3) * 60, y: -140, opacity: 0, rotation: (i % 2 ? 4 : -4) }, { x: tx, y: ty, opacity: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.2)' }, t);
  $('#rc' + i).style.width = (L.w - 20) + 'px'; $('#rc' + i).style.left = '0px';
  sfx(t + 0.2, 'tick', 0.35, -0.5 + l * 0.33);
});
tl.to('#all', { scale: 1.06, duration: 0.22, yoyo: true, repeat: 3, ease: 'power1.inOut' }, w('sortieren')); sfx(w('sortieren') + 0.45, 'ping', 0.35);
// out: lanes fold together, back to paper
$$('#h5 .lane').forEach((l, i) => tl.to(l, { scaleX: 0, transformOrigin: i < 2 ? 'right' : 'left', duration: 0.32, ease: 'power3.in' }, 60.46 + Math.abs(i - 1.5) * 0.05));
tl.to('#h5 .rc', { opacity: 0, duration: 0.2 }, 60.42);
fadeOut(['#h5-ml', '#h5-tl', '#nh5'], 60.62, 0.25);
sfx(60.46, 'snap', 0.6);
tl.to('#nightwrap', { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 60.62);

/* end card */
vis('#end', 60.75);
pop('#e-logo', 60.85, 0.6, 0.7); sfx(60.85, 'thunk', 0.5);
clipIn('#e-label', 60.95, 0.5);
const hw = $$('#e-head .m > span');
[w('ihr'), w('eigenes'), w('ats2')].forEach((t, i) => rise(hw[i], t - 0.06, 0.65));
const sw = $$('#e-sub .m > span');
[w('angepasst'), w('an'), w('ihren'), w('betrieb')].forEach((t, i) => rise(sw[i], t - 0.06, 0.6));
$$('#e-recap .pchip').forEach((c, i) => { tl.fromTo(c, { x: 260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 61.25 + i * 0.11); tl.to(c, { x: -26 - i * 6, duration: 7, ease: 'none' }, 62.05 + i * 0.11); });
sfx(61.25, 'swish', 0.35, 0.5);
if (CTA) {
  tl.fromTo('#e-cta', { y: 30, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, w('jetzt2') - 0.05); sfx(w('jetzt2') - 0.03, 'pop', 0.7);
  tl.to('#e-cta', { scale: 1.04, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 67.4);
} else {
  tl.fromTo('#e-url', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, w('betrieb') + 0.4);
}
tl.set({}, {}, DUR);
return tl;
}
function H_ON() { return AT.h_on; }

/* ---------- per-frame procedural layers ---------- */
const CHAP = [[0, ''], [3.97, '<b>Pflichtprogramm</b> · 01 / 06'], [9.95, '<b>Pflichtprogramm</b> · 02 / 06'], [12.44, '<b>Pflichtprogramm</b> · 03 / 06'],
  [W.whatsapp, '<b>Pflichtprogramm</b> · 04 / 06'], [W['einsätze'] - 0.2, '<b>Pflichtprogramm</b> · 05 / 06'], [20.42, '<b>Pflichtprogramm</b> · 06 / 06'], [W.jetzt, '<b>Kür</b>'],
  [AT.h_on - 0.3, '<b>Kür</b> · Highlight 01 / 05'], [32.6, '<b>Kür</b> · Highlight 02 / 05'], [W.passende2 - 0.02, '<b>Kür</b> · Highlight 03 / 05'],
  [W['vorstellungsgespräch'] - 0.35, '<b>Kür</b> · Highlight 04 / 05'], [W.vertrieb - 0.3, '<b>Kür</b> · Highlight 05 / 05'], [60.75, CTA ? '<b>Kostenloses Erstgespräch</b>' : '<b>Betrieb Zukunft</b>']];
const chapEl = $('#chap span'); let chapCur = -1;
const capEl = $('#cap'); let capCur = -2;
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
  const p = CAP[idx], e = ease3((t - (p.start - 0.1)) / 0.15);
  capEl.style.opacity = e; capEl.style.transform = `translateY(${(1 - e) * 12}px)`;
  [...capEl.children].forEach((s, i) => { const x = p.words[i]; s.className = t >= x.e + 0.04 ? 'on' : (t >= x.s - 0.02 ? 'now' : ''); });
}
const typeText = (sel, text, t0, t1, t) => { const n = Math.round(text.length * clamp((t - t0) / (t1 - t0))); $(sel).textContent = text.slice(0, n); };
const ORBS = ['#orb1', '#orb2'].map(s => ({ rg: $$(s + ' .rg'), glow: $(s + ' .glow'), core: $(s + ' .core') }));
const PHASE = [['Ich höre zu', '#6fd3a1'], ['Einen Moment', '#b59cf7'], ['Ich spreche', '#f2c06b']];
function drawOrb(o, t, col, amp) {
  o.rg.forEach((p, k) => {
    const r0 = 30 + k * 12, a = (2.2 + k * 1.3) * (0.55 + amp * 1.3), n = 5 + (k % 3), ph = k * 1.1 + t * (0.9 + k * 0.25);
    let d = '';
    for (let i = 0; i <= 96; i++) { const th = i / 96 * Math.PI * 2, r = r0 * (1 + amp * 0.06) + a * Math.sin(n * th + ph) + a * 0.5 * Math.sin((n + 2) * th - ph);
      d += (i ? 'L' : 'M') + (95 + r * Math.cos(th)).toFixed(1) + ' ' + (95 + r * Math.sin(th)).toFixed(1); }
    p.setAttribute('d', d + 'Z'); p.setAttribute('stroke', col);
  });
  o.core.setAttribute('r', (20 + amp * 5).toFixed(1));
  o.glow.style.opacity = (0.6 + amp * 0.4).toFixed(2);
}
const waveU = $$('#wavebox u');
const nums = (sel, t0, d, t) => $$(sel).forEach((e, i) => { const p = +e.dataset.p; e.textContent = Math.round(p * ease3((t - t0 - i * 0.08) / d)) + ' %'; });
function proc(t) {
  const f = Math.round(t * 30);
  $('#grain1').style.transform = `translate(${Math.round((rnd(f) - 0.5) * 100)}px,${Math.round((rnd(f + 7) - 0.5) * 100)}px)`;
  $('#grain2').style.transform = `translate(${Math.round((rnd(f + 3) - 0.5) * 100)}px,${Math.round((rnd(f + 11) - 0.5) * 100)}px)`;
  $('#gridwrap').style.transform = `translate(${(Math.sin(t * 0.42) * 5).toFixed(2)}px,${(Math.cos(t * 0.31) * 4).toFixed(2)}px)`;
  $('#stage').classList.toggle('night', t >= W.jetzt && t < 60.85);
  let ci = 0; for (let i = 0; i < CHAP.length; i++) if (t >= CHAP[i][0]) ci = i;
  if (ci !== chapCur) { chapCur = ci; chapEl.innerHTML = CHAP[ci][1]; $('#chap').style.opacity = CHAP[ci][1] ? 1 : 0; }
  // 01: counter of new applications
  const arrived = [6.0, 6.22, 6.44, 6.66, 6.88, W.indeed + 0.12, W.arbeitsagentur + 0.3].filter(x => t >= x + 0.4).length;
  $('#s1-neu').textContent = 7 + arrived - (t >= W.indeed + 0.52 ? 0 : 0);
  $('#s1-total').textContent = (43 + arrived) + ' Bewerbungen';
  // 05: KPIs
  $('#kp1').textContent = Math.round(214 * ease3((t - W.controlling - 0.15) / 0.9));
  $('#kp2').textContent = Math.round(17 * ease3((t - W.controlling - 0.25) / 0.9));
  // H1: typing, phase, orb, counts
  typeText('#u1', 'Such mir Staplerfahrer mit Schein in Harburg.', AT.h_on + 0.75, W.sprechen + 0.4, t);
  $('#u1').style.opacity = t >= AT.h_on + 0.7 ? 1 : 0;
  typeText('#u2', '„Lad ihn zum VG am Donnerstag ein.“', W.schreibt - 0.2, W.nachrichten + 0.5, t);
  const ph = t < W.sucht - 0.05 ? 0 : t < W.schreibt - 0.1 ? 1 : t < W.raus ? 2 : 0;
  const phEl = $('#phase'); phEl.textContent = PHASE[ph][0]; phEl.style.color = PHASE[ph][1];
  const amp = ph === 1 ? 0.25 + 0.15 * Math.sin(t * 7) : envAt(t);
  drawOrb(ORBS[0], t, PHASE[ph][1], amp); drawOrb(ORBS[1], t, '#6fd3a1', 0.3);
  $('#bcount').textContent = [W.sucht, W.sucht + 0.12, W.sucht + 0.24, W.plant].filter(x => t >= x).length + ' Karten';
  nums('#h1 .pct', W.matcht, 0.6, t);
  typeText('#fg-txt', 'Hallo Jonas, danke für deine Bewerbung als Staplerfahrer! Passt dir Donnerstag, 10:30 Uhr, für ein kurzes Kennenlernen in unserer Niederlassung Harburg? Viele Grüße, Sarah', W.schreibt + 0.1, W.raus - 0.1, t);
  // H2: draft
  typeText('#draft', DRAFT, W.antwortentwurf, W.antwortentwurf + 0.9, t);
  // H3: percentages
  nums('#h3 .pp', W.trefferquote, 0.8, t);
  // H4: recording waveform + timer
  if (t > W.aufnahme - 0.3 && t < W.protokoll + 0.3) {
    waveU.forEach((u, i) => { const e = envAt(t - (63 - i) * 0.018); u.style.height = (6 + e * 88 * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7 + t * 9)))).toFixed(1) + '%'; });
    const s = 252 + Math.floor((t - W.aufnahme) * 4); $('#rectime').textContent = `0${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  // H5: progress + lanes
  $('#tcount').textContent = (t >= W.knopfdruck + 0.8 ? 1 : 0) + ' von 20';
  const lc = [0, 0, 0, 0]; let tot = 0;
  REPLIES.forEach(([l], i) => { if (t >= W.antworten - 0.1 + i * 0.1 + 0.45) { lc[l]++; tot++; } });
  lc.forEach((v, i) => { $('#lc' + i).textContent = v; }); $('#mc').textContent = tot;
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
