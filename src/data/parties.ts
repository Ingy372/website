// Birthday party and Parents Night Out facts: the "at a glance" blocks on
// /birthday-parties and /parents-night-out. PNO *dates* live in events.ts.
// No prices anywhere (BUILD-BRIEF: no pricing on the site). Unconfirmed
// values are TODO(JAY) and render as markers until filled in.

import { todo } from "./business";

export interface Fact {
  label: string;
  value: string;
}

export const birthdayPartyFacts: Fact[] = [
  { label: "Ages", value: todo("birthday party ages") },
  { label: "Party length", value: todo("how long a party runs") },
  { label: "Guests", value: todo("maximum number of kids") },
  { label: "When", value: todo("days and times parties can be booked") },
  { label: "Book ahead", value: todo("how far in advance to book") },
  // From the existing page copy: "You bring the cake and the kids."
  { label: "You bring", value: "The cake and the kids. We handle setup and cleanup." },
  { label: "Food and drinks", value: todo("what food and drinks families may bring or serve") },
];

export const parentsNightOutFacts: Fact[] = [
  { label: "Ages", value: todo("PNO ages") },
  { label: "Usual hours", value: todo("usual PNO drop-off and pick-up times") },
  // Themes named in the existing page copy.
  { label: "Themes", value: "Nerf Night, Superhero Dress-Up, Water Wars, and more" },
  { label: "Food", value: todo("is dinner or a snack provided") },
  { label: "What to bring", value: todo("what kids should bring") },
  { label: "Reserve a spot", value: todo("how families reserve, and whether spots are limited") },
];
