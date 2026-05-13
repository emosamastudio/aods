# AODS Runtime Protocol Static Records

日期：2026-05-13
回合：R-2026-05-13-47
范围：U-642 到 U-651

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `23d4922 Add adoption troubleshooting and CLI version` |
| 台账指针 | 通过 | 当前默认任务为 U-642 到 U-651 |
| 返工需要 | 无 | 上轮 adoption ergonomics hardening 成果可继续承接 |

## 北极星

AODS 继续保持 metadata-first / static-record-first。运行时协议能力必须先有静态权威记录、风险边界和非执行验证，再进入 schema、validator、fixture 或 runtime 实现。

本轮不实现 provider discovery、auth exchange、dynamic probing、provider selection、fallback ranking、fallback executor、adapter call、remote gateway、database connection 或 production mutation。

## U-642 provider discovery static record proposal

Provider discovery 只记录声明来源，不做 live discovery。

| 字段 | 要求 | 说明 |
|---|---|---|
| `provider_discovery_id` | 必填 | 静态记录身份 |
| `provider_id` | 必填 | 被声明的 provider 身份，不从网络发现 |
| `capability_id` | 必填 | provider 声称支持的 capability |
| `discovery_source` | 必填 | `declared`, `release-note`, `manual-review`, `fixture`, `external-citation` |
| `transport_scope` | 必填 | `none`, `local`, `remote-read`, `remote-write`, `adapter-facing` |
| `schema_version_policy` | 必填 | 与既有 capability compatibility metadata 对齐 |
| `freshness_posture` | 必填 | `current`, `stale`, `partial`, `unknown` |
| `evidence_refs` | 必填 | 静态证据引用；不得替代 runtime lookup |
| `network_allowed` | 必填，默认 `false` | 即使为 `true`，validate / fixture / conformance 仍不得发起网络请求 |

负例候选：缺 `evidence_refs` 或把 `discovery_source` 写成 live endpoint lookup。

## U-643 auth boundary static record proposal

Auth boundary 只描述凭据和交换边界，不读取、不交换、不测试凭据。

| 字段 | 要求 | 说明 |
|---|---|---|
| `auth_boundary_id` | 必填 | 静态记录身份 |
| `credential_class` | 必填 | `none`, `token`, `oauth`, `api-key`, `service-account`, `session`, `handle-only`, `other` |
| `secret_handling_posture` | 必填 | `none`, `omit`, `redact`, `handle-only`, `debug-only` |
| `exchange_required` | 必填 | 布尔声明，不触发交换 |
| `exchange_owner` | 条件必填 | `exchange_required=true` 时必须声明 owner |
| `redaction_floor` | 必填 | 远端或 adapter-facing 消费的最低脱敏要求 |
| `audit_anchor` | 必填 | 静态审计锚点或未来 receipt ref |
| `credential_material_allowed` | 必填，默认 `false` | 稳定 surface 中不得放真实 secret |

负例候选：声明需要凭据但缺 `credential_class` / `secret_handling_posture` / `exchange_owner`。

## U-644 probing posture no-network fixture design

Probing posture 只记录是否允许未来探测以及探测成本/风险上限；当前验证不得执行探测。

| 字段 | 要求 | 说明 |
|---|---|---|
| `probe_posture_id` | 必填 | 静态记录身份 |
| `target_capability_id` | 必填 | 探测目标 capability |
| `allowed_probe_kind` | 必填 | `none`, `static-evidence`, `dry-run-report`, `manual-review`, `network-read`, `mutation` |
| `network_allowed` | 必填，默认 `false` | 验证命令仍不得联网 |
| `cost_ceiling` | 条件必填 | `network_allowed=true` 或 `allowed_probe_kind=network-read` 时必须声明 |
| `mutation_allowed` | 必填，默认 `false` | `true` 需要 approval ref，且本轮仍不执行 |
| `expected_static_evidence` | 必填 | 说明应检查的静态证据 |
| `approval_ref` | 条件必填 | mutation 或付费探测必须声明 |

第一负例应是 `network_allowed=true` 但缺 `cost_ceiling`，因为它能防止“看似只是检查，实际可能花钱或联网”的漂移。

## U-645 provider selection no-auto-select design

Provider selection 只记录人工或静态选择依据，不自动选择 provider。

| 字段 | 要求 | 说明 |
|---|---|---|
| `selection_policy_id` | 必填 | 静态策略身份 |
| `candidate_provider_refs` | 必填 | 候选 provider refs，必须静态可解析 |
| `required_capability_refs` | 必填 | 需求 capability refs |
| `selection_basis` | 必填 | `manual-review`, `declared-compatibility`, `evidence-match`, `policy-gate`, `unknown` |
| `auto_select_allowed` | 必填，必须为 `false` | 当前不允许自动选择 |
| `tie_breaker_posture` | 必填 | `manual-review`, `not-applicable`, `unknown` |
| `required_evidence_refs` | 必填 | 选择依据的证据 |
| `consumer_action` | 必填 | 消费者遇到缺失或冲突时的动作 |

负例候选：`auto_select_allowed=true` 或候选 provider ref 不存在。

## U-646 fallback policy no-ranking fixture design

Fallback policy 只记录降级姿态和消费者动作，不做 runtime ranking 或自动 failover。

| 字段 | 要求 | 说明 |
|---|---|---|
| `fallback_policy_id` | 必填 | 静态策略身份 |
| `fallback_posture` | 必填 | `none`, `manual-review`, `degraded-mode`, `blocked`, `unsupported` |
| `eligible_fallback_refs` | 条件必填 | 有 fallback 时必须声明静态候选 |
| `ranking_allowed` | 必填，必须为 `false` | 当前不允许 runtime ranking |
| `degraded_behavior` | 条件必填 | 降级可用时必须说明行为 |
| `consumer_action` | 必填 | `use-primary`, `manual-review`, `use-degraded`, `block`, `escalate` |
| `manual_escalation_ref` | 条件必填 | 需要人工处理时必须有 ref |

负例候选：出现 automatic ranking / failover 语义，但没有独立授权的 policy shape。

## U-647 adapter handshake static metadata proposal

Adapter handshake 只记录输入输出和审计锚点，不调用 adapter。

| 字段 | 要求 | 说明 |
|---|---|---|
| `handshake_id` | 必填 | 静态记录身份 |
| `adapter_id` | 必填 | adapter 身份 |
| `capability_id` | 必填 | 关联 capability |
| `input_contract_ref` | 必填 | 输入契约 ref |
| `output_contract_ref` | 必填 | 输出契约 ref |
| `auth_boundary_ref` | 条件必填 | adapter-facing 或 remote 时必须声明 |
| `audit_receipt_ref` | 必填 | 静态 receipt / future receipt anchor |
| `timeout_posture` | 必填 | `not-applicable`, `declared`, `unknown` |
| `retry_posture` | 必填 | `none`, `declared`, `manual-review`, `unknown` |
| `call_allowed` | 必填，必须为 `false` | 当前验证不得调用 adapter |

负例候选：adapter-facing handshake 缺 `audit_receipt_ref` 或 `auth_boundary_ref`。

## U-648 `#64` status comment decision

Decision：给 `#64` 追加一条短状态评论，但评论必须只说明静态前置记录已经整理，不声明 runtime/protocol 已实现。

Executed：`https://github.com/emosamastudio/aods/issues/64#issuecomment-4440776438`

评论内容：

```markdown
Static prerequisite pass completed locally:

- provider discovery, auth boundary, probing posture, provider selection, fallback policy, and adapter handshake now have a proposed static-record shape.
- negative fixture candidates are sorted around evidence, credential, cost/network, provider refs, fallback overclaim, and handshake audit anchors.
- package examples should not include these records yet.
- schema/validator work should wait until one source-first example candidate is selected.

Still non-goals: no provider calls, no auth exchange, no dynamic probing, no automatic provider selection, no fallback executor, no adapter execution, no database connection, and no production mutation.
```

## U-649 runtime protocol negative fixture candidate sort

| 排序 | 候选 | 规则候选 | 价值 | 风险 |
|---:|---|---|---|---|
| 1 | provider discovery 缺 evidence refs | `runtime-protocol-provider-evidence` | 防止无证据 provider 声明 | 低 |
| 2 | auth boundary 缺 credential class / secret posture | `runtime-protocol-auth-boundary` | 防止凭据风险被省略 | 低 |
| 3 | probing posture 允许 network 但缺 cost ceiling | `runtime-protocol-probe-cost` | 防止隐性联网 / 付费探测 | 低 |
| 4 | provider selection ref 不可解析 | `runtime-protocol-provider-ref` | 保持静态引用完整 | 中 |
| 5 | fallback policy 暗示 automatic ranking | `runtime-protocol-fallback-ranking` | 防止 fallback overclaim | 中 |
| 6 | adapter handshake 缺 audit receipt / auth boundary | `runtime-protocol-handshake-audit` | adapter-facing 前置审计完整性 | 中 |
| 7 | mutation allowed true 缺 approval ref | `runtime-protocol-mutation-approval` | 防止生产变更被静态记录绕过 | 高，推后 |

推荐第一实现切片：1 到 3。它们都是静态字段完整性，不依赖 adapter runtime、policy engine 或 provider execution。

## U-650 static protocol package boundary decision

Decision：本轮不把 runtime/protocol static records 放进 package examples 或 conformance。

理由：

1. 字段形状刚形成 proposal，还不是稳定 package surface；
2. 一旦进入 package example，外部采用者可能误解为 runtime negotiation 已可用；
3. 现有 compiled-pilot 已有 capability metadata / fallback metadata / adapter mismatch 静态覆盖；
4. 最小下一步应先选一个 source-first example candidate，再做 focused regression，不直接进入 conformance。

## U-651 runtime protocol schema gate decision

Decision：暂不进入 schema / validator implementation。进入条件如下：

| Gate | 进入标准 |
|---|---|
| shape stability | 本文六类记录字段至少经过一轮 source-first example candidate review |
| non-execution invariant | 明确 validate / fixture / conformance 不执行 network/auth/probe/adapter/fallback |
| first negative fixture | 先选 provider evidence、auth boundary 或 probe cost 中的一个最小负例 |
| package boundary | 明确不进入 package examples，直到 focused regression 稳定 |
| public wording | `#64` 仍表达 deferred runtime/protocol，不暗示已实现 |

推荐下一实现候选：provider discovery missing evidence refs。它最贴近现有 evidence / capability metadata，不需要新增运行时概念。

## 验收结论

U-642 到 U-651 的验收全部以静态设计 / 决策完成。本轮没有 runtime、schema、validator、fixture、conformance 或 package surface 变更。
