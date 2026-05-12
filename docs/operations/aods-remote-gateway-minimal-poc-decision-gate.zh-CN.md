# AODS Remote Gateway Minimal PoC Decision Gate

任务：U-154
状态：已完成
日期：2026-05-12
范围：remote gateway PoC 的 auth、transport、rate/cost、failure semantics；不实现 PoC

## Decision

当前结论：No-go for implementation。remote gateway 必须先证明一个 adapter-facing surface 的 auth boundary、exposure class、compatibility、audit、rate/cost 和 failure semantics 均稳定，才允许做最小 PoC。

## Prerequisites

| Gate | 进入条件 |
|---|---|
| exposure upgrade | local-only / local-export 已通过 U-145 checklist 升级 |
| auth boundary | actor、tenant、token scope、impersonation policy 明确 |
| transport | timeout、partial failure、retry、idempotency、status mapping 明确 |
| compatibility | provider capability 与 consumer requirement 有 deterministic match |
| audit | adapter_id、capability_id、policy_decision、receipt、correlation_id 可追溯 |
| rate / cost | quota scope、rate limit、budget posture、approval gate 明确 |
| fixtures | local-only blocked、remote-read allowed、remote-write blocked/allowed、adapter mismatch negative fixtures 准备好 |
| public wording | 文档明确 “not a general gateway or identity system” |

## Success Metrics

| 指标 | 通过标准 |
|---|---|
| no implicit exposure | local-only surface 不会被误升 remote |
| deterministic compatibility | adapter mismatch 能被静态识别 |
| failure semantics | timeout、partial failure、retry 后果可解释 |
| audit linkage | 每个 gateway candidate 都有 audit anchor 和 receipt boundary |

## Abort Criteria

| 条件 | 处理 |
|---|---|
| auth boundary 依赖真实 token 才能说明 | abort |
| remote-write 没有 receipt / rollback / idempotency | abort |
| cost/rate limit 无法表达 | abort |
| adapter compatibility 只能靠 runtime probing | abort |
| docs 会被理解成生产网关 | abort |

## 非目标

- 不实现 remote gateway。
- 不实现 auth runtime、network broker、rate limiter 或 billing runtime。
- 不执行远程读写。
- 不自动升级 exposure class。
