# AODS v0.7 RC Gate

状态：RC gate decision
日期：2026-05-07

## 决策

v0.7 当前达到 **release branch candidate / conditional pass**：本地验证门禁已全绿，版本面已在 release branch 中切换到 `0.7.0`，v0.7 语义实现具备进入 PR 审查和 GitHub Release 准备的条件。

但当前 **不应直接创建 GitHub Release tag**，原因是 release branch 尚未合并到 `main`。GitHub Release 应在 PR merge 后从 `main` 创建 `v0.7.0`。

## 版本面

| 项 | 当前值 | 判断 |
|---|---|---|
| `package.json` version | `0.7.0` | release branch 已切换 |
| 本地最高 tag | `v0.6.0` | 尚无 `v0.7.0` tag |
| GitHub latest release | `v0.6.0` | 当前公开 latest 仍正确 |
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
| dirty worktree 尚未拆分 / commit | 否 | 是 | 按 dirty attribution 先拆 governance/docs、semantic、benchmark evidence、memory boundary |
| version surfaces 已切换到 `0.7.0` | 否 | 否 | release branch 已完成；PR merge 后立即创建 tag/release |
| GitHub issue close/comment 未审批 | 否 | 是 | 按 GitHub sync approval matrix 执行 |
| no open PR | 否 | 是 | 需要先创建 PR 并完成 review / merge |
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

1. 提交并推送 `codex/aods-v0.7-rc` release branch，明确排除 `MEMORY.md`。
2. 创建 PR 到 `main`。
3. PR merge 后按 GitHub sync approval matrix 评论 / 关闭对应 issues。
4. 从 `main` 创建 GitHub Release `v0.7.0`；不执行 npm registry publish，除非 owner 改变 release 策略。
