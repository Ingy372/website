// Generates docs/cloudflare-bulk-redirects.csv from public/_redirects, for
// upload as a Cloudflare Bulk Redirect List at cutover (see
// docs/LAUNCH-REDIRECTS.md). _redirects stays the single source of truth.
//
// Why: the old Wix site's canonical URLs were on www.actionzonecma.com.
// _redirects can't match a hostname, so www.actionzonecma.com/about would
// otherwise take two hops (www -> apex, then /about -> /our-story). The list
// sends every legacy URL, on either host and either scheme (sources have no
// scheme, so they match http and https), straight to its final https URL,
// and a catch-all moves every other www path to the apex.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const APEX = "actionzonecma.com";
const WWW = `www.${APEX}`;

const rules = readFileSync("public/_redirects", "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/))
  .filter(([from]) => !from.includes(":") && !from.includes("*")); // placeholders/splats stay in _redirects

// <SOURCE>,<TARGET>,<STATUS>,<PRESERVE_QUERY>,<INCLUDE_SUBDOMAINS>,<SUBPATH_MATCHING>,<PRESERVE_PATH_SUFFIX>
const rows = [];
for (const [from, to, status = "301"] of rules) {
  const target = `https://${APEX}${to}`;
  for (const host of [WWW, APEX]) rows.push(`${host}${from},${target},${status},TRUE,FALSE,FALSE,FALSE`);
}
// Everything else on www keeps its path and query and moves to the apex.
rows.push(`${WWW}/,https://${APEX}/,301,TRUE,FALSE,TRUE,TRUE`);

mkdirSync("docs", { recursive: true });
writeFileSync("docs/cloudflare-bulk-redirects.csv", rows.join("\n") + "\n");
console.log(`Wrote ${rows.length} entries to docs/cloudflare-bulk-redirects.csv`);
