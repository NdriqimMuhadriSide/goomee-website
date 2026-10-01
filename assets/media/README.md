# Media slots

Every image and video in the concept is present in the page as an empty,
correctly proportioned slot. Nothing is a stock placeholder — the slots render
as grey blocks labelled with the filename and size they expect.

## To fill a slot

Put the file in **this folder** (`Goomee/assets/media/`) using the exact name
from the table below, then from `Goomee/` run:

```bash
python3 tools/wire-media.py
```

It finds every slot whose file now exists, inserts the `<img>` with alt text,
`loading="lazy"` and `decoding="async"`, and leaves the rest as placeholders.
Run it again whenever you add more — it skips anything already wired, so it is
safe to repeat. For the two videos it writes the `<source>` tags instead, and
picks up `hero-loop-poster.jpg` / `story-15s-poster.jpg` if they are there.

Doing it by hand is the same edit:

```html
<!-- before -->
<div class="media" data-media="dest-paris.jpg · 600×760"></div>

<!-- after -->
<div class="media"><img src="/assets/media/dest-paris.jpg" alt="Paris"></div>
```

The label and dashed outline disappear on their own once the slot has an
`<img>` or `<video>` child.

## Moments — illustrative scenes, not testimonials

The section after the planner used to be three named testimonials. The app
has not launched, so those quotes could not be real, and EU consumer law bans
fake reviews and endorsements. It is now **"Made for moments like these"**:
three unnamed scenes with the in-app suggestion that led to each.

Generate the three images in Kling (prompts in `DESIGN.md`), save them here as
`moment-weekend.jpg`, `moment-solo.jpg`, `moment-family.jpg` (3:4, ~900×1200,
under ~250 KB), and run `python3 tools/wire-media.py`.

Real testimonials can return after launch, from real users, with their written
consent for the quote and for any photo.

## Originals

Full-size stock files live in `Goomee/media-src/`, which is excluded from the
deploy. `python3 tools/process-media.py` crops and compresses them into this
folder — edit the `JOBS` table in that script to re-point an image at a
different slot, then re-run it. Nothing in `media-src/` is ever uploaded.

**Attribution.** The current set is Vecteezy. Check whether your licence tier
requires a credit line; the free tier does, and it has to appear on the page.

## Before you add them

- **Crop to the listed size.** The slots are fixed aspect ratios and the image
  is `object-fit: cover`, so anything off-ratio gets cropped from the centre.
- **Compress.** Aim under ~250 KB each, ~500 KB for the two large landscapes.
  `sips -Z 1200 file.jpg` or Squoosh both work.
- **Licensing.** Whatever goes in here is on a public site — make sure you have
  the rights. The avatars are real people's faces; they need releases.

## Manifest

| Slot | File | Size | Note |
|---|---|---|---|
| **Hero film** | ✅ `hero-loop-1440-hevc.mp4`, `hero-loop-1080.mp4` (desktop) · `hero-loop-mobile-hevc.mp4`, `hero-loop-mobile.mp4` (phones, portrait crop tracking the traveller) | 2560×1440 / 1920×1080 / 720×1920 | 12s forward+reverse loop from the Kling clip in `media-src/`, watermark cropped, desktop cuts upscaled 4× with VideoToolbox super-resolution |
| **Hero poster** | `hero-poster.jpg` | 1920×1080 | first frame; set on `<video poster>` |
| **Story film** | `story-15s.mp4` + `story-15s.webm` | 1920×1080 | the 15-second storyboard, opens from "Watch the story" |
| App card thumbs ×4 | `app-card-1.jpg` … `app-card-4.jpg` | 600×340 | inside the two phone mockups |
| Comparison photo | `still-searching.jpg` | 1200×1400 | ✅ woman scrolling over coffee |
| Journey — daily life | `journey-daily.jpg` | 800×520 | ✅ couple at a pavement café |
| Journey — travelers | `journey-travelers.jpg` | 800×520 | ✅ St Peter's Square aerial |
| Journey — locals | `journey-locals.jpg` | 800×520 | ✅ Barcelona aerial |
| Journey — groups | `journey-groups.jpg` | 800×520 | ✅ friends by the water at sunset |
| Planner items ×4 | `pl-1.jpg` … `pl-4.jpg` | 120×120 | itinerary thumbnails |
| Destinations ×8 | ✅ `dest-paris.jpg`, ✅ `dest-rome.jpg`, ✅ `dest-barcelona.jpg`, ✅ `dest-london.jpg`, ✅ `dest-newyork.jpg`, ✅ `dest-amsterdam.jpg`, ✅ `dest-brussels.jpg`, `dest-lisbon.jpg` | 600×760 | portrait 4:5 |

`dest-bilbao.jpg` is also processed and ready, but no card uses it yet — see
below.

### Lisbon is still missing

The file supplied as Lisbon is **Bilbao, Spain** (`vecteezy_building-architecture-in-bilbao-city-spain…`),
so it was not used for the Lisbon card. It has been processed to
`dest-bilbao.jpg` instead. Either source a real Lisbon photo, or swap the card:
change the last `<li class="dest">` in the rail to `dest-bilbao.jpg` / `Bilbao`.

The Lisbon card sits last in the rail so the empty slot is not visible in the
first row.
| Closing background | `close-landscape.jpg` | 2400×1200 | ✅ Amsterdam aerial |
| Moments ×3 | `moment-weekend.jpg`, `moment-solo.jpg`, `moment-family.jpg` | 900×1200 | portrait 3:4, from Kling |
| Social preview | `og-cover.jpg` | 1200×630 | referenced by `og:image` |

## The hero film

The hero is built for a full-bleed video that plays the moment someone lands.
The `<video>` is already in place with `autoplay muted loop playsinline` and no
`<source>`, so nothing downloads until the files exist.

**In the meantime the hero is not empty.** `.hero-stage` is an animated
stand-in — a slow dusk drift with a moving sun glow and film grain — so
something is playing from the first frame. Combined with the entry
choreography (headline, badges, play button, phone and category rail easing in
on a stagger) the hero reads as a film even with no footage.

To drop the real film in:

```html
<video class="hero-video" autoplay muted loop playsinline
       preload="auto" poster="/assets/media/hero-poster.jpg" aria-hidden="true">
  <source src="/assets/media/hero-loop.webm" type="video/webm">
  <source src="/assets/media/hero-loop.mp4"  type="video/mp4">
</video>
```

Then delete the `.hero-stage` block from `index.html` and its rules from
`styles.css` — the film replaces it.

**Encoding notes.** Keep it silent (browsers block autoplay with audio), under
~4 MB, and cut it so the last frame matches the first or the loop will jump.
1920×1080 H.264 for `.mp4`, VP9 for `.webm`.

### The story film

"Watch the story" opens a `<dialog>` with a second `<video>` that has `controls`
and `preload="none"`. Add `<source>` tags to `.story-video` the same way. This
is where the 15-second storyboard from the concept document belongs.

## Store badges and links (launch day)

1. Paste the two listing URLs into `STORES` at the top of `assets/main.js`.
   That alone turns every badge into a link, hides the "Coming soon" notes and
   sends "Get the app" taps on iPhone/iPad to the App Store and on Android to
   Google Play. Desktop visitors still scroll to the badges.
2. Swap the CSS-drawn badges for the official artwork: Apple's from
   developer.apple.com/app-store/marketing/guidelines, Google's from
   play.google.com/intl/en_us/badges. Use the Dutch and French versions on
   `/nl` and `/fr` (add them to `tools/i18n.json`). Both stores only allow
   their badges for apps that are live, which is why they are placeholders now.
3. `python3 tools/bust-cache.py && python3 tools/build-i18n.py`, then deploy.
