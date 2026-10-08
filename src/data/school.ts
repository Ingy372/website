// Single source of truth for shared school data.
// Every page/component should import from here rather than hardcoding
// schedule, hours, ages, or contact info.

export type Level = "beginner" | "intermediate" | "advanced";
export type AgeGroup = "3-5" | "6-12" | "teen-adult";

export interface ClassSession {
  id: string;
  name: string;
  ageLabel: string;
  ageGroup: AgeGroup;
  level: Level;
  inviteOnly: boolean;
  time: string;
}

export interface OpenTraining {
  timeRange: string;
  description: string;
  note: string;
}

export interface WeeklyScheduleDay {
  day: string;
  classes: ClassSession[];
  closed?: boolean;
  openTraining?: OpenTraining;
}

export const ages = {
  littleWarriors: { label: "Little Warriors", range: "3–5", ageGroup: "3-5" as AgeGroup },
  kids: { label: "Kids", range: "6–12", ageGroup: "6-12" as AgeGroup },
  teensAdults: { label: "Teens & Adults", range: "13+", ageGroup: "teen-adult" as AgeGroup },
};

export const hours = {
  monThu: "3:00pm – 9:00pm",
  sat: "10:00am – 12:00pm",
  closed: ["Friday", "Sunday"],
  summary: [
    { days: "Mon–Thu", time: "3:00pm – 9:00pm" },
    { days: "Saturday", time: "10:00am – 12:00pm" },
    { days: "Fri & Sun", time: "Closed" },
  ],
};

// ---------------------------------------------------------------------------
// Analytics — single source of truth for both IDs. Loaded site-wide via
// BaseLayout > Analytics.astro. Both scripts load async/non-blocking; see
// that component for event wiring (tap-to-call, contact form, booking CTA).
// ---------------------------------------------------------------------------

export const analytics = {
  ga4MeasurementId: "G-51K77M3SNV",
  metaPixelId: "932835404913250",
};

export const contact = {
  businessName: "Action Zone, CMA",
  legalName: "CMA Martial Arts, Inc.",
  address: {
    line1: "6105 Phillipi Church Rd.",
    city: "Raeford",
    state: "NC",
    zip: "28376",
  },
  addressFull: "6105 Phillipi Church Rd., Raeford, NC 28376",
  phone: "(910) 429-2467",
  phoneHref: "tel:9104292467",
  // Temporary — will become a branded address (e.g. info@actionzonecma.com).
  // Kept here as a single line so swapping it later is a one-line change.
  email: "jay.lindemuth@gmail.com",
  founded: 1993,
  socials: {
    facebook: "https://www.facebook.com/cmamtma/",
    instagram: "https://www.instagram.com/yeshuas_ryu/",
  },
};

export const reviews = {
  rating: 5.0,
  count: "80+",
  googleSearchUrl: "https://www.google.com/search?q=Action+Zone+CMA+Raeford",
};

export const trustSignals = [
  "Teaching martial arts since 1993",
  "5.0 stars across 80+ Google reviews",
  "Parents are always welcome to watch class",
];

// The offer is a free week. This is the CTA used sitewide (nav, hero bands,
// CTA sections) and always points to /booking.
export const ctaLabelGeneral = "Claim My Free Week";

// Used only on the booking page itself and anywhere linking directly into
// the calendar step.
export const ctaLabelBooking = "Book My Free Class";

// ---------------------------------------------------------------------------
// Full weekly schedule — source of truth for /schedule. Reference only there;
// no booking controls on that page. Grouped by individual day (Monday
// through Saturday) so the timetable reads as a plain weekly grid.
// ---------------------------------------------------------------------------

const mondayWednesdayClasses: ClassSession[] = [
  {
    id: "little-warriors",
    name: "Little Warriors",
    ageLabel: "Ages 3–5",
    ageGroup: "3-5",
    level: "beginner",
    inviteOnly: false,
    time: "4:00 – 4:45pm",
  },
  {
    id: "basic-club",
    name: "Basic Club",
    ageLabel: "Ages 6–12",
    ageGroup: "6-12",
    level: "beginner",
    inviteOnly: false,
    time: "5:00 – 6:00pm",
  },
  {
    id: "black-belt-club",
    name: "Black Belt Club",
    ageLabel: "Ages 6–12",
    ageGroup: "6-12",
    level: "intermediate",
    inviteOnly: true,
    time: "6:00 – 7:00pm",
  },
  {
    id: "masters-kids",
    name: "Masters Club, Kids",
    ageLabel: "Ages 6–12",
    ageGroup: "6-12",
    level: "advanced",
    inviteOnly: true,
    time: "7:00 – 8:00pm",
  },
  {
    id: "masters-teen-adult",
    name: "Masters Club, Teens & Adults",
    ageLabel: "Ages 13+",
    ageGroup: "teen-adult",
    level: "advanced",
    inviteOnly: true,
    time: "8:00 – 9:00pm",
  },
];

const tuesdayThursdayClasses: ClassSession[] = [
  {
    id: "masters-kids",
    name: "Masters Club, Kids",
    ageLabel: "Ages 6–12",
    ageGroup: "6-12",
    level: "advanced",
    inviteOnly: true,
    time: "4:00 – 5:00pm",
  },
  {
    id: "black-belt-kids",
    name: "Black Belt Club, Kids",
    ageLabel: "Ages 6–12",
    ageGroup: "6-12",
    level: "intermediate",
    inviteOnly: true,
    time: "5:00 – 6:00pm",
  },
  {
    id: "basic-club-kids",
    name: "Basic Club, Kids",
    ageLabel: "Ages 6–12",
    ageGroup: "6-12",
    level: "beginner",
    inviteOnly: false,
    time: "6:00 – 7:00pm",
  },
  {
    id: "basic-club-teen-adult",
    name: "Basic Club, Teens & Adults",
    ageLabel: "Ages 13+",
    ageGroup: "teen-adult",
    level: "beginner",
    inviteOnly: false,
    time: "7:00 – 8:00pm",
  },
  {
    id: "black-belt-teen-adult",
    name: "Black Belt Club, Teens & Adults",
    ageLabel: "Ages 13+",
    ageGroup: "teen-adult",
    level: "intermediate",
    inviteOnly: true,
    time: "8:00 – 9:00pm",
  },
];

export const weeklySchedule: WeeklyScheduleDay[] = [
  { day: "Monday", classes: mondayWednesdayClasses },
  { day: "Tuesday", classes: tuesdayThursdayClasses },
  { day: "Wednesday", classes: mondayWednesdayClasses },
  { day: "Thursday", classes: tuesdayThursdayClasses },
  { day: "Friday", classes: [], closed: true },
  {
    day: "Saturday",
    classes: [],
    openTraining: {
      timeRange: "10:00am – 12:00pm",
      description: "All ages, all ranks. Open mat, makeup classes, and testing.",
      note: "Not bookable for trials.",
    },
  },
];

// ---------------------------------------------------------------------------
// Bookable classes — /booking exclusively. Beginner classes only, and only on
// the two weekdays Hannah (Office Manager) is in the office. Black Belt Club
// and Masters Club must never appear here: those are joined by invitation,
// not selected by a new family.
// ---------------------------------------------------------------------------

export interface BookableClass {
  id: string;
  name: string;
  ageLabel: string;
  time: string;
}

export const bookableClasses: Record<"monday" | "tuesday", BookableClass[]> = {
  monday: [
    { id: "book-mon-little-warriors", name: "Little Warriors", ageLabel: "Ages 3–5", time: "4:00 – 4:45pm" },
    { id: "book-mon-basic-club", name: "Basic Club", ageLabel: "Ages 6–12", time: "5:00 – 6:00pm" },
  ],
  tuesday: [
    { id: "book-tue-basic-club-kids", name: "Basic Club Kids", ageLabel: "Ages 6–12", time: "6:00 – 7:00pm" },
    { id: "book-tue-basic-club-teen-adult", name: "Basic Club Teens & Adults", ageLabel: "Ages 13+", time: "7:00 – 8:00pm" },
  ],
};

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
