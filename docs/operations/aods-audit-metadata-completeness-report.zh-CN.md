# AODS Audit Metadata Completeness Report

任务：U-147
状态：已完成
日期：2026-05-12
范围：commands / adapters 的 audit metadata 完整性摘要；不建立 audit store

## 目标

复核当前命令和适配器审计字段是否能让 agent 清楚回答“谁、从哪里、对什么、发起了什么、基于哪个策略、产生哪个回执、如何串联追踪”。本文只审查 metadata completeness，不实现审计存储、检索或运行时采集。

## 结论

`spec-stable-surface-contracts:command-adapter-audit-log-requirements` 已覆盖 commands / adapters 的最小审计字段：actor、source、target、command_reference、idempotency_key、policy_decision、receipt_reference、timestamp、correlation_identifier。compiled-pilot 的 command receipt 和 adapter exposure/audit 示例已覆盖高价值路径。

当前 completeness 合格；缺口集中在“真实 audit store、远程调用采集、跨系统 trace backend、时间同步证明”，这些均不是当前静态规范层目标。

## Audit Field Matrix

| 字段族 | 最小字段 | 当前覆盖 | 剩余边界 |
|---|---|---|---|
| audit_actor | actor_id、role、kind、delegated_by | command/requested_by 和 adapter actor notes 可表达 | 不验证真实身份，不做 impersonation runtime |
| audit_source | source_surface、command_profile、adapter_id、capability_id、route_or_workflow_ref | command、adapter capability、route docs 均有入口 | 不保存真实 route execution trace |
| audit_target | target_ref、target_kind、environment、resource_scope、production_boundary | command target_release、resource scope、release gate 已覆盖 | 不确认目标资源真实存在 |
| command_reference | command_ref、payload_schema、schema_version、side_effect_class、retry_posture | command field table 和 receipt table 已覆盖 | 不执行 payload schema runtime validation beyond corpus validation |
| idempotency_key | key、scope、retry posture | command envelope 明确 `idempotency_key` | 不提供 idempotency store |
| policy_decision | decision、reason、gate、risk labels | command receipt、adapter exposure audit、policy triage 已覆盖 | 不等同 approval receipt 或 permission grant |
| receipt_reference | receipt_id / audit_ref / status | command receipt table 已覆盖 | 不证明命令已执行，只证明 validation outcome |
| timestamp | requested_at、emitted_at、timestamp | command 和 adapter docs 有 vocabulary | 不提供 clock sync、ordering backend 或 signed timestamp |
| correlation_identifier | correlation_id | command receipt 和 adapter audit notes 已覆盖 | 不建 trace store |

## Command / Adapter Coverage

| 面 | 已覆盖 | 未覆盖 |
|---|---|---|
| command surface | command_id、requested_by、idempotency_key、policy_context、receipt status、policy_decision、audit_ref、correlation_id | executor trace、runtime retry log、durable audit log |
| adapter-facing surface | exposure_class、auth_boundary、adapter_id、capability_id、policy_decision、timestamp、correlation_id | gateway request log、remote transport trace、provider-side receipt |
| resource surface | resource identity、scope、risk、exposure、approval boundary | live resource inventory audit |

## Completion Gate

| Gate | 结论 |
|---|---|
| actor/source/target 是否可表达 | 通过 |
| command/adapter reference 是否可表达 | 通过 |
| policy decision 与 receipt 是否有锚点 | 通过 |
| timestamp/correlation 是否可串联 | 通过 |
| 是否已具备 audit store 实现条件 | 未通过；当前不需要也不应实现 |

## 非目标

- 不建立 audit store。
- 不实现 workflow engine、SIEM integration、trace backend 或 remote gateway log collector。
- 不签名、不加密、不长期保存审计事件。
- 不把 receipt 当成真实执行完成证明。
