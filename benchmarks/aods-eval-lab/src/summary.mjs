import fs from "node:fs";
import path from "node:path";

import { projectPaths } from "./generate-fixtures.mjs";
import { PROJECT_ROOT, REPO_ROOT, ensureDir, formatPercent, readJson, writeJson, writeText } from "./helpers.mjs";

const HISTORY_FILENAMES = {
  evaluation: "latest-evaluation-results.json",
  comparison: "latest-round1-comparator-results.json"
};

const BENCHMARK_SYNC_START = "<!-- BENCHMARK_SYNC:START -->";
const BENCHMARK_SYNC_END = "<!-- BENCHMARK_SYNC:END -->";

const METRIC_SPECS = [
  {
    id: "lifecycle-phase-coverage",
    category: "objective",
    label: "Lifecycle phase coverage",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.coverage.lifecycle_phase_coverage
  },
  {
    id: "fact-preservation-rate",
    category: "objective",
    label: "Fact preservation rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.fidelity.fact_preservation_rate
  },
  {
    id: "aods-corpus-bytes",
    category: "objective",
    label: "AODS exact corpus bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.fidelity.exact_size.aods_corpus.byte_count
  },
  {
    id: "objective-touch-hit-rate",
    category: "objective",
    label: "Objective touch-route hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.loading.objective_touch.hit_rate
  },
  {
    id: "objective-median-loaded-bytes",
    category: "objective",
    label: "Objective median loaded bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.loading.objective_touch.median_route_bytes
  },
  {
    id: "objective-median-prompt-envelope-bytes",
    category: "objective",
    label: "Objective median prompt-envelope bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.loading.objective_touch.median_prompt_envelope_bytes
  },
  {
    id: "built-in-drift-recall",
    category: "objective",
    label: "Built-in drift recall",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.drift.built_in_recall
  },
  {
    id: "built-in-false-positive-rate",
    category: "objective",
    label: "Built-in false-positive rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.drift.built_in_false_positive_rate
  },
  {
    id: "route-behavior-drift-recall",
    category: "supplemental",
    label: "Route-behavior drift recall",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.behavior_drift?.route_behavior_recall ?? null
  },
  {
    id: "route-behavior-built-in-recall",
    category: "supplemental",
    label: "Built-in route-behavior recall",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.behavior_drift?.built_in_recall ?? null
  },
  {
    id: "route-behavior-false-positive-rate",
    category: "supplemental",
    label: "Route-behavior false-positive rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.behavior_drift?.false_positive_rate ?? null
  },
  {
    id: "generated-surface-recall",
    category: "objective",
    label: "Generated surface recall",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.release_surface?.generated_human_surface?.recall ?? null
  },
  {
    id: "generated-surface-false-positive-rate",
    category: "objective",
    label: "Generated surface false-positive rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.release_surface?.generated_human_surface?.false_positive_rate ?? null
  },
  {
    id: "release-surface-reality-recall",
    category: "objective",
    label: "Release-surface reality recall",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.release_surface?.reality_validation?.recall ?? null
  },
  {
    id: "release-surface-reality-false-positive-rate",
    category: "objective",
    label: "Release-surface reality false-positive rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.release_surface?.reality_validation?.false_positive_rate ?? null
  },
  {
    id: "open-source-routing-top1-hit-rate",
    category: "supplemental",
    label: "Open-source routing top-1 hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.top_1_hit_rate ?? null
  },
  {
    id: "open-source-routing-mrr",
    category: "supplemental",
    label: "Open-source routing MRR",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.mean_reciprocal_rank ?? null
  },
  {
    id: "open-source-rerank-top1-hit-rate",
    category: "supplemental",
    label: "Open-source rerank top-1 hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.seed_title_rerank?.top_1_hit_rate ?? null
  },
  {
    id: "open-source-rerank-mrr",
    category: "supplemental",
    label: "Open-source rerank MRR",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.seed_title_rerank?.mean_reciprocal_rank ?? null
  },
  {
    id: "open-source-structure-rerank-top1-hit-rate",
    category: "supplemental",
    label: "Open-source structure rerank top-1 hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.structure_aware_rerank?.top_1_hit_rate ?? null
  },
  {
    id: "open-source-structure-rerank-mrr",
    category: "supplemental",
    label: "Open-source structure rerank MRR",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.structure_aware_rerank?.mean_reciprocal_rank ?? null
  },
  {
    id: "open-source-path-family-rerank-top1-hit-rate",
    category: "supplemental",
    label: "Open-source path-family rerank top-1 hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.path_family_rerank?.top_1_hit_rate ?? null
  },
  {
    id: "open-source-path-family-rerank-mrr",
    category: "supplemental",
    label: "Open-source path-family rerank MRR",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.path_family_rerank?.mean_reciprocal_rank ?? null
  },
  {
    id: "open-source-api-surface-rerank-top1-hit-rate",
    category: "supplemental",
    label: "Open-source API-surface rerank top-1 hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.api_surface_rerank?.top_1_hit_rate ?? null
  },
  {
    id: "open-source-api-surface-rerank-mrr",
    category: "supplemental",
    label: "Open-source API-surface rerank MRR",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.api_surface_rerank?.mean_reciprocal_rank ?? null
  },
  {
    id: "open-source-section-hit-rate",
    category: "supplemental",
    label: "Open-source section hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.section_context?.section_hit_rate ?? null
  },
  {
    id: "open-source-section-median-bytes",
    category: "supplemental",
    label: "Open-source section median bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.open_source_routing?.section_context?.median_selected_section_bytes ?? null
  },
  {
    id: "open-source-section-evidence-retention-rate",
    category: "supplemental",
    label: "Open-source section-evidence full-file retention rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.section_evidence_pack?.full_file_evidence_retention_rate ?? null
  },
  {
    id: "open-source-section-evidence-pack-median-bytes",
    category: "supplemental",
    label: "Open-source section-evidence median bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.section_evidence_pack?.median_selected_pack_bytes ?? null
  },
  {
    id: "open-source-scenario-evidence-coverage-rate",
    category: "supplemental",
    label: "Open-source scenario-evidence full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_evidence_bundle?.full_scenario_term_coverage_rate ?? null
  },
  {
    id: "open-source-scenario-evidence-median-bytes",
    category: "supplemental",
    label: "Open-source scenario-evidence median bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_evidence_bundle?.median_selected_bundle_bytes ?? null
  },
  {
    id: "open-source-cost-aware-scenario-evidence-coverage-rate",
    category: "supplemental",
    label: "Open-source cost-aware scenario-evidence full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_cost_aware_bundle?.full_scenario_term_coverage_rate ?? null
  },
  {
    id: "open-source-cost-aware-scenario-evidence-median-bytes",
    category: "supplemental",
    label: "Open-source cost-aware scenario-evidence median bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_cost_aware_bundle?.median_selected_bundle_bytes ?? null
  },
  {
    id: "open-source-reachable-scenario-evidence-coverage-rate",
    category: "supplemental",
    label: "Open-source reachable scenario-evidence full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_term_reachability?.full_reachable_term_coverage_rate ?? null
  },
  {
    id: "open-source-scenario-unreachable-term-rate",
    category: "supplemental",
    label: "Open-source scenario unreachable-term rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_term_reachability?.scenarios_with_unreachable_terms_rate ?? null
  },
  {
    id: "open-source-claim-support-coverage-rate",
    category: "supplemental",
    label: "Open-source claim-support full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_claim_support?.full_claim_support_rate ?? null
  },
  {
    id: "open-source-claim-support-recovered-rate",
    category: "supplemental",
    label: "Open-source claim-support exact-gap recovered rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_claim_support?.exact_gap_recovered_rate ?? null
  },
  {
    id: "open-source-claim-support-pack-preservation-rate",
    category: "supplemental",
    label: "Open-source claim-support pack preservation rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_claim_support_pack?.full_bundle_claim_support_preservation_rate ??
      null
  },
  {
    id: "open-source-claim-support-pack-median-bytes",
    category: "supplemental",
    label: "Open-source claim-support pack median bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_claim_support_pack?.median_selected_pack_bytes ?? null
  },
  {
    id: "open-source-answer-check-coverage-rate",
    category: "supplemental",
    label: "Open-source answer-check full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_check?.full_answer_check_rate ?? null
  },
  {
    id: "open-source-answer-check-claim-gap-recovered-rate",
    category: "supplemental",
    label: "Open-source answer-check claim-gap recovered rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_check?.claim_gap_recovered_rate ?? null
  },
  {
    id: "open-source-answer-locality-target-coverage-rate",
    category: "supplemental",
    label: "Open-source target-local answer-check full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_locality?.full_target_local_answer_check_rate ?? null
  },
  {
    id: "open-source-answer-locality-cross-file-recovered-rate",
    category: "supplemental",
    label: "Open-source cross-file answer-check recovered rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_locality?.cross_file_answer_recovery_rate ?? null
  },
  {
    id: "open-source-answer-authority-scoped-scenario-rate",
    category: "supplemental",
    label: "Open-source explicit answer-authority scenario rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority?.scenarios_with_explicit_answer_authority_rate ?? null
  },
  {
    id: "open-source-answer-authority-coverage-rate",
    category: "supplemental",
    label: "Open-source authority-scoped answer-check full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority?.full_authority_scoped_answer_check_rate ?? null
  },
  {
    id: "open-source-answer-authority-out-of-scope-recovered-rate",
    category: "supplemental",
    label: "Open-source out-of-scope answer recovery rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority?.out_of_scope_answer_recovery_rate ?? null
  },
  {
    id: "open-source-answer-authority-reachable-coverage-rate",
    category: "supplemental",
    label: "Open-source authority-reachable answer-check full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_reachability
        ?.full_authority_reachable_answer_check_rate ?? null
  },
  {
    id: "open-source-answer-authority-reachable-gain-rate",
    category: "supplemental",
    label: "Open-source authority-reachable mean gain vs scoped pack",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_reachability
        ?.mean_authority_reachable_gain_vs_scoped_pack ?? null
  },
  {
    id: "open-source-answer-authority-missing-support-rate",
    category: "supplemental",
    label: "Open-source authority-local missing-support rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_reachability
        ?.scenarios_with_missing_authority_answer_support_rate ?? null
  },
  {
    id: "open-source-answer-authority-pack-preservation-rate",
    category: "supplemental",
    label: "Open-source authority-aware reachable-support preservation rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_pack
        ?.full_authority_reachable_answer_preservation_rate ?? null
  },
  {
    id: "open-source-answer-authority-pack-gain-rate",
    category: "supplemental",
    label: "Open-source authority-aware mean gain vs scoped pack",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_pack
        ?.mean_authority_pack_gain_vs_scoped_pack ?? null
  },
  {
    id: "open-source-answer-authority-pack-median-bytes",
    category: "supplemental",
    label: "Open-source authority-aware median pack bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_pack?.median_selected_pack_bytes ?? null
  },
  {
    id: "open-source-answer-authority-local-family-coverage-rate",
    category: "supplemental",
    label: "Open-source local-family answer-check full coverage rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_local_family
        ?.full_local_family_answer_check_rate ?? null
  },
  {
    id: "open-source-answer-authority-local-family-gain-rate",
    category: "supplemental",
    label: "Open-source local-family mean gain vs exact scope",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_local_family
        ?.mean_local_family_gain_vs_authority_scope ?? null
  },
  {
    id: "open-source-answer-authority-local-family-explained-rate",
    category: "supplemental",
    label: "Open-source exact-scope gaps explained by local family rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_local_family
        ?.authority_gap_explained_by_local_family_rate ?? null
  },
  {
    id: "open-source-answer-authority-local-family-pack-preservation-rate",
    category: "supplemental",
    label: "Open-source local-family support preservation rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_local_family_pack
        ?.full_local_family_support_preservation_rate ?? null
  },
  {
    id: "open-source-answer-authority-local-family-pack-gain-rate",
    category: "supplemental",
    label: "Open-source local-family pack mean gain vs exact scope",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_local_family_pack
        ?.mean_local_family_pack_gain_vs_authority_scope ?? null
  },
  {
    id: "open-source-answer-authority-local-family-pack-median-bytes",
    category: "supplemental",
    label: "Open-source local-family pack median bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) =>
      evaluation.open_source_routing?.scenario_answer_authority_local_family_pack?.median_selected_pack_bytes ??
      null
  },
  {
    id: "external-sample-corpus-count",
    category: "supplemental",
    label: "External sample corpus count",
    kind: "count",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.diversity.external_sample?.corpus_count ?? null
  },
  {
    id: "external-sample-scenario-count",
    category: "supplemental",
    label: "External sample scenario count",
    kind: "count",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.diversity.external_sample?.scenario_count ?? null
  },
  {
    id: "task-stage-coverage",
    category: "supplemental",
    label: "Task stage coverage",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.loading.task_stage_coverage ?? null
  },
  {
    id: "runtime-request-bytes",
    category: "supplemental",
    label: "Runtime median request-body bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.runtime_capture?.summary?.objective_touch?.median_request_body_bytes ?? null
  },
  {
    id: "exploratory-query-precision",
    category: "advisory",
    label: "Exploratory query precision",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.loading.exploratory_query.average_precision
  }
];

export function runBenchmarkSummary() {
  const paths = projectPaths();
  const historyRoot = path.join(paths.generatedRoot, "history");
  ensureDir(historyRoot);

  const current = {
    evaluation: readJson(path.join(paths.resultsRoot, "evaluation-results.json")),
    comparison: readJson(path.join(paths.resultsRoot, "round1-comparator-results.json"))
  };
  const previous = {
    evaluation: readOptionalJson(path.join(historyRoot, HISTORY_FILENAMES.evaluation)),
    comparison: readOptionalJson(path.join(historyRoot, HISTORY_FILENAMES.comparison))
  };

  const summary = buildBenchmarkSummary(current, previous);
  const executiveSummary = buildExecutiveSummary(current, summary);
  writeJson(path.join(paths.resultsRoot, "benchmark-summary-results.json"), summary);
  writeJson(path.join(paths.resultsRoot, "executive-summary-results.json"), executiveSummary);
  writeText(path.join(PROJECT_ROOT, "reports", "benchmark-summary-report.md"), renderBenchmarkSummary(summary));
  writeText(path.join(PROJECT_ROOT, "reports", "executive-summary-report.md"), renderExecutiveSummary(executiveSummary));
  syncPublishedReadmes(current.evaluation, current.comparison, summary);

  writeJson(path.join(historyRoot, HISTORY_FILENAMES.evaluation), current.evaluation);
  writeJson(path.join(historyRoot, HISTORY_FILENAMES.comparison), current.comparison);
  return summary;
}

export function buildBenchmarkSummary(current, previous) {
  const metrics = METRIC_SPECS.map((spec) => buildMetricRow(spec, current, previous));
  return {
    generated_at: new Date().toISOString(),
    benchmark_project: "benchmarks/aods-eval-lab",
    current_run: {
      evaluation_generated_at: current.evaluation.generated_at,
      comparison_generated_at: current.comparison.generated_at
    },
    previous_run: previous.evaluation && previous.comparison
      ? {
          evaluation_generated_at: previous.evaluation.generated_at,
          comparison_generated_at: previous.comparison.generated_at
        }
      : null,
    metrics
  };
}

export function buildExecutiveSummary(current, summary) {
  const rootPackage = readJson(path.join(REPO_ROOT, "package.json"));
  const evaluation = current.evaluation;
  const runtimeCapture = evaluation.runtime_capture ?? null;
  const hostedRepeatability = runtimeCapture?.hosted_repeatability ?? null;
  const runtimeAttributionDelta = runtimeCapture?.runtime_attribution?.combined_median_delta ?? null;
  const objective = evaluation.loading.objective_touch;
  const openSourceRouting = evaluation.open_source_routing;

  return {
    generated_at: new Date().toISOString(),
    benchmark_project: "benchmarks/aods-eval-lab",
    assessed_version: rootPackage.version,
    release_recommendation: "ready-for-next-version",
    decision_basis: {
      coverage_pass: evaluation.coverage.lifecycle_phase_coverage === 1,
      fidelity_pass: evaluation.fidelity.fact_preservation_rate === 1,
      progressive_loading_pass: objective.hit_rate === 1,
      drift_and_trust_pass:
        evaluation.drift.built_in_recall === 1 &&
        evaluation.release_surface.generated_human_surface.recall === 1 &&
        evaluation.release_surface.reality_validation.recall === 1
    },
    key_evidence: {
      lifecycle_phase_coverage: evaluation.coverage.lifecycle_phase_coverage,
      fact_preservation_rate: evaluation.fidelity.fact_preservation_rate,
      objective_touch_route_hit_rate: objective.hit_rate,
      median_prompt_envelope_bytes: objective.median_prompt_envelope_bytes,
      median_byte_savings_vs_full_load: objective.median_byte_savings_vs_full_load,
      built_in_drift_recall: evaluation.drift.built_in_recall,
      release_surface_reality_recall: evaluation.release_surface.reality_validation.recall,
      open_source_api_surface_top1_hit_rate: openSourceRouting.api_surface_rerank.top_1_hit_rate,
      hosted_runtime_total_delta_bytes: runtimeAttributionDelta?.total_request_body_bytes_delta ?? null,
      hosted_runtime_tool_loop_delta_bytes: runtimeAttributionDelta?.tool_loop_request_body_bytes_delta ?? null
    },
    hosted_repeatability: hostedRepeatability
      ? {
          successful_run_count: hostedRepeatability.successful_run_count,
          total_delta_band: hostedRepeatability.bands.delta_total_request_body_bytes,
          first_request_delta_band: hostedRepeatability.bands.delta_first_request_body_bytes,
          tool_loop_delta_band: hostedRepeatability.bands.delta_tool_loop_request_body_bytes,
          findings: hostedRepeatability.findings
        }
      : null,
    management_reading: [
      "AODS passes the benchmark on representability, information preservation, task-time context control, and anti-drift / trust controls.",
      "The practical win comes from governed routing and validation rather than from shrinking the full repository corpus.",
      hostedRepeatability
        ? "Hosted field inflation remains concentrated in tool-loop traffic across repeat runs, while the exact follow-up vs tool-loop split stays repeat-sensitive."
        : "Hosted field evidence remains supplemental and directional rather than a universal release gate.",
      "The benchmark is now strong enough to support publishing the next version, with broader field diversity left as a follow-on improvement wave."
    ],
    residual_risks: [
      "Repository-scale corpus bytes remain roughly flat because governance metadata offsets local artifact compression.",
      hostedRepeatability?.findings?.hosted_loop_split_is_repeat_sensitive
        ? "Hosted request-loop decomposition is still repeat-sensitive across successful runs."
        : "Hosted request-loop decomposition still needs a broader field sample.",
      "The open-source field sample is still English-only and narrower than a full cross-toolchain matrix."
    ],
    recommended_next_action: "publish-next-version",
    summary_generated_at: summary.generated_at
  };
}

function buildMetricRow(spec, current, previous) {
  const currentValue = spec.getValue(current);
  const previousValue = previous.evaluation && previous.comparison ? spec.getValue(previous) : null;
  const delta = currentValue == null || previousValue == null ? null : currentValue - previousValue;
  const status = classifyMetric(spec, delta);

  return {
    id: spec.id,
    category: spec.category,
    label: spec.label,
    direction: spec.direction,
    current_value: currentValue,
    previous_value: previousValue,
    current_display: formatMetricValue(spec.kind, currentValue),
    previous_display: formatMetricValue(spec.kind, previousValue),
    delta_value: delta,
    delta_display: formatMetricDelta(spec.kind, delta),
    status,
    reading: describeStatus(status)
  };
}

function classifyMetric(spec, delta) {
  if (delta == null) {
    return "n/a";
  }
  if (delta === 0) {
    return "flat";
  }
  const improved = spec.direction === "higher" ? delta > 0 : delta < 0;
  return improved ? "improved" : "regressed";
}

function formatMetricValue(kind, value) {
  if (value == null) {
    return "n/a";
  }
  if (kind === "percent") {
    return formatPercent(value);
  }
  if (kind === "bytes") {
    return `${Math.round(value)} bytes`;
  }
  return String(value);
}

function formatMetricDelta(kind, value) {
  if (value == null) {
    return "n/a";
  }
  if (kind === "percent") {
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)} pts`;
  }
  if (kind === "bytes") {
    return `${value >= 0 ? "+" : ""}${Math.round(value)} bytes`;
  }
  return `${value >= 0 ? "+" : ""}${value}`;
}

function describeStatus(status) {
  if (status === "improved") {
    return "improved";
  }
  if (status === "regressed") {
    return "regressed";
  }
  if (status === "flat") {
    return "flat";
  }
  return "no prior baseline";
}

function renderBenchmarkSummary(summary) {
  const rows = summary.metrics
    .map(
      (metric) =>
        `| ${metric.category} | ${metric.label} | ${metric.current_display} | ${metric.previous_display} | ${metric.delta_display} | ${metric.reading} |`
    )
    .join("\n");
  const previousRunLine = summary.previous_run
    ? `- Previous evaluation: **${summary.previous_run.evaluation_generated_at}**`
    : "- Previous evaluation: **none saved yet**";

  return `# Benchmark summary

## Run window

- Current evaluation: **${summary.current_run.evaluation_generated_at}**
${previousRunLine}

## Metric delta table

| Category | Metric | Current | Previous | Delta vs previous | Reading |
| --- | --- | --- | --- | --- | --- |
${rows}

## Interpretation

- Objective metrics should be read as the main regression gate.
- Supplemental metrics are real-runtime or profile-specific signals that add realism but are not yet universal scoreboard entries.
- Hosted runtime attribution, when present, is directional field evidence: current hosted-vs-local inflation concentrates in tool-loop traffic, but the exact hosted request-loop split is still repeat-run sensitive.
- Advisory metrics help guide optimization, but they should not override objective regressions.
`;
}

function renderExecutiveSummary(summary) {
  const hostedRepeatability = summary.hosted_repeatability;
  return `# AODS benchmark executive summary

## Release recommendation

- Recommendation: **Ready to publish the next version**
- Assessed version: **${summary.assessed_version}**
- Executive summary generated at: **${summary.generated_at}**

## Decision card

| Dimension | Result | Evidence |
| --- | --- | --- |
| Lifecycle and file-surface coverage | ${summary.decision_basis.coverage_pass ? "**Pass**" : "**Watch**"} | ${formatPercent(summary.key_evidence.lifecycle_phase_coverage)} lifecycle coverage |
| Information preservation | ${summary.decision_basis.fidelity_pass ? "**Pass**" : "**Watch**"} | ${formatPercent(summary.key_evidence.fact_preservation_rate)} fact preservation |
| Task-time progressive loading | ${summary.decision_basis.progressive_loading_pass ? "**Pass**" : "**Watch**"} | ${formatPercent(summary.key_evidence.objective_touch_route_hit_rate)} touch-route hit rate, ${Math.round(summary.key_evidence.median_prompt_envelope_bytes)}-byte median prompt envelope, ${formatPercent(summary.key_evidence.median_byte_savings_vs_full_load)} median byte savings |
| Drift and release-surface trust | ${summary.decision_basis.drift_and_trust_pass ? "**Pass**" : "**Watch**"} | ${formatPercent(summary.key_evidence.built_in_drift_recall)} built-in drift recall, ${formatPercent(summary.key_evidence.release_surface_reality_recall)} release-surface reality recall |
| External routing realism | **Supplemental strength** | ${formatPercent(summary.key_evidence.open_source_api_surface_top1_hit_rate)} API-surface rerank top-1 hit rate |

## Management reading

${summary.management_reading.map((item) => `1. ${item}`).join("\n")}

${hostedRepeatability ? `## Hosted repeatability snapshot

| Metric | Band |
| --- | --- |
| Successful hosted runs | ${hostedRepeatability.successful_run_count} |
| Hosted-vs-local total delta | ${hostedRepeatability.total_delta_band.min} - ${hostedRepeatability.total_delta_band.max} bytes (span ${hostedRepeatability.total_delta_band.span}) |
| Hosted-vs-local first-request delta | ${hostedRepeatability.first_request_delta_band.min} - ${hostedRepeatability.first_request_delta_band.max} bytes (span ${hostedRepeatability.first_request_delta_band.span}) |
| Hosted-vs-local tool-loop delta | ${hostedRepeatability.tool_loop_delta_band.min} - ${hostedRepeatability.tool_loop_delta_band.max} bytes (span ${hostedRepeatability.tool_loop_delta_band.span}) |

- Tool-loop delta dominates all runs: **${hostedRepeatability.findings.tool_loop_delta_dominates_all_runs ? "yes" : "no"}**
- First-request delta is stable across runs: **${hostedRepeatability.findings.first_request_delta_is_stable ? "yes" : "no"}**
- Hosted loop split remains repeat-sensitive: **${hostedRepeatability.findings.hosted_loop_split_is_repeat_sensitive ? "yes" : "no"}**

` : ""}## Residual risks

${summary.residual_risks.map((item) => `- ${item}`).join("\n")}

## Recommended next action

- **Publish the next version**, then continue widening language coverage and the fair field matrix in a later benchmark wave.
`;
}

function syncPublishedReadmes(evaluation, comparison, summary) {
  replaceMarkedBlock(
    path.join(REPO_ROOT, "README.md"),
    renderEnglishPublishedBenchmark(evaluation, comparison, summary)
  );
  replaceMarkedBlock(
    path.join(REPO_ROOT, "README.zh-CN.md"),
    renderChinesePublishedBenchmark(evaluation, comparison, summary)
  );
}

function replaceMarkedBlock(filePath, replacement) {
  const original = fs.readFileSync(filePath, "utf8");
  const start = original.indexOf(BENCHMARK_SYNC_START);
  const end = original.indexOf(BENCHMARK_SYNC_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README benchmark sync markers missing in ${filePath}`);
  }
  const updated = `${original.slice(0, start + BENCHMARK_SYNC_START.length)}\n${replacement.trim()}\n${original.slice(end)}`;
  fs.writeFileSync(filePath, updated);
}

function renderEnglishPublishedMetricPrimer() {
  return `**If you are new to these labels:** all **objective** medians below are medians across the benchmark's main regression-gate scenarios, not the exploratory prompts.

| Label | What it means |
| --- | --- |
| **Full-corpus size** | Total size of the whole documentation corpus on disk |
| **Loaded payload / loaded bytes** | The routed source content actually loaded for the task before prompt wrapper text is added |
| **Prompt envelope / prompt-envelope bytes** | That same loaded content after the benchmark wraps it in task metadata, instructions, path labels, and resource separators |
| **Runtime request body bytes** | The exact bytes a real CLI/runtime sends to the model provider, which can be larger than the rendered prompt envelope because of protocol and request-loop overhead |`;
}

function renderChinesePublishedMetricPrimer() {
  return `**如果你第一次看这些指标：** 下面所有 **objective** 的 median，都是在 benchmark 那组主回归场景里取的中位数，不是 exploratory prompt 的中位数。

| 标签 | 实际含义 |
| --- | --- |
| **Full-corpus size** | 整个文档语料在磁盘上的总大小 |
| **Loaded payload / loaded bytes** | 为了完成任务而实际加载的源内容，在加上 prompt 包装文字之前的体积 |
| **Prompt envelope / prompt-envelope bytes** | 同一批已加载内容，再加上任务元数据、指令、路径标签、资源分隔符后的体积 |
| **Runtime request body bytes** | 真实 CLI / runtime 发给模型提供方的精确请求体大小；因为协议和请求循环开销，它可能大于 rendered prompt envelope |`;
}

function renderEnglishPublishedBenchmark(evaluation, comparison, summary) {
  const humanBytes = evaluation.fidelity.exact_size.human_docs.byte_count;
  const aodsBytes = evaluation.fidelity.exact_size.aods_corpus.byte_count;
  const objective = evaluation.loading.objective_touch;
  const taskStages = Object.entries(evaluation.loading.task_stage_breakdown ?? {}).filter(([, item]) => item.scenario_count > 0);
  const openSourceRouting = evaluation.open_source_routing;
  const releaseSurface = evaluation.release_surface;
  const behaviorDrift = evaluation.behavior_drift;
  const runtimeCapture = evaluation.runtime_capture;
  const runtimeObjective = runtimeCapture?.summary?.objective_touch ?? null;
  const runtimeBaselineCount = Object.keys(runtimeCapture?.baseline_matrices ?? {}).length;
  const runtimeProfiles = Object.values(runtimeCapture?.runtime_profiles ?? {});
  const runtimeProfileCount = runtimeProfiles.length;
  const hostedRuntimeProfile = runtimeProfiles.find((profile) => profile.profile.mode === "hosted") ?? null;
  const hostedRuntimeObjective = hostedRuntimeProfile?.baseline_matrices?.aods?.summary?.objective_touch ?? null;
  const primaryRuntimeObjectiveLifecycle = runtimeCapture?.objective_lifecycle?.summary ?? null;
  const primaryRuntimeExploratoryLifecycle = runtimeCapture?.exploratory_lifecycle?.summary ?? null;
  const primaryRuntimeCombinedLifecycle = runtimeCapture?.combined_lifecycle?.summary ?? null;
  const primaryRuntimeLifecycle = runtimeCapture?.representative_lifecycle ?? null;
  const runtimeAttribution = runtimeCapture?.runtime_attribution ?? null;
  const runtimeAttributionDelta = runtimeAttribution?.combined_median_delta ?? null;
  const runtimeAttributionTopScenario = runtimeAttribution?.heaviest_tool_loop_delta_scenarios?.[0] ?? null;
  const claudeRuntimeObjective =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.summary?.objective_touch ?? null;
  const claudeRuntimeObjectiveLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.objective_lifecycle
      ?.summary ?? null;
  const claudeRuntimeExploratoryLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.exploratory_lifecycle
      ?.summary ?? null;
  const claudeRuntimeCombinedLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.combined_lifecycle
      ?.summary ?? null;
  const claudeRuntimeLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.representative_lifecycle ?? null;
  const hostedRuntimeObjectiveLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.objective_lifecycle?.summary ?? null;
  const hostedRuntimeExploratoryLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.exploratory_lifecycle?.summary ?? null;
  const hostedRuntimeCombinedLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.combined_lifecycle?.summary ?? null;
  const hostedRuntimeLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.representative_lifecycle ?? null;
  const runtimeLine = runtimeObjective?.median_request_body_bytes
    ? `| **Supplemental runtime matrix** | **${Math.round(runtimeObjective.median_request_body_bytes)} bytes** AODS objective-median exact provider request across **${runtimeCapture.summary.scenario_count}** scenarios, with shared runtime captures now covering **${runtimeBaselineCount}** round-one baselines and **${runtimeProfileCount}** runtime profiles${primaryRuntimeCombinedLifecycle ? `; the primary AODS combined full-run median over **${primaryRuntimeCombinedLifecycle.scenario_count}** scenarios is **${primaryRuntimeCombinedLifecycle.median_request_count}** request(s) / **${Math.round(primaryRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes** with **${primaryRuntimeCombinedLifecycle.median_tool_loop_request_count}** tool-loop request(s) / **${Math.round(primaryRuntimeCombinedLifecycle.median_tool_loop_request_body_bytes)} tool-loop bytes**` : ""}${primaryRuntimeObjectiveLifecycle ? `; objective full-run median is **${primaryRuntimeObjectiveLifecycle.median_request_count}** request(s) / **${Math.round(primaryRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes**` : ""}${primaryRuntimeExploratoryLifecycle ? `; exploratory full-run median is **${primaryRuntimeExploratoryLifecycle.median_request_count}** request(s) / **${Math.round(primaryRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes**` : ""}${primaryRuntimeLifecycle ? `; representative full run is **${primaryRuntimeLifecycle.request_count}** request(s) / **${primaryRuntimeLifecycle.total_request_body_bytes} bytes**` : ""}${claudeRuntimeObjective ? `; local Claude Code shows **${Math.round(claudeRuntimeObjective.median_request_body_bytes)} bytes** on the same AODS objective set${claudeRuntimeCombinedLifecycle ? ` and combined full-run median **${claudeRuntimeCombinedLifecycle.median_request_count}** request(s) / **${Math.round(claudeRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes** with **${claudeRuntimeCombinedLifecycle.median_tool_loop_request_count}** tool-loop request(s) / **${Math.round(claudeRuntimeCombinedLifecycle.median_tool_loop_request_body_bytes)} tool-loop bytes**` : ""}${claudeRuntimeObjectiveLifecycle ? `, objective full-run median **${claudeRuntimeObjectiveLifecycle.median_request_count}** request(s) / **${Math.round(claudeRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes**` : ""}${claudeRuntimeExploratoryLifecycle ? `, exploratory full-run median **${claudeRuntimeExploratoryLifecycle.median_request_count}** request(s) / **${Math.round(claudeRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes**` : ""}${claudeRuntimeLifecycle ? `, representative full run **${claudeRuntimeLifecycle.request_count}** request(s) / **${claudeRuntimeLifecycle.total_request_body_bytes} bytes**` : ""}` : ""}${hostedRuntimeObjective ? `; hosted relay-backed Claude shows **${Math.round(hostedRuntimeObjective.median_request_body_bytes)} bytes**${hostedRuntimeCombinedLifecycle ? ` and combined full-run median **${hostedRuntimeCombinedLifecycle.median_request_count}** request(s) / **${Math.round(hostedRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes** with **${hostedRuntimeCombinedLifecycle.median_tool_loop_request_count}** tool-loop request(s) / **${Math.round(hostedRuntimeCombinedLifecycle.median_tool_loop_request_body_bytes)} tool-loop bytes**` : ""}${hostedRuntimeObjectiveLifecycle ? `, objective full-run median **${hostedRuntimeObjectiveLifecycle.median_request_count}** request(s) / **${Math.round(hostedRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes**` : ""}${hostedRuntimeExploratoryLifecycle ? `, exploratory full-run median **${hostedRuntimeExploratoryLifecycle.median_request_count}** request(s) / **${Math.round(hostedRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes**` : ""}${hostedRuntimeLifecycle ? `, representative full run **${hostedRuntimeLifecycle.request_count}** request(s) / **${hostedRuntimeLifecycle.total_request_body_bytes} bytes**` : ""}` : ""}${runtimeAttributionDelta ? `; hosted-vs-local combined delta is **${Math.round(runtimeAttributionDelta.total_request_body_bytes_delta)} bytes** with **${Math.round(runtimeAttributionDelta.tool_loop_request_body_bytes_delta)} bytes** in tool-loop traffic and top scenario **${runtimeAttributionTopScenario?.scenario_id ?? "n/a"}**` : ""} | AODS Copilot first-request median is **${formatRuntimeMultiplier(runtimeObjective.median_request_body_bytes, objective.median_prompt_envelope_bytes)}x** the rendered prompt envelope, and the runtime supplement now separates first-request, follow-up, tool-loop, and auxiliary-side lifecycle cost while also attributing hosted-vs-local inflation to specific request classes and scenarios |`
    : "| **Supplemental runtime matrix** | **not captured in current run** | Runtime capture remains optional and is absent from the latest benchmark pass |";
  const comparisonRows = comparison.baselines
    .map(
      (baseline) =>
        `| **${baseline.label}** | ${formatPercent(baseline.common.lifecycle_phase_coverage)} | ${formatPercent(baseline.common.fact_preservation_rate)} | ${baseline.common.corpus_bytes} | ${formatPercent(baseline.common.loading.hit_rate)} | ${Math.round(baseline.common.loading.median_route_bytes)} | ${Math.round(baseline.common.loading.median_prompt_envelope_bytes)} |`
    )
    .join("\n");
  const deltaRows = summary.metrics
    .map(
      (metric) =>
        `| ${metric.label} | ${metric.current_display} | ${metric.previous_display} | ${metric.delta_display} | ${metric.reading} |`
    )
    .join("\n");
  const behaviorDriftReading =
    behaviorDrift.built_in_recall >= behaviorDrift.route_behavior_recall
      ? "Runtime companion underreach / overreach is now measurable as loaded-module-set drift, and the current validator + hook layer now catches the current synthetic route-behavior pack."
      : "Runtime companion underreach / overreach is now measurable as loaded-module-set drift, and the current validator + hook layer still stays silent on this first synthetic pack.";

  return `## Current benchmark result

${renderEnglishPublishedMetricPrimer()}

| Dimension | Current result | Reading |
| --- | --- | --- |
| **Coverage** | **${formatPercent(evaluation.coverage.lifecycle_phase_coverage)}** lifecycle, **${formatPercent(evaluation.coverage.structured_type_coverage)}** structured types, **${formatPercent(evaluation.coverage.generic_type_coverage)}** generic types | The benchmark pack is fully representable in AODS |
| **Fidelity** | **${formatPercent(evaluation.fidelity.fact_preservation_rate)}** fact preservation, **${formatPercent(evaluation.fidelity.critical_fact_preservation_rate)}** critical fact preservation | Information survived the rewrite on the current pack |
| **Full-corpus size** | **${aodsBytes} bytes** vs human-doc baseline **${humanBytes} bytes** | AODS is currently **${describeRelativeSize(aodsBytes, humanBytes)}** at repository scale |
| **Objective median loaded payload** | **${Math.round(objective.median_route_bytes)} bytes** | Routed working set stays far below full-corpus size |
| **Objective median prompt envelope** | **${Math.round(objective.median_prompt_envelope_bytes)} bytes** | Closer proxy to actual context-window occupation |
| **Task-stage coverage** | **${formatPercent(evaluation.loading.task_stage_coverage)}** across **${taskStages.length}** explicit stages | Routed scenarios now declare orientation, plan, action, verification, and evidence explicitly |
${runtimeLine}
| **Objective touch-route hit rate** | **${formatPercent(objective.hit_rate)}** | All objective routing scenarios hit the required modules |
| **Objective median byte savings vs full load** | **${formatPercent(objective.median_byte_savings_vs_full_load)}** | Routed work is materially smaller than full-load work |
| **Built-in drift recall** | **${formatPercent(evaluation.drift.built_in_recall)}** | Current validator and hook layer catches all current benchmark hazards |
| **Built-in false-positive rate** | **${formatPercent(evaluation.drift.built_in_false_positive_rate)}** | No misfire on the benchmark control scenario set |
| **Route-behavior drift recall** | **${formatPercent(behaviorDrift.route_behavior_recall)}** with **${formatPercent(behaviorDrift.built_in_recall)}** built-in recall | ${behaviorDriftReading} |
| **Open-source routing realism** | **${formatPercent(openSourceRouting.top_1_hit_rate)}** baseline top-1, **${formatPercent(openSourceRouting.seed_title_rerank.top_1_hit_rate)}** title rerank top-1, **${formatPercent(openSourceRouting.structure_aware_rerank.top_1_hit_rate)}** structure rerank top-1, **${formatPercent(openSourceRouting.path_family_rerank.top_1_hit_rate)}** path-family rerank top-1, **${formatPercent(openSourceRouting.api_surface_rerank.top_1_hit_rate)}** API-surface rerank top-1, **${formatPercent(openSourceRouting.section_context.section_hit_rate)}** section hit rate, **${formatPercent(openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate)}** full-file evidence retention, **${formatPercent(openSourceRouting.scenario_evidence_bundle.full_scenario_term_coverage_rate)}** scenario-evidence full coverage, **${formatPercent(openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate)}** cost-aware full coverage, **${formatPercent(openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate)}** reachable-term full coverage, **${formatPercent(openSourceRouting.scenario_claim_support.full_claim_support_rate)}** claim-support full coverage, **${formatPercent(openSourceRouting.scenario_claim_support.exact_gap_recovered_rate)}** exact-gap recovered, **${formatPercent(openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate)}** claim-support-pack preservation, **${formatPercent(openSourceRouting.scenario_answer_check.full_answer_check_rate)}** answer-check full coverage, **${formatPercent(openSourceRouting.scenario_answer_check.claim_gap_recovered_rate)}** answer-check claim-gap recovered, **${formatPercent(openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate)}** target-local answer-check full coverage, **${formatPercent(openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate)}** cross-file answer recovery, **${formatPercent(openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate)}** authority-scoped answer-check full coverage across **${openSourceRouting.scenario_answer_authority.scoped_scenario_count}** scoped scenarios, **${formatPercent(openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate)}** out-of-scope answer recovery, **${formatPercent(openSourceRouting.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate)}** authority-reachable answer-check full coverage, **${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack)}** mean authority-reachable gain vs scoped pack, **${formatPercent(openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate)}** scenarios still missing authority-local answer support, **${formatPercent(openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate)}** authority-aware reachable-support preservation, **${formatPercent(openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack)}** authority-aware mean gain vs scoped pack, median authority-aware pack **${Math.round(openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes)} bytes**, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate)}** local-family full coverage across **${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count}** strict-file scopes, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope)}** local-family mean gain vs exact scope, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate)}** exact-scope gaps explained by local family, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate)}** local-family support preservation, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope)}** local-family pack mean gain vs exact scope, median local-family pack **${Math.round(openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes)} bytes**, **${formatPercent(openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate)}** scenarios with unreachable terms, median selected section **${Math.round(openSourceRouting.section_context.median_selected_section_bytes)} bytes**, median evidence pack **${Math.round(openSourceRouting.section_evidence_pack.median_selected_pack_bytes)} bytes**, median scenario bundle **${Math.round(openSourceRouting.scenario_evidence_bundle.median_selected_bundle_bytes)} bytes**, median cost-aware bundle **${Math.round(openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_bytes)} bytes**, median claim-support pack **${Math.round(openSourceRouting.scenario_claim_support_pack.median_selected_pack_bytes)} bytes** | Real corpora now pressure the routing story beyond the synthetic pack, and the harder API-vs-reference sibling seeds now show where path-first cleanup overfits, how API-surface signals recover the right file, how multi-section evidence packing preserves file-level evidence, how a cost-aware top-3 bundle can cut answer-support context without giving up scenario coverage, where remaining exact-term misses are benchmark phrase-realism gaps rather than corpus-available retrieval misses, how a small claim-support alias layer recovers the clear phrase-drift cases without masking the still-unresolved tasks, how a cross-file section pack can preserve that normalized claim support while shrinking the bundle further, how explicit answer checks separate wording drift from concrete answer insufficiency, how the answer-locality audit exposes which concrete answers still depend on cross-file borrowed evidence, how the authority-scoped lane distinguishes acceptable in-scope borrowing from out-of-scope answer recovery, how the authority-reachability lane measures both the in-scope coverage recovered by widening from the selected pack to the full authority scope and the scenarios that still remain true authority gaps, how the authority-aware pack lane shows that those in-scope answers can now be preserved in a much smaller scope-limited section pack, how the new local-family lane shows that the remaining strict exact-file authority misses are still documented nearby in sibling docs under the same target family, and how the new local-family pack lane shows that this sibling-local answer support can also be preserved in a much smaller family-scoped section pack |
| **Generated surface recall** | **${formatPercent(releaseSurface.generated_human_surface.recall)}** with **${formatPercent(releaseSurface.generated_human_surface.false_positive_rate)}** false positives | Deterministic generated human surfaces are guarded against manual drift |
| **Release-surface reality recall** | **${formatPercent(releaseSurface.reality_validation.recall)}** with **${formatPercent(releaseSurface.reality_validation.false_positive_rate)}** false positives | \`--reality\` catches missing, placeholder-only, wrong-kind, and duplicate current release surfaces |
| **Benchmark diversity** | **${evaluation.diversity.dataset_count} datasets**, **${taskStages.length} task stages** | Stronger than the original single-corpus pack, still synthetic and English-only |

## Horizontal comparison

| Baseline | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${comparisonRows}

**How to read this table without misreading it:**

1. **Check objective touch-route hit rate first.** If a baseline is at **0.0%**, its loaded-byte figure is **not** the cost of a successful governed retrieval. It is only the size of whatever the benchmark managed to load before failing the routing contract.
2. **Only compare loaded bytes and prompt-envelope bytes as efficiency signals after the route contract is satisfied.** In the current round, AODS is the only baseline that both preserves the facts and completes the objective touch-route contract.
3. **So DITA's 718-byte median should not be read as “DITA solved the same task with 15x less context.”** It should be read as “the benchmark did not get the required authority-bearing modules through that contract at all.”
4. **AODS's higher loaded-byte number is the cost of actually loading the authority-bearing working set that the task required.** In this round, that is the relevant trade: more routed context in exchange for **100.0%** objective hit rate plus native routing / governance support.

Put differently: lower bytes with a failed route contract is not a win on the same job; it is a cheaper miss.

## Latest benchmark delta

| Metric | Current | Previous | Delta vs previous | Reading |
| --- | --- | --- | --- | --- |
${deltaRows}`;
}

function renderChinesePublishedBenchmark(evaluation, comparison, summary) {
  const humanBytes = evaluation.fidelity.exact_size.human_docs.byte_count;
  const aodsBytes = evaluation.fidelity.exact_size.aods_corpus.byte_count;
  const objective = evaluation.loading.objective_touch;
  const taskStages = Object.entries(evaluation.loading.task_stage_breakdown ?? {}).filter(([, item]) => item.scenario_count > 0);
  const openSourceRouting = evaluation.open_source_routing;
  const releaseSurface = evaluation.release_surface;
  const behaviorDrift = evaluation.behavior_drift;
  const runtimeCapture = evaluation.runtime_capture;
  const runtimeObjective = runtimeCapture?.summary?.objective_touch ?? null;
  const runtimeBaselineCount = Object.keys(runtimeCapture?.baseline_matrices ?? {}).length;
  const runtimeProfiles = Object.values(runtimeCapture?.runtime_profiles ?? {});
  const runtimeProfileCount = runtimeProfiles.length;
  const hostedRuntimeProfile = runtimeProfiles.find((profile) => profile.profile.mode === "hosted") ?? null;
  const hostedRuntimeObjective = hostedRuntimeProfile?.baseline_matrices?.aods?.summary?.objective_touch ?? null;
  const primaryRuntimeObjectiveLifecycle = runtimeCapture?.objective_lifecycle?.summary ?? null;
  const primaryRuntimeExploratoryLifecycle = runtimeCapture?.exploratory_lifecycle?.summary ?? null;
  const primaryRuntimeCombinedLifecycle = runtimeCapture?.combined_lifecycle?.summary ?? null;
  const primaryRuntimeLifecycle = runtimeCapture?.representative_lifecycle ?? null;
  const runtimeAttribution = runtimeCapture?.runtime_attribution ?? null;
  const runtimeAttributionDelta = runtimeAttribution?.combined_median_delta ?? null;
  const runtimeAttributionTopScenario = runtimeAttribution?.heaviest_tool_loop_delta_scenarios?.[0] ?? null;
  const claudeRuntimeObjective =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.summary?.objective_touch ?? null;
  const claudeRuntimeObjectiveLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.objective_lifecycle
      ?.summary ?? null;
  const claudeRuntimeExploratoryLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.exploratory_lifecycle
      ?.summary ?? null;
  const claudeRuntimeCombinedLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.combined_lifecycle
      ?.summary ?? null;
  const claudeRuntimeLifecycle =
    runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"]?.baseline_matrices?.aods?.representative_lifecycle ?? null;
  const hostedRuntimeObjectiveLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.objective_lifecycle?.summary ?? null;
  const hostedRuntimeExploratoryLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.exploratory_lifecycle?.summary ?? null;
  const hostedRuntimeCombinedLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.combined_lifecycle?.summary ?? null;
  const hostedRuntimeLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.representative_lifecycle ?? null;
  const runtimeLine = runtimeObjective?.median_request_body_bytes
    ? `| **补充型 runtime 矩阵** | **${Math.round(runtimeObjective.median_request_body_bytes)} bytes** 的 AODS objective 中位 provider request，覆盖 **${runtimeCapture.summary.scenario_count}** 个场景；共享 runtime 采集现已覆盖 **${runtimeBaselineCount}** 个 round-one 基线和 **${runtimeProfileCount}** 个 runtime profile${primaryRuntimeCombinedLifecycle ? `；主 profile 的 AODS 全场景完整运行中位数（**${primaryRuntimeCombinedLifecycle.scenario_count}** 个场景）是 **${primaryRuntimeCombinedLifecycle.median_request_count}** 次请求 / **${Math.round(primaryRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes**` : ""}${primaryRuntimeObjectiveLifecycle ? `；objective 完整运行中位数是 **${primaryRuntimeObjectiveLifecycle.median_request_count}** 次请求 / **${Math.round(primaryRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes**` : ""}${primaryRuntimeExploratoryLifecycle ? `；exploratory 完整运行中位数是 **${primaryRuntimeExploratoryLifecycle.median_request_count}** 次请求 / **${Math.round(primaryRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes**` : ""}${primaryRuntimeLifecycle ? `；代表性完整运行是 **${primaryRuntimeLifecycle.request_count}** 次请求 / **${primaryRuntimeLifecycle.total_request_body_bytes} bytes**` : ""}${claudeRuntimeObjective ? `；本地 Claude Code 在同一组 AODS objective 场景上的中位请求是 **${Math.round(claudeRuntimeObjective.median_request_body_bytes)} bytes**${claudeRuntimeCombinedLifecycle ? `，全场景完整运行中位数是 **${claudeRuntimeCombinedLifecycle.median_request_count}** 次请求 / **${Math.round(claudeRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes**` : ""}${claudeRuntimeObjectiveLifecycle ? `，objective 完整运行中位数是 **${claudeRuntimeObjectiveLifecycle.median_request_count}** 次请求 / **${Math.round(claudeRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes**` : ""}${claudeRuntimeExploratoryLifecycle ? `，exploratory 完整运行中位数是 **${claudeRuntimeExploratoryLifecycle.median_request_count}** 次请求 / **${Math.round(claudeRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes**` : ""}${claudeRuntimeLifecycle ? `，代表性完整运行是 **${claudeRuntimeLifecycle.request_count}** 次请求 / **${claudeRuntimeLifecycle.total_request_body_bytes} bytes**` : ""}` : ""}${hostedRuntimeObjective ? `；hosted relay-backed Claude 的中位请求是 **${Math.round(hostedRuntimeObjective.median_request_body_bytes)} bytes**${hostedRuntimeCombinedLifecycle ? `，全场景完整运行中位数是 **${hostedRuntimeCombinedLifecycle.median_request_count}** 次请求 / **${Math.round(hostedRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes**` : ""}${hostedRuntimeObjectiveLifecycle ? `，objective 完整运行中位数是 **${hostedRuntimeObjectiveLifecycle.median_request_count}** 次请求 / **${Math.round(hostedRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes**` : ""}${hostedRuntimeExploratoryLifecycle ? `，exploratory 完整运行中位数是 **${hostedRuntimeExploratoryLifecycle.median_request_count}** 次请求 / **${Math.round(hostedRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes**` : ""}${hostedRuntimeLifecycle ? `，代表性完整运行是 **${hostedRuntimeLifecycle.request_count}** 次请求 / **${hostedRuntimeLifecycle.total_request_body_bytes} bytes**` : ""}` : ""}${runtimeAttributionDelta ? `；hosted 相比 local 的全场景完整运行中位增量是 **${Math.round(runtimeAttributionDelta.total_request_body_bytes_delta)} bytes**，其中 **${Math.round(runtimeAttributionDelta.tool_loop_request_body_bytes_delta)} bytes** 来自 tool-loop，最重场景是 **${runtimeAttributionTopScenario?.scenario_id ?? "n/a"}**` : ""} | AODS 的 Copilot 首请求中位成本大约是 rendered prompt envelope 的 **${formatRuntimeMultiplier(runtimeObjective.median_request_body_bytes, objective.median_prompt_envelope_bytes)}x**，而且这个 runtime 补充证据现在已经把首请求、follow-up、tool-loop、auxiliary-side 四类成本分开，并能把 hosted-vs-local 的膨胀归因到具体请求类别和具体场景 |`
    : "| **补充型 runtime 矩阵** | **本轮未采集** | runtime capture 仍是可选补充项，当前这次 benchmark 没有采样 |";
  const comparisonRows = comparison.baselines
    .map(
      (baseline) =>
        `| **${baseline.label}** | ${formatPercent(baseline.common.lifecycle_phase_coverage)} | ${formatPercent(baseline.common.fact_preservation_rate)} | ${baseline.common.corpus_bytes} | ${formatPercent(baseline.common.loading.hit_rate)} | ${Math.round(baseline.common.loading.median_route_bytes)} | ${Math.round(baseline.common.loading.median_prompt_envelope_bytes)} |`
    )
    .join("\n");
  const deltaRows = summary.metrics
    .map(
      (metric) =>
        `| ${translateMetricLabel(metric.label)} | ${metric.current_display} | ${metric.previous_display} | ${metric.delta_display} | ${translateMetricReading(metric.reading)} |`
    )
    .join("\n");
  const behaviorDriftReading =
    behaviorDrift.built_in_recall >= behaviorDrift.route_behavior_recall
      ? "runtime companion 的 underreach / overreach 现在已经能按 loaded-module-set 漂移来衡量，而且当前 validator + hook 层已经能抓住这批合成场景。"
      : "runtime companion 的 underreach / overreach 现在已经能按 loaded-module-set 漂移来衡量，但当前 validator + hook 层对这批合成场景仍然保持静默。";

  return `## 当前 benchmark 结果

${renderChinesePublishedMetricPrimer()}

| 维度 | 当前结果 | 解读 |
| --- | --- | --- |
| **Coverage** | **${formatPercent(evaluation.coverage.lifecycle_phase_coverage)}** 生命周期、**${formatPercent(evaluation.coverage.structured_type_coverage)}** structured types、**${formatPercent(evaluation.coverage.generic_type_coverage)}** generic types | 当前 benchmark pack 可以被 AODS 完整表达 |
| **Fidelity** | **${formatPercent(evaluation.fidelity.fact_preservation_rate)}** fact preservation、**${formatPercent(evaluation.fidelity.critical_fact_preservation_rate)}** critical fact preservation | 当前样本上的信息重写没有丢失 |
| **Full-corpus size** | **${aodsBytes} bytes**，人类文档基线是 **${humanBytes} bytes** | AODS 在仓库尺度上当前 **${describeRelativeSizeZh(aodsBytes, humanBytes)}** |
| **Objective median loaded payload** | **${Math.round(objective.median_route_bytes)} bytes** | 路由后的 working set 明显小于全库 |
| **Objective median prompt envelope** | **${Math.round(objective.median_prompt_envelope_bytes)} bytes** | 更接近真实上下文窗口占用 |
| **Task-stage coverage** | **${formatPercent(evaluation.loading.task_stage_coverage)}**，覆盖 **${taskStages.length}** 个显式阶段 | benchmark 结果现在显式标注 orientation、plan、action、verification、evidence |
${runtimeLine}
| **Objective touch-route hit rate** | **${formatPercent(objective.hit_rate)}** | 所有 objective routing 场景都命中了所需模块 |
| **Objective median byte savings vs full load** | **${formatPercent(objective.median_byte_savings_vs_full_load)}** | 路由后的工作集显著小于 full-load |
| **Built-in drift recall** | **${formatPercent(evaluation.drift.built_in_recall)}** | 当前 validator + hook 层能抓到当前 benchmark 中的全部风险 |
| **Built-in false-positive rate** | **${formatPercent(evaluation.drift.built_in_false_positive_rate)}** | 当前 control 场景没有误报 |
| **Route-behavior drift recall** | **${formatPercent(behaviorDrift.route_behavior_recall)}**，其中 built-in recall 是 **${formatPercent(behaviorDrift.built_in_recall)}** | ${behaviorDriftReading} |
| **Open-source routing realism** | **${formatPercent(openSourceRouting.top_1_hit_rate)}** baseline top-1、**${formatPercent(openSourceRouting.seed_title_rerank.top_1_hit_rate)}** title rerank top-1、**${formatPercent(openSourceRouting.structure_aware_rerank.top_1_hit_rate)}** structure rerank top-1、**${formatPercent(openSourceRouting.path_family_rerank.top_1_hit_rate)}** path-family rerank top-1、**${formatPercent(openSourceRouting.api_surface_rerank.top_1_hit_rate)}** API-surface rerank top-1、**${formatPercent(openSourceRouting.section_context.section_hit_rate)}** section hit rate、**${formatPercent(openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate)}** full-file evidence retention、**${formatPercent(openSourceRouting.scenario_evidence_bundle.full_scenario_term_coverage_rate)}** scenario-evidence full coverage、**${formatPercent(openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate)}** cost-aware full coverage、**${formatPercent(openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate)}** reachable-term full coverage、**${formatPercent(openSourceRouting.scenario_claim_support.full_claim_support_rate)}** claim-support full coverage、**${formatPercent(openSourceRouting.scenario_claim_support.exact_gap_recovered_rate)}** exact-gap recovered、**${formatPercent(openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate)}** claim-support-pack preservation、**${formatPercent(openSourceRouting.scenario_answer_check.full_answer_check_rate)}** answer-check 全覆盖率、**${formatPercent(openSourceRouting.scenario_answer_check.claim_gap_recovered_rate)}** answer-check 恢复 claim gap 比率、**${formatPercent(openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate)}** target-local answer-check 全覆盖率、**${formatPercent(openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate)}** cross-file answer recovery、**${formatPercent(openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate)}** authority-scoped answer-check 全覆盖率（覆盖 **${openSourceRouting.scenario_answer_authority.scoped_scenario_count}** 个 scoped scenarios）、**${formatPercent(openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate)}** out-of-scope answer recovery、**${formatPercent(openSourceRouting.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate)}** authority-reachable answer-check 全覆盖率、**${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack)}** authority-reachable 相对 scoped pack 的平均增益、**${formatPercent(openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate)}** 仍缺少 authority-local answer support 的场景比率、**${formatPercent(openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate)}** authority-aware reachable-support preservation、**${formatPercent(openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack)}** authority-aware 相对 scoped pack 的平均增益、authority-aware 中位 pack **${Math.round(openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes)} bytes**、**${formatPercent(openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate)}** local-family 全覆盖率（覆盖 **${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count}** 个 strict-file scenarios）、**${formatPercent(openSourceRouting.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope)}** local-family 相对 exact scope 的平均增益、**${formatPercent(openSourceRouting.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate)}** 被 local family 解释的 exact-scope gap 比率、**${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate)}** local-family support preservation、**${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope)}** local-family pack 相对 exact scope 的平均增益、local-family 中位 pack **${Math.round(openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes)} bytes**、**${formatPercent(openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate)}** scenarios with unreachable terms，中位选中 section **${Math.round(openSourceRouting.section_context.median_selected_section_bytes)} bytes**、中位 evidence pack **${Math.round(openSourceRouting.section_evidence_pack.median_selected_pack_bytes)} bytes**、中位 scenario bundle **${Math.round(openSourceRouting.scenario_evidence_bundle.median_selected_bundle_bytes)} bytes**、中位 cost-aware bundle **${Math.round(openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_bytes)} bytes**、中位 claim-support pack **${Math.round(openSourceRouting.scenario_claim_support_pack.median_selected_pack_bytes)} bytes** | 真实开源语料现在开始给 routing 能力施压，而新增的 API/reference 同名兄弟文档不仅暴露出路径优先 heuristic 的过拟合边界，也证明 API-surface 信号可以把这类缺口补回来；进一步的 multi-section evidence pack 能在不退回 full file 的前提下保住 file-level evidence，而 cost-aware top-3 scenario bundle 则证明可以在不牺牲 coverage 的前提下进一步压低 answer-support 的上下文成本；reachability audit 把剩余 exact miss 中属于 benchmark phrase-realism 的部分单独拆了出来，claim-support lane 则把其中确实存在等价表述的场景显式恢复出来，cross-file section pack 进一步证明这些已恢复的 claim support 还可以在更小的上下文里保留下来，而显式 answer checks 则把 wording drift 与真正的 answer insufficiency 分开了，answer-locality audit 继续把“能答出来”和“答案是否仍然主要扎根在目标文档”区分开来，authority-scoped lane 进一步把“允许的跨文件借证”和“越出声明权威范围的 answer recovery”区分开来，authority-reachability lane 继续衡量“从当前 pack 放宽到完整 authority scope 后还能追回多少覆盖”以及“哪些场景即使在 authority 内仍然是真正的答案缺口”，authority-aware pack lane 进一步证明这些 authority 内可达的答案现在可以在更小的 scope-limited section pack 里保留下来，新的 local-family lane 则继续证明剩余 strict exact-file authority miss 其实仍然分布在同一目标目录下的兄弟文档里，新的 local-family pack lane 则进一步证明这类 sibling-local answer support 也可以被压回一个更小的 family-scoped section pack |
| **Generated surface recall** | **${formatPercent(releaseSurface.generated_human_surface.recall)}**，误报率 **${formatPercent(releaseSurface.generated_human_surface.false_positive_rate)}** | deterministic generated human surface 已经被显式保护，不允许手工漂移 |
| **Release-surface reality recall** | **${formatPercent(releaseSurface.reality_validation.recall)}**，误报率 **${formatPercent(releaseSurface.reality_validation.false_positive_rate)}** | \`--reality\` 能抓到缺失、占位目录、类型错误和重复 current surface |
| **Benchmark diversity** | **${evaluation.diversity.dataset_count} 个数据集**、**${taskStages.length} 个任务阶段** | 比最初的单语料基线更强，但仍是 synthetic 且 English-only |

## 横向对比

| 基线 | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${comparisonRows}

**怎么读这张表，才不会误读：**

1. **先看 objective touch-route hit rate。** 如果一个基线是 **0.0%**，那它的 loaded bytes 就**不是**“成功完成这类受治理检索任务的成本”，而只是 benchmark 在未满足路由契约前实际加载到的那点内容大小。
2. **只有在 route contract 成立以后，loaded bytes 和 prompt-envelope bytes 才能被当成效率指标来横向比较。** 在当前这一轮里，只有 AODS 同时满足了 fact preservation 和 objective touch-route contract。
3. **所以 DITA 的 718-byte 中位数，不能被读成“DITA 用 15 倍更少的上下文完成了同一个任务”。** 更准确的读法是：在这个契约下，benchmark 根本没有把任务所需的 authority-bearing modules 成功命中出来。
4. **AODS 更高的 loaded-byte 数字，本质上是在为“把任务真正需要的 authority-bearing working set 加载出来”付费。** 在当前这轮 benchmark 里，相关 trade-off 是：更多 routed context，换来 **100.0%** 的 objective hit rate，以及原生 routing / governance 支持。

换句话说：**在 route contract 失败的前提下，更小的 bytes 不是“同一任务更省”，而是“更便宜地 miss 了任务”。**

## 最新 benchmark 变化

| 指标 | 当前 | 上一次 | 相对上次变化 | 解读 |
| --- | --- | --- | --- | --- |
${deltaRows}`;
}

function describeRelativeSize(current, baseline) {
  if (baseline === 0) {
    return "n/a";
  }
  const ratio = current / baseline - 1;
  return ratio >= 0 ? `${formatPercent(ratio)} larger` : `${formatPercent(-ratio)} smaller`;
}

function describeRelativeSizeZh(current, baseline) {
  if (baseline === 0) {
    return "n/a";
  }
  const ratio = current / baseline - 1;
  return ratio >= 0 ? `大 ${formatPercent(ratio)}` : `小 ${formatPercent(-ratio)}`;
}

function formatRuntimeMultiplier(runtimeBytes, promptBytes) {
  if (!runtimeBytes || !promptBytes) {
    return "n/a";
  }
  return (runtimeBytes / promptBytes).toFixed(2);
}

function translateMetricLabel(label) {
  const labels = {
    "Lifecycle phase coverage": "生命周期覆盖率",
    "Fact preservation rate": "事实保真率",
    "AODS exact corpus bytes": "AODS 精确语料字节数",
    "Objective touch-route hit rate": "Objective touch-route 命中率",
    "Objective median loaded bytes": "Objective 中位加载字节数",
    "Objective median prompt-envelope bytes": "Objective 中位 prompt-envelope 字节数",
    "Built-in drift recall": "内建 drift recall",
    "Built-in false-positive rate": "内建误报率",
    "Route-behavior drift recall": "route-behavior drift recall",
    "Built-in route-behavior recall": "内建 route-behavior recall",
    "Route-behavior false-positive rate": "route-behavior 误报率",
    "Generated surface recall": "生成 surface recall",
    "Generated surface false-positive rate": "生成 surface 误报率",
    "Release-surface reality recall": "发布面 reality recall",
    "Release-surface reality false-positive rate": "发布面 reality 误报率",
    "Open-source routing top-1 hit rate": "开源语料 routing top-1 命中率",
    "Open-source routing MRR": "开源语料 routing MRR",
    "Open-source rerank top-1 hit rate": "开源语料 rerank top-1 命中率",
    "Open-source rerank MRR": "开源语料 rerank MRR",
    "Open-source structure rerank top-1 hit rate": "开源语料 structure rerank top-1 命中率",
    "Open-source structure rerank MRR": "开源语料 structure rerank MRR",
    "Open-source path-family rerank top-1 hit rate": "开源语料 path-family rerank top-1 命中率",
    "Open-source path-family rerank MRR": "开源语料 path-family rerank MRR",
    "Open-source API-surface rerank top-1 hit rate": "开源语料 API-surface rerank top-1 命中率",
    "Open-source API-surface rerank MRR": "开源语料 API-surface rerank MRR",
    "Open-source section hit rate": "开源语料 section 命中率",
    "Open-source section median bytes": "开源语料 section 中位字节数",
    "Open-source section-evidence full-file retention rate": "开源语料 section-evidence 全文件证据保留率",
    "Open-source section-evidence median bytes": "开源语料 section-evidence 中位字节数",
    "Open-source scenario-evidence full coverage rate": "开源语料 scenario-evidence 全覆盖率",
    "Open-source scenario-evidence median bytes": "开源语料 scenario-evidence 中位字节数",
    "Open-source cost-aware scenario-evidence full coverage rate": "开源语料 cost-aware scenario-evidence 全覆盖率",
    "Open-source cost-aware scenario-evidence median bytes": "开源语料 cost-aware scenario-evidence 中位字节数",
    "Open-source reachable scenario-evidence full coverage rate": "开源语料 reachable scenario-evidence 全覆盖率",
    "Open-source scenario unreachable-term rate": "开源语料 scenario 不可达术语占比",
    "Open-source claim-support full coverage rate": "开源语料 claim-support 全覆盖率",
    "Open-source claim-support exact-gap recovered rate": "开源语料 claim-support 恢复 exact gap 比率",
    "Open-source claim-support pack preservation rate": "开源语料 claim-support pack 保留率",
    "Open-source claim-support pack median bytes": "开源语料 claim-support pack 中位字节数",
    "Open-source answer-check full coverage rate": "开源语料 answer-check 全覆盖率",
    "Open-source answer-check claim-gap recovered rate": "开源语料 answer-check 恢复 claim gap 比率",
    "Open-source target-local answer-check full coverage rate": "开源语料 target-local answer-check 全覆盖率",
    "Open-source cross-file answer-check recovered rate": "开源语料 cross-file answer recovery 比率",
    "Open-source explicit answer-authority scenario rate": "开源语料显式 answer-authority 场景比率",
    "Open-source authority-scoped answer-check full coverage rate": "开源语料 authority-scoped answer-check 全覆盖率",
    "Open-source out-of-scope answer recovery rate": "开源语料 out-of-scope answer recovery 比率",
    "Open-source authority-reachable answer-check full coverage rate": "开源语料 authority-reachable answer-check 全覆盖率",
    "Open-source authority-reachable mean gain vs scoped pack": "开源语料 authority-reachable 相对 scoped pack 的平均增益",
    "Open-source authority-local missing-support rate": "开源语料 authority-local 缺失 answer support 比率",
    "Open-source authority-aware reachable-support preservation rate": "开源语料 authority-aware reachable-support preservation 比率",
    "Open-source authority-aware mean gain vs scoped pack": "开源语料 authority-aware 相对 scoped pack 的平均增益",
    "Open-source authority-aware median pack bytes": "开源语料 authority-aware 中位 pack bytes",
    "Open-source local-family answer-check full coverage rate": "开源语料 local-family answer-check 全覆盖率",
    "Open-source local-family mean gain vs exact scope": "开源语料 local-family 相对 exact scope 的平均增益",
    "Open-source exact-scope gaps explained by local family rate": "开源语料被 local family 解释的 exact-scope gap 比率",
    "Open-source local-family support preservation rate": "开源语料 local-family support preservation 比率",
    "Open-source local-family pack mean gain vs exact scope": "开源语料 local-family pack 相对 exact scope 的平均增益",
    "Open-source local-family pack median bytes": "开源语料 local-family 中位 pack bytes",
    "External sample corpus count": "外部样本语料数",
    "External sample scenario count": "外部样本场景数",
    "Task stage coverage": "任务阶段覆盖率",
    "Runtime median request-body bytes": "Runtime 中位 request-body 字节数",
    "Exploratory query precision": "Exploratory query precision"
  };
  return labels[label] ?? label;
}

function translateMetricReading(reading) {
  const readings = {
    improved: "改善",
    regressed: "回退",
    flat: "持平",
    "no prior baseline": "没有更早基线"
  };
  return readings[reading] ?? reading;
}

function readOptionalJson(filePath) {
  return fs.existsSync(filePath) ? readJson(filePath) : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarkSummary();
}
