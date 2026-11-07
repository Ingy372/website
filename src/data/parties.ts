// Birthday party and Parents Night Out facts: the "at a glance" blocks on
// /birthday-parties and /parents-night-out. PNO *dates* live in events.ts.
// Party pricing is confirmed by Jay and shown on /birthday-parties (an
// exception to the brief's no-pricing rule). Unconfirmed values are todo()
// and are left off the page until filled in.

import { todo } from "./business";

export interface Fact {
  label: string;
  value: string;
}

export const birthdayPartyFacts: Fact[] = [
  { label: "Ages", value: todo("birthday party ages") },
  { label: "Party length", value: "1 hour ($100) or 2 hours ($200)" },
  { label: "Guests", value: "Up to 10 kids included, plus $10 for each child over 10" },
  { label: "When", value: todo("days and times parties can be booked") },
  { label: "Book ahead", value: todo("how far in advance to book") },
  { label: "You bring", value: "The cake, decorations, food and drinks, and plates, napkins, and utensils. You set up your party area." },
  { label: "We handle", value: "Running the party, cutting and serving the cake, serving the food, and cleanup afterward." },
];

export const parentsNightOutFacts: Fact[] = [
  { label: "Ages", value: "5 and up" },
  { label: "When", value: "Usually the fourth Friday of the month" },
  { label: "Usual hours", value: todo("usual PNO drop-off and pick-up times") },
  // Themes named in the existing page copy.
  { label: "Themes", value: "Nerf Night, Superhero Dress-Up, Water Wars, and more" },
  { label: "Food", value: "Changes with each night's theme. Kids are welcome to bring their own snack." },
  { label: "What to bring", value: todo("what kids should bring") },
  { label: "Reserve a spot", value: "Request a spot on the website or give us a call. Each night is capped at 16 kids." },
];
