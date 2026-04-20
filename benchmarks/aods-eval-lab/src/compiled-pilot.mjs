import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./helpers.mjs";

const CLI_PATH = path.join(REPO_ROOT, "bin", "aods.mjs");
const COMPILED_PILOT_SOURCE = path.join(REPO_ROOT, "examples", "compiled-pilot-source", "authoring.json");

export function compilePilotCorpus(outputRoot) {
  execFileSync("node", [CLI_PATH, "compile", COMPILED_PILOT_SOURCE, outputRoot, "--force"], {
    cwd: REPO_ROOT,
    stdio: "pipe"
  });
}

export function loadRootModule(corpusRoot) {
  const rootModulePath = path.join(corpusRoot, "modules", "shift-ops-root.json");
  const rootModule = JSON.parse(fs.readFileSync(rootModulePath, "utf8"));
  const surfaceInventory = getSurfaceInventory(rootModule);
  return { rootModulePath, rootModule, surfaceInventory };
}

export function writeModuleJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`);
}

export function updateSurfaceInventoryEntry(corpusRoot, surfaceId, mutateEntry) {
  const { rootModulePath, rootModule, surfaceInventory } = loadRootModule(corpusRoot);
  const entry = (surfaceInventory.content?.entries ?? []).find((item) => item.surface_id === surfaceId);
  if (!entry) {
    throw new Error(`compiled pilot surface-inventory entry not found: ${surfaceId}`);
  }
  mutateEntry(entry, surfaceInventory.content.entries);
  writeModuleJson(rootModulePath, rootModule);
  return { rootModulePath, rootModule, surfaceInventory };
}

function getSurfaceInventory(rootModule) {
  const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
  if (!surfaceInventory) {
    throw new Error("compiled pilot should include a surface-inventory artifact");
  }
  return surfaceInventory;
}
