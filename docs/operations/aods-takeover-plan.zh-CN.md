# AODS 接手计划

状态：当前接手计划
日期：2026-05-07

## 接手前提

AODS 是独立的权威规范路线。Polaris 可以把 AODS 集成为其系统权威规范层，但 AODS 的开发、发布、验证和路线裁剪不依赖 Polaris 项目节奏。

本计划只覆盖 AODS 仓库内部的标准、schema、validator、compiler、examples、benchmark、release 和 GitHub 治理面。除非 owner 明确扩展范围，不处理 Polaris sibling repo 的实现工作。

## 愿景

AODS 要成为 agent-first 的权威规范系统：让一个项目的结构、能力、稳定面、实现关联、验证规则和演进边界能被机器可靠读取、被人审查、被 CI 复现，并且能把“文档声称”和“实现现实”之间的漂移显式暴露出来。

## 近期目标

当前阶段目标不是扩大功能面，而是把 v0.7 本地实现收敛成可审查、可发布、可同步 GitHub 的状态：

1. 修复接手 review 中确认的 validator / compiler 缺口。
2. 更新 AODS 自己的任务台账、handoff 和 round log，避免继续以 2026-05-02 的旧状态作为当前真相。
3. 对当前 dirty worktree 做文件归因，拆分为可审核的提交或 PR 单元。
4. 为 GitHub issue / PR / release 同步列出审批点，外部公开动作不自动执行。
5. 把“代码漂移”纳入后续路线，但先从 AODS 已有 topology / implementation linkage / reality validation 能力向前演进，不直接跳到大而全代码扫描器。

## 架构判断

| 层 | 当前权威面 | 接手判断 |
|---|---|---|
| 标准语义层 | `manifest.json`、`spec/`、`schema/`、`modules/` | compiled-corpus-first 是根权威；source-first 仅作为示例链路。 |
| 参考实现层 | `bin/`、`lib/compile.mjs`、`lib/validate.mjs`、`lib/corpus-helpers.mjs` | CLI / compiler / validator 是当前语义可执行性的核心。 |
| 示例与证据层 | `examples/compiled-pilot-source/`、`examples/compiled-pilot/`、`benchmarks/aods-eval-lab/` | 每次语义改动必须能通过 source-first regression、compiled corpus validation 和 benchmark self-check。 |
| 治理层 | `docs/operations/`、GitHub issues / PRs / releases | 本地 operations 文档先行；GitHub 公开写操作需要 owner 明确确认。 |

## 当前回合计划

| 顺序 | 任务 ID | 任务 | 交付物 | 验收标准 |
|---:|---|---|---|---|
| 1 | U-020 | 建立 AODS 接手计划并同步治理台账 | `aods-takeover-plan.zh-CN.md`、operations README、task ledger、round log、handoff | 文档明确愿景、目标、架构、路线、验收标准和外部动作审批点。 |
| 2 | U-021 | 记录并封存接手 review finding 修复 | task ledger、round log、handoff | 已修复 compiler stable metadata mirror 与 duplicate repo id validation；验证命令全部记录。 |
| 3 | U-022 | 对当前 dirty worktree 做提交/PR 归因计划 | task ledger / 后续 round log | 不 staging；按文件组给出拆分建议和风险。 |
| 4 | U-023 | 制定 GitHub issue / PR 同步审批矩阵 | task ledger / handoff | 区分可本地完成项与需要 owner 确认的公开动作。 |
| 5 | U-024 | 设计代码漂移路线的最小下一切片 | task ledger / 后续设计文档 | 以 implementation evidence 和 contract drift 为下一步，不引入未裁剪的全量代码分析框架。 |

## 代码漂移路线

代码漂移在 AODS 后续规划内，但应该分层推进：

| 层级 | 问题 | 当前基础 | 下一步 |
|---|---|---|---|
| L1 可见性漂移 | manifest 声称存在 implementation，但 repo/path 不存在或不可检查 | `project_topology`、module `implementation`、`validate --reality` topology summary | 继续硬化 repo locator、path existence、unchecked reason 的诊断质量。 |
| L2 契约漂移 | 稳定面 contract / redaction / schema versioning 与实现证据不一致 | stable metadata mirror、contract profiles、schema versioning policy | 设计 implementation evidence artifact：声明哪个测试、路径、导出符号或 CI 检查证明某 contract。 |
| L3 语义漂移 | 实现行为偏离规范意图，但结构和路径仍存在 | 暂无完整运行时 oracle | 先以 acceptance examples / conformance fixtures / benchmark scenarios 做窄域验证，不让 LLM 直接充当唯一事实来源。 |

## 后续路线

| 阶段 | 目标 | 退出条件 |
|---|---|---|
| R0 内部收敛 | 本地计划、台账、handoff 与已修复代码一致 | operations 文档更新；`git diff --check` 通过。 |
| R1 变更拆分 | 把 dirty worktree 拆成可审查组 | 文件归因清晰；owner 确认是否创建 branch / stage / commit。 |
| R2 GitHub 同步 | PR、issue 状态和 release note 与本地真实状态对齐 | owner 批准外部公开写操作后执行。 |
| R3 v0.7 release candidate | 形成可发布候选 | `npm run validate:all`、`npm run benchmark:test`、`npm run release:self-check` 通过，且 release strategy 无冲突。 |
| R4 drift hardening | 开始 implementation evidence / contract drift 最小切片 | 新 spec / schema / validator / regression 覆盖最小闭环。 |

## 非目标

- 不把 AODS 变成 Polaris 子模块工作流。
- 不自动修改 sibling repo。
- 不在未获确认时创建远端 PR、关闭 issue、评论 issue、推送 branch 或发布 release。
- 不把 full-code semantic scanner 作为下一步默认目标。
- 不为了清理 dirty worktree 回滚或覆盖不属于当前任务的本地改动。

## 接手验收标准

| 类别 | 标准 |
|---|---|
| 文档真相 | `docs/operations/` 明确当前回合、未完成任务、已完成 review fix 和下一步路线。 |
| 代码证据 | 接手 review finding 的修复已通过 focused regression、repo validation、benchmark test、release self-check。 |
| Git 安全 | 不 stage、不 commit、不 push 不相关 dirty；外部公开动作前必须 owner 确认。 |
| 路线清晰 | 代码漂移进入计划，但以 AODS topology / implementation evidence 为入口分层推进。 |
