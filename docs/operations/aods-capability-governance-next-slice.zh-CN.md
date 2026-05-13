# AODS capability / governance next slice

状态：已完成
日期：2026-05-13

## 结论

本轮完成 U-291 到 U-300。`#41` 当前已有 provider capability、consumer requirement、metadata-only compatibility matrix，以及 `compatible` / `incompatible` deterministic gate。`partial` / `unknown` 结果词汇已经被 schema / validator 接受，但还没有形成足够清晰的 fallback / unsupported-feature handling guidance。

下一阶段仍然不做 adapter handshake、provider discovery、auth exchange、fallback execution、dynamic probing 或 remote execution。最高价值切片是把 capability 的“不可用、部分可用、未知、可降级”表达清楚，并让 `#60` tracker 不再像所有子任务都未完成。

## U-291 capability unsupported-feature audit

| Capability concept | Current support | Gap |
|---|---|---|
| provider capability metadata | covered | id/profile/version/exposure/freshness/redaction/evidence 可表达 |
| consumer requirement metadata | covered | accepted profile / required policy / blocking posture 可表达 |
| compatible | covered | deterministic validator gate |
| incompatible | covered | deterministic validator gate |
| partial | vocabulary accepted | validator does not explain partial semantics |
| unknown | vocabulary accepted | validator treats as allowed vocabulary, not a decision protocol |
| unsupported feature | partially expressible as incompatible | missing explicit unsupported reason and consumer action |
| fallback behavior | only indirectly expressible through dependency / known-gap vocabulary | no capability-specific fallback metadata |

## U-292 fallback semantics boundary

Recommended static metadata:

| Field | Meaning |
|---|---|
| `fallback_behavior` | `none`、`manual-review`、`degraded-read`、`local-only`、`alternate-capability`、`unsupported` |
| `fallback_ref` | optional ref to alternate capability, requirement, doc, or authority section |
| `degraded_posture` | what remains safe when requirement is not fully met |
| `unsupported_reason` | why provider cannot meet requirement |
| `consumer_action` | what a consumer should do next |
| `blocking` | whether the mismatch blocks stable consumption |

Non-goals: do not execute fallback, do not rank providers, do not call remote adapters, do not discover capabilities dynamically.

## U-293 capability protocol surface sketch

Future protocol should be a static surface first:

```json
{
  "protocol_id": "capability-negotiation-v1",
  "provider_surface": "module:artifact",
  "consumer_surface": "module:artifact",
  "exchange_mode": "declared-metadata",
  "input_refs": ["provider-capability", "consumer-requirement"],
  "result_vocabulary": ["compatible", "incompatible", "partial", "unknown"],
  "fallback_policy_ref": "capability-fallback-policy",
  "evidence_refs": ["fixture:capability-matrix"]
}
```

This is not a handshake. It is a declaration of what a future handshake would need to read and report.

## U-294 capability conformance fixture plan

Next fixture set:

| Fixture | Expected result |
|---|---|
| provider and requirement match exactly | `compatible` |
| profile mismatch | `incompatible` |
| exposure mismatch with alternate local-only fallback | `partial` |
| missing provider metadata | `unknown` |
| unsupported command family | `incompatible` with `unsupported_reason` |

The conformance runner should continue to read local fixtures only. No provider execution or remote fetch.

## U-295 capability matrix docs refresh

Adoption guidance should state:

- matrix rows are examples and deterministic checks, not provider selection.
- `expected_result=partial` needs `fallback_behavior` or `consumer_action` before stable consumption.
- `expected_result=unknown` should trigger human review or metadata completion.
- `incompatible` should be preferred over vague prose when the provider cannot satisfy a stable requirement.

## U-296 `#41` public status refresh

`#41` should remain open. Current AODS covers metadata and deterministic compatibility; it does not yet cover fallback / unsupported-feature guidance enough to close the issue.

## U-297 governance roadmap issue body audit

`#60` still contains an unchecked original dependency map. Most listed sub-issues are now closed by v0.8. Current mismatch:

| Group | Current public state |
|---|---|
| P0 foundation | completed / closed through v0.7-v0.8 work |
| P1 mechanics | mostly completed / closed; `#41` remains open |
| P2 workflow and engineering support | completed / closed through v0.8 issue set |
| P3 authoring/tooling quality | completed / closed except `#59` |

`#60` should remain open as umbrella only if it tracks the remaining anchors instead of the original unchecked list.

## U-298 governance roadmap next milestone split

Recommended milestones:

| Milestone | Scope | First tasks |
|---|---|---|
| S33 capability fallback and protocol surface | `#41` | U-291 to U-296, then implementation tasks if approved |
| S34 public tracker / traceability cleanup | `#60` | U-297 to U-301 |
| S35 release and adoption hygiene | release / package / skill drift | U-306 to U-314 |
| S36 conformance adoption docs | local conformance runner docs | U-315 to U-320 |
| S37 drift / terminology / docs follow-up | code drift and terminology drift | U-321 to U-330 |

## U-299 closed issue traceability table

Initial trace table:

| Issue set | Evidence |
|---|---|
| `#33/#35/#37/#38/#39` | stable-surface contract expansion, lifecycle / event / freshness / provenance docs and validator boundaries |
| `#43/#44/#45/#46/#47/#48/#49/#50/#51/#52` | remediation, risk, audit, exposure, known-gap, fixture, criteria, authority, dependency, migration boundaries |
| `#54/#55/#56/#57/#58` | authoring density, sync metrics, examples, glossary, citation / provenance work |
| `#13` | changelog 300 warning / 500 hard limit, closed after v0.8 |
| `#59` | route explanation covered; validator location and suggested-action remain |
| `#41` | metadata compatibility covered; fallback / unsupported / protocol surface remain |

## U-300 public tracker update plan

Use comment-only for now. Editing the `#60` body checklist could erase useful filing context. A safer next step is to post a concise status table after U-299 is expanded, then decide whether the body should be edited.
