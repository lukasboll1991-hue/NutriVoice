"""Contact sheets from the rendered MP4: one frame every 0.5 s, plus frames around every cut."""
import subprocess, json, pathlib, sys
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parents[1]
mp4 = ROOT / 'out' / sys.argv[1] if len(sys.argv) > 1 else ROOT / 'out/BetriebZukunft_Spot_60s_16x9.mp4'
od = ROOT / 'out/review'; od.mkdir(exist_ok=True)
def frame(t, w=480):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', str(mp4), '-frames:v', '1', '-vf', f'scale={w}:-1', '-f', 'image2pipe', '-c:v', 'png', '-'], capture_output=True).stdout
    import io; return Image.open(io.BytesIO(raw)).convert('RGB')
def sheet(times, name, cols=6, w=480):
    ims = [frame(t, w) for t in times]; h = ims[0].height
    S = Image.new('RGB', (cols * (w + 4), ((len(ims) + cols - 1) // cols) * (h + 22)), (40, 40, 40)); d = ImageDraw.Draw(S)
    for i, (t, im) in enumerate(zip(times, ims)):
        x, y = (i % cols) * (w + 4), (i // cols) * (h + 22); S.paste(im, (x, y + 20)); d.text((x + 4, y + 4), f'{t:.2f}s', fill=(255, 255, 255))
    S.save(od / name, quality=82); print(od / name)
C = json.load(open(ROOT / 'timing.json'))['cues']
if 'cuts' in sys.argv:
    cuts = [C['cut12'], C['s3a'], C['s3b'], C['s3c'], C['s3d'], C['s3e'], C['pull34'] + 0.4, C['wipe45'] + 0.2, C['fold56'] + 0.25]
    ts = [round(c + d, 3) for c in cuts for d in (-0.1, 0, 0.1)]
    sheet(ts, 'cuts.jpg', cols=6, w=420)
else:
    for k in range(4):
        sheet([k * 15 + i * 0.5 for i in range(30)], f'strip_{k}.jpg', cols=6, w=300)
