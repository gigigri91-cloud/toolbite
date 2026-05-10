import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const REPORTS_ROOT = path.join(REPO_ROOT, "reports");
const OUT_FILE = path.join(REPO_ROOT, "reports", "artifact-hygiene-report.json");

const TRACKED_DIRS = [
  "reports/snapshots",
  "reports/runtime-health",
  "reports/releases"
];

function safeList(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).sort((a, b) => a.localeCompare(b));
}

function listArtifacts(relDir) {
  const absDir = path.join(REPO_ROOT, relDir);
  return safeList(absDir).map((name) => {
    const abs = path.join(absDir, name);
    const stat = fs.statSync(abs);
    return {
      file: `${relDir}/${name}`,
      sizeBytes: stat.size,
      modifiedAt: stat.mtime.toISOString()
    };
  });
}

function main() {
  fs.mkdirSync(REPORTS_ROOT, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    retentionPolicy: {
      snapshots: "keep latest-* plus last 10 timestamped files",
      runtimeHealth: "keep latest-* plus last 20 timestamped files",
      releases: "keep latest-* plus all release attestations for audit trail"
    },
    artifacts: {}
  };

  for (const rel of TRACKED_DIRS) {
    report.artifacts[rel] = listArtifacts(rel);
  }

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log("Artifact hygiene report generated: reports/artifact-hygiene-report.json");
}

main();
