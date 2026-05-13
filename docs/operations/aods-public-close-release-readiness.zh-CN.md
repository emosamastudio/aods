# AODS public close / release readiness

日期：2026-05-13
范围：U-482 到 U-491
状态：已完成；未发布

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `e720294 Refresh runtime prerequisites and task pool` |
| Task ledger | 通过 | 当前默认任务为 U-482 到 U-491 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## U-482 observability public close readiness packet

Issue `#59` 建议进入 close-ready，但不在本轮关闭。

| Criteria | 当前证据 | 判断 |
|---|---|---|
| validation observability fields | `validate --json` issues include rule / level / message / remediation / location | 满足 |
| route explanation fields | `route --json` includes explanation source / reason / dependency | 满足 |
| skipped module reporting | explicit `--explain-skipped` opt-in | 满足 |
| public samples | docs examples cover validate / route shapes | 满足 |
| telemetry boundary | public comment states no telemetry store / dashboard / trace backend | 满足 |

Recommendation: close `#59` only after a final public comment says the issue is satisfied as CLI/report metadata, with telemetry/dashboard/runtime observability explicitly deferred.

## U-483 capability metadata close scope packet

Issue `#41` should be split by scope.

| Scope | 当前证据 | 判断 |
|---|---|---|
| provider capability metadata | schema / compiled pilot / README | 满足 |
| consumer requirement metadata | compatibility matrix and examples | 满足 |
| deterministic compatibility matching | validator gates compatible / incompatible / partial / unknown rows | 满足 |
| unsupported / fallback metadata | schema / validator / example / conformance negative case | 满足 |
| runtime negotiation | provider discovery, auth exchange, dynamic probing, selection, fallback ranking | 未实现，仍 deferred |

Recommendation: close `#41` as metadata-first completion only if a new runtime/protocol follow-up is created first. Otherwise keep it open as the runtime/protocol tracker.

## U-484 roadmap tracker v0.9 refresh packet

Issue `#60` should remain the umbrella tracker.

Suggested next public comment:

```markdown
Current v0.9 candidate state:

- The metadata/reporting side of validation/routing observability is close-ready.
- The metadata side of capability negotiation is close-ready if runtime/protocol negotiation is split into a follow-up.
- Release execution is still no-go until version surfaces are bumped and final release notes are reviewed.

Deferred runtime work remains outside the release: workflow runtime, event store, policy engine, remote gateway, migration executor, telemetry store, dashboard, provider discovery, auth exchange, fallback ranking, and adapter execution.
```

本轮不编辑 `#60` body，不发布 comment。

## U-485 v0.9 release readiness recheck

| Gate | Result |
|---|---|
| `npm run release:hygiene` | PASS |
| package version | `0.8.0` |
| lockfile version | `0.8.0` |
| latest GitHub release | `v0.8.0` |
| current release execution | NO-GO |

Technical gates pass, but release execution remains no-go because version surfaces intentionally still point to `0.8.0` / `v0.8.0`.

## U-486 version bump no-go/go decision refresh

Decision: no-go for automatic bump in this round.

Reasons:

1. `#41/#59` public close decisions still need final owner-visible packets.
2. `#60` roadmap comment should happen before publishing a new release.
3. The package and lockfile are still correctly aligned to the current published release.

Go condition: after U-482/U-484 packets are accepted or posted, create a dedicated version-bump commit that changes package, lockfile, README release surfaces, and packaged skill release surfaces together.

## U-487 release notes final body sync

Current draft body for `v0.9.0`:

```markdown
# AODS v0.9.0

## Highlights

- Structured term references for stable vocabulary and lifecycle contracts.
- Evidence freshness metadata and validation issue location envelopes.
- Validation/routing observability samples and skipped-module opt-in diagnostics.
- Metadata-first capability fallback posture, unsupported reasons, degraded behavior, and consumer actions.
- Packaged source-first and compiled examples with fixture and conformance manifests.

## Validation

- npm run release:hygiene
- npm pack --dry-run
- packed tarball install smoke
- packaged compiled-pilot strict validation
- packaged fixture smoke
- packaged conformance run

## Non-goals

- No workflow runtime, event store, policy engine, remote gateway, or migration executor.
- No telemetry store, dashboard, provider discovery, auth exchange, fallback ranking, or adapter execution.
```

## U-488 package dry-run rerun

| Gate | Result |
|---|---|
| `npm pack --dry-run --json` | PASS |
| package id | `aods@0.8.0` |
| filename | `aods-0.8.0.tgz` |
| entry count | 61 |
| unpacked size | 1,136,618 bytes |

## U-489 packed install smoke rerun

| Check | Result |
|---|---|
| temp install from local tarball | PASS |
| CLI help | PASS; first line `AODS CLI` |
| packaged compiled-pilot strict validation | PASS; `L4 PASS errors=0 warnings=0` |
| packaged fixture smoke | PASS; `golden_exports: 10` |
| packaged conformance run | PASS; `failed: 0` |

## U-490 GitHub release source install smoke route

Do not run a `v0.9.0` GitHub source install before the tag exists.

After tag creation, use:

```bash
tmp="$(mktemp -d /tmp/aods-github-install-XXXXXX)"
npm install --prefix "$tmp" git+https://github.com/emosamastudio/aods.git#v0.9.0
"$tmp/node_modules/.bin/aods" --help
"$tmp/node_modules/.bin/aods" validate "$tmp/node_modules/aods/examples/compiled-pilot" --strict
"$tmp/node_modules/.bin/aods" fixture smoke "$tmp/node_modules/aods/examples/compiled-pilot-source/fixtures/fixture-manifest.json"
"$tmp/node_modules/.bin/aods" conformance run "$tmp/node_modules/aods/examples/compiled-pilot-source/fixtures/conformance-manifest.json"
```

## U-491 public milestone creation decision packet

Decision: do not create a milestone yet.

| Option | Judgment |
|---|---|
| Create `v0.9.0` milestone now | No-go; release scope still has public close packets pending |
| Create `later-runtime` milestone now | No-go; runtime split issue proposal is not created yet |
| Keep no milestones | Preferred current state |

Milestone creation should wait until either `#41/#59` are closed/split or a version-bump commit is ready.

## 本轮结论

- `#59` is close-ready as metadata/reporting scope, pending final public close comment.
- `#41` is close-ready only for metadata-first scope; runtime/protocol work should be split first.
- `#60` should stay open as roadmap tracker.
- v0.9 release remains technically prepared but publication is no-go until version bump and public close/sync decisions.
- Package dry-run and packed install smoke passed.
- No milestone was created.
