import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const SOURCE_PATH = path.join(REPO_ROOT, "examples", "compiled-pilot-source", "authoring.json");
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
