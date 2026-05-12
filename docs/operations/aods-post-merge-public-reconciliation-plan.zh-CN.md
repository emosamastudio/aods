# AODS Post-Merge Public State Reconciliation Plan

状态：U-099 已完成
日期：2026-05-12
范围：PR merge 后 issue、release、docs、branch cleanup 顺序；不实际 merge

## 结论

PR `#63` 后续如果获准 merge，必须先完成 package / release gate，再按固定顺序核对公开状态。本轮不 merge、不 release、不关闭 issue，只记录 post-merge reconciliation plan。

## Pre-Merge Gate

| Gate | Required before merge | 当前状态 |
|---|---|---|
| PR state | owner 明确允许从 draft 进入 ready / merge | 未满足 |
| Review | reviewer 反馈已处理或 owner 明确豁免 | 未满足 |
| Version / release decision | 明确是否只 merge、不 release，或进入 version bump / release flow | 未满足 |
| Validation | `npm run release:self-check` 当前通过 | 已满足但需 merge 前重跑 |
| Package smoke | packed tarball install smoke 当前通过 | 已满足但需 merge 前重跑 |
| Close-on-merge audit | PR body close list 与 coverage matrix 一致 | 已满足 |

## Post-Merge Reconciliation Order

| 顺序 | 动作 | 验收 |
|---:|---|---|
| 1 | 确认 PR merge commit / squash commit 已进入 `main` | `gh pr view 63` state is merged |
| 2 | 拉取 / 检查 `main` 最新状态 | local `main` matches origin |
| 3 | 核对 covered issues 自动关闭 | `#33/#35/#37/#38/#39/#43-#52/#54-#58` closed |
| 4 | 核对 deferred issues 仍 open | `#41/#59/#60/#13` open |
| 5 | 如本次不发布 release，记录 no-release closeout | README 仍指向 latest public release |
| 6 | 如获准发布 release，进入 U-101 release playbook | version bump、tag、GitHub Release、rollback plan |
| 7 | 清理远端分支或保留审查分支 | 由 owner release/merge policy 决定 |
| 8 | 更新 handoff / task ledger | 记录 public state reconciliation evidence |

## Failure Handling

| Failure | Response |
|---|---|
| Covered issue 未自动关闭 | 手动核对 PR body syntax；必要时逐个补 comment/close，但需 owner 授权 |
| Deferred issue 被误关 | 立即 reopen 并说明原因 |
| README version surface 与 release 不一致 | 暂停 release，先走 version surface fix |
| Tag conflict | 不覆盖 tag；选择新 version 或撤回 release plan |
| CI after merge 失败 | 先修 main / release branch，暂停 release publication |

## Non-Goals

1. 本轮不 merge PR。
2. 本轮不 close issue。
3. 本轮不创建 tag 或 GitHub Release。
4. 本轮不删除分支。
