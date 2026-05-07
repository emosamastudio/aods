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

test("stable contracts define deprecation and migration format for surfaces", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "deprecation-migration-format");
  assert.ok(section);
  assert.match(section.content, /deprecation/);
  assert.match(section.content, /replacement/);
  assert.match(section.content, /migration guidance/);
  assert.match(section.content, /affected_versions/);
  assert.match(section.content, /removal_version/);
  assert.match(section.content, /validation behavior/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "deprecation-migration-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "deprecation_metadata",
    "replacement_link",
    "migration_guidance",
    "affected_versions",
    "removal_validation"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "deprecation-migration-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("automatic_migration_tool"));
  assert.ok(nonGoalRows.includes("consumer_rewrite"));
  assert.ok(nonGoalRows.includes("runtime_compatibility_shim"));
});

test("stable contracts define standard risk taxonomy for agent-consumable surfaces", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "standard-risk-taxonomy");
  assert.ok(section);
  assert.match(section.content, /canonical risk categories/);
  assert.match(section.content, /read risk/);
  assert.match(section.content, /write risk/);
  assert.match(section.content, /credential/);
  assert.match(section.content, /filesystem/);
  assert.match(section.content, /network/);
  assert.match(section.content, /external-send/);
  assert.match(section.content, /cost/);
  assert.match(section.content, /production-mutation/);
  assert.match(section.content, /human approval/);
  assert.match(section.content, /capability negotiation/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "standard-risk-taxonomy-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "read_risk",
    "write_risk",
    "credential_risk",
    "filesystem_risk",
    "network_risk",
    "external_send_risk",
    "cost_risk",
    "production_mutation_risk",
    "human_approval"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "standard-risk-taxonomy-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("runtime_policy_engine"));
  assert.ok(nonGoalRows.includes("permission_broker"));
  assert.ok(nonGoalRows.includes("dynamic_risk_scanner"));
  assert.ok(nonGoalRows.includes("approval_workflow"));
});

test("stable contracts define local-only versus remote-capable constraints", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "local-remote-exposure-constraints");
  assert.ok(section);
  assert.match(section.content, /local-only/);
  assert.match(section.content, /local-export/);
  assert.match(section.content, /remote-read/);
  assert.match(section.content, /remote-write/);
  assert.match(section.content, /adapter-facing/);
  assert.match(section.content, /upgrade gates/);
  assert.match(section.content, /redaction/);
  assert.match(section.content, /auth/);
  assert.match(section.content, /freshness/);
  assert.match(section.content, /compatibility/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "local-remote-exposure-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "local_only",
    "local_export",
    "remote_read",
    "remote_write",
    "adapter_facing",
    "upgrade_gate"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "local-remote-exposure-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("remote_api_gateway"));
  assert.ok(nonGoalRows.includes("auth_runtime"));
  assert.ok(nonGoalRows.includes("network_broker"));
  assert.ok(nonGoalRows.includes("automatic_exposure_upgrader"));
});

test("stable contracts define audit-log requirements for commands and adapters", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "command-adapter-audit-log-requirements");
  assert.ok(section);
  assert.match(section.content, /audit-log requirements/);
  assert.match(section.content, /commands/);
  assert.match(section.content, /adapters/);
  assert.match(section.content, /actor/);
  assert.match(section.content, /source/);
  assert.match(section.content, /target/);
  assert.match(section.content, /command/);
  assert.match(section.content, /idempotency key/);
  assert.match(section.content, /policy decision/);
  assert.match(section.content, /receipt reference/);
  assert.match(section.content, /timestamp/);
  assert.match(section.content, /correlation identifiers/);
  assert.match(section.content, /receipts\/events/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "command-adapter-audit-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "audit_actor",
    "audit_source",
    "audit_target",
    "command_reference",
    "idempotency_key",
    "policy_decision",
    "receipt_reference",
    "timestamp",
    "correlation_identifier"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "command-adapter-audit-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("audit_log_store"));
  assert.ok(nonGoalRows.includes("workflow_engine"));
  assert.ok(nonGoalRows.includes("siem_integration"));
  assert.ok(nonGoalRows.includes("observability_backend"));
});

test("stable contracts define lifecycle state-machine profile for operational objects", () => {
  const module = JSON.parse(fs.readFileSync(STABLE_CONTRACTS_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "lifecycle-state-machine-profile");
  assert.ok(section);
  assert.match(section.content, /lifecycle state-machine profile/);
  assert.match(section.content, /operational objects/);
  assert.match(section.content, /lifecycle state/);
  assert.match(section.content, /display status/);
  assert.match(section.content, /initial states/);
  assert.match(section.content, /terminal states/);
  assert.match(section.content, /transitions/);
  assert.match(section.content, /guards/);
  assert.match(section.content, /timeout/);
  assert.match(section.content, /expiration/);
  assert.match(section.content, /retry policy/);
  assert.match(section.content, /cancellation semantics/);
  assert.match(section.content, /cleanup semantics/);
  assert.match(section.content, /events or receipts/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "lifecycle-state-machine-field-table");
  assert.ok(fields);
  const fieldRows = fields.content.rows.map((row) => row[0]);
  assert.deepEqual(fieldRows, [
    "state_identity",
    "initial_state",
    "terminal_state",
    "transition",
    "guard",
    "timeout_expiration",
    "retry_policy",
    "cancellation_semantics",
    "cleanup_semantics",
    "event_receipt_link"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "lifecycle-state-machine-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("workflow_engine"));
  assert.ok(nonGoalRows.includes("scheduler"));
  assert.ok(nonGoalRows.includes("retry_runtime"));
  assert.ok(nonGoalRows.includes("cleanup_executor"));
});
