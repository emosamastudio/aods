import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";

import { LOADING_SCENARIOS } from "./benchmark-data.mjs";
import {
  buildAodsPromptResources,
  buildScenarioAodsSupportResources,
  loadAodsCorpusIndex,
  routeScenarioModules
} from "./aods-loading.mjs";
import { buildComparatorCorpora } from "./comparator-fixtures.mjs";
import { generateAll, projectPaths } from "./generate-fixtures.mjs";
import { PROJECT_ROOT, REPO_ROOT, estimateTokens, formatPercent, formatRatio, median, writeJson, writeText } from "./helpers.mjs";
import { prepareProfileRuntimeCaptureScenarios } from "./profile-loading.mjs";
import { measureBenchmarkPromptEnvelope } from "./prompt-envelope.mjs";

const REPRESENTATIVE_SCENARIO_ID = "product-doc-edit";
const COPILOT_CAPTURE_MODEL = "dummy-model";
const CLAUDE_CAPTURE_MODEL = "claude-sonnet-4-6";
const PRIMARY_RUNTIME_PROFILE_ID = "copilot-cli-local-openai";
const LOCAL_CLAUDE_RUNTIME_PROFILE_ID = "claude-code-local-anthropic";
const HOSTED_CLAUDE_RUNTIME_PROFILE_ID = "claude-code-hosted-anthropic-relay";
const HOSTED_RUNTIME_CAPTURE_FLAG = "AODS_RUNTIME_CAPTURE_INCLUDE_HOSTED";
const HOSTED_REPEATABILITY_RUNS_FLAG = "AODS_RUNTIME_CAPTURE_HOSTED_REPEATABILITY_RUNS";
const DEFAULT_EMOHTTPCONNECT_BIN = process.env.AODS_EMOHTTPCONNECT_BIN ?? "/opt/homebrew/bin/emohttpconnect";
const DEFAULT_EMOANTHROPICRELAY_BIN =
  process.env.AODS_EMOANTHROPICRELAY_BIN ?? "/opt/homebrew/bin/emoanthropicrelay";
const DEFAULT_HOSTED_ANTHROPIC_BASE_URL =
  process.env.AODS_HOSTED_ANTHROPIC_BASE_URL ?? process.env.EMOCLAUDE_BASE_URL ?? "https://ai.leihuo.netease.com/";
const DEFAULT_HOSTED_SSH_TARGET = process.env.EMOCLAUDE_SSH_TARGET ?? "emoworklaptop";
const DEFAULT_KEYCHAIN_SERVICE = process.env.EMOCLAUDE_KEYCHAIN_SERVICE ?? "emoclaude.anthropic";
const DEFAULT_KEYCHAIN_ACCOUNT = process.env.EMOCLAUDE_KEYCHAIN_ACCOUNT ?? "ANTHROPIC_AUTH_TOKEN";
const BASE_RUNTIME_PROFILES = [
  {
    id: "copilot-cli-local-openai",
    runtime: "copilot-cli",
    provider: "local-openai-chat-completions-stub",
    mode: "offline",
    model: COPILOT_CAPTURE_MODEL,
    available_tools: ["view"],
    stream: "off",
    version_key: "copilot_version",
    readVersion: readCopilotVersion,
    startCapture: startLocalOpenAiProviderStub,
    captureRequest: captureCopilotRequest,
    captureLifecycle: captureCopilotLifecycle,
    analyzeRequest: analyzeOpenAiCapturedRequest
  },
  {
    id: "claude-code-local-anthropic",
    runtime: "claude-code",
    provider: "local-anthropic-messages-stub",
    mode: "offline",
    model: CLAUDE_CAPTURE_MODEL,
    available_tools: ["default-bare-toolset"],
    stream: "off",
    version_key: "claude_version",
    readVersion: readClaudeVersion,
    startCapture: startLocalAnthropicProviderStub,
    captureRequest: captureClaudeRequest,
    captureLifecycle: captureClaudeLifecycle,
    analyzeRequest: analyzeAnthropicCapturedRequest
  }
];

export async function runRuntimeCapture() {
  generateAll();

  const paths = projectPaths();
  const corpusIndex = loadAodsCorpusIndex(paths);
  const comparatorProfiles = buildComparatorCorpora(paths);
  const baselineDescriptors = [
    {
      id: "aods",
      label: "AODS",
      archetype: "Agent-first structured corpus",
      preparedScenarios: LOADING_SCENARIOS.map((scenario) => prepareRuntimeCaptureScenario(paths, corpusIndex, scenario))
    },
    ...comparatorProfiles.map((profile) => ({
      id: profile.id,
      label: profile.label,
      archetype: profile.archetype,
      preparedScenarios: prepareProfileRuntimeCaptureScenarios(profile)
    }))
  ];
  const runtimeProfilesToCapture = resolveRuntimeProfiles();
  const runtimeProfileMap = Object.fromEntries(runtimeProfilesToCapture.map((profile) => [profile.id, profile]));
  const runtimeProfileEntries = [];

  for (const runtimeProfile of runtimeProfilesToCapture) {
    runtimeProfileEntries.push([
      runtimeProfile.id,
      {
        captured_at: new Date().toISOString(),
        ...(await collectRuntimeProfileCapture(runtimeProfile, baselineDescriptors))
      }
    ]);
  }

  const runtimeProfiles = Object.fromEntries(runtimeProfileEntries);
  const primaryProfile = runtimeProfiles[PRIMARY_RUNTIME_PROFILE_ID];
  const primaryAodsMatrix = primaryProfile?.baseline_matrices?.aods ?? null;
  const hostedProfileCount = Object.values(runtimeProfiles).filter((profile) => profile.profile.mode === "hosted").length;
  const localProfileCount = Object.values(runtimeProfiles).filter((profile) => profile.profile.mode !== "hosted").length;
  const runtimeAttribution = buildHostedVsLocalRuntimeAttribution(runtimeProfiles);
  const hostedRepeatability = await collectHostedRepeatability({
    targetSuccessfulRuns: resolveHostedRepeatabilityTargetRuns(),
    hostedRuntimeProfile: runtimeProfileMap[HOSTED_CLAUDE_RUNTIME_PROFILE_ID] ?? null,
    baselineDescriptors,
    localProfileCapture: runtimeProfiles[LOCAL_CLAUDE_RUNTIME_PROFILE_ID] ?? null,
    initialHostedProfileCapture: runtimeProfiles[HOSTED_CLAUDE_RUNTIME_PROFILE_ID] ?? null
  });

  const results = {
    generated_at: new Date().toISOString(),
    runtime_profiles: runtimeProfiles,
    profile_ids: Object.keys(runtimeProfiles),
    profile_counts: {
      local: localProfileCount,
      hosted: hostedProfileCount
    },
    profile: primaryProfile?.profile ?? null,
    baseline_matrices: primaryProfile?.baseline_matrices ?? {},
    summary: primaryAodsMatrix?.summary ?? null,
    scenario_results: primaryAodsMatrix?.scenario_results ?? [],
    representative_scenario_id: primaryAodsMatrix?.representative_scenario_id ?? null,
    scenario: primaryAodsMatrix?.scenario ?? null,
    benchmark_prompt: primaryAodsMatrix?.benchmark_prompt ?? null,
    runtime_request: primaryAodsMatrix?.runtime_request ?? null,
    local_run: primaryAodsMatrix?.local_run ?? null,
    objective_lifecycle: primaryAodsMatrix?.objective_lifecycle ?? null,
    exploratory_lifecycle: primaryAodsMatrix?.exploratory_lifecycle ?? null,
    combined_lifecycle: primaryAodsMatrix?.combined_lifecycle ?? null,
    representative_lifecycle: primaryAodsMatrix?.representative_lifecycle ?? null,
    runtime_attribution: runtimeAttribution,
    hosted_repeatability: hostedRepeatability,
    limitations: [
      "This is a supplemental runtime matrix over the round-one baseline prompts, not a replacement for the shared renderer-based scoreboard.",
      "The matrix now captures multiple CLI runtime profiles over the current AODS and comparator loading scenario sets rather than only one local Copilot CLI sample.",
      "The shared matrix still uses first-request capture for fair cross-baseline comparison, while AODS now also records full-run lifecycle evidence across the current objective and exploratory scenario set plus a representative request breakdown.",
      hostedProfileCount > 0
        ? "Exact request-body bytes are captured either at a local provider-compatible hop or, for the optional hosted field lane, at a local capture relay that forwards the real hosted request through the repaired emoclaude-compatible path."
        : "Exact request-body bytes are captured at a local provider-compatible hop by default; hosted relay-backed field captures remain opt-in so the main benchmark gate stays reproducible and cost-safe."
    ]
  };

  writeJson(path.join(paths.resultsRoot, "runtime-capture-results.json"), results);
  writeText(path.join(PROJECT_ROOT, "reports", "runtime-capture-report.md"), renderRuntimeCaptureReport(results));
  return results;
}

function resolveRuntimeProfiles() {
  if (!isHostedRuntimeCaptureEnabled()) {
    return BASE_RUNTIME_PROFILES;
  }

  return [...BASE_RUNTIME_PROFILES, buildHostedClaudeRuntimeProfile()];
}

function isHostedRuntimeCaptureEnabled() {
  return process.env[HOSTED_RUNTIME_CAPTURE_FLAG] === "1";
}

function buildHostedClaudeRuntimeProfile() {
  return {
    id: HOSTED_CLAUDE_RUNTIME_PROFILE_ID,
    runtime: "claude-code",
    provider: "hosted-anthropic-compatible-via-local-relay",
    mode: "hosted",
    model: CLAUDE_CAPTURE_MODEL,
    available_tools: ["default-bare-toolset"],
    stream: "off",
    version_key: "claude_version",
    readVersion: readClaudeVersion,
    startCapture: startHostedAnthropicRelayCapture,
    captureRequest: captureClaudeRequest,
    captureLifecycle: captureClaudeLifecycle,
    analyzeRequest: analyzeAnthropicCapturedRequest
  };
}

function resolveHostedRepeatabilityTargetRuns() {
  if (!isHostedRuntimeCaptureEnabled()) {
    return 0;
  }
  const rawValue = process.env[HOSTED_REPEATABILITY_RUNS_FLAG];
  if (!rawValue) {
    return 1;
  }
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${HOSTED_REPEATABILITY_RUNS_FLAG} must be a positive integer when provided.`);
  }
  return parsed;
}

function prepareRuntimeCaptureScenario(paths, corpusIndex, scenario) {
  const { manifestContent, moduleRefMap, moduleContentMap } = corpusIndex;
  const route = routeScenarioModules(paths.corpusRoot, scenario);
  const loadedModules = route.recommended_modules.map((module) => module.id);
  const moduleRefs = loadedModules.map((moduleId) => moduleRefMap.get(moduleId)).filter(Boolean);
  const promptResources = buildAodsPromptResources(manifestContent, moduleRefMap, moduleContentMap, moduleRefs, {
    supportResources: buildScenarioAodsSupportResources(corpusIndex, route)
  });
  const promptEnvelope = measureBenchmarkPromptEnvelope({
    formatLabel: "AODS",
    scenario,
    resources: promptResources
  });

  return {
    scenario: {
      id: scenario.id,
      description: scenario.description,
      scenario_class: scenario.scenario_class,
      measurement_class: scenario.measurement_class,
      route_strategy: route.strategy,
      touch: scenario.touch ?? null,
      role: scenario.role ?? null,
      intent: scenario.intent ?? null,
      loaded_modules: loadedModules,
      required_modules: scenario.requiredModules
    },
    promptEnvelope
  };
}

async function collectRuntimeProfileCapture(runtimeProfile, baselineDescriptors) {
  const captureServer = await runtimeProfile.startCapture();

  try {
    const version = runtimeProfile.readVersion();
    const baselineMatrixEntries = [];

    for (const descriptor of baselineDescriptors) {
      const scenarioResults = [];

      for (const prepared of descriptor.preparedScenarios) {
        const execution = await runtimeProfile.captureRequest(prepared.promptEnvelope.text, captureServer);
        const metrics = runtimeProfile.analyzeRequest({
          request: execution.request,
          promptText: prepared.promptEnvelope.text,
          version
        });
        scenarioResults.push({
          scenario: prepared.scenario,
          benchmark_prompt: {
            bytes: prepared.promptEnvelope.bytes,
            tokens_estimated: prepared.promptEnvelope.tokens_estimated
          },
          runtime_request: metrics,
          local_run: {
            capture_stop_rule: "stop-after-first-provider-request",
            exit_code: execution.exit_code,
            exit_signal: execution.exit_signal,
            stdout_bytes: execution.stdout_bytes,
            stderr_bytes: execution.stderr_bytes,
            request_attempts: execution.request_attempts
          }
        });
      }

      const summary = summarizeRuntimeCaptureMatrix(scenarioResults);
      const representative =
        scenarioResults.find((result) => result.scenario.id === REPRESENTATIVE_SCENARIO_ID) ?? scenarioResults[0] ?? null;
      const representativePrepared =
        descriptor.preparedScenarios.find((prepared) => prepared.scenario.id === representative?.scenario?.id) ??
        descriptor.preparedScenarios[0] ??
        null;
      const lifecycleGroups =
        descriptor.id === "aods" && runtimeProfile.captureLifecycle
          ? await collectAodsLifecycleGroups(
              descriptor.preparedScenarios,
              runtimeProfile,
              captureServer,
              version
            )
          : null;
      const representativeLifecycle =
        representativePrepared && runtimeProfile.captureLifecycle
          ? summarizeLifecycleExecution(
              await runtimeProfile.captureLifecycle(representativePrepared.promptEnvelope.text, captureServer),
              representativePrepared.promptEnvelope.text,
              version,
              runtimeProfile.analyzeRequest
            )
          : null;
      baselineMatrixEntries.push([
        descriptor.id,
        {
          id: descriptor.id,
          label: descriptor.label,
          archetype: descriptor.archetype,
          summary,
          scenario_results: scenarioResults,
          representative_scenario_id: representative?.scenario.id ?? null,
          scenario: representative?.scenario ?? null,
          benchmark_prompt: representative?.benchmark_prompt ?? null,
          runtime_request: representative?.runtime_request ?? null,
          local_run: representative?.local_run ?? null,
          objective_lifecycle: lifecycleGroups?.objective_touch ?? null,
          exploratory_lifecycle: lifecycleGroups?.exploratory_query ?? null,
          combined_lifecycle: lifecycleGroups?.combined ?? null,
          representative_lifecycle: representativeLifecycle
        }
      ]);
    }

    return {
      profile: {
        id: runtimeProfile.id,
        runtime: runtimeProfile.runtime,
        provider: runtimeProfile.provider,
        mode: runtimeProfile.mode,
        model: runtimeProfile.model,
        available_tools: runtimeProfile.available_tools,
        stream: runtimeProfile.stream,
        [runtimeProfile.version_key]: version
      },
      baseline_matrices: Object.fromEntries(baselineMatrixEntries)
    };
  } finally {
    await captureServer.close();
  }
}

function buildHostedVsLocalRuntimeAttribution(runtimeProfiles) {
  const localProfile = runtimeProfiles[LOCAL_CLAUDE_RUNTIME_PROFILE_ID] ?? null;
  const hostedProfile =
    Object.values(runtimeProfiles).find(
      (profile) => profile.profile.mode === "hosted" && profile.profile.runtime === "claude-code"
    ) ?? null;
  const localCombined = localProfile?.baseline_matrices?.aods?.combined_lifecycle ?? null;
  const hostedCombined = hostedProfile?.baseline_matrices?.aods?.combined_lifecycle ?? null;

  if (!localProfile || !hostedProfile || !localCombined || !hostedCombined) {
    return null;
  }

  const localSummary = localCombined.summary;
  const hostedSummary = hostedCombined.summary;
  const totalRequestBodyBytesDelta =
    hostedSummary.median_total_request_body_bytes - localSummary.median_total_request_body_bytes;
  const firstRequestBodyBytesDelta =
    hostedSummary.median_first_request_body_bytes - localSummary.median_first_request_body_bytes;
  const followupPromptRequestBodyBytesDelta =
    hostedSummary.median_followup_prompt_request_body_bytes - localSummary.median_followup_prompt_request_body_bytes;
  const toolLoopRequestBodyBytesDelta =
    hostedSummary.median_tool_loop_request_body_bytes - localSummary.median_tool_loop_request_body_bytes;
  const auxiliaryRequestBodyBytesDelta =
    hostedSummary.median_auxiliary_request_body_bytes - localSummary.median_auxiliary_request_body_bytes;
  const localScenarioMap = new Map(
    (localCombined.scenario_results ?? []).map((result) => [result.scenario.id, result])
  );
  const heaviestToolLoopDeltaScenarios = (hostedCombined.scenario_results ?? [])
    .map((hostedResult) => {
      const localResult = localScenarioMap.get(hostedResult.scenario.id);
      if (!localResult) {
        return null;
      }
      return {
        scenario_id: hostedResult.scenario.id,
        measurement_class: hostedResult.scenario.measurement_class,
        route_strategy: hostedResult.scenario.route_strategy,
        total_request_body_bytes_delta:
          hostedResult.lifecycle.total_request_body_bytes - localResult.lifecycle.total_request_body_bytes,
        first_request_body_bytes_delta:
          hostedResult.lifecycle.first_request_body_bytes - localResult.lifecycle.first_request_body_bytes,
        followup_prompt_request_body_bytes_delta:
          hostedResult.lifecycle.followup_prompt_request_body_bytes -
          localResult.lifecycle.followup_prompt_request_body_bytes,
        tool_loop_request_body_bytes_delta:
          hostedResult.lifecycle.tool_loop_request_body_bytes - localResult.lifecycle.tool_loop_request_body_bytes,
        auxiliary_request_body_bytes_delta:
          hostedResult.lifecycle.auxiliary_request_body_bytes - localResult.lifecycle.auxiliary_request_body_bytes,
        request_count_delta: hostedResult.lifecycle.request_count - localResult.lifecycle.request_count,
        followup_prompt_request_count_delta:
          hostedResult.lifecycle.followup_prompt_request_count - localResult.lifecycle.followup_prompt_request_count,
        tool_loop_request_count_delta:
          hostedResult.lifecycle.tool_loop_request_count - localResult.lifecycle.tool_loop_request_count,
        auxiliary_request_count_delta:
          hostedResult.lifecycle.auxiliary_request_count - localResult.lifecycle.auxiliary_request_count
      };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.tool_loop_request_body_bytes_delta - left.tool_loop_request_body_bytes_delta ||
        right.total_request_body_bytes_delta - left.total_request_body_bytes_delta
    )
    .slice(0, 5);

  return {
    local_profile_id: localProfile.profile.id,
    hosted_profile_id: hostedProfile.profile.id,
    combined_median_delta: {
      request_count_delta: hostedSummary.median_request_count - localSummary.median_request_count,
      first_request_count_delta: hostedSummary.median_first_request_count - localSummary.median_first_request_count,
      followup_prompt_request_count_delta:
        hostedSummary.median_followup_prompt_requests - localSummary.median_followup_prompt_requests,
      tool_loop_request_count_delta:
        hostedSummary.median_tool_loop_request_count - localSummary.median_tool_loop_request_count,
      auxiliary_request_count_delta:
        hostedSummary.median_auxiliary_request_count - localSummary.median_auxiliary_request_count,
      total_request_body_bytes_delta: totalRequestBodyBytesDelta,
      first_request_body_bytes_delta: firstRequestBodyBytesDelta,
      followup_prompt_request_body_bytes_delta: followupPromptRequestBodyBytesDelta,
      tool_loop_request_body_bytes_delta: toolLoopRequestBodyBytesDelta,
      auxiliary_request_body_bytes_delta: auxiliaryRequestBodyBytesDelta,
      first_request_share_of_total_delta:
        totalRequestBodyBytesDelta > 0 ? firstRequestBodyBytesDelta / totalRequestBodyBytesDelta : 0,
      followup_prompt_share_of_total_delta:
        totalRequestBodyBytesDelta > 0 ? followupPromptRequestBodyBytesDelta / totalRequestBodyBytesDelta : 0,
      tool_loop_share_of_total_delta:
        totalRequestBodyBytesDelta > 0 ? toolLoopRequestBodyBytesDelta / totalRequestBodyBytesDelta : 0,
      auxiliary_share_of_total_delta:
        totalRequestBodyBytesDelta > 0 ? auxiliaryRequestBodyBytesDelta / totalRequestBodyBytesDelta : 0
    },
    heaviest_tool_loop_delta_scenarios: heaviestToolLoopDeltaScenarios
  };
}

async function collectHostedRepeatability({
  targetSuccessfulRuns,
  hostedRuntimeProfile,
  baselineDescriptors,
  localProfileCapture,
  initialHostedProfileCapture
}) {
  if (
    targetSuccessfulRuns <= 1 ||
    !hostedRuntimeProfile ||
    !localProfileCapture ||
    !initialHostedProfileCapture
  ) {
    return null;
  }

  const hostedCaptures = [initialHostedProfileCapture];
  while (hostedCaptures.length < targetSuccessfulRuns) {
    hostedCaptures.push({
      captured_at: new Date().toISOString(),
      ...(await collectRuntimeProfileCapture(hostedRuntimeProfile, baselineDescriptors))
    });
  }

  const runSummaries = hostedCaptures.map((capture, index) =>
    buildHostedRepeatabilityRun(index + 1, capture, localProfileCapture)
  );
  const bands = buildHostedRepeatabilityBands(runSummaries);

  return {
    requested_successful_runs: targetSuccessfulRuns,
    successful_run_count: runSummaries.length,
    local_profile_id: localProfileCapture.profile.id,
    hosted_profile_id: initialHostedProfileCapture.profile.id,
    run_summaries: runSummaries,
    bands,
    findings: {
      first_request_delta_is_stable: (bands.delta_first_request_body_bytes?.span ?? 0) === 0,
      tool_loop_delta_dominates_all_runs: runSummaries.every(
        (run) =>
          (run.combined_median_delta?.tool_loop_request_body_bytes_delta ?? 0) >
          Math.max(
            run.combined_median_delta?.first_request_body_bytes_delta ?? 0,
            run.combined_median_delta?.followup_prompt_request_body_bytes_delta ?? 0,
            run.combined_median_delta?.auxiliary_request_body_bytes_delta ?? 0
          )
      ),
      hosted_loop_split_is_repeat_sensitive:
        (bands.hosted_followup_prompt_request_count?.span ?? 0) > 0 ||
        (bands.hosted_tool_loop_request_count?.span ?? 0) > 0 ||
        (bands.delta_followup_prompt_request_body_bytes?.span ?? 0) > 0 ||
        (bands.delta_tool_loop_request_body_bytes?.span ?? 0) > 0
    }
  };
}

function buildHostedRepeatabilityRun(runIndex, hostedCapture, localProfileCapture) {
  const hostedAods = hostedCapture?.baseline_matrices?.aods ?? null;
  const hostedCombined = hostedAods?.combined_lifecycle?.summary ?? null;
  const hostedObjective = hostedAods?.objective_lifecycle?.summary ?? null;
  const hostedExploratory = hostedAods?.exploratory_lifecycle?.summary ?? null;
  const hostedRepresentative = hostedAods?.representative_lifecycle ?? null;
  const runtimeAttribution = buildHostedVsLocalRuntimeAttribution({
    [LOCAL_CLAUDE_RUNTIME_PROFILE_ID]: localProfileCapture,
    [hostedCapture.profile.id]: hostedCapture
  });

  return {
    run_index: runIndex,
    captured_at: hostedCapture.captured_at ?? null,
    combined_lifecycle: pickLifecycleSummaryMetrics(hostedCombined),
    objective_lifecycle: pickLifecycleSummaryMetrics(hostedObjective),
    exploratory_lifecycle: pickLifecycleSummaryMetrics(hostedExploratory),
    representative_lifecycle: pickRepresentativeLifecycleMetrics(hostedRepresentative),
    combined_median_delta: runtimeAttribution?.combined_median_delta ?? null,
    heaviest_tool_loop_delta_scenario: runtimeAttribution?.heaviest_tool_loop_delta_scenarios?.[0] ?? null
  };
}

function pickLifecycleSummaryMetrics(summary) {
  if (!summary) {
    return null;
  }
  return {
    scenario_count: summary.scenario_count,
    median_request_count: summary.median_request_count,
    median_first_request_count: summary.median_first_request_count,
    median_followup_prompt_requests: summary.median_followup_prompt_requests,
    median_tool_loop_request_count: summary.median_tool_loop_request_count,
    median_auxiliary_request_count: summary.median_auxiliary_request_count,
    median_total_request_body_bytes: summary.median_total_request_body_bytes,
    median_first_request_body_bytes: summary.median_first_request_body_bytes,
    median_followup_prompt_request_body_bytes: summary.median_followup_prompt_request_body_bytes,
    median_tool_loop_request_body_bytes: summary.median_tool_loop_request_body_bytes,
    median_auxiliary_request_body_bytes: summary.median_auxiliary_request_body_bytes,
    median_duration_ms: summary.median_duration_ms
  };
}

function pickRepresentativeLifecycleMetrics(lifecycle) {
  if (!lifecycle) {
    return null;
  }
  return {
    request_count: lifecycle.request_count,
    first_request_count: lifecycle.first_request_count,
    followup_prompt_request_count: lifecycle.followup_prompt_request_count,
    tool_loop_request_count: lifecycle.tool_loop_request_count,
    auxiliary_request_count: lifecycle.auxiliary_request_count,
    total_request_body_bytes: lifecycle.total_request_body_bytes,
    first_request_body_bytes: lifecycle.first_request_body_bytes,
    followup_prompt_request_body_bytes: lifecycle.followup_prompt_request_body_bytes,
    tool_loop_request_body_bytes: lifecycle.tool_loop_request_body_bytes,
    auxiliary_request_body_bytes: lifecycle.auxiliary_request_body_bytes,
    duration_ms: lifecycle.local_run?.duration_ms ?? 0
  };
}

function buildHostedRepeatabilityBands(runSummaries) {
  return {
    hosted_total_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_lifecycle?.median_total_request_body_bytes ?? 0)
    ),
    hosted_first_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_lifecycle?.median_first_request_body_bytes ?? 0)
    ),
    hosted_followup_prompt_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_lifecycle?.median_followup_prompt_request_body_bytes ?? 0)
    ),
    hosted_tool_loop_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_lifecycle?.median_tool_loop_request_body_bytes ?? 0)
    ),
    hosted_followup_prompt_request_count: buildNumericBand(
      runSummaries.map((run) => run.combined_lifecycle?.median_followup_prompt_requests ?? 0)
    ),
    hosted_tool_loop_request_count: buildNumericBand(
      runSummaries.map((run) => run.combined_lifecycle?.median_tool_loop_request_count ?? 0)
    ),
    delta_total_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_median_delta?.total_request_body_bytes_delta ?? 0)
    ),
    delta_first_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_median_delta?.first_request_body_bytes_delta ?? 0)
    ),
    delta_followup_prompt_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_median_delta?.followup_prompt_request_body_bytes_delta ?? 0)
    ),
    delta_tool_loop_request_body_bytes: buildNumericBand(
      runSummaries.map((run) => run.combined_median_delta?.tool_loop_request_body_bytes_delta ?? 0)
    )
  };
}

function buildNumericBand(values) {
  if (values.length === 0) {
    return {
      sample_count: 0,
      min: 0,
      max: 0,
      span: 0,
      median: 0,
      mean: 0,
      stdev: 0
    };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = sum(values) / values.length;
  const variance = values.length > 1 ? sum(values.map((value) => (value - mean) ** 2)) / values.length : 0;
  return {
    sample_count: values.length,
    min,
    max,
    span: max - min,
    median: median(values),
    mean,
    stdev: Math.sqrt(variance)
  };
}

function summarizeRuntimeCaptureMatrix(scenarioResults) {
  const objectiveTouch = scenarioResults.filter((result) => result.scenario.measurement_class === "objective");
  const exploratoryQuery = scenarioResults.filter((result) => result.scenario.measurement_class === "exploratory");
  const largestRequest = scenarioResults.reduce(
    (current, result) =>
      !current || result.runtime_request.request_body_bytes > current.runtime_request.request_body_bytes ? result : current,
    null
  );
  const smallestRequest = scenarioResults.reduce(
    (current, result) =>
      !current || result.runtime_request.request_body_bytes < current.runtime_request.request_body_bytes ? result : current,
    null
  );

  return {
    scenario_count: scenarioResults.length,
    objective_touch: summarizeRuntimeCaptureGroup(objectiveTouch),
    exploratory_query: summarizeRuntimeCaptureGroup(exploratoryQuery),
    combined: summarizeRuntimeCaptureGroup(scenarioResults),
    largest_request: largestRequest
      ? {
          scenario_id: largestRequest.scenario.id,
          request_body_bytes: largestRequest.runtime_request.request_body_bytes,
          prompt_bytes: largestRequest.benchmark_prompt.bytes,
          route_strategy: largestRequest.scenario.route_strategy
        }
      : null,
    smallest_request: smallestRequest
      ? {
          scenario_id: smallestRequest.scenario.id,
          request_body_bytes: smallestRequest.runtime_request.request_body_bytes,
          prompt_bytes: smallestRequest.benchmark_prompt.bytes,
          route_strategy: smallestRequest.scenario.route_strategy
        }
      : null
  };
}

function summarizeRuntimeCaptureGroup(results) {
  if (results.length === 0) {
    return {
      scenario_count: 0,
      median_prompt_bytes: 0,
      median_prompt_tokens_estimated: 0,
      median_request_body_bytes: 0,
      median_request_body_tokens_estimated: 0,
      median_runtime_added_bytes: 0,
      median_request_vs_prompt_ratio: 0,
      median_prompt_share_of_request: 0,
      median_system_share_of_request: 0,
      median_tool_share_of_request: 0,
      median_prompt_wrapper_bytes: 0
    };
  }

  return {
    scenario_count: results.length,
    median_prompt_bytes: median(results.map((result) => result.benchmark_prompt.bytes)),
    median_prompt_tokens_estimated: median(results.map((result) => result.benchmark_prompt.tokens_estimated)),
    median_request_body_bytes: median(results.map((result) => result.runtime_request.request_body_bytes)),
    median_request_body_tokens_estimated: median(
      results.map((result) => result.runtime_request.request_body_tokens_estimated)
    ),
    median_runtime_added_bytes: median(
      results.map((result) => result.runtime_request.request_body_bytes - result.benchmark_prompt.bytes)
    ),
    median_request_vs_prompt_ratio: median(results.map((result) => result.runtime_request.request_vs_prompt_ratio)),
    median_prompt_share_of_request: median(results.map((result) => result.runtime_request.prompt_share_of_request)),
    median_system_share_of_request: median(results.map((result) => result.runtime_request.system_share_of_request)),
    median_tool_share_of_request: median(results.map((result) => result.runtime_request.tool_share_of_request)),
    median_prompt_wrapper_bytes: median(results.map((result) => result.runtime_request.prompt_wrapper_bytes ?? 0))
  };
}

async function collectAodsLifecycleGroups(preparedScenarios, runtimeProfile, captureServer, version) {
  const scenarioResults = await collectLifecycleScenarioResults(preparedScenarios, runtimeProfile, captureServer, version);
  const objectiveTouch = scenarioResults.filter((result) => result.scenario.measurement_class === "objective");
  const exploratoryQuery = scenarioResults.filter((result) => result.scenario.measurement_class === "exploratory");

  return {
    objective_touch: buildLifecycleGroup(objectiveTouch),
    exploratory_query: buildLifecycleGroup(exploratoryQuery),
    combined: buildLifecycleGroup(scenarioResults)
  };
}

async function collectLifecycleScenarioResults(preparedScenarios, runtimeProfile, captureServer, version) {
  const scenarioResults = [];

  for (const prepared of preparedScenarios) {
    const lifecycle = summarizeLifecycleExecution(
      await runtimeProfile.captureLifecycle(prepared.promptEnvelope.text, captureServer),
      prepared.promptEnvelope.text,
      version,
      runtimeProfile.analyzeRequest
    );
    scenarioResults.push({
      scenario: prepared.scenario,
      benchmark_prompt: {
        bytes: prepared.promptEnvelope.bytes,
        tokens_estimated: prepared.promptEnvelope.tokens_estimated
      },
      lifecycle
    });
  }

  return scenarioResults;
}

function buildLifecycleGroup(scenarioResults) {
  return {
    summary: summarizeLifecycleMatrix(scenarioResults),
    scenario_results: scenarioResults
  };
}

function classifyLifecycleRequest(requestMetrics) {
  if (!requestMetrics.prompt_embedded_in_user_message) {
    return "auxiliary-side";
  }
  if (requestMetrics.index === 1) {
    return "first-request";
  }
  if (requestMetrics.tool_count > 0) {
    return "tool-loop";
  }
  return "follow-up-prompt";
}

function summarizeLifecycleExecution(execution, promptText, version, analyzeRequest) {
  const requestMetrics = execution.requests.map((request, index) => {
    const metrics = {
      index: index + 1,
      ...analyzeRequest({ request, promptText, version })
    };
    return {
      ...metrics,
      lifecycle_request_class: classifyLifecycleRequest(metrics)
    };
  });
  const promptRequestMetrics = requestMetrics.filter((request) => request.prompt_embedded_in_user_message);
  const firstRequestMetrics = requestMetrics.filter((request) => request.lifecycle_request_class === "first-request");
  const followupPromptRequestMetrics = requestMetrics.filter(
    (request) => request.lifecycle_request_class === "follow-up-prompt"
  );
  const toolLoopRequestMetrics = requestMetrics.filter((request) => request.lifecycle_request_class === "tool-loop");
  const auxiliaryRequestMetrics = requestMetrics.filter((request) => !request.prompt_embedded_in_user_message);
  const totalRequestBodyBytes = sum(requestMetrics.map((request) => request.request_body_bytes));
  const firstRequestBodyBytes = sum(firstRequestMetrics.map((request) => request.request_body_bytes));
  const followupPromptRequestBodyBytes = sum(followupPromptRequestMetrics.map((request) => request.request_body_bytes));
  const toolLoopRequestBodyBytes = sum(toolLoopRequestMetrics.map((request) => request.request_body_bytes));
  const promptRequestBodyBytes = sum(promptRequestMetrics.map((request) => request.request_body_bytes));
  const auxiliaryRequestBodyBytes = sum(auxiliaryRequestMetrics.map((request) => request.request_body_bytes));
  const promptBytes = Buffer.byteLength(promptText, "utf8");

  return {
    request_count: requestMetrics.length,
    prompt_request_count: promptRequestMetrics.length,
    first_request_count: firstRequestMetrics.length,
    followup_prompt_request_count: followupPromptRequestMetrics.length,
    tool_loop_request_count: toolLoopRequestMetrics.length,
    auxiliary_request_count: auxiliaryRequestMetrics.length,
    total_request_body_bytes: totalRequestBodyBytes,
    total_request_body_tokens_estimated: sum(requestMetrics.map((request) => request.request_body_tokens_estimated)),
    first_request_body_bytes: firstRequestBodyBytes,
    followup_prompt_request_body_bytes: followupPromptRequestBodyBytes,
    tool_loop_request_body_bytes: toolLoopRequestBodyBytes,
    prompt_request_body_bytes: promptRequestBodyBytes,
    auxiliary_request_body_bytes: auxiliaryRequestBodyBytes,
    first_request_share_of_total_request_bytes: totalRequestBodyBytes > 0 ? firstRequestBodyBytes / totalRequestBodyBytes : 0,
    followup_prompt_share_of_total_request_bytes:
      totalRequestBodyBytes > 0 ? followupPromptRequestBodyBytes / totalRequestBodyBytes : 0,
    tool_loop_share_of_total_request_bytes: totalRequestBodyBytes > 0 ? toolLoopRequestBodyBytes / totalRequestBodyBytes : 0,
    auxiliary_share_of_total_request_bytes:
      totalRequestBodyBytes > 0 ? auxiliaryRequestBodyBytes / totalRequestBodyBytes : 0,
    total_request_vs_prompt_ratio: promptBytes > 0 ? totalRequestBodyBytes / promptBytes : 0,
    max_request_body_bytes: requestMetrics.length > 0 ? Math.max(...requestMetrics.map((request) => request.request_body_bytes)) : 0,
    min_request_body_bytes: requestMetrics.length > 0 ? Math.min(...requestMetrics.map((request) => request.request_body_bytes)) : 0,
    request_breakdown: requestMetrics.map((request) => ({
      index: request.index,
      lifecycle_request_class: request.lifecycle_request_class,
      provider_request_path: request.provider_request_path,
      request_body_bytes: request.request_body_bytes,
      prompt_embedded_in_user_message: request.prompt_embedded_in_user_message,
      tool_count: request.tool_count,
      message_roles: request.message_roles
    })),
    local_run: {
      capture_stop_rule: "wait-for-process-exit",
      exit_code: execution.exit_code,
      exit_signal: execution.exit_signal,
      stdout_bytes: execution.stdout_bytes,
      stderr_bytes: execution.stderr_bytes,
      request_attempts: execution.request_attempts,
      duration_ms: execution.duration_ms
    }
  };
}

function summarizeLifecycleMatrix(results) {
  if (results.length === 0) {
    return {
      scenario_count: 0,
      median_request_count: 0,
      median_first_request_count: 0,
      median_followup_prompt_requests: 0,
      median_tool_loop_request_count: 0,
      median_auxiliary_request_count: 0,
      median_total_request_body_bytes: 0,
      median_total_request_body_tokens_estimated: 0,
      median_first_request_body_bytes: 0,
      median_followup_prompt_request_body_bytes: 0,
      median_tool_loop_request_body_bytes: 0,
      median_auxiliary_request_body_bytes: 0,
      median_total_request_vs_prompt_ratio: 0,
      median_first_request_share_of_total_request_bytes: 0,
      median_followup_prompt_share_of_total_request_bytes: 0,
      median_tool_loop_share_of_total_request_bytes: 0,
      median_auxiliary_share_of_total_request_bytes: 0,
      median_duration_ms: 0,
      multi_request_scenario_rate: 0,
      scenarios_with_followup_prompt_request_rate: 0,
      scenarios_with_tool_loop_request_rate: 0,
      scenarios_with_auxiliary_request_rate: 0,
      largest_total_request: null,
      smallest_total_request: null
    };
  }

  const largestTotalRequest = results.reduce(
    (current, result) =>
      !current || result.lifecycle.total_request_body_bytes > current.lifecycle.total_request_body_bytes ? result : current,
    null
  );
  const smallestTotalRequest = results.reduce(
    (current, result) =>
      !current || result.lifecycle.total_request_body_bytes < current.lifecycle.total_request_body_bytes ? result : current,
    null
  );

  return {
    scenario_count: results.length,
    median_request_count: median(results.map((result) => result.lifecycle.request_count)),
    median_first_request_count: median(results.map((result) => result.lifecycle.first_request_count)),
    median_followup_prompt_requests: median(
      results.map((result) => result.lifecycle.followup_prompt_request_count)
    ),
    median_tool_loop_request_count: median(results.map((result) => result.lifecycle.tool_loop_request_count)),
    median_auxiliary_request_count: median(results.map((result) => result.lifecycle.auxiliary_request_count)),
    median_total_request_body_bytes: median(results.map((result) => result.lifecycle.total_request_body_bytes)),
    median_total_request_body_tokens_estimated: median(
      results.map((result) => result.lifecycle.total_request_body_tokens_estimated)
    ),
    median_first_request_body_bytes: median(results.map((result) => result.lifecycle.first_request_body_bytes)),
    median_followup_prompt_request_body_bytes: median(
      results.map((result) => result.lifecycle.followup_prompt_request_body_bytes)
    ),
    median_tool_loop_request_body_bytes: median(results.map((result) => result.lifecycle.tool_loop_request_body_bytes)),
    median_auxiliary_request_body_bytes: median(results.map((result) => result.lifecycle.auxiliary_request_body_bytes)),
    median_total_request_vs_prompt_ratio: median(
      results.map((result) => result.lifecycle.total_request_vs_prompt_ratio)
    ),
    median_first_request_share_of_total_request_bytes: median(
      results.map((result) => result.lifecycle.first_request_share_of_total_request_bytes)
    ),
    median_followup_prompt_share_of_total_request_bytes: median(
      results.map((result) => result.lifecycle.followup_prompt_share_of_total_request_bytes)
    ),
    median_tool_loop_share_of_total_request_bytes: median(
      results.map((result) => result.lifecycle.tool_loop_share_of_total_request_bytes)
    ),
    median_auxiliary_share_of_total_request_bytes: median(
      results.map((result) => result.lifecycle.auxiliary_share_of_total_request_bytes)
    ),
    median_duration_ms: median(results.map((result) => result.lifecycle.local_run.duration_ms)),
    multi_request_scenario_rate: results.filter((result) => result.lifecycle.request_count > 1).length / results.length,
    scenarios_with_followup_prompt_request_rate:
      results.filter((result) => result.lifecycle.followup_prompt_request_count > 0).length / results.length,
    scenarios_with_tool_loop_request_rate:
      results.filter((result) => result.lifecycle.tool_loop_request_count > 0).length / results.length,
    scenarios_with_auxiliary_request_rate:
      results.filter((result) => result.lifecycle.auxiliary_request_count > 0).length / results.length,
    largest_total_request: largestTotalRequest
      ? {
          scenario_id: largestTotalRequest.scenario.id,
          total_request_body_bytes: largestTotalRequest.lifecycle.total_request_body_bytes,
          request_count: largestTotalRequest.lifecycle.request_count,
          route_strategy: largestTotalRequest.scenario.route_strategy
        }
      : null,
    smallest_total_request: smallestTotalRequest
      ? {
          scenario_id: smallestTotalRequest.scenario.id,
          total_request_body_bytes: smallestTotalRequest.lifecycle.total_request_body_bytes,
          request_count: smallestTotalRequest.lifecycle.request_count,
          route_strategy: smallestTotalRequest.scenario.route_strategy
        }
      : null
  };
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export function analyzeOpenAiCapturedRequest({ request, promptText, version }) {
  const requestBodyText = request.body;
  const requestBody = JSON.parse(requestBodyText);
  const systemMessageText = stringifyMessageContent(requestBody.messages?.find((message) => message.role === "system")?.content);
  const userMessageText = stringifyMessageContent(requestBody.messages?.find((message) => message.role === "user")?.content);
  const toolsText = JSON.stringify(requestBody.tools ?? []);
  const promptNeedle = promptText.trimEnd();
  const promptIndex = userMessageText.indexOf(promptNeedle);
  const promptPrefixBytes = promptIndex >= 0 ? Buffer.byteLength(userMessageText.slice(0, promptIndex), "utf8") : null;
  const promptSuffixBytes =
    promptIndex >= 0
      ? Buffer.byteLength(userMessageText.slice(promptIndex + promptNeedle.length), "utf8")
      : null;
  const requestBodyBytes = Buffer.byteLength(requestBodyText, "utf8");
  const systemMessageBytes = Buffer.byteLength(systemMessageText, "utf8");
  const userMessageBytes = Buffer.byteLength(userMessageText, "utf8");
  const toolDefinitionsBytes = Buffer.byteLength(toolsText, "utf8");
  const promptBytes = Buffer.byteLength(promptText, "utf8");
  const knownPayloadBytes = systemMessageBytes + userMessageBytes + toolDefinitionsBytes;
  const transportOverheadBytes = requestBodyBytes - knownPayloadBytes;

  return {
    provider_request_path: request.url,
    request_body_sha256: createHash("sha256").update(requestBodyText).digest("hex"),
    request_body_bytes: requestBodyBytes,
    request_body_tokens_estimated: estimateTokens(requestBodyText),
    system_message_bytes: systemMessageBytes,
    user_message_bytes: userMessageBytes,
    tool_definitions_bytes: toolDefinitionsBytes,
    transport_overhead_bytes: transportOverheadBytes,
    prompt_embedded_in_user_message: promptIndex >= 0,
    prompt_prefix_bytes: promptPrefixBytes,
    prompt_suffix_bytes: promptSuffixBytes,
    prompt_wrapper_bytes:
      promptIndex >= 0 && promptPrefixBytes !== null && promptSuffixBytes !== null
        ? promptPrefixBytes + promptSuffixBytes
        : null,
    prompt_bytes: promptBytes,
    prompt_tokens_estimated: estimateTokens(promptText),
    request_vs_prompt_ratio: requestBodyBytes / promptBytes,
    user_vs_prompt_ratio: userMessageBytes / promptBytes,
    prompt_share_of_request: promptBytes / requestBodyBytes,
    system_share_of_request: systemMessageBytes / requestBodyBytes,
    tool_share_of_request: toolDefinitionsBytes / requestBodyBytes,
    message_roles: (requestBody.messages ?? []).map((message) => message.role),
    tool_count: Array.isArray(requestBody.tools) ? requestBody.tools.length : 0,
    runtime_version: version
  };
}

export function analyzeAnthropicCapturedRequest({ request, promptText, version }) {
  const requestBodyText = request.body;
  const requestBody = JSON.parse(requestBodyText);
  const systemMessageText = stringifyMessageContent(requestBody.system);
  const userMessageText = stringifyMessageContent(requestBody.messages?.find((message) => message.role === "user")?.content);
  const toolsText = JSON.stringify(requestBody.tools ?? []);
  const promptNeedle = promptText.trimEnd();
  const promptIndex = userMessageText.indexOf(promptNeedle);
  const promptPrefixBytes = promptIndex >= 0 ? Buffer.byteLength(userMessageText.slice(0, promptIndex), "utf8") : null;
  const promptSuffixBytes =
    promptIndex >= 0
      ? Buffer.byteLength(userMessageText.slice(promptIndex + promptNeedle.length), "utf8")
      : null;
  const requestBodyBytes = Buffer.byteLength(requestBodyText, "utf8");
  const systemMessageBytes = Buffer.byteLength(systemMessageText, "utf8");
  const userMessageBytes = Buffer.byteLength(userMessageText, "utf8");
  const toolDefinitionsBytes = Buffer.byteLength(toolsText, "utf8");
  const promptBytes = Buffer.byteLength(promptText, "utf8");
  const knownPayloadBytes = systemMessageBytes + userMessageBytes + toolDefinitionsBytes;
  const transportOverheadBytes = requestBodyBytes - knownPayloadBytes;

  return {
    provider_request_path: request.url,
    request_body_sha256: createHash("sha256").update(requestBodyText).digest("hex"),
    request_body_bytes: requestBodyBytes,
    request_body_tokens_estimated: estimateTokens(requestBodyText),
    system_message_bytes: systemMessageBytes,
    user_message_bytes: userMessageBytes,
    tool_definitions_bytes: toolDefinitionsBytes,
    transport_overhead_bytes: transportOverheadBytes,
    prompt_embedded_in_user_message: promptIndex >= 0,
    prompt_prefix_bytes: promptPrefixBytes,
    prompt_suffix_bytes: promptSuffixBytes,
    prompt_wrapper_bytes:
      promptIndex >= 0 && promptPrefixBytes !== null && promptSuffixBytes !== null
        ? promptPrefixBytes + promptSuffixBytes
        : null,
    prompt_bytes: promptBytes,
    prompt_tokens_estimated: estimateTokens(promptText),
    request_vs_prompt_ratio: requestBodyBytes / promptBytes,
    user_vs_prompt_ratio: userMessageBytes / promptBytes,
    prompt_share_of_request: promptBytes / requestBodyBytes,
    system_share_of_request: systemMessageBytes / requestBodyBytes,
    tool_share_of_request: toolDefinitionsBytes / requestBodyBytes,
    message_roles: (requestBody.messages ?? []).map((message) => message.role),
    tool_count: Array.isArray(requestBody.tools) ? requestBody.tools.length : 0,
    runtime_version: version
  };
}

export const analyzeCapturedRequest = analyzeOpenAiCapturedRequest;

async function startLocalOpenAiProviderStub() {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      requests.push({
        url: req.url,
        method: req.method,
        headers: req.headers,
        body
      });
      res.setHeader("content-type", "application/json");
      if (req.url === "/v1/chat/completions") {
        res.end(
          JSON.stringify({
            id: "chatcmpl-aods-runtime-capture",
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: COPILOT_CAPTURE_MODEL,
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: "CAPTURE_OK"
                },
                finish_reason: "stop"
              }
            ],
            usage: {
              prompt_tokens: 1,
              completion_tokens: 1,
              total_tokens: 2
            }
          })
        );
        return;
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "unexpected-path", path: req.url }));
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve local runtime capture server address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}/v1`,
    requests,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      })
  };
}

async function startLocalAnthropicProviderStub() {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      requests.push({
        url: req.url,
        method: req.method,
        headers: req.headers,
        body
      });
      res.setHeader("content-type", "application/json");
      if (req.url?.startsWith("/v1/messages")) {
        res.end(
          JSON.stringify({
            id: "msg_aods_runtime_capture",
            type: "message",
            role: "assistant",
            model: CLAUDE_CAPTURE_MODEL,
            content: [
              {
                type: "text",
                text: "CAPTURE_OK"
              }
            ],
            stop_reason: "end_turn",
            stop_sequence: null,
            usage: {
              input_tokens: 1,
              output_tokens: 1
            }
          })
        );
        return;
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "unexpected-path", path: req.url }));
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve local runtime capture server address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requests,
    env: {
      ANTHROPIC_API_KEY: "dummy-key",
      ANTHROPIC_AUTH_TOKEN: ""
    },
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      })
  };
}

async function startHostedAnthropicRelayCapture() {
  ensureExecutable(DEFAULT_EMOHTTPCONNECT_BIN, "HTTP CONNECT proxy helper");
  ensureExecutable(DEFAULT_EMOANTHROPICRELAY_BIN, "Anthropic relay helper");

  const authToken = resolveHostedAnthropicToken();
  const requests = [];
  const proxyPort = await reserveLocalPort();
  const relayPort = await reserveLocalPort();
  const proxyLogs = { stderr: "" };
  const relayLogs = { stderr: "" };
  const proxyChild = spawn(
    DEFAULT_EMOHTTPCONNECT_BIN,
    [String(proxyPort), "--ssh-target", DEFAULT_HOSTED_SSH_TARGET],
    { cwd: REPO_ROOT, stdio: ["ignore", "ignore", "pipe"] }
  );
  proxyChild.stderr?.on("data", (chunk) => {
    proxyLogs.stderr += chunk.toString("utf8");
  });

  try {
    await waitForLocalPort(proxyPort, 15000, "emohttpconnect", proxyChild, proxyLogs);
  } catch (error) {
    await terminateChildQuietly(proxyChild);
    throw error;
  }

  const relayChild = spawn(
    DEFAULT_EMOANTHROPICRELAY_BIN,
    [
      String(relayPort),
      "--proxy-url",
      `http://127.0.0.1:${proxyPort}`,
      "--upstream-base-url",
      DEFAULT_HOSTED_ANTHROPIC_BASE_URL
    ],
    { cwd: REPO_ROOT, stdio: ["ignore", "ignore", "pipe"] }
  );
  relayChild.stderr?.on("data", (chunk) => {
    relayLogs.stderr += chunk.toString("utf8");
  });

  try {
    await waitForLocalPort(relayPort, 15000, "emoanthropicrelay", relayChild, relayLogs);
  } catch (error) {
    await terminateChildQuietly(relayChild);
    await terminateChildQuietly(proxyChild);
    throw error;
  }

  const captureServer = await startForwardCaptureServer({
    upstreamBaseUrl: `http://127.0.0.1:${relayPort}`,
    requests
  });

  return {
    baseUrl: captureServer.baseUrl,
    requests,
    env: {
      ANTHROPIC_API_KEY: authToken,
      ANTHROPIC_AUTH_TOKEN: authToken
    },
    close: async () => {
      await captureServer.close();
      await terminateChildQuietly(relayChild);
      await terminateChildQuietly(proxyChild);
    }
  };
}

function readCopilotVersion() {
  const result = spawnSync("copilot", ["version"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Unable to read Copilot CLI version.");
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function readClaudeVersion() {
  const result = spawnSync("claude", ["--version"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Unable to read Claude Code version.");
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

async function captureCopilotRequest(promptText, captureServer) {
  return runCopilotCapture(promptText, captureServer, { stopAfterFirstRequest: true });
}

async function captureCopilotLifecycle(promptText, captureServer) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await runCopilotCapture(promptText, captureServer, { stopAfterFirstRequest: false });
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof Error && error.message === "Copilot lifecycle capture completed without any provider request.";
      if (!retryable || attempt === 3) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function runCopilotCapture(promptText, captureServer, { stopAfterFirstRequest }) {
  const { baseUrl, requests } = captureServer;
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-runtime-capture-"));
  const configDir = path.join(tempRoot, "copilot-home");
  const logDir = path.join(tempRoot, "logs");
  fs.mkdirSync(configDir, { recursive: true });
  fs.mkdirSync(logDir, { recursive: true });
  const requestStartIndex = requests.length;
  const startedAt = Date.now();
  let stdoutBytes = 0;
  let stderrBytes = 0;

  try {
    const child = spawn(
      "copilot",
      [
        "-p",
        promptText,
        "-s",
        "--model",
        COPILOT_CAPTURE_MODEL,
        "--stream",
        "off",
        "--allow-all-tools",
        "--available-tools=view",
        "--disable-builtin-mcps",
        "--no-custom-instructions",
        "--no-remote",
        "--no-auto-update",
        "--no-color",
        "--config-dir",
        configDir,
        "--log-dir",
        logDir
      ],
      {
        cwd: REPO_ROOT,
        env: {
          ...process.env,
          COPILOT_OFFLINE: "true",
          COPILOT_PROVIDER_BASE_URL: baseUrl,
          COPILOT_PROVIDER_TYPE: "openai",
          COPILOT_PROVIDER_WIRE_API: "completions",
          COPILOT_PROVIDER_MODEL_ID: COPILOT_CAPTURE_MODEL,
          COPILOT_PROVIDER_WIRE_MODEL: COPILOT_CAPTURE_MODEL,
          COPILOT_PROVIDER_MAX_PROMPT_TOKENS: "128000",
          COPILOT_PROVIDER_MAX_OUTPUT_TOKENS: "4096"
        },
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    child.stdout?.on("data", (chunk) => {
      stdoutBytes += Buffer.byteLength(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderrBytes += Buffer.byteLength(chunk);
    });

    if (stopAfterFirstRequest) {
      const request = await waitForProviderRequest(
        requests,
        30000,
        (item) => item.method === "POST" && item.url === "/v1/chat/completions",
        requestStartIndex
      );
      const exit = await stopChildProcess(child, 10000);

      return {
        request,
        exit_code: exit.code,
        exit_signal: exit.signal,
        stdout_bytes: stdoutBytes,
        stderr_bytes: stderrBytes,
        request_attempts: requests
          .slice(requestStartIndex)
          .filter((item) => item.method === "POST" && item.url === "/v1/chat/completions").length,
        duration_ms: Date.now() - startedAt
      };
    }

    const exit = await waitForChildExit(child, 45000);
    const matchedRequests = requests
      .slice(requestStartIndex)
      .filter((item) => item.method === "POST" && item.url === "/v1/chat/completions");
    if (matchedRequests.length === 0) {
      throw new Error("Copilot lifecycle capture completed without any provider request.");
    }

    return {
      requests: matchedRequests,
      exit_code: exit.code,
      exit_signal: exit.signal,
      stdout_bytes: stdoutBytes,
      stderr_bytes: stderrBytes,
      request_attempts: matchedRequests.length,
      duration_ms: Date.now() - startedAt
    };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
}

async function captureClaudeRequest(promptText, captureServer) {
  const hostedCapture = Boolean(captureServer.env);
  let lastError = null;

  for (let attempt = 1; attempt <= (hostedCapture ? 3 : 1); attempt += 1) {
    try {
      return await runClaudeCapture(promptText, captureServer, {
        stopAfterFirstRequest: true,
        firstRequestTimeoutMs: hostedCapture ? 90000 : 30000
      });
    } catch (error) {
      lastError = error;
      const retryable =
        hostedCapture &&
        error instanceof Error &&
        error.message.startsWith("Timed out waiting for provider request after ");
      if (!retryable || attempt === (hostedCapture ? 3 : 1)) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function captureClaudeLifecycle(promptText, captureServer) {
  return runClaudeCapture(promptText, captureServer, { stopAfterFirstRequest: false });
}

async function runClaudeCapture(promptText, captureServer, { stopAfterFirstRequest, firstRequestTimeoutMs = 30000 }) {
  const { baseUrl, requests } = captureServer;
  const requestStartIndex = requests.length;
  const startedAt = Date.now();
  let stdoutBytes = 0;
  let stderrBytes = 0;

  const child = spawn(
    "claude",
    [
      "--bare",
      "--no-session-persistence",
      "-p",
      promptText,
      "--output-format",
      "json",
      "--model",
      "sonnet",
      "--max-budget-usd",
      "0.05"
    ],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: baseUrl,
        ANTHROPIC_API_KEY: captureServer.env?.ANTHROPIC_API_KEY ?? "dummy-key",
        ANTHROPIC_AUTH_TOKEN: captureServer.env?.ANTHROPIC_AUTH_TOKEN ?? "",
        CLAUDE_CODE_ENABLE_TELEMETRY: "0",
        ALL_PROXY: "",
        HTTPS_PROXY: "",
        HTTP_PROXY: ""
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  child.stdout?.on("data", (chunk) => {
    stdoutBytes += Buffer.byteLength(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    stderrBytes += Buffer.byteLength(chunk);
  });

  if (stopAfterFirstRequest) {
    const request = await waitForProviderRequest(
      requests,
      firstRequestTimeoutMs,
      (item) => item.method === "POST" && item.url?.startsWith("/v1/messages"),
      requestStartIndex
    );
    const exit = await stopChildProcess(child, 10000);

    return {
      request,
      exit_code: exit.code,
      exit_signal: exit.signal,
      stdout_bytes: stdoutBytes,
      stderr_bytes: stderrBytes,
      request_attempts: requests
        .slice(requestStartIndex)
        .filter((item) => item.method === "POST" && item.url?.startsWith("/v1/messages")).length,
      duration_ms: Date.now() - startedAt
    };
  }

  const exit = await waitForChildExit(child, 45000);
  const matchedRequests = requests
    .slice(requestStartIndex)
    .filter((item) => item.method === "POST" && item.url?.startsWith("/v1/messages"));
  if (matchedRequests.length === 0) {
    throw new Error("Claude lifecycle capture completed without any provider request.");
  }

  return {
    requests: matchedRequests,
    exit_code: exit.code,
    exit_signal: exit.signal,
    stdout_bytes: stdoutBytes,
    stderr_bytes: stderrBytes,
    request_attempts: matchedRequests.length,
    duration_ms: Date.now() - startedAt
  };
}

async function startForwardCaptureServer({ upstreamBaseUrl, requests }) {
  const upstreamUrl = new URL(upstreamBaseUrl);
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      requests.push({
        url: req.url,
        method: req.method,
        headers: req.headers,
        body
      });

      const forwardRequest = http.request(
        {
          hostname: upstreamUrl.hostname,
          port: upstreamUrl.port,
          path: req.url,
          method: req.method,
          headers: buildForwardRequestHeaders(req.headers, body)
        },
        (forwardResponse) => {
          res.statusCode = forwardResponse.statusCode ?? 502;
          for (const [key, value] of Object.entries(forwardResponse.headers)) {
            if (value == null || isHopByHopHeader(key)) {
              continue;
            }
            res.setHeader(key, value);
          }
          forwardResponse.pipe(res);
        }
      );

      forwardRequest.on("error", (error) => {
        res.statusCode = 502;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: "forward-request-failed", message: error.message }));
      });

      if (body) {
        forwardRequest.write(body);
      }
      forwardRequest.end();
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve hosted runtime capture server address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      })
  };
}

function buildForwardRequestHeaders(headers, body) {
  const forwardHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value == null || isHopByHopHeader(key) || key.toLowerCase() === "host" || key.toLowerCase() === "content-length") {
      continue;
    }
    forwardHeaders[key] = value;
  }
  forwardHeaders["content-length"] = Buffer.byteLength(body, "utf8");
  return forwardHeaders;
}

function isHopByHopHeader(headerName) {
  return [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "proxy-connection",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade"
  ].includes(headerName.toLowerCase());
}

function ensureExecutable(filePath, label) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
  } catch {
    throw new Error(`${label} is not executable at ${filePath}.`);
  }
}

function resolveHostedAnthropicToken() {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return process.env.ANTHROPIC_AUTH_TOKEN;
  }

  const result = spawnSync(
    "/usr/bin/security",
    ["find-generic-password", "-a", DEFAULT_KEYCHAIN_ACCOUNT, "-s", DEFAULT_KEYCHAIN_SERVICE, "-w"],
    {
      cwd: REPO_ROOT,
      encoding: "utf8"
    }
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      result.stderr ||
        `Unable to resolve hosted Anthropic token from Keychain service ${DEFAULT_KEYCHAIN_SERVICE}.`
    );
  }
  const token = result.stdout.trim();
  if (!token) {
    throw new Error(`Resolved an empty hosted Anthropic token from ${DEFAULT_KEYCHAIN_SERVICE}.`);
  }
  return token;
}

async function reserveLocalPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to reserve a local port for hosted runtime capture.");
  }
  const port = address.port;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
  return port;
}

async function waitForLocalPort(port, timeoutMs, label, child, logs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `${label} exited before becoming ready (code=${child.exitCode}, signal=${child.signalCode}). ${
          logs.stderr.trim() || "No stderr output."
        }`
      );
    }

    try {
      await new Promise((resolve, reject) => {
        const socket = net.connect({ host: "127.0.0.1", port }, () => {
          socket.end();
          resolve();
        });
        socket.once("error", reject);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`${label} did not become ready on 127.0.0.1:${port} within ${timeoutMs}ms.`);
}

async function terminateChildQuietly(child) {
  if (!child || (child.exitCode !== null || child.signalCode !== null)) {
    return;
  }
  try {
    await stopChildProcess(child, 3000);
  } catch {}
}

function stringifyMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (typeof part?.text === "string") {
          return part.text;
        }
        if (typeof part?.content === "string") {
          return part.content;
        }
        return JSON.stringify(part);
      })
      .join("\n");
  }
  if (content == null) {
    return "";
  }
  return JSON.stringify(content);
}

function renderRuntimeCaptureReport(results) {
  const runtimeProfiles = Object.values(results.runtime_profiles ?? {});
  const runtimeAttribution = results.runtime_attribution ?? null;
  const hostedRepeatability = results.hosted_repeatability ?? null;
  const profileOverviewRows = runtimeProfiles
    .map(({ profile }) => {
      const version = profile.copilot_version ?? profile.claude_version ?? "n/a";
      return `| ${profile.id} | ${profile.runtime} | ${profile.provider} | ${profile.mode} | ${profile.model} | ${version} | ${profile.available_tools.join(", ")} |`;
    })
    .join("\n");
  const runtimeProfileSections = runtimeProfiles
    .map((runtimeProfile) => renderRuntimeProfileSection(runtimeProfile))
    .join("\n\n");
  const attributionDelta = runtimeAttribution?.combined_median_delta ?? null;
  const attributionScenarioRows = runtimeAttribution?.heaviest_tool_loop_delta_scenarios
    ?.map(
      (scenario) =>
        `| ${scenario.scenario_id} | ${scenario.measurement_class} | ${scenario.route_strategy} | ${scenario.total_request_body_bytes_delta} | ${scenario.followup_prompt_request_body_bytes_delta} | ${scenario.tool_loop_request_body_bytes_delta} | ${scenario.request_count_delta} | ${scenario.followup_prompt_request_count_delta} | ${scenario.tool_loop_request_count_delta} |`
    )
    .join("\n");
  const runtimeAttributionSection = runtimeAttribution
    ? `## Hosted-vs-local runtime attribution

| Field | Value |
| --- | --- |
| Local profile | ${runtimeAttribution.local_profile_id} |
| Hosted profile | ${runtimeAttribution.hosted_profile_id} |
| Combined median request-count delta | ${attributionDelta?.request_count_delta ?? 0} |
| Combined median total request-body delta | ${attributionDelta?.total_request_body_bytes_delta ?? 0} bytes |
| First-request delta | ${attributionDelta?.first_request_body_bytes_delta ?? 0} bytes |
| Follow-up prompt delta | ${attributionDelta?.followup_prompt_request_body_bytes_delta ?? 0} bytes |
| Tool-loop delta | ${attributionDelta?.tool_loop_request_body_bytes_delta ?? 0} bytes |
| Auxiliary-side delta | ${attributionDelta?.auxiliary_request_body_bytes_delta ?? 0} bytes |
| Follow-up prompt share of delta | ${attributionDelta ? formatPercent(attributionDelta.followup_prompt_share_of_total_delta) : "n/a"} |
| Tool-loop share of delta | ${attributionDelta ? formatPercent(attributionDelta.tool_loop_share_of_total_delta) : "n/a"} |

${attributionScenarioRows ? `### Heaviest tool-loop delta scenarios

| Scenario | Class | Route strategy | Total bytes delta | Follow-up bytes delta | Tool-loop bytes delta | Request delta | Follow-up delta | Tool-loop delta |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
${attributionScenarioRows}

` : ""}### Attribution reading

- Relative to **${runtimeAttribution.local_profile_id}**, the hosted lane adds **${attributionDelta?.total_request_body_bytes_delta ?? 0} bytes** at the combined median over the current AODS full-run matrix.
- The hosted/local first-request delta is only **${attributionDelta?.first_request_body_bytes_delta ?? 0} bytes**, so the inflation does **not** come from the first request envelope.
- **${attributionDelta ? formatPercent(attributionDelta.tool_loop_share_of_total_delta) : "n/a"}** of the hosted/local median-byte delta sits inside repeated tool-loop requests, while **${attributionDelta ? formatPercent(attributionDelta.followup_prompt_share_of_total_delta) : "n/a"}** sits inside extra follow-up prompt traffic.
- The heaviest scenario-level tool-loop inflation currently appears on **${runtimeAttribution.heaviest_tool_loop_delta_scenarios?.[0]?.scenario_id ?? "n/a"}**, where hosted adds **${runtimeAttribution.heaviest_tool_loop_delta_scenarios?.[0]?.tool_loop_request_body_bytes_delta ?? 0}** tool-loop bytes over local.
`
    : "";
  const hostedRepeatabilityRows = hostedRepeatability?.run_summaries
    ?.map(
      (run) =>
        `| ${run.run_index} | ${run.captured_at ?? "n/a"} | ${run.combined_lifecycle?.median_total_request_body_bytes ?? 0} | ${run.combined_lifecycle?.median_first_request_body_bytes ?? 0} | ${run.combined_lifecycle?.median_followup_prompt_request_body_bytes ?? 0} | ${run.combined_lifecycle?.median_tool_loop_request_body_bytes ?? 0} | ${run.combined_median_delta?.total_request_body_bytes_delta ?? 0} | ${run.combined_median_delta?.followup_prompt_request_body_bytes_delta ?? 0} | ${run.combined_median_delta?.tool_loop_request_body_bytes_delta ?? 0} | ${run.heaviest_tool_loop_delta_scenario?.scenario_id ?? "n/a"} |`
    )
    .join("\n");
  const hostedRepeatabilitySection = hostedRepeatability
    ? `## Hosted repeatability audit

| Field | Value |
| --- | --- |
| Requested successful runs | ${hostedRepeatability.requested_successful_runs} |
| Successful runs captured | ${hostedRepeatability.successful_run_count} |
| Hosted total-byte band | ${hostedRepeatability.bands?.hosted_total_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.hosted_total_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.hosted_total_request_body_bytes?.span ?? 0}) |
| Hosted first-request byte band | ${hostedRepeatability.bands?.hosted_first_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.hosted_first_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.hosted_first_request_body_bytes?.span ?? 0}) |
| Hosted follow-up byte band | ${hostedRepeatability.bands?.hosted_followup_prompt_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.hosted_followup_prompt_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.hosted_followup_prompt_request_body_bytes?.span ?? 0}) |
| Hosted tool-loop byte band | ${hostedRepeatability.bands?.hosted_tool_loop_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.hosted_tool_loop_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.hosted_tool_loop_request_body_bytes?.span ?? 0}) |
| Hosted-vs-local total-delta band | ${hostedRepeatability.bands?.delta_total_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_total_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.delta_total_request_body_bytes?.span ?? 0}) |
| Hosted-vs-local first-request delta band | ${hostedRepeatability.bands?.delta_first_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_first_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.delta_first_request_body_bytes?.span ?? 0}) |
| Hosted-vs-local follow-up delta band | ${hostedRepeatability.bands?.delta_followup_prompt_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_followup_prompt_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.delta_followup_prompt_request_body_bytes?.span ?? 0}) |
| Hosted-vs-local tool-loop delta band | ${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.min ?? 0} - ${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.max ?? 0} bytes (span ${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.span ?? 0}) |
| First-request delta stable across runs | ${hostedRepeatability.findings?.first_request_delta_is_stable ? "yes" : "no"} |
| Tool-loop delta dominates all runs | ${hostedRepeatability.findings?.tool_loop_delta_dominates_all_runs ? "yes" : "no"} |
| Follow-up / tool-loop split is repeat-sensitive | ${hostedRepeatability.findings?.hosted_loop_split_is_repeat_sensitive ? "yes" : "no"} |

${hostedRepeatabilityRows ? `### Run-by-run hosted repeatability

| Run | Captured at | Hosted combined bytes | First-request bytes | Follow-up bytes | Tool-loop bytes | Total delta | Follow-up delta | Tool-loop delta | Heaviest tool-loop scenario |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${hostedRepeatabilityRows}

` : ""}### Repeatability reading

- Across **${hostedRepeatability.successful_run_count}** successful hosted captures, the hosted combined full-run median spans **${hostedRepeatability.bands?.hosted_total_request_body_bytes?.span ?? 0} bytes**.
- The hosted-vs-local first-request delta spans only **${hostedRepeatability.bands?.delta_first_request_body_bytes?.span ?? 0} bytes**, so first-request cost remains the most stable part of the hosted/local split in the current field lane.
- The hosted-vs-local tool-loop delta spans **${hostedRepeatability.bands?.delta_tool_loop_request_body_bytes?.span ?? 0} bytes**, while the follow-up delta spans **${hostedRepeatability.bands?.delta_followup_prompt_request_body_bytes?.span ?? 0} bytes**; this is why the hosted loop decomposition should be read as repeat-sensitive even though tool-loop inflation remains the dominant signal.
`
    : "";

  return `# Round-one runtime capture report

## What this file is

This is a supplemental, runtime-backed matrix for the current round-one baseline prompts. It is **not** the main cross-format scoreboard. Its job is narrower: show what real CLI request bodies look like after each benchmark prompt envelope is handed to stable runtime profiles across multiple routed scenarios.

The benchmark now keeps **two** runtime views at once:

1. a shared **first-request matrix** that stops after the first provider request for fair cross-baseline byte comparisons
2. a per-profile **AODS full-run lifecycle matrix** across the current objective and exploratory scenario set, with a representative request breakdown so multi-request inflation and auxiliary side-calls become measurable instead of being hidden by the first-request stop rule

## Runtime profiles

| Profile ID | Runtime | Provider | Mode | Model | Version | Available tools |
| --- | --- | --- | --- | --- | --- | --- |
${profileOverviewRows}

${runtimeAttributionSection ? `${runtimeAttributionSection}
` : ""}${hostedRepeatabilitySection ? `${hostedRepeatabilitySection}
` : ""}${runtimeProfileSections}

## Interpretation

This matrix strengthens the benchmark in one important way: it turns "rendered prompt envelope" from a pure synthetic proxy into something that can now be compared against real CLI request bodies across the current round-one baseline prompts. The current evidence says the benchmark prompt is directionally useful, but real runtime requests are still materially larger because each runtime wraps the routed content with system instructions, tool definitions, and JSON framing.

## Limits

- Default captures are local provider-compatible profiles, and any hosted relay-backed lane must be enabled explicitly.
- The local Claude Code profile is captured through a local Anthropic-compatible stub so the default benchmark stays reproducible and cost-safe.
- The main scoreboard should still use shared, renderer-based metrics until comparable runtime-backed captures exist for broader toolchains and field conditions.
`;
}

function renderRuntimeProfileSection(runtimeProfile) {
  const { profile, baseline_matrices: baselineMatrices } = runtimeProfile;
  const aodsMatrix = baselineMatrices.aods ?? null;
  const summary = aodsMatrix?.summary ?? null;
  const objective = summary?.objective_touch ?? null;
  const exploratory = summary?.exploratory_query ?? null;
  const combined = summary?.combined ?? null;
  const representativeScenarioId = aodsMatrix?.representative_scenario_id ?? null;
  const scenario = aodsMatrix?.scenario ?? null;
  const prompt = aodsMatrix?.benchmark_prompt ?? null;
  const request = aodsMatrix?.runtime_request ?? null;
  const objectiveLifecycle = aodsMatrix?.objective_lifecycle ?? null;
  const objectiveLifecycleSummary = objectiveLifecycle?.summary ?? null;
  const exploratoryLifecycle = aodsMatrix?.exploratory_lifecycle ?? null;
  const exploratoryLifecycleSummary = exploratoryLifecycle?.summary ?? null;
  const combinedLifecycle = aodsMatrix?.combined_lifecycle ?? null;
  const combinedLifecycleSummary = combinedLifecycle?.summary ?? null;
  const representativeLifecycle = aodsMatrix?.representative_lifecycle ?? null;
  const representativeFollowupPromptRequests = representativeLifecycle?.followup_prompt_request_count ?? 0;
  const representativeToolLoopRequests = representativeLifecycle?.tool_loop_request_count ?? 0;
  const baselineObjectiveRows = Object.values(baselineMatrices ?? {})
    .map((baseline) => {
      const objectiveSummary = baseline.summary.objective_touch;
      return `| ${baseline.label} | ${objectiveSummary.scenario_count} | ${Math.round(
        objectiveSummary.median_prompt_bytes
      )} | ${Math.round(objectiveSummary.median_request_body_bytes)} | ${Math.round(
        objectiveSummary.median_runtime_added_bytes
      )} | ${formatRatio(objectiveSummary.median_request_vs_prompt_ratio)}x |`;
    })
    .join("\n");
  const versionLabel = profile.copilot_version ? "Copilot CLI" : "Claude Code";
  const versionValue = profile.copilot_version ?? profile.claude_version ?? "n/a";
  const lifecycleBreakdownRows = representativeLifecycle?.request_breakdown
    ?.map(
      (entry) =>
        `| ${entry.index} | ${entry.lifecycle_request_class} | ${entry.provider_request_path} | ${entry.request_body_bytes} | ${
          entry.prompt_embedded_in_user_message ? "yes" : "no"
        } | ${entry.tool_count} | ${entry.message_roles.join(", ")} |`
    )
    .join("\n");
  const lifecycleScenarioRows = combinedLifecycle?.scenario_results
    ?.map(
      (result) =>
        `| ${result.scenario.id} | ${result.scenario.measurement_class} | ${result.scenario.route_strategy} | ${result.lifecycle.request_count} | ${Math.max(
          result.lifecycle.followup_prompt_request_count,
          0
        )} | ${result.lifecycle.tool_loop_request_count} | ${result.lifecycle.auxiliary_request_count} | ${
          result.lifecycle.total_request_body_bytes
        } | ${result.lifecycle.tool_loop_request_body_bytes} | ${formatRatio(
          result.lifecycle.total_request_vs_prompt_ratio
        )}x | ${result.lifecycle.local_run.duration_ms} | ${formatExitState(result.lifecycle.local_run) ?? "n/a"} |`
    )
    .join("\n");

  return `## Runtime profile: ${profile.id}

| Field | Value |
| --- | --- |
| Runtime | ${profile.runtime} |
| Provider | ${profile.provider} |
| Mode | ${profile.mode} |
| Model | ${profile.model} |
| ${versionLabel} | ${versionValue} |
| Available tools | ${profile.available_tools.join(", ")} |
| Stream mode | ${profile.stream} |

### Baseline objective-runtime matrix

| Baseline | Objective scenarios | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
${baselineObjectiveRows}

### AODS matrix scope

| Field | Value |
| --- | --- |
| Captured scenarios | ${summary?.scenario_count ?? 0} |
| Objective touch-route scenarios | ${objective?.scenario_count ?? 0} |
| Exploratory query-route scenarios | ${exploratory?.scenario_count ?? 0} |
| Representative scenario | ${representativeScenarioId ?? "n/a"} |

### Runtime-backed byte summary

| Group | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: |
| Objective touch-route | ${Math.round(objective?.median_prompt_bytes ?? 0)} | ${Math.round(objective?.median_request_body_bytes ?? 0)} | ${Math.round(objective?.median_runtime_added_bytes ?? 0)} | ${formatRatio(objective?.median_request_vs_prompt_ratio ?? 0)}x |
| Exploratory query-route | ${Math.round(exploratory?.median_prompt_bytes ?? 0)} | ${Math.round(exploratory?.median_request_body_bytes ?? 0)} | ${Math.round(exploratory?.median_runtime_added_bytes ?? 0)} | ${formatRatio(exploratory?.median_request_vs_prompt_ratio ?? 0)}x |
| Combined | ${Math.round(combined?.median_prompt_bytes ?? 0)} | ${Math.round(combined?.median_request_body_bytes ?? 0)} | ${Math.round(combined?.median_runtime_added_bytes ?? 0)} | ${formatRatio(combined?.median_request_vs_prompt_ratio ?? 0)}x |

### Representative scenario detail

| Field | Value |
| --- | --- |
| Scenario | ${scenario?.id ?? "n/a"} |
| Description | ${scenario?.description ?? "n/a"} |
| Class | ${scenario?.scenario_class ?? "n/a"} |
| Route strategy | ${scenario?.route_strategy ?? "n/a"} |
| Loaded modules | ${scenario?.loaded_modules?.join(", ") ?? "n/a"} |
| Rendered benchmark prompt | ${prompt?.bytes ?? "n/a"} bytes |
| Exact provider request body | ${request?.request_body_bytes ?? "n/a"} bytes |
| Runtime system message | ${request?.system_message_bytes ?? "n/a"} bytes |
| Runtime tool definitions | ${request?.tool_definitions_bytes ?? "n/a"} bytes |
| Runtime prompt wrapper | ${request?.prompt_wrapper_bytes ?? "n/a"} bytes |

### AODS full-run lifecycle summary

| Group | Scenarios | Median requests | Median first requests | Median follow-up prompts | Median tool-loop requests | Median auxiliary side requests | Median total request-body bytes | Median total request/prompt ratio | Multi-request rate | Tool-loop rate | Auxiliary-side-request rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | ${objectiveLifecycleSummary?.scenario_count ?? 0} | ${objectiveLifecycleSummary?.median_request_count ?? 0} | ${objectiveLifecycleSummary?.median_first_request_count ?? 0} | ${objectiveLifecycleSummary?.median_followup_prompt_requests ?? 0} | ${objectiveLifecycleSummary?.median_tool_loop_request_count ?? 0} | ${objectiveLifecycleSummary?.median_auxiliary_request_count ?? 0} | ${objectiveLifecycleSummary?.median_total_request_body_bytes ?? 0} | ${objectiveLifecycleSummary ? `${formatRatio(objectiveLifecycleSummary.median_total_request_vs_prompt_ratio)}x` : "n/a"} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.multi_request_scenario_rate) : "n/a"} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.scenarios_with_tool_loop_request_rate) : "n/a"} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.scenarios_with_auxiliary_request_rate) : "n/a"} |
| Exploratory query-route | ${exploratoryLifecycleSummary?.scenario_count ?? 0} | ${exploratoryLifecycleSummary?.median_request_count ?? 0} | ${exploratoryLifecycleSummary?.median_first_request_count ?? 0} | ${exploratoryLifecycleSummary?.median_followup_prompt_requests ?? 0} | ${exploratoryLifecycleSummary?.median_tool_loop_request_count ?? 0} | ${exploratoryLifecycleSummary?.median_auxiliary_request_count ?? 0} | ${exploratoryLifecycleSummary?.median_total_request_body_bytes ?? 0} | ${exploratoryLifecycleSummary ? `${formatRatio(exploratoryLifecycleSummary.median_total_request_vs_prompt_ratio)}x` : "n/a"} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.multi_request_scenario_rate) : "n/a"} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.scenarios_with_tool_loop_request_rate) : "n/a"} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.scenarios_with_auxiliary_request_rate) : "n/a"} |
| Combined | ${combinedLifecycleSummary?.scenario_count ?? 0} | ${combinedLifecycleSummary?.median_request_count ?? 0} | ${combinedLifecycleSummary?.median_first_request_count ?? 0} | ${combinedLifecycleSummary?.median_followup_prompt_requests ?? 0} | ${combinedLifecycleSummary?.median_tool_loop_request_count ?? 0} | ${combinedLifecycleSummary?.median_auxiliary_request_count ?? 0} | ${combinedLifecycleSummary?.median_total_request_body_bytes ?? 0} | ${combinedLifecycleSummary ? `${formatRatio(combinedLifecycleSummary.median_total_request_vs_prompt_ratio)}x` : "n/a"} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.multi_request_scenario_rate) : "n/a"} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.scenarios_with_tool_loop_request_rate) : "n/a"} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.scenarios_with_auxiliary_request_rate) : "n/a"} |

### AODS lifecycle request-class attribution

| Group | Median first-request bytes | Median follow-up prompt bytes | Median tool-loop bytes | Median auxiliary side bytes | Median first-request share | Median follow-up share | Median tool-loop share | Median auxiliary share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | ${objectiveLifecycleSummary?.median_first_request_body_bytes ?? 0} | ${objectiveLifecycleSummary?.median_followup_prompt_request_body_bytes ?? 0} | ${objectiveLifecycleSummary?.median_tool_loop_request_body_bytes ?? 0} | ${objectiveLifecycleSummary?.median_auxiliary_request_body_bytes ?? 0} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.median_first_request_share_of_total_request_bytes) : "n/a"} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.median_followup_prompt_share_of_total_request_bytes) : "n/a"} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.median_tool_loop_share_of_total_request_bytes) : "n/a"} | ${objectiveLifecycleSummary ? formatPercent(objectiveLifecycleSummary.median_auxiliary_share_of_total_request_bytes) : "n/a"} |
| Exploratory query-route | ${exploratoryLifecycleSummary?.median_first_request_body_bytes ?? 0} | ${exploratoryLifecycleSummary?.median_followup_prompt_request_body_bytes ?? 0} | ${exploratoryLifecycleSummary?.median_tool_loop_request_body_bytes ?? 0} | ${exploratoryLifecycleSummary?.median_auxiliary_request_body_bytes ?? 0} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.median_first_request_share_of_total_request_bytes) : "n/a"} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.median_followup_prompt_share_of_total_request_bytes) : "n/a"} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.median_tool_loop_share_of_total_request_bytes) : "n/a"} | ${exploratoryLifecycleSummary ? formatPercent(exploratoryLifecycleSummary.median_auxiliary_share_of_total_request_bytes) : "n/a"} |
| Combined | ${combinedLifecycleSummary?.median_first_request_body_bytes ?? 0} | ${combinedLifecycleSummary?.median_followup_prompt_request_body_bytes ?? 0} | ${combinedLifecycleSummary?.median_tool_loop_request_body_bytes ?? 0} | ${combinedLifecycleSummary?.median_auxiliary_request_body_bytes ?? 0} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.median_first_request_share_of_total_request_bytes) : "n/a"} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.median_followup_prompt_share_of_total_request_bytes) : "n/a"} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.median_tool_loop_share_of_total_request_bytes) : "n/a"} | ${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.median_auxiliary_share_of_total_request_bytes) : "n/a"} |

${lifecycleScenarioRows ? `### AODS lifecycle scenarios

| Scenario | Class | Route strategy | Requests | Follow-up prompts | Tool-loop requests | Auxiliary side requests | Total request-body bytes | Tool-loop bytes | Total request/prompt ratio | Duration ms | Exit state |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${lifecycleScenarioRows}

` : ""}### Representative full-run lifecycle

| Field | Value |
| --- | --- |
| Total provider requests | ${representativeLifecycle?.request_count ?? "n/a"} |
| First requests | ${representativeLifecycle?.first_request_count ?? "n/a"} |
| Follow-up prompt requests | ${representativeLifecycle ? representativeFollowupPromptRequests : "n/a"} |
| Tool-loop requests | ${representativeLifecycle ? representativeToolLoopRequests : "n/a"} |
| Auxiliary side requests | ${representativeLifecycle?.auxiliary_request_count ?? "n/a"} |
| Total request-body bytes | ${representativeLifecycle?.total_request_body_bytes ?? "n/a"} bytes |
| First-request bytes | ${representativeLifecycle?.first_request_body_bytes ?? "n/a"} bytes |
| Follow-up prompt bytes | ${representativeLifecycle?.followup_prompt_request_body_bytes ?? "n/a"} bytes |
| Tool-loop bytes | ${representativeLifecycle?.tool_loop_request_body_bytes ?? "n/a"} bytes |
| Auxiliary side bytes | ${representativeLifecycle?.auxiliary_request_body_bytes ?? "n/a"} bytes |
| Total request/prompt ratio | ${representativeLifecycle ? `${formatRatio(representativeLifecycle.total_request_vs_prompt_ratio)}x` : "n/a"} |
| First-request byte share | ${
    representativeLifecycle ? `${formatPercent(representativeLifecycle.first_request_share_of_total_request_bytes)}` : "n/a"
  } |
| Follow-up prompt byte share | ${
    representativeLifecycle ? `${formatPercent(representativeLifecycle.followup_prompt_share_of_total_request_bytes)}` : "n/a"
  } |
| Tool-loop byte share | ${
    representativeLifecycle ? `${formatPercent(representativeLifecycle.tool_loop_share_of_total_request_bytes)}` : "n/a"
  } |
| Auxiliary request-byte share | ${
    representativeLifecycle ? `${formatPercent(representativeLifecycle.auxiliary_share_of_total_request_bytes)}` : "n/a"
  } |
| Largest lifecycle request | ${representativeLifecycle?.max_request_body_bytes ?? "n/a"} bytes |
| Smallest lifecycle request | ${representativeLifecycle?.min_request_body_bytes ?? "n/a"} bytes |
| Full-run duration | ${representativeLifecycle?.local_run?.duration_ms ?? "n/a"} ms |
| Full-run exit state | ${formatExitState(representativeLifecycle?.local_run) ?? "n/a"} |

${lifecycleBreakdownRows ? `### Representative lifecycle request breakdown

| # | Class | Path | Request bytes | Prompt-bearing | Tools | Message roles |
| ---: | --- | --- | ---: | --- | ---: | --- |
${lifecycleBreakdownRows}

` : ""}### Key readings

- The matrix captured **${summary?.scenario_count ?? 0}** routed scenarios under the **${profile.runtime}** profile.
- Objective touch-route scenarios show a median rendered prompt of **${Math.round(objective?.median_prompt_bytes ?? 0)} bytes**, but a median exact provider request body of **${Math.round(objective?.median_request_body_bytes ?? 0)} bytes**.
- Exploratory query-route scenarios show a median rendered prompt of **${Math.round(exploratory?.median_prompt_bytes ?? 0)} bytes**, but a median exact provider request body of **${Math.round(exploratory?.median_request_body_bytes ?? 0)} bytes**.
- Across the full matrix, the median runtime request is **${formatRatio(combined?.median_request_vs_prompt_ratio ?? 0)}x** the size of the rendered benchmark prompt envelope alone.
- Across the **${combinedLifecycleSummary?.scenario_count ?? 0}** AODS full runs, this profile has a median of **${combinedLifecycleSummary?.median_request_count ?? "n/a"}** provider request(s), **${combinedLifecycleSummary?.median_total_request_body_bytes ?? "n/a"} bytes** total request body, and **${combinedLifecycleSummary ? formatRatio(combinedLifecycleSummary.median_total_request_vs_prompt_ratio) : "n/a"}x** total request/prompt ratio.
- The exploratory subset contributes **${exploratoryLifecycleSummary?.scenario_count ?? 0}** lifecycle scenario(s) with a median of **${exploratoryLifecycleSummary?.median_request_count ?? "n/a"}** provider request(s) and **${exploratoryLifecycleSummary?.median_total_request_body_bytes ?? "n/a"} bytes** total request body.
- On the AODS representative full run, this profile sends **${representativeLifecycle?.request_count ?? "n/a"}** provider requests totaling **${representativeLifecycle?.total_request_body_bytes ?? "n/a"} bytes**${representativeLifecycle ? `, which is **${formatRatio(representativeLifecycle.total_request_body_bytes / Math.max(request?.request_body_bytes ?? 1, 1))}x** the first captured request body` : ""}.
- The representative lifecycle splits into **${representativeLifecycle?.first_request_count ?? 0}** first request, **${representativeFollowupPromptRequests}** follow-up prompt request${representativeFollowupPromptRequests === 1 ? "" : "s"}, **${representativeToolLoopRequests}** tool-loop request${representativeToolLoopRequests === 1 ? "" : "s"}${representativeLifecycle?.auxiliary_request_count ? `, and **${representativeLifecycle.auxiliary_request_count}** auxiliary side request${representativeLifecycle.auxiliary_request_count === 1 ? "" : "s"}` : ""}.
- Tool-loop traffic accounts for **${combinedLifecycleSummary ? formatPercent(combinedLifecycleSummary.median_tool_loop_share_of_total_request_bytes) : "n/a"}** of the median combined lifecycle bytes for this profile.
- The largest captured request was **${summary?.largest_request?.request_body_bytes ?? "n/a"} bytes** on **${summary?.largest_request?.scenario_id ?? "n/a"}**, while the smallest was **${summary?.smallest_request?.request_body_bytes ?? "n/a"} bytes** on **${summary?.smallest_request?.scenario_id ?? "n/a"}**.`;
}

function formatExitState(localRun) {
  if (!localRun) {
    return null;
  }
  const signal = localRun.exit_signal == null ? "none" : localRun.exit_signal;
  const code = localRun.exit_code == null ? "null" : String(localRun.exit_code);
  return `code ${code}, signal ${signal}`;
}

async function waitForProviderRequest(requests, timeoutMs, matcher, requestStartIndex = 0) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const request = requests.slice(requestStartIndex).find((item) => matcher(item));
    if (request) {
      return request;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for provider request after ${timeoutMs}ms.`);
}

async function stopChildProcess(child, graceMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { code: child.exitCode, signal: child.signalCode };
  }

  const exitPromise = new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });

  child.kill("SIGTERM");
  const killTimer = setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
    }
  }, graceMs);

  const exit = await exitPromise;
  clearTimeout(killTimer);
  return exit;
}

async function waitForChildExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { code: child.exitCode, signal: child.signalCode };
  }

  const exitPromise = new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });

  const timeout = setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL");
        }
      }, 3000);
    }
  }, timeoutMs);

  const exit = await exitPromise;
  clearTimeout(timeout);
  return exit;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runRuntimeCapture();
}
