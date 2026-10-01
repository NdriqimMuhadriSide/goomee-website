# Goomee — website build notes

Built from `New name and concept website.docx` (concept by Simon Grunberger),
following the full-page design on the last page of that document.

## Palette

Sampled pixel-for-pixel from the concept mockup, not re-invented.

| Name | Hex | Role |
|---|---|---|
| Navy | `#0A1F3D` | Headings, primary text |
| Navy soft | `#35485F` | Hero headline, sub-headings |
| Muted | `#6B7A88` | Body copy, navigation |
| Orange | `#FD5F06` | Primary action, accent word, ticks |
| Orange ink | `#E04E00` | Hover |
| Orange wash | `#FEF3EB` | Highlighted Goomee column |
| Logo blue | `#175492` | The "Goo" of the wordmark |
| Cream | `#FAF9F6` | Warm section ground |
| Mist | `#F2F7FD` | Cool section ground (planner) |

## Type

- **Plus Jakarta Sans** — the closest widely-available match to the friendly
  geometric sans in the mockup. Headlines at 800 with tight tracking (-.035em).
- **Caveat** — the handwritten annotations ("Less searching. More living.",
  "So much to search.", "Your next adventure finds you."), each with the small
  orange swoosh underneath, as drawn.

## Page order

Hero (film) → "Same places. A smarter way." + comparison table →
"Everything for every kind of journey" → My Goomee Planner → testimonials →
popular destinations → closing CTA → footer. This is the mockup's order,
unchanged.

## Decisions taken during the build

1. **Both store badges are live.** Android is confirmed, so the Google Play
   badge stays everywhere the mockup places it. Official store artwork still
   has to replace the CSS-drawn versions — see `assets/media/README.md`.

2. **Destinations are international.** The mobile app launches Brussels-first,
   but the site is not scoped to Brussels. The rail carries Paris, Rome,
   Barcelona, Lisbon, London, New York, Amsterdam and Brussels, and scrolls,
   so adding cities is a one-line change.

3. **"Easy booking & reservations" stays in the comparison table.** Payments
   are planned, so the claim is kept as drawn.

4. **My Goomee Planner carries an "Early preview" chip.** The planner is an MVP
   demo rather than production. The chip is one line in `index.html` — delete
   the `<p class="chip">` when it ships for real.

5. **Copy fixes against the mockup.** The mockup's render artefacts are
   corrected here: "Real momentc" → "Real moments", "Best restaurantc?" →
   "Best restaurants?", "Bruseels" → "Brussels", "Pars" → "Paris", and the
   doubled "Londen / London" on the second testimonial → "London".

6. **Tagline vs headline.** The document offered "The world, your way!" and
   "Let life find you." Both are used the way the mockup uses them: "Let life
   find you." is the standing tagline under the wordmark and in the closing
   line; "The world, your way." is the hero headline.

7. **No images are invented.** Every photo and both videos are empty,
   correctly proportioned slots labelled with what belongs there.

8. **The hero is the concept's film hero.** Full-bleed video behind white type,
   a "Watch the story" play button, the app UI in a phone at the right, the
   handwritten annotation, and the category rail sitting on the film — the
   composition from the first page of the concept document, with Goomee
   branding and the approved headline rather than the earlier Roamly copy.

   - The category strip is no longer a separate white band; it sits on the film.
   - The header is transparent over the hero and solidifies on scroll.
   - The phone shows a real in-app feed built in HTML, not a screenshot, so it
     stays sharp at any size. Only the two card thumbnails are image slots.

9. **Nothing in the hero depends on JavaScript.** The entry choreography is
   pure CSS animation, so the headline renders even if `main.js` fails. It is
   suppressed under `prefers-reduced-motion`. Verified by rendering the page
   with JavaScript disabled.

10. **`.hero-stage` is a placeholder, not a design element.** It is an animated
   dusk gradient standing in for the film. Delete it when real footage lands —
   see `assets/media/README.md`.

11. **Testimonials replaced by "Made for moments like these".** The mockup's
   three named reviews (Sophie L., James T., Mina K.) could not be real before
   launch, and EU consumer law bans fake reviews and endorsements. The section
   now shows three unnamed scenes, each with the in-app suggestion that led to
   it. Real testimonials return after launch, from real users, with consent.

## Kling prompts — moment images

Kling **image** generation, aspect **3:4**, 4 variations each, pick the best.
Download without the Kling watermark. Save to `assets/media/` under the
filename given, then run `python3 tools/wire-media.py`.

People are seen from behind or in profile, never posing for the camera: these
are scenes, not reviewers. The bottom fifth of each frame stays simple because
the suggestion card sits there.

**Shared negative prompt (all three):**
text, letters, readable signage, logo, watermark, face looking at camera,
posed portrait, phone screen, distorted hands, extra fingers, deformed limbs,
oversaturated, HDR, cartoon, illustration, 3D render

**1 · `moment-weekend.jpg` — The weekend away (Lisbon, Friday 18:40)**
> A young couple seen from behind, leaning on a white stone balustrade at the
> Miradouro da Graça viewpoint in Lisbon at golden hour, looking out over
> terracotta rooftops toward the Castelo de São Jorge and the Tagus river,
> one of them pointing at the view, relaxed summer clothes, warm low sun with
> soft haze and lens glow, umbrella pines at the edge of the frame, cinematic,
> 35mm film look, shallow depth of field, natural warm colour grading,
> photorealistic, vertical composition with the couple in the upper half and
> plain stone balustrade across the bottom of the frame

**2 · `moment-solo.jpg` — The first night, on your own (Brussels, Tuesday 21:15)**
> A woman in her late twenties travelling alone, seen from the side and
> slightly behind, walking with a small backpack down a narrow cobbled street
> in the old town of Brussels at blue hour, Flemish gabled façades, warm
> lamplight spilling from café and wine bar windows, people inside softly out
> of focus, damp cobblestones reflecting the lights, calm curious mood,
> cinematic, 35mm film look, shallow depth of field, warm amber highlights
> against deep blue sky, photorealistic, vertical composition with her in the
> middle third and empty glowing cobblestones across the bottom of the frame

**3 · `moment-family.jpg` — The family trip (Paris, Saturday 09:30)**
> A family of four seen from behind, two parents and two young children
> walking hand in hand along a wide gravel path in the Jardin du Luxembourg in
> Paris on a sunny morning, rows of chestnut trees, soft warm early sunlight
> falling through the leaves, green metal park chairs beside the pond, the
> Luxembourg Palace softly out of focus in the distance, happy relaxed mood,
> cinematic, 35mm film look, shallow depth of field, warm natural colour
> grading, photorealistic, vertical composition with the family in the middle
> third and sunlit gravel path across the bottom of the frame

## What I could not make

The hero film itself. Photoreal footage — a traveler over a city at golden
hour — is not something I can produce. Everything around it is built and
waiting: the video element, the poster, the loop behaviour, the story modal,
and an animated stand-in so the hero is never blank. See
`assets/media/README.md` for the drop-in snippet and encoding notes.

## Stock licence

The footer carries a linked Vecteezy credit, which is what their **Free
License** requires on any page using their assets.

Note that Vecteezy's own guidance asks for a credit naming the **contributor**
per asset, e.g. "Eiffel Tower photo by <contributor> on Vecteezy". The
filenames do not carry contributor names, so the current line is a single
site-wide credit. If you want to be exact, the names are on your Vecteezy
account's downloads page — hand them over and the line becomes a short credits
list. Switching to a Pro licence removes the requirement entirely.

## Still open

- **Name clearance.** `goomee.com`, EU trademark classes 39 and 42, and App
  Store name availability are all unverified. The canonical URL, the `og:url`
  and the `vercel.json` redirect all assume `goomee.com`.
- **Language.** English only. Belgium realistically wants NL / FR / EN, which
  needs a language switcher in the header and a routing decision.
- **Analytics and cookie consent.** Neither is wired up. There is no tracking
  on the page today, so no consent banner is required yet — adding analytics
  changes that.
- **Partners.** Concept A's navigation had a "For Partners" entry that the
  full-page design dropped. Affiliate revenue comes from partners, so that page
  probably needs to exist.
- **Legal pages.** The footer links to `/privacy` and `/terms`, which do not
  exist yet.
