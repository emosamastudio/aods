import fs from "node:fs";
import path from "node:path";

import {
  buildManifestCompanion,
  DEFAULT_MANIFEST_COMPANION_PATH
} from "../../../lib/manifest-runtime.mjs";
import {
  ARTIFACTS,
  DATASETS,
  DRIFT_SCENARIOS,
  HUMAN_DOCS,
  LOADING_SCENARIOS,
  MODULE_BLUEPRINTS,
  ROLE_DEFS,
  SYSTEM,
  allFacts,
  humanDocArtifacts
} from "./benchmark-data.mjs";
import {
  PROJECT_ROOT,
  REPO_ROOT,
  emptyDir,
  ensureDir,
  estimateTokens,
  writeJson,
  writeText
} from "./helpers.mjs";

const FIXTURE_TIMESTAMP = "2026-04-14T00:00:00Z";
const AODS_SCHEMA_ROOT = path.join(REPO_ROOT, "schema");
const GENERATED_ROOT = path.join(PROJECT_ROOT, "generated");
const HUMAN_ROOT = path.join(GENERATED_ROOT, "human-docs");
const CORPUS_ROOT = path.join(GENERATED_ROOT, "aods-corpus");
const RESULTS_ROOT = path.join(GENERATED_ROOT, "results");
const FIXTURE_SOURCE_ROOT = path.join(PROJECT_ROOT, "fixtures", "source");
const FIXTURE_SCENARIO_ROOT = path.join(PROJECT_ROOT, "fixtures", "scenarios");

export function projectPaths() {
  return {
    generatedRoot: GENERATED_ROOT,
    humanRoot: HUMAN_ROOT,
    corpusRoot: CORPUS_ROOT,
    resultsRoot: RESULTS_ROOT,
    fixtureSourceRoot: FIXTURE_SOURCE_ROOT,
    fixtureScenarioRoot: FIXTURE_SCENARIO_ROOT
  };
}

export function generateAll() {
  const paths = projectPaths();
  emptyDir(paths.humanRoot);
  emptyDir(paths.corpusRoot);
  emptyDir(paths.resultsRoot);
  ensureDir(paths.fixtureSourceRoot);
  ensureDir(paths.fixtureScenarioRoot);

  copySchema();

  const docs = buildHumanDocs();
  for (const doc of docs) {
    writeText(path.join(paths.humanRoot, doc.path), doc.content);
    writeText(path.join(paths.corpusRoot, doc.path), doc.content);
  }

  const modules = buildModules();
  for (const module of modules) {
    writeJson(path.join(paths.corpusRoot, module.path), module.content);
  }

  const { manifest, companion } = buildManifest(modules);
  writeJson(path.join(paths.corpusRoot, "manifest.json"), manifest);
  if (companion) {
    writeJson(path.join(paths.corpusRoot, manifest.companion_index), companion, { compact: true });
  }

  const factMap = buildFactMap();
  writeJson(path.join(paths.resultsRoot, "fact-map.json"), factMap);
  writeJson(path.join(paths.fixtureSourceRoot, "canonical-project.json"), {
    system: SYSTEM,
    datasets: DATASETS,
    modules: MODULE_BLUEPRINTS,
    docs: HUMAN_DOCS,
    artifacts: ARTIFACTS,
    roles: ROLE_DEFS
  });
  writeJson(path.join(paths.fixtureScenarioRoot, "loading-scenarios.json"), LOADING_SCENARIOS);
  writeJson(path.join(paths.fixtureScenarioRoot, "drift-scenarios.json"), DRIFT_SCENARIOS);

  return {
    ...paths,
    docs,
    modules,
    manifest,
    companion,
    factMap
  };
}

function copySchema() {
  const targetSchemaRoot = path.join(CORPUS_ROOT, "schema");
  ensureDir(targetSchemaRoot);
  for (const fileName of ["manifest.schema.json", "manifest-companion.schema.json", "module.schema.json"]) {
    fs.copyFileSync(path.join(AODS_SCHEMA_ROOT, fileName), path.join(targetSchemaRoot, fileName));
  }
}

function buildHumanDocs() {
  return HUMAN_DOCS.map((doc) => ({
    path: doc.path,
    content: renderHumanDoc(doc)
  }));
}

function renderHumanDoc(doc) {
  const artifacts = humanDocArtifacts(doc.path);
  const lines = [`# ${doc.title}`, ""];
  if (path.basename(doc.path) === "README.md") {
    lines.push(
      "This benchmark compares verbose human lifecycle documentation against an equivalent AODS corpus.",
      "",
      "## Canonical rules",
      ""
    );
  } else {
    lines.push(
      `This document is the human-facing paired surface for ${doc.moduleIds.join(", ")}.`,
      "",
      "## Lifecycle artifacts",
      ""
    );
  }

  for (const artifact of artifacts) {
    lines.push(renderHumanArtifact(artifact));
  }

  if (path.basename(doc.path) === "README.md") {
    const relatedDocs = HUMAN_DOCS.filter(
      (candidate) => inferDatasetIdFromDocPath(candidate.path) === inferDatasetIdFromDocPath(doc.path) && candidate.path !== doc.path
    );
    lines.push(
      "## Paired detail surfaces",
      "",
      ...relatedDocs.map((candidate) => `- ${candidate.path}`),
      ""
    );
  }

  return lines.join("\n").trimEnd() + "\n";
}

function inferDatasetIdFromDocPath(docPath) {
  return docPath.startsWith("harbor/") ? "harbor" : "atlas";
}

export function renderHumanArtifact(artifact) {
  const lines = [`## ${artifact.title}`, ""];
  lines.push(`Phase: ${artifact.phase}.`, "");
  lines.push(`${artifact.summary}`, "");
  lines.push("Required facts:", "");
  for (const item of artifact.facts) {
    lines.push(`- ${item.text}`);
  }
  lines.push("");
  if (artifact.kind === "artifact") {
    lines.push(
      `AODS representation: ${artifact.moduleId}/${artifact.artifact.type}.`,
      "",
      "Human-readable reference view:",
      "",
      "```json",
      JSON.stringify(artifact.content, null, 2),
      "```",
      ""
    );
  } else {
    lines.push(
      `AODS representation: ${artifact.moduleId}/section:${artifact.section.sid}.`,
      "",
      `Context note: ${artifact.summary}`,
      ""
    );
  }
  return lines.join("\n");
}

function buildModules() {
  const grouped = groupByModule();
  return MODULE_BLUEPRINTS.map((blueprint) => {
    const moduleArtifacts = grouped.get(blueprint.id) ?? [];
    const sections = moduleArtifacts
      .filter((artifact) => artifact.kind === "section")
      .map((artifact) => buildSection(artifact, moduleArtifacts));
    if (sections.length === 0) {
      sections.push(buildSyntheticSummarySection(blueprint, moduleArtifacts));
    }
    const artifacts = moduleArtifacts
      .filter((artifact) => artifact.kind === "artifact")
      .map((artifact) => buildStructuredArtifact(artifact));
    const content = {
      aods_v: 3,
      module_id: blueprint.id,
      v: 1,
      context: blueprint.scope,
      sections,
      artifacts,
      changelog: [
        {
          v: 1,
          delta: `Initial benchmark module for ${blueprint.id}.`
        }
      ],
      meta: buildModuleMeta(blueprint)
    };
    return {
      id: blueprint.id,
      path: blueprint.path,
      content,
      tokens: estimateTokens(JSON.stringify(content, null, 2))
    };
  });
}

function buildSection(artifact, moduleArtifacts) {
  const siblingArtifactRefs = moduleArtifacts
    .filter((candidate) => candidate.kind === "artifact")
    .map((candidate) => candidate.artifact.artifact_id);
  return {
    sid: artifact.section.sid,
    topic: artifact.section.topic,
    content: `${artifact.summary} ${artifact.facts.map((item) => item.text).join(" ")}`,
    content_type: artifact.section.content_type,
    artifact_refs: siblingArtifactRefs.length > 0 ? siblingArtifactRefs : undefined,
    criticality: artifact.section.criticality
  };
}

function buildStructuredArtifact(artifact) {
  return {
    artifact_id: artifact.artifact.artifact_id,
    type: artifact.artifact.type,
    usage: artifact.artifact.usage,
    content: artifact.content
  };
}

function buildSyntheticSummarySection(blueprint, moduleArtifacts) {
  const referencedArtifacts = moduleArtifacts
    .filter((artifact) => artifact.kind === "artifact")
    .map((artifact) => artifact.artifact.artifact_id);
  const factSummary = moduleArtifacts.flatMap((artifact) => artifact.facts.map((item) => item.text)).join(" ");
  return {
    sid: "module-summary",
    topic: `${blueprint.id} summary`,
    content: `${blueprint.scope} This module covers ${moduleArtifacts.map((artifact) => artifact.title).join(", ")}. ${factSummary}`,
    content_type: "prose",
    artifact_refs: referencedArtifacts.length > 0 ? referencedArtifacts : undefined,
    criticality: "should"
  };
}

function buildModuleMeta(blueprint) {
  if (blueprint.category !== "capsule") {
    return {
      stability: blueprint.layer === "evidence" ? "evolving" : "stable",
      review_cycle: "benchmark-run"
    };
  }
  const capsuleRoutes =
    blueprint.id === "harbor-capsule"
      ? ["harbor-change-control", "harbor-audit-evidence"]
      : ["product-lifecycle", "architecture-contracts", "delivery-workflows", "operations-governance"];
  const coreQuestion =
    blueprint.id === "harbor-capsule"
      ? "Which change-control or audit-evidence module should answer the current regulated change question?"
      : "Which detail module should answer the current release-coordination question?";
  return {
    stability: "stable",
    review_cycle: "benchmark-run",
    capsule: {
      read_when: [
        "reader needs quick routing",
        "task starts from zero prior context",
        "human surface needs paired explanation"
      ],
      core_question: coreQuestion,
      routes_to: capsuleRoutes,
      frozen_decisions: [
        "Agent-primary modules remain authoritative.",
        "Evidence layer does not lead cold-start boot."
      ]
    }
  };
}

function buildManifest(modules) {
  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const manifest = {
    aods_v: 3,
    sys: SYSTEM.id,
    sys_v: 1,
    created: FIXTURE_TIMESTAMP,
    updated: FIXTURE_TIMESTAMP,
    purpose: SYSTEM.purpose,
    modules: MODULE_BLUEPRINTS.map((blueprint) => ({
      id: blueprint.id,
      path: blueprint.path,
      scope: blueprint.scope,
      category: blueprint.category,
      layer: blueprint.layer,
      deps: blueprint.deps,
      tags: blueprint.tags,
      tokens_approx: moduleById.get(blueprint.id).tokens,
      priority: blueprint.priority
    })),
    boot_sequence: ["atlas-root", "atlas-capsule", "harbor-root", "harbor-capsule"],
    companion_index: DEFAULT_MANIFEST_COMPANION_PATH
  };
  const companion = buildManifestCompanion({
    glossary: SYSTEM.glossary,
    roles: ROLE_DEFS,
    bootByRole: Object.fromEntries(ROLE_DEFS.map((role) => [role.id, role.required_modules])),
    bootByTouch: buildTouchRoutes(),
    surfacePairs: buildSurfacePairs()
  });
  return { manifest, companion };
}

function buildTouchRoutes() {
  return [
    {
      match: "manifest.json",
      intent: "write",
      load_modules: [
        "atlas-root",
        "atlas-capsule",
        "product-lifecycle",
        "architecture-contracts",
        "delivery-workflows",
        "operations-governance",
        "harbor-root",
        "harbor-capsule",
        "harbor-change-control",
        "harbor-audit-evidence"
      ],
      reason: "Manifest edits affect routing, pairing, and benchmark scope."
    },
    {
      match: DEFAULT_MANIFEST_COMPANION_PATH,
      intent: "write",
      load_modules: [
        "atlas-root",
        "atlas-capsule",
        "product-lifecycle",
        "architecture-contracts",
        "delivery-workflows",
        "operations-governance",
        "harbor-root",
        "harbor-capsule",
        "harbor-change-control",
        "harbor-audit-evidence"
      ],
      reason: "Companion edits affect routing, pairing, and benchmark scope."
    },
    {
      match: "README.md",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule"],
      reason: "README is the paired system surface."
    },
    {
      match: "docs/01-product-lifecycle.md",
      intent: "write",
      load_modules: ["atlas-capsule", "product-lifecycle"],
      reason: "Product lifecycle edits need paired product authority plus capsule context."
    },
    {
      match: "docs/02-architecture-and-contracts.md",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule", "architecture-contracts"],
      reason: "Architecture doc edits need topology and contract authority."
    },
    {
      match: "docs/03-delivery-workflows.md",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule", "delivery-workflows"],
      reason: "Workflow doc edits need rollout and lifecycle authority."
    },
    {
      match: "docs/04-operations-and-governance.md",
      intent: "write",
      load_modules: ["atlas-capsule", "operations-governance", "evidence-reference"],
      reason: "Operations doc edits need policy and evidence authority."
    },
    {
      match: "harbor/README.md",
      intent: "write",
      load_modules: ["harbor-root", "harbor-capsule"],
      reason: "Harbor overview edits need regulated routing context."
    },
    {
      match: "harbor/docs/01-change-control.md",
      intent: "write",
      load_modules: ["harbor-capsule", "harbor-change-control"],
      reason: "Human-primary SOP edits need paired change-control authority plus capsule context."
    },
    {
      match: "harbor/docs/02-audit-evidence.md",
      intent: "write",
      load_modules: ["harbor-capsule", "harbor-audit-evidence"],
      reason: "Audit evidence doc edits need retention and query authority."
    },
    {
      match: "modules/atlas-root.json",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule"],
      reason: "Root edits should stay routing-oriented."
    },
    {
      match: "modules/atlas-capsule.json",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule", "product-lifecycle", "architecture-contracts", "delivery-workflows", "operations-governance"],
      reason: "Capsule edits affect summary routing across the corpus."
    },
    {
      match: "modules/product-lifecycle.json",
      intent: "write",
      load_modules: ["atlas-capsule", "product-lifecycle"],
      reason: "Product module edits need paired summary context."
    },
    {
      match: "modules/architecture-contracts.json",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule", "architecture-contracts"],
      reason: "Architecture edits need route and contract context."
    },
    {
      match: "modules/delivery-workflows.json",
      intent: "write",
      load_modules: ["atlas-root", "atlas-capsule", "delivery-workflows", "architecture-contracts"],
      reason: "Workflow edits depend on API and schema context."
    },
    {
      match: "modules/operations-governance.json",
      intent: "write",
      load_modules: ["atlas-capsule", "delivery-workflows", "operations-governance", "evidence-reference"],
      reason: "Operations edits need policy, workflow, and evidence context."
    },
    {
      match: "modules/evidence-reference.json",
      intent: "write",
      load_modules: ["operations-governance", "evidence-reference"],
      reason: "Evidence edits should stay narrow."
    },
    {
      match: "modules/harbor-root.json",
      intent: "write",
      load_modules: ["harbor-root", "harbor-capsule"],
      reason: "Harbor root edits should stay routing-oriented."
    },
    {
      match: "modules/harbor-capsule.json",
      intent: "write",
      load_modules: ["harbor-root", "harbor-capsule", "harbor-change-control", "harbor-audit-evidence"],
      reason: "Harbor capsule edits affect summary routing across the regulated slice."
    },
    {
      match: "modules/harbor-change-control.json",
      intent: "write",
      load_modules: ["harbor-capsule", "harbor-change-control"],
      reason: "Change-control module edits need paired SOP and capsule context."
    },
    {
      match: "modules/harbor-audit-evidence.json",
      intent: "write",
      load_modules: ["harbor-capsule", "harbor-change-control", "harbor-audit-evidence"],
      reason: "Audit evidence edits depend on policy and evidence context."
    }
  ];
}

function buildSurfacePairs() {
  return [
    {
      pair_id: "pair-atlas-readme",
      scope: "system",
      agent_primary: "atlas-capsule",
      agent_supporting: ["atlas-root"],
      human_primary: "README.md",
      shared_invariants: [
        "Use product-lifecycle for goals, roadmap checkpoints, verification intent, and ADR rationale.",
        "Use operations-governance for policy, events, error handling, temporal controls, and paired-surface discipline."
      ],
      sync_source: "agent-primary",
      status: "paired"
    },
    {
      pair_id: "pair-product-lifecycle",
      scope: "module",
      agent_primary: "product-lifecycle",
      human_primary: "docs/01-product-lifecycle.md",
      shared_invariants: [
        "Atlas Release Ops reduces release readiness coordination from two days to under thirty minutes."
      ],
      sync_source: "agent-primary",
      status: "paired"
    },
    {
      pair_id: "pair-architecture-contracts",
      scope: "module",
      agent_primary: "architecture-contracts",
      human_primary: "docs/02-architecture-and-contracts.md",
      shared_invariants: ["POST /v1/releases creates a release packet and returns the packet id."],
      sync_source: "agent-primary",
      status: "paired"
    },
    {
      pair_id: "pair-delivery-workflows",
      scope: "module",
      agent_primary: "delivery-workflows",
      human_primary: "docs/03-delivery-workflows.md",
      shared_invariants: ["Approved packets emit a release.packet.approved event and enter scheduled state."],
      sync_source: "agent-primary",
      status: "paired"
    },
    {
      pair_id: "pair-operations-governance",
      scope: "module",
      agent_primary: "operations-governance",
      agent_supporting: ["evidence-reference"],
      human_primary: "docs/04-operations-and-governance.md",
      shared_invariants: ["sev1 pages primary and secondary on-call within five minutes."],
      sync_source: "agent-primary",
      status: "paired"
    },
    {
      pair_id: "pair-harbor-readme",
      scope: "system",
      agent_primary: "harbor-capsule",
      agent_supporting: ["harbor-root"],
      human_primary: "harbor/README.md",
      shared_invariants: [
        "Use harbor-change-control for approval rules, exception handling, and sign-off authority."
      ],
      sync_source: "agent-primary",
      status: "paired"
    },
    {
      pair_id: "pair-harbor-change-control",
      scope: "module",
      agent_primary: "harbor-change-control",
      human_primary: "harbor/docs/01-change-control.md",
      shared_invariants: [
        "Emergency changes require a documented rollback owner before execution."
      ],
      sync_source: "human-primary",
      status: "paired"
    },
    {
      pair_id: "pair-harbor-audit-evidence",
      scope: "module",
      agent_primary: "harbor-audit-evidence",
      human_primary: "harbor/docs/02-audit-evidence.md",
      shared_invariants: ["The evidence query is stored as raw SQL because benchmark escape hatches must stay measurable."],
      sync_source: "agent-primary",
      status: "paired"
    }
  ];
}

function buildFactMap() {
  return allFacts().map((item) => ({
    fact_id: item.id,
    text: item.text,
    critical: item.critical,
    artifact_id: item.artifactId,
    module_id: item.moduleId,
    module_path: MODULE_BLUEPRINTS.find((module) => module.id === item.moduleId).path,
    human_doc: item.humanDoc
  }));
}

function groupByModule() {
  const grouped = new Map();
  for (const artifact of ARTIFACTS) {
    const bucket = grouped.get(artifact.moduleId) ?? [];
    bucket.push(artifact);
    grouped.set(artifact.moduleId, bucket);
  }
  return grouped;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAll();
}
