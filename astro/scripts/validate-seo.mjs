import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const toolsPath = path.join(ROOT, "data", "tools.json");
const sitemapPath = path.join(ROOT, "sitemap.xml");
const DIST = path.resolve(process.cwd(), "dist");

const tools = JSON.parse(fs.readFileSync(toolsPath, "utf8"));
const sitemapXml = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => String(m[1])));

const issues = [];
const warnings = [];
const canonicalToRecord = new Map();

for (const tool of tools) {
  const label = tool.url || tool.name || "(unknown-entry)";
  const requiredFields = ["title", "description", "canonical", "category", "keywords", "schemaType", "relatedTools", "ogImage", "robots", "adMode"];

  for (const field of requiredFields) {
    if (tool[field] === undefined || tool[field] === null || tool[field] === "") {
      issues.push(`${label}: missing required field '${field}'`);
    }
  }

  if (tool.canonical && !/^https:\/\/toolbite\.org\/.+/.test(tool.canonical)) {
    issues.push(`${label}: canonical must be absolute and start with https://toolbite.org/`);
  }
  if (tool.ogImage && !/^https?:\/\//i.test(String(tool.ogImage)) && !String(tool.ogImage).startsWith("/")) {
    issues.push(`${label}: ogImage must be absolute URL or root-relative path`);
  }
  if (tool.schemaType && !String(tool.schemaType).trim()) {
    issues.push(`${label}: schemaType cannot be empty`);
  }
  if (tool.canonical) {
    if (canonicalToRecord.has(tool.canonical)) {
      issues.push(`${label}: duplicate canonical detected in tools.json (${tool.canonical})`);
    }
    canonicalToRecord.set(tool.canonical, label);
  }

  const robots = String(tool.robots || "").toLowerCase();
  const canonical = String(tool.canonical || "");
  const isNoindex = robots.includes("noindex");
  const inSitemap = sitemapUrls.has(canonical);

  if (isNoindex && inSitemap) {
    issues.push(`${label}: noindex URL should not be present in sitemap (${canonical})`);
  }

  if (!isNoindex && canonical && !inSitemap) {
    warnings.push(`${label}: indexable URL not found in sitemap (${canonical})`);
  }

  if (Array.isArray(tool.schemaType)) {
    issues.push(`${label}: schemaType must be a single type per page entry`);
  }
}

const searchCanonical = "https://toolbite.org/search.html";
if (sitemapUrls.has(searchCanonical)) {
  issues.push("search.html is configured as noindex and must be excluded from sitemap");
}
if (sitemapUrls.has("https://toolbite.org/index.html")) {
  issues.push("sitemap must not include /index.html duplicate");
}
for (const url of sitemapUrls) {
  if (/https:\/\/toolbite\.org\/googled[a-z0-9]+\.html$/i.test(url)) {
    issues.push(`sitemap must not include Google verification token URL (${url})`);
  }
}

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
  return out;
}

if (fs.existsSync(DIST)) {
  const htmlFiles = walkHtml(DIST);
  for (const rel of htmlFiles) {
    const html = fs.readFileSync(path.join(DIST, rel), "utf8");
    const alternates = [...html.matchAll(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const map = new Map(alternates.map((m) => [String(m[1]).toLowerCase(), String(m[2])]));
    if (!map.has("x-default") || !map.has("en")) {
      issues.push(`${rel}: missing required hreflang links (x-default + en)`);
    }
    for (const [hreflang, href] of map.entries()) {
      if (!/^https:\/\/toolbite\.org\//.test(href)) {
        issues.push(`${rel}: hreflang ${hreflang} must use absolute toolbite.org URL`);
      }
    }
  }
}

if (issues.length) {
  console.error("SEO validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  if (warnings.length) {
    console.error("\nWarnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

if (warnings.length) {
  console.warn("SEO validation warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log("SEO validation passed.");
