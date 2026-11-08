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
  { label: "When", value: "The 4th Friday of each month (November and December move earlier for the holidays)" },
  { label: "What time", value: "6:00pm to 10:00pm" },
  { label: "Ages", value: "5 and up" },
  { label: "Food", value: "Included, and it changes every event. Sometimes pizza, sometimes hot dogs and chips, fruit spreads, and other yummies." },
  { label: "What to bring", value: "A water bottle, a snack if your child is a picky eater, and an optional pillow and blanket for movie time" },
  { label: "Spots", value: "Only 16 spots per night, so reserve early" },
  { label: "How to reserve", value: "Send a request through our website or call (910) 429-2467" },
];

/** 2027 Parents Night Out themes, one per month (confirmed by Jay). */
export const parentsNightOutThemes2027 = [
  { month: "January", theme: "Glow Party" },
  { month: "February", theme: "Nerf Night" },
  { month: "March", theme: "Ninja Night" },
  { month: "April", theme: "Superhero Night" },
  { month: "May", theme: "Painting & Tie-Dye Night" },
  { month: "June", theme: "Summer Night" },
  { month: "July", theme: "Christmas in July" },
  { month: "August", theme: "Nerf Night" },
  { month: "September", theme: "VBS Night" },
  { month: "October", theme: "Science Night" },
  { month: "November", theme: "Mystery Detectives" },
  { month: "December", theme: "Christmas Night" },
];
