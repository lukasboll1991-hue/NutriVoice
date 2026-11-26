"""Timing for the ATS feature spot (main 69.5 s, sales-meeting 66.5 s, short cut 30 s).

Voice: ElevenLabs take A (Theo), with the spoken "I-A-T-S" already cut out
(assets/audio_iats/theo_ats_A.wav). The take is cut into four segments at
mid-silences and placed so that "Kür" lands on the drop (beat 45), the first
highlight word one bar later, and the end card on beat 120 of the 118 BPM grid.
Writes ats_timing.json and src/ats_timing.js (window.AT): per spot the segment
placement, captions with word times, a word lookup and the voice envelope.
"""
import json, re, pathlib, subprocess
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parents[1]
SPB = 60 / 118
def beat(n): return round(n * SPB, 3)
VO_FILE = 'assets/audio_iats/theo_ats_A.wav'
WORDS = json.load(open(ROOT / 'assets/audio_iats/ats_A_words.json'))
SEG = {  # source ranges (s) in the take, cut at mid-silence
    'P': (0.00, 21.42),   # hook + Pflichtprogramm
    'K': (21.42, 22.59),  # "Jetzt die Kür."
    'H': (22.59, 59.34),  # five highlights
    'E1': (59.34, 63.05), # "Ihr eigenes ATS – angepasst an Ihren Betrieb."
    'E2': (63.05, 65.81), # "Jetzt kostenloses Erstgespräch vereinbaren."
    # short cut (30 s): hook + Pflicht + portals, "Alles drin. Jetzt die Kür.", KI-Assistent, end
    'P1': (0.00, 9.79),
    'AK': (20.38, 22.59),
    'H1': (22.59, 31.77),
}
def src_of(word, n=1):
    k = 0
    for x in WORDS:
        if norm(x['w']) == word:
            k += 1
            if k == n: return x['s']
    raise KeyError(word)
norm = lambda s: re.sub(r'[^0-9a-zäöüß]', '', s.lower())
def at(seg, word_src, video_t):  # place a segment so that a source time lands at video_t
    return round(video_t - (word_src - SEG[seg][0]), 3)

KUER = beat(45)                     # drop on "Kür"
H_ON = beat(47)                     # "Ein KI-Assistent" one bar later
END_ON = beat(120)                  # "Ihr eigenes ATS"
PL = {'P': 0.05, 'K': at('K', src_of('kür'), KUER), 'H': at('H', 22.76, H_ON)}
PL['E1'] = at('E1', 59.60, END_ON)
PL['E2'] = round(PL['E1'] + SEG['E2'][0] - SEG['E1'][0], 3)  # contiguous with E1

PH_MAIN = [
    ('hook', 'Das ATS aus dem Alltag eines Personaldienstleisters:'),
    ('', 'Erst das Pflichtprogramm.'),
    ('', 'Bewerbungen aus allen Portalen –'), ('', 'von Indeed bis zur Arbeitsagentur.'),
    ('', 'Lebenslauf rein, Profil fertig.'),
    ('', 'Kandidaten, Kunden und Vakanzen auf einen Blick.'),
    ('', 'WhatsApp und E-Mail in einem Verlauf.'),
    ('', 'Einsätze, Termine, Controlling.'),
    ('', 'Alles drin.'),
    ('kuer', 'Jetzt die Kür.'),
    ('', 'Ein KI-Assistent, mit dem Sie einfach sprechen.'),
    ('', 'Er sucht, matcht, plant Termine und schreibt Nachrichten.'),
    ('', 'Raus geht erst, was Sie freigeben.'),
    ('', 'Jede neue Bewerbung liegt fertig vorbereitet da:'),
    ('', 'Kurzbewertung, passende Stellen, Antwortentwurf.'),
    ('', 'Ein Klick – raus.'),
    ('', 'Passende Kandidaten findet das Matching selbst.'),
    ('', 'Mit Trefferquote und Fahrzeit.'),
    ('', 'Das Vorstellungsgespräch läuft am Tablet:'),
    ('', 'Fragebogen, Unterschrift, Aufnahme.'),
    ('', 'Das Protokoll schreibt die KI – direkt ins Profil.'),
    ('', 'Und für den Vertrieb: Telefonlisten auf Knopfdruck.'),
    ('', 'Und Mailings, deren Antworten sich selbst sortieren.'),
    ('end', 'Ihr eigenes ATS – angepasst an Ihren Betrieb.'),
]
CTA = ('end', 'Jetzt kostenloses Erstgespräch vereinbaren.')
E1_30 = at('E1', 59.60, beat(45))
SPOTS = {
    # advert: with the call to action
    'main': {'dur': 69.5, 'segs': [(k, PL[k]) for k in ['P', 'K', 'H', 'E1', 'E2']], 'phrases': PH_MAIN + [CTA]},
    # sales meeting: same film, no call to action
    'pitch': {'dur': 66.5, 'segs': [(k, PL[k]) for k in ['P', 'K', 'H', 'E1']], 'phrases': PH_MAIN},
    # YouTube short cut: "Kür" on beat 23, "Ein KI-Assistent" on 25, "Ihr eigenes ATS" on 45
    'cut30': {'dur': 30.0, 'segs': [('P1', 0.05), ('AK', at('AK', src_of('kür'), beat(23))), ('H1', at('H1', 22.76, beat(25))),
                                    ('E1', E1_30), ('E2', round(E1_30 + SEG['E2'][0] - SEG['E1'][0], 3))],
              'phrases': PH_MAIN[:4] + [PH_MAIN[8], PH_MAIN[9], PH_MAIN[10], PH_MAIN[11], PH_MAIN[12], PH_MAIN[-1], CTA]},
}

# voice envelope at 30 fps (for the listening orb and the recording waveform)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ROOT / VO_FILE), '-ac', '1', '-ar', '24000', '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
VO = np.frombuffer(raw, dtype=np.float32)

out = {'spb': SPB, 'vo_file': VO_FILE, 'kuer': KUER, 'h_on': H_ON, 'end_on': END_ON, 'spots': {}}
for key, sp in SPOTS.items():
    words = []
    for seg, v in sp['segs']:
        a, b = SEG[seg]
        for x in WORDS:
            if a <= x['s'] < b: words.append((round(v + x['s'] - a, 3), round(v + x['e'] - a, 3), x['w']))
    chars = []
    for s, e, w in words:
        n = norm(w)
        for i, c in enumerate(n): chars.append((c, s + (e - s) * i / len(n), s + (e - s) * (i + 1) / len(n)))
    ci, caps = 0, []
    for tag, text in sp['phrases']:
        toks = []
        for tok in text.split(' '):
            n = norm(tok)
            if not n: toks.append({'w': tok, 's': None, 'e': None}); continue
            assert ''.join(c for c, _, _ in chars[ci:ci + len(n)]) == n, (key, tok, ci)
            toks.append({'w': tok, 's': round(chars[ci][1], 3), 'e': round(chars[ci + len(n) - 1][2], 3)}); ci += len(n)
        for i, t in enumerate(toks):
            if t['s'] is None: t['s'] = t['e'] = toks[i - 1]['e']
        caps.append({'tag': tag, 'start': toks[0]['s'], 'end': toks[-1]['e'], 'words': toks})
    assert ci == len(chars), (key, ci, len(chars))
    W, cnt = {}, {}
    for c in caps:
        for t in c['words']:
            k = norm(t['w'])
            if not k: continue
            cnt[k] = cnt.get(k, 0) + 1
            W[k if cnt[k] == 1 else f'{k}{cnt[k]}'] = t['s']
    # envelope of the placed voice, 30 fps, 0..1
    nf = int(sp['dur'] * 30) + 1
    env = np.zeros(nf)
    for seg, v in sp['segs']:
        a, b = SEG[seg]
        for f in range(nf):
            t = f / 30
            if v <= t < v + (b - a):
                i = int((a + t - v) * 24000); blk = VO[max(0, i - 400):i + 400]
                if len(blk): env[f] = max(env[f], float(np.sqrt(np.mean(blk ** 2))))
    env = np.clip(env / (np.percentile(env[env > 0], 95) if (env > 0).any() else 1), 0, 1)
    out['spots'][key] = {'dur': sp['dur'], 'segs': [[seg, SEG[seg][0], SEG[seg][1], v] for seg, v in sp['segs']],
                         'captions': caps, 'w': W, 'env': [round(x, 3) for x in env]}
    print(key, 'last word', words[-1], 'dur', sp['dur'])
print('Kür', KUER, 'H', H_ON, 'End', END_ON, {k: round(v, 3) for k, v in PL.items()})
json.dump(out, open(ROOT / 'ats_timing.json', 'w'), ensure_ascii=False, indent=1)
(ROOT / 'src/ats_timing.js').write_text('window.AT = ' + json.dumps(out, ensure_ascii=False) + ';\n')
