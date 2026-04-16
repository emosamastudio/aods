import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

import { LOADING_SCENARIOS } from "./benchmark-data.mjs";
import {
  buildAodsPromptResources,
  buildScenarioAodsSupportResources,
  loadAodsCorpusIndex,
  routeScenarioModules
} from "./aods-loading.mjs";
import { generateAll, projectPaths } from "./generate-fixtures.mjs";
import { PROJECT_ROOT, REPO_ROOT, estimateTokens, formatRatio, writeJson, writeText } from "./helpers.mjs";
import { measureBenchmarkPromptEnvelope } from "./prompt-envelope.mjs";

const CAPTURE_SCENARIO_ID = "product-doc-edit";
const CAPTURE_MODEL = "dummy-model";
const CAPTURE_PROFILE = {
  id: "copilot-cli-local-openai",
  runtime: "copilot-cli",
  provider: "local-openai-chat-completions-stub",
  mode: "offline",
  model: CAPTURE_MODEL,
  available_tools: ["view"],
  stream: "off"
};

export async function runRuntimeCapture() {
  generateAll();

  const paths = projectPaths();
  const scenario = LOADING_SCENARIOS.find((item) => item.id === CAPTURE_SCENARIO_ID);
  if (!scenario) {
    throw new Error(`Runtime capture scenario not found: ${CAPTURE_SCENARIO_ID}`);
  }

  const corpusIndex = loadAodsCorpusIndex(paths);
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
  const stub = await startLocalProviderStub();

  try {
    const copilotVersion = readCopilotVersion();
    const execution = await captureCopilotRequest(promptEnvelope.text, stub.baseUrl, stub.requests);
    const metrics = analyzeCapturedRequest({
      request: execution.request,
      promptText: promptEnvelope.text,
      copilotVersion
    });

    const results = {
      generated_at: new Date().toISOString(),
      profile: {
        ...CAPTURE_PROFILE,
        copilot_version: copilotVersion
      },
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
      benchmark_prompt: {
        bytes: promptEnvelope.bytes,
        tokens_estimated: promptEnvelope.tokens_estimated
      },
      runtime_request: metrics,
      local_run: {
        capture_stop_rule: "stop-after-first-provider-request",
        exit_code: execution.exit_code,
        exit_signal: execution.exit_signal,
        stdout_bytes: execution.stdout_bytes,
        stderr_bytes: execution.stderr_bytes,
        request_attempts: execution.request_attempts
      },
      limitations: [
        "This is an AODS-only supplemental metric, not a shared cross-format scoreboard entry.",
        "The sample uses one fixed Copilot CLI runtime profile and one routed benchmark scenario rather than the full loading scenario set.",
        "The capture is exact request-body bytes for the local provider hop; it does not claim field parity with every upstream hosted runtime."
      ]
    };

    writeJson(path.join(paths.resultsRoot, "runtime-capture-results.json"), results);
    writeText(path.join(PROJECT_ROOT, "reports", "runtime-capture-report.md"), renderRuntimeCaptureReport(results));
    return results;
  } finally {
    await stub.close();
  }
}

export function analyzeCapturedRequest({ request, promptText, copilotVersion }) {
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
    copilot_version: copilotVersion
  };
}

async function startLocalProviderStub() {
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
            model: CAPTURE_MODEL,
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

async function captureCopilotRequest(promptText, baseUrl, requests) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-runtime-capture-"));
  const configDir = path.join(tempRoot, "copilot-home");
  const logDir = path.join(tempRoot, "logs");
  fs.mkdirSync(configDir, { recursive: true });
  fs.mkdirSync(logDir, { recursive: true });
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
        CAPTURE_MODEL,
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
          COPILOT_PROVIDER_MODEL_ID: CAPTURE_MODEL,
          COPILOT_PROVIDER_WIRE_MODEL: CAPTURE_MODEL,
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

    const request = await waitForProviderRequest(requests, 30000);
    const exit = await stopChildProcess(child, 10000);

    return {
      request,
      exit_code: exit.code,
      exit_signal: exit.signal,
      stdout_bytes: stdoutBytes,
      stderr_bytes: stderrBytes,
      request_attempts: requests.filter((item) => item.method === "POST" && item.url === "/v1/chat/completions").length
    };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
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
  const {
    profile,
    scenario,
    benchmark_prompt: prompt,
    runtime_request: request,
    local_run: localRun
  } = results;

  return `# AODS runtime capture report

## What this file is

This is a supplemental, runtime-backed capture for one routed AODS benchmark scenario. It is **not** the main cross-format scoreboard. Its job is narrower: show what one real Copilot CLI request body looks like after the benchmark prompt envelope is handed to an actual runtime profile.

The capture intentionally stops the Copilot CLI process after the **first provider request** is observed. That keeps the metric focused on the exact serialized request body rather than on whether a stubbed local model can finish the whole task loop.

## Runtime profile

| Field | Value |
| --- | --- |
| Profile ID | ${profile.id} |
| Runtime | ${profile.runtime} |
| Provider | ${profile.provider} |
| Mode | ${profile.mode} |
| Model | ${profile.model} |
| Copilot CLI | ${profile.copilot_version} |
| Available tools | ${profile.available_tools.join(", ")} |
| Stream mode | ${profile.stream} |

## Scenario under capture

| Field | Value |
| --- | --- |
| Scenario | ${scenario.id} |
| Description | ${scenario.description} |
| Class | ${scenario.scenario_class} |
| Route strategy | ${scenario.route_strategy} |
| Loaded modules | ${scenario.loaded_modules.join(", ")} |

## Byte breakdown

| Component | Bytes | Reading |
| --- | ---: | --- |
| Benchmark rendered prompt envelope | ${prompt.bytes} | The repo's current deterministic prompt-envelope proxy |
| Runtime user message | ${request.user_message_bytes} | What Copilot actually placed in the user message slot |
| Runtime prompt wrapper | ${request.prompt_wrapper_bytes ?? "n/a"} | Extra runtime-added wrapper bytes around the benchmark prompt |
| Runtime system message | ${request.system_message_bytes} | Copilot CLI system instruction payload |
| Runtime tool definitions | ${request.tool_definitions_bytes} | Tool schema bytes included in the provider request |
| JSON transport overhead | ${request.transport_overhead_bytes} | Request-body JSON keys and non-message framing |
| Exact provider request body | ${request.request_body_bytes} | Full local provider HTTP request body bytes |

## Key readings

- The benchmark prompt envelope was **${prompt.bytes} bytes**, but the exact local provider request body was **${request.request_body_bytes} bytes**.
- That makes the local runtime request **${formatRatio(request.request_vs_prompt_ratio)}x** the size of the benchmark prompt envelope alone.
- The runtime user message reached **${request.user_message_bytes} bytes**, which means most of the extra weight above the benchmark prompt still came from **system instructions**, **tool definitions**, and runtime framing rather than from the routed AODS content itself.
- The embedded benchmark prompt was ${request.prompt_embedded_in_user_message ? "found" : "not found"} inside the runtime user message.
- Request attempts during this capture: **${localRun.request_attempts}**.

## Interpretation

This capture strengthens the benchmark in one important way: it turns "rendered prompt envelope" from a pure synthetic proxy into something that can now be compared against a real runtime request body. The current evidence says the benchmark prompt is directionally useful, but a real runtime request is still materially larger because the runtime wraps the routed content with system instructions, tool definitions, and JSON framing.

## Limits

- This is one fixed runtime profile, not a full runtime matrix.
- This is one routed scenario, not the whole loading benchmark.
- The main scoreboard should still use shared, renderer-based metrics until comparable runtime-backed captures exist for the other baselines too.
`;
}

async function waitForProviderRequest(requests, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const request = requests.find((item) => item.method === "POST" && item.url === "/v1/chat/completions");
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

if (import.meta.url === `file://${process.argv[1]}`) {
  await runRuntimeCapture();
}
