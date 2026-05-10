import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const RELEASES_DIR = path.join(REPO_ROOT, "reports", "releases");
const SNAPSHOTS_DIR = path.join(REPO_ROOT, "reports", "snapshots");
const RUNTIME_HEALTH_LATEST = path.join(REPO_ROOT, "reports", "runtime-health", "latest-runtime-health.json");
const PRODUCTION_STATUS = path.join(REPO_ROOT, "PRODUCTION_STATUS.md");
const MIGRATION_STATUS = path.join(REPO_ROOT, "migration-status.json");
const GOVERNANCE_REGISTRY = path.join(REPO_ROOT, "governance", "migration-registry.json");
const DEPLOY_ARTIFACT_DIR = path.join(REPO_ROOT, "_site");

const VALIDATION_COMMANDS = [
  ["npm", ["run", "validate:governance"]],
  ["npm", ["run", "validate:seo"]],
  ["npm", ["run", "validate:rendered"]],
  ["npm", ["run", "validate:dom"]],
  ["npm", ["run", "validate:runtime"]],
  ["npm", ["run", "validate:ads"]],
  ["npm", ["run", "validate:assets:deploy"]]
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function hashDirectory(rootDir) {
  if (!fs.existsSync(rootDir)) return "";
  const files = [];
  function walk(dir, prefix = "") {
    for (const name of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
      const abs = path.join(dir, name);
      const rel = `${prefix}/${name}`.replace(/\/+/g, "/").replace(/^\//, "");
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) walk(abs, rel);
      else files.push(rel);
    }
  }
  walk(rootDir);
  const hasher = crypto.createHash("sha256");
  for (const rel of files) {
    hasher.update(rel);
    hasher.update("\n");
    hasher.update(fs.readFileSync(path.join(rootDir, rel)));
    hasher.update("\n");
  }
  return hasher.digest("hex");
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: ASTRO_ROOT,
    encoding: "utf8"
  });
  return {
    command: [command, ...args].join(" "),
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function getGitCommitHash() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" });
  if (result.status !== 0) return null;
  return String(result.stdout || "").trim() || null;
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function collectSnapshotHashes() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) return [];
  return fs
    .readdirSync(SNAPSHOTS_DIR)
    .filter((name) => name.startsWith("latest-") && name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const abs = path.join(SNAPSHOTS_DIR, name);
      return {
        file: `reports/snapshots/${name}`,
        sha256: sha256File(abs)
      };
    });
}

function main() {
  ensureDir(RELEASES_DIR);

  const validatorOutputs = VALIDATION_COMMANDS.map(([cmd, args]) => runCommand(cmd, args));
  const failed = validatorOutputs.filter((v) => v.exitCode !== 0);
  const runtimeEvidence = readJsonSafe(RUNTIME_HEALTH_LATEST);

  const bundle = {
    generatedAt: new Date().toISOString(),
    gitCommitHash: getGitCommitHash(),
    buildMetadata: {
      nodeVersion: process.version,
      platform: process.platform,
      astroRoot: ASTRO_ROOT
    },
    validatorOutputs,
    snapshotHashes: collectSnapshotHashes(),
    governanceRegistry: fs.existsSync(GOVERNANCE_REGISTRY)
      ? { file: "governance/migration-registry.json", sha256: sha256File(GOVERNANCE_REGISTRY) }
      : null,
    productionStatus: fs.existsSync(PRODUCTION_STATUS)
      ? { file: "PRODUCTION_STATUS.md", sha256: sha256File(PRODUCTION_STATUS) }
      : null,
    migrationStatus: fs.existsSync(MIGRATION_STATUS)
      ? { file: "migration-status.json", sha256: sha256File(MIGRATION_STATUS) }
      : null,
    deployArtifact: fs.existsSync(DEPLOY_ARTIFACT_DIR)
      ? { dir: "_site", sha256: hashDirectory(DEPLOY_ARTIFACT_DIR) }
      : null,
    runtimeEvidence: runtimeEvidence
      ? {
          file: "reports/runtime-health/latest-runtime-health.json",
          sha256: sha256File(RUNTIME_HEALTH_LATEST),
          summary: runtimeEvidence.summary || null
        }
      : null,
    validationSummary: {
      total: validatorOutputs.length,
      failed: failed.length,
      passed: validatorOutputs.length - failed.length
    },
    releaseReadiness: {
      verdict:
        failed.length > 0 || !runtimeEvidence || !fs.existsSync(PRODUCTION_STATUS) || !fs.existsSync(MIGRATION_STATUS)
          ? "FAIL"
          : "PASS",
      reasons: [
        ...(failed.length ? failed.map((f) => `Validator failed: ${f.command}`) : []),
        ...(!runtimeEvidence ? ["Missing runtime evidence artifact"] : []),
        ...(!fs.existsSync(PRODUCTION_STATUS) ? ["Missing PRODUCTION_STATUS.md"] : []),
        ...(!fs.existsSync(MIGRATION_STATUS) ? ["Missing migration-status.json"] : [])
      ]
    }
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(RELEASES_DIR, `${timestamp}-release.json`);
  const latestPath = path.join(RELEASES_DIR, "latest-release.json");
  fs.writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  fs.writeFileSync(latestPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");

  if (bundle.releaseReadiness.verdict !== "PASS") {
    console.error(`Release bundle generated with FAIL verdict: reports/releases/${path.basename(outPath)}`);
    process.exit(1);
  }

  console.log(`Release bundle generated: reports/releases/${path.basename(outPath)}`);
}

main();
