# Goomee — data inventory

Produced by reading `iOSZiing` and `ziing-backend` on 20 September 2026; updated 29 September 2026 (Cloud Run, YouTube, Gmail, the ~1 km push area).
This is the factual basis for the privacy policy. Keep it in step with the code.

**Controller:** High Five International, Diepestraat 2 PB B, 1640
Sint-Genesius-Rode, Belgium — simon@high5intl.com

## Personal data held

| Data | Where | Notes |
|---|---|---|
| Email, password/session | Supabase `auth.users` | Account identity |
| Display name, avatar image | `profiles`, Storage bucket | Avatar is user-uploaded |
| Preferences / taste profile | `profiles.preferences` (jsonb) | Drives personalisation |
| Consent state per purpose | `profiles.consent` | `location`, `notifications`, `personalization` |
| Consent history | `consent_log` | Append-only, with source + timestamp — this is the Art. 7(1) evidence |
| Saved places | `saved_place` | |
| Travel history | `travel_history` | |
| Trips / itineraries | `trip` | Produced by the AI planner |
| Place interactions | `place_interaction` | Ranking signals — profiling |
| Analytics events | `analytics_event` | user_id, session_id, event name, rank, props |
| Affiliate clicks | `outbound_click` | user_id, session_id, place, partner, destination |
| Push tokens | `device` | platform + token |
| Notification history | `notification_log` | |
| Approximate location | request-time; cached by grid cell | Coarsened via `search_cell_degrees`; precise coordinates are not stored against the user |
| Last area (push) | `device.last_lat/lng` | Rounded to 2 decimals (~1 km), only with recommendation notifications on; deleted with the device |
| Payment data | **Stripe** | Not in use while the app is free. Card data would never reach our servers |

## Processors

| Processor | Purpose | Location |
|---|---|---|
| Supabase | Database, auth, file storage | EU (Ireland) |
| Google Cloud Run | API hosting | Belgium (`europe-west1`) |
| Google — Places API, Maps SDK | Place data, map rendering | Google Cloud |
| Google — Vertex AI (Gemini) | Trip planner | Google Cloud |
| Google — Text-to-Speech | Spoken content | Google Cloud |
| Open-Meteo | Weather | Coarsened cell coordinates only, no account data |
| Stripe | Payments | |
| Apple (APNs) | Push notifications | |
| YouTube (Google) | Place videos, played in YouTube's embedded player; receives the device IP when one plays | EU / US |
| Gmail (Google) | Sends account emails (SMTP) and receives mail to goomee.support@gmail.com | EU / US |

## Retention (enforced in `0009_index_and_retention.sql`)

- `analytics_event` — 90 days
- `feed_metric` — 90 days
- `recommendation` — 30 days
- `rate_limit` — 2 days
- Place / search / weather / photo caches — expiry-based (place cache expiry is
  a Google licensing obligation)

## Data-subject rights already implemented

| Right | Endpoint |
|---|---|
| Access / portability (Art. 15, 20) | `GET /me/export` — JSON download incl. signed avatar URL |
| Erasure (Art. 17) | `DELETE /me` — removes auth user, avatar, interactions |
| Withdraw consent (Art. 7(3)) | `/me/consent`, per purpose |
| Object to profiling (Art. 21) | `DELETE /me/taste` — resets the taste profile |
| Remove a device | `DELETE` device token in `ops.py` |

## What is NOT collected — worth stating plainly

- No IDFA / no AppTrackingTransparency prompt — no advertising identifier
- No Firebase, Amplitude, Mixpanel, Segment, AppsFlyer, Adjust, Sentry or
  Crashlytics. Crash reporting is first-party and flows through the same
  consented analytics pipeline.
- No cross-site tracking, no ad networks
- The website itself currently sets **no cookies and runs no analytics**, so it
  needs no consent banner. Adding analytics changes that.

## iOS permissions requested

- `NSLocationWhenInUseUsageDescription` — when-in-use only, no background location
- `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription` — profile picture only

## Open issues to resolve before launch

1. **Vertex AI runs on a colleague's trial project.** You cannot name a
   processor you have no contract with. Move the planner to a High Five
   International Google Cloud account and sign Google's Data Processing
   Addendum.
2. **Google Cloud transfers data outside the EEA.** Confirm the DPA and
   Standard Contractual Clauses are in place, and set the region explicitly.
3. **Supabase DPA** — confirm signed, and confirm the project region is EU.
4. **Stripe DPA** — confirm signed before payments go live.
5. **Export filename** still says `ziing-account-export.json`; rename with the
   rest of the rebrand.
6. **Apple privacy labels / Google Play Data safety** are separate
   questionnaires in the store consoles — this inventory answers them.
