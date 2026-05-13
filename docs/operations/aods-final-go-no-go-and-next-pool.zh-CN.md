# AODS final go/no-go and next pool

日期：2026-05-13
范围：U-522 到 U-531
状态：已完成；v0.9 release 仍 no-go

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `f654a51 Refresh release hygiene adoption docs` |
| Task ledger | 通过 | 当前默认任务为 U-522 到 U-531 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## U-522 benchmark summary source no-churn check

Check performed:

```bash
npm run benchmark:summary
```

Result: generator rerun produced generated-result/report timestamp and assessed-version churn, but no benchmark source change was required by this docs-only round.

Observed churn:

| File family | Churn type | Decision |
|---|---|---|
| `benchmarks/aods-eval-lab/generated/results/*summary-results.json` | `generated_at` / previous-run pointer / assessed version | revert |
| `benchmarks/aods-eval-lab/reports/*summary-report.md` | generated timestamp / previous evaluation / assessed version | revert |
| `benchmarks/aods-eval-lab/src/summary.mjs` | no required source edit | keep unchanged |

Decision: do not update `summary.mjs` and do not commit generated churn. Durable benchmark wording still must come from `benchmarks/aods-eval-lab/src/summary.mjs`, but this round did not change benchmark semantics.

## U-523 hosted repeatability retry policy research

Decision: keep hosted repeatability as optional field evidence; do not enable it as a release gate.

Recommended policy if owner runs it manually:

| Area | Policy |
|---|---|
| command | `npm run benchmark:runtime-capture:hosted:repeatability` |
| default runs | 3 successful hosted captures, matching current script default |
| retry | retry only transient transport / provider availability failures; do not retry semantic output mismatches into a pass |
| timeout | use an explicit outer shell timeout in owner-run context; do not bake a long hosted timeout into default local gates |
| cost | require owner acknowledgement before each hosted run batch |
| artifact handling | review generated runtime reports before accepting; revert if only timestamp / field-lane noise changed |
| release gate | no; release notes may cite hosted repeatability only as supplemental evidence |

Reason: hosted loops are repeat-sensitive and cost-bearing. They are useful field evidence, not a deterministic release gate.

## U-524 open issue label hygiene read-only audit

Snapshot command:

```bash
gh issue list --repo emosamastudio/aods --state open --json number,title,labels,milestone,updatedAt,url
```

Current open issues:

| Issue | Title | Labels | Milestone | Decision |
|---|---|---|---|---|
| `#60` | AODS specification governance roadmap: authority, exposure, validation, and drift | `enhancement`, `priority/p0`, `area/governance` | none | keep |
| `#59` | Define observability metadata for AODS validation and routing decisions | `enhancement`, `priority/p3`, `area/validation`, `area/routing` | none | keep |
| `#41` | Define capability negotiation for agent and adapter consumers | `enhancement`, `priority/p1`, `area/governance`, `area/schema` | none | keep |

Decision: labels still match current scope. No label edit this round.

## U-525 milestone naming decision packet

Milestone snapshot:

```json
[]
```

Decision: do not create milestones yet.

Recommended names when scope is ready:

| Future milestone | Use when | Notes |
|---|---|---|
| `v0.9.0` | version-bump commit is ready and public close/split plan is accepted | release-facing scope only |
| `post-v0.9-runtime-fixtures` | runtime fixture focused regressions start | not a runtime engine milestone |
| `later-runtime-systems` | owner explicitly authorizes runtime systems | only for workflow/event/policy/remote/migration runtimes |

Reason: creating milestones before the close/split decision would imply a release scope that is not yet accepted.

## U-526 runtime issue split proposal

Recommended follow-up issue set:

| Proposed issue | Scope | First acceptance |
|---|---|---|
| Runtime fixture focused regressions | remote adapter mismatch, event correction graph, migration dry-run static report | focused tests pass without runtime execution |
| Workflow transition static record shape | minimal transition lifecycle / receipt metadata shape | design doc plus fixture candidate decision |
| Policy decision static record shape | actor / target / decision enum / evidence refs | design doc plus fixture candidate decision |
| Later runtime systems | workflow engine, event store, policy engine, remote gateway, migration executor | owner-approved PoC gate only |

Decision: prepare proposal only; do not create GitHub issues in this round because the final release decision remains no-go.

## U-527 metadata close versus runtime follow-up proposal

Recommended public close split:

| Issue | Metadata status | Runtime status | Recommendation |
|---|---|---|---|
| `#59` | close-ready for validation/routing metadata, samples, skipped-module opt-in | telemetry store / dashboard / trace backend deferred | close after final public comment if owner accepts |
| `#41` | close-ready for metadata-first capability fallback / unsupported / consumer action behavior | provider discovery / auth exchange / dynamic probing / fallback execution deferred | close only after runtime/protocol follow-up exists |
| `#60` | roadmap remains useful as umbrella | runtime systems still out of scope | keep open |

Decision: do not close any issue in this round. The next public action should be explicit comment / split / close execution, not hidden in a docs maintenance commit.

## U-528 post-release closeout playbook refresh

Recommended release closeout order:

1. Confirm `npm run release:hygiene`, `npm pack --dry-run --json`, and packed install smoke.
2. Confirm public issue close/split plan for `#59/#41/#60`.
3. Create a dedicated version-bump commit covering package, lockfile, README, and packaged skill release surfaces.
4. Tag and publish GitHub Release.
5. Run GitHub release source install smoke from the tag.
6. Post final public comments and close only accepted metadata-scoped issues.
7. Refresh handoff, task ledger, progress ledger, and next task pool.

Decision: playbook remains release-ready, but execution is blocked by public close/split and version-bump decisions.

## U-529 next task pool expansion after U-482

Added U-532 to U-581 as the next task pool.

Recommended next ordering:

1. public close/split execution packet and issue creation/comment drafting;
2. focused regression implementation for remote adapter mismatch;
3. event correction metadata shape and focused tests;
4. migration dry-run report static benchmark helper;
5. final v0.9 version-bump and release execution only after public state is clean.

## U-530 archive pruning risk review

Decision: do not prune or split archives this round.

Reason:

- current short entries are usable;
- full history remains available in `docs/operations/archive/`;
- docs link check passes;
- pruning now would create high-churn, low-value diff before release decisions.

Future trigger: archive grows enough to slow local search materially, or current operations README becomes too long to serve as a short entry.

## U-531 final v0.9 go/no-go packet

Final decision: v0.9 release is **NO-GO** today.

| Gate | Status | Reason |
|---|---|---|
| technical hygiene | pass | `npm run release:hygiene` passes |
| package surface | pass | package remains `aods@0.8.0`, entry_count=61 |
| latest public release | pass for current state | latest release remains `v0.8.0` |
| public issues | no-go | `#59/#41/#60` remain open; close/split execution not done |
| version surfaces | no-go | package / lockfile / README / skill surfaces intentionally still point to `0.8.0` / `v0.8.0` |
| runtime boundary | pass | runtime systems remain deferred and documented |
| next task pool | pass | U-532 to U-581 created |

Release go condition:

1. execute or explicitly defer `#59/#41` close/split plan;
2. decide `#60` roadmap comment/body status;
3. create dedicated version-bump commit;
4. rerun package dry-run and packed install smoke;
5. tag and publish only after all above are green.

## 本轮结论

- Benchmark summary source does not need a source edit; generated churn was reverted.
- Hosted repeatability remains optional and cost-aware, not a gate.
- Open issue labels and milestones need no mutation now.
- Runtime follow-up should be split as focused regressions and static shape work before any runtime system.
- v0.9 is still technically close, but final release remains no-go until public close/split and version-bump execution happen.
