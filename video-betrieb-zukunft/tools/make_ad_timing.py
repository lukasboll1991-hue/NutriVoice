"""Timing for the YouTube ad cuts (A 30 s, B 15 s, C 6 s).

One voice take (ElevenLabs, Theo) is cut into segments at mid-silences, sped up
by TEMPO and placed per spot so cuts and hits land on the 118 BPM grid.
Writes ad_timing.json and src/ad_timing.js.
"""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
SPB = 60 / 118
TEMPO = 1.05
def beat(n): return round(n * SPB, 3)
WORDS = json.load(open(ROOT / 'assets/audio_ads/theo_take1_words.json'))
VO_FILE = 'assets/audio_ads/theo_take1.mp3'
SEG = {  # src ranges (s) in the take, cut at mid-silence
    'A1': (0.00, 5.79), 'A2': (5.79, 9.28), 'A3': (9.28, 17.30), 'A4': (17.30, 24.31), 'A5': (24.31, 28.82),
    'B1': (29.20, 33.14), 'B2': (33.14, 39.66), 'C1': (39.66, 43.28),
}
def at(seg, word_src, video_t):  # place segment so that src time word_src lands at video_t
    a, _ = SEG[seg]; return round(video_t - (word_src - a) / TEMPO, 3)

SPOTS = {
  'a': {'dur': 30.0, 'segs': [('A1', 0.05), ('A2', at('A2', 6.04, 5.75)), ('A3', at('A3', 9.56, 9.25)),
                              ('A4', at('A4', 23.46, beat(45))), ('A5', at('A5', 24.66, 24.55))],
        'phrases': [('hook', 'Personaldienstleister?'), ('', 'Sie zahlen jeden Monat Tausende für Software, die Ihnen nicht gehört.'),
                    ('', 'Betrieb Zukunft zeigt Ihnen, wie Sie Ihre eigene bauen.'),
                    ('', 'Bewerbermanagement, WhatsApp-Bot, Stundenzettel,'), ('', 'digitale Einstellung, KI-Agenten –'),
                    ('', 'zugeschnitten auf Ihren Betrieb.'), ('', 'Bei einem Personaldienstleister in Hamburg:'),
                    ('', 'statt rund 4.000 Euro im Monat –'), ('', 'selbst gebaut unter 500.'),
                    ('end', 'Betrieb Zukunft.'), ('end', 'Jetzt kostenloses Erstgespräch buchen.')]},
  'b': {'dur': 15.0, 'segs': [('B1', 0.0), ('B2', at('B2', 33.44, 3.75)), ('A5', at('A5', 24.66, 10.15))],
        'phrases': [('hook', 'Personaldienstleister?'), ('', 'Schluss mit teurer Software, die Ihnen nicht gehört.'),
                    ('', 'Bewerbermanagement, WhatsApp-Bot, Stundenzettel –'), ('', 'selbst gebaut, zugeschnitten auf Ihren Betrieb.'),
                    ('end', 'Betrieb Zukunft.'), ('end', 'Jetzt kostenloses Erstgespräch buchen.')]},
  'c': {'dur': 6.0, 'segs': [('C1', 0.05)],
        'phrases': [('end', 'Software, die Ihnen gehört.'), ('end', 'Betrieb Zukunft.')]},
}
norm = lambda s: re.sub(r'[^0-9a-zäöüß]', '', s.lower())
out = {'tempo': TEMPO, 'spb': SPB, 'vo_file': VO_FILE, 'spots': {}}
for key, sp in SPOTS.items():
    words = []
    for seg, v in sp['segs']:
        a, b = SEG[seg]
        for s, e, w in WORDS:
            if a <= s < b: words.append((round(v + (s - a) / TEMPO, 3), round(v + (e - a) / TEMPO, 3), w))
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
    W = {}
    for c in caps:
        for t in c['words']:
            k = norm(t['w'])
            W.setdefault(k, t['s'])  # first occurrence
    out['spots'][key] = {'dur': sp['dur'], 'segs': [[seg, SEG[seg][0], SEG[seg][1], v] for seg, v in sp['segs']], 'captions': caps, 'w': W}
    print(key, ' '.join(f"{w[2]}@{w[0]:.2f}" for w in words))
json.dump(out, open(ROOT / 'ad_timing.json', 'w'), ensure_ascii=False, indent=1)
(ROOT / 'src/ad_timing.js').write_text('window.AD = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print({k: [round(beat(n), 2) for n in []] for k in 'a'})
