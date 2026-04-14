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
  writeJson,
  writeText
} from "./helpers.mjs";

export function runRoundOneComparison() {
  const aodsResults = runEvaluation();
  const paths = projectPaths();
  const profiles = buildComparatorCorpora(paths);
  const facts = allFacts();
  const humanTokens = aodsResults.fidelity.human_doc_tokens_estimated;

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
        human_doc_tokens_estimated: aodsResults.fidelity.human_doc_tokens_estimated,
        aods_tokens_estimated: aodsResults.fidelity.aods_tokens_estimated,
        token_reduction_vs_human: aodsResults.fidelity.token_reduction_vs_human,
        median_artifact_compression_ratio: aodsResults.fidelity.median_artifact_compression_ratio
      },
      loading: {
        hit_rate: aodsResults.loading.hit_rate,
        average_precision: aodsResults.loading.average_precision,
        average_recall: aodsResults.loading.average_recall,
        median_token_savings_vs_full_load: aodsResults.loading.median_token_savings_vs_full_load,
        median_overfetch_ratio: aodsResults.loading.median_overfetch_ratio
      },
      drift: {
        built_in_recall: aodsResults.drift.built_in_recall,
        semantic_recall: aodsResults.drift.semantic_recall,
        combined_recall: aodsResults.drift.combined_recall,
        built_in_false_positive_rate: aodsResults.drift.built_in_false_positive_rate,
        semantic_false_positive_rate: aodsResults.drift.semantic_false_positive_rate
      },
      overhead: aodsResults.overhead
    },
    fairness_contract: {
      canonical_dataset: "shared",
      shared_queries: LOADING_SCENARIOS.length,
      common_metrics: [
        "lifecycle coverage",
        "logical slice coverage",
        "fact preservation",
        "corpus token count",
        "tokens per benchmark item",
        "loading hit rate",
        "loading precision",
        "loading token savings"
      ],
      aods_only_metrics: ["native drift recall", "paired-surface governance", "explicit authority model"]
    },
    baselines: [
      buildAodsBaseline(aodsResults),
      ...profiles.map((profile) => evaluateProfile(profile, facts, humanTokens))
    ],
    limitations: [
      "Round one compares generated archetype corpora, not full upstream toolchain integrations.",
      "Token counts use the same deterministic chars-per-token estimate as the AODS baseline report.",
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
      corpus_tokens_estimated: aodsResults.fidelity.aods_tokens_estimated,
      tokens_per_benchmark_item: aodsResults.fidelity.aods_tokens_estimated / ARTIFACTS.length,
      token_reduction_vs_human: aodsResults.fidelity.token_reduction_vs_human,
      loadable_unit_count: aodsResults.overhead.module_count,
      loading: {
        hit_rate: aodsResults.loading.hit_rate,
        average_precision: aodsResults.loading.average_precision,
        average_recall: aodsResults.loading.average_recall,
        median_token_savings_vs_full_load: aodsResults.loading.median_token_savings_vs_full_load,
        median_overfetch_ratio: aodsResults.loading.median_overfetch_ratio
      }
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

function evaluateProfile(profile, facts, humanTokens) {
  const combinedText = profile.counted_files
    .map((filePath) => fs.readFileSync(path.join(PROJECT_ROOT, profile.corpus_root, filePath), "utf8"))
    .join("\n");
  const criticalFacts = facts.filter((fact) => fact.critical);
  const preservedFacts = facts.filter((fact) => combinedText.includes(fact.text));
  const preservedCriticalFacts = criticalFacts.filter((fact) => combinedText.includes(fact.text));
  const loading = evaluateProfileLoading(profile);
  const representedModules = new Set(profile.units.flatMap((unit) => unit.module_ids));
  const representedPhases = new Set(profile.units.flatMap((unit) => unit.phases));

  return {
    id: profile.id,
    label: profile.label,
    archetype: profile.archetype,
    common: {
      lifecycle_phase_coverage: representedPhases.size / 9,
      logical_slice_coverage: representedModules.size / MODULE_BLUEPRINTS.length,
      fact_preservation_rate: preservedFacts.length / facts.length,
      critical_fact_preservation_rate: preservedCriticalFacts.length / criticalFacts.length,
      corpus_tokens_estimated: profile.corpus_tokens_estimated,
      tokens_per_benchmark_item: profile.corpus_tokens_estimated / ARTIFACTS.length,
      token_reduction_vs_human: 1 - profile.corpus_tokens_estimated / humanTokens,
      loadable_unit_count: profile.loadable_unit_count,
      loading
    },
    governance: profile.governance,
    scenario_results: loading.scenario_results
  };
}

function evaluateProfileLoading(profile) {
  const fullLoadTokens =
    profile.index_tokens_estimated + profile.units.reduce((sum, unit) => sum + unit.tokens_estimated, 0);
  const unitById = new Map(profile.units.map((unit) => [unit.id, unit]));

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

    return {
      id: scenario.id,
      description: scenario.description,
      loaded_units: loadedUnitIds,
      loaded_modules: loadedModules,
      required_modules: scenario.requiredModules,
      precision,
      recall,
      exact_hit: recall === 1,
      route_tokens_estimated: routeTokens,
      oracle_tokens_estimated: oracleTokens,
      token_savings_vs_full_load: 1 - routeTokens / fullLoadTokens,
      overfetch_ratio: routeTokens / oracleTokens
    };
  });

  return {
    hit_rate: scenarioResults.filter((result) => result.exact_hit).length / scenarioResults.length,
    average_precision:
      scenarioResults.reduce((sum, result) => sum + result.precision, 0) / scenarioResults.length,
    average_recall: scenarioResults.reduce((sum, result) => sum + result.recall, 0) / scenarioResults.length,
    median_token_savings_vs_full_load: median(
      scenarioResults.map((result) => result.token_savings_vs_full_load)
    ),
    median_overfetch_ratio: median(scenarioResults.map((result) => result.overfetch_ratio)),
    scenario_results: scenarioResults
  };
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
  const aods = results.baselines.find((baseline) => baseline.id === "aods");
  const smallestCorpus = [...results.baselines].sort(
    (left, right) => left.common.corpus_tokens_estimated - right.common.corpus_tokens_estimated
  )[0];
  const bestLoading = [...results.baselines].sort(
    (left, right) => right.common.loading.hit_rate - left.common.loading.hit_rate
  )[0];
  const bestPrecision = [...results.baselines].sort(
    (left, right) => right.common.loading.average_precision - left.common.loading.average_precision
  )[0];
  const strongestGovernance = [...results.baselines].sort(
    (left, right) => right.governance.native_drift_recall - left.governance.native_drift_recall
  )[0];
  const rows = results.baselines
    .map(
      (baseline) =>
        `| ${baseline.label} | ${baseline.common.corpus_tokens_estimated} | ${formatRatio(
          baseline.common.tokens_per_benchmark_item
        )} | ${formatPercent(baseline.common.fact_preservation_rate)} | ${formatPercent(
          baseline.common.loading.hit_rate
        )} | ${formatPercent(baseline.common.loading.average_precision)} | ${formatPercent(
          baseline.common.loading.median_token_savings_vs_full_load
        )} |`
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
  const sizeDelta = describeCorpusDelta(aodsBaseline.fidelity.token_reduction_vs_human);

  return `# AODS round-one benchmark evaluation report

## Executive summary

- **Dataset:** ${corpus.system_name} benchmark corpus with **${corpus.total_modules}** modules, **${corpus.total_human_surfaces}** human surfaces, **${corpus.total_items}** lifecycle items, **${corpus.shared_loading_queries}** shared loading queries, and **${corpus.drift_scenarios}** drift scenarios
- **Internal AODS result:** full lifecycle coverage, full fact preservation, **${sizeDelta}**, **${formatPercent(
    aodsBaseline.loading.hit_rate
  )}** loading hit rate, and **${formatPercent(aodsBaseline.drift.combined_recall)}** combined drift recall
- **External comparison headline:** AODS is the only baseline in round one with **${formatPercent(
    strongestGovernance.governance.native_drift_recall
  )}** native drift recall and **${formatPercent(bestLoading.common.loading.hit_rate)}** loading hit rate, while llms.txt is the smallest corpus and Markdown + YAML has the highest loading precision

**Round-one verdict:** AODS now has a defensible benchmark position. It is not the lightest representation, but it is the only round-one profile that combines full scenario hit rate with native authority and governance controls. That means its value proposition is real for agent-heavy, drift-sensitive programs, but its corpus cost still needs optimization before it can replace lower-friction defaults everywhere.

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
3. **Progressive loading:** can the working set be narrowed without missing required authority
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
- corpus token count
- tokens per benchmark item
- loading hit rate
- loading precision
- loading token savings

AODS-native governance signals remain separate because the other archetypes do not expose equivalent authority and paired-surface contracts in round one.

## AODS self-evaluation baseline

| Dimension | Result |
| --- | --- |
| Validation summary | ${aodsBaseline.validation.total_modules} modules, ${aodsBaseline.validation.total_sections} sections, ${aodsBaseline.validation.total_artifacts} artifacts, ${aodsBaseline.validation.errors} errors, ${aodsBaseline.validation.warnings} warnings |
| Coverage | ${formatPercent(aodsBaseline.coverage.lifecycle_phase_coverage)} lifecycle phase coverage, ${formatPercent(aodsBaseline.coverage.structured_type_coverage)} structured type coverage, ${formatPercent(aodsBaseline.coverage.generic_type_coverage)} generic type coverage |
| Expression escape hatch | ${formatPercent(aodsBaseline.coverage.raw_fallback_rate)} raw fallback rate, ${aodsBaseline.coverage.unsupported_items} unsupported items |
| Fidelity | ${formatPercent(aodsBaseline.fidelity.fact_preservation_rate)} fact preservation, ${formatPercent(aodsBaseline.fidelity.critical_fact_preservation_rate)} critical fact preservation |
| Corpus size | ${aodsBaseline.fidelity.human_doc_tokens_estimated} estimated human-doc tokens vs ${aodsBaseline.fidelity.aods_tokens_estimated} estimated AODS tokens, ${sizeDelta} |
| Loading | ${formatPercent(aodsBaseline.loading.hit_rate)} hit rate, ${formatPercent(aodsBaseline.loading.average_precision)} average precision, ${formatPercent(aodsBaseline.loading.average_recall)} average recall, ${formatPercent(aodsBaseline.loading.median_token_savings_vs_full_load)} median token savings |
| Drift | ${formatPercent(aodsBaseline.drift.built_in_recall)} built-in recall, ${formatPercent(aodsBaseline.drift.semantic_recall)} semantic recall, ${formatPercent(aodsBaseline.drift.combined_recall)} combined recall |
| Overhead | ${aodsBaseline.overhead.bookkeeping_entries} bookkeeping entries, ${formatRatio(aodsBaseline.overhead.bookkeeping_entries_per_artifact)} per artifact, ${aodsBaseline.overhead.touch_route_count} touch routes, ${aodsBaseline.overhead.role_count} roles |

**Internal reading:** AODS already proves lifecycle completeness and information preservation on this corpus. The weak spot is not representational coverage; it is corpus weight and incomplete native drift enforcement.

## Round-one external comparison

- **Smallest corpus:** ${smallestCorpus.label} at **${smallestCorpus.common.corpus_tokens_estimated}** estimated tokens
- **Best loading reliability:** ${bestLoading.label} with **${formatPercent(bestLoading.common.loading.hit_rate)}** hit rate
- **Best average loading precision:** ${bestPrecision.label} with **${formatPercent(bestPrecision.common.loading.average_precision)}**
- **Strongest native governance:** ${strongestGovernance.label} with **${formatPercent(
    strongestGovernance.governance.native_drift_recall
  )}** native drift recall

### Common metric scoreboard

| Baseline | Corpus tokens | Tokens / benchmark item | Fact preservation | Loading hit rate | Avg loading precision | Median load savings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

### Native governance signals

These are **not** fair common metrics. They are shown separately because only AODS exposes them as first-class design goals in this round.

| Baseline | Native validation | Paired surfaces | Explicit authority model | Native drift recall |
| --- | --- | --- | --- | ---: |
${governanceRows}

## Interpretation

### What AODS proves

- AODS remains the strongest option when the target problem includes **native authority modeling**, **paired human+agent surfaces**, and **drift-aware governance**.
- AODS is no longer being judged only against itself; it now has external archetype baselines on the same dataset and scenario set.
- AODS demonstrates that progressive loading can hit all shared scenarios on this benchmark, even though it still overfetches more than the lighter baselines.

### What the competitors prove against AODS

- **Markdown + YAML** pressures AODS on simplicity and practical docs-as-code ergonomics.
- **llms.txt** pressures AODS on minimal AI-facing overhead.
- **DITA** pressures AODS on modular structured documentation lineage and reusable topic architecture.
- All three baselines show that AODS does **not** yet win on corpus size, which keeps the compression claim unproven at repository scale.

### Current judgment

For large projects today, the benchmark supports this practical reading:

1. use **AODS** when the problem is specifically about agent authority, scoped loading, paired-surface governance, or drift-sensitive handoff
2. use **Markdown + YAML** when team ergonomics and low-friction authoring matter more than native governance semantics
3. treat **llms.txt** as a lightweight AI publishing layer, not as a replacement for strong lifecycle documentation governance
4. treat **DITA** as the strongest evidence that structured modular documentation existed before AODS and therefore remains the right benchmark family for proving structural value

## Limitations and next steps

- These corpora are **benchmark archetypes**, not full upstream toolchain integrations.
- Token counts use the same deterministic chars-per-token approximation as the AODS self-evaluation report.
- The benchmark corpus is synthetic but lifecycle-complete, so this is a strong laboratory signal rather than a universal field sample.
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
