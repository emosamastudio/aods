# AODS changelog delta ergonomics review

状态：U-083 已完成
日期：2026-05-08
适用范围：GitHub `#13` changelog.delta 300-character hard limit 是否阻塞当前 release workflow

## 人话说明

这轮复查的是一条老的体验问题：记录变更的文字有长度上限，确实可能让复杂说明写不完整。但它现在没有挡住发布检查，所以不该抢占更重要的主线。价值是把“以后要改”和“现在必须改”分清楚。

## GitHub 状态快照

| 项 | 结论 |
|---|---|
| Issue | `#13` open |
| 标题 | changelog.delta 300-character hard limit is too restrictive for multi-change version bumps |
| 标签 | `enhancement`、`priority/p3`、`area/schema` |
| 最近公开更新时间 | 2026-05-02 |
| 现有 owner 回复 | 已确认问题有效，但延后到 foundation 主线之后 |

## 当前仓库事实

| 检查项 | 结果 |
|---|---|
| Schema 现状 | `schema/module.schema.json` 的 `changelog_entry.delta.maxLength` 仍为 300 |
| Authoring schema | 通过 module schema ref 继承同一限制 |
| Generated schema copies | compiled-pilot 与 benchmark corpus schema copy 也保持 300 |
| Release workflow | `release:self-check` 仍是 `validate:repo` + `npm pack --dry-run` |
| 最近 release gate | 前序轮次已多次通过，不被 `#13` 阻塞 |

## 判断

`#13` 是真实 ergonomics 问题，但不是当前 release workflow 的阻塞项。

原因：

1. 当前模块 changelog 已能在 300 字符限制内通过 validation。
2. 最近 release gate 和 package dry-run 已通过，说明它没有阻断当前发布链路。
3. 直接把上限从 300 放宽到 500 会改变 schema 行为，但没有同时定义 warning/error 分层策略。
4. 更稳妥的路线是后续单独设计两层限制或结构化多条 delta，而不是在本轮顺手放宽。

## Public response plan

如果需要在公开 issue 上更新，可采用以下口径：

> Re-reviewed on 2026-05-08. This remains a valid authoring ergonomics issue, but it is not currently blocking the release workflow: the current corpus validates under the 300-character cap and release self-check remains green. Preferred future direction is still a small schema/validator design task, likely either warn at 300 and fail at a higher cap, or support structured multi-item deltas. Keeping this open as P3 rather than folding it into the current hardening branch.

本轮不直接评论 issue，避免把本地任务复盘误当成公开承诺变更。

## 后续

后续如果要实现，建议另开任务，先写 schema/validator 回归，再决定 two-tier limit 与 string-array 方案二选一。当前主线可继续进入 runtime boundary research spike。
