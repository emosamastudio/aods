# AODS Public State Refresh After Backlog Closure

任务：U-162、U-163、U-164、U-165、U-166
状态：已完成
日期：2026-05-12
范围：U-160 后公开仓库、PR、issue、release/version 状态只读刷新；不执行公开写操作

## Commands

| 目标 | 命令 |
|---|---|
| repo | `gh repo view --json nameWithOwner,url,defaultBranchRef,visibility` |
| PR state | `gh pr view 63 --json number,title,state,isDraft,headRefName,baseRefName,mergeStateStatus,reviewDecision,statusCheckRollup,commits,latestReviews,comments,closingIssuesReferences,url,updatedAt` |
| PR body/files | `gh pr view 63 --json body,files,additions,deletions,changedFiles` |
| checks | `gh pr checks 63 --watch=false` |
| issues | `gh issue list --state open --limit 100 --json number,title,state,labels,updatedAt,url` |
| releases | `gh release list --limit 20` |
| package | `node -e "const p=require('./package.json'); console.log(p.version)"` |

## Repository State

| 项 | 当前值 |
|---|---|
| repo | `emosamastudio/aods` |
| visibility | public |
| default branch | `main` |
| active branch | `codex/aods-v0.8-backlog` |
| latest pushed commit | `febd439` |

## PR State

| 项 | 当前值 | 影响 |
|---|---|---|
| PR | `#63` `[codex] Advance AODS drift, examples, and release readiness` | 当前公开 review surface |
| state | open draft | 不能视为 ready |
| merge state | clean | 没有 merge conflict |
| reviews | none | 还没有人工 review 结论 |
| checks | none reported | 当前没有 GitHub checks 作为外部 gate |
| comments | none | 无公开讨论新增 |
| changed files | 167 | diff 很大，ready 前需要 summary refresh |
| additions / deletions | 21521 / 344 | 大 PR，有审查负担 |
| updated | 2026-05-12T13:17:16Z | 已包含最新本分支提交 |

## Close-on-merge Recognition Gap

| 面 | 当前状态 |
|---|---|
| PR body intended close list | `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58` |
| GitHub recognized closing refs | `#33` only |
| Deferred refs in body | `#41/#59/#60/#13` |
| Risk | PR merge 后可能只自动关闭 `#33`，其余 intended-close issues 保持 open |
| Likely cause | `Closes #33, #35, ...` 语法只被识别为第一个 close target |
| Fix posture | 需要把每个 intended-close issue 写成独立 close keyword；这是公开 PR body 写操作，需后续任务执行 |

## Open Issue Matrix

| 类别 | Issues | 结论 |
|---|---|---|
| intended close on PR merge | `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58` | 本地已覆盖，但 PR body recognition 需要修复 |
| intentionally deferred | `#41/#59/#60/#13` | 继续 open |
| unexpected open issue | 无 | 当前 open issue 都有归类 |

## Release / Version State

| 项 | 当前值 | 结论 |
|---|---|---|
| latest GitHub release | `v0.7.0` |
| package version | `0.7.0` |
| local branch content | 已明显超过 v0.7.0 release surface |
| release decision | no-go |
| reason | PR remains draft；no checks/reviews；no version bump；no release authorization |

## Decision

本轮不执行公开写操作。下一步应先准备 PR body update 和 public follow-up approval packet，再决定是否更新 PR body、评论 deferred issues 或把 PR 标为 ready。

## 非目标

- 不修改 PR body。
- 不评论 issue。
- 不关闭 issue。
- 不创建 release。
- 不补 GitHub checks。
