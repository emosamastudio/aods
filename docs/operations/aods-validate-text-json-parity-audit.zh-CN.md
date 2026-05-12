# Validate Text / JSON Parity Audit

任务：U-125
状态：已完成
日期：2026-05-12

## 目标

审查 validate text 和 JSON 输出的信息差、必要保留差异和 future fixes。当前不大改输出。

## Text Output Snapshot

命令：

```bash
node ./bin/aods.mjs validate . --strict
```

当前 text 输出包含：

| 行 | 信息 |
|---|---|
| result line | PASS / FAIL + corpus path |
| summary line | modules / sections / artifacts / surface_pairs / errors / warnings |
| level lines | L1 到 L4 pass / error / warning counts |

`--reality` text 输出额外包含 topology summary 和 citation summary。

## JSON Output Snapshot

命令：

```bash
node ./bin/aods.mjs validate . --strict --json
```

JSON 输出包含 base report fields：`corpus`, `timestamp`, `levels`, `summary`, `strict`, `accepted`, `status`。`--reality` JSON 额外包含 `topology` 和 `external_citations`。

## Parity Matrix

| 信息 | text | JSON | 判断 |
|---|---:|---:|---|
| pass/fail status | 是 | 是 | parity |
| corpus id / path | path | id | 保留差异；面向对象不同 |
| module / section / artifact counts | 是 | 是 | parity |
| surface pair count | 是 | 是 | parity |
| error / warning count | 是 | 是 | parity |
| L1-L4 summary | 是 | 是 | parity |
| issue arrays | 只在人类格式中展开 | 结构化数组 | JSON 是机器权威 |
| remediation detail | 人类可读 | 结构化 | JSON 是机器权威 |
| topology summary | 是，压缩为一行 | 是，完整对象 | 保留差异 |
| citation summary | 是，压缩为一行 | 是，完整对象 | 保留差异 |
| timestamp | 否 | 是 | 保留差异 |

## 结论

当前 text 输出适合终端快速判断，JSON 输出适合 CI、dashboard 和自动化消费。两者在 gate result、summary counts 和 L1-L4 层级上保持一致；复杂结构继续以 JSON 为权威，不强行让 text 展开所有字段。

## Future Fix Candidates

| 候选 | 价值 | 风险 |
|---|---|---|
| compact / verbose mode triage | 降低 text 输出噪声 | 需要先完成 U-129 |
| documented JSON schema file | 方便外部集成 | 需要稳定更多字段后再做 |
| text output snapshot test | 防止终端输出无意漂移 | 可能导致低价值格式锁死 |

## 非目标

- 不大改 validate output。
- 不新增 compact / verbose mode。
- 不把 text 输出变成机器契约。
- 不改变 strict gate 行为。
