# AODS Adapter Negotiation Protocol Plan

任务：U-157
状态：已完成
日期：2026-05-12
范围：adapter negotiation protocol 的 metadata prerequisites、protocol sketch 和 non-goals；不实现 negotiation

## 目标

把 full adapter negotiation handshake 拆成可审查的前置条件和协议草图，避免把当前 capability compatibility matrix 误读成真实协商协议。当前只做计划，不实现 negotiation session、provider discovery、auth exchange 或 dynamic probing。

## 当前基线

| 面 | 已有能力 | 边界 |
|---|---|---|
| provider capability | capability_id、contract_profile、schema_version_policy、transport_scope、freshness_posture、redaction_posture、limits、evidence_anchor | 只是声明，不发现 provider |
| consumer requirement | required capability、accepted profile、schema policy、transport need、freshness、redaction floor、blocking posture | 只是需求，不自动绑定 |
| compatibility matrix | deterministic compatible / incompatible 检查 | 不建立 session，不探测远端 |
| remote gateway gate | auth、transport、rate/cost、failure semantics prerequisites 已定义 | 仍是 no-go for implementation |

## Metadata Prerequisites

| Gate | Required fields |
|---|---|
| identity | provider_id、consumer_id、adapter_id、capability_id |
| contract | contract_profile、schema_version_policy、version range、compatibility posture |
| transport | local / hosted / hybrid、timeout、retry、idempotency、failure status mapping |
| trust | authority_ref、evidence_ref、redaction floor、auth boundary |
| limits | rate limit、cost unit、quota scope、payload boundary |
| audit | negotiation_id、decision、receipt_ref、correlation_id |

## Protocol Sketch

| Step | Input | Output | Failure posture |
|---|---|---|---|
| 1. advertise | provider capability metadata | provider capability set | missing authority -> unknown |
| 2. request | consumer requirement metadata | normalized requirement | unsupported profile -> incompatible |
| 3. match | provider + consumer metadata | compatible / incompatible / partial / unknown | ambiguous mapping -> manual review |
| 4. decide | match + policy + risk labels | policy decision | missing trust boundary -> blocked |
| 5. receipt | decision + audit anchor | negotiation receipt | no receipt -> not stable |

## Success Metrics

| 指标 | 通过标准 |
|---|---|
| deterministic metadata match | identical input gives same match result |
| explainable incompatibility | mismatch lists profile / version / exposure / transport cause |
| no probing | protocol sketch does not call provider behavior |
| audit linkage | every decision has receipt and correlation id |

## Abort Criteria

| 条件 | 处理 |
|---|---|
| 需要 provider runtime probing 才能判断 | abort |
| auth boundary 需要真实 token 才能说明 | abort |
| fallback ranking 依赖 runtime performance | abort |
| compatibility matrix 无法表达 mismatch reason | abort |

## Decision

当前建议：不实现 negotiation。下一步若推进，应先扩 metadata report 和 negative fixtures，确认 matrix 能表达 partial / unknown，再考虑 dry-run protocol。

## 非目标

- 不实现 negotiation session。
- 不实现 provider discovery、auth exchange、remote probing、fallback ranking 或 provider selection。
- 不执行 adapter。
- 不把 compatibility matrix 当成 runtime binding。
