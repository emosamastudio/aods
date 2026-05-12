# Fixture Manifest Coverage Matrix

任务：U-113
状态：已完成
日期：2026-05-12

## 目标

汇总当前 fixture manifest 对 canonical example 的 positive / negative / golden coverage。只做覆盖矩阵，不补全所有 fixture。

## Smoke 摘要

命令：

```bash
node ./bin/aods.mjs fixture smoke ./examples/compiled-pilot-source/fixtures/fixture-manifest.json --json
```

| 指标 | 值 |
|---|---:|
| fixtures | 9 |
| positive | 9 |
| negative | 0 |
| expected pass | 9 |
| expected fail | 0 |
| expected warn | 0 |
| expected rules | 0 |
| golden exports | 9 |
| issues | 0 |

## Coverage Matrix

| Fixture | Positive | Negative | Golden | 覆盖面 |
|---|---:|---:|---:|---|
| `positive-compiled-pilot-source` | 1 | 0 | 1 | full compiled corpus |
| `positive-read-model-implementation-linkage-pack` | 1 | 0 | 1 | read-model implementation linkage |
| `positive-command-receipt-pack` | 1 | 0 | 1 | command receipt |
| `positive-event-correction-supersession-pack` | 1 | 0 | 1 | event correction / supersession |
| `positive-adapter-capability-exposure-pack` | 1 | 0 | 1 | adapter capability / exposure |
| `positive-artifact-export-policy-gate-pack` | 1 | 0 | 1 | artifact export / policy gate |
| `positive-resource-surface-pack` | 1 | 0 | 1 | resource surface |
| `positive-glossary-registry-pack` | 1 | 0 | 1 | glossary registry companion |
| `positive-external-citation-provenance-pack` | 1 | 0 | 1 | external citation provenance |

## Coverage Gap

| Gap | 影响 | 下一步 |
|---|---|---|
| negative fixture = 0 | 无法用 fixture manifest 表达预期失败样例覆盖 | U-114 已制定扩展计划 |
| warn fixture = 0 | warning posture 没有 fixture-level example | 后续和 validation severity 任务合并 |
| golden drift 只靠人工 diff | 可用但不够结构化 | U-115 已定义 drift report |

## 非目标

- 不一次性新增全部 negative fixtures。
- 不把 fixture smoke 扩成 conformance runner。
- 不自动接受 golden diff。
