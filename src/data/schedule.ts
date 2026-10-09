// Single source of truth for programs, the weekly class grid, building hours,
// and trial-visit days. Drives /schedule, the program age labels, the footer
// and /contact hours, the LocalBusiness JSON-LD hours, and the FAQ class
// durations. Times are 24h "HH:MM"; every display string is derived.
//
// Values come from the confirmed schedule in BUILD-BRIEF.md. The Dojo Forge
// booking widget keeps its own copy of class times/names in its admin — keep
// the two in sync by hand when anything here changes.

import { numberToWords } from "./business";

export type Level = "beginner" | "intermediate" | "advanced";
export type ProgramId = "littleWarriors" | "kids" | "teensAdults";
export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface Program {
  name: string;
  href: string;
  minAge: number;
  maxAge: number | null;
}

export const programs: Record<ProgramId, Program> = {
  littleWarriors: { name: "Little Warriors", href: "/little-warriors", minAge: 3, maxAge: 5 },
  kids: { name: "Kids", href: "/kids", minAge: 6, maxAge: 12 },
  teensAdults: { name: "Teens & Adults", href: "/teens-adults", minAge: 13, maxAge: null },
};

/** "3–5" / "13+" */
export const ageRange = (p: Program) => (p.maxAge === null ? `${p.minAge}+` : `${p.minAge}–${p.maxAge}`);
/** "Ages 3–5" */
export const ageLabel = (p: Program) => `Ages ${ageRange(p)}`;
/** Youngest age any program accepts, e.g. 3. */
export const minimumAge = Math.min(...Object.values(programs).map((p) => p.minAge));

// ---------------------------------------------------------------------------
// Time formatting
// ---------------------------------------------------------------------------

function parts(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return { h, m, suffix: h < 12 ? "am" : "pm", h12: h % 12 === 0 ? 12 : h % 12 };
}

const clock = (hhmm: string) => {
  const { h12, m } = parts(hhmm);
  return `${h12}:${String(m).padStart(2, "0")}`;
};

/** "4:00 – 4:45pm", or "10:00am – 12:00pm" when the halves differ. */
export function formatRange(start: string, end: string, { bothSuffixes = false } = {}) {
  const a = parts(start);
  const b = parts(end);
  const startText = bothSuffixes || a.suffix !== b.suffix ? `${clock(start)}${a.suffix}` : clock(start);
  return `${startText} – ${clock(end)}${b.suffix}`;
}

export const minutesBetween = (start: string, end: string) => {
  const a = parts(start);
  const b = parts(end);
  return b.h * 60 + b.m - (a.h * 60 + a.m);
};

/** 45 → "forty-five minutes", 60 → "a full hour" */
export const durationText = (minutes: number) =>
  minutes === 60 ? "a full hour" : `${numberToWords(minutes)} minutes`;

// ---------------------------------------------------------------------------
// Weekly class grid
// ---------------------------------------------------------------------------

interface SessionDef {
  id: string;
  name: string;
  program: ProgramId;
  level: Level;
  /** Black Belt Club and Masters Club are joined by instructor invitation only. */
  inviteOnly: boolean;
  start: string;
  end: string;
}

const mondayWednesday: SessionDef[] = [
  { id: "little-warriors", name: "Little Warriors", program: "littleWarriors", level: "beginner", inviteOnly: false, start: "16:00", end: "16:45" },
  { id: "basic-club", name: "Basic Club", program: "kids", level: "beginner", inviteOnly: false, start: "17:00", end: "18:00" },
  { id: "black-belt-club", name: "Black Belt Club", program: "kids", level: "intermediate", inviteOnly: true, start: "18:00", end: "19:00" },
  { id: "masters-kids", name: "Masters Club, Kids", program: "kids", level: "advanced", inviteOnly: true, start: "19:00", end: "20:00" },
  { id: "masters-teen-adult", name: "Masters Club, Teens & Adults", program: "teensAdults", level: "advanced", inviteOnly: true, start: "20:00", end: "21:00" },
];

const tuesdayThursday: SessionDef[] = [
  { id: "masters-kids", name: "Masters Club, Kids", program: "kids", level: "advanced", inviteOnly: true, start: "16:00", end: "17:00" },
  { id: "black-belt-kids", name: "Black Belt Club, Kids", program: "kids", level: "intermediate", inviteOnly: true, start: "17:00", end: "18:00" },
  { id: "basic-club-kids", name: "Basic Club, Kids", program: "kids", level: "beginner", inviteOnly: false, start: "18:00", end: "19:00" },
  { id: "basic-club-teen-adult", name: "Basic Club, Teens & Adults", program: "teensAdults", level: "beginner", inviteOnly: false, start: "19:00", end: "20:00" },
  { id: "black-belt-teen-adult", name: "Black Belt Club, Teens & Adults", program: "teensAdults", level: "intermediate", inviteOnly: true, start: "20:00", end: "21:00" },
];

export const openTraining = {
  day: "Saturday" as Weekday,
  start: "10:00",
  end: "12:00",
  description: "All ages, all ranks. Open mat, makeup classes, and testing.",
  note: "Not bookable for trials.",
};
export const openTrainingTime = formatRange(openTraining.start, openTraining.end);

export interface ClassSession extends SessionDef {
  time: string;
  ageLabel: string;
  minutes: number;
}

export interface WeeklyScheduleDay {
  day: Weekday;
  classes: ClassSession[];
  closed?: boolean;
  openTraining?: { timeRange: string; description: string; note: string };
}

const expand = (defs: SessionDef[]): ClassSession[] =>
  defs.map((d) => ({
    ...d,
    time: formatRange(d.start, d.end),
    ageLabel: ageLabel(programs[d.program]),
    minutes: minutesBetween(d.start, d.end),
  }));

export const weeklySchedule: WeeklyScheduleDay[] = [
  { day: "Monday", classes: expand(mondayWednesday) },
  { day: "Tuesday", classes: expand(tuesdayThursday) },
  { day: "Wednesday", classes: expand(mondayWednesday) },
  { day: "Thursday", classes: expand(tuesdayThursday) },
  { day: "Friday", classes: [], closed: true },
  {
    day: "Saturday",
    classes: [],
    openTraining: { timeRange: openTrainingTime, description: openTraining.description, note: openTraining.note },
  },
];

/** Length of a program's regular classes, e.g. "forty-five minutes". */
export function programClassLength(program: ProgramId) {
  const lengths = new Set(
    weeklySchedule.flatMap((d) => d.classes).filter((c) => c.program === program).map((c) => c.minutes)
  );
  return [...lengths].map(durationText).join(" or ");
}

// ---------------------------------------------------------------------------
// Building hours
// ---------------------------------------------------------------------------

export const buildingHours = [
  { label: "Mon–Thu", days: ["Monday", "Tuesday", "Wednesday", "Thursday"] as Weekday[], opens: "15:00", closes: "21:00" },
  { label: "Saturday", days: ["Saturday"] as Weekday[], opens: "10:00", closes: "12:00" },
];
export const closedDays = { label: "Fri & Sun", days: ["Friday", "Sunday"] as Weekday[] };

export const hours = {
  summary: [
    ...buildingHours.map((h) => ({ days: h.label, time: formatRange(h.opens, h.closes, { bothSuffixes: true }) })),
    { days: closedDays.label, time: "Closed" },
  ],
};

/** schema.org openingHoursSpecification for the LocalBusiness JSON-LD. */
export const openingHoursSpecification = buildingHours.map((h) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: h.days,
  opens: h.opens,
  closes: h.closes,
}));

// ---------------------------------------------------------------------------
// Trial visits — the days Hannah (Office Manager) is in to walk a new family
// through enrollment in person. Mirrors the Dojo Forge widget's bookable days.
// ---------------------------------------------------------------------------

export const trialDays: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday"];
/** "Monday through Thursday" */
export const trialDaysText = `${trialDays[0]} through ${trialDays[trialDays.length - 1]}`;

// Beginner classes on trial days, grouped by the Mon/Wed and Tue/Thu
// pattern. Only used by the retired BookingFlow component.
const bookable = (defs: SessionDef[], key: string) =>
  expand(defs)
    .filter((c) => !c.inviteOnly)
    .map((c) => ({ id: `book-${key}-${c.id}`, name: c.name, ageLabel: c.ageLabel, time: c.time }));

export const bookableClasses = {
  monday: bookable(mondayWednesday, "mon"),
  tuesday: bookable(tuesdayThursday, "tue"),
};

// ---------------------------------------------------------------------------
// Beginner (open-enrollment) class times per program, grouped by matching
// time, e.g. Kids → [{ days: "Mon & Wed", time: "5:00 – 6:00pm" }, …].
// Used by the program "at a glance" blocks and /booking?program=.
// ---------------------------------------------------------------------------

const SHORT_DAY: Record<Weekday, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

export function beginnerTimes(program: ProgramId): { days: string; time: string }[] {
  const byTime = new Map<string, Weekday[]>();
  for (const day of weeklySchedule) {
    for (const c of day.classes) {
      if (c.program !== program || c.inviteOnly) continue;
      byTime.set(c.time, [...(byTime.get(c.time) ?? []), day.day]);
    }
  }
  return [...byTime].map(([time, days]) => ({ days: days.map((d) => SHORT_DAY[d]).join(" & "), time }));
}

export const programIds = Object.keys(programs) as ProgramId[];

// ---------------------------------------------------------------------------
// Holiday / special closures (src/data/closures.json). Filtered against the
// build date, so a past closure drops off on the next deploy.
// ---------------------------------------------------------------------------

import closureData from "./closures.json";

export interface Closure {
  start: string;
  end?: string;
  name: string;
}

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/** "Thu, Nov 26" or "Wed, Dec 24 – Fri, Jan 1" */
export const closureDatesText = (c: Closure) => (c.end && c.end !== c.start ? `${fmtDay(c.start)} – ${fmtDay(c.end)}` : fmtDay(c.start));

const buildDay = new Date().toISOString().slice(0, 10);
export const upcomingClosures: Closure[] = (closureData.closures as Closure[])
  .filter((c) => (c.end ?? c.start) >= buildDay)
  .sort((a, b) => a.start.localeCompare(b.start));
