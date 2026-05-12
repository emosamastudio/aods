# AODS operations 入口

本目录承载 AODS 仓库当前的项目治理面。

## 当前权威文件

| 文件 | 作用 | 权威级别 |
|---|---|---|
| `aods-task-ledger.zh-CN.md` | 当前任务顺序、状态、验收标准、证据 | 最高 |
| `aods-work-rules.zh-CN.md` | 项目专属维护规则和同步要求 | 高 |
| `aods-v0.7-owner-roadmap.zh-CN.md` | v0.7 owner 决策，裁剪 issue roadmap 到可执行范围 | 高 |
| `aods-takeover-plan.zh-CN.md` | 2026-05-07 接手计划、当前回合边界和后续路线 | 高 |
| `aods-dirty-worktree-attribution.zh-CN.md` | 当前 dirty worktree 文件归因、提交拆分和风险边界 | 高 |
| `aods-github-sync-approval.zh-CN.md` | GitHub issue / PR / release 公开动作审批矩阵 | 高 |
| `aods-code-drift-roadmap.zh-CN.md` | 代码漂移路线、implementation evidence 最小切片和后续验证边界 | 高 |
| `aods-v0.8-backlog.zh-CN.md` | v0.7 release 后的 v0.8 backlog triage、open issue 排序和下一 drift 切片 | 高 |
| `aods-v0.9-backlog.zh-CN.md` | v0.8 backlog 清空后的 write/event/governance 候选路线 | 高 |
| `aods-v0.10-backlog.zh-CN.md` | v0.9 backlog 清空后的 risk/exposure/audit hardening 候选路线 | 高 |
| `aods-v0.11-backlog.zh-CN.md` | v0.10 队列收束后的 documentation / authoring quality 候选路线 | 高 |
| `aods-surface-family-example-plan.zh-CN.md` | `#56` surface-family example pack 分批路线、U-051 read-model、U-052 command/receipt、U-053 event/correction、U-054 adapter/capability、U-055 artifact/export/policy-gate、U-058 resource 包结果和本地收束结论 | 高 |
| `aods-expanded-task-plan.zh-CN.md` | U-058 后的扩展任务池、批量执行规则和下一批推荐 | 高 |
| `aods-glossary-registry-plan.zh-CN.md` | `#57` glossary / canonical-term registry v2 boundary、schema/validator/example 后续任务裁剪 | 高 |
| `aods-external-citation-plan.zh-CN.md` | `#58` external citation / provenance metadata boundary、schema/validator/example 后续任务裁剪 | 高 |
| `aods-github-public-sync-triage.zh-CN.md` | `#54-#58`、`#60/#41` 的本地覆盖与公开状态差异、owner 审批矩阵 | 高 |
| `aods-next-code-drift-slice.zh-CN.md` | 下一段代码漂移最小切片选择，确认 U-071 implementation reality locator hardening | 高 |
| `aods-route-discoverability-review.zh-CN.md` | `#9/#10/#17` 与 route / boot_by_touch discoverability 残留复盘，新增 U-076 建议 | 高 |
| `aods-v0.12-backlog.zh-CN.md` | v0.12+ backlog triage：public sync 后的代码漂移、runtime 边界、observability 和 adoption docs 下一批任务 | 高 |
| `aods-v0.11-release-readiness.zh-CN.md` | U-074 release readiness gate、package dry-run、release notes skeleton 和发布前剩余风险 | 高 |
| `aods-implementation-evidence-hygiene.zh-CN.md` | U-077 implementation evidence stale/current posture 的 deterministic summary 与 warning hygiene | 高 |
| `aods-capability-compatibility-gates.zh-CN.md` | U-078 capability compatibility metadata deterministic gates 与 canonical matrix case | 高 |
| `aods-route-json-explanation.zh-CN.md` | U-079 route JSON explanation 的 `source/reason/dependency` 最小字段契约 | 高 |
| `aods-fixture-smoke-runner.zh-CN.md` | U-080 fixture / golden export smoke runner 的 CLI 与 JSON report 契约 | 高 |
| `aods-source-first-adoption-guide.zh-CN.md` | U-081 source-first example packs 公开采用路径 | 高 |
| `aods-external-citation-hygiene-report.zh-CN.md` | U-082 external citation stale/current/assumption posture 的 validation report 摘要 | 高 |
| `aods-changelog-delta-ergonomics-review.zh-CN.md` | U-083 changelog.delta 300 字符限制是否阻塞 release workflow 的复审 | 高 |
| `aods-runtime-boundary-research.zh-CN.md` | U-084 runtime-boundary research spike，梳理 workflow runtime、event store、policy engine、remote gateway、migration tool 的边界和进入条件 | 高 |
| `aods-comprehensive-task-plan.zh-CN.md` | U-092 综合任务池、长期任务分段和每轮 10 任务执行规则 | 高 |
| `aods-runtime-readiness-gate-matrix.zh-CN.md` | U-085 runtime readiness gate matrix，把五类 runtime 候选映射到 authority / evidence / risk / fixture / public sync gate | 高 |
| `aods-workflow-runtime-entry-triage.zh-CN.md` | U-086 workflow runtime entry contract triage，明确 lifecycle / command / audit / dependency 前置条件和非目标 | 高 |
| `aods-event-store-entry-triage.zh-CN.md` | U-087 event store / replay entry contract triage，明确 event identity、ordering、retention、replay 和 correction projection 边界 | 高 |
| `aods-policy-engine-entry-triage.zh-CN.md` | U-088 policy engine / approval runtime triage，明确 policy decision input/output、audit receipt 和 approval boundary | 高 |
| `aods-remote-gateway-entry-triage.zh-CN.md` | U-089 remote gateway / adapter runtime triage，明确 exposure upgrade、auth、transport、audit 和 compatibility 前置条件 | 高 |
| `aods-migration-tool-entry-triage.zh-CN.md` | U-090 migration tool entry contract triage，明确 source/target authority、dry-run、rollback、mapping 和 destructive approval 边界 | 高 |
| `aods-pr-final-readiness.zh-CN.md` | U-091 PR final readiness / public sync closeout，记录 draft PR、close-on-merge、version 和 release 决策 | 高 |
| `aods-pr-review-response-matrix.zh-CN.md` | U-093 PR review response matrix，记录 PR review、covered issue 和 deferred issue 状态 | 高 |
| `aods-version-changelog-triage.zh-CN.md` | U-094 version bump and changelog route triage，明确下一 release 前的版本和 changelog 路线 | 高 |
| `aods-release-notes-completeness.zh-CN.md` | U-095 release notes completeness pass，提供下一 release notes skeleton 和发布前 blockers | 高 |
| `aods-package-artifact-inventory-guard.zh-CN.md` | U-096 package artifact inventory guard，记录 pack dry-run JSON 清单审查 | 高 |
| `aods-packed-install-smoke.zh-CN.md` | U-097 packed tarball install smoke，记录本地 tarball 安装和 CLI / validate / fixture 冒烟 | 高 |
| `aods-public-issue-close-on-merge-audit.zh-CN.md` | U-098 public issue close-on-merge audit，核对 PR close/deferred issue 列表 | 高 |
| `aods-post-merge-public-reconciliation-plan.zh-CN.md` | U-099 post-merge public state reconciliation plan，定义 merge 后公开状态核对顺序 | 高 |
| `aods-v0.12-release-candidate-gate.zh-CN.md` | U-100 v0.12 release candidate gate，记录 release self-check、package、install smoke 和 blockers | 高 |
| `aods-release-execution-playbook-dry-run.zh-CN.md` | U-101 release execution playbook dry run，定义授权后发布步骤、冲突检查和 rollback | 高 |
| `aods-post-release-retrospective-next-milestone.zh-CN.md` | U-102 post-release retrospective and next milestone triage，提供发布后复盘模板和下一 milestone 入口 | 高 |
| `aods-implementation-evidence-locator-matrix-v2.zh-CN.md` | U-103 implementation evidence locator matrix v2，记录 repo/path/evidence locator 和 unchecked posture | 高 |
| `aods-acceptance-criteria-coverage-report.zh-CN.md` | U-104 acceptance criteria coverage report，汇总 criteria、evidence refs、fixture 和 validator posture | 高 |
| `aods-contract-requirement-evidence-trace-report.zh-CN.md` | U-105 contract requirement to evidence trace report，定义 requirement 到 evidence 的静态追踪边界 | 高 |
| `aods-stale-evidence-refresh-workflow.zh-CN.md` | U-106 stale evidence refresh workflow boundary，定义 owner、trigger、validation gate 和人工复审路径 | 高 |
| `aods-missing-reality-locator-remediation.zh-CN.md` | U-107 missing reality locator remediation plan，定义 unchecked implementation repo locator 的最小修复路线 | 高 |
| `aods-implementation-repo-locator-normalization.zh-CN.md` | U-108 implementation repo locator normalization，定义 path / URL / descriptive locator 的解释边界 | 高 |
| `aods-current-planned-implementation-summary-guard.zh-CN.md` | U-109 current vs planned implementation summary guard，明确 current/planned/stale/blocked report posture | 高 |
| `aods-evidence-command-non-execution-invariant.zh-CN.md` | U-110 evidence command non-execution invariant，记录 validate/reality/fixture smoke 不执行命令的测试与边界 | 高 |
| `aods-implementation-drift-dashboard-boundary.zh-CN.md` | U-111 implementation drift dashboard boundary triage，定义未来 dashboard 的静态输入和非目标 | 高 |
| `aods-code-ownership-mapping-boundary.zh-CN.md` | U-112 code ownership mapping boundary triage，定义 owner authority、path、review owner 和 fallback 边界 | 高 |
| `aods-fixture-manifest-coverage-matrix.zh-CN.md` | U-113 fixture manifest coverage matrix，汇总 positive / negative / golden coverage | 高 |
| `aods-negative-fixture-expansion-plan.zh-CN.md` | U-114 negative fixture expansion plan，排序下一批 high-value negative fixtures | 高 |
| `aods-golden-export-drift-report.zh-CN.md` | U-115 golden export drift report，定义 golden diff 检测、人工接受和拒绝边界 | 高 |
| `aods-fixture-smoke-output-contract-snapshot.zh-CN.md` | U-116 fixture smoke output contract snapshot，固化 fixture smoke JSON / text 输出字段 | 高 |
| `aods-example-pack-gap-audit-after-pr-review.zh-CN.md` | U-117 example pack gap audit after PR review，记录 PR review 空状态下的示例包缺口矩阵 | 高 |
| `aods-source-first-compile-determinism-report.zh-CN.md` | U-118 source-first compile determinism report，确认连续编译无 generated diff | 高 |
| `aods-compiled-pilot-schema-mirror-audit.zh-CN.md` | U-119 compiled pilot schema mirror audit，确认 compiled-pilot schema 与 root schema 一致 | 高 |
| `aods-seven-plane-pilot-freshness-review.zh-CN.md` | U-120 seven-plane pilot freshness review，确认旧 pilot 仍适合核心结构示例但不承载新能力展示 | 高 |
| `aods-open-source-scenario-pack-health-review.zh-CN.md` | U-121 open-source scenario pack health review，记录 scenario / corpus fixture 覆盖和维护成本 | 高 |
| `aods-benchmark-generated-artifact-hygiene-policy.zh-CN.md` | U-122 benchmark generated artifact hygiene policy，定义 generated / reports churn 的接受和还原规则 | 高 |
| `aods-cli-help-coverage-matrix.zh-CN.md` | U-123 CLI help coverage matrix，补齐 validate / hook / upgrade / compile / scaffold 等子命令 help | 高 |
| `aods-validate-json-report-schema-docs.zh-CN.md` | U-124 validate JSON report schema docs，文档化 base report 与 reality extension 字段 | 高 |
| `aods-validate-text-json-parity-audit.zh-CN.md` | U-125 validate text / JSON parity audit，明确 text 与 JSON 输出的信息差和保留差异 | 高 |
| `aods-route-explanation-dependency-graph-review.zh-CN.md` | U-126 route explanation dependency graph review，确认 `source/reason/dependency` 覆盖与直接依赖边界 | 高 |
| `aods-remediation-guidance-coverage-matrix.zh-CN.md` | U-127 remediation guidance coverage matrix，记录 validator remediation 覆盖与新增 changelog action | 高 |
| `aods-validation-severity-gate-consistency-review.zh-CN.md` | U-128 validation severity gate consistency review，确认 warning / strict gate 行为一致 | 高 |
| `aods-compact-verbose-validation-output-triage.zh-CN.md` | U-129 compact vs verbose validation output triage，明确暂不新增输出模式并做局部 message 改进 | 高 |
| `aods-route-query-corpus-coverage-audit.zh-CN.md` | U-130 route query corpus coverage audit，审查 common query terms 到 authority module 的覆盖 | 高 |
| `aods-route-touch-route-stale-path-audit.zh-CN.md` | U-131 route touch-route stale path audit，确认现有 touch routes 无 stale path 并记录 docs fallback | 高 |
| `aods-error-message-actionable-wording-pass.zh-CN.md` | U-132 error message actionable wording pass，补 route invalid arg 和 maxLength length diagnostics | 高 |
| `aods-authoring-source-lint-boundary-triage.zh-CN.md` | U-133 authoring source lint boundary triage，明确 source-first lint 仍以 schema/compile/validate 为主 | 高 |
| `aods-changelog-delta-ergonomics-fix-plan.zh-CN.md` | U-134 changelog delta ergonomics fix plan，选择 300 soft warning + 500 hard fail | 高 |
| `aods-changelog-delta-schema-test-implementation.zh-CN.md` | U-135 changelog delta schema/test implementation，落地 schema、validator、test 和 spec 同步 | 高 |
| `aods-v0.7-rc-gate.zh-CN.md` | v0.7 release candidate gate、版本面判断和 release note skeleton | 高 |
| `aods-round-log.zh-CN.md` | 当前回合锁定、范围和验证记录 | 高 |
| `aods-progress-ledger.zh-CN.md` | 阶段口径与阶段进度 | 中 |
| `aods-handoff.zh-CN.md` | 接手入口和当前风险边界 | 高 |

## 新 agent 启动顺序

1. 读 `manifest.json`
2. 读 `docs/README.md`
3. 读本文件
4. 读 `aods-task-ledger.zh-CN.md`
5. 读 `aods-work-rules.zh-CN.md`
6. 读 `aods-v0.7-owner-roadmap.zh-CN.md`
7. 读 `aods-takeover-plan.zh-CN.md`
8. 读 `aods-dirty-worktree-attribution.zh-CN.md`
9. 读 `aods-github-sync-approval.zh-CN.md`
10. 读 `aods-code-drift-roadmap.zh-CN.md`
11. 读 `aods-v0.8-backlog.zh-CN.md`
12. 读 `aods-v0.9-backlog.zh-CN.md`
13. 读 `aods-v0.10-backlog.zh-CN.md`
14. 读 `aods-v0.11-backlog.zh-CN.md`
15. 读 `aods-surface-family-example-plan.zh-CN.md`
16. 读 `aods-expanded-task-plan.zh-CN.md`
17. 读 `aods-glossary-registry-plan.zh-CN.md`
18. 读 `aods-external-citation-plan.zh-CN.md`
19. 读 `aods-github-public-sync-triage.zh-CN.md`
20. 读 `aods-next-code-drift-slice.zh-CN.md`
21. 读 `aods-route-discoverability-review.zh-CN.md`
22. 读 `aods-v0.12-backlog.zh-CN.md`
23. 读 `aods-v0.11-release-readiness.zh-CN.md`
24. 读 `aods-implementation-evidence-hygiene.zh-CN.md`
25. 读 `aods-capability-compatibility-gates.zh-CN.md`
26. 读 `aods-route-json-explanation.zh-CN.md`
27. 读 `aods-fixture-smoke-runner.zh-CN.md`
28. 读 `aods-source-first-adoption-guide.zh-CN.md`
29. 读 `aods-external-citation-hygiene-report.zh-CN.md`
30. 读 `aods-changelog-delta-ergonomics-review.zh-CN.md`
31. 读 `aods-runtime-boundary-research.zh-CN.md`
32. 读 `aods-comprehensive-task-plan.zh-CN.md`
33. 读 `aods-runtime-readiness-gate-matrix.zh-CN.md`
34. 读 `aods-workflow-runtime-entry-triage.zh-CN.md`
35. 读 `aods-event-store-entry-triage.zh-CN.md`
36. 读 `aods-policy-engine-entry-triage.zh-CN.md`
37. 读 `aods-remote-gateway-entry-triage.zh-CN.md`
38. 读 `aods-migration-tool-entry-triage.zh-CN.md`
39. 读 `aods-pr-final-readiness.zh-CN.md`
40. 读 `aods-pr-review-response-matrix.zh-CN.md`
41. 读 `aods-version-changelog-triage.zh-CN.md`
42. 读 `aods-release-notes-completeness.zh-CN.md`
43. 读 `aods-package-artifact-inventory-guard.zh-CN.md`
44. 读 `aods-packed-install-smoke.zh-CN.md`
45. 读 `aods-public-issue-close-on-merge-audit.zh-CN.md`
46. 读 `aods-post-merge-public-reconciliation-plan.zh-CN.md`
47. 读 `aods-v0.12-release-candidate-gate.zh-CN.md`
48. 读 `aods-release-execution-playbook-dry-run.zh-CN.md`
49. 读 `aods-post-release-retrospective-next-milestone.zh-CN.md`
50. 读 `aods-implementation-evidence-locator-matrix-v2.zh-CN.md`
51. 读 `aods-acceptance-criteria-coverage-report.zh-CN.md`
52. 读 `aods-contract-requirement-evidence-trace-report.zh-CN.md`
53. 读 `aods-stale-evidence-refresh-workflow.zh-CN.md`
54. 读 `aods-missing-reality-locator-remediation.zh-CN.md`
55. 读 `aods-implementation-repo-locator-normalization.zh-CN.md`
56. 读 `aods-current-planned-implementation-summary-guard.zh-CN.md`
57. 读 `aods-evidence-command-non-execution-invariant.zh-CN.md`
58. 读 `aods-implementation-drift-dashboard-boundary.zh-CN.md`
59. 读 `aods-code-ownership-mapping-boundary.zh-CN.md`
60. 读 `aods-fixture-manifest-coverage-matrix.zh-CN.md`
61. 读 `aods-negative-fixture-expansion-plan.zh-CN.md`
62. 读 `aods-golden-export-drift-report.zh-CN.md`
63. 读 `aods-fixture-smoke-output-contract-snapshot.zh-CN.md`
64. 读 `aods-example-pack-gap-audit-after-pr-review.zh-CN.md`
65. 读 `aods-source-first-compile-determinism-report.zh-CN.md`
66. 读 `aods-compiled-pilot-schema-mirror-audit.zh-CN.md`
67. 读 `aods-seven-plane-pilot-freshness-review.zh-CN.md`
68. 读 `aods-open-source-scenario-pack-health-review.zh-CN.md`
69. 读 `aods-benchmark-generated-artifact-hygiene-policy.zh-CN.md`
70. 读 `aods-cli-help-coverage-matrix.zh-CN.md`
71. 读 `aods-validate-json-report-schema-docs.zh-CN.md`
72. 读 `aods-validate-text-json-parity-audit.zh-CN.md`
73. 读 `aods-route-explanation-dependency-graph-review.zh-CN.md`
74. 读 `aods-remediation-guidance-coverage-matrix.zh-CN.md`
75. 读 `aods-validation-severity-gate-consistency-review.zh-CN.md`
76. 读 `aods-compact-verbose-validation-output-triage.zh-CN.md`
77. 读 `aods-route-query-corpus-coverage-audit.zh-CN.md`
78. 读 `aods-route-touch-route-stale-path-audit.zh-CN.md`
79. 读 `aods-error-message-actionable-wording-pass.zh-CN.md`
80. 读 `aods-authoring-source-lint-boundary-triage.zh-CN.md`
81. 读 `aods-changelog-delta-ergonomics-fix-plan.zh-CN.md`
82. 读 `aods-changelog-delta-schema-test-implementation.zh-CN.md`
83. 读 `aods-v0.7-rc-gate.zh-CN.md`
84. 读 `aods-handoff.zh-CN.md`
85. 接续当前回合时再读 `aods-round-log.zh-CN.md`

## 当前维护范围

- 根语义面：
  - `manifest.json`
  - `schema/`
  - `spec/`
  - `modules/`
- CLI / runtime：
  - `bin/`
  - `lib/`
- benchmark：
  - `benchmarks/aods-eval-lab/`
- 发布与公开入口：
  - `README.md`
  - `README.zh-CN.md`
  - `CONTRIBUTING.md`
  - `.github/`
- examples：
  - `examples/compiled-pilot-source/`
  - `examples/compiled-pilot/`
  - `examples/seven-plane-pilot/`

## 当前公开示例导航

| 示例 | 当前入口 | 用途 |
|---|---|---|
| Source-first adoption guide | `examples/compiled-pilot-source/README.md` | 从源文件到生成、校验、路由、fixture smoke 的最小操作路径。 |
| Source-first authoring | `examples/compiled-pilot-source/authoring.json` | 修改 canonical example 语义时的源权威。 |
| Read-model / implementation linkage | `examples/compiled-pilot/modules/shift-ops-readiness-read-model.json` | 展示 freshness、watermark、implementation evidence、acceptance criteria。 |
| Command / receipt | `examples/compiled-pilot/modules/shift-ops-change-command.json` | 展示 write-capable command、receipt、audit/risk posture。 |
| Event / correction | `examples/compiled-pilot/modules/shift-ops-change-event-log.json` | 展示 append-only event、correction、supersession、projection guidance。 |
| Adapter / capability | `examples/compiled-pilot/modules/shift-ops-adapter-capability.json` | 展示 metadata-only capability、consumer requirement、exposure、audit。 |
| Artifact export / policy gate | `examples/compiled-pilot/modules/shift-ops-artifact-export-policy.json` | 展示 generated export、golden review、policy gate。 |
| Resource surface | `examples/compiled-pilot/modules/shift-ops-resource-surface.json` | 展示 resource identity、scope、risk、exposure、cleanup、evidence linkage。 |
| Glossary registry | `examples/compiled-pilot/indexes/runtime.json` | 展示 canonical term v2 record、alias、deprecated term、linked surfaces。 |
| External citation / provenance | `examples/compiled-pilot/modules/shift-ops-governance.json` | 展示 external citation registry、citation refs、unsupported assumptions。 |

## AODS-specific maintenance notes

1. 公开 README 的 benchmark sync 区块来自 `benchmarks/aods-eval-lab/src/summary.mjs`。
2. `validate:all` 是语义改动后的 repo-level gate；如果变更 benchmark 生成逻辑，还需要补对应 benchmark 命令。
3. `release:self-check` 是发布前总门禁；AODS 的正式版本发布统一走 GitHub Releases，npm registry publish 不再是 release 完成条件。
4. `npm run fixture:smoke` 是 fixture / golden export manifest 的最小冒烟门禁；它只检查声明结构和路径，不执行 golden update command。
5. `validate` 的 citation hygiene 摘要只统计已声明 posture，不抓取 URL、不做事实核验。
6. U-084 后，workflow / event / policy / remote / migration 相关事项必须先满足 runtime readiness gate，再进入实现；默认仍是 metadata-only 边界。
7. U-092 后，每轮质量复审通过时必须从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。
8. U-085 到 U-135 已完成 readiness / triage / release closeout / package smoke / evidence trace / fixture coverage / output contract / CLI validation docs / route validation DX / changelog ergonomics；当前仍不实现 runtime、不 merge PR、不发布 release、不 bump version。
