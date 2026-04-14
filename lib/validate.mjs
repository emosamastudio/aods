import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const LEVELS = ["L1", "L2", "L3", "L4"];

const AOP_CHECKS = [
  {
    rule: "no-markdown-syntax",
    regex: /^#{1,6}\s|\*\*|```|^>\s|^-\s/m,
    message: "content contains markdown syntax"
  },
  {
    rule: "no-filler-phrases",
    regex: /\b(it is important|note that|please be aware|in order to|however|moreover|furthermore|additionally)\b/i,
    message: "content contains filler phrase"
  },
  {
    rule: "no-conversational-tone",
    regex: /\b(let's|here's how|you should|we can|feel free)\b/i,
    message: "content contains conversational tone"
  },
  {
    rule: "no-positional-refs",
    regex: /\b(see above|as mentioned|the previous|see below)\b/i,
    message: "content contains positional reference"
  }
];

export async function runValidateCommand(argv) {
  const options = parseArgs(argv);
  const rootPath = path.resolve(options.root);
  const report = validateCorpus(rootPath);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, rootPath);
  }

  const hasErrors = report.summary.errors > 0;
  const hasWarnings = report.summary.warnings > 0;
  return hasErrors || (options.strict && hasWarnings) ? 1 : 0;
}

function parseArgs(argv) {
  const options = {
    root: ".",
    json: false,
    strict: false
  };

  for (const arg of argv) {
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--strict") {
      options.strict = true;
      continue;
    }
    if (!arg.startsWith("-") && options.root === ".") {
      options.root = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function validateCorpus(rootPath) {
  const report = createReport(path.basename(rootPath) || rootPath);

  const manifestPath = path.join(rootPath, "manifest.json");
  const manifestSchemaPath = path.join(rootPath, "schema", "manifest.schema.json");
  const moduleSchemaPath = path.join(rootPath, "schema", "module.schema.json");

  const manifest = loadJson(manifestPath, report, {
    level: "L1",
    rule: "manifest-exists",
    message: "manifest.json missing or invalid JSON"
  });
  const manifestSchema = loadJson(manifestSchemaPath, report, {
    level: "L1",
    rule: "manifest-schema-exists",
    message: "schema/manifest.schema.json missing or invalid JSON"
  });
  const moduleSchema = loadJson(moduleSchemaPath, report, {
    level: "L1",
    rule: "module-schema-exists",
    message: "schema/module.schema.json missing or invalid JSON"
  });

  if (!manifest || !manifestSchema || !moduleSchema) {
    finalizeReport(report);
    return report;
  }

  const ajv = new Ajv({
    allErrors: true,
    strict: false
  });
  addFormats(ajv);

  const validateManifest = ajv.compile(manifestSchema);
  if (!validateManifest(manifest)) {
    for (const error of validateManifest.errors ?? []) {
      addIssue(report, {
        level: "L1",
        rule: "manifest-schema",
        message: formatAjvError(error),
        path: error.instancePath || "/manifest"
      });
    }
  }

  const validateModule = ajv.compile(moduleSchema);
  const moduleEntries = loadModules(rootPath, manifest, report);

  for (const entry of moduleEntries) {
    if (!entry.module) {
      continue;
    }
    if (!validateModule(entry.module)) {
      for (const error of validateModule.errors ?? []) {
        addIssue(report, {
          level: "L1",
          moduleId: entry.id,
          rule: "module-schema",
          message: formatAjvError(error),
          path: error.instancePath || entry.path
        });
      }
    }
  }

  const moduleMap = new Map(
    moduleEntries
      .filter((entry) => entry.module)
      .map((entry) => [entry.id, entry])
  );

  validateManifestReferences(manifest, report, moduleMap, rootPath);
  validateModuleReferences(report, moduleMap);
  validateArtifactSemantics(report, moduleMap);
  validateDependencyCycles(report, moduleMap);
  validateLayerAndCapsuleRules(report, manifest, moduleMap);
  validateAopChecks(report, moduleMap);

  report.summary.total_modules = moduleEntries.length;
  report.summary.total_sections = sumValues(moduleEntries, (entry) => entry.module?.sections?.length ?? 0);
  report.summary.total_artifacts = sumValues(moduleEntries, (entry) => entry.module?.artifacts?.length ?? 0);
  report.summary.total_tokens = sumValues(manifest.modules ?? [], (moduleRef) => moduleRef.tokens_approx ?? 0);
  report.summary.total_surface_pairs = Array.isArray(manifest.surface_pairs) ? manifest.surface_pairs.length : 0;

  finalizeReport(report);
  return report;
}

function loadModules(rootPath, manifest, report) {
  const modules = Array.isArray(manifest.modules) ? manifest.modules : [];
  const seenIds = new Set();
  const entries = [];

  for (const moduleRef of modules) {
    const entry = {
      id: moduleRef.id,
      ref: moduleRef,
      path: moduleRef.path ?? "",
      resolvedPath: null,
      module: null
    };
    entries.push(entry);

    if (seenIds.has(moduleRef.id)) {
      addIssue(report, {
        level: "L1",
        moduleId: moduleRef.id,
        rule: "duplicate-module-id",
        message: `duplicate module id: ${moduleRef.id}`
      });
      continue;
    }
    seenIds.add(moduleRef.id);

    if (!isRelativePath(moduleRef.path ?? "")) {
      addIssue(report, {
        level: "L1",
        moduleId: moduleRef.id,
        rule: "relative-module-path",
        message: `module path must stay inside corpus root: ${moduleRef.path}`
      });
      continue;
    }

    entry.resolvedPath = resolveCorpusPath(rootPath, moduleRef.path ?? "");
    if (!entry.resolvedPath || !fs.existsSync(entry.resolvedPath)) {
      addIssue(report, {
        level: "L1",
        moduleId: moduleRef.id,
        rule: "module-path-exists",
        message: `module path missing: ${moduleRef.path}`
      });
      continue;
    }

    entry.module = loadJson(entry.resolvedPath, report, {
      level: "L1",
      moduleId: moduleRef.id,
      rule: "module-json-parse",
      message: `module JSON invalid: ${moduleRef.path}`
    });
  }

  return entries;
}

function validateManifestReferences(manifest, report, moduleMap, rootPath) {
  for (const moduleId of manifest.boot_sequence ?? []) {
    if (!moduleMap.has(moduleId)) {
      addIssue(report, {
        level: "L1",
        rule: "boot-sequence-ref",
        message: `boot_sequence references missing module: ${moduleId}`
      });
    }
  }

  for (const [roleId, moduleIds] of Object.entries(manifest.boot_by_role ?? {})) {
    for (const moduleId of moduleIds) {
      if (!moduleMap.has(moduleId)) {
        addIssue(report, {
          level: "L1",
          rule: "boot-by-role-ref",
          message: `boot_by_role.${roleId} references missing module: ${moduleId}`
        });
      }
    }
  }

  for (const route of manifest.boot_by_touch ?? []) {
    if (!isRelativePath(route.match ?? "")) {
      addIssue(report, {
        level: "L1",
        rule: "boot-by-touch-relative-match",
        message: `boot_by_touch match must stay inside corpus root: ${route.match ?? ""}`
      });
    }

    for (const moduleId of route.load_modules ?? []) {
      if (!moduleMap.has(moduleId)) {
        addIssue(report, {
          level: "L2",
          rule: "boot-by-touch-module-ref",
          message: `boot_by_touch references missing module: ${moduleId}`
        });
      }
    }
  }

  for (const role of manifest.roles ?? []) {
    for (const moduleId of role.required_modules ?? []) {
      if (!moduleMap.has(moduleId)) {
        addIssue(report, {
          level: "L2",
          rule: "role-required-module",
          message: `role ${role.id} requires missing module: ${moduleId}`
        });
      }
    }
  }

  for (const pair of manifest.surface_pairs ?? []) {
    if (!moduleMap.has(pair.agent_primary)) {
      addIssue(report, {
        level: "L2",
        rule: "surface-pair-agent-primary",
        message: `surface pair ${pair.pair_id} references missing agent_primary: ${pair.agent_primary}`
      });
    }

    for (const moduleId of pair.agent_supporting ?? []) {
      if (!moduleMap.has(moduleId)) {
        addIssue(report, {
          level: "L2",
          rule: "surface-pair-agent-supporting",
          message: `surface pair ${pair.pair_id} references missing agent_supporting module: ${moduleId}`
        });
      }
    }

    if (!isRelativePath(pair.human_primary ?? "")) {
      addIssue(report, {
        level: "L2",
        rule: "surface-pair-relative-human-primary",
        message: `surface pair ${pair.pair_id} uses human_primary outside corpus root`
      });
    } else {
      const resolvedHumanPrimary = resolveCorpusPath(rootPath, pair.human_primary);
      if (!resolvedHumanPrimary || !fs.existsSync(resolvedHumanPrimary)) {
        addIssue(report, {
          level: "L2",
          rule: "surface-pair-human-primary-exists",
          message: `surface pair ${pair.pair_id} missing human_primary: ${pair.human_primary}`
        });
      }
    }

    for (const humanPath of pair.human_supporting ?? []) {
      if (!isRelativePath(humanPath)) {
        addIssue(report, {
          level: "L2",
          rule: "surface-pair-relative-human-supporting",
          message: `surface pair ${pair.pair_id} uses human_supporting outside corpus root: ${humanPath}`
        });
        continue;
      }
      const resolvedHumanSupporting = resolveCorpusPath(rootPath, humanPath);
      if (!resolvedHumanSupporting || !fs.existsSync(resolvedHumanSupporting)) {
        addIssue(report, {
          level: "L2",
          rule: "surface-pair-human-supporting-exists",
          message: `surface pair ${pair.pair_id} missing human_supporting: ${humanPath}`
        });
      }
    }

    if (pair.sync_source === "bidirectional") {
      addIssue(report, {
        level: "L3",
        rule: "surface-pair-bidirectional-sync",
        message: `surface pair ${pair.pair_id} uses bidirectional sync, but merge protocol is not yet specified`,
        severity: "warning"
      });
    }
  }
}

function validateModuleReferences(report, moduleMap) {
  for (const [moduleId, entry] of moduleMap) {
    const module = entry.module;
    const sectionIds = new Set();
    const artifactIds = new Set();

    for (const section of module.sections ?? []) {
      if (sectionIds.has(section.sid)) {
        addIssue(report, {
          level: "L1",
          moduleId,
          sid: section.sid,
          rule: "duplicate-section-id",
          message: `duplicate section id: ${section.sid}`
        });
      }
      sectionIds.add(section.sid);
    }

    for (const artifact of module.artifacts ?? []) {
      if (artifactIds.has(artifact.artifact_id)) {
        addIssue(report, {
          level: "L1",
          moduleId,
          rule: "duplicate-artifact-id",
          message: `duplicate artifact id: ${artifact.artifact_id}`
        });
      }
      artifactIds.add(artifact.artifact_id);
    }

    if (module.module_id !== moduleId) {
      addIssue(report, {
        level: "L1",
        moduleId,
        rule: "module-id-match",
        message: `module_id mismatch: expected ${moduleId}, got ${module.module_id}`
      });
    }

    for (const depId of entry.ref.deps ?? []) {
      if (!moduleMap.has(depId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "module-dependency",
          message: `module depends on missing module: ${depId}`
        });
      }
    }

    for (const section of module.sections ?? []) {
      for (const ref of section.refs ?? []) {
        if (!resolveSectionRef(moduleId, ref, moduleMap)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            sid: section.sid,
            rule: "section-ref",
            message: `unresolved section ref: ${ref}`
          });
        }
      }
      for (const artifactRef of section.artifact_refs ?? []) {
        if (!artifactIds.has(artifactRef)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            sid: section.sid,
            rule: "artifact-ref",
            message: `unresolved artifact ref: ${artifactRef}`
          });
        }
      }
    }

    const capsuleMeta = module.meta?.capsule;
    if (capsuleMeta?.routes_to) {
      for (const route of capsuleMeta.routes_to) {
        if (!resolveCapsuleRoute(route, moduleMap)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "capsule-route",
            message: `unresolved capsule route: ${route}`
          });
        }
      }
    }
  }
}

function validateArtifactSemantics(report, moduleMap) {
  for (const [moduleId, entry] of moduleMap) {
    for (const artifact of entry.module.artifacts ?? []) {
      switch (artifact.type) {
        case "process-flow":
          validateProcessFlowArtifact(report, moduleId, artifact, moduleMap);
          break;
        case "decision-tree":
          validateDecisionTreeArtifact(report, moduleId, artifact, moduleMap);
          break;
        case "topology":
          validateTopologyArtifact(report, moduleId, artifact);
          break;
        case "mapping-table":
          validateMappingTableArtifact(report, moduleId, artifact);
          break;
        default:
          break;
      }
    }
  }
}

function validateProcessFlowArtifact(report, moduleId, artifact, moduleMap) {
  const content = artifact.content ?? {};
  const steps = Array.isArray(content.steps) ? content.steps : [];
  const stepIds = new Set();
  const terminals = new Set(content.terminals ?? []);
  const actors = new Set(content.actors ?? []);

  for (const step of steps) {
    if (stepIds.has(step.id)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "process-flow-duplicate-step",
        message: `artifact ${artifact.artifact_id} has duplicate step id: ${step.id}`
      });
    }
    stepIds.add(step.id);
  }

  if (!stepIds.has(content.entry)) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "process-flow-entry",
      message: `artifact ${artifact.artifact_id} entry references missing step: ${content.entry}`
    });
  }

  for (const step of steps) {
    if (step.actor && actors.size > 0 && !actors.has(step.actor)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "process-flow-actor",
        message: `artifact ${artifact.artifact_id} step ${step.id} uses undeclared actor: ${step.actor}`
      });
    }

    validateFlowTarget(report, moduleId, artifact.artifact_id, step.id, "next", step.next, stepIds, terminals);
    validateFlowTarget(report, moduleId, artifact.artifact_id, step.id, "error_handler", step.error_handler, stepIds, terminals);
    validateFlowTarget(report, moduleId, artifact.artifact_id, step.id, "on_timeout", step.on_timeout, stepIds, terminals);

    for (const branch of step.branches ?? []) {
      for (const targetId of branch.steps ?? []) {
        if (!stepIds.has(targetId)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "process-flow-branch-step",
            message: `artifact ${artifact.artifact_id} step ${step.id} branch ${branch.branch_id} references missing step: ${targetId}`
          });
        }
      }
    }

    for (const targetId of step.loop_body ?? []) {
      if (!stepIds.has(targetId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "process-flow-loop-step",
          message: `artifact ${artifact.artifact_id} step ${step.id} loop_body references missing step: ${targetId}`
        });
      }
    }

    if (step.join === "n_of_m") {
      const branchCount = step.branches?.length ?? 0;
      if (!Number.isInteger(step.join_threshold) || step.join_threshold < 1 || step.join_threshold > branchCount) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "process-flow-join-threshold",
          message: `artifact ${artifact.artifact_id} step ${step.id} has invalid join_threshold for join=n_of_m`
        });
      }
    }

    if (step.subprocess_ref && !resolveArtifactRef(moduleId, step.subprocess_ref, moduleMap)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "process-flow-subprocess-ref",
        message: `artifact ${artifact.artifact_id} step ${step.id} references missing subprocess artifact: ${step.subprocess_ref}`
      });
    }

    if (step.payload_schema && !resolveArtifactRef(moduleId, step.payload_schema, moduleMap)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "process-flow-payload-schema",
        message: `artifact ${artifact.artifact_id} step ${step.id} references missing payload_schema artifact: ${step.payload_schema}`
      });
    }
  }
}

function validateDecisionTreeArtifact(report, moduleId, artifact, moduleMap) {
  const content = artifact.content ?? {};
  const nodes = Array.isArray(content.nodes) ? content.nodes : [];
  const nodeIds = new Set();

  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "decision-tree-duplicate-node",
        message: `artifact ${artifact.artifact_id} has duplicate node id: ${node.id}`
      });
    }
    nodeIds.add(node.id);
  }

  if (!nodeIds.has(content.root)) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "decision-tree-root",
      message: `artifact ${artifact.artifact_id} root references missing node: ${content.root}`
    });
  }

  for (const node of nodes) {
    for (const branch of node.branches ?? []) {
      if (!nodeIds.has(branch.next)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "decision-tree-branch-target",
          message: `artifact ${artifact.artifact_id} node ${node.id} branch ${branch.value} references missing node: ${branch.next}`
        });
      }
    }

    if (node.default && !nodeIds.has(node.default)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "decision-tree-default-target",
        message: `artifact ${artifact.artifact_id} node ${node.id} default references missing node: ${node.default}`
      });
    }

    if (node.delegate_ref && !resolveArtifactRef(moduleId, node.delegate_ref, moduleMap)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "decision-tree-delegate-ref",
        message: `artifact ${artifact.artifact_id} node ${node.id} references missing delegate artifact: ${node.delegate_ref}`
      });
    }
  }
}

function validateTopologyArtifact(report, moduleId, artifact) {
  const content = artifact.content ?? {};
  const nodes = Array.isArray(content.nodes) ? content.nodes : [];
  const nodeIds = new Set();
  const interfacesByNode = new Map();

  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "topology-duplicate-node",
        message: `artifact ${artifact.artifact_id} has duplicate node id: ${node.id}`
      });
    }
    nodeIds.add(node.id);

    const interfaceIds = new Set();
    for (const item of node.interfaces ?? []) {
      if (interfaceIds.has(item.id)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "topology-duplicate-interface",
          message: `artifact ${artifact.artifact_id} node ${node.id} has duplicate interface id: ${item.id}`
        });
      }
      interfaceIds.add(item.id);
    }
    interfacesByNode.set(node.id, interfaceIds);
  }

  for (const node of nodes) {
    for (const childId of node.children ?? []) {
      if (!nodeIds.has(childId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "topology-child-node",
          message: `artifact ${artifact.artifact_id} node ${node.id} references missing child node: ${childId}`
        });
      }
    }
  }

  for (const edge of content.edges ?? []) {
    validateTopologyEndpoint(report, moduleId, artifact.artifact_id, edge.from, "from", nodeIds, interfacesByNode);
    validateTopologyEndpoint(report, moduleId, artifact.artifact_id, edge.to, "to", nodeIds, interfacesByNode);
  }

  for (const group of content.groups ?? []) {
    for (const nodeId of group.node_ids ?? []) {
      if (!nodeIds.has(nodeId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "topology-group-node",
          message: `artifact ${artifact.artifact_id} group ${group.id} references missing node: ${nodeId}`
        });
      }
    }
  }
}

function validateMappingTableArtifact(report, moduleId, artifact) {
  const content = artifact.content ?? {};
  const columns = Array.isArray(content.columns) ? content.columns : [];
  const columnSet = new Set();

  for (const column of columns) {
    if (columnSet.has(column)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "mapping-table-duplicate-column",
        message: `artifact ${artifact.artifact_id} has duplicate column: ${column}`
      });
    }
    columnSet.add(column);
  }

  for (const keyColumn of content.key_columns ?? []) {
    if (!columnSet.has(keyColumn)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "mapping-table-key-column",
        message: `artifact ${artifact.artifact_id} key_columns references missing column: ${keyColumn}`
      });
    }
  }

  for (const columnName of Object.keys(content.column_types ?? {})) {
    if (!columnSet.has(columnName)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "mapping-table-column-type",
        message: `artifact ${artifact.artifact_id} column_types references missing column: ${columnName}`
      });
    }
  }

  for (const [index, row] of (content.rows ?? []).entries()) {
    if ((row?.length ?? 0) !== columns.length) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "mapping-table-row-width",
        message: `artifact ${artifact.artifact_id} row ${index} width ${row?.length ?? 0} does not match columns length ${columns.length}`
      });
    }
  }

  if (content.default_row && content.default_row.length !== columns.length) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "mapping-table-default-row-width",
      message: `artifact ${artifact.artifact_id} default_row width ${content.default_row.length} does not match columns length ${columns.length}`
    });
  }
}

function validateDependencyCycles(report, moduleMap) {
  const visiting = new Set();
  const visited = new Set();

  function dfs(moduleId, stack) {
    if (visiting.has(moduleId)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "dependency-cycle",
        message: `dependency cycle detected: ${[...stack, moduleId].join(" -> ")}`
      });
      return;
    }
    if (visited.has(moduleId)) {
      return;
    }

    visiting.add(moduleId);
    const entry = moduleMap.get(moduleId);
    for (const depId of entry?.ref.deps ?? []) {
      if (moduleMap.has(depId)) {
        dfs(depId, [...stack, moduleId]);
      }
    }
    visiting.delete(moduleId);
    visited.add(moduleId);
  }

  for (const moduleId of moduleMap.keys()) {
    dfs(moduleId, []);
  }
}

function validateLayerAndCapsuleRules(report, manifest, moduleMap) {
  for (const [moduleId, entry] of moduleMap) {
    const { layer, category, tokens_approx: tokensApprox } = entry.ref;
    const capsuleMeta = entry.module.meta?.capsule;

    if (category === "capsule" && layer !== "capsule") {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "capsule-layer-match",
        message: "category=capsule requires layer=capsule"
      });
    }

    if (layer === "capsule" && category !== "capsule") {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "capsule-category-match",
        message: "layer=capsule requires category=capsule"
      });
    }

    if (category === "capsule" && !capsuleMeta) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "capsule-meta-required",
        message: "category=capsule requires meta.capsule"
      });
    }

    if (category !== "capsule" && capsuleMeta) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "capsule-meta-extraneous",
        message: "meta.capsule should only appear on category=capsule modules"
      });
    }

    if (category === "capsule" && capsuleMeta) {
      for (const key of ["read_when", "core_question", "routes_to"]) {
        if (
          capsuleMeta[key] === undefined ||
          capsuleMeta[key] === null ||
          (Array.isArray(capsuleMeta[key]) && capsuleMeta[key].length === 0) ||
          (typeof capsuleMeta[key] === "string" && capsuleMeta[key].trim() === "")
        ) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "capsule-meta-fields",
            message: `meta.capsule missing usable ${key}`
          });
        }
      }
    }

    if (tokensApprox === undefined) {
      addIssue(report, {
        level: "L3",
        moduleId,
        rule: "tokens-approx-present",
        message: "tokens_approx missing from manifest module entry",
        severity: "warning"
      });
    }

    const moduleText = collectModuleText(entry.module);
    if (["stable", "frozen"].includes(entry.module.meta?.stability ?? "") && /\b(TODO:|UNDEFINED:)\b/.test(moduleText)) {
      addIssue(report, {
        level: "L3",
        moduleId,
        rule: "stable-module-markers",
        message: "stable or frozen module contains TODO: or UNDEFINED:",
        severity: "warning"
      });
    }
  }

  const bootSequence = manifest.boot_sequence ?? [];
  if (bootSequence.length > 0) {
    const first = moduleMap.get(bootSequence[0]);
    if (first?.ref.layer !== "root") {
      addIssue(report, {
        level: "L3",
        rule: "boot-starts-with-root",
        message: "boot_sequence should start with root-layer module",
        severity: "warning"
      });
    }
  }

  for (const moduleId of bootSequence) {
    const entry = moduleMap.get(moduleId);
    if (!entry) {
      continue;
    }
    if (entry.ref.layer === "evidence") {
      addIssue(report, {
        level: "L3",
        moduleId,
        rule: "boot-excludes-evidence",
        message: "boot_sequence should not include evidence-layer modules",
        severity: "warning"
      });
    }
  }

  for (const [moduleId, entry] of moduleMap) {
    if (entry.ref.category !== "capsule") {
      continue;
    }

    const capsuleTokens = estimateTokens(collectSectionText(entry.module.sections ?? []));
    for (const route of entry.module.meta?.capsule?.routes_to ?? []) {
      const [targetModuleId] = route.split(":");
      const targetEntry = moduleMap.get(targetModuleId);
      if (!targetEntry) {
        continue;
      }
      const targetTokens = estimateTokens(collectSectionText(targetEntry.module.sections ?? []));
      if (capsuleTokens >= targetTokens && targetTokens > 0) {
        addIssue(report, {
          level: "L4",
          moduleId,
          rule: "capsule-shorter-than-detail",
          message: `capsule content is not shorter than routed module ${targetModuleId}`,
          severity: "warning"
        });
      }
    }
  }
}

function validateAopChecks(report, moduleMap) {
  for (const [moduleId, entry] of moduleMap) {
    for (const section of entry.module.sections ?? []) {
      const content = section.content ?? "";
      const contentForChecks = stripQuotedExamples(content);
      for (const check of AOP_CHECKS) {
        if (check.regex.test(contentForChecks)) {
          addIssue(report, {
            level: "L4",
            moduleId,
            sid: section.sid,
            rule: check.rule,
            message: check.message,
            severity: "warning"
          });
        }
      }

      const estimatedTokens = estimateTokens(content);
      const density = content.length / Math.max(estimatedTokens, 1);
      if (density <= 3.5) {
        addIssue(report, {
          level: "L4",
          moduleId,
          sid: section.sid,
          rule: "token-density",
          message: `content token density too low: ${density.toFixed(2)}`,
          severity: "warning"
        });
      }

      if (estimatedTokens > 2000) {
        addIssue(report, {
          level: "L4",
          moduleId,
          sid: section.sid,
          rule: "section-token-limit",
          message: `content exceeds 2000 token guideline: ${estimatedTokens}`,
          severity: "warning"
        });
      }
    }
  }
}

function resolveSectionRef(currentModuleId, ref, moduleMap) {
  if (!ref) {
    return false;
  }

  if (ref.includes(":")) {
    const [targetModuleId, sid] = ref.split(":", 2);
    const target = moduleMap.get(targetModuleId);
    return !!target?.module?.sections?.some((section) => section.sid === sid);
  }

  const current = moduleMap.get(currentModuleId);
  return !!current?.module?.sections?.some((section) => section.sid === ref);
}

function resolveCapsuleRoute(route, moduleMap) {
  if (!route) {
    return false;
  }

  if (route.includes(":")) {
    const [moduleId, sid] = route.split(":", 2);
    const target = moduleMap.get(moduleId);
    return !!target?.module?.sections?.some((section) => section.sid === sid);
  }

  return moduleMap.has(route);
}

function resolveArtifactRef(currentModuleId, ref, moduleMap) {
  if (!ref) {
    return false;
  }

  if (ref.includes(":")) {
    const [moduleId, artifactId] = ref.split(":", 2);
    const target = moduleMap.get(moduleId);
    return !!target?.module?.artifacts?.some((artifact) => artifact.artifact_id === artifactId);
  }

  const current = moduleMap.get(currentModuleId);
  return !!current?.module?.artifacts?.some((artifact) => artifact.artifact_id === ref);
}

function validateFlowTarget(report, moduleId, artifactId, stepId, field, value, stepIds, terminals) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === "string") {
    if (!stepIds.has(value) && !terminals.has(value)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "process-flow-target",
        message: `artifact ${artifactId} step ${stepId} field ${field} references missing target: ${value}`
      });
    }
    return;
  }

  if (typeof value === "object") {
    for (const [branch, targetId] of Object.entries(value)) {
      if (!stepIds.has(targetId) && !terminals.has(targetId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "process-flow-branch-target",
          message: `artifact ${artifactId} step ${stepId} field ${field} branch ${branch} references missing target: ${targetId}`
        });
      }
    }
  }
}

function validateTopologyEndpoint(report, moduleId, artifactId, endpoint, field, nodeIds, interfacesByNode) {
  if (!endpoint) {
    return;
  }

  const [nodeId, interfaceId] = String(endpoint).split(":", 2);
  if (!nodeIds.has(nodeId)) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "topology-edge-node",
      message: `artifact ${artifactId} edge ${field} references missing node: ${endpoint}`
    });
    return;
  }

  if (interfaceId && !interfacesByNode.get(nodeId)?.has(interfaceId)) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "topology-edge-interface",
      message: `artifact ${artifactId} edge ${field} references missing interface: ${endpoint}`
    });
  }
}

function createReport(corpusName) {
  return {
    corpus: corpusName,
    timestamp: new Date().toISOString(),
    levels: {
      L1: { pass: true, errors: [], warnings: [] },
      L2: { pass: true, errors: [], warnings: [] },
      L3: { pass: true, errors: [], warnings: [] },
      L4: { pass: true, errors: [], warnings: [] }
    },
    summary: {
      total_modules: 0,
      total_sections: 0,
      total_artifacts: 0,
      total_tokens: 0,
      total_surface_pairs: 0,
      errors: 0,
      warnings: 0
    }
  };
}

function addIssue(report, issue) {
  const normalized = {
    level: issue.level,
    module_id: issue.moduleId ?? null,
    sid: issue.sid ?? null,
    rule: issue.rule,
    message: issue.message,
    path: issue.path ?? null
  };

  const bucket = issue.severity === "warning" ? "warnings" : "errors";
  report.levels[issue.level][bucket].push(normalized);
}

function finalizeReport(report) {
  for (const level of LEVELS) {
    const levelReport = report.levels[level];
    levelReport.pass = levelReport.errors.length === 0;
    report.summary.errors += levelReport.errors.length;
    report.summary.warnings += levelReport.warnings.length;
  }
}

export function printReport(report, rootPath) {
  const status = report.summary.errors === 0 ? "PASS" : "FAIL";
  console.log(`${status} ${rootPath}`);
  console.log(
    `modules=${report.summary.total_modules} sections=${report.summary.total_sections} artifacts=${report.summary.total_artifacts} surface_pairs=${report.summary.total_surface_pairs} errors=${report.summary.errors} warnings=${report.summary.warnings}`
  );

  for (const level of LEVELS) {
    const levelReport = report.levels[level];
    console.log(
      `${level} ${levelReport.pass ? "PASS" : "FAIL"} errors=${levelReport.errors.length} warnings=${levelReport.warnings.length}`
    );
    for (const issue of [...levelReport.errors, ...levelReport.warnings]) {
      const location = [issue.module_id, issue.sid].filter(Boolean).join(":");
      const prefix = levelReport.errors.includes(issue) ? "ERROR" : "WARN";
      console.log(`  ${prefix} ${issue.rule}${location ? ` @ ${location}` : ""} -> ${issue.message}`);
    }
  }
}

function loadJson(filePath, report, issue) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    addIssue(report, issue);
    return null;
  }
}

function formatAjvError(error) {
  const location = error.instancePath || "/";
  return `${location} ${error.message ?? "schema validation failed"}`.trim();
}

function isRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value) || /^[A-Za-z]:/.test(value)) {
    return false;
  }
  const normalized = normalizePath(value);
  return !normalized.split("/").some((segment) => segment === "..");
}

function resolveCorpusPath(rootPath, relativePath) {
  if (!isRelativePath(relativePath)) {
    return null;
  }
  const resolvedPath = path.resolve(rootPath, relativePath);
  const relative = normalizePath(path.relative(rootPath, resolvedPath));
  if (relative === "" || relative === ".") {
    return resolvedPath;
  }
  if (relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) {
    return null;
  }
  return resolvedPath;
}

function normalizePath(value) {
  return String(value ?? "").replaceAll(path.sep, "/");
}

function collectModuleText(module) {
  const parts = [module.context ?? ""];
  for (const section of module.sections ?? []) {
    parts.push(section.topic ?? "", section.content ?? "");
  }
  return parts.join("\n");
}

function collectSectionText(sections) {
  return sections.map((section) => `${section.topic ?? ""}\n${section.content ?? ""}`).join("\n");
}

function estimateTokens(text) {
  return Math.ceil(String(text ?? "").length / 4);
}

function sumValues(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function stripQuotedExamples(content) {
  return String(content ?? "")
    .replace(/'[^']*'/g, " ")
    .replace(/"[^"]*"/g, " ");
}
