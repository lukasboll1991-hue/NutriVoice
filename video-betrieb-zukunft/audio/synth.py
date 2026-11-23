"""Shared synthesis toolkit (instruments, effects, sound design) for the Betrieb Zukunft films.
Extracted from build_audio.py so the ad cuts can arrange their own music on the same palette."""
import json, pathlib, subprocess
import numpy as np
from scipy import signal

SR = 48000
BPM = 118
SPB = 60 / BPM
rng = np.random.default_rng(7)
def beat(b): return b * SPB
def sec(n): return int(round(n * SR))
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def m(name):  # 'F3' -> midi
    n, o = name[:-1], int(name[-1]); n = n.replace('Bb', 'A#').replace('Eb', 'D#')
    return NOTE[n] + 12 * (o + 1)

def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = sec(a), sec(d), sec(r); sl = max(0, n - a - d - r)
    e = np.concatenate([np.linspace(0, 1, max(1, a), endpoint=False), np.linspace(1, s, max(1, d), endpoint=False), np.full(sl, s), np.linspace(s, 0, max(1, r))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))

def saw(f, n, phase=0.0):
    # band-limited saw via additive partials up to 12 kHz
    t = np.arange(n) / SR; y = np.zeros(n)
    k = 1
    while k * f < 12000 and k <= 40:
        y += np.sin(2 * np.pi * k * f * t + phase * k) / k; k += 1
    return y * (2 / np.pi)

def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR / 2 * 0.95), 'low', fs=SR, output='sos'); return signal.sosfilt(sos, x)
def hp(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos'); return signal.sosfilt(sos, x)
def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR / 2 * 0.95)], 'band', fs=SR, output='sos'); return signal.sosfilt(sos, x)

def add(buf, x, t, g=1.0, pan=0.0):
    """mix mono or stereo x into stereo buf at time t (s) with equal-power pan"""
    i = sec(t)
    if i >= buf.shape[0]: return
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.4142, x * r * 1.4142], 1)
    j = min(buf.shape[0], i + x.shape[0])
    if i < 0: x = x[-i:]; i = 0
    buf[i:j] += g * x[:j - i]

def svf_sweep(x, f0, f1, q=2.0, curve=1.0):
    """state-variable band-pass with exponential cutoff sweep"""
    n = len(x); out = np.zeros(n); low = band = 0.0
    fs = f0 * (f1 / f0) ** (np.linspace(0, 1, n) ** curve)
    F = 2 * np.sin(np.pi * np.minimum(fs, SR / 6) / SR); damp = 1 / q
    for i in range(n):
        high = x[i] - low - damp * band
        band += F[i] * high; low += F[i] * band
        out[i] = band
    return out

def make_ir(dur=2.2, pre=0.012, damp=3.2, hf=5500):
    n = sec(dur); t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for c in range(2):
        nz = rng.standard_normal(n) * np.exp(-damp * t)
        nz = lp(nz, hf) ; nz[:sec(pre)] = 0
        ir[:, c] = nz
    return ir / np.abs(ir).sum(0).max() * 6

IR = make_ir()
def reverb(st, mix=0.25):
    wet = np.stack([signal.fftconvolve(st[:, 0], IR[:, 0])[:len(st)], signal.fftconvolve(st[:, 1], IR[:, 1])[:len(st)]], 1)
    return st * (1 - mix * 0.3) + wet * mix

# ---------------------------------------------------------------- drums
def kick(g=1.0):
    n = sec(0.42); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.032)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.6 * (body + click)) * g

def clap():
    n = sec(0.45); t = np.arange(n) / SR; x = np.zeros(n); nz = rng.standard_normal(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = sec(d); e = np.zeros(n); e[i:] = np.exp(-(t[:n - i]) / (0.006 if k < 2 else 0.12)); x += nz * e
    return bp(x, 900, 5200) * 0.7

def hat(open_=False):
    n = sec(0.32 if open_ else 0.06); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7200) * np.exp(-t / (0.09 if open_ else 0.014)) * 0.45

def shaker():
    n = sec(0.08); t = np.arange(n) / SR
    e = np.minimum(1, t / 0.012) * np.exp(-t / 0.025)
    return bp(rng.standard_normal(n), 5000, 11000) * e * 0.25

def snare():
    n = sec(0.22); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.5
    nz = bp(rng.standard_normal(n), 1500, 9000) * np.exp(-t / 0.07)
    return (tone + nz) * 0.6

def crash(len_=2.4):
    n = sec(len_); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 4200) * np.exp(-t / 0.7)
    x2 = hp(rng.standard_normal(n), 4200) * np.exp(-t / 0.7)
    return np.stack([x, x2], 1) * 0.22

def riser(len_):
    n = sec(len_); t = np.arange(n) / SR
    nz = svf_sweep(rng.standard_normal(n), 250, 7000, q=3, curve=1.6) * (t / len_) ** 1.8
    sw = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * t / len_)) / SR) * (t / len_) ** 2 * 0.15
    return (nz * 0.5 + sw)

def sub_boom(len_=1.4, f0=58, f1=32):
    n = sec(len_); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)

# ---------------------------------------------------------------- tonal
CH = {
    'F': ['F3', 'A3', 'C4', 'G4'], 'C': ['E3', 'G3', 'C4', 'D4'], 'Dm': ['D3', 'F3', 'A3', 'E4'], 'Bb': ['D3', 'F3', 'Bb3', 'C4'],
}
ROOT_N = {'F': 'F2', 'C': 'C2', 'Dm': 'D2', 'Bb': 'Bb1'}

def pad_chord(ch, dur, bright=1.0):
    n = sec(dur + 1.2); out = np.zeros((n, 2))
    for nm in CH[ch]:
        f = mtof(m(nm))
        for c, det in enumerate([-0.07, 0.07]):
            v = saw(f * 2 ** (det / 12), n, phase=rng.uniform(0, 6)) + 0.6 * saw(f * 2 ** (-det / 12 * 0.5), n, phase=rng.uniform(0, 6))
            out[:, c] += v
    e = env_adsr(n, 0.35, 0.4, 0.8, 1.1, dur)
    out[:, 0] = lp(out[:, 0], 900 + 900 * bright); out[:, 1] = lp(out[:, 1], 900 + 900 * bright)
    return out * e[:, None] * 0.05

def piano_chord(ch, vel=1.0):
    n = sec(2.6); t = np.arange(n) / SR; y = np.zeros(n)
    for nm in CH[ch]:
        f = mtof(m(nm) + 12)
        for k, (a, dc) in enumerate([(1, 1.4), (0.45, 0.8), (0.22, 0.5), (0.1, 0.3)]):
            y += a * np.sin(2 * np.pi * f * (k + 1) * t) * np.exp(-t / dc)
    y *= np.minimum(1, t / 0.004)
    return y * 0.06 * vel

def pluck(f, g=1.0):
    n = sec(0.4); t = np.arange(n) / SR
    tri = signal.sawtooth(2 * np.pi * f * t, 0.5)
    y = (0.6 * np.sin(2 * np.pi * f * t) + 0.4 * tri) * np.exp(-t / 0.13) * np.minimum(1, t / 0.002)
    return lp(y, 4200) * g

def bass_note(f, dur):
    n = sec(dur); t = np.arange(n) / SR
    y = saw(f, n) * 0.6 + np.sin(2 * np.pi * f * t) * 0.8
    y = lp(y, 380) * env_adsr(n, 0.004, 0.08, 0.7, 0.04, dur)
    return np.tanh(y * 1.4) * 0.5


# ---------------------------------------------------------------- sound effects
def S_whoosh(len_=0.45, f0=300, f1=4500, p=1.0):
    n = sec(len_); t = np.arange(n) / SR
    e = np.sin(np.pi * np.minimum(1, t / len_)) ** 1.5
    return svf_sweep(rng.standard_normal(n), f0 * p, f1 * p, q=1.6, curve=0.8) * e * 0.9
def S_click(p=1.0):
    n = sec(0.03); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2600 * p * t) * np.exp(-t / 0.0025) + hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.0015) * 0.5) * 0.8
def S_tick(p=1.0):
    n = sec(0.04); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1900 * p * t) * np.exp(-t / 0.006) * 0.7 + hp(rng.standard_normal(n), 5000) * np.exp(-t / 0.001) * 0.3
def S_thunk(p=1.0):
    n = sec(0.2); t = np.arange(n) / SR; f = 70 * p + 90 * p * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.06) + lp(rng.standard_normal(n), 2000) * np.exp(-t / 0.004) * 0.3
def S_paper(p=1.0):
    n = sec(0.38); t = np.arange(n) / SR
    am = np.repeat(rng.uniform(0.1, 1, n // 240 + 1), 240)[:n] ** 2
    return bp(rng.standard_normal(n), 1400 * p, 7500) * am * np.exp(-t / 0.15) * 0.7
def S_ping(p=1.0):
    n = sec(0.5); t = np.arange(n) / SR; y = np.zeros(n)
    for d, f in [(0, 1318.5), (0.075, 1760)]:
        i = sec(d); tt = t[:n - i]
        y[i:] += (np.sin(2 * np.pi * f * p * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * p * tt)) * np.exp(-tt / 0.12)
    return y * 0.35
def S_send(p=1.0):
    n = sec(0.09); t = np.arange(n) / SR; f = 520 + 600 * t / 0.09
    return np.sin(2 * np.pi * np.cumsum(f * p) / SR) * np.sin(np.pi * t / 0.09) * 0.35
def S_pop(p=1.0):
    n = sec(0.09); t = np.arange(n) / SR; f = (480 + 700 * (1 - np.exp(-t / 0.02))) * p
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025) * 0.7
def S_blip(p=1.0):
    n = sec(0.12); t = np.arange(n) / SR; f = np.where(t < 0.05, 1200, 1800) * p
    return signal.square(2 * np.pi * np.cumsum(f) / SR * 1.0, 0.5) * np.exp(-t / 0.05) * 0.12
def S_type(p=1.0):
    y = np.zeros(sec(0.4))
    for k in range(9):
        c = S_click(p * rng.uniform(0.7, 1.1)) * rng.uniform(0.3, 0.7); i = sec(k * 0.04 + rng.uniform(0, 0.015)); y[i:i + len(c)] += c[:len(y) - i]
    return y * 0.6
def S_stamp(p=1.0):
    n = sec(0.35); t = np.arange(n) / SR; f = 45 * p + 70 * p * np.exp(-t / 0.02)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    slap = bp(rng.standard_normal(n), 300, 4000) * np.exp(-t / 0.012)
    return np.tanh(1.5 * (body + slap * 0.7)) * 0.9
def S_scratch(p=1.0):
    n = sec(0.36); t = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 31 * t) ** 2
    return bp(rng.standard_normal(n), 1800 * p, 6000) * am * np.sin(np.pi * t / 0.36) * 0.5
def S_impact(p=1.0):
    n = sec(1.6); t = np.arange(n) / SR
    boom = sub_boom(1.6, 70 * p, 30)
    nz = lp(rng.standard_normal(n), 3500) * np.exp(-t / 0.05)
    return np.tanh(1.3 * (boom + nz * 0.6)) * 0.9
def S_rise(p=1.0):
    return S_whoosh(0.6, 200, 2500, p) * 0.7
def S_snap(p=1.0):
    th = S_thunk(1.8 * p) * 0.35; ck = S_click(1.2 * p)
    y = np.zeros(len(th)); y[:len(ck)] += ck; y += th
    return y
def S_hit(p=1.0):
    a = S_thunk(0.9 * p); b = S_tick(1.5 * p); y = np.zeros(max(len(a), len(b))); y[:len(a)] += a; y[:len(b)] += b * 0.6
    return y
SYN = {
    'whoosh': lambda p: S_whoosh(0.42, 250, 5000, p), 'whoosh_big': lambda p: S_whoosh(0.6, 120, 3500, p) * 1.1,
    'whoosh_rev': lambda p: np.flip(S_whoosh(0.4, 250, 5000, p)), 'whoosh_pop': lambda p: S_whoosh(0.3, 400, 6000, p) + np.pad(S_pop(p), (sec(0.22), 0))[:sec(0.3)],
    'swish': lambda p: S_whoosh(0.24, 900, 7000, p) * 0.8, 'swish_low': lambda p: S_whoosh(0.5, 150, 1800, p),
    'rise': S_rise, 'thunk': S_thunk, 'paper': S_paper, 'paperthud': lambda p: S_thunk(0.7 * p) + np.pad(S_paper(p), (0, 0))[:sec(0.2)] * 0.6,
    'tick': S_tick, 'snap': S_snap, 'click': S_click, 'drop': lambda p: S_thunk(1.6 * p) * 0.6 + np.pad(S_click(p), (0, sec(0.17)))[:sec(0.2)] * 0.4,
    'ping': S_ping, 'send': S_send, 'pop': S_pop, 'blip': S_blip, 'type': S_type, 'stamp': S_stamp, 'scratch': S_scratch,
    'impact': S_impact, 'hit': S_hit,
}

def load_mono(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

def wav(path, x):
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x, x], 1)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', str(path)], input=x.tobytes(), check=True)
