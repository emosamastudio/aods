# AODS v0.9 release candidate preparation

日期：2026-05-13
范围：U-432 到 U-441
状态：已完成；未发布

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `04e2b7a Split operations docs and plan release tasks` |
| Task ledger | 通过 | 当前默认任务为 U-432 到 U-441 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## Version surface audit

当前公开发布面仍保持 `v0.8.0` / package `0.8.0`，下一版本只作为候选规划。

| Surface | 当前值 | v0.9 判断 |
|---|---|---|
| GitHub latest release | `v0.8.0` | 下一候选为 `v0.9.0`，本轮不创建 release |
| `package.json` | `0.8.0` | 本轮不 bump |
| `package-lock.json` | `0.8.0` | 本轮不 bump |
| Root README | `v0.8.0` latest release | 本轮不改为未发布版本 |
| Packaged skill | `skill_version=0.8.0` / `aligned_release=v0.8.0` | 与当前 release 对齐；下一 release bump 时同步 |
| GitHub milestones | 无 | 本轮不创建 milestone |

## Changelog preparation

下一 release notes 应覆盖以下变化，而不是只写为 documentation follow-up：

| Area | Release note input |
|---|---|
| Structured term refs | lifecycle / alias / deprecated term refs 能表达并校验稳定术语引用 |
| Evidence freshness | current / planned / stale / blocked evidence posture 和 location envelope 更清楚 |
| Observability | validate JSON issue location、route skipped-module opt-in、compact public samples |
| Capability metadata | unsupported reason、fallback posture、consumer action、compatibility fallback gate |
| Examples and package | compiled pilot、fixture smoke、conformance input 随包保持可安装可运行 |
| Operations hygiene | docs link、placeholder scan、package surface、generated clean、skill alignment 聚合为 release hygiene |

## Release notes draft

```markdown
# AODS v0.9.0

## Highlights

- Added structured term reference metadata so stable lifecycle and vocabulary contracts can reject accidental alias drift.
- Added evidence freshness and location diagnostics for clearer validation output.
- Added compact observability samples for validation and routing decisions.
- Added capability fallback metadata for adapter and consumer compatibility decisions.
- Kept packaged examples, fixture smoke, conformance inputs, and release-aligned skill surfaces in sync.

## Validation

- npm run release:hygiene
- npm pack --dry-run
- packed tarball install smoke
- packaged compiled-pilot strict validation
- packaged fixture smoke
- packaged conformance run

## Non-goals

- No workflow runtime.
- No event store.
- No policy engine.
- No remote gateway.
- No migration executor.
- No telemetry store or dashboard.
- No adapter handshake runtime, provider discovery, or fallback ranking.
```

## Package dry-run audit

| Gate | Result | Evidence |
|---|---|---|
| `npm pack --dry-run` | PASS | package `aods@0.8.0`, 61 files, package size `222.1 kB`, unpacked size `1.1 MB` |
| Package surface allowlist | PASS | included in `npm run release:hygiene`, `entry_count=61 missing=0 unexpected=0` |
| Generated clean | PASS | included in `npm run release:hygiene`, `dirty_entries=0` |

The tarball name remains `aods-0.8.0.tgz` because this round intentionally did not bump version surfaces.

## Packed install smoke

| Check | Command | Result |
|---|---|---|
| Install | `npm install ./aods-0.8.0.tgz` in a temp project | PASS |
| CLI help | `./node_modules/.bin/aods --help` | PASS; first line `AODS CLI` |
| Packaged validation | `./node_modules/.bin/aods validate ./node_modules/aods/examples/compiled-pilot --strict` | PASS; `L4 PASS errors=0 warnings=0` |
| Fixture smoke | `./node_modules/.bin/aods fixture smoke .../fixture-manifest.json` | PASS; `golden_exports: 10` |
| Conformance run | `./node_modules/.bin/aods conformance run .../conformance-manifest.json` | PASS; `failed: 0` |

Temp project used for this smoke: `/tmp/aods-pack-smoke-CVgUN6`.

## Release branch decision

Default recommendation: release directly from `main` after a dedicated version-bump commit, because:

1. `main` is already the release branch used by `v0.8.0`.
2. Current gates pass locally.
3. No concurrent release branch or PR is open.
4. The remaining work is version bump, release body finalization, public state sync, tag/release creation, and post-release verification.

A separate release branch is only needed if review policy requires a PR for the version bump.

## Public issue close readiness

| Issue | Current state | Close readiness |
|---|---|---|
| `#60` | Open roadmap tracker | Not ready; needs body refresh packet and public roadmap sync |
| `#59` | Open observability follow-up | Not ready; needs close criteria matrix for validation/routing evidence |
| `#41` | Open capability negotiation follow-up | Not ready; metadata slice is done, runtime/protocol boundary remains deferred |

No issue was closed or edited in this round.

## Go / no-go

| Dimension | Verdict | Reason |
|---|---|---|
| Local technical gate | GO | release hygiene, pack dry-run, install smoke, validate, fixture, conformance all pass |
| Public release execution | NO-GO | version surfaces still intentionally point to `v0.8.0`; no `v0.9.0` tag or release body final |
| Public issue closure | NO-GO | `#60/#59/#41` need close criteria or refresh packet first |
| Milestone creation | NO-GO | mapping packet is not prepared yet |

## Skill release sync

`skills/aods-use/SKILL.md` and `skills/aods-use/skill.json` remain aligned with the current published release. They should only change to `0.9.0` / `v0.9.0` in the same release bump that changes package and README surfaces.

## Post-release checklist refresh

When owner starts release execution, use this order:

1. Re-run `npm run release:hygiene`.
2. Bump `package.json`, `package-lock.json`, README release surfaces, and packaged skill version surfaces to `0.9.0` / `v0.9.0`.
3. Re-run `npm run release:hygiene`, `npm pack --dry-run`, and packed install smoke.
4. Commit the version bump.
5. Create and push `v0.9.0` tag.
6. Create GitHub Release from the release notes draft after final review.
7. Verify GitHub Release latest state and package install path.
8. Sync public issue state according to the close criteria packets.

## Next step

Next default work should move to U-442 through U-451: capability close criteria, observability close criteria, public roadmap refresh packet, and milestone mapping packet.
