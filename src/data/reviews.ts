// Typed access to reviews.json — the single source for review cards, pull
// quotes, and the rating/count summary on Home, the program pages, and
// /reviews. Text must be the reviewer's words verbatim; an `excerpt` may only
// trim, joining verbatim fragments with "…" (checked at build time below).

import data from "./reviews.json";
import { todo } from "./business";

export interface Review {
  id: string;
  author: string;
  relationship: "Parent" | "Student" | "Former instructor";
  source: "Google";
  /** ISO date the review was posted, or null if not yet recorded. */
  date: string | null;
  rating: number;
  text: string;
  excerpt?: string;
  /** Set while a review's attribution is unconfirmed; renders a TODO(JAY) beside the name. */
  verify?: string;
}

export const reviewSummary = data.summary;
export const reviews = data.reviews as Review[];

for (const r of reviews) {
  for (const fragment of r.excerpt?.split("…") ?? []) {
    if (!r.text.includes(fragment.trim())) {
      throw new Error(`reviews.json: excerpt for "${r.id}" is not verbatim from its text: "${fragment.trim()}"`);
    }
  }
}

export function getReview(id: string): Review {
  const review = reviews.find((r) => r.id === id);
  if (!review) throw new Error(`reviews.json: no review with id "${id}"`);
  return review;
}

/** Reviewer name as shown on the site; carries a TODO(JAY) marker while unverified. */
export const displayAuthor = (r: Review) => (r.verify ? `${r.author} ${todo(r.verify)}` : r.author);

/** "5.0" */
export const ratingText = reviewSummary.rating.toFixed(1);
/** "80+" */
export const countText = reviewSummary.countLabel;

export const reviewDateText = (r: Review) =>
  r.date ? new Date(r.date).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) : null;
