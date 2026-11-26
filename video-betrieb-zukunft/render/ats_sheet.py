"""Contact sheet of stills: python3 render/ats_sheet.py out.jpg img1 img2 ... (2 columns, 960 px each, time label)."""
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
W, H = 960, 540
rows = (len(files) + 1) // 2
sheet = Image.new('RGB', (W * 2 + 10, rows * (H + 10)), (30, 30, 30))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H))
    x, y = (i % 2) * (W + 10), (i // 2) * (H + 10)
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 150, y + 34], fill=(0, 0, 0))
    d.text((x + 8, y + 8), f.split('_')[-1].replace('.jpg', ' s'), fill=(255, 255, 0))
sheet.save(out, quality=82)
