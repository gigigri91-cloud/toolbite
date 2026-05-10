import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const DIST_ROOT = path.join(ASTRO_ROOT, "dist");
const SITE_ROOT = path.join(REPO_ROOT, "_site");
const SNAPSHOT_ROOT = path.join(REPO_ROOT, "reports", "snapshots");
const GOVERNANCE_REGISTRY_PATH = path.join(REPO_ROOT, "governance", "migration-registry.json");
const AUDIT_PATH = path.join(REPO_ROOT, "MIGRATION_AUDIT.json");
const STATUS_MD_PATH = path.join(REPO_ROOT, "PRODUCTION_STATUS.md");
const GOVERNANCE_JSON_PATH = path.join(REPO_ROOT, "migration-status.json");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return fallback;
  }
}

function walkHtml(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
    const abs = path.join(dir, name);
    const rel = `${prefix}/${name}`.replace(/\/+/g, "/").replace(/^\//, "");
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      out.push(...walkHtml(abs, rel));
      continue;
    }
    if (name.endsWith(".html")) out.push(rel);
  }
  return out;
}

function getLatestSnapshotFiles() {
  if (!fs.existsSync(SNAPSHOT_ROOT)) return [];
  return fs.readdirSync(SNAPSHOT_ROOT)
    .filter((name) => name.startsWith("latest-") && name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `reports/snapshots/${name}`);
}

function toPercent(migrated, total) {
  if (!total) return "0.0";
  return ((migrated / total) * 100).toFixed(1);
}

function sortById(items) {
  return [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function buildGovernanceRegistry() {
  const registry = readJson(GOVERNANCE_REGISTRY_PATH, null);
  if (!registry) {
    throw new Error(`Missing or invalid governance registry at ${GOVERNANCE_REGISTRY_PATH}`);
  }

  return {
    version: String(registry.version || "1.0"),
    generatedAt: new Date().toISOString(),
    updatedAt: String(registry.updatedAt || ""),
    stage: "Operationally Governed Hybrid",
    owners: registry.owners || {},
    surfaces: {
      tools: sortById(registry.surfaces?.tools || []),
      guides: sortById(registry.surfaces?.guides || []),
      categories: sortById(registry.surfaces?.categories || []),
      staticPages: sortById(registry.surfaces?.staticPages || []),
      layouts: sortById(registry.surfaces?.layouts || []),
      components: sortById(registry.surfaces?.components || [])
    }
  };
}

function summarizeCompletion(registry) {
  const bucketKeys = ["tools", "guides", "categories", "staticPages", "layouts", "components"];
  const summary = {};
  let totalMigrated = 0;
  let totalItems = 0;
  for (const key of bucketKeys) {
    const items = registry.surfaces[key];
    const migrated = items.filter((i) => i.migrated).length;
    summary[key] = { migrated, total: items.length, percent: Number(toPercent(migrated, items.length)) };
    totalMigrated += migrated;
    totalItems += items.length;
  }
  summary.overall = { migrated: totalMigrated, total: totalItems, percent: Number(toPercent(totalMigrated, totalItems)) };
  return summary;
}

function writeProductionStatus(registry) {
  const completion = summarizeCompletion(registry);
  const audit = readJson(AUDIT_PATH, {});
  const legacyOnly = audit?.fileInventory?.legacyOnlyHtml || [];
  const blockers = (audit?.blockers?.critical || []).map((b) => `- ${b.id}: ${b.title}`);
  const riskItems = (audit?.blockers?.high || []).map((b) => `- ${b.id}: ${b.title}`);
  const latestSnapshots = getLatestSnapshotFiles();

  const body = [
    "# PRODUCTION STATUS",
    "",
    `Last generated: ${new Date().toISOString()}`,
    "",
    "## Current Hybrid Stage",
    "- Stage: Operationally Governed Hybrid",
    "- Rollout readiness: Guard-railed hybrid deploys with snapshots + parity gates",
    "- SEO readiness: Enforced at build/validation level with hard failures",
    "- Monetization readiness: Enforced for ad slot integrity and cookie contract IDs",
    "- Rollback readiness: Preserved via legacy fallback compose behavior and shared runtime contracts",
    "",
    "## Migration Completion",
    `- Overall surfaces: ${completion.overall.migrated}/${completion.overall.total} (${completion.overall.percent}%)`,
    `- Tools: ${completion.tools.migrated}/${completion.tools.total} (${completion.tools.percent}%)`,
    `- Guides: ${completion.guides.migrated}/${completion.guides.total} (${completion.guides.percent}%)`,
    `- Categories: ${completion.categories.migrated}/${completion.categories.total} (${completion.categories.percent}%)`,
    `- Static pages: ${completion.staticPages.migrated}/${completion.staticPages.total} (${completion.staticPages.percent}%)`,
    `- Layouts: ${completion.layouts.migrated}/${completion.layouts.total} (${completion.layouts.percent}%)`,
    `- Components: ${completion.components.migrated}/${completion.components.total} (${completion.components.percent}%)`,
    "",
    "## Remaining Legacy-Only Pages",
    ...legacyOnly.slice(0, 30).map((item) => `- ${item}`),
    ...(legacyOnly.length > 30 ? [`- ...and ${legacyOnly.length - 30} more`] : []),
    "",
    "## Remaining Risk Items",
    ...(blockers.length ? blockers : ["- No critical blockers listed in MIGRATION_AUDIT.json"]),
    ...(riskItems.length ? riskItems : ["- No high-severity risks listed in MIGRATION_AUDIT.json"]),
    "",
    "## Snapshot and Observability Assets",
    ...(latestSnapshots.length
      ? latestSnapshots.map((f) => `- ${f}`)
      : ["- Snapshot files not found yet. Run build and compose scripts."]),
    "",
    "## Next Safe Migration Batch",
    "- Static/legal pages that do not introduce tool-runtime coupling",
    "- Then low-runtime-risk text tools (find/replace, duplicate removal, spacing, sorting)",
    "- Keep guides migration after static parity confidence remains stable for at least 2 release cycles",
    "",
    "## Governance Notes",
    "- Do not refactor shared runtime scripts (`assets/js/core.js`, `assets/js/search.js`, `assets/js/cookies.js`) without parity validation updates",
    "- Do not change hybrid compose fallback behavior until governance registry is fully green across all surfaces",
    "- Keep sitemap and metadata validation as hard gates in CI",
    ""
  ].join("\n");

  fs.writeFileSync(STATUS_MD_PATH, body, "utf8");
}

function main() {
  const registry = buildGovernanceRegistry();
  fs.writeFileSync(GOVERNANCE_JSON_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  writeProductionStatus(registry);

  const distCount = walkHtml(DIST_ROOT).length;
  const siteCount = walkHtml(SITE_ROOT).length;
  console.log(`Updated migration-status.json and PRODUCTION_STATUS.md (dist pages: ${distCount}, _site pages: ${siteCount}).`);
}

main();
