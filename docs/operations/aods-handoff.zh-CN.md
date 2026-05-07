# AODS Agent Handoff

日期：2026-05-07
分支：`codex/aods-implementation-evidence`
最新提交：当前分支包含 U-027 实现提交和 PR 记录提交
状态：开发中

## 一句话结论

AODS 是独立权威规范路线。v0.7 已发布：PR `#61` 已 merge，GitHub Release `v0.7.0` 已创建，版本面已切到 `0.7.0`。当前分支已完成 U-027 implementation evidence 最小切片并创建 draft PR `#62`；`MEMORY.md` 仍保持 untracked，不进仓库。

## 必读顺序

| 顺序 | 文档 | 用途 |
|---:|---|---|
| 1 | `manifest.json` | 明确当前 compiled-corpus-first 根入口 |
| 2 | `README.md` | 了解当前公开定位和版本面 |
| 3 | `docs/README.md` | 进入项目内部维护面 |
| 4 | `docs/operations/README.md` | 找到当前权威治理文件 |
| 5 | `docs/operations/aods-v0.7-owner-roadmap.zh-CN.md` | 读取 v0.7 owner 决策 |
| 6 | `docs/operations/aods-takeover-plan.zh-CN.md` | 读取 2026-05-07 接手计划和当前边界 |
| 7 | `docs/operations/aods-dirty-worktree-attribution.zh-CN.md` | 读取 dirty worktree 归因和提交 / PR 拆分建议 |
| 8 | `docs/operations/aods-github-sync-approval.zh-CN.md` | 读取 GitHub 公开动作审批矩阵 |
| 9 | `docs/operations/aods-code-drift-roadmap.zh-CN.md` | 读取代码漂移路线和 implementation evidence 最小切片 |
| 10 | `docs/operations/aods-v0.7-rc-gate.zh-CN.md` | 读取 v0.7 RC gate 结论和 release note skeleton |
| 11 | `docs/operations/aods-task-ledger.zh-CN.md` | 选择下一轮任务 |
| 12 | `docs/operations/aods-round-log.zh-CN.md` | 查看当前回合和新增任务记录 |

## 当前 Git 状态

| 项 | 状态 | 说明 |
|---|---|---|
| 分支 | `codex/aods-implementation-evidence` | 从 `main` 创建的 U-027 实现分支 |
| 最新提交 | U-027 PR 分支提交 | 基于 v0.7 release completion 之后的 `main`；已 push 到 `origin/codex/aods-implementation-evidence` |
| 剩余 dirty | 仅 untracked `MEMORY.md` | `MEMORY.md` 为本地记忆文件，不进仓库 |

## 已完成工作

| 任务 ID | 内容 | 验收证据 |
|---|---|---|
| U-000 | 硬化公开文档并同步 benchmark 输出 | README、benchmark source、生成报告、验证命令 |
| U-000A | 建立 GitHub contribution surfaces | CONTRIBUTING、issue forms、README 入口 |
| U-000B | 启动 Discussions 对外讨论面 | discussion `#26`、`#27` |
| U-000C | 完成 issue backlog review | `plan.md` 中的 wave 记录，明确 `#28` 为下一主线 |
| U-001 | 安装 project-level work standard 并补齐初始任务台账 | `AGENTS.md`、`.github/copilot-instructions.md`、`docs/README.md`、`docs/operations/aods-*.md` |
| U-001A | 以 AODS owner 视角复审任务台账 | `aods-task-ledger.zh-CN.md` 已纳入 `#29-#32/#60` 并重新排序；低价值 issue 已降级 |
| U-002 | 裁剪 v0.7 owner roadmap | `aods-v0.7-owner-roadmap.zh-CN.md`、更新后的 task ledger |
| U-003 | 定义 stable-surface authority 和 over-implementation 治理原则 | `spec-authority-governance` detail module、surface-governance capsule route、strict validation |
| U-004 | 定义 surface lifecycle / exposure state machine | lifecycle states、transition review、strict validation |
| U-005 | 定义 sensitive-surface / redaction 最小模型 | `spec/stable-surface-contracts.json`、schema mirror、validator negative gate、focused + repo validation |
| U-006 | 定义 contract completeness 最小 profile | 只保留 `read-model` / `command` / `implementation-linkage`；manifest/module profile mirror 已落盘 |
| U-007 | 定义 `project_topology` concrete pilot（design-only） | topology 字段、状态、迁移路径已落盘；显式 defer U-008/U-009/U-010 实现 |
| U-008 | 落地 root `project_topology.implementation_repos[]` | `project_topology` 已进入 `manifest.schema`、`authoring.schema`、`compile` 链路与 compiled-pilot example |
| U-012 | 定义 stable surface schema versioning / compatibility guidance | `strict` / `versioned` / `experimental` breaking policy 与 summary mirror 校验已落盘 |
| U-011 | 定义 validation severity / gating 最小版 | `spec-validation` 已形成 severity taxonomy 与 gate matrix，并明确当前 runtime bucket 的边界 |
| U-014 | 定义 adapter-facing / capability negotiation 最小契约 | stable contract authority 已补 minimum adapter capability contract，显式不引入 negotiation handshake |
| U-009 | 落地 module implementation linkage | module-level implementation metadata 已接入 schema / compile / manifest mirror / validator，并与 root topology repo id 建立 referential gate |
| U-010 | 落地 topology-aware `validate --reality` 摘要 | strict reality 现输出 `linked_modules / unlinked_modules / checked_paths / missing_paths / unchecked_reason`，能显式暴露 descriptive-only locator 的未检查状态 |
| U-013 | 定义 cross-surface ref / unresolved semantics 最小边界 | authority + validation spec 已明确 canonical ref、owner、resolution status 与 unresolved posture；当前不做自动 fetch / auto-resolution |
| U-018 | 降低 `shared_invariants` 字面脆弱性 | validator 现对 invariant 做规范化比较，同时保留 claim-conflict 的高信号语义检测 |
| U-016 | 增加 empty `boot_by_touch` large-corpus advisory | validator L3 warning、scaffold regression |
| U-017 | 改善 capsule-shorter-than-detail 诊断 | target 去重、capsule/target token count 诊断、scaffold regression |
| U-019 | 完成 stale issue hygiene | `#16` 已关闭；`#13` 保留但延后并已留言 |
| U-021 | 修复接手 review findings | stable metadata compile mirror、duplicate implementation repo id validation、focused / repo / benchmark / release gates 均已通过 |
| U-020 | 建立 AODS 接手计划并同步治理台账 | 接手计划、任务台账、handoff、round log、operations README 已更新 |
| U-022 | 完成 dirty worktree 归因计划 | 27 个 tracked modified、14 个 untracked 已分组；建议 4 组提交 / PR；未 stage |
| U-023 | 完成 GitHub 同步审批矩阵 | 当前 0 open PR、37 open issues；issue 关闭、评论、PR、release 全部需要 owner 确认 |
| U-024 | 完成代码漂移路线设计 | 下一最小切片确定为 implementation evidence / contract drift；不做全量代码扫描器 |
| U-025 | 完成 v0.7 RC gate decision | local RC candidate / conditional pass；`release:self-check` 通过；不直接发布 |
| U-026 | 执行 v0.7 release branch / PR / Release / issue sync | PR `#61` 已 merge；GitHub Release `v0.7.0` 已创建；13 个 v0.7 覆盖 issues 已关闭；`#60/#41` 已评论保留；`MEMORY.md` 未进仓库 |
| U-027 | 落地 implementation evidence 最小切片 | module meta evidence、manifest `evidence_summary`、validator current-evidence gate、reality locator checks、compiled-pilot current+planned evidence；focused / repo / benchmark tests 均通过 |

## 未完成工作

当前任务台账无未完成项。U-027 已完成并创建 draft PR `#62`；下一轮应先审查 / 合并该 PR，再进入 v0.8 backlog 或下一段 contract drift。

## 失败和风险

| 项 | 原因 | 后续处理 |
|---|---|---|
| README benchmark 手改风险 | sync 区块由 `summary.mjs` 生成 | 后续涉及 benchmark README 结论时必须从 generator 改 |
| ref 语义误读风险 | `U-013` 当前只定义 canonical ref / resolution posture 的 spec boundary | 后续如继续做 ref 能力，必须显式区分 identifier / resolution status 与实际 fetch/runtime dereference，不要假设现状已支持自动跨 corpus 解析 |
| dirty worktree 混轮风险 | 当前工作树仅剩本地 untracked `MEMORY.md` | 后续 public push / PR 前确认 staged set / working tree 不包含 `MEMORY.md` |
| release 渠道混淆风险 | 正式版本发布已定为 GitHub Releases-only | 后续若出现 npm publish 相关建议或脚本扩张，不应把 registry 发布重新当成完成条件，除非 owner 明确改策略 |
| 外部公开动作风险 | GitHub issue / PR / release 会改变公开项目状态 | 当前仅创建 draft PR `#62`；未合并、未评论或关闭 issue、未发布 release |
| 代码漂移范围扩散风险 | drift 问题容易扩大成未裁剪的全量静态/语义分析器 | 下一步只从 topology、implementation linkage、implementation evidence 和 contract drift 最小闭环推进 |

## 下一轮建议

| 顺序 | 任务 ID | 目标 | 验收标准 |
|---:|---|---|---|
| 1 | 新任务 | 审查并合并 U-027 PR | PR `#62` 通过审查和 CI 后再 merge |
| 2 | 新任务 | 复盘 v0.7 release 后的 open issues | 保留 `#60/#41` 和 deferred issues，重新排 v0.8 backlog |
| 3 | 新任务 | 选择下一段 contract drift 切片 | 从 evidence freshness、implementation fingerprint、或 contract diff 中裁剪一个最小闭环 |
