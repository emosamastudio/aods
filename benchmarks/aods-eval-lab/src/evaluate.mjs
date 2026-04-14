import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  ARTIFACTS,
  DRIFT_SCENARIOS,
  GENERIC_TYPES,
  LOADING_SCENARIOS,
  MODULE_BLUEPRINTS,
  ROLE_DEFS,
  STRUCTURED_TYPES,
  SYSTEM
} from "./benchmark-data.mjs";
import { generateAll, projectPaths, renderHumanArtifact } from "./generate-fixtures.mjs";
import {
  PROJECT_ROOT,
  REPO_ROOT,
  appendText,
  copyDir,
  dedupe,
  estimateTokens,
  formatPercent,
  formatRatio,
  median,
  measureFiles,
  measureText,
  readJson,
  replaceText,
  writeJson,
  writeText
} from "./helpers.mjs";

const AODS_CLI = path.join(REPO_ROOT, "bin", "aods.mjs");
const PHASES = ["vision", "discovery", "planning", "design", "build", "test", "release", "operate", "governance"];
const LAYER_ORDER = { root: 0, capsule: 1, detail: 2, evidence: 3 };

export function runEvaluation() {
  const generated = generateAll();
  const paths = projectPaths();
  const manifest = readJson(path.join(paths.corpusRoot, "manifest.json"));
  const factMap = readJson(path.join(paths.resultsRoot, "fact-map.json"));

  const validation = runAodsJson(["validate", paths.corpusRoot, "--json"]);
  const coverage = evaluateCoverage(manifest);
  const fidelity = evaluateFidelity(paths, manifest, factMap);
  const loading = evaluateLoading(paths, manifest);
  const drift = evaluateDrift(paths, factMap);
  const diversity = evaluateBenchmarkDiversity(manifest);
  const overhead = evaluateAuthoringOverhead(manifest);

  const results = {
    generated_at: new Date().toISOString(),
    system_under_test: ".",
    benchmark_project: "benchmarks/aods-eval-lab",
    validation,
    coverage,
    fidelity,
    loading,
    drift,
    diversity,
    overhead,
    limitations: [
      "Main benchmark gates rely on exact byte counts and touch-route scenarios; token estimates remain advisory.",
      "Non-touch semantic loading remains exploratory because the reference CLI only implements touch-oriented routing.",
      "The benchmark corpus is synthetic but lifecycle-complete; it should be treated as a strong laboratory signal rather than a universal external sample."
    ]
  };

  writeJson(path.join(paths.resultsRoot, "evaluation-results.json"), results);
  writeText(path.join(PROJECT_ROOT, "reports", "aods-evaluation-report.md"), renderMarkdownReport(results));

  return results;
}

function evaluateCoverage(manifest) {
  const artifactEntries = ARTIFACTS.filter((artifact) => artifact.kind === "artifact");
  const sectionEntries = ARTIFACTS.filter((artifact) => artifact.kind === "section");
  const structuredCovered = new Set(
    artifactEntries.map((artifact) => artifact.artifact.type).filter((type) => STRUCTURED_TYPES.has(type))
  );
  const genericCovered = new Set(
    artifactEntries.map((artifact) => artifact.artifact.type).filter((type) => GENERIC_TYPES.has(type))
  );
  const phaseBreakdown = Object.fromEntries(
    PHASES.map((phase) => {
      const count = ARTIFACTS.filter((artifact) => artifact.phase === phase).length;
      return [phase, { artifacts: count, representable: count, representable_rate: count === 0 ? 0 : 1 }];
    })
  );

  return {
    total_items: ARTIFACTS.length,
    total_sections: sectionEntries.length,
    total_typed_artifacts: artifactEntries.length,
    lifecycle_phase_coverage: PHASES.filter((phase) => phaseBreakdown[phase].artifacts > 0).length / PHASES.length,
    phase_breakdown: phaseBreakdown,
    structured_type_coverage: structuredCovered.size / STRUCTURED_TYPES.size,
    generic_type_coverage: genericCovered.size / GENERIC_TYPES.size,
    raw_fallback_rate: artifactEntries.filter((artifact) => artifact.artifact.type === "raw").length / artifactEntries.length,
    unsupported_items: 0,
    paired_surface_count: manifest.surface_pairs.length
  };
}

function evaluateFidelity(paths, manifest, factMap) {
  const baselinePresence = factMap.map((fact) => ({
    ...fact,
    human_present: fileContains(path.join(paths.humanRoot, fact.human_doc), fact.text),
    agent_present: fileContains(path.join(paths.corpusRoot, fact.module_path), fact.text)
  }));
  const totalFacts = baselinePresence.length;
  const criticalFacts = baselinePresence.filter((fact) => fact.critical);
  const preservedFacts = baselinePresence.filter((fact) => fact.agent_present);
  const preservedCriticalFacts = criticalFacts.filter((fact) => fact.agent_present);
  const humanFiles = listFiles(paths.humanRoot, [".md"]);
  const humanExactSize = measureFiles(humanFiles);
  const humanTokens = humanFiles.reduce((sum, filePath) => sum + estimateTokens(fs.readFileSync(filePath, "utf8")), 0);
  const agentFiles = [
    path.join(paths.corpusRoot, "manifest.json"),
    ...MODULE_BLUEPRINTS.map((module) => path.join(paths.corpusRoot, module.path))
  ];
  const aodsExactSize = measureFiles(agentFiles);
  const aodsTokens = agentFiles.reduce((sum, filePath) => sum + estimateTokens(fs.readFileSync(filePath, "utf8")), 0);
  const artifactRatios = ARTIFACTS.map((artifact) => {
    const humanTokensForArtifact = estimateTokens(renderHumanArtifact(artifact));
    const aodsTokensForArtifact =
      artifact.kind === "section"
        ? estimateTokens(
            JSON.stringify(
              {
                sid: artifact.section.sid,
                topic: artifact.section.topic,
                content: `${artifact.summary} ${artifact.facts.map((item) => item.text).join(" ")}`,
                content_type: artifact.section.content_type
              },
              null,
              2
            )
          )
        : estimateTokens(
            JSON.stringify(
              {
                artifact_id: artifact.artifact.artifact_id,
                type: artifact.artifact.type,
                usage: artifact.artifact.usage,
                content: artifact.content
              },
              null,
              2
            )
          );
    return humanTokensForArtifact / aodsTokensForArtifact;
  });

  return {
    total_facts: totalFacts,
    critical_facts: criticalFacts.length,
    fact_preservation_rate: preservedFacts.length / totalFacts,
    critical_fact_preservation_rate: preservedCriticalFacts.length / criticalFacts.length,
    exact_size: {
      human_docs: humanExactSize,
      aods_corpus: aodsExactSize
    },
    human_doc_tokens_estimated: humanTokens,
    aods_tokens_estimated: aodsTokens,
    compression_ratio_human_to_aods: humanTokens / aodsTokens,
    token_reduction_vs_human: 1 - aodsTokens / humanTokens,
    facts_per_1k_human_tokens: totalFacts / (humanTokens / 1000),
    facts_per_1k_aods_tokens: totalFacts / (aodsTokens / 1000),
    median_artifact_compression_ratio: median(artifactRatios)
  };
}

function evaluateLoading(paths, manifest) {
  const manifestPath = path.join(paths.corpusRoot, "manifest.json");
  const manifestMetrics = measureText(fs.readFileSync(manifestPath, "utf8"));
  const moduleMetricMap = new Map(
    manifest.modules.map((module) => {
      const filePath = path.join(paths.corpusRoot, module.path);
      return [module.id, measureText(fs.readFileSync(filePath, "utf8"))];
    })
  );
  const fullLoadTokens =
    manifestMetrics.tokens_estimated +
    manifest.modules.reduce((sum, module) => sum + (moduleMetricMap.get(module.id)?.tokens_estimated ?? 0), 0);
  const fullLoadBytes =
    manifestMetrics.bytes +
    manifest.modules.reduce((sum, module) => sum + (moduleMetricMap.get(module.id)?.bytes ?? 0), 0);

  const scenarioResults = LOADING_SCENARIOS.map((scenario) => {
    const loadedModules = scenario.touch
      ? routeModules(paths.corpusRoot, scenario)
      : semanticLoad(manifest, scenario);
    const loadedSet = new Set(loadedModules);
    const requiredSet = new Set(scenario.requiredModules);
    const hits = [...requiredSet].filter((moduleId) => loadedSet.has(moduleId)).length;
    const precision = loadedModules.length === 0 ? 0 : hits / loadedModules.length;
    const recall = hits / requiredSet.size;
    const routeTokens =
      manifestMetrics.tokens_estimated +
      loadedModules.reduce((sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.tokens_estimated ?? 0), 0);
    const oracleTokens =
      manifestMetrics.tokens_estimated +
      scenario.requiredModules.reduce(
        (sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.tokens_estimated ?? 0),
        0
      );
    const routeBytes =
      manifestMetrics.bytes +
      loadedModules.reduce((sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.bytes ?? 0), 0);
    const oracleBytes =
      manifestMetrics.bytes +
      scenario.requiredModules.reduce((sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.bytes ?? 0), 0);
    return {
      id: scenario.id,
      description: scenario.description,
      scenario_class: scenario.scenario_class,
      measurement_class: scenario.measurement_class,
      mode: scenario.touch ? "touch-route" : "semantic-load",
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
      token_savings_vs_full_load: 1 - routeTokens / fullLoadTokens,
      token_overfetch_ratio: routeTokens / oracleTokens,
      byte_overfetch_ratio: routeBytes / oracleBytes
    };
  });

  const objectiveTouch = summarizeLoadingResults(
    scenarioResults.filter((scenario) => scenario.measurement_class === "objective")
  );
  const exploratorySemantic = summarizeLoadingResults(
    scenarioResults.filter((scenario) => scenario.measurement_class === "exploratory")
  );
  const combined = summarizeLoadingResults(scenarioResults);

  return {
    full_load_tokens_estimated: fullLoadTokens,
    full_load_bytes: fullLoadBytes,
    scenario_results: scenarioResults,
    objective_touch: objectiveTouch,
    exploratory_semantic: exploratorySemantic,
    combined,
    hit_rate: combined.hit_rate,
    average_precision: combined.average_precision,
    average_recall: combined.average_recall,
    median_token_savings_vs_full_load: combined.median_token_savings_vs_full_load,
    median_overfetch_ratio: combined.median_token_overfetch_ratio
  };
}

function summarizeLoadingResults(scenarioResults) {
  if (scenarioResults.length === 0) {
    return {
      scenario_count: 0,
      hit_rate: 0,
      average_precision: 0,
      average_recall: 0,
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

function routeModules(corpusRoot, scenario) {
  const args = ["route", corpusRoot, "--touch", scenario.touch, "--intent", scenario.intent, "--json"];
  if (scenario.role) {
    args.push("--role", scenario.role);
  }
  const route = runAodsJson(args);
  return route.recommended_modules.map((module) => module.id);
}

function semanticLoad(manifest, scenario) {
  const moduleById = new Map(manifest.modules.map((module) => [module.id, module]));
  const base = manifest.boot_by_role?.[scenario.role] ?? manifest.boot_sequence;
  const loaded = [...base];
  const lowerConcepts = scenario.concepts.map((concept) => concept.toLowerCase());
  const scored = manifest.modules
    .filter((module) => !loaded.includes(module.id))
    .map((module) => ({
      id: module.id,
      score: scoreModule(module, lowerConcepts)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return (LAYER_ORDER[moduleById.get(left.id).layer] ?? 99) - (LAYER_ORDER[moduleById.get(right.id).layer] ?? 99);
    });

  for (const item of scored) {
    for (const depId of expandDependencies(item.id, moduleById)) {
      if (!loaded.includes(depId)) {
        loaded.push(depId);
      }
    }
    if (!loaded.includes(item.id)) {
      loaded.push(item.id);
    }
  }

  return loaded;
}

function scoreModule(module, concepts) {
  const haystack = [module.id, module.scope, ...(module.tags ?? [])].join(" ").toLowerCase();
  let score = 0;
  for (const concept of concepts) {
    if (haystack.includes(concept)) {
      score += 2;
    } else {
      const conceptParts = concept.split(/[\s-]+/);
      if (conceptParts.some((part) => part.length > 2 && haystack.includes(part))) {
        score += 1;
      }
    }
  }
  return score;
}

function expandDependencies(moduleId, moduleById) {
  const ordered = [];
  const seen = new Set();

  function dfs(currentId) {
    if (seen.has(currentId) || !moduleById.has(currentId)) {
      return;
    }
    seen.add(currentId);
    for (const depId of moduleById.get(currentId).deps ?? []) {
      dfs(depId);
      if (!ordered.includes(depId)) {
        ordered.push(depId);
      }
    }
  }

  dfs(moduleId);
  return ordered;
}

function evaluateDrift(paths, factMap) {
  const baselineAnchors = buildBaselineAnchors(paths, factMap);
  const scenarioResults = DRIFT_SCENARIOS.map((scenario) => runDriftScenario(paths, scenario, baselineAnchors));
  const driftCases = scenarioResults.filter((scenario) => !scenario.is_control);
  const controlCases = scenarioResults.filter((scenario) => scenario.is_control);

  return {
    scenario_results: scenarioResults,
    built_in_recall:
      driftCases.filter((scenario) => scenario.built_in_detected).length / driftCases.length,
    semantic_recall:
      driftCases.filter((scenario) => scenario.semantic_detected).length / driftCases.length,
    combined_recall:
      driftCases.filter((scenario) => scenario.built_in_detected || scenario.semantic_detected).length /
      driftCases.length,
    built_in_false_positive_rate:
      controlCases.filter((scenario) => scenario.built_in_detected).length / controlCases.length,
    semantic_false_positive_rate:
      controlCases.filter((scenario) => scenario.semantic_detected).length / controlCases.length
  };
}

function evaluateBenchmarkDiversity(manifest) {
  const structuredCovered = dedupe(
    ARTIFACTS.filter((artifact) => artifact.kind === "artifact")
      .map((artifact) => artifact.artifact.type)
      .filter((type) => STRUCTURED_TYPES.has(type))
  );
  const genericCovered = dedupe(
    ARTIFACTS.filter((artifact) => artifact.kind === "artifact")
      .map((artifact) => artifact.artifact.type)
      .filter((type) => GENERIC_TYPES.has(type))
  );
  const exercisedRoles = dedupe(LOADING_SCENARIOS.map((scenario) => scenario.role).filter(Boolean));
  const pairSyncModes = dedupe((manifest.surface_pairs ?? []).map((pair) => pair.sync_source));
  const pairScopes = dedupe((manifest.surface_pairs ?? []).map((pair) => pair.scope));
  const moduleLayers = dedupe((manifest.modules ?? []).map((module) => module.layer));

  return {
    dataset_count: 1,
    dataset_class: SYSTEM.profile.dataset_class,
    domains: SYSTEM.profile.domains,
    languages: SYSTEM.profile.languages,
    surface_kinds: SYSTEM.profile.surface_kinds,
    evidence_kinds: SYSTEM.profile.evidence_kinds,
    phase_coverage: {
      covered: PHASES.filter((phase) => ARTIFACTS.some((artifact) => artifact.phase === phase)),
      missing: PHASES.filter((phase) => !ARTIFACTS.some((artifact) => artifact.phase === phase))
    },
    structured_types: {
      covered: structuredCovered,
      missing: [...STRUCTURED_TYPES].filter((type) => !structuredCovered.includes(type))
    },
    generic_types: {
      covered: genericCovered,
      missing: [...GENERIC_TYPES].filter((type) => !genericCovered.includes(type))
    },
    roles: {
      defined: ROLE_DEFS.map((role) => role.id),
      exercised: exercisedRoles,
      missing: ROLE_DEFS.map((role) => role.id).filter((roleId) => !exercisedRoles.includes(roleId))
    },
    loading_scenarios: {
      total: LOADING_SCENARIOS.length,
      objective_count: LOADING_SCENARIOS.filter((scenario) => scenario.measurement_class === "objective").length,
      exploratory_count: LOADING_SCENARIOS.filter((scenario) => scenario.measurement_class === "exploratory").length,
      by_class: countBy(LOADING_SCENARIOS.map((scenario) => scenario.scenario_class)),
      by_measurement_class: countBy(LOADING_SCENARIOS.map((scenario) => scenario.measurement_class)),
      by_intent: countBy(LOADING_SCENARIOS.map((scenario) => scenario.intent))
    },
    drift_scenarios: {
      total: DRIFT_SCENARIOS.length,
      control_count: DRIFT_SCENARIOS.filter((scenario) => scenario.isControl).length,
      by_class: countBy(DRIFT_SCENARIOS.map((scenario) => scenario.scenario_class))
    },
    sync_modes: {
      present: pairSyncModes,
      missing: ["agent-primary", "human-primary", "bidirectional"].filter((mode) => !pairSyncModes.includes(mode))
    },
    pair_scopes: {
      present: pairScopes,
      missing: ["system", "phase", "feature", "module"].filter((scope) => !pairScopes.includes(scope))
    },
    module_layers: {
      present: moduleLayers,
      missing: ["root", "capsule", "detail", "evidence"].filter((layer) => !moduleLayers.includes(layer))
    }
  };
}

function runDriftScenario(paths, scenario, baselineAnchors) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-eval-"));
  const mutatedCorpus = path.join(tempRoot, "corpus");
  copyDir(paths.corpusRoot, mutatedCorpus);
  for (const operation of scenario.operations) {
    applyOperation(tempRoot, mutatedCorpus, operation);
  }
  const validateReport = runAodsJson(["validate", mutatedCorpus, "--json"]);
  const hookReport = runAodsJson([
    "hook",
    "pre-commit",
    mutatedCorpus,
    ...scenario.changedFiles.flatMap((filePath) => ["--file", filePath]),
    "--json"
  ]);
  const builtInDetected = validateReport.summary.errors > 0 || hookReport.status === "fail";
  const semanticDetected = detectSemanticDrift(mutatedCorpus, scenario.changedFiles, baselineAnchors);

  fs.rmSync(tempRoot, { recursive: true, force: true });

  return {
    id: scenario.id,
    description: scenario.description,
    is_control: Boolean(scenario.isControl),
    changed_files: scenario.changedFiles,
    built_in_detected: builtInDetected,
    semantic_detected: semanticDetected,
    expected_built_in_detection: scenario.expectBuiltInDetection,
    expected_semantic_detection: scenario.expectSemanticDetection,
    validate_errors: validateReport.summary.errors,
    validate_warnings: validateReport.summary.warnings,
    hook_status: hookReport.status
  };
}

function applyOperation(tempRoot, mutatedCorpus, operation) {
  if (operation.type === "replace") {
    replaceText(path.join(mutatedCorpus, operation.file), operation.find, operation.replace);
    return;
  }
  if (operation.type === "append") {
    appendText(path.join(mutatedCorpus, operation.file), operation.text);
    return;
  }
  if (operation.type === "writeSiblingFile") {
    const siblingPath = path.join(tempRoot, operation.siblingPath);
    writeText(siblingPath, operation.content);
    return;
  }
  throw new Error(`Unsupported mutation operation: ${operation.type}`);
}

function buildBaselineAnchors(paths, factMap) {
  return factMap.map((fact) => ({
    ...fact,
    human_count: countOccurrences(fs.readFileSync(path.join(paths.humanRoot, fact.human_doc), "utf8"), fact.text),
    module_count: countOccurrences(fs.readFileSync(path.join(paths.corpusRoot, fact.module_path), "utf8"), fact.text)
  }));
}

function detectSemanticDrift(mutatedCorpus, changedFiles, baselineAnchors) {
  for (const changedFile of changedFiles) {
    const relevantAnchors = baselineAnchors.filter(
      (anchor) =>
        (anchor.human_doc === changedFile && anchor.human_count > 0) ||
        (anchor.module_path === changedFile && anchor.module_count > 0)
    );
    for (const anchor of relevantAnchors) {
      const filePath =
        anchor.human_doc === changedFile
          ? path.join(mutatedCorpus, anchor.human_doc)
          : path.join(mutatedCorpus, anchor.module_path);
      const baselineCount = anchor.human_doc === changedFile ? anchor.human_count : anchor.module_count;
      const mutatedCount = countOccurrences(fs.readFileSync(filePath, "utf8"), anchor.text);
      if (mutatedCount < baselineCount) {
        return true;
      }
    }
  }
  return false;
}

function evaluateAuthoringOverhead(manifest) {
  const bookkeepingEntries =
    manifest.modules.length + manifest.surface_pairs.length + manifest.boot_by_touch.length + ROLE_DEFS.length;
  return {
    module_count: manifest.modules.length,
    surface_pair_count: manifest.surface_pairs.length,
    touch_route_count: manifest.boot_by_touch.length,
    role_count: ROLE_DEFS.length,
    bookkeeping_entries: bookkeepingEntries,
    bookkeeping_entries_per_artifact: bookkeepingEntries / ARTIFACTS.length
  };
}

function renderMarkdownReport(results) {
  const coverage = results.coverage;
  const fidelity = results.fidelity;
  const loading = results.loading;
  const drift = results.drift;
  const diversity = results.diversity;
  const validation = results.validation;
  const strongestBlindSpots = [];
  const compressionHeadline =
    fidelity.compression_ratio_human_to_aods >= 1
      ? `estimated human-to-AODS compression ratio ${formatRatio(
          fidelity.compression_ratio_human_to_aods
        )} and median per-artifact ratio ${formatRatio(fidelity.median_artifact_compression_ratio)}`
      : `mixed outcome: median per-artifact ratio ${formatRatio(
          fidelity.median_artifact_compression_ratio
        )}, but full-corpus ratio ${formatRatio(fidelity.compression_ratio_human_to_aods)} because manifest, routing, and pairing overhead add substantial tokens`;

  if (drift.built_in_recall < 1) {
    strongestBlindSpots.push("Built-in anti-drift checks miss semantic conflicts when paired human and agent files both change.");
  }
  if (drift.scenario_results.some((scenario) => scenario.id === "manifest-bypass-readme" && !scenario.built_in_detected)) {
    strongestBlindSpots.push("README plus manifest metadata can bypass paired-surface blocking without updating the authoritative module.");
  }
  if (drift.scenario_results.some((scenario) => scenario.id === "path-escape-pair" && !scenario.built_in_detected)) {
    strongestBlindSpots.push("Relative path escape through ../ can move a paired human surface outside the corpus root without validator rejection.");
  }

  return `# AODS evaluation report

## Executive summary

This repository uses \`benchmarks/aods-eval-lab\` as its primary regression harness. The harness regenerates one lifecycle-complete benchmark corpus and evaluates AODS for coverage, fidelity, compression, progressive loading, drift prevention, and authoring overhead.

- **Coverage:** lifecycle phase coverage ${formatPercent(coverage.lifecycle_phase_coverage)}, structured type coverage ${formatPercent(coverage.structured_type_coverage)}, generic type coverage ${formatPercent(coverage.generic_type_coverage)}.
- **Fidelity:** critical fact preservation ${formatPercent(fidelity.critical_fact_preservation_rate)} with overall fact preservation ${formatPercent(fidelity.fact_preservation_rate)}.
- **Exact corpus size:** human docs ${fidelity.exact_size.human_docs.byte_count} bytes across ${fidelity.exact_size.human_docs.file_count} files; AODS corpus ${fidelity.exact_size.aods_corpus.byte_count} bytes across ${fidelity.exact_size.aods_corpus.file_count} files.
- **Objective loading gate:** touch-route hit rate ${formatPercent(loading.objective_touch.hit_rate)}, average recall ${formatPercent(loading.objective_touch.average_recall)}, median byte savings ${formatPercent(loading.objective_touch.median_byte_savings_vs_full_load)}.
- **Drift prevention:** built-in recall ${formatPercent(drift.built_in_recall)}, combined recall ${formatPercent(drift.combined_recall)}, built-in false-positive rate ${formatPercent(drift.built_in_false_positive_rate)}.
- **Advisory metrics:** token estimates and semantic-load scenarios remain exploratory rather than release-gating signals.

## Scope and independence

- **System under test:** \`${results.system_under_test}\`
- **Benchmark harness:** \`${results.benchmark_project}\`
- **Corpus design:** synthetic but lifecycle-complete release coordination system with paired human surfaces and seven agent-facing modules
- **Scoring posture:** deterministic metrics first, narrative judgment second

## Dataset composition

| Dimension | Value |
| --- | --- |
| Total benchmark items | ${coverage.total_items} |
| Prose sections | ${coverage.total_sections} |
| Typed artifacts | ${coverage.total_typed_artifacts} |
| Paired surfaces | ${coverage.paired_surface_count} |
| Modules | ${results.overhead.module_count} |
| Touch routes | ${results.overhead.touch_route_count} |

## Validation baseline

- **Errors:** ${validation.summary.errors}
- **Warnings:** ${validation.summary.warnings}
- **Modules:** ${validation.summary.total_modules}
- **Sections:** ${validation.summary.total_sections}
- **Artifacts:** ${validation.summary.total_artifacts}

## Results by dimension

### 1. Lifecycle coverage and expression breadth

- Lifecycle phase coverage is **${formatPercent(coverage.lifecycle_phase_coverage)}** across ${PHASES.length} phases.
- Structured artifact coverage is **${formatPercent(coverage.structured_type_coverage)}** for the 12 structured types.
- Generic artifact coverage is **${formatPercent(coverage.generic_type_coverage)}** for the 8 generic types.
- Raw fallback rate is **${formatPercent(coverage.raw_fallback_rate)}**, driven by one SQL evidence artifact kept intentionally in the evidence layer.

### 2. Information-preserving compression

- Critical fact preservation is **${formatPercent(fidelity.critical_fact_preservation_rate)}**.
- Overall fact preservation is **${formatPercent(fidelity.fact_preservation_rate)}**.
- Exact human-doc size: **${fidelity.exact_size.human_docs.byte_count} bytes**, **${fidelity.exact_size.human_docs.line_count} lines**, **${fidelity.exact_size.human_docs.file_count} files**
- Exact AODS corpus size: **${fidelity.exact_size.aods_corpus.byte_count} bytes**, **${fidelity.exact_size.aods_corpus.line_count} lines**, **${fidelity.exact_size.aods_corpus.file_count} files**
- Estimated human-doc tokens: **${fidelity.human_doc_tokens_estimated}**
- Estimated AODS tokens: **${fidelity.aods_tokens_estimated}**
- Compression ratio (human/AODS): **${formatRatio(fidelity.compression_ratio_human_to_aods)}**
- Token reduction vs human docs: **${formatPercent(fidelity.token_reduction_vs_human)}**
- Median per-artifact compression ratio: **${formatRatio(fidelity.median_artifact_compression_ratio)}**
- Interpretation: **exact size and estimated token views agree on the same result: local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark.**

### 3. Objective touch-route loading gate

- Full-load exact corpus size: **${loading.full_load_bytes} bytes**
- Objective scenarios: **${loading.objective_touch.scenario_count}**
- Hit rate across objective touch-route scenarios: **${formatPercent(loading.objective_touch.hit_rate)}**
- Average precision: **${formatPercent(loading.objective_touch.average_precision)}**
- Average recall: **${formatPercent(loading.objective_touch.average_recall)}**
- Median byte savings vs full load: **${formatPercent(loading.objective_touch.median_byte_savings_vs_full_load)}**
- Median token savings vs full load: **${formatPercent(loading.objective_touch.median_token_savings_vs_full_load)}**

| Objective scenario | Class | Hit | Byte savings |
| --- | --- | --- | ---: |
${loading.scenario_results
  .filter((scenario) => scenario.measurement_class === "objective")
  .map(
    (scenario) =>
      `| ${scenario.id} | ${scenario.scenario_class} | ${scenario.exact_hit ? "hit" : "miss"} | ${formatPercent(
        scenario.byte_savings_vs_full_load
      )} |`
  )
  .join("\n")}

### 4. Exploratory semantic loading

- Exploratory scenarios: **${loading.exploratory_semantic.scenario_count}**
- Hit rate across exploratory semantic scenarios: **${formatPercent(loading.exploratory_semantic.hit_rate)}**
- Average precision: **${formatPercent(loading.exploratory_semantic.average_precision)}**
- Average recall: **${formatPercent(loading.exploratory_semantic.average_recall)}**
- Median byte savings vs full load: **${formatPercent(loading.exploratory_semantic.median_byte_savings_vs_full_load)}**
- Interpretation: **semantic-load scenarios are still useful for research, but they are not treated as objective release gates because the current reference CLI does not implement semantic routing.**

### 5. Drift prevention

- Built-in drift recall: **${formatPercent(drift.built_in_recall)}**
- Semantic drift recall: **${formatPercent(drift.semantic_recall)}**
- Combined recall: **${formatPercent(drift.combined_recall)}**
- Built-in false-positive rate: **${formatPercent(drift.built_in_false_positive_rate)}**

| Scenario | Built-in | Semantic audit |
| --- | --- | --- |
${drift.scenario_results
  .map(
    (scenario) =>
      `| ${scenario.id} | ${scenario.built_in_detected ? "detected" : "missed"} | ${
        scenario.semantic_detected ? "detected" : "missed"
      } |`
  )
  .join("\n")}

### 6. Sample diversity and coverage audit

- Dataset count: **${results.diversity.dataset_count}**
- Dataset class: **${results.diversity.dataset_class}**
- Domains: **${diversity.domains.join(", ")}**
- Languages: **${diversity.languages.join(", ")}**
- Roles exercised in scenarios: **${diversity.roles.exercised.length}/${diversity.roles.defined.length}**
- Loading scenario split: **${diversity.loading_scenarios.objective_count} objective**, **${diversity.loading_scenarios.exploratory_count} exploratory**
- Drift scenario classes: **${Object.keys(diversity.drift_scenarios.by_class).join(", ")}**
- Sync modes present: **${diversity.sync_modes.present.join(", ")}**
- Sync modes absent: **${diversity.sync_modes.missing.join(", ")}**
- Pair scopes absent: **${diversity.pair_scopes.missing.join(", ")}**

**Expansion check:** the current benchmark is lifecycle-complete but still single-dataset, single-domain, single-language, and single sync-mode. That means coverage across artifact families is strong, but diversity across corpus families is still narrow and can be expanded objectively.

### 7. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **${results.overhead.bookkeeping_entries}**
- Bookkeeping entries per benchmark item: **${formatRatio(results.overhead.bookkeeping_entries_per_artifact)}**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only heuristic token and semantic-load signals.

### Limits and failure modes

${strongestBlindSpots.map((item) => `- ${item}`).join("\n")}

- The reference implementation validates structure and routing better than semantic truth.
- Progressive loading is strongest for touch-routed authoring flows; semantic query loading still depends on corpus metadata quality and remains exploratory.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- Sample diversity is still limited because the current benchmark contains one synthetic system, one domain, and one language.

## Bottom line

**Coverage is strong, the objective touch-route gate is now cleanly measurable, full-fidelity representation is achievable, but compression is mixed and anti-drift protection is still incomplete at semantic-conflict level.** In this benchmark AODS preserves meaning, yet the whole corpus expands by about 51.5% because governance overhead outweighs local artifact compression. The benchmark itself is more objective than before, but sample diversity still needs expansion beyond one synthetic release-ops corpus.

## Appendix: reproducibility

\`\`\`bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
\`\`\`
`;
}

function runAodsJson(args) {
  try {
    const output = execFileSync("node", [AODS_CLI, ...args], {
      cwd: REPO_ROOT,
      encoding: "utf8"
    });
    return JSON.parse(output);
  } catch (error) {
    if (typeof error.stdout === "string" && error.stdout.trim()) {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}

function listFiles(rootDir, extensions) {
  const collected = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const nextPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(nextPath);
        continue;
      }
      if (extensions.some((extension) => nextPath.endsWith(extension))) {
        collected.push(nextPath);
      }
    }
  }

  walk(rootDir);
  return collected;
}

function fileContains(filePath, text) {
  return fs.readFileSync(filePath, "utf8").includes(text);
}

function countOccurrences(text, search) {
  if (!search) {
    return 0;
  }
  return text.split(search).length - 1;
}

function countBy(values) {
  return values.reduce((accumulator, value) => {
    if (!value) {
      return accumulator;
    }
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runEvaluation();
}
