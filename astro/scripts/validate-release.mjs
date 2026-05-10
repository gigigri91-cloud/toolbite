import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const RUNTIME_EVIDENCE_PATH = path.join(REPO_ROOT, "reports", "runtime-health", "latest-runtime-health.json");
const SNAPSHOT_BUILD = path.join(REPO_ROOT, "reports", "snapshots", "latest-post-build-dist.json");
const SNAPSHOT_DEPLOY = path.join(REPO_ROOT, "reports", "snapshots", "latest-post-compose-_site.json");
const PRODUCTION_STATUS_PATH = path.join(REPO_ROOT, "PRODUCTION_STATUS.md");
const MIGRATION_STATUS_PATH = path.join(REPO_ROOT, "migration-status.json");
const RELEASE_BUNDLE_PATH = path.join(REPO_ROOT, "reports", "releases", "latest-release.json");
const LEGACY_DECOMPOSITION_PATH = path.join(REPO_ROOT, "reports", "legacy-decomposition", "latest-legacy-decomposition.json");
const REQUIRED_DOCS = [
  "CUTOVER_STRATEGY.md",
  "TRAFFIC_TRANSITION_PLAN.md",
  "MIGRATION_RESUME_PROTOCOL.md",
  "RELEASE_CADENCE.md",
  "PRODUCTION_MONITORING_OPERATIONS.md",
  "ARCHITECTURE_COMPLETION_REPORT.md"
].map((name) => path.join(REPO_ROOT, name));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ASTRO_ROOT, encoding: "utf8" });
  return {
    command: [command, ...args].join(" "),
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function main() {
  const failures = [];
  const warnings = [];

  const checks = [
    run("npm", ["run", "validate:governance"]),
    run("npm", ["run", "validate:seo"]),
    run("npm", ["run", "validate:rendered"]),
    run("npm", ["run", "validate:dom"]),
    run("npm", ["run", "validate:runtime"]),
    run("npm", ["run", "validate:ads"])
  ];

  for (const check of checks) {
    if (!check.ok) failures.push(`Validation command failed: ${check.command}`);
  }

  if (!fs.existsSync(SNAPSHOT_BUILD)) failures.push("Missing snapshot artifact: latest-post-build-dist.json");
  if (!fs.existsSync(SNAPSHOT_DEPLOY)) failures.push("Missing snapshot artifact: latest-post-compose-_site.json");
  if (!fs.existsSync(PRODUCTION_STATUS_PATH)) failures.push("Missing generated production status file");
  if (!fs.existsSync(MIGRATION_STATUS_PATH)) failures.push("Missing generated migration status file");
  if (!fs.existsSync(RUNTIME_EVIDENCE_PATH)) failures.push("Missing runtime evidence artifact");
  if (!fs.existsSync(RELEASE_BUNDLE_PATH)) failures.push("Missing release bundle artifact");
  if (!fs.existsSync(LEGACY_DECOMPOSITION_PATH)) failures.push("Missing legacy decomposition inventory artifact");
  for (const docPath of REQUIRED_DOCS) {
    if (!fs.existsSync(docPath)) failures.push(`Missing required transition governance doc: ${path.basename(docPath)}`);
  }

  const runtimeEvidence = fs.existsSync(RUNTIME_EVIDENCE_PATH) ? readJson(RUNTIME_EVIDENCE_PATH) : null;
  if (runtimeEvidence) {
    const summary = runtimeEvidence.summary || {};
    if (!summary.cookieSystemInitialized) failures.push("Runtime evidence indicates cookie system not initialized");
    if (!summary.searchOverlayInitialized) failures.push("Runtime evidence indicates search overlay not initialized");
    if (!summary.themeToggleInitialized) failures.push("Runtime evidence indicates theme toggle not initialized");
    if (!summary.criticalDomHooksDetected) failures.push("Runtime evidence indicates missing critical DOM hooks");
    if (!summary.noEmptyAdContainers) failures.push("Runtime evidence indicates empty ad containers");
    if (!summary.noDuplicateEventListenerWarnings) warnings.push("Runtime evidence reports duplicate runtime warnings");
  }

  const verdict = failures.length ? "FAIL" : warnings.length ? "WARN" : "PASS";
  console.log(`Release verdict: ${verdict}`);

  if (warnings.length) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (failures.length) {
    console.error("Release gate failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

main();
