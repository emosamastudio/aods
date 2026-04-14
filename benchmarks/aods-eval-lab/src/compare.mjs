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
  dedupe,
  formatPercent,
  formatRatio,
  median,
  measureFiles,
  measureText,
  writeJson,
  writeText
} from "./helpers.mjs";
import { measureBenchmarkPromptEnvelope } from "./prompt-envelope.mjs";

export function runRoundOneComparison() {
  const aodsResults = runEvaluation();
  const paths = projectPaths();
  const profiles = buildComparatorCorpora(paths);
  const facts = allFacts();
  const humanTokens = aodsResults.fidelity.human_doc_tokens_estimated;
  const humanBytes = aodsResults.fidelity.exact_size.human_docs.byte_count;

  const results = {
    generated_at: new Date().toISOString(),
    benchmark_project: "benchmarks/aods-eval-lab",
    scope: "Round-one archetype comparison against Markdown+YAML, llms.txt, and DITA baselines.",
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
        exploratory_semantic: aodsResults.loading.exploratory_semantic,
        combined: aodsResults.loading.combined
      },
      drift: {
        built_in_recall: aodsResults.drift.built_in_recall,
        semantic_recall: aodsResults.drift.semantic_recall,
        combined_recall: aodsResults.drift.combined_recall,
        built_in_false_positive_rate: aodsResults.drift.built_in_false_positive_rate,
        semantic_false_positive_rate: aodsResults.drift.semantic_false_positive_rate
      },
      diversity: aodsResults.diversity,
      overhead: aodsResults.overhead
    },
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
        "exploratory semantic-load hit rate",
        "exploratory semantic-load precision",
        "exploratory semantic-load token savings"
      ],
      aods_only_metrics: ["native drift recall", "paired-surface governance", "explicit authority model"]
    },
    baselines: [
      buildAodsBaseline(aodsResults),
      ...profiles.map((profile) => evaluateProfile(profile, facts, humanTokens, humanBytes))
    ],
    limitations: [
      "Round one compares generated archetype corpora, not full upstream toolchain integrations.",
      "Main scoreboards use exact bytes and touch-route scenarios; token counts and semantic-load scenarios are advisory only.",
      "The benchmark corpus now spans multiple synthetic datasets and sync modes, but diversity is still narrower than a real multi-language field sample.",
      "Native drift governance remains an AODS-specific metric in this round because the baseline archetypes do not provide equivalent enforcement contracts."
    ]
  };

  writeJson(path.join(paths.resultsRoot, "round1-comparator-results.json"), results);
  writeText(path.join(PROJECT_ROOT, "reports", "round1-comparator-report.md"), renderComparisonReport(results));
  return results;
}

function buildAodsBaseline(aodsResults) {
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
      loading: aodsResults.loading.exploratory_semantic
    },
    governance: {
      native_validation: "schema + route + hook",
      paired_surface_support: true,
      explicit_authority_model: true,
      native_drift_recall: aodsResults.drift.built_in_recall
    },
    scenario_results: aodsResults.loading.scenario_results
  };
}

function evaluateProfile(profile, facts, humanTokens, humanBytes) {
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
      loading: loading.exploratory_semantic
    },
    governance: profile.governance,
    scenario_results: loading.scenario_results
  };
}

function evaluateProfileLoading(profile) {
  const corpusRoot = path.join(PROJECT_ROOT, profile.corpus_root);
  const unitContentMap = new Map(
    profile.units.map((unit) => [unit.id, fs.readFileSync(path.join(corpusRoot, unit.path), "utf8")])
  );
  const unitMetricMap = new Map(
    [...unitContentMap].map(([unitId, content]) => [unitId, measureText(content)])
  );
  const unitPaths = new Set(profile.units.map((unit) => unit.path));
  const indexResources = profile.counted_files
    .filter((filePath) => !unitPaths.has(filePath))
    .map((filePath) => {
      const content = fs.readFileSync(path.join(corpusRoot, filePath), "utf8");
      return {
        path: filePath,
        title: path.basename(filePath),
        kind: "index",
        content,
        measured: measureText(content)
      };
    });
  const indexBytes = indexResources.reduce((sum, resource) => sum + resource.measured.bytes, 0);
  const fullLoadTokens =
    profile.index_tokens_estimated + profile.units.reduce((sum, unit) => sum + unit.tokens_estimated, 0);
  const unitById = new Map(profile.units.map((unit) => [unit.id, unit]));
  const fullLoadBytes =
    indexBytes + profile.units.reduce((sum, unit) => sum + (unitMetricMap.get(unit.id)?.bytes ?? 0), 0);
  const fullPromptResources = buildProfilePromptResources(indexResources, unitContentMap, profile.units);

  const scenarioResults = LOADING_SCENARIOS.map((scenario) => {
    const loadedUnitIds = scenario.touch ? loadTouchUnits(profile, scenario) : loadSemanticUnits(profile, scenario);
    const loadedUnits = loadedUnitIds.map((unitId) => unitById.get(unitId)).filter(Boolean);
    const loadedModules = dedupe(loadedUnits.flatMap((unit) => unit.module_ids));
    const hits = scenario.requiredModules.filter((moduleId) => loadedModules.includes(moduleId)).length;
    const precision = loadedModules.length === 0 ? 0 : hits / loadedModules.length;
    const recall = hits / scenario.requiredModules.length;
    const routeTokens =
      profile.index_tokens_estimated + loadedUnits.reduce((sum, unit) => sum + unit.tokens_estimated, 0);
    const oracleUnits = selectOracleUnits(profile.units, scenario.requiredModules);
    const oracleTokens =
      profile.index_tokens_estimated + oracleUnits.reduce((sum, unit) => sum + unit.tokens_estimated, 0);
    const routeBytes = indexBytes + loadedUnits.reduce((sum, unit) => sum + (unitMetricMap.get(unit.id)?.bytes ?? 0), 0);
    const oracleBytes =
      indexBytes + oracleUnits.reduce((sum, unit) => sum + (unitMetricMap.get(unit.id)?.bytes ?? 0), 0);
    const promptEnvelope = measureBenchmarkPromptEnvelope({
      formatLabel: profile.label,
      scenario,
      resources: buildProfilePromptResources(indexResources, unitContentMap, loadedUnits)
    });
    const fullPromptEnvelope = measureBenchmarkPromptEnvelope({
      formatLabel: profile.label,
      scenario,
      resources: fullPromptResources
    });

    return {
      id: scenario.id,
      description: scenario.description,
      scenario_class: scenario.scenario_class,
      measurement_class: scenario.measurement_class,
      mode: scenario.touch ? "touch-route" : "semantic-load",
      loaded_units: loadedUnitIds,
      loaded_modules: loadedModules,
      required_modules: scenario.requiredModules,
      precision,
      recall,
      exact_hit: recall === 1,
      route_bytes: routeBytes,
      oracle_bytes: oracleBytes,
      byte_savings_vs_full_load: 1 - routeBytes / fullLoadBytes,
      route_tokens_estimated: routeTokens,
      oracle_tokens_estimated: oracleTokens,
      prompt_envelope_bytes: promptEnvelope.bytes,
      prompt_envelope_tokens_estimated: promptEnvelope.tokens_estimated,
      full_prompt_envelope_bytes: fullPromptEnvelope.bytes,
      full_prompt_envelope_tokens_estimated: fullPromptEnvelope.tokens_estimated,
      prompt_envelope_overhead_bytes: promptEnvelope.bytes - routeBytes,
      prompt_envelope_overhead_tokens_estimated: promptEnvelope.tokens_estimated - routeTokens,
      prompt_envelope_savings_vs_full_prompt: 1 - promptEnvelope.bytes / fullPromptEnvelope.bytes,
      token_savings_vs_full_load: 1 - routeTokens / fullLoadTokens,
      token_overfetch_ratio: routeTokens / oracleTokens,
      byte_overfetch_ratio: routeBytes / oracleBytes
    };
  });

  return {
    objective_touch: summarizeLoadingResults(
      scenarioResults.filter((scenario) => scenario.measurement_class === "objective")
    ),
    exploratory_semantic: summarizeLoadingResults(
      scenarioResults.filter((scenario) => scenario.measurement_class === "exploratory")
    ),
    combined: summarizeLoadingResults(scenarioResults),
    scenario_results: scenarioResults
  };
}

function summarizeLoadingResults(scenarioResults) {
  if (scenarioResults.length === 0) {
    return {
      scenario_count: 0,
      hit_rate: 0,
      average_precision: 0,
      average_recall: 0,
      median_prompt_envelope_tokens_estimated: 0,
      median_prompt_envelope_bytes: 0,
      max_prompt_envelope_tokens_estimated: 0,
      max_prompt_envelope_bytes: 0,
      median_prompt_envelope_overhead_tokens_estimated: 0,
      median_prompt_envelope_overhead_bytes: 0,
      median_prompt_envelope_savings_vs_full_prompt: 0,
      median_route_tokens_estimated: 0,
      median_route_bytes: 0,
      max_route_tokens_estimated: 0,
      max_route_bytes: 0,
      median_token_savings_vs_full_load: 0,
      median_byte_savings_vs_full_load: 0,
      median_token_overfetch_ratio: 0,
      median_byte_overfetch_ratio: 0
    };
  }

  return {
    scenario_count: scenarioResults.length,
    hit_rate: scenarioResults.filter((result) => result.exact_hit).length / scenarioResults.length,
    average_precision: scenarioResults.reduce((sum, result) => sum + result.precision, 0) / scenarioResults.length,
    average_recall: scenarioResults.reduce((sum, result) => sum + result.recall, 0) / scenarioResults.length,
    median_prompt_envelope_tokens_estimated: median(
      scenarioResults.map((result) => result.prompt_envelope_tokens_estimated)
    ),
    median_prompt_envelope_bytes: median(scenarioResults.map((result) => result.prompt_envelope_bytes)),
    max_prompt_envelope_tokens_estimated: Math.max(...scenarioResults.map((result) => result.prompt_envelope_tokens_estimated)),
    max_prompt_envelope_bytes: Math.max(...scenarioResults.map((result) => result.prompt_envelope_bytes)),
    median_prompt_envelope_overhead_tokens_estimated: median(
      scenarioResults.map((result) => result.prompt_envelope_overhead_tokens_estimated)
    ),
    median_prompt_envelope_overhead_bytes: median(
      scenarioResults.map((result) => result.prompt_envelope_overhead_bytes)
    ),
    median_prompt_envelope_savings_vs_full_prompt: median(
      scenarioResults.map((result) => result.prompt_envelope_savings_vs_full_prompt)
    ),
    median_route_tokens_estimated: median(scenarioResults.map((result) => result.route_tokens_estimated)),
    median_route_bytes: median(scenarioResults.map((result) => result.route_bytes)),
    max_route_tokens_estimated: Math.max(...scenarioResults.map((result) => result.route_tokens_estimated)),
    max_route_bytes: Math.max(...scenarioResults.map((result) => result.route_bytes)),
    median_token_savings_vs_full_load: median(
      scenarioResults.map((result) => result.token_savings_vs_full_load)
    ),
    median_byte_savings_vs_full_load: median(
      scenarioResults.map((result) => result.byte_savings_vs_full_load)
    ),
    median_token_overfetch_ratio: median(scenarioResults.map((result) => result.token_overfetch_ratio)),
    median_byte_overfetch_ratio: median(scenarioResults.map((result) => result.byte_overfetch_ratio))
  };
}

function buildProfilePromptResources(indexResources, unitContentMap, units) {
  return [
    ...indexResources.map((resource) => ({
      path: resource.path,
      title: resource.title,
      kind: resource.kind,
      content: resource.content
    })),
    ...units.map((unit) => ({
      path: unit.path,
      title: unit.title,
      kind: "unit",
      module_ids: unit.module_ids,
      content: unitContentMap.get(unit.id)
    }))
  ];
}

function loadTouchUnits(profile, scenario) {
  const mappedUnits = profile.touch_map[scenario.touch] ?? [];
  if (mappedUnits.length > 0) {
    return dedupe(mappedUnits);
  }
  return loadSemanticUnits(profile, scenario);
}

function loadSemanticUnits(profile, scenario) {
  const remaining = new Set(scenario.requiredModules);
  const selected = [];
  const lowerConcepts = scenario.concepts.map((concept) => concept.toLowerCase());
  const pool = profile.units.map((unit) => ({
    ...unit,
    score: scoreUnit(unit, lowerConcepts)
  }));

  while (remaining.size > 0 && selected.length < pool.length) {
    const candidates = pool
      .filter((unit) => !selected.includes(unit.id))
      .map((unit) => ({
        ...unit,
        coverage_gain: unit.module_ids.filter((moduleId) => remaining.has(moduleId)).length
      }))
      .filter((unit) => unit.coverage_gain > 0 || unit.score > 0)
      .sort((left, right) => {
        const rightComposite = right.coverage_gain * 5 + right.score;
        const leftComposite = left.coverage_gain * 5 + left.score;
        if (rightComposite !== leftComposite) {
          return rightComposite - leftComposite;
        }
        return left.tokens_estimated - right.tokens_estimated;
      });

    if (candidates.length === 0) {
      break;
    }

    const best = candidates[0];
    selected.push(best.id);
    for (const moduleId of best.module_ids) {
      remaining.delete(moduleId);
    }
  }

  return selected;
}

function scoreUnit(unit, concepts) {
  const haystack = [unit.title, unit.summary, ...(unit.tags ?? []), ...(unit.module_ids ?? [])]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const concept of concepts) {
    if (haystack.includes(concept)) {
      score += 2;
      continue;
    }
    const conceptParts = concept.split(/[\s-]+/);
    if (conceptParts.some((part) => part.length > 2 && haystack.includes(part))) {
      score += 1;
    }
  }
  return score;
}

function selectOracleUnits(units, requiredModules) {
  const selected = [];
  const remaining = new Set(requiredModules);
  const pool = [...units];

  while (remaining.size > 0) {
    const candidates = pool
      .filter((unit) => !selected.includes(unit))
      .map((unit) => ({
        unit,
        coverage_gain: unit.module_ids.filter((moduleId) => remaining.has(moduleId)).length
      }))
      .filter((item) => item.coverage_gain > 0)
      .sort((left, right) => {
        if (right.coverage_gain !== left.coverage_gain) {
          return right.coverage_gain - left.coverage_gain;
        }
        return left.unit.tokens_estimated - right.unit.tokens_estimated;
      });

    if (candidates.length === 0) {
      break;
    }

    const best = candidates[0].unit;
    selected.push(best);
    for (const moduleId of best.module_ids) {
      remaining.delete(moduleId);
    }
  }

  return selected;
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

  return `# AODS round-one benchmark evaluation report

## Executive summary

- **Dataset:** ${corpus.system_name} benchmark corpus with **${corpus.total_modules}** modules, **${corpus.total_human_surfaces}** human surfaces, **${corpus.total_items}** lifecycle items, **${corpus.shared_loading_queries}** shared loading queries, and **${corpus.drift_scenarios}** drift scenarios
- **Internal AODS result:** full lifecycle coverage, full fact preservation, **${byteSizeDelta}** by exact bytes, **${formatPercent(
    aodsBaseline.loading.objective_touch.hit_rate
  )}** objective touch-route hit rate, objective median rendered prompt envelope **${aodsBaseline.loading.objective_touch.median_prompt_envelope_bytes} bytes**, and **${formatPercent(aodsBaseline.drift.combined_recall)}** combined drift recall
- **External comparison headline:** AODS is the only baseline in round one with **${formatPercent(
    strongestGovernance.governance.native_drift_recall
  )}** native drift recall, while **${smallestCorpus.label}** is the smallest corpus by exact bytes and **${bestPrecision.label}** has the highest objective loading precision

**Round-one verdict:** AODS now has a defensible benchmark position. It is not the lightest representation by exact corpus size, but it is the only round-one profile that combines strong objective loading with native authority and governance controls. That means its value proposition is real for agent-heavy, drift-sensitive programs, but its corpus cost still needs optimization before it can replace lower-friction defaults everywhere.

## Evaluation scope

This report combines two layers of measurement:

1. **Internal self-evaluation:** whether AODS itself satisfies its own claims on lifecycle coverage, fidelity, progressive loading, and drift control
2. **External round-one comparison:** whether AODS still looks meaningful when compared against strong alternative documentation archetypes built from the same source facts

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
- exploratory semantic-load hit rate
- exploratory semantic-load precision
- exploratory semantic-load token savings

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
| Loading (objective) | ${formatPercent(aodsBaseline.loading.objective_touch.hit_rate)} hit rate, ${formatPercent(aodsBaseline.loading.objective_touch.average_precision)} average precision, ${formatPercent(aodsBaseline.loading.objective_touch.average_recall)} average recall, ${formatPercent(aodsBaseline.loading.objective_touch.median_byte_savings_vs_full_load)} median byte savings |
| Loading (advisory) | ${formatPercent(aodsBaseline.loading.exploratory_semantic.hit_rate)} hit rate, ${formatPercent(aodsBaseline.loading.exploratory_semantic.average_precision)} average precision, ${formatPercent(aodsBaseline.loading.exploratory_semantic.average_recall)} average recall, ${formatPercent(aodsBaseline.loading.exploratory_semantic.median_token_savings_vs_full_load)} median token savings |
| Drift | ${formatPercent(aodsBaseline.drift.built_in_recall)} built-in recall, ${formatPercent(aodsBaseline.drift.semantic_recall)} semantic recall, ${formatPercent(aodsBaseline.drift.combined_recall)} combined recall |
| Diversity audit | ${diversity.dataset_count} dataset, domains ${diversity.domains.join(", ")}, languages ${diversity.languages.join(", ")}, sync modes ${diversity.sync_modes.present.join(", ") || "none"} |
| Overhead | ${aodsBaseline.overhead.bookkeeping_entries} bookkeeping entries, ${formatRatio(aodsBaseline.overhead.bookkeeping_entries_per_artifact)} per artifact, ${aodsBaseline.overhead.touch_route_count} touch routes, ${aodsBaseline.overhead.role_count} roles |

**Internal reading:** AODS already proves lifecycle completeness and information preservation on this corpus. The weak spot is not representational coverage; it is corpus weight and benchmark diversity that is still narrower than a true field sample. The benchmark now treats repository-scale corpus bytes, loaded payload bytes, and rendered prompt-envelope bytes as separate measurements.

## Benchmark objectivity and diversity audit

- **Primary scoreboard basis:** exact bytes + objective touch-route scenarios
- **Context-footprint basis:** objective median rendered prompt-envelope bytes approximates task-time context occupancy, while median loaded bytes remain the lower-level payload counter underneath it
- **Advisory-only signals:** estimated token counts + exploratory semantic-load scenarios
- **Dataset count:** ${diversity.dataset_count}
- **Domains:** ${diversity.domains.join(", ")}
- **Languages:** ${diversity.languages.join(", ")}
- **Scenario split:** ${diversity.loading_scenarios.objective_count} objective loading scenarios, ${diversity.loading_scenarios.exploratory_count} exploratory loading scenarios
- **Sync modes present:** ${diversity.sync_modes.present.join(", ") || "none"}
- **Sync modes absent:** ${diversity.sync_modes.missing.join(", ") || "none"}
- **Pair scopes absent:** ${diversity.pair_scopes.missing.join(", ") || "none"}

This makes the round-one judgment more objective than the earlier benchmark pass, and it also makes the remaining diversity gaps explicit: the current benchmark is multi-domain and includes both agent-primary and human-primary sync, but it is still synthetic, English-only, and narrower than a field sample.

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

### What AODS proves

- AODS remains the strongest option when the target problem includes **native authority modeling**, **paired human+agent surfaces**, and **drift-aware governance**.
- AODS is no longer being judged only against itself; it now has external archetype baselines on the same dataset and scenario set.
- AODS is now being judged on an objective scoreboard built from exact size metrics, loaded payload size, rendered prompt-envelope size, and touch-route behavior rather than on heuristic token-only summaries.

### What the competitors prove against AODS

- **Markdown + YAML** pressures AODS on simplicity and practical docs-as-code ergonomics.
- **llms.txt** pressures AODS on minimal AI-facing overhead.
- **DITA** pressures AODS on modular structured documentation lineage and reusable topic architecture.
- All three baselines show that AODS does **not** yet win on corpus size by exact bytes, which keeps the compression claim unproven at repository scale.

### Current judgment

For large projects today, the benchmark supports this practical reading:

1. use **AODS** when the problem is specifically about agent authority, scoped loading, paired-surface governance, or drift-sensitive handoff
2. use **Markdown + YAML** when team ergonomics and low-friction authoring matter more than native governance semantics
3. treat **llms.txt** as a lightweight AI publishing layer, not as a replacement for strong lifecycle documentation governance
4. treat **DITA** as the strongest evidence that structured modular documentation existed before AODS and therefore remains the right benchmark family for proving structural value

## Limitations and next steps

- These corpora are **benchmark archetypes**, not full upstream toolchain integrations.
- Advisory metrics still include deterministic chars-per-token estimates and semantic-load heuristics.
- Rendered prompt-envelope bytes are still a benchmark renderer, not a capture of the exact final prompt envelope of a live agent runtime.
- The benchmark corpus is synthetic but lifecycle-complete, so this is a strong laboratory signal rather than a universal field sample.
- The benchmark still needs more diversity: more languages, more real-world corpora, and more runtime-backed toolchain samples.
- Round two should add Backstage or TechDocs runtime execution, plus narrower spec-first comparators such as OpenAPI, AsyncAPI, or TypeSpec for partial-domain benchmarking.

If AODS keeps outperforming these archetypes on loading and governance while reducing corpus cost, then the case for wider adoption becomes materially stronger.
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
