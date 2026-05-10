import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const ROOT = path.resolve(process.cwd(), "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "tools.json"), "utf8"));

const migratedTools = ["word-counter", "json-formatter", "jwt-decoder", "image-compressor", "text-to-slug"];
const cookieIds = [
  "cookie-consent-banner",
  "cookie-preferences-modal",
  "cookie-accept-btn",
  "cookie-manage-btn",
  "cookie-modal-close",
  "cookie-save-preferences",
  "cookie-analytics-toggle",
  "cookie-advertising-toggle"
];
const issues = [];

function walkHtml(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const rel = `${prefix}/${name}`.replace(/\/+/g, "/").replace(/^\//, "");
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) out.push(...walkHtml(abs, rel));
    else if (name.endsWith(".html")) out.push(rel);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

const allCanonicals = new Map();
for (const rel of walkHtml(DIST)) {
  const html = fs.readFileSync(path.join(DIST, rel), "utf8");
  const canonicalMatches = [...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (canonicalMatches.length !== 1) {
    issues.push(`${rel}: expected exactly one canonical tag, found ${canonicalMatches.length}`);
  } else {
    const canonical = canonicalMatches[0][1];
    if (!allCanonicals.has(canonical)) allCanonicals.set(canonical, []);
    allCanonicals.get(canonical).push(rel);
  }
  const ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [])[1] || "";
  if (!ogImage) issues.push(`${rel}: missing og:image`);
  else if (!/^https:\/\//i.test(ogImage)) issues.push(`${rel}: og:image must be absolute HTTPS URL`);
  if (!html.includes('rel="manifest"') && !html.includes("rel='manifest'")) {
    issues.push(`${rel}: missing manifest link`);
  }
}

for (const [canonical, pages] of allCanonicals.entries()) {
  if (pages.length > 1) {
    issues.push(`duplicate canonical "${canonical}" used by: ${pages.join(", ")}`);
  }
}

for (const slug of migratedTools) {
  const file = path.join(DIST, "tools", `${slug}.html`);
  if (!fs.existsSync(file)) {
    issues.push(`Missing rendered tool page: tools/${slug}.html`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const toolRecord = data.find((item) => item.url === `tools/${slug}.html`);
  if (!toolRecord) {
    issues.push(`Missing tools.json record for ${slug}`);
    continue;
  }
  const canonicalMatches = [...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (canonicalMatches.length !== 1) {
    issues.push(`${slug}: expected exactly one canonical tag, found ${canonicalMatches.length}`);
  } else if (canonicalMatches[0][1] !== toolRecord.canonical) {
    issues.push(`Canonical mismatch for ${slug}`);
  }
  const ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [])[1] || "";
  if (ogImage && !/^https:\/\//i.test(ogImage)) {
    issues.push(`${slug}: og:image must be absolute HTTPS URL`);
  }
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  if (!/Free Online Tool\s*\|\s*ToolBite$/i.test(title)) {
    issues.push(`${slug}: title must end with "Free Online Tool | ToolBite"`);
  }
  if (!/\|\s*ToolBite$/i.test(title)) {
    issues.push(`${slug}: title must include ToolBite brand suffix`);
  }
  if (!html.includes('rel="manifest"') && !html.includes("rel='manifest'")) {
    issues.push(`${slug}: missing manifest link`);
  }
  const alternates = [...html.matchAll(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  const altMap = new Map(alternates.map((m) => [String(m[1]).toLowerCase(), String(m[2])]));
  if (!altMap.has("x-default") || !altMap.has("en")) {
    issues.push(`${slug}: missing hreflang x-default and en links`);
  } else {
    const expected = toolRecord.canonical;
    if (altMap.get("x-default") !== expected || altMap.get("en") !== expected) {
      issues.push(`${slug}: hreflang links must match canonical`);
    }
  }
  for (const id of cookieIds) {
    if (!html.includes(`id="${id}"`)) {
      issues.push(`${slug}: missing cookie contract ID "${id}"`);
    }
  }
  const schemaTypes = ["WebApplication", "FAQPage", "BreadcrumbList"];
  for (const type of schemaTypes) {
    const count = (html.match(new RegExp(`"@type"\\s*:\\s*"${type}"`, "g")) || []).length;
    if (count !== 1) issues.push(`${slug}: expected exactly one ${type} schema, found ${count}`);
  }
  const adTags = [...html.matchAll(/<ins[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>/g)];
  for (const adTag of adTags) {
    const slot = (adTag[0].match(/data-ad-slot="([^"]*)"/) || [])[1] || "";
    if (!slot.trim()) issues.push(`${slug}: adsbygoogle slot cannot be empty`);
  }
}

if (issues.length) {
  console.error("Rendered output validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Rendered output validation passed.");
