import fs from "node:fs";
import path from "node:path";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const REGISTRY_PATH = path.join(REPO_ROOT, "governance", "migration-registry.json");

const STATUS_FIELDS = ["migrated", "hardened", "observed", "production-safe", "rollback-safe"];
const SURFACE_TYPES = ["tools", "categories", "guides", "layouts", "components", "staticPages"];
const REQUIRED_ROOT_FIELDS = ["version", "updatedAt", "owners", "surfaces"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function main() {
  const issues = [];

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`Governance registry missing: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  } catch (error) {
    console.error(`Governance registry is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  for (const key of REQUIRED_ROOT_FIELDS) {
    if (!(key in registry)) issues.push(`Missing root field '${key}'`);
  }

  if (!isNonEmptyString(registry.version)) issues.push("Field 'version' must be non-empty string");
  if (!isNonEmptyString(registry.updatedAt)) issues.push("Field 'updatedAt' must be non-empty string");
  if (!registry.owners || typeof registry.owners !== "object") issues.push("Field 'owners' must be object");
  if (!registry.surfaces || typeof registry.surfaces !== "object") issues.push("Field 'surfaces' must be object");

  const seenSurfaceIds = new Set();

  for (const type of SURFACE_TYPES) {
    const owner = registry.owners?.[type];
    if (!isNonEmptyString(owner)) {
      issues.push(`Missing required owner metadata for '${type}'`);
    }

    const items = registry.surfaces?.[type];
    if (!Array.isArray(items)) {
      issues.push(`Surface '${type}' must be an array`);
      continue;
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const label = `${type}[${index}]`;
      if (!item || typeof item !== "object") {
        issues.push(`${label} must be an object`);
        continue;
      }
      if (!isNonEmptyString(item.id)) {
        issues.push(`${label} missing required metadata field 'id'`);
        continue;
      }
      if (seenSurfaceIds.has(item.id)) {
        issues.push(`Duplicate surface id detected: ${item.id}`);
      } else {
        seenSurfaceIds.add(item.id);
      }

      for (const field of STATUS_FIELDS) {
        const value = item[field];
        if (typeof value !== "boolean") {
          issues.push(`${item.id}: unknown status value for '${field}' (expected boolean)`);
        }
      }
    }
  }

  if (issues.length) {
    console.error("Governance registry validation failed:");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log("Governance registry validation passed.");
}

main();
