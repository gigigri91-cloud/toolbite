import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const REPORTS_DIR = path.join(REPO_ROOT, "reports", "snapshots");
const SITE_URL = "https://toolbite.org";

const COOKIE_CONTRACT_IDS = [
  "cookie-consent-banner",
  "cookie-preferences-modal",
  "cookie-accept-btn",
  "cookie-manage-btn",
  "cookie-modal-close",
  "cookie-save-preferences",
  "cookie-analytics-toggle",
  "cookie-advertising-toggle"
];

const DOM_CONTRACT_PAGES = [
  {
    file: "index.html",
    required: ["mobile-menu-button", "theme-toggle", "mobile-menu", "search-input"]
  },
  {
    file: "search.html",
    required: ["search-input", "search-summary", "results-count", "results-grid", "no-results", "search-result-card-template"]
  },
  {
    file: "tools/word-counter.html",
    required: ["wordCounterInput", "wordCount", "charCount", "sentenceCount", "paragraphCount", "copy-btn", "clear-btn"]
  },
  {
    file: "tools/json-formatter.html",
    required: ["jsonInput", "jsonMessage", "copyBtn"]
  },
  {
    file: "tools/jwt-decoder.html",
    required: ["jwt-input", "jwt-decode-btn", "jwt-clear-btn", "jwt-header-out", "jwt-payload-out", "jwt-error", "jwt-sig-info"]
  },
  {
    file: "tools/image-compressor.html",
    required: ["file-in", "compress-btn", "cv", "dl", "stats", "quality", "q-val", "mime-out", "hint"]
  },
  {
    file: "tools/text-to-slug.html",
    required: ["slug-input", "slug-output", "slug-copy-btn", "slug-clear-btn"]
  }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { stage: "manual", target: "dist" };
  for (const arg of args) {
    if (arg.startsWith("--stage=")) out.stage = arg.replace("--stage=", "").trim() || "manual";
    if (arg.startsWith("--target=")) out.target = arg.replace("--target=", "").trim() || "dist";
  }
  return out;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walkHtml(baseDir, prefix = "") {
  if (!fs.existsSync(baseDir)) return [];
  const files = [];
  for (const name of fs.readdirSync(baseDir).sort((a, b) => a.localeCompare(b))) {
    const abs = path.join(baseDir, name);
    const rel = `${prefix}/${name}`.replace(/\/+/g, "/").replace(/^\//, "");
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      files.push(...walkHtml(abs, rel));
      continue;
    }
    if (name.endsWith(".html")) files.push(rel);
  }
  return files;
}

function getTargetDir(targetName) {
  if (targetName === "dist") return path.join(ASTRO_ROOT, "dist");
  if (targetName === "_site") return path.join(REPO_ROOT, "_site");
  return path.isAbsolute(targetName) ? targetName : path.join(REPO_ROOT, targetName);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function extractFirst(text, re) {
  const match = text.match(re);
  return match ? String(match[1]).trim() : "";
}

function extractAll(text, re) {
  return [...text.matchAll(re)].map((m) => String(m[1] || "").trim()).filter(Boolean);
}

function normalizeInlineJson(html) {
  const scripts = extractAll(html, /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    .map((raw) => raw.replace(/\s+/g, " ").trim())
    .sort((a, b) => a.localeCompare(b));
  return scripts;
}

function buildRenderedSnapshot(targetDir, htmlFiles) {
  return htmlFiles.map((rel) => {
    const abs = path.join(targetDir, rel);
    const html = fs.readFileSync(abs, "utf8");
    const title = extractFirst(html, /<title>([^<]*)<\/title>/i);
    const canonical = extractFirst(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    const description = extractFirst(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const schemaTypes = extractAll(html, /"@type"\s*:\s*"([^"]+)"/g).sort((a, b) => a.localeCompare(b));
    const idMatches = extractAll(html, /id=["']([^"']+)["']/g).sort((a, b) => a.localeCompare(b));
    const schemaHash = sha256(normalizeInlineJson(html).join("\n"));
    const coreHash = sha256(
      JSON.stringify({
        title,
        canonical,
        description,
        schemaTypes,
        idCount: idMatches.length
      })
    );
    return {
      path: `/${rel}`,
      title,
      canonical,
      description,
      schemaTypes,
      schemaHash,
      coreHash
    };
  });
}

function buildCanonicalSnapshot(renderedSnapshot) {
  const grouped = new Map();
  for (const page of renderedSnapshot) {
    const key = page.canonical || "";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(page.path);
  }
  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([canonical, pages]) => ({
      canonical,
      pageCount: pages.length,
      pages: pages.sort((a, b) => a.localeCompare(b))
    }));
}

function buildSchemaSnapshot(renderedSnapshot) {
  return renderedSnapshot
    .map((page) => ({
      path: page.path,
      schemaTypes: [...page.schemaTypes].sort((a, b) => a.localeCompare(b)),
      schemaHash: page.schemaHash
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function buildTitleMetaSnapshot(renderedSnapshot) {
  return renderedSnapshot
    .map((page) => ({
      path: page.path,
      title: page.title,
      hasToolBiteSuffix: /toolbite/i.test(page.title),
      description: page.description
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function buildDomContractSnapshot(targetDir) {
  return DOM_CONTRACT_PAGES.map((contract) => {
    const abs = path.join(targetDir, contract.file);
    if (!fs.existsSync(abs)) {
      return {
        path: `/${contract.file}`,
        exists: false,
        missingIds: [...contract.required].sort((a, b) => a.localeCompare(b)),
        cookieContractMissing: [...COOKIE_CONTRACT_IDS].sort((a, b) => a.localeCompare(b))
      };
    }
    const html = fs.readFileSync(abs, "utf8");
    const missingIds = contract.required.filter((id) => !html.includes(`id="${id}"`)).sort((a, b) => a.localeCompare(b));
    const cookieContractMissing = COOKIE_CONTRACT_IDS.filter((id) => !html.includes(`id="${id}"`)).sort((a, b) => a.localeCompare(b));
    return {
      path: `/${contract.file}`,
      exists: true,
      missingIds,
      cookieContractMissing
    };
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function buildSitemapSnapshot() {
  const sitemapPath = path.join(REPO_ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    return { exists: false, urls: [] };
  }
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const urls = extractAll(xml, /<loc>([^<]+)<\/loc>/g).sort((a, b) => a.localeCompare(b));
  return { exists: true, urls };
}

function buildSnapshot({ stage, target, targetDir }) {
  const htmlFiles = walkHtml(targetDir);
  const rendered = buildRenderedSnapshot(targetDir, htmlFiles).sort((a, b) => a.path.localeCompare(b.path));
  return {
    stage,
    target,
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    counts: {
      htmlPages: rendered.length
    },
    sitemapSnapshot: buildSitemapSnapshot(),
    renderedSnapshot: rendered,
    canonicalSnapshot: buildCanonicalSnapshot(rendered),
    schemaSnapshot: buildSchemaSnapshot(rendered),
    titleMetaSnapshot: buildTitleMetaSnapshot(rendered),
    domContractSnapshot: buildDomContractSnapshot(targetDir)
  };
}

function main() {
  const args = parseArgs();
  const targetDir = getTargetDir(args.target);
  if (!fs.existsSync(targetDir)) {
    console.error(`Snapshot target does not exist: ${targetDir}`);
    process.exit(1);
  }

  ensureDir(REPORTS_DIR);
  const snapshot = buildSnapshot({ stage: args.stage, target: args.target, targetDir });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}-${args.stage}-${args.target}.json`;
  const outPath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const latestPath = path.join(REPORTS_DIR, `latest-${args.stage}-${args.target}.json`);
  fs.writeFileSync(latestPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Generated snapshot: reports/snapshots/${filename}`);
}

main();
