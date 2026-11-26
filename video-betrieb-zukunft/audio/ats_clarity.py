"""Voice clarity over music + effects for the ATS spot: python3 audio/ats_clarity.py main|pitch
Runs the same voice chain and ducking as ad_mix.sh into separate stems, then compares the
speech band (300-4000 Hz) of voice vs. bed in 0.4 s windows where the voice is active."""
import subprocess, sys, pathlib
import numpy as np
from scipy import signal

S = sys.argv[1]
OUT = pathlib.Path(__file__).resolve().parents[1] / 'out'
SR = 48000
FC = ("[2:a]aformat=channel_layouts=stereo,highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3500:t=q:w=1.0:g=2,"
      "acompressor=threshold=-24dB:ratio=3:attack=4:release=120:makeup=2,asplit=3[vo][k1][k2];"
      "[0:a]aformat=channel_layouts=stereo,volume=-7dB[m];[m][k1]sidechaincompress=threshold=0.02:ratio=5:attack=20:release=380:knee=4[md];"
      "[1:a]aformat=channel_layouts=stereo,volume=-4dB[s];[s][k2]sidechaincompress=threshold=0.06:ratio=2:attack=8:release=200[sd]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', OUT / f'ats_{S}_music.wav', '-i', OUT / f'ats_{S}_sfx.wav', '-i', OUT / f'ats_{S}_vo.wav',
                '-filter_complex', FC, '-map', '[vo]', OUT / f'st_{S}_vo.wav', '-map', '[md]', OUT / f'st_{S}_m.wav', '-map', '[sd]', OUT / f'st_{S}_s.wav'], check=True)

def load(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(f), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)

vo, mu, sf = load(OUT / f'st_{S}_vo.wav'), load(OUT / f'st_{S}_m.wav'), load(OUT / f'st_{S}_s.wav')
sos = signal.butter(2, [300, 4000], 'band', fs=SR, output='sos')
v, b = signal.sosfilt(sos, vo), signal.sosfilt(sos, mu + sf)
w = int(0.4 * SR); rows = []
for i in range(0, len(v) - w, w):
    rv = np.sqrt(np.mean(v[i:i + w] ** 2)); rb = np.sqrt(np.mean(b[i:i + w] ** 2))
    if rv > 0.02: rows.append((i / SR, 20 * np.log10(rv / (rb + 1e-9))))
r = np.array(rows)
print(f'{S}: {len(r)} speech windows, voice over bed median {np.median(r[:, 1]):.1f} dB, min {r[:, 1].min():.1f} dB at {r[r[:, 1].argmin(), 0]:.1f}s')
for t, d in rows:
    if d < 8: print(f'   low at {t:.1f}s: {d:.1f} dB')
