# Action Zone CMA — Website Build Brief

## What this is

`preview-site.html` is a **content and structure specification**, not a visual target.
It is a single 4,500-line HTML file where all 14 pages live as `<div class="__page">`
blocks with duplicated nav, footer, and CSS per page. That duplication is an artifact
of the preview format. Do not reproduce it.

Build this properly in Astro + Tailwind. Nav, footer, and layout become components.
Every page's copy, structure, and section order comes from the preview.

**The preview is desktop-shaped. The real site is mobile-first.** See "Mobile-first" below.

---

## Stack

- **Astro + Tailwind CSS**
- **Cloudflare Pages** for hosting
- Domain already owned (Cloudflare)
- Current site is Wix at actionzonecma.com — this replaces it

---

## Design system (carry over exactly)

**Fonts**
- Headings: Fraunces (serif, weight 900 for display)
- Body / UI: Archivo

**Colors**
| Token | Hex | Use |
|---|---|---|
| indigo | `#191A3E` | primary dark, nav, headings |
| indigo-deep | `#0F1029` | darker bands, footer |
| gold | `#C9A227` | accent, CTAs, rules |
| gold-soft | `#E4C765` | accent on dark backgrounds |
| paper | `#FAF9F5` | page background |
| paper-warm | `#EFEADC` | section bands, borders |
| ink | `#1C1C17` | body text |
| mist | `#6E6D62` | muted text |
| white | `#FFFFFF` | cards |

**Motifs**
- Belt bar: 7-segment colored strip at the very top of every page (white → yellow →
  orange → green → blue → brown → black). Present in preview as `.beltbar`.
- Gold top-border on cards (3–4px) as the recurring card treatment.
- Large decorative circle outline in hero sections (see `.rvhero::after` etc.)

---

## Pages (14)

| Page | Notes |
|---|---|
| Home | Hero, programs, extras, reviews teaser, CTA |
| Little Warriors | Ages 3–5 |
| Kids | Ages 6–12 |
| Teens & Adults | Ages 13+ |
| Schedule | **Reference only — see below** |
| Booking | **New page — see below** |
| Facility | |
| Birthday Parties | |
| Parents Night Out | |
| Our Story | Narrative + Michael Lowery's own words |
| Meet the Team | Michael Lowery, Jayson Lindemuth, Hannah Minter |
| Events | Belt testing, PNO, demos, parties, Saturday training |
| Reviews | Google reviews |
| FAQ | |
| Contact | |

Note: the preview has a single `page-team`; "Our Story" and "Meet the Team" are
separate pages (`page-story` and `page-team`).

---

## CRITICAL: Schedule and Booking must be two separate pages

The preview has these merged into one page. **They must be split.**
This was the single biggest piece of feedback and is not yet reflected in the preview file.

### `/schedule` — reference page for current students

- Shows the **full weekly schedule**, all classes, all levels
- **No booking controls at all.** No buttons, no calendar.
- Audience: existing families checking what time their class meets
- Keep the age/level filters
- Keep the Saturday block
- One link out to `/booking` for anyone new

### `/booking` — trial booking page for new families

- **Beginner classes only.** Never show Black Belt Club or Masters Club here.
- **A real calendar** with actual dates. "Monday" alone is ambiguous — the user
  must pick a specific date.
- **Only Monday through Thursday is selectable.** Hannah (Office Manager) is only in
  the office those days, and she must be present to walk the parent through
  enrollment in person. All other days disabled.
- Past dates disabled.
- After a date is chosen, show only the beginner classes that meet on that weekday:

| Weekday | Bookable classes |
|---|---|
| **Monday / Wednesday** | 4:00–4:45pm Little Warriors (3–5)<br>5:00–6:00pm Basic Club (6–12) |
| **Tuesday / Thursday** | 6:00–7:00pm Basic Club Kids (6–12)<br>7:00–8:00pm Basic Club Teens & Adults (13+) |

- Then collect: parent/guardian name, phone, email, student name, student age
- Confirmation state showing the chosen class + full date + time
- Trust signals near the form (see Trust signals below)

---

## Full class schedule (source of truth)

**Monday & Wednesday**
| Time | Class | Level |
|---|---|---|
| 4:00–4:45pm | Little Warriors (3–5) | Beginner |
| 5:00–6:00pm | Basic Club (6–12) | Beginner |
| 6:00–7:00pm | Black Belt Club (6–12) | Intermediate |
| 7:00–8:00pm | Masters Club Kids (6–12) | Advanced |
| 8:00–9:00pm | Masters Club Teens & Adults (13+) | Advanced |

**Tuesday & Thursday**
| Time | Class | Level |
|---|---|---|
| 4:00–5:00pm | Masters Club Kids (6–12) | Advanced |
| 5:00–6:00pm | Black Belt Club Kids (6–12) | Intermediate |
| 6:00–7:00pm | Basic Club Kids (6–12) | Beginner |
| 7:00–8:00pm | Basic Club Teens & Adults (13+) | Beginner |
| 8:00–9:00pm | Black Belt Club Teens & Adults (13+) | Intermediate |

**Saturday** — 10:00am–12:00pm, all ages / all ranks, open mat + makeups + testing.
Not bookable for trials.

**Closed** Friday and Sunday.

### Important framing
Black Belt Club and Masters Club are **not skill levels a student selects.** They are
joined **by invitation from the instructor** after earning rank. Copy must never imply
a newcomer can self-select into them. This is why booking is beginner-only.

---

## Single source of truth for shared data

Put this in **one data file** (e.g. `src/data/school.ts`) that every page imports.
Do not hardcode these in multiple templates — they drifted badly in the preview.

- Class schedule (above)
- Ages: Little Warriors 3–5, Kids 6–12, Teens & Adults 13+
- Hours: **Mon–Thu 3:00pm–9:00pm, Sat 10:00am–12:00pm, closed Fri & Sun**
- Address: 6105 Phillipi Church Rd., Raeford, NC 28376
- Phone: (910) 429-2467
- Email: jay.lindemuth@gmail.com (temporary — will become a branded address)
- Review count / rating: 5.0, 80+ Google reviews
- Founded: 1993
- Social: facebook.com/cmamtma · instagram.com/yeshuas_ryu

---

## Mobile-first (explicit requirement)

The client's instruction: *"I want the site's mobile presence to be stronger than the
desktop version. Most viewing is done on a cell phone."*

Design for the phone first, expand up. Not desktop-shrunk.

Required:
- **Sticky tap-to-call button** on mobile so the phone number is always one tap away
- **Schedule stacks** into a readable single-column list on phones, not a squeezed grid
- **Booking calendar full-width** on mobile with thumb-sized tap targets (min 44px)
- Hamburger nav that actually works (the preview's is hand-rolled; build it properly)
- Modern image formats (WebP/AVIF), lazy loading, responsive `srcset`
- **Target: under 2.5s load on cell data.** This is a conversion issue, not a nicety.

---

## Backend: trial booking submissions

**Status: pending.** The school co-owns a platform called Tarnished Labs
(Next.js on Vercel, Neon Postgres, GitHub, Cloudflare domain) which has a lead-capture
widget and possibly an API. Nic is connecting this.

Build the booking form so the submission handler is **swappable**:

1. **Preferred:** POST to Tarnished Labs API endpoint if one is available
2. **Fallback:** own Neon table + notification, structured so migration is trivial

**Non-negotiable regardless of path:** an **immediate SMS** to the school on every
booking. Lead response speed is the single highest-leverage factor in this funnel —
5-minute response converts dramatically better than 30-minute. An email or a dashboard
entry someone checks later is not sufficient.

Do not use a third-party scheduling widget (Calendly etc.) as the primary flow — it
breaks the visual experience at the exact moment of conversion.

---

## Trust signals (place near forms)

Exactly these three, no additions:
- Teaching martial arts since 1993
- 5.0 stars across 80+ Google reviews
- Parents are always welcome to watch class

Do **not** add "background checked instructors" or privacy/data claims — the client
removed both deliberately.

---

## Reviews page

- Live Google reviews feed, pulled automatically from the Google Business Profile,
  newest first. This is confirmed and wanted.
- Keep the 5.0 / 80+ summary bar with Google branding.
- Three verified review quotes are hardcoded in the preview (Jacy D., Crystal C.,
  Sarah G.). Verify names against the actual Google listing before launch —
  "Crystal C." was inferred from a display handle and may be wrong.

---

## SEO / technical (not in preview, must be added)

- Unique `<title>` and meta description per page
- Open Graph + Twitter card tags
- Canonical URLs
- **LocalBusiness / SportsActivityLocation schema markup** — hours, address, geo,
  phone, aggregate rating. High value for local search.
- Favicon + touch icons
- `sitemap.xml`, `robots.txt`
- Embedded Google Map on Contact
- Preserve existing Wix URL structure where sensible, or 301 redirect:
  `/about`, `/testimony`, `/contact`, `/meet-the-team`, `/little-warriors-class`,
  `/children-class`, `/teen-adult-class`, `/pictures-1`

---

## Copy rules (strict)

- **No em-dashes in body copy**
- **No pricing anywhere on the site.** Deliberate positioning decision — value is
  communicated in person. Do not add price ranges, "starting at," or fee tables.
- No competitor name-drops
- No martial arts jargon in marketing copy
- Voice modeled on Michael Lowery's writing (see Our Story page for his actual words)
- One consistent CTA label for the trial offer — preview uses "Claim My Free Week";
  the booking page uses "Book My Free Class". Pick one convention and apply it.

---

## Assets

- **Logo:** vector file (Illustrator/SVG) coming from client. Placement decided:
  **badge beside the wordmark** in the nav. On mobile, badge only — the
  "Yeshua's Ryu · Jesus' Way" tagline is unreadable at that width.
  Also needs a simplified mark (cross + figure, no ring text) for favicon/small sizes.
- **Photos:** all image slots in the preview are gray placeholder divs with
  descriptive labels (e.g. "Warm-up circle, Little Warriors"). Those labels describe
  what to shoot. Client has ~71 photos on the Yelp listing that may cover several.
- **Video:** parent testimonial videos being filmed. Reserve space on Reviews and
  program pages. Shot vertical for TikTok, so plan for both a longer site cut and
  short-form.

---

## Confirmed details (previously open — now resolved)

1. **Hours.** Mon–Thu **3:00pm–9:00pm**. Saturday **10:00am–12:00pm**.
   Closed Friday and Sunday. Applied throughout the preview.
2. **Email.** Use `jay.lindemuth@gmail.com` for now. A branded business address
   (e.g. `info@actionzonecma.com`) will replace it later — put the email in the
   shared data file so it is a one-line change.
3. **Events page** is **five cards**: belt testing, Parents Night Out, demonstrations,
   birthday parties, Saturday open training. The seminars card was removed.
4. **Saturday** — 10:00am–12:00pm, all ages / all ranks, open mat + makeups + testing.
   Not bookable for trials.
5. **Student Login** — see below.

---

## Student Login

**Purpose:** desktop access to training videos. Students already have an app;
this is the browser equivalent for people who would rather watch on a laptop
than a phone.

**Behavior:**
- Same credentials as the mobile app — one account, not a separate website login
- On successful login, route **directly to the training videos section**.
  No dashboard, no landing page in between.
- Authentication is handled by the existing student platform (Tarnished Labs).
  The website does not manage accounts, passwords, or password resets — it hands
  off to the platform's auth.

**Build guidance:**
- Treat this as a **link out to the platform's login**, not a login form built into
  the marketing site. Do not collect or transmit credentials from the Astro site.
- If the platform supports a deep link / redirect parameter, point it at the
  training videos route so the user lands there directly.
- Until the platform endpoint is confirmed with Nic, wire the nav/footer
  "Student Login" links to a placeholder route and flag it. **Do not ship dead
  links to production** — either point at the real destination or remove the links.

---

## Open questions — confirm before launch

1. **Student Login destination URL** — pending from Nic. See Student Login above.
2. **Review names** — three quotes are hardcoded on the Reviews page (Jacy D.,
   Crystal C., Sarah G.). "Crystal C." was inferred from a display handle and
   should be verified against the actual Google listing.


---

## Explicitly out of scope

- **Geo pages** for Fayetteville / Hope Mills. Considered and declined — the school
  does not run programs in those communities, only demos, and the client did not want
  a page that overstates the relationship.
- Summer Camp page. Removed deliberately (only one week, 8am–12pm currently).
- Pricing pages of any kind.
