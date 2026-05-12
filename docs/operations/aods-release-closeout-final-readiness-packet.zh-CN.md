# AODS Release Closeout Final Readiness Packet

状态：U-201 到 U-210 已完成
日期：2026-05-13
范围：PR body final freshness、close refs audit、review/checks policy、release notes body、version / README dry-run plan、package / install / release gates、owner go/no-go packet；不 merge、不 release、不 bump version、不创建 tag、不发布 npm

## 目的

本文件把 PR `#63` 合并前、下一 public release 前的最后一轮 dry-run 证据合并成 owner 可审查的决策包。

价值：避免 PR body、close-on-merge refs、release notes、version surface、package artifact、packed install smoke 和 release self-check 之间出现发布前漂移。

验收标准：U-201 到 U-210 每项都有可复核证据；所有外部副作用保持在已授权范围内；当前仍不执行 merge / release / tag / version bump / npm publish。

## 上轮质量复审

| 检查项 | 结果 | 证据 |
|---|---|---|
| Git state | 通过 | `git status -sb` 显示 branch 与 origin 对齐，仅 `MEMORY.md` untracked |
| 最新提交 | 通过 | `43e5595 Refresh PR file count after closeout docs` |
| 远端一致性 | 通过 | `git rev-parse HEAD origin/codex/aods-v0.8-backlog` 两者一致 |
| AODS validation | 通过 | `npm run validate:all` root / seven-plane / compiled-pilot 全部通过 |
| Skill package regression | 通过 | `node --test benchmarks/aods-eval-lab/test/skill-package.test.mjs` 2/2 pass |
| AODS route | 通过 | release closeout query 命中 stable contracts、validation、authority governance |
| PR state | 通过 | PR `#63` ready、merge clean、0 reviews、0 checks、20 close refs recognized |
| 返工 | 无 | 上轮成果合格，直接进入 U-201 到 U-210 |

## 本轮任务结果

| 任务 | 结果 | 证据 |
|---|---|---|
| U-201 PR body final freshness refresh | 已完成 | PR `#63` body 已刷新，覆盖 U-191 到 U-200 后 release closeout、package、install、self-check 状态 |
| U-202 Close-on-merge refs final audit | 已完成 | `gh pr view 63 --json closingIssuesReferences` 仍识别 20 个 refs |
| U-203 Review / checks policy decision record | 已完成 | `gh pr checks 63` 返回 no checks reported；reviews 仍为空 |
| U-204 Release notes final body draft | 已完成 | 本文件提供 GitHub Release body draft；未创建 release |
| U-205 Version bump dry-run patch plan | 已完成 | `0.8.0` patch scope 已列明；未改 `package.json` / lockfile |
| U-206 README release link diff plan | 已完成 | README / README.zh-CN release surface 改动点已列明；未创建 release link |
| U-207 Package inventory rerun after final docs | 已完成 | `npm pack --dry-run --json`：`aods@0.7.0`、55 files、210524 bytes |
| U-208 Packed install smoke rerun | 已完成 | local temp install CLI help / packaged validate / fixture smoke all pass |
| U-209 Release self-check rerun | 已完成 | `npm run release:self-check` pass；85 benchmark tests pass；generated churn restored |
| U-210 Owner go/no-go packet refresh | 已完成 | 本文件给出 merge / release / no-release 决策包 |

## Public PR State

| 项 | 当前值 | 说明 |
|---|---|---|
| PR | `#63` | `[codex] Advance AODS drift, examples, and release readiness` |
| URL | `https://github.com/emosamastudio/aods/pull/63` | 公共 PR |
| Draft | `false` | ready for review |
| Merge state | `CLEAN` | 当前可合并 |
| Reviews | `0` | 尚无 reviewer 结论 |
| Checks | `0` | `gh pr checks 63` reports no checks |
| Changed files | `185` at public verification before this local docs commit | 本轮提交后需再次刷新 PR file count |
| Head OID | `43e55958995fa8e977a7f7dc116084ab95ab8266` at public verification | 本轮 docs commit 推送后会变化 |

## Close-on-merge Audit

GitHub 仍识别 20 个 close-on-merge refs：

`#33`、`#35`、`#37`、`#38`、`#39`、`#43`、`#44`、`#45`、`#46`、`#47`、`#48`、`#49`、`#50`、`#51`、`#52`、`#54`、`#55`、`#56`、`#57`、`#58`。

Deferred refs 保持 open by design：`#13`、`#41`、`#59`、`#60`。

## Review / Checks Policy

| 决策点 | 当前政策 |
|---|---|
| Checks | 当前仓库没有 PR checks；本轮不直接启用 CI，避免在 release closeout 中引入未审查 workflow。 |
| Review | 默认建议等待 owner / reviewer 明确确认后 merge。 |
| Owner override | 若 owner 明确接受无 checks / 无 reviews 风险，可在本地 gates 通过、PR merge clean、close refs 识别正常后执行 owner override merge。 |
| Release | Release 不可由 owner override 跳过 version alignment；必须先完成 `0.8.0` version bump、README link update、tag / GitHub Release body final check。 |
| Issue closure | 不手动关闭 intended-close issues；只依赖 PR merge close syntax。 |

## GitHub Release Body Draft

```markdown
## Summary

This release advances AODS from the `v0.7.0` foundation into a broader drift, evidence, example, validation, and release-readiness line.

## Major Changes

- Adds implementation drift metadata, acceptance evidence, and remediation guidance.
- Adds decision provenance, read-model freshness, fixture/golden export conventions, and source-first example adoption guidance.
- Adds canonical example packs for read models, commands, events, adapters, artifact exports, resources, glossary registry, and external citations.
- Adds route JSON explanations, dependency diagnostics, fixture smoke checks, negative fixture coverage, and validation/reporting documentation.
- Adds risk, exposure, audit, lifecycle, and runtime PoC decision boundaries without implementing the deferred runtimes.
- Refreshes public PR / issue sync and release readiness evidence.

## Validation

- `npm run validate:all`
- `npm run benchmark:test`
- `npm run release:self-check`
- packed tarball install smoke from a temporary local project
- `npm pack --dry-run --json`

## Non-goals

- No workflow engine, event store, policy engine, remote gateway, migration executor, telemetry store, semantic judge, or package-manager runtime.
- No npm registry publish.
- No automatic issue closure beyond GitHub PR merge close syntax.

## Caveats

The package and release version must be bumped to `0.8.0` before publishing this release. The current branch still reports `0.7.0` until that explicit version-alignment patch is made.
```

## Version Bump Dry-run Patch Plan

Do not apply this patch until owner chooses release execution.

| Surface | Planned change |
|---|---|
| `package.json` | `"version": "0.8.0"` |
| `package-lock.json` | root and package version fields to `0.8.0` |
| `README.md` | latest release, release link, install snippet, release download section to `v0.8.0` |
| `README.zh-CN.md` | same release/version surfaces in Chinese |
| `skills/aods-use/SKILL.md` | release version `v0.8.0`, package version `0.8.0` |
| `skills/aods-use/skill.json` | `skill_version: "0.8.0"`, `aligned_release: "v0.8.0"` |
| Release notes | use the draft above, then replace caveat after version bump passes |
| Validation after patch | `npm run validate:all`、`node --test benchmarks/aods-eval-lab/test/skill-package.test.mjs`、`npm run release:self-check`、`npm pack --dry-run --json` |

## README Release Link Diff Plan

| README surface | Planned update |
|---|---|
| top latest release line | `v0.7.0` -> `v0.8.0` |
| evidence/download table | GitHub Release link target -> `/releases/tag/v0.8.0` |
| section heading | `What v0.7.0 currently shows` / Chinese equivalent -> `v0.8.0` |
| install snippet | `git+https://github.com/emosamastudio/aods.git#v0.8.0` |
| release download bullet | link target and label -> `v0.8.0` |
| benchmark references | only update if release benchmark report is accepted; do not hand-edit generated benchmark sync blocks |

## Package Inventory

| Field | Value |
|---|---|
| Package | `aods@0.7.0` |
| Tarball | `aods-0.7.0.tgz` |
| Entry count | 55 |
| Package size | 210524 bytes |
| Unpacked size | 1073821 bytes |
| Shasum | `fe80285087f943212528be680fcf84cf6423f0fe` |
| Included | CLI, `lib/`, `schema/`, `spec/`, root manifest, public README files, compiled/source example packs, packaged `aods-use` skill |
| Excluded as expected | operations docs, benchmark reports/results, local `MEMORY.md` |

## Packed Install Smoke

| Check | Result | Evidence |
|---|---|---|
| Local tarball install | pass | temp root `/tmp/aods-install-smoke.4hVnrk` |
| CLI help | pass | packaged CLI lists validate / route / hook / upgrade / compile / fixture / scaffold |
| Packaged corpus validation | pass | `examples/compiled-pilot` strict reality validation returned errors=0 warnings=0 |
| Packaged fixture smoke | pass | fixtures=12, positive=9, negative=3, expected_rules=3, golden_exports=9, issues=[] |

## Release Self-check

`npm run release:self-check` passed.

Evidence:

1. `npm run validate:all` passed.
2. `npm run benchmark:all` passed.
3. Benchmark test count: 85 pass, 0 fail.
4. Final `npm pack --dry-run` still produced `aods-0.7.0.tgz` with 55 files.
5. Generated benchmark/report churn was restored after the run because this round did not intend to accept generated output changes.

## Owner Go/no-go Packet

| Option | Recommendation | Reason |
|---|---|---|
| Merge PR `#63` now | Conditional go | Local gates pass and PR is merge clean, but owner must explicitly accept no GitHub checks and no reviews. |
| Publish release now | No-go | Current version surfaces still say `0.7.0`; release target `v0.8.0` requires a version-alignment patch first. |
| Keep PR open and do hygiene automation next | Go | Lowest-risk continuation: U-211 到 U-220 can turn repeated local checks into scripts before release execution. |
| Start release version bump next | Go after owner selection | If owner wants release next, run the version bump plan above before creating tag / GitHub Release. |

Recommended next route：执行 U-211 到 U-220，把 docs link checker、secret-like scan、package guard、generated artifact guard、skill alignment regression 等本轮手工检查变成可重复本地命令。Release 仍需 owner 明确选择后再进入 version bump / tag / GitHub Release execution。

## Non-goals Confirmed

1. 未 merge PR。
2. 未关闭 issue。
3. 未创建 GitHub Release。
4. 未创建 tag。
5. 未修改 package version。
6. 未发布 npm package。
7. 未启用 CI workflow。
8. 未把 `MEMORY.md` 加入仓库。
