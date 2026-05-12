# AODS Release Execution Playbook Dry Run

状态：U-101 已完成
日期：2026-05-12
范围：owner 授权前的 release steps、rollback、tag/version conflict checks；不创建 release

## 结论

Release execution playbook 已完成 dry run。当前不能执行 release，因为 version / tag / PR ready / merge / owner authorization 都未满足。本文件只定义未来授权后应按什么顺序发布、遇到冲突如何停下。

## Release Playbook

| 顺序 | Step | Gate |
|---:|---|---|
| 1 | owner 明确目标版本和 release scope | 不接受隐含版本号 |
| 2 | 确认 PR `#63` review / ready / merge 策略 | draft 不可直接发布 |
| 3 | 创建 release branch 或使用明确 release commit | commit 必须可追溯 |
| 4 | 更新 `package.json` version 和 README version surface | 不复用 `v0.7.0` |
| 5 | 更新 release notes / changelog text | 覆盖 major changes、non-goals、known deferred work |
| 6 | 运行 `npm run release:self-check` | 必须通过 |
| 7 | 运行 `npm pack --dry-run --json` 并审查 inventory | entry count / package surface 必须解释清楚 |
| 8 | 运行 packed install smoke | CLI help、strict validation、fixture smoke 必须通过 |
| 9 | 创建 signed or annotated tag if owner requires | tag 不可覆盖 |
| 10 | 创建 GitHub Release | body 必须匹配 release notes |
| 11 | 核对 issues / PR / README / release links | public state reconciliation |

## Conflict Checks

| Conflict | Stop Condition | Recovery |
|---|---|---|
| Version already tagged | target tag exists | choose new version or abort |
| Package version not bumped | `package.json` still old version | do not release |
| README latest release mismatch | README points to old/new wrong tag | fix before release |
| PR not merged but release uses branch commit | owner did not approve branch release | abort release |
| Package inventory unexpected | missing CLI/spec/schema/example files | fix package surface before release |
| Install smoke fails | CLI or examples fail from packed tarball | fix before release |

## Rollback Guidance

| Stage | Rollback |
|---|---|
| Before tag push | amend / reset release branch as needed; no public rollback |
| After tag push, before release | delete erroneous tag only with explicit owner approval |
| After GitHub Release draft | edit/delete draft before publishing |
| After published release | do not silently rewrite; publish corrective release or owner-approved rollback notice |
| After issue closure | reopen incorrectly closed deferred issues with explanatory comment |

## Non-Goals

1. 本轮不 bump version。
2. 本轮不 create tag。
3. 本轮不 create release。
4. 本轮不 merge PR。
5. 本轮不 npm publish。
