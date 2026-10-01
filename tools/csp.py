#!/usr/bin/env python3
"""Write the site's security headers into vercel.json.

The Content-Security-Policy allows scripts and styles only from this site,
plus the exact inline <script> and <style> blocks the pages contain, pinned by
their sha256 hash. Editing an inline block changes its hash, so this runs at
the end of tools/build-i18n.py and the new hash is always in the header that
ships with the page. Run it on its own after hand-editing a page:

    python3 tools/csp.py

Outside services the pages talk to:
  api.web3forms.com                          the contact form (assets/main.js)
  the Cloud Run API                          password reset (assets/account.js)
Adding one means adding it below, or the browser blocks it.
"""
import base64, glob, hashlib, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://ziing-api-1034202494699.europe-west1.run.app"

INLINE = re.compile(r"<(script|style)(?![^>]*\bsrc=)([^>]*)>(.*?)</\1>", re.S)


def inline_hashes():
    found = {"script": set(), "style": set()}
    pages = glob.glob(os.path.join(ROOT, "*.html")) + glob.glob(os.path.join(ROOT, "*", "*.html"))
    for path in pages:
        if os.sep + "tools" + os.sep in path:
            continue
        for tag, attrs, body in INLINE.findall(open(path, encoding="utf-8").read()):
            # JSON-LD is data, never executed, so CSP does not need to allow it
            if tag == "script" and "application/ld+json" in attrs:
                continue
            digest = base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode()
            found[tag].add(f"'sha256-{digest}'")
    return {k: sorted(v) for k, v in found.items()}


def policy(h):
    return "; ".join([
        "default-src 'self'",
        "script-src 'self' " + " ".join(h["script"]),
        "style-src 'self' " + " ".join(h["style"]),
        "font-src 'self'",
        "img-src 'self' data:",
        "media-src 'self'",
        f"connect-src 'self' https://api.web3forms.com {API}",
        "form-action 'self' https://api.web3forms.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
    ])


def main():
    path = os.path.join(ROOT, "vercel.json")
    cfg = json.load(open(path, encoding="utf-8"))
    h = inline_hashes()
    every_page = [
        {"key": "Content-Security-Policy", "value": policy(h)},
        {"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
        {"key": "Permissions-Policy",
         "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()"},
        {"key": "Cross-Origin-Opener-Policy", "value": "same-origin"},
    ]
    # the account pages carry a sign-in token in the URL fragment: never
    # cache them, never index them, never send them as a referrer
    account = [
        {"key": "Cache-Control", "value": "no-store"},
        {"key": "X-Robots-Tag", "value": "noindex, nofollow"},
        {"key": "Referrer-Policy", "value": "no-referrer"},
    ]
    keep = [r for r in cfg.get("headers", []) if r["source"] not in ("/(.*)", "/account/(.*)")]
    cfg["headers"] = [{"source": "/(.*)", "headers": every_page},
                      {"source": "/account/(.*)", "headers": account}] + keep
    new = json.dumps(cfg, indent=2, ensure_ascii=False) + "\n"
    if new != open(path, encoding="utf-8").read():
        open(path, "w", encoding="utf-8").write(new)
        print(f"  vercel.json: security headers updated "
              f"({len(h['script'])} inline scripts, {len(h['style'])} inline styles)")


if __name__ == "__main__":
    main()
