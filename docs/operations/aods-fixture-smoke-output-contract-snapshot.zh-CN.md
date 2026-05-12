# Fixture Smoke Output Contract Snapshot

任务：U-116
状态：已完成
日期：2026-05-12

## 目标

固化 `fixture smoke` 的 JSON / text 输出契约，避免后续改动让自动化消费方失去稳定字段。当前不把 fixture smoke 扩成 conformance runner。

## JSON Snapshot

命令：

```bash
node ./bin/aods.mjs fixture smoke ./examples/compiled-pilot-source/fixtures/fixture-manifest.json --json
```

| 字段 | 当前值 / 形状 | 契约级别 |
|---|---|---|
| `action` | `fixture smoke` | stable |
| `status` | `pass` / `fail` | stable |
| `accepted` | boolean | stable |
| `manifest.path` | resolved absolute path | stable |
| `manifest.version` | integer | stable |
| `manifest.convention` | string | stable |
| `manifest.update_policy.review_gate` | string | stable |
| `manifest.update_policy.commands[]` | string array | stable |
| `summary.fixtures` | integer | stable |
| `summary.kind.positive` | integer | stable |
| `summary.kind.negative` | integer | stable |
| `summary.expected_status.pass/fail/warn/invalid` | integer counters | stable |
| `summary.expected_rules` | integer | stable |
| `summary.golden_exports` | integer | stable |
| `issues[]` | issue objects; empty on pass | stable |

当前基线：

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

## Text Snapshot

命令：

```bash
node ./bin/aods.mjs fixture smoke ./examples/compiled-pilot-source/fixtures/fixture-manifest.json
```

稳定行：

```text
PASS fixture smoke <fixture-manifest-path>
fixtures: 9
golden_exports: 9
```

text 输出只承诺人类可读的总结果和两个计数；机器消费必须使用 `--json`。

## 非执行边界

`fixture smoke` 只验证 manifest、expected outcome、input path、golden path 和 update policy 的声明结构；不会执行 `manifest.update_policy.commands[]`，也不会写入 golden export。

## 非目标

- 不新增 negative fixture。
- 不自动更新 golden。
- 不建立完整 conformance runner。
- 不把 text 输出升级成完整机器契约。
