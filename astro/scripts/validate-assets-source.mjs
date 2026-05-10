import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const manifestPath = path.join(REPO_ROOT, "ASSET_MANIFEST.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const required = [
  ...manifest.runtime.js,
  ...manifest.runtime.css,
  ...manifest.runtime.images,
  ...manifest.runtime.fonts,
  ...manifest.runtime.data,
  ...manifest.toolScripts
];

const issues = [];
for (const rel of required) {
  const src = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(src)) issues.push(`Missing source asset: ${rel}`);

  const publicPath = path.join(ASTRO_ROOT, "public", rel);
  if (!fs.existsSync(publicPath)) issues.push(`Missing synced public asset: ${rel}`);
}

if (issues.length) {
  console.error("Asset source validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Asset source validation passed.");
