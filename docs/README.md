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
| `docs/examples/README.md` | 面向公开文档和 issue 的短样例入口。 |
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
| `docs/operations/aods-v0.12-backlog.zh-CN.md` | v0.12+ backlog triage：把仍 open / deferred 的 governance、drift、runtime 和 public sync 项重新排序。 |
| `docs/operations/aods-v0.11-release-readiness.zh-CN.md` | U-074 release readiness gate、package dry-run、release notes skeleton 和发布前剩余风险。 |
| `docs/operations/aods-implementation-evidence-hygiene.zh-CN.md` | U-077 implementation evidence stale/current posture 的 deterministic summary 与 warning hygiene。 |
| `docs/operations/aods-capability-compatibility-gates.zh-CN.md` | U-078 capability compatibility metadata deterministic gates 与 canonical matrix case。 |
| `docs/operations/aods-route-json-explanation.zh-CN.md` | U-079 route JSON explanation 的 `source/reason/dependency` 最小字段契约。 |
| `docs/operations/aods-fixture-smoke-runner.zh-CN.md` | U-080 fixture / golden export smoke runner 的 CLI 与 JSON report 契约。 |
| `docs/operations/aods-source-first-adoption-guide.zh-CN.md` | U-081 source-first example packs 公开采用路径。 |
| `docs/operations/aods-external-citation-hygiene-report.zh-CN.md` | U-082 external citation stale/current/assumption posture 的 validation report 摘要。 |
| `docs/operations/aods-changelog-delta-ergonomics-review.zh-CN.md` | U-083 changelog.delta 300 字符限制是否阻塞 release workflow 的复审。 |
| `docs/operations/aods-runtime-boundary-research.zh-CN.md` | U-084 runtime-boundary research spike，梳理五类未来 runtime 的边界和进入条件。 |
| `docs/operations/aods-runtime-readiness-gate-matrix.zh-CN.md` | U-085 runtime readiness gate matrix，把五类 runtime 候选映射到 authority / evidence / risk / fixture / public sync gate。 |
| `docs/operations/aods-workflow-runtime-entry-triage.zh-CN.md` | U-086 workflow runtime entry contract triage，明确 lifecycle / command / audit / dependency 前置条件和非目标。 |
| `docs/operations/aods-event-store-entry-triage.zh-CN.md` | U-087 event store / replay entry contract triage，明确 event identity、ordering、retention、replay 和 correction projection 边界。 |
| `docs/operations/aods-policy-engine-entry-triage.zh-CN.md` | U-088 policy engine / approval runtime triage，明确 policy decision input/output、audit receipt 和 approval boundary。 |
| `docs/operations/aods-remote-gateway-entry-triage.zh-CN.md` | U-089 remote gateway / adapter runtime triage，明确 exposure upgrade、auth、transport、audit 和 compatibility 前置条件。 |
| `docs/operations/aods-migration-tool-entry-triage.zh-CN.md` | U-090 migration tool entry contract triage，明确 source/target authority、dry-run、rollback、mapping 和 destructive approval 边界。 |
| `docs/operations/aods-pr-final-readiness.zh-CN.md` | U-091 PR final readiness / public sync closeout，记录 draft PR、close-on-merge、version 和 release 决策。 |
| `docs/operations/aods-pr-review-response-matrix.zh-CN.md` | U-093 PR review response matrix，记录 PR review、covered issue 和 deferred issue 状态。 |
| `docs/operations/aods-version-changelog-triage.zh-CN.md` | U-094 version bump and changelog route triage，明确下一 release 前必须完成的版本和 changelog 路线。 |
| `docs/operations/aods-release-notes-completeness.zh-CN.md` | U-095 release notes completeness pass，提供下一 release notes skeleton 和发布前 blockers。 |
| `docs/operations/aods-package-artifact-inventory-guard.zh-CN.md` | U-096 package artifact inventory guard，记录 `npm pack --dry-run --json` 包清单审查。 |
| `docs/operations/aods-packed-install-smoke.zh-CN.md` | U-097 packed tarball install smoke，记录本地 tarball 安装、CLI help、strict validation 和 fixture smoke 结果。 |
| `docs/operations/aods-public-issue-close-on-merge-audit.zh-CN.md` | U-098 public issue close-on-merge audit，核对 PR body close/deferred issue 列表。 |
| `docs/operations/aods-post-merge-public-reconciliation-plan.zh-CN.md` | U-099 post-merge public state reconciliation plan，定义 merge 后 issue、release、docs、branch cleanup 顺序。 |
| `docs/operations/aods-v0.12-release-candidate-gate.zh-CN.md` | U-100 v0.12 release candidate gate，记录 release self-check、package、install smoke 和 release blockers。 |
| `docs/operations/aods-release-execution-playbook-dry-run.zh-CN.md` | U-101 release execution playbook dry run，定义授权后发布步骤、冲突检查和 rollback。 |
| `docs/operations/aods-post-release-retrospective-next-milestone.zh-CN.md` | U-102 post-release retrospective and next milestone triage，提供发布后复盘模板和后续 milestone 候选。 |
| `docs/operations/aods-implementation-evidence-locator-matrix-v2.zh-CN.md` | U-103 implementation evidence locator matrix v2，记录 repo locator、path locator、unchecked reason 和 evidence locator posture。 |
| `docs/operations/aods-acceptance-criteria-coverage-report.zh-CN.md` | U-104 acceptance criteria coverage report，汇总 criteria、evidence refs、fixture 和 validator posture。 |
| `docs/operations/aods-contract-requirement-evidence-trace-report.zh-CN.md` | U-105 contract requirement to evidence trace report，定义 requirement -> criteria -> evidence -> locator 的静态追踪边界。 |
| `docs/operations/aods-stale-evidence-refresh-workflow.zh-CN.md` | U-106 stale evidence refresh workflow boundary，定义 owner、trigger、validation gate 和 manual review path。 |
| `docs/operations/aods-missing-reality-locator-remediation.zh-CN.md` | U-107 missing reality locator remediation plan，定义 unchecked implementation repo locator 的最小修复路线。 |
| `docs/operations/aods-implementation-repo-locator-normalization.zh-CN.md` | U-108 implementation repo locator normalization，定义 path / URL / descriptive locator 的解释边界。 |
| `docs/operations/aods-current-planned-implementation-summary-guard.zh-CN.md` | U-109 current vs planned implementation summary guard，明确 current/planned/stale/blocked report posture。 |
| `docs/operations/aods-evidence-command-non-execution-invariant.zh-CN.md` | U-110 evidence command non-execution invariant，记录 validate/reality/fixture smoke 不执行命令的测试与边界。 |
| `docs/operations/aods-implementation-drift-dashboard-boundary.zh-CN.md` | U-111 implementation drift dashboard boundary triage，定义未来 dashboard 的静态输入和非目标。 |
| `docs/operations/aods-code-ownership-mapping-boundary.zh-CN.md` | U-112 code ownership mapping boundary triage，定义 owner authority、path、review owner 和 fallback 边界。 |
| `docs/operations/aods-fixture-manifest-coverage-matrix.zh-CN.md` | U-113 fixture manifest coverage matrix，汇总 positive / negative / golden coverage。 |
| `docs/operations/aods-negative-fixture-expansion-plan.zh-CN.md` | U-114 negative fixture expansion plan，排序下一批 high-value negative fixtures。 |
| `docs/operations/aods-golden-export-drift-report.zh-CN.md` | U-115 golden export drift report，定义 golden diff 检测、人工接受和拒绝边界。 |
| `docs/operations/aods-fixture-smoke-output-contract-snapshot.zh-CN.md` | U-116 fixture smoke output contract snapshot，固化 fixture smoke JSON / text 输出字段。 |
| `docs/operations/aods-example-pack-gap-audit-after-pr-review.zh-CN.md` | U-117 example pack gap audit after PR review，记录 PR review 空状态下的示例包缺口矩阵。 |
| `docs/operations/aods-source-first-compile-determinism-report.zh-CN.md` | U-118 source-first compile determinism report，确认连续编译无 generated diff。 |
| `docs/operations/aods-compiled-pilot-schema-mirror-audit.zh-CN.md` | U-119 compiled pilot schema mirror audit，确认 compiled-pilot schema 与 root schema 一致。 |
| `docs/operations/aods-seven-plane-pilot-freshness-review.zh-CN.md` | U-120 seven-plane pilot freshness review，确认旧 pilot 仍适合核心结构示例但不承载新能力展示。 |
| `docs/operations/aods-open-source-scenario-pack-health-review.zh-CN.md` | U-121 open-source scenario pack health review，记录 scenario / corpus fixture 覆盖和维护成本。 |
| `docs/operations/aods-benchmark-generated-artifact-hygiene-policy.zh-CN.md` | U-122 benchmark generated artifact hygiene policy，定义 generated / reports churn 的接受和还原规则。 |
| `docs/operations/aods-cli-help-coverage-matrix.zh-CN.md` | U-123 CLI help coverage matrix，补齐 validate / hook / upgrade / compile / scaffold 等子命令 help。 |
| `docs/operations/aods-validate-json-report-schema-docs.zh-CN.md` | U-124 validate JSON report schema docs，文档化 base report 与 reality extension 字段。 |
| `docs/operations/aods-validate-text-json-parity-audit.zh-CN.md` | U-125 validate text / JSON parity audit，明确 text 与 JSON 输出的信息差和保留差异。 |
| `docs/operations/aods-route-explanation-dependency-graph-review.zh-CN.md` | U-126 route explanation dependency graph review，确认 `source/reason/dependency` 覆盖与直接依赖边界。 |
| `docs/operations/aods-remediation-guidance-coverage-matrix.zh-CN.md` | U-127 remediation guidance coverage matrix，记录 validator remediation 覆盖与新增 changelog action。 |
| `docs/operations/aods-validation-severity-gate-consistency-review.zh-CN.md` | U-128 validation severity gate consistency review，确认 warning / strict gate 行为一致。 |
| `docs/operations/aods-compact-verbose-validation-output-triage.zh-CN.md` | U-129 compact vs verbose validation output triage，明确暂不新增输出模式并做局部 message 改进。 |
| `docs/operations/aods-route-query-corpus-coverage-audit.zh-CN.md` | U-130 route query corpus coverage audit，审查 common query terms 到 authority module 的覆盖。 |
| `docs/operations/aods-route-touch-route-stale-path-audit.zh-CN.md` | U-131 route touch-route stale path audit，确认现有 touch routes 无 stale path 并记录 docs fallback。 |
| `docs/operations/aods-error-message-actionable-wording-pass.zh-CN.md` | U-132 error message actionable wording pass，补 route invalid arg 和 maxLength length diagnostics。 |
| `docs/operations/aods-authoring-source-lint-boundary-triage.zh-CN.md` | U-133 authoring source lint boundary triage，明确 source-first lint 仍以 schema/compile/validate 为主。 |
| `docs/operations/aods-changelog-delta-ergonomics-fix-plan.zh-CN.md` | U-134 changelog delta ergonomics fix plan，选择 300 soft warning + 500 hard fail。 |
| `docs/operations/aods-changelog-delta-schema-test-implementation.zh-CN.md` | U-135 changelog delta schema/test implementation，落地 schema、validator、test 和 spec 同步。 |
| `docs/operations/aods-glossary-alias-lifecycle-triage.zh-CN.md` | U-136 glossary alias lifecycle triage，明确 alias、deprecated term、replacement 和 scope collision 边界。 |
| `docs/operations/aods-glossary-canonical-term-documentation-pass.zh-CN.md` | U-137 glossary canonical-term documentation pass，补齐 v2 authoring / consumption guidance。 |
| `docs/operations/aods-external-citation-review-workflow-triage.zh-CN.md` | U-138 external citation review workflow triage，明确 source、authority、claim、review status 和 ref 附着流程。 |
| `docs/operations/aods-external-citation-freshness-policy-docs.zh-CN.md` | U-139 external citation freshness policy docs，明确 current / stale / unresolved / withheld 维护策略。 |
| `docs/operations/aods-documentation-density-quality-pass.zh-CN.md` | U-140 documentation density quality pass，记录 agent-primary docs 密度与 actionability 审查。 |
| `docs/operations/aods-paired-surface-sync-example-report.zh-CN.md` | U-141 paired surface sync example report，给 paired human/agent sync report 提供示例输出和边界。 |
| `docs/operations/aods-docs-navigation-dead-link-local-checker-triage.zh-CN.md` | U-142 docs navigation dead-link local checker triage，记录本地 Markdown 链接检查范围和结果。 |
| `docs/operations/aods-sensitive-example-redaction-fixture-review.zh-CN.md` | U-143 sensitive example redaction fixture review，审查 examples 中敏感占位和 redaction fixture 风险。 |
| `docs/operations/aods-credential-placeholder-policy-docs.zh-CN.md` | U-144 credential placeholder policy docs，定义 credentials、handles、debug-only payload 的示例写法规则。 |
| `docs/operations/aods-remote-exposure-upgrade-checklist.zh-CN.md` | U-145 remote exposure upgrade checklist，定义 local-only/local-export 升级到 remote/adapter-facing 的审查清单。 |
| `docs/operations/aods-risk-taxonomy-coverage-report.zh-CN.md` | U-146 risk taxonomy coverage report，汇总 9 类风险族的 spec / example 覆盖和 runtime 非目标。 |
| `docs/operations/aods-audit-metadata-completeness-report.zh-CN.md` | U-147 audit metadata completeness report，汇总 commands / adapters 的 actor、source、target、receipt、correlation 覆盖。 |
| `docs/operations/aods-policy-decision-receipt-boundary-refinement.zh-CN.md` | U-148 policy decision receipt boundary refinement，拆清 policy decision、receipt 和 audit anchor 责任。 |
| `docs/operations/aods-approval-label-semantics-review.zh-CN.md` | U-149 approval label semantics review，统一 human approval、review、escalation 和 receipt labels 的语义边界。 |
| `docs/operations/aods-local-only-export-safety-review.zh-CN.md` | U-150 local-only export safety review，审查 local-only / local-export 公开误用风险和升级 guard。 |
| `docs/operations/aods-workflow-runtime-minimal-poc-decision-gate.zh-CN.md` | U-151 workflow runtime minimal PoC decision gate，定义 workflow PoC 进入条件、成功指标和 abort criteria。 |
| `docs/operations/aods-event-store-minimal-poc-decision-gate.zh-CN.md` | U-152 event store minimal PoC decision gate，定义 event store / replay PoC 的数据模型候选和阻断条件。 |
| `docs/operations/aods-policy-engine-minimal-poc-decision-gate.zh-CN.md` | U-153 policy engine minimal PoC decision gate，定义 policy decision input/output、identity 和 audit boundary。 |
| `docs/operations/aods-remote-gateway-minimal-poc-decision-gate.zh-CN.md` | U-154 remote gateway minimal PoC decision gate，定义 auth、transport、rate/cost、failure semantics 进入条件。 |
| `docs/operations/aods-migration-tool-minimal-poc-decision-gate.zh-CN.md` | U-155 migration tool minimal PoC decision gate，定义 dry-run、rollback、destructive approval 和 fixtures 进入条件。 |
| `docs/operations/aods-conformance-runner-implementation-plan.zh-CN.md` | U-156 conformance runner implementation plan，定义从 fixture smoke 到 runner 的分阶段路线和进入条件。 |
| `docs/operations/aods-adapter-negotiation-protocol-plan.zh-CN.md` | U-157 adapter negotiation protocol plan，定义 negotiation 的 metadata prerequisites、protocol sketch 和非目标。 |
| `docs/operations/aods-cross-corpus-authority-resolver-research.zh-CN.md` | U-158 cross-corpus authority resolver research，定义 trust model、fetch policy、cache 和 failure posture。 |
| `docs/operations/aods-dependency-scheduler-research.zh-CN.md` | U-159 dependency scheduler research，审查 dependency ordering 是否应进入 runtime scheduler。 |
| `docs/operations/aods-telemetry-observability-store-research.zh-CN.md` | U-160 telemetry / observability store research，审查 report storage、dashboard 需求和隐私风险。 |
| `docs/operations/aods-post-backlog-task-plan.zh-CN.md` | U-161 post-backlog task plan，把任务池扩展到 U-200 并锁定 U-161 到 U-170。 |
| `docs/operations/aods-public-state-refresh-after-backlog-closure.zh-CN.md` | U-162 到 U-166 public state refresh，刷新 repo、PR、issue、release/version 状态。 |
| `docs/operations/aods-pr-public-action-approval-packet.zh-CN.md` | U-167 到 U-168 PR public action approval packet，记录 PR body stale scope、close syntax gap 和公开动作审批包。 |
| `docs/operations/aods-next-milestone-options.zh-CN.md` | U-169 到 U-170 next milestone options，定义 public closeout 与本地 conformance / diagnostics next slice。 |
| `docs/operations/aods-negative-fixture-first-slice.zh-CN.md` | U-171 到 U-172 negative fixture first slice，落地 3 个 fixture contract 负例并补 focused regression。 |
| `docs/operations/aods-conformance-manifest-report-proposal.zh-CN.md` | U-173 到 U-174 conformance manifest / report proposal，定义 suite / case / report 字段边界。 |
| `docs/operations/aods-fixture-conformance-docs-update.zh-CN.md` | U-175 fixture smoke / conformance docs update，区分 smoke、manifest proposal 和 runner 非目标。 |
| `docs/operations/aods-dependency-diagnostics-plan.zh-CN.md` | U-176 到 U-178 dependency diagnostics plan，记录 route JSON dependency status 扩展和 validator 计划。 |
| `docs/operations/aods-dependency-query-benchmark-and-generated-artifact-audit.zh-CN.md` | U-179 到 U-180 dependency query regression 和 PR generated artifact audit。 |
| `docs/operations/aods-pr-public-sync-execution.zh-CN.md` | U-181 到 U-187 PR public sync execution，记录 PR body、close refs、issue comments 和 ready-for-review。 |
| `docs/operations/aods-release-version-and-rc-gate.zh-CN.md` | U-188 到 U-190 release version decision、changelog preparation 和 RC gate rerun。 |
| `docs/operations/aods-release-closeout-readiness-plan.zh-CN.md` | U-191 到 U-195 release closeout readiness，记录 release notes、PR split/checks/package/post-merge guard。 |
| `docs/operations/aods-repeatable-local-hygiene-and-skill-alignment.zh-CN.md` | U-196 到 U-198 local docs link / secret scan repeatability 和 `aods-use` skill alignment。 |
| `docs/operations/aods-final-handoff-and-task-discovery.zh-CN.md` | U-199 到 U-200 handoff compaction 和 U-201 到 U-230 task discovery。 |
| `docs/operations/aods-release-closeout-final-readiness-packet.zh-CN.md` | U-201 到 U-210 PR body final refresh、close refs audit、review/checks policy、release notes draft、version/README plan、package/install/release gates 和 owner go/no-go packet。 |
| `docs/operations/aods-local-hygiene-automation.zh-CN.md` | U-211 到 U-220 local hygiene automation，落地 docs link、secret-like scan、package surface、generated churn、skill alignment 和 release hygiene aggregate 命令。 |
| `docs/operations/aods-conformance-diagnostics-implementation.zh-CN.md` | U-221 到 U-230 conformance / diagnostics implementation，落地 conformance schema、只读 runner、negative fixtures second slice 和 dependency diagnostics。 |
| `docs/operations/aods-post-conformance-task-discovery.zh-CN.md` | U-231 到 U-240 post-conformance task discovery、公开状态只读刷新、conformance schema / non-execution hardening 和后续 U-241 到 U-270 任务池。 |
| `docs/operations/aods-post-conformance-release-hardening.zh-CN.md` | U-241 到 U-250 post-conformance release hardening，记录 release self-check、packed conformance smoke、PR body refresh、release notes / version plan 和 conformance fail/warn/text regressions。 |
| `docs/operations/aods-package-terminology-drift-hardening.zh-CN.md` | U-251 到 U-260 package / terminology drift hardening，记录 packed conformance smoke follow-up、CI triage、post-merge reconciliation、owner go/no-go refresh、external conformance example 和 lifecycle alias terminology drift 边界。 |
| `docs/operations/aods-conformance-release-readiness-closeout.zh-CN.md` | U-261 到 U-270 conformance expansion / release execution readiness closeout，记录 no-fetch / adapter conformance design、observability no-go、package/generated guard audits、skill publish plan、release dry-run，以及 post-merge/post-release 阻塞项。 |
| `docs/operations/aods-v0.8-release-closeout.zh-CN.md` | v0.8 release closeout，记录 PR merge、issue close verification、GitHub Release、post-release retrospective 和 next milestone candidates。 |
| `docs/operations/aods-post-v0.8-next-task-discovery.zh-CN.md` | U-271 到 U-280 post-v0.8 next task discovery，记录 `#13` close、`#60` refresh、`#59/#41` coverage audit 和 U-281 到 U-330 新任务池。 |
| `docs/operations/aods-observability-next-slice.zh-CN.md` | U-281 到 U-290 validation / routing observability next slice，记录 validator location envelope、suggested-action coverage、route skipped-module boundary、README refresh 和 `#59` public status。 |
| `docs/operations/aods-capability-governance-next-slice.zh-CN.md` | U-291 到 U-300 capability / governance next slice，记录 fallback metadata、static protocol surface、fixture plan、`#41` public status 和 `#60` tracker audit。 |
| `docs/operations/aods-release-hygiene-skill-drift-followup.zh-CN.md` | U-301 到 U-310 release hygiene / install smoke / release artifact / skill drift follow-up，记录 post-v0.8 stale reference audit、CI decision 和本地 skill update route。 |
| `docs/operations/aods-changelog-conformance-docs-followup.zh-CN.md` | U-311 到 U-320 changelog / conformance / generated / package docs follow-up，记录 `#13` post-close audit、300/500 行为、conformance sample、no-fetch、expected-failure、generated guard 和 package allowlist。 |
| `docs/operations/aods-drift-adoption-release-guard.zh-CN.md` | U-321 到 U-330 drift / terminology / adoption / release guard follow-up，记录 code drift next slice、terminology gate deferral、glossary route、runtime no-go、v0.8 adoption checklist 和 next release naming guard。 |
| `docs/operations/aods-post-v0.8-second-task-discovery.zh-CN.md` | U-331 post-v0.8 第二轮任务发现，记录 `#60/#59/#41` 快照和 U-332 到 U-381 新任务池。 |
| `docs/operations/aods-roadmap-observability-capability-next-gates.zh-CN.md` | U-332 到 U-341 roadmap / observability / capability next gates，记录 `#60` tracker refresh packet、`#59` location / suggested-action gates 和 `#41` unsupported / fallback gates。 |
| `docs/operations/aods-structured-term-refs-evidence-freshness.zh-CN.md` | U-342 到 U-351 structured term refs / evidence freshness gates，记录术语引用设计、生命周期别名负例、证据新鲜度和 unchecked repo 修复路线。 |
| `docs/operations/aods-skill-index-release-maintenance.zh-CN.md` | U-352 到 U-361 skill / index / release maintenance gates，记录 installed skill update decision、索引压缩计划、采用命令冒烟、发布触发矩阵和 release asset policy。 |
| `docs/operations/aods-ci-public-sync-adoption-followup.zh-CN.md` | U-362 到 U-371 CI / public sync / adoption follow-up，记录 CI owner packet、`#41/#59/#60` 公开同步和 README/sample adoption 决策。 |
| `docs/operations/aods-adoption-sample-pack-and-next-task-discovery.zh-CN.md` | U-372 到 U-381 adoption sample pack / public hygiene / next task discovery，记录短 JSON 样例、包纳入决策、公开标签复查和 U-382 到 U-431 新任务池。 |
| `docs/operations/aods-comprehensive-task-plan.zh-CN.md` | U-092 综合任务池和每轮 10 任务执行规则。 |

## 当前维护边界

1. 公开 README、schema、spec、lib、benchmarks、examples 都仍属于项目维护范围。
2. benchmark sync 区块、generated benchmark 输出和 source generator 之间必须保持一致，不可只改生成结果。
3. 如果修改的是 AODS 语义面，优先遵循 AODS 自己的 compiled-corpus-first 权威结构，而不是把 README 当成第一权威。

## 当前公开示例入口

| 示例面 | 入口 | 说明 |
|---|---|---|
| Source-first pilot | `examples/compiled-pilot-source/authoring.json` | 当前示例的源权威；语义改动必须先改这里再编译。 |
| Source-first adoption guide | `examples/compiled-pilot-source/README.md` | 从源文件到生成、校验、路由、fixture smoke 的最小操作路径。 |
| Compiled pilot | `examples/compiled-pilot/` | 编译后的 agent / human 双 surface 示例输出。 |
| Surface-family packs | `examples/compiled-pilot/modules/shift-ops-*.json` | read-model、command、event、adapter、artifact/export、resource 六类 canonical packs。 |
| Glossary registry | `examples/compiled-pilot/indexes/runtime.json` | canonical term、alias、deprecated term、owner 和 linked surfaces 示例。 |
| External citation | `examples/compiled-pilot/modules/shift-ops-governance.json` | external citation registry、citation refs、decision provenance 与 unsupported assumption 示例。 |
| Fixture smoke | `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 可用 `npm run fixture:smoke` 冒烟检查 expected outcome 与 input / golden path；当前包含 9 个 positive 和 5 个 negative fixture 声明。 |
| Public sample snippets | `docs/examples/` | 短 `validate --json` / `route --json` 样例，供公开文档引用；当前不进 npm package。 |
