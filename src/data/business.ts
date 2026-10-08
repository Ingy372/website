// Single source of truth for business identity: names, address, phone,
// email, socials, and the founding year. Every page/component imports these
// rather than hardcoding them, so a correction here is a one-line fix.
//
// Any value still marked TODO(JAY: ...) renders that marker on the page on
// purpose, so an unconfirmed fact can't quietly ship. `npm run check:todos`
// (after a build) lists every one still present in the output.

export const todo = (note: string) => `TODO(JAY: ${note})`;

// TODO(JAY: 1993 vs ~1996) — set to the confirmed year (a number). Every
// "since …", "… years", and "… decades" string on the site is computed from it.
export const FOUNDED_YEAR: number | null = null;

// TODO(JAY: confirm "Philippi" vs "Phillipi" spelling) — the street name only.
const STREET_NAME = todo("confirm Philippi vs Phillipi spelling");

export const business = {
  displayName: "Action Zone, CMA",
  legalName: "CMA Martial Arts, Inc.",
  address: {
    street: `6105 ${STREET_NAME} Church Rd.`,
    city: "Raeford",
    state: "NC",
    stateName: "North Carolina",
    zip: "28376",
  },
  phone: "(910) 429-2467",
  phoneHref: "tel:+19104292467",
  // Temporary — will become a branded address (e.g. info@actionzonecma.com).
  email: "jay.lindemuth@gmail.com",
  socials: {
    facebook: "https://www.facebook.com/cmamtma/",
    instagram: "https://www.instagram.com/yeshuas_ryu/",
  },
  // TODO(JAY: Google Business Profile links). Until then both fall back to a
  // Google search, which works but isn't the listing itself.
  //  - googleReviewsUrl: the Maps listing (Share → copy link on the profile).
  //  - googleWriteReviewUrl: the "Ask for reviews" link from the GBP dashboard
  //    (https://g.page/r/<id>/review).
  googleReviewsUrl: "https://www.google.com/search?q=Action+Zone+CMA+Raeford",
  googleWriteReviewUrl: "https://www.google.com/search?q=Action+Zone+CMA+Raeford",
};

// ---------------------------------------------------------------------------
// Team — names, titles, and the #anchor slug for each bio on /meet-the-team.
// ---------------------------------------------------------------------------

export const team = {
  founder: { name: "Michael Lowery", title: "Founder", honorific: "Shinan", slug: "michael-lowery" },
  headInstructor: { name: "Jayson Lindemuth", title: "Head Instructor", slug: "jayson-lindemuth" },
  // TODO(JAY: confirm Hannah's title/role) — shown on /meet-the-team and in its meta description.
  officeManager: { name: "Hannah Minter", title: todo("confirm Hannah's title/role, shown as Office Manager"), slug: "hannah-minter" },
};

// TODO(JAY: does Michael still teach classes?) — true or false. /our-story
// says "He is still teaching in it" while /meet-the-team says the school is
// now in Jayson's hands. null renders a TODO marker in that sentence.
export const FOUNDER_STILL_TEACHES: boolean | null = null;

// TODO(JAY: youngest age a child can join the Teens & Adults class to train
// alongside a parent) — the FAQ said 12, the program page says 13+.
export const PARENT_CHILD_TRAINING_AGE: number | null = null;

export const addressCityLine = `${business.address.city}, ${business.address.state} ${business.address.zip}`;
export const addressFull = `${business.address.street}, ${addressCityLine}`;
export const cityState = `${business.address.city}, ${business.address.state}`;

// ---------------------------------------------------------------------------
// Founding-year derived strings. Computed at build time, so the counts roll
// forward on the next deploy after New Year's.
// ---------------------------------------------------------------------------

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function numberToWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const tens = TENS[Math.floor(n / 10)];
    return n % 10 ? `${tens}-${ONES[n % 10]}` : tens;
  }
  return String(n);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const FOUNDED_TODO = todo("FOUNDED_YEAR");

export const yearsOpen: number | null =
  FOUNDED_YEAR === null ? null : new Date().getFullYear() - FOUNDED_YEAR;

export const founded = {
  /** "1993" */
  year: FOUNDED_YEAR === null ? FOUNDED_TODO : String(FOUNDED_YEAR),
  /** "33" */
  yearsNumeral: yearsOpen === null ? FOUNDED_TODO : String(yearsOpen),
  /** "thirty-three" */
  yearsWords: yearsOpen === null ? FOUNDED_TODO : numberToWords(yearsOpen),
  /** "Thirty-three" */
  yearsWordsCap: yearsOpen === null ? FOUNDED_TODO : capitalize(numberToWords(yearsOpen)),
  /** "three decades" */
  decades: yearsOpen === null ? FOUNDED_TODO : `${numberToWords(Math.floor(yearsOpen / 10))} decades`,
  /** "Three decades" */
  decadesCap: yearsOpen === null ? FOUNDED_TODO : `${capitalize(numberToWords(Math.floor(yearsOpen / 10)))} decades`,
};
