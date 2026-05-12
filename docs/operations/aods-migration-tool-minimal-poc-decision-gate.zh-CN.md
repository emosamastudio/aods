# AODS Migration Tool Minimal PoC Decision Gate

任务：U-155
状态：已完成
日期：2026-05-12
范围：migration tool PoC 的 dry-run、rollback、destructive approval、fixtures；不实现 PoC

## Decision

当前结论：No-go for implementation。migration tool 只能先做一个 bounded dry-run PoC，且必须有 source/target authority、mapping、risk、manual step、validation gate 和 destructive approval 语义；本轮不实现迁移器。

## Prerequisites

| Gate | 进入条件 |
|---|---|
| source authority | source surface、version、deprecation state、owner 明确 |
| target authority | replacement surface、version、compatibility posture 明确 |
| mapping | field mapping、semantic gaps、manual steps、unsupported cases 明确 |
| dry-run report | affected surfaces、risk、expected diff、manual approvals、validation command 明确 |
| rollback | rollback posture、irreversible changes、backup expectation 明确 |
| destructive approval | destructive action 需要 approval gate 和 audit anchor |
| fixtures | destructive change blocked、missing mapping、stale source、invalid replacement negative fixtures 准备好 |
| public wording | 文档明确 “not an automatic migration framework” |

## Success Metrics

| 指标 | 通过标准 |
|---|---|
| dry-run only | PoC 只输出报告，不改文件、不写远程 |
| traceable mapping | 每个变更建议能回链 source / target authority |
| risk visible | destructive / irreversible / manual steps 显式列出 |
| validation gate | dry-run report 能指向后续 validate / fixture gate |

## Abort Criteria

| 条件 | 处理 |
|---|---|
| 需要自动写文件才有价值 | abort |
| source/target authority 不清 | abort |
| destructive approval 缺失 | abort |
| rollback 无法表达 | abort |
| 迁移报告会被误解为已执行 | abort |

## 非目标

- 不实现 migration executor。
- 不自动 rewrite corpus、schema、examples 或 consumer code。
- 不做 remote fetch、cross-corpus mutation 或 destructive action。
- 不把 dry-run report 当成实际迁移完成证明。
