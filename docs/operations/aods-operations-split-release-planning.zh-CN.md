# AODS operations split / release planning

日期：2026-05-13
范围：U-422 到 U-431
状态：已完成

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `3e596e7 Refresh capability fallback examples` |
| Task ledger | 通过 | 当前默认任务为 U-422 到 U-431 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## 本轮完成

| 任务 | 结果 | 证据 |
|---|---|---|
| U-422 | operations README 拆成短入口 | `docs/operations/README.md` |
| U-423 | 完整任务台账归档，当前台账只保留最近窗口和活动池 | `docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`、`docs/operations/aods-task-ledger.zh-CN.md` |
| U-424 | handoff 压缩为当前状态 / 风险 / 下一步 | `docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md`、`docs/operations/aods-handoff.zh-CN.md` |
| U-425 | historical current/archive label pilot | archive 文件声明历史归档，当前入口声明当前权威 |
| U-426 | split 后导航检查 | docs link check / release hygiene |
| U-427 | v0.9.0 release candidate planning | 下一轮 U-432 到 U-441 进入 v0.9 planning，不发布 |
| U-428 | v0.8.1 patch release decision | 不建议 v0.8.1；当前变化包含示例和治理面，优先 v0.9.0 |
| U-429 | public roadmap issue body refresh decision | `#60` 暂不编辑 body；先用 U-450 准备 refresh packet |
| U-430 | GitHub milestone creation decision | 当前没有 milestone；本轮不创建，先用 U-451 做 mapping packet |
| U-431 | next task pool expansion | 新增 U-432 到 U-481，下一轮默认 U-432 到 U-441 |

## 归档策略

| 文件 | 处理 | 原因 |
|---|---|---|
| `docs/operations/README.md` | 保留短入口 | 让新接手者 1-2 分钟内找到当前权威文件 |
| `docs/operations/aods-task-ledger.zh-CN.md` | 保留当前任务池和最近完成窗口 | 完整 400+ 行历史已经影响每轮复审效率 |
| `docs/operations/aods-handoff.zh-CN.md` | 保留当前状态、风险、下一步 | 历史细节转入 archive，避免接手时读错旧状态 |
| `docs/operations/archive/*` | 保存拆分前完整内容 | 历史不丢失，但默认不进入当前阅读路径 |

## Release 判断

- `v0.9.0` 是下一次更合理的候选：近期已落地 structured term refs、evidence freshness、observability、capability fallback metadata 和 sample maintenance。
- `v0.8.1` 不推荐：当前不是单纯 patch / typo / sample-only 变更。
- 本轮不 bump version、不打 tag、不创建 release、不创建 milestone。
- `#60/#59/#41` 继续 open；下一步先形成 close criteria / roadmap refresh packet，再决定是否编辑或关闭。

## 验证

| 命令 | 结果 |
|---|---|
| `npm run release:hygiene` | 开工前通过 |
| `npm run docs:check-links -- --json` | 通过 |
| `npm run release:hygiene` | 通过 |
| `git diff --check` | 待最终门禁记录 |

## 下一步

下一轮默认 U-432 到 U-441：v0.9 version surface audit、changelog、release notes、package dry-run、packed install smoke、release branch decision、public issue close readiness、go/no-go packet、skill sync 和 post-release checklist。
