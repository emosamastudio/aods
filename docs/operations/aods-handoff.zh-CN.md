# AODS Agent Handoff

日期：2026-05-08
分支：`codex/aods-v0.8-backlog`
最新提交：以 `git log -1 --oneline` 为准（本分支基线为 `35c26f0`；PR `#62` squash merge 为 `831e10b`）
状态：开发中

## 一句话结论

AODS 是独立权威规范路线。v0.7 已发布，U-027 到 U-067 已连续落地 implementation drift、authoring quality、surface examples、glossary registry 和 external citation 能力。U-068 到 U-077 已完成 public sync triage、next drift slice、route discoverability、reality locator diagnostics、public docs navigation、v0.12+ backlog triage、release readiness gate、GitHub public sync 和 implementation evidence stale/current hygiene。draft PR `#63` 已打开，已覆盖 issue 在 PR 合并时自动关闭，`#41/#59/#60` 保持 open 并已留言。下一轮首选 U-078 capability compatibility metadata deterministic gates。`MEMORY.md` 仍保持 untracked，不进仓库。

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
| 13 | `docs/operations/aods-v0.11-backlog.zh-CN.md` | 读取 documentation / authoring quality 候选路线 |
| 14 | `docs/operations/aods-expanded-task-plan.zh-CN.md` | 读取扩展任务池、批量执行规则和下一批推荐 |
| 15 | `docs/operations/aods-glossary-registry-plan.zh-CN.md` | 读取 glossary registry v2 boundary |
| 16 | `docs/operations/aods-external-citation-plan.zh-CN.md` | 读取 external citation metadata boundary |
| 17 | `docs/operations/aods-github-public-sync-triage.zh-CN.md` | 读取本地覆盖与 GitHub 公开状态差异 |
| 18 | `docs/operations/aods-next-code-drift-slice.zh-CN.md` | 读取下一段代码漂移最小切片 |
| 19 | `docs/operations/aods-route-discoverability-review.zh-CN.md` | 读取 route / boot_by_touch 残留复盘 |
| 20 | `docs/operations/aods-v0.12-backlog.zh-CN.md` | 读取 v0.12+ public sync 后任务池和后续 drift route |
| 21 | `docs/operations/aods-v0.11-release-readiness.zh-CN.md` | 读取 U-074 release readiness gate 和 release notes skeleton |
| 22 | `docs/operations/aods-implementation-evidence-hygiene.zh-CN.md` | 读取 U-077 evidence stale/current hygiene 结果 |
| 23 | `docs/operations/aods-v0.7-rc-gate.zh-CN.md` | 读取 v0.7 RC gate 结论和 release note skeleton |
| 24 | `docs/operations/aods-task-ledger.zh-CN.md` | 选择下一轮任务 |
| 25 | `docs/operations/aods-round-log.zh-CN.md` | 查看当前回合和新增任务记录 |

## 当前 Git 状态

| 项 | 状态 | 说明 |
|---|---|---|
| 分支 | `codex/aods-v0.8-backlog` | 已推送到远端；draft PR `#63` 指向 `main` |
| 最新提交 | 以 `git log -1 --oneline` 为准 | 本分支基线 `35c26f0`；PR `#62` squash merge 为 `831e10b` |
| 剩余 dirty | 提交后预期仅 untracked `MEMORY.md` | `MEMORY.md` 为本地记忆文件，不进仓库；提交前只 stage 本轮代码/文档 |

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
| U-044 | 定义 audit-log requirements for commands and adapters 最小边界 | actor、source、target、command_reference、idempotency_key、policy_decision、receipt_reference、timestamp、correlation_identifier 已进入 spec-level boundary；audit log store、workflow engine、SIEM integration、observability backend 继续 deferred |
| U-045 | 定义 lifecycle state-machine profile for operational objects 最小边界 | lifecycle state、display status、initial/terminal states、transition、guard、timeout/expiration、retry policy、cancellation、cleanup、event/receipt link 已进入 spec-level boundary；workflow engine、scheduler、retry runtime、cleanup executor 继续 deferred |
| U-046 | 定义 observability metadata for validation and routing decisions 最小边界 | rule id、severity、source location、dependency path、routing reason、selected/skipped modules、suggested next action 已进入 spec-level boundary；CLI output subsystem rewrite、dashboard、trace store、graph database 继续 deferred |
| U-047 | 复盘 documentation / authoring quality backlog 并选择下一最小切片 | `#54-#58` 已分类；下一轮首选 `#55` paired-surface sync quality metrics；`#54` 多数已由 AOP 覆盖，`#56` 后续拆 example pack，`#57/#58` 另立 schema/provenance 设计 |
| U-048 | 定义 human-surface synchronization quality metrics 最小边界 | paired surface exact invariant、semantic coverage、omitted constraint、stale example、authority mismatch、sync freshness 和 quality report vocabulary 已进入 spec-level boundary |
| U-049 | 补齐 agent-primary density examples and authoring guidance 最小切片 | AOP good/bad examples 和 authoring guidance 已覆盖 canonical terms、explicit constraints、uncertainty markers、labeled examples；style linter 和文档门户重写继续 deferred |
| U-050 | Canonical surface-family example pack triage | `#56` 已拆为 read-model、command/receipt、event/correction、adapter/capability、artifact/export/policy-gate 五批 |
| U-051 | 落地 read-model + implementation-linkage canonical example pack 最小切片 | compiled-pilot source-first example 已包含 read-model freshness、watermark、implementation evidence、acceptance criteria、fixture manifest 和 focused regression |
| U-052 | 落地 command + receipt canonical example pack 最小切片 | compiled-pilot source-first example 已包含 command contract、receipt output、audit/risk posture、implementation evidence、acceptance criteria、fixture manifest 和 focused regression；command executor/event bus 继续 deferred |
| U-053 | 落地 event + correction/supersession canonical example pack 最小切片 | compiled-pilot source-first example 已包含 append-only event shape、correction/supersession/retraction/projection guidance、implementation evidence、acceptance criteria、fixture manifest 和 focused regression；event store/replay/migration 继续 deferred |
| U-054 | 落地 adapter + capability/exposure canonical example pack 最小切片 | compiled-pilot source-first example 已包含 provider capability、consumer requirement、exposure/audit posture、implementation evidence、acceptance criteria、fixture manifest 和 focused regression；negotiation/auth/probing/remote gateway 继续 deferred |
| U-055 | 落地 artifact/export/policy-gate canonical example pack 最小切片 | compiled-pilot source-first example 已包含 artifact export surface、golden export review、policy gate / validation notes、implementation evidence、acceptance criteria、fixture manifest 和 focused regression；conformance runner、自动 golden update、全量 fixture 迁移继续 deferred |
| U-056 | 复盘 surface-family example pack 收束质量并制定下一阶段 backlog triage | 已只读审查 `#56/#57/#58`；确认 `#56` 五个已裁剪包已完成但 resource residual gap 仍存在；下一步先做 U-057 resource boundary triage，`#57/#58` 后移 |
| U-057 | 裁剪 resource surface canonical example boundary 与最小示例路线 | 已确认 resource 先作为 declared resource surface / resource scope 示例表达 identity、scope、owner、read/write risk、exposure、cleanup、evidence 和 acceptance linkage；下一步 U-058 落地 source-first example pack |
| U-058 | 落地 resource surface canonical example pack 最小切片 | compiled-pilot source-first example 已包含 resource identity、scope、owner、read/write risk、exposure class、cleanup posture、implementation evidence、acceptance criteria、fixture manifest 和 focused regression；resource runtime、scheduler、cleanup executor、permission broker 继续 deferred |
| U-059 | 扩展 U-058 后任务池并制定批量执行规则 | 已新增扩展任务计划，任务池扩展为 U-060 到 U-075；后续每轮仍先审查上一轮质量，审查通过后可批量执行低冲突任务 |
| U-060 | 裁剪 glossary / canonical-term registry v2 boundary 与最小实现路线 | 已确认 v1 string glossary 兼容，v2 record 最小字段、validator gate 和 U-062/U-063/U-064 后续任务已裁剪 |
| U-061 | 裁剪 external citation / provenance metadata boundary 与最小实现路线 | 已确认 external citation 独立于 internal provenance / decision_provenance，module-level citation registry + local citation refs 为最小模型，U-065/U-066/U-067 后续任务已裁剪 |
| U-062 | 落地 glossary registry v2 最小 schema 与 authoring compile mirror | root / companion / authoring glossary 支持 v1 string shorthand 与 v2 canonical term record；source-first compile mirror 已有 focused regression |
| U-063 | 落地 glossary registry deterministic validator gates | validator 已检查 `term_id` key match、alias collision、deprecated replacement resolution、linked surface ref resolution；不做自然语言扫描或 resolver runtime |
| U-064 | 增加 glossary registry canonical example pack | compiled-pilot source-first example 已展示 canonical term、alias、deprecated term、owner、linked surfaces、compiled companion golden export 和 focused regression |
| U-065 | 落地 external citation metadata 最小 schema 与 compile mirror | module-level `external_citations[]` 与 section/artifact/decision_provenance `citation_refs[]` 已进入 module schema；source-first positive regression 覆盖 compile mirror；不实现 crawler 或 remote fetch |
| U-066 | 落地 external citation validator gates | validator 已检查 citation id uniqueness、citation ref resolution、authoritative locator/version completeness、assumption posture、stable current authoritative citation；不做 fact checker 或 LLM faithfulness judge |
| U-067 | 增加 external citation / provenance canonical example pack | compiled-pilot governance module 已展示 current external authority、unsupported assumption、section/artifact/decision_provenance citation refs、fixture manifest 和 focused regression；不实现 crawler、remote fetch、fact checker、claim detector 或 resolver |
| U-068 | 复盘 GitHub issue 本地覆盖与公开状态差异 | `#54-#58` 本地覆盖已领先公开状态；U-072 已补 public docs navigation；后续由 U-075 执行 public sync；`#60/#41` 保持 open |
| U-069 | 选择下一段代码漂移最小切片 | 下一段选择 U-071 implementation reality locator drift hardening；不做全量扫描器、LLM judge、remote clone 或 evidence command executor |
| U-070 | 复盘 boot-by-touch / route discoverability 残留 | `#9/#10/#17` 保持 closed；本地 strict warnings=0；新增 U-076 route subcommand help / smoke test 残留任务 |
| U-071 | 强化 implementation reality locator drift 检查 | `validate --reality --json` 现在输出 `topology.unchecked_repos[]`，`unchecked_reason` 包含 repo id、原因和 locator；validation/stable contract spec 已同步输出契约；不做 remote clone/fetch、全量扫描器、LLM judge 或 evidence command executor |
| U-076 | 增加 route 子命令 help / discoverability smoke test | `aods route --help` 现在输出 route 用法、stage 和 intent 枚举；focused CLI regression 覆盖；不改变 route ranking |
| U-072 | 更新 public docs navigation for completed example packs | README / docs 已集中指向 source-first pilot、六类 surface-family pack、glossary registry 和 external citation / provenance 示例；benchmark sync 区块未手改 |
| U-073 | 制定 v0.12 backlog triage | `aods-v0.12-backlog.zh-CN.md` 已把 open/deferred issues 重新分类到 public sync、covered local、deferred runtime 和 v0.12+ 新任务池；新增 U-077 到 U-084 |
| U-074 | 执行 v0.11 累积变更 release readiness gate | `release:self-check` 通过；benchmark tests 74/74；dry-run package 50 files / 199.5 kB；`examples/compiled-pilot/` 已进入 package files；本轮未发布 release、未 bump version |
| U-075 | GitHub issue / PR / release public sync execution | 远端分支 `codex/aods-v0.8-backlog` 与 draft PR `#63` 已创建；`#33/#35/#37/#38/#39/#43-#52/#54-#58` 设置 close-on-merge；`#41/#59/#60` 已留言保留；未发布 release、未 bump version |
| U-077 | Implementation evidence stale/current hygiene | `validate --reality` topology summary 已输出 current/planned/stale/blocked evidence counters；stale evidence 与 missing-current-evidence warning 均有 remediation；不执行 evidence command |

## 未完成工作

| 顺序 | 任务 ID | 目标 | 备注 |
|---:|---|---|---|
| 1 | U-078 | Capability compatibility metadata deterministic gates | `#41` residual；full handshake 继续 deferred |
| 2 | U-079 | Validate / route JSON explanation minimal enrichment | `#59` residual；不重写 CLI output subsystem |
| 3 | U-080 | Fixture / golden export smoke runner | `#48` residual；不做完整 conformance runner |
| 4 | U-081 | Source-first adoption guide for example packs | public adoption docs；不改 benchmark sync 区块 |
| 5 | U-082 | External citation stale/current hygiene report | citation hygiene；不做 crawler/fact checker |
| 6 | U-083 | Changelog delta ergonomics review | P3；仅在 release workflow 证明确有阻塞时升级 |
| 7 | U-084 | Runtime-boundary research spike | P3；只研究边界，不实现 runtime |

## 失败和风险

| 项 | 原因 | 后续处理 |
|---|---|---|
| README benchmark 手改风险 | sync 区块由 `summary.mjs` 生成 | 后续涉及 benchmark README 结论时必须从 generator 改 |
| ref 语义误读风险 | `U-013` 当前只定义 canonical ref / resolution posture 的 spec boundary | 后续如继续做 ref 能力，必须显式区分 identifier / resolution status 与实际 fetch/runtime dereference，不要假设现状已支持自动跨 corpus 解析 |
| dirty worktree 混轮风险 | 当前工作树仅剩本地 untracked `MEMORY.md` | 后续 public push / PR 前确认 staged set / working tree 不包含 `MEMORY.md` |
| release 渠道混淆风险 | 正式版本发布已定为 GitHub Releases-only | 后续若出现 npm publish 相关建议或脚本扩张，不应把 registry 发布重新当成完成条件，除非 owner 明确改策略 |
| release version surface 风险 | U-074/U-075 后 package dry-run 仍为 `0.7.0`，但本地包含 v0.7 后累积变更 | 后续若创建新 release，必须先确认 version bump、release branch 和 tag；不能复用 `v0.7.0` |
| 外部公开动作风险 | GitHub issue / PR / release 会改变公开项目状态 | PR `#63` 已创建为 draft；已覆盖 issue 只设置 close-on-merge；`#41/#59/#60` 已留言但保持 open；未发布 release |
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
| audit-log 扩散风险 | audit-log requirements 容易扩成 audit log store、workflow engine、SIEM integration 或完整 observability subsystem | U-044 只落 commands/adapters 的最小 audit metadata 与 receipt/event linkage；存储和观测系统必须另立任务 |
| lifecycle state-machine 扩散风险 | lifecycle profile 容易扩成 workflow engine、scheduler、retry runtime、cleanup executor 或完整 operational object runtime | U-045 只落 state-machine profile vocabulary；执行、调度和清理必须另立任务 |
| validation/routing observability 扩散风险 | observability metadata 容易扩成 CLI output subsystem rewrite、dashboard、trace store 或 graph database | U-046 只落 machine-readable explanation vocabulary；输出重写和存储必须另立任务 |
| documentation / authoring quality 扩散风险 | authoring quality backlog 容易扩成未裁剪的全量 authoring framework、文档门户重写或 retrieval runtime | U-047 已完成 triage；后续按 U-048 最小边界推进 |
| sync quality metrics 扩散风险 | paired-surface quality metrics 容易扩成新 diff engine、LLM semantic judge、dashboard 或自动修复器 | U-048 已只定义 quality dimensions、drift classes 和 report vocabulary |
| authoring examples 扩散风险 | agent-primary density examples 容易扩成 style linter、全量写作框架或文档门户重写 | U-049 已只补最小 good/bad examples 和 authoring guidance，不改变 AOP 核心语义 |
| surface-family example pack 扩散风险 | canonical example packs 容易扩成全量示例库、fixture rewrite 或覆盖所有 surface families | U-050 已完成 triage；U-051 只做 read-model + implementation-linkage 首包 |
| read-model example pack 扩散风险 | 首包容易扩成 command/event/adapter 示例、evidence command execution 或全量 domain model | U-051 已只改 source-first compiled-pilot example、fixture manifest、compiled output 和 focused regression |
| command example pack 扩散风险 | command + receipt 示例容易扩成 command executor、event bus、approval workflow runtime 或 correction semantics | U-052 已只表达 command/receipt metadata、audit/risk posture、implementation evidence 和 acceptance criteria |
| event example pack 扩散风险 | event + correction/supersession 示例容易扩成 event store、replay、migration、event bus runtime 或 exactly-once delivery | U-053 已只表达 append-only event shape、correction/supersession/retraction/projection guidance、implementation evidence 和 acceptance criteria |
| adapter example pack 扩散风险 | adapter + capability/exposure 示例容易扩成 negotiation handshake、auth runtime、dynamic probing、remote gateway 或 provider selection runtime | U-054 已只表达 provider capability、consumer requirement、exposure posture、audit notes、implementation evidence 和 acceptance criteria |
| artifact/export example pack 扩散风险 | artifact/export/policy-gate 示例容易扩成 conformance runner、自动 golden update、fixture rewrite 或全量迁移 | U-055 已只表达 artifact type、golden export、policy gate、validation notes、implementation evidence 和 acceptance criteria |
| post-example-pack triage 扩散风险 | `#56` 收束复盘容易直接跳入 glossary schema v2、external citation registry 或 resource runtime | U-056 应只做质量复盘和下一阶段排序，不实现 schema/provenance/runtime 变更 |
| resource surface 扩散风险 | resource 示例容易扩成 resource runtime、scheduler、cleanup executor、permission broker 或生产资源控制系统 | U-058 已只落 source-first canonical example pack；后续不要把示例误读为 runtime、scheduler、cleanup executor、permission broker 或 schema |
| glossary registry 扩散风险 | `#57` 容易继续扩成 term resolver runtime、migration tool 或自然语言术语扫描 | U-062/U-064 已只落 schema、deterministic gates 和 source-first example pack；后续不要把 example 解读为 resolver/runtime 或全文扫描 |
| external citation 扩散风险 | `#58` 容易扩成 citation crawler、事实核验器、cross-corpus resolver 或 LLM summary faithfulness 判定 | U-061 到 U-067 已裁剪并落地 schema、deterministic gates 和 canonical example pack；后续不要把 example 解读为 crawler、claim detector、remote fetch 或 resolver |
| public sync 过早关闭风险 | 已覆盖 issue 数量较多，直接关闭会早于 PR review / merge | U-075 只通过 PR `#63` close-on-merge 关联；`#41/#59/#60/#13` 保持 open |
| route discoverability 残留风险 | `aods route --help` 曾返回 unknown arg | U-076 已修复；后续如扩 CLI discoverability，仍不得改变 route ranking |
| hosted repeatability 外部捕获风险 | benchmark summary 测试依赖 optional hosted repeatability 数据，本轮 hosted 捕获运行 11 分钟无输出后终止 | 本轮以 focused regression、`validate:all` 和 diff hygiene 为通过 gate；后续若要恢复 full `benchmark:test` gate，需要可用 hosted relay / Keychain / 网络环境或先裁剪 benchmark 入口问题 |
| batch execution 扩散风险 | 批量推进容易把 boundary triage、schema、validator、release 或 public sync 混进同一轮 | U-059 已限定批量准入：低冲突、依赖清晰、验证路径明确；release/public sync 仍需单独执行和 owner 授权 |

## 下一轮建议

| 顺序 | 任务 ID | 目标 | 验收标准 |
|---:|---|---|---|
| 1 | U-078 | Capability compatibility metadata deterministic gates | metadata-only gates；不做 negotiation runtime |
| 2 | U-079 | Validate / route JSON explanation minimal enrichment | 增加 machine-readable reason/source/dependency；不重写 CLI output subsystem |
| 3 | U-080 | Fixture / golden export smoke runner | 最小 smoke command 读取 fixture manifest；不做完整 conformance runner |
