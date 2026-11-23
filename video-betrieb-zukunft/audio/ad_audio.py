"""Music, sound effects and voice for the YouTube ad cuts: python3 audio/ad_audio.py a|b|c

Same palette as the 60 s spot (audio/synth.py), arranged per cut on the 118 BPM grid.
Voice: ElevenLabs take, sped up by the tempo in ad_timing.json (pitch kept), cut into segments.
Writes out/ad_<spot>_music.wav, _sfx.wav, _vo.wav.
"""
import json, pathlib, subprocess, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from synth import *  # noqa: F401,F403  (SR, beat, sec, instruments, SYN, reverb, wav, load_mono, ...)

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPOT = sys.argv[1]
AD = json.load(open(ROOT / 'ad_timing.json'))
SPEC = AD['spots'][SPOT]
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

def groove(b0, b1, prog=('F', 'C', 'Dm', 'Bb'), full=True):
    for b in np.arange(b0, b1, 1.0):
        kick_at(b, 1.0)
        if int(b - b0) % 2 == 1: add(drums, clap(), beat(b), 0.55, 0.05)
        add(drums, hat(), beat(b + 0.5), 0.55, 0.25)
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

def tension(b0, b1):            # Dm pad, ticking 16ths, soft kicks, rising pluck ostinato
    add(pads, pad_chord('Dm', beat(b1) - beat(b0), bright=0.35), beat(b0), 0.8)
    for b in np.arange(b0, b1, 0.25): add(drums, hat(), beat(b), 0.22 if b % 1 else 0.38, 0.4 if (b * 4) % 2 else -0.4)
    for b in np.arange(b0, b1, 2.0): kick_at(b, 0.6)
    for s in range(int((b1 - b0) * 2)):
        f = mtof(m(['D4', 'F4', 'A4', 'F4'][s % 4]))
        add(keys, lp(pluck(f), 1400 + 260 * s), beat(b0 + s / 2), 0.13, [-0.3, 0.3][s % 2])

def build_into(b0, b1, roll=True):   # riser + snare roll ending on b1
    add(fx, riser(beat(b1) - beat(b0)), beat(b0), 0.5)
    if roll:
        for b in np.arange(max(b0, b1 - 2), b1, 0.25): add(drums, snare(), beat(b), 0.15 + 0.25 * (b - b1 + 2) / 2, 0.1)

def hit(b, chord='F', big=1.0):
    add(fx, crash(2.6), beat(b), 1.0 * big); add(fx, sub_boom(1.4), beat(b), 0.5 * big)
    add(keys, piano_chord(chord, 1.3), beat(b), 1.0)

def button(b, tail_to):           # final chord, then let it ring until the end
    add(fx, crash(2.4), beat(b), 0.8); kick_at(b, 1.0)
    add(pads, pad_chord('F', tail_to - beat(b), bright=1.0), beat(b), 1.2)
    add(keys, piano_chord('F', 1.3), beat(b), 1.0)
    add(bass, bass_note(mtof(m('F2')), min(1.6, tail_to - beat(b))), beat(b), 0.7)

if SPOT == 'a':
    tension(0, 11)
    add(fx, sub_boom(1.2, 50, 30), beat(11), 0.35)
    build_into(13, 18)
    add(fx, crash(), beat(18), 1.0); add(fx, sub_boom(), beat(18), 0.45)
    groove(18, 33)
    add(fx, crash(1.6), beat(26.5), 0.45)
    for bb, ch in bar_chords(33, 45, ['Dm', 'Bb', 'F']):            # proof: breakdown
        L = min(4, 45 - bb)
        add(pads, pad_chord(ch, SPB * L, bright=0.6), beat(bb), 1.8)
        for e in np.arange(0, L, 1.0): add(keys, piano_chord(ch, 1.5 if e == 0 else 0.8), beat(bb + e), 1.0, 0.1)
        add(bass, bass_note(mtof(m(ROOT_N[ch])), SPB * L * 0.95), beat(bb), 0.45)
    for b in np.arange(37, 45, 0.5): add(drums, shaker(), beat(b), 0.5 + 0.3 * (b - 37) / 8, -0.3)
    build_into(41, 45)
    hit(45)
    kick_at(45, 0.9); add(drums, clap(), beat(46), 0.4); add(pads, pad_chord('F', SPB * 3, bright=0.9), beat(45), 1.0)
    add(fx, crash(2.0), beat(48), 0.8)
    groove(48, 57, ('Bb', 'C', 'F'), full=True)
    button(57, DUR)
elif SPOT == 'b':
    tension(0, 7)
    build_into(5, 7)
    add(fx, crash(), beat(7), 0.9); add(fx, sub_boom(), beat(7), 0.4)
    groove(7, 13.5)
    groove(13.5, 19.5, full=False)
    build_into(17.5, 19.5, roll=False)
    add(fx, crash(2.2), beat(19.5), 0.8)
    groove(19.5, 28, ('Bb', 'C', 'F'), full=True)
    button(28, DUR)
else:
    add(pads, pad_chord('F', beat(4), bright=0.7), 0.0, 1.0)
    for s in range(16):
        f = mtof(m(['F4', 'A4', 'C5', 'A4'][s % 4]))
        add(keys, lp(pluck(f), 1800 + 200 * s), beat(s / 4), 0.12, [-0.3, 0.3][s % 2])
    for b in (0, 1, 2, 3): kick_at(b, 0.55)
    add(fx, crash(2.0), beat(4), 0.8)
    groove(4, 10, ('Bb', 'C'), full=True)
    button(10, DUR)

bass *= duck[:, None]; pads *= (0.35 + 0.65 * duck)[:, None]
pads = reverb(pads, 0.35); keys = reverb(keys, 0.3); drums = drums + reverb(drums * 0.25, 0.5) - drums * 0.25 * 0.85
music = drums * 0.9 + bass * 0.85 + pads * 1.0 + keys * 0.9 + fx * 0.8
music = hp(music.T, 28).T
fade = np.ones(N); fe = sec(DUR); fl = sec(0.5 if DUR > 10 else 0.35)
fade[fe - fl:fe] = np.linspace(1, 0, fl); fade[fe:] = 0
music *= fade[:, None]

fxbus = np.zeros((N, 2))
for c in json.load(open(ROOT / f'out/sfx_ad_{SPOT}.json')):
    f = SYN.get(c['name'])
    if f is not None and c['t'] < DUR: add(fxbus, f(c.get('p', 1.0)), c['t'], c['g'], c['pan'])
fxbus = fxbus * 0.85 + reverb(fxbus, 0.18) * 0.15

# voice: tempo change once (pitch kept), then cut and place the segments
src = ROOT / AD['vo_file']; tmp = ROOT / 'out' / 'ad_vo_tempo.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f"atempo={AD['tempo']}", '-ac', '1', '-ar', str(SR), str(tmp)], check=True)
vo_in = load_mono(tmp)
vo = np.zeros(N)
for name, a, b, v in SPEC['segs']:
    s0, s1 = sec(a / AD['tempo']), sec(b / AD['tempo'])
    seg = vo_in[s0:s1].copy(); fl = sec(0.012)
    seg[:fl] *= np.linspace(0, 1, fl); seg[-fl:] *= np.linspace(1, 0, fl)
    i = sec(v)
    if i < 0: seg = seg[-i:]; i = 0
    j = min(N, i + len(seg)); vo[i:j] += seg[:j - i]

music /= np.abs(music).max() / 0.7; fxbus /= max(1e-9, np.abs(fxbus).max()) / 0.7
wav(ROOT / f'out/ad_{SPOT}_music.wav', music); wav(ROOT / f'out/ad_{SPOT}_sfx.wav', fxbus); wav(ROOT / f'out/ad_{SPOT}_vo.wav', vo)
print('ok', SPOT, DUR)
