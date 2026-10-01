#!/usr/bin/env python3
"""Crop and compress originals from media-src/ into assets/media/.

Each entry is (source substring, output name, width, height, vertical anchor,
[horizontal anchor]). An anchor is where the crop window sits along that axis:
0.0 = top/left, 0.5 = centre, 1.0 = bottom/right. Landmarks usually want a
little above centre so the subject keeps its headroom; portrait crops out of
landscape sources often need a horizontal anchor to keep the subject in frame.
"""
import os, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "media-src")
OUT  = os.path.join(ROOT, "assets", "media")

JOBS = [
    ("eiffel-tower",        "dest-paris.jpg",       600,  760, 0.50),
    ("trevi-fountain",      "dest-rome.jpg",        600,  760, 0.50),
    ("casa-batllo",         "dest-barcelona.jpg",   600,  760, 0.45),
    # "fantastic-sunset" is the Amsterdam canal houses at dusk - the strongest
    # shot of the set, so it carries the Amsterdam card. The hazy aerial goes
    # to the closing band, where it sits under a dark scrim anyway.
    ("fantastic-sunset",    "dest-amsterdam.jpg",   600,  760, 0.50),
    ("cinquantenaire",      "dest-brussels.jpg",    600,  760, 0.50),
    ("aerial-view-of-amsterdam", "close-landscape.jpg", 2400, 1200, 0.55),
    ("aerial-view-of-barcelona", "journey-locals.jpg", 800, 520, 0.50),
    ("vatican",             "journey-travelers.jpg", 800, 520, 0.45),
    ("london-bridge",       "dest-london.jpg",      600,  760, 0.50),
    ("new-york-city-skyline","dest-newyork.jpg",    600,  760, 0.50),
    # NOTE: this file is Bilbao, Spain - not Lisbon. Held as its own city
    # until a real Lisbon shot arrives.
    ("bilbao",              "dest-bilbao.jpg",      600,  760, 0.42),
    ("cafe-bistro",         "journey-daily.jpg",    800,  520, 0.50),
    ("summer-party",        "journey-groups.jpg",   800,  520, 0.50),
    # portrait crop from a landscape source: anchored left of centre so the
    # plain background stays clear for the search chips that overlay it
    ("portrait-of-smiling", "still-searching.jpg", 1200, 1400, 0.00, 0.38),
]

def find(fragment):
    for f in sorted(os.listdir(SRC)):
        if fragment.lower() in f.lower():
            return os.path.join(SRC, f)
    return None

def process(src, name, w, h, anchor, hx=0.5):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")
    sw, sh = im.size
    target = w / h

    # widest crop of the right ratio that still fits
    if sw / sh > target:
        cw, ch = int(sh * target), sh
    else:
        cw, ch = sw, int(sw / target)

    left = int((sw - cw) * hx)
    top  = int((sh - ch) * anchor)
    im = im.crop((left, top, left + cw, top + ch))
    im = im.resize((w, h), Image.LANCZOS)

    dest = os.path.join(OUT, name)
    im.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    return os.path.getsize(dest), f"{sw}x{sh}"

if __name__ == "__main__":
    if not os.path.isdir(SRC):
        sys.exit("no media-src/ folder")
    done = set()
    for job in JOBS:
        frag, name, w, h, anchor = job[:5]
        hx = job[5] if len(job) > 5 else 0.5
        if name in done:
            continue
        src = find(frag)
        if not src:
            continue
        size, orig = process(src, name, w, h, anchor, hx)
        done.add(name)
        print(f"  {name:24s} {w}x{h}  {size/1024:6.0f} KB   <- {orig}  {os.path.basename(src)[:46]}")
    print(f"\n{len(done)} image(s) written to assets/media/")
