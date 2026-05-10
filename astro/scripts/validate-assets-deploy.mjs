import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const SITE = path.join(REPO_ROOT, "_site");
const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "ASSET_MANIFEST.json"), "utf8"));

if (!fs.existsSync(SITE)) {
  throw new Error("Missing _site deploy artifact. Run compose-deploy-artifact first.");
}

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
  if (!fs.existsSync(path.join(SITE, rel))) issues.push(`Missing deploy asset: ${rel}`);
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

for (const htmlPath of walkHtml(SITE)) {
  const rel = path.relative(SITE, htmlPath);
  const html = fs.readFileSync(htmlPath, "utf8");
  for (const match of html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)) {
    const ref = match[1].replace(/^\//, "");
    if (!fs.existsSync(path.join(SITE, ref))) issues.push(`${rel}: broken asset ref ${ref}`);
  }
}

if (issues.length) {
  console.error("Deploy asset validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Deploy asset validation passed.");
