import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MODULE_CATEGORIES = new Set([
  "architecture",
  "protocol",
  "schema",
  "workflow",
  "policy",
  "config",
  "reference",
  "artifact",
  "capsule"
]);

export const MODULE_LAYERS = new Set(["root", "capsule", "detail", "evidence"]);
export const MODULE_PRIORITIES = new Set(["critical", "standard", "supplementary"]);

export const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url));

export function copySchemaFiles(targetSchemaDir) {
  fs.mkdirSync(targetSchemaDir, { recursive: true });
  fs.copyFileSync(
    path.join(PACKAGE_ROOT, "schema", "manifest.schema.json"),
    path.join(targetSchemaDir, "manifest.schema.json")
  );
  fs.copyFileSync(
    path.join(PACKAGE_ROOT, "schema", "manifest-companion.schema.json"),
    path.join(targetSchemaDir, "manifest-companion.schema.json")
  );
  fs.copyFileSync(
    path.join(PACKAGE_ROOT, "schema", "module.schema.json"),
    path.join(targetSchemaDir, "module.schema.json")
  );
}

export function createModuleRef({
  id,
  relativePath,
  scope,
  category,
  layer,
  priority,
  tags = [],
  deps = [],
  tokensApprox,
  control,
  provenance,
  runtimeContract
}) {
  const moduleRef = {
    id,
    path: relativePath,
    scope,
    category,
    layer,
    deps,
    tags,
    tokens_approx: tokensApprox,
    priority
  };

  if (control && typeof control === "object") {
    moduleRef.control = control;
  }
  if (provenance && typeof provenance === "object") {
    moduleRef.provenance = provenance;
  }
  if (runtimeContract && typeof runtimeContract === "object") {
    moduleRef.runtime_contract = runtimeContract;
  }

  return moduleRef;
}

export function ensureTargetDirectory(targetDir, force, options = {}) {
  const { cleanOnForce = false } = options;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(targetDir);
  if (entries.length === 0) {
    return;
  }

  if (!force) {
    throw new Error(`Target directory is not empty: ${targetDir}. Use --force to write anyway.`);
  }

  if (cleanOnForce) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

export function insertBootModule(bootSequence, moduleId, layer, moduleRefs) {
  const layerById = new Map(moduleRefs.map((entry) => [entry.id, entry.layer]));
  const currentIndex = bootSequence.indexOf(moduleId);
  if (currentIndex !== -1) {
    bootSequence.splice(currentIndex, 1);
  }

  if (layer === "root") {
    const insertAt = bootSequence.findIndex((id) => layerById.get(id) !== "root");
    if (insertAt === -1) {
      bootSequence.push(moduleId);
    } else {
      bootSequence.splice(insertAt, 0, moduleId);
    }
    return;
  }

  if (layer === "capsule") {
    const insertAt = bootSequence.findIndex((id) => {
      const existingLayer = layerById.get(id);
      return existingLayer === "detail" || existingLayer === "evidence";
    });
    if (insertAt === -1) {
      bootSequence.push(moduleId);
    } else {
      bootSequence.splice(insertAt, 0, moduleId);
    }
    return;
  }

  bootSequence.push(moduleId);
}

export function writeJson(filePath, value, options = {}) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const payload = options.compact ? JSON.stringify(value) : JSON.stringify(value, null, 2);
  fs.writeFileSync(filePath, `${payload}\n`);
}

export function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function estimateTokens(text) {
  return Math.ceil(String(text ?? "").length / 4);
}

export function isRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !/^[A-Za-z]:/.test(value) &&
    !/(?:^|[\\/])\.\.(?:[\\/]|$)/.test(value)
  );
}

export function normalizePath(value) {
  return String(value ?? "").replaceAll(path.sep, "/");
}
