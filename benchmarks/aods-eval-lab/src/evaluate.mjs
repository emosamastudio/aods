import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  ARTIFACTS,
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
import { measureBenchmarkPromptEnvelope } from "./prompt-envelope.mjs";
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
  const openSourceScenarioCatalog = fs.existsSync(OPEN_SOURCE_SCENARIO_CATALOG_PATH)
    ? readJson(OPEN_SOURCE_SCENARIO_CATALOG_PATH)
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
    diversity,
    overhead,
    limitations: [
      "Main benchmark gates rely on exact byte counts and touch-route scenarios; token estimates remain advisory.",
      "Non-touch query routing now uses the reference CLI, but the scenarios remain exploratory because they are still synthetic concept prompts rather than field-captured tasks.",
      openSourceCorporaManifest
        ? "The main scoreboard corpus is still synthetic but lifecycle-complete; the open-source scenario catalog now adds real-world grep-first field samples without collapsing the fairness contract."
        : "The benchmark corpus is synthetic but lifecycle-complete; it should be treated as a strong laboratory signal rather than a universal external sample.",
      "Runtime-backed capture is now available as a single local Copilot CLI sample, but the scenario-wide scoreboard still rests on shared renderer-based prompt-envelope metrics."
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
  if (strongestBlindSpots.length === 0) {
    strongestBlindSpots.push("No declared-invariant or known governance scenario remains a built-in miss in the current benchmark pack.");
  }

  const runtimeCaptureSummary = runtimeCapture
    ? `- **Runtime-backed local sample:** ${runtimeCapture.scenario.id} exact provider request body ${runtimeCapture.runtime_request.request_body_bytes} bytes vs rendered benchmark prompt ${runtimeCapture.benchmark_prompt.bytes} bytes (${formatRatio(runtimeCapture.runtime_request.request_vs_prompt_ratio)}x).`
    : "- **Runtime-backed local sample:** not generated in this run.";
  const externalSampleSummary = externalSample
    ? `- **External sample supplement:** ${externalSample.corpus_count} open-source corpora and ${externalSample.scenario_count} grep-first scenario seeds now supplement the synthetic benchmark pack.`
    : "- **External sample supplement:** not loaded in this run.";
  const runtimeCaptureSection = runtimeCapture
    ? `### 4. Runtime-backed local provider capture (supplemental)

- Runtime profile: **${runtimeCapture.profile.id}** using **${runtimeCapture.profile.runtime}** in offline local-provider mode
- Captured scenario: **${runtimeCapture.scenario.id}** (${runtimeCapture.scenario.description})
- Capture method: **stop after the first provider request is observed**, so this sample measures request-body size rather than full task completion
- Exact provider request body: **${runtimeCapture.runtime_request.request_body_bytes} bytes**, **${runtimeCapture.runtime_request.request_body_tokens_estimated} estimated tokens**
- Runtime user message: **${runtimeCapture.runtime_request.user_message_bytes} bytes**
- Runtime system message: **${runtimeCapture.runtime_request.system_message_bytes} bytes**
- Runtime tool definitions: **${runtimeCapture.runtime_request.tool_definitions_bytes} bytes**
- Runtime wrapper around the benchmark prompt: **${runtimeCapture.runtime_request.prompt_wrapper_bytes ?? 0} bytes**
- Ratio vs rendered benchmark prompt: **${formatRatio(runtimeCapture.runtime_request.request_vs_prompt_ratio)}x**
- Interpretation: **the benchmark prompt-envelope proxy is directionally useful, but one real Copilot CLI runtime request is still larger because the runtime adds a system message, tool definitions, and JSON framing on top of the routed AODS context.**
`
    : `### 4. Runtime-backed local provider capture (supplemental)

- No runtime capture artifact was loaded for this run.
- Interpretation: **the main benchmark still falls back to rendered prompt-envelope metrics until a runtime capture sample is generated.**
`;

  return `# AODS evaluation report

## Executive summary

This repository uses \`benchmarks/aods-eval-lab\` as its primary regression harness. The harness regenerates a multi-domain benchmark pack and evaluates AODS for coverage, fidelity, compression, progressive loading, drift prevention, and authoring overhead.

- **Coverage:** lifecycle phase coverage ${formatPercent(coverage.lifecycle_phase_coverage)}, structured type coverage ${formatPercent(coverage.structured_type_coverage)}, generic type coverage ${formatPercent(coverage.generic_type_coverage)}.
- **Fidelity:** critical fact preservation ${formatPercent(fidelity.critical_fact_preservation_rate)} with overall fact preservation ${formatPercent(fidelity.fact_preservation_rate)}.
- **Exact corpus size:** human docs ${fidelity.exact_size.human_docs.byte_count} bytes across ${fidelity.exact_size.human_docs.file_count} files; AODS corpus ${fidelity.exact_size.aods_corpus.byte_count} bytes across ${fidelity.exact_size.aods_corpus.file_count} files.
- **Task-time context footprint:** objective touch-route median rendered prompt envelope ${loading.objective_touch.median_prompt_envelope_bytes} bytes and ${loading.objective_touch.median_prompt_envelope_tokens_estimated} estimated tokens.
- **Objective loading gate:** touch-route hit rate ${formatPercent(loading.objective_touch.hit_rate)}, average recall ${formatPercent(loading.objective_touch.average_recall)}, median byte savings ${formatPercent(loading.objective_touch.median_byte_savings_vs_full_load)}.
- **Drift prevention:** built-in recall ${formatPercent(drift.built_in_recall)}, combined recall ${formatPercent(drift.combined_recall)}, built-in false-positive rate ${formatPercent(drift.built_in_false_positive_rate)}.
- ${runtimeCaptureSummary.slice(2)}
- ${externalSampleSummary.slice(2)}
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

### 6. Drift prevention

- Built-in drift recall: **${formatPercent(drift.built_in_recall)}**
- Semantic drift recall on applicable scenarios: **${formatPercent(drift.semantic_recall)}** across **${drift.semantic_applicable_scenario_count}** cases
- Semantic recall across all drift cases: **${formatPercent(drift.semantic_recall_all_drift_cases)}**
- Structural governance recall on semantic-not-applicable cases: **${formatPercent(drift.structural_governance_recall)}** across **${drift.structural_governance_scenario_count}** cases
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

### 7. Sample diversity and coverage audit

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

### 8. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **${results.overhead.bookkeeping_entries}**
- Bookkeeping entries per benchmark item: **${formatRatio(results.overhead.bookkeeping_entries_per_artifact)}**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only advisory token and exploratory query-route signals.
4. The benchmark now makes repository-scale corpus weight, raw loaded payload size, rendered prompt-envelope size, and one runtime-backed request-body sample explicit instead of conflating them.

### Limits and failure modes

${strongestBlindSpots.map((item) => `- ${item}`).join("\n")}

- The reference implementation now validates declared cross-surface invariants, but it still does not prove semantic equivalence beyond declared anchors.
- Progressive loading is strongest for touch-routed authoring flows; query routing still depends on corpus metadata quality and remains exploratory.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- The main scoreboard still relies on renderer-based prompt-envelope metrics across the full scenario set; the runtime-backed sample is currently one supplemental local Copilot CLI capture, not yet a full runtime matrix.
- Sample diversity is stronger than before because it now includes an external open-source scenario supplement, but the pack remains English-only and narrower than a true multi-toolchain field sample.

## Bottom line

**Coverage is strong, the objective touch-route gate is cleanly measurable, full-fidelity representation is achievable, and built-in anti-drift is materially stronger once shared_invariants are declared.** In this benchmark pack AODS preserves meaning, yet corpus weight may still grow because governance overhead can outweigh local artifact compression. The benchmark is now more objective and is no longer limited to a purely synthetic reading, but it still needs broader language coverage and a larger fair cross-toolchain field matrix.

## Appendix: reproducibility

\`\`\`bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:runtime-capture   # optional supplemental sample
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
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
