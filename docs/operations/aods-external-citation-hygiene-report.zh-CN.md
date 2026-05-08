# AODS external citation hygiene report

状态：U-082 已完成
日期：2026-05-08
适用范围：declared external citation 的 stale / current / assumption / unsupported posture 可见性

## 人话说明

这轮补的是一张检查报告：别人不用逐条翻材料，就能看到哪些外部依据被声明为当前可用，哪些已经过期，哪些只是没被证明的假设。价值是让维护者先看清风险，再决定是否刷新依据或降低承诺。

## 已落地能力

| 面 | 结果 |
|---|---|
| JSON report | `validate --json` 在存在 external citation 或 citation refs 时输出 `external_citations` |
| Text report | 普通 `validate` 输出新增 `citations ...` 摘要行 |
| 覆盖范围 | 只统计 corpus 内已声明的 `review_status`、authority posture、assumption posture 和 stable decision citation refs |
| 非目标 | 不抓取 URL、不检查远端可用性、不做事实核验、不做 claim detector、不做 LLM faithfulness judge |

## 报告字段

| 字段 | 含义 |
|---|---|
| `total` | 已声明 external citation 记录数 |
| `modules_with_citations` | 声明 citation registry 的模块数 |
| `authoritative` | 被声明为 external authority 或 authoritative claim 的记录数 |
| `current_authoritative` | 当前可用的权威记录数 |
| `stale_authoritative` | 已过期的权威记录数 |
| `unresolved_authoritative` | 未解决的权威记录数 |
| `withheld_authoritative` | 被 withheld 的权威记录数 |
| `assumptions` | source / relation / claim posture 中任一项声明为 assumption 的记录数 |
| `unsupported_assumptions` | 明确声明为 unsupported assumption 的记录数 |
| `current` / `stale` / `unresolved` / `withheld` | 按 review_status 汇总的记录数 |
| `cited_refs` | section、artifact、decision_provenance 中的 citation ref 数 |
| `stable_decision_refs` | stable agent-consumable decision 中的 citation ref 数 |
| `stable_decision_current_authoritative_refs` | stable decision 依赖的 current authoritative refs |
| `stable_decision_noncurrent_authoritative_refs` | stable decision 依赖的非 current authoritative refs |

## 当前 compiled-pilot 快照

| 指标 | 值 |
|---|---:|
| total | 2 |
| modules_with_citations | 1 |
| authoritative | 1 |
| current_authoritative | 1 |
| stale_authoritative | 0 |
| assumptions | 1 |
| unsupported_assumptions | 1 |
| cited_refs | 3 |
| stable_decision_refs | 1 |
| stable_decision_current_authoritative_refs | 1 |
| stable_decision_noncurrent_authoritative_refs | 0 |

## 验证

| 验证项 | 命令 | 结果 |
|---|---|---|
| RED regression | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 初次失败于缺少 `external_citations` report |
| GREEN focused regression | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 31/31 pass |
| Example report smoke | `node ./bin/aods.mjs validate ./examples/compiled-pilot --json` | 输出 expected `external_citations` counters |

## 后续

该报告只解决“看得见”。如果未来要解决“自动判断外部材料是否仍有效”，必须作为独立任务裁剪，不应混入当前 validator。
