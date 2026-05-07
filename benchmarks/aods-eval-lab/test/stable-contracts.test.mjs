import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const STABLE_CONTRACTS_PATH = path.join(REPO_ROOT, "spec", "stable-surface-contracts.json");

test("stable contracts define capability negotiation as metadata-only re-triage", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "capability-negotiation-retriage");
  assert.ok(section);
  assert.match(section.content, /provider capability/);
  assert.match(section.content, /consumer requirement/);
  assert.match(section.content, /compatibility matching/);
  assert.match(section.content, /does not introduce negotiation sessions/);

  const boundary = module.artifacts.find((entry) => entry.artifact_id === "capability-negotiation-boundary-table");
  assert.ok(boundary);
  const boundaryRows = boundary.content.rows.map((row) => row[0]);
  assert.deepEqual(boundaryRows, [
    "provider_capability",
    "consumer_requirement",
    "compatibility_matching",
    "evidence_link"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "capability-negotiation-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("runtime_discovery"));
  assert.ok(nonGoalRows.includes("auth_exchange"));
  assert.ok(nonGoalRows.includes("dynamic_probe"));
});

test("stable contracts define command receipt event triads for write-capable surfaces", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "command-receipt-event-triad");
  assert.ok(section);
  assert.match(section.content, /write-capable/);
  assert.match(section.content, /command/);
  assert.match(section.content, /receipt/);
  assert.match(section.content, /event or projection/);
  assert.match(section.content, /does not execute commands/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "command-receipt-event-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "command",
    "receipt",
    "event_or_projection",
    "triad_linkage"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "command-receipt-event-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("command_executor"));
  assert.ok(nonGoalRows.includes("event_bus_runtime"));
  assert.ok(nonGoalRows.includes("correction_semantics"));
});

test("stable contracts define event correction and supersession boundaries", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "event-correction-supersession");
  assert.ok(section);
  assert.match(section.content, /append-only event/);
  assert.match(section.content, /correction_of/);
  assert.match(section.content, /supersedes/);
  assert.match(section.content, /replacement event/);
  assert.match(section.content, /projection guidance/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "event-correction-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "correction_event",
    "supersession_link",
    "retraction",
    "projection_guidance"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "event-correction-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("history_rewrite"));
  assert.ok(nonGoalRows.includes("event_store_runtime"));
  assert.ok(nonGoalRows.includes("automatic_replay"));
});

test("stable contracts define partial implementation and known gap metadata boundaries", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "partial-known-gap-metadata");
  assert.ok(section);
  assert.match(section.content, /partial implementation/);
  assert.match(section.content, /known gap/);
  assert.match(section.content, /missing_capabilities/);
  assert.match(section.content, /blocking_status/);
  assert.match(section.content, /consumer guidance/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "partial-known-gap-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "gap_identity",
    "missing_capability",
    "blocking_posture",
    "remediation_plan",
    "consumer_guidance"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "partial-known-gap-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("roadmap_system"));
  assert.ok(nonGoalRows.includes("automatic_waiver"));
  assert.ok(nonGoalRows.includes("release_override"));
});

test("stable contracts define ownership and authority hierarchy for overlapping surfaces", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "ownership-authority-hierarchy");
  assert.ok(section);
  assert.match(section.content, /overlapping surfaces/);
  assert.match(section.content, /canonical authority/);
  assert.match(section.content, /derived surface/);
  assert.match(section.content, /alias/);
  assert.match(section.content, /conflict policy/);
  assert.match(section.content, /migration guidance/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "ownership-authority-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "canonical_authority",
    "derived_surface",
    "alias_surface",
    "conflict_policy",
    "migration_guidance"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "ownership-authority-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("automatic_conflict_resolver"));
  assert.ok(nonGoalRows.includes("cross_corpus_authority_runtime"));
  assert.ok(nonGoalRows.includes("ownership_inference"));
});

test("stable contracts define dependency ordering between surfaces", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "surface-dependency-ordering");
  assert.ok(section);
  assert.match(section.content, /dependency ordering/);
  assert.match(section.content, /requires/);
  assert.match(section.content, /blocks/);
  assert.match(section.content, /derives_from/);
  assert.match(section.content, /emits/);
  assert.match(section.content, /consumes/);
  assert.match(section.content, /optional dependency/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "surface-dependency-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "requires",
    "blocks",
    "derives_from",
    "emits",
    "consumes",
    "optional_dependency"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "surface-dependency-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("package_manager"));
  assert.ok(nonGoalRows.includes("runtime_scheduler"));
  assert.ok(nonGoalRows.includes("cross_repo_dependency_executor"));
});
