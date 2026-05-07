# AODS v0.7 RC Gate

状态：RC gate complete / release shipped
日期：2026-05-07

## 决策

v0.7 当前达到 **release branch candidate / conditional pass**：本地验证门禁已全绿，版本面已在 release branch 中切换到 `0.7.0`，v0.7 语义实现具备进入 PR 审查和 GitHub Release 准备的条件。

发布执行已完成：PR `#61` 已 merge 到 `main`，GitHub Release `v0.7.0` 已从 merged `main` 创建。

## 版本面

| 项 | 当前值 | 判断 |
|---|---|---|
| `package.json` version | `0.7.0` | release branch 已切换 |
| 本地最高 tag | `v0.7.0` | 已从 merged `main` 创建 |
| GitHub latest release | `v0.7.0` | 当前公开 latest 已切换 |
| README 公开 release | `v0.7.0` | release branch 已切换；merge 后必须立即创建 GitHub Release |
| v0.7 版本号 | `0.7.0` / tag `v0.7.0` | owner 已确认进入发布执行 |

## 验证结果

| Gate | 命令 | 结果 | 说明 |
|---|---|---|---|
| Root strict validation | `npm run validate:strict` | 通过 | root corpus 7 modules / 47 sections / 32 artifacts，L1-L4 全绿 |
| Seven-plane pilot validation | `npm run validate:pilot` | 通过 | 12 modules / 23 sections / 8 artifacts，L1-L4 全绿 |
| Compiled pilot strict reality | `npm run validate:compiled-pilot` | 通过 | compile 后 strict reality 通过；descriptive repo locator 明确输出 unchecked reason |
| Benchmark evaluate / compare / summary | `npm run benchmark:all` via `release:self-check` | 通过 | benchmark 生成、比较、汇总完成 |
| Benchmark tests | `npm run benchmark:test` via `release:self-check` | 通过 | 38 tests passing |
| Package dry run | `npm pack --dry-run` via `release:self-check` | 通过 | 当前 dry-run tarball 为 `aods-0.7.0.tgz`，32 files，126.0 kB package size |
| Full release self-check | `npm run release:self-check` | 通过 | repo validation + benchmark + package dry run 全部通过 |

## RC 阻断项

| 阻断项 | 是否阻断 local RC candidate | 是否阻断 public release | 处理 |
|---|---|---|---|
| dirty worktree 尚未拆分 / commit | 否 | 否 | PR `#61` 已 merge；`MEMORY.md` intentionally untracked |
| version surfaces 已切换到 `0.7.0` | 否 | 否 | 已发布 |
| GitHub issue close/comment 未审批 | 否 | 否 | 已按矩阵完成 v0.7 issue sync |
| no open PR | 否 | 否 | PR `#61` 已 merge |
| npm registry publish 非目标 | 否 | 否 | 当前 release strategy 是 GitHub Releases-only |

## 建议 release note skeleton

### AODS v0.7.0

Highlights:

- Adds stable-surface authority governance and exposure lifecycle rules.
- Adds first-class redaction, contract profile, and schema-versioning metadata validation.
- Adds project topology and module implementation linkage for multi-repo reality gaps.
- Adds topology-aware `validate --reality` summaries.
- Improves validator diagnostics for empty touch routing, capsule/detail sizing, and shared invariant normalization.
- Fixes source-first compile mirroring for stable contract metadata.
- Rejects duplicate `project_topology.implementation_repos[].id` values.
- Clarifies GitHub Releases as the official AODS release channel.

Validation:

- `npm run release:self-check` passed on 2026-05-07.
- `npm run benchmark:test` passed with 38 tests.

## 下一步执行顺序

1. v0.7 release execution complete.
2. 后续从 implementation evidence / contract drift 路线继续 v0.8 backlog。
3. 不执行 npm registry publish，除非 owner 改变 release 策略。
