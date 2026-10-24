// Single source of truth for business identity: names, address, phone,
// email, socials, and the founding year. Every page/component imports these
// rather than hardcoding them, so a correction here is a one-line fix.
//
// An unconfirmed value is marked todo("...") so the reminder lives with the
// data. Renderers skip any value where isTodo() is true, so nothing
// unconfirmed shows on the page; fill the value in and it appears.
// `npm run check:todos` (after a build) lists any marker that still leaks.

export const todo = (note: string) => `TODO(JAY: ${note})`;
export const isTodo = (value: string) => value.startsWith("TODO(JAY");

// Every "since …", "… years", and "… decades" string on the site is computed from this.
export const FOUNDED_YEAR = 1993;
// Founded late in 1993, so a full year is only counted once this month passes
// (32 years until December 2026). Month assumed (December); not yet confirmed.
export const FOUNDED_MONTH = 12;

export const business = {
  displayName: "Action Zone CMA",
  legalName: "CMA Martial Arts, Inc.",
  address: {
    street: "6105 Philippi Church Rd",
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
  // Google Business Profile (place ID ChIJk5pfjKs_q4kRsLJlYEa7fjw, CID
  // 4359127400280601264), looked up from the live listing on 2026-10-23.
  //  - googleReviewsUrl: the listing on Google Maps.
  //  - googleWriteReviewUrl: opens the "write a review" box directly. Google's
  //    short "Ask for reviews" link (Business Profile → Ask for reviews,
  //    https://g.page/r/<id>/review) does the same thing; paste it here to swap.
  googleReviewsUrl: "https://www.google.com/maps?cid=4359127400280601264",
  googleWriteReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJk5pfjKs_q4kRsLJlYEa7fjw",
  /** Map pin from the Google Business Profile. */
  geo: { latitude: 34.9764935, longitude: -79.0828535 },
};

// ---------------------------------------------------------------------------
// Team — names, titles, and the #anchor slug for each bio on /meet-the-team.
// ---------------------------------------------------------------------------

export const team = {
  founder: { name: "Michael Lowery", title: "Founder", honorific: "Shinan", slug: "michael-lowery" },
  headInstructor: { name: "Jayson Lindemuth", title: "Head Instructor", slug: "jayson-lindemuth" },
  officeManager: { name: "Hannah Minter", title: "Office Manager", slug: "hannah-minter" },
};

export const addressCityLine = `${business.address.city}, ${business.address.state} ${business.address.zip}`;
export const addressFull = `${business.address.street}, ${addressCityLine}`;
export const cityState = `${business.address.city}, ${business.address.state}`;

// ---------------------------------------------------------------------------
// Service area. One list for the homepage, footer, contact page, FAQ, and the
// schema.org areaServed. Ordered from the dojo outward.
// ---------------------------------------------------------------------------

export const serviceArea = ["Raeford", "Rockfish", "Jack Britt", "Hope Mills", "Fort Bragg", "Fayetteville"];
/** "Raeford, Rockfish, Jack Britt, Hope Mills, Fort Bragg, and Fayetteville" */
export const serviceAreaText = `${serviceArea.slice(0, -1).join(", ")}, and ${serviceArea[serviceArea.length - 1]}`;

// ---------------------------------------------------------------------------
// Directions block (/contact, /facility) and the FAQ drive-time answer.
// ---------------------------------------------------------------------------

export const directions = {
  driveTimes: [
    // From the existing FAQ copy ("roughly twenty-five minutes from Fayetteville").
    { from: "Fayetteville", time: "about 25 minutes", timeWords: "roughly twenty-five minutes" },
    { from: "Hope Mills", time: todo("drive time from Hope Mills"), timeWords: todo("drive time from Hope Mills") },
  ],
  parking: todo("where families park"),
  entrance: todo("which door to use, and where parents wait or watch"),
  landmark: todo("anything that helps people find the turn, e.g. a sign or landmark; delete if none"),
  // TODO(JAY: photo of the building as you pull in) — add it under
  // src/images/facility/ and show it in Directions.astro.
  hasBuildingPhoto: false,
};

/** Google Maps turn-by-turn directions to the dojo. */
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressFull)}`;
/** The dojo on Google Maps. */
export const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.displayName}, ${addressFull}`)}`;

// ---------------------------------------------------------------------------
// Founding-year derived strings. Computed at build time, so the counts roll
// forward on the next deploy after the founding anniversary.
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

const now = new Date();
export const yearsOpen =
  now.getFullYear() - FOUNDED_YEAR - (now.getMonth() + 1 < FOUNDED_MONTH ? 1 : 0);
const decadesWords = numberToWords(Math.floor(yearsOpen / 10));

export const founded = {
  /** "1993" */
  year: String(FOUNDED_YEAR),
  /** "32" */
  yearsNumeral: String(yearsOpen),
  /** "thirty-two" */
  yearsWords: numberToWords(yearsOpen),
  /** "Thirty-two" */
  yearsWordsCap: capitalize(numberToWords(yearsOpen)),
  /** "three decades" */
  decades: `${decadesWords} decades`,
  /** "Three decades" */
  decadesCap: `${capitalize(decadesWords)} decades`,
};
