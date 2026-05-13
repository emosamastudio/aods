# AODS examples / CI / benchmark policy

日期：2026-05-13
范围：U-462 到 U-471
状态：已完成；未启用 CI

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `4309307 Sync public roadmap and maintenance decisions` |
| Task ledger | 通过 | 当前默认任务为 U-462 到 U-471 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## U-462 source-first quickstart sample audit

`examples/compiled-pilot-source/README.md` now covers the full adoption path:

| Step | Covered |
|---|---|
| edit authoring source first | yes |
| compile generated output | yes |
| validate compiled output | yes |
| fixture smoke | yes |
| conformance run | yes |
| route before changing a pack | yes |
| final repo gate | yes |

Change made: added `npm run conformance:compiled-pilot` to the adoption path.

## U-463 package sample documentation pass

Package boundary is now explicit:

| Included in package | Not package surface |
|---|---|
| `examples/compiled-pilot-source/` | `docs/examples/*.sample.json` |
| `examples/compiled-pilot/` | benchmark generated corpora |
| fixture / conformance manifests | benchmark reports |
| CLI / schema / spec / skill package | operations history |

Change made: added package boundary wording to source-first README and clarified `docs/examples/README.md`.

## U-464 examples upgrade guidance

Older source-first examples should upgrade by:

1. keeping `authoring.json` as writable authority;
2. compiling into generated output;
3. validating strictly;
4. reviewing generated diffs before adding fixture/conformance changes;
5. keeping source and generated output in the same change.

Change made: added this upgrade order to `examples/compiled-pilot-source/README.md`.

## U-465 local hygiene CI design

Recommended CI shape if/when CI is enabled:

| Job | Command | Trigger | Notes |
|---|---|---|---|
| docs links | `npm run docs:check-links` | PR / push | fast, no network |
| secret placeholders | `npm run security:scan-placeholders` | PR / push | fast, no network |
| package surface | `npm run package:check-surface` | PR / push | invokes `npm pack --dry-run` |
| generated clean | `npm run generated:check-clean` | PR / push | requires generated outputs to be committed when changed |
| validation | `npm run validate:all` | PR / push | slower but local |

Decision: do not add GitHub Actions in this round. Keep `npm run release:hygiene` as the local aggregate gate until release scope is ready.

## U-466 generated clean CI dry-run

| Command | Result |
|---|---|
| `npm run generated:check-clean -- --json` | PASS; `dirty_entries=[]` |

This is safe for CI from a determinism perspective, but not enabled yet.

## U-467 docs link CI dry-run

| Command | Result |
|---|---|
| `npm run docs:check-links -- --json` | PASS; `markdown_files=180`, `checked_relative_links=89`, `missing_links=[]` |

This is safe for CI and should be the first candidate if CI is enabled.

## U-468 secret scan CI dry-run

| Command | Result |
|---|---|
| `npm run security:scan-placeholders -- --json` | PASS; `hits=0`, `unallowed_hits=[]` |

This is safe for CI as a local pattern scanner. It is not a replacement for a full secret scanning provider.

## U-469 benchmark summary refresh decision

Decision: do not refresh benchmark summary this round.

Reasons:

1. No benchmark source, metric, or generated result changed.
2. README benchmark sync content must be updated through `benchmarks/aods-eval-lab/src/summary.mjs`, not by hand.
3. Running summary without benchmark metric changes would create low-value churn risk.

## U-470 hosted repeatability gate decision

Decision: keep hosted repeatability as supplemental, not a default release gate.

Reasons:

1. Hosted runtime captures are repeat-sensitive field evidence.
2. Network/proxy/provider variance can make it unsuitable as a required local release gate.
3. The default release gate should remain deterministic local checks until the hosted lane has a stable cost and retry policy.

## U-471 benchmark archive policy implementation

Decision: no benchmark archive policy change this round.

Current policy remains:

| Path | Policy |
|---|---|
| `benchmarks/aods-eval-lab/generated/` | committed baseline, checked by generated clean gate |
| `benchmarks/aods-eval-lab/reports/` | committed human-readable baseline |
| README benchmark sync block | generated from summary script |

No generator or archive split was changed.

## 本轮结论

- Source-first quickstart now includes conformance.
- Package vs docs sample boundaries are clearer.
- Older example upgrade guidance is documented.
- CI remains a design, not an enabled workflow.
- Generated clean / docs link / secret scan dry-runs passed.
- Benchmark summary and archive policy remain unchanged.

## 下一步

下一轮默认进入 U-472 到 U-481：benchmark result clean audit、runtime prerequisite refresh for workflow/event/policy/remote/migration, public state refresh, next issue triage, post-operations split retrospective, and next task pool expansion.
