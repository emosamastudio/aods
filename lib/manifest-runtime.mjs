import fs from "node:fs";
import path from "node:path";

import { isRelativePath, normalizePath } from "./corpus-helpers.mjs";

export const MANIFEST_COMPANION_FIELDS = ["glossary", "roles", "boot_by_role", "boot_by_touch", "surface_pairs"];
export const DEFAULT_MANIFEST_COMPANION_PATH = "indexes/runtime.json";

export function buildManifestCompanion({ glossary, roles, bootByRole, bootByTouch, surfacePairs }) {
  const companion = {
    aods_v: 3,
    kind: "manifest-companion"
  };

  if (isPlainObject(glossary) && Object.keys(glossary).length > 0) {
    companion.glossary = cloneValue(glossary);
  }
  if (Array.isArray(roles) && roles.length > 0) {
    companion.roles = buildRuntimeRoleProfiles(roles, bootByRole);
  }
  if (isPlainObject(bootByRole) && Object.keys(bootByRole).length > 0) {
    companion.boot_by_role = cloneValue(bootByRole);
  }
  if (Array.isArray(bootByTouch) && bootByTouch.length > 0) {
    companion.boot_by_touch = cloneValue(bootByTouch);
  }
  if (Array.isArray(surfacePairs) && surfacePairs.length > 0) {
    companion.surface_pairs = cloneValue(surfacePairs);
  }

  return Object.keys(companion).length > 2 ? companion : null;
}

export function getManifestCompanionPath(manifest) {
  const relativePath = manifest?.companion_index ?? "";
  return isRelativePath(relativePath) ? normalizePath(relativePath) : null;
}

export function loadManifestCompanion(rootPath, manifest) {
  if (manifest?.companion_index !== undefined && !getManifestCompanionPath(manifest)) {
    throw new Error(`manifest companion path must stay inside corpus root: ${manifest.companion_index}`);
  }
  const companionPath = getManifestCompanionPath(manifest);
  if (!companionPath) {
    return null;
  }

  const absolutePath = path.join(rootPath, companionPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`manifest companion missing: ${companionPath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch {
    throw new Error(`manifest companion is not valid JSON: ${companionPath}`);
  }
}

export function mergeManifestRuntime(manifest, companion = null) {
  const runtimeManifest = cloneValue(manifest);
  for (const field of MANIFEST_COMPANION_FIELDS) {
    if (runtimeManifest[field] === undefined && companion?.[field] !== undefined) {
      runtimeManifest[field] = cloneValue(companion[field]);
    }
  }
  return runtimeManifest;
}

export function getManifestRuntime(rootPath, manifest) {
  const companion = loadManifestCompanion(rootPath, manifest);
  return {
    manifest: mergeManifestRuntime(manifest, companion),
    companion,
    companionPath: getManifestCompanionPath(manifest)
  };
}

export function getModulePath(moduleRef) {
  const relativePath = moduleRef?.path ?? `modules/${moduleRef?.id ?? ""}.json`;
  return normalizePath(relativePath);
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildRuntimeRoleProfiles(roles, bootByRole) {
  return roles.map((role) => {
    const profile = { id: role.id };
    if (Array.isArray(role.capabilities) && role.capabilities.length > 0) {
      profile.capabilities = cloneValue(role.capabilities);
    }
    const boundModules = bootByRole?.[role.id];
    if (
      Array.isArray(role.required_modules) &&
      role.required_modules.length > 0 &&
      !sameStringArray(role.required_modules, boundModules)
    ) {
      profile.required_modules = cloneValue(role.required_modules);
    }
    return profile;
  });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sameStringArray(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}
