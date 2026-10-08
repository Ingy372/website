// Pre-launch guard: lists every TODO(JAY: ...) placeholder that made it into
// the built site (run after `npm run build`). Exits non-zero if any remain, so
// it can gate a production deploy.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = "dist/client";
const pattern = /TODO\(JAY:[^)]*\)/g;
const found = new Map();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "_astro") walk(path);
    } else if (/\.(html|xml|txt|json)$/.test(name) || name.startsWith("_")) {
      for (const match of readFileSync(path, "utf8").matchAll(pattern)) {
        const key = match[0];
        if (!found.has(key)) found.set(key, new Set());
        found.get(key).add(relative(root, path).replaceAll("\\", "/"));
      }
    }
  }
}

walk(root);

if (found.size === 0) {
  console.log("No TODO(JAY) placeholders in the build output.");
} else {
  console.log(`${found.size} distinct TODO(JAY) placeholder(s) in the build output:\n`);
  for (const [todo, files] of found) {
    console.log(`${todo}\n    ${[...files].sort().join("\n    ")}\n`);
  }
  process.exitCode = 1;
}
