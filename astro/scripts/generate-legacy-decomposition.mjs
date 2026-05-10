import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const AUDIT_PATH = path.join(REPO_ROOT, "MIGRATION_AUDIT.json");
const ASSET_MANIFEST_PATH = path.join(REPO_ROOT, "ASSET_MANIFEST.json");
const DIST_PATH = path.join(ASTRO_ROOT, "dist");
const OUT_DIR = path.join(REPO_ROOT, "reports", "legacy-decomposition");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return fallback;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walkHtml(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
    const abs = path.join(dir, name);
    const rel = `${prefix}/${name}`.replace(/\/+/g, "/").replace(/^\//, "");
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) out.push(...walkHtml(abs, rel));
    else if (name.endsWith(".html")) out.push(rel);
  }
  return out;
}

function classifySharedRuntime(deps) {
  const permanentSharedRuntime = [];
  const removableLater = [];
  const unknownRisky = [];

  for (const dep of deps) {
    const value = String(dep);
    if (
      value.startsWith("assets/js/core.js") ||
      value.startsWith("assets/js/search.js") ||
      value.startsWith("assets/js/cookies.js") ||
      value.startsWith("assets/js/tools/") ||
      value.startsWith("assets/css/") ||
      value.startsWith("assets/fonts/") ||
      value.startsWith("data/tools.json") ||
      value === "manifest.json" ||
      value === "favicon.ico" ||
      value === "ads.txt"
    ) {
      permanentSharedRuntime.push(value);
      continue;
    }

    if (value === "googled245882dcee44e7c.html" || value === "CNAME") {
      unknownRisky.push(value);
      continue;
    }

    removableLater.push(value);
  }

  return {
    permanentSharedRuntime: [...new Set(permanentSharedRuntime)].sort((a, b) => a.localeCompare(b)),
    removableLater: [...new Set(removableLater)].sort((a, b) => a.localeCompare(b)),
    unknownRisky: [...new Set(unknownRisky)].sort((a, b) => a.localeCompare(b))
  };
}

function detectUndeclaredRuntimeDependencies() {
  const manifest = readJson(ASSET_MANIFEST_PATH, null);
  if (!manifest) return { missingManifest: true, undeclaredAssetRefs: [] };
  const declared = new Set([
    ...(manifest.runtime?.js || []),
    ...(manifest.runtime?.css || []),
    ...(manifest.runtime?.images || []),
    ...(manifest.runtime?.fonts || []),
    ...(manifest.runtime?.data || []),
    ...(manifest.toolScripts || [])
  ]);

  const undeclared = [];
  for (const rel of walkHtml(DIST_PATH)) {
    const html = fs.readFileSync(path.join(DIST_PATH, rel), "utf8");
    for (const match of html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)) {
      const asset = match[1].replace(/^\//, "");
      if (!declared.has(asset)) {
        undeclared.push({ page: rel, asset });
      }
    }
  }

  const unique = [];
  const seen = new Set();
  for (const item of undeclared) {
    const key = `${item.page}::${item.asset}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  unique.sort((a, b) => `${a.page}:${a.asset}`.localeCompare(`${b.page}:${b.asset}`));

  return { missingManifest: false, undeclaredAssetRefs: unique };
}

function buildReport() {
  const audit = readJson(AUDIT_PATH, {});
  const legacyOnlyPages = (audit?.fileInventory?.legacyOnlyHtml || []).map(String).sort((a, b) => a.localeCompare(b));
  const sharedDeps = (audit?.fileInventory?.criticalSharedDependencies || []).map(String);
  const orphans = (audit?.fileInventory?.orphanFiles || []).map((item) => ({
    path: String(item.path || ""),
    reason: String(item.reason || "")
  }));
  const blockers = {
    critical: (audit?.blockers?.critical || []).map((b) => ({ id: b.id, title: b.title })),
    high: (audit?.blockers?.high || []).map((b) => ({ id: b.id, title: b.title }))
  };

  const sharedClassification = classifySharedRuntime(sharedDeps);
  const undeclaredDeps = detectUndeclaredRuntimeDependencies();

  const removableNow = orphans
    .filter((item) => item.path && !/service-worker\.js/i.test(item.path))
    .sort((a, b) => a.path.localeCompare(b.path));

  const toolCoupling = (audit?.domContractAudit?.tools || [])
    .map((t) => ({
      tool: String(t.tool || ""),
      status: String(t.status || ""),
      domIds: Array.isArray(t.ids) ? t.ids.map(String).sort((a, b) => a.localeCompare(b)) : []
    }))
    .sort((a, b) => a.tool.localeCompare(b.tool));

  return {
    generatedAt: new Date().toISOString(),
    stage: "Controlled Production Transition",
    inventory: {
      legacyOnlyPages,
      sharedRuntimeDependencies: [...new Set(sharedDeps)].sort((a, b) => a.localeCompare(b)),
      removableLegacyAssetsNow: removableNow,
      removableLegacyAssetsLater: sharedClassification.removableLater,
      permanentCompatibilityAssets: sharedClassification.permanentSharedRuntime,
      unknownOrRiskyAssets: sharedClassification.unknownRisky,
      legacyBlockersPreventingAstroPrimary: blockers,
      toolDependenciesStillCoupledToLegacyShell: toolCoupling,
      undeclaredRuntimeDependencies: undeclaredDeps.undeclaredAssetRefs
    },
    classifications: {
      removableNowCount: removableNow.length,
      removableLaterCount: sharedClassification.removableLater.length,
      permanentSharedRuntimeCount: sharedClassification.permanentSharedRuntime.length,
      unknownRiskyCount: sharedClassification.unknownRisky.length + undeclaredDeps.undeclaredAssetRefs.length
    }
  };
}

function reportToMarkdown(report) {
  const lines = [
    "# Legacy Decomposition Inventory",
    "",
    `Generated at: ${report.generatedAt}`,
    "",
    "## Legacy-only Pages",
    ...report.inventory.legacyOnlyPages.map((p) => `- ${p}`),
    "",
    "## Permanent Shared Runtime",
    ...report.inventory.permanentCompatibilityAssets.map((p) => `- ${p}`),
    "",
    "## Removable Now",
    ...report.inventory.removableLegacyAssetsNow.map((item) => `- ${item.path}: ${item.reason}`),
    "",
    "## Removable Later",
    ...report.inventory.removableLegacyAssetsLater.map((p) => `- ${p}`),
    "",
    "## Unknown/Risky",
    ...report.inventory.unknownOrRiskyAssets.map((p) => `- ${p}`),
    ...report.inventory.undeclaredRuntimeDependencies.map((x) => `- undeclared runtime reference: ${x.page} -> ${x.asset}`),
    "",
    "## Legacy Blockers Preventing Astro-primary",
    ...report.inventory.legacyBlockersPreventingAstroPrimary.critical.map((b) => `- CRITICAL ${b.id}: ${b.title}`),
    ...report.inventory.legacyBlockersPreventingAstroPrimary.high.map((b) => `- HIGH ${b.id}: ${b.title}`),
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function main() {
  ensureDir(OUT_DIR);
  const report = buildReport();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonFile = `${timestamp}-legacy-decomposition.json`;
  const mdFile = `${timestamp}-legacy-decomposition.md`;

  fs.writeFileSync(path.join(OUT_DIR, jsonFile), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(OUT_DIR, mdFile), reportToMarkdown(report), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "latest-legacy-decomposition.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "latest-legacy-decomposition.md"), reportToMarkdown(report), "utf8");

  console.log(`Legacy decomposition inventory generated: reports/legacy-decomposition/${jsonFile}`);
}

main();
