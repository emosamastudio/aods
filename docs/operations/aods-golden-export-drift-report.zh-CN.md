# Golden Export Drift Report

任务：U-115
状态：已完成
日期：2026-05-12

## 目标

定义 golden export drift 的检测、人工接受、拒绝和更新边界。当前不自动接受 golden diff。

## 当前 Golden Set

| 指标 | 值 |
|---|---:|
| golden exports | 9 |
| update command | `npm run compile:pilot` |
| review gate | `manual-diff` |
| smoke status | pass |

当前 golden exports 覆盖 full compiled corpus、6 个 surface-family module、runtime companion、governance module。

## Drift Detection

| 场景 | 命令 | 判定 |
|---|---|---|
| source-first 语义改动 | `npm run compile:pilot` | generated diff 必须人工审查 |
| fixture path smoke | `npm run fixture:smoke` | input/golden path 必须存在 |
| compiled-pilot validity | `npm run validate:compiled-pilot` | schema/reality gate 必须通过 |
| release 前 | `npm run release:self-check` | package + benchmark + generated output gate |

## Manual Diff Decision

| 结果 | 动作 |
|---|---|
| diff 与 authoring source 语义一致 | 接受 generated diff，连同 source change 一起提交 |
| diff 只有 timestamp / nondeterministic churn | 拒绝，修 determinism 或恢复 churn |
| diff 改变 public example semantics | 回到 authoring source 复审 |
| diff 来自 benchmark/report 运行噪声 | 默认恢复，除非本轮任务明确更新 generated report |

## 本轮基线

本轮运行过 fixture smoke 和相关测试；未接受新的 compiled-pilot golden diff。`release:self-check` 产生的 benchmark generated/report churn 仍按既有规则恢复，不进入提交。

## 非目标

- 不自动更新 golden。
- 不自动接受 generated diff。
- 不把 smoke pass 当作 semantic approval。
- 不把 benchmark generated churn 混入无关提交。
