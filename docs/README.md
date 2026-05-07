# AODS 文档入口

本目录是 AODS 仓库内部维护面的文档入口。

公开介绍和安装说明继续以根目录 `README.md` / `README.zh-CN.md` 为主；`docs/` 负责说明**如何维护 AODS 这个项目本身**，包括任务台账、回合、交接、进度口径。

## 必读顺序

1. `docs/operations/README.md`
2. `docs/operations/aods-task-ledger.zh-CN.md`
3. `docs/operations/aods-work-rules.zh-CN.md`
4. `docs/operations/aods-handoff.zh-CN.md`
5. `docs/operations/aods-round-log.zh-CN.md`

## 目录职责

| 路径 | 作用 |
|---|---|
| `docs/README.md` | AODS 仓库内部维护入口。 |
| `docs/operations/README.md` | operations 子目录入口，列出当前权威治理面。 |
| `docs/operations/aods-task-ledger.zh-CN.md` | 当前权威任务台账。 |
| `docs/operations/aods-work-rules.zh-CN.md` | AODS 项目专属工作规约。 |
| `docs/operations/aods-round-log.zh-CN.md` | 当前回合和历史回合锁定记录。 |
| `docs/operations/aods-progress-ledger.zh-CN.md` | 阶段定义和进度变化。 |
| `docs/operations/aods-handoff.zh-CN.md` | 接手入口和风险边界。 |
| `docs/operations/aods-v0.8-backlog.zh-CN.md` | v0.8 backlog triage、open issue 排序和下一 drift 切片。 |
| `docs/operations/aods-v0.9-backlog.zh-CN.md` | v0.9 write/event/governance 候选路线和 U-035 执行记录。 |
| `docs/operations/aods-v0.10-backlog.zh-CN.md` | v0.10 risk/exposure/audit hardening 候选路线和 U-041 triage 记录。 |
| `docs/operations/aods-v0.11-backlog.zh-CN.md` | v0.11 documentation / authoring quality 候选路线和 U-047 triage 记录。 |
| `docs/operations/aods-surface-family-example-plan.zh-CN.md` | `#56` surface-family example pack 分批路线、U-051 read-model、U-052 command/receipt、U-053 event/correction、U-054 adapter/capability、U-055 artifact/export/policy-gate、U-058 resource 包结果和本地收束结论。 |
| `docs/operations/aods-expanded-task-plan.zh-CN.md` | U-058 后的扩展任务池、批量执行规则和下一批推荐。 |
| `docs/operations/aods-glossary-registry-plan.zh-CN.md` | `#57` glossary / canonical-term registry v2 boundary 和后续 schema/validator/example 任务裁剪。 |
| `docs/operations/aods-external-citation-plan.zh-CN.md` | `#58` external citation / provenance metadata boundary 和后续 schema/validator/example 任务裁剪。 |
| `docs/operations/aods-github-public-sync-triage.zh-CN.md` | `#54-#58`、`#60/#41` 的本地覆盖与公开状态差异、owner 审批矩阵。 |
| `docs/operations/aods-next-code-drift-slice.zh-CN.md` | 下一段代码漂移最小切片选择，确认 U-071 implementation reality locator hardening。 |
| `docs/operations/aods-route-discoverability-review.zh-CN.md` | `#9/#10/#17` 与 route / boot_by_touch discoverability 残留复盘，新增 U-076 建议。 |

## 当前维护边界

1. 公开 README、schema、spec、lib、benchmarks、examples 都仍属于项目维护范围。
2. benchmark sync 区块、generated benchmark 输出和 source generator 之间必须保持一致，不可只改生成结果。
3. 如果修改的是 AODS 语义面，优先遵循 AODS 自己的 compiled-corpus-first 权威结构，而不是把 README 当成第一权威。
