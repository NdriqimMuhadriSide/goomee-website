#!/usr/bin/env python3
"""Wire real media into index.html.

Drop files into assets/media/ using the names the slots ask for, then run:

    python3 tools/wire-media.py

Every slot whose file now exists gets a real <img> (or <source> tags, for the
two videos). Slots with no file are left as labelled placeholders. Safe to run
as many times as you like — it skips anything already wired.
"""
import os, re, sys

ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE  = os.path.join(ROOT, "index.html")
MEDIA = os.path.join(ROOT, "assets", "media")

# Alt text per file. Anything missing falls back to the slot's own description.
ALT = {
    "app-card-1.jpg":        "Coffee and a pastry on a café table",
    "app-card-2.jpg":        "Sunset over Rome from Gianicolo hill",
    "app-hero-screen.jpg":   "The Goomee app showing personalized recommendations",
    "still-searching.jpg":   "A woman scrolling on her phone over a coffee, still deciding",
    "journey-daily.jpg":     "A couple sharing coffee and pastries at a pavement caf\u00e9",
    "journey-travelers.jpg": "St Peter's Square in Rome, seen from above",
    "journey-locals.jpg":    "Barcelona from above, with the Sagrada Família at its centre",
    "journey-groups.jpg":    "Friends sharing wine and food by the water at sunset",
    "close-landscape.jpg":   "Amsterdam seen from above at dusk",
    "moment-weekend.jpg":    "A couple at a Lisbon viewpoint at golden hour, looking over the rooftops",
    "moment-solo.jpg":       "A traveller walking alone past lit-up gabled houses in Brussels at dusk",
    "moment-family.jpg":     "A family walking together through a park in Paris on a sunny morning",
}
for city in ["paris","rome","barcelona","lisbon","london","newyork","amsterdam","brussels"]:
    ALT[f"dest-{city}.jpg"] = city.replace("newyork", "New York").title()
for n in range(1, 5):
    ALT[f"pl-{n}.jpg"] = ""          # decorative thumbnails beside a text label

SLOT = re.compile(
    r'<(?P<tag>div|span)(?P<attrs>[^>]*?class="[^"]*\bmedia\b[^"]*"[^>]*?)'
    r'\sdata-media="(?P<label>[^"]+)"(?P<rest>[^>]*)></(?P=tag)>'
)

def first_file(label):
    """'dest-paris.jpg · 600×760' -> 'dest-paris.jpg'."""
    return label.split("·")[0].strip().split(" / ")[0].strip()

def describe(label):
    parts = [p.strip() for p in label.split("·")]
    return parts[-1] if len(parts) > 2 else ""

def main():
    if not os.path.isdir(MEDIA):
        sys.exit(f"No media folder at {MEDIA}")

    html  = open(PAGE, encoding="utf-8").read()
    wired, missing = [], []

    def swap(m):
        name = first_file(m.group("label"))
        path = os.path.join(MEDIA, name)
        if not os.path.exists(path):
            missing.append(name)
            return m.group(0)
        alt = ALT.get(name, describe(m.group("label")))
        loading = "" if name in ("app-card-1.jpg", "app-card-2.jpg") else ' loading="lazy"'
        wired.append(name)
        tag, attrs, rest = m.group("tag"), m.group("attrs"), m.group("rest")
        img = f'<img src="/assets/media/{name}" alt="{alt}"{loading} decoding="async">'
        return f'<{tag}{attrs}{rest}>{img}</{tag}>'

    html = SLOT.sub(swap, html)

    # the two <video> elements take <source> children instead of an <img>
    for cls, stem in (("hero-video", "hero-loop"), ("story-video", "story-15s")):
        have = [e for e in ("webm", "mp4") if os.path.exists(os.path.join(MEDIA, f"{stem}.{e}"))]
        if not have:
            missing.append(f"{stem}.mp4 / .webm")
            continue
        pat = re.compile(r'(<video class="' + cls + r'"[^>]*?)(\sdata-media="[^"]*")?(></video>)')
        def vid(m):
            head = m.group(1)
            poster = os.path.join(MEDIA, f"{stem}-poster.jpg")
            if os.path.exists(poster):
                head = head.replace('poster=""', f'poster="/assets/media/{stem}-poster.jpg"')
            src = "".join(
                f'\n        <source src="/assets/media/{stem}.{e}" type="video/{e}">' for e in have
            )
            return f"{head}>{src}\n      </video>"
        html, n = pat.subn(vid, html)
        if n:
            wired.extend(f"{stem}.{e}" for e in have)

    open(PAGE, "w", encoding="utf-8").write(html)

    print(f"wired {len(wired)} file(s)")
    for n in sorted(set(wired)):
        print("  +", n)
    if missing:
        print(f"\nstill empty ({len(set(missing))}):")
        for n in sorted(set(missing)):
            print("  -", n)
    if wired:
        print("\nHero film wired? Remember to delete the .hero-stage block "
              "from index.html once hero-loop.* is in.")

if __name__ == "__main__":
    main()
