import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const repoRoot = path.resolve(ROOT, "..");
const dataPath = path.join(repoRoot, "data", "tools.json");
const astroPages = path.join(ROOT, "src", "pages");

const requiredCategoryPages = [
  "categories/text-tools.astro",
  "categories/developer-tools.astro",
  "categories/image-tools.astro",
  "categories/seo-tools.astro",
  "search.astro"
];

const issues = [];

for (const rel of requiredCategoryPages) {
  if (!fs.existsSync(path.join(astroPages, rel))) {
    issues.push(`Missing migrated page: ${rel}`);
  }
}

const tools = JSON.parse(fs.readFileSync(dataPath, "utf8"));
if (!Array.isArray(tools) || !tools.length) {
  issues.push("tools.json must contain non-empty array");
}

for (const tool of tools) {
  if (!tool.url || !tool.name || !tool.desc || !tool.tags) {
    issues.push(`Search compatibility missing fields for ${tool.url || tool.name || "unknown"}`);
  }
  if (!tool.canonical || !String(tool.canonical).startsWith("https://toolbite.org/")) {
    issues.push(`Invalid canonical for ${tool.url || tool.name}`);
  }
}

if (issues.length) {
  console.error("Discovery validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Discovery validation passed.");
