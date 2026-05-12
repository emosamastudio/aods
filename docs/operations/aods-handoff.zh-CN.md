# AODS Agent Handoff

日期：2026-05-12
分支：`codex/aods-v0.8-backlog`
最新提交：以 `git log -1 --oneline` 为准（本分支基线为 `35c26f0`；PR `#62` squash merge 为 `831e10b`）
状态：开发中

## 一句话结论

AODS 是独立权威规范路线。v0.7 已发布，U-027 到 U-170 已连续完成 implementation drift、authoring quality、surface examples、glossary registry、external citation、runtime boundary、release readiness、fixture / CLI / validation docs、risk / audit、final research closure 和 post-backlog public state refresh。U-161 到 U-170 已把任务池扩展到 U-200，并发现 PR `#63` 仍为 open draft、merge clean、无 checks/reviews、167 changed files；PR body intended close 20 issues，但 GitHub 只识别 `#33` 为 close-on-merge。latest release 和 package version 仍为 `0.7.0`，当前不 merge、不 release、不 bump version。下一轮默认选择 U-171 到 U-180：negative fixtures、conformance proposal、dependency diagnostics 和 PR generated artifact audit。`MEMORY.md` 仍保持 untracked，不进仓库。

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
| 23 | `docs/operations/aods-capability-compatibility-gates.zh-CN.md` | 读取 U-078 capability compatibility deterministic gates 结果 |
| 24 | `docs/operations/aods-route-json-explanation.zh-CN.md` | 读取 U-079 route JSON explanation 结果 |
| 25 | `docs/operations/aods-fixture-smoke-runner.zh-CN.md` | 读取 U-080 fixture smoke runner 结果 |
| 26 | `docs/operations/aods-source-first-adoption-guide.zh-CN.md` | 读取 U-081 source-first adoption guide 结果 |
| 27 | `docs/operations/aods-external-citation-hygiene-report.zh-CN.md` | 读取 U-082 citation hygiene report 结果 |
| 28 | `docs/operations/aods-changelog-delta-ergonomics-review.zh-CN.md` | 读取 U-083 changelog delta ergonomics review 结果 |
| 29 | `docs/operations/aods-runtime-boundary-research.zh-CN.md` | 读取 U-084 runtime boundary research 结果 |
| 30 | `docs/operations/aods-comprehensive-task-plan.zh-CN.md` | 读取 U-092 综合任务池和每轮 10 任务规则 |
| 31 | `docs/operations/aods-runtime-readiness-gate-matrix.zh-CN.md` | 读取 U-085 runtime readiness gate 结果 |
| 32 | `docs/operations/aods-workflow-runtime-entry-triage.zh-CN.md` | 读取 U-086 workflow runtime entry contract triage |
| 33 | `docs/operations/aods-event-store-entry-triage.zh-CN.md` | 读取 U-087 event store / replay entry contract triage |
| 34 | `docs/operations/aods-policy-engine-entry-triage.zh-CN.md` | 读取 U-088 policy engine / approval runtime triage |
| 35 | `docs/operations/aods-remote-gateway-entry-triage.zh-CN.md` | 读取 U-089 remote gateway / adapter runtime triage |
| 36 | `docs/operations/aods-migration-tool-entry-triage.zh-CN.md` | 读取 U-090 migration tool entry contract triage |
| 37 | `docs/operations/aods-pr-final-readiness.zh-CN.md` | 读取 U-091 PR final readiness / public sync closeout |
| 38 | `docs/operations/aods-pr-review-response-matrix.zh-CN.md` | 读取 U-093 PR review response matrix |
| 39 | `docs/operations/aods-version-changelog-triage.zh-CN.md` | 读取 U-094 version / changelog route triage |
| 40 | `docs/operations/aods-release-notes-completeness.zh-CN.md` | 读取 U-095 release notes completeness pass |
| 41 | `docs/operations/aods-package-artifact-inventory-guard.zh-CN.md` | 读取 U-096 package artifact inventory guard |
| 42 | `docs/operations/aods-packed-install-smoke.zh-CN.md` | 读取 U-097 packed tarball install smoke |
| 43 | `docs/operations/aods-public-issue-close-on-merge-audit.zh-CN.md` | 读取 U-098 public issue close-on-merge audit |
| 44 | `docs/operations/aods-post-merge-public-reconciliation-plan.zh-CN.md` | 读取 U-099 post-merge public reconciliation plan |
| 45 | `docs/operations/aods-v0.12-release-candidate-gate.zh-CN.md` | 读取 U-100 release candidate gate |
| 46 | `docs/operations/aods-release-execution-playbook-dry-run.zh-CN.md` | 读取 U-101 release playbook dry run |
| 47 | `docs/operations/aods-post-release-retrospective-next-milestone.zh-CN.md` | 读取 U-102 post-release retrospective template |
| 48 | `docs/operations/aods-implementation-evidence-locator-matrix-v2.zh-CN.md` | 读取 U-103 evidence locator matrix v2 |
| 49 | `docs/operations/aods-acceptance-criteria-coverage-report.zh-CN.md` | 读取 U-104 acceptance criteria coverage |
| 50 | `docs/operations/aods-contract-requirement-evidence-trace-report.zh-CN.md` | 读取 U-105 contract-to-evidence trace |
| 51 | `docs/operations/aods-stale-evidence-refresh-workflow.zh-CN.md` | 读取 U-106 stale evidence refresh workflow |
| 52 | `docs/operations/aods-missing-reality-locator-remediation.zh-CN.md` | 读取 U-107 missing reality locator remediation plan |
| 53 | `docs/operations/aods-implementation-repo-locator-normalization.zh-CN.md` | 读取 U-108 repo locator normalization |
| 54 | `docs/operations/aods-current-planned-implementation-summary-guard.zh-CN.md` | 读取 U-109 current/planned summary guard |
| 55 | `docs/operations/aods-evidence-command-non-execution-invariant.zh-CN.md` | 读取 U-110 non-execution invariant |
| 56 | `docs/operations/aods-implementation-drift-dashboard-boundary.zh-CN.md` | 读取 U-111 dashboard boundary |
| 57 | `docs/operations/aods-code-ownership-mapping-boundary.zh-CN.md` | 读取 U-112 ownership mapping boundary |
| 58 | `docs/operations/aods-fixture-manifest-coverage-matrix.zh-CN.md` | 读取 U-113 fixture coverage matrix |
| 59 | `docs/operations/aods-negative-fixture-expansion-plan.zh-CN.md` | 读取 U-114 negative fixture expansion plan |
| 60 | `docs/operations/aods-golden-export-drift-report.zh-CN.md` | 读取 U-115 golden export drift report |
| 61 | `docs/operations/aods-fixture-smoke-output-contract-snapshot.zh-CN.md` | 读取 U-116 fixture smoke output contract snapshot |
| 62 | `docs/operations/aods-example-pack-gap-audit-after-pr-review.zh-CN.md` | 读取 U-117 example pack gap audit |
| 63 | `docs/operations/aods-source-first-compile-determinism-report.zh-CN.md` | 读取 U-118 compile determinism report |
| 64 | `docs/operations/aods-compiled-pilot-schema-mirror-audit.zh-CN.md` | 读取 U-119 schema mirror audit |
| 65 | `docs/operations/aods-seven-plane-pilot-freshness-review.zh-CN.md` | 读取 U-120 seven-plane freshness review |
| 66 | `docs/operations/aods-open-source-scenario-pack-health-review.zh-CN.md` | 读取 U-121 open-source scenario health review |
| 67 | `docs/operations/aods-benchmark-generated-artifact-hygiene-policy.zh-CN.md` | 读取 U-122 benchmark artifact hygiene policy |
| 68 | `docs/operations/aods-cli-help-coverage-matrix.zh-CN.md` | 读取 U-123 CLI help coverage matrix |
| 69 | `docs/operations/aods-validate-json-report-schema-docs.zh-CN.md` | 读取 U-124 validate JSON report docs |
| 70 | `docs/operations/aods-validate-text-json-parity-audit.zh-CN.md` | 读取 U-125 validate text/JSON parity audit |
| 71 | `docs/operations/aods-route-explanation-dependency-graph-review.zh-CN.md` | 读取 U-126 route explanation dependency graph review |
| 72 | `docs/operations/aods-remediation-guidance-coverage-matrix.zh-CN.md` | 读取 U-127 remediation coverage matrix |
| 73 | `docs/operations/aods-validation-severity-gate-consistency-review.zh-CN.md` | 读取 U-128 severity gate consistency review |
| 74 | `docs/operations/aods-compact-verbose-validation-output-triage.zh-CN.md` | 读取 U-129 validation output triage |
| 75 | `docs/operations/aods-route-query-corpus-coverage-audit.zh-CN.md` | 读取 U-130 route query coverage audit |
| 76 | `docs/operations/aods-route-touch-route-stale-path-audit.zh-CN.md` | 读取 U-131 touch-route stale path audit |
| 77 | `docs/operations/aods-error-message-actionable-wording-pass.zh-CN.md` | 读取 U-132 error message wording pass |
| 78 | `docs/operations/aods-authoring-source-lint-boundary-triage.zh-CN.md` | 读取 U-133 authoring source lint boundary |
| 79 | `docs/operations/aods-changelog-delta-ergonomics-fix-plan.zh-CN.md` | 读取 U-134 changelog delta ergonomics plan |
| 80 | `docs/operations/aods-changelog-delta-schema-test-implementation.zh-CN.md` | 读取 U-135 changelog delta implementation |
| 81 | `docs/operations/aods-glossary-alias-lifecycle-triage.zh-CN.md` | 读取 U-136 glossary alias lifecycle triage |
| 82 | `docs/operations/aods-glossary-canonical-term-documentation-pass.zh-CN.md` | 读取 U-137 glossary canonical-term docs |
| 83 | `docs/operations/aods-external-citation-review-workflow-triage.zh-CN.md` | 读取 U-138 external citation review workflow |
| 84 | `docs/operations/aods-external-citation-freshness-policy-docs.zh-CN.md` | 读取 U-139 external citation freshness policy |
| 85 | `docs/operations/aods-documentation-density-quality-pass.zh-CN.md` | 读取 U-140 documentation density quality pass |
| 86 | `docs/operations/aods-paired-surface-sync-example-report.zh-CN.md` | 读取 U-141 paired surface sync report |
| 87 | `docs/operations/aods-docs-navigation-dead-link-local-checker-triage.zh-CN.md` | 读取 U-142 docs local link checker triage |
| 88 | `docs/operations/aods-sensitive-example-redaction-fixture-review.zh-CN.md` | 读取 U-143 sensitive/redaction fixture review |
| 89 | `docs/operations/aods-credential-placeholder-policy-docs.zh-CN.md` | 读取 U-144 credential placeholder policy |
| 90 | `docs/operations/aods-remote-exposure-upgrade-checklist.zh-CN.md` | 读取 U-145 remote exposure upgrade checklist |
| 91 | `docs/operations/aods-risk-taxonomy-coverage-report.zh-CN.md` | 读取 U-146 risk taxonomy coverage report |
| 92 | `docs/operations/aods-audit-metadata-completeness-report.zh-CN.md` | 读取 U-147 audit metadata completeness report |
| 93 | `docs/operations/aods-policy-decision-receipt-boundary-refinement.zh-CN.md` | 读取 U-148 policy decision / receipt / audit boundary |
| 94 | `docs/operations/aods-approval-label-semantics-review.zh-CN.md` | 读取 U-149 approval label semantics review |
| 95 | `docs/operations/aods-local-only-export-safety-review.zh-CN.md` | 读取 U-150 local-only export safety review |
| 96 | `docs/operations/aods-workflow-runtime-minimal-poc-decision-gate.zh-CN.md` | 读取 U-151 workflow runtime PoC decision gate |
| 97 | `docs/operations/aods-event-store-minimal-poc-decision-gate.zh-CN.md` | 读取 U-152 event store PoC decision gate |
| 98 | `docs/operations/aods-policy-engine-minimal-poc-decision-gate.zh-CN.md` | 读取 U-153 policy engine PoC decision gate |
| 99 | `docs/operations/aods-remote-gateway-minimal-poc-decision-gate.zh-CN.md` | 读取 U-154 remote gateway PoC decision gate |
| 100 | `docs/operations/aods-migration-tool-minimal-poc-decision-gate.zh-CN.md` | 读取 U-155 migration tool PoC decision gate |
| 101 | `docs/operations/aods-conformance-runner-implementation-plan.zh-CN.md` | 读取 U-156 conformance runner implementation plan |
| 102 | `docs/operations/aods-adapter-negotiation-protocol-plan.zh-CN.md` | 读取 U-157 adapter negotiation protocol plan |
| 103 | `docs/operations/aods-cross-corpus-authority-resolver-research.zh-CN.md` | 读取 U-158 cross-corpus authority resolver research |
| 104 | `docs/operations/aods-dependency-scheduler-research.zh-CN.md` | 读取 U-159 dependency scheduler research |
| 105 | `docs/operations/aods-telemetry-observability-store-research.zh-CN.md` | 读取 U-160 telemetry / observability store research |
| 106 | `docs/operations/aods-post-backlog-task-plan.zh-CN.md` | 读取 U-161 post-backlog task plan |
| 107 | `docs/operations/aods-public-state-refresh-after-backlog-closure.zh-CN.md` | 读取 U-162 到 U-166 public state refresh |
| 108 | `docs/operations/aods-pr-public-action-approval-packet.zh-CN.md` | 读取 U-167 到 U-168 public action approval packet |
| 109 | `docs/operations/aods-next-milestone-options.zh-CN.md` | 读取 U-169 到 U-170 next milestone options |
| 110 | `docs/operations/aods-v0.7-rc-gate.zh-CN.md` | 读取 v0.7 RC gate 结论和 release note skeleton |
| 111 | `docs/operations/aods-task-ledger.zh-CN.md` | 选择下一轮任务 |
| 112 | `docs/operations/aods-round-log.zh-CN.md` | 查看当前回合和新增任务记录 |

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
| U-078 | Capability compatibility metadata deterministic gates | capability compatibility mapping-table 可表达 compatible / incompatible rows；validator 会检查 capability id、contract profile、schema version policy、exposure class 与 expected_result 是否一致；不做 handshake/discovery/auth/fallback ranking |
| U-079 | Validate / route JSON explanation minimal enrichment | `route --json` 已输出 `explanation.source`、`explanation.reason`、`explanation.dependency`；不改变文本输出、route ranking、query scoring 或 validation JSON |
| U-080 | Fixture / golden export smoke runner | `aods fixture smoke` 已读取 fixture manifest 并验证 expected_status / expected_rules 与 input/golden path；不执行 update command、不做完整 conformance runner、不自动更新 golden exports |
| U-081 | Source-first adoption guide for example packs | `examples/compiled-pilot-source/README.md` 现在串起先改源文件、compile、validate、route、fixture smoke 和全仓校验；公开 README 已指向该入口；不新增 example pack、不改 benchmark sync 区块 |
| U-082 | External citation stale/current hygiene report | `validate` / `validate --json` 已输出 declared citation posture counters；focused regression 覆盖；不抓取 URL、不做 fact checker |
| U-083 | Changelog delta ergonomics review | GitHub `#13` 已复审为有效但不阻塞当前 release workflow；已写 public response plan；不改 changelog schema |
| U-084 | Runtime-boundary research spike | 已梳理 workflow runtime、event store、policy engine、remote gateway、migration tool 的当前 metadata-only 边界、非目标和进入条件；新增 U-085 到 U-091；不实现 runtime |
| U-092 | Comprehensive task backlog and 10-task execution rule | 综合任务池已扩展到 U-160；后续每轮复审通过后从未完成任务表按顺序选 10 个任务，少于 10 个时全选 |
| U-085 | Runtime readiness gate matrix | 五类 runtime 候选已映射到 authority、evidence、risk、fixture、public sync gate；当前均不进入实现 |
| U-086 | Workflow runtime entry contract triage | workflow object identity、state source、transition、command/receipt、retry/cancel/cleanup、audit 和 fixture 前置条件已明确；不实现 workflow engine |
| U-087 | Event store and replay contract triage | event identity、ordering、retention、replay scope、correction projection、idempotency 和 fixture 前置条件已明确；不实现 event store |
| U-088 | Policy engine and approval runtime triage | policy decision input/output、approval boundary、override、audit receipt、determinism 和 fixture 前置条件已明确；不实现 permission broker 或 approval workflow |
| U-089 | Remote gateway / adapter runtime triage | exposure upgrade、auth/identity、transport failure、compatibility、audit、cost/quota 和 fixture 前置条件已明确；不实现 remote gateway |
| U-090 | Migration tool entry contract triage | source/target authority、mapping、dry-run、rollback、destructive approval、validation gate 和 fixture 前置条件已明确；不实现 migration executor |
| U-091 | PR final readiness / public sync closeout | PR `#63` 仍为 open draft；reviews/checks 为空；close-on-merge 仅保留在 PR body；本轮不 ready、不 merge、不 release |
| U-093 | PR review response matrix | 当前无 GitHub review / check response；covered issues 等待 PR merge；`#41/#59/#60/#13` 保持 open |
| U-094 | Version bump and changelog route triage | 当前 package/tag/latest release 均为 `v0.7.0`；下一 release 必须先 version bump / tag / release branch decision；本轮不 bump、不发布 |
| U-095 | Release notes completeness pass | 下一 release notes skeleton 已覆盖 major changes、non-goals、known deferred runtime、validation evidence 和 blockers；本轮不发布 release |
| U-096 | Package artifact inventory guard update | package inventory pass：51 files、207.5 kB package size、1.1 MB unpacked；operations docs / benchmarks excluded as expected；不改 package strategy |
| U-097 | Install smoke from packed tarball | local tarball install smoke pass；CLI / validate / fixture smoke 均通过；不发布 npm |
| U-098 | Public issue close-on-merge audit | PR body close list 与本地覆盖矩阵一致；deferred refs `#41/#59/#60/#13` 保持 open；不提前关闭 issue |
| U-099 | Post-merge public state reconciliation plan | PR merge 后 issue、release、docs、branch cleanup 顺序已明确；本轮不 merge |
| U-100 | v0.12 release candidate gate | technical gate pass；public release blocked by draft PR、version `0.7.0`、latest tag/release `v0.7.0`、no release authorization |
| U-101 | Release execution playbook dry run | 授权后的 release steps、conflict checks 和 rollback guidance 已定义；不创建 release |
| U-102 | Post-release retrospective and next milestone triage | 发布后复盘模板、next milestone 候选和 public roadmap sync 入口已定义；本轮无真实 release |
| U-103 | Implementation evidence locator matrix v2 | 8 linked modules、14 evidence、13 current、1 planned、0 stale/blocked/missing locators；example repos remain unchecked |
| U-104 | Acceptance criteria coverage report | 14 criteria total；13 satisfied、1 planned、0 waived/blocked/manual_review；all check_type `evidence-ref`；不执行 arbitrary command |
| U-105 | Contract requirement to evidence trace report | requirement -> criteria -> evidence -> locator 静态追踪边界已定义；不做 semantic oracle，不 remote clone |
| U-106 | Stale evidence refresh workflow boundary | stale evidence owner、refresh trigger、validation gate 和 manual review path 已定义；不自动刷新外部证据 |
| U-107 | Missing reality locator remediation plan | unchecked implementation repo locator 的最小修复路线已明确；不 fetch sibling repo |
| U-108 | Implementation repo locator normalization | path / URL / descriptive-only locator 的解释边界已明确；不改变 root topology semantics |
| U-109 | Current vs planned implementation summary guard | current/planned/stale/blocked report guard 已定义；planned evidence 保持可见 |
| U-110 | Evidence command non-execution invariant test | fixture smoke non-execution regression 已落；validate/reality/fixture smoke 不执行 command 的 invariant 已入账 |
| U-111 | Implementation drift dashboard boundary triage | 未来 dashboard 静态输入、候选面板和非目标已明确；不建 dashboard |
| U-112 | Code ownership mapping boundary triage | ownership authority、path、review owner、fallback 边界已明确；不自动推断 owner |
| U-113 | Fixture manifest coverage matrix | 9 positive、0 negative、9 golden coverage 已入账；不补全部 fixture |
| U-114 | Negative fixture expansion plan | 下一批 high-value negative fixtures、expected rules 和文件范围已排序；不一次性扩全量 |
| U-115 | Golden export drift report | golden export drift 检测、人工接受、拒绝和更新边界已定义；不自动接受 golden diff |
| U-116 | Fixture smoke output contract snapshot | JSON / text 输出字段已固化；机器消费优先 JSON；不扩成 conformance runner |
| U-117 | Example pack gap audit after PR review | PR `#63` 当前无 review/check；canonical example pack gap matrix 已入账；不新增示例包 |
| U-118 | Source-first compile determinism report | compiled-pilot 连续两次 compile 后无 generated diff；timestamp pinning regression 已确认 |
| U-119 | Compiled pilot schema mirror audit | compiled-pilot schema 与 root schema SHA 一致；不手改 generated schema |
| U-120 | Seven-plane pilot freshness review | seven-plane pilot strict pass；定位为旧核心结构示例，不扩成新能力 showcase |
| U-121 | Open-source scenario pack health review | behavior drift=4、drift=9、loading=9、open-source corpora=4；不新增外部依赖 |
| U-122 | Benchmark generated artifact hygiene policy | generated / reports churn 的默认恢复、接受条件和入账规则已定义；不默认提交 churn |
| U-123 | CLI help coverage for all subcommands | validate / hook / upgrade / compile / scaffold help 已补齐；focused regression 覆盖所有子命令 |
| U-124 | Validate JSON report schema documentation | validate base JSON report、topology、external_citations 字段契约已文档化 |
| U-125 | Validate text/JSON parity audit | text / JSON parity matrix 与保留差异已明确；不大改输出 |
| U-126 | Route explanation dependency graph review | `source/reason/dependency` 覆盖可接受；直接依赖边界已明确 |
| U-127 | Remediation guidance coverage matrix | remediation 覆盖矩阵已入账；新增 changelog delta warning action |
| U-128 | Validation severity gate consistency review | warning / strict gate 行为一致；changelog warning 回归覆盖 |
| U-129 | Compact vs verbose validation output triage | 暂不新增输出模式；先改善 maxLength length diagnostics |
| U-130 | Route query corpus coverage audit | common query terms 覆盖可接受；write intent dependency expansion 已确认 |
| U-131 | Route touch-route stale path audit | 16 条 touch route 未发现 stale path；operations docs fallback 已记录 |
| U-132 | Error message actionable wording pass | route invalid stage/intent 现在直接失败并列 allowed values；maxLength 输出 received length |
| U-133 | Authoring source lint boundary triage | source-first lint 边界保持 schema / compile / validate；不做 style linter |
| U-134 | Changelog delta ergonomics fix plan | 已选择 300 soft warning + 500 hard fail；不扩成 changelog framework |
| U-135 | Changelog delta schema/test implementation | schema、validator、spec 和 focused regression 已落地 |
| U-136 | Glossary registry alias lifecycle triage | alias、deprecated term、replacement、scope collision 边界已明确；不做 resolver runtime |
| U-137 | Glossary canonical-term documentation pass | glossary v2 authoring / consumption guidance 已补齐；不全文扫描 |
| U-138 | External citation review workflow triage | source、authority、claim、review status、ref 附着流程已明确；不做 crawler |
| U-139 | External citation freshness policy docs | current、stale、unresolved、withheld 维护策略已明确；不抓取 URL |
| U-140 | Documentation density quality pass | agent-primary docs 密度和 actionability 问题清单已入账；不重写文档门户 |
| U-141 | Paired surface sync example report | paired human/agent sync report 示例输出和使用边界已明确；不建 semantic judge |
| U-142 | Docs navigation dead-link local checker triage | 89 个 Markdown 文件、61 个本地链接、0 missing 已记录；不抓取外网 |
| U-143 | Sensitive example redaction fixture review | examples 敏感占位与 redaction fixture 风险已审查；0 高置信 secret-like hits；不做 secret scanner service |
| U-144 | Credential placeholder policy docs | credentials、handles、debug-only payload 示例写法规则已明确；不接入 secret manager |
| U-145 | Remote exposure upgrade checklist | local-only/local-export 到 remote-read/remote-write/adapter-facing 的升级审查清单已明确；不实现 gateway |
| U-146 | Risk taxonomy coverage report | 9 类风险族覆盖摘要已明确；filesystem / external-send / cost 保持后续示例候选；不做 runtime policy |
| U-147 | Audit metadata completeness report | commands/adapters 的 actor/source/target/receipt/correlation coverage 已明确；不建 audit store |
| U-148 | Policy decision receipt boundary refinement | policy decision、receipt、audit anchor 字段边界已拆清；不实现 permission broker |
| U-149 | Approval label semantics review | human_approval、review_required、escalate、blocked、needs-review 语义已统一；不建 approval workflow |
| U-150 | Local-only export safety review | local-only / local-export 公开误用风险和 guard 已明确；不实现 sandbox |
| U-151 | Workflow runtime minimal PoC decision gate | workflow runtime PoC prerequisites、success metrics、abort criteria 已明确；不实现 PoC |
| U-152 | Event store minimal PoC decision gate | event store / replay PoC data model、risk、abort criteria 已明确；不实现 PoC |
| U-153 | Policy engine minimal PoC decision gate | policy engine PoC input/output、identity model、audit boundary 已明确；不实现 PoC |
| U-154 | Remote gateway minimal PoC decision gate | remote gateway PoC auth、transport、rate/cost、failure semantics 已明确；不实现 PoC |
| U-155 | Migration tool minimal PoC decision gate | migration tool PoC dry-run、rollback、destructive approval、fixtures 已明确；不实现 PoC |
| U-156 | Conformance runner implementation plan | 从 fixture smoke 到 conformance runner 的 staged plan、进入条件和 no-go posture 已明确；不实现 runner |
| U-157 | Adapter negotiation protocol plan | metadata prerequisites、protocol sketch 和 non-goals 已明确；不实现 negotiation |
| U-158 | Cross-corpus authority resolver research | trust model、fetch policy、cache / failure posture 已明确；不实现 resolver |
| U-159 | Dependency scheduler research | dependency ordering 进入 runtime scheduler 的 gate、risks、alternatives 已明确；不实现 scheduler |
| U-160 | Telemetry / observability store research | report storage、dashboard need、privacy risk 和最小未来形态已明确；不建 store |
| U-161 | Post-backlog task pool expansion and selection | 任务池扩展到 U-200；本轮锁定 U-161 到 U-170 |
| U-162 | Public repository state refresh | repo public、default branch、active branch、latest pushed commit 已刷新；不写 GitHub |
| U-163 | PR branch / merge / checks state refresh | PR `#63` open draft、merge clean、无 reviews、无 checks、167 changed files 已入账 |
| U-164 | PR close-on-merge recognition gap audit | PR body intended close 20 issues，但 GitHub 仅识别 `#33`；后续需修复 PR body |
| U-165 | Open issue coverage matrix refresh | 24 个 open issues 均已归类为 intended close 或 deferred |
| U-166 | Release / version surface no-go refresh | latest release 和 package version 仍为 `0.7.0`；当前不 release、不 bump |
| U-167 | PR body stale scope audit | PR body summary、validation、issue sync 已落后于 U-160 后分支状态 |
| U-168 | Public action approval packet | PR body update、issue comments、ready-for-review 的公开写边界已明确 |
| U-169 | Next milestone options after task pool closure | 下一阶段分为 public closeout 和本地 conformance / diagnostics next slice |
| U-170 | Roadmap / changelog public follow-up plan | `#60/#13/#41/#59` 的后续公开同步目标和本地证据已明确 |

## 未完成工作

| 顺序 | 任务 ID | 目标 | 备注 |
|---:|---|---|---|
| 1 | U-171 | Negative fixture first-slice selection | 下一轮默认第 1 个；本地可执行 |
| 2 | U-172 | Negative fixture implementation first slice | 下一轮默认第 2 个；不扩全量 |
| 3 | U-173 | Conformance manifest v0 proposal | 下一轮默认第 3 个；不实现 runner |
| 4 | U-174 | Conformance report schema proposal | 下一轮默认第 4 个；不建 dashboard |
| 5 | U-175 | Fixture smoke to conformance docs update | 下一轮默认第 5 个；不改 CLI |
| 6 | U-176 | Route dependency diagnostics design | 下一轮默认第 6 个；不改 ranking |
| 7 | U-177 | Validator dependency diagnostics implementation plan | 下一轮默认第 7 个；不实现 scheduler |
| 8 | U-178 | Route dependency explanation expansion implementation | 下一轮默认第 8 个；不建 graph DB |
| 9 | U-179 | Dependency query benchmark scenario | 下一轮默认第 9 个；不引外部依赖 |
| 10 | U-180 | PR generated artifact acceptance audit | 下一轮默认第 10 个；不默认提交 churn |

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
| external citation 扩散风险 | `#58` 容易扩成 citation crawler、事实核验器、cross-corpus resolver 或 LLM summary faithfulness 判定 | U-061 到 U-067 已裁剪并落地 schema、deterministic gates 和 canonical example pack；U-082 只补 declared posture report；后续不要把 example 或 report 解读为 crawler、claim detector、remote fetch 或 resolver |
| changelog ergonomics 公开同步风险 | `#13` 的本地最小修复已落地，但公开 issue 仍需要按授权同步 | 后续如处理公开状态，只能评论说明 300 soft warning + 500 hard fail 已在本分支实现，不提前关闭 issue |
| runtime 过早实现风险 | workflow runtime、event store、policy engine、remote gateway、migration tool 都是合理方向，但当前仍只允许 metadata-only 边界和 PoC decision gate | U-085 到 U-090 已完成 readiness / entry triage；U-151 到 U-155 已完成 no-go decision gates，不能直接实现 runtime |
| PR closeout 混入实现风险 | PR `#63` final readiness / merge / release 会改变公开状态，容易和 package/release/drift 工作混在一轮 | U-091/U-093/U-094/U-095 和 U-098/U-099 已入账；未获 owner 明确指令前不 ready、不 merge、不 release、不 bump version |
| package release 误判风险 | package inventory、install smoke 和 release self-check 都通过，但 version 仍是 `0.7.0` 且 PR 仍是 draft | U-096/U-097/U-100/U-101 已明确 technical gate pass 不等于 public release authorization |
| evidence trace 过度承诺风险 | criteria/evidence trace 能证明 metadata 链接，不证明外部实现语义正确 | U-103/U-104/U-105 已明确 unchecked repo、planned criterion 和 non-semantic-oracle 边界 |
| skill 发布面漂移风险 | 随包 skill 曾把 `boot_by_touch` 写成错误字段名 | 本轮已修复 skill text / metadata，并用 focused test 阻断错误写法回归 |
| evidence command 执行风险 | fixture / golden update command 容易被误读为 smoke 时会执行 | U-110 已补 non-execution regression；fixture smoke 仍只检查声明和路径 |
| 10-task 批量执行扩散风险 | 每轮固定选择 10 个任务，容易把低风险 docs、public sync、schema、runtime decision 混成一个不可验证的大改动 | U-092 规定仍必须先过上一轮质量门禁；需要公开 merge/release/破坏性副作用的任务只做 readiness / dry-run / decision record |
| public sync 过早关闭风险 | 已覆盖 issue 数量较多，直接关闭会早于 PR review / merge | U-075 只通过 PR `#63` close-on-merge 关联；`#41/#59/#60/#13` 保持 open |
| PR close syntax recognition gap | PR body 写了 20 个 intended close targets，但 GitHub 当前只识别 `#33` | 后续 U-181/U-182 必须修复 PR body 后再 ready / merge |
| PR scope stale 风险 | PR body 仍偏向 v0.11 release readiness，但分支已推进到 U-160 后状态 | 后续更新 summary、validation、release position 和 deferred issue wording |
| no-checks public review risk | PR `#63` 当前没有 GitHub checks reported | 本地 gates 继续入账；U-193 评估是否需要 minimal Actions gate |
| route discoverability 残留风险 | `aods route --help` 曾返回 unknown arg | U-076 已修复；后续如扩 CLI discoverability，仍不得改变 route ranking |
| fixture smoke 扩散风险 | fixture manifest smoke runner 容易被误读成完整 conformance runner 或 golden updater | U-080 只检查 manifest outcome 字段和声明路径；不得执行 update command、remote fetch 或自动接受 golden diff |
| adoption docs 过度承诺风险 | source-first example packs 容易被读成完整 runtime coverage | U-081 明确这些是采用示例，不代表 command executor、event store、adapter runtime、resource scheduler、crawler 或 fact checker 已实现 |
| conformance runner 过早实现风险 | fixture smoke 到完整 conformance runner 之间还缺 manifest、report schema、negative fixture 和执行边界 | U-156 只记录 staged implementation plan；未获明确任务前不实现 runner |
| adapter negotiation 过早实现风险 | negotiation protocol 容易扩成 discovery、auth、fallback、dynamic probing 或 provider selection runtime | U-157 只记录 metadata prerequisites 和 protocol sketch；不实现 runtime handshake |
| cross-corpus resolver 过早实现风险 | authority resolver 容易触发 remote fetch、cache trust、conflict resolution 和跨仓库写入边界 | U-158 只记录 trust model、fetch policy、cache / failure posture；默认 no-fetch |
| dependency scheduler 过早实现风险 | dependency ordering 容易扩成 package manager、workflow scheduler 或 cross-repo executor | U-159 结论为先强化 validator / route / compile / fixture 替代路径；不实现 scheduler |
| observability store 过早实现风险 | route / validate / fixture report 容易扩成 telemetry collection、dashboard 或 trace store | U-160 结论为当前无 store 需求；后续必须先定义隐私、保留和 opt-in 边界 |
| hosted repeatability 外部捕获风险 | benchmark summary 测试依赖 optional hosted repeatability 数据，本轮 hosted 捕获运行 11 分钟无输出后终止 | 本轮以 focused regression、`validate:all` 和 diff hygiene 为通过 gate；后续若要恢复 full `benchmark:test` gate，需要可用 hosted relay / Keychain / 网络环境或先裁剪 benchmark 入口问题 |
| batch execution 扩散风险 | 批量推进容易把 boundary triage、schema、validator、release 或 public sync 混进同一轮 | U-059 已限定批量准入：低冲突、依赖清晰、验证路径明确；release/public sync 仍需单独执行和 owner 授权 |

## 下一轮建议

| 顺序 | 任务 ID | 目标 | 验收标准 |
|---:|---|---|---|
| 1 | U-171 - U-180 | 下一轮默认 10 任务 | negative fixtures、conformance proposal、dependency diagnostics、PR generated artifact audit |
| 2 | U-181 - U-187 | 后续公开同步动作 | PR body update、issue comments、ready-for-review 均需当前回合明确授权 |
| 3 | U-188 - U-200 | release / package / automation hygiene | version、release gate、checks、package surface、handoff closeout |
