"""Contact sheet for portrait stills: python3 render/ats_sheet_p.py out.jpg prefix t1,t2,... (4 per row)."""
import sys
from PIL import Image, ImageDraw
out, pre, ts = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
im0 = Image.open(f'{pre}_{ts[0]}.jpg')
W = 400
H = round(W * im0.height / im0.width)
rows = (len(ts) + 3) // 4
sheet = Image.new('RGB', (W * 4 + 30, rows * (H + 10)), (30, 30, 30))
d = ImageDraw.Draw(sheet)
for i, t in enumerate(ts):
    im = Image.open(f'{pre}_{t}.jpg').convert('RGB').resize((W, H))
    x, y = (i % 4) * (W + 10), (i // 4) * (H + 10)
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 70, y + 20], fill=(0, 0, 0))
    d.text((x + 4, y + 4), t, fill=(255, 255, 0))
sheet.save(out, quality=82)
