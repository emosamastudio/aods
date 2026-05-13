# AODS runtime fixture implementation candidates

日期：2026-05-13
范围：U-502 到 U-511
状态：已完成；未实现 fixtures / runtime

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `d95e10d Design runtime prerequisite fixtures` |
| Task ledger | 通过 | 当前默认任务为 U-502 到 U-511 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## Candidate bar

本轮只判断 implementation candidate，不写 schema、validator、fixture、conformance case 或 runtime。

| Gate | Required before implementation |
|---|---|
| deterministic input | fixture can be checked from checked-in JSON / corpus metadata only |
| stable rule id | failure can name a deterministic rule without prose judgement |
| no execution | fixture does not execute command, transition, remote call, migration, or approval |
| bounded scope | fixture proves a narrow no-runtime boundary |
| local first | focused regression before package conformance |

## U-502 workflow fixture implementation candidate

Verdict: not first candidate.

| Candidate | Decision | Reason |
|---|---|---|
| invalid transition / alias lifecycle | defer | `term_refs[]` already catches canonical term misuse, but workflow transition shape is not yet a stable structured surface |
| missing receipt / audit anchor | defer | needs a minimal static transition record before a rule can be honest |
| dependency conflict | defer | too close to scheduler semantics without a declared workflow object shape |

Next safe step: define a static workflow transition record shape in a future design task before writing tests.

## U-503 event fixture implementation candidate

Verdict: good candidate after one narrow shape decision.

| Candidate | Decision | Reason |
|---|---|---|
| correction missing target | ready candidate | static graph check; no store or replay required |
| supersession cycle | ready candidate | static graph cycle check; deterministic |
| out-of-order without posture | defer | needs stable sequence semantics first |
| global clock claim | defer | likely prose-heavy unless a structured ordering posture exists |

Recommended next implementation: add focused regression around synthetic event correction metadata and rule ids `event-correction-target` / `event-supersession-cycle`. Keep it out of conformance until the metadata shape is packaged.

## U-504 policy fixture implementation candidate

Verdict: defer.

| Candidate | Decision | Reason |
|---|---|---|
| missing actor / target | defer | policy decision input shape is not yet a stable structured record |
| stale evidence | defer | should reuse evidence freshness after a policy evidence ref shape exists |
| missing approval receipt / audit anchor | defer | high risk of implying a real approval workflow |
| ambiguous decision | defer | needs a controlled decision enum first |

Next safe step: define a static policy decision sample shape before implementing focused regressions.

## U-505 remote fixture implementation candidate

Verdict: good candidate.

| Candidate | Decision | Reason |
|---|---|---|
| provider mismatch | ready candidate | builds on existing capability compatibility matrix and validator behavior |
| local-only remote read | possible after exposure field mapping | static exposure class check, but needs exact source field selection |
| remote write without receipt | defer | needs command/receipt linkage shape for remote-write |
| runtime probing required | defer | needs explicit `requires_runtime_probe`-style metadata before testing |

Recommended next implementation: extend existing capability matrix regressions with an adapter mismatch row rather than creating a gateway fixture.

## U-506 migration fixture implementation candidate

Verdict: candidate for benchmark-only static report validation, not validator yet.

| Candidate | Decision | Reason |
|---|---|---|
| missing source authority | ready as benchmark fixture | dry-run report can be static JSON |
| missing mapping | ready as benchmark fixture | deterministic report-shape check |
| destructive without approval | ready as benchmark fixture | static risk / approval field check |
| missing rollback posture | ready as benchmark fixture | deterministic report-shape check |
| executed disguised as dry-run | ready as benchmark fixture | static status field check |

Recommended next implementation: add a small benchmark helper for migration dry-run report fixtures. Do not add an `aods migrate` command.

## U-507 runtime fixture conformance grouping

Verdict: keep out of conformance for now.

| Group | Conformance status |
|---|---|
| Event correction graph | focused regression first |
| Remote adapter mismatch | focused regression first; conformance only after packaged example includes the metadata |
| Migration dry-run report | benchmark-only first; conformance only if the report shape becomes package surface |
| Policy decision | not ready |
| Workflow transition | not ready |

Conformance suite should remain limited to package-consumable behavior. Runtime prerequisite fixtures are still design / focused-regression candidates, not adoption surface.

## U-508 task ledger window automation reconsideration

Decision: do not automate yet.

| Check | Result |
|---|---|
| unfinished row count | 30 |
| recent completed row count | 30 |
| current next pointer | U-502 to U-511 before this round; U-512 to U-521 after this round |
| count drift | none |

Automation trigger remains: repeated count drift, recent window drift, or stale next pointer in two consecutive rounds.

## U-509 operations index stale link audit

Decision: index is current after adding this record.

| Surface | Result |
|---|---|
| `docs/operations/README.md` current topic table | updated |
| `docs/README.md` directory table | updated |
| docs link check | final gate |
| archive links | unchanged |

The current topic table is getting longer, but still works as the short operational entry. Revisit pruning/generation in U-530 rather than adding a generator here.

## U-510 handoff compaction refresh

Decision: refresh handoff but keep it compact.

Handoff should say:

- U-027 to U-511 complete.
- U-512 to U-531 remain.
- next default round is U-512 to U-521.
- implementation candidates are event correction graph, remote adapter mismatch, and migration dry-run static report.

## U-511 installed skill update decision

Decision: do not overwrite installed skill this round.

| Surface | Current state |
|---|---|
| repo packaged skill | release-aligned, includes version alignment, fixture/conformance command guidance, and `aods --help` discovery |
| local installed `/Users/emosama/.agents/skills/aods-use/SKILL.md` | older, still usable for this repo because it covers compile / validate / route / upgrade basics |
| action | no local install mutation in this round |

Reason: this repository should not silently mutate the user-level installed skill while doing repository maintenance. If the owner wants the active installed skill refreshed, do it as an explicit local skill sync action and keep it out of the repository commit.

## Recommended next work

| Priority | Next action |
|---:|---|
| 1 | Implement remote adapter mismatch focused regression by extending existing capability matrix tests |
| 2 | Implement event correction target / supersession cycle focused regression after choosing the smallest static metadata shape |
| 3 | Implement migration dry-run static report fixture as benchmark-only helper |
| 4 | Keep workflow and policy fixtures in design until their static record shapes are explicit |

## 本轮结论

- Three candidate families are implementation-ready enough for the next coding slice: remote adapter mismatch, event correction graph, and migration dry-run static report.
- Workflow and policy fixtures remain design-only until their static record shapes are defined.
- Runtime prerequisite fixtures should not enter conformance yet.
- Task ledger automation, operations index generation, and installed skill mutation remain deferred.
