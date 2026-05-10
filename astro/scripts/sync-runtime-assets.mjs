import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const PUBLIC_ROOT = path.join(ASTRO_ROOT, "public");

// Files that must never be synced into the Astro public tree.
const IGNORED_FILE_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
function isIgnoredEntry(name) {
  return IGNORED_FILE_NAMES.has(name);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  if (isIgnoredEntry(path.basename(from))) return;
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(fromDir, toDir) {
  ensureDir(toDir);
  for (const entry of fs.readdirSync(fromDir)) {
    if (isIgnoredEntry(entry)) continue;
    const from = path.join(fromDir, entry);
    const to = path.join(toDir, entry);
    const stat = fs.statSync(from);
    if (stat.isDirectory()) {
      copyDir(from, to);
    } else {
      copyFile(from, to);
    }
  }
}

const sources = [
  { from: path.join(REPO_ROOT, "assets"), to: path.join(PUBLIC_ROOT, "assets"), type: "dir" },
  { from: path.join(REPO_ROOT, "data", "tools.json"), to: path.join(PUBLIC_ROOT, "data", "tools.json"), type: "file" },
  { from: path.join(REPO_ROOT, "manifest.json"), to: path.join(PUBLIC_ROOT, "manifest.json"), type: "file" },
  { from: path.join(REPO_ROOT, "favicon.ico"), to: path.join(PUBLIC_ROOT, "favicon.ico"), type: "file" }
];

for (const source of sources) {
  if (!fs.existsSync(source.from)) {
    throw new Error(`Missing runtime source: ${source.from}`);
  }
  if (source.type === "dir") copyDir(source.from, source.to);
  else copyFile(source.from, source.to);
}

if (!fs.existsSync(path.join(PUBLIC_ROOT, ".nojekyll"))) {
  fs.writeFileSync(path.join(PUBLIC_ROOT, ".nojekyll"), "\n", "utf8");
}

console.log("Runtime assets synced to astro/public.");
