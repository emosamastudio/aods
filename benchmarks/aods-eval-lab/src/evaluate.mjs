import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  ARTIFACTS,
  BEHAVIOR_DRIFT_SCENARIOS,
  DATASETS,
  DRIFT_SCENARIOS,
  GENERIC_TYPES,
  HUMAN_DOCS,
  LOADING_SCENARIOS,
  MODULE_BLUEPRINTS,
  ROLE_DEFS,
  STRUCTURED_TYPES,
  SYSTEM
} from "./benchmark-data.mjs";
import { loadOpenSourceScenarioCatalog } from "./catalog-open-source-corpora.mjs";
import { generateAll, projectPaths, renderHumanArtifact } from "./generate-fixtures.mjs";
import {
  PROJECT_ROOT,
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
  replaceJsonValue,
  replaceText,
  writeJson,
  writeText
} from "./helpers.mjs";
import {
  buildAodsPromptResources,
  buildFullAodsSupportResources,
  buildScenarioAodsSupportResources,
  loadAodsCorpusIndex,
  measurePromptSupportResources,
  routeScenarioModules,
  runAodsJson
} from "./aods-loading.mjs";
import { evaluateOpenSourceRouting } from "./open-source-routing.mjs";
import { measureBenchmarkPromptEnvelope } from "./prompt-envelope.mjs";
import { evaluateReleaseSurfaceTrust } from "./release-surface-eval.mjs";
const PHASES = ["vision", "discovery", "planning", "design", "build", "test", "release", "operate", "governance"];
const TASK_STAGES = ["orientation", "plan", "action", "verification", "evidence"];
const OPEN_SOURCE_CORPORA_MANIFEST_PATH = path.join(PROJECT_ROOT, "fixtures", "open-source", "corpora.json");
const OPEN_SOURCE_SCENARIO_CATALOG_PATH = path.join(
  PROJECT_ROOT,
  "generated",
  "results",
  "open-source-scenario-catalog.json"
);

export function runEvaluation() {
  const paths = projectPaths();
  const runtimeCapturePath = path.join(paths.resultsRoot, "runtime-capture-results.json");
  const runtimeCapture = fs.existsSync(runtimeCapturePath) ? readJson(runtimeCapturePath) : null;
  const openSourceCorporaManifest = fs.existsSync(OPEN_SOURCE_CORPORA_MANIFEST_PATH)
    ? readJson(OPEN_SOURCE_CORPORA_MANIFEST_PATH)
    : null;
  const openSourceScenarioCatalog = openSourceCorporaManifest
    ? loadOpenSourceScenarioCatalog({
        manifestPath: OPEN_SOURCE_CORPORA_MANIFEST_PATH,
        outputJsonPath: OPEN_SOURCE_SCENARIO_CATALOG_PATH
      })
    : null;
  const generated = generateAll();
  const corpusIndex = loadAodsCorpusIndex(paths);
  const manifest = corpusIndex.manifest;
  const factMap = readJson(path.join(paths.resultsRoot, "fact-map.json"));

  const validation = runAodsJson(["validate", paths.corpusRoot, "--json"]);
  const coverage = evaluateCoverage(manifest);
  const fidelity = evaluateFidelity(paths, manifest, corpusIndex, factMap);
  const loading = evaluateLoading(paths);
  const drift = evaluateDrift(paths, factMap);
  const behavior_drift = evaluateBehaviorDrift(paths);
  const openSourceRouting = openSourceScenarioCatalog ? evaluateOpenSourceRouting(openSourceScenarioCatalog) : null;
  const releaseSurface = evaluateReleaseSurfaceTrust();
  const diversity = evaluateBenchmarkDiversity(manifest, openSourceCorporaManifest, openSourceScenarioCatalog);
  const overhead = evaluateAuthoringOverhead(manifest);

  const results = {
    generated_at: new Date().toISOString(),
    system_under_test: ".",
    benchmark_project: "benchmarks/aods-eval-lab",
    validation,
    coverage,
    fidelity,
    loading,
    runtime_capture: runtimeCapture,
    drift,
    behavior_drift,
    open_source_routing: openSourceRouting,
    release_surface: releaseSurface,
    diversity,
    overhead,
    limitations: [
      "Main benchmark gates rely on exact byte counts and touch-route scenarios; token estimates remain advisory.",
      "Non-touch query routing now uses the reference CLI, but the scenarios remain exploratory because they are still synthetic concept prompts rather than field-captured tasks.",
      openSourceCorporaManifest
        ? "The main scoreboard corpus is still synthetic but lifecycle-complete; the open-source scenario catalog now adds real-world grep-first field samples without collapsing the fairness contract."
        : "The benchmark corpus is synthetic but lifecycle-complete; it should be treated as a strong laboratory signal rather than a universal external sample.",
      "Real-corpus routing currently uses deterministic grep-term ranking over seeded target files rather than chunked or semantic retrieval.",
      "Runtime-backed capture now covers the current round-one baseline loading prompts under multiple local CLI profiles, but the scenario-wide scoreboard still rests on shared renderer-based prompt-envelope metrics.",
      "Release-surface trust is currently benchmarked on the compiled-pilot release surfaces rather than on a broader field-sample matrix.",
      "Behavior drift currently covers route underreach and overreach in synthetic runtime companion scenarios rather than full end-to-end autonomous execution traces."
    ]
  };

  writeJson(path.join(paths.resultsRoot, "evaluation-results.json"), results);
  if (runtimeCapture) {
    writeJson(runtimeCapturePath, runtimeCapture);
  }
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

function evaluateFidelity(paths, manifest, corpusIndex, factMap) {
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
    ...(corpusIndex.companionPath ? [path.join(paths.corpusRoot, corpusIndex.companionPath)] : []),
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

function evaluateLoading(paths) {
  const corpusIndex = loadAodsCorpusIndex(paths);
  const { manifest, manifestContent, manifestMetrics, moduleRefMap, moduleContentMap, moduleMetricMap } = corpusIndex;
  const fullSupportResources = buildFullAodsSupportResources(corpusIndex);
  const fullSupportMetrics = measurePromptSupportResources(fullSupportResources);
  const fullLoadTokens =
    manifestMetrics.tokens_estimated +
    fullSupportMetrics.tokens_estimated +
    manifest.modules.reduce((sum, module) => sum + (moduleMetricMap.get(module.id)?.tokens_estimated ?? 0), 0);
  const fullLoadBytes =
    manifestMetrics.bytes +
    fullSupportMetrics.bytes +
    manifest.modules.reduce((sum, module) => sum + (moduleMetricMap.get(module.id)?.bytes ?? 0), 0);
  const fullPromptResources = buildAodsPromptResources(manifestContent, moduleRefMap, moduleContentMap, manifest.modules, {
    supportResources: fullSupportResources
  });

  const scenarioResults = LOADING_SCENARIOS.map((scenario) => {
    const route = routeScenarioModules(paths.corpusRoot, scenario);
    const scenarioSupportResources = buildScenarioAodsSupportResources(corpusIndex, route);
    const scenarioSupportMetrics = measurePromptSupportResources(scenarioSupportResources);
    const loadedModules = route.recommended_modules.map((module) => module.id);
    const loadedSet = new Set(loadedModules);
    const requiredSet = new Set(scenario.requiredModules);
    const hits = [...requiredSet].filter((moduleId) => loadedSet.has(moduleId)).length;
    const precision = loadedModules.length === 0 ? 0 : hits / loadedModules.length;
    const recall = hits / requiredSet.size;
    const routeTokens =
      manifestMetrics.tokens_estimated +
      scenarioSupportMetrics.tokens_estimated +
      loadedModules.reduce((sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.tokens_estimated ?? 0), 0);
    const oracleTokens =
      manifestMetrics.tokens_estimated +
      scenarioSupportMetrics.tokens_estimated +
      scenario.requiredModules.reduce(
        (sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.tokens_estimated ?? 0),
        0
      );
    const routeBytes =
      manifestMetrics.bytes +
      scenarioSupportMetrics.bytes +
      loadedModules.reduce((sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.bytes ?? 0), 0);
    const oracleBytes =
      manifestMetrics.bytes +
      scenarioSupportMetrics.bytes +
      scenario.requiredModules.reduce((sum, moduleId) => sum + (moduleMetricMap.get(moduleId)?.bytes ?? 0), 0);
    const promptEnvelope = measureBenchmarkPromptEnvelope({
      formatLabel: "AODS",
      scenario,
      resources: buildAodsPromptResources(
        manifestContent,
        moduleRefMap,
        moduleContentMap,
        loadedModules.map((moduleId) => moduleRefMap.get(moduleId)).filter(Boolean),
        {
          supportResources: scenarioSupportResources
        }
      )
    });
    const fullPromptEnvelope = measureBenchmarkPromptEnvelope({
      formatLabel: "AODS",
      scenario,
      resources: fullPromptResources
    });
    return {
      id: scenario.id,
      description: scenario.description,
      scenario_class: scenario.scenario_class,
      measurement_class: scenario.measurement_class,
      task_stage: route.task_stage ?? scenario.task_stage ?? null,
      task_stage_source: route.task_stage_source ?? (scenario.task_stage ? "scenario" : null),
      mode: route.strategy === "touch-route" ? "touch-route" : "query-route",
      route_strategy: route.strategy,
      loaded_modules: loadedModules,
      required_modules: scenario.requiredModules,
      matched_query_modules: route.matched_query_modules ?? [],
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

  const objectiveTouch = summarizeLoadingResults(
    scenarioResults.filter((scenario) => scenario.measurement_class === "objective")
  );
  const exploratoryQuery = summarizeLoadingResults(
    scenarioResults.filter((scenario) => scenario.measurement_class === "exploratory")
  );
  const combined = summarizeLoadingResults(scenarioResults);
  const taskStageBreakdown = summarizeTaskStages(scenarioResults);
  const coveredTaskStages = TASK_STAGES.filter((stage) => taskStageBreakdown[stage].scenario_count > 0);

  return {
    full_load_tokens_estimated: fullLoadTokens,
    full_load_bytes: fullLoadBytes,
    scenario_results: scenarioResults,
    objective_touch: objectiveTouch,
    exploratory_query: exploratoryQuery,
    combined,
    task_stage_coverage: coveredTaskStages.length / TASK_STAGES.length,
    task_stage_breakdown: taskStageBreakdown,
    hit_rate: combined.hit_rate,
    average_precision: combined.average_precision,
    average_recall: combined.average_recall,
    median_token_savings_vs_full_load: combined.median_token_savings_vs_full_load,
    median_overfetch_ratio: combined.median_token_overfetch_ratio
  };
}

function summarizeTaskStages(scenarioResults) {
  return Object.fromEntries(
    TASK_STAGES.map((stage) => {
      const stageResults = scenarioResults.filter((scenario) => scenario.task_stage === stage);
      return [
        stage,
        {
          scenario_count: stageResults.length,
          hit_rate: stageResults.length === 0 ? 0 : stageResults.filter((scenario) => scenario.exact_hit).length / stageResults.length,
          average_precision:
            stageResults.length === 0
              ? 0
              : stageResults.reduce((sum, scenario) => sum + scenario.precision, 0) / stageResults.length
        }
      ];
    })
  );
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

function evaluateDrift(paths, factMap) {
  const baselineAnchors = buildBaselineAnchors(paths, factMap);
  const scenarioResults = DRIFT_SCENARIOS.map((scenario) => runDriftScenario(paths, scenario, baselineAnchors));
  const driftCases = scenarioResults.filter((scenario) => !scenario.is_control);
  const controlCases = scenarioResults.filter((scenario) => scenario.is_control);
  const semanticApplicableCases = driftCases.filter((scenario) => scenario.expected_semantic_detection);
  const structuralGovernanceCases = driftCases.filter((scenario) => !scenario.expected_semantic_detection);

  return {
    scenario_results: scenarioResults,
    built_in_recall:
      driftCases.filter((scenario) => scenario.built_in_detected).length / driftCases.length,
    semantic_recall:
      semanticApplicableCases.length === 0
        ? 1
        : semanticApplicableCases.filter((scenario) => scenario.semantic_detected).length / semanticApplicableCases.length,
    semantic_recall_all_drift_cases:
      driftCases.filter((scenario) => scenario.semantic_detected).length / driftCases.length,
    semantic_applicable_scenario_count: semanticApplicableCases.length,
    structural_governance_recall:
      structuralGovernanceCases.length === 0
        ? 1
        : structuralGovernanceCases.filter((scenario) => scenario.built_in_detected).length /
          structuralGovernanceCases.length,
    structural_governance_scenario_count: structuralGovernanceCases.length,
    combined_recall:
      driftCases.filter((scenario) => scenario.built_in_detected || scenario.semantic_detected).length /
      driftCases.length,
    built_in_false_positive_rate:
      controlCases.filter((scenario) => scenario.built_in_detected).length / controlCases.length,
    semantic_false_positive_rate:
      controlCases.filter((scenario) => scenario.semantic_detected).length / controlCases.length
  };
}

function evaluateBehaviorDrift(paths) {
  const loadingScenarioById = new Map(LOADING_SCENARIOS.map((scenario) => [scenario.id, scenario]));
  const baselineRoutes = new Map(
    [...new Set(BEHAVIOR_DRIFT_SCENARIOS.map((scenario) => scenario.loadingScenarioId))].map((scenarioId) => {
      const loadingScenario = loadingScenarioById.get(scenarioId);
      if (!loadingScenario) {
        throw new Error(`Unknown loading scenario for behavior drift baseline: ${scenarioId}`);
      }
      return [scenarioId, routeScenarioModules(paths.corpusRoot, loadingScenario)];
    })
  );
  const scenarioResults = BEHAVIOR_DRIFT_SCENARIOS.map((scenario) => {
    const loadingScenario = loadingScenarioById.get(scenario.loadingScenarioId);
    if (!loadingScenario) {
      throw new Error(`Unknown loading scenario for behavior drift: ${scenario.loadingScenarioId}`);
    }
    const baselineRoute = baselineRoutes.get(scenario.loadingScenarioId);
    return runBehaviorDriftScenario(paths, scenario, loadingScenario, baselineRoute);
  });
  const driftCases = scenarioResults.filter((scenario) => !scenario.is_control);
  const controlCases = scenarioResults.filter((scenario) => scenario.is_control);
  const underreachCases = driftCases.filter((scenario) => scenario.behavior_class === "underreach");
  const overreachCases = driftCases.filter((scenario) => scenario.behavior_class === "overreach");

  return {
    scenario_results: scenarioResults,
    scenario_count: scenarioResults.length,
    drift_case_count: driftCases.length,
    control_case_count: controlCases.length,
    route_behavior_recall:
      driftCases.length === 0 ? 1 : driftCases.filter((scenario) => scenario.behavior_detected).length / driftCases.length,
    built_in_recall:
      driftCases.length === 0 ? 1 : driftCases.filter((scenario) => scenario.built_in_detected).length / driftCases.length,
    underreach_recall:
      underreachCases.length === 0
        ? 1
        : underreachCases.filter((scenario) => scenario.behavior_detected).length / underreachCases.length,
    overreach_recall:
      overreachCases.length === 0
        ? 1
        : overreachCases.filter((scenario) => scenario.behavior_detected).length / overreachCases.length,
    false_positive_rate:
      controlCases.length === 0
        ? 0
        : controlCases.filter((scenario) => scenario.behavior_detected).length / controlCases.length
  };
}

function evaluateBenchmarkDiversity(manifest, openSourceCorporaManifest = null, openSourceScenarioCatalog = null) {
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
  const externalSample = buildOpenSourceSampleSummary(openSourceCorporaManifest, openSourceScenarioCatalog);
  const datasetBreakdown = Object.fromEntries(
    DATASETS.map((dataset) => [
      dataset.id,
      {
        modules: MODULE_BLUEPRINTS.filter((module) => inferDatasetIdFromModuleId(module.id) === dataset.id).length,
        docs: HUMAN_DOCS.filter((doc) => inferDatasetIdFromDocPath(doc.path) === dataset.id).length,
        items: ARTIFACTS.filter((artifact) => inferDatasetIdFromDocPath(artifact.humanDoc) === dataset.id).length,
        loading_scenarios: LOADING_SCENARIOS.filter((scenario) => inferDatasetIdFromScenario(scenario) === dataset.id).length,
        drift_scenarios: DRIFT_SCENARIOS.filter((scenario) => inferDatasetIdFromScenario(scenario) === dataset.id).length
      }
    ])
  );

  return {
    dataset_count: DATASETS.length,
    datasets: DATASETS.map((dataset) => dataset.id),
    dataset_class: SYSTEM.profile.dataset_class,
    domains: Array.from(new Set(DATASETS.map((dataset) => dataset.domain))),
    languages: Array.from(new Set(DATASETS.flatMap((dataset) => dataset.languages))),
    surface_kinds: SYSTEM.profile.surface_kinds,
    evidence_kinds: SYSTEM.profile.evidence_kinds,
    dataset_breakdown: datasetBreakdown,
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
    },
    external_sample: externalSample
  };
}

function buildOpenSourceSampleSummary(manifest, catalog = null) {
  if (!manifest || !Array.isArray(manifest.corpora)) {
    return null;
  }

  const selectedCorpora = manifest.corpora.filter((corpus) => corpus.status === "selected");
  const catalogCorpusById = new Map((catalog?.corpora ?? []).map((corpus) => [corpus.id, corpus]));
  const corpora = selectedCorpora.map((corpus) => {
    const measured = catalogCorpusById.get(corpus.id);
    return {
      id: corpus.id,
      label: corpus.label,
      license: corpus.license,
      scenario_count: corpus.scenario_seeds?.length ?? measured?.scenario_count ?? 0,
      source_file_count: measured?.source_file_count ?? null,
      source_byte_count: measured?.source_byte_count ?? null
    };
  });
  const scenarios = selectedCorpora.flatMap((corpus) =>
    (corpus.scenario_seeds ?? []).map((seed) => ({
      ...seed,
      corpus_id: corpus.id,
      format: inferDocFormat(seed.path)
    }))
  );
  return {
    corpus_count: corpora.length,
    corpora,
    scenario_count: scenarios.length,
    scenario_classes: countBy(scenarios.map((scenario) => scenario.scenario_class)),
    lifecycle_phases: dedupe(scenarios.flatMap((scenario) => scenario.lifecycle_phases ?? [])).sort(),
    benchmark_dimensions: dedupe(scenarios.flatMap((scenario) => scenario.benchmark_dimensions ?? [])).sort(),
    benchmark_roles: dedupe(scenarios.flatMap((scenario) => scenario.benchmark_roles ?? [])).sort(),
    formats: countBy(scenarios.map((scenario) => scenario.format)),
    licenses: countBy(corpora.map((corpus) => corpus.license))
  };
}

function inferDocFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".rst") {
    return "rst";
  }
  if (ext === ".md" || ext === ".mdx") {
    return "markdown";
  }
  return ext.replace(/^\./, "") || "unknown";
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
  const builtInDetected = validateReport.summary.errors > 0 || hasBlockingHookIssue(hookReport);
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

function runBehaviorDriftScenario(paths, scenario, loadingScenario, baselineRoute) {
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
  const mutatedRoute = routeScenarioModules(mutatedCorpus, loadingScenario);
  const builtInDetected = validateReport.summary.errors > 0 || hasBlockingHookIssue(hookReport);
  const baselineLoadedModules = (baselineRoute?.recommended_modules ?? []).map((module) => module.id);
  const mutatedLoadedModules = (mutatedRoute?.recommended_modules ?? []).map((module) => module.id);
  const baselineLoadedSet = new Set(baselineLoadedModules);
  const mutatedLoadedSet = new Set(mutatedLoadedModules);
  const requiredSet = new Set(loadingScenario.requiredModules ?? []);
  const missingRequiredModules = [...requiredSet].filter((moduleId) => !mutatedLoadedSet.has(moduleId));
  const unexpectedLoadedModules = [...mutatedLoadedSet].filter((moduleId) => !baselineLoadedSet.has(moduleId));
  const behaviorDetected = missingRequiredModules.length > 0 || unexpectedLoadedModules.length > 0;

  fs.rmSync(tempRoot, { recursive: true, force: true });

  return {
    id: scenario.id,
    description: scenario.description,
    scenario_class: scenario.scenario_class,
    behavior_class: scenario.behavior_class,
    loading_scenario_id: loadingScenario.id,
    is_control: Boolean(scenario.isControl),
    changed_files: scenario.changedFiles,
    built_in_detected: builtInDetected,
    behavior_detected: behaviorDetected,
    expected_built_in_detection: scenario.expectBuiltInDetection,
    expected_behavior_detection: scenario.expectBehaviorDetection,
    required_modules: loadingScenario.requiredModules,
    baseline_loaded_modules: baselineLoadedModules,
    mutated_loaded_modules: mutatedLoadedModules,
    missing_required_modules: missingRequiredModules,
    unexpected_loaded_modules: unexpectedLoadedModules,
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
  if (operation.type === "replaceJsonValue") {
    replaceJsonValue(path.join(mutatedCorpus, operation.file), operation.path, operation.value);
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

function formatReleaseSurfaceOutcome(scenario) {
  if (scenario.is_control) {
    return scenario.success ? "clean" : "false positive";
  }
  return scenario.success ? "detected" : "missed";
}

function formatOpenSourceTopCandidates(candidates) {
  if (candidates.length === 0) {
    return "none";
  }
  return candidates
    .map((candidate) => `${candidate.path} (${candidate.matched_term_count} terms/${candidate.total_term_hits} hits)`)
    .join("<br>");
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
  const runtimeCapture = results.runtime_capture;
  const drift = results.drift;
  const behaviorDrift = results.behavior_drift;
  const openSourceRouting = results.open_source_routing;
  const releaseSurface = results.release_surface;
  const diversity = results.diversity;
  const externalSample = diversity.external_sample;
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
  if (openSourceRouting && openSourceRouting.api_surface_rerank.top_1_hit_rate < 1) {
    strongestBlindSpots.push(
      "Even the current API-surface rerank still misses some curated API-vs-reference sibling collisions in the open-source field sample."
    );
  }
  if (openSourceRouting && openSourceRouting.zero_hit_rate > 0) {
    strongestBlindSpots.push("Some curated open-source routing seeds still produce zero lexical candidates under deterministic grep-term ranking.");
  }
  if (openSourceRouting && openSourceRouting.section_context.section_hit_given_correct_file_rate < 1) {
    strongestBlindSpots.push("Section-level context compression still loses the target section on some scenarios even when the reranked top file is already correct.");
  }
  if (openSourceRouting && openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate < 1) {
    strongestBlindSpots.push(
      "Section-evidence pack compression still drops grep-term evidence from some reranked top files even when file selection is already correct."
    );
  }
  if (openSourceRouting && openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate < 1) {
    strongestBlindSpots.push(
      "Even after discounting unreachable exact phrases, the current cost-aware top-3 scenario-evidence bundle still misses corpus-available scenario evidence on some real-corpus tasks."
    );
  }
  if (openSourceRouting && openSourceRouting.scenario_answer_check.full_answer_check_rate < 1) {
    strongestBlindSpots.push(
      "Even after explicit scenario answer checks, some real-corpus tasks still lack enough routed evidence to support a concrete answer."
    );
  }
  if (openSourceRouting && openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate > 0) {
    strongestBlindSpots.push(
      "Some concrete answers are only fully supported after the compressed pack borrows evidence from neighboring files rather than staying entirely grounded in the target document."
    );
  }
  if (openSourceRouting && openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate > 0) {
    strongestBlindSpots.push(
      "Even when the benchmark declares explicit answer-authority scopes, some concrete answers are still only recovered by borrowing evidence from out-of-scope files."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_answer_authority_reachability.authority_gap_explained_by_reachability_rate > 0
  ) {
    strongestBlindSpots.push(
      "Some authority-scoped concrete-answer misses are selection/compression misses inside the declared authority scope rather than true authority gaps."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate > 0
  ) {
    strongestBlindSpots.push(
      "Some concrete answers still remain unsupported even after re-checking every section inside the declared authority scope."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate < 1
  ) {
    strongestBlindSpots.push(
      "Even an authority-aware compressed pack still drops some answer support that is reachable inside the declared authority scope."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate > 0
  ) {
    strongestBlindSpots.push(
      "Some exact-file authority gaps are actually local-family distribution problems: the answers exist in sibling docs under the same target directory rather than in the target file alone."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate < 1
  ) {
    strongestBlindSpots.push(
      "Even a compressed local-family pack still drops some answer support that is available nearby inside the same target-directory family."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_claim_support.full_claim_support_rate < 1 &&
    openSourceRouting.scenario_answer_check.claim_gap_recovered_rate > 0
  ) {
    strongestBlindSpots.push(
      "Some remaining claim-support misses are now explained by benchmark wording realism rather than by concrete answer insufficiency."
    );
  }
  if (
    openSourceRouting &&
    openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate < 1
  ) {
    strongestBlindSpots.push(
      "Claim-support pack compression still drops some already-supported claim evidence when the cost-aware scenario bundle is compressed down to cross-file sections."
    );
  }
  if (openSourceRouting && openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate > 0) {
    strongestBlindSpots.push(
      "Some real-corpus scenario seeds include exact grep phrases that never appear anywhere in the source corpus, so exact scenario-term coverage now mixes retrieval performance with scenario-phrase realism."
    );
  }
  if (releaseSurface.generated_human_surface.recall < 1) {
    strongestBlindSpots.push("Deterministically generated human surfaces still allow undetected manual drift in the compiled release pilot.");
  }
  if (releaseSurface.reality_validation.recall < 1) {
    strongestBlindSpots.push("Surface-inventory reality validation still misses missing, duplicate, placeholder-only, or wrong-kind current release surfaces.");
  }
  if (releaseSurface.combined_false_positive_rate > 0) {
    strongestBlindSpots.push("Release-surface trust checks still misfire on clean compiled-pilot control scenarios.");
  }
  if (behaviorDrift.built_in_recall < behaviorDrift.route_behavior_recall) {
    strongestBlindSpots.push(
      "Runtime companion route mutations can still change the actual loaded module set without the current validator and hook layer flagging the drift."
    );
  }
  if (strongestBlindSpots.length === 0) {
    strongestBlindSpots.push("No declared-invariant or known governance scenario remains a built-in miss in the current benchmark pack.");
  }

  const runtimeCaptureCombined = runtimeCapture?.summary?.combined ?? null;
  const runtimeCaptureObjective = runtimeCapture?.summary?.objective_touch ?? null;
  const runtimeCaptureExploratory = runtimeCapture?.summary?.exploratory_query ?? null;
  const runtimeProfiles = Object.values(runtimeCapture?.runtime_profiles ?? {});
  const runtimeProfileCount = runtimeProfiles.length;
  const localRuntimeProfileCount = runtimeProfiles.filter((profile) => profile.profile.mode !== "hosted").length;
  const hostedRuntimeProfileCount = runtimeProfiles.filter((profile) => profile.profile.mode === "hosted").length;
  const runtimeObjectiveLifecycle = runtimeCapture?.objective_lifecycle?.summary ?? null;
  const runtimeExploratoryLifecycle = runtimeCapture?.exploratory_lifecycle?.summary ?? null;
  const runtimeCombinedLifecycle = runtimeCapture?.combined_lifecycle?.summary ?? null;
  const runtimeRepresentativeLifecycle = runtimeCapture?.representative_lifecycle ?? null;
  const runtimeAttribution = runtimeCapture?.runtime_attribution ?? null;
  const runtimeAttributionDelta = runtimeAttribution?.combined_median_delta ?? null;
  const runtimeAttributionTopScenario = runtimeAttribution?.heaviest_tool_loop_delta_scenarios?.[0] ?? null;
  const hostedRepeatability = runtimeCapture?.hosted_repeatability ?? null;
  const claudeRuntimeProfile = runtimeCapture?.runtime_profiles?.["claude-code-local-anthropic"] ?? null;
  const claudeRuntimeObjective = claudeRuntimeProfile?.baseline_matrices?.aods?.summary?.objective_touch ?? null;
  const claudeRuntimeObjectiveLifecycle = claudeRuntimeProfile?.baseline_matrices?.aods?.objective_lifecycle?.summary ?? null;
  const claudeRuntimeExploratoryLifecycle =
    claudeRuntimeProfile?.baseline_matrices?.aods?.exploratory_lifecycle?.summary ?? null;
  const claudeRuntimeCombinedLifecycle = claudeRuntimeProfile?.baseline_matrices?.aods?.combined_lifecycle?.summary ?? null;
  const claudeRuntimeRepresentativeLifecycle = claudeRuntimeProfile?.baseline_matrices?.aods?.representative_lifecycle ?? null;
  const hostedRuntimeProfile = runtimeProfiles.find((profile) => profile.profile.mode === "hosted") ?? null;
  const hostedRuntimeObjective = hostedRuntimeProfile?.baseline_matrices?.aods?.summary?.objective_touch ?? null;
  const hostedRuntimeObjectiveLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.objective_lifecycle?.summary ?? null;
  const hostedRuntimeExploratoryLifecycle =
    hostedRuntimeProfile?.baseline_matrices?.aods?.exploratory_lifecycle?.summary ?? null;
  const hostedRuntimeCombinedLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.combined_lifecycle?.summary ?? null;
  const hostedRuntimeRepresentativeLifecycle = hostedRuntimeProfile?.baseline_matrices?.aods?.representative_lifecycle ?? null;
  const runtimeCaptureSummary = runtimeCaptureCombined
    ? `- **Runtime-backed local matrix:** ${runtimeCapture.summary.scenario_count} scenarios, objective median exact provider request body ${Math.round(
        runtimeCaptureObjective?.median_request_body_bytes ?? 0
      )} bytes vs rendered benchmark prompt ${Math.round(
        runtimeCaptureObjective?.median_prompt_bytes ?? 0
      )} bytes (${formatRatio(runtimeCaptureObjective?.median_request_vs_prompt_ratio ?? 0)}x), exploratory median exact provider request body ${Math.round(
        runtimeCaptureExploratory?.median_request_body_bytes ?? 0
        )} bytes, across ${localRuntimeProfileCount} local CLI runtime profiles${runtimeCombinedLifecycle ? `; the primary AODS combined full-run median over ${runtimeCombinedLifecycle.scenario_count} scenarios is ${runtimeCombinedLifecycle.median_request_count} provider request(s) totaling ${Math.round(runtimeCombinedLifecycle.median_total_request_body_bytes)} bytes` : ""}${runtimeObjectiveLifecycle ? `, with objective median ${runtimeObjectiveLifecycle.median_request_count} request(s) / ${Math.round(runtimeObjectiveLifecycle.median_total_request_body_bytes)} bytes` : ""}${runtimeExploratoryLifecycle ? ` and exploratory median ${runtimeExploratoryLifecycle.median_request_count} request(s) / ${Math.round(runtimeExploratoryLifecycle.median_total_request_body_bytes)} bytes` : ""}${runtimeRepresentativeLifecycle ? `; representative detail stays at ${runtimeRepresentativeLifecycle.request_count} request(s) / ${runtimeRepresentativeLifecycle.total_request_body_bytes} bytes` : ""}${claudeRuntimeObjective ? `; the local Claude Code profile shows ${Math.round(claudeRuntimeObjective.median_request_body_bytes)} objective-median request bytes on the same AODS scenario set${claudeRuntimeCombinedLifecycle ? ` and combined full-run median ${claudeRuntimeCombinedLifecycle.median_request_count} request(s) / ${Math.round(claudeRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes` : ""}${claudeRuntimeObjectiveLifecycle ? `, objective median ${claudeRuntimeObjectiveLifecycle.median_request_count} request(s) / ${Math.round(claudeRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes` : ""}${claudeRuntimeExploratoryLifecycle ? `, exploratory median ${claudeRuntimeExploratoryLifecycle.median_request_count} request(s) / ${Math.round(claudeRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes` : ""}${claudeRuntimeRepresentativeLifecycle ? `, representative detail ${claudeRuntimeRepresentativeLifecycle.request_count} request(s) / ${claudeRuntimeRepresentativeLifecycle.total_request_body_bytes} bytes` : ""}` : ""}${hostedRuntimeObjective ? `, plus ${hostedRuntimeProfile.profile.id} at ${Math.round(hostedRuntimeObjective.median_request_body_bytes)} bytes in hosted relay-backed mode${hostedRuntimeCombinedLifecycle ? ` with combined full-run median ${hostedRuntimeCombinedLifecycle.median_request_count} request(s) / ${Math.round(hostedRuntimeCombinedLifecycle.median_total_request_body_bytes)} bytes` : ""}${hostedRuntimeObjectiveLifecycle ? `, objective median ${hostedRuntimeObjectiveLifecycle.median_request_count} request(s) / ${Math.round(hostedRuntimeObjectiveLifecycle.median_total_request_body_bytes)} bytes` : ""}${hostedRuntimeExploratoryLifecycle ? `, exploratory median ${hostedRuntimeExploratoryLifecycle.median_request_count} request(s) / ${Math.round(hostedRuntimeExploratoryLifecycle.median_total_request_body_bytes)} bytes` : ""}${hostedRuntimeRepresentativeLifecycle ? `, representative detail ${hostedRuntimeRepresentativeLifecycle.request_count} request(s) / ${hostedRuntimeRepresentativeLifecycle.total_request_body_bytes} bytes` : ""}` : ""}${runtimeAttributionDelta ? `; hosted-vs-local combined median delta is ${Math.round(runtimeAttributionDelta.total_request_body_bytes_delta)} bytes, of which ${Math.round(runtimeAttributionDelta.tool_loop_request_body_bytes_delta)} bytes sit in tool-loop traffic` : ""}${hostedRepeatability ? `; across ${hostedRepeatability.successful_run_count} successful hosted captures, the hosted/local total-delta band spans ${hostedRepeatability.bands?.delta_total_request_body_bytes?.span ?? 0} bytes and the tool-loop delta band spans ${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.span ?? 0} bytes` : ""}; the hosted split should be read as directional field evidence rather than as a canonical fixed loop shape because successful hosted runs still vary in how they decompose follow-up vs tool-loop traffic.`
    : "- **Runtime-backed provider matrix:** not generated in this run.";
  const openSourceRoutingSummary = openSourceRouting
    ? `- **Real-corpus routing:** top-1 hit rate ${formatPercent(
        openSourceRouting.top_1_hit_rate
      )}, top-3 hit rate ${formatPercent(openSourceRouting.top_3_hit_rate)}, MRR ${formatPercent(
        openSourceRouting.mean_reciprocal_rank
      )}, seed-title rerank top-1 ${formatPercent(
        openSourceRouting.seed_title_rerank.top_1_hit_rate
      )}, structure-aware rerank top-1 ${formatPercent(
        openSourceRouting.structure_aware_rerank.top_1_hit_rate
      )}, path-family rerank top-1 ${formatPercent(
        openSourceRouting.path_family_rerank.top_1_hit_rate
      )}, API-surface rerank top-1 ${formatPercent(
        openSourceRouting.api_surface_rerank.top_1_hit_rate
      )}; section-context hit ${formatPercent(openSourceRouting.section_context.section_hit_rate)} with median selected section ${Math.round(
        openSourceRouting.section_context.median_selected_section_bytes
      )} bytes, and section-evidence pack retains full top-file grep evidence on ${formatPercent(
        openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate
      )} of scenarios with median pack ${Math.round(
        openSourceRouting.section_evidence_pack.median_selected_pack_bytes
      )} bytes; cost-aware top-3 scenario-evidence bundle reaches full exact scenario-term coverage on ${formatPercent(
        openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate
      )} of scenarios with median bundle ${Math.round(
        openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_bytes
      )} bytes, while the reachability audit shows ${formatPercent(
        openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate
      )} full reachable-term coverage and ${formatPercent(
       openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate
      )} of scenarios still contain unreachable exact grep phrases; the claim-support lane then recovers full normalized claim support on ${formatPercent(
         openSourceRouting.scenario_claim_support.full_claim_support_rate
       )} of scenarios, the answer-check lane reaches ${formatPercent(
         openSourceRouting.scenario_answer_check.full_answer_check_rate
       )} full concrete-answer coverage with ${formatPercent(
         openSourceRouting.scenario_answer_check.claim_gap_recovered_rate
       )} claim-gap recovery, the answer-locality audit keeps ${formatPercent(
         openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate
       )} full target-local concrete-answer coverage with ${formatPercent(
         openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate
       )} cross-file recovery, the authority-scoped answer lane keeps ${formatPercent(
        openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate
      )} full scoped concrete-answer coverage across ${openSourceRouting.scenario_answer_authority.scoped_scenario_count} explicitly scoped scenarios with ${formatPercent(
        openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate
        )} out-of-scope recovery, while authority-reachability lifts mean in-scope coverage to ${formatPercent(
          openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_answer_check_coverage
        )} with ${formatPercent(
          openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack
        )} mean gain vs the scoped pack, ${formatPercent(
          openSourceRouting.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate
        )} full in-scope reachable coverage, and ${formatPercent(
          openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate
        )} scenarios still missing authority-local answer support; an authority-aware answer pack then preserves ${formatPercent(
          openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate
        )} of authority-reachable answer support with ${formatPercent(
          openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack
        )} mean gain vs the scoped pack at median ${Math.round(
          openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes
        )} bytes and ${formatPercent(
          openSourceRouting.scenario_answer_authority_pack.median_context_reduction_vs_authority_scope
        )} median reduction vs the full authority scope; widening strict exact-file scopes to the target directory family then reaches ${formatPercent(
          openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate
         )} full coverage across ${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count} strict-file scenarios with ${formatPercent(
           openSourceRouting.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope
         )} mean gain vs the exact scope; a local-family answer pack then preserves ${formatPercent(
           openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate
         )} of family-supported answer checks with ${formatPercent(
           openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope
         )} mean gain vs the exact scope at median ${Math.round(
           openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes
         )} bytes and ${formatPercent(
           openSourceRouting.scenario_answer_authority_local_family_pack
             .median_context_reduction_vs_local_family_scope
         )} median reduction vs the full family scope; the claim-support pack preserves bundled claim support on ${formatPercent(
           openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate
         )} of scenarios with median pack ${Math.round(
           openSourceRouting.scenario_claim_support_pack.median_selected_pack_bytes
       )} bytes across ${Math.round(
        openSourceRouting.scenario_claim_support_pack.median_selected_pack_section_count
      )} sections.`
    : "- **Real-corpus routing:** not loaded in this run.";
  const externalSampleSummary = externalSample
    ? `- **External sample supplement:** ${externalSample.corpus_count} open-source corpora and ${externalSample.scenario_count} grep-first scenario seeds now supplement the synthetic benchmark pack.`
    : "- **External sample supplement:** not loaded in this run.";
  const runtimeCaptureSection = runtimeCaptureCombined
    ? `### 4. Runtime-backed provider matrix (supplemental)

- Runtime profile: **${runtimeCapture.profile.id}** using **${runtimeCapture.profile.runtime}** in offline local-provider mode
- Total runtime profiles captured: **${runtimeProfileCount}**
- Local CLI runtime profiles captured: **${localRuntimeProfileCount}**
- Hosted relay-backed runtime profiles captured: **${hostedRuntimeProfileCount}**
- Shared round-one runtime captures: **${Object.keys(runtimeCapture.baseline_matrices ?? {}).length}** baselines
- AODS captured scenarios: **${runtimeCapture.summary.scenario_count}**
- Objective touch-route median exact provider request body: **${Math.round(
        runtimeCaptureObjective.median_request_body_bytes
      )} bytes**, **${Math.round(runtimeCaptureObjective.median_request_body_tokens_estimated)} estimated tokens**
- Objective touch-route median rendered benchmark prompt: **${Math.round(runtimeCaptureObjective.median_prompt_bytes)} bytes**
- Objective touch-route median runtime-added overhead: **${Math.round(runtimeCaptureObjective.median_runtime_added_bytes)} bytes**
- Exploratory query-route median exact provider request body: **${Math.round(
        runtimeCaptureExploratory.median_request_body_bytes
      )} bytes**
- Combined median request/prompt ratio: **${formatRatio(runtimeCaptureCombined.median_request_vs_prompt_ratio)}x**
- Primary profile AODS combined full-run median: **${runtimeCombinedLifecycle?.median_request_count ?? 0}** provider request(s), **${runtimeCombinedLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, **${runtimeCombinedLifecycle?.scenario_count ?? 0}** scenarios covered
- Primary profile AODS objective full-run median: **${runtimeObjectiveLifecycle?.median_request_count ?? 0}** provider request(s), **${runtimeObjectiveLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, classed as **${runtimeObjectiveLifecycle?.median_first_request_count ?? 0}** first request, **${runtimeObjectiveLifecycle?.median_followup_prompt_requests ?? 0}** follow-up prompt request(s), **${runtimeObjectiveLifecycle?.median_tool_loop_request_count ?? 0}** tool-loop request(s), and **${runtimeObjectiveLifecycle?.median_auxiliary_request_count ?? 0}** auxiliary side request(s), with **${runtimeObjectiveLifecycle?.median_tool_loop_request_body_bytes ?? 0} bytes** in tool-loop traffic
- Primary profile AODS exploratory full-run median: **${runtimeExploratoryLifecycle?.median_request_count ?? 0}** provider request(s), **${runtimeExploratoryLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, classed as **${runtimeExploratoryLifecycle?.median_first_request_count ?? 0}** first request, **${runtimeExploratoryLifecycle?.median_followup_prompt_requests ?? 0}** follow-up prompt request(s), **${runtimeExploratoryLifecycle?.median_tool_loop_request_count ?? 0}** tool-loop request(s), and **${runtimeExploratoryLifecycle?.median_auxiliary_request_count ?? 0}** auxiliary side request(s), with **${runtimeExploratoryLifecycle?.median_tool_loop_request_body_bytes ?? 0} bytes** in tool-loop traffic
- Primary profile representative full run: **${runtimeRepresentativeLifecycle?.request_count ?? 0}** provider request(s), **${runtimeRepresentativeLifecycle?.total_request_body_bytes ?? 0} bytes** total request body, split into **${runtimeRepresentativeLifecycle?.first_request_count ?? 0}** first request, **${runtimeRepresentativeLifecycle?.followup_prompt_request_count ?? 0}** follow-up prompt request(s), **${runtimeRepresentativeLifecycle?.tool_loop_request_count ?? 0}** tool-loop request(s), and **${runtimeRepresentativeLifecycle?.auxiliary_request_count ?? 0}** auxiliary side request(s); tool-loop traffic contributes **${runtimeRepresentativeLifecycle?.tool_loop_request_body_bytes ?? 0} bytes**
- Secondary local runtime: **${claudeRuntimeProfile?.profile?.id ?? "n/a"}**${claudeRuntimeObjective ? ` with AODS objective median exact provider request body **${Math.round(claudeRuntimeObjective.median_request_body_bytes)} bytes** and ratio **${formatRatio(claudeRuntimeObjective.median_request_vs_prompt_ratio)}x**` : ""}
- Secondary local combined full-run median: **${claudeRuntimeCombinedLifecycle?.median_request_count ?? 0}** provider request(s), **${claudeRuntimeCombinedLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, **${claudeRuntimeCombinedLifecycle?.scenario_count ?? 0}** scenarios covered
- Secondary local objective full-run median: **${claudeRuntimeObjectiveLifecycle?.median_request_count ?? 0}** provider request(s), **${claudeRuntimeObjectiveLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, classed as **${claudeRuntimeObjectiveLifecycle?.median_first_request_count ?? 0}** first request, **${claudeRuntimeObjectiveLifecycle?.median_followup_prompt_requests ?? 0}** follow-up prompt request(s), **${claudeRuntimeObjectiveLifecycle?.median_tool_loop_request_count ?? 0}** tool-loop request(s), and **${claudeRuntimeObjectiveLifecycle?.median_auxiliary_request_count ?? 0}** auxiliary side request(s), with **${claudeRuntimeObjectiveLifecycle?.median_tool_loop_request_body_bytes ?? 0} bytes** in tool-loop traffic
- Secondary local exploratory full-run median: **${claudeRuntimeExploratoryLifecycle?.median_request_count ?? 0}** provider request(s), **${claudeRuntimeExploratoryLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, classed as **${claudeRuntimeExploratoryLifecycle?.median_first_request_count ?? 0}** first request, **${claudeRuntimeExploratoryLifecycle?.median_followup_prompt_requests ?? 0}** follow-up prompt request(s), **${claudeRuntimeExploratoryLifecycle?.median_tool_loop_request_count ?? 0}** tool-loop request(s), and **${claudeRuntimeExploratoryLifecycle?.median_auxiliary_request_count ?? 0}** auxiliary side request(s), with **${claudeRuntimeExploratoryLifecycle?.median_tool_loop_request_body_bytes ?? 0} bytes** in tool-loop traffic
- Secondary local representative full run: **${claudeRuntimeRepresentativeLifecycle?.request_count ?? 0}** provider request(s), **${claudeRuntimeRepresentativeLifecycle?.total_request_body_bytes ?? 0} bytes** total request body, split into **${claudeRuntimeRepresentativeLifecycle?.first_request_count ?? 0}** first request, **${claudeRuntimeRepresentativeLifecycle?.followup_prompt_request_count ?? 0}** follow-up prompt request(s), **${claudeRuntimeRepresentativeLifecycle?.tool_loop_request_count ?? 0}** tool-loop request(s), and **${claudeRuntimeRepresentativeLifecycle?.auxiliary_request_count ?? 0}** auxiliary side request(s); tool-loop traffic contributes **${claudeRuntimeRepresentativeLifecycle?.tool_loop_request_body_bytes ?? 0} bytes**
- Hosted field runtime: **${hostedRuntimeProfile?.profile?.id ?? "n/a"}**${hostedRuntimeObjective ? ` with AODS objective median exact provider request body **${Math.round(hostedRuntimeObjective.median_request_body_bytes)} bytes** and ratio **${formatRatio(hostedRuntimeObjective.median_request_vs_prompt_ratio)}x**` : ""}
- Hosted combined full-run median: **${hostedRuntimeCombinedLifecycle?.median_request_count ?? 0}** provider request(s), **${hostedRuntimeCombinedLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, **${hostedRuntimeCombinedLifecycle?.scenario_count ?? 0}** scenarios covered
- Hosted objective full-run median: **${hostedRuntimeObjectiveLifecycle?.median_request_count ?? 0}** provider request(s), **${hostedRuntimeObjectiveLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, classed as **${hostedRuntimeObjectiveLifecycle?.median_first_request_count ?? 0}** first request, **${hostedRuntimeObjectiveLifecycle?.median_followup_prompt_requests ?? 0}** follow-up prompt request(s), **${hostedRuntimeObjectiveLifecycle?.median_tool_loop_request_count ?? 0}** tool-loop request(s), and **${hostedRuntimeObjectiveLifecycle?.median_auxiliary_request_count ?? 0}** auxiliary side request(s), with **${hostedRuntimeObjectiveLifecycle?.median_tool_loop_request_body_bytes ?? 0} bytes** in tool-loop traffic
- Hosted exploratory full-run median: **${hostedRuntimeExploratoryLifecycle?.median_request_count ?? 0}** provider request(s), **${hostedRuntimeExploratoryLifecycle?.median_total_request_body_bytes ?? 0} bytes** total request body, classed as **${hostedRuntimeExploratoryLifecycle?.median_first_request_count ?? 0}** first request, **${hostedRuntimeExploratoryLifecycle?.median_followup_prompt_requests ?? 0}** follow-up prompt request(s), **${hostedRuntimeExploratoryLifecycle?.median_tool_loop_request_count ?? 0}** tool-loop request(s), and **${hostedRuntimeExploratoryLifecycle?.median_auxiliary_request_count ?? 0}** auxiliary side request(s), with **${hostedRuntimeExploratoryLifecycle?.median_tool_loop_request_body_bytes ?? 0} bytes** in tool-loop traffic
- Hosted representative full run: **${hostedRuntimeRepresentativeLifecycle?.request_count ?? 0}** provider request(s), **${hostedRuntimeRepresentativeLifecycle?.total_request_body_bytes ?? 0} bytes** total request body, split into **${hostedRuntimeRepresentativeLifecycle?.first_request_count ?? 0}** first request, **${hostedRuntimeRepresentativeLifecycle?.followup_prompt_request_count ?? 0}** follow-up prompt request(s), **${hostedRuntimeRepresentativeLifecycle?.tool_loop_request_count ?? 0}** tool-loop request(s), and **${hostedRuntimeRepresentativeLifecycle?.auxiliary_request_count ?? 0}** auxiliary side request(s); tool-loop traffic contributes **${hostedRuntimeRepresentativeLifecycle?.tool_loop_request_body_bytes ?? 0} bytes**
- Hosted-vs-local combined median delta: **${runtimeAttributionDelta?.total_request_body_bytes_delta ?? 0} bytes**, split into **${runtimeAttributionDelta?.first_request_body_bytes_delta ?? 0}** first-request bytes, **${runtimeAttributionDelta?.followup_prompt_request_body_bytes_delta ?? 0}** follow-up prompt bytes, **${runtimeAttributionDelta?.tool_loop_request_body_bytes_delta ?? 0}** tool-loop bytes, and **${runtimeAttributionDelta?.auxiliary_request_body_bytes_delta ?? 0}** auxiliary bytes
- Hosted-vs-local combined median request delta: **${runtimeAttributionDelta?.request_count_delta ?? 0}** request(s), split into **${runtimeAttributionDelta?.followup_prompt_request_count_delta ?? 0}** extra follow-up prompt request(s) and **${runtimeAttributionDelta?.tool_loop_request_count_delta ?? 0}** extra tool-loop request(s)
- Hosted-vs-local delta shares: **${runtimeAttributionDelta ? formatPercent(runtimeAttributionDelta.tool_loop_share_of_total_delta) : "n/a"}** tool-loop, **${runtimeAttributionDelta ? formatPercent(runtimeAttributionDelta.followup_prompt_share_of_total_delta) : "n/a"}** follow-up prompt, **${runtimeAttributionDelta ? formatPercent(runtimeAttributionDelta.first_request_share_of_total_delta) : "n/a"}** first-request
- Heaviest hosted-vs-local tool-loop delta scenario: **${runtimeAttributionTopScenario?.scenario_id ?? "n/a"}** with **${runtimeAttributionTopScenario?.tool_loop_request_body_bytes_delta ?? 0}** extra tool-loop bytes and **${runtimeAttributionTopScenario?.total_request_body_bytes_delta ?? 0}** total extra bytes
${hostedRepeatability ? `- Hosted repeatability successful runs: **${hostedRepeatability.successful_run_count}**
- Hosted repeatability total-delta band: **${hostedRepeatability.bands?.delta_total_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_total_request_body_bytes?.max ?? 0} bytes** (span **${hostedRepeatability.bands?.delta_total_request_body_bytes?.span ?? 0}**)
- Hosted repeatability first-request delta band: **${hostedRepeatability.bands?.delta_first_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_first_request_body_bytes?.max ?? 0} bytes** (span **${hostedRepeatability.bands?.delta_first_request_body_bytes?.span ?? 0}**)
- Hosted repeatability tool-loop delta band: **${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.max ?? 0} bytes** (span **${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.span ?? 0}**)` : ""}
- Largest captured request: **${runtimeCapture.summary.largest_request?.scenario_id ?? "n/a"}** at **${runtimeCapture.summary.largest_request?.request_body_bytes ?? 0} bytes**
- Smallest captured request: **${runtimeCapture.summary.smallest_request?.scenario_id ?? "n/a"}** at **${runtimeCapture.summary.smallest_request?.request_body_bytes ?? 0} bytes**
- Interpretation: **the benchmark prompt-envelope proxy is directionally useful, but first-request cost, combined full-run median cost, subgroup medians, and representative request-loop detail are different measurements. Copilot stays close to a single provider request across the current AODS scenario set, while Claude Code expands the same routed prompts into a clearer loop of first request, follow-up prompt retries, and tool-loop traffic across both objective and exploratory lanes; the hosted lane is especially heavier because the hosted/local median delta is now explicitly attributable mostly to repeated tool-loop requests rather than the first request envelope. The current hosted repeatability audit keeps the first-request delta comparatively stable while showing that the follow-up-vs-tool-loop split still moves across successful runs, so this hosted attribution should be read as directional field evidence rather than as a canonical fixed hosted loop.**
`
    : `### 4. Runtime-backed provider matrix (supplemental)

- No runtime capture artifact was loaded for this run.
- Interpretation: **the main benchmark still falls back to rendered prompt-envelope metrics until a runtime-backed matrix is generated.**
`;

  return `# AODS evaluation report

## Executive summary

This repository uses \`benchmarks/aods-eval-lab\` as its primary regression harness. The harness regenerates a multi-domain benchmark pack and evaluates AODS for coverage, fidelity, compression, progressive loading, real-corpus routing, drift prevention, release-surface trust, and authoring overhead.

- **Coverage:** lifecycle phase coverage ${formatPercent(coverage.lifecycle_phase_coverage)}, structured type coverage ${formatPercent(coverage.structured_type_coverage)}, generic type coverage ${formatPercent(coverage.generic_type_coverage)}.
- **Fidelity:** critical fact preservation ${formatPercent(fidelity.critical_fact_preservation_rate)} with overall fact preservation ${formatPercent(fidelity.fact_preservation_rate)}.
- **Exact corpus size:** human docs ${fidelity.exact_size.human_docs.byte_count} bytes across ${fidelity.exact_size.human_docs.file_count} files; AODS corpus ${fidelity.exact_size.aods_corpus.byte_count} bytes across ${fidelity.exact_size.aods_corpus.file_count} files.
- **Task-time context footprint:** objective touch-route median rendered prompt envelope ${loading.objective_touch.median_prompt_envelope_bytes} bytes and ${loading.objective_touch.median_prompt_envelope_tokens_estimated} estimated tokens.
- **Objective loading gate:** touch-route hit rate ${formatPercent(loading.objective_touch.hit_rate)}, average recall ${formatPercent(loading.objective_touch.average_recall)}, median byte savings ${formatPercent(loading.objective_touch.median_byte_savings_vs_full_load)}.
- **Real-corpus routing:** baseline top-1 hit rate ${formatPercent(openSourceRouting.top_1_hit_rate)}, top-3 hit rate ${formatPercent(openSourceRouting.top_3_hit_rate)}, MRR ${formatPercent(openSourceRouting.mean_reciprocal_rank)}, seed-title rerank top-1 ${formatPercent(openSourceRouting.seed_title_rerank.top_1_hit_rate)}, structure-aware rerank top-1 ${formatPercent(openSourceRouting.structure_aware_rerank.top_1_hit_rate)}, path-family rerank top-1 ${formatPercent(openSourceRouting.path_family_rerank.top_1_hit_rate)}, API-surface rerank top-1 ${formatPercent(openSourceRouting.api_surface_rerank.top_1_hit_rate)}, section-context median ${Math.round(openSourceRouting.section_context.median_selected_section_bytes)} bytes, section-evidence pack full-file retention ${formatPercent(openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate)} with median pack ${Math.round(openSourceRouting.section_evidence_pack.median_selected_pack_bytes)} bytes, rank-order top-3 scenario-evidence bundle exact full coverage ${formatPercent(openSourceRouting.scenario_evidence_bundle.full_scenario_term_coverage_rate)} with median bundle ${Math.round(openSourceRouting.scenario_evidence_bundle.median_selected_bundle_bytes)} bytes, cost-aware top-3 scenario-evidence bundle exact full coverage ${formatPercent(openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate)} with median bundle ${Math.round(openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_bytes)} bytes, reachability-audited reachable full coverage ${formatPercent(openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate)} with ${formatPercent(openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate)} scenarios containing unreachable exact phrases, claim-support full coverage ${formatPercent(openSourceRouting.scenario_claim_support.full_claim_support_rate)} with ${formatPercent(openSourceRouting.scenario_claim_support.exact_gap_recovered_rate)} exact-gap recovery, claim-support pack preservation ${formatPercent(openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate)} with median pack ${Math.round(openSourceRouting.scenario_claim_support_pack.median_selected_pack_bytes)} bytes, answer-check full coverage ${formatPercent(openSourceRouting.scenario_answer_check.full_answer_check_rate)} with ${formatPercent(openSourceRouting.scenario_answer_check.claim_gap_recovered_rate)} claim-gap recovery, target-local answer-check full coverage ${formatPercent(openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate)} with ${formatPercent(openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate)} cross-file recovery, authority-scoped answer-check full coverage ${formatPercent(openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate)} across ${openSourceRouting.scenario_answer_authority.scoped_scenario_count} scoped scenarios with ${formatPercent(openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate)} out-of-scope recovery, authority-reachability mean coverage ${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_answer_check_coverage)} with ${formatPercent(openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack)} gain vs the scoped pack and ${formatPercent(openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate)} scenarios still missing authority-local answer support, an authority-aware answer pack preserves ${formatPercent(openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate)} of reachable in-scope support with ${formatPercent(openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack)} gain vs the scoped pack at median ${Math.round(openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes)} bytes, a local-family audit reaches ${formatPercent(openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate)} full coverage across ${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count} strict exact-file scopes, and a local-family answer pack preserves ${formatPercent(openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate)} of family-supported answer checks at median ${Math.round(openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes)} bytes.
- **Drift prevention:** built-in recall ${formatPercent(drift.built_in_recall)}, combined recall ${formatPercent(drift.combined_recall)}, built-in false-positive rate ${formatPercent(drift.built_in_false_positive_rate)}, route-behavior drift recall ${formatPercent(behaviorDrift.route_behavior_recall)} with built-in route-behavior recall ${formatPercent(behaviorDrift.built_in_recall)}.
- **Release-surface trust:** generated-surface recall ${formatPercent(releaseSurface.generated_human_surface.recall)}, reality recall ${formatPercent(releaseSurface.reality_validation.recall)}, combined false-positive rate ${formatPercent(releaseSurface.combined_false_positive_rate)}.
- ${runtimeCaptureSummary.slice(2)}
- ${openSourceRoutingSummary.slice(2)}
- ${externalSampleSummary.slice(2)}
- **Judgment:** AODS passes this benchmark on the four core questions separately: full-lifecycle/file-surface coverage is complete, benchmark facts survive the rewrite, task-time progressive loading materially reduces working-set context, and declared anti-drift/trust controls catch the current benchmark hazards. The main tradeoff is that value comes from governed routing and validation rather than from shrinking the entire repository corpus.
- **Advisory metrics:** token estimates and query-route scenarios remain exploratory rather than release-gating signals.

## Scope and independence

- **System under test:** \`${results.system_under_test}\`
- **Benchmark harness:** \`${results.benchmark_project}\`
- **Corpus design:** synthetic multi-domain benchmark pack with paired human surfaces and ${results.overhead.module_count} agent-facing modules
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
- Interpretation: **exact size and estimated token views agree on the same result: local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark. This is a repository-scale measurement, not a direct reading of task-time context pressure.**

### 3. Objective touch-route loading gate and working-set context footprint

- Full-load exact corpus size: **${loading.full_load_bytes} bytes**
- Objective scenarios: **${loading.objective_touch.scenario_count}**
- Hit rate across objective touch-route scenarios: **${formatPercent(loading.objective_touch.hit_rate)}**
- Average precision: **${formatPercent(loading.objective_touch.average_precision)}**
- Average recall: **${formatPercent(loading.objective_touch.average_recall)}**
- Median loaded payload: **${loading.objective_touch.median_route_bytes} bytes**, **${loading.objective_touch.median_route_tokens_estimated} estimated tokens**
- Median rendered prompt envelope: **${loading.objective_touch.median_prompt_envelope_bytes} bytes**, **${loading.objective_touch.median_prompt_envelope_tokens_estimated} estimated tokens**
- Median prompt-envelope overhead: **${loading.objective_touch.median_prompt_envelope_overhead_bytes} bytes**, **${loading.objective_touch.median_prompt_envelope_overhead_tokens_estimated} estimated tokens**
- Max rendered prompt envelope: **${loading.objective_touch.max_prompt_envelope_bytes} bytes**, **${loading.objective_touch.max_prompt_envelope_tokens_estimated} estimated tokens**
- Median byte savings vs full load: **${formatPercent(loading.objective_touch.median_byte_savings_vs_full_load)}**
- Median token savings vs full load: **${formatPercent(loading.objective_touch.median_token_savings_vs_full_load)}**
- Median prompt-envelope savings vs fully rendered full-load prompt: **${formatPercent(
    loading.objective_touch.median_prompt_envelope_savings_vs_full_prompt
  )}**
- Interpretation: **loaded payload measures routed file content only. Rendered prompt envelope adds separators, path labels, and scaffold text, so it is the closer shared benchmark proxy to actual context-window occupation. A larger full corpus does not automatically imply a larger per-task context if routing keeps the working set small.**

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

${runtimeCaptureSection}

### 5. Exploratory query routing

- Exploratory scenarios: **${loading.exploratory_query.scenario_count}**
- Hit rate across exploratory query-route scenarios: **${formatPercent(loading.exploratory_query.hit_rate)}**
- Average precision: **${formatPercent(loading.exploratory_query.average_precision)}**
- Average recall: **${formatPercent(loading.exploratory_query.average_recall)}**
- Median loaded working set: **${loading.exploratory_query.median_route_bytes} bytes**, **${loading.exploratory_query.median_route_tokens_estimated} estimated tokens**
- Median rendered prompt envelope: **${loading.exploratory_query.median_prompt_envelope_bytes} bytes**, **${loading.exploratory_query.median_prompt_envelope_tokens_estimated} estimated tokens**
- Median byte savings vs full load: **${formatPercent(loading.exploratory_query.median_byte_savings_vs_full_load)}**
- Interpretation: **these scenarios now call the real CLI query router, but they remain advisory because the prompts are still synthetic benchmark queries rather than field-captured production tasks. Their rendered prompt-envelope numbers are therefore informative, not release-gating.**

### 6. Open-source routing benchmark

- Corpora: **${openSourceRouting.corpus_count}**
- Scenario seeds: **${openSourceRouting.scenario_count}**
- Top-1 hit rate: **${formatPercent(openSourceRouting.top_1_hit_rate)}**
- Top-3 hit rate: **${formatPercent(openSourceRouting.top_3_hit_rate)}**
- Mean reciprocal rank: **${formatPercent(openSourceRouting.mean_reciprocal_rank)}**
- Zero-hit rate: **${formatPercent(openSourceRouting.zero_hit_rate)}**
- Median candidate file count: **${openSourceRouting.median_candidate_file_count}**
- Mean target term coverage: **${formatPercent(openSourceRouting.mean_target_term_coverage)}**
- Median top-ranked candidate size: **${openSourceRouting.median_top_1_bytes} bytes**, **${openSourceRouting.median_top_1_tokens_estimated} estimated tokens**
- Seed-title rerank top-1 hit rate: **${formatPercent(openSourceRouting.seed_title_rerank.top_1_hit_rate)}**
- Seed-title rerank top-3 hit rate: **${formatPercent(openSourceRouting.seed_title_rerank.top_3_hit_rate)}**
- Seed-title rerank MRR: **${formatPercent(openSourceRouting.seed_title_rerank.mean_reciprocal_rank)}**
- Rerank improvement: **${formatPercent(openSourceRouting.improvement.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.improvement.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.improvement.mean_reciprocal_rank_delta)}** MRR delta, **${openSourceRouting.improvement.promoted_to_top_1_count}** promotions to top 1, **${openSourceRouting.improvement.worsened_top_3_count}** worsened top-3 cases
- Structure-aware rerank top-1 hit rate: **${formatPercent(openSourceRouting.structure_aware_rerank.top_1_hit_rate)}**
- Structure-aware rerank top-3 hit rate: **${formatPercent(openSourceRouting.structure_aware_rerank.top_3_hit_rate)}**
- Structure-aware rerank MRR: **${formatPercent(openSourceRouting.structure_aware_rerank.mean_reciprocal_rank)}**
- Structure-aware improvement vs baseline: **${formatPercent(openSourceRouting.structure_aware_improvement.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.structure_aware_improvement.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.structure_aware_improvement.mean_reciprocal_rank_delta)}** MRR delta, **${openSourceRouting.structure_aware_improvement.promoted_to_top_1_count}** promotions to top 1, **${openSourceRouting.structure_aware_improvement.worsened_top_3_count}** worsened top-3 cases
- Structure-aware delta vs seed-title rerank: **${formatPercent(openSourceRouting.structure_aware_delta_vs_seed_title.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.structure_aware_delta_vs_seed_title.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.structure_aware_delta_vs_seed_title.mean_reciprocal_rank_delta)}** MRR delta
- Path-family rerank top-1 hit rate: **${formatPercent(openSourceRouting.path_family_rerank.top_1_hit_rate)}**
- Path-family rerank top-3 hit rate: **${formatPercent(openSourceRouting.path_family_rerank.top_3_hit_rate)}**
- Path-family rerank MRR: **${formatPercent(openSourceRouting.path_family_rerank.mean_reciprocal_rank)}**
- Path-family improvement vs baseline: **${formatPercent(openSourceRouting.path_family_improvement.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.path_family_improvement.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.path_family_improvement.mean_reciprocal_rank_delta)}** MRR delta, **${openSourceRouting.path_family_improvement.promoted_to_top_1_count}** promotions to top 1, **${openSourceRouting.path_family_improvement.worsened_top_3_count}** worsened top-3 cases
- Path-family delta vs structure-aware rerank: **${formatPercent(openSourceRouting.path_family_delta_vs_structure_aware.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.path_family_delta_vs_structure_aware.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.path_family_delta_vs_structure_aware.mean_reciprocal_rank_delta)}** MRR delta
- API-surface rerank top-1 hit rate: **${formatPercent(openSourceRouting.api_surface_rerank.top_1_hit_rate)}**
- API-surface rerank top-3 hit rate: **${formatPercent(openSourceRouting.api_surface_rerank.top_3_hit_rate)}**
- API-surface rerank MRR: **${formatPercent(openSourceRouting.api_surface_rerank.mean_reciprocal_rank)}**
- API-surface improvement vs baseline: **${formatPercent(openSourceRouting.api_surface_improvement.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.api_surface_improvement.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.api_surface_improvement.mean_reciprocal_rank_delta)}** MRR delta, **${openSourceRouting.api_surface_improvement.promoted_to_top_1_count}** promotions to top 1, **${openSourceRouting.api_surface_improvement.worsened_top_3_count}** worsened top-3 cases
- API-surface delta vs path-family rerank: **${formatPercent(openSourceRouting.api_surface_delta_vs_path_family.top_1_hit_rate_delta)}** top-1 delta, **${formatPercent(openSourceRouting.api_surface_delta_vs_path_family.top_3_hit_rate_delta)}** top-3 delta, **${formatPercent(openSourceRouting.api_surface_delta_vs_path_family.mean_reciprocal_rank_delta)}** MRR delta
- Section-context hit rate: **${formatPercent(openSourceRouting.section_context.section_hit_rate)}**
- Section-context hit rate when API-surface top file is correct: **${formatPercent(
    openSourceRouting.section_context.section_hit_given_correct_file_rate
  )}**
- Median selected section size: **${Math.round(openSourceRouting.section_context.median_selected_section_bytes)} bytes**, **${Math.round(
    openSourceRouting.section_context.median_selected_section_tokens_estimated
  )} estimated tokens**
- Median context reduction vs reranked top file: **${formatPercent(
    openSourceRouting.section_context.median_context_reduction_vs_top_file
  )}**
- Section-evidence pack full file-evidence retention rate: **${formatPercent(
    openSourceRouting.section_evidence_pack.full_file_evidence_retention_rate
  )}**
- Section-evidence pack mean selected term coverage: **${formatPercent(
    openSourceRouting.section_evidence_pack.mean_selected_term_coverage
  )}**
- Section-evidence pack mean term recall vs reranked top file: **${formatPercent(
    openSourceRouting.section_evidence_pack.mean_pack_term_recall_vs_top_file
  )}**
- Median evidence pack size: **${Math.round(openSourceRouting.section_evidence_pack.median_selected_pack_bytes)} bytes**, **${Math.round(
    openSourceRouting.section_evidence_pack.median_selected_pack_tokens_estimated
  )} estimated tokens**, across **${Math.round(
    openSourceRouting.section_evidence_pack.median_selected_pack_section_count
  )} sections**
- Median evidence-pack reduction vs reranked top file: **${formatPercent(
    openSourceRouting.section_evidence_pack.median_context_reduction_vs_top_file
  )}**
- Scenario-evidence bundle full scenario-term coverage rate: **${formatPercent(
    openSourceRouting.scenario_evidence_bundle.full_scenario_term_coverage_rate
  )}**
- Scenario-evidence bundle mean top-file term coverage: **${formatPercent(
    openSourceRouting.scenario_evidence_bundle.mean_top_file_term_coverage
  )}**
- Scenario-evidence bundle mean bundle term coverage: **${formatPercent(
    openSourceRouting.scenario_evidence_bundle.mean_bundle_term_coverage
  )}**
- Scenario-evidence bundle mean gain vs top file: **${formatPercent(
    openSourceRouting.scenario_evidence_bundle.mean_bundle_term_gain_vs_top_file
  )}**
- Median scenario-evidence bundle size: **${Math.round(openSourceRouting.scenario_evidence_bundle.median_selected_bundle_bytes)} bytes**, **${Math.round(
    openSourceRouting.scenario_evidence_bundle.median_selected_bundle_tokens_estimated
  )} estimated tokens**, across **${Math.round(
    openSourceRouting.scenario_evidence_bundle.median_selected_bundle_file_count
  )} files**
- Median scenario-evidence bundle growth vs top file: **${formatPercent(
    openSourceRouting.scenario_evidence_bundle.median_context_growth_vs_top_file
  )}**
- Cost-aware scenario-evidence full scenario-term coverage rate: **${formatPercent(
    openSourceRouting.scenario_cost_aware_bundle.full_scenario_term_coverage_rate
  )}**
- Cost-aware scenario-evidence mean bundle term coverage: **${formatPercent(
    openSourceRouting.scenario_cost_aware_bundle.mean_bundle_term_coverage
  )}**
- Cost-aware scenario-evidence mean gain vs top file: **${formatPercent(
    openSourceRouting.scenario_cost_aware_bundle.mean_bundle_term_gain_vs_top_file
  )}**
- Median cost-aware scenario-evidence bundle size: **${Math.round(openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_bytes)} bytes**, **${Math.round(
    openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_tokens_estimated
  )} estimated tokens**, across **${Math.round(
    openSourceRouting.scenario_cost_aware_bundle.median_selected_bundle_file_count
  )} files**
- Median cost-aware scenario-evidence bundle growth vs top file: **${formatPercent(
    openSourceRouting.scenario_cost_aware_bundle.median_context_growth_vs_top_file
  )}**
- Cost-aware scenario-evidence delta vs rank-order bundle: **${formatPercent(
    openSourceRouting.scenario_cost_aware_bundle_delta_vs_rank.full_scenario_term_coverage_rate_delta
  )}** full-coverage delta, **${formatPercent(
    openSourceRouting.scenario_cost_aware_bundle_delta_vs_rank.mean_bundle_term_coverage_delta
  )}** mean coverage delta, **${openSourceRouting.scenario_cost_aware_bundle_delta_vs_rank.median_selected_bundle_bytes_delta} bytes** median-byte delta, **${openSourceRouting.scenario_cost_aware_bundle_delta_vs_rank.reduced_bytes_count}** reduced-byte scenarios, **${openSourceRouting.scenario_cost_aware_bundle_delta_vs_rank.worsened_coverage_count}** worsened-coverage scenarios
- Reachability audit full reachable-term coverage rate: **${formatPercent(
    openSourceRouting.scenario_term_reachability.full_reachable_term_coverage_rate
  )}**
- Reachability audit scenarios with unreachable exact terms: **${formatPercent(
    openSourceRouting.scenario_term_reachability.scenarios_with_unreachable_terms_rate
  )}**
- Reachability audit mean unreachable-term share: **${formatPercent(
    openSourceRouting.scenario_term_reachability.mean_unreachable_term_share
  )}**
- Reachability audit exact-gap-explained-by-unreachable-terms rate: **${formatPercent(
    openSourceRouting.scenario_term_reachability.exact_gap_explained_by_unreachable_terms_rate
  )}**
- Claim-support full coverage rate: **${formatPercent(
    openSourceRouting.scenario_claim_support.full_claim_support_rate
  )}**
- Claim-support mean coverage: **${formatPercent(
    openSourceRouting.scenario_claim_support.mean_claim_support_coverage
  )}**
- Claim-support mean gain vs exact bundle coverage: **${formatPercent(
    openSourceRouting.scenario_claim_support.mean_claim_support_gain_vs_exact
  )}**
- Claim-support exact-gap recovered rate: **${formatPercent(
    openSourceRouting.scenario_claim_support.exact_gap_recovered_rate
  )}**
- Claim-support pack full bundle-preservation rate: **${formatPercent(
    openSourceRouting.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate
  )}**
- Claim-support pack full coverage rate: **${formatPercent(
    openSourceRouting.scenario_claim_support_pack.full_claim_support_rate
  )}**
- Claim-support pack mean recall vs bundle claim support: **${formatPercent(
    openSourceRouting.scenario_claim_support_pack.mean_pack_claim_support_recall_vs_bundle
  )}**
- Median claim-support pack size: **${Math.round(
    openSourceRouting.scenario_claim_support_pack.median_selected_pack_bytes
  )} bytes**, **${Math.round(
    openSourceRouting.scenario_claim_support_pack.median_selected_pack_tokens_estimated
  )} estimated tokens**, across **${Math.round(
    openSourceRouting.scenario_claim_support_pack.median_selected_pack_section_count
  )} sections**, **${Math.round(
    openSourceRouting.scenario_claim_support_pack.median_selected_pack_file_count
  )} files**
- Median claim-support pack reduction vs cost-aware bundle: **${formatPercent(
    openSourceRouting.scenario_claim_support_pack.median_context_reduction_vs_bundle
  )}**
- Answer-check full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_check.full_answer_check_rate
  )}**
- Answer-check mean coverage: **${formatPercent(
    openSourceRouting.scenario_answer_check.mean_answer_check_coverage
  )}**
- Answer-check mean gain vs claim-support coverage: **${formatPercent(
    openSourceRouting.scenario_answer_check.mean_answer_check_gain_vs_claim_support
  )}**
- Answer-check claim-gap recovered rate: **${formatPercent(
    openSourceRouting.scenario_answer_check.claim_gap_recovered_rate
  )}**
- Answer-check exact-gap recovered rate: **${formatPercent(
    openSourceRouting.scenario_answer_check.exact_gap_recovered_rate
  )}**
- Target-local answer-check full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_locality.full_target_local_answer_check_rate
  )}**
- Target-local answer-check mean coverage: **${formatPercent(
    openSourceRouting.scenario_answer_locality.mean_target_local_answer_check_coverage
  )}**
- Cross-file answer-check mean gain vs target-local: **${formatPercent(
    openSourceRouting.scenario_answer_locality.mean_cross_file_answer_check_gain
  )}**
- Cross-file answer-check recovery rate: **${formatPercent(
    openSourceRouting.scenario_answer_locality.cross_file_answer_recovery_rate
  )}**
- Scenarios requiring cross-file answer evidence: **${formatPercent(
    openSourceRouting.scenario_answer_locality.scenarios_requiring_cross_file_evidence_rate
  )}**
- Authority-scoped answer-check full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority.full_authority_scoped_answer_check_rate
  )}** across **${openSourceRouting.scenario_answer_authority.scoped_scenario_count}** explicitly scoped scenarios
- Authority-scoped answer-check mean coverage: **${formatPercent(
    openSourceRouting.scenario_answer_authority.mean_authority_scoped_answer_check_coverage
  )}**
- Explicit answer-authority scenario rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority.scenarios_with_explicit_answer_authority_rate
  )}**
- Out-of-scope answer-check mean gain vs authority scope: **${formatPercent(
    openSourceRouting.scenario_answer_authority.mean_out_of_scope_answer_check_gain
  )}**
- Out-of-scope answer recovery rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority.out_of_scope_answer_recovery_rate
  )}**
- Scenarios requiring out-of-scope answer evidence: **${formatPercent(
    openSourceRouting.scenario_answer_authority.scenarios_requiring_out_of_scope_evidence_rate
  )}**
- Authority-reachable answer-check full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate
  )}**
- Authority-reachable answer-check mean coverage: **${formatPercent(
    openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_answer_check_coverage
  )}**
- Authority-reachable mean gain vs scoped pack: **${formatPercent(
    openSourceRouting.scenario_answer_authority_reachability.mean_authority_reachable_gain_vs_scoped_pack
  )}**
- Authority-gap explained by reachability rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_reachability.authority_gap_explained_by_reachability_rate
  )}**
- Scenarios still missing authority-local answer support: **${formatPercent(
    openSourceRouting.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate
  )}**
- Authority-aware answer-pack full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_pack.full_authority_pack_answer_check_rate
  )}**
- Authority-aware answer-pack mean coverage: **${formatPercent(
    openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_answer_check_coverage
  )}**
- Authority-aware answer-pack mean gain vs scoped pack: **${formatPercent(
    openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack
  )}**
- Authority-aware reachable-support preservation rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate
  )}**
- Authority-aware mean recall vs reachable support: **${formatPercent(
    openSourceRouting.scenario_answer_authority_pack.mean_authority_pack_recall_vs_reachable
  )}**
- Authority-aware median pack bytes: **${Math.round(
    openSourceRouting.scenario_answer_authority_pack.median_selected_pack_bytes
  )}**
- Authority-aware median reduction vs full authority scope: **${formatPercent(
    openSourceRouting.scenario_answer_authority_pack.median_context_reduction_vs_authority_scope
  )}**
- Strict exact-file authority local-family full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family.full_local_family_answer_check_rate
  )}** across **${openSourceRouting.scenario_answer_authority_local_family.strict_file_scope_scenario_count}** strict-file scenarios
- Local-family mean gain vs exact-file authority scope: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family.mean_local_family_gain_vs_authority_scope
  )}**
- Exact-file authority gaps explained by local family rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate
  )}**
- Scenarios still missing local-family answer support: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family.scenarios_with_missing_local_family_answer_support_rate
  )}**
- Local-family answer-pack full coverage rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_pack_answer_check_rate
  )}**
- Local-family answer-pack mean coverage: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_answer_check_coverage
  )}**
- Local-family answer-pack mean gain vs exact-file authority scope: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope
  )}**
- Local-family support-preservation rate: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate
  )}**
- Local-family median pack bytes: **${Math.round(
    openSourceRouting.scenario_answer_authority_local_family_pack.median_selected_pack_bytes
  )}**
- Local-family median reduction vs full family scope: **${formatPercent(
    openSourceRouting.scenario_answer_authority_local_family_pack
      .median_context_reduction_vs_local_family_scope
  )}**
- Interpretation: **this is now a multi-lane deterministic benchmark over real open-source corpora. The file baseline shows how far pure lexical routing gets, the seed-title rerank lane shows what title-only heuristics recover, the structure-aware rerank lane adds file-path and basename structure signals, the path-family rerank lane prioritizes strong title-in-path matches to suppress command-reference noise, and the new API-vs-reference sibling seeds show where those same path-first heuristics can still over-promote broader conceptual pages over the intended module-level API surface. The API-surface rerank lane then adds module/directive signals to recover those collisions without losing the earlier path-family wins. The section-context lane answers whether the intended heading survives compression, the section-evidence-pack lane answers whether a small multi-section bundle can preserve the reranked top file's available lexical evidence, the rank-order scenario-evidence-bundle lane answers whether the current routed top-3 shortlist is enough to cover broader answer-support evidence across files, the cost-aware scenario-evidence-bundle lane shows how much of that answer-support can be kept while cutting bundle cost, the reachability audit separates retrieval misses from benchmark phrases that never appear anywhere in the source corpus, the claim-support lane shows how much of the remaining exact-gap pressure disappears once the benchmark allows deterministic per-scenario alias groups for clearly equivalent wording, the claim-support-pack lane then tests whether that normalized answer support can be preserved while shrinking the multi-file bundle down to a smaller cross-file section pack, the answer-check lane tests whether that compressed pack can still support a concrete scenario answer even when the benchmark seed wording itself has drifted away from the source docs, the answer-locality audit shows how often that concrete answer remains target-local versus relying on cross-file borrowed evidence, the authority-scoped lane distinguishes acceptable in-scope cross-file support from out-of-scope answer recovery, the authority-reachability lane separates true authority gaps from pack-selection misses inside the declared scope, the authority-aware pack lane shows that the benchmark can recover all currently reachable in-scope answer support while still heavily compressing the declared authority scope, the local-family lane shows that the remaining strict exact-file authority misses are still documented nearby in sibling docs under the same target family rather than being missing from the broader documentation slice, and the new local-family pack lane shows that this sibling-local answer support can also be preserved in a much smaller family-scoped section pack.**

| Scenario | Corpus | Baseline rank | Seed-title rank | Structure-aware rank | Path-family rank | API-surface rank | Section hit | Evidence pack | Scenario bundle | Cost-aware bundle | Reachability audit | Claim support | Claim-support pack | Answer check | Answer locality | Answer authority | Authority reachability | Authority pack | Local family | Local family pack | Top candidates |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${openSourceRouting.scenario_results
  .map(
    (scenario) =>
      `| ${scenario.id} | ${scenario.corpus_label} | ${scenario.target_rank ?? "miss"} | ${
        openSourceRouting.seed_title_rerank.scenario_results.find((item) => item.id === scenario.id)?.target_rank ?? "miss"
      } | ${
        openSourceRouting.structure_aware_rerank.scenario_results.find((item) => item.id === scenario.id)?.target_rank ??
        "miss"
      } | ${
        openSourceRouting.path_family_rerank.scenario_results.find((item) => item.id === scenario.id)?.target_rank ??
        "miss"
      } | ${
        openSourceRouting.api_surface_rerank.scenario_results.find((item) => item.id === scenario.id)?.target_rank ??
        "miss"
      } | ${
        openSourceRouting.section_context.scenario_results.find((item) => item.id === scenario.id)?.section_match
          ? "hit"
          : "miss"
      } | ${
        formatPercent(
          openSourceRouting.section_evidence_pack.scenario_results.find((item) => item.id === scenario.id)
            ?.pack_term_recall_vs_top_file ?? 0
        )
      } / ${
        openSourceRouting.section_evidence_pack.scenario_results.find((item) => item.id === scenario.id)
          ?.selected_section_count ?? 0
      } sec | ${
        formatPercent(
          openSourceRouting.scenario_evidence_bundle.scenario_results.find((item) => item.id === scenario.id)
            ?.bundle_term_coverage ?? 0
        )
      } / ${
        openSourceRouting.scenario_evidence_bundle.scenario_results.find((item) => item.id === scenario.id)
          ?.selected_file_count ?? 0
      } files | ${
        formatPercent(
          openSourceRouting.scenario_cost_aware_bundle.scenario_results.find((item) => item.id === scenario.id)
            ?.bundle_term_coverage ?? 0
        )
      } / ${
        openSourceRouting.scenario_cost_aware_bundle.scenario_results.find((item) => item.id === scenario.id)
          ?.selected_file_count ?? 0
      } files | ${
        formatPercent(
          openSourceRouting.scenario_term_reachability.scenario_results.find((item) => item.id === scenario.id)
            ?.reachable_term_coverage ?? 0
        )
      } / ${
        openSourceRouting.scenario_term_reachability.scenario_results.find((item) => item.id === scenario.id)
          ?.unreachable_term_count ?? 0
      } unreachable | ${formatPercent(
        openSourceRouting.scenario_claim_support.scenario_results.find((item) => item.id === scenario.id)
          ?.claim_support_coverage ?? 0
      )} | ${formatPercent(
        openSourceRouting.scenario_claim_support_pack.scenario_results.find((item) => item.id === scenario.id)
          ?.claim_support_coverage ?? 0
      )} / ${
        openSourceRouting.scenario_claim_support_pack.scenario_results.find((item) => item.id === scenario.id)
          ?.selected_section_count ?? 0
       } | ${formatPercent(
        openSourceRouting.scenario_answer_check.scenario_results.find((item) => item.id === scenario.id)
          ?.answer_check_coverage ?? 0
      )} | ${formatPercent(
        openSourceRouting.scenario_answer_locality.scenario_results.find((item) => item.id === scenario.id)
          ?.target_local_answer_check_coverage ?? 0
      )}${(
        openSourceRouting.scenario_answer_locality.scenario_results.find((item) => item.id === scenario.id)
          ?.requires_cross_file_evidence ?? false
      )
        ? " +cross-file"
        : ""} | ${(() => {
          const authorityScenario = openSourceRouting.scenario_answer_authority.scenario_results.find(
            (item) => item.id === scenario.id
          );
          if (!authorityScenario?.authority_scope_declared) {
            return "n/a";
          }
          return `${formatPercent(authorityScenario.authority_scoped_answer_check_coverage ?? 0)}${
            authorityScenario.requires_out_of_scope_evidence ? " +out-of-scope" : ""
          }`;
        })()} | ${(() => {
          const reachabilityScenario = openSourceRouting.scenario_answer_authority_reachability.scenario_results.find(
            (item) => item.id === scenario.id
          );
          if (!reachabilityScenario?.authority_scope_declared) {
            return "n/a";
          }
          return `${formatPercent(reachabilityScenario.authority_reachable_answer_check_coverage ?? 0)}${
            reachabilityScenario.authority_gap_explained_by_reachability ? " +pack-miss" : ""
          }${reachabilityScenario.authority_scope_missing_answer_support ? " +missing-support" : ""}`;
        })()} | ${(() => {
          const authorityPackScenario = openSourceRouting.scenario_answer_authority_pack.scenario_results.find(
            (item) => item.id === scenario.id
          );
          if (!authorityPackScenario?.authority_scope_declared) {
            return "n/a";
          }
          return `${formatPercent(authorityPackScenario.authority_pack_answer_check_coverage ?? 0)} / ${formatPercent(
            authorityPackScenario.authority_pack_recall_vs_reachable ?? 0
          )} reachable${(authorityPackScenario.authority_pack_gain_vs_scoped_pack ?? 0) > 0 ? " +recovered" : ""}`;
        })()} | ${(() => {
          const localFamilyScenario = openSourceRouting.scenario_answer_authority_local_family.scenario_results.find(
            (item) => item.id === scenario.id
          );
          if (!localFamilyScenario?.strict_target_file_authority_scope) {
            return "n/a";
          }
          return `${formatPercent(localFamilyScenario.local_family_answer_check_coverage ?? 0)}${
            localFamilyScenario.authority_gap_explained_by_local_family ? " +family-scope" : ""
          }`;
        })()} | ${(() => {
          const localFamilyPackScenario =
            openSourceRouting.scenario_answer_authority_local_family_pack.scenario_results.find(
              (item) => item.id === scenario.id
            );
          if (!localFamilyPackScenario?.strict_target_file_authority_scope) {
            return "n/a";
          }
          return `${formatPercent(
            localFamilyPackScenario.local_family_pack_answer_check_coverage ?? 0
          )} / ${formatPercent(
            localFamilyPackScenario.local_family_pack_recall_vs_supported ?? 0
          )} support${
            (localFamilyPackScenario.local_family_pack_gain_vs_authority_scope ?? 0) > 0 ? " +recovered" : ""
          }`;
        })()} | ${formatOpenSourceTopCandidates(scenario.top_candidates)} |`
  )
  .join("\n")}

### 7. Drift prevention

- Built-in drift recall: **${formatPercent(drift.built_in_recall)}**
- Semantic drift recall on applicable scenarios: **${formatPercent(drift.semantic_recall)}** across **${drift.semantic_applicable_scenario_count}** cases
- Semantic recall across all drift cases: **${formatPercent(drift.semantic_recall_all_drift_cases)}**
- Structural governance recall on semantic-not-applicable cases: **${formatPercent(drift.structural_governance_recall)}** across **${drift.structural_governance_scenario_count}** cases
- Combined recall: **${formatPercent(drift.combined_recall)}**
- Built-in false-positive rate: **${formatPercent(drift.built_in_false_positive_rate)}**
- Route-behavior drift recall: **${formatPercent(behaviorDrift.route_behavior_recall)}** across **${behaviorDrift.drift_case_count}** runtime-companion mutations
- Built-in route-behavior recall: **${formatPercent(behaviorDrift.built_in_recall)}**
- Underreach recall: **${formatPercent(behaviorDrift.underreach_recall)}**
- Overreach recall: **${formatPercent(behaviorDrift.overreach_recall)}**
- Route-behavior false-positive rate: **${formatPercent(behaviorDrift.false_positive_rate)}**

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

| Route-behavior scenario | Loading scenario | Behavior class | Built-in | Route behavior | Missing required modules | Unexpected loaded modules |
| --- | --- | --- | --- | --- | --- | --- |
${behaviorDrift.scenario_results
  .map(
    (scenario) =>
      `| ${scenario.id} | ${scenario.loading_scenario_id} | ${scenario.behavior_class} | ${
        scenario.built_in_detected ? "detected" : "missed"
      } | ${scenario.behavior_detected ? "detected" : "missed"} | ${
        scenario.missing_required_modules.join(", ") || "none"
      } | ${scenario.unexpected_loaded_modules.join(", ") || "none"} |`
  )
  .join("\n")}

### 8. Release-surface trust gates

- Generated-surface recall: **${formatPercent(releaseSurface.generated_human_surface.recall)}** across **${releaseSurface.generated_human_surface.hazard_count}** hazard scenarios
- Generated-surface false-positive rate: **${formatPercent(releaseSurface.generated_human_surface.false_positive_rate)}**
- Release-surface reality recall: **${formatPercent(releaseSurface.reality_validation.recall)}** across **${releaseSurface.reality_validation.hazard_count}** hazard scenarios
- Release-surface reality false-positive rate: **${formatPercent(releaseSurface.reality_validation.false_positive_rate)}**
- Combined recall: **${formatPercent(releaseSurface.combined_recall)}**
- Combined false-positive rate: **${formatPercent(releaseSurface.combined_false_positive_rate)}**
- Interpretation: **the compiled pilot now acts as a deterministic release-surface trust probe: generated human surfaces must stay byte-for-byte aligned with the agent-primary render, and \`--reality\` must reject missing, duplicate, placeholder-only, and wrong-kind current surfaces.**

| Scenario | Category | Expected rule | Outcome | Detected rules |
| --- | --- | --- | --- | --- |
${releaseSurface.scenario_results
  .map(
    (scenario) =>
      `| ${scenario.id} | ${scenario.category} | ${scenario.expected_rule ?? "none"} | ${formatReleaseSurfaceOutcome(
        scenario
      )} | ${scenario.detected_rules.join(", ") || "none"} |`
  )
  .join("\n")}

### 9. Sample diversity and coverage audit

- Dataset count: **${results.diversity.dataset_count}**
- Dataset class: **${results.diversity.dataset_class}**
- Domains: **${diversity.domains.join(", ")}**
- Languages: **${diversity.languages.join(", ")}**
- Dataset breakdown: **${Object.entries(diversity.dataset_breakdown)
  .map(([datasetId, stats]) => `${datasetId}=${stats.modules} modules/${stats.docs} docs/${stats.items} items`)
  .join("; ")}**
- Roles exercised in scenarios: **${diversity.roles.exercised.length}/${diversity.roles.defined.length}**
- Loading scenario split: **${diversity.loading_scenarios.objective_count} objective**, **${diversity.loading_scenarios.exploratory_count} exploratory**
- Drift scenario classes: **${Object.keys(diversity.drift_scenarios.by_class).join(", ")}**
- Sync modes present: **${diversity.sync_modes.present.join(", ")}**
- Sync modes absent: **${diversity.sync_modes.missing.join(", ")}**
- Pair scopes absent: **${diversity.pair_scopes.missing.join(", ")}**
${externalSample
  ? `- External sample corpora: **${externalSample.corpus_count}**\n- External scenario seeds: **${externalSample.scenario_count}**\n- External sample formats: **${Object.entries(
      externalSample.formats
    )
      .map(([format, count]) => `${format}=${count}`)
      .join(", ")}**\n- External sample phases: **${externalSample.lifecycle_phases.join(
      ", "
    )}**\n- External sample benchmark dimensions: **${externalSample.benchmark_dimensions.join(
      ", "
    )}**`
  : ""}

**Expansion check:** the main benchmark now spans multiple synthetic datasets and more than one sync mode, while the external sample supplement adds real open-source corpora for grep-first field realism. Coverage across artifact families remains strong, but language coverage is still limited and the fair common scoreboard is still narrower than a full multi-toolchain field matrix.

### 10. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **${results.overhead.bookkeeping_entries}**
- Bookkeeping entries per benchmark item: **${formatRatio(results.overhead.bookkeeping_entries_per_artifact)}**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only advisory token and exploratory query-route signals.
4. The benchmark now includes a deterministic real-corpus routing probe over 20 curated open-source grep-first seeds, a seed-title rerank lane, a structure-aware rerank lane, a path-family rerank lane, an API-surface rerank lane, separate section-context, section-evidence-pack, rank-order scenario-evidence-bundle, cost-aware scenario-evidence-bundle, claim-support-pack, answer-check, answer-locality, and authority-scoped answer lanes, plus a reachability audit that separates retrieval misses from exact scenario phrases that never appear anywhere in the corpus, a claim-support lane that allows deterministic per-scenario alias groups for clearly equivalent wording, explicit scenario answer checks that distinguish wording drift from concrete answer-support gaps, a target-locality audit that shows when concrete answers depend on cross-file borrowed evidence, and explicit answer-authority scopes that distinguish acceptable in-scope borrowing from out-of-scope recovery.
5. The benchmark now makes repository-scale corpus weight, raw loaded payload size, rendered prompt-envelope size, and multi-runtime request-body matrices over the current round-one baseline prompts explicit instead of conflating them.
6. The benchmark now includes a deterministic release-surface trust probe instead of assuming generated human surfaces and current inventory declarations remain trustworthy.
7. The benchmark now includes a first behavior-drift lane that mutates the runtime companion directly and measures route underreach and overreach at the loaded-module-set level.
8. The benchmark now answers the core product questions separately instead of hiding them inside one aggregate score: representability, information preservation, task-time context control, and anti-drift/trust behavior each have their own measurable lane.

### Limits and failure modes

${strongestBlindSpots.map((item) => `- ${item}`).join("\n")}

- The reference implementation now validates declared cross-surface invariants, but it still does not prove semantic equivalence beyond declared anchors.
- Progressive loading is strongest for touch-routed authoring flows; query routing still depends on corpus metadata quality and remains exploratory.
- Real-corpus routing and section compression are still heuristic; they do not yet test semantic chunk ranking or answer synthesis quality.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- The main scoreboard still relies on renderer-based prompt-envelope metrics across the full scenario set; the runtime-backed supplement now spans multiple local CLI profiles and one hosted relay lane, but the hosted request-loop split is still run-sensitive and should be read as directional field evidence rather than as a canonical fixed hosted loop.
- Sample diversity is stronger than before because it now includes an external open-source scenario supplement, but the pack remains English-only and narrower than a true multi-toolchain field sample.
- Release-surface trust is currently proven on the compiled pilot release surfaces; it is not yet a broader multi-corpus field benchmark.
- Behavior drift is now measurable for runtime companion route mutations, but it is still synthetic and narrower than a full autonomous execution trace benchmark.

## Bottom line

**AODS passes this benchmark on coverage, fidelity, task-time progressive loading, and anti-drift / trust controls.** It does not win by shrinking the entire repository corpus: full-corpus bytes stay roughly flat because governance metadata offsets local artifact compression. Instead, the practical gain comes from routing the working set down to a **12372-byte** median prompt envelope with **76.0%** median byte savings vs full load while keeping **100.0%** objective touch-route hit rate and **100.0%** built-in drift recall.${runtimeAttributionDelta ? ` The hosted runtime supplement also shows that when field cost grows beyond the local lane, the current successful hosted-vs-local median delta is **${Math.round(runtimeAttributionDelta.total_request_body_bytes_delta)} bytes** and the extra cost is concentrated in **tool-loop traffic rather than the first request envelope**.` : ""}${hostedRepeatability ? ` Across **${hostedRepeatability.successful_run_count}** successful hosted captures, that hosted/local total-delta band spans **${hostedRepeatability.bands?.delta_total_request_body_bytes?.span ?? 0} bytes** while the first-request delta stays at **${hostedRepeatability.bands?.delta_first_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_first_request_body_bytes?.max ?? 0} bytes**, so the hosted split should be read as directional field evidence rather than as a canonical fixed hosted loop.` : runtimeAttributionDelta ? " That hosted split is still repeat-run sensitive, so it should be read as directional field evidence rather than as a canonical fixed hosted loop." : ""} The benchmark is now much more objective and closer to field reality, but it still needs broader language coverage and a larger fair cross-toolchain field matrix.

## Appendix: reproducibility

\`\`\`bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:runtime-capture   # optional supplemental sample
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
npm run benchmark:summary
\`\`\`
`;
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

function hasBlockingHookIssue(hookReport) {
  return (hookReport.corpora ?? []).some((corpus) => {
    const hookIssues = corpus.hook_issues ?? [];
    const reportErrors = corpus.report?.summary?.errors ?? 0;
    return hookIssues.length > 0 || reportErrors > 0;
  });
}

function inferDatasetIdFromDocPath(docPath) {
  return docPath.startsWith("harbor/") ? "harbor" : "atlas";
}

function inferDatasetIdFromModuleId(moduleId) {
  return moduleId.startsWith("harbor-") ? "harbor" : "atlas";
}

function inferDatasetIdFromScenario(scenario) {
  const changedFile = scenario.changedFiles?.find(
    (filePath) => filePath.startsWith("harbor/") || filePath.startsWith("modules/harbor-")
  );
  if (changedFile) {
    return changedFile.startsWith("harbor/") ? "harbor" : "harbor";
  }
  if (scenario.touch) {
    return inferDatasetIdFromDocPath(scenario.touch);
  }
  const firstModule = scenario.requiredModules?.[0] ?? "";
  return inferDatasetIdFromModuleId(firstModule);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runEvaluation();
}
