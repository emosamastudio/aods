# AODS Dependency Scheduler Research

任务：U-159
状态：已完成
日期：2026-05-12
范围：dependency ordering 是否进入 runtime scheduler 的 gate、risks、alternatives；不实现 scheduler

## 目标

研究 dependency ordering 是否应升级为 runtime scheduler，并定义进入条件、风险和替代路线。当前只做研究，不实现 scheduler、topological build runner、package manager 或 cross-repo executor。

## Current Boundary

`surface-dependency-ordering` 已定义 `requires`、`blocks`、`derives_from`、`emits`、`consumes`、`optional_dependency`，用途是让 validation、routing、release review 和 agent consumption 能理解依赖顺序和 degraded behavior。它不是执行计划。

## Scheduler Need Assessment

| Need | 当前是否成立 | 结论 |
|---|---|---|
| stable validation order | 部分成立 | validator 可继续静态排序，不需要 runtime scheduler |
| generated surface rebuild order | 部分成立 | 可先用 compile / fixture pipeline，不建通用 scheduler |
| cross-repo task execution | 不成立 | 当前明确禁止 remote / sibling repo mutation |
| workflow transition execution | 不成立 | workflow runtime 仍 no-go |
| event projection replay | 不成立 | event store / replay 仍 no-go |

## Entry Gates

| Gate | Required before scheduler PoC |
|---|---|
| dependency graph schema | edges、strength、fallback、blocking posture 机器可读 |
| cycle handling | cycle detection、manual review、blocked report 明确 |
| execution boundary | read-only ordering vs write execution 必须分开 |
| receipt model | every scheduled action has dry-run receipt |
| failure semantics | skipped / blocked / degraded / failed 行为稳定 |
| fixture coverage | missing dependency、cycle、optional fallback、blocked edge negative fixtures |

## Alternatives

| Alternative | 价值 | 为什么优先 |
|---|---|---|
| validator dependency diagnostics | 输出 blocking edge / missing target / cycle hints | 低风险，不执行动作 |
| route dependency explanation | 扩展 `explanation.dependency` | 已有基础，不建 scheduler |
| compile ordering check | 只检查 source-first generated outputs | 范围窄，可验证 |
| fixture conformance report | 用 fixtures 验证 dependency cases | 适合作为后续 conformance report 候选 |

## Risks

| 风险 | 控制 |
|---|---|
| 把 dependency vocabulary 误当执行计划 | 文档固定“ordering not execution” |
| scheduler 触发跨仓库写入 | 默认禁止写动作 |
| cycle resolution 变成人工猜测 | unresolved cycle 必须 block |
| optional dependency 被当 hard dependency | dependency_strength 必须进入 report |

## Decision

当前建议：不实现 scheduler。下一步若继续，应优先做 validator / route dependency diagnostics，而不是 runtime scheduler。

## 非目标

- 不实现 dependency scheduler。
- 不实现 package manager、topological build runner、workflow executor 或 cross-repo executor。
- 不执行依赖任务。
- 不自动解决 dependency cycles。
