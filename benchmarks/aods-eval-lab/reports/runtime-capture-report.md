# AODS runtime capture report

## What this file is

This is a supplemental, runtime-backed capture for one routed AODS benchmark scenario. It is **not** the main cross-format scoreboard. Its job is narrower: show what one real Copilot CLI request body looks like after the benchmark prompt envelope is handed to an actual runtime profile.

The capture intentionally stops the Copilot CLI process after the **first provider request** is observed. That keeps the metric focused on the exact serialized request body rather than on whether a stubbed local model can finish the whole task loop.

## Runtime profile

| Field | Value |
| --- | --- |
| Profile ID | copilot-cli-local-openai |
| Runtime | copilot-cli |
| Provider | local-openai-chat-completions-stub |
| Mode | offline |
| Model | dummy-model |
| Copilot CLI | GitHub Copilot CLI 1.0.25 |
| Available tools | view |
| Stream mode | off |

## Scenario under capture

| Field | Value |
| --- | --- |
| Scenario | product-doc-edit |
| Description | Doc author edits the product lifecycle human surface. |
| Class | paired-human-surface-write |
| Route strategy | touch-route |
| Loaded modules | atlas-capsule, product-lifecycle |

## Byte breakdown

| Component | Bytes | Reading |
| --- | ---: | --- |
| Benchmark rendered prompt envelope | 25216 | The repo's current deterministic prompt-envelope proxy |
| Runtime user message | 25278 | What Copilot actually placed in the user message slot |
| Runtime prompt wrapper | 63 | Extra runtime-added wrapper bytes around the benchmark prompt |
| Runtime system message | 10088 | Copilot CLI system instruction payload |
| Runtime tool definitions | 1308 | Tool schema bytes included in the provider request |
| JSON transport overhead | 2751 | Request-body JSON keys and non-message framing |
| Exact provider request body | 39425 | Full local provider HTTP request body bytes |

## Key readings

- The benchmark prompt envelope was **25216 bytes**, but the exact local provider request body was **39425 bytes**.
- That makes the local runtime request **1.56x** the size of the benchmark prompt envelope alone.
- The runtime user message reached **25278 bytes**, which means most of the extra weight above the benchmark prompt still came from **system instructions**, **tool definitions**, and runtime framing rather than from the routed AODS content itself.
- The embedded benchmark prompt was found inside the runtime user message.
- Request attempts during this capture: **1**.

## Interpretation

This capture strengthens the benchmark in one important way: it turns "rendered prompt envelope" from a pure synthetic proxy into something that can now be compared against a real runtime request body. The current evidence says the benchmark prompt is directionally useful, but a real runtime request is still materially larger because the runtime wraps the routed content with system instructions, tool definitions, and JSON framing.

## Limits

- This is one fixed runtime profile, not a full runtime matrix.
- This is one routed scenario, not the whole loading benchmark.
- The main scoreboard should still use shared, renderer-based metrics until comparable runtime-backed captures exist for the other baselines too.
