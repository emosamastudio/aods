import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { collectModuleSemanticText, detectPairedSurfaceClaimConflicts } from "./claim-diff.mjs";
import {
  MANIFEST_COMPANION_FIELDS,
  getManifestCompanionPath,
  getModulePath,
  mergeManifestRuntime
} from "./manifest-runtime.mjs";
import { formatAjvError } from "./corpus-helpers.mjs";
import { hasGeneratedHumanPrimary, renderGeneratedHumanPrimary } from "./human-surface.mjs";

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

const DEFAULT_PLACEHOLDER_FILES = new Set([".gitkeep", ".keep", ".placeholder", "placeholder", ".DS_Store"]);
const CHANGELOG_DELTA_SOFT_LIMIT = 300;
const CHANGELOG_DELTA_HARD_LIMIT = 500;

const REMEDIATION_BY_RULE = {
  "implementation-evidence-required": {
    action: "add-evidence",
    gate: "drift-blocking",
    guidance: "Declare module.meta.implementation.evidence[] so current implementation status has reviewable proof anchors."
  },
  "implementation-evidence-id-unique": {
    action: "fix-evidence-id",
    gate: "drift-blocking",
    guidance: "Rename or merge duplicate implementation evidence ids so each evidence anchor has one stable identity."
  },
  "implementation-evidence-locator-exists": {
    action: "fix-evidence-locator",
    gate: "drift-blocking",
    guidance: "Update the evidence locator or restore the linked evidence path before treating the implementation as current."
  },
  "implementation-evidence-stale": {
    action: "refresh-evidence",
    gate: "warning",
    guidance: "Refresh the evidence anchor or downgrade the implementation posture before relying on it as current proof."
  },
  "implementation-current-evidence-missing": {
    action: "refresh-current-evidence",
    gate: "warning",
    guidance: "Add at least one current evidence anchor before treating the implementation linkage as currently supported."
  },
  "implementation-acceptance-criteria-required": {
    action: "add-acceptance-criteria",
    gate: "drift-blocking",
    guidance: "Declare module.meta.implementation.acceptance_criteria[] that links the current implementation contract to evidence, validator rules, fixtures, or manual review."
  },
  "implementation-acceptance-criteria-id-unique": {
    action: "fix-acceptance-criteria-id",
    gate: "drift-blocking",
    guidance: "Rename or merge duplicate acceptance criteria ids so each contract requirement has one stable identity."
  },
  "implementation-acceptance-criteria-evidence-ref": {
    action: "resolve-evidence-ref",
    gate: "drift-blocking",
    guidance: "Point evidence_refs at declared module.meta.implementation.evidence[].id values, or add the missing evidence anchor."
  },
  "implementation-acceptance-criteria-evidence-required": {
    action: "add-evidence-ref",
    gate: "drift-blocking",
    guidance: "Add at least one evidence_refs entry for evidence-ref criteria so the requirement is tied to proof."
  },
  "implementation-acceptance-criteria-blocking-unsatisfied": {
    action: "satisfy-or-waive-criterion",
    gate: "drift-blocking",
    guidance: "Move the blocking criterion to satisfied, or record an explicit waiver/remediation before stable consumption."
  },
  "implementation-acceptance-criteria-manual-review": {
    action: "automate-or-review",
    gate: "warning",
    guidance: "Prefer evidence, validator, or fixture checks where possible; if manual review remains necessary, keep the review anchor current."
  },
  "decision-provenance-source-ref": {
    action: "resolve-decision-source-ref",
    gate: "drift-blocking",
    guidance: "Point decision_provenance.source_refs at declared sections or artifacts that authorize the decision."
  },
  "decision-provenance-evidence-ref": {
    action: "resolve-decision-evidence-ref",
    gate: "drift-blocking",
    guidance: "Point decision_provenance.evidence_refs at declared sections or artifacts that provide proof anchors."
  },
  "decision-provenance-summary-ref": {
    action: "resolve-decision-summary-ref",
    gate: "drift-blocking",
    guidance: "Point decision_provenance.summary_ref at the section or artifact that owns the derived summary."
  },
  "decision-provenance-derived-summary": {
    action: "add-derived-summary-ref",
    gate: "drift-blocking",
    guidance: "Declare decision_provenance.summary_ref when a decision is derived from a summary rather than directly consumed from source evidence."
  },
  "decision-provenance-stable-evidence": {
    action: "refresh-or-block-decision",
    gate: "drift-blocking",
    guidance: "Do not expose an agent-consumable decision as stable while its evidence is stale, unresolved, or withheld."
  },
  "external-citation-id-unique": {
    action: "fix-citation-id",
    gate: "drift-blocking",
    guidance: "Rename or merge duplicate module.meta.external_citations[].citation_id values so each external citation has one stable identity."
  },
  "external-citation-ref": {
    action: "resolve-citation-ref",
    gate: "drift-blocking",
    guidance: "Point citation_refs at declared module.meta.external_citations[].citation_id values, or add the missing citation record."
  },
  "external-citation-authoritative-completeness": {
    action: "complete-authoritative-citation",
    gate: "drift-blocking",
    guidance: "External authority or authoritative-claim citations must declare locator and version_or_date before stable use."
  },
  "external-citation-assumption-posture": {
    action: "downgrade-or-reclassify-assumption",
    gate: "drift-blocking",
    guidance: "Assumptions and unsupported assumptions cannot be classified as external authority or authoritative claims."
  },
  "external-citation-stable-current": {
    action: "refresh-or-block-citation-backed-decision",
    gate: "drift-blocking",
    guidance: "Stable agent-consumable decisions cannot rely on stale, unresolved, or withheld authoritative external citations."
  },
  "read-model-freshness-required": {
    action: "add-read-model-freshness",
    gate: "drift-blocking",
    guidance: "Declare module.meta.contract.read_model.freshness with snapshot_id, exported_at, source_watermark, and staleness before stable read-model consumption."
  },
  "capability-compatibility-mismatch": {
    action: "align-capability-compatibility",
    gate: "drift-blocking",
    guidance: "Align the declared compatibility result with provider and consumer capability metadata, or correct the mismatched profile, version, or exposure fields."
  },
  "capability-compatibility-table-columns": {
    action: "add-capability-compatibility-columns",
    gate: "drift-blocking",
    guidance: "Declare all required capability compatibility matrix columns before relying on compatible or incompatible results."
  },
  "capability-compatibility-result": {
    action: "fix-capability-compatibility-result",
    gate: "drift-blocking",
    guidance: "Set expected_result to compatible, incompatible, partial, or unknown."
  },
  "changelog-delta-soft-limit": {
    action: "tighten-changelog-delta",
    gate: "warning",
    guidance: "Keep changelog.delta at or below 300 characters when possible; split unrelated changes or keep the entry precise before release."
  }
};

const CAPABILITY_COMPATIBILITY_COLUMNS = [
  "provider_capability_id",
  "required_capability_id",
  "provider_contract_profile",
  "accepted_contract_profile",
  "provider_schema_version_policy",
  "required_schema_version_policy",
  "provider_exposure_class",
  "required_exposure_class",
  "expected_result"
];

const CAPABILITY_COMPATIBILITY_RESULTS = new Set(["compatible", "incompatible", "partial", "unknown"]);

export async function runValidateCommand(argv) {
  if (argv.includes("-h") || argv.includes("--help")) {
    printValidateUsage();
    return 0;
  }

  const options = parseArgs(argv);
  const rootPath = path.resolve(options.root);
  const report = applyValidationGate(validateCorpus(rootPath, {
    reality: options.reality,
    repoRoot: options.repoRoot ? path.resolve(options.repoRoot) : rootPath
  }), options);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, rootPath);
  }

  return report.accepted ? 0 : 1;
}

function printValidateUsage() {
  console.log(`AODS validate

Usage:
  aods validate [root] [--json] [--strict] [--reality] [--repo-root <path>]

Flags:
  --json       Emit JSON validation report.
  --strict     Exit non-zero on warnings as well as errors.
  --reality    Run opt-in surface reality checks for declared current surfaces.
  --repo-root  Resolve repo-based surface-inventory checks from this path.
  -h, --help   Show help.
`);
}

function parseArgs(argv) {
  const options = {
    root: ".",
    json: false,
    strict: false,
    reality: false,
    repoRoot: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--strict") {
      options.strict = true;
      continue;
    }
    if (arg === "--reality") {
      options.reality = true;
      continue;
    }
    if (arg === "--repo-root") {
      const next = argv[index + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("--repo-root requires a path value");
      }
      options.repoRoot = next;
      index += 1;
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

export function validateCorpus(rootPath, options = {}) {
  const reality = options.reality === true;
  const repoRoot = options.repoRoot ? path.resolve(options.repoRoot) : rootPath;
  const report = createReport(path.basename(rootPath) || rootPath);

  const manifestPath = path.join(rootPath, "manifest.json");
  const manifestSchemaPath = path.join(rootPath, "schema", "manifest.schema.json");
  const companionSchemaPath = path.join(rootPath, "schema", "manifest-companion.schema.json");
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
  const companionSchema = fs.existsSync(companionSchemaPath)
    ? loadJson(companionSchemaPath, report, {
        level: "L1",
        rule: "manifest-companion-schema-exists",
        message: "schema/manifest-companion.schema.json missing or invalid JSON"
      })
    : null;
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
    strict: false,
    verbose: true
  });
  addFormats(ajv);
  ajv.addSchema(manifestSchema);
  if (companionSchema) {
    ajv.addSchema(companionSchema);
  }

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

  const companionPath = getManifestCompanionPath(manifest);
  const companion = companionPath
    ? loadJson(path.join(rootPath, companionPath), report, {
        level: "L1",
        rule: "manifest-companion-exists",
        message: `manifest companion missing or invalid JSON: ${companionPath}`
      })
    : null;
  if (companionPath && !companionSchema) {
    addIssue(report, {
      level: "L1",
      rule: "manifest-companion-schema",
      message: "schema/manifest-companion.schema.json missing while manifest.companion_index is in use"
    });
  }
  if (companion && companionSchema) {
    const validateCompanion = ajv.compile(companionSchema);
    if (!validateCompanion(companion)) {
      for (const error of validateCompanion.errors ?? []) {
        addIssue(report, {
          level: "L1",
          rule: "manifest-companion-schema",
          message: formatAjvError(error),
          path: error.instancePath || companionPath || "/manifest-companion"
        });
      }
    }
  }
  validateManifestCompanionPlacement(manifest, report);
  const runtimeManifest = mergeManifestRuntime(manifest, companion);

  const validateModule = ajv.compile(moduleSchema);
  const moduleEntries = loadModules(rootPath, runtimeManifest, report);

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
  validateChangelogDeltaSoftLimit(report, moduleEntries);

  validateUnregisteredModuleFiles(rootPath, report, moduleEntries, validateModule);

  const moduleMap = new Map(
    moduleEntries
      .filter((entry) => entry.module)
      .map((entry) => [entry.id, entry])
  );

  validateManifestReferences(runtimeManifest, report, moduleMap, rootPath);
  validateTouchRoutePairConsistency(runtimeManifest, report, moduleMap);
  validateGeneratedHumanPrimary(runtimeManifest, report, moduleMap, rootPath);
  validateSurfacePairSharedInvariants(runtimeManifest, report, moduleMap, rootPath);
  validateSurfacePairClaimConflicts(runtimeManifest, report, moduleMap, rootPath);
  validateModuleReferences(report, moduleMap);
  validateArtifactSemantics(report, moduleMap);
  if (reality) {
    validateSurfaceReality(report, moduleMap, {
      corpusRoot: rootPath,
      repoRoot
    });
  }
  validateDependencyCycles(report, moduleMap);
  validateLayerAndCapsuleRules(report, runtimeManifest, moduleMap);
  if (reality) {
    validateImplementationReality(report, runtimeManifest, moduleMap, {
      repoRoot
    });
  }
  validateAopChecks(report, moduleMap);

  report.summary.total_modules = moduleEntries.length;
  report.summary.total_sections = sumValues(moduleEntries, (entry) => entry.module?.sections?.length ?? 0);
  report.summary.total_artifacts = sumValues(moduleEntries, (entry) => entry.module?.artifacts?.length ?? 0);
  report.summary.total_tokens = sumValues(moduleEntries, (entry) => estimateTokens(entry.text ?? ""));
  report.summary.total_surface_pairs = Array.isArray(runtimeManifest.surface_pairs) ? runtimeManifest.surface_pairs.length : 0;

  finalizeReport(report);
  return report;
}

function validateChangelogDeltaSoftLimit(report, moduleEntries) {
  for (const entry of moduleEntries) {
    const changelog = entry.module?.changelog;
    if (!Array.isArray(changelog)) {
      continue;
    }
    for (const [index, item] of changelog.entries()) {
      const delta = item?.delta;
      if (
        typeof delta === "string" &&
        delta.length > CHANGELOG_DELTA_SOFT_LIMIT &&
        delta.length <= CHANGELOG_DELTA_HARD_LIMIT
      ) {
        addIssue(report, {
          level: "L3",
          moduleId: entry.id,
          rule: "changelog-delta-soft-limit",
          message: `changelog[${index}].delta has ${delta.length} characters; prefer ${CHANGELOG_DELTA_SOFT_LIMIT} or fewer and keep the hard limit at ${CHANGELOG_DELTA_HARD_LIMIT}.`,
          path: `/changelog/${index}/delta`,
          severity: "warning"
        });
      }
    }
  }
}

function loadModules(rootPath, manifest, report) {
  const modules = Array.isArray(manifest.modules) ? manifest.modules : [];
  const seenIds = new Set();
  const entries = [];

  for (const moduleRef of modules) {
    const entry = {
      id: moduleRef.id,
      ref: moduleRef,
      path: getModulePath(moduleRef),
      resolvedPath: null,
      module: null,
      text: ""
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

    if (!isRelativePath(entry.path ?? "")) {
      addIssue(report, {
        level: "L1",
        moduleId: moduleRef.id,
        rule: "relative-module-path",
        message: `module path must stay inside corpus root: ${entry.path}`
      });
      continue;
    }

    entry.resolvedPath = resolveCorpusPath(rootPath, entry.path ?? "");
    if (!entry.resolvedPath || !fs.existsSync(entry.resolvedPath)) {
      addIssue(report, {
        level: "L1",
        moduleId: moduleRef.id,
        rule: "module-path-exists",
        message: `module path missing: ${entry.path}`
      });
      continue;
    }

    try {
      entry.text = fs.readFileSync(entry.resolvedPath, "utf8");
      entry.module = JSON.parse(entry.text);
    } catch {
      addIssue(report, {
        level: "L1",
        moduleId: moduleRef.id,
        rule: "module-json-parse",
        message: `module JSON invalid: ${entry.path}`
      });
    }
  }

  return entries;
}

function validateManifestReferences(manifest, report, moduleMap, rootPath) {
  const implementationRepoIds = new Set();
  for (const repo of manifest.project_topology?.implementation_repos ?? []) {
    if (implementationRepoIds.has(repo.id)) {
      addIssue(report, {
        level: "L2",
        rule: "implementation-repo-id-unique",
        message: `project_topology.implementation_repos[] contains duplicate id: ${repo.id}`
      });
    }
    implementationRepoIds.add(repo.id);
  }

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

  validateGlossaryRegistry(manifest, report, moduleMap);
  validateStructuredTermRefs(manifest, report, moduleMap);

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

    if (hasGeneratedHumanPrimary(pair) && pair.sync_source !== "agent-primary") {
      addIssue(report, {
        level: "L2",
        rule: "surface-pair-generated-sync-source",
        message: `surface pair ${pair.pair_id} uses human_generation but sync_source is not agent-primary`
      });
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

function validateGlossaryRegistry(manifest, report, moduleMap) {
  const glossary = manifest.glossary;
  if (!isPlainObject(glossary)) {
    return;
  }

  const terms = Object.entries(glossary).map(([termId, value]) => normalizeGlossaryTerm(termId, value));
  const currentTermIdsByScope = new Set();
  const aliasTargetsByScope = new Map();

  for (const term of terms) {
    const scopeKey = normalizeGlossaryScope(term.scope);
    if (term.status === "current") {
      currentTermIdsByScope.add(`${scopeKey}\u0000${normalizeGlossaryAlias(term.termId)}`);
      for (const alias of term.aliases) {
        const aliasKey = normalizeGlossaryAlias(alias);
        if (!aliasKey) {
          continue;
        }
        const scopedAliasKey = `${scopeKey}\u0000${aliasKey}`;
        const previous = aliasTargetsByScope.get(scopedAliasKey);
        if (previous && previous !== term.termId) {
          addIssue(report, {
            level: "L2",
            rule: "glossary-alias-unique",
            message: `glossary alias maps to multiple current terms in scope ${scopeKey}: ${alias} -> ${previous}, ${term.termId}`
          });
        } else {
          aliasTargetsByScope.set(scopedAliasKey, term.termId);
        }
      }
    }
  }

  for (const term of terms) {
    if (term.declaredTermId && term.declaredTermId !== term.termId) {
      addIssue(report, {
        level: "L2",
        rule: "glossary-term-id-match",
        message: `glossary term_id must match glossary key: ${term.termId} != ${term.declaredTermId}`
      });
    }

    const scopeKey = normalizeGlossaryScope(term.scope);

    for (const deprecatedTerm of term.deprecatedTerms) {
      const replacementKey = normalizeGlossaryAlias(deprecatedTerm.replacement);
      const scopedReplacementKey = `${scopeKey}\u0000${replacementKey}`;
      if (!currentTermIdsByScope.has(scopedReplacementKey) && !aliasTargetsByScope.has(scopedReplacementKey)) {
        addIssue(report, {
          level: "L2",
          rule: "glossary-deprecated-replacement-ref",
          message: `deprecated glossary term references missing current replacement: ${deprecatedTerm.term} -> ${deprecatedTerm.replacement}`
        });
      }
    }

    for (const surfaceRef of term.linkedSurfaces) {
      if (!resolveGlossarySurfaceRef(surfaceRef, moduleMap)) {
        addIssue(report, {
          level: "L2",
          rule: "glossary-linked-surface-ref",
          message: `glossary term references missing linked surface: ${term.termId} -> ${surfaceRef}`
        });
      }
    }
  }
}

function normalizeGlossaryTerm(termId, value) {
  if (typeof value === "string") {
    return {
      termId,
      declaredTermId: null,
      aliases: [],
      deprecatedTerms: [],
      scope: "system",
      linkedSurfaces: [],
      status: "current"
    };
  }
  if (!isPlainObject(value)) {
    return {
      termId,
      declaredTermId: null,
      aliases: [],
      deprecatedTerms: [],
      scope: "system",
      linkedSurfaces: [],
      status: "current"
    };
  }
  return {
    termId,
    declaredTermId: typeof value.term_id === "string" ? value.term_id : null,
    aliases: normalizeStringList(value.aliases),
    deprecatedTerms: Array.isArray(value.deprecated_terms)
      ? value.deprecated_terms.filter((entry) => isPlainObject(entry))
      : [],
    scope: typeof value.scope === "string" && value.scope.trim() !== "" ? value.scope : "system",
    linkedSurfaces: normalizeStringList(value.linked_surfaces),
    status: typeof value.status === "string" ? value.status : "current"
  };
}

function validateStructuredTermRefs(manifest, report, moduleMap) {
  const glossaryIndex = buildGlossaryIndex(manifest.glossary);

  for (const [moduleId, entry] of moduleMap) {
    const refs = collectModuleTermRefs(entry.module);
    const manifestSummary = normalizeTermRefSummary(entry.ref.term_ref_summary);
    const moduleSummary = buildTermRefSummary(refs, glossaryIndex);

    if (manifestSummary || moduleSummary) {
      if (!manifestSummary || !moduleSummary) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "term-ref-summary-mirror",
          message: "term_ref_summary must be declared on manifest.modules[] when module term_refs[] are declared"
        });
      } else if (!sameTermRefSummary(manifestSummary, moduleSummary)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "term-ref-summary-match",
          message: "manifest.modules[].term_ref_summary must match module term_refs[] summary"
        });
      }
    }

    for (const ref of refs) {
      const termId = ref.term_id;
      if (!isNonEmptyString(termId)) {
        continue;
      }
      const location = ref.location;
      if (glossaryIndex.aliases.has(termId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          sid: location.sid ?? null,
          rule: "term-ref-alias-used",
          term_id: termId,
          canonical_term_id: glossaryIndex.aliases.get(termId),
          message: `term_refs[].term_id must use canonical glossary key, not alias: ${termId}`
        });
        continue;
      }
      if (glossaryIndex.deprecated.has(termId)) {
        const deprecated = glossaryIndex.deprecated.get(termId);
        addIssue(report, {
          level: "L3",
          moduleId,
          sid: location.sid ?? null,
          rule: "term-ref-deprecated-stable",
          term_id: termId,
          replacement: deprecated.replacement ?? null,
          message: `term_refs[].term_id references deprecated glossary term: ${termId}`,
          severity: "warning"
        });
        continue;
      }
      if (!glossaryIndex.current.has(termId)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          sid: location.sid ?? null,
          rule: "term-ref-unresolved",
          term_id: termId,
          message: `term_refs[].term_id references missing glossary term: ${termId}`
        });
      }
      if (["required", "allowed"].includes(ref.usage) && !isNonEmptyString(ref.owner)) {
        addIssue(report, {
          level: "L3",
          moduleId,
          sid: location.sid ?? null,
          rule: "term-ref-owner-missing",
          term_id: termId,
          message: `stable term ref should declare owner: ${termId}`,
          severity: "warning"
        });
      }
    }
  }
}

function buildGlossaryIndex(glossary) {
  const current = new Set();
  const aliases = new Map();
  const deprecated = new Map();

  if (!isPlainObject(glossary)) {
    return { current, aliases, deprecated };
  }

  for (const term of Object.entries(glossary).map(([termId, value]) => normalizeGlossaryTerm(termId, value))) {
    current.add(term.termId);
    for (const alias of term.aliases) {
      aliases.set(alias, term.termId);
    }
    for (const entry of term.deprecatedTerms) {
      if (isNonEmptyString(entry.term)) {
        deprecated.set(entry.term, entry);
      }
    }
  }

  return { current, aliases, deprecated };
}

function collectModuleTermRefs(module) {
  const refs = [];
  for (const section of module.sections ?? []) {
    for (const ref of Array.isArray(section.term_refs) ? section.term_refs : []) {
      if (isPlainObject(ref)) {
        refs.push({ ...ref, location: { kind: "section", sid: section.sid } });
      }
    }
  }
  for (const artifact of module.artifacts ?? []) {
    for (const ref of Array.isArray(artifact.term_refs) ? artifact.term_refs : []) {
      if (isPlainObject(ref)) {
        refs.push({ ...ref, location: { kind: "artifact", artifact_id: artifact.artifact_id } });
      }
    }
  }
  for (const ref of Array.isArray(module.meta?.contract?.term_refs) ? module.meta.contract.term_refs : []) {
    if (isPlainObject(ref)) {
      refs.push({ ...ref, location: { kind: "contract" } });
    }
  }
  return refs;
}

function buildTermRefSummary(refs, glossaryIndex) {
  if (refs.length === 0) {
    return null;
  }
  const summary = {
    total: refs.length,
    stable_refs: 0,
    deprecated_refs: 0,
    unresolved_refs: 0
  };
  for (const ref of refs) {
    if (glossaryIndex.current.has(ref.term_id)) {
      summary.stable_refs += 1;
    } else if (glossaryIndex.deprecated.has(ref.term_id) || glossaryIndex.aliases.has(ref.term_id)) {
      summary.deprecated_refs += 1;
    } else {
      summary.unresolved_refs += 1;
    }
  }
  return summary;
}

function normalizeGlossaryScope(scope) {
  return String(scope || "system").trim().toLowerCase();
}

function normalizeGlossaryAlias(alias) {
  return String(alias || "").trim().toLowerCase();
}

function resolveGlossarySurfaceRef(ref, moduleMap) {
  if (typeof ref !== "string" || ref.trim() === "") {
    return false;
  }
  if (!ref.includes(":")) {
    return moduleMap.has(ref);
  }
  return resolveSectionOrArtifactRef("", ref, moduleMap);
}

function validateTouchRoutePairConsistency(manifest, report, moduleMap) {
  const exactRouteMap = buildExactTouchRouteMap(manifest.boot_by_touch ?? []);

  for (const pair of manifest.surface_pairs ?? []) {
    if (!pair.agent_primary || !pair.human_primary) {
      continue;
    }

    const agentEntry = moduleMap.get(pair.agent_primary);
    const agentPath = normalizePath(agentEntry?.path ?? "");
    const humanPath = normalizePath(pair.human_primary ?? "");
    if (!agentPath || !humanPath) {
      continue;
    }

    const humanRoutes = exactRouteMap.get(humanPath) ?? new Map();
    if (humanRoutes.size === 0) {
      continue;
    }

    const agentRoutes = exactRouteMap.get(agentPath) ?? new Map();
    const pairSemanticModules = dedupe([pair.agent_primary, ...(pair.agent_supporting ?? [])]);

    for (const [intent, humanRoute] of humanRoutes) {
      const humanLoadModules = normalizeModuleList(humanRoute.load_modules);
      const missingPairModules = pairSemanticModules.filter((moduleId) => !humanLoadModules.includes(moduleId));
      if (missingPairModules.length > 0) {
        addIssue(report, {
          level: "L2",
          rule: "boot-by-touch-pair-coverage",
          message: `surface pair ${pair.pair_id} human_primary touch route for intent ${intent} must include paired semantic modules: ${missingPairModules.join(", ")}`
        });
      }

      const agentRoute = agentRoutes.get(intent) ?? agentRoutes.get("any");
      if (!agentRoute) {
        continue;
      }

      const agentLoadModules = normalizeModuleList(agentRoute.load_modules);
      const extraHumanModules = humanLoadModules.filter((moduleId) => !agentLoadModules.includes(moduleId));
      if (extraHumanModules.length > 0) {
        addIssue(report, {
          level: "L2",
          rule: "boot-by-touch-pair-subset",
          message: `surface pair ${pair.pair_id} human_primary touch route for intent ${intent} must stay inside paired agent route: ${extraHumanModules.join(", ")}`
        });
      }
    }
  }
}

function buildExactTouchRouteMap(routes) {
  const routeMap = new Map();

  for (const route of routes) {
    const match = normalizePath(route.match ?? "");
    if (!match || hasGlobPattern(match)) {
      continue;
    }
    const intent = route.intent ?? "any";
    if (!routeMap.has(match)) {
      routeMap.set(match, new Map());
    }
    routeMap.get(match).set(intent, route);
  }

  return routeMap;
}

function normalizeModuleList(moduleIds) {
  return Array.isArray(moduleIds) ? dedupe(moduleIds.filter((value) => typeof value === "string" && value.length > 0)) : [];
}

function validateManifestCompanionPlacement(manifest, report) {
  if (!manifest.companion_index) {
    return;
  }

  for (const field of MANIFEST_COMPANION_FIELDS) {
    if (manifest[field] !== undefined) {
      addIssue(report, {
        level: "L2",
        rule: "manifest-companion-placement",
        message: `manifest.${field} must move out of manifest.json when companion_index is declared`
      });
    }
  }
}

function validateGeneratedHumanPrimary(manifest, report, moduleMap, rootPath) {
  for (const pair of manifest.surface_pairs ?? []) {
    if (!hasGeneratedHumanPrimary(pair)) {
      continue;
    }
    if (!isRelativePath(pair.human_primary ?? "")) {
      continue;
    }

    const resolvedHumanPrimary = resolveCorpusPath(rootPath, pair.human_primary);
    if (!resolvedHumanPrimary || !fs.existsSync(resolvedHumanPrimary)) {
      continue;
    }

    let expectedContent;
    try {
      expectedContent = renderGeneratedHumanPrimary({
        manifest,
        pair,
        moduleMap
      });
    } catch (error) {
      addIssue(report, {
        level: "L2",
        rule: "surface-pair-generated-render",
        message: `surface pair ${pair.pair_id} cannot re-render generated human_primary: ${error.message}`
      });
      continue;
    }

    const actualContent = fs.readFileSync(resolvedHumanPrimary, "utf8");
    if (actualContent !== expectedContent) {
      addIssue(report, {
        level: "L2",
        rule: "surface-pair-generated-human-primary",
        message: `surface pair ${pair.pair_id} generated human_primary is out of sync with deterministic render: ${pair.human_primary}`
      });
    }
  }
}

function validateSurfacePairSharedInvariants(manifest, report, moduleMap, rootPath) {
  for (const pair of manifest.surface_pairs ?? []) {
    if (!Array.isArray(pair.shared_invariants) || pair.shared_invariants.length === 0) {
      continue;
    }

    const agentEntry = moduleMap.get(pair.agent_primary);
    if (!agentEntry?.resolvedPath || !fs.existsSync(agentEntry.resolvedPath)) {
      continue;
    }
    if (!isRelativePath(pair.human_primary ?? "")) {
      continue;
    }

    const resolvedHumanPrimary = resolveCorpusPath(rootPath, pair.human_primary);
    if (!resolvedHumanPrimary || !fs.existsSync(resolvedHumanPrimary)) {
      continue;
    }

    const agentText = fs.readFileSync(agentEntry.resolvedPath, "utf8");
    const humanText = fs.readFileSync(resolvedHumanPrimary, "utf8");
    const normalizedAgentText = normalizeInvariantText(agentText);
    const normalizedHumanText = normalizeInvariantText(humanText);

    for (const invariant of pair.shared_invariants) {
      const normalizedInvariant = normalizeInvariantText(invariant);
      if (!normalizedAgentText.includes(normalizedInvariant)) {
        addIssue(report, {
          level: "L2",
          moduleId: pair.agent_primary,
          rule: "surface-pair-shared-invariant-agent",
          message: `surface pair ${pair.pair_id} invariant missing from agent_primary: ${truncateInvariant(invariant)}`
        });
      }
      if (!normalizedHumanText.includes(normalizedInvariant)) {
        addIssue(report, {
          level: "L2",
          rule: "surface-pair-shared-invariant-human",
          message: `surface pair ${pair.pair_id} invariant missing from human_primary: ${truncateInvariant(invariant)}`
        });
      }
    }
  }
}

function validateSurfacePairClaimConflicts(manifest, report, moduleMap, rootPath) {
  for (const pair of manifest.surface_pairs ?? []) {
    const agentEntry = moduleMap.get(pair.agent_primary);
    if (!agentEntry?.module) {
      continue;
    }
    if (!isRelativePath(pair.human_primary ?? "")) {
      continue;
    }

    const resolvedHumanPrimary = resolveCorpusPath(rootPath, pair.human_primary);
    if (!resolvedHumanPrimary || !fs.existsSync(resolvedHumanPrimary)) {
      continue;
    }

    const conflicts = detectPairedSurfaceClaimConflicts(
      collectModuleSemanticText(agentEntry.module),
      fs.readFileSync(resolvedHumanPrimary, "utf8")
    );

    for (const conflict of conflicts.slice(0, 3)) {
      addIssue(report, {
        level: "L2",
        moduleId: pair.agent_primary,
        rule: "surface-pair-claim-conflict",
        message: `surface pair ${pair.pair_id} has conflicting ${conflict.family} claim: agent "${truncateSample(conflict.agentSentence)}" vs human "${truncateSample(conflict.humanSentence)}"`
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

    validateExternalCitations(report, moduleId, module);

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
          dependency_id: depId,
          available_module_ids_sample: [...moduleMap.keys()].slice(0, 10),
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

function validateExternalCitations(report, moduleId, module) {
  const citations = Array.isArray(module.meta?.external_citations) ? module.meta.external_citations : [];
  const citationMap = new Map();
  const staleAuthoritativeStatuses = new Set(["stale", "unresolved", "withheld"]);
  const validCitations = citations.filter((citation) => citation && typeof citation === "object" && !Array.isArray(citation));

  if (validCitations.length > 0) {
    ensureExternalCitationSummary(report).modules_with_citations += 1;
  }

  for (const citation of validCitations) {
    recordExternalCitationSummary(report, citation);
    const citationId = citation.citation_id;
    if (citationMap.has(citationId)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "external-citation-id-unique",
        message: `duplicate external citation id: ${citationId}`
      });
    } else {
      citationMap.set(citationId, citation);
    }

    if (isAuthoritativeExternalCitation(citation) && !hasCompleteExternalCitationLocator(citation)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "external-citation-authoritative-completeness",
        message: `external citation ${citationId} must declare locator and version_or_date for authoritative use`
      });
    }

    if (isAssumptionCitation(citation) && isAuthoritativeExternalCitation(citation)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "external-citation-assumption-posture",
        message: `external citation ${citationId} cannot be both an assumption and an authoritative source`
      });
    }
  }

  for (const section of module.sections ?? []) {
    for (const citationRef of section.citation_refs ?? []) {
      validateExternalCitationRef(report, moduleId, citationRef, citationMap, `section ${section.sid}`);
    }
  }

  for (const artifact of module.artifacts ?? []) {
    for (const citationRef of artifact.citation_refs ?? []) {
      validateExternalCitationRef(report, moduleId, citationRef, citationMap, `artifact ${artifact.artifact_id}`);
    }

    const provenance = artifact.decision_provenance;
    if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
      continue;
    }

    for (const citationRef of provenance.citation_refs ?? []) {
      const stableAgentDecision =
        provenance.consumer_surface === "agent-consumable" &&
        provenance.consumption_gate === "stable";
      const citation = validateExternalCitationRef(
        report,
        moduleId,
        citationRef,
        citationMap,
        `artifact ${artifact.artifact_id} decision_provenance`
      );
      if (stableAgentDecision) {
        recordStableDecisionCitationSummary(report, citation);
      }
      if (
        citation &&
        stableAgentDecision &&
        isAuthoritativeExternalCitation(citation) &&
        staleAuthoritativeStatuses.has(citation.review_status)
      ) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "external-citation-stable-current",
          message: `artifact ${artifact.artifact_id} cannot be stable agent-consumable while citation ${citationRef} review_status=${citation.review_status}`
        });
      }
    }
  }
}

function validateExternalCitationRef(report, moduleId, citationRef, citationMap, owner) {
  ensureExternalCitationSummary(report).cited_refs += 1;
  const citation = citationMap.get(citationRef);
  if (!citation) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "external-citation-ref",
      message: `${owner} references missing external citation: ${citationRef}`
    });
    return null;
  }
  return citation;
}

function ensureExternalCitationSummary(report) {
  if (!report.external_citations) {
    report.external_citations = {
      total: 0,
      modules_with_citations: 0,
      authoritative: 0,
      current_authoritative: 0,
      stale_authoritative: 0,
      unresolved_authoritative: 0,
      withheld_authoritative: 0,
      assumptions: 0,
      unsupported_assumptions: 0,
      current: 0,
      stale: 0,
      unresolved: 0,
      withheld: 0,
      cited_refs: 0,
      stable_decision_refs: 0,
      stable_decision_current_authoritative_refs: 0,
      stable_decision_noncurrent_authoritative_refs: 0
    };
  }
  return report.external_citations;
}

function recordExternalCitationSummary(report, citation) {
  const summary = ensureExternalCitationSummary(report);
  summary.total += 1;

  if (Object.hasOwn(summary, citation.review_status)) {
    summary[citation.review_status] += 1;
  }

  if (isAuthoritativeExternalCitation(citation)) {
    summary.authoritative += 1;
    const statusKey = `${citation.review_status}_authoritative`;
    if (Object.hasOwn(summary, statusKey)) {
      summary[statusKey] += 1;
    }
  }

  if (isAssumptionCitation(citation)) {
    summary.assumptions += 1;
  }

  if (citation.authority_relation === "unsupported-assumption") {
    summary.unsupported_assumptions += 1;
  }
}

function recordStableDecisionCitationSummary(report, citation) {
  const summary = ensureExternalCitationSummary(report);
  summary.stable_decision_refs += 1;

  if (!citation || !isAuthoritativeExternalCitation(citation)) {
    return;
  }

  if (citation.review_status === "current") {
    summary.stable_decision_current_authoritative_refs += 1;
  } else {
    summary.stable_decision_noncurrent_authoritative_refs += 1;
  }
}

function isAuthoritativeExternalCitation(citation) {
  return citation.authority_relation === "external-authority" || citation.claim_posture === "authoritative-claim";
}

function isAssumptionCitation(citation) {
  return (
    citation.source_type === "assumption" ||
    citation.authority_relation === "unsupported-assumption" ||
    citation.claim_posture === "assumption"
  );
}

function hasCompleteExternalCitationLocator(citation) {
  return hasTrimmedString(citation.locator) && hasTrimmedString(citation.version_or_date);
}

function hasTrimmedString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateArtifactSemantics(report, moduleMap) {
  for (const [moduleId, entry] of moduleMap) {
    for (const artifact of entry.module.artifacts ?? []) {
      validateDecisionProvenance(report, moduleId, artifact, moduleMap);
      switch (artifact.type) {
        case "surface-inventory":
          validateSurfaceInventoryArtifact(report, moduleId, entry.path, artifact);
          break;
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
          validateCapabilityCompatibilityArtifact(report, moduleId, artifact);
          break;
        default:
          break;
      }
    }
  }
}

function validateDecisionProvenance(report, moduleId, artifact, moduleMap) {
  const provenance = artifact.decision_provenance;
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    return;
  }

  for (const ref of provenance.source_refs ?? []) {
    if (!resolveSectionOrArtifactRef(moduleId, ref, moduleMap)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "decision-provenance-source-ref",
        message: `artifact ${artifact.artifact_id} decision_provenance.source_refs references missing source: ${ref}`
      });
    }
  }

  for (const ref of provenance.evidence_refs ?? []) {
    if (!resolveSectionOrArtifactRef(moduleId, ref, moduleMap)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "decision-provenance-evidence-ref",
        message: `artifact ${artifact.artifact_id} decision_provenance.evidence_refs references missing evidence: ${ref}`
      });
    }
  }

  if (provenance.summary_ref && !resolveSectionOrArtifactRef(moduleId, provenance.summary_ref, moduleMap)) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "decision-provenance-summary-ref",
      message: `artifact ${artifact.artifact_id} decision_provenance.summary_ref references missing summary: ${provenance.summary_ref}`
    });
  }

  if ((provenance.basis === "derived-summary" || provenance.basis === "mixed") && !provenance.summary_ref) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "decision-provenance-derived-summary",
      message: `artifact ${artifact.artifact_id} decision_provenance.summary_ref is required for ${provenance.basis} decisions`
    });
  }

  const staleOrUnresolved = new Set(["stale", "unresolved", "withheld"]);
  if (
    provenance.consumer_surface === "agent-consumable" &&
    provenance.consumption_gate === "stable" &&
    staleOrUnresolved.has(provenance.evidence_status)
  ) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "decision-provenance-stable-evidence",
      message: `artifact ${artifact.artifact_id} cannot be stable agent-consumable while evidence_status=${provenance.evidence_status}`
    });
  }
}

function validateSurfaceInventoryArtifact(report, moduleId, modulePath, artifact) {
  const content = artifact.content ?? {};
  const entries = Array.isArray(content.entries) ? content.entries : [];
  const base = content.base === "corpus" ? "corpus" : "repo";

  for (const surface of entries) {
    const surfaceId = surface.surface_id ?? "surface";
    const surfacePath = typeof surface.path === "string" ? surface.path : "";
    const location = `${modulePath}#${artifact.artifact_id}/${surfaceId}`;

    if (!isRelativePath(surfacePath)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "surface-inventory-relative-path",
        message: `artifact ${artifact.artifact_id} surface ${surfaceId} path must stay inside the ${base} root: ${surfacePath}`,
        path: location
      });
    }
  }
}

function validateSurfaceReality(report, moduleMap, roots) {
  const seenCurrentPaths = new Map();
  let repoRootInvalidReported = false;

  for (const [moduleId, entry] of moduleMap) {
    for (const artifact of entry.module.artifacts ?? []) {
      if (artifact.type !== "surface-inventory") {
        continue;
      }

      const content = artifact.content ?? {};
      const entries = Array.isArray(content.entries) ? content.entries : [];
      const base = content.base === "corpus" ? "corpus" : "repo";
      const baseRoot = base === "corpus" ? roots.corpusRoot : roots.repoRoot;
      if (base === "repo" && !isExistingDirectory(baseRoot)) {
        if (!repoRootInvalidReported) {
          addIssue(report, {
            level: "L1",
            rule: "reality-repo-root",
            message: `reality repo root must be an existing directory: ${roots.repoRoot}`
          });
          repoRootInvalidReported = true;
        }
        continue;
      }
      const placeholderFiles = new Set(DEFAULT_PLACEHOLDER_FILES);
      for (const placeholderFile of content.placeholder_files ?? []) {
        if (typeof placeholderFile === "string" && placeholderFile.length > 0) {
          placeholderFiles.add(placeholderFile);
        }
      }

      for (const surface of entries) {
        const surfaceId = surface.surface_id ?? "surface";
        const surfacePath = typeof surface.path === "string" ? surface.path : "";
        const location = `${entry.path}#${artifact.artifact_id}/${surfaceId}`;

        if (!isRelativePath(surfacePath)) {
          continue;
        }

        const resolvedPath = resolvePathWithinBase(baseRoot, surfacePath);
        if (!resolvedPath) {
          continue;
        }

        if (surface.state !== "current") {
          continue;
        }

        const currentKey = `${base}:${surface.kind}:${normalizeInventoryPath(path.relative(baseRoot, resolvedPath))}`;
        const existing = seenCurrentPaths.get(currentKey);
        if (existing) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "surface-inventory-duplicate-current",
            message: `artifact ${artifact.artifact_id} surface ${surfaceId} duplicates current ${surface.kind} path ${surfacePath}; already declared by ${existing.moduleId}/${existing.artifactId}/${existing.surfaceId}`,
            path: location
          });
          continue;
        }
        seenCurrentPaths.set(currentKey, {
          moduleId,
          artifactId: artifact.artifact_id,
          surfaceId
        });

        if (!fs.existsSync(resolvedPath)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "surface-inventory-current-missing",
            message: `artifact ${artifact.artifact_id} surface ${surfaceId} declares missing current ${surface.kind}: ${surfacePath}`,
            path: location
          });
          continue;
        }

        const stats = fs.statSync(resolvedPath);
        if (surface.kind === "file" && !stats.isFile()) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "surface-inventory-kind",
            message: `artifact ${artifact.artifact_id} surface ${surfaceId} expects file but found non-file at ${surfacePath}`,
            path: location
          });
          continue;
        }

        if (surface.kind === "directory" && !stats.isDirectory()) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "surface-inventory-kind",
            message: `artifact ${artifact.artifact_id} surface ${surfaceId} expects directory but found non-directory at ${surfacePath}`,
            path: location
          });
          continue;
        }

        if (surface.kind === "directory" && isPlaceholderOnlyDirectory(resolvedPath, placeholderFiles)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "surface-inventory-placeholder-directory",
            message: `artifact ${artifact.artifact_id} surface ${surfaceId} declares a placeholder-only current directory: ${surfacePath}`,
            path: location
          });
        }
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

function validateCapabilityCompatibilityArtifact(report, moduleId, artifact) {
  const content = artifact.content ?? {};
  const columns = Array.isArray(content.columns) ? content.columns : [];
  const shouldValidate =
    artifact.artifact_id.includes("capability-compatibility") ||
    columns.some((column) => CAPABILITY_COMPATIBILITY_COLUMNS.includes(column));

  if (!shouldValidate) {
    return;
  }

  const columnSet = new Set(columns);
  const missingColumns = CAPABILITY_COMPATIBILITY_COLUMNS.filter((column) => !columnSet.has(column));
  if (missingColumns.length > 0) {
    addIssue(report, {
      level: "L2",
      moduleId,
      rule: "capability-compatibility-table-columns",
      message: `artifact ${artifact.artifact_id} capability compatibility table missing columns: ${missingColumns.join(", ")}`
    });
    return;
  }

  for (const [index, row] of (content.rows ?? []).entries()) {
    if (!Array.isArray(row) || row.length !== columns.length) {
      continue;
    }

    const values = Object.fromEntries(columns.map((column, columnIndex) => [column, normalizeCapabilityCell(row[columnIndex])]));
    const expectedResult = values.expected_result;
    if (!CAPABILITY_COMPATIBILITY_RESULTS.has(expectedResult)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "capability-compatibility-result",
        message: `artifact ${artifact.artifact_id} row ${index} has invalid expected_result: ${values.expected_result}`
      });
      continue;
    }

    if (expectedResult === "partial" || expectedResult === "unknown") {
      continue;
    }

    const comparison = compareCapabilityCompatibility(values);
    if (comparison.result !== expectedResult) {
      const caseId = values.case_id ? ` case ${values.case_id}` : ` row ${index}`;
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "capability-compatibility-mismatch",
        message: `artifact ${artifact.artifact_id}${caseId} declares ${expectedResult} but metadata resolves ${comparison.result}: ${comparison.mismatches.join(", ")}`
      });
    }
  }
}

function compareCapabilityCompatibility(values) {
  const mismatches = [];
  if (values.provider_capability_id !== values.required_capability_id) {
    mismatches.push("capability_id");
  }
  if (!acceptsCapabilityValue(values.provider_contract_profile, values.accepted_contract_profile)) {
    mismatches.push("contract_profile");
  }
  if (!acceptsCapabilityValue(values.provider_schema_version_policy, values.required_schema_version_policy)) {
    mismatches.push("schema_version_policy");
  }
  if (!acceptsCapabilityValue(values.provider_exposure_class, values.required_exposure_class)) {
    mismatches.push("exposure_class");
  }

  return {
    result: mismatches.length === 0 ? "compatible" : "incompatible",
    mismatches
  };
}

function acceptsCapabilityValue(providerValue, acceptedValue) {
  const provider = normalizeCapabilityCell(providerValue);
  const acceptedValues = splitCapabilityValues(acceptedValue);
  return acceptedValues.includes("*") || acceptedValues.includes("any") || acceptedValues.includes(provider);
}

function splitCapabilityValues(value) {
  return normalizeCapabilityCell(value)
    .split(/[|,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeCapabilityCell(value) {
  return String(value ?? "").trim();
}

function validateDependencyCycles(report, moduleMap) {
  const visiting = new Set();
  const visited = new Set();

  function dfs(moduleId, stack) {
    if (visiting.has(moduleId)) {
      const cyclePath = [...stack, moduleId];
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "dependency-cycle",
        cycle_path: cyclePath,
        cycle_length: cyclePath.length - 1,
        message: `dependency cycle detected: ${cyclePath.join(" -> ")}`
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
  const topologyRepoIds = new Set((manifest.project_topology?.implementation_repos ?? []).map((repo) => repo.id));

  for (const [moduleId, entry] of moduleMap) {
    const { layer, category, tokens_approx: tokensApprox } = entry.ref;
    const capsuleMeta = entry.module.meta?.capsule;
    const refControl = normalizeControlMeta(entry.ref.control);
    const moduleControl = normalizeControlMeta(entry.module.meta?.control);
    const refProvenance = normalizeProvenanceMeta(entry.ref.provenance);
    const moduleProvenance = normalizeProvenanceMeta(entry.module.meta?.provenance);
    const refRuntimeContract = normalizeRuntimeContractMeta(entry.ref.runtime_contract);
    const moduleRuntimeContract = normalizeRuntimeContractMeta(entry.module.meta?.runtime_contract);
    const refRedaction = normalizeRedactionMeta(entry.ref.redaction);
    const moduleRedaction = normalizeRedactionMeta(entry.module.meta?.redaction);
    const refContract = normalizeContractMeta(entry.ref.contract);
    const moduleContract = normalizeContractMeta(entry.module.meta?.contract);
    const refImplementation = normalizeImplementationMeta(entry.ref.implementation);
    const moduleImplementation = normalizeImplementationMeta(entry.module.meta?.implementation);
    const moduleImplementationEvidence = normalizeImplementationEvidenceList(entry.module.meta?.implementation?.evidence);
    const moduleImplementationCriteria = normalizeImplementationAcceptanceCriteriaList(entry.module.meta?.implementation?.acceptance_criteria);
    const refSchemaVersioning = normalizeSchemaVersioningMeta(entry.ref.schema_versioning);
    const moduleSchemaVersioning = normalizeSchemaVersioningMeta(entry.module.meta?.schema_versioning);
    const effectiveControl = refControl ?? moduleControl;

    if (refControl || moduleControl) {
      if (!refControl || !moduleControl) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "control-metadata-mirror",
          message: "control metadata must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameControlMeta(refControl, moduleControl)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "control-metadata-match",
          message: "manifest.modules[].control must match module.meta.control"
        });
      }
    }

    if (refProvenance || moduleProvenance) {
      if (!refProvenance || !moduleProvenance) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "provenance-metadata-mirror",
          message: "provenance summary must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameProvenanceMeta(refProvenance, moduleProvenance)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "provenance-metadata-match",
          message: "manifest.modules[].provenance must match module.meta.provenance summary fields"
        });
      }
    }

    if (refRuntimeContract || moduleRuntimeContract) {
      if (!refRuntimeContract || !moduleRuntimeContract) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "runtime-contract-mirror",
          message: "runtime contract summary must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameRuntimeContractMeta(refRuntimeContract, moduleRuntimeContract)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "runtime-contract-match",
          message: "manifest.modules[].runtime_contract must match module.meta.runtime_contract summary fields"
        });
      }
    }

    if (refRedaction || moduleRedaction) {
      if (!refRedaction || !moduleRedaction) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "redaction-metadata-mirror",
          message: "redaction summary must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameRedactionMeta(refRedaction, moduleRedaction)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "redaction-metadata-match",
          message: "manifest.modules[].redaction must match module.meta.redaction summary fields"
        });
      }
    }

    if (moduleRedaction?.has_sensitive_payloads === true) {
      const sensitiveClasses = normalizeStringList(entry.module.meta?.redaction?.sensitive_classes);
      const exposurePolicy = entry.module.meta?.redaction?.exposure_policy;
      if (sensitiveClasses.length === 0 || typeof exposurePolicy !== "string" || exposurePolicy.trim() === "") {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "redaction-sensitive-completeness",
          message: "sensitive modules must declare sensitive_classes and exposure_policy"
        });
      }
    }

    if (refContract || moduleContract) {
      if (!refContract || !moduleContract) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "contract-metadata-mirror",
          message: "contract profile summary must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameContractMeta(refContract, moduleContract)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "contract-metadata-match",
          message: "manifest.modules[].contract must match module.meta.contract summary fields"
        });
      }

      if (moduleContract?.profile === "read-model" && !hasReadModelFreshness(entry.module.meta?.contract)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "read-model-freshness-required",
          message: "read-model contract profile must declare module.meta.contract.read_model.freshness before stable consumption"
        });
      }
    }

    if (refImplementation || moduleImplementation) {
      if (!refImplementation || !moduleImplementation) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-metadata-mirror",
          message: "implementation linkage summary must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameImplementationMeta(refImplementation, moduleImplementation)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-metadata-match",
          message: "manifest.modules[].implementation must match module.meta.implementation summary fields"
        });
      }
    }

    if (moduleImplementation) {
      if (topologyRepoIds.size === 0) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-topology-required",
          message: "module.meta.implementation requires manifest.project_topology.implementation_repos[]"
        });
      } else if (!topologyRepoIds.has(moduleImplementation.repo_id)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-repo-ref",
          message: `module.meta.implementation.repo_id references missing implementation repo: ${moduleImplementation.repo_id}`
        });
      }

      if (moduleImplementation.status === "current" && moduleImplementationEvidence.length === 0) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-evidence-required",
          message: "current implementation linkage must declare module.meta.implementation.evidence[]"
        });
      }
      if (moduleImplementation.status === "current" && moduleImplementationCriteria.length === 0) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-acceptance-criteria-required",
          message: "current implementation linkage must declare module.meta.implementation.acceptance_criteria[]"
        });
      }

      const evidenceIds = new Set();
      let currentEvidenceCount = 0;
      for (const evidence of moduleImplementationEvidence) {
        if (evidenceIds.has(evidence.id)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "implementation-evidence-id-unique",
            message: `module.meta.implementation.evidence[] contains duplicate id: ${evidence.id}`
          });
        }
        evidenceIds.add(evidence.id);

        if (evidence.status === "current") {
          currentEvidenceCount += 1;
        }
        if (evidence.status === "stale") {
          addIssue(report, {
            level: "L3",
            moduleId,
            rule: "implementation-evidence-stale",
            message: `implementation evidence is marked stale: ${evidence.id}`,
            severity: "warning"
          });
        }
      }
      if (moduleImplementation.status === "current" && moduleImplementationEvidence.length > 0 && currentEvidenceCount === 0) {
        addIssue(report, {
          level: "L3",
          moduleId,
          rule: "implementation-current-evidence-missing",
          message: "current implementation linkage has no current evidence anchors",
          severity: "warning"
        });
      }

      const criteriaIds = new Set();
      for (const criterion of moduleImplementationCriteria) {
        if (criteriaIds.has(criterion.id)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "implementation-acceptance-criteria-id-unique",
            message: `module.meta.implementation.acceptance_criteria[] contains duplicate id: ${criterion.id}`
          });
        }
        criteriaIds.add(criterion.id);

        if (criterion.check_type === "evidence-ref" && criterion.evidence_refs.length === 0) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "implementation-acceptance-criteria-evidence-required",
            message: `acceptance criterion must reference implementation evidence: ${criterion.id}`
          });
        }
        for (const evidenceRef of criterion.evidence_refs) {
          if (!evidenceIds.has(evidenceRef)) {
            addIssue(report, {
              level: "L2",
              moduleId,
              rule: "implementation-acceptance-criteria-evidence-ref",
              message: `acceptance criterion references missing implementation evidence: ${criterion.id} -> ${evidenceRef}`
            });
          }
        }
        if (criterion.check_type === "manual-review") {
          addIssue(report, {
            level: "L3",
            moduleId,
            rule: "implementation-acceptance-criteria-manual-review",
            message: `acceptance criterion relies on manual review: ${criterion.id}`,
            severity: "warning"
          });
        }
        if (criterion.blocking !== "none" && ["blocked", "partial", "waived"].includes(criterion.status)) {
          addIssue(report, {
            level: "L2",
            moduleId,
            rule: "implementation-acceptance-criteria-blocking-unsatisfied",
            message: `blocking acceptance criterion is not satisfied: ${criterion.id}`
          });
        }
      }
    }

    if (refSchemaVersioning || moduleSchemaVersioning) {
      if (!refSchemaVersioning || !moduleSchemaVersioning) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "schema-versioning-metadata-mirror",
          message: "schema versioning summary must be declared on both manifest.modules[] and module.meta when either side uses it"
        });
      } else if (!sameSchemaVersioningMeta(refSchemaVersioning, moduleSchemaVersioning)) {
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "schema-versioning-metadata-match",
          message: "manifest.modules[].schema_versioning must match module.meta.schema_versioning summary fields"
        });
      }
    }

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

    if (hasRuntimeSideEffects(entry.module.meta?.runtime_contract) && !hasRuntimeObservability(entry.module.meta?.runtime_contract)) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "runtime-contract-observability",
        message: "runtime contracts with side effects must declare telemetry, checkpoints, or outputs"
      });
    }

    if (effectiveControl?.role === "sensor" && (layer === "root" || layer === "capsule")) {
      addIssue(report, {
        level: "L2",
        moduleId,
        rule: "sensor-layer-scope",
        message: "sensor-only modules must not live in root or capsule layers"
      });
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

  if ((manifest.boot_by_touch ?? []).length === 0 && moduleMap.size >= 10) {
    addIssue(report, {
      level: "L3",
      rule: "boot-by-touch-empty-large-corpus",
      message: `boot_by_touch is empty but corpus has ${moduleMap.size} modules; consider adding file-scoped authoring routes for faster editing workflows`,
      severity: "warning"
    });
  }

  for (const [moduleId, entry] of moduleMap) {
    if (entry.ref.category !== "capsule") {
      continue;
    }

    const capsuleTokens = estimateTokens(collectSectionText(entry.module.sections ?? []));
    const routedTargetIds = new Set((entry.module.meta?.capsule?.routes_to ?? []).map((route) => route.split(":")[0]));
    for (const targetModuleId of routedTargetIds) {
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
          message: `capsule content (${capsuleTokens} tokens approx) is not shorter than routed module ${targetModuleId} (${targetTokens} tokens approx)`,
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

function validateImplementationReality(report, manifest, moduleMap, roots) {
  const topologyRepos = new Map(
    (manifest.project_topology?.implementation_repos ?? []).map((repo) => [repo.id, repo])
  );
  if (topologyRepos.size === 0) {
    return;
  }

  const summary = {
    linked_modules: 0,
    unlinked_modules: 0,
    checked_paths: 0,
    missing_paths: 0,
    evidence_total: 0,
    modules_with_evidence: 0,
    modules_without_evidence: 0,
    current_evidence: 0,
    planned_evidence: 0,
    stale_evidence: 0,
    blocked_evidence: 0,
    checked_evidence_locators: 0,
    missing_evidence_locators: 0,
    unchecked_repos: []
  };
  const uncheckedReasons = new Set();

  for (const [moduleId, entry] of moduleMap) {
    const implementation = normalizeImplementationMeta(entry.module.meta?.implementation ?? entry.ref.implementation);
    if (!implementation) {
      continue;
    }

    const repo = topologyRepos.get(implementation.repo_id);
    if (!repo) {
      summary.unlinked_modules += 1;
      continue;
    }

    summary.linked_modules += 1;
    const evidenceAnchors = normalizeImplementationEvidenceList(entry.module.meta?.implementation?.evidence);
    summary.evidence_total += evidenceAnchors.length;
    if (evidenceAnchors.length > 0) {
      summary.modules_with_evidence += 1;
    } else {
      summary.modules_without_evidence += 1;
    }
    summary.current_evidence += evidenceAnchors.filter((evidence) => evidence.status === "current").length;
    summary.planned_evidence += evidenceAnchors.filter((evidence) => evidence.status === "planned").length;
    summary.stale_evidence += evidenceAnchors.filter((evidence) => evidence.status === "stale").length;
    summary.blocked_evidence += evidenceAnchors.filter((evidence) => evidence.status === "blocked").length;

    const repoResolution = resolveImplementationRepoRoot(roots.repoRoot, repo);
    if (!repoResolution.root) {
      summary.unchecked_repos.push({
        repo_id: repo.id,
        locator: repo.locator,
        reason: repoResolution.reason
      });
      uncheckedReasons.add(`${repo.id} ${repoResolution.reason}: ${repo.locator}`);
      continue;
    }
    const implementationRepoRoot = repoResolution.root;

    for (const relativePath of implementation.paths) {
      const resolvedPath = resolvePathWithinBase(implementationRepoRoot, relativePath);
      if (!resolvedPath) {
        summary.missing_paths += 1;
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-path-contained",
          message: `implementation path must stay inside linked repo root: ${relativePath}`
        });
        continue;
      }

      summary.checked_paths += 1;
      if (!fs.existsSync(resolvedPath)) {
        summary.missing_paths += 1;
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-path-exists",
          message: `implementation path missing in linked repo ${implementation.repo_id}: ${relativePath}`
        });
      }
    }

    for (const evidence of evidenceAnchors) {
      if (!shouldCheckImplementationEvidenceLocator(evidence)) {
        continue;
      }

      const resolvedPath = resolvePathWithinBase(implementationRepoRoot, evidence.locator);
      if (!resolvedPath) {
        summary.missing_evidence_locators += 1;
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-evidence-locator-contained",
          message: `implementation evidence locator must stay inside linked repo root: ${evidence.locator}`
        });
        continue;
      }

      summary.checked_evidence_locators += 1;
      if (!fs.existsSync(resolvedPath)) {
        summary.missing_evidence_locators += 1;
        addIssue(report, {
          level: "L2",
          moduleId,
          rule: "implementation-evidence-locator-exists",
          message: `implementation evidence locator missing in linked repo ${implementation.repo_id}: ${evidence.locator}`
        });
      }
    }
  }

  if (summary.linked_modules === 0) {
    uncheckedReasons.add("project_topology is declared but no modules currently expose implementation linkage");
  }

  if (uncheckedReasons.size > 0) {
    summary.unchecked_reason = [...uncheckedReasons].join("; ");
    if (summary.linked_modules === 0) {
      addIssue(report, {
        level: "L3",
        rule: "topology-reality-unchecked",
        message: `topology-aware reality summary is partial: ${summary.unchecked_reason}`,
        severity: "warning"
      });
    }
  }

  if (summary.unchecked_repos.length === 0) {
    delete summary.unchecked_repos;
  }

  report.topology = summary;
}

function validateUnregisteredModuleFiles(rootPath, report, moduleEntries, validateModule) {
  const registeredPaths = new Set(
    moduleEntries
      .map((entry) => normalizeInventoryPath(entry.path))
      .filter((candidate) => candidate && candidate !== ".")
  );
  if (registeredPaths.size === 0) {
    return;
  }

  const searchRoots = collectModuleSearchRoots(registeredPaths);
  const seenCandidates = new Set();

  for (const searchRoot of searchRoots) {
    const resolvedSearchRoot = resolvePathWithinBase(rootPath, searchRoot);
    if (!resolvedSearchRoot || !isExistingDirectory(resolvedSearchRoot)) {
      continue;
    }

    const candidatePaths = collectJsonFilesInDirectory(rootPath, resolvedSearchRoot, {
      recursive: searchRoot !== "."
    });
    for (const candidatePath of candidatePaths) {
      const normalizedCandidatePath = normalizeInventoryPath(candidatePath);
      if (
        normalizedCandidatePath === "." ||
        registeredPaths.has(normalizedCandidatePath) ||
        seenCandidates.has(normalizedCandidatePath)
      ) {
        continue;
      }
      seenCandidates.add(normalizedCandidatePath);

      let candidateModule = null;
      try {
        candidateModule = JSON.parse(
          fs.readFileSync(path.join(rootPath, normalizedCandidatePath), "utf8")
        );
      } catch {
        continue;
      }

      if (!validateModule(candidateModule)) {
        continue;
      }

      addIssue(report, {
        level: "L3",
        rule: "unregistered-module-file",
        message: `module JSON exists on disk but is not registered in manifest.modules[]: ${normalizedCandidatePath}`,
        path: normalizedCandidatePath,
        severity: "warning"
      });
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

function resolveSectionOrArtifactRef(currentModuleId, ref, moduleMap) {
  return resolveSectionRef(currentModuleId, ref, moduleMap) || resolveArtifactRef(currentModuleId, ref, moduleMap);
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
  const remediation = issue.remediation ?? getRuleRemediation(issue.rule);
  const normalized = {
    level: issue.level,
    module_id: issue.moduleId ?? null,
    sid: issue.sid ?? null,
    rule: issue.rule,
    message: issue.message,
    path: issue.path ?? null
  };
  for (const [key, value] of Object.entries(issue)) {
    if (["level", "moduleId", "sid", "rule", "message", "path", "severity", "remediation"].includes(key)) {
      continue;
    }
    normalized[key] = value;
  }
  if (remediation) {
    normalized.remediation = remediation;
  }

  const bucket = issue.severity === "warning" ? "warnings" : "errors";
  report.levels[issue.level][bucket].push(normalized);
}

function getRuleRemediation(rule) {
  const remediation = REMEDIATION_BY_RULE[rule];
  return remediation ? { ...remediation } : null;
}

function finalizeReport(report) {
  for (const level of LEVELS) {
    const levelReport = report.levels[level];
    levelReport.pass = levelReport.errors.length === 0;
    report.summary.errors += levelReport.errors.length;
    report.summary.warnings += levelReport.warnings.length;
  }
}

function applyValidationGate(report, options) {
  for (const level of LEVELS) {
    const levelReport = report.levels[level];
    levelReport.pass = levelReport.errors.length === 0 && (!options.strict || levelReport.warnings.length === 0);
  }

  report.strict = options.strict;
  report.accepted = report.summary.errors === 0 && (!options.strict || report.summary.warnings === 0);
  report.status = report.accepted ? "pass" : "fail";
  return report;
}

export function printReport(report, rootPath) {
  const status = (report.status ?? (report.summary.errors === 0 ? "pass" : "fail")).toUpperCase();
  console.log(`${status} ${rootPath}`);
  console.log(
    `modules=${report.summary.total_modules} sections=${report.summary.total_sections} artifacts=${report.summary.total_artifacts} surface_pairs=${report.summary.total_surface_pairs} errors=${report.summary.errors} warnings=${report.summary.warnings}`
  );
  if (report.topology) {
    const uncheckedReason = report.topology.unchecked_reason ? ` unchecked_reason=${report.topology.unchecked_reason}` : "";
    console.log(
      `topology linked_modules=${report.topology.linked_modules} unlinked_modules=${report.topology.unlinked_modules} checked_paths=${report.topology.checked_paths} missing_paths=${report.topology.missing_paths} evidence_total=${report.topology.evidence_total ?? 0} current_evidence=${report.topology.current_evidence ?? 0} planned_evidence=${report.topology.planned_evidence ?? 0} stale_evidence=${report.topology.stale_evidence ?? 0} blocked_evidence=${report.topology.blocked_evidence ?? 0} missing_evidence_locators=${report.topology.missing_evidence_locators ?? 0}${uncheckedReason}`
    );
  }
  if (report.external_citations) {
    console.log(
      `citations total=${report.external_citations.total} authoritative=${report.external_citations.authoritative} current_authoritative=${report.external_citations.current_authoritative} stale_authoritative=${report.external_citations.stale_authoritative} unresolved_authoritative=${report.external_citations.unresolved_authoritative} withheld_authoritative=${report.external_citations.withheld_authoritative} assumptions=${report.external_citations.assumptions} unsupported_assumptions=${report.external_citations.unsupported_assumptions} cited_refs=${report.external_citations.cited_refs} stable_decision_refs=${report.external_citations.stable_decision_refs} stable_decision_current_authoritative_refs=${report.external_citations.stable_decision_current_authoritative_refs} stable_decision_noncurrent_authoritative_refs=${report.external_citations.stable_decision_noncurrent_authoritative_refs}`
    );
  }
  if (report.strict && report.summary.errors === 0 && report.summary.warnings > 0) {
    console.log("strict gate blocked by warnings");
  }

  for (const level of LEVELS) {
    const levelReport = report.levels[level];
    console.log(
      `${level} ${levelReport.pass ? "PASS" : "FAIL"} errors=${levelReport.errors.length} warnings=${levelReport.warnings.length}`
    );
    for (const issue of [...levelReport.errors, ...levelReport.warnings]) {
      const location = [issue.module_id, issue.sid].filter(Boolean).join(":");
      const prefix = levelReport.errors.includes(issue) ? "ERROR" : "WARN";
      const remediation = issue.remediation ? ` remediation=${issue.remediation.action}/${issue.remediation.gate}` : "";
      console.log(`  ${prefix} ${issue.rule}${location ? ` @ ${location}` : ""} -> ${issue.message}${remediation}`);
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

function isRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value) || /^[A-Za-z]:/.test(value)) {
    return false;
  }
  const normalized = normalizePath(value);
  return !normalized.split("/").some((segment) => segment === "..");
}

function resolveCorpusPath(rootPath, relativePath) {
  return resolvePathWithinBase(rootPath, relativePath);
}

function resolvePathWithinBase(baseRoot, relativePath) {
  if (!isRelativePath(relativePath)) {
    return null;
  }
  const resolvedPath = path.resolve(baseRoot, relativePath);
  const relative = normalizePath(path.relative(baseRoot, resolvedPath));
  if (relative === "" || relative === ".") {
    return resolvedPath;
  }
  if (relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) {
    return null;
  }
  return resolvedPath;
}

function hasGlobPattern(value) {
  return /[*?[\]{}]/u.test(value);
}

function dedupe(values) {
  return [...new Set(values)];
}

function normalizePath(value) {
  return String(value ?? "").replaceAll(path.sep, "/");
}

function normalizeInventoryPath(value) {
  const normalized = normalizePath(String(value ?? "").replaceAll("\\", "/"));
  const collapsed = path.posix.normalize(normalized);
  if (collapsed === "" || collapsed === ".") {
    return ".";
  }
  return collapsed.replace(/^\.\/+/u, "").replace(/\/+$/u, "");
}

function isExistingDirectory(targetPath) {
  try {
    return fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

function isPlaceholderOnlyDirectory(directoryPath, placeholderFiles) {
  return !directoryHasNonPlaceholderMaterial(directoryPath, placeholderFiles);
}

function directoryHasNonPlaceholderMaterial(directoryPath, placeholderFiles) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  if (entries.length === 0) {
    return false;
  }

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (directoryHasNonPlaceholderMaterial(entryPath, placeholderFiles)) {
        return true;
      }
      continue;
    }

    if (!entry.isFile()) {
      return true;
    }

    if (!placeholderFiles.has(entry.name)) {
      return true;
    }
  }

  return false;
}

function collectModuleSearchRoots(registeredPaths) {
  const directories = [...new Set(
    [...registeredPaths].map((registeredPath) => normalizeInventoryPath(path.posix.dirname(registeredPath)))
  )].sort((left, right) => left.length - right.length);
  const searchRoots = [];

  for (const directory of directories) {
    const covered = searchRoots.some((existing) => existing !== "." && (directory === existing || directory.startsWith(`${existing}/`)));
    if (!covered) {
      searchRoots.push(directory);
    }
  }

  return searchRoots;
}

function collectJsonFilesInDirectory(rootPath, directoryPath, options = {}) {
  const recursive = options.recursive !== false;
  const files = [];
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        files.push(...collectJsonFilesInDirectory(rootPath, entryPath, options));
      }
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }

    const relativePath = normalizePath(path.relative(rootPath, entryPath));
    if (relativePath === ".." || relativePath.startsWith("../") || path.isAbsolute(relativePath)) {
      continue;
    }
    files.push(relativePath);
  }

  return files;
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

function normalizeControlMeta(control) {
  if (control === null || typeof control !== "object" || Array.isArray(control)) {
    return null;
  }
  return {
    role: control.role,
    method: control.method,
    timing: Array.isArray(control.timing) ? [...control.timing].sort() : []
  };
}

function sameControlMeta(left, right) {
  return (
    left.role === right.role &&
    left.method === right.method &&
    sameStringLists(left.timing, right.timing)
  );
}

function normalizeProvenanceMeta(provenance) {
  if (provenance === null || typeof provenance !== "object" || Array.isArray(provenance)) {
    return null;
  }
  return {
    memory_role: provenance.memory_role,
    confidence: provenance.confidence
  };
}

function sameProvenanceMeta(left, right) {
  return left.memory_role === right.memory_role && left.confidence === right.confidence;
}

function normalizeRuntimeContractMeta(runtimeContract) {
  if (runtimeContract === null || typeof runtimeContract !== "object" || Array.isArray(runtimeContract)) {
    return null;
  }
  return {
    side_effects: normalizeStringList(runtimeContract.side_effects),
    outputs: normalizeStringList(runtimeContract.outputs)
  };
}

function sameRuntimeContractMeta(left, right) {
  return sameStringLists(left.side_effects, right.side_effects) && sameStringLists(left.outputs, right.outputs);
}

function normalizeRedactionMeta(redaction) {
  if (redaction === null || typeof redaction !== "object" || Array.isArray(redaction)) {
    return null;
  }
  return {
    has_sensitive_payloads: redaction.has_sensitive_payloads,
    redaction_posture: redaction.redaction_posture
  };
}

function sameRedactionMeta(left, right) {
  return (
    left.has_sensitive_payloads === right.has_sensitive_payloads &&
    left.redaction_posture === right.redaction_posture
  );
}

function normalizeContractMeta(contract) {
  if (contract === null || typeof contract !== "object" || Array.isArray(contract)) {
    return null;
  }
  return {
    profile: contract.profile
  };
}

function sameContractMeta(left, right) {
  return left.profile === right.profile;
}

function hasReadModelFreshness(contract) {
  const freshness = contract?.read_model?.freshness;
  return (
    freshness !== null &&
    typeof freshness === "object" &&
    !Array.isArray(freshness) &&
    isNonEmptyString(freshness.snapshot_id) &&
    isNonEmptyString(freshness.exported_at) &&
    isNonEmptyString(freshness.source_watermark) &&
    isNonEmptyString(freshness.staleness)
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function normalizeImplementationMeta(implementation) {
  if (implementation === null || typeof implementation !== "object" || Array.isArray(implementation)) {
    return null;
  }
  const evidenceSummary = normalizeImplementationEvidenceSummary(
    implementation.evidence_summary ?? buildImplementationEvidenceSummary(implementation.evidence)
  );
  const acceptanceSummary = normalizeImplementationAcceptanceSummary(
    implementation.acceptance_summary ?? buildImplementationAcceptanceSummary(implementation.acceptance_criteria)
  );
  return {
    repo_id: implementation.repo_id,
    paths: normalizeStringList(implementation.paths),
    status: implementation.status,
    pr_refs: normalizeStringList(implementation.pr_refs),
    authority_surface: implementation.authority_surface,
    evidence_summary: evidenceSummary,
    acceptance_summary: acceptanceSummary
  };
}

function sameImplementationMeta(left, right) {
  return (
    left.repo_id === right.repo_id &&
    left.status === right.status &&
    left.authority_surface === right.authority_surface &&
    sameStringLists(left.paths, right.paths) &&
    sameStringLists(left.pr_refs, right.pr_refs) &&
    sameImplementationEvidenceSummary(left.evidence_summary, right.evidence_summary) &&
    sameImplementationAcceptanceSummary(left.acceptance_summary, right.acceptance_summary)
  );
}

function normalizeImplementationEvidenceList(evidence) {
  return Array.isArray(evidence)
    ? evidence.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
    : [];
}

function buildImplementationEvidenceSummary(evidence) {
  const anchors = normalizeImplementationEvidenceList(evidence);
  if (anchors.length === 0) {
    return null;
  }
  const summary = {
    total: anchors.length,
    current: 0,
    planned: 0,
    stale: 0,
    blocked: 0
  };
  for (const anchor of anchors) {
    if (Object.hasOwn(summary, anchor.status)) {
      summary[anchor.status] += 1;
    }
  }
  return summary;
}

function normalizeImplementationAcceptanceCriteriaList(criteria) {
  return Array.isArray(criteria)
    ? criteria
        .filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
        .map((entry) => ({
          ...entry,
          evidence_refs: normalizeStringList(entry.evidence_refs)
        }))
    : [];
}

function buildImplementationAcceptanceSummary(criteria) {
  const entries = normalizeImplementationAcceptanceCriteriaList(criteria);
  if (entries.length === 0) {
    return null;
  }
  const summary = {
    total: entries.length,
    satisfied: 0,
    planned: 0,
    partial: 0,
    waived: 0,
    blocked: 0,
    manual_review: 0
  };
  for (const entry of entries) {
    if (Object.hasOwn(summary, entry.status)) {
      summary[entry.status] += 1;
    }
    if (entry.check_type === "manual-review") {
      summary.manual_review += 1;
    }
  }
  return summary;
}

function normalizeImplementationEvidenceSummary(summary) {
  if (summary === null || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }
  return {
    total: Number.isInteger(summary.total) ? summary.total : 0,
    current: Number.isInteger(summary.current) ? summary.current : 0,
    planned: Number.isInteger(summary.planned) ? summary.planned : 0,
    stale: Number.isInteger(summary.stale) ? summary.stale : 0,
    blocked: Number.isInteger(summary.blocked) ? summary.blocked : 0
  };
}

function normalizeImplementationAcceptanceSummary(summary) {
  if (summary === null || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }
  return {
    total: Number.isInteger(summary.total) ? summary.total : 0,
    satisfied: Number.isInteger(summary.satisfied) ? summary.satisfied : 0,
    planned: Number.isInteger(summary.planned) ? summary.planned : 0,
    partial: Number.isInteger(summary.partial) ? summary.partial : 0,
    waived: Number.isInteger(summary.waived) ? summary.waived : 0,
    blocked: Number.isInteger(summary.blocked) ? summary.blocked : 0,
    manual_review: Number.isInteger(summary.manual_review) ? summary.manual_review : 0
  };
}

function sameImplementationEvidenceSummary(left, right) {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return ["total", "current", "planned", "stale", "blocked"].every((field) => left[field] === right[field]);
}

function sameImplementationAcceptanceSummary(left, right) {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return ["total", "satisfied", "planned", "partial", "waived", "blocked", "manual_review"].every(
    (field) => left[field] === right[field]
  );
}

function normalizeTermRefSummary(summary) {
  if (summary === null || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }
  return {
    total: Number.isInteger(summary.total) ? summary.total : 0,
    stable_refs: Number.isInteger(summary.stable_refs) ? summary.stable_refs : 0,
    deprecated_refs: Number.isInteger(summary.deprecated_refs) ? summary.deprecated_refs : 0,
    unresolved_refs: Number.isInteger(summary.unresolved_refs) ? summary.unresolved_refs : 0
  };
}

function sameTermRefSummary(left, right) {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return ["total", "stable_refs", "deprecated_refs", "unresolved_refs"].every(
    (field) => left[field] === right[field]
  );
}

function normalizeSchemaVersioningMeta(schemaVersioning) {
  if (schemaVersioning === null || typeof schemaVersioning !== "object" || Array.isArray(schemaVersioning)) {
    return null;
  }
  return {
    breaking_policy: schemaVersioning.breaking_policy
  };
}

function sameSchemaVersioningMeta(left, right) {
  return left.breaking_policy === right.breaking_policy;
}

function normalizeStringList(values) {
  return Array.isArray(values)
    ? values.filter((value) => typeof value === "string" && value.length > 0).sort()
    : [];
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameStringLists(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hasRuntimeSideEffects(runtimeContract) {
  return normalizeStringList(runtimeContract?.side_effects).some((value) => value !== "none");
}

function hasRuntimeObservability(runtimeContract) {
  return ["telemetry", "checkpoints", "outputs"].some((key) =>
    Array.isArray(runtimeContract?.[key]) && runtimeContract[key].some((value) => typeof value === "string" && value.length > 0)
  );
}

function resolveImplementationRepoRoot(repoRoot, repo) {
  const locator = repo?.locator;
  if (typeof locator !== "string" || locator.trim() === "") {
    return {
      root: null,
      reason: "locator is empty"
    };
  }
  if (isRemoteImplementationLocator(locator)) {
    return {
      root: null,
      reason: "remote locator cannot be resolved from --repo-root"
    };
  }
  const resolvedPath = resolvePathWithinBase(repoRoot, locator);
  if (!resolvedPath) {
    return {
      root: null,
      reason: "locator must stay inside --repo-root"
    };
  }
  if (!isExistingDirectory(resolvedPath)) {
    return {
      root: null,
      reason: "locator path does not exist under --repo-root"
    };
  }
  return {
    root: resolvedPath,
    reason: null
  };
}

function isRemoteImplementationLocator(locator) {
  return /^[a-z][a-z0-9+.-]*:\/\//iu.test(locator) || /^git@[^:]+:.+/iu.test(locator);
}

function shouldCheckImplementationEvidenceLocator(evidence) {
  return ["test", "fixture", "file-contract"].includes(evidence.kind);
}

function estimateTokens(text) {
  return Math.ceil(String(text ?? "").length / 4);
}

function truncateInvariant(value) {
  return value.length > 96 ? `${value.slice(0, 93)}...` : value;
}

function truncateSample(value) {
  return value.length > 128 ? `${value.slice(0, 125)}...` : value;
}

function normalizeInvariantText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/gu, "'")
    .replace(/[\u201c\u201d]/gu, "\"")
    .replace(/[\u2013\u2014]/gu, "-")
    .replace(/[ \t\r\n]+/gu, " ")
    .replace(/[.,;:!?]+$/gu, "")
    .trim();
}

function sumValues(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function stripQuotedExamples(content) {
  return String(content ?? "")
    .replace(/'[^']*'/g, " ")
    .replace(/"[^"]*"/g, " ");
}
