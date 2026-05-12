# AODS Runtime Readiness Gate Matrix

状态：U-085 已完成
日期：2026-05-12
范围：workflow runtime、event store、policy engine、remote gateway、migration tool 的进入门禁；不实现 runtime

## 结论

五类 runtime 候选当前都不应直接进入实现。AODS 已有稳定的 metadata-only 边界，但 runtime 实现还缺少统一的 authority、evidence、risk、fixture 和 public sync gate。

本轮结论是：先保留 metadata-only 语义，把 runtime 候选拆成 entry contract triage。只有对应 entry contract 明确对象身份、输入输出、失败语义、审计证据、fixture 覆盖和公开承诺后，才允许进入 PoC decision gate。

## Readiness Gate

| Runtime 候选 | Authority gate | Evidence gate | Risk / audit gate | Fixture / conformance gate | Public sync / release gate | 当前判断 |
|---|---|---|---|---|---|---|
| Workflow runtime | lifecycle state、transition、dependency、command boundary 已是权威输入 | 需要 current implementation evidence、state transition proof、receipt linkage | 需要 actor/source/target、policy decision、retry/cancel/cleanup audit | 需要正向/负向 lifecycle fixture 和 replayable transition case | README / PR / issue 必须声明只进入 PoC，不承诺通用 workflow engine | 未准备好实现；先完成 U-086 |
| Event store / replay | append-only event、correction、supersession、projection guidance 已是权威输入 | 需要 ordering key、retention、replay scope、projection evidence | 需要 correction/retraction audit、idempotency posture、consumer warning | 需要 event/correction/replay fixture 和 golden projection case | public docs 必须避免承诺 exactly-once 或 durable bus | 未准备好实现；先完成 U-087 |
| Policy engine / approval runtime | risk taxonomy、human approval、audit-log metadata 已是权威输入 | 需要 deterministic policy input/output evidence 和 decision receipt | 需要 denial/review/escalation audit、override boundary | 需要 allow/deny/review/escalate fixture | public docs 必须避免承诺 permission broker 或审批流 | 未准备好实现；先完成 U-088 |
| Remote gateway / adapter runtime | exposure class、capability compatibility、audit boundary 已是权威输入 | 需要 auth/identity、transport failure、compatibility evidence | 需要 network/cost/credential risk、rate-limit 和 remote write audit | 需要 local-only 到 remote-* upgrade fixture | public docs 必须避免承诺 remote API gateway | 未准备好实现；先完成 U-089 |
| Migration tool | deprecation/migration vocabulary、authority hierarchy、dependency ordering 已是权威输入 | 需要 source/target mapping、dry-run report、rollback evidence | 需要 destructive change approval、irreversible-step audit | 需要 mapping fixture、negative destructive case、golden dry-run report | public docs 必须避免承诺 automatic migration | 未准备好实现；先完成 U-090 |

## Cross-Cutting Gates

| Gate | 必须满足 | 不足时处理 |
|---|---|---|
| Authority identity | Runtime 操作对象必须能解析到 checked-in authority surface，而不是只靠自然语言描述 | 退回 entry contract triage |
| Stable input/output | 输入、输出、receipt、error、audit anchor 必须先以 metadata 表达 | 退回 schema / docs / example 规划，不写 executor |
| Evidence linkage | current implementation evidence、acceptance criteria 和 reality locator 必须可审查 | 退回 drift / evidence hardening |
| Safety posture | risk、exposure、redaction、approval、audit 必须有默认失败姿态 | 退回 risk / audit boundary |
| Fixture coverage | 至少有 positive、negative、edge case 和 golden / report fixture 路线 | 退回 fixture coverage 任务 |
| Public wording | README、PR、issue、release notes 必须明确 runtime non-goals | 退回 public sync / release docs |

## 允许推进的下一步

| 任务 | 允许做 | 禁止做 |
|---|---|---|
| U-086 | workflow runtime entry contract triage | workflow engine、scheduler、executor |
| U-087 | event store / replay entry contract triage | event store、bus、exactly-once runtime |
| U-088 | policy engine / approval runtime triage | permission broker、approval workflow |
| U-089 | remote gateway / adapter runtime triage | remote API gateway、auth runtime |
| U-090 | migration tool entry contract triage | automatic migration executor |

## 验收记录

- 已把五类 runtime 候选统一映射到 authority、evidence、risk、fixture 和 public sync gate。
- 已明确本轮不实现 runtime，也不创建 runtime PoC。
- 已为 U-086 到 U-090 提供进入条件。
