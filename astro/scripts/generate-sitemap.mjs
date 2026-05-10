import fs from "node:fs";
import path from "node:path";

const SITE = "https://toolbite.org";
const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const PAGES_DIR = path.join(ASTRO_ROOT, "src", "pages");
const PUBLIC_SITEMAP_PATH = path.join(ASTRO_ROOT, "public", "sitemap.xml");

// Paths that must NEVER appear in the sitemap.
// - "/search.html": noindex search results
// - "/index.html": duplicate of "/" (canonical homepage)
// - "/googled*.html": Google Search Console verification tokens
const noindexPaths = new Set(["/search.html", "/index.html"]);
const sitemapExclusionPatterns = [/^\/googled[a-z0-9]+\.html$/i];

const toolsDataPath = path.join(REPO_ROOT, "data", "tools.json");
const tools = JSON.parse(fs.readFileSync(toolsDataPath, "utf8"));
for (const entry of tools) {
  const robots = String(entry.robots || "").toLowerCase();
  if (!robots.includes("noindex")) continue;
  noindexPaths.add(`/${String(entry.url || "").replace(/^\/+/, "")}`);
}

function isExcluded(p) {
  if (noindexPaths.has(p)) return true;
  return sitemapExclusionPatterns.some((re) => re.test(p));
}

function collectAstroPages(baseDir, prefix = "") {
  const output = [];
  const names = fs.existsSync(baseDir) ? fs.readdirSync(baseDir) : [];
  for (const name of names) {
    const abs = path.join(baseDir, name);
    const rel = `${prefix}/${name}`.replace(/\/+/g, "/");
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      output.push(...collectAstroPages(abs, rel));
      continue;
    }
    if (!name.endsWith(".astro")) continue;
    output.push(rel.replace(/^\//, ""));
  }
  return output;
}

function pageFileToRoute(pageFile) {
  const noExt = pageFile.replace(/\.astro$/, "");
  if (noExt === "index") return "/index.html";
  if (noExt.endsWith("/index")) return `/${noExt.slice(0, -"/index".length)}.html`;
  return `/${noExt}.html`;
}

const allAstroPages = collectAstroPages(PAGES_DIR);
const mappedRoutes = allAstroPages.map(pageFileToRoute);
const allPaths = new Set(["/", ...mappedRoutes]);
allPaths.delete("/404.html");

const urls = [...allPaths]
  .filter((p) => !isExcluded(p))
  .map((p) => (p === "/" ? SITE : `${SITE}${p}`))
  .sort((a, b) => a.localeCompare(b));

const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
  "</urlset>"
];

fs.writeFileSync(PUBLIC_SITEMAP_PATH, `${xmlLines.join("\n")}\n`, "utf8");
console.log(`Generated sitemap with ${urls.length} URLs.`);
