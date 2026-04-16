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
  nowIso,
  writeJson
} from "./corpus-helpers.mjs";
import {
  buildManifestCompanion,
  DEFAULT_MANIFEST_COMPANION_PATH
} from "./manifest-runtime.mjs";

export async function runScaffoldCommand(argv) {
  const [subcommand, ...args] = argv;
  if (!subcommand) {
    throw new Error("Missing scaffold subcommand. Use: scaffold corpus ... | scaffold authoring ... | scaffold module ...");
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
    purpose: options.purpose ?? `AODS v3 corpus for ${sys}. Replace scaffold placeholders with system-specific semantics.`,
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
    throw new Error(`Invalid category: ${category}`);
  }
  if (!MODULE_LAYERS.has(layer)) {
    throw new Error(`Invalid layer: ${layer}`);
  }
  if (!MODULE_PRIORITIES.has(options.priority)) {
    throw new Error(`Invalid priority: ${options.priority}`);
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

function requireValue(flag, queue) {
  if (queue.length === 0) {
    throw new Error(`Missing value for ${flag}`);
  }
  return queue.shift();
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

This is a scaffolded AODS v3 corpus.

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
