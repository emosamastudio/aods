import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PROJECT_ROOT } from "../src/helpers.mjs";
import { runRoundOneComparison } from "../src/compare.mjs";
import { runEvaluation } from "../src/evaluate.mjs";

test("evaluation harness generates a valid report and baseline signals", () => {
  const results = runEvaluation();

  assert.equal(results.validation.summary.errors, 0);
  assert.equal(results.coverage.lifecycle_phase_coverage, 1);
  assert.equal(results.coverage.structured_type_coverage, 1);
  assert.equal(results.coverage.generic_type_coverage, 1);
  assert.equal(results.fidelity.critical_fact_preservation_rate, 1);
  assert.equal(results.loading.objective_touch.scenario_count, 5);
  assert.equal(results.loading.exploratory_semantic.scenario_count, 4);
  assert.equal(results.loading.objective_touch.hit_rate, 1);
  assert.ok(results.loading.objective_touch.median_route_bytes > 0);
  assert.ok(results.loading.objective_touch.median_prompt_envelope_bytes > results.loading.objective_touch.median_route_bytes);
  assert.ok(results.loading.objective_touch.median_prompt_envelope_overhead_bytes > 0);
  assert.ok(
    results.loading.objective_touch.max_route_bytes >= results.loading.objective_touch.median_route_bytes
  );
  assert.equal(results.diversity.dataset_count, 2);
  assert.deepEqual(results.diversity.sync_modes.present, ["agent-primary", "human-primary"]);
  assert.deepEqual(results.diversity.domains, ["release-ops", "regulated-change-control"]);
  assert.equal(results.drift.built_in_recall, 1);
  assert.equal(results.drift.combined_recall, 1);
  assert.equal(results.drift.built_in_false_positive_rate, 0);
  for (const scenario of results.drift.scenario_results) {
    assert.equal(
      scenario.built_in_detected,
      scenario.expected_built_in_detection,
      `built-in drift expectation mismatch for ${scenario.id}`
    );
    assert.equal(
      scenario.semantic_detected,
      scenario.expected_semantic_detection,
      `semantic drift expectation mismatch for ${scenario.id}`
    );
  }

  const reportPath = path.join(PROJECT_ROOT, "reports", "aods-evaluation-report.md");
  assert.ok(fs.existsSync(reportPath));
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /AODS evaluation report/);
  assert.match(report, /Objective touch-route loading gate/);
  assert.match(report, /rendered prompt envelope/);
  assert.match(report, /Sample diversity and coverage audit/);
});

test("round-one external comparison generates a horizontal report", () => {
  const results = runRoundOneComparison();

  const baselineIds = results.baselines.map((baseline) => baseline.id).sort();
  assert.deepEqual(baselineIds, ["aods", "dita", "llms-txt", "markdown-yaml"]);

  const aods = results.baselines.find((baseline) => baseline.id === "aods");
  assert.equal(aods.governance.explicit_authority_model, true);
  assert.ok(aods.common.corpus_bytes > 0);
  assert.ok(aods.advisory.corpus_tokens_estimated > 0);

  const llms = results.baselines.find((baseline) => baseline.id === "llms-txt");
  assert.ok(llms.common.corpus_bytes > 0);
  assert.ok(llms.advisory.corpus_tokens_estimated > 0);
  assert.ok(results.fairness_contract.common_metrics.includes("corpus byte count"));
  assert.ok(results.fairness_contract.common_metrics.includes("objective median loaded bytes"));
  assert.ok(results.fairness_contract.common_metrics.includes("objective median prompt-envelope bytes"));

  const reportPath = path.join(PROJECT_ROOT, "reports", "round1-comparator-report.md");
  assert.ok(fs.existsSync(reportPath));
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /AODS round-one benchmark evaluation report/);
  assert.match(report, /Why these comparators/);
  assert.match(report, /Median prompt-envelope bytes/);
  assert.match(report, /Objective common metric scoreboard/);
  assert.match(report, /Benchmark objectivity and diversity audit/);
});
