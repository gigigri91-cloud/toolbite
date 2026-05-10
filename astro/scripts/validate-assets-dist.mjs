import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const DIST = path.join(ASTRO_ROOT, "dist");
const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "ASSET_MANIFEST.json"), "utf8"));

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
  const distPath = path.join(DIST, rel);
  if (!fs.existsSync(distPath)) issues.push(`Missing dist asset: ${rel}`);
}

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const abs = path.join(dir, entry);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) out.push(...walkHtml(abs));
    else if (entry.endsWith(".html")) out.push(abs);
  }
  return out;
}

const assetRefRegex = /(?:src|href)=["'](\/assets\/[^"']+)["']/g;
for (const htmlPath of walkHtml(DIST)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const relPage = path.relative(DIST, htmlPath);
  for (const match of html.matchAll(assetRefRegex)) {
    const ref = match[1].replace(/^\//, "");
    if (!fs.existsSync(path.join(DIST, ref))) {
      issues.push(`${relPage}: missing referenced asset ${ref}`);
    }
  }
}

if (issues.length) {
  console.error("Dist asset validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Dist asset validation passed.");
