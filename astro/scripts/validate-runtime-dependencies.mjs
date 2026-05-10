import fs from "node:fs";
import path from "node:path";

const DIST = path.join(process.cwd(), "dist");

const checks = [
  {
    page: "tools/word-counter.html",
    script: "/assets/js/tools/word-counter.js",
    hooks: ["id=\"wordCounterInput\"", "id=\"wordCount\"", "id=\"charCount\"", "id=\"sentenceCount\"", "id=\"paragraphCount\""]
  },
  {
    page: "tools/json-formatter.html",
    script: "/assets/js/tools/json-formatter.js",
    hooks: ["id=\"jsonInput\"", "id=\"jsonMessage\"", "id=\"copyBtn\""]
  },
  {
    page: "tools/jwt-decoder.html",
    script: "/assets/js/tools/jwt-decoder.js",
    hooks: ["id=\"jwt-input\"", "id=\"jwt-decode-btn\"", "id=\"jwt-payload-out\""]
  },
  {
    page: "tools/image-compressor.html",
    script: "/assets/js/tools/image-compressor.js",
    hooks: ["id=\"file-in\"", "id=\"compress-btn\"", "id=\"cv\""]
  },
  {
    page: "tools/text-to-slug.html",
    script: "/assets/js/tools/text-to-slug.js",
    hooks: ["id=\"slug-input\"", "id=\"slug-output\"", "id=\"slug-copy-btn\""]
  }
];

const issues = [];
for (const check of checks) {
  const pagePath = path.join(DIST, check.page);
  if (!fs.existsSync(pagePath)) {
    issues.push(`Missing built page ${check.page}`);
    continue;
  }
  const html = fs.readFileSync(pagePath, "utf8");
  if (!html.includes(`src="${check.script}"`)) {
    issues.push(`${check.page}: missing runtime script ${check.script}`);
  }
  if (!html.includes('src="/assets/js/core.js"')) {
    issues.push(`${check.page}: missing core runtime script`);
  }
  if (!html.includes('href="/assets/css/global.min.css"') || !html.includes('href="/assets/css/tailwind.min.css"')) {
    issues.push(`${check.page}: missing required runtime CSS`);
  }
  for (const hook of check.hooks) {
    if (!html.includes(hook)) issues.push(`${check.page}: missing hook ${hook}`);
  }
}

if (issues.length) {
  console.error("Runtime dependency validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Runtime dependency validation passed.");
