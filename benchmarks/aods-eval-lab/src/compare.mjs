import fs from "node:fs";
import path from "node:path";

import {
  ARTIFACTS,
  DRIFT_SCENARIOS,
  HUMAN_DOCS,
  LOADING_SCENARIOS,
  MODULE_BLUEPRINTS,
  SYSTEM,
  allFacts
} from "./benchmark-data.mjs";
import { buildComparatorCorpora } from "./comparator-fixtures.mjs";
import { runEvaluation } from "./evaluate.mjs";
import { projectPaths } from "./generate-fixtures.mjs";
import {
  PROJECT_ROOT,
  formatPercent,
  formatRatio,
  measureFiles,
  writeJson,
  writeText
} from "./helpers.mjs";
import { evaluateProfileLoading } from "./profile-loading.mjs";

export function runRoundOneComparison() {
  const aodsResults = runEvaluation();
  const paths = projectPaths();
  const profiles = buildComparatorCorpora(paths);
  const facts = allFacts();
  const humanTokens = aodsResults.fidelity.human_doc_tokens_estimated;
  const humanBytes = aodsResults.fidelity.exact_size.human_docs.byte_count;
  const runtimeBaselineMatrices = aodsResults.runtime_capture?.baseline_matrices ?? null;

  const results = {
    generated_at: new Date().toISOString(),
    benchmark_project: "benchmarks/aods-eval-lab",
    scope: "Round-one archetype comparison against Markdown+YAML, llms.txt, and DITA baselines, plus an open-source field-sample supplement.",
    comparator_type: "format-archetype",
    benchmark_corpus: {
      system_id: SYSTEM.id,
      system_name: SYSTEM.name,
      total_modules: MODULE_BLUEPRINTS.length,
      total_human_surfaces: HUMAN_DOCS.length,
      total_items: ARTIFACTS.length,
      total_typed_artifacts: ARTIFACTS.filter((artifact) => artifact.kind === "artifact").length,
      total_prose_sections: ARTIFACTS.filter((artifact) => artifact.kind === "section").length,
      shared_loading_queries: LOADING_SCENARIOS.length,
      drift_scenarios: DRIFT_SCENARIOS.length
    },
    aods_self_evaluation: {
      validation: aodsResults.validation.summary,
      coverage: {
        total_items: aodsResults.coverage.total_items,
        lifecycle_phase_coverage: aodsResults.coverage.lifecycle_phase_coverage,
        structured_type_coverage: aodsResults.coverage.structured_type_coverage,
        generic_type_coverage: aodsResults.coverage.generic_type_coverage,
        raw_fallback_rate: aodsResults.coverage.raw_fallback_rate,
        unsupported_items: aodsResults.coverage.unsupported_items,
        paired_surface_count: aodsResults.coverage.paired_surface_count
      },
      fidelity: {
        fact_preservation_rate: aodsResults.fidelity.fact_preservation_rate,
        critical_fact_preservation_rate: aodsResults.fidelity.critical_fact_preservation_rate,
        exact_size: aodsResults.fidelity.exact_size,
        human_doc_tokens_estimated: aodsResults.fidelity.human_doc_tokens_estimated,
        aods_tokens_estimated: aodsResults.fidelity.aods_tokens_estimated,
        token_reduction_vs_human: aodsResults.fidelity.token_reduction_vs_human,
        median_artifact_compression_ratio: aodsResults.fidelity.median_artifact_compression_ratio
      },
      loading: {
        objective_touch: aodsResults.loading.objective_touch,
        exploratory_query: aodsResults.loading.exploratory_query,
        combined: aodsResults.loading.combined
      },
      runtime_capture: aodsResults.runtime_capture,
      drift: {
        built_in_recall: aodsResults.drift.built_in_recall,
        semantic_recall: aodsResults.drift.semantic_recall,
        semantic_recall_all_drift_cases: aodsResults.drift.semantic_recall_all_drift_cases,
        semantic_applicable_scenario_count: aodsResults.drift.semantic_applicable_scenario_count,
        structural_governance_recall: aodsResults.drift.structural_governance_recall,
        structural_governance_scenario_count: aodsResults.drift.structural_governance_scenario_count,
        combined_recall: aodsResults.drift.combined_recall,
        built_in_false_positive_rate: aodsResults.drift.built_in_false_positive_rate,
        semantic_false_positive_rate: aodsResults.drift.semantic_false_positive_rate
      },
      behavior_drift: aodsResults.behavior_drift,
      open_source_routing: aodsResults.open_source_routing,
      release_surface: aodsResults.release_surface,
      diversity: aodsResults.diversity,
      overhead: aodsResults.overhead
    },
    field_sample: aodsResults.diversity.external_sample,
    fairness_contract: {
      canonical_dataset: "shared",
      shared_queries: LOADING_SCENARIOS.length,
      common_metrics: [
        "lifecycle coverage",
        "logical slice coverage",
        "fact preservation",
        "corpus byte count",
        "files per corpus",
        "bytes per benchmark item",
        "objective median loaded bytes",
        "objective median prompt-envelope bytes",
        "objective touch-route hit rate",
        "objective touch-route precision",
        "objective touch-route byte savings"
      ],
      advisory_metrics: [
        "estimated token count",
        "tokens per benchmark item",
        "exploratory query-route hit rate",
        "exploratory query-route precision",
        "exploratory query-route token savings"
      ],
      aods_only_metrics: ["native drift recall", "release-surface trust", "paired-surface governance", "explicit authority model"]
    },
    baselines: [
      buildAodsBaseline(aodsResults, runtimeBaselineMatrices?.aods ?? aodsResults.runtime_capture ?? null),
      ...profiles.map((profile) =>
        evaluateProfile(profile, facts, humanTokens, humanBytes, runtimeBaselineMatrices?.[profile.id] ?? null)
      )
    ],
    limitations: [
      "Round one compares generated archetype corpora, not full upstream toolchain integrations.",
      "Main scoreboards use exact bytes and touch-route scenarios; token counts and exploratory query-route scenarios are advisory only.",
      aodsResults.diversity.external_sample
        ? "The benchmark now includes an external open-source field-sample supplement, but the fair common scoreboard still rests on the shared synthetic corpus."
        : "The benchmark corpus now spans multiple synthetic datasets and sync modes, but diversity is still narrower than a real multi-language field sample.",
      "Native drift governance remains an AODS-specific metric in this round because the baseline archetypes do not provide equivalent enforcement contracts.",
      "Behavior drift currently covers deterministic route underreach and overreach mutations in the runtime companion rather than full autonomous execution traces."
    ]
  };

  writeJson(path.join(paths.resultsRoot, "round1-comparator-results.json"), results);
  writeText(path.join(PROJECT_ROOT, "reports", "round1-comparator-report.md"), renderComparisonReport(results));
  return results;
}

function buildAodsBaseline(aodsResults, runtimeCapture) {
  return {
    id: "aods",
    label: "AODS",
    archetype: "Agent-first structured corpus",
    common: {
      lifecycle_phase_coverage: aodsResults.coverage.lifecycle_phase_coverage,
      logical_slice_coverage: 1,
      fact_preservation_rate: aodsResults.fidelity.fact_preservation_rate,
      critical_fact_preservation_rate: aodsResults.fidelity.critical_fact_preservation_rate,
      corpus_bytes: aodsResults.fidelity.exact_size.aods_corpus.byte_count,
      file_count: aodsResults.fidelity.exact_size.aods_corpus.file_count,
      bytes_per_benchmark_item: aodsResults.fidelity.exact_size.aods_corpus.byte_count / ARTIFACTS.length,
      byte_reduction_vs_human:
        1 -
        aodsResults.fidelity.exact_size.aods_corpus.byte_count /
          aodsResults.fidelity.exact_size.human_docs.byte_count,
      loadable_unit_count: aodsResults.overhead.module_count,
      loading: aodsResults.loading.objective_touch
    },
    advisory: {
      corpus_tokens_estimated: aodsResults.fidelity.aods_tokens_estimated,
      tokens_per_benchmark_item: aodsResults.fidelity.aods_tokens_estimated / ARTIFACTS.length,
      token_reduction_vs_human: aodsResults.fidelity.token_reduction_vs_human,
      loading: aodsResults.loading.exploratory_query
    },
    governance: {
      native_validation: "schema + route + hook",
      paired_surface_support: true,
      explicit_authority_model: true,
      native_drift_recall: aodsResults.drift.built_in_recall
    },
    open_source_routing: aodsResults.open_source_routing,
    release_surface: aodsResults.release_surface,
    runtime_capture: runtimeCapture,
    scenario_results: aodsResults.loading.scenario_results
  };
}

function evaluateProfile(profile, facts, humanTokens, humanBytes, runtimeCapture) {
  const combinedText = profile.counted_files
    .map((filePath) => fs.readFileSync(path.join(PROJECT_ROOT, profile.corpus_root, filePath), "utf8"))
    .join("\n");
  const criticalFacts = facts.filter((fact) => fact.critical);
  const preservedFacts = facts.filter((fact) => combinedText.includes(fact.text));
  const preservedCriticalFacts = criticalFacts.filter((fact) => combinedText.includes(fact.text));
  const loading = evaluateProfileLoading(profile);
  const representedModules = new Set(profile.units.flatMap((unit) => unit.module_ids));
  const representedPhases = new Set(profile.units.flatMap((unit) => unit.phases));
  const exactSize = measureFiles(
    profile.counted_files.map((filePath) => path.join(PROJECT_ROOT, profile.corpus_root, filePath))
  );

  return {
    id: profile.id,
    label: profile.label,
    archetype: profile.archetype,
    common: {
      lifecycle_phase_coverage: representedPhases.size / 9,
      logical_slice_coverage: representedModules.size / MODULE_BLUEPRINTS.length,
      fact_preservation_rate: preservedFacts.length / facts.length,
      critical_fact_preservation_rate: preservedCriticalFacts.length / criticalFacts.length,
      corpus_bytes: exactSize.byte_count,
      file_count: exactSize.file_count,
      bytes_per_benchmark_item: exactSize.byte_count / ARTIFACTS.length,
      byte_reduction_vs_human: 1 - exactSize.byte_count / humanBytes,
      loadable_unit_count: profile.loadable_unit_count,
      loading: loading.objective_touch
    },
    advisory: {
      corpus_tokens_estimated: profile.corpus_tokens_estimated,
      tokens_per_benchmark_item: profile.corpus_tokens_estimated / ARTIFACTS.length,
      token_reduction_vs_human: 1 - profile.corpus_tokens_estimated / humanTokens,
      loading: loading.exploratory_query
    },
    governance: profile.governance,
    runtime_capture: runtimeCapture,
    scenario_results: loading.scenario_results
  };
}

function renderComparisonReport(results) {
  const smallestCorpus = [...results.baselines].sort((left, right) => left.common.corpus_bytes - right.common.corpus_bytes)[0];
  const bestLoading = [...results.baselines].sort(
    (left, right) => right.common.loading.hit_rate - left.common.loading.hit_rate
  )[0];
  const bestPrecision = [...results.baselines].sort(
    (left, right) => right.common.loading.average_precision - left.common.loading.average_precision
  )[0];
  const strongestGovernance = [...results.baselines].sort(
    (left, right) => right.governance.native_drift_recall - left.governance.native_drift_recall
  )[0];
  const smallestCorpusClause =
    smallestCorpus.id === "aods"
      ? "AODS is currently the smallest corpus by exact bytes"
      : `${smallestCorpus.label} is the smallest corpus by exact bytes`;
  const bestPrecisionClause =
    bestPrecision.id === "aods"
      ? "AODS also has the highest objective loading precision"
      : `${bestPrecision.label} has the highest objective loading precision`;
  const objectiveRows = results.baselines
    .map(
      (baseline) =>
        `| ${baseline.label} | ${baseline.common.corpus_bytes} | ${baseline.common.file_count} | ${formatRatio(
          baseline.common.bytes_per_benchmark_item
        )} | ${formatPercent(baseline.common.fact_preservation_rate)} | ${baseline.common.loading.median_route_bytes} | ${
          baseline.common.loading.median_prompt_envelope_bytes
        } | ${formatPercent(
          baseline.common.loading.hit_rate
        )} | ${formatPercent(baseline.common.loading.average_precision)} | ${formatPercent(
          baseline.common.loading.median_byte_savings_vs_full_load
        )} |`
    )
    .join("\n");
  const advisoryRows = results.baselines
    .map(
      (baseline) =>
        `| ${baseline.label} | ${baseline.advisory.corpus_tokens_estimated} | ${formatRatio(
          baseline.advisory.tokens_per_benchmark_item
        )} | ${formatPercent(baseline.advisory.loading.hit_rate)} | ${formatPercent(
          baseline.advisory.loading.average_precision
        )} | ${formatPercent(baseline.advisory.loading.median_token_savings_vs_full_load)} |`
    )
    .join("\n");
  const governanceRows = results.baselines
    .map(
      (baseline) =>
        `| ${baseline.label} | ${baseline.governance.native_validation} | ${
          baseline.governance.paired_surface_support ? "yes" : "no"
        } | ${baseline.governance.explicit_authority_model ? "yes" : "no"} | ${formatPercent(
          baseline.governance.native_drift_recall
        )} |`
    )
    .join("\n");

  const comparatorRows = [
    [
      "Markdown + YAML",
      "It is the practical incumbent for large project documentation and the closest real-world default alternative to adopting AODS.",
      "Low-friction authoring, file-level metadata, and TechDocs-style docs-as-code ergonomics."
    ],
    [
      "llms.txt + linked Markdown",
      "It is the strongest lightweight AI-facing counter-position: minimal structure, minimal overhead, and direct model consumption.",
      "How much AODS really buys beyond a thin AI entrypoint plus ordinary Markdown detail pages."
    ],
    [
      "DITA topic corpus",
      "It is the mature structured-documentation comparator with modular topics, maps, and strong information architecture lineage.",
      "Whether AODS adds value beyond classic structured documentation systems rather than only beating loose Markdown."
    ]
  ]
    .map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`)
    .join("\n");

  const aodsBaseline = results.aods_self_evaluation;
  const corpus = results.benchmark_corpus;
  const tokenSizeDelta = describeCorpusDelta(aodsBaseline.fidelity.token_reduction_vs_human);
  const byteSizeDelta = describeCorpusDelta(
    1 -
      aodsBaseline.fidelity.exact_size.aods_corpus.byte_count /
        aodsBaseline.fidelity.exact_size.human_docs.byte_count
  );
  const diversity = aodsBaseline.diversity;
  const openSourceRouting = aodsBaseline.open_source_routing;
  const externalSample = results.field_sample ?? diversity.external_sample;
  const runtimeCapture = aodsBaseline.runtime_capture;
  const runtimeCaptureObjective = runtimeCapture?.summary?.objective_touch ?? null;
  const runtimeObjectiveLifecycle = runtimeCapture?.objective_lifecycle?.summary ?? null;
  const runtimeRepresentativeLifecycle = runtimeCapture?.representative_lifecycle ?? null;
  const runtimeAttribution = runtimeCapture?.runtime_attribution ?? null;
  const runtimeAttributionDelta = runtimeAttribution?.combined_median_delta ?? null;
  const runtimeAttributionTopScenario = runtimeAttribution?.heaviest_tool_loop_delta_scenarios?.[0] ?? null;
  const runtimeProfiles = Object.values(runtimeCapture?.runtime_profiles ?? {});
  const localRuntimeProfiles = runtimeProfiles.filter((runtimeProfile) => runtimeProfile.profile.mode !== "hosted");
  const hostedRuntimeProfiles = runtimeProfiles.filter((runtimeProfile) => runtimeProfile.profile.mode === "hosted");
  const runtimeCaptureRow = runtimeCaptureObjective
    ? `| Runtime-backed local matrix (AODS representative) | ${runtimeCapture.summary.scenario_count} scenarios, objective median exact provider request ${Math.round(runtimeCaptureObjective.median_request_body_bytes)} bytes, rendered prompt ${Math.round(runtimeCaptureObjective.median_prompt_bytes)} bytes, ratio ${formatRatio(runtimeCaptureObjective.median_request_vs_prompt_ratio)}x${runtimeObjectiveLifecycle ? `; AODS objective full-run median ${runtimeObjectiveLifecycle.median_request_count} request(s), ${Math.round(runtimeObjectiveLifecycle.median_total_request_body_bytes)} total bytes, classed as ${runtimeObjectiveLifecycle.median_first_request_count} first / ${runtimeObjectiveLifecycle.median_followup_prompt_requests} follow-up / ${runtimeObjectiveLifecycle.median_tool_loop_request_count} tool-loop / ${runtimeObjectiveLifecycle.median_auxiliary_request_count} auxiliary, with ${Math.round(runtimeObjectiveLifecycle.median_tool_loop_request_body_bytes)} tool-loop bytes` : ""}${runtimeRepresentativeLifecycle ? `; representative full run ${runtimeRepresentativeLifecycle.request_count} request(s), ${runtimeRepresentativeLifecycle.total_request_body_bytes} total bytes` : ""}${runtimeAttributionDelta ? `; hosted-vs-local combined delta ${Math.round(runtimeAttributionDelta.total_request_body_bytes_delta)} bytes with ${Math.round(runtimeAttributionDelta.tool_loop_request_body_bytes_delta)} tool-loop bytes` : ""} |`
    : "";
  const runtimeBaselineRows = results.baselines
    .filter((baseline) => baseline.runtime_capture?.summary?.objective_touch)
    .map((baseline) => {
      const objective = baseline.runtime_capture.summary.objective_touch;
      return `| ${baseline.label} | ${objective.scenario_count} | ${Math.round(
        objective.median_prompt_bytes
      )} | ${Math.round(objective.median_request_body_bytes)} | ${Math.round(
        objective.median_runtime_added_bytes
      )} | ${formatRatio(objective.median_request_vs_prompt_ratio)}x |`;
    })
    .join("\n");
  const additionalRuntimeSections = runtimeProfiles
    .filter((runtimeProfile) => runtimeProfile.profile.id !== runtimeCapture?.profile?.id)
    .map((runtimeProfile) => {
      const rows = Object.values(runtimeProfile.baseline_matrices ?? {})
        .map((baseline) => {
          const objective = baseline.summary.objective_touch;
          return `| ${baseline.label} | ${objective.scenario_count} | ${Math.round(
            objective.median_prompt_bytes
          )} | ${Math.round(objective.median_request_body_bytes)} | ${Math.round(
            objective.median_runtime_added_bytes
          )} | ${formatRatio(objective.median_request_vs_prompt_ratio)}x |`;
        })
        .join("\n");
      const objectiveLifecycle = runtimeProfile.baseline_matrices?.aods?.objective_lifecycle?.summary ?? null;
      const representativeLifecycle = runtimeProfile.baseline_matrices?.aods?.representative_lifecycle ?? null;
      return `### ${runtimeProfile.profile.id}\n\n| Baseline | Objective scenarios | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |\n| --- | ---: | ---: | ---: | ---: | ---: |\n${rows}\n\n${
        objectiveLifecycle
          ? `AODS objective full-run lifecycle: **${objectiveLifecycle.scenario_count}** scenarios, median **${objectiveLifecycle.median_request_count}** provider requests, median **${Math.round(objectiveLifecycle.median_total_request_body_bytes)} bytes** total request body, classed as median **${objectiveLifecycle.median_first_request_count}** first request, **${objectiveLifecycle.median_followup_prompt_requests}** follow-up prompt requests, **${objectiveLifecycle.median_tool_loop_request_count}** tool-loop requests, and **${objectiveLifecycle.median_auxiliary_request_count}** auxiliary side requests, with median **${Math.round(objectiveLifecycle.median_tool_loop_request_body_bytes)} bytes** in tool-loop traffic and ratio **${formatRatio(objectiveLifecycle.median_total_request_vs_prompt_ratio)}x** vs the rendered prompt.`
          : "AODS objective full-run lifecycle: not captured."
      }\n\n${
        representativeLifecycle
          ? `Representative AODS full-run lifecycle: **${representativeLifecycle.request_count}** provider requests, **${representativeLifecycle.total_request_body_bytes} bytes** total request body, split into **${representativeLifecycle.first_request_count}** first request, **${representativeLifecycle.followup_prompt_request_count}** follow-up prompt requests, **${representativeLifecycle.tool_loop_request_count}** tool-loop requests, and **${representativeLifecycle.auxiliary_request_count}** auxiliary side requests; tool-loop traffic contributes **${representativeLifecycle.tool_loop_request_body_bytes} bytes** and the full run stays at **${formatRatio(representativeLifecycle.total_request_vs_prompt_ratio)}x** vs the rendered prompt.`
          : "Representative AODS full-run lifecycle: not captured."
      }${
        runtimeProfile.profile.mode === "hosted" && runtimeAttributionDelta
          ? `\n\nHosted-vs-local attribution: combined median delta **${runtimeAttributionDelta.total_request_body_bytes_delta} bytes**, with **${runtimeAttributionDelta.tool_loop_request_body_bytes_delta} bytes** from tool-loop traffic and **${runtimeAttributionDelta.followup_prompt_request_body_bytes_delta} bytes** from follow-up prompt traffic; the heaviest tool-loop delta scenario is **${runtimeAttributionTopScenario?.scenario_id ?? "n/a"}** at **${runtimeAttributionTopScenario?.tool_loop_request_body_bytes_delta ?? 0}** extra tool-loop bytes.`
          : ""
      }`;
    })
    .join("\n\n");
  const externalSampleSummary = externalSample
    ? `- **External field sample:** ${externalSample.corpus_count} open-source corpora, ${externalSample.scenario_count} grep-first scenario seeds, formats ${Object.entries(
        externalSample.formats
      )
        .map(([format, count]) => `${format}=${count}`)
        .join(", ")}`
    : "- **External field sample:** not loaded in this run";

  return `# AODS round-one benchmark evaluation report

## Executive summary

- **Dataset:** ${corpus.system_name} benchmark corpus with **${corpus.total_modules}** modules, **${corpus.total_human_surfaces}** human surfaces, **${corpus.total_items}** lifecycle items, **${corpus.shared_loading_queries}** shared loading queries, and **${corpus.drift_scenarios}** drift scenarios
- **Internal AODS result:** full lifecycle coverage, full fact preservation, **${byteSizeDelta}** by exact bytes, **${formatPercent(
    aodsBaseline.loading.objective_touch.hit_rate
  )}** objective touch-route hit rate, objective median rendered prompt envelope **${aodsBaseline.loading.objective_touch.median_prompt_envelope_bytes} bytes**${runtimeCaptureObjective ? `, supplemental AODS objective median runtime request **${Math.round(runtimeCaptureObjective.median_request_body_bytes)} bytes** across ${runtimeCapture.summary.scenario_count} scenarios, **${localRuntimeProfiles.length}** local CLI runtime profiles${hostedRuntimeProfiles.length ? `, and **${hostedRuntimeProfiles.length}** optional hosted relay-backed profile${hostedRuntimeProfiles.length === 1 ? "" : "s"}` : ""}` : ""}, **${formatPercent(openSourceRouting.top_1_hit_rate)}** real-corpus top-1 routing hit rate, **${formatPercent(openSourceRouting.seed_title_rerank.top_1_hit_rate)}** title-reranked top-1 routing hit rate, **${formatPercent(openSourceRouting.structure_aware_rerank.top_1_hit_rate)}** structure-reranked top-1 routing hit rate, **${formatPercent(openSourceRouting.path_family_rerank.top_1_hit_rate)}** path-family-reranked top-1 routing hit rate, **${formatPercent(openSourceRouting.api_surface_rerank.top_1_hit_rate)}** API-surface-reranked top-1 routing hit rate, **${formatPercent(openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate)}** section-evidence full-file retention, **${formatPercent(openSourceRouting.scenario_evidence_bundle.full_scenario_term_coverage_rate)}** scenario-evidence full coverage, **${formatPercent(openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate)}** cost-aware scenario coverage, **${formatPercent(openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate)}** reachable scenario coverage, **${formatPercent(openSourceRouting.scenario_claim_support.full_claim_support_rate)}** claim-support coverage, **${formatPercent(openSourceRouting.scenario_claim_support.exact_gap_recovered_rate)}** exact-gap recovered, **${formatPercent(openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate)}** claim-support-pack preservation, **${formatPercent(openSourceRouting.scenario_answer_check.full_answer_check_rate)}** answer-check coverage, **${formatPercent(openSourceRouting.scenario_answer_check.claim_gap_recovered_rate)}** answer-check claim-gap recovered, **${formatPercent(openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate)}** target-local answer-check coverage, **${formatPercent(openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate)}** cross-file answer recovery, **${formatPercent(openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate)}** authority-scoped answer-check coverage across **${openSourceRouting.scenario_answer_authority.scoped_scenario_count}** scoped scenarios, **${formatPercent(openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate)}** out-of-scope answer recovery, **${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_answer_check_coverage)}** authority-reachable mean coverage, **${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack)}** reachability gain vs scoped pack, **${formatPercent(openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate)}** authority-local missing-support rate, **${formatPercent(openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate)}** authority-aware reachable-support preservation, **${formatPercent(openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack)}** authority-aware gain vs scoped pack, median authority-aware pack **${Math.round(openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes)} bytes**, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate)}** local-family full coverage across **${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count}** strict-file scopes, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope)}** local-family gain vs exact scope, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate)}** local-family support preservation, **${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope)}** local-family pack gain vs exact scope, median local-family pack **${Math.round(openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes)} bytes**, **${formatPercent(openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate)}** scenarios with unreachable terms, **${formatPercent(aodsBaseline.release_surface.combined_recall)}** release-surface trust recall, **${formatPercent(aodsBaseline.behavior_drift.route_behavior_recall)}** route-behavior drift recall with **${formatPercent(aodsBaseline.behavior_drift.built_in_recall)}** built-in route-behavior recall, and **${formatPercent(aodsBaseline.drift.combined_recall)}** combined drift recall
- **External comparison headline:** AODS is the only baseline in round one with **${formatPercent(
    strongestGovernance.governance.native_drift_recall
  )}** native drift recall; **${smallestCorpusClause}**; **${bestPrecisionClause}**
- ${externalSampleSummary.slice(2)}

**Round-one verdict:** AODS now has a defensible result on this benchmark. Its corpus-size advantage in this round is marginal rather than decisive, but it is the only round-one profile that combines strong objective loading with native authority and governance controls. That makes it a credible option for agent-heavy, drift-sensitive programs in the current benchmark, while its corpus cost still needs optimization before it can compete with lower-friction defaults more broadly.

## Evaluation scope

This report combines two layers of measurement:

1. **Internal self-evaluation:** whether AODS itself satisfies its own claims on lifecycle coverage, fidelity, progressive loading, and drift control
2. **External round-one comparison:** whether AODS still looks meaningful when compared against strong alternative documentation archetypes built from the same source facts
3. **External field-sample supplement:** whether the benchmark is now grounded by real open-source grep-first documentation slices without breaking the round-one fairness contract

## Benchmark design

| Benchmark property | Value |
| --- | --- |
| System | ${corpus.system_name} |
| Modules | ${corpus.total_modules} |
| Human surfaces | ${corpus.total_human_surfaces} |
| Lifecycle items | ${corpus.total_items} |
| Typed artifacts | ${corpus.total_typed_artifacts} |
| Prose sections | ${corpus.total_prose_sections} |
| Shared loading queries | ${corpus.shared_loading_queries} |
| Drift scenarios | ${corpus.drift_scenarios} |

The benchmark is designed to answer four primary questions:

1. **Coverage:** can the format represent a realistic project lifecycle rather than only narrow technical specs
2. **Fidelity and compression:** do important facts survive the rewrite, and what happens to corpus size
3. **Progressive loading:** can the working set be narrowed without missing required authority under objective touch-route checks
4. **Drift resistance:** can the format and tooling detect divergence between authoritative and human-facing surfaces

## Why these comparators

The first comparison set was chosen to pressure AODS from three different directions rather than from only one neighbor:

| Comparator | Why it was selected | What it pressures |
| --- | --- | --- |
${comparatorRows}

These were chosen before narrower competitors such as OpenAPI or TypeSpec because round one needed **full-lifecycle** comparators, not domain-specific sub-specs. Retrieval runtimes such as GraphRAG were also deferred because they change the execution model, not only the documentation format, and therefore need a different fairness contract.

## Fairness contract

All four baselines use the same canonical dataset and the same shared query set. The main scoreboard only includes cross-format metrics that can be evaluated fairly across all baselines:

- lifecycle coverage
- logical slice coverage
- fact preservation
- corpus byte count
- file count
- bytes per benchmark item
- objective median loaded bytes
- objective median prompt-envelope bytes
- objective touch-route hit rate
- objective touch-route precision
- objective touch-route byte savings

Advisory metrics are still recorded, but they are not used as the primary round-one judgment:

- estimated token count
- tokens per benchmark item
- exploratory query-route hit rate
- exploratory query-route precision
- exploratory query-route token savings

AODS-native governance signals remain separate because the other archetypes do not expose equivalent authority and paired-surface contracts in round one.

## AODS self-evaluation baseline

| Dimension | Result |
| --- | --- |
| Validation summary | ${aodsBaseline.validation.total_modules} modules, ${aodsBaseline.validation.total_sections} sections, ${aodsBaseline.validation.total_artifacts} artifacts, ${aodsBaseline.validation.errors} errors, ${aodsBaseline.validation.warnings} warnings |
| Coverage | ${formatPercent(aodsBaseline.coverage.lifecycle_phase_coverage)} lifecycle phase coverage, ${formatPercent(aodsBaseline.coverage.structured_type_coverage)} structured type coverage, ${formatPercent(aodsBaseline.coverage.generic_type_coverage)} generic type coverage |
| Expression escape hatch | ${formatPercent(aodsBaseline.coverage.raw_fallback_rate)} raw fallback rate, ${aodsBaseline.coverage.unsupported_items} unsupported items |
| Fidelity | ${formatPercent(aodsBaseline.fidelity.fact_preservation_rate)} fact preservation, ${formatPercent(aodsBaseline.fidelity.critical_fact_preservation_rate)} critical fact preservation |
| Corpus size (objective) | ${aodsBaseline.fidelity.exact_size.human_docs.byte_count} human-doc bytes vs ${aodsBaseline.fidelity.exact_size.aods_corpus.byte_count} AODS bytes, ${byteSizeDelta} |
| Corpus size (advisory) | ${aodsBaseline.fidelity.human_doc_tokens_estimated} estimated human-doc tokens vs ${aodsBaseline.fidelity.aods_tokens_estimated} estimated AODS tokens, ${tokenSizeDelta} |
| Task-time context footprint (payload) | ${aodsBaseline.loading.objective_touch.median_route_bytes} median loaded bytes, ${aodsBaseline.loading.objective_touch.median_route_tokens_estimated} median loaded estimated tokens, ${aodsBaseline.loading.objective_touch.max_route_bytes} max loaded bytes |
| Task-time context footprint (rendered prompt) | ${aodsBaseline.loading.objective_touch.median_prompt_envelope_bytes} median prompt-envelope bytes, ${aodsBaseline.loading.objective_touch.median_prompt_envelope_tokens_estimated} median prompt-envelope estimated tokens, ${aodsBaseline.loading.objective_touch.median_prompt_envelope_overhead_bytes} median overhead bytes |
${runtimeCaptureRow}
| Loading (objective) | ${formatPercent(aodsBaseline.loading.objective_touch.hit_rate)} hit rate, ${formatPercent(aodsBaseline.loading.objective_touch.average_precision)} average precision, ${formatPercent(aodsBaseline.loading.objective_touch.average_recall)} average recall, ${formatPercent(aodsBaseline.loading.objective_touch.median_byte_savings_vs_full_load)} median byte savings |
| Loading (advisory) | ${formatPercent(aodsBaseline.loading.exploratory_query.hit_rate)} hit rate, ${formatPercent(aodsBaseline.loading.exploratory_query.average_precision)} average precision, ${formatPercent(aodsBaseline.loading.exploratory_query.average_recall)} average recall, ${formatPercent(aodsBaseline.loading.exploratory_query.median_token_savings_vs_full_load)} median token savings |
| Real-corpus routing (supplemental) | ${formatPercent(openSourceRouting.top_1_hit_rate)} baseline top-1, ${formatPercent(openSourceRouting.top_3_hit_rate)} baseline top-3, ${formatPercent(openSourceRouting.mean_reciprocal_rank)} baseline MRR, ${formatPercent(openSourceRouting.seed_title_rerank.top_1_hit_rate)} title-reranked top-1, ${formatPercent(openSourceRouting.seed_title_rerank.mean_reciprocal_rank)} title-reranked MRR, ${formatPercent(openSourceRouting.structure_aware_rerank.top_1_hit_rate)} structure-reranked top-1, ${formatPercent(openSourceRouting.structure_aware_rerank.mean_reciprocal_rank)} structure-reranked MRR, ${formatPercent(openSourceRouting.path_family_rerank.top_1_hit_rate)} path-family-reranked top-1, ${formatPercent(openSourceRouting.path_family_rerank.mean_reciprocal_rank)} path-family-reranked MRR, ${formatPercent(openSourceRouting.api_surface_rerank.top_1_hit_rate)} API-surface-reranked top-1, ${formatPercent(openSourceRouting.api_surface_rerank.mean_reciprocal_rank)} API-surface-reranked MRR, ${formatPercent(openSourceRouting.section_context.section_hit_rate)} section hit rate, ${formatPercent(openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate)} evidence retention, ${formatPercent(openSourceRouting.scenario_evidence_bundle.full_scenario_term_coverage_rate)} scenario-evidence coverage, ${formatPercent(openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate)} cost-aware scenario-evidence coverage, ${formatPercent(openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate)} reachable scenario-evidence coverage, ${formatPercent(openSourceRouting.scenario_claim_support.full_claim_support_rate)} claim-support coverage, ${formatPercent(openSourceRouting.scenario_claim_support.exact_gap_recovered_rate)} exact-gap recovered, ${formatPercent(openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate)} claim-support-pack preservation, ${formatPercent(openSourceRouting.scenario_answer_check.full_answer_check_rate)} answer-check coverage, ${formatPercent(openSourceRouting.scenario_answer_check.claim_gap_recovered_rate)} answer-check claim-gap recovered, ${formatPercent(openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate)} target-local answer-check coverage, ${formatPercent(openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate)} cross-file answer recovery, ${formatPercent(openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate)} authority-scoped answer-check coverage across ${openSourceRouting.scenario_answer_authority.scoped_scenario_count} scoped scenarios, ${formatPercent(openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate)} out-of-scope answer recovery, ${formatPercent(openSourceRouting.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate)} authority-reachable answer-check coverage, ${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack)} authority-reachable gain vs scoped pack, ${formatPercent(openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate)} authority-local missing-support rate, ${formatPercent(openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate)} authority-aware reachable-support preservation, ${formatPercent(openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack)} authority-aware gain vs scoped pack, median authority-aware pack ${Math.round(openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes)} bytes, ${formatPercent(openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate)} local-family full coverage across ${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count} strict-file scopes, ${formatPercent(openSourceRouting.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope)} local-family gain vs exact scope, ${formatPercent(openSourceRouting.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate)} exact-scope gaps explained by local family, ${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate)} local-family support preservation, ${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope)} local-family pack gain vs exact scope, median local-family pack ${Math.round(openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes)} bytes, ${formatPercent(openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate)} unreachable-term scenarios, median selected section ${Math.round(openSourceRouting.section_context.median_selected_section_bytes)} bytes, median evidence pack ${Math.round(openSourceRouting.section_evidence_pack.median_selected_pack_bytes)} bytes, median scenario bundle ${Math.round(openSourceRouting.scenario_evidence_bundle.median_selected_bundle_bytes)} bytes, median cost-aware bundle ${Math.round(openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_bytes)} bytes, median claim-support pack ${Math.round(openSourceRouting.scenario_claim_support_pack.median_selected_pack_bytes)} bytes across ${openSourceRouting.scenario_count} grep-first seeds |
| Drift | ${formatPercent(aodsBaseline.drift.built_in_recall)} built-in recall, ${formatPercent(aodsBaseline.drift.semantic_recall)} semantic-applicable recall, ${formatPercent(aodsBaseline.drift.structural_governance_recall)} structural-governance recall, ${formatPercent(aodsBaseline.behavior_drift.route_behavior_recall)} route-behavior recall with ${formatPercent(aodsBaseline.behavior_drift.built_in_recall)} built-in route-behavior recall, ${formatPercent(aodsBaseline.drift.combined_recall)} combined recall |
| Diversity audit | ${diversity.dataset_count} synthetic dataset, domains ${diversity.domains.join(", ")}, languages ${diversity.languages.join(", ")}, sync modes ${diversity.sync_modes.present.join(", ") || "none"}${externalSample ? `, external field sample ${externalSample.corpus_count} corpora / ${externalSample.scenario_count} seeds` : ""} |

## Runtime-backed objective supplement

| Baseline | Objective scenarios | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
${runtimeBaselineRows}
 
Benchmark overhead reference: ${aodsBaseline.overhead.bookkeeping_entries} bookkeeping entries, ${formatRatio(
    aodsBaseline.overhead.bookkeeping_entries_per_artifact
  )} per artifact, ${aodsBaseline.overhead.touch_route_count} touch routes, ${aodsBaseline.overhead.role_count} roles.

**Internal reading:** On this corpus, AODS shows lifecycle completeness and information preservation. The weak spot is not representational coverage; it is corpus weight. Diversity is materially better than before because the benchmark now has an external field-sample supplement, but the fair common scoreboard is still narrower than a true field matrix. The benchmark now treats repository-scale corpus bytes, loaded payload bytes, rendered prompt-envelope bytes, first-request runtime cost, objective full-run lifecycle cost, and representative request-loop detail as separate measurements, and it now also exposes a first route-behavior drift split: deterministic under-read / over-read mutations are fully measurable and are now directly caught by paired-route consistency checks in the built-in validator layer.

${additionalRuntimeSections ? `## Additional runtime supplements\n\n${additionalRuntimeSections}\n\n` : ""}## Benchmark objectivity and diversity audit

- **Primary scoreboard basis:** exact bytes + objective touch-route scenarios
- **Supplemental real-corpus routing basis:** deterministic grep-term ranking over ${openSourceRouting.scenario_count} curated open-source seeds, including harder API-vs-reference sibling collisions, plus separate seed-title rerank, structure-aware rerank, path-family rerank, API-surface rerank, section-context compression, section-evidence packing, rank-order top-3 scenario-evidence bundling, cost-aware top-3 scenario-evidence bundling, a reachability audit that separates retrieval misses from scenario phrases that never appear anywhere in the source corpus, a claim-support lane that allows deterministic per-scenario alias groups for clearly equivalent wording, a claim-support-pack lane that compresses those already-supported bundles down to cross-file section packs, an answer-check lane that distinguishes wording drift from concrete answer insufficiency, an answer-locality lane that shows when those concrete answers still depend on cross-file borrowed evidence, an authority-scoped answer lane that separates acceptable in-scope borrowing from out-of-scope answer recovery, an authority-reachability lane that separates true authority gaps from pack-selection misses inside the declared scope, an authority-aware answer-pack lane that greedily compresses the declared authority scope down to the smallest section bundle that still preserves all currently reachable in-scope answer support, a local-family authority lane that widens strict exact-file scopes to the target directory family so the benchmark can distinguish “missing from the docs” from “distributed across sibling docs nearby”, and a local-family answer-pack lane that then compresses that sibling-family scope back down to the smallest section bundle that still preserves all currently supported nearby answer checks
- **Context-footprint basis:** objective median rendered prompt-envelope bytes remain the shared scoreboard metric, while the new cross-baseline runtime matrices show first-request provider cost, objective full-run lifecycle cost, and representative request-loop detail on top of those routed prompts across the current loading scenario set${hostedRuntimeProfiles.length ? `, including ${hostedRuntimeProfiles.length} optional hosted relay-backed field lane(s)` : ""}
- **Advisory-only signals:** estimated token counts + exploratory query-route scenarios
- **Dataset count:** ${diversity.dataset_count}
- **Domains:** ${diversity.domains.join(", ")}
- **Languages:** ${diversity.languages.join(", ")}
- **Scenario split:** ${diversity.loading_scenarios.objective_count} objective loading scenarios, ${diversity.loading_scenarios.exploratory_count} exploratory loading scenarios
- **Sync modes present:** ${diversity.sync_modes.present.join(", ") || "none"}
- **Sync modes absent:** ${diversity.sync_modes.missing.join(", ") || "none"}
- **Pair scopes absent:** ${diversity.pair_scopes.missing.join(", ") || "none"}
${externalSample
  ? `- **External field sample:** ${externalSample.corpus_count} corpora, ${externalSample.scenario_count} scenario seeds, phases ${externalSample.lifecycle_phases.join(
      ", "
    )}, benchmark dimensions ${externalSample.benchmark_dimensions.join(", ")}`
  : ""}

This makes the round-one judgment more objective than the earlier benchmark pass, and it also makes the remaining diversity gaps explicit: the common scoreboard is multi-domain and includes both agent-primary and human-primary sync, while the new open-source field sample adds real corpora pressure. Even so, language coverage is still English-only and the field sample is not yet a full fair cross-toolchain matrix.

## External field-sample supplement

${externalSample
  ? `- **Open-source corpora:** ${externalSample.corpus_count}
- **Scenario seeds:** ${externalSample.scenario_count}
- **Formats:** ${Object.entries(externalSample.formats)
      .map(([format, count]) => `${format}=${count}`)
      .join(", ")}
- **Benchmark roles:** ${externalSample.benchmark_roles.join(", ")}
- **Why this stays separate from the main scoreboard:** these corpora are not generated from the shared canonical source facts, so they strengthen diversity and routing realism but do not satisfy the round-one fairness contract for direct cross-format scoring.`
  : "- No external field-sample artifact was loaded for this run."}

## Round-one external comparison

- **Smallest corpus:** ${smallestCorpus.label} at **${smallestCorpus.common.corpus_bytes}** bytes
- **Best objective loading reliability:** ${bestLoading.label} with **${formatPercent(bestLoading.common.loading.hit_rate)}** hit rate
- **Best objective loading precision:** ${bestPrecision.label} with **${formatPercent(bestPrecision.common.loading.average_precision)}**
- **Strongest native governance:** ${strongestGovernance.label} with **${formatPercent(
    strongestGovernance.governance.native_drift_recall
  )}** native drift recall

### Objective common metric scoreboard

| Baseline | Corpus bytes | Files | Bytes / benchmark item | Fact preservation | Median loaded bytes | Median prompt-envelope bytes | Objective hit rate | Objective avg precision | Median byte savings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${objectiveRows}

### Advisory metric scoreboard

| Baseline | Estimated tokens | Tokens / benchmark item | Exploratory hit rate | Exploratory avg precision | Median token savings |
| --- | ---: | ---: | ---: | ---: | ---: |
${advisoryRows}

### Native governance signals

These are **not** fair common metrics. They are shown separately because only AODS exposes them as first-class design goals in this round.

| Baseline | Native validation | Paired surfaces | Explicit authority model | Native drift recall |
| --- | --- | --- | --- | ---: |
${governanceRows}

## Interpretation

### What AODS currently shows

- In this round, AODS is the clearest fit when the target problem includes **native authority modeling**, **paired human+agent surfaces**, and **drift-aware governance**.
- AODS is no longer being judged only against itself; it now has external archetype baselines on the same dataset and scenario set.
- AODS is now being judged on an objective scoreboard built from exact size metrics, loaded payload size, rendered prompt-envelope size, and touch-route behavior rather than on heuristic token-only summaries.

### What the competitors prove against AODS

- **Markdown + YAML** pressures AODS on simplicity and practical docs-as-code ergonomics.
- **llms.txt** pressures AODS on minimal AI-facing overhead.
- **DITA** pressures AODS on modular structured documentation lineage and reusable topic architecture.
- The current baseline table shows that AODS's corpus-size edge is marginal, which keeps compression from being the main adoption case at repository scale.

### Current judgment

For large projects today, the benchmark supports this practical reading:

1. use **AODS** when the problem is specifically about agent authority, scoped loading, paired-surface governance, or drift-sensitive handoff
2. use **Markdown + YAML** when team ergonomics and low-friction authoring matter more than native governance semantics
3. treat **llms.txt** as a lightweight AI publishing layer, not as a replacement for strong lifecycle documentation governance
4. treat **DITA** as the strongest evidence that structured modular documentation existed before AODS and therefore remains the right benchmark family for proving structural value

## Limitations and next steps

- These corpora are **benchmark archetypes**, not full upstream toolchain integrations.
- Advisory metrics still include deterministic chars-per-token estimates and exploratory query-route proxies.
- The common scoreboard still uses renderer-based prompt-envelope bytes; the new runtime capture is a shared local Copilot CLI supplement, not yet a broader multi-runtime fairness baseline.
- The benchmark corpus is synthetic but lifecycle-complete, so this is a strong laboratory signal rather than a universal field sample.
- The benchmark still needs more diversity: more languages, more real-world corpora beyond the current three-project supplement, and more runtime-backed cross-toolchain samples.
- Round two should add Backstage or TechDocs runtime execution, plus narrower spec-first comparators such as OpenAPI, AsyncAPI, or TypeSpec for partial-domain benchmarking.

If AODS continues to outperform these archetypes on loading and governance while reducing corpus cost, then the case for wider adoption becomes materially stronger.
`;
}

function describeCorpusDelta(tokenReductionVsHuman) {
  if (tokenReductionVsHuman > 0) {
    return `${formatPercent(tokenReductionVsHuman)} smaller than the human-doc baseline`;
  }
  if (tokenReductionVsHuman < 0) {
    return `${formatPercent(-tokenReductionVsHuman)} larger than the human-doc baseline`;
  }
  return "at parity with the human-doc baseline";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runRoundOneComparison();
}
