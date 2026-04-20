import fs from "node:fs";
import path from "node:path";

import { LOADING_SCENARIOS } from "./benchmark-data.mjs";
import { PROJECT_ROOT, dedupe, median, measureText } from "./helpers.mjs";
import { measureBenchmarkPromptEnvelope } from "./prompt-envelope.mjs";

export function evaluateProfileLoading(profile) {
  const { scenarioResults } = buildProfileLoadingScenarioResults(profile);

  return {
    objective_touch: summarizeLoadingResults(
      scenarioResults.filter((scenario) => scenario.measurement_class === "objective")
    ),
    exploratory_query: summarizeLoadingResults(
      scenarioResults.filter((scenario) => scenario.measurement_class === "exploratory")
    ),
    combined: summarizeLoadingResults(scenarioResults),
    scenario_results: scenarioResults
  };
}

export function prepareProfileRuntimeCaptureScenarios(profile) {
  const { indexResources, unitContentMap, unitById } = buildProfileLoadingContext(profile);

  return LOADING_SCENARIOS.map((scenario) => {
    const loadedUnitIds = scenario.touch ? loadTouchUnits(profile, scenario) : loadSemanticUnits(profile, scenario);
    const loadedUnits = loadedUnitIds.map((unitId) => unitById.get(unitId)).filter(Boolean);
    const loadedModules = dedupe(loadedUnits.flatMap((unit) => unit.module_ids));
    const promptEnvelope = measureBenchmarkPromptEnvelope({
      formatLabel: profile.label,
      scenario,
      resources: buildProfilePromptResources(indexResources, unitContentMap, loadedUnits)
    });

    return {
      scenario: {
        id: scenario.id,
        description: scenario.description,
        scenario_class: scenario.scenario_class,
        measurement_class: scenario.measurement_class,
        route_strategy: scenario.touch ? "touch-route" : "query-route",
        touch: scenario.touch ?? null,
        role: scenario.role ?? null,
        intent: scenario.intent ?? null,
        loaded_units: loadedUnitIds,
        loaded_modules: loadedModules,
        required_modules: scenario.requiredModules
      },
      promptEnvelope
    };
  });
}

function buildProfileLoadingScenarioResults(profile) {
  const { indexResources, indexBytes, fullLoadBytes, fullLoadTokens, unitById, unitContentMap, unitMetricMap } =
    buildProfileLoadingContext(profile);
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
    const oracleTokens = profile.index_tokens_estimated + oracleUnits.reduce((sum, unit) => sum + unit.tokens_estimated, 0);
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
      mode: scenario.touch ? "touch-route" : "query-route",
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

  return { scenarioResults };
}

function buildProfileLoadingContext(profile) {
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
  const unitById = new Map(profile.units.map((unit) => [unit.id, unit]));
  const fullLoadTokens =
    profile.index_tokens_estimated + profile.units.reduce((sum, unit) => sum + unit.tokens_estimated, 0);
  const fullLoadBytes =
    indexBytes + profile.units.reduce((sum, unit) => sum + (unitMetricMap.get(unit.id)?.bytes ?? 0), 0);

  return {
    indexResources,
    indexBytes,
    fullLoadBytes,
    fullLoadTokens,
    unitById,
    unitContentMap,
    unitMetricMap
  };
}

export function buildProfilePromptResources(indexResources, unitContentMap, units) {
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

export function summarizeLoadingResults(scenarioResults) {
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
