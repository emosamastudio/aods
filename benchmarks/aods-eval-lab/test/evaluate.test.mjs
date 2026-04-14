import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PROJECT_ROOT } from "../src/helpers.mjs";
import { runEvaluation } from "../src/evaluate.mjs";

test("evaluation harness generates a valid report and baseline signals", () => {
  const results = runEvaluation();

  assert.equal(results.validation.summary.errors, 0);
  assert.equal(results.coverage.lifecycle_phase_coverage, 1);
  assert.equal(results.coverage.structured_type_coverage, 1);
  assert.equal(results.coverage.generic_type_coverage, 1);
  assert.equal(results.fidelity.critical_fact_preservation_rate, 1);
  assert.ok(results.loading.hit_rate >= 0.5);
  assert.ok(results.drift.built_in_recall < results.drift.combined_recall);

  const reportPath = path.join(PROJECT_ROOT, "reports", "aods-evaluation-report.md");
  assert.ok(fs.existsSync(reportPath));
  assert.match(fs.readFileSync(reportPath, "utf8"), /AODS evaluation report/);
});
