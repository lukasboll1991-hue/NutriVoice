"""Frame strip from a finished MP4: python3 render/strip.py in.mp4 step cols width out.jpg"""
import io, subprocess, sys
from PIL import Image, ImageDraw

src, step, cols, w, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
ts, t = [], 0.0
while t < dur - 0.01:
    ts.append(round(t, 2)); t += step
ims = []
for t in ts:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', src, '-frames:v', '1', '-vf', f'scale={w}:-2', '-f', 'image2pipe', '-c:v', 'png', '-'], capture_output=True).stdout
    ims.append(Image.open(io.BytesIO(raw)).convert('RGB'))
h = ims[0].height
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 4), rows * (h + 18)), (40, 40, 40))
d = ImageDraw.Draw(S)
for i, (t, im) in enumerate(zip(ts, ims)):
    x, y = (i % cols) * (w + 4), (i // cols) * (h + 18)
    S.paste(im, (x, y + 16)); d.text((x + 3, y + 2), f'{t:.2f}s', fill=(255, 255, 255))
S.save(out, quality=82)
print(out, len(ims))
