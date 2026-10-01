#!/usr/bin/env python3
"""Stamp a content hash onto the stylesheet and script URLs in index.html.

Browsers cache /assets/styles.css by URL. Without a hash in the URL, a visitor
who has the file cached keeps using the old one. Appending ?v=<hash of the
file> means the URL changes whenever the file does, so the new version is
always fetched, while an unchanged file still hits the cache.

Run before every deploy:

    python3 tools/bust-cache.py && vercel deploy --prod --yes
"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# index.html first: it must reference both files. The legal pages share the
# stylesheet. nl/ and fr/ are generated from index.html, so they are rebuilt
# by tools/build-i18n.py rather than stamped here.
PAGES = ["index.html", "privacy.html", "terms.html", "support.html", "contact.html", "partners.html", "about.html", "account/confirmed.html", "account/reset-password.html"]
ASSETS = ("assets/styles.css", "assets/main.js")

def digest(rel):
    with open(os.path.join(ROOT, rel), "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()[:10]

def main():
    hashes = {rel: digest(rel) for rel in ASSETS}
    changed = []
    for page in PAGES:
        path = os.path.join(ROOT, page)
        html = open(path, encoding="utf-8").read()
        for rel, h in hashes.items():
            # match /assets/styles.css with or without an existing ?v=
            pat = re.compile(r'(/' + re.escape(rel) + r')(\?v=[0-9a-f]+)?')
            new, n = pat.subn(lambda m: f"{m.group(1)}?v={h}", html)
            if n == 0 and page == "index.html":
                sys.exit(f"no reference to /{rel} found in index.html")
            if new != html:
                changed.append(f"{page}: {rel} -> ?v={h}")
            html = new
        open(path, "w", encoding="utf-8").write(html)
    print("\n".join("  " + c for c in changed) if changed else "  already current")

if __name__ == "__main__":
    main()
