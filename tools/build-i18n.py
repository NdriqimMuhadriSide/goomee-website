#!/usr/bin/env python3
"""Build the Dutch and French pages from the English ones.

The English pages are the only pages you edit. For each of nl and fr this
writes {lang}/index.html, {lang}/privacy.html, {lang}/terms.html and
{lang}/support.html.

Two kinds of translation:

  tools/i18n.json
      {en, nl, fr} fragments of the source HTML. Used for the whole home page
      and for the header, footer and <head> text shared by every page.

  tools/i18n/<page>.<lang>.html
      The complete <article> of a legal page, translated. Its first line is
      <!-- source: <hash> -->, the fingerprint of the English article it was
      translated from. If the English article changes, the build stops until
      the translation is updated and the hash bumped (the error prints it).

The build also fails if a fragment in i18n.json appears in no page (stale
translation) or if English text is left on a generated page.

Run after any change to an English page, and before every deploy. It ends by
refreshing the security headers in vercel.json (tools/csp.py):

    python3 tools/bust-cache.py && python3 tools/build-i18n.py
"""
import hashlib, json, os, re, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://getgoomee.com"
LANGS = {"nl": "nl_BE", "fr": "fr_BE"}
PAGES = ["index", "privacy", "terms", "support", "contact", "partners", "about"]
LEGAL = ["privacy", "terms", "support", "contact", "partners", "about"]
ARTICLE = re.compile(r'(<article class="wrap legal">)(.*?)(</article>)', re.S)

# Text that is legitimately identical in every language.
SAME = {
    "Goo", "mee", "Goomee", "Menu", "YouTube (Google)", "Gmail (Google)", "EN", "NL", "FR", "App Store", "Google Play",
    "Rome", "Amsterdam", "New York", "Bilbao", "Vecteezy", "Contact", "Paris",
    "Barcelona", "Privacy", "Destinations", "Planner", "Miradouro da Graça",
    "© 2026 Goomee.", "Restaurants", "Support",
    # in-app button names, quoted as the app shows them; the app has no Dutch
    # yet, so the Dutch support page keeps them in English on purpose
    "Profile → Privacy & Security", "Download my data", "Delete Account",
    "Delete Guest\n      Data", "Edit Profile",
    # names, places and words that are the same in Dutch or French
    "High Five International", "Diepestraat 2 bus B", "1640 Sint-Genesius-Rode",
    "Supabase", "Google Cloud Run", "Google Cloud", "Vercel", "Vercel Web Analytics", "Web3Forms", "Stripe", "Apple", "Open-Meteo", "EU",
    "Account", "Open", "Notifications", "12. Contact", "Message", "Contactformulier", "Contact | Goomee", "Sint-Genesius-Rode", "0742.937.252",
}
# email addresses and bare web addresses never need translating
UNTRANSLATABLE = re.compile(r"^[\w.+-]+@[\w.-]+$|^[\w-]+(\.[\w-]+)+(/[\w/.-]*)?$")


class Text(HTMLParser):
    """Visible text plus alt / aria-label / title, outside script and svg."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip, self.out = 0, set()

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "svg"):
            self.skip += 1
        for k, v in attrs:
            if k in ("alt", "aria-label", "title") and v and re.search(r"[A-Za-z]{2}", v):
                self.out.add(v.strip())

    def handle_endtag(self, tag):
        if tag in ("script", "style", "svg"):
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip and re.search(r"[A-Za-z]{2}", data):
            self.out.add(data.strip())


def texts(html):
    p = Text(); p.feed(html); return p.out


def fingerprint(article):
    return hashlib.sha256(article.strip().encode("utf-8")).hexdigest()[:12]


def localise_links(html, lang):
    """Internal links stay in the page's language. The switcher's own links
    (data-lang) already point at each language and are left alone."""
    def fix(m):
        tag = m.group(0)
        if "data-lang" in tag:
            return tag
        return re.sub(r'href="/(privacy|terms|support|contact|partners|about)?([?#][^"]*)?"',
                      lambda h: f'href="/{lang}' + (f'/{h.group(1)}' if h.group(1) else "")
                                + (h.group(2) or "") + '"', tag)
    return re.sub(r"<a\b[^>]*>", fix, html)


def main():
    src = {p: open(os.path.join(ROOT, f"{p}.html"), encoding="utf-8").read() for p in PAGES}
    table = json.load(open(os.path.join(ROOT, "tools", "i18n.json"), encoding="utf-8"))

    stale = [e["en"] for e in table if not any(e["en"] in s for s in src.values())]
    if stale:
        sys.exit("These English fragments appear on no page; update tools/i18n.json:\n  - "
                 + "\n  - ".join(stale))
    # longest first, so a phrase is translated whole before any shorter
    # fragment inside it gets a chance to match
    table.sort(key=lambda e: len(e["en"]), reverse=True)

    problems = []
    for lang, locale in LANGS.items():
        for page in PAGES:
            out = src[page]
            english = texts(out)

            if page in LEGAL:
                m = ARTICLE.search(out)
                want = fingerprint(m.group(2))
                path = os.path.join(ROOT, "tools", "i18n", f"{page}.{lang}.html")
                if not os.path.exists(path):
                    problems.append(f"missing {os.path.relpath(path, ROOT)}")
                    continue
                body = open(path, encoding="utf-8").read()
                head, _, body = body.partition("\n")
                have = re.search(r"source: ([0-9a-f]+)", head)
                if not have or have.group(1) != want:
                    problems.append(f"{os.path.relpath(path, ROOT)} was translated from an older "
                                    f"English {page}.html; update it and set its first line to "
                                    f"<!-- source: {want} -->")
                    continue
                out = out[:m.start(2)] + "\n" + body.rstrip() + "\n    " + out[m.end(2):]

            for e in table:
                out = out.replace(e["en"], e[lang])

            # page-level settings
            path_part = "" if page == "index" else f"/{page}"
            en_url = f"{SITE}/" if page == "index" else f"{SITE}/{page}"
            out = out.replace('<html lang="en">', f'<html lang="{lang}">', 1)
            out = out.replace(f'<link rel="canonical" href="{en_url}">',
                              f'<link rel="canonical" href="{SITE}/{lang}{path_part}">', 1)
            out = out.replace(f'<meta property="og:url" content="{en_url}">',
                              f'<meta property="og:url" content="{SITE}/{lang}{path_part}">\n'
                              f'  <meta property="og:locale" content="{locale}">', 1)
            out = out.replace(f'"url": "{en_url}",', f'"url": "{SITE}/{lang}{path_part}",', 1)
            out = out.replace(' data-lang="en" aria-current="page">', ' data-lang="en">', 1)
            out = out.replace(f' data-lang="{lang}">', f' data-lang="{lang}" aria-current="page">', 1)
            out = localise_links(out, lang)
            # the first-visit redirect only belongs on the English home page
            out = re.sub(r"\n  <!-- First visit only:.*?</script>\n", "\n", out, count=1, flags=re.S)
            out = out.replace("<!doctype html>",
                              f"<!doctype html>\n<!-- GENERATED by tools/build-i18n.py from {page}.html. "
                              "Do not edit this file. -->", 1)

            left = sorted(t for t in (texts(out) & english) - SAME if not UNTRANSLATABLE.match(t))
            if left:
                problems.append(f"[{lang}/{page}] untranslated text still on the page:\n    - "
                                + "\n    - ".join(left))
                continue

            os.makedirs(os.path.join(ROOT, lang), exist_ok=True)
            with open(os.path.join(ROOT, lang, f"{page}.html"), "w", encoding="utf-8") as fh:
                fh.write(out)
            print(f"  {lang}/{page}.html")

    if problems:
        sys.exit("\n".join(problems))

    # the CSP pins every inline <script> and <style> by hash, so refresh it
    # whenever pages are rebuilt
    import csp
    csp.main()


if __name__ == "__main__":
    main()
