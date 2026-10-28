// Single source of truth for shared school data.
// Business identity (name, address, phone, email, socials, founding year)
// lives in ./business.ts; programs, classes, and hours live in ./schedule.ts.

import { founded, todo, isTodo as s_isTodo } from "./business";
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

// ---------------------------------------------------------------------------
// The new-family offer. ONE wording everywhere: nav/hero/CTA buttons,
// headlines, FAQ answers, meta descriptions, and the booking page all build
// their text from `offer`. The Dojo Forge widget's own text is set in its
// admin; match it there by hand.
// ---------------------------------------------------------------------------

/**
 * The offer is a free trial week (confirmed by Jay).
 * noun "free trial week" · cta button label · first "trial week" (as in
 * "Your trial week is free") · visit "a trial week of classes" · bookingTitle.
 */
export const offer = {
  noun: "free trial week",
  cta: "Claim My Free Trial Week",
  /** Compact button label, e.g. the mobile sticky bar. */
  short: "Free Trial Week",
  first: "trial week",
  visit: "a trial week of classes",
  bookingTitle: "Book Your Free Trial Week",
};

// ---------------------------------------------------------------------------
// Tuition. House rule (Jay, Oct 2026): never show tuition or prices on the
// site. The FAQ answer below always points people to the free trial week.
// ---------------------------------------------------------------------------

/** The "How much does it cost?" FAQ entry (FAQ page and program pages). */
export function tuitionFaqItem() {
  return {
    question: "How much does it cost?",
    answer: [
      `Your first week is free, so you can see a class before you pay anything. We will go over tuition and every option in person, with no pressure, during your ${offer.noun}.`,
      "Want to talk it over before you come in? Give us a call.",
    ],
  };
}

/**
 * Military discount wording for /military-families, e.g. "10% off tuition
 * for active duty, veteran, and military spouse families". TODO(JAY: is
 * there a military discount? Fill in, or set to "" if none.) Hidden until set.
 */
// There is no military discount (confirmed by Jay, Oct 2026). Keep this empty.
export const militaryDiscount = "";


// ---------------------------------------------------------------------------
// Ownership verification meta tags, rendered in every page <head> only when
// set. TODO(JAY: verification tokens) — paste each content="" value, or leave
// null for any service verified by DNS record instead.
// ---------------------------------------------------------------------------

export const siteVerification: Record<"google-site-verification" | "msvalidate.01" | "facebook-domain-verification", string | null> = {
  "google-site-verification": null, // Google Search Console
  "msvalidate.01": null, // Bing Webmaster Tools
  "facebook-domain-verification": null, // Meta Business Manager
};

// ---------------------------------------------------------------------------
// Cloudflare Turnstile (spam check on the contact form). The site key is
// public. Widget "Action Zone contact form" (Cloudflare dashboard →
// Turnstile). Its secret goes in the Worker secret TURNSTILE_SECRET_KEY
// (dashboard only, never in git).
// ---------------------------------------------------------------------------

export const turnstileSiteKey = "0x4AAAAAAFlSsSsO5psaCXe0";

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
// Family Login (training videos) is intentionally NOT in the nav or footer
// until accounts roll out; see src/pages/family-login.astro.
// ---------------------------------------------------------------------------

export const familyLoginHref = "/family-login";

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
  styles: [
    { label: "Karate", href: "/karate" },
    { label: "Jiu Jitsu", href: "/jiu-jitsu" },
    { label: "Self-Defense", href: "/self-defense" },
  ],
  areas: [
    { label: "Hope Mills", href: "/hope-mills" },
    { label: "Rockfish & Jack Britt", href: "/rockfish-jack-britt" },
    { label: "Fayetteville", href: "/fayetteville" },
    { label: "Fort Bragg Military Families", href: "/military-families" },
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
