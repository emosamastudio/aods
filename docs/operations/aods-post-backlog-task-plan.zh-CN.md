# AODS Post-backlog Task Plan

任务：U-161
状态：已完成
日期：2026-05-12
范围：U-160 后任务发现、任务池扩展和本轮 10 任务选择；不执行公开写操作

## 背景

U-160 完成后，当前任务池归零。按照回合规则，下一步不能凭感觉继续写代码，而应先做任务发现，把新任务写入 `aods-task-ledger.zh-CN.md`，再锁定本轮范围。

## 本轮输入

| 输入 | 结果 |
|---|---|
| Git state | `febd439` 与 `origin/codex/aods-v0.8-backlog` 一致；工作树仅 `MEMORY.md` 未跟踪 |
| AODS validation | `npm run validate:all` 通过 |
| Route query | 命中 `spec-stable-surface-contracts` 和 `spec-boot-protocol` |
| GitHub repo | `emosamastudio/aods` public，default branch `main` |
| PR state | `#63` open draft，merge state clean，无 reviews，无 checks |
| Release state | latest release / package version 仍为 `0.7.0` |

## 新任务池

| 范围 | 阶段 | 主题 | 本轮处理 |
|---|---|---|---|
| U-161 到 U-170 | S21 | post-backlog public state closure | 本轮完成 |
| U-171 到 U-180 | S22 | conformance / diagnostics next slice | 后续未完成 |
| U-181 到 U-190 | S23 | public sync / release actions | 后续未完成，含外部写操作 |
| U-191 到 U-200 | S24 | release hygiene / package / automation guard | 后续未完成 |

## 本轮选中任务

| 任务 ID | 任务 | 验收证据 |
|---|---|---|
| U-161 | Post-backlog task pool expansion and selection | 本文件 |
| U-162 | Public repository state refresh | `aods-public-state-refresh-after-backlog-closure.zh-CN.md` |
| U-163 | PR branch / merge / checks state refresh | `aods-public-state-refresh-after-backlog-closure.zh-CN.md` |
| U-164 | PR close-on-merge recognition gap audit | `aods-public-state-refresh-after-backlog-closure.zh-CN.md` |
| U-165 | Open issue coverage matrix refresh | `aods-public-state-refresh-after-backlog-closure.zh-CN.md` |
| U-166 | Release / version surface no-go refresh | `aods-public-state-refresh-after-backlog-closure.zh-CN.md` |
| U-167 | PR body stale scope audit | `aods-pr-public-action-approval-packet.zh-CN.md` |
| U-168 | Public action approval packet | `aods-pr-public-action-approval-packet.zh-CN.md` |
| U-169 | Next milestone options after task pool closure | `aods-next-milestone-options.zh-CN.md` |
| U-170 | Roadmap / changelog public follow-up plan | `aods-next-milestone-options.zh-CN.md` |

## Selection Rationale

本轮优先选择低风险、只读、治理型任务，因为公开仓库状态已经出现一个真实同步风险：PR body 写了多个 close targets，但 GitHub 只识别了一个 `closingIssuesReferences`。在修复公开状态前，先把风险、下一步和授权边界写清楚。

## 非目标

- 不更新 PR body。
- 不把 PR 标为 ready for review。
- 不评论或关闭 issue。
- 不发布 release。
- 不 bump version。
