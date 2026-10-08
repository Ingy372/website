# Action Zone CMA — Handoff

## Files

- `BUILD-BRIEF.md` — the spec. Read this first.
- `preview-site.html` — content and structure reference. Open in a browser to click through all 14 pages.

## How to start with Claude Code

1. Put both files in an empty project folder
2. Open Claude Code in that folder
3. Paste the kickoff prompt below

## Kickoff prompt

> Read BUILD-BRIEF.md and preview-site.html.
>
> preview-site.html is a content spec, not a visual target. It is a single file with
> all pages duplicated inline. Build this properly in Astro + Tailwind with shared
> components.
>
> Before writing any code: give me a plan covering project structure, component
> breakdown, the shared data file, and the order you will build pages in. Wait for
> my approval before you start building.
>
> Priorities:
> 1. Mobile-first. The phone experience matters more than desktop.
> 2. Schedule and Booking are two separate pages. This is not yet reflected in the
>    preview file — read the brief carefully on this.
> 3. All shared data (schedule, hours, ages, contact info) lives in one file.
>
> Do not add pricing anywhere. Do not use em-dashes in body copy.

## Build order suggestion

1. Project scaffold, design tokens, shared layout/nav/footer components
2. Data file (`src/data/school.ts`)
3. Home
4. Schedule (reference only)
5. Booking (calendar, Mon–Thu only, beginner classes only)
6. Program pages (Little Warriors, Kids, Teens & Adults)
7. Our Story, Meet the Team, Events
8. Facility, Birthday Parties, Parents Night Out
9. Reviews (with live Google feed)
10. FAQ, Contact
11. SEO pass: meta, Open Graph, schema, sitemap
12. Performance pass: images, lazy loading, Lighthouse

## Where the backend fits

The booking form's submit handler is the one piece pending. Nic is connecting
Tarnished Labs. Build the form with a swappable handler so this can be wired without
touching the UI. Immediate SMS on booking is required regardless of which path.
