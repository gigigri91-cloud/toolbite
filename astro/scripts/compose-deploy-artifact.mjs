import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const DIST = path.join(ASTRO_ROOT, "dist");
const OUT = path.join(REPO_ROOT, "_site");

// Files that must never ship to production. Matched on basename.
const IGNORED_FILE_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

function isIgnoredEntry(name) {
  return IGNORED_FILE_NAMES.has(name);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to, overwrite = true) {
  if (isIgnoredEntry(path.basename(from))) return;
  if (!overwrite && fs.existsSync(to)) return;
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(fromDir, toDir, overwrite = true) {
  ensureDir(toDir);
  for (const entry of fs.readdirSync(fromDir)) {
    if (isIgnoredEntry(entry)) continue;
    const from = path.join(fromDir, entry);
    const to = path.join(toDir, entry);
    const stat = fs.statSync(from);
    if (stat.isDirectory()) {
      copyDir(from, to, overwrite);
    } else {
      copyFile(from, to, overwrite);
    }
  }
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

cleanDir(OUT);
copyDir(DIST, OUT, true);

const topLevelFiles = ["CNAME", "ads.txt", "robots.txt", "manifest.json", "service-worker.js", "sitemap.xml"];
for (const file of topLevelFiles) {
  const source = path.join(REPO_ROOT, file);
  if (fs.existsSync(source)) copyFile(source, path.join(OUT, file), true);
}

const topLevelDirs = ["assets", "authors"];
for (const dir of topLevelDirs) {
  const source = path.join(REPO_ROOT, dir);
  if (fs.existsSync(source)) copyDir(source, path.join(OUT, dir), true);
}

const fallbackDirs = ["guides", "categories", "tools"];
for (const dir of fallbackDirs) {
  const source = path.join(REPO_ROOT, dir);
  const target = path.join(OUT, dir);
  if (fs.existsSync(source)) copyDir(source, target, false);
}

for (const entry of fs.readdirSync(REPO_ROOT)) {
  if (!entry.endsWith(".html")) continue;
  copyFile(path.join(REPO_ROOT, entry), path.join(OUT, entry), false);
}

copyFile(path.join(ASTRO_ROOT, "public", ".nojekyll"), path.join(OUT, ".nojekyll"), true);

console.log("Composed deploy artifact at _site.");
