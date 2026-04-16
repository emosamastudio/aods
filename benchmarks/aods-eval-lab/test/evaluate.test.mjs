import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PROJECT_ROOT } from "../src/helpers.mjs";
import { runRoundOneComparison } from "../src/compare.mjs";
import { runEvaluation } from "../src/evaluate.mjs";
import { analyzeCapturedRequest } from "../src/runtime-capture.mjs";
import { runBenchmarkSummary } from "../src/summary.mjs";

function snapshotFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
}

function restoreFile(filePath, snapshot) {
  if (snapshot === null) {
    fs.rmSync(filePath, { force: true });
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, snapshot);
}

test("evaluation harness generates a valid report and baseline signals", () => {
  const results = runEvaluation();

  assert.equal(results.validation.summary.errors, 0);
  assert.equal(results.coverage.lifecycle_phase_coverage, 1);
  assert.equal(results.coverage.structured_type_coverage, 1);
  assert.equal(results.coverage.generic_type_coverage, 1);
  assert.equal(results.fidelity.critical_fact_preservation_rate, 1);
  assert.equal(results.loading.objective_touch.scenario_count, 5);
  assert.equal(results.loading.exploratory_query.scenario_count, 4);
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
  assert.equal(results.diversity.external_sample?.corpus_count ?? 0, 3);
  assert.equal(results.diversity.external_sample?.scenario_count ?? 0, 17);
  assert.equal(results.drift.built_in_recall, 1);
  assert.equal(results.drift.combined_recall, 1);
  assert.equal(results.drift.built_in_false_positive_rate, 0);
  assert.ok(results.diversity.drift_scenarios.by_class["claim-conflict"] >= 1);
  assert.ok(
    results.drift.scenario_results.some((scenario) => scenario.id === "undeclared-claim-pair-conflict"),
    "expected undeclared claim conflict scenario in drift benchmark"
  );
  if (results.runtime_capture) {
    assert.ok(results.runtime_capture.runtime_request.request_body_bytes > 0);
    assert.equal(results.runtime_capture.runtime_request.prompt_embedded_in_user_message, true);
  }
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
  assert.match(report, /External sample supplement/);
});

test("round-one external comparison generates a horizontal report", () => {
  const results = runRoundOneComparison();

  const baselineIds = results.baselines.map((baseline) => baseline.id).sort();
  assert.deepEqual(baselineIds, ["aods", "dita", "llms-txt", "markdown-yaml"]);

  const aods = results.baselines.find((baseline) => baseline.id === "aods");
  assert.equal(aods.governance.explicit_authority_model, true);
  assert.ok(aods.common.corpus_bytes > 0);
  assert.ok(aods.advisory.corpus_tokens_estimated > 0);
  assert.equal(results.field_sample?.corpus_count ?? 0, 3);
  assert.equal(results.field_sample?.scenario_count ?? 0, 17);

  const llms = results.baselines.find((baseline) => baseline.id === "llms-txt");
  assert.ok(llms.common.corpus_bytes > 0);
  assert.ok(llms.advisory.corpus_tokens_estimated > 0);
  assert.ok(results.fairness_contract.common_metrics.includes("corpus byte count"));
  assert.ok(results.fairness_contract.common_metrics.includes("objective median loaded bytes"));
  assert.ok(results.fairness_contract.common_metrics.includes("objective median prompt-envelope bytes"));
  if (results.aods_self_evaluation.runtime_capture) {
    assert.ok(results.aods_self_evaluation.runtime_capture.runtime_request.request_body_bytes > 0);
  }

  const reportPath = path.join(PROJECT_ROOT, "reports", "round1-comparator-report.md");
  assert.ok(fs.existsSync(reportPath));
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /AODS round-one benchmark evaluation report/);
  assert.match(report, /Why these comparators/);
  assert.match(report, /Median prompt-envelope bytes/);
  assert.match(report, /Objective common metric scoreboard/);
  assert.match(report, /Benchmark objectivity and diversity audit/);
  assert.match(report, /External field-sample supplement/);
});

test("runtime capture analyzer measures request-body overhead against the benchmark prompt", () => {
  const promptText = "# Benchmark prompt envelope\n\nscenario_id: sample\n";
  const request = {
    url: "/v1/chat/completions",
    body: JSON.stringify({
      model: "dummy-model",
      messages: [
        {
          role: "system",
          content: "System instructions"
        },
        {
          role: "user",
          content: `<current_datetime>2026-04-15T02:04:21.571Z</current_datetime>\n\n${promptText}`
        }
      ],
      tools: [{ type: "function", function: { name: "view" } }]
    })
  };

  const metrics = analyzeCapturedRequest({
    request,
    promptText,
    copilotVersion: "GitHub Copilot CLI 1.0.25"
  });

  assert.equal(metrics.prompt_embedded_in_user_message, true);
  assert.ok(metrics.request_body_bytes > metrics.prompt_bytes);
  assert.ok(metrics.system_message_bytes > 0);
  assert.ok(metrics.tool_definitions_bytes > 0);
  assert.equal(metrics.tool_count, 1);
  assert.ok(metrics.prompt_wrapper_bytes > 0);
});

test("benchmark summary writes current-vs-previous delta outputs", () => {
  const historyEvalPath = path.join(PROJECT_ROOT, "generated", "history", "latest-evaluation-results.json");
  const historyComparePath = path.join(PROJECT_ROOT, "generated", "history", "latest-round1-comparator-results.json");
  const summaryResultsPath = path.join(PROJECT_ROOT, "generated", "results", "benchmark-summary-results.json");
  const summaryReportPath = path.join(PROJECT_ROOT, "reports", "benchmark-summary-report.md");
  const snapshots = new Map(
    [historyEvalPath, historyComparePath, summaryResultsPath, summaryReportPath].map((filePath) => [
      filePath,
      snapshotFile(filePath)
    ])
  );

  try {
    runRoundOneComparison();
    const first = runBenchmarkSummary();
    const second = runBenchmarkSummary();

    assert.ok(first.metrics.length >= 8);
    assert.ok(second.previous_run);

    const promptMetric = second.metrics.find((metric) => metric.id === "objective-median-prompt-envelope-bytes");
    assert.ok(promptMetric);
    assert.match(promptMetric.current_display, /^\d+ bytes$/);
    assert.equal(promptMetric.delta_display, "+0 bytes");
    assert.equal(promptMetric.reading, "flat");
    assert.ok(second.metrics.find((metric) => metric.id === "external-sample-scenario-count"));

    assert.ok(fs.existsSync(summaryReportPath));
    const report = fs.readFileSync(summaryReportPath, "utf8");
    assert.match(report, /Benchmark summary/);
    assert.match(report, /Metric delta table/);
  } finally {
    for (const [filePath, snapshot] of snapshots) {
      restoreFile(filePath, snapshot);
    }
  }
});
