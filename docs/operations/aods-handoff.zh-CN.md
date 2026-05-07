# AODS Agent Handoff

日期：2026-05-07
分支：`codex/aods-v0.8-backlog`
最新提交：以 `git log -1 --oneline` 为准（本分支基线为 `35c26f0`；PR `#62` squash merge 为 `831e10b`）
状态：开发中

## 一句话结论

AODS 是独立权威规范路线。v0.7 已发布：PR `#61` 已 merge，GitHub Release `v0.7.0` 已创建，版本面已切到 `0.7.0`。U-027 implementation evidence 最小切片已通过 PR `#62` merge 到 `main`；U-028 已完成 v0.8 backlog triage；U-029 implementation acceptance criteria 已落地；U-030 drift remediation workflow 最小模型已落地；U-031 decision provenance boundary 已落地；U-032 read-model freshness / watermark profile 已落地；U-033 fixture and golden export conventions 已落地；U-034 capability negotiation re-triage 已落地；U-035 command / receipt / event triad boundary 已落地；U-036 event correction / supersession boundary 已落地；U-037 partial implementation / known-gap metadata boundary 已落地；U-038 ownership and authority hierarchy boundary 已落地；U-039 dependency ordering between surfaces boundary 已落地；U-040 deprecation and migration format boundary 已落地；U-041 v0.10 backlog triage 已完成；U-042 standard risk taxonomy boundary 已落地；U-043 local-only versus remote-capable constraints 已落地；下一轮首选 U-044 audit-log requirements for commands and adapters；`MEMORY.md` 仍保持 untracked，不进仓库。

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
| 10 | `docs/operations/aods-v0.8-backlog.zh-CN.md` | 读取 v0.8 backlog、open issue 排序和下一 drift 切片 |
| 11 | `docs/operations/aods-v0.9-backlog.zh-CN.md` | 读取 v0.9 write/event/governance 候选路线 |
| 12 | `docs/operations/aods-v0.10-backlog.zh-CN.md` | 读取 v0.10 risk/exposure/audit hardening 候选路线 |
| 13 | `docs/operations/aods-v0.7-rc-gate.zh-CN.md` | 读取 v0.7 RC gate 结论和 release note skeleton |
| 14 | `docs/operations/aods-task-ledger.zh-CN.md` | 选择下一轮任务 |
| 15 | `docs/operations/aods-round-log.zh-CN.md` | 查看当前回合和新增任务记录 |

## 当前 Git 状态

| 项 | 状态 | 说明 |
|---|---|---|
| 分支 | `codex/aods-v0.8-backlog` | 从 `main` 创建，用于 v0.8 backlog triage |
| 最新提交 | 以 `git log -1 --oneline` 为准 | 本分支基线 `35c26f0`；PR `#62` squash merge 为 `831e10b` |
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
| U-028 | 完成 v0.8 backlog triage | `aods-v0.8-backlog.zh-CN.md` 已落盘；U-029 到 U-034 已写入未完成任务；下一轮首选 implementation acceptance criteria |
| U-029 | 落地 implementation acceptance criteria 最小切片 | module meta `acceptance_criteria[]`、manifest `acceptance_summary`、validator criteria gate、compiled-pilot satisfied+planned criteria；focused / repo / benchmark tests 均通过 |
| U-030 | 定义 drift remediation workflow 最小切片 | validator JSON / text output remediation guidance、validation issue remediation schema、authority drift action table；focused / repo / benchmark tests 均通过 |
| U-031 | 定义 decision provenance boundary 最小切片 | artifact `decision_provenance` schema、source/evidence/summary ref validation、stable agent-consumable evidence posture gate；focused / repo / benchmark tests 均通过 |
| U-032 | 定义 read-model freshness / watermark profile 最小切片 | contract `read_model.freshness` schema、stable read-model missing freshness validator gate、read-model freshness remediation guidance；focused / repo / benchmark tests 均通过 |
| U-033 | 定义 fixture and golden export conventions 最小切片 | fixture manifest v1、positive/negative 命名、golden export 更新流程、compiled-pilot positive fixture example；focused / repo / benchmark tests 均通过 |
| U-034 | 重新裁剪 capability negotiation 最小模型 | provider capability、consumer requirement、compatibility matching、evidence link 已裁剪为 metadata-only 边界；handshake/discovery/auth/probing 继续 deferred |
| U-035 | 定义 command / receipt / event triad 最小边界 | write-capable stable surfaces 的 command、receipt、event_or_projection、triad_linkage 已进入 spec-level audit boundary；executor/event runtime/correction semantics 继续 deferred |
| U-036 | 定义 event correction / supersession 最小边界 | append-only event surfaces 的 correction_event、supersession_link、retraction、projection_guidance 已进入 spec-level boundary；event store/replay/migration 继续 deferred |
| U-037 | 定义 partial implementation / known-gap metadata 最小边界 | partial implementation / known gap 的 missing_capabilities、blocking_status、owner、expected_remediation、consumer guidance 已进入 spec-level boundary；roadmap system、automatic waiver、release override 继续 deferred |
| U-038 | 定义 ownership and authority hierarchy 最小边界 | overlapping stable surfaces 的 canonical_authority、derived_surface、alias_surface、conflict_policy、migration_guidance 已进入 spec-level boundary；automatic conflict resolver、ownership inference、cross-corpus authority runtime 继续 deferred |
| U-039 | 定义 dependency ordering between surfaces 最小边界 | stable surfaces 的 requires、blocks、derives_from、emits、consumes、optional_dependency 已进入 spec-level boundary；package manager、runtime scheduler、cross-repo dependency executor 继续 deferred |
| U-040 | 定义 deprecation and migration format 最小边界 | deprecated / removed stable surfaces 的 deprecation metadata、replacement links、migration guidance、affected versions、removal version、validation behavior 已进入 spec-level boundary；automatic migration tool、consumer rewrite、runtime compatibility shim 继续 deferred |
| U-041 | 完成 v0.10 backlog triage | 下一段路线收敛为 risk / exposure / audit hardening；首选 U-042 standard risk taxonomy boundary；已覆盖但 GitHub 仍 open 的 issue 不重复执行 |
| U-042 | 定义 standard risk taxonomy 最小边界 | agent-consumable surfaces 的 read_risk、write_risk、credential_risk、filesystem_risk、network_risk、external_send_risk、cost_risk、production_mutation_risk、human_approval 已进入 spec-level boundary；runtime policy engine、permission broker、approval workflow 继续 deferred |
| U-043 | 定义 local-only versus remote-capable constraints 最小边界 | local-only、local-export、remote-read、remote-write、adapter-facing、upgrade_gate 已进入 spec-level boundary；remote API gateway、auth runtime、network broker、automatic exposure upgrader 继续 deferred |

## 未完成工作

| 顺序 | 任务 ID | 目标 | 备注 |
|---:|---|---|---|
| 1 | U-044 | 定义 audit-log requirements for commands and adapters 最小边界 | 下一轮首选；对应 `#45`；不实现 audit log store |

## 失败和风险

| 项 | 原因 | 后续处理 |
|---|---|---|
| README benchmark 手改风险 | sync 区块由 `summary.mjs` 生成 | 后续涉及 benchmark README 结论时必须从 generator 改 |
| ref 语义误读风险 | `U-013` 当前只定义 canonical ref / resolution posture 的 spec boundary | 后续如继续做 ref 能力，必须显式区分 identifier / resolution status 与实际 fetch/runtime dereference，不要假设现状已支持自动跨 corpus 解析 |
| dirty worktree 混轮风险 | 当前工作树仅剩本地 untracked `MEMORY.md` | 后续 public push / PR 前确认 staged set / working tree 不包含 `MEMORY.md` |
| release 渠道混淆风险 | 正式版本发布已定为 GitHub Releases-only | 后续若出现 npm publish 相关建议或脚本扩张，不应把 registry 发布重新当成完成条件，除非 owner 明确改策略 |
| 外部公开动作风险 | GitHub issue / PR / release 会改变公开项目状态 | PR `#62` 已 merge；本轮未评论或关闭 issue、未发布 release |
| 代码漂移范围扩散风险 | drift 问题容易扩大成未裁剪的全量静态/语义分析器 | 下一步只从 topology、implementation linkage、implementation evidence 和 contract drift 最小闭环推进 |
| acceptance criteria 过度设计风险 | criteria 容易扩成通用测试编排或 arbitrary command executor | U-029 必须限制为 contract-to-evidence linkage；validator 默认不执行任意 command |
| remediation workflow 过度设计风险 | remediation 容易扩成审批系统或自动修复器 | U-030 只落 validator guidance 和 spec action vocabulary；后续审批/waiver 机制必须另立任务 |
| decision provenance 扩散风险 | provenance 容易扩成全量证据仓库、cross-corpus resolver 或 LLM summary faithfulness 判定 | U-031 只落 artifact-level declared boundary 与 deterministic ref/status gate；摘要忠实性仍归人工 review |
| read-model freshness 语义扩散风险 | freshness 容易扩成跨仓库 source fetch、数据管道水位自动计算或全量读模型复制框架 | U-032 只落 declared snapshot/export/watermark/staleness metadata 与 missing freshness gate；source watermark 充分性仍归人工 review |
| fixture / golden 扩散风险 | convention 容易扩成完整 conformance runner、自动 golden update 或全量 fixture 迁移 | U-033 只落命名、manifest 字段和更新审查流程；runner 和全量迁移必须另立任务 |
| capability negotiation 扩散风险 | negotiation 容易扩成 runtime discovery、auth exchange、provider selection、fallback ranking 或 dynamic probing | U-034 只落 metadata-only matching boundary；完整协议必须另立任务 |
| command / event 扩散风险 | triad 容易扩成 command executor、event bus runtime、exactly-once delivery 或 correction semantics | U-035 只落 spec-level audit linkage；runtime 和 event correction 必须另立任务 |
| event correction 扩散风险 | correction / supersession 容易扩成 event store、automatic replay、read-model migration 或 domain truth 判定 | U-036 只落 spec-level correction vocabulary；runtime 和 migration 必须另立任务 |
| known-gap 扩散风险 | partial / known-gap metadata 容易扩成全量 roadmap system、automatic waiver、release override 或 validator bypass | U-037 只落 spec-level consumption posture vocabulary；豁免、发布覆盖和 roadmap runtime 必须另立任务 |
| authority hierarchy 扩散风险 | ownership / authority hierarchy 容易扩成 automatic conflict resolver、ownership inference、cross-corpus authority runtime 或 automatic migration tool | U-038 只落 spec-level overlap vocabulary；冲突解析、跨 corpus runtime 和迁移工具必须另立任务 |
| dependency ordering 扩散风险 | dependency ordering 容易扩成 package manager、runtime scheduler、cross-repo dependency executor 或 automatic topological build runner | U-039 只落 spec-level dependency vocabulary；执行调度和跨仓库依赖执行必须另立任务 |
| deprecation / migration 扩散风险 | deprecation and migration 容易扩成 automatic migration tool、consumer rewrite、runtime compatibility shim、stored data transform 或 backward compatibility guarantee | U-040 只落 spec-level migration vocabulary；自动迁移、兼容 shim 和存量数据转换必须另立任务 |
| risk taxonomy 扩散风险 | risk taxonomy 容易扩成 runtime policy engine、permission broker、dynamic risk scanner、approval workflow 或 cost accounting runtime | U-042 只应先落 spec-level risk vocabulary；执行策略、审批流和动态扫描必须另立任务 |
| local / remote exposure 扩散风险 | local-only versus remote-capable constraints 容易扩成 remote API gateway、auth runtime、network broker、sandbox 或 automatic exposure upgrader | U-043 只落 spec-level exposure vocabulary；远程网关、认证运行时和自动升级必须另立任务 |
| audit-log 扩散风险 | audit-log requirements 容易扩成 audit log store、workflow engine、SIEM integration 或完整 observability subsystem | U-044 应只落 commands/adapters 的最小 audit metadata 与 receipt/event linkage；存储和观测系统必须另立任务 |

## 下一轮建议

| 顺序 | 任务 ID | 目标 | 验收标准 |
|---:|---|---|---|
| 1 | U-044 | 定义 audit-log requirements for commands and adapters 最小边界 | actor/source/target/command/idempotency key/policy decision/receipt reference/timestamp/correlation identifiers 最小 audit metadata 进入 spec；commands/adapters audit requirements 连接 command receipt event triad；不实现 audit log store |
