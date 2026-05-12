import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const SURFACE_GOVERNANCE_PATH = path.join(REPO_ROOT, "spec", "surface-governance.json");

test("surface governance defines paired surface sync quality metrics", () => {
  const module = JSON.parse(fs.readFileSync(SURFACE_GOVERNANCE_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "paired-surface-sync-quality-metrics");
  assert.ok(section);
  assert.match(section.content, /sync quality metrics/);
  assert.match(section.content, /paired human and agent surfaces/);
  assert.match(section.content, /exact invariant coverage/);
  assert.match(section.content, /semantic coverage/);
  assert.match(section.content, /omitted constraints/);
  assert.match(section.content, /stale examples/);
  assert.match(section.content, /authority mismatch/);
  assert.match(section.content, /sync freshness/);
  assert.match(section.content, /quality report/);

  const fields = module.artifacts.find((entry) => entry.artifact_id === "paired-surface-sync-quality-field-table");
  assert.ok(fields);
  assert.deepEqual(fields.content.rows.map((row) => row[0]), [
    "exact_invariant_coverage",
    "semantic_coverage",
    "omitted_constraint",
    "stale_example",
    "authority_mismatch",
    "sync_freshness",
    "quality_report"
  ]);

  const nonGoals = module.artifacts.find((entry) => entry.artifact_id === "paired-surface-sync-quality-non-goals");
  assert.ok(nonGoals);
  const nonGoalRows = nonGoals.content.rows.map((row) => row[0]);
  assert.ok(nonGoalRows.includes("new_diff_engine"));
  assert.ok(nonGoalRows.includes("llm_semantic_judge"));
  assert.ok(nonGoalRows.includes("dashboard"));
  assert.ok(nonGoalRows.includes("automatic_fixer"));
});
