import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const issues = [];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const abs = path.join(dir, entry);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) out.push(...walk(abs));
    else if (entry.endsWith(".html")) out.push(abs);
  }
  return out;
}

for (const file of walk(DIST)) {
  const rel = path.relative(DIST, file);
  const html = fs.readFileSync(file, "utf8");
  const adTags = [...html.matchAll(/<ins[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>/g)];
  for (const adTag of adTags) {
    const markup = adTag[0];
    const slotMatch = markup.match(/data-ad-slot="([^"]*)"/);
    if (!slotMatch || !slotMatch[1].trim()) {
      issues.push(`${rel}: adsbygoogle slot is missing or empty`);
    }
  }
}

if (issues.length) {
  console.error("Ad validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Ad validation passed.");
