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
