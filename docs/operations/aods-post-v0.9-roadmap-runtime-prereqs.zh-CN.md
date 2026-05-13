# AODS post-v0.9 roadmap and runtime/protocol prerequisites

日期：2026-05-13
范围：U-582 到 U-591
状态：已完成

## 结论

本轮完成 v0.9 发布后的公开 issue hygiene 和 runtime/protocol 静态前置设计。`#64` 正文已更新，明确 metadata-first capability 已完成，而 provider discovery、auth exchange、dynamic probing、fallback ranking 和 adapter runtime handshake 仍是后续 runtime/protocol 范围。

本轮不实现 runtime，不新增 schema，不创建 milestone，不关闭 `#60/#64`。

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 一致，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `ab97a5c Record v0.9 release closeout` |
| Tag / release | 通过 | `v0.9.0` tag 存在，GitHub Release 已 published |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工项 | 无 | 上轮成果合格，直接进入 U-582 到 U-591 |

## U-582 `#60` roadmap body refresh packet

`#60` body 仍保留 v0.6 时代的全量 unchecked checklist。建议下一次执行 body edit 时，在正文顶部插入 current-status 区块，而不是直接重写历史 dependency map。

建议插入内容：

```markdown
## Current status after v0.9.0

AODS v0.9.0 has shipped the metadata-first governance foundation for this roadmap:

- stable authority / exposure / redaction / contract / schema-version posture
- topology-aware implementation linkage and reality summaries
- structured term references and glossary-governed terminology checks
- evidence freshness, location diagnostics, and remediation metadata
- validation/routing observability metadata and route explanation fields
- metadata-first capability support, compatibility checks, unsupported reasons, fallback posture, degraded behavior, and consumer actions
- source-first examples, fixture smoke, and conformance inputs for current public examples

Current open follow-up:

- `#64` tracks runtime/protocol negotiation beyond metadata capability support.
- Post-v0.9 work should focus on public roadmap hygiene, runtime/protocol static records, non-execution invariants, release/adoption evidence, and targeted code-drift hardening.

This tracker remains open as the roadmap index. Closed historical child issues remain useful as shipped context, even if their checklist entries below are not individually checked in this body.
```

Decision: prepare packet only this round. Do not edit `#60` body until the owner accepts a body rewrite pass or the next task explicitly executes it.

## U-583 `#64` body refresh execution

Executed: `#64` body updated.

Current body now records:

- completed metadata-first baseline from `#41` and `v0.9.0`
- runtime/protocol scope
- entry criteria before implementation
- non-goals until separately authorized
- no provider call, auth runtime, dynamic probing, fallback executor, database connection, or production mutation

Verification: `gh issue view 64 --json body,labels,state,url` confirmed the new body.

## U-584 label / priority audit

| Issue | Current labels | Decision |
|---|---|---|
| `#60` | `enhancement`, `priority/p0`, `area/governance` | Keep. It is still the root roadmap tracker even though many child tasks have shipped. |
| `#64` | `enhancement`, `priority/p2`, `area/governance` | Keep. It is important but should not outrank static prerequisite and trust-boundary work. |

No label changes this round.

## U-585 milestone decision

GitHub milestones remain empty. Decision: keep no milestone for now.

Reason:

1. The active queue is file-backed and already ordered in the task ledger.
2. `#60` and `#64` are long-running trackers, not a bounded sprint.
3. Creating a milestone now would add a second planning authority without clearer release criteria.

## U-586 runtime/protocol static record shape plan

Recommended static record shape before any runtime implementation:

| Record | Required fields | Non-goal |
|---|---|---|
| provider discovery record | `provider_id`, `capability_id`, `advertised_contract_profile`, `schema_version_policy`, `transport_scope`, `discovery_source`, `freshness_posture`, `evidence_anchor` | no live provider lookup |
| auth boundary record | `auth_boundary_id`, `credential_class`, `secret_handling_posture`, `exchange_required`, `exchange_owner`, `redaction_floor`, `audit_anchor` | no auth exchange |
| probing posture record | `probe_id`, `target_capability_id`, `allowed_probe_kind`, `network_allowed`, `cost_ceiling`, `mutation_allowed`, `expected_static_evidence` | no dynamic probing |
| provider selection record | `selection_policy_id`, `candidate_provider_refs`, `required_evidence_refs`, `selection_basis`, `manual_review_required`, `tie_breaker_posture` | no automatic provider selection |
| fallback execution record | `fallback_policy_id`, `fallback_posture`, `eligible_fallback_refs`, `consumer_action`, `degraded_behavior`, `manual_escalation_ref` | no fallback executor |
| adapter handshake record | `handshake_id`, `adapter_id`, `capability_id`, `input_contract_ref`, `output_contract_ref`, `audit_receipt_ref`, `timeout_posture`, `retry_posture` | no adapter call |

First implementation candidate should be documentation/spec shape only, then fixture/schema feasibility, then validator non-execution gates.

## U-587 trust boundary matrix

| Boundary | Required static control | Runtime no-go |
|---|---|---|
| Credential | credential class, owner, secret redaction posture, exchange owner | no credentials read, exchanged, or tested |
| Cost | cost ceiling, budget owner, probe disabled by default | no paid API call or hosted probing |
| Network | transport scope and network_allowed flag | no network request during validate/fixture/conformance |
| Production mutation | mutation_allowed must default false unless separately authorized | no write, delete, migration, or state-changing operation |
| Provider identity | provider_id and evidence anchor required | no provider discovery by scanning live endpoints |
| Audit | audit receipt ref and actor/source/target metadata required | no runtime receipt emission yet |
| Fallback | fallback posture and consumer action required | no runtime ranking or execution |
| Data exposure | redaction floor and exposure class required | no remote payload exchange |

## U-588 adapter handshake metadata schema feasibility

Decision: schema-level metadata is feasible later, but not this round.

Recommended order:

1. Write a spec/operations static record proposal.
2. Add source-first example rows only after field names stabilize.
3. Add schema support only when at least one negative fixture proves useful.
4. Add validator checks for reference resolution and non-execution invariants.

Do not add adapter runtime, remote gateway, auth runtime, or dynamic probing.

## U-589 provider discovery non-execution invariant

Invariant:

`validate`, `fixture smoke`, and `conformance run` MUST NOT discover providers, call endpoints, exchange credentials, run probes, rank providers, execute fallbacks, or call adapters.

Allowed:

- parse static records
- resolve static refs
- compare declared metadata
- verify evidence anchors exist when local path reality is explicitly enabled
- report missing or inconsistent declarations

Forbidden:

- network I/O
- provider API calls
- auth exchange
- dynamic probing
- runtime fallback execution
- database connection
- production mutation

## U-590 fallback ranking deferral contract

Fallback metadata may declare:

- `fallback_posture`
- `degraded_behavior`
- `consumer_action`
- `manual_escalation_ref`
- `eligible_fallback_refs`

Fallback metadata must not imply:

- ordered runtime ranking
- automatic failover
- adapter execution
- provider call
- live cost/latency comparison

Future ranking work needs a separate static policy shape and explicit owner authorization before implementation.

## U-591 runtime/protocol negative fixture candidates

Candidate negative fixtures, in recommended order:

| Candidate | Expected rule | Purpose |
|---|---|---|
| provider discovery record with missing evidence anchor | `runtime-protocol-provider-evidence` | static provider claims need evidence |
| auth boundary record without credential class | `runtime-protocol-auth-boundary` | credential risk must be explicit |
| probing posture with network allowed but no cost ceiling | `runtime-protocol-probe-cost` | live probing must not be implicit |
| provider selection record with candidate provider ref missing | `runtime-protocol-provider-ref` | selection refs resolve statically |
| fallback policy with automatic ranking language but no policy id | `runtime-protocol-fallback-ranking` | prevent fallback overclaim |
| adapter handshake record without audit receipt ref | `runtime-protocol-handshake-audit` | adapter-facing runtime boundary needs audit anchor |
| any runtime protocol record that sets mutation allowed true without approval ref | `runtime-protocol-mutation-approval` | production mutation requires explicit approval |

Do not implement these fixtures until the static record shape is accepted.

## Verification

| Gate | Result |
|---|---|
| `#64` body edit | PASS |
| `#64` body view after edit | PASS |
| open issue label audit | PASS |
| milestones API | PASS, no milestones |
| `npm run release:hygiene` | PASS |

## Next route

Recommended next default tasks remain U-592 to U-601 if following the ledger order. The highest-value route is release/adoption evidence hardening first, then code drift validator hardening, because runtime/protocol static fixtures should wait until the record shape receives one more review pass.
