"""Build the single timing source (timing.json + src/timing.js) for picture and sound.

VO blocks are cut from the voice file at mid-silences and placed on the video
timeline with their own offsets, so every scene change can sit on a beat.
Caption words are aligned to the whisper word timings character by character.
"""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
BPM = 118
SPB = 60 / BPM
def beat(n): return round(n * SPB, 3)

words = json.load(open(ROOT / 'assets/audio/vo_words.json'))

# (src_start, src_end, video_start_of_src_start) – cuts at mid-silence
BLOCKS = [
    (0.00, 7.95, 0.90),    # S1 + S2
    (7.95, 10.44, 9.25),   # S3a ATS        (src 8.30 -> 9.60)
    (10.44, 17.15, 12.24), # S3b + S3c      (src 10.68 -> 12.48)
    (17.15, 23.95, 19.38), # S3d + S3e      (src 17.58 -> 19.81)
    (23.95, 35.64, 27.06), # S4             (src 34.52 '500' -> 37.63 = beat 74)
    (35.64, 46.25, 39.58), # S5             (src 35.86 -> 39.80)
    (46.25, 50.23, 50.78), # S6             (src 46.42 -> 50.95)
]
def src2vid(t):
    for a, b, v in BLOCKS:
        if a - 1e-6 <= t <= b + 1e-6:
            return round(v + (t - a), 3)
    raise ValueError(t)

# caption phrases as written in the script (scene id, text)
PHRASES = [
    (1, "Jeden Monat Lizenzgebühren –"),
    (1, "für Software, die nicht zu Ihrem Betrieb passt."),
    (2, "Was, wenn Ihre Software einfach Ihnen gehört?"),
    (3, "Bewerbermanagement nach Ihren Regeln."),
    (3, "Ein WhatsApp-Bot, der Bewerber rund um die Uhr vorqualifiziert."),
    (3, "Stundennachweise, die sich selbst prüfen."),
    (3, "Vorstellungsgespräch und Einstellung – komplett digital."),
    (3, "Und KI-Agenten, die Ihnen den Alltag abnehmen."),
    (4, "Aufgebaut bei einem Personaldienstleister in Hamburg –"),
    (4, "ohne Programmierausbildung."),
    (4, "Externe Software: rund 4.000 Euro im Monat."),
    (4, "Selbst gebaut: unter 500 Euro."),
    (5, "Sie entscheiden, wie weit Sie gehen:"),
    (5, "Selbst bauen – mit Anleitung."),
    (5, "Auf fertigen Grundgerüsten aufbauen."),
    (5, "Oder alles maßgeschneidert aus einer Hand."),
    (6, "Betrieb Zukunft."),
    (6, "Einfacher und günstiger, als Sie denken."),
]
norm = lambda s: re.sub(r'[^0-9a-zäöüß]', '', s.lower())

# per-character timeline from whisper words
chars = []
for s, e, w in words:
    n = norm(w)
    for i, c in enumerate(n):
        chars.append((c, s + (e - s) * i / max(1, len(n)), s + (e - s) * (i + 1) / max(1, len(n))))
ci = 0
captions = []
for scene, text in PHRASES:
    toks = text.split(' ')
    out = []
    for tok in toks:
        n = norm(tok)
        if not n:  # dash etc.
            out.append({'w': tok, 's': None, 'e': None}); continue
        assert ''.join(c for c, _, _ in chars[ci:ci + len(n)]) == n, (tok, ci)
        s = chars[ci][1]; e = chars[ci + len(n) - 1][2]; ci += len(n)
        out.append({'w': tok, 's': src2vid(s), 'e': src2vid(e)})
    for i, t in enumerate(out):  # glue dashes to neighbours
        if t['s'] is None:
            t['s'] = out[i - 1]['e']; t['e'] = t['s']
    captions.append({'scene': scene, 'start': out[0]['s'], 'end': out[-1]['e'], 'words': out})
assert ci == len(chars)

def word_t(phrase_idx, word):
    for t in captions[phrase_idx]['words']:
        if t['w'].strip('.,:?–').startswith(word): return t['s']
    raise KeyError(word)

CUES = {
    'bpm': BPM, 'spb': SPB, 'dur': 60.0, 'fps': 30,
    's1': 0.0,
    'cut12': beat(11),          # hard cut after "passt."
    'mask23': beat(17),         # grid cell opens on "gehört"
    's3a': beat(18),
    's3b': beat(24),            # wipe
    's3c': beat(32),            # hard cut
    's3d': beat(38),            # match cut (card)
    's3e': beat(45),            # mask
    'pull34': beat(51),         # collapse to chips
    's4': beat(53),
    'hit500': beat(74),
    'wipe45': beat(77),
    's5': beat(78),
    'fold56': beat(99),
    's6': beat(100),
    'pills': [beat(108), beat(109), beat(110)],
    'cta': beat(111),
    'end': 60.0,
}
# word-anchored cues
CUES['w'] = {
    'jeden': word_t(0, 'Jeden'), 'lizenz': word_t(0, 'Lizenz'), 'passt': word_t(1, 'passt'),
    'ihre': word_t(2, 'Ihre'), 'gehoert': word_t(2, 'gehört'),
    'regeln': word_t(3, 'Regeln'), 'bot': word_t(4, 'WhatsApp'), 'uhr': word_t(4, 'Uhr'),
    'stunden': word_t(5, 'Stunden'), 'pruefen': word_t(5, 'prüfen'),
    'vorstellung': word_t(6, 'Vorstellung'), 'einstellung': word_t(6, 'Einstellung'), 'digital': word_t(6, 'digital'),
    'agenten': word_t(7, 'KI'), 'alltag': word_t(7, 'Alltag'),
    'aufgebaut': word_t(8, 'Aufgebaut'), 'hamburg': word_t(8, 'Hamburg'), 'ohne': word_t(9, 'ohne'),
    'extern': word_t(10, 'Externe'), 'rund': word_t(10, 'rund'), 'viertausend': word_t(10, '4.000'),
    'selbst': word_t(11, 'Selbst'), 'unter': word_t(11, 'unter'), 'fuenfhundert': word_t(11, '500'),
    'entscheiden': word_t(12, 'Sie'), 'weg1': word_t(13, 'Selbst'), 'weg2': word_t(14, 'Auf'),
    'grund': word_t(14, 'Grund'), 'weg3': word_t(15, 'Oder'), 'mass': word_t(15, 'maß'),
    'betrieb': word_t(16, 'Betrieb'), 'einfacher': word_t(17, 'Einfacher'), 'guenstiger': word_t(17, 'günstiger'),
    'denken': word_t(17, 'denken'),
}
data = {'cues': CUES, 'blocks': BLOCKS, 'captions': captions}
json.dump(data, open(ROOT / 'timing.json', 'w'), ensure_ascii=False, indent=1)
(ROOT / 'src/timing.js').write_text('window.TIMING = ' + json.dumps(data, ensure_ascii=False) + ';\n')
for k, v in CUES['w'].items(): print(f'{k:12s} {v:6.2f}')
print('cut12', CUES['cut12'], 's3a', CUES['s3a'], 's4', CUES['s4'], 'hit500', CUES['hit500'], 's5', CUES['s5'], 's6', CUES['s6'])
