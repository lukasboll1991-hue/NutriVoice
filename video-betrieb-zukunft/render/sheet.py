"""Contact sheet of preview stills: python3 render/sheet.py out/dir prefix cols width out.jpg"""
import glob, sys
from PIL import Image

d, prefix, cols, w, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
fs = sorted(glob.glob(f'{d}/{prefix}_*.jpg'), key=lambda f: float(f.rsplit('_', 1)[1][:-4]))
ims = [Image.open(f) for f in fs]
h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 4), rows * (h + 4)), (80, 80, 80))
for i, im in enumerate(ims):
    S.paste(im.resize((w, h)), ((i % cols) * (w + 4), (i // cols) * (h + 4)))
S.save(out, quality=85)
print(out, len(ims))
