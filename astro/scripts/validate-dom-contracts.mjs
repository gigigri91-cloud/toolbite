import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");

const pageContracts = [
  {
    file: "index.html",
    required: ["id=\"mobile-menu-button\"", "id=\"theme-toggle\"", "id=\"mobile-menu\"", "id=\"search-input\""]
  },
  {
    file: "search.html",
    required: [
      "id=\"search-input\"",
      "id=\"search-summary\"",
      "id=\"results-count\"",
      "id=\"results-grid\"",
      "id=\"no-results\"",
      "id=\"search-result-card-template\""
    ]
  },
  {
    file: "tools/word-counter.html",
    required: ["id=\"wordCounterInput\"", "id=\"wordCount\"", "id=\"charCount\"", "id=\"sentenceCount\"", "id=\"paragraphCount\"", "id=\"copy-btn\"", "id=\"clear-btn\""]
  },
  {
    file: "tools/json-formatter.html",
    required: ["id=\"jsonInput\"", "id=\"jsonMessage\"", "id=\"copyBtn\""]
  },
  {
    file: "tools/jwt-decoder.html",
    required: ["id=\"jwt-input\"", "id=\"jwt-decode-btn\"", "id=\"jwt-clear-btn\"", "id=\"jwt-header-out\"", "id=\"jwt-payload-out\"", "id=\"jwt-error\"", "id=\"jwt-sig-info\""]
  },
  {
    file: "tools/image-compressor.html",
    required: ["id=\"file-in\"", "id=\"compress-btn\"", "id=\"cv\"", "id=\"dl\"", "id=\"stats\"", "id=\"quality\"", "id=\"q-val\"", "id=\"mime-out\"", "id=\"hint\""]
  },
  {
    file: "tools/text-to-slug.html",
    required: ["id=\"slug-input\"", "id=\"slug-output\"", "id=\"slug-copy-btn\"", "id=\"slug-clear-btn\""]
  }
];

const issues = [];
for (const contract of pageContracts) {
  const abs = path.join(DIST, contract.file);
  if (!fs.existsSync(abs)) {
    issues.push(`Missing built page: ${contract.file}`);
    continue;
  }
  const html = fs.readFileSync(abs, "utf8");
  for (const hook of contract.required) {
    if (!html.includes(hook)) issues.push(`${contract.file}: missing required hook ${hook}`);
  }
}

if (issues.length) {
  console.error("DOM contract validation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("DOM contract validation passed.");
