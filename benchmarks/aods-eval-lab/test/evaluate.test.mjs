import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { compilePilotCorpus, loadRootModule, writeModuleJson } from "../src/compiled-pilot.mjs";
import { PROJECT_ROOT, REPO_ROOT } from "../src/helpers.mjs";
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

function assertCompactJsonFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  assert.ok(text.endsWith("\n"), `${filePath} should end with a single newline`);
  assert.equal(
    text.slice(0, -1).includes("\n"),
    false,
    `${filePath} should emit compact single-line JSON`
  );
}

function runValidateCommand(corpusRoot, { strict = true, args = [] } = {}) {
  return execFileSync(
    "node",
    [
      path.join(REPO_ROOT, "bin", "aods.mjs"),
      "validate",
      corpusRoot,
      ...(strict ? ["--strict"] : []),
      ...args
    ],
    { cwd: REPO_ROOT, stdio: "pipe", encoding: "utf8" }
  );
}

function runValidateCli(corpusRoot, ...args) {
  return runValidateCommand(corpusRoot, { strict: true, args });
}

function runValidateWarningCli(corpusRoot, ...args) {
  return runValidateCommand(corpusRoot, { strict: false, args });
}

function expectValidateFailure(corpusRoot, pattern, ...args) {
  try {
    runValidateCli(corpusRoot, ...args);
    assert.fail(`expected validate failure matching ${pattern}`);
  } catch (error) {
    const output = [error.stdout, error.stderr, error.message].filter(Boolean).join("\n");
    assert.match(output, pattern);
  }
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
  assert.equal(results.loading.exploratory_query.average_precision, 1);
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
  assert.equal(results.diversity.external_sample?.scenario_count ?? 0, 20);
  assert.equal(results.drift.built_in_recall, 1);
  assert.equal(results.drift.combined_recall, 1);
  assert.equal(results.drift.built_in_false_positive_rate, 0);
  assert.equal(results.open_source_routing.corpus_count, 3);
  assert.equal(results.open_source_routing.scenario_count, 20);
  assert.ok(results.open_source_routing.top_1_hit_rate > 0);
  assert.ok(results.open_source_routing.top_3_hit_rate >= results.open_source_routing.top_1_hit_rate);
  assert.ok(results.open_source_routing.mean_reciprocal_rank >= results.open_source_routing.top_1_hit_rate);
  assert.equal(results.open_source_routing.zero_hit_rate, 0);
  assert.ok(
    results.open_source_routing.seed_title_rerank.top_1_hit_rate >= results.open_source_routing.top_1_hit_rate
  );
  assert.ok(
    results.open_source_routing.seed_title_rerank.mean_reciprocal_rank >=
      results.open_source_routing.mean_reciprocal_rank
  );
  assert.ok(
    results.open_source_routing.structure_aware_rerank.top_1_hit_rate >=
      results.open_source_routing.seed_title_rerank.top_1_hit_rate
  );
  assert.ok(
    results.open_source_routing.structure_aware_rerank.mean_reciprocal_rank >=
      results.open_source_routing.seed_title_rerank.mean_reciprocal_rank
  );
  assert.ok(
    results.open_source_routing.path_family_rerank.top_1_hit_rate >=
      results.open_source_routing.structure_aware_rerank.top_1_hit_rate
  );
  assert.ok(
    results.open_source_routing.path_family_rerank.mean_reciprocal_rank >=
      results.open_source_routing.structure_aware_rerank.mean_reciprocal_rank
  );
  assert.ok(results.open_source_routing.path_family_rerank.top_1_hit_rate < 1);
  assert.equal(results.open_source_routing.path_family_rerank.top_3_hit_rate, 1);
  assert.ok(
    results.open_source_routing.api_surface_rerank.top_1_hit_rate >=
      results.open_source_routing.path_family_rerank.top_1_hit_rate
  );
  assert.ok(
    results.open_source_routing.api_surface_rerank.mean_reciprocal_rank >=
      results.open_source_routing.path_family_rerank.mean_reciprocal_rank
  );
  assert.equal(results.open_source_routing.api_surface_rerank.top_1_hit_rate, 1);
  assert.equal(results.open_source_routing.api_surface_rerank.top_3_hit_rate, 1);
  assert.equal(results.open_source_routing.improvement.worsened_top_3_count, 0);
  assert.equal(results.open_source_routing.structure_aware_improvement.worsened_top_3_count, 0);
  assert.equal(results.open_source_routing.path_family_improvement.worsened_top_3_count, 0);
  assert.equal(results.open_source_routing.api_surface_improvement.worsened_top_3_count, 0);
  assert.equal(results.open_source_routing.api_surface_delta_vs_path_family.promoted_to_top_1_count, 3);
  assert.ok(results.open_source_routing.section_context.section_hit_rate > 0);
  assert.ok(
    results.open_source_routing.section_context.section_hit_given_correct_file_rate >=
      results.open_source_routing.section_context.section_hit_rate
  );
  assert.ok(
    results.open_source_routing.section_context.median_selected_section_bytes <
      results.open_source_routing.api_surface_rerank.median_top_1_bytes
  );
  assert.equal(results.open_source_routing.section_evidence_pack.full_file_evidence_retention_rate, 1);
  assert.equal(results.open_source_routing.section_evidence_pack.mean_pack_term_recall_vs_top_file, 1);
  assert.ok(results.open_source_routing.section_evidence_pack.median_selected_pack_section_count >= 1);
  assert.ok(
    results.open_source_routing.section_evidence_pack.median_selected_pack_bytes >=
      results.open_source_routing.section_context.median_selected_section_bytes
  );
  assert.ok(
    results.open_source_routing.section_evidence_pack.median_selected_pack_bytes <
      results.open_source_routing.api_surface_rerank.median_top_1_bytes
  );
  assert.ok(
    results.open_source_routing.scenario_evidence_bundle.mean_bundle_term_coverage >=
      results.open_source_routing.scenario_evidence_bundle.mean_top_file_term_coverage
  );
  assert.ok(results.open_source_routing.scenario_evidence_bundle.mean_bundle_term_gain_vs_top_file > 0);
  assert.ok(results.open_source_routing.scenario_evidence_bundle.full_scenario_term_coverage_rate < 1);
  assert.ok(results.open_source_routing.scenario_evidence_bundle.full_scenario_term_coverage_rate > 0);
  assert.ok(results.open_source_routing.scenario_evidence_bundle.median_selected_bundle_file_count >= 1);
  assert.ok(
    results.open_source_routing.scenario_cost_aware_bundle.mean_bundle_term_coverage >=
      results.open_source_routing.scenario_evidence_bundle.mean_bundle_term_coverage
  );
  assert.ok(
    results.open_source_routing.scenario_cost_aware_bundle.full_scenario_term_coverage_rate >=
      results.open_source_routing.scenario_evidence_bundle.full_scenario_term_coverage_rate
  );
  assert.ok(
    results.open_source_routing.scenario_cost_aware_bundle.median_selected_bundle_bytes <=
      results.open_source_routing.scenario_evidence_bundle.median_selected_bundle_bytes
  );
  assert.equal(results.open_source_routing.scenario_cost_aware_bundle_delta_vs_rank.worsened_coverage_count, 0);
  assert.ok(results.open_source_routing.scenario_cost_aware_bundle_delta_vs_rank.reduced_bytes_count > 0);
  assert.equal(results.open_source_routing.scenario_term_reachability.full_reachable_term_coverage_rate, 1);
  assert.ok(results.open_source_routing.scenario_term_reachability.scenarios_with_unreachable_terms_rate > 0);
  assert.equal(
    results.open_source_routing.scenario_term_reachability.exact_gap_explained_by_unreachable_terms_rate,
    0.35
  );
  assert.ok(
    results.open_source_routing.scenario_claim_support.full_claim_support_rate >
      results.open_source_routing.scenario_cost_aware_bundle.full_scenario_term_coverage_rate
  );
  assert.ok(
    results.open_source_routing.scenario_claim_support.mean_claim_support_coverage >
      results.open_source_routing.scenario_cost_aware_bundle.mean_bundle_term_coverage
  );
  assert.equal(results.open_source_routing.scenario_claim_support.exact_gap_recovered_rate, 0.2);
  assert.equal(results.open_source_routing.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate, 1);
  assert.equal(results.open_source_routing.scenario_claim_support_pack.mean_pack_claim_support_recall_vs_bundle, 1);
  assert.equal(
    results.open_source_routing.scenario_claim_support_pack.full_claim_support_rate,
    results.open_source_routing.scenario_claim_support.full_claim_support_rate
  );
  assert.equal(
    results.open_source_routing.scenario_claim_support_pack.mean_claim_support_coverage,
    results.open_source_routing.scenario_claim_support.mean_claim_support_coverage
  );
  assert.ok(
    results.open_source_routing.scenario_claim_support_pack.median_selected_pack_bytes <
      results.open_source_routing.scenario_cost_aware_bundle.median_selected_bundle_bytes
  );
  assert.equal(results.open_source_routing.scenario_answer_check.full_answer_check_rate, 1);
  assert.equal(results.open_source_routing.scenario_answer_check.claim_gap_recovered_rate, 0.15);
  assert.equal(results.open_source_routing.scenario_answer_check.exact_gap_recovered_rate, 0.35);
  assert.ok(
    results.open_source_routing.scenario_answer_check.full_answer_check_rate >=
      results.open_source_routing.scenario_claim_support.full_claim_support_rate
  );
  assert.equal(results.open_source_routing.scenario_answer_locality.full_target_local_answer_check_rate, 0.55);
  assert.equal(results.open_source_routing.scenario_answer_locality.cross_file_answer_recovery_rate, 0.45);
  assert.equal(results.open_source_routing.scenario_answer_locality.mean_target_local_answer_check_coverage, 0.7875);
  assert.equal(results.open_source_routing.scenario_answer_locality.mean_cross_file_answer_check_gain, 0.2125);
  assert.equal(results.open_source_routing.scenario_answer_authority.scoped_scenario_count, 20);
  assert.equal(results.open_source_routing.scenario_answer_authority.full_authority_scoped_answer_check_rate, 0.65);
  assert.equal(results.open_source_routing.scenario_answer_authority.mean_authority_scoped_answer_check_coverage, 0.825);
  assert.equal(results.open_source_routing.scenario_answer_authority.mean_out_of_scope_answer_check_gain, 0.175);
  assert.equal(results.open_source_routing.scenario_answer_authority.out_of_scope_answer_recovery_rate, 0.35);
  assert.equal(results.open_source_routing.scenario_answer_authority.scenarios_with_explicit_answer_authority_rate, 1);
  assert.equal(results.open_source_routing.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate, 0.65);
  assert.equal(
    results.open_source_routing.scenario_answer_authority_reachability.mean_authority_reachable_answer_check_coverage,
    0.9
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack,
    0.075
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_reachability.authority_gap_explained_by_reachability_rate,
    0
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate,
    0.35
  );
  assert.equal(results.open_source_routing.scenario_answer_authority_pack.full_authority_pack_answer_check_rate, 0.65);
  assert.equal(results.open_source_routing.scenario_answer_authority_pack.mean_authority_pack_answer_check_coverage, 0.9);
  assert.equal(results.open_source_routing.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack, 0.075);
  assert.equal(
    results.open_source_routing.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate,
    1
  );
  assert.equal(results.open_source_routing.scenario_answer_authority_pack.mean_authority_pack_recall_vs_reachable, 1);
  assert.equal(results.open_source_routing.scenario_answer_authority_local_family.strict_file_scope_scenario_count, 18);
  assert.equal(results.open_source_routing.scenario_answer_authority_local_family.full_local_family_answer_check_rate, 1);
  assert.equal(results.open_source_routing.scenario_answer_authority_local_family.mean_local_family_answer_check_coverage, 1);
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope,
    3.5 / 18
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate,
    7 / 18
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family
      .scenarios_with_missing_local_family_answer_support_rate,
    0
  );
  assert.equal(results.open_source_routing.scenario_answer_authority_local_family_pack.strict_file_scope_scenario_count, 18);
  assert.equal(results.open_source_routing.scenario_answer_authority_local_family_pack.full_local_family_pack_answer_check_rate, 1);
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family_pack.mean_local_family_pack_answer_check_coverage,
    1
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope,
    3.5 / 18
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate,
    1
  );
  assert.equal(
    results.open_source_routing.scenario_answer_authority_local_family_pack.mean_local_family_pack_recall_vs_supported,
    1
  );
  assert.equal(results.open_source_routing.scenario_answer_authority_local_family_pack.median_selected_pack_bytes, 969);
  assert.equal(results.behavior_drift.scenario_count, 4);
  assert.equal(results.behavior_drift.drift_case_count, 3);
  assert.equal(results.behavior_drift.control_case_count, 1);
  assert.equal(results.behavior_drift.route_behavior_recall, 1);
  assert.equal(results.behavior_drift.built_in_recall, 1);
  assert.equal(results.behavior_drift.underreach_recall, 1);
  assert.equal(results.behavior_drift.overreach_recall, 1);
  assert.equal(results.behavior_drift.false_positive_rate, 0);
  assert.equal(results.release_surface.generated_human_surface.recall, 1);
  assert.equal(results.release_surface.generated_human_surface.false_positive_rate, 0);
  assert.equal(results.release_surface.reality_validation.recall, 1);
  assert.equal(results.release_surface.reality_validation.false_positive_rate, 0);
  assert.ok(results.diversity.drift_scenarios.by_class["claim-conflict"] >= 1);
  const workflowDebug = results.loading.scenario_results.find((scenario) => scenario.id === "workflow-debug");
  assert.deepEqual(workflowDebug?.loaded_modules, ["delivery-workflows", "operations-governance"]);
  const harborExceptionReview = results.loading.scenario_results.find(
    (scenario) => scenario.id === "harbor-exception-review"
  );
  assert.deepEqual(harborExceptionReview?.loaded_modules, ["harbor-change-control", "harbor-audit-evidence"]);
  assert.ok(
    results.drift.scenario_results.some((scenario) => scenario.id === "undeclared-claim-pair-conflict"),
    "expected undeclared claim conflict scenario in drift benchmark"
  );
  if (results.runtime_capture) {
    assert.ok(results.runtime_capture.runtime_profiles["copilot-cli-local-openai"]);
    assert.ok(results.runtime_capture.runtime_profiles["claude-code-local-anthropic"]);
    assert.ok(results.runtime_capture.baseline_matrices.aods);
    assert.ok(results.runtime_capture.baseline_matrices["markdown-yaml"]);
    assert.ok(results.runtime_capture.baseline_matrices["llms-txt"]);
    assert.ok(results.runtime_capture.baseline_matrices.dita);
    assert.ok(results.runtime_capture.runtime_request.request_body_bytes > 0);
    assert.equal(results.runtime_capture.runtime_request.prompt_embedded_in_user_message, true);
    assert.equal(results.runtime_capture.combined_lifecycle.summary.scenario_count, 9);
    assert.equal(results.runtime_capture.objective_lifecycle.summary.scenario_count, 5);
    assert.equal(results.runtime_capture.exploratory_lifecycle.summary.scenario_count, 4);
    assert.equal(results.runtime_capture.combined_lifecycle.scenario_results.length, 9);
    assert.equal(results.runtime_capture.objective_lifecycle.scenario_results.length, 5);
    assert.equal(results.runtime_capture.exploratory_lifecycle.scenario_results.length, 4);
    assert.ok(results.runtime_capture.combined_lifecycle.summary.median_request_count >= 1);
    assert.ok(results.runtime_capture.combined_lifecycle.summary.median_first_request_count >= 0);
    assert.ok(results.runtime_capture.combined_lifecycle.summary.median_tool_loop_request_count >= 0);
    assert.ok(results.runtime_capture.combined_lifecycle.summary.median_tool_loop_request_body_bytes >= 0);
    assert.ok(results.runtime_capture.objective_lifecycle.summary.median_request_count >= 1);
    assert.ok(
      results.runtime_capture.combined_lifecycle.summary.median_total_request_body_bytes >=
        results.runtime_capture.summary.combined.median_request_body_bytes
    );
    assert.ok(
      results.runtime_capture.objective_lifecycle.summary.median_total_request_body_bytes >=
        results.runtime_capture.summary.objective_touch.median_request_body_bytes
    );
    assert.ok(results.runtime_capture.representative_lifecycle.request_count >= 1);
    assert.ok(results.runtime_capture.representative_lifecycle.first_request_count >= 0);
    assert.ok(results.runtime_capture.representative_lifecycle.tool_loop_request_count >= 0);
    assert.ok(results.runtime_capture.representative_lifecycle.tool_loop_request_body_bytes >= 0);
    assert.ok(
      results.runtime_capture.representative_lifecycle.request_breakdown.every(
        (entry) => typeof entry.lifecycle_request_class === "string" && entry.lifecycle_request_class.length > 0
      )
    );
    assert.ok(
      results.runtime_capture.representative_lifecycle.total_request_body_bytes >=
        results.runtime_capture.runtime_request.request_body_bytes
    );
    assert.ok(results.runtime_capture.summary.combined.median_request_body_bytes > 0);
    assert.ok(results.runtime_capture.summary.objective_touch.scenario_count > 0);
    assert.ok(results.runtime_capture.scenario_results.length >= results.runtime_capture.summary.scenario_count);
    assert.ok(
      results.runtime_capture.runtime_profiles["claude-code-local-anthropic"].baseline_matrices.aods.summary.objective_touch
        .median_request_body_bytes > 0
    );
    assert.ok(
      results.runtime_capture.runtime_profiles["claude-code-local-anthropic"].baseline_matrices.aods.representative_lifecycle
        .request_count >= 1
    );
    assert.equal(
      results.runtime_capture.runtime_profiles["claude-code-local-anthropic"].baseline_matrices.aods.combined_lifecycle
        .summary.scenario_count,
      9
    );
    assert.equal(
      results.runtime_capture.runtime_profiles["claude-code-local-anthropic"].baseline_matrices.aods.objective_lifecycle
        .summary.scenario_count,
      5
    );
    assert.equal(
      results.runtime_capture.runtime_profiles["claude-code-local-anthropic"].baseline_matrices.aods.exploratory_lifecycle
        .summary.scenario_count,
      4
    );
    const hostedRuntimeProfile = results.runtime_capture.runtime_profiles["claude-code-hosted-anthropic-relay"];
    if (hostedRuntimeProfile) {
      assert.equal(hostedRuntimeProfile.profile.mode, "hosted");
      assert.ok(hostedRuntimeProfile.baseline_matrices.aods.summary.objective_touch.median_request_body_bytes > 0);
      assert.equal(hostedRuntimeProfile.baseline_matrices.aods.combined_lifecycle.summary.scenario_count, 9);
      assert.equal(hostedRuntimeProfile.baseline_matrices.aods.objective_lifecycle.summary.scenario_count, 5);
      assert.equal(hostedRuntimeProfile.baseline_matrices.aods.exploratory_lifecycle.summary.scenario_count, 4);
      assert.ok(hostedRuntimeProfile.baseline_matrices.aods.combined_lifecycle.summary.median_tool_loop_request_count >= 0);
      assert.ok(hostedRuntimeProfile.baseline_matrices.aods.representative_lifecycle.request_count >= 1);
      assert.equal(results.runtime_capture.runtime_attribution.hosted_profile_id, "claude-code-hosted-anthropic-relay");
      assert.equal(results.runtime_capture.runtime_attribution.local_profile_id, "claude-code-local-anthropic");
      assert.ok(results.runtime_capture.runtime_attribution.combined_median_delta.total_request_body_bytes_delta > 0);
      assert.ok(results.runtime_capture.runtime_attribution.combined_median_delta.tool_loop_request_body_bytes_delta >= 0);
      assert.ok(results.runtime_capture.runtime_attribution.heaviest_tool_loop_delta_scenarios.length > 0);
      assert.ok(results.runtime_capture.hosted_repeatability);
      assert.ok(results.runtime_capture.hosted_repeatability.successful_run_count >= 3);
      assert.ok(results.runtime_capture.hosted_repeatability.bands.delta_total_request_body_bytes.span >= 0);
      assert.ok(results.runtime_capture.hosted_repeatability.bands.delta_tool_loop_request_body_bytes.span >= 0);
    }
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
  for (const scenario of results.behavior_drift.scenario_results) {
    assert.equal(
      scenario.built_in_detected,
      scenario.expected_built_in_detection,
      `built-in behavior-drift expectation mismatch for ${scenario.id}`
    );
    assert.equal(
      scenario.behavior_detected,
      scenario.expected_behavior_detection,
      `route-behavior expectation mismatch for ${scenario.id}`
    );
  }
  for (const scenario of results.release_surface.scenario_results) {
    assert.equal(scenario.success, true, `release-surface scenario should succeed: ${scenario.id}`);
  }

  const reportPath = path.join(PROJECT_ROOT, "reports", "aods-evaluation-report.md");
  assert.ok(fs.existsSync(reportPath));
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /AODS evaluation report/);
  assert.match(report, /Objective touch-route loading gate/);
  assert.match(report, /rendered prompt envelope/);
  assert.match(report, /Open-source routing benchmark/);
  assert.match(report, /Seed-title rerank top-1 hit rate/);
  assert.match(report, /Structure-aware rerank top-1 hit rate/);
  assert.match(report, /Path-family rerank top-1 hit rate/);
  assert.match(report, /API-surface rerank top-1 hit rate/);
  assert.match(report, /Section-context hit rate/);
  assert.match(report, /Section-evidence pack full file-evidence retention rate/);
  assert.match(report, /Scenario-evidence bundle full scenario-term coverage rate/);
  assert.match(report, /Cost-aware scenario-evidence full scenario-term coverage rate/);
  assert.match(report, /Reachability audit full reachable-term coverage rate/);
  assert.match(report, /Claim-support full coverage rate/);
  assert.match(report, /Claim-support pack full bundle-preservation rate/);
  assert.match(report, /Answer-check full coverage rate/);
  assert.match(report, /Target-local answer-check full coverage rate/);
  assert.match(report, /Authority-scoped answer-check full coverage rate/);
  assert.match(report, /Out-of-scope answer recovery rate/);
  assert.match(report, /Route-behavior drift recall/);
  assert.match(report, /Built-in route-behavior recall/);
  assert.match(report, /Release-surface trust gates/);
  assert.match(report, /Sample diversity and coverage audit/);
  assert.match(report, /External sample supplement/);
  assert.match(report, /tool-loop traffic rather than the first request envelope/i);
  assert.match(report, /directional field evidence/i);

  assertCompactJsonFile(path.join(PROJECT_ROOT, "generated", "aods-corpus", "manifest.json"));
  assertCompactJsonFile(
    path.join(PROJECT_ROOT, "generated", "aods-corpus", "modules", "architecture-contracts.json")
  );
  const runtimeCompanion = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, "generated", "aods-corpus", "indexes", "runtime.json"), "utf8")
  );
  assert.equal(runtimeCompanion.roles?.[0]?.scope, undefined);
  assert.equal(runtimeCompanion.roles?.[0]?.required_modules, undefined);
  assert.ok(Array.isArray(runtimeCompanion.roles?.[0]?.capabilities));

  const artifactOnlyRoute = JSON.parse(
    execFileSync(
      "node",
      [
        path.join(REPO_ROOT, "bin", "aods.mjs"),
        "route",
        path.join(PROJECT_ROOT, "generated", "aods-corpus"),
        "--role",
        "architect",
        "--intent",
        "read",
        "--query",
        "warehouse release health",
        "--json"
      ],
      { cwd: REPO_ROOT, stdio: "pipe", encoding: "utf8" }
    )
  );
  assert.equal(artifactOnlyRoute.strategy, "query-route");
  assert.equal(artifactOnlyRoute.recommended_modules[0]?.id, "delivery-workflows");
});

test("compile command emits compact machine JSON surfaces", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-compile-"));

  try {
    compilePilotCorpus(tempRoot);

    assertCompactJsonFile(path.join(tempRoot, "manifest.json"));
    assertCompactJsonFile(path.join(tempRoot, "modules", "shift-ops-policy.json"));
    assertCompactJsonFile(path.join(tempRoot, "indexes", "runtime.json"));
    const generatedReadme = fs.readFileSync(path.join(tempRoot, "README.md"), "utf8");
    assert.match(generatedReadme, /AODS GENERATED: pair_id=pair-shift-ops-readme mode=deterministic profile=overview/);
    assert.match(generatedReadme, /Production database schema changes require two approvers\./);
    runValidateCli(tempRoot, "--reality");

    const { rootModulePath, rootModule: originalRootModule } = loadRootModule(tempRoot);
    const cloneRootModule = () => JSON.parse(JSON.stringify(originalRootModule));

    {
      const rootModule = cloneRootModule();
      const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
      surfaceInventory.content.entries[0].path = "../escape.md";
      writeModuleJson(rootModulePath, rootModule);
      expectValidateFailure(tempRoot, /surface-inventory-relative-path/);
    }

    {
      const rootModule = cloneRootModule();
      const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
      surfaceInventory.content.entries[0].path = "missing-current.md";
      writeModuleJson(rootModulePath, rootModule);
      runValidateCli(tempRoot);
      expectValidateFailure(tempRoot, /surface-inventory-current-missing/, "--reality");
    }

    {
      const rootModule = cloneRootModule();
      const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
      surfaceInventory.content.entries[1].path = "scratch-placeholder";
      writeModuleJson(rootModulePath, rootModule);
      fs.mkdirSync(path.join(tempRoot, "scratch-placeholder"), { recursive: true });
      fs.writeFileSync(path.join(tempRoot, "scratch-placeholder", ".gitkeep"), "");
      expectValidateFailure(tempRoot, /surface-inventory-placeholder-directory/, "--reality");
    }

    {
      const rootModule = cloneRootModule();
      const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
      surfaceInventory.content.entries[0].path = "modules";
      writeModuleJson(rootModulePath, rootModule);
      expectValidateFailure(tempRoot, /surface-inventory-kind/, "--reality");
    }

    {
      const rootModule = cloneRootModule();
      const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
      surfaceInventory.content.entries[1].path = "README.md";
      writeModuleJson(rootModulePath, rootModule);
      expectValidateFailure(tempRoot, /surface-inventory-kind/, "--reality");
    }

    {
      const rootModule = cloneRootModule();
      const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
      surfaceInventory.content.entries[2].path = "./README.md";
      surfaceInventory.content.entries[2].kind = "file";
      surfaceInventory.content.entries[2].state = "current";
      writeModuleJson(rootModulePath, rootModule);
      expectValidateFailure(tempRoot, /surface-inventory-duplicate-current/, "--reality");
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("reality validation supports repo-scoped inventories with explicit repo root", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-compile-"));
  const tempRepoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-repo-root-"));

  try {
    compilePilotCorpus(tempRoot);

    const { rootModulePath, rootModule } = loadRootModule(tempRoot);
    const surfaceInventory = rootModule.artifacts.find((artifact) => artifact.artifact_id === "surface-inventory");
    surfaceInventory.content.base = "repo";
    surfaceInventory.content.entries = [
      {
        surface_id: "repo-current",
        path: "repo-owned/current.md",
        kind: "file",
        state: "current"
      },
      {
        surface_id: "repo-reserved",
        path: "repo-owned/release-checklist",
        kind: "directory",
        state: "reserved"
      },
      {
        surface_id: "repo-future",
        path: "repo-owned/change-bot",
        kind: "directory",
        state: "future"
      }
    ];
    writeModuleJson(rootModulePath, rootModule);

    fs.mkdirSync(path.join(tempRepoRoot, "repo-owned"), { recursive: true });
    fs.writeFileSync(path.join(tempRepoRoot, "repo-owned", "current.md"), "# current\n");

    expectValidateFailure(tempRoot, /surface-inventory-current-missing/, "--reality");
    runValidateCli(tempRoot, "--reality", "--repo-root", tempRepoRoot);
    expectValidateFailure(
      tempRoot,
      /reality-repo-root/,
      "--reality",
      "--repo-root",
      path.join(tempRepoRoot, "repo-owned", "current.md")
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.rmSync(tempRepoRoot, { recursive: true, force: true });
  }
});

test("validate warns on module-like JSON files that are not registered in manifest", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-compile-"));

  try {
    compilePilotCorpus(tempRoot);

    const orphanModulePath = path.join(tempRoot, "modules", "orphan-ops.json");
    const orphanModule = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "modules", "shift-ops-policy.json"), "utf8")
    );
    orphanModule.module_id = "orphan-ops";
    writeModuleJson(orphanModulePath, orphanModule);
    writeModuleJson(path.join(tempRoot, "modules", "not-a-module.json"), {
      note: "not an AODS module"
    });

    const output = runValidateWarningCli(tempRoot);
    assert.match(output, /WARN unregistered-module-file/);
    assert.match(output, /modules\/orphan-ops\.json/);
    assert.doesNotMatch(output, /not-a-module\.json/);
    assert.match(output, /warnings=1/);

    expectValidateFailure(tempRoot, /unregistered-module-file/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("round-one external comparison generates a horizontal report", () => {
  const results = runRoundOneComparison();

  const baselineIds = results.baselines.map((baseline) => baseline.id).sort();
  assert.deepEqual(baselineIds, ["aods", "dita", "llms-txt", "markdown-yaml"]);

  const aods = results.baselines.find((baseline) => baseline.id === "aods");
  assert.equal(aods.governance.explicit_authority_model, true);
  assert.ok(aods.common.corpus_bytes > 0);
  assert.ok(aods.advisory.corpus_tokens_estimated > 0);
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_count, 20);
  assert.ok(
    results.aods_self_evaluation.open_source_routing.seed_title_rerank.top_1_hit_rate >=
      results.aods_self_evaluation.open_source_routing.top_1_hit_rate
  );
  assert.ok(
    results.aods_self_evaluation.open_source_routing.structure_aware_rerank.top_1_hit_rate >=
      results.aods_self_evaluation.open_source_routing.seed_title_rerank.top_1_hit_rate
  );
  assert.ok(
    results.aods_self_evaluation.open_source_routing.path_family_rerank.top_1_hit_rate >=
      results.aods_self_evaluation.open_source_routing.structure_aware_rerank.top_1_hit_rate
  );
  assert.ok(results.aods_self_evaluation.open_source_routing.path_family_rerank.top_1_hit_rate < 1);
  assert.equal(results.aods_self_evaluation.open_source_routing.api_surface_rerank.top_1_hit_rate, 1);
  assert.ok(
    results.aods_self_evaluation.open_source_routing.section_context.median_selected_section_bytes <
      results.aods_self_evaluation.open_source_routing.api_surface_rerank.median_top_1_bytes
  );
  assert.equal(results.aods_self_evaluation.open_source_routing.section_evidence_pack.full_file_evidence_retention_rate, 1);
  assert.ok(
    results.aods_self_evaluation.open_source_routing.section_evidence_pack.median_selected_pack_bytes <
      results.aods_self_evaluation.open_source_routing.api_surface_rerank.median_top_1_bytes
  );
  assert.ok(
    results.aods_self_evaluation.open_source_routing.scenario_evidence_bundle.mean_bundle_term_coverage >=
      results.aods_self_evaluation.open_source_routing.scenario_evidence_bundle.mean_top_file_term_coverage
  );
  assert.ok(results.aods_self_evaluation.open_source_routing.scenario_evidence_bundle.full_scenario_term_coverage_rate < 1);
  assert.ok(
    results.aods_self_evaluation.open_source_routing.scenario_cost_aware_bundle.mean_bundle_term_coverage >=
      results.aods_self_evaluation.open_source_routing.scenario_evidence_bundle.mean_bundle_term_coverage
  );
  assert.ok(
    results.aods_self_evaluation.open_source_routing.scenario_cost_aware_bundle.full_scenario_term_coverage_rate >=
      results.aods_self_evaluation.open_source_routing.scenario_evidence_bundle.full_scenario_term_coverage_rate
  );
  assert.ok(
    results.aods_self_evaluation.open_source_routing.scenario_cost_aware_bundle.median_selected_bundle_bytes <=
      results.aods_self_evaluation.open_source_routing.scenario_evidence_bundle.median_selected_bundle_bytes
  );
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_cost_aware_bundle_delta_vs_rank.worsened_coverage_count, 0);
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_term_reachability.full_reachable_term_coverage_rate, 1);
  assert.ok(results.aods_self_evaluation.open_source_routing.scenario_term_reachability.scenarios_with_unreachable_terms_rate > 0);
  assert.ok(
    results.aods_self_evaluation.open_source_routing.scenario_claim_support.full_claim_support_rate >
      results.aods_self_evaluation.open_source_routing.scenario_cost_aware_bundle.full_scenario_term_coverage_rate
  );
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_claim_support.exact_gap_recovered_rate, 0.2);
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_claim_support_pack
      .full_bundle_claim_support_preservation_rate,
    1
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_claim_support_pack
      .mean_pack_claim_support_recall_vs_bundle,
    1
  );
  assert.ok(
    results.aods_self_evaluation.open_source_routing.scenario_claim_support_pack.median_selected_pack_bytes <
      results.aods_self_evaluation.open_source_routing.scenario_cost_aware_bundle.median_selected_bundle_bytes
  );
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_answer_check.full_answer_check_rate, 1);
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_answer_check.claim_gap_recovered_rate, 0.15);
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_answer_check.exact_gap_recovered_rate, 0.35);
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_locality
      .full_target_local_answer_check_rate,
    0.55
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_locality.cross_file_answer_recovery_rate,
    0.45
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_locality
      .mean_target_local_answer_check_coverage,
    0.7875
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_locality.mean_cross_file_answer_check_gain,
    0.2125
  );
  assert.equal(results.aods_self_evaluation.open_source_routing.scenario_answer_authority.scoped_scenario_count, 20);
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority.full_authority_scoped_answer_check_rate,
    0.65
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority.out_of_scope_answer_recovery_rate,
    0.35
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_reachability
      .full_authority_reachable_answer_check_rate,
    0.65
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_reachability
      .mean_authority_reachable_gain_vs_scoped_pack,
    0.075
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_reachability
      .scenarios_with_missing_authority_answer_support_rate,
    0.35
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_pack
      .full_authority_pack_answer_check_rate,
    0.65
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_pack
      .full_authority_reachable_answer_preservation_rate,
    1
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_pack
      .mean_authority_pack_gain_vs_scoped_pack,
    0.075
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family
      .strict_file_scope_scenario_count,
    18
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family
      .full_local_family_answer_check_rate,
    1
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family
      .mean_local_family_gain_vs_authority_scope,
    3.5 / 18
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family
      .authority_gap_explained_by_local_family_rate,
    7 / 18
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family_pack
      .strict_file_scope_scenario_count,
    18
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family_pack
      .full_local_family_pack_answer_check_rate,
    1
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family_pack
      .mean_local_family_pack_gain_vs_authority_scope,
    3.5 / 18
  );
  assert.equal(
    results.aods_self_evaluation.open_source_routing.scenario_answer_authority_local_family_pack
      .full_local_family_support_preservation_rate,
    1
  );
  assert.equal(results.aods_self_evaluation.behavior_drift.route_behavior_recall, 1);
  assert.equal(results.aods_self_evaluation.behavior_drift.built_in_recall, 1);
  assert.equal(results.aods_self_evaluation.behavior_drift.false_positive_rate, 0);
  assert.equal(results.aods_self_evaluation.release_surface.generated_human_surface.recall, 1);
  assert.equal(results.field_sample?.corpus_count ?? 0, 3);
  assert.equal(results.field_sample?.scenario_count ?? 0, 20);

  const llms = results.baselines.find((baseline) => baseline.id === "llms-txt");
  assert.ok(llms.common.corpus_bytes > 0);
  assert.ok(llms.advisory.corpus_tokens_estimated > 0);
  assert.ok(results.fairness_contract.common_metrics.includes("corpus byte count"));
  assert.ok(results.fairness_contract.common_metrics.includes("objective median loaded bytes"));
  assert.ok(results.fairness_contract.common_metrics.includes("objective median prompt-envelope bytes"));
  if (results.aods_self_evaluation.runtime_capture) {
    assert.ok(results.aods_self_evaluation.runtime_capture.summary.objective_touch.median_request_body_bytes > 0);
    assert.equal(results.aods_self_evaluation.runtime_capture.combined_lifecycle.summary.scenario_count, 9);
    assert.equal(results.aods_self_evaluation.runtime_capture.objective_lifecycle.summary.scenario_count, 5);
    assert.equal(results.aods_self_evaluation.runtime_capture.exploratory_lifecycle.summary.scenario_count, 4);
    assert.ok(results.aods_self_evaluation.runtime_capture.runtime_request.request_body_bytes > 0);
    assert.ok(results.aods_self_evaluation.runtime_capture.summary.combined.median_request_body_bytes > 0);
    assert.ok(results.aods_self_evaluation.runtime_capture.runtime_profiles["claude-code-local-anthropic"]);
    assert.ok(results.baselines.every((baseline) => baseline.runtime_capture?.summary?.objective_touch));
    if (results.aods_self_evaluation.runtime_capture.runtime_profiles["claude-code-hosted-anthropic-relay"]) {
      assert.ok(results.aods_self_evaluation.runtime_capture.runtime_attribution);
    }
  }

  const reportPath = path.join(PROJECT_ROOT, "reports", "round1-comparator-report.md");
  assert.ok(fs.existsSync(reportPath));
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /AODS round-one benchmark evaluation report/);
  assert.match(report, /Why these comparators/);
  assert.match(report, /Median prompt-envelope bytes/);
  assert.match(report, /Objective common metric scoreboard/);
  assert.match(report, /Runtime-backed objective supplement/);
  assert.match(report, /Additional runtime supplements/);
  assert.match(report, /AODS full-run lifecycle/);
  assert.match(report, /AODS objective full-run lifecycle/);
  assert.match(report, /exploratory/i);
  assert.match(report, /Representative AODS full-run lifecycle/);
  assert.match(report, /tool-loop/i);
  assert.match(report, /claude-code-local-anthropic/);
  assert.match(report, /Benchmark objectivity and diversity audit/);
  assert.match(report, /External field-sample supplement/);
  assert.match(report, /claim-support-pack preservation/);
  assert.match(report, /answer-check coverage/);
  assert.match(report, /target-local answer-check coverage/);
  assert.match(report, /authority-scoped answer-check coverage/);
  assert.match(report, /authority-reachable answer-check coverage/);
  assert.match(report, /authority-aware/i);
  assert.match(report, /local-family/i);
  assert.match(report, /local-family pack/i);
  assert.match(report, /route-behavior drift recall/i);
  assert.match(report, /built-in route-behavior recall/i);
  assert.match(report, /out-of-scope answer recovery/);

  const runtimeCaptureReportPath = path.join(PROJECT_ROOT, "reports", "runtime-capture-report.md");
  assert.ok(fs.existsSync(runtimeCaptureReportPath));
  const runtimeCaptureReport = fs.readFileSync(runtimeCaptureReportPath, "utf8");
  if (results.aods_self_evaluation.runtime_capture?.runtime_profiles["claude-code-hosted-anthropic-relay"]) {
    assert.match(report, /Hosted-vs-local attribution/i);
    assert.match(runtimeCaptureReport, /Hosted-vs-local runtime attribution/);
    assert.match(runtimeCaptureReport, /Hosted repeatability audit/);
    assert.match(runtimeCaptureReport, /Run-by-run hosted repeatability/);
    assert.match(runtimeCaptureReport, /Heaviest tool-loop delta scenarios/);
  }
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
  const executiveSummaryResultsPath = path.join(PROJECT_ROOT, "generated", "results", "executive-summary-results.json");
  const summaryReportPath = path.join(PROJECT_ROOT, "reports", "benchmark-summary-report.md");
  const executiveSummaryReportPath = path.join(PROJECT_ROOT, "reports", "executive-summary-report.md");
  const readmePath = path.join(REPO_ROOT, "README.md");
  const readmeZhPath = path.join(REPO_ROOT, "README.zh-CN.md");
  const snapshots = new Map(
    [
      historyEvalPath,
      historyComparePath,
      summaryResultsPath,
      executiveSummaryResultsPath,
      summaryReportPath,
      executiveSummaryReportPath,
      readmePath,
      readmeZhPath
    ].map((filePath) => [
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
    assert.ok(second.metrics.find((metric) => metric.id === "route-behavior-drift-recall"));
    assert.ok(second.metrics.find((metric) => metric.id === "route-behavior-built-in-recall"));
    assert.ok(second.metrics.find((metric) => metric.id === "route-behavior-false-positive-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-routing-top1-hit-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-rerank-top1-hit-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-structure-rerank-top1-hit-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-path-family-rerank-top1-hit-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-api-surface-rerank-top1-hit-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-section-hit-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-section-evidence-retention-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-section-evidence-pack-median-bytes"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-scenario-evidence-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-scenario-evidence-median-bytes"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-cost-aware-scenario-evidence-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-cost-aware-scenario-evidence-median-bytes"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-reachable-scenario-evidence-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-scenario-unreachable-term-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-claim-support-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-claim-support-recovered-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-claim-support-pack-preservation-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-claim-support-pack-median-bytes"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-check-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-check-claim-gap-recovered-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-locality-target-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-locality-cross-file-recovered-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-scoped-scenario-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-coverage-rate"));
    assert.ok(
      second.metrics.find((metric) => metric.id === "open-source-answer-authority-out-of-scope-recovered-rate")
    );
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-reachable-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-reachable-gain-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-missing-support-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-pack-preservation-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-pack-gain-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-pack-median-bytes"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-local-family-coverage-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-local-family-gain-rate"));
    assert.ok(second.metrics.find((metric) => metric.id === "open-source-answer-authority-local-family-explained-rate"));
    assert.ok(
      second.metrics.find((metric) => metric.id === "open-source-answer-authority-local-family-pack-preservation-rate")
    );
    assert.ok(
      second.metrics.find((metric) => metric.id === "open-source-answer-authority-local-family-pack-gain-rate")
    );
    assert.ok(
      second.metrics.find((metric) => metric.id === "open-source-answer-authority-local-family-pack-median-bytes")
    );
    assert.ok(second.metrics.find((metric) => metric.id === "external-sample-scenario-count"));
    assert.ok(second.metrics.find((metric) => metric.id === "release-surface-reality-recall"));

    assert.ok(fs.existsSync(summaryReportPath));
    const report = fs.readFileSync(summaryReportPath, "utf8");
    assert.match(report, /Benchmark summary/);
    assert.match(report, /Metric delta table/);
    assert.match(report, /authority-scoped answer-check full coverage/);
    assert.match(report, /authority-reachable answer-check full coverage/);
    assert.match(report, /authority-aware/i);
    assert.match(report, /local-family/i);
    assert.match(report, /local-family support preservation/i);
    assert.match(report, /Route-behavior drift recall/i);
    assert.match(report, /Hosted runtime attribution, when present, is directional field evidence/i);
    assert.ok(fs.existsSync(executiveSummaryReportPath));
    const executiveReport = fs.readFileSync(executiveSummaryReportPath, "utf8");
    assert.match(executiveReport, /AODS benchmark executive summary/);
    assert.match(executiveReport, /Current maintainer assessment/);
    assert.match(executiveReport, /supports publishing the next version/);
    assert.match(executiveReport, /Hosted repeatability snapshot/);
  } finally {
    for (const [filePath, snapshot] of snapshots) {
      restoreFile(filePath, snapshot);
    }
  }
});
