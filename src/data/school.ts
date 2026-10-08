// Single source of truth for shared school data.
// Business identity (name, address, phone, email, socials, founding year)
// lives in ./business.ts; programs, classes, and hours live in ./schedule.ts.

import { founded } from "./business";
import { ratingText, countText } from "./reviews";

// ---------------------------------------------------------------------------
// Analytics — single source of truth for both IDs. Loaded site-wide via
// BaseLayout > Analytics.astro. Both scripts load async/non-blocking; see
// that component for event wiring (tap-to-call, contact form, booking CTA).
// ---------------------------------------------------------------------------

export const analytics = {
  ga4MeasurementId: "G-51K77M3SNV",
  metaPixelId: "932835404913250",
  // GA4 and the Pixel load only on these hostnames, never on workers.dev
  // previews or localhost, so test traffic never pollutes the data.
  productionHosts: ["actionzonecma.com", "www.actionzonecma.com"],
};

export const trustSignals = [
  `Teaching martial arts since ${founded.year}`,
  `${ratingText} stars across ${countText} Google reviews`,
  "Parents are always welcome to watch class",
];

// The offer is a free week. This is the CTA used sitewide (nav, hero bands,
// CTA sections) and always points to /booking.
export const ctaLabelGeneral = "Claim My Free Week";

// Used only on the booking page itself and anywhere linking directly into
// the calendar step.
export const ctaLabelBooking = "Book My Free Class";

// ---------------------------------------------------------------------------
// Cloudflare Turnstile (spam check on the contact form). The site key is
// public. TODO(JAY: Turnstile site key for actionzonecma.com — create a widget
// in the Cloudflare dashboard and paste its site key here; put its secret in
// TURNSTILE_SECRET_KEY). Until then this is Cloudflare's always-pass test key,
// which a real production secret rejects, so the form fails closed.
// ---------------------------------------------------------------------------

export const turnstileSiteKey = "1x00000000000000000000AA";

// ---------------------------------------------------------------------------
// DojoForge hosted booking widget (Nic, Tarnished Labs) — active booking
// method on /booking. publicKey is a client-safe tenant key (format
// "dfw_..."), not a secret, so it's fine to ship in page markup.
// TODO: swap in the real key once Nic issues it for this tenant.
// ---------------------------------------------------------------------------

export const dojoForge = {
  widgetSrc: "https://actionzone.dojoforge.app/widget.js",
  publicKey: "dfw_GtVzcHdh7-1FV7rKCsii-sTI",
};

// ---------------------------------------------------------------------------
// Navigation — data-driven so Nav.astro and Footer.astro don't hardcode links.
// Student Login points at a placeholder route; the real deep-link destination
// is pending from Nic (Tarnished Labs). TODO: swap studentLoginHref once the
// platform's login/redirect URL is confirmed.
// ---------------------------------------------------------------------------

export const studentLoginHref = "/student-login";

export const nav = {
  programs: [
    { label: "Little Warriors", href: "/little-warriors" },
    { label: "Kids", href: "/kids" },
    { label: "Teens & Adults", href: "/teens-adults" },
  ],
  parties: [
    { label: "Birthday Parties", href: "/birthday-parties" },
    { label: "Parents Night Out", href: "/parents-night-out" },
  ],
  about: [
    { label: "Our Story", href: "/our-story" },
    { label: "Meet the Team", href: "/meet-the-team" },
    { label: "Events", href: "/events" },
    { label: "FAQ", href: "/faq" },
  ],
  primary: [
    { label: "Schedule", href: "/schedule" },
    { label: "Facility", href: "/facility" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ],
};
