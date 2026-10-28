// Single source of truth for dated events: Parents Night Out (and room for
// belt testing / demos). Drives the PNO hero date line, the Home PNO card,
// the PNO card on /events, and the Event JSON-LD. While a list is empty,
// every surface falls back to "ask us for the next date" wording.
//
// Dates are filtered against the build date, so a past event drops off on
// the next deploy — redeploy after each event (or add the next date) so a
// stale date never lingers.

import { business, addressCityLine } from "./business";

export type EventKind = "parents-night-out" | "belt-testing" | "demo";

export interface DatedEvent {
  kind: EventKind;
  /** Local start/end, "YYYY-MM-DDTHH:MM" (America/New_York). */
  start: string;
  end: string;
  /** e.g. "Nerf Night" */
  theme?: string;
  /** e.g. "Ages 4–12" */
  ages?: string;
}

// TODO(JAY: upcoming Parents Night Out dates — start/end time, theme, ages,
// and how families reserve a spot). Add one object per date, e.g.
// { kind: "parents-night-out", start: "2026-11-14T18:00", end: "2026-11-14T21:00", theme: "Nerf Night" }
export const eventDates: DatedEvent[] = [];

export const eventNames: Record<EventKind, string> = {
  "parents-night-out": "Parents Night Out",
  "belt-testing": "Belt Testing",
  demo: "Demonstration",
};

const today = new Date().toISOString().slice(0, 10);

export function upcoming(kind: EventKind): DatedEvent[] {
  return eventDates
    .filter((e) => e.kind === kind && e.end.slice(0, 10) >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export const nextParentsNightOut: DatedEvent | null = upcoming("parents-night-out")[0] ?? null;

const fmtTime = (iso: string) => {
  const [h, m] = iso.slice(11, 16).split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};

/** "Saturday, November 14 · 6:00pm – 9:00pm" */
export function eventWhenText(e: DatedEvent): string {
  const day = new Date(`${e.start.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${day} · ${fmtTime(e.start)} – ${fmtTime(e.end)}`;
}

/** "2026-11-14T18:00" → "2026-11-14T18:00:00-05:00" (Eastern, DST-aware). */
function withOffset(local: string): string {
  const probe = new Date(`${local}:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")!.value; // "GMT-05:00"
  return `${local}:00${name.replace("GMT", "") || "+00:00"}`;
}

/** schema.org Event objects for every upcoming date of a kind. */
export function eventJsonLd(kind: EventKind, pageUrl: string) {
  return upcoming(kind).map((e) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.theme ? `${eventNames[kind]}: ${e.theme}` : eventNames[kind],
    startDate: withOffset(e.start),
    endDate: withOffset(e.end),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: pageUrl,
    location: {
      "@type": "Place",
      name: business.displayName,
      address: `${business.address.street}, ${addressCityLine}`,
    },
    organizer: { "@type": "Organization", name: business.displayName, url: "https://actionzonecma.com" },
  }));
}
