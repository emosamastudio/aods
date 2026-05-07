# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-07

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | 开发中 |
| 更新时间 | 2026-05-07 |
| 当前阶段 | S8 dependency ordering boundary |
| 当前回合 | R-2026-05-07-19 |
| 未完成任务数量 | 1 |
| 已完成任务数量 | 44 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-07-19 |
| 开始时间 | 2026-05-07 17:23 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-039 |
| 本轮范围 | dependency ordering between surfaces 最小边界：requires、blocks、derives_from、emits、consumes、optional dependency、hard/optional/advisory/unknown dependency strength；spec docs、focused regression、operations docs |
| 排除范围 | GitHub issue 关闭或评论、release 发布、Polaris sibling repo、package manager、runtime scheduler、cross-repo dependency executor、automatic topological build runner |
| 验证计划 | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`；`npm run validate:all`；`npm run benchmark:test`；`git diff --check` |
| 新任务处理规则 | 本轮发现的新任务只写入台账，不执行。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-040 | S8 | 定义 deprecation and migration format 最小边界 | P2 | 未开始 | deprecation fields、replacement links、migration guidance、affected versions、removal version、validation behavior 最小语义进入 spec；不做自动迁移工具 | U-038、U-039 | 对应 `#52`；下一轮首选 |

## 已完成任务

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 1 | U-000 | S0 | 硬化公开文档并同步 benchmark 输出 | P0 | 2026-04-23 | `README.md`、`README.zh-CN.md`、`docs/01-product-lifecycle.md`、`benchmarks/aods-eval-lab/src/*.mjs`、生成报告 | `npm run benchmark:evaluate && npm run benchmark:compare && npm run benchmark:test && npm run benchmark:summary && npm run validate:all` | 已推送到 `origin/main` |
| 2 | U-000A | S0 | 建立 GitHub contribution surfaces | P1 | 2026-04-23 | `CONTRIBUTING.md`、`.github/ISSUE_TEMPLATE/*`、README discussion / issue 入口 | 人工审查 | 为公开反馈建立结构化入口 |
| 3 | U-000B | S0 | 启动 Discussions 对外讨论面 | P1 | 2026-04-23 | discussion `#26`、discussion `#27` | GitHub UI 审查 | 为发布和 thesis 讨论提供入口 |
| 4 | U-000C | S0 | 完成 issue backlog review 并确定 `#28` 为下一主线 | P0 | 2026-04-23 | `plan.md` 中的 issue backlog review wave 记录；issue 结论摘要 | `gh issue list` / `gh issue view` | 形成后续优先级排序 |
| 5 | U-001 | S0 | 为 AODS 安装 project-level work standard 并补齐初始任务台账 | P0 | 2026-05-02 | `AGENTS.md`、`.github/copilot-instructions.md`、`docs/README.md`、`docs/operations/aods-*.md` | `git diff --check -- AGENTS.md .github/copilot-instructions.md docs/README.md docs/operations` | 本包开始使用 file-backed task ledger |
| 6 | U-001A | S0 | 以 AODS owner 视角复审任务台账，修正旧 issue 视角导致的遗漏和排序错误 | P0 | 2026-05-02 | `docs/operations/aods-task-ledger.zh-CN.md`、`aods-work-rules.zh-CN.md`、`aods-handoff.zh-CN.md` | `git diff --check -- AGENTS.md .github/copilot-instructions.md docs/README.md docs/operations` | 将 `#29-#32/#60` 纳入 owner roadmap，不再把 issue 标签当成自动优先级 |
| 7 | U-002 | S1 | 做负责人级 roadmap triage，裁剪 `#60/#29-#59/#28` 到 v0.7 可执行范围 | P0 | 2026-05-02 | `docs/operations/aods-v0.7-owner-roadmap.zh-CN.md`、更新后的任务台账、round log、handoff | `git diff --check -- AGENTS.md .github/copilot-instructions.md docs/README.md docs/operations` | 确定 v0.7 must-build / should-build / defer / legacy issue 决策 |
| 8 | U-003 | S1 | 定义“No stable surface without AODS authority”治理原则和 over-implementation 处理规则 | P0 | 2026-05-02 | `spec/authority-governance.json`、`spec/surface-governance.json`、`manifest.json`、`spec/validation-rules.json` | `npm run validate:strict` | 将 stable surface authority 从 capsule 拆到 detail authority module |
| 9 | U-004 | S1 | 定义 surface stability / exposure lifecycle 的最小状态机 | P0 | 2026-05-02 | `spec/authority-governance.json` 中 lifecycle / exposure 状态与 transition 表 | `npm run validate:strict` | 明确 internal / experimental / local-only / adapter-facing / stable / deprecated / removed |
| 10 | U-016 | S3 | 为空 `boot_by_touch` 增加 advisory，降低发现门槛 | P2 | 2026-05-02 | `lib/validate.mjs`、`spec/validation-rules.json`、`benchmarks/aods-eval-lab/test/scaffold.test.mjs` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:strict` | 10+ 模块且无 touch route 时发 L3 warning，strict 阻断 |
| 11 | U-017 | S3 | 提升 `capsule-shorter-than-detail` 诊断信息 | P2 | 2026-05-02 | `lib/validate.mjs`、`spec/validation-rules.json`、`benchmarks/aods-eval-lab/test/scaffold.test.mjs` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:strict` | 去重同一 target，并在 warning 中输出 capsule / target 近似 token 数 |
| 12 | U-019 | S4 | 关闭或降级低价值 / stale issue，包括 `#16` 和 `#13` | P3 | 2026-05-02 | `#16` 已关闭；`#13` 已留言保留但延后 | `gh issue close 16`、`gh issue comment 13` | 只做 issue hygiene，不把 `#13` 提前实现 |
| 13 | U-005 | S1 | 定义 sensitive-surface / redaction policy 的最小可验证模型 | P0 | 2026-05-02 | `spec/stable-surface-contracts.json`、`schema/module.schema.json`、`schema/manifest.schema.json`、`lib/validate.mjs`、`spec/validation-rules.json` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:strict`、`npm run validate:all` | 采用 metadata-first redaction posture；对 `has_sensitive_payloads=true` 增加 deterministic completeness gate |
| 14 | U-006 | S1 | 定义 contract completeness profiles 的 v0.7 最小子集 | P0 | 2026-05-02 | `spec/stable-surface-contracts.json`、`schema/module.schema.json`、`schema/manifest.schema.json`、`lib/validate.mjs`、`spec/validation-rules.json` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:strict`、`npm run validate:all` | 裁剪为 `read-model`、`command`、`implementation-linkage` 三类 profile，并增加 manifest/module profile mirror 约束 |
| 15 | U-007 | S1 | 定义 `project_topology` / implementation alignment 作为 `#28` 的 concrete pilot | P0 | 2026-05-02 | `spec/stable-surface-contracts.json`、`manifest.json`、`spec/surface-governance.json` | `npm run validate:strict`、`npm run validate:all` | 本轮仅完成 design-only pilot 语义与迁移路径；显式排除 U-008/U-009/U-010 的 schema/runtime 实现 |
| 16 | U-012 | S2 | 定义 schema versioning / compatibility policy for stable surfaces 的最小 guidance | P1 | 2026-05-02 | `spec/stable-surface-contracts.json`、`schema/module.schema.json`、`schema/manifest.schema.json`、`lib/validate.mjs`、`spec/validation-rules.json` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:strict`、`npm run validate:all` | 明确 `strict` / `versioned` / `experimental` breaking policy 最小语义；不引入迁移框架 |
| 17 | U-008 | S1 | 在 schema / spec / examples 中落地根级 `project_topology.implementation_repos[]` | P0 | 2026-05-02 | `schema/manifest.schema.json`、`schema/authoring.schema.json`、`lib/compile.mjs`、`examples/compiled-pilot-source/authoring.json`、`spec/stable-surface-contracts.json` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all` | root topology 已进入 schema 与 compiled-authoring 链路，并由 compiled-pilot 表达双 implementation repo |
| 18 | U-011 | S2 | 定义 validation severity levels 与 gating policy 的 v0.7 最小版 | P0 | 2026-05-02 | `spec/validation-rules.json`、`manifest.json` | `npm run validate:strict`、`npm run validate:all` | 新增 severity taxonomy 与 gate matrix；明确当前 runtime 仍以 error/warning bucket 为先 |
| 19 | U-014 | S2 | 合并设计 adapter-facing / capability negotiation 最小契约 | P2 | 2026-05-02 | `spec/stable-surface-contracts.json`、`spec/authority-governance.json`、`manifest.json` | `npm run validate:strict`、`npm run validate:all` | 仅落 minimum contract，不引入 negotiation handshake / discovery / auth exchange 框架 |
| 20 | U-009 | S1 | 为模块增加可选 implementation linkage，并定义与根 topology 的关系 | P0 | 2026-05-02 | `schema/module.schema.json`、`schema/manifest.schema.json`、`lib/corpus-helpers.mjs`、`lib/compile.mjs`、`lib/validate.mjs`、`examples/compiled-pilot-source/authoring.json`、compiled-pilot 输出 | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all` | module-level implementation linkage 已可表达 `repo_id / paths / status / authority_surface / pr_refs`，并与 root topology repo id 建立 mirror + referential gate |
| 21 | U-010 | S1 | 让 `validate --reality` 输出 topology 摘要或未检查告警，打破 design-only green loop | P0 | 2026-05-02 | `lib/validate.mjs`、`spec/validation-rules.json`、compiled-pilot reality summary | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all` | `validate --reality` 现输出 `linked_modules / unlinked_modules / checked_paths / missing_paths / unchecked_reason`，并对可解析 repo locator 做 reality 检查 |
| 22 | U-013 | S2 | 定义 cross-surface reference integrity 与 unresolved-ref semantics 的设计边界 | P1 | 2026-05-02 | `spec/authority-governance.json`、`spec/validation-rules.json`、`manifest.json` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all` | v0.7 已明确 canonical ref / owner / resolution status / unresolved posture 的最小边界；当前只落 spec boundary，不自动 fetch 外部 corpus |
| 23 | U-018 | S3 | 降低 paired surfaces 对 `shared_invariants` 的字面重复脆弱性 | P2 | 2026-05-02 | `lib/validate.mjs`、`spec/validation-rules.json`、`benchmarks/aods-eval-lab/test/scaffold.test.mjs` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all` | validator 现用规范化比较（大小写/空白/标点/引号/连字符）匹配 invariant，同时保留 claim-conflict 的高信号语义约束 |
| 24 | U-015 | S4 | 补齐 release alignment checklist，并收敛正式发布策略 | P1 | 2026-05-02 | `docs/operations/README.md`、`docs/operations/aods-work-rules.zh-CN.md`、`CONTRIBUTING.md`、治理台账同步 | `npm run release:self-check` | 正式版本发布统一走 GitHub Releases；`release:self-check` 继续负责 repo + benchmark + package dry-run 对齐，但 npm registry publish 不再是 release gate |
| 25 | U-021 | S4 | 修复接手 review findings：stable metadata compile mirror 与 duplicate implementation repo id validation | P0 | 2026-05-07 | `lib/compile.mjs`、`lib/corpus-helpers.mjs`、`lib/validate.mjs`、`schema/manifest.schema.json`、`spec/stable-surface-contracts.json`、`spec/validation-rules.json`、`benchmarks/aods-eval-lab/test/scaffold.test.mjs` | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`npm run release:self-check`、`git diff --check` | 本地已修复并验证；尚未 stage、commit、push |
| 26 | U-020 | S4 | 建立 AODS 接手计划并同步治理台账 | P0 | 2026-05-07 | `docs/operations/aods-takeover-plan.zh-CN.md`、`docs/operations/README.md`、`docs/operations/aods-task-ledger.zh-CN.md`、`docs/operations/aods-round-log.zh-CN.md`、`docs/operations/aods-handoff.zh-CN.md` | `git diff --check` | AODS/Polaris 解耦边界、当前回合计划、代码漂移路线和 GitHub 外部动作审批点已入账 |
| 27 | U-022 | S4 | 对当前 dirty worktree 做提交 / PR 归因计划 | P0 | 2026-05-07 | `docs/operations/aods-dirty-worktree-attribution.zh-CN.md`、operations README、round log、handoff、task ledger | `git diff --check` | 27 个 tracked modified、14 个 untracked 已归为 governance、memory、semantic、runtime、example、benchmark、test 组；未 stage |
| 28 | U-023 | S4 | 制定 GitHub issue / PR 同步审批矩阵 | P1 | 2026-05-07 | `docs/operations/aods-github-sync-approval.zh-CN.md`、operations README、round log、handoff、task ledger | `gh repo view --json ...`、`gh pr list --state open --json ...`、`gh issue list --state open --json ...`、`git diff --check` | GitHub 当前 public repo、0 open PR、37 open issues；公开动作仅列审批矩阵，未执行 |
| 29 | U-024 | S5 | 设计代码漂移路线的最小下一切片 | P0 | 2026-05-07 | `docs/operations/aods-code-drift-roadmap.zh-CN.md`、operations README、round log、handoff、task ledger | `git diff --check` | 确定以 implementation evidence / contract drift 为下一主线；明确不做全量代码扫描器、不用 LLM 作唯一事实来源 |
| 30 | U-025 | S4 | v0.7 release candidate gate decision | P1 | 2026-05-07 | `docs/operations/aods-v0.7-rc-gate.zh-CN.md`、operations README、round log、handoff、task ledger | `jq '{name, version, scripts}' package.json`、`git tag --sort=-version:refname`、`gh release list --limit 20`、`npm run release:self-check`、`git diff --check` | local RC candidate / conditional pass；package / README / latest release 仍为 `0.6.0`，不直接发布 |
| 31 | U-026 | S4 | 执行 v0.7 release branch / PR，排除 `MEMORY.md` | P0 | 2026-05-07 | Branch `codex/aods-v0.7-rc`、PR `#61`、GitHub Release `v0.7.0`、issue sync、staged set excludes `MEMORY.md` | `npm run release:self-check`、`git diff --cached --check`、`git push -u origin codex/aods-v0.7-rc`、`gh pr create --draft ...`、`gh pr merge 61 --squash`、`gh release create v0.7.0` | Release: `https://github.com/emosamastudio/aods/releases/tag/v0.7.0` |
| 32 | U-027 | S5 | 落地 implementation evidence 最小切片 | P0 | 2026-05-07 | `schema/module.schema.json`、`schema/manifest.schema.json`、`lib/compile.mjs`、`lib/validate.mjs`、`spec/stable-surface-contracts.json`、`spec/validation-rules.json`、compiled-pilot source/output、benchmark generated corpus schema、focused regressions、PR `#62` merged | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check`、`git push -u origin codex/aods-implementation-evidence`、`gh pr create --draft ...`、`gh pr ready 62`、`gh pr merge 62 --squash --delete-branch` | module meta 已可声明 evidence；manifest 只镜像 `evidence_summary`；reality 检查可解析 repo 的 path-like evidence locator；不执行 evidence command |
| 33 | U-028 | S6 | 完成 v0.8 backlog triage 并选择下一段 contract drift 切片 | P0 | 2026-05-07 | `docs/operations/aods-v0.8-backlog.zh-CN.md`、operations README、task ledger、round log、handoff | `gh issue list --state open --limit 50 --json ...`、`gh issue view 60/41/43/49/35/38/48 --json ...`、`git diff --check`、`npm run validate:all` | 下一轮首选 U-029：implementation acceptance criteria；`MEMORY.md` 继续不进仓库 |
| 34 | U-029 | S6 | 落地 implementation acceptance criteria 最小模型 | P0 | 2026-05-07 | `schema/module.schema.json`、`schema/manifest.schema.json`、`lib/compile.mjs`、`lib/validate.mjs`、`spec/stable-surface-contracts.json`、`spec/validation-rules.json`、compiled-pilot source/output、benchmark generated corpus schema、focused regressions | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | module meta 已可声明 `acceptance_criteria[]`；manifest 只镜像 `acceptance_summary`；current implementation 必须有 criteria；不执行任意 evidence command |
| 35 | U-030 | S6 | 定义 drift remediation workflow 最小模型 | P1 | 2026-05-07 | `lib/validate.mjs`、`spec/validation-rules.json`、`spec/authority-governance.json`、focused remediation regression、operations docs | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | validator JSON / text output 现能为 implementation drift findings 给出 standardized remediation action/gate/guidance；不引入完整审批系统 |
| 36 | U-031 | S6 | 定义 decision provenance boundary 最小模型 | P1 | 2026-05-07 | `schema/module.schema.json`、`lib/validate.mjs`、`spec/stable-surface-contracts.json`、`spec/validation-rules.json`、benchmark generated corpus schema、focused decision provenance regression、operations docs | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | artifact 可声明 `decision_provenance`；validator 检查 source/evidence/summary refs，并阻止 stale/unresolved/withheld evidence 被标成 stable agent-consumable |
| 37 | U-032 | S6 | 定义 read-model freshness / watermark profile 最小切片 | P1 | 2026-05-07 | `schema/module.schema.json`、`lib/validate.mjs`、`spec/stable-surface-contracts.json`、`spec/validation-rules.json`、benchmark generated corpus schema、focused read-model freshness regression、operations docs | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | stable read-model contract 可声明 `read_model.freshness` 的 snapshot/export/watermark/staleness；validator 阻断缺 freshness 的 stable read-model profile |
| 38 | U-033 | S6 | 定义 fixture and golden export conventions | P2 | 2026-05-07 | `spec/validation-rules.json`、`manifest.json`、`examples/compiled-pilot-source/fixtures/fixture-manifest.json`、focused fixture convention regression、operations docs | `node --test ./benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | fixture manifest v1、positive/negative fixture 命名、golden export 更新流程已进入 spec；compiled-pilot source 提供一个 conventional positive fixture |
| 39 | U-034 | S7 | 重新裁剪 capability negotiation 最小模型 | P2 | 2026-05-07 | `spec/stable-surface-contracts.json`、`manifest.json`、focused stable contract regression、operations docs | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | capability negotiation 被裁剪为 provider capability、consumer requirement、compatibility matching、evidence link 的 metadata-only 边界；明确不做 handshake/discovery/auth/probing |
| 40 | U-035 | S8 | 定义 command / receipt / event triad 最小边界 | P1 | 2026-05-07 | `spec/stable-surface-contracts.json`、`manifest.json`、`benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`docs/operations/aods-v0.9-backlog.zh-CN.md`、operations docs | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | write-capable stable surfaces 现在有 command、receipt、event_or_projection、triad_linkage 的 spec-level audit boundary；不新增 executor/event runtime/correction semantics |
| 41 | U-036 | S8 | 定义 event correction / supersession 最小边界 | P1 | 2026-05-07 | `spec/stable-surface-contracts.json`、`manifest.json`、`benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`docs/operations/aods-v0.9-backlog.zh-CN.md`、operations docs | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | append-only event surfaces 现在有 correction_event、supersession_link、retraction、projection_guidance 的 spec-level boundary；不实现 event store/replay/migration |
| 42 | U-037 | S8 | 定义 partial implementation / known-gap metadata 最小边界 | P2 | 2026-05-07 | `spec/stable-surface-contracts.json`、`manifest.json`、`benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`docs/operations/aods-v0.9-backlog.zh-CN.md`、operations docs | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | stable surfaces 现在有 partial implementation / known gap 的 missing_capabilities、blocking_status、owner、expected_remediation、consumer guidance 最小边界；不实现 roadmap system、automatic waiver 或 release override |
| 43 | U-038 | S8 | 定义 ownership and authority hierarchy 最小边界 | P2 | 2026-05-07 | `spec/stable-surface-contracts.json`、`manifest.json`、`benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`docs/operations/aods-v0.9-backlog.zh-CN.md`、operations docs | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | overlapping stable surfaces 现在有 canonical_authority、derived_surface、alias_surface、conflict_policy、migration_guidance 最小边界；不实现 automatic conflict resolver 或 cross-corpus authority runtime |
| 44 | U-039 | S8 | 定义 dependency ordering between surfaces 最小边界 | P2 | 2026-05-07 | `spec/stable-surface-contracts.json`、`manifest.json`、`benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`docs/operations/aods-v0.9-backlog.zh-CN.md`、operations docs | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs`、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` | stable surfaces 现在有 requires、blocks、derives_from、emits、consumes、optional_dependency 的最小 ordering vocabulary；不实现 package manager、runtime scheduler 或 cross-repo dependency executor |

## 失败或阻塞任务

当前无失败或阻塞任务。

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 原因 |
|---|---|---|---|
| v0.7 must-build foundation | `#29`、`#32`、`#31`、`#30`、`#42` | 高价值，但必须裁剪 | 它们定义 AODS 作为规范治理系统的地基；`#42` 需要最小版，否则 foundation 只是文档。 |
| v0.7 concrete pilot | `#28` | 高价值，必做 pilot | 它来自真实事故，是 external reality gap 的最强证据；保留为验收场景，不关闭为 duplicate。 |
| v0.7 should-build mechanics | `#40`、`#34` | 有价值但可裁剪 | 只做最小 guidance / design boundary，避免抢 foundation 实现资源。 |
| deferred mechanics | `#33`、`#35`、`#36/#41`、`#37`、`#38`、`#39` | 延后 | 都合理，但 v0.7 不应扩成 write/event/adapter 大而全规范。 |
| later research / profiles | `#33`、`#35`、`#37`、`#38`、`#39`、`#43-#52`、`#54-#59` | 暂不入主线实现 | 多数是合理方向，但当前应先证明 foundation 和 concrete pilot；否则会扩散成“大而全规范”。 |
| local ergonomics | `#17`、`#10`、`#9` | `#17/#10` 已做最小 DX，`#9` 保留 P2 | `#17/#10` 可低风险完成；`#9` 需受新 gating/severity 约束，不能削弱高风险语义约束。 |
| stale / low-value hygiene | `#16`、`#13` | `#16` 已关闭；`#13` 保留但延后 | `#16` 已被 README 修复；`#13` 是局部 authoring ergonomics，不应抢主线资源。 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 无 | 无 | 无 | 无 |

## 进度记录

| 日期 | 最近阶段目标 | v1.0 | 最终系统 | 证据 | 说明 |
|---|---:|---:|---:|---|---|
| 2026-04-23 | 100% | 60% | 35% | `U-000`、`U-000A`、`U-000B`、`U-000C` | 公开文档、GitHub surface 和 issue 主线排序已收束。 |
| 2026-05-02 | 100% | 70% | 46% | `U-003`、`U-004`、`U-016`、`U-017`、`U-019` 完成 | stable-surface authority、lifecycle/exposure、两个低风险 validator DX 项和 stale issue hygiene 已完成；下一步进入 redaction / completeness / topology pilot。 |
| 2026-05-02 | 100% | 75% | 52% | `U-005`、`U-006`、`U-007`、`U-012` 完成 | stable-surface contract layer 已落盘：redaction、contract completeness、topology design-only pilot、schema versioning guidance 进入 spec/schema/validator，并通过 focused + repo-level validation。 |
| 2026-05-02 | 100% | 80% | 58% | `U-008`、`U-011`、`U-014` 完成 | root topology 已从 design-only 进入 schema + compiled-authoring + example 链路；severity/gating 与 adapter minimum contract 也已形成统一 spec vocabulary，后续主线收敛到 module linkage / reality summary / ref semantics。 |
| 2026-05-02 | 100% | 85% | 63% | `U-009`、`U-010`、`U-013`、`U-018` 完成 | module implementation topology、`validate --reality` topology summary、cross-surface ref boundary、以及 shared-invariant normalization 已落盘；当前主线只剩 release alignment blocked work。 |
| 2026-05-02 | 100% | 88% | 66% | `U-015` 完成 | release alignment checklist 已收敛；正式版本发布统一走 GitHub Releases，repo 当前台账已无未完成任务。 |
| 2026-05-07 | 100% | 93% | 74% | `U-020`、`U-021`、`U-022`、`U-023`、`U-024`、`U-025`、`U-026` 完成 | v0.7 已发布为 GitHub Release `v0.7.0`；PR `#61` 已 merge；13 个 v0.7 覆盖 issues 已关闭，`#60/#41` 已评论保留；`MEMORY.md` 未进仓库。 |
| 2026-05-07 | 100% | 94% | 76% | `U-027` 完成 | implementation evidence 最小切片已落地并通过 focused、repo-level、benchmark test 验证；AODS 现在能让 current implementation linkage 携带可审查证据摘要和 reality locator 检查。 |
| 2026-05-07 | 100% | 95% | 78% | `U-028` 完成 | v0.8 backlog 已重新排队；下一主线确定为 implementation acceptance criteria，把 contract requirement 映射到 evidence / validator / fixture / manual review。 |
| 2026-05-07 | 100% | 96% | 80% | `U-029` 完成 | implementation acceptance criteria 已落地；AODS 现在能把 current implementation linkage 绑定到 contract requirement、evidence refs、validator/fixture/manual review posture 和 manifest summary。 |
| 2026-05-07 | 100% | 97% | 82% | `U-030` 完成 | drift remediation workflow 最小模型已落地；AODS 现在能把 implementation evidence / acceptance criteria drift findings 指向标准 remediation action 与 gate posture。 |
| 2026-05-07 | 100% | 98% | 84% | `U-031` 完成 | decision provenance boundary 已落地；AODS 现在能让 agent-consumable decisions 声明 source/evidence/summary 边界，并阻断 stale/unresolved evidence 的 stable consumption。 |
| 2026-05-07 | 100% | 99% | 86% | `U-032` 完成 | read-model freshness / watermark profile 已落地；AODS 现在能要求 stable read-model contract 声明 snapshot、exported_at、source_watermark 与 staleness，降低快照代码漂移和陈旧读模型风险。 |
| 2026-05-07 | 100% | 99% | 88% | `U-033` 完成 | fixture and golden export conventions 已落地；AODS 现在有 positive/negative fixture、fixture manifest 与 golden export 更新审查的稳定最小约定。 |
| 2026-05-07 | 100% | 100% | 90% | `U-034` 完成 | capability negotiation re-triage 已落地；AODS 现在明确 provider/consumer/matching/evidence-link 的 metadata-only 最小边界，完整 handshake 继续 deferred。 |
| 2026-05-07 | 100% | 100% | 91% | `U-035` 完成 | command / receipt / event triad boundary 已落地；AODS 现在能为 write-capable stable surfaces 表达最小 audit linkage，完整 event runtime 和 correction semantics 继续 deferred。 |
| 2026-05-07 | 100% | 100% | 92% | `U-036` 完成 | event correction / supersession boundary 已落地；AODS 现在能为 append-only event surfaces 表达 correction、supersession、retraction 和 projection guidance 的最小语义。 |
| 2026-05-07 | 100% | 100% | 93% | `U-037` 完成 | partial implementation / known-gap metadata boundary 已落地；AODS 现在能为稳定消费表达缺失能力、阻塞姿态、owner、补救动作和消费者指引，自动豁免与 roadmap runtime 继续 deferred。 |
| 2026-05-07 | 100% | 100% | 94% | `U-038` 完成 | ownership and authority hierarchy boundary 已落地；AODS 现在能为 overlapping stable surfaces 表达 canonical、derived、alias、conflict 和 migration posture，自动冲突解析继续 deferred。 |
| 2026-05-07 | 100% | 100% | 95% | `U-039` 完成 | dependency ordering boundary 已落地；AODS 现在能为 stable surfaces 表达 requires、blocks、derives_from、emits、consumes 和 optional dependency ordering，runtime scheduler 继续 deferred。 |
