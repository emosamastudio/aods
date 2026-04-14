import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url));

export async function runUpgradeCommand(argv) {
  const options = parseArgs(argv);
  const targetRoot = path.resolve(options.root);
  const manifestPath = path.join(targetRoot, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error("manifest.json not found at " + manifestPath);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const schemaDir = path.join(targetRoot, "schema");
  const changedFiles = [];
  fs.mkdirSync(schemaDir, { recursive: true });

  changedFiles.push(...syncSchemaFiles(schemaDir));

  let refreshedModules = 0;
  for (const moduleRef of manifest.modules ?? []) {
    const modulePath = path.join(targetRoot, moduleRef.path ?? "");
    if (!fs.existsSync(modulePath)) {
      throw new Error("module path missing during upgrade: " + (moduleRef.path ?? ""));
    }
    const moduleText = fs.readFileSync(modulePath, "utf8");
    moduleRef.tokens_approx = estimateTokens(moduleText);
    refreshedModules += 1;
  }

  manifest.updated = nowIso();
  if (options.bump) {
    manifest.sys_v = Number.isInteger(manifest.sys_v) ? manifest.sys_v + 1 : 1;
  }

  changedFiles.push("manifest.json");

  if (!options.dryRun) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  }

  const result = {
    action: "upgrade corpus",
    root: targetRoot,
    dry_run: options.dryRun,
    bumped_sys_v: options.bump,
    sys_v: manifest.sys_v ?? null,
    refreshed_modules: refreshedModules,
    files: changedFiles
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result);
  }

  return 0;
}

function parseArgs(argv) {
  const options = {
    root: ".",
    json: false,
    dryRun: false,
    bump: true
  };

  const queue = [...argv];
  if (queue.length > 0 && !queue[0].startsWith("-")) {
    options.root = queue.shift();
  }

  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--no-bump") {
      options.bump = false;
      continue;
    }
    throw new Error("Unknown upgrade arg: " + arg);
  }

  return options;
}

function syncSchemaFiles(targetSchemaDir) {
  const files = [];
  copySchemaFile(path.join(PACKAGE_ROOT, "schema", "manifest.schema.json"), path.join(targetSchemaDir, "manifest.schema.json"), files);
  copySchemaFile(path.join(PACKAGE_ROOT, "schema", "module.schema.json"), path.join(targetSchemaDir, "module.schema.json"), files);
  return files;
}

function copySchemaFile(sourcePath, targetPath, files) {
  if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }
  files.push(normalizePath(path.relative(path.dirname(targetPath), targetPath)));
}

function printResult(result) {
  console.log("OK " + result.action);
  console.log("root=" + result.root);
  console.log("dry_run=" + String(result.dry_run) + " bumped_sys_v=" + String(result.bumped_sys_v) + " sys_v=" + String(result.sys_v));
  console.log("refreshed_modules=" + String(result.refreshed_modules));
  for (const file of result.files) {
    console.log("  updated " + file);
  }
}

function estimateTokens(text) {
  return Math.ceil(String(text ?? "").length / 4);
}

function nowIso() {
  const iso = new Date().toISOString();
  if (iso.includes(".")) {
    return iso.split(".")[0] + "Z";
  }
  return iso;
}

function normalizePath(value) {
  return String(value ?? "").replaceAll(path.sep, "/");
}
