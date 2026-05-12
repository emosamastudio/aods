# AODS Release Closeout Readiness Plan

状态：U-191 到 U-195 已完成
日期：2026-05-12
范围：release notes finalization、PR split risk、GitHub checks triage、package surface guard、post-merge reconciliation checklist；不 merge、不发布、不 bump version、不新增 CI

## 结论

PR `#63` 已进入 review surface，但仍不应直接 merge / release。当前最佳路线是继续单 PR review，保留 `v0.8.0` 作为下一 public release 目标，在真正发布前再单独执行 version bump、tag、GitHub Release 和 post-merge reconciliation。

## U-191 Release Notes Finalization

下一 release notes 建议使用以下结构，不把内部 backlog 阶段号映射成 public version：

| Section | 必须覆盖 |
|---|---|
| Version | `v0.8.0` / package `0.8.0`，但只在 version bump 后写入最终 release body |
| Summary | AODS v0.7 后累计的 drift evidence、acceptance criteria、remediation、provenance/freshness、examples、glossary/citation、routing/reality diagnostics、fixture smoke、negative fixtures 和 dependency diagnostics |
| Validation | `npm run validate:all`、`npm run benchmark:test`、`npm run release:self-check`、focused fixture / route tests、package dry-run |
| Non-goals | no workflow runtime、event store、policy engine、remote gateway、migration executor、capability negotiation runtime、telemetry store |
| Public issue handling | PR `#63` merge closes `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58`；`#13/#41/#59/#60` remain open |
| Caveat | release publication requires owner go/no-go after review / merge / version bump |

## U-192 PR Split Risk Assessment

| 维度 | 当前状态 | 判断 |
|---|---|---|
| Changed files | 182 | 大，但主要是长期积累的 spec / schema / examples / docs / tests / generated corpus surface |
| Review shape | one public PR already ready for review | 保持单 PR 更低风险；拆分会破坏 close-on-merge issue mapping 和 release narrative |
| Semantic coupling | 高 | drift evidence、fixtures、examples、docs、release notes 相互引用 |
| Regression surface | 本地 gates 已可重复 | split 后需要重复审查 generated output / issue close refs |

结论：当前不拆 PR，不改历史。后续只在 reviewer 明确要求或 merge conflict 变重时再拆。

## U-193 GitHub Checks Setup Triage

| 检查 | 当前状态 |
|---|---|
| `.github/workflows/` | 不存在 |
| `gh pr checks 63` | no checks reported |
| 本地替代 gate | `validate:all`、`benchmark:test`、`release:self-check`、focused regressions、`git diff --check` |

结论：本轮不新增 CI。若后续要加最小检查，应先新增独立任务，建议只跑 `npm run validate:all` 和 focused fast tests，避免把 hosted repeatability / full benchmark 网络依赖放进 required checks。

## U-194 Package Public Surface Diff Guard

最新 `npm pack --dry-run --json` 显示 package 仍为 `aods@0.7.0` / `aods-0.7.0.tgz`，entry count 55。package surface 判断如下：

| Surface | 状态 | 说明 |
|---|---|---|
| CLI / lib | included | `bin/`、`lib/` 进入包 |
| schema / spec / manifest | included | compiled-corpus-first authority 进入包 |
| source-first example | included | `examples/compiled-pilot-source/` 进入包 |
| compiled example | included | `examples/compiled-pilot/` 进入包 |
| skill | included | `skills/aods-use/` 进入包，本轮补齐 upgrade / release alignment trigger |
| operations docs | excluded | 正常，不是 runtime package surface |
| benchmarks / tests | excluded | 正常，不是 release package surface |

发布前必须重新跑 pack dry-run，因为 version bump 会改变 package id / tarball name。

## U-195 Post-Merge Reconciliation Checklist

| 顺序 | 动作 | 验收 |
|---:|---|---|
| 1 | 确认 PR `#63` merged commit | `gh pr view 63 --json state,mergedAt,mergeCommit` |
| 2 | 拉取并核对 `main` | local `main` 与 `origin/main` 对齐 |
| 3 | 核对 covered issues 自动关闭 | 20 个 close-on-merge issues 已 closed |
| 4 | 核对 deferred issues 仍 open | `#13/#41/#59/#60` remain open |
| 5 | 若不发布 release | 记录 no-release closeout，README latest release 保持 `v0.7.0` |
| 6 | 若发布 release | 进入 version bump、tag、release body、GitHub Release flow |
| 7 | 核对 package / README / release links | 不出现 `0.7.0` 与 `v0.8.0` 混用 |
| 8 | 更新 handoff / task ledger / round log | public state evidence 入账 |

## No-Go Conditions

| 条件 | 处理 |
|---|---|
| close refs 少于 20 | 停止 merge，修 PR body |
| checks policy 未确认 | 不把 no-checks PR 直接当作 release-ready |
| package version 仍为 `0.7.0` | 不创建 `v0.8.0` release |
| reviewer requested changes | 先处理 review，不进入 release |
| deferred issue 被误关 | reopen 并解释 |
