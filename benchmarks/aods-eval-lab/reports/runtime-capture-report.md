# Round-one runtime capture report

## What this file is

This is a supplemental, runtime-backed matrix for the current round-one baseline prompts. It is **not** the main cross-format scoreboard. Its job is narrower: show what real CLI request bodies look like after each benchmark prompt envelope is handed to stable runtime profiles across multiple routed scenarios.

The benchmark now keeps **two** runtime views at once:

1. a shared **first-request matrix** that stops after the first provider request for fair cross-baseline byte comparisons
2. a per-profile **AODS full-run lifecycle matrix** across the current objective and exploratory scenario set, with a representative request breakdown so multi-request inflation and auxiliary side-calls become measurable instead of being hidden by the first-request stop rule

## Runtime profiles

| Profile ID | Runtime | Provider | Mode | Model | Version | Available tools |
| --- | --- | --- | --- | --- | --- | --- |
| copilot-cli-local-openai | copilot-cli | local-openai-chat-completions-stub | offline | dummy-model | GitHub Copilot CLI 1.0.32 | view |
| claude-code-local-anthropic | claude-code | local-anthropic-messages-stub | offline | claude-sonnet-4-6 | 2.1.112 (Claude Code) | default-bare-toolset |
| claude-code-hosted-anthropic-relay | claude-code | hosted-anthropic-compatible-via-local-relay | hosted | claude-sonnet-4-6 | 2.1.112 (Claude Code) | default-bare-toolset |

## Hosted-vs-local runtime attribution

| Field | Value |
| --- | --- |
| Local profile | claude-code-local-anthropic |
| Hosted profile | claude-code-hosted-anthropic-relay |
| Combined median request-count delta | 0 |
| Combined median total request-body delta | 32322 bytes |
| First-request delta | 0 bytes |
| Follow-up prompt delta | -14865 bytes |
| Tool-loop delta | 48211 bytes |
| Auxiliary-side delta | 0 bytes |
| Follow-up prompt share of delta | -46.0% |
| Tool-loop share of delta | 149.2% |

### Heaviest tool-loop delta scenarios

| Scenario | Class | Route strategy | Total bytes delta | Follow-up bytes delta | Tool-loop bytes delta | Request delta | Follow-up delta | Tool-loop delta |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| ops-doc-edit | objective | touch-route | 125614 | -16519 | 142133 | 2 | -1 | 3 |
| product-doc-edit | objective | touch-route | 70431 | -14865 | 85296 | 1 | -1 | 2 |
| harbor-audit-evidence-edit | objective | touch-route | 70802 | -12435 | 83237 | 1 | -1 | 2 |
| architecture-module-edit | objective | touch-route | 33206 | -20550 | 53756 | 0 | -1 | 1 |
| harbor-change-control-edit | objective | touch-route | 36418 | -13841 | 50259 | 0 | -1 | 1 |

### Attribution reading

- Relative to **claude-code-local-anthropic**, the hosted lane adds **32322 bytes** at the combined median over the current AODS full-run matrix.
- The hosted/local first-request delta is only **0 bytes**, so the inflation does **not** come from the first request envelope.
- **149.2%** of the hosted/local median-byte delta sits inside repeated tool-loop requests, while **-46.0%** sits inside extra follow-up prompt traffic.
- The heaviest scenario-level tool-loop inflation currently appears on **ops-doc-edit**, where hosted adds **142133** tool-loop bytes over local.

## Hosted repeatability audit

| Field | Value |
| --- | --- |
| Requested successful runs | 3 |
| Successful runs captured | 3 |
| Hosted total-byte band | 112717 - 128582 bytes (span 15865) |
| Hosted first-request byte band | 14879 - 14879 bytes (span 0) |
| Hosted follow-up byte band | 0 - 0 bytes (span 0) |
| Hosted tool-loop byte band | 100268 - 114727 bytes (span 14459) |
| Hosted-vs-local total-delta band | 16457 - 32322 bytes (span 15865) |
| Hosted-vs-local first-request delta band | 0 - 0 bytes (span 0) |
| Hosted-vs-local follow-up delta band | -14865 - -14865 bytes (span 0) |
| Hosted-vs-local tool-loop delta band | 33752 - 48211 bytes (span 14459) |
| First-request delta stable across runs | yes |
| Tool-loop delta dominates all runs | yes |
| Follow-up / tool-loop split is repeat-sensitive | yes |

### Run-by-run hosted repeatability

| Run | Captured at | Hosted combined bytes | First-request bytes | Follow-up bytes | Tool-loop bytes | Total delta | Follow-up delta | Tool-loop delta | Heaviest tool-loop scenario |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 2026-04-20T04:41:29.171Z | 128582 | 14879 | 0 | 114727 | 32322 | -14865 | 48211 | ops-doc-edit |
| 2 | 2026-04-20T04:50:11.668Z | 112717 | 14879 | 0 | 100268 | 16457 | -14865 | 33752 | product-doc-edit |
| 3 | 2026-04-20T04:59:05.738Z | 114453 | 14879 | 0 | 102004 | 18193 | -14865 | 35488 | architecture-module-edit |

### Repeatability reading

- Across **3** successful hosted captures, the hosted combined full-run median spans **15865 bytes**.
- The hosted-vs-local first-request delta spans only **0 bytes**, so first-request cost remains the most stable part of the hosted/local split in the current field lane.
- The hosted-vs-local tool-loop delta spans **14459 bytes**, while the follow-up delta spans **0 bytes**; this is why the hosted loop decomposition should be read as repeat-sensitive even though tool-loop inflation remains the dominant signal.

## Runtime profile: copilot-cli-local-openai

| Field | Value |
| --- | --- |
| Runtime | copilot-cli |
| Provider | local-openai-chat-completions-stub |
| Mode | offline |
| Model | dummy-model |
| Copilot CLI | GitHub Copilot CLI 1.0.32 |
| Available tools | view |
| Stream mode | off |

### Baseline objective-runtime matrix

| Baseline | Objective scenarios | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| AODS | 5 | 12372 | 25975 | 13690 | 2.10x |
| Markdown + YAML | 5 | 5844 | 18865 | 13094 | 3.20x |
| llms.txt | 5 | 7178 | 20172 | 13064 | 2.79x |
| DITA topic corpus | 5 | 1320 | 13981 | 12661 | 10.59x |

### AODS matrix scope

| Field | Value |
| --- | --- |
| Captured scenarios | 9 |
| Objective touch-route scenarios | 5 |
| Exploratory query-route scenarios | 4 |
| Representative scenario | product-doc-edit |

### Runtime-backed byte summary

| Group | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: |
| Objective touch-route | 12372 | 25975 | 13690 | 2.10x |
| Exploratory query-route | 12804 | 26675 | 13872 | 2.10x |
| Combined | 12372 | 25975 | 13691 | 2.10x |

### Representative scenario detail

| Field | Value |
| --- | --- |
| Scenario | product-doc-edit |
| Description | Doc author edits the product lifecycle human surface. |
| Class | paired-human-surface-write |
| Route strategy | touch-route |
| Loaded modules | atlas-capsule, product-lifecycle |
| Rendered benchmark prompt | 12372 bytes |
| Exact provider request body | 25975 bytes |
| Runtime system message | 10717 bytes |
| Runtime tool definitions | 1513 bytes |
| Runtime prompt wrapper | 68 bytes |

### AODS full-run lifecycle summary

| Group | Scenarios | Median requests | Median first requests | Median follow-up prompts | Median tool-loop requests | Median auxiliary side requests | Median total request-body bytes | Median total request/prompt ratio | Multi-request rate | Tool-loop rate | Auxiliary-side-request rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | 5 | 1 | 1 | 0 | 0 | 0 | 25975 | 2.10x | 0.0% | 0.0% | 0.0% |
| Exploratory query-route | 4 | 1 | 1 | 0 | 0 | 0 | 26675 | 2.10x | 0.0% | 0.0% | 0.0% |
| Combined | 9 | 1 | 1 | 0 | 0 | 0 | 25975 | 2.10x | 0.0% | 0.0% | 0.0% |

### AODS lifecycle request-class attribution

| Group | Median first-request bytes | Median follow-up prompt bytes | Median tool-loop bytes | Median auxiliary side bytes | Median first-request share | Median follow-up share | Median tool-loop share | Median auxiliary share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | 25975 | 0 | 0 | 0 | 100.0% | 0.0% | 0.0% | 0.0% |
| Exploratory query-route | 26675 | 0 | 0 | 0 | 100.0% | 0.0% | 0.0% | 0.0% |
| Combined | 25975 | 0 | 0 | 0 | 100.0% | 0.0% | 0.0% | 0.0% |

### AODS lifecycle scenarios

| Scenario | Class | Route strategy | Requests | Follow-up prompts | Tool-loop requests | Auxiliary side requests | Total request-body bytes | Tool-loop bytes | Total request/prompt ratio | Duration ms | Exit state |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| orientation-summary | exploratory | query-route | 1 | 0 | 0 | 0 | 21310 | 0 | 2.67x | 856 | code 0, signal none |
| product-doc-edit | objective | touch-route | 1 | 0 | 0 | 0 | 25975 | 0 | 2.10x | 874 | code 0, signal none |
| architecture-module-edit | objective | touch-route | 1 | 0 | 0 | 0 | 31660 | 0 | 1.82x | 892 | code 0, signal none |
| workflow-debug | exploratory | query-route | 1 | 0 | 0 | 0 | 30143 | 0 | 1.91x | 881 | code 0, signal none |
| ops-doc-edit | objective | touch-route | 1 | 0 | 0 | 0 | 27629 | 0 | 2.01x | 868 | code 0, signal none |
| release-contract-read | exploratory | query-route | 1 | 0 | 0 | 0 | 28418 | 0 | 1.98x | 865 | code 0, signal none |
| harbor-change-control-edit | objective | touch-route | 1 | 0 | 0 | 0 | 24951 | 0 | 2.22x | 907 | code 0, signal none |
| harbor-audit-evidence-edit | objective | touch-route | 1 | 0 | 0 | 0 | 23545 | 0 | 2.35x | 868 | code 0, signal none |
| harbor-exception-review | exploratory | query-route | 1 | 0 | 0 | 0 | 24932 | 0 | 2.22x | 853 | code 0, signal none |

### Representative full-run lifecycle

| Field | Value |
| --- | --- |
| Total provider requests | 1 |
| First requests | 1 |
| Follow-up prompt requests | 0 |
| Tool-loop requests | 0 |
| Auxiliary side requests | 0 |
| Total request-body bytes | 25975 bytes |
| First-request bytes | 25975 bytes |
| Follow-up prompt bytes | 0 bytes |
| Tool-loop bytes | 0 bytes |
| Auxiliary side bytes | 0 bytes |
| Total request/prompt ratio | 2.10x |
| First-request byte share | 100.0% |
| Follow-up prompt byte share | 0.0% |
| Tool-loop byte share | 0.0% |
| Auxiliary request-byte share | 0.0% |
| Largest lifecycle request | 25975 bytes |
| Smallest lifecycle request | 25975 bytes |
| Full-run duration | 872 ms |
| Full-run exit state | code 0, signal none |

### Representative lifecycle request breakdown

| # | Class | Path | Request bytes | Prompt-bearing | Tools | Message roles |
| ---: | --- | --- | ---: | --- | ---: | --- |
| 1 | first-request | /v1/chat/completions | 25975 | yes | 1 | system, user |

### Key readings

- The matrix captured **9** routed scenarios under the **copilot-cli** profile.
- Objective touch-route scenarios show a median rendered prompt of **12372 bytes**, but a median exact provider request body of **25975 bytes**.
- Exploratory query-route scenarios show a median rendered prompt of **12804 bytes**, but a median exact provider request body of **26675 bytes**.
- Across the full matrix, the median runtime request is **2.10x** the size of the rendered benchmark prompt envelope alone.
- Across the **9** AODS full runs, this profile has a median of **1** provider request(s), **25975 bytes** total request body, and **2.10x** total request/prompt ratio.
- The exploratory subset contributes **4** lifecycle scenario(s) with a median of **1** provider request(s) and **26675 bytes** total request body.
- On the AODS representative full run, this profile sends **1** provider requests totaling **25975 bytes**, which is **1.00x** the first captured request body.
- The representative lifecycle splits into **1** first request, **0** follow-up prompt requests, **0** tool-loop requests.
- Tool-loop traffic accounts for **0.0%** of the median combined lifecycle bytes for this profile.
- The largest captured request was **31660 bytes** on **architecture-module-edit**, while the smallest was **21310 bytes** on **orientation-summary**.

## Runtime profile: claude-code-local-anthropic

| Field | Value |
| --- | --- |
| Runtime | claude-code |
| Provider | local-anthropic-messages-stub |
| Mode | offline |
| Model | claude-sonnet-4-6 |
| Claude Code | 2.1.112 (Claude Code) |
| Available tools | default-bare-toolset |
| Stream mode | off |

### Baseline objective-runtime matrix

| Baseline | Objective scenarios | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| AODS | 5 | 12372 | 14879 | 2594 | 1.20x |
| Markdown + YAML | 5 | 5844 | 7769 | 1998 | 1.30x |
| llms.txt | 5 | 7178 | 9076 | 1968 | 1.24x |
| DITA topic corpus | 5 | 1320 | 2885 | 1565 | 2.19x |

### AODS matrix scope

| Field | Value |
| --- | --- |
| Captured scenarios | 9 |
| Objective touch-route scenarios | 5 |
| Exploratory query-route scenarios | 4 |
| Representative scenario | product-doc-edit |

### Runtime-backed byte summary

| Group | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: |
| Objective touch-route | 12372 | 14879 | 2594 | 1.20x |
| Exploratory query-route | 12804 | 15579 | 2776 | 1.22x |
| Combined | 12372 | 14879 | 2595 | 1.21x |

### Representative scenario detail

| Field | Value |
| --- | --- |
| Scenario | product-doc-edit |
| Description | Doc author edits the product lifecycle human surface. |
| Class | paired-human-surface-write |
| Route strategy | touch-route |
| Loaded modules | atlas-capsule, product-lifecycle |
| Rendered benchmark prompt | 12372 bytes |
| Exact provider request body | 14879 bytes |
| Runtime system message | 849 bytes |
| Runtime tool definitions | 2 bytes |
| Runtime prompt wrapper | 0 bytes |

### AODS full-run lifecycle summary

| Group | Scenarios | Median requests | Median first requests | Median follow-up prompts | Median tool-loop requests | Median auxiliary side requests | Median total request-body bytes | Median total request/prompt ratio | Multi-request rate | Tool-loop rate | Auxiliary-side-request rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | 5 | 4 | 1 | 1 | 2 | 0 | 96260 | 7.78x | 100.0% | 100.0% | 0.0% |
| Exploratory query-route | 4 | 4 | 1 | 1 | 2 | 0 | 99060 | 7.79x | 100.0% | 100.0% | 0.0% |
| Combined | 9 | 4 | 1 | 1 | 2 | 0 | 96260 | 7.78x | 100.0% | 100.0% | 0.0% |

### AODS lifecycle request-class attribution

| Group | Median first-request bytes | Median follow-up prompt bytes | Median tool-loop bytes | Median auxiliary side bytes | Median first-request share | Median follow-up share | Median tool-loop share | Median auxiliary share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | 14879 | 14865 | 66516 | 0 | 15.5% | 15.4% | 69.1% | 0.0% |
| Exploratory query-route | 15579 | 15565 | 67916 | 0 | 15.7% | 15.7% | 68.7% | 0.0% |
| Combined | 14879 | 14865 | 66516 | 0 | 15.5% | 15.4% | 69.1% | 0.0% |

### AODS lifecycle scenarios

| Scenario | Class | Route strategy | Requests | Follow-up prompts | Tool-loop requests | Auxiliary side requests | Total request-body bytes | Tool-loop bytes | Total request/prompt ratio | Duration ms | Exit state |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| orientation-summary | exploratory | query-route | 4 | 1 | 2 | 0 | 77600 | 57186 | 9.71x | 1433 | code 0, signal none |
| product-doc-edit | objective | touch-route | 4 | 1 | 2 | 0 | 96260 | 66516 | 7.78x | 1440 | code 0, signal none |
| architecture-module-edit | objective | touch-route | 4 | 1 | 2 | 0 | 119000 | 77886 | 6.84x | 1393 | code 0, signal none |
| workflow-debug | exploratory | query-route | 4 | 1 | 2 | 0 | 112932 | 74852 | 7.14x | 1411 | code 0, signal none |
| ops-doc-edit | objective | touch-route | 4 | 1 | 2 | 0 | 102876 | 69824 | 7.49x | 1380 | code 0, signal none |
| release-contract-read | exploratory | query-route | 4 | 1 | 2 | 0 | 106032 | 71402 | 7.38x | 1412 | code 0, signal none |
| harbor-change-control-edit | objective | touch-route | 4 | 1 | 2 | 0 | 92164 | 64468 | 8.18x | 1438 | code 0, signal none |
| harbor-audit-evidence-edit | objective | touch-route | 4 | 1 | 2 | 0 | 86540 | 61656 | 8.63x | 1419 | code 0, signal none |
| harbor-exception-review | exploratory | query-route | 4 | 1 | 2 | 0 | 92088 | 64430 | 8.19x | 1428 | code 0, signal none |

### Representative full-run lifecycle

| Field | Value |
| --- | --- |
| Total provider requests | 4 |
| First requests | 1 |
| Follow-up prompt requests | 1 |
| Tool-loop requests | 2 |
| Auxiliary side requests | 0 |
| Total request-body bytes | 96260 bytes |
| First-request bytes | 14879 bytes |
| Follow-up prompt bytes | 14865 bytes |
| Tool-loop bytes | 66516 bytes |
| Auxiliary side bytes | 0 bytes |
| Total request/prompt ratio | 7.78x |
| First-request byte share | 15.5% |
| Follow-up prompt byte share | 15.4% |
| Tool-loop byte share | 69.1% |
| Auxiliary request-byte share | 0.0% |
| Largest lifecycle request | 33265 bytes |
| Smallest lifecycle request | 14865 bytes |
| Full-run duration | 1397 ms |
| Full-run exit state | code 0, signal none |

### Representative lifecycle request breakdown

| # | Class | Path | Request bytes | Prompt-bearing | Tools | Message roles |
| ---: | --- | --- | ---: | --- | ---: | --- |
| 1 | first-request | /v1/messages?beta=true | 14879 | yes | 0 | user |
| 2 | follow-up-prompt | /v1/messages?beta=true | 14865 | yes | 0 | user |
| 3 | tool-loop | /v1/messages?beta=true | 33265 | yes | 3 | user |
| 4 | tool-loop | /v1/messages?beta=true | 33251 | yes | 3 | user |

### Key readings

- The matrix captured **9** routed scenarios under the **claude-code** profile.
- Objective touch-route scenarios show a median rendered prompt of **12372 bytes**, but a median exact provider request body of **14879 bytes**.
- Exploratory query-route scenarios show a median rendered prompt of **12804 bytes**, but a median exact provider request body of **15579 bytes**.
- Across the full matrix, the median runtime request is **1.21x** the size of the rendered benchmark prompt envelope alone.
- Across the **9** AODS full runs, this profile has a median of **4** provider request(s), **96260 bytes** total request body, and **7.78x** total request/prompt ratio.
- The exploratory subset contributes **4** lifecycle scenario(s) with a median of **4** provider request(s) and **99060 bytes** total request body.
- On the AODS representative full run, this profile sends **4** provider requests totaling **96260 bytes**, which is **6.47x** the first captured request body.
- The representative lifecycle splits into **1** first request, **1** follow-up prompt request, **2** tool-loop requests.
- Tool-loop traffic accounts for **69.1%** of the median combined lifecycle bytes for this profile.
- The largest captured request was **20564 bytes** on **architecture-module-edit**, while the smallest was **10214 bytes** on **orientation-summary**.

## Runtime profile: claude-code-hosted-anthropic-relay

| Field | Value |
| --- | --- |
| Runtime | claude-code |
| Provider | hosted-anthropic-compatible-via-local-relay |
| Mode | hosted |
| Model | claude-sonnet-4-6 |
| Claude Code | 2.1.112 (Claude Code) |
| Available tools | default-bare-toolset |
| Stream mode | off |

### Baseline objective-runtime matrix

| Baseline | Objective scenarios | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| AODS | 5 | 12372 | 14879 | 2594 | 1.20x |
| Markdown + YAML | 5 | 5844 | 7769 | 1998 | 1.30x |
| llms.txt | 5 | 7178 | 9076 | 1968 | 1.24x |
| DITA topic corpus | 5 | 1320 | 2885 | 1565 | 2.19x |

### AODS matrix scope

| Field | Value |
| --- | --- |
| Captured scenarios | 9 |
| Objective touch-route scenarios | 5 |
| Exploratory query-route scenarios | 4 |
| Representative scenario | product-doc-edit |

### Runtime-backed byte summary

| Group | Median rendered prompt | Median exact request body | Median added runtime bytes | Median request/prompt ratio |
| --- | ---: | ---: | ---: | ---: |
| Objective touch-route | 12372 | 14879 | 2594 | 1.20x |
| Exploratory query-route | 12804 | 15579 | 2776 | 1.22x |
| Combined | 12372 | 14879 | 2595 | 1.21x |

### Representative scenario detail

| Field | Value |
| --- | --- |
| Scenario | product-doc-edit |
| Description | Doc author edits the product lifecycle human surface. |
| Class | paired-human-surface-write |
| Route strategy | touch-route |
| Loaded modules | atlas-capsule, product-lifecycle |
| Rendered benchmark prompt | 12372 bytes |
| Exact provider request body | 14879 bytes |
| Runtime system message | 849 bytes |
| Runtime tool definitions | 2 bytes |
| Runtime prompt wrapper | 0 bytes |

### AODS full-run lifecycle summary

| Group | Scenarios | Median requests | Median first requests | Median follow-up prompts | Median tool-loop requests | Median auxiliary side requests | Median total request-body bytes | Median total request/prompt ratio | Multi-request rate | Tool-loop rate | Auxiliary-side-request rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | 5 | 5 | 1 | 0 | 4 | 0 | 157342 | 13.47x | 100.0% | 100.0% | 0.0% |
| Exploratory query-route | 4 | 2 | 1 | 0 | 1 | 0 | 49544 | 3.89x | 100.0% | 100.0% | 0.0% |
| Combined | 9 | 4 | 1 | 0 | 3 | 0 | 128582 | 8.75x | 100.0% | 100.0% | 0.0% |

### AODS lifecycle request-class attribution

| Group | Median first-request bytes | Median follow-up prompt bytes | Median tool-loop bytes | Median auxiliary side bytes | Median first-request share | Median follow-up share | Median tool-loop share | Median auxiliary share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Objective touch-route | 14879 | 0 | 144893 | 0 | 8.9% | 0.0% | 91.1% | 0.0% |
| Exploratory query-route | 15579 | 0 | 33965 | 0 | 31.4% | 0.0% | 68.6% | 0.0% |
| Combined | 14879 | 0 | 114727 | 0 | 13.5% | 0.0% | 86.5% | 0.0% |

### AODS lifecycle scenarios

| Scenario | Class | Route strategy | Requests | Follow-up prompts | Tool-loop requests | Auxiliary side requests | Total request-body bytes | Tool-loop bytes | Total request/prompt ratio | Duration ms | Exit state |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| orientation-summary | exploratory | query-route | 2 | 0 | 1 | 0 | 38814 | 28600 | 4.86x | 27400 | code 0, signal none |
| product-doc-edit | objective | touch-route | 5 | 0 | 4 | 0 | 166691 | 151812 | 13.47x | 45964 | code 143, signal none |
| architecture-module-edit | objective | touch-route | 4 | 0 | 3 | 0 | 152206 | 131642 | 8.75x | 27981 | code 1, signal none |
| workflow-debug | exploratory | query-route | 2 | 0 | 1 | 0 | 56480 | 37433 | 3.57x | 32049 | code 1, signal none |
| ops-doc-edit | objective | touch-route | 6 | 0 | 5 | 0 | 228490 | 211957 | 16.64x | 45877 | code 143, signal none |
| release-contract-read | exploratory | query-route | 2 | 0 | 1 | 0 | 53030 | 35708 | 3.69x | 33215 | code 0, signal none |
| harbor-change-control-edit | objective | touch-route | 4 | 0 | 3 | 0 | 128582 | 114727 | 11.42x | 29001 | code 1, signal none |
| harbor-audit-evidence-edit | objective | touch-route | 5 | 0 | 4 | 0 | 157342 | 144893 | 15.69x | 46014 | code 143, signal none |
| harbor-exception-review | exploratory | query-route | 2 | 0 | 1 | 0 | 46058 | 32222 | 4.10x | 27967 | code 0, signal none |

### Representative full-run lifecycle

| Field | Value |
| --- | --- |
| Total provider requests | 4 |
| First requests | 1 |
| Follow-up prompt requests | 0 |
| Tool-loop requests | 3 |
| Auxiliary side requests | 0 |
| Total request-body bytes | 129595 bytes |
| First-request bytes | 14879 bytes |
| Follow-up prompt bytes | 0 bytes |
| Tool-loop bytes | 114716 bytes |
| Auxiliary side bytes | 0 bytes |
| Total request/prompt ratio | 10.47x |
| First-request byte share | 11.5% |
| Follow-up prompt byte share | 0.0% |
| Tool-loop byte share | 88.5% |
| Auxiliary request-byte share | 0.0% |
| Largest lifecycle request | 44010 bytes |
| Smallest lifecycle request | 14879 bytes |
| Full-run duration | 38791 ms |
| Full-run exit state | code 1, signal none |

### Representative lifecycle request breakdown

| # | Class | Path | Request bytes | Prompt-bearing | Tools | Message roles |
| ---: | --- | --- | ---: | --- | ---: | --- |
| 1 | first-request | /v1/messages?beta=true | 14879 | yes | 0 | user |
| 2 | tool-loop | /v1/messages?beta=true | 33265 | yes | 3 | user |
| 3 | tool-loop | /v1/messages?beta=true | 37441 | yes | 3 | user, assistant, user |
| 4 | tool-loop | /v1/messages?beta=true | 44010 | yes | 3 | user, assistant, user, assistant, user |

### Key readings

- The matrix captured **9** routed scenarios under the **claude-code** profile.
- Objective touch-route scenarios show a median rendered prompt of **12372 bytes**, but a median exact provider request body of **14879 bytes**.
- Exploratory query-route scenarios show a median rendered prompt of **12804 bytes**, but a median exact provider request body of **15579 bytes**.
- Across the full matrix, the median runtime request is **1.21x** the size of the rendered benchmark prompt envelope alone.
- Across the **9** AODS full runs, this profile has a median of **4** provider request(s), **128582 bytes** total request body, and **8.75x** total request/prompt ratio.
- The exploratory subset contributes **4** lifecycle scenario(s) with a median of **2** provider request(s) and **49544 bytes** total request body.
- On the AODS representative full run, this profile sends **4** provider requests totaling **129595 bytes**, which is **8.71x** the first captured request body.
- The representative lifecycle splits into **1** first request, **0** follow-up prompt requests, **3** tool-loop requests.
- Tool-loop traffic accounts for **86.5%** of the median combined lifecycle bytes for this profile.
- The largest captured request was **20564 bytes** on **architecture-module-edit**, while the smallest was **10214 bytes** on **orientation-summary**.

## Interpretation

This matrix strengthens the benchmark in one important way: it turns "rendered prompt envelope" from a pure synthetic proxy into something that can now be compared against real CLI request bodies across the current round-one baseline prompts. The current evidence says the benchmark prompt is directionally useful, but real runtime requests are still materially larger because each runtime wraps the routed content with system instructions, tool definitions, and JSON framing.

## Limits

- Default captures are local provider-compatible profiles, and any hosted relay-backed lane must be enabled explicitly.
- The local Claude Code profile is captured through a local Anthropic-compatible stub so the default benchmark stays reproducible and cost-safe.
- The main scoreboard should still use shared, renderer-based metrics until comparable runtime-backed captures exist for broader toolchains and field conditions.
