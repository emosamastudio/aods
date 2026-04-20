# AODS benchmark executive summary

## Release recommendation

- Recommendation: **Ready to publish the next version**
- Assessed version: **0.6.0**
- Executive summary generated at: **2026-04-20T05:28:28.595Z**

## Decision card

| Dimension | Result | Evidence |
| --- | --- | --- |
| Lifecycle and file-surface coverage | **Pass** | 100.0% lifecycle coverage |
| Information preservation | **Pass** | 100.0% fact preservation |
| Task-time progressive loading | **Pass** | 100.0% touch-route hit rate, 12372-byte median prompt envelope, 76.0% median byte savings |
| Drift and release-surface trust | **Pass** | 100.0% built-in drift recall, 100.0% release-surface reality recall |
| External routing realism | **Supplemental strength** | 100.0% API-surface rerank top-1 hit rate |

## Management reading

1. AODS passes the benchmark on representability, information preservation, task-time context control, and anti-drift / trust controls.
1. The practical win comes from governed routing and validation rather than from shrinking the full repository corpus.
1. Hosted field inflation remains concentrated in tool-loop traffic across repeat runs, while the exact follow-up vs tool-loop split stays repeat-sensitive.
1. The benchmark is now strong enough to support publishing the next version, with broader field diversity left as a follow-on improvement wave.

## Hosted repeatability snapshot

| Metric | Band |
| --- | --- |
| Successful hosted runs | 3 |
| Hosted-vs-local total delta | 16457 - 32322 bytes (span 15865) |
| Hosted-vs-local first-request delta | 0 - 0 bytes (span 0) |
| Hosted-vs-local tool-loop delta | 33752 - 48211 bytes (span 14459) |

- Tool-loop delta dominates all runs: **yes**
- First-request delta is stable across runs: **yes**
- Hosted loop split remains repeat-sensitive: **yes**

## Residual risks

- Repository-scale corpus bytes remain roughly flat because governance metadata offsets local artifact compression.
- Hosted request-loop decomposition is still repeat-sensitive across successful runs.
- The open-source field sample is still English-only and narrower than a full cross-toolchain matrix.

## Recommended next action

- **Publish the next version**, then continue widening language coverage and the fair field matrix in a later benchmark wave.
