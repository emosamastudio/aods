# AODS Event Store Minimal PoC Decision Gate

任务：U-152
状态：已完成
日期：2026-05-12
范围：event store / replay PoC 的 prerequisites、data model、risk、abort criteria；不实现 PoC

## Decision

当前结论：No-go for implementation。event store / replay 只能先证明 event identity、ordering、retention、correction 和 replay scope 的静态契约稳定；本轮不实现存储或回放。

## Minimal Data Model Candidate

| 字段 | 说明 |
|---|---|
| event_id | stable event identifier |
| event_type | append-only event kind |
| subject_ref | target authority / object ref |
| sequence_or_time | ordering hint；不得假装全局时钟可靠 |
| emitted_by | source surface / actor |
| correction_of | optional correction target |
| supersedes | optional supersession target |
| retraction | optional retraction posture |
| projection_guidance | read-model projection expectation |
| evidence_ref | fixture / citation / implementation evidence |

## Prerequisites

| Gate | 进入条件 |
|---|---|
| identity | event_id、subject_ref、event_type 唯一性规则明确 |
| ordering | 局部顺序、冲突顺序和 out-of-order 行为明确 |
| retention | event 保留、删除、脱敏和 retraction 语义明确 |
| replay scope | replay 只能针对一个 bounded projection，不是全局历史系统 |
| correction fixtures | duplicate、out-of-order、missing target、invalid correction negative fixtures 准备好 |
| public wording | 文档明确 “not a durable event platform” |

## Success Metrics

| 指标 | 通过标准 |
|---|---|
| correction projection | correction / supersession / retraction 对 projection 的影响可解释 |
| deterministic failures | duplicate / missing target / invalid correction 能被稳定报告 |
| no durable store | PoC 不引入数据库或长期存储 |
| fixture-first | PoC 以 fixtures 和 golden projection 为边界 |

## Abort Criteria

| 条件 | 处理 |
|---|---|
| 需要真实数据库、队列或 event bus 才能证明价值 | abort |
| ordering 依赖全局时钟或远程系统一致性 | abort |
| correction 语义无法被 fixtures 表达 | abort |
| replay 输出会被误解为生产事实源 | abort |

## 非目标

- 不实现 event store。
- 不实现 replay engine、event bus、projection service 或 database schema。
- 不承诺全局顺序、持久化、 exactly-once 或生产一致性。
