# AODS post-v0.9 release adoption evidence

日期：2026-05-13
范围：U-592 到 U-601
状态：已完成

## 结论

本轮完成 v0.9 发布后的 source archive、README install、packaged README、release notes non-goal、本地 skill drift、CI / hosted / archive 决策，以及下一段 code drift validator hardening triage。

审查中发现一个现有 focused test failure：`examples/compiled-pilot-source/README.md` 的 non-goal 句子仍表达正确，但词序不满足 `example-packs.test.mjs` 的契约。已返工修复并复跑 focused tests 通过。

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 一致，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `f986315 Document post-v0.9 runtime prerequisites` |
| Release / tag | 通过 | `v0.9.0` tag 存在，GitHub Release 已 published |
| Task ledger state | 通过 | U-592 到 U-601 为当前默认任务 |
| 返工项 | 1 | focused test 发现 source-first README non-goal phrase drift，已修复 |

## U-592 release source archive repeatability audit

| Check | Result |
|---|---|
| release tag | `v0.9.0` |
| tag deref target | `ea9e44c7819f450f636d8157bd0eade91c893cad` |
| current `main` at audit time | `f9863151cc6ed06113668af15446f05b9efef74a` |
| tarball top dir | `emosamastudio-aods-0d0abff/` |
| zipball top dir | `emosamastudio-aods-0d0abff/` |
| tarball package | `aods@0.9.0` |
| zipball package | `aods@0.9.0` |
| README release link in archive | present |
| README install command in archive | present |

Interpretation: the GitHub source archive is correctly tied to the annotated `v0.9.0` release/tag source. It intentionally does not include later operations closeout commits on `main`.

## U-593 README install command post-release smoke

Command shape:

```bash
npm install --prefix "$tmp" git+https://github.com/emosamastudio/aods.git#v0.9.0
node "$tmp/node_modules/aods/bin/aods.mjs" --help
```

Result: PASS. Installed package reports `aods@0.9.0`.

## U-594 package README release link audit

`npm pack` package README surfaces include:

- `Latest release: v0.9.0`
- GitHub Release link to `/releases/tag/v0.9.0`
- install command `git+https://github.com/emosamastudio/aods.git#v0.9.0`
- Chinese README equivalent release and install surfaces

Result: PASS.

## U-595 release notes public non-goal wording audit

Release notes explicitly say:

- No workflow runtime.
- No event store or event replay.
- No policy engine.
- No remote gateway.
- No migration executor or database connection.
- No telemetry store, dashboard, trace backend, graph database, provider discovery, auth exchange, fallback ranking, adapter execution, or dynamic probing.

Result: PASS. The release notes do not overclaim runtime, replay, gateway, migration, provider discovery, auth exchange, fallback ranking, adapter execution, or dynamic probing.

## U-596 npm publish decision

Decision: do not publish to npm in this round.

Reason:

1. The current release model is GitHub tag/source release.
2. The user authorized GitHub operations, not npm registry publication.
3. npm publication adds credential, ownership, irreversible package-version, and support-surface risk.
4. The README install path already validates the GitHub tag source path.

Next time npm is considered, require a dedicated task with registry owner, token source, package access policy, rollback limitations, and dry-run evidence.

## U-597 installed skill package-vs-local drift audit

Repo packaged skill:

- `skill_version: 0.9.0`
- `aligned_release: v0.9.0`
- includes version alignment section
- includes fixture/conformance and CLI help discovery guidance

Local installed skill:

- `skill_version: 0.1.0`
- `aligned_release: aods_v3`
- older source-of-truth and trigger text

Decision: do not overwrite local installed skill this round. This is an operator environment mutation, not release evidence. Record drift only.

## U-598 release hygiene CI reconsideration

Decision: do not add CI in this round.

Reason:

1. `npm run release:hygiene` is stable locally.
2. v0.9 has already shipped; adding CI now would be a new release surface rather than release closeout.
3. If CI is added later, start with a local-only workflow running docs links, secret-like scan, package surface, generated clean, skill package tests, and `validate:all`.

## U-599 hosted repeatability post-release rerun decision

Decision: do not run hosted repeatability in this round.

Reason: hosted repeatability remains supplemental field evidence with provider/network/cost variance. It is not required to validate release source, package surface, README install, or static runtime non-goals.

## U-600 operations archive pruning after release

Decision: do not prune current operations history yet.

Reason:

1. The current handoff and round log are still active for rapid post-release slices.
2. The next code-drift and adoption rounds need recent release context.
3. Archive pruning should happen after U-592 to U-631 are either completed or split again.

## U-601 code drift validator next-slice triage

Triage result:

| Candidate | Current evidence | Next action |
|---|---|---|
| duplicate `implementation_repos[].id` | validator rule and focused test already exist; focused test passes | U-602 should confirm coverage and close out as no-new-code unless gaps appear |
| stable contract metadata compile mirror | compiler builders and focused test already exist; focused test passes | U-603 should confirm coverage and close out as no-new-code unless gaps appear |
| lifecycle alias terminology drift | structured term refs now exist; no concrete fixture yet | U-604 is likely the next implementation-worthy code drift slice |
| evidence freshness fixture gap | current warnings and diagnostics exist; could use one more negative example later | U-607 after U-604/U-605 |
| validation JSON contract stability | useful after next fixture updates | U-608 after U-607 |

Recommended route: execute U-602 and U-603 as verification/closeout first, then prioritize U-604 lifecycle alias terminology drift fixture if those reviews confirm existing coverage is complete.

## Rework

Issue found:

`node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs benchmarks/aods-eval-lab/test/example-packs.test.mjs` initially failed because `examples/compiled-pilot-source/README.md` said:

`not a command executor, event store, event replay mechanism, adapter runtime, resource scheduler, crawler, or fact checker`

The test expected the stable phrase:

`not a command executor, event store, adapter runtime, resource scheduler, crawler, or fact checker`

Fix:

The sentence now preserves both meanings:

`it is not a command executor, event store, adapter runtime, resource scheduler, crawler, or fact checker. It also does not replay events.`

Focused test rerun result: PASS, 48 tests passed.

## Verification

| Gate | Result |
|---|---|
| archive tarball / zipball audit | PASS |
| README install smoke | PASS |
| package README release link audit | PASS |
| release notes non-goal audit | PASS |
| installed skill drift audit | PASS |
| focused scaffold / example-packs tests after rework | PASS |
| `npm run docs:check-links -- --json` | PASS |
| `npm run release:hygiene` | PASS |
