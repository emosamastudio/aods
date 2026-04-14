import fs from "node:fs";
import path from "node:path";

import {
  MODULE_CATEGORIES,
  MODULE_LAYERS,
  MODULE_PRIORITIES,
  copySchemaFiles,
  createModuleRef,
  ensureTargetDirectory,
  estimateTokens,
  insertBootModule,
  isRelativePath,
  normalizePath,
  nowIso,
  writeJson
} from "./corpus-helpers.mjs";
import { validateCorpus } from "./validate.mjs";

export async function runCompileCommand(argv) {
  const options = parseArgs(argv);
  const sourcePath = path.resolve(options.sourcePath);
  const sourceRoot = path.dirname(sourcePath);
  const targetRoot = path.resolve(options.targetDir);

  const source = loadSource(sourcePath);
  validateAuthoringSource(source, sourcePath);

  const compiled = compileAuthoringSource(source, sourceRoot);
  ensureTargetDirectory(targetRoot, options.force, { cleanOnForce: true });
  writeCompiledCorpus(targetRoot, compiled);

  const report = validateCorpus(targetRoot);
  const result = {
    action: "compile corpus",
    source: sourcePath,
    root: targetRoot,
    created_files: compiled.files,
    validation: report.summary
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result);
  }

  return report.summary.errors > 0 ? 1 : 0;
}

function parseArgs(argv) {
  const options = {
    sourcePath: "",
    targetDir: "",
    json: false,
    force: false
  };

  const queue = [...argv];
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (!options.sourcePath) {
      options.sourcePath = arg;
      continue;
    }
    if (!options.targetDir) {
      options.targetDir = arg;
      continue;
    }
    throw new Error(`Unknown compile arg: ${arg}`);
  }

  if (!options.sourcePath || !options.targetDir) {
    throw new Error("Usage: compile <source-file> <target-dir> [--json] [--force]");
  }

  return options;
}

function loadSource(sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Authoring source not found: ${sourcePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  } catch (error) {
    throw new Error(`Authoring source is not valid JSON: ${sourcePath}`);
  }
}

function validateAuthoringSource(source, sourcePath) {
  if (!isPlainObject(source)) {
    throw new Error(`Authoring source must be a JSON object: ${sourcePath}`);
  }
  if (source.authoring_v !== 1) {
    throw new Error(`authoring_v must be 1 in ${sourcePath}`);
  }
  if (!isPlainObject(source.corpus)) {
    throw new Error(`corpus must be an object in ${sourcePath}`);
  }
  if (!isNonEmptyString(source.corpus.sys)) {
    throw new Error(`corpus.sys is required in ${sourcePath}`);
  }
  if (!Array.isArray(source.modules) || source.modules.length === 0) {
    throw new Error(`modules must be a non-empty array in ${sourcePath}`);
  }

  const seenModuleIds = new Set();
  const seenPaths = new Set();

  for (const module of source.modules) {
    if (!isPlainObject(module)) {
      throw new Error("Every module entry must be an object.");
    }
    if (!isNonEmptyString(module.id)) {
      throw new Error("Each module requires a non-empty id.");
    }
    if (seenModuleIds.has(module.id)) {
      throw new Error(`Duplicate module id in authoring source: ${module.id}`);
    }
    seenModuleIds.add(module.id);

    if (!MODULE_CATEGORIES.has(module.category)) {
      throw new Error(`Invalid module category for ${module.id}: ${module.category}`);
    }
    if (!MODULE_LAYERS.has(module.layer)) {
      throw new Error(`Invalid module layer for ${module.id}: ${module.layer}`);
    }
    if (module.priority && !MODULE_PRIORITIES.has(module.priority)) {
      throw new Error(`Invalid module priority for ${module.id}: ${module.priority}`);
    }
    if ((module.category === "capsule" && module.layer !== "capsule") || (module.layer === "capsule" && module.category !== "capsule")) {
      throw new Error(`category=capsule and layer=capsule must stay aligned for ${module.id}`);
    }
    if (!isNonEmptyString(module.scope)) {
      throw new Error(`Module scope is required for ${module.id}`);
    }
    if (!Array.isArray(module.sections) || module.sections.length === 0) {
      throw new Error(`Module ${module.id} must define at least one section.`);
    }

    const relativePath = module.path ?? `modules/${module.id}.json`;
    if (!isRelativePath(relativePath)) {
      throw new Error(`Module path must be relative for ${module.id}: ${relativePath}`);
    }
    const normalizedPath = normalizePath(relativePath);
    if (seenPaths.has(normalizedPath)) {
      throw new Error(`Duplicate output path in authoring source: ${normalizedPath}`);
    }
    seenPaths.add(normalizedPath);
  }

  for (const file of source.files ?? []) {
    if (!isPlainObject(file) || !isNonEmptyString(file.path)) {
      throw new Error("Every file entry requires a relative path.");
    }
    if (!isRelativePath(file.path)) {
      throw new Error(`Compiled file path must be relative: ${file.path}`);
    }
    const hasInlineContent = typeof file.content === "string";
    const hasSourcePath = typeof file.source_path === "string";
    if (hasInlineContent === hasSourcePath) {
      throw new Error(`File ${file.path} must define exactly one of content or source_path.`);
    }
    if (hasSourcePath && !isRelativePath(file.source_path)) {
      throw new Error(`source_path must be relative for ${file.path}: ${file.source_path}`);
    }
    const normalizedPath = normalizePath(file.path);
    if (seenPaths.has(normalizedPath)) {
      throw new Error(`Duplicate output path in authoring source: ${normalizedPath}`);
    }
    seenPaths.add(normalizedPath);
  }

  const knownModuleIds = new Set(source.modules.map((module) => module.id));
  for (const moduleId of source.boot?.sequence ?? []) {
    if (!knownModuleIds.has(moduleId)) {
      throw new Error(`boot.sequence references missing module: ${moduleId}`);
    }
  }

  for (const [roleId, moduleIds] of Object.entries(source.boot?.by_role ?? {})) {
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      throw new Error(`boot.by_role.${roleId} must be a non-empty array.`);
    }
    for (const moduleId of moduleIds) {
      if (!knownModuleIds.has(moduleId)) {
        throw new Error(`boot.by_role.${roleId} references missing module: ${moduleId}`);
      }
    }
  }

  for (const route of source.boot?.by_touch ?? []) {
    const moduleIds = route.load_modules ?? route.load;
    if (!isPlainObject(route) || !isNonEmptyString(route.match)) {
      throw new Error("Each boot.by_touch entry requires match.");
    }
    if (!isRelativePath(route.match)) {
      throw new Error(`boot.by_touch match must be relative: ${route.match}`);
    }
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      throw new Error(`boot.by_touch ${route.match} requires load or load_modules.`);
    }
    for (const moduleId of moduleIds) {
      if (!knownModuleIds.has(moduleId)) {
        throw new Error(`boot.by_touch ${route.match} references missing module: ${moduleId}`);
      }
    }
  }

  const knownHumanFiles = new Set((source.files ?? []).map((file) => normalizePath(file.path)));
  for (const pair of source.surface_pairs ?? []) {
    if (!isPlainObject(pair) || !isNonEmptyString(pair.pair_id)) {
      throw new Error("Each surface_pairs entry requires pair_id.");
    }
    if (!knownModuleIds.has(pair.agent_primary)) {
      throw new Error(`surface pair ${pair.pair_id} references missing agent_primary: ${pair.agent_primary}`);
    }
    for (const moduleId of pair.agent_supporting ?? []) {
      if (!knownModuleIds.has(moduleId)) {
        throw new Error(`surface pair ${pair.pair_id} references missing supporting module: ${moduleId}`);
      }
    }
    if (!knownHumanFiles.has(normalizePath(pair.human_primary ?? ""))) {
      throw new Error(`surface pair ${pair.pair_id} references missing human surface: ${pair.human_primary}`);
    }
  }
}

function compileAuthoringSource(source, sourceRoot) {
  const createdAt = source.corpus.created ?? nowIso();
  const updatedAt = source.corpus.updated ?? createdAt;
  const humanFiles = resolveHumanFiles(source.files ?? [], sourceRoot);
  const modules = source.modules.map((module) => compileModule(module));
  const manifest = buildManifest(source, modules, createdAt, updatedAt);

  return {
    manifest,
    modules,
    humanFiles,
    files: [
      "manifest.json",
      "schema/manifest.schema.json",
      "schema/module.schema.json",
      ...humanFiles.map((file) => file.path),
      ...modules.map((module) => module.path)
    ]
  };
}

function resolveHumanFiles(files, sourceRoot) {
  return files.map((file) => {
    const relativePath = normalizePath(file.path);
    const content =
      typeof file.content === "string"
        ? file.content
        : fs.readFileSync(path.join(sourceRoot, file.source_path), "utf8");
    return {
      path: relativePath,
      content
    };
  });
}

function compileModule(module) {
  const relativePath = normalizePath(module.path ?? `modules/${module.id}.json`);
  const version = Number.isInteger(module.v) ? module.v : 1;
  const compiledModule = {
    aods_v: 3,
    module_id: module.id,
    v: version,
    context: module.context ?? module.scope,
    sections: module.sections
  };

  if (Array.isArray(module.assumptions) && module.assumptions.length > 0) {
    compiledModule.assumptions = module.assumptions;
  }
  if (Array.isArray(module.artifacts) && module.artifacts.length > 0) {
    compiledModule.artifacts = module.artifacts;
  }
  compiledModule.changelog = Array.isArray(module.changelog) && module.changelog.length > 0
    ? module.changelog
    : [{ v: version, delta: "Initial compiled module." }];

  const meta = buildModuleMeta(module);
  if (meta) {
    compiledModule.meta = meta;
  }

  return {
    id: module.id,
    path: relativePath,
    scope: module.scope,
    category: module.category,
    layer: module.layer,
    priority: module.priority ?? "standard",
    tags: module.tags ?? [],
    deps: module.deps ?? [],
    boot: Boolean(module.boot),
    content: compiledModule
  };
}

function buildModuleMeta(module) {
  const meta = isPlainObject(module.meta) ? cloneValue(module.meta) : {};
  if (!meta.stability) {
    meta.stability = module.layer === "evidence" ? "evolving" : "stable";
  }
  if (!meta.review_cycle) {
    meta.review_cycle = "on-change";
  }

  if (isPlainObject(module.capsule)) {
    meta.capsule = cloneValue(module.capsule);
  } else if (module.category === "capsule" && !meta.capsule) {
    const routesTo = dedupe(
      module.sections.flatMap((section) =>
        Array.isArray(section.refs)
          ? section.refs
              .filter((ref) => typeof ref === "string" && ref.includes(":"))
              .map((ref) => ref.split(":")[0])
          : []
      )
    );
    meta.capsule = {
      read_when: [`Need summary routing for ${module.id}`],
      core_question: `Which route should ${module.id} open next?`,
      routes_to: routesTo,
      frozen_decisions: [
        "Capsule stays short",
        "Detail modules hold durable semantics"
      ]
    };
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

function buildManifest(source, modules, createdAt, updatedAt) {
  const manifest = {
    aods_v: 3,
    sys: source.corpus.sys,
    sys_v: Number.isInteger(source.corpus.sys_v) ? source.corpus.sys_v : 1,
    created: createdAt,
    updated: updatedAt,
    modules: modules.map((module) =>
      createModuleRef({
        id: module.id,
        relativePath: module.path,
        scope: module.scope,
        category: module.category,
        layer: module.layer,
        priority: module.priority,
        tags: module.tags,
        deps: module.deps,
        tokensApprox: estimateTokens(JSON.stringify(module.content, null, 2))
      })
    ),
    boot_sequence: buildBootSequence(source, modules)
  };

  if (isNonEmptyString(source.corpus.purpose)) {
    manifest.purpose = source.corpus.purpose;
  }
  if (isPlainObject(source.corpus.glossary) && Object.keys(source.corpus.glossary).length > 0) {
    manifest.glossary = source.corpus.glossary;
  }
  if (Array.isArray(source.corpus.roles) && source.corpus.roles.length > 0) {
    manifest.roles = source.corpus.roles;
  }

  const bootByRole = buildBootByRole(source);
  if (bootByRole) {
    manifest.boot_by_role = bootByRole;
  }

  const bootByTouch = buildTouchRoutes(source.boot?.by_touch ?? []);
  if (bootByTouch.length > 0) {
    manifest.boot_by_touch = bootByTouch;
  }

  if (Array.isArray(source.surface_pairs) && source.surface_pairs.length > 0) {
    manifest.surface_pairs = source.surface_pairs;
  }

  return manifest;
}

function buildBootSequence(source, modules) {
  if (Array.isArray(source.boot?.sequence) && source.boot.sequence.length > 0) {
    return [...source.boot.sequence];
  }

  const bootSequence = [];
  for (const module of modules) {
    if (module.boot || module.layer === "root" || module.layer === "capsule") {
      insertBootModule(bootSequence, module.id, module.layer, modules);
    }
  }

  if (bootSequence.length === 0) {
    throw new Error("Compiled boot sequence would be empty. Add a root or capsule module, or set boot=true.");
  }

  return bootSequence;
}

function buildBootByRole(source) {
  if (source.boot?.by_role && Object.keys(source.boot.by_role).length > 0) {
    return source.boot.by_role;
  }

  const bootByRole = {};
  for (const role of source.corpus.roles ?? []) {
    if (Array.isArray(role.required_modules) && role.required_modules.length > 0) {
      bootByRole[role.id] = role.required_modules;
    }
  }

  return Object.keys(bootByRole).length > 0 ? bootByRole : undefined;
}

function buildTouchRoutes(routes) {
  return routes.map((route) => {
    const compiledRoute = {
      match: normalizePath(route.match),
      load_modules: route.load_modules ?? route.load
    };
    if (route.intent) {
      compiledRoute.intent = route.intent;
    }
    if (route.reason) {
      compiledRoute.reason = route.reason;
    }
    return compiledRoute;
  });
}

function writeCompiledCorpus(targetRoot, compiled) {
  copySchemaFiles(path.join(targetRoot, "schema"));
  for (const file of compiled.humanFiles) {
    const outputPath = path.join(targetRoot, file.path);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, file.content);
  }
  for (const module of compiled.modules) {
    writeJson(path.join(targetRoot, module.path), module.content);
  }
  writeJson(path.join(targetRoot, "manifest.json"), compiled.manifest);
}

function printResult(result) {
  console.log(`OK ${result.action}`);
  console.log(`source=${result.source}`);
  console.log(`root=${result.root}`);
  console.log(
    `validation errors=${result.validation.errors} warnings=${result.validation.warnings} modules=${result.validation.total_modules}`
  );
  for (const file of result.created_files) {
    console.log(`  wrote ${file}`);
  }
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function dedupe(values) {
  return [...new Set(values)];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
