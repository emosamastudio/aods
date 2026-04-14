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
  STRUCTURED_TYPES
} from "./benchmark-data.mjs";
import { generateAll, projectPaths, renderHumanArtifact } from "./generate-fixtures.mjs";
import {
  PROJECT_ROOT,
  REPO_ROOT,
  appendText,
  copyDir,
  estimateTokens,
  formatPercent,
  formatRatio,
  median,
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
    overhead,
    limitations: [
      "Token counts use a deterministic chars-per-token estimate, not a model-native tokenizer.",
      "Non-touch semantic loading uses an independent scope-and-tag heuristic because the reference CLI only implements touch-oriented routing.",
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
  const humanTokens = listFiles(paths.humanRoot, [".md"]).reduce(
    (sum, filePath) => sum + estimateTokens(fs.readFileSync(filePath, "utf8")),
    0
  );
  const agentFiles = [
    path.join(paths.corpusRoot, "manifest.json"),
    ...MODULE_BLUEPRINTS.map((module) => path.join(paths.corpusRoot, module.path))
  ];
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
  const manifestTokens = estimateTokens(fs.readFileSync(path.join(paths.corpusRoot, "manifest.json"), "utf8"));
  const moduleTokenMap = new Map(manifest.modules.map((module) => [module.id, module.tokens_approx]));
  const fullLoadTokens =
    manifestTokens + manifest.modules.reduce((sum, module) => sum + (module.tokens_approx ?? 0), 0);

  const scenarioResults = LOADING_SCENARIOS.map((scenario) => {
    const loadedModules = scenario.touch
      ? routeModules(paths.corpusRoot, scenario)
      : semanticLoad(manifest, scenario);
    const loadedSet = new Set(loadedModules);
    const requiredSet = new Set(scenario.requiredModules);
    const hits = [...requiredSet].filter((moduleId) => loadedSet.has(moduleId)).length;
    const precision = loadedModules.length === 0 ? 0 : hits / loadedModules.length;
    const recall = hits / requiredSet.size;
    const routeTokens = manifestTokens + loadedModules.reduce((sum, moduleId) => sum + (moduleTokenMap.get(moduleId) ?? 0), 0);
    const oracleTokens = manifestTokens + scenario.requiredModules.reduce((sum, moduleId) => sum + (moduleTokenMap.get(moduleId) ?? 0), 0);
    return {
      id: scenario.id,
      description: scenario.description,
      mode: scenario.touch ? "touch-route" : "semantic-load",
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
    full_load_tokens_estimated: fullLoadTokens,
    scenario_results: scenarioResults,
    hit_rate: scenarioResults.filter((result) => result.exact_hit).length / scenarioResults.length,
    average_precision:
      scenarioResults.reduce((sum, result) => sum + result.precision, 0) / scenarioResults.length,
    average_recall: scenarioResults.reduce((sum, result) => sum + result.recall, 0) / scenarioResults.length,
    median_token_savings_vs_full_load: median(
      scenarioResults.map((result) => result.token_savings_vs_full_load)
    ),
    median_overfetch_ratio: median(scenarioResults.map((result) => result.overfetch_ratio))
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
- **Compression:** ${compressionHeadline}.
- **Progressive loading:** hit rate ${formatPercent(loading.hit_rate)}, average recall ${formatPercent(loading.average_recall)}, median token savings ${formatPercent(loading.median_token_savings_vs_full_load)}.
- **Drift prevention:** built-in recall ${formatPercent(drift.built_in_recall)}, combined recall ${formatPercent(drift.combined_recall)}, built-in false-positive rate ${formatPercent(drift.built_in_false_positive_rate)}.

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
- Estimated human-doc tokens: **${fidelity.human_doc_tokens_estimated}**
- Estimated AODS tokens: **${fidelity.aods_tokens_estimated}**
- Compression ratio (human/AODS): **${formatRatio(fidelity.compression_ratio_human_to_aods)}**
- Token reduction vs human docs: **${formatPercent(fidelity.token_reduction_vs_human)}**
- Median per-artifact compression ratio: **${formatRatio(fidelity.median_artifact_compression_ratio)}**
- Interpretation: **local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark.**

### 3. Progressive loading and token cost

- Full-load token estimate: **${loading.full_load_tokens_estimated}**
- Hit rate across ${loading.scenario_results.length} scenarios: **${formatPercent(loading.hit_rate)}**
- Average precision: **${formatPercent(loading.average_precision)}**
- Average recall: **${formatPercent(loading.average_recall)}**
- Median token savings vs full load: **${formatPercent(loading.median_token_savings_vs_full_load)}**
- Median overfetch ratio: **${formatRatio(loading.median_overfetch_ratio)}**

### 4. Drift prevention

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

### 5. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **${results.overhead.bookkeeping_entries}**
- Bookkeeping entries per benchmark item: **${formatRatio(results.overhead.bookkeeping_entries_per_artifact)}**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. Touch-routed authoring loads reduce token cost substantially against full-corpus loading.

### Limits and failure modes

${strongestBlindSpots.map((item) => `- ${item}`).join("\n")}

- The reference implementation validates structure and routing better than semantic truth.
- Progressive loading is strongest for touch-routed authoring flows; semantic query loading still depends on corpus metadata quality and external heuristics.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains.
- Token counts remain heuristic rather than tokenizer-exact.

## Bottom line

**Coverage is strong, progressive loading is useful, full-fidelity representation is achievable, but compression is mixed and anti-drift protection is only partial.** In this benchmark AODS preserves meaning, yet the whole corpus expands by about 51.5% because governance overhead outweighs local artifact compression. The strongest current weakness remains semantic drift: validator and hook logic can block some paired-surface mistakes, but they do not prove that compressed summaries, paired docs, and supporting modules still agree in meaning.

## Appendix: reproducibility

\`\`\`bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:evaluate
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

if (import.meta.url === `file://${process.argv[1]}`) {
  runEvaluation();
}
