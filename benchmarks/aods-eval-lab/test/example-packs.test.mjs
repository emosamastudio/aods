import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const SOURCE_PATH = path.join(REPO_ROOT, "examples", "compiled-pilot-source", "authoring.json");
const SOURCE_README_PATH = path.join(REPO_ROOT, "examples", "compiled-pilot-source", "README.md");
const ROOT_README_PATH = path.join(REPO_ROOT, "README.md");
const ROOT_README_ZH_PATH = path.join(REPO_ROOT, "README.zh-CN.md");
const COMPILED_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-readiness-read-model.json"
);
const COMMAND_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-change-command.json"
);
const EVENT_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-change-event-log.json"
);
const ADAPTER_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-adapter-capability.json"
);
const ARTIFACT_EXPORT_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-artifact-export-policy.json"
);
const RESOURCE_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-resource-surface.json"
);
const GOVERNANCE_MODULE_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot",
  "modules",
  "shift-ops-governance.json"
);
const COMPILED_MANIFEST_PATH = path.join(REPO_ROOT, "examples", "compiled-pilot", "manifest.json");
const FIXTURE_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot-source",
  "fixtures",
  "fixture-manifest.json"
);

test("compiled pilot includes read-model implementation-linkage example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-readiness-read-model");
  assert.ok(module);
  assert.equal(module.meta.contract.profile, "read-model");
  assert.equal(module.meta.contract.read_model.freshness.staleness, "current");
  assert.equal(module.meta.contract.read_model.freshness.source_watermark, "release-readiness-v1");
  assert.equal(module.meta.implementation.repo_id, "shift-ops-control-plane");
  assert.deepEqual(module.meta.implementation.evidence.map((entry) => entry.id), [
    "readiness-export-test",
    "readiness-watermark-fixture"
  ]);
  assert.deepEqual(module.meta.implementation.acceptance_criteria.map((entry) => entry.id), [
    "readiness-read-model-contract",
    "readiness-watermark-contract"
  ]);

  const compiled = JSON.parse(fs.readFileSync(COMPILED_MODULE_PATH, "utf8"));
  assert.equal(compiled.meta.contract.profile, "read-model");
  assert.equal(compiled.meta.contract.read_model.freshness.source_watermark, "release-readiness-v1");
  assert.equal(compiled.meta.implementation.evidence.length, 2);
  assert.equal(compiled.meta.implementation.acceptance_criteria.length, 2);

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const manifestModule = manifest.modules.find((entry) => entry.id === "shift-ops-readiness-read-model");
  assert.ok(manifestModule);
  assert.deepEqual(manifestModule.contract, { profile: "read-model" });
  assert.equal(manifestModule.implementation.evidence_summary.total, 2);
  assert.equal(manifestModule.implementation.acceptance_summary.total, 2);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-read-model-implementation-linkage-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "read-model-implementation-linkage-module"));
});

test("compiled pilot includes command receipt example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-change-command");
  assert.ok(module);
  assert.equal(module.meta.contract.profile, "command");
  assert.equal(module.meta.implementation.repo_id, "shift-ops-control-plane");
  assert.deepEqual(module.meta.implementation.evidence.map((entry) => entry.id), [
    "change-command-contract-test",
    "change-command-receipt-fixture"
  ]);
  assert.deepEqual(module.meta.implementation.acceptance_criteria.map((entry) => entry.id), [
    "change-command-contract",
    "change-receipt-contract"
  ]);
  assert.ok(module.sections.some((entry) => entry.sid === "change-command"));
  assert.ok(module.sections.some((entry) => entry.sid === "change-command-receipt"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "change-command-field-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "change-command-receipt-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "change-command-audit-risk-table"));

  const compiled = JSON.parse(fs.readFileSync(COMMAND_MODULE_PATH, "utf8"));
  assert.equal(compiled.meta.contract.profile, "command");
  assert.equal(compiled.meta.implementation.evidence.length, 2);
  assert.equal(compiled.meta.implementation.acceptance_criteria.length, 2);

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const manifestModule = manifest.modules.find((entry) => entry.id === "shift-ops-change-command");
  assert.ok(manifestModule);
  assert.deepEqual(manifestModule.contract, { profile: "command" });
  assert.equal(manifestModule.implementation.evidence_summary.total, 2);
  assert.equal(manifestModule.implementation.acceptance_summary.total, 2);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-command-receipt-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "command-receipt-module"));
});

test("compiled pilot includes event correction supersession example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-change-event-log");
  assert.ok(module);
  assert.ok(module.tags.includes("event"));
  assert.ok(module.tags.includes("correction"));
  assert.ok(module.tags.includes("supersession"));
  assert.equal(module.meta.implementation.repo_id, "shift-ops-control-plane");
  assert.deepEqual(module.meta.implementation.evidence.map((entry) => entry.id), [
    "change-event-append-test",
    "change-event-correction-fixture"
  ]);
  assert.deepEqual(module.meta.implementation.acceptance_criteria.map((entry) => entry.id), [
    "change-event-append-contract",
    "change-event-correction-contract"
  ]);
  assert.ok(module.sections.some((entry) => entry.sid === "change-event"));
  assert.ok(module.sections.some((entry) => entry.sid === "change-event-correction-supersession"));
  assert.ok(module.sections.some((entry) => entry.sid === "change-event-projection-guidance"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "change-event-field-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "change-event-correction-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "change-event-projection-guidance-table"));

  const compiled = JSON.parse(fs.readFileSync(EVENT_MODULE_PATH, "utf8"));
  assert.equal(compiled.meta.implementation.evidence.length, 2);
  assert.equal(compiled.meta.implementation.acceptance_criteria.length, 2);

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const manifestModule = manifest.modules.find((entry) => entry.id === "shift-ops-change-event-log");
  assert.ok(manifestModule);
  assert.equal(manifestModule.implementation.evidence_summary.total, 2);
  assert.equal(manifestModule.implementation.acceptance_summary.total, 2);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-event-correction-supersession-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "event-correction-supersession-module"));
});

test("compiled pilot includes adapter capability exposure example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-adapter-capability");
  assert.ok(module);
  assert.ok(module.tags.includes("adapter"));
  assert.ok(module.tags.includes("capability"));
  assert.ok(module.tags.includes("exposure"));
  assert.equal(module.meta.implementation.repo_id, "shift-ops-worker");
  assert.deepEqual(module.meta.implementation.evidence.map((entry) => entry.id), [
    "adapter-capability-contract-test",
    "adapter-exposure-fixture"
  ]);
  assert.deepEqual(module.meta.implementation.acceptance_criteria.map((entry) => entry.id), [
    "adapter-provider-capability-contract",
    "adapter-consumer-requirement-contract"
  ]);
  assert.ok(module.sections.some((entry) => entry.sid === "adapter-provider-capability"));
  assert.ok(module.sections.some((entry) => entry.sid === "adapter-consumer-requirement"));
  assert.ok(module.sections.some((entry) => entry.sid === "adapter-exposure-audit"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "adapter-capability-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "adapter-consumer-requirement-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "adapter-exposure-audit-table"));

  const compiled = JSON.parse(fs.readFileSync(ADAPTER_MODULE_PATH, "utf8"));
  assert.equal(compiled.meta.implementation.evidence.length, 2);
  assert.equal(compiled.meta.implementation.acceptance_criteria.length, 2);

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const manifestModule = manifest.modules.find((entry) => entry.id === "shift-ops-adapter-capability");
  assert.ok(manifestModule);
  assert.equal(manifestModule.implementation.evidence_summary.total, 2);
  assert.equal(manifestModule.implementation.acceptance_summary.total, 2);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-adapter-capability-exposure-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "adapter-capability-exposure-module"));
});

test("compiled pilot includes artifact export policy gate example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-artifact-export-policy");
  assert.ok(module);
  assert.ok(module.tags.includes("artifact"));
  assert.ok(module.tags.includes("export"));
  assert.ok(module.tags.includes("policy-gate"));
  assert.equal(module.meta.implementation.repo_id, "shift-ops-control-plane");
  assert.deepEqual(module.meta.implementation.evidence.map((entry) => entry.id), [
    "artifact-export-schema-test",
    "artifact-policy-gate-fixture"
  ]);
  assert.deepEqual(module.meta.implementation.acceptance_criteria.map((entry) => entry.id), [
    "artifact-export-contract",
    "artifact-policy-gate-contract"
  ]);
  assert.ok(module.sections.some((entry) => entry.sid === "artifact-export-surface"));
  assert.ok(module.sections.some((entry) => entry.sid === "artifact-golden-export"));
  assert.ok(module.sections.some((entry) => entry.sid === "artifact-policy-gate"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "export-artifact-type-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "golden-export-review-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "policy-gate-validation-table"));

  const compiled = JSON.parse(fs.readFileSync(ARTIFACT_EXPORT_MODULE_PATH, "utf8"));
  assert.equal(compiled.meta.implementation.evidence.length, 2);
  assert.equal(compiled.meta.implementation.acceptance_criteria.length, 2);

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const manifestModule = manifest.modules.find((entry) => entry.id === "shift-ops-artifact-export-policy");
  assert.ok(manifestModule);
  assert.equal(manifestModule.implementation.evidence_summary.total, 2);
  assert.equal(manifestModule.implementation.acceptance_summary.total, 2);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-artifact-export-policy-gate-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "artifact-export-policy-gate-module"));
});

test("compiled pilot includes resource surface example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-resource-surface");
  assert.ok(module);
  assert.ok(module.tags.includes("resource"));
  assert.ok(module.tags.includes("surface"));
  assert.ok(module.tags.includes("exposure"));
  assert.equal(module.meta.implementation.repo_id, "shift-ops-control-plane");
  assert.deepEqual(module.meta.runtime_contract.resources, [
    "release readiness snapshot store",
    "change receipt ledger"
  ]);
  assert.deepEqual(module.meta.implementation.evidence.map((entry) => entry.id), [
    "resource-scope-contract-test",
    "resource-cleanup-fixture"
  ]);
  assert.deepEqual(module.meta.implementation.acceptance_criteria.map((entry) => entry.id), [
    "resource-scope-contract",
    "resource-cleanup-contract"
  ]);
  assert.ok(module.sections.some((entry) => entry.sid === "resource-identity-scope"));
  assert.ok(module.sections.some((entry) => entry.sid === "resource-risk-exposure"));
  assert.ok(module.sections.some((entry) => entry.sid === "resource-cleanup-evidence"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "resource-scope-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "resource-risk-exposure-table"));
  assert.ok(module.artifacts.some((entry) => entry.artifact_id === "resource-cleanup-evidence-table"));

  const compiled = JSON.parse(fs.readFileSync(RESOURCE_MODULE_PATH, "utf8"));
  assert.equal(compiled.meta.implementation.evidence.length, 2);
  assert.equal(compiled.meta.implementation.acceptance_criteria.length, 2);
  assert.ok(compiled.artifacts.some((entry) => entry.artifact_id === "resource-scope-table"));

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const manifestModule = manifest.modules.find((entry) => entry.id === "shift-ops-resource-surface");
  assert.ok(manifestModule);
  assert.equal(manifestModule.implementation.evidence_summary.total, 2);
  assert.equal(manifestModule.implementation.acceptance_summary.total, 2);
  assert.deepEqual(manifestModule.term_ref_summary, {
    total: 2,
    stable_refs: 2,
    deprecated_refs: 0,
    unresolved_refs: 0
  });
  const cleanupSection = module.sections.find((entry) => entry.sid === "resource-cleanup-evidence");
  assert.deepEqual(cleanupSection.term_refs.map((entry) => entry.term_id), ["task-lifecycle-start"]);
  const cleanupArtifact = module.artifacts.find((entry) => entry.artifact_id === "resource-cleanup-evidence-table");
  assert.deepEqual(cleanupArtifact.term_refs.map((entry) => entry.term_id), ["task-lifecycle-start"]);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-resource-surface-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "resource-surface-module"));
});

test("compiled pilot includes glossary registry canonical example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const releaseWindow = source.corpus.glossary["release-window"];
  assert.equal(releaseWindow.definition, "Approved deployment window for production changes.");
  assert.deepEqual(releaseWindow.aliases, [
    "release slot",
    "deployment window"
  ]);
  assert.deepEqual(releaseWindow.deprecated_terms, [
    {
      term: "ship window",
      replacement: "release-window",
      reason: "Use release-window as the canonical term for production change timing.",
      status: "deprecated"
    }
  ]);
  assert.equal(releaseWindow.scope, "system");
  assert.equal(releaseWindow.owner, "shift-ops-policy");
  assert.deepEqual(releaseWindow.linked_surfaces, [
    "shift-ops-policy:approval-policy",
    "shift-ops-readiness-read-model:release-readiness-read-model"
  ]);
  assert.equal(releaseWindow.status, "current");
  const taskLifecycleStart = source.corpus.glossary["task-lifecycle-start"];
  assert.equal(taskLifecycleStart.aliases[0], "begin");
  assert.equal(taskLifecycleStart.deprecated_terms[0].term, "task-begin");

  const manifest = JSON.parse(fs.readFileSync(COMPILED_MANIFEST_PATH, "utf8"));
  const companionPath = path.join(REPO_ROOT, "examples", "compiled-pilot", manifest.companion_index);
  const companion = JSON.parse(fs.readFileSync(companionPath, "utf8"));
  assert.deepEqual(companion.glossary["release-window"], releaseWindow);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-glossary-registry-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "glossary-registry-companion"));
});

test("compiled pilot includes external citation provenance example pack", () => {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
  const module = source.modules.find((entry) => entry.id === "shift-ops-governance");
  assert.ok(module);
  assert.ok(module.tags.includes("external-citation"));
  assert.ok(module.tags.includes("provenance"));
  assert.deepEqual(module.meta.external_citations.map((entry) => entry.citation_id), [
    "release-calendar-api-doc",
    "launch-window-exception-assumption"
  ]);
  assert.equal(module.meta.external_citations[0].source_type, "api-doc");
  assert.equal(module.meta.external_citations[0].authority_relation, "external-authority");
  assert.equal(module.meta.external_citations[0].claim_posture, "authoritative-claim");
  assert.equal(module.meta.external_citations[0].review_status, "current");
  assert.equal(module.meta.external_citations[1].source_type, "assumption");
  assert.equal(module.meta.external_citations[1].authority_relation, "unsupported-assumption");
  assert.equal(module.meta.external_citations[1].claim_posture, "assumption");
  assert.equal(module.meta.external_citations[1].review_status, "unresolved");

  const reviewPolicy = module.sections.find((entry) => entry.sid === "review-routing-policy");
  assert.deepEqual(reviewPolicy.citation_refs, [
    "release-calendar-api-doc"
  ]);
  const implementationNotes = module.sections.find((entry) => entry.sid === "implementation-notes");
  assert.deepEqual(implementationNotes.citation_refs, [
    "launch-window-exception-assumption"
  ]);
  const reviewRouting = module.artifacts.find((entry) => entry.artifact_id === "review-routing");
  assert.deepEqual(reviewRouting.decision_provenance.citation_refs, [
    "release-calendar-api-doc"
  ]);
  assert.equal(reviewRouting.decision_provenance.consumer_surface, "agent-consumable");
  assert.equal(reviewRouting.decision_provenance.consumption_gate, "stable");

  const compiled = JSON.parse(fs.readFileSync(GOVERNANCE_MODULE_PATH, "utf8"));
  assert.deepEqual(compiled.meta.external_citations, module.meta.external_citations);
  const compiledReviewRouting = compiled.artifacts.find((entry) => entry.artifact_id === "review-routing");
  assert.deepEqual(compiledReviewRouting.decision_provenance.citation_refs, [
    "release-calendar-api-doc"
  ]);

  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-external-citation-provenance-pack");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.input.path, "../authoring.json");
  assert.ok(fixture.golden_exports.some((entry) => entry.id === "external-citation-provenance-module"));
});

test("source-first pilot documents the minimal adoption path for example packs", () => {
  const sourceReadme = fs.readFileSync(SOURCE_README_PATH, "utf8");
  assert.match(sourceReadme, /## Adoption path/);
  assert.match(sourceReadme, /authoring\.json/);
  assert.match(sourceReadme, /npm run compile:pilot/);
  assert.match(sourceReadme, /npm run validate:compiled-pilot/);
  assert.match(sourceReadme, /npm run fixture:smoke/);
  assert.match(sourceReadme, /node \.\/bin\/aods\.mjs route \.\/examples\/compiled-pilot --query/);
  assert.match(sourceReadme, /Do not hand-edit `examples\/compiled-pilot\/`/);
  assert.match(sourceReadme, /not a command executor, event store, adapter runtime, resource scheduler, crawler, or fact checker/);

  const rootReadme = fs.readFileSync(ROOT_README_PATH, "utf8");
  assert.match(rootReadme, /examples\/compiled-pilot-source\/README\.md/);

  const rootReadmeZh = fs.readFileSync(ROOT_README_ZH_PATH, "utf8");
  assert.match(rootReadmeZh, /examples\/compiled-pilot-source\/README\.md/);
});
