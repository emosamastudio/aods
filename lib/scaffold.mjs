import fs from "node:fs";
import path from "node:path";

import {
  MODULE_CATEGORIES,
  MODULE_CATEGORY_VALUES,
  MODULE_LAYERS,
  MODULE_LAYER_VALUES,
  MODULE_PRIORITIES,
  MODULE_PRIORITY_VALUES,
  ROUTE_INTENTS,
  ROUTE_INTENT_VALUES,
  SURFACE_PAIR_SCOPES,
  SURFACE_PAIR_SCOPE_VALUES,
  SURFACE_PAIR_STATUSES,
  SURFACE_PAIR_STATUS_VALUES,
  SURFACE_PAIR_SYNC_SOURCES,
  SURFACE_PAIR_SYNC_SOURCE_VALUES,
  copySchemaFiles,
  createModuleRef,
  ensureTargetDirectory,
  estimateTokens,
  formatInvalidEnumMessage,
  insertBootModule,
  isRelativePath,
  normalizePath,
  nowIso,
  writeJson
} from "./corpus-helpers.mjs";
import { loadAuthoringSource, validateAuthoringSource } from "./compile.mjs";
import {
  buildManifestCompanion,
  DEFAULT_MANIFEST_COMPANION_PATH
} from "./manifest-runtime.mjs";
import {
  HUMAN_GENERATION_MODES,
  HUMAN_GENERATION_MODE_VALUES,
  HUMAN_GENERATION_PROFILES,
  HUMAN_GENERATION_PROFILE_VALUES
} from "./human-surface.mjs";

export async function runScaffoldCommand(argv) {
  const [subcommand, ...args] = argv;
  if (!subcommand) {
    throw new Error(
      "Missing scaffold subcommand. Use: scaffold corpus ... | scaffold authoring ... | scaffold module ... | scaffold authoring-module ... | scaffold authoring-touch ... | scaffold authoring-pair ..."
    );
  }

  if (subcommand === "corpus") {
    const result = scaffoldCorpus(parseCorpusArgs(args));
    printScaffoldResult(result);
    return 0;
  }

  if (subcommand === "authoring") {
    const result = scaffoldAuthoring(parseAuthoringArgs(args));
    printScaffoldResult(result);
    return 0;
  }

  if (subcommand === "module") {
    const result = scaffoldModule(parseModuleArgs(args));
    printScaffoldResult(result);
    return 0;
  }

  if (subcommand === "authoring-module") {
    const result = scaffoldAuthoringModule(parseAuthoringModuleArgs(args));
    printScaffoldResult(result);
    return 0;
  }

  if (subcommand === "authoring-touch") {
    const result = scaffoldAuthoringTouch(parseAuthoringTouchArgs(args));
    printScaffoldResult(result);
    return 0;
  }

  if (subcommand === "authoring-pair") {
    const result = scaffoldAuthoringPair(parseAuthoringPairArgs(args));
    printScaffoldResult(result);
    return 0;
  }

  throw new Error(`Unknown scaffold subcommand: ${subcommand}`);
}

function scaffoldCorpus(options) {
  if (!options.sys) {
    throw new Error("Missing required flag: --sys <system-id>");
  }

  const targetDir = path.resolve(options.targetDir);
  ensureTargetDirectory(targetDir, options.force);

  const schemaDir = path.join(targetDir, "schema");
  const modulesDir = path.join(targetDir, "modules");
  fs.mkdirSync(schemaDir, { recursive: true });
  fs.mkdirSync(modulesDir, { recursive: true });

  copySchemaFiles(schemaDir);

  const createdAt = nowIso();
  const sys = options.sys;
  const rootId = `${sys}-root`;
  const capsuleId = `${sys}-capsule`;
  const detailId = `${sys}-detail`;

  const rootModule = createRootModule({
    sys,
    moduleId: rootId,
    capsuleId
  });
  const capsuleModule = createCapsuleModule({
    sys,
    moduleId: capsuleId,
    detailRoute: `${detailId}:system-detail`
  });
  const detailModule = createDetailModule({
    sys,
    moduleId: detailId
  });

  const manifest = {
    aods_v: 3,
    sys,
    sys_v: 1,
    created: createdAt,
    updated: createdAt,
    purpose: options.purpose ?? `AODS corpus for ${sys}. Replace scaffold placeholders with system-specific semantics.`,
    modules: [
      createModuleRef({
        id: rootId,
        relativePath: `modules/${rootId}.json`,
        scope: `${sys} root routing and cold-start orientation.`,
        category: "architecture",
        layer: "root",
        priority: "critical",
        tags: ["root", "routing", "scaffold"],
        tokensApprox: estimateTokens(JSON.stringify(rootModule))
      }),
      createModuleRef({
        id: capsuleId,
        relativePath: `modules/${capsuleId}.json`,
        scope: `${sys} summary capsule and route fanout.`,
        category: "capsule",
        layer: "capsule",
        priority: "critical",
        tags: ["capsule", "summary", "scaffold"],
        tokensApprox: estimateTokens(JSON.stringify(capsuleModule))
      }),
      createModuleRef({
        id: detailId,
        relativePath: `modules/${detailId}.json`,
        scope: `${sys} authoritative detail placeholder.`,
        category: "policy",
        layer: "detail",
        priority: "standard",
        tags: ["detail", "authority", "scaffold"],
        tokensApprox: estimateTokens(JSON.stringify(detailModule))
      })
    ],
    boot_sequence: [rootId, capsuleId],
    companion_index: DEFAULT_MANIFEST_COMPANION_PATH
  };
  const companion = buildManifestCompanion({
    glossary: {
      system: `${sys} documentation corpus`
    },
    bootByTouch: [
      {
        match: "manifest.json",
        intent: "write",
        load_modules: [rootId, capsuleId, detailId],
        reason: "manifest edits affect corpus routing and scope."
      },
      {
        match: DEFAULT_MANIFEST_COMPANION_PATH,
        intent: "write",
        load_modules: [rootId, capsuleId, detailId],
        reason: "companion edits affect routing, pairing, and corpus scope."
      },
      {
        match: "README.md",
        intent: "write",
        load_modules: [capsuleId, detailId],
        reason: "README is the paired human surface."
      },
      {
        match: `modules/${rootId}.json`,
        intent: "write",
        load_modules: [rootId, capsuleId],
        reason: "root edits should stay route-oriented."
      },
      {
        match: `modules/${capsuleId}.json`,
        intent: "write",
        load_modules: [rootId, capsuleId, detailId],
        reason: "capsule edits affect summary routing."
      },
      {
        match: "modules/*.json",
        intent: "write",
        load_modules: [rootId, capsuleId, detailId],
        reason: "module edits should load root, capsule, and detail authority."
      }
    ],
    surfacePairs: [
      {
        pair_id: `pair-${sys}-readme`,
        scope: "system",
        agent_primary: capsuleId,
        agent_supporting: [rootId, detailId],
        human_primary: "README.md",
        sync_source: "agent-primary",
        status: "paired"
      }
    ]
  });

  const readme = createReadme({
    sys,
    rootId,
    capsuleId,
    detailId
  });

  writeJson(path.join(targetDir, "manifest.json"), manifest);
  writeJson(path.join(targetDir, manifest.companion_index), companion, { compact: true });
  writeJson(path.join(modulesDir, `${rootId}.json`), rootModule);
  writeJson(path.join(modulesDir, `${capsuleId}.json`), capsuleModule);
  writeJson(path.join(modulesDir, `${detailId}.json`), detailModule);
  fs.writeFileSync(path.join(targetDir, "README.md"), readme);

  return {
    action: "scaffold corpus",
    root: targetDir,
    files: [
      "manifest.json",
      DEFAULT_MANIFEST_COMPANION_PATH,
      "README.md",
      "schema/manifest.schema.json",
      "schema/manifest-companion.schema.json",
      "schema/module.schema.json",
      `modules/${rootId}.json`,
      `modules/${capsuleId}.json`,
      `modules/${detailId}.json`
    ]
  };
}

function scaffoldAuthoring(options) {
  if (!options.sys) {
    throw new Error("Missing required flag: --sys <system-id>");
  }

  const targetDir = path.resolve(options.targetDir);
  ensureTargetDirectory(targetDir, options.force);

  const sys = options.sys;
  const rootId = `${sys}-root`;
  const capsuleId = `${sys}-capsule`;
  const detailId = `${sys}-detail`;
  const readme = createReadme({
    sys,
    rootId,
    capsuleId,
    detailId
  });
  const authoring = createAuthoringSource({
    sys,
    purpose: options.purpose,
    rootId,
    capsuleId,
    detailId
  });

  fs.writeFileSync(path.join(targetDir, "README.md"), readme);
  writeJson(path.join(targetDir, "authoring.json"), authoring);

  return {
    action: "scaffold authoring",
    root: targetDir,
    files: ["README.md", "authoring.json"]
  };
}

function scaffoldModule(options) {
  const rootDir = path.resolve(options.rootDir);
  const manifestPath = path.join(rootDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const category = options.category ?? "policy";
  const layer = options.layer ?? (category === "capsule" ? "capsule" : "detail");

  if (!MODULE_CATEGORIES.has(category)) {
    throw new Error(formatInvalidEnumMessage("category", category, MODULE_CATEGORY_VALUES));
  }
  if (!MODULE_LAYERS.has(layer)) {
    throw new Error(formatInvalidEnumMessage("layer", layer, MODULE_LAYER_VALUES));
  }
  if (!MODULE_PRIORITIES.has(options.priority)) {
    throw new Error(formatInvalidEnumMessage("priority", options.priority, MODULE_PRIORITY_VALUES));
  }
  if ((category === "capsule" && layer !== "capsule") || (layer === "capsule" && category !== "capsule")) {
    throw new Error("category=capsule requires layer=capsule, and layer=capsule requires category=capsule");
  }
  if (category === "capsule" && options.routes.length === 0) {
    throw new Error("Capsule modules require at least one --route <module-id|module-id:sid>");
  }

  const relativePath = options.relativePath || `modules/${options.moduleId}.json`;
  if (!isRelativePath(relativePath)) {
    throw new Error(`Module path must be relative: ${relativePath}`);
  }

  const filePath = path.join(rootDir, relativePath);
  const existingByIdIndex = manifest.modules.findIndex((entry) => entry.id === options.moduleId);
  const existingByPathIndex = manifest.modules.findIndex((entry) => entry.path === relativePath);

  if ((existingByIdIndex !== -1 || existingByPathIndex !== -1 || fs.existsSync(filePath)) && !options.force) {
    throw new Error(`Module id or path already exists. Use --force to overwrite: ${options.moduleId} -> ${relativePath}`);
  }

  const moduleJson = createModuleSkeleton({
    moduleId: options.moduleId,
    category,
    layer,
    scope: options.scope,
    routes: options.routes
  });

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeJson(filePath, moduleJson);

  const moduleRef = createModuleRef({
    id: options.moduleId,
    relativePath,
    scope: options.scope,
    category,
    layer,
    priority: options.priority,
    tags: options.tags,
    deps: options.deps,
    tokensApprox: estimateTokens(JSON.stringify(moduleJson))
  });

  if (existingByIdIndex !== -1) {
    manifest.modules.splice(existingByIdIndex, 1, moduleRef);
  } else if (existingByPathIndex !== -1) {
    manifest.modules.splice(existingByPathIndex, 1, moduleRef);
  } else {
    manifest.modules.push(moduleRef);
  }

  if (options.boot && !manifest.boot_sequence.includes(options.moduleId)) {
    insertBootModule(manifest.boot_sequence, options.moduleId, layer, manifest.modules);
  }

  manifest.sys_v = Number.isInteger(manifest.sys_v) ? manifest.sys_v + 1 : 1;
  manifest.updated = nowIso();
  writeJson(manifestPath, manifest);

  return {
    action: "scaffold module",
    root: rootDir,
    files: [relativePath, "manifest.json"]
  };
}

function scaffoldAuthoringModule(options) {
  const sourcePath = path.resolve(options.sourcePath);
  const sourceRoot = path.dirname(sourcePath);
  const source = loadValidatedAuthoringSource(sourcePath);
  const category = options.category ?? "policy";
  const layer = options.layer ?? (category === "capsule" ? "capsule" : "detail");

  if (!MODULE_CATEGORIES.has(category)) {
    throw new Error(formatInvalidEnumMessage("category", category, MODULE_CATEGORY_VALUES));
  }
  if (!MODULE_LAYERS.has(layer)) {
    throw new Error(formatInvalidEnumMessage("layer", layer, MODULE_LAYER_VALUES));
  }
  if (!MODULE_PRIORITIES.has(options.priority)) {
    throw new Error(formatInvalidEnumMessage("priority", options.priority, MODULE_PRIORITY_VALUES));
  }
  if ((category === "capsule" && layer !== "capsule") || (layer === "capsule" && category !== "capsule")) {
    throw new Error("category=capsule requires layer=capsule, and layer=capsule requires category=capsule");
  }
  if (category === "capsule" && options.routes.length === 0) {
    throw new Error("Capsule modules require at least one --route <module-id|module-id:sid>");
  }

  const relativePath = normalizePath(options.relativePath || defaultAuthoringModulePath(options.moduleId));
  if (!isRelativePath(relativePath)) {
    throw new Error(`Module path must be relative: ${relativePath}`);
  }
  const existingIndex = source.modules.findIndex(
    (module) =>
      module.id === options.moduleId ||
      normalizePath(module.path ?? defaultAuthoringModulePath(module.id)) === relativePath
  );

  if (existingIndex !== -1 && !options.force) {
    throw new Error(`Module id or path already exists in authoring source. Use --force to overwrite: ${options.moduleId} -> ${relativePath}`);
  }

  const moduleEntry = createAuthoringModuleSkeleton({
    moduleId: options.moduleId,
    category,
    layer,
    scope: options.scope,
    routes: options.routes
  });
  moduleEntry.priority = options.priority;
  if (options.relativePath) {
    moduleEntry.path = relativePath;
  }
  if (options.tags.length > 0) {
    moduleEntry.tags = dedupeStrings(options.tags);
  }
  if (options.deps.length > 0) {
    moduleEntry.deps = dedupeStrings(options.deps);
  }
  if (options.boot && (!Array.isArray(source.boot?.sequence) || source.boot.sequence.length === 0)) {
    moduleEntry.boot = true;
  }

  if (existingIndex !== -1) {
    source.modules.splice(existingIndex, 1, moduleEntry);
  } else {
    source.modules.push(moduleEntry);
  }

  if (options.boot) {
    source.boot ??= {};
    if (Array.isArray(source.boot.sequence) && source.boot.sequence.length > 0) {
      insertBootModule(
        source.boot.sequence,
        options.moduleId,
        layer,
        source.modules.map((module) => ({ id: module.id, layer: module.layer }))
      );
    }
  }

  if (options.roles.length > 0) {
    attachModuleToAuthoringRoles(source, options.roles, options.moduleId);
  }

  writeValidatedAuthoringSource(sourcePath, source);
  return {
    action: "scaffold authoring-module",
    root: sourceRoot,
    files: [displayRelativePath(sourceRoot, sourcePath)]
  };
}

function scaffoldAuthoringTouch(options) {
  const sourcePath = path.resolve(options.sourcePath);
  const sourceRoot = path.dirname(sourcePath);
  const source = loadValidatedAuthoringSource(sourcePath);
  const match = normalizePath(options.match);

  if (!isRelativePath(match)) {
    throw new Error(`Touch route match must be relative: ${match}`);
  }
  if (options.intent && !ROUTE_INTENTS.has(options.intent)) {
    throw new Error(formatInvalidEnumMessage("touch route intent", options.intent, ROUTE_INTENT_VALUES));
  }

  const knownModuleIds = new Set(source.modules.map((module) => module.id));
  for (const moduleId of options.loadModules) {
    if (!knownModuleIds.has(moduleId)) {
      throw new Error(`Touch route ${match} references missing module: ${moduleId}`);
    }
  }

  source.boot ??= {};
  source.boot.by_touch ??= [];

  const route = {
    match,
    load_modules: dedupeStrings(options.loadModules)
  };
  if (options.intent) {
    route.intent = options.intent;
  }
  if (options.reason) {
    route.reason = options.reason;
  }

  const key = makeTouchRouteKey(match, options.intent ?? "");
  const existingIndex = source.boot.by_touch.findIndex(
    (entry) => makeTouchRouteKey(entry.match, entry.intent ?? "") === key
  );
  if (existingIndex !== -1 && !options.force) {
    throw new Error(`Touch route already exists for ${match}${options.intent ? ` intent=${options.intent}` : ""}. Use --force to replace it.`);
  }

  if (existingIndex !== -1) {
    source.boot.by_touch.splice(existingIndex, 1, route);
  } else {
    source.boot.by_touch.push(route);
  }

  writeValidatedAuthoringSource(sourcePath, source);
  return {
    action: "scaffold authoring-touch",
    root: sourceRoot,
    files: [displayRelativePath(sourceRoot, sourcePath)]
  };
}

function scaffoldAuthoringPair(options) {
  const sourcePath = path.resolve(options.sourcePath);
  const sourceRoot = path.dirname(sourcePath);
  const source = loadValidatedAuthoringSource(sourcePath);
  const humanPrimary = normalizePath(options.humanPrimary);
  const usesGeneratedHuman = Boolean(options.generatedProfile);
  const sourceFilePath = usesGeneratedHuman ? "" : normalizePath(options.fileSourcePath || humanPrimary);

  if (!SURFACE_PAIR_SCOPES.has(options.scope)) {
    throw new Error(formatInvalidEnumMessage("pair scope", options.scope, SURFACE_PAIR_SCOPE_VALUES));
  }
  if (!SURFACE_PAIR_SYNC_SOURCES.has(options.syncSource)) {
    throw new Error(formatInvalidEnumMessage("pair sync_source", options.syncSource, SURFACE_PAIR_SYNC_SOURCE_VALUES));
  }
  if (!SURFACE_PAIR_STATUSES.has(options.status)) {
    throw new Error(formatInvalidEnumMessage("pair status", options.status, SURFACE_PAIR_STATUS_VALUES));
  }
  if (!ROUTE_INTENTS.has(options.routeIntent)) {
    throw new Error(formatInvalidEnumMessage("pair route intent", options.routeIntent, ROUTE_INTENT_VALUES));
  }
  if (usesGeneratedHuman && !HUMAN_GENERATION_MODES.has(options.generatedMode)) {
    throw new Error(formatInvalidEnumMessage("pair generated mode", options.generatedMode, HUMAN_GENERATION_MODE_VALUES));
  }
  if (usesGeneratedHuman && !HUMAN_GENERATION_PROFILES.has(options.generatedProfile)) {
    throw new Error(
      formatInvalidEnumMessage("pair generated profile", options.generatedProfile, HUMAN_GENERATION_PROFILE_VALUES)
    );
  }
  if (!isRelativePath(humanPrimary)) {
    throw new Error(`human_primary must be relative: ${humanPrimary}`);
  }
  if (!usesGeneratedHuman && !isRelativePath(sourceFilePath)) {
    throw new Error(`source_path must be relative: ${sourceFilePath}`);
  }
  for (const humanPath of options.humanSupporting) {
    if (!isRelativePath(humanPath)) {
      throw new Error(`human_supporting paths must be relative: ${humanPath}`);
    }
  }

  const knownModuleIds = new Set(source.modules.map((module) => module.id));
  if (!knownModuleIds.has(options.agentPrimary)) {
    throw new Error(`Pair ${options.pairId} references missing agent_primary: ${options.agentPrimary}`);
  }
  for (const moduleId of options.agentSupporting) {
    if (!knownModuleIds.has(moduleId)) {
      throw new Error(`Pair ${options.pairId} references missing supporting module: ${moduleId}`);
    }
  }

  if (usesGeneratedHuman && options.syncSource !== "agent-primary") {
    throw new Error("Generated human surfaces require --sync-source agent-primary");
  }

  const existingFileEntry = usesGeneratedHuman
    ? removeHumanFileEntry(source, {
        humanPrimary,
        force: options.force
      })
    : ensureHumanFileEntry(source, {
        humanPrimary,
        sourceFilePath,
        force: options.force
      });

  source.surface_pairs ??= [];
  let conflictingIndex = source.surface_pairs.findIndex(
    (pair) => pair.human_primary === humanPrimary && pair.pair_id !== options.pairId
  );
  if (conflictingIndex !== -1 && !options.force) {
    throw new Error(`Human surface already paired: ${humanPrimary}. Use --force to replace the existing pair.`);
  }
  if (conflictingIndex !== -1) {
    source.surface_pairs.splice(conflictingIndex, 1);
  }

  const pair = {
    pair_id: options.pairId,
    scope: options.scope,
    agent_primary: options.agentPrimary,
    human_primary: humanPrimary,
    sync_source: options.syncSource,
    status: options.status
  };
  if (options.agentSupporting.length > 0) {
    pair.agent_supporting = dedupeStrings(options.agentSupporting);
  }
  if (options.humanSupporting.length > 0) {
    pair.human_supporting = dedupeStrings(options.humanSupporting).map((value) => normalizePath(value));
  }
  if (usesGeneratedHuman) {
    pair.human_generation = {
      mode: options.generatedMode,
      profile: options.generatedProfile
    };
    if (options.generatedTitle) {
      pair.human_generation.title = options.generatedTitle;
    }
  }

  let pairIndex = source.surface_pairs.findIndex((entry) => entry.pair_id === options.pairId);
  if (pairIndex !== -1 && !options.force) {
    throw new Error(`Pair already exists: ${options.pairId}. Use --force to replace it.`);
  }
  if (pairIndex !== -1) {
    source.surface_pairs.splice(pairIndex, 1, pair);
  } else {
    source.surface_pairs.push(pair);
  }

  source.boot ??= {};
  source.boot.by_touch ??= [];
  const pairRoute = {
    match: humanPrimary,
    intent: options.routeIntent,
    load_modules: dedupeStrings([options.agentPrimary, ...options.agentSupporting]),
    reason:
      options.routeReason ||
      `Paired human surface ${humanPrimary} should stay aligned with ${options.agentPrimary}.`
  };
  const routeKey = makeTouchRouteKey(humanPrimary, options.routeIntent);
  const existingRouteIndex = source.boot.by_touch.findIndex(
    (entry) => makeTouchRouteKey(entry.match, entry.intent ?? "") === routeKey
  );
  if (existingRouteIndex === -1) {
    source.boot.by_touch.push(pairRoute);
  } else if (options.force) {
    source.boot.by_touch.splice(existingRouteIndex, 1, pairRoute);
  }

  const writtenFiles = [displayRelativePath(sourceRoot, sourcePath)];
  if (!usesGeneratedHuman && existingFileEntry.fileEntry.source_path) {
    const stubPath = path.join(sourceRoot, existingFileEntry.fileEntry.source_path);
    if (!fs.existsSync(stubPath)) {
      fs.mkdirSync(path.dirname(stubPath), { recursive: true });
      fs.writeFileSync(stubPath, createPairedSurfaceStub({
        humanPrimary,
        agentPrimary: options.agentPrimary
      }));
      writtenFiles.push(displayRelativePath(sourceRoot, stubPath));
    } else if (existingFileEntry.created) {
      writtenFiles.push(displayRelativePath(sourceRoot, stubPath));
    }
  }

  writeValidatedAuthoringSource(sourcePath, source);
  return {
    action: "scaffold authoring-pair",
    root: sourceRoot,
    files: writtenFiles
  };
}

function parseCorpusArgs(args) {
  if (args.length === 0) {
    throw new Error("Missing target dir. Usage: scaffold corpus <target-dir> --sys <system-id>");
  }

  const options = {
    targetDir: null,
    sys: "",
    purpose: "",
    force: false
  };

  const queue = [...args];
  options.targetDir = queue.shift();

  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--sys") {
      options.sys = requireValue(arg, queue);
      continue;
    }
    if (arg === "--purpose") {
      options.purpose = requireValue(arg, queue);
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    throw new Error(`Unknown corpus scaffold arg: ${arg}`);
  }

  return options;
}

function parseAuthoringArgs(args) {
  if (args.length === 0) {
    throw new Error("Missing target dir. Usage: scaffold authoring <target-dir> --sys <system-id>");
  }

  const options = {
    targetDir: null,
    sys: "",
    purpose: "",
    force: false
  };

  const queue = [...args];
  options.targetDir = queue.shift();

  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--sys") {
      options.sys = requireValue(arg, queue);
      continue;
    }
    if (arg === "--purpose") {
      options.purpose = requireValue(arg, queue);
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    throw new Error(`Unknown authoring scaffold arg: ${arg}`);
  }

  return options;
}

function parseModuleArgs(args) {
  if (args.length < 2) {
    throw new Error("Usage: scaffold module <corpus-root> <module-id> [--path ...]");
  }

  const options = {
    rootDir: args[0],
    moduleId: args[1],
    relativePath: "",
    category: "",
    layer: "",
    scope: "",
    priority: "standard",
    tags: [],
    deps: [],
    routes: [],
    boot: false,
    force: false
  };

  const queue = args.slice(2);
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--path") {
      options.relativePath = requireValue(arg, queue);
      continue;
    }
    if (arg === "--category") {
      options.category = requireValue(arg, queue);
      continue;
    }
    if (arg === "--layer") {
      options.layer = requireValue(arg, queue);
      continue;
    }
    if (arg === "--scope") {
      options.scope = requireValue(arg, queue);
      continue;
    }
    if (arg === "--priority") {
      options.priority = requireValue(arg, queue);
      continue;
    }
    if (arg === "--tag") {
      options.tags.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--dep") {
      options.deps.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--route") {
      options.routes.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--boot") {
      options.boot = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    throw new Error(`Unknown module scaffold arg: ${arg}`);
  }

  if (!options.scope) {
    options.scope = `${options.moduleId} semantic coverage. Replace scaffold placeholder with real system-specific meaning.`;
  }

  return options;
}

function parseAuthoringModuleArgs(args) {
  if (args.length < 2) {
    throw new Error("Usage: scaffold authoring-module <source-file> <module-id> [--path ...]");
  }

  const options = {
    sourcePath: args[0],
    moduleId: args[1],
    relativePath: "",
    category: "",
    layer: "",
    scope: "",
    priority: "standard",
    tags: [],
    deps: [],
    roles: [],
    routes: [],
    boot: false,
    force: false
  };

  const queue = args.slice(2);
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--path") {
      options.relativePath = requireValue(arg, queue);
      continue;
    }
    if (arg === "--category") {
      options.category = requireValue(arg, queue);
      continue;
    }
    if (arg === "--layer") {
      options.layer = requireValue(arg, queue);
      continue;
    }
    if (arg === "--scope") {
      options.scope = requireValue(arg, queue);
      continue;
    }
    if (arg === "--priority") {
      options.priority = requireValue(arg, queue);
      continue;
    }
    if (arg === "--tag") {
      options.tags.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--dep") {
      options.deps.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--role") {
      options.roles.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--route") {
      options.routes.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--boot") {
      options.boot = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    throw new Error(`Unknown authoring-module scaffold arg: ${arg}`);
  }

  if (!options.scope) {
    options.scope = `${options.moduleId} semantic coverage. Replace scaffold placeholder with real system-specific meaning.`;
  }

  return options;
}

function parseAuthoringTouchArgs(args) {
  if (args.length === 0) {
    throw new Error("Usage: scaffold authoring-touch <source-file> --match <path> --load <module-id>...");
  }

  const options = {
    sourcePath: args[0],
    match: "",
    intent: "",
    loadModules: [],
    reason: "",
    force: false
  };

  const queue = args.slice(1);
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--match") {
      options.match = requireValue(arg, queue);
      continue;
    }
    if (arg === "--intent") {
      options.intent = requireValue(arg, queue);
      continue;
    }
    if (arg === "--load") {
      options.loadModules.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--reason") {
      options.reason = requireValue(arg, queue);
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    throw new Error(`Unknown authoring-touch scaffold arg: ${arg}`);
  }

  if (!options.match) {
    throw new Error("authoring-touch requires --match <path>");
  }
  if (options.loadModules.length === 0) {
    throw new Error("authoring-touch requires at least one --load <module-id>");
  }

  return options;
}

function parseAuthoringPairArgs(args) {
  if (args.length === 0) {
    throw new Error("Usage: scaffold authoring-pair <source-file> --pair-id <id> --agent-primary <module-id> --human-primary <path>");
  }

  const options = {
    sourcePath: args[0],
    pairId: "",
    agentPrimary: "",
    agentSupporting: [],
    humanPrimary: "",
    humanSupporting: [],
    scope: "system",
    syncSource: "agent-primary",
    status: "paired",
    fileSourcePath: "",
    routeIntent: "write",
    routeReason: "",
    generatedMode: "",
    generatedProfile: "",
    generatedTitle: "",
    force: false
  };

  const queue = args.slice(1);
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--pair-id") {
      options.pairId = requireValue(arg, queue);
      continue;
    }
    if (arg === "--agent-primary") {
      options.agentPrimary = requireValue(arg, queue);
      continue;
    }
    if (arg === "--agent-supporting") {
      options.agentSupporting.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--human-primary") {
      options.humanPrimary = requireValue(arg, queue);
      continue;
    }
    if (arg === "--human-supporting") {
      options.humanSupporting.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--scope") {
      options.scope = requireValue(arg, queue);
      continue;
    }
    if (arg === "--sync-source") {
      options.syncSource = requireValue(arg, queue);
      continue;
    }
    if (arg === "--status") {
      options.status = requireValue(arg, queue);
      continue;
    }
    if (arg === "--source-path") {
      options.fileSourcePath = requireValue(arg, queue);
      continue;
    }
    if (arg === "--route-intent") {
      options.routeIntent = requireValue(arg, queue);
      continue;
    }
    if (arg === "--route-reason") {
      options.routeReason = requireValue(arg, queue);
      continue;
    }
    if (arg === "--generated-mode") {
      options.generatedMode = requireValue(arg, queue);
      continue;
    }
    if (arg === "--generated-profile") {
      options.generatedProfile = requireValue(arg, queue);
      continue;
    }
    if (arg === "--generated-title") {
      options.generatedTitle = requireValue(arg, queue);
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    throw new Error(`Unknown authoring-pair scaffold arg: ${arg}`);
  }

  if (!options.pairId) {
    throw new Error("authoring-pair requires --pair-id <id>");
  }
  if (!options.agentPrimary) {
    throw new Error("authoring-pair requires --agent-primary <module-id>");
  }
  if (!options.humanPrimary) {
    throw new Error("authoring-pair requires --human-primary <path>");
  }
  if (options.generatedMode || options.generatedProfile || options.generatedTitle) {
    if (!options.generatedProfile) {
      throw new Error("authoring-pair generated output requires --generated-profile <overview|checklist>");
    }
    if (!options.generatedMode) {
      options.generatedMode = "deterministic";
    }
    if (options.fileSourcePath) {
      throw new Error("authoring-pair cannot use --source-path when generated human output is enabled");
    }
  }

  return options;
}

function requireValue(flag, queue) {
  if (queue.length === 0) {
    throw new Error(`Missing value for ${flag}`);
  }
  return queue.shift();
}

function loadValidatedAuthoringSource(sourcePath) {
  const source = loadAuthoringSource(sourcePath);
  validateAuthoringSource(source, sourcePath);
  return source;
}

function writeValidatedAuthoringSource(sourcePath, source) {
  validateAuthoringSource(source, sourcePath);
  writeJson(sourcePath, source);
}

function defaultAuthoringModulePath(moduleId) {
  return `modules/${moduleId}.json`;
}

function displayRelativePath(rootPath, filePath) {
  return normalizePath(path.relative(rootPath, filePath) || path.basename(filePath));
}

function dedupeStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function makeTouchRouteKey(match, intent) {
  return `${normalizePath(match)}::${intent}`;
}

function attachModuleToAuthoringRoles(source, roleIds, moduleId) {
  const uniqueRoleIds = dedupeStrings(roleIds);

  if (source.boot?.by_role && Object.keys(source.boot.by_role).length > 0) {
    for (const roleId of uniqueRoleIds) {
      const roleModules = source.boot.by_role[roleId];
      const roleExists = Array.isArray(roleModules) || (source.corpus.roles ?? []).some((role) => role.id === roleId);
      if (!roleExists) {
        throw new Error(`Unknown role for --role: ${roleId}`);
      }
      source.boot.by_role[roleId] = dedupeStrings([...(roleModules ?? []), moduleId]);
    }
    return;
  }

  const roleById = new Map((source.corpus.roles ?? []).map((role) => [role.id, role]));
  for (const roleId of uniqueRoleIds) {
    const role = roleById.get(roleId);
    if (!role) {
      throw new Error(`Unknown role for --role: ${roleId}`);
    }
    role.required_modules = dedupeStrings([...(role.required_modules ?? []), moduleId]);
  }
}

function ensureHumanFileEntry(source, { humanPrimary, sourceFilePath, force }) {
  source.files ??= [];
  const index = source.files.findIndex((entry) => normalizePath(entry.path) === humanPrimary);

  if (index === -1) {
    const fileEntry = {
      path: humanPrimary,
      source_path: sourceFilePath
    };
    source.files.push(fileEntry);
    return { fileEntry, created: true };
  }

  const fileEntry = source.files[index];
  if ("content" in fileEntry) {
    if (sourceFilePath !== humanPrimary && !force) {
      throw new Error(`Human surface ${humanPrimary} already uses inline content. Use --force to replace it with source_path.`);
    }
    if (force) {
      delete fileEntry.content;
      fileEntry.source_path = sourceFilePath;
    }
    return { fileEntry, created: false };
  }

  const existingSourcePath = normalizePath(fileEntry.source_path ?? humanPrimary);
  if (existingSourcePath !== sourceFilePath && !force) {
    throw new Error(`Human surface ${humanPrimary} already points at source_path=${existingSourcePath}. Use --force to replace it.`);
  }
  fileEntry.source_path = sourceFilePath;
  return { fileEntry, created: false };
}

function removeHumanFileEntry(source, { humanPrimary, force }) {
  source.files ??= [];
  const index = source.files.findIndex((entry) => normalizePath(entry.path) === humanPrimary);
  if (index === -1) {
    return { fileEntry: null, created: false };
  }
  if (!force) {
    throw new Error(
      `Human surface ${humanPrimary} already exists in files[]. Use --force to replace it with generated output.`
    );
  }
  const [fileEntry] = source.files.splice(index, 1);
  return { fileEntry, created: false };
}

function createPairedSurfaceStub({ humanPrimary, agentPrimary }) {
  return `# ${path.basename(humanPrimary, path.extname(humanPrimary))}

This human-facing surface is paired with \`${agentPrimary}\` in AODS.

Update it through the declared pair workflow and keep it aligned with the agent-facing authority.
`;
}

function createRootModule({ sys, moduleId, capsuleId }) {
  return {
    aods_v: 3,
    module_id: moduleId,
    v: 1,
    context: `Root routing for ${sys}. Use during cold-start orientation before deeper capsule or detail loads.`,
    sections: [
      {
        sid: "system-root",
        topic: "root routing overview",
        content: `Corpus covers ${sys}. Load ${capsuleId}:system-capsule for summary routing. Keep root module short and route-oriented.`,
        content_type: "rules",
        refs: [`${capsuleId}:system-capsule`],
        artifact_refs: ["route-table"],
        criticality: "must"
      }
    ],
    artifacts: [
      {
        artifact_id: "route-table",
        type: "mapping-table",
        usage: "Lookup table for first-hop routing from root layer.",
        content: {
          key_columns: ["need"],
          columns: ["need", "load"],
          rows: [
            ["summary routing", `${capsuleId}:system-capsule`],
            ["human narrative", "README.md via the paired surface map"]
          ]
        }
      }
    ],
    changelog: [
      {
        v: 1,
        delta: "Initial scaffold root module."
      }
    ],
    meta: {
      stability: "evolving",
      review_cycle: "on-change"
    }
  };
}

function createAuthoringSource({ sys, purpose, rootId, capsuleId, detailId }) {
  return {
    $schema: "aods://schema/authoring/v1",
    authoring_v: 1,
    corpus: {
      sys,
      sys_v: 1,
      purpose:
        purpose || `Compiled authoring source for ${sys}. Replace scaffold placeholders with real semantics before release.`,
      glossary: {
        system: `${sys} documentation corpus`
      },
      roles: [
        {
          id: "doc-author",
          scope: `Maintains paired human and agent-facing documentation for ${sys}.`,
          required_modules: [rootId, capsuleId, detailId]
        }
      ]
    },
    files: [
      {
        path: "README.md",
        source_path: "README.md"
      }
    ],
    modules: [
      {
        id: rootId,
        category: "architecture",
        layer: "root",
        priority: "critical",
        scope: `Root routing for ${sys}. Use at cold start before loading capsule or detail authority.`,
        context: `Root routing for ${sys}. Open ${capsuleId} for summary routing and README.md for the human overview.`,
        tags: ["root", "routing"],
        boot: true,
        sections: [
          {
            sid: "system-root",
            topic: "root routing overview",
            content: `Use ${capsuleId}:system-capsule for summary routing. Open README.md when a human-facing overview is needed. Keep this root module short and route-oriented.`,
            content_type: "rules",
            refs: [`${capsuleId}:system-capsule`],
            artifact_refs: ["route-table"],
            criticality: "must"
          }
        ],
        artifacts: [
          {
            artifact_id: "route-table",
            type: "mapping-table",
            usage: "First-hop routing from cold start.",
            content: {
              key_columns: ["need"],
              columns: ["need", "load"],
              rows: [
                ["summary routing", `${capsuleId}:system-capsule`],
                ["authoritative detail", `${detailId}:system-detail`],
                ["human narrative", "README.md via the paired surface map"]
              ]
            }
          }
        ]
      },
      {
        id: capsuleId,
        category: "capsule",
        layer: "capsule",
        priority: "critical",
        scope: `Summary routing for ${sys}. Use after root load to decide which detail authority opens next.`,
        context: `Capsule for ${sys}. Route from root toward durable detail semantics.`,
        tags: ["capsule", "routing"],
        boot: true,
        capsule: {
          read_when: ["Need summary routing after cold start", "Need to choose first detail module"],
          core_question: `Which detail module should open next for ${sys}?`,
          routes_to: [detailId],
          frozen_decisions: ["Capsule stays short", "Detail modules hold semantic authority"]
        },
        sections: [
          {
            sid: "system-capsule",
            topic: "capsule summary and next routes",
            content: `Use this capsule to summarize ${sys} and route toward ${detailId}:system-detail for durable semantics. Human overview lives in paired README.md.`,
            content_type: "rules",
            refs: [`${detailId}:system-detail`],
            criticality: "must"
          }
        ]
      },
      {
        id: detailId,
        category: "policy",
        layer: "detail",
        priority: "standard",
        scope: `Authoritative detail placeholder for ${sys}. Replace scaffold content with real semantics and structured artifacts.`,
        context: `Detail authority for ${sys}. Record durable semantics here instead of in capsule or human summary.`,
        tags: ["detail", "authority"],
        sections: [
          {
            sid: "system-detail",
            topic: "authoritative detail placeholder",
            content: `Replace this scaffold placeholder with durable semantics for ${sys}. Record canonical object model, authority rules, workflow edges, and interface contracts here.`,
            content_type: "rules",
            criticality: "must"
          },
          {
            sid: "implementation-notes",
            topic: "detail expansion checklist",
            content: `Expand this detail module with stable section IDs, artifact_refs, and explicit constraints. Keep capsule modules short; move durable semantics, exception handling, and integration contracts into detail modules like this one.`,
            content_type: "rules",
            criticality: "must"
          }
        ]
      }
    ],
    boot: {
      by_touch: [
        {
          match: "README.md",
          intent: "write",
          load_modules: [capsuleId, detailId],
          reason: "README is the paired human surface."
        },
        {
          match: "authoring.json",
          intent: "write",
          load_modules: [rootId, capsuleId, detailId],
          reason: "authoring source edits affect compiled routing and authority."
        }
      ]
    },
    surface_pairs: [
      {
        pair_id: `pair-${sys}-readme`,
        scope: "system",
        agent_primary: capsuleId,
        agent_supporting: [rootId, detailId],
        human_primary: "README.md",
        sync_source: "agent-primary",
        status: "paired"
      }
    ]
  };
}

function createCapsuleModule({ sys, moduleId, detailRoute }) {
  return {
    aods_v: 3,
    module_id: moduleId,
    v: 1,
    context: `Capsule for ${sys}. Use after root load to decide which detail modules to open next.`,
    sections: [
      {
        sid: "system-capsule",
        topic: "capsule summary and next routes",
        content: `Use this capsule to summarize ${sys} and route toward durable semantics. Next route -> ${detailRoute}. Human overview lives in paired README.`,
        content_type: "rules",
        refs: [detailRoute],
        criticality: "must"
      }
    ],
    artifacts: [],
    changelog: [
      {
        v: 1,
        delta: "Initial scaffold capsule module."
      }
    ],
    meta: {
      stability: "evolving",
      review_cycle: "on-change",
      capsule: {
        read_when: [
          "Need summary routing after cold-start",
          "Need to choose first detail module"
        ],
        core_question: `Which detail module should open next for ${sys}?`,
        routes_to: [detailRoute],
        frozen_decisions: [
          "Capsule stays short",
          "Detail modules hold semantic authority"
        ]
      }
    }
  };
}

function createDetailModule({ sys, moduleId }) {
  return {
    aods_v: 3,
    module_id: moduleId,
    v: 1,
    context: `Authoritative detail placeholder for ${sys}. Replace scaffold content with real semantics and structured artifacts.`,
    sections: [
      {
        sid: "system-detail",
        topic: "authoritative detail placeholder",
        content: `Replace this scaffold placeholder with durable semantics for ${sys}. Record canonical object model, authority rules, workflow edges, and interface contracts here. Add structured artifacts for traversable workflows, topology, policy, or interfaces as needed.`,
        content_type: "rules",
        refs: [],
        criticality: "must"
      },
      {
        sid: "implementation-notes",
        topic: "detail expansion checklist",
        content: `Expand this detail module with stable section IDs, artifact_refs, and explicit constraints. Keep capsule modules short; move durable semantics, exception handling, and integration contracts into detail modules like this one.`,
        content_type: "rules",
        refs: [],
        criticality: "must"
      }
    ],
    artifacts: [],
    changelog: [
      {
        v: 1,
        delta: "Initial scaffold detail module."
      }
    ],
    meta: {
      stability: "evolving",
      review_cycle: "on-change"
    }
  };
}

function createAuthoringModuleSkeleton({ moduleId, category, layer, scope, routes }) {
  const moduleEntry = {
    id: moduleId,
    category,
    layer,
    scope,
    context: scope,
    sections: [
      {
        sid: category === "capsule" ? "overview" : "module-overview",
        topic: category === "capsule" ? "capsule summary" : "module overview",
        content:
          category === "capsule"
            ? `Use this capsule to route toward deeper semantics. Next routes -> ${routes.join(", ")}.`
            : `Replace scaffold placeholder with durable semantics for ${moduleId}. Add stable section IDs, explicit constraints, and structured artifacts when agents must traverse, evaluate, or execute logic.`,
        content_type: "rules",
        refs: routes.filter((route) => route.includes(":")),
        criticality: "must"
      }
    ],
    artifacts: []
  };

  if (category === "capsule") {
    moduleEntry.capsule = {
      read_when: [`Need summary routing for ${moduleId}`],
      core_question: `Which route should ${moduleId} open next?`,
      routes_to: routes,
      frozen_decisions: ["Capsule stays short", "Detail modules own durable semantics"]
    };
  } else {
    moduleEntry.sections.push({
      sid: "implementation-notes",
      topic: "detail expansion checklist",
      content: `Expand ${moduleId} with durable semantics, error handling, and contract details. Keep this module longer and more authoritative than any capsule that routes into it.`,
      content_type: "rules",
      refs: [],
      criticality: "should"
    });
  }

  return moduleEntry;
}

function createModuleSkeleton({ moduleId, category, layer, scope, routes }) {
  const baseModule = {
    aods_v: 3,
    module_id: moduleId,
    v: 1,
    context: scope,
    sections: [
      {
        sid: category === "capsule" ? "overview" : "module-overview",
        topic: category === "capsule" ? "capsule summary" : "module overview",
        content:
          category === "capsule"
            ? `Use this capsule to route toward deeper semantics. Next routes -> ${routes.join(", ")}.`
            : `Replace scaffold placeholder with durable semantics for ${moduleId}. Add stable section IDs, explicit constraints, and structured artifacts when agent must traverse, evaluate, or execute logic.`,
        content_type: "rules",
        refs: routes.filter((route) => route.includes(":")),
        criticality: "must"
      }
    ],
    artifacts: [],
    changelog: [
      {
        v: 1,
        delta: "Initial scaffold module."
      }
    ],
    meta: {
      stability: "evolving",
      review_cycle: "on-change"
    }
  };

  if (category === "capsule") {
    baseModule.meta.capsule = {
      read_when: [
        `Need summary routing for ${moduleId}`
      ],
      core_question: `Which route should ${moduleId} open next?`,
      routes_to: routes,
      frozen_decisions: [
        "Capsule stays short",
        "Detail modules own durable semantics"
      ]
    };
  } else {
    baseModule.sections.push({
      sid: "implementation-notes",
      topic: "detail expansion checklist",
      content: `Expand ${moduleId} with durable semantics, error handling, and contract details. Keep this module longer and more authoritative than any capsule that routes into it.`,
      content_type: "rules",
      refs: [],
      criticality: "should"
    });
  }

  return baseModule;
}

function createReadme({ sys, rootId, capsuleId, detailId }) {
  return `# ${sys}

This is a scaffolded AODS corpus.

## Current surfaces

- Agent root: \`${rootId}\`
- Agent capsule: \`${capsuleId}\`
- Agent detail: \`${detailId}\`

## Next steps

1. Replace placeholder semantics inside \`modules/\`.
2. Add structured artifacts where agents must traverse logic.
3. Expand \`surface_pairs\` if more human-facing surfaces appear.
`;
}

function printScaffoldResult(result) {
  console.log(`OK ${result.action}`);
  console.log(`root=${result.root}`);
  for (const file of result.files) {
    console.log(`  created ${file}`);
  }
}
