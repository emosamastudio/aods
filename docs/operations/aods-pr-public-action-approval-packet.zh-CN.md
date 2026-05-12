# AODS PR Public Action Approval Packet

任务：U-167、U-168
状态：已完成
日期：2026-05-12
范围：PR body stale scope audit 和后续公开动作审批包；不执行公开写操作

## PR Body Scope Drift

当前 PR `#63` body 仍描述为同步到 v0.11 release readiness gate，但分支已经继续推进到 U-160，新增了 runtime readiness、package/release gates、fixture/CLI docs、risk/audit docs 和 final research closure plans。

| Drift | 当前风险 | 修复建议 |
|---|---|---|
| summary scope stale | review 者会低估 diff 范围 | 更新 Summary，覆盖 U-085 到 U-160 |
| validation list stale | 后续多轮已跑 `benchmark:test` 和更多 gates | 更新 Validation 为当前 latest pass |
| close syntax gap | GitHub 只识别 `#33` | 每个 close target 使用独立 close keyword |
| release position stale | 仍正确 no release，但理由应更新 | 加入 PR draft / no checks / version unchanged |
| deferred issues stale | `#13` 已本地修复，`#41/#59` 已有更细 no-go docs | 更新 deferred issue wording |

## Proposed Public Writes

| 顺序 | 动作 | 目标 | 需要授权原因 |
|---:|---|---|---|
| 1 | update PR body | PR `#63` | 改变公开 review surface 和自动关闭语义 |
| 2 | comment `#13` | changelog delta issue | 本地已有 300 soft / 500 hard fix，可公开同步 |
| 3 | comment `#41` | capability negotiation issue | 本地已补 deterministic gates 和 protocol no-go plan，可公开同步 |
| 4 | comment `#59` | validation/routing observability issue | 本地已补 route JSON explanation 和 store no-go research，可公开同步 |
| 5 | comment `#60` | roadmap issue | U-160 后任务池进入 public closeout / conformance next slice，可公开同步 |
| 6 | ready for review | PR `#63` | 会改变 reviewer expectation；应在 body 修复后再做 |

## PR Body Update Requirements

| Section | Required content |
|---|---|
| Summary | 覆盖 drift metadata、canonical examples、glossary/citation、fixture smoke、CLI/validation docs、risk/audit、runtime decision gates、post-backlog research |
| Issue Sync | 每个 close target 独立 close keyword；deferred refs 分开 |
| Release Position | 明确 no release；package remains `0.7.0`；latest release `v0.7.0` |
| Validation | `npm run validate:all`、`npm run benchmark:test`、`git diff --check`、staged set excludes `MEMORY.md` |
| Local-only | `MEMORY.md` 不进仓库 |

## Blockers Before Ready-for-review

| Blocker | 当前状态 | 处理 |
|---|---|---|
| PR body close syntax | GitHub only recognizes `#33` | 先改 body |
| PR body scope | summary stale after many commits | 先改 body |
| checks | no checks reported | 本地 validation 入账；是否需要 GitHub Actions 另立任务 |
| reviews | none | ready 后等待 review |
| release version | still `0.7.0` | release 前另行 version decision |

## Decision

下一轮若用户授权公开写操作，首选动作是更新 PR `#63` body。若不授权公开写操作，应转向 U-171 到 U-180 的本地 conformance / diagnostics next slice。

## 非目标

- 本轮不更新 PR。
- 本轮不发 issue comment。
- 本轮不 ready / merge PR。
- 本轮不发布 release。
