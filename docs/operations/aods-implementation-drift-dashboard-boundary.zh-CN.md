# Implementation Drift Dashboard Boundary Triage

任务：U-111
状态：已完成
日期：2026-05-12

## 目标

如果未来要做 implementation drift dashboard，先定义它只能消费哪些静态输入、显示哪些状态、不得做哪些自动判断。本任务不创建 dashboard。

## 静态输入

| 输入 | 用途 |
|---|---|
| `manifest.project_topology` | repo identity、locator、role、status |
| `manifest.modules[].implementation` | module-level implementation summary |
| `module.meta.implementation.evidence[]` | evidence id、kind、locator、status、freshness_policy |
| `module.meta.implementation.acceptance_criteria[]` | requirement、check_type、blocking、status、evidence_refs |
| `validate --json` report | L1-L4 issue、remediation、topology summary |
| `fixture smoke --json` report | fixture/golden declared coverage |

## 候选面板

| 面板 | 必须显示 | 不得显示成 |
|---|---|---|
| Repo locator posture | checked / unchecked / remote / missing | 自动修复结果 |
| Evidence posture | current / planned / stale / blocked | 单一 pass 百分比 |
| Acceptance posture | satisfied / planned / manual-review / blocked | release approval |
| Fixture coverage | positive / negative / golden count | conformance 完整性 |
| Drift warnings | validator rule + remediation | 自动 owner 判断 |

## 当前基线

| 指标 | 值 |
|---|---:|
| linked modules | 8 |
| current evidence | 13 |
| planned evidence | 1 |
| stale evidence | 0 |
| fixture count | 9 |
| negative fixture count | 0 |
| golden export count | 9 |

## 非目标

- 不建 dashboard。
- 不写 telemetry store。
- 不自动读取 sibling repo。
- 不把 dashboard 作为 release approval。
- 不自动推断 owner 或 refresh evidence。

## 后续进入条件

只有当 U-124 / U-125 这类 JSON report contract 任务完成后，才适合把 dashboard 从 triage 变成实现任务；否则 dashboard 会绑定不稳定输出。
