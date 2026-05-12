# AODS Workflow Runtime Minimal PoC Decision Gate

任务：U-151
状态：已完成
日期：2026-05-12
范围：workflow runtime 是否值得 PoC 的 prerequisites / success metrics / abort criteria；不实现 PoC

## Decision

当前结论：No-go for implementation。workflow runtime 只能在以下 gate 全部满足后进入最小 PoC；本轮不写代码、不引入调度器、不执行 workflow。

## Prerequisites

| Gate | 进入条件 |
|---|---|
| object identity | workflow object、owner、authority surface 和 state source 已稳定 |
| state model | start / pending / end 等 lifecycle vocabulary 有 canonical profile 和 negative fixtures |
| transition contract | transition、guard、timeout、retry、cancel、cleanup 的输入输出明确 |
| command / receipt | 每个可执行 transition 都有 command ref、receipt ref 和 audit anchor |
| dependency boundary | requires / blocks / emits / consumes 的 ordering 只作为声明，不隐含 scheduler |
| fixture coverage | invalid transition、missing guard、missing receipt、dependency conflict negative fixtures 已准备 |
| public wording | 文档明确 “not a general workflow engine” |

## Success Metrics

| 指标 | 通过标准 |
|---|---|
| deterministic validation | invalid lifecycle / transition / missing receipt 能被确定性识别 |
| explainability | validate / fixture output 能说明 read-only、executable、blocked 或 manual-review posture |
| non-execution | PoC 不执行真实任务，只验证 metadata contract |
| bounded scope | 只覆盖一个最小 workflow shape，不扩成平台 |

## Abort Criteria

| 条件 | 处理 |
|---|---|
| 需要 runtime scheduler 才能证明价值 | abort |
| 需要真实远程写入或生产变更 | abort |
| lifecycle vocabulary 尚未统一 | abort |
| receipt / audit anchor 不稳定 | abort |
| public docs 容易被理解成通用 workflow engine | abort |

## 非目标

- 不实现 workflow engine。
- 不实现 scheduler、retry runtime、cleanup executor 或 task queue。
- 不执行 transition。
- 不把 lifecycle docs 当成 runtime 行为保证。
