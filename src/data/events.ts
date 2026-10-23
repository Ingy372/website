// Typed access to src/data/events.json, the single file Jay edits for dated
// events (Parents Night Out, belt testing, demos, camps). Drives the
// "Upcoming Events" lists on /events and /parents-night-out, the PNO hero
// date line, the Home PNO card, and the Event JSON-LD.
//
// Past events are dropped at build time, and UpcomingEvents.astro also hides
// any that pass between deploys, so a stale date never shows. While a list
// is empty, every surface falls back to "ask us for the next date" wording.

import data from "./events.json";
import { business, addressCityLine } from "./business";

export type EventKind = "parents-night-out" | "belt-testing" | "demo" | "other";

export interface DatedEvent {
  kind: EventKind;
  title: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM", 24-hour, Eastern time. */
  startTime: string;
  endTime: string;
  /** As it should read, e.g. "$25 per child". "" hides it. */
  price: string;
  description: string;
  /** Sign-up link. "" falls back to the contact page. */
  bookingLink: string;
}

export const eventDates = (data.events as DatedEvent[]).map((e) => ({
  ...e,
  bookingLink: e.bookingLink || `/contact?interest=${e.kind === "parents-night-out" ? "parents-night-out" : "other"}`,
}));

const today = new Date().toISOString().slice(0, 10);

/** Upcoming events, soonest first. Pass a kind to filter. */
export function upcoming(kind?: EventKind): DatedEvent[] {
  return eventDates
    .filter((e) => (!kind || e.kind === kind) && e.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
}

export const nextParentsNightOut: DatedEvent | null = upcoming("parents-night-out")[0] ?? null;

const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};

/** "Saturday, November 14 · 6:00pm – 9:00pm" */
export function eventWhenText(e: DatedEvent): string {
  const day = new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${day} · ${fmtTime(e.startTime)} – ${fmtTime(e.endTime)}`;
}

/** "2026-11-14", "18:00" → "2026-11-14T18:00:00-05:00" (Eastern, DST-aware). */
function withOffset(date: string, time: string): string {
  const local = `${date}T${time}`;
  const probe = new Date(`${local}:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")!.value; // "GMT-05:00"
  return `${local}:00${name.replace("GMT", "") || "+00:00"}`;
}

const priceNumber = (price: string) => {
  if (/^free$/i.test(price.trim())) return "0";
  const m = price.match(/\$\s*(\d+(?:\.\d{2})?)/);
  return m ? m[1] : null;
};

/** schema.org Event objects for upcoming events (optionally one kind). */
export function eventJsonLd(kind?: EventKind) {
  return upcoming(kind).map((e) => {
    const url = new URL(e.bookingLink, "https://actionzonecma.com").href;
    const amount = e.price ? priceNumber(e.price) : null;
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      description: e.description,
      startDate: withOffset(e.date, e.startTime),
      endDate: withOffset(e.date, e.endTime),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: ["https://actionzonecma.com/og-image.jpg"],
      url,
      location: {
        "@type": "Place",
        name: business.displayName,
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address.street,
          addressLocality: business.address.city,
          addressRegion: business.address.state,
          postalCode: business.address.zip,
          addressCountry: "US",
        },
      },
      organizer: { "@type": "Organization", name: business.displayName, url: "https://actionzonecma.com" },
      ...(amount !== null
        ? { offers: { "@type": "Offer", price: amount, priceCurrency: "USD", url, availability: "https://schema.org/InStock" } }
        : {}),
    };
  });
}

// Kept for any caller that formats the address line on its own.
export const eventAddress = `${business.address.street}, ${addressCityLine}`;
