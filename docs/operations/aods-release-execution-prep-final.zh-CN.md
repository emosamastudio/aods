# AODS release execution prep final

状态：当前专题记录
更新时间：2026-05-13

## 范围

| 项 | 内容 |
|---|---|
| 任务范围 | U-552 到 U-561 |
| 回合 | R-2026-05-13-38 |
| 目标 | 刷新 v0.9 release notes、完成 pack / install smoke、准备 GitHub source install route、做 final go/no-go、草拟 runtime follow-up issue body |
| 非目标 | 不 bump version、不打 tag、不创建 GitHub Release、不发布 package、不启用 CI、不运行 hosted capture、不创建 milestone、不编辑 `#64` body |

## U-552 release notes body final refresh

当前 `v0.9.0` release body 草稿：

```markdown
# AODS v0.9.0

## Highlights

- Added structured term reference metadata and validator gates for stable vocabulary and lifecycle contracts.
- Added evidence freshness, location diagnostics, and suggested remediation metadata for validation output.
- Added validation/routing observability samples, skipped-module opt-in diagnostics, route explanation metadata, and dependency edge reporting.
- Added metadata-first capability support: provider capability metadata, consumer requirement metadata, compatibility mismatch detection, unsupported reasons, fallback posture, degraded behavior, and consumer actions.
- Added source-first and compiled pilot examples for capability mismatch and event correction graph checks.
- Added static event correction graph validation for missing correction targets and supersession cycles without event replay.
- Added benchmark-only migration dry-run static report shape and no-execution guard fixture.
- Kept packaged examples, fixture smoke, conformance inputs, package surface guard, generated clean guard, and release-aligned skill checks green.

## Validation

- `npm run release:hygiene`
- `npm pack --dry-run --json`
- packed tarball install smoke
- packaged compiled-pilot strict validation
- packaged fixture smoke
- packaged conformance run

## Non-goals

- No workflow runtime.
- No event store or event replay.
- No policy engine.
- No remote gateway.
- No migration executor or database connection.
- No telemetry store, dashboard, trace backend, graph database, provider discovery, auth exchange, fallback ranking, adapter execution, or dynamic probing.

## Public issue status

- `#59` closed for metadata/reporting scope.
- `#41` closed for metadata-first capability scope.
- `#60` remains open as the roadmap tracker.
- `#64` tracks deferred runtime/protocol negotiation beyond metadata capability support.
```

## U-553 npm pack dry-run final rerun

| Field | Value |
|---|---|
| command | `npm pack --dry-run --json` |
| package | `aods@0.8.0` |
| filename | `aods-0.8.0.tgz` |
| entry count | 61 |
| package size | 224,322 bytes |
| unpacked size | 1,145,313 bytes |
| result | PASS |

The tarball remains `0.8.0` because this round intentionally does not perform the dedicated version-bump task.

## U-554 packed install smoke final rerun

| Check | Result |
|---|---|
| local tarball install | PASS |
| installed package | `aods@0.8.0` |
| CLI help | PASS |
| packaged compiled-pilot strict validation | PASS |
| packaged fixture smoke | PASS |
| packaged conformance run | PASS |
| temp root | `/tmp/aods-pack-smoke-73VH20` |

Command shape used:

```bash
tmpdir="$(mktemp -d /tmp/aods-pack-smoke-XXXXXX)"
tarball="$(npm pack --json | node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(0,"utf8")); console.log(data[0].filename)')"
npm install --prefix "$tmpdir" "./$tarball"
node "$tmpdir/node_modules/aods/bin/aods.mjs" --help
node "$tmpdir/node_modules/aods/bin/aods.mjs" validate "$tmpdir/node_modules/aods/examples/compiled-pilot" --strict
node "$tmpdir/node_modules/aods/bin/aods.mjs" fixture smoke "$tmpdir/node_modules/aods/examples/compiled-pilot-source/fixtures/fixture-manifest.json"
node "$tmpdir/node_modules/aods/bin/aods.mjs" conformance run "$tmpdir/node_modules/aods/examples/compiled-pilot-source/fixtures/conformance-manifest.json"
```

## U-555 GitHub release source install smoke final route

Do not run this before the `v0.9.0` tag exists. After tag creation:

```bash
tmp="$(mktemp -d /tmp/aods-github-install-XXXXXX)"
npm install --prefix "$tmp" git+https://github.com/emosamastudio/aods.git#v0.9.0
node "$tmp/node_modules/aods/bin/aods.mjs" --help
node "$tmp/node_modules/aods/bin/aods.mjs" validate "$tmp/node_modules/aods/examples/compiled-pilot" --strict
node "$tmp/node_modules/aods/bin/aods.mjs" fixture smoke "$tmp/node_modules/aods/examples/compiled-pilot-source/fixtures/fixture-manifest.json"
node "$tmp/node_modules/aods/bin/aods.mjs" conformance run "$tmp/node_modules/aods/examples/compiled-pilot-source/fixtures/conformance-manifest.json"
```

Expected acceptance:

| Check | Acceptance |
|---|---|
| install | package resolves from tag `v0.9.0` |
| version | installed package reports `0.9.0` |
| help | CLI exits 0 |
| validate | strict compiled-pilot validation exits 0 |
| fixture | fixture smoke exits 0 |
| conformance | conformance run exits 0 |

## U-556 release hygiene CI enablement decision final

Decision: do not enable a GitHub Actions job in this release prep round.

Rationale:

| Factor | Decision |
|---|---|
| Local gate maturity | `npm run release:hygiene` is stable and fast enough for owner-run release prep |
| CI risk | Adding CI now expands release surface while version bump/tag work is still pending |
| First CI candidate | If enabled later, start with one local-only job running `npm run release:hygiene`; exclude hosted repeatability and full benchmark fetch |

## U-557 hosted repeatability owner-run packet

Hosted repeatability remains optional field evidence, not a release gate.

Owner-run packet if needed later:

| Field | Value |
|---|---|
| command | `npm run benchmark:runtime-capture:hosted:repeatability` |
| default runs | 3 |
| timeout | owner should set a timebox before starting |
| gate status | supplemental only |
| required for v0.9 | no |
| reason | depends on hosted provider / credentials / network and is not required to validate current package semantics |

## U-558 archive current operations pruning decision

Decision: do not prune current operations logs before release. Current operations files remain long, but they are still the active handoff surface while v0.9 release execution is pending. Archive pruning should happen only after tag/release/post-release reconciliation completes.

## U-559 handoff pre-release compaction

Compaction action:

| Surface | Update |
|---|---|
| `aods-handoff.zh-CN.md` | current status advances to U-561 complete and next default U-562 to U-571 |
| task ledger | unfinished count advances to 20 |
| progress ledger | adds U-552 to U-561 row |
| round log | records R-2026-05-13-38 checks and results |

## U-560 final release go/no-go rerun

Verdict: **NO-GO for release execution today**.

| Dimension | Verdict | Reason |
|---|---|---|
| Public close/split | GO | `#59/#41` closed, `#60/#64` open with clear scope |
| Local release hygiene | GO | `npm run release:hygiene` passes |
| Package dry-run | GO | `aods@0.8.0`, 61 entries |
| Packed install smoke | GO | help / validate / fixture / conformance pass |
| Version surfaces | NO-GO | package / lockfile / README / skill still intentionally point to `0.8.0` / `v0.8.0` |
| Tag / GitHub Release | NO-GO | `v0.9.0` tag does not exist |
| Publish | NO-GO | version bump and source install smoke must happen first |

Next release path:

1. U-571 dedicated version bump implementation.
2. `npm run release:hygiene`.
3. `npm pack --dry-run --json`.
4. packed install smoke.
5. commit version bump.
6. tag and GitHub Release execution.
7. GitHub source install smoke from tag.

## U-561 runtime follow-up issue body draft

Draft update for `#64` if/when the issue body is refreshed:

```markdown
This issue tracks runtime/protocol negotiation work that remains intentionally outside metadata-first capability support.

Current completed baseline:

- provider capability metadata
- consumer requirement metadata
- deterministic compatibility mismatch checks
- unsupported reason / fallback posture / degraded behavior / consumer action fields
- source-first and compiled examples
- conformance and validator coverage for metadata-only behavior

Runtime/protocol scope:

- provider discovery protocol
- auth exchange boundary
- dynamic probing posture
- provider selection semantics
- fallback ranking and fallback execution semantics
- adapter call/runtime handshake boundary

Entry criteria before implementation:

1. static protocol record shape is written first;
2. risk, credential, cost, and production-mutation boundaries are explicit;
3. metadata validation remains separate from runtime execution;
4. any proof of concept is separately authorized;
5. tests prove no provider call, auth runtime, dynamic probing, or fallback executor is implied by metadata-only examples.

Non-goals until separately authorized:

- no remote gateway implementation
- no adapter execution
- no provider calls
- no auth runtime
- no dynamic probing
- no fallback executor
```
