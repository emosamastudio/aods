# AODS Risk Taxonomy Coverage Report

任务：U-146
状态：已完成
日期：2026-05-12
范围：standard risk taxonomy 的覆盖摘要；不实现 runtime policy engine

## 目标

复核当前风险分类是否足以支撑 agent 在读取、写入、凭据、文件系统、网络、外部发送、成本、生产变更和人工审批场景中做静态判断。本文只做覆盖报告，不把 risk label 变成运行时授权、扫描器或执行器。

## 结论

`spec-stable-surface-contracts:standard-risk-taxonomy` 已定义 9 类稳定风险族，字段覆盖足够作为当前 metadata contract。compiled-pilot 已展示 read/write、credential、network、production mutation、human approval 等高价值路径；filesystem、external-send、cost 目前主要停留在 spec vocabulary 和未来 surface 的准入字段，尚未作为独立 canonical example 展示。

当前结论：风险分类覆盖合格，可继续作为静态消费面；不进入 runtime policy engine、dynamic scanner、secret manager、network broker、cost accounting runtime 或 approval workflow。

## Coverage Matrix

| 风险族 | 稳定字段 | 当前覆盖 | 缺口 / 边界 |
|---|---|---|---|
| `read_risk` | risk_level、sensitive_payload、staleness、local_only_data、authority_confusion、consumer_floor | read-model、resource surface、local-only exposure 文档已有覆盖 | 不自动判断内容是否真实敏感；只消费已声明 posture |
| `write_risk` | risk_level、mutation_scope、side_effects、idempotency_posture、rollback_posture、gate | command surface、resource write posture、production mutation 相关 guidance 已覆盖 | 不执行 write、不检查真实副作用 |
| `credential_risk` | credential_kind、exposure_posture、handle_only、redaction_posture、rotation_or_revocation_guidance | credential placeholder policy、resource / adapter credential boundary 已覆盖 | 不接入 secret manager；不验证真实凭据 |
| `filesystem_risk` | path_scope、access_mode、generated_output、persistent_artifact、destructive_posture | fixture / golden export hygiene 和 package inventory 形成间接覆盖 | 缺少独立 filesystem risk canonical example；当前不做 sandbox |
| `network_risk` | endpoint_scope、direction、public_exposure、egress_posture、remote_write | remote exposure checklist、adapter-facing example 已覆盖 | 不建 network broker，不自动发起 remote call |
| `external_send_risk` | channel、audience、public_visibility、irreversible_posture、approval_gate | GitHub / release public sync 审批矩阵间接覆盖 | 缺少独立 external-send surface example；公开写动作仍需回合授权 |
| `cost_risk` | cost_unit、quota_scope、rate_limit、budget_posture、approval_gate | remote gateway / adapter triage 已把 rate/cost 作为 gate | 不建成本计量 runtime；不估算真实账单 |
| `production_mutation_risk` | environment、mutation_kind、blast_radius、rollback_posture、release_gate | command、release readiness、migration triage 已覆盖 | 不执行生产变更；只保留 release gate / receipt 语义 |
| `human_approval` | approval_required、approval_reason、gate_level、approver_role、exception_posture | policy engine triage、credential policy、remote exposure checklist 已覆盖 | 不建 approval workflow；审批仍是声明和证据边界 |

## Example Coverage

| 示例面 | 覆盖点 | 说明 |
|---|---|---|
| `shift-ops-readiness-read-model` | read risk / freshness | 展示 snapshot freshness、source watermark 和 consumer guidance |
| `shift-ops-change-command` | write risk / policy / receipt | 展示 command precondition、policy_context、receipt 和 audit linkage |
| `shift-ops-adapter-capability` | network / credential / adapter risk | 展示 adapter-facing exposure、auth boundary、redaction floor 和 audit anchor |
| `shift-ops-resource-surface` | read/write/credential/exposure/approval | 展示 resource risk posture 和 local/remote exposure boundary |
| operations release docs | external-send / production mutation | 用审批矩阵和 no-release/no-merge 规则约束公开副作用 |

## 质量判断

| 检查项 | 结论 |
|---|---|
| risk families 是否完整 | 当前 9 类覆盖 stable contract 所需最小面 |
| examples 是否足够 | 高风险读写、凭据、网络、生产变更、审批已有示例或 docs gate；filesystem / external-send / cost 仍是后续示例候选 |
| validator 是否需要立刻扩展 | 不需要；当前任务是 coverage report，不改变 schema / validator |
| runtime 是否可以启动 | 不可以；risk taxonomy 仍是静态 metadata，不是 runtime policy |

## 非目标

- 不实现 runtime policy engine。
- 不实现 dynamic risk scanner。
- 不实现 secret manager、sandbox、network broker 或 cost accounting runtime。
- 不把 risk label 当成实际授权结果。
- 不新增 schema、validator 或 example pack。
