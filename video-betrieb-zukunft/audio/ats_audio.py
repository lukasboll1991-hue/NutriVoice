"""Music, sound effects and voice for the ATS spot: python3 audio/ats_audio.py main|pitch

Same palette as the earlier spots (audio/synth.py), on the 118 BPM grid of ats_timing.json:
tension under the hook, a driving groove through the "Pflichtprogramm", riser and stamp,
the drop on "Kür" (beat 45), a full groove under the five highlights with an accent at each,
the end card on beat 120. Voice: take A placed in segments (no tempo change).
Writes out/ats_<spot>_music.wav, _sfx.wav, _vo.wav.
"""
import json, pathlib, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from synth import *  # noqa: F401,F403

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPOT = sys.argv[1]
AT = json.load(open(ROOT / 'ats_timing.json'))
SPEC = AT['spots'][SPOT]
DUR = SPEC['dur']
N = int(SR * (DUR + 0.2))

drums = np.zeros((N, 2)); bass = np.zeros((N, 2)); pads = np.zeros((N, 2)); keys = np.zeros((N, 2)); fx = np.zeros((N, 2))
duck = np.ones(N)

def kick_at(b, g=1.0):
    t = beat(b)
    if t >= DUR: return
    add(drums, kick(g), t, 0.95)
    i = sec(t); L = sec(0.22); e = 1 - 0.55 * g * np.exp(-np.arange(L) / (SR * 0.06))
    j = min(N, i + L); duck[i:j] = np.minimum(duck[i:j], e[:j - i])

def bar_chords(b0, b1, prog):
    out, b, k = [], b0, 0
    while b < b1: out.append((b, prog[k % len(prog)])); b += 4; k += 1
    return out

def groove(b0, b1, prog=('F', 'C', 'Dm', 'Bb'), full=True, clap_on=True):
    for b in np.arange(b0, b1, 1.0):
        kick_at(b, 1.0 if full else 0.8)
        if clap_on and int(b - b0) % 2 == 1: add(drums, clap(), beat(b), 0.55 if full else 0.4, 0.05)
        add(drums, hat(), beat(b + 0.5), 0.55 if full else 0.4, 0.25)
        if full:
            for s in (0.25, 0.75): add(drums, shaker(), beat(b + s), 0.7, -0.3)
        if int(b - b0) % 4 == 3: add(drums, hat(True), beat(b + 0.5), 0.35, 0.3)
    for bb, ch in bar_chords(b0, b1, prog):
        L = min(4, b1 - bb)
        for e in np.arange(0, L, 0.5):
            if e % 1 == 0.5 or e == 0: add(bass, bass_note(mtof(m(ROOT_N[ch])), SPB * 0.42), beat(bb + e), 0.9 if e else 0.7)
        add(pads, pad_chord(ch, SPB * L, bright=1.0 if full else 0.6), beat(bb), 1.0)
        tones = [mtof(m(n) + 12) for n in CH[ch]]; pat = [0, 2, 1, 3, 2, 1, 3, 2]
        for s in range(int(L * 4)):
            if s % 2 == 1 and not full: continue
            f = tones[pat[s % 8]] * (2 if s % 8 in (3, 7) else 1)
            add(keys, pluck(f), beat(bb + s / 4), 0.16 if s % 4 else 0.22, [-0.45, 0.45][s % 2])

def tension(b0, b1):
    add(pads, pad_chord('Dm', beat(b1) - beat(b0), bright=0.35), beat(b0), 0.8)
    for b in np.arange(b0, b1, 0.25): add(drums, hat(), beat(b), 0.22 if b % 1 else 0.38, 0.4 if (b * 4) % 2 else -0.4)
    for b in np.arange(b0, b1, 2.0): kick_at(b, 0.6)
    for s in range(int((b1 - b0) * 2)):
        f = mtof(m(['D4', 'F4', 'A4', 'F4'][s % 4]))
        add(keys, lp(pluck(f), 1400 + 260 * s), beat(b0 + s / 2), 0.13, [-0.3, 0.3][s % 2])

def build_into(b0, b1, roll=True):
    add(fx, riser(beat(b1) - beat(b0)), beat(b0), 0.5)
    if roll:
        for b in np.arange(max(b0, b1 - 2), b1, 0.25): add(drums, snare(), beat(b), 0.15 + 0.25 * (b - b1 + 2) / 2, 0.1)

def hit(b, chord='F', big=1.0):
    add(fx, crash(1.7), beat(b), 1.0 * big); add(fx, sub_boom(1.4), beat(b), 0.5 * big)
    add(keys, piano_chord(chord, 1.3), beat(b), 1.0)

def button(b, tail_to):
    add(fx, crash(2.4), beat(b), 0.8); kick_at(b, 1.0)
    add(pads, pad_chord('F', tail_to - beat(b), bright=1.0), beat(b), 1.2)
    add(keys, piano_chord('F', 1.3), beat(b), 1.0)
    add(bass, bass_note(mtof(m('F2')), min(1.6, tail_to - beat(b))), beat(b), 0.7)

END_B = 120
tension(0, 8)                                   # hook
add(fx, crash(1.8), beat(8), 0.6); add(fx, sub_boom(1.0, 52, 34), beat(8), 0.3)
groove(8, 24, full=False)                       # Pflichtprogramm, lighter
add(fx, crash(1.4), beat(24), 0.4)
groove(24, 41, full=True)                       # Pflichtprogramm, full
build_into(41, 45)                              # "Alles drin." – riser + roll
hit(45, 'F', 1.0)                               # drop on "Kür"
kick_at(45, 1.0); add(pads, pad_chord('F', SPB * 2, bright=1.0), beat(45), 1.0)
groove(47, 63, ('F', 'C', 'Dm', 'Bb'))          # H1 KI-Assistent
for b in (64, 80, 90, 106):                     # accents at highlights 2–5
    add(fx, crash(1.6), beat(b), 0.42); add(fx, sub_boom(0.8, 60, 40), beat(b), 0.18)
groove(63, 117, ('Bb', 'C', 'F', 'Dm'))
build_into(117, END_B, roll=False)
button(END_B, DUR)
for s in range(int((DUR - beat(END_B) - 1.2) / (SPB / 2))):   # soft arpeggio under the end card
    f = mtof(m(['F4', 'A4', 'C5', 'A4', 'G4', 'C5'][s % 6]))
    add(keys, lp(pluck(f), 2400), beat(END_B + 1 + s / 2), 0.09, [-0.35, 0.35][s % 2])

bass *= duck[:, None]; pads *= (0.35 + 0.65 * duck)[:, None]
pads = reverb(pads, 0.35); keys = reverb(keys, 0.3); drums = drums + reverb(drums * 0.25, 0.5) - drums * 0.25 * 0.85
music = drums * 0.9 + bass * 0.85 + pads * 1.0 + keys * 0.9 + fx * 0.8
music = hp(music.T, 28).T
fade = np.ones(N); fe = sec(DUR); fl = sec(1.2)
fade[fe - fl:fe] = np.linspace(1, 0, fl) ** 1.5; fade[fe:] = 0
music *= fade[:, None]

fxbus = np.zeros((N, 2))
for c in json.load(open(ROOT / f'out/sfx_ats_{SPOT}.json')):
    f = SYN.get(c['name'])
    if f is not None and c['t'] < DUR: add(fxbus, f(c.get('p', 1.0)), c['t'], c['g'], c['pan'])
fxbus = fxbus * 0.85 + reverb(fxbus, 0.18) * 0.15

vo_in = load_mono(ROOT / AT['vo_file'])
vo = np.zeros(N)
for name, a, b, v in SPEC['segs']:
    seg = vo_in[sec(a):sec(b)].copy(); fl = sec(0.012)
    seg[:fl] *= np.linspace(0, 1, fl); seg[-fl:] *= np.linspace(1, 0, fl)
    i = sec(v); j = min(N, i + len(seg)); vo[i:j] += seg[:j - i]

music /= np.abs(music).max() / 0.7; fxbus /= max(1e-9, np.abs(fxbus).max()) / 0.7
wav(ROOT / f'out/ats_{SPOT}_music.wav', music); wav(ROOT / f'out/ats_{SPOT}_sfx.wav', fxbus); wav(ROOT / f'out/ats_{SPOT}_vo.wav', vo)
print('ok', SPOT, DUR)
