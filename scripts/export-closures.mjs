// Prints upcoming closures from src/data/closures.json in the two shapes
// Jay enters by hand: Dojo Forge blackout dates (one date per line) and
// Google Business Profile special hours ("Closed" per date). Also writes
// docs/closures-export.csv.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const { closures } = JSON.parse(readFileSync("src/data/closures.json", "utf8"));
const today = new Date().toISOString().slice(0, 10);

const days = [];
for (const c of closures) {
  const end = c.end ?? c.start;
  if (end < today) continue;
  for (let d = new Date(`${c.start}T12:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push({ date: d.toISOString().slice(0, 10), name: c.name });
  }
}
days.sort((a, b) => a.date.localeCompare(b.date));

if (days.length === 0) {
  console.log("No upcoming closures in src/data/closures.json.");
} else {
  console.log("Dojo Forge blackout dates / GBP special hours (all day: Closed):\n");
  for (const d of days) console.log(`${d.date}  Closed  ${d.name}`);
}
mkdirSync("docs", { recursive: true });
writeFileSync("docs/closures-export.csv", "date,status,reason\n" + days.map((d) => `${d.date},Closed,${d.name}`).join("\n") + "\n");
