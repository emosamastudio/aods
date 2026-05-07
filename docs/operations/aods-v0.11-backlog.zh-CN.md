# AODS v0.11 Backlog Triage

状态：当前 v0.11 候选路线
日期：2026-05-07
适用范围：v0.10 risk/exposure/audit hardening 队列收束后的 documentation / authoring quality backlog

## 北极星

AODS 继续作为独立的 agent-first 权威规范系统推进。作者体验和文档质量不是单纯润色问题，而是影响 agent 路由、抽取、验证、paired surface 同步和长期可维护性的信任边界。

## 结论

v0.11 不应从全量示例库、glossary schema v2、外部 citation registry 或文档门户重写开始。当前最高价值、最低风险路线是先定义 paired human/agent surface 的同步质量维度，把 exact invariant、semantic coverage、omitted constraints、stale examples、authority mismatch 和 reporting format 裁剪成 spec-level 最小边界。

已执行的最小切片包括 **U-047 documentation / authoring quality backlog triage**、**U-048 human-surface synchronization quality metrics boundary**、**U-049 agent-primary density examples and authoring guidance** 和 **U-050 canonical surface-family example pack triage**。U-050 已把 `#56` 裁剪成分批 example pack 路线。下一轮首选 **U-051 read-model + implementation-linkage canonical example pack**，先落一个能被现有 compile / validate / fixture convention 验证的首包，不一次性新增全量示例库。

## 输入信号

| 来源 | 信号 | 判断 |
|---|---|---|
| GitHub `#54` | agent-primary surface 需要 density rules、canonical terms、explicit constraints、uncertainty markers、good/bad examples | 大部分已由 `spec-aop` 覆盖；剩余主要是 examples / public authoring guidance |
| GitHub `#55` | paired human/agent surfaces 需要 semantic sync quality metrics | 高价值、低风险；已有 shared_invariants 和 claim-diff 基础，但缺 quality dimensions 和 reporting vocabulary |
| GitHub `#56` | common surface families 需要 canonical examples | 有价值但范围大；应在 profile / sync quality vocabulary 之后分批做 examples |
| GitHub `#57` | glossary / canonical-term registry 需要 aliases、deprecated terms、scope、owner、linked surfaces | 有价值但会触及 manifest/schema/compile/validate；先不混入 docs-only triage |
| GitHub `#58` | external-source citation / provenance metadata | 有价值但会触及 schema/provenance/validation；应独立裁剪，避免与 decision provenance 混淆 |

## 排序

| 顺序 | 任务 | Issue | 价值 | 非目标 |
|---:|---|---|---|---|
| 1 | Human-surface synchronization quality metrics boundary | `#55` | 把 paired surface drift 从 exact string / conservative claim-diff 扩展到可报告的 quality dimensions | 已完成 U-048；不做新 diff engine、LLM judge、dashboard、auto-fix |
| 2 | Agent-primary density examples and authoring guidance | `#54` | 把已存在 AOP 规则补成可教学的 good/bad examples | 已完成 U-049；不改 AOP 核心语义，不做 style linter |
| 3 | Canonical surface-family example pack triage | `#56` | 把 read model、command、event、adapter 等示例拆成可维护批次 | 已完成 U-050；首包选择 read-model + implementation-linkage |
| 4 | Glossary / canonical-term registry v2 design | `#57` | 为 aliases、deprecated terms、scope、owner、linked surfaces 建立 schema 候选 | 不直接实现 deprecated-term validator |
| 5 | External citation and provenance metadata design | `#58` | 区分 internal authority、external source、inferred guidance、unresolved assumption | 不实现 citation crawler 或 unsupported factual claim detector |

## 已执行切片：U-048

### 目标

定义 human-surface synchronization quality metrics 最小边界，让 paired human/agent surfaces 能表达 exact invariant duplication、semantic coverage、omitted constraints、stale examples、authority mismatch、sync freshness 和 reporting format。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| exact_invariant_coverage | shared_invariants 是否仍出现在两侧 | 不替代 semantic coverage |
| semantic_coverage | human surface 是否覆盖 agent-primary 的 must/should constraints、preconditions、state changes、risk labels | 不做 LLM semantic judge |
| omitted_constraint | human surface 漏掉 agent-primary 的关键约束、非目标、gate 或 failure semantics | 不做自动修复 |
| stale_example | human example 与 agent-primary schema、version、command、state 或 output 过期 | 不做 example generator |
| authority_mismatch | human surface 暗示不同 owner、lifecycle、canonical authority 或 sync_source | 不做 authority resolver |
| sync_quality_report | pair_id、quality_dimension、status、evidence_ref、suggested_next_action | 不做 dashboard |

### 验收标准

1. `spec/surface-governance.json` 定义 paired-surface sync quality section、field table 和 non-goals。
2. `manifest.json` surface governance scope / runtime summary 同步 sync quality posture。
3. focused surface governance regression 覆盖 section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator claim-diff runtime，不实现 LLM semantic judge、dashboard 或自动修复器。

### 验收结果

1. `spec/surface-governance.json` 已新增 `paired-surface-sync-quality-metrics` section、`paired-surface-sync-quality-field-table` 和 `paired-surface-sync-quality-non-goals`。
2. `manifest.json` 已同步 surface-governance scope 与 `sync-quality-posture` runtime output。
3. 已新增 `benchmarks/aods-eval-lab/test/surface-governance.test.mjs` focused regression，并先 RED 后 GREEN。
4. 未新增 schema，未改 validator/runtime diff engine，未实现 LLM semantic judge、dashboard 或自动修复器。

## 已执行切片：U-049

### 目标

补齐 agent-primary density examples and authoring guidance 最小切片，让 `spec-aop` 不只定义规则，也能用最小 good/bad examples 教会作者如何写 canonical terms、explicit constraints、uncertainty markers 和 labeled examples。

### 验收结果

1. `spec/aop-writing-spec.json` 已新增 `agent-primary-density-examples` section。
2. 已新增 `aop-authoring-guidance-table`，覆盖 `canonical_terms`、`explicit_constraints`、`uncertainty_markers`、`labeled_examples`。
3. 已新增 `aop-good-bad-example-table`，提供最小 good/bad examples 并链接到现有 AOP rule。
4. 未改变 AOP 核心语义，未新增 schema，未实现 validator/runtime style linter，未重写文档门户。

## 已执行切片：U-050

### 目标

对 GitHub `#56` 的 common surface family examples 做分批规划，选择一个最小 example pack，避免一次性新增 read model、command、event、resource、adapter、artifact、export、policy-gate 全量示例库。

### 验收结果

1. 已新增 `docs/operations/aods-surface-family-example-plan.zh-CN.md`。
2. 已将 example families 拆成 read-model + implementation-linkage、command + receipt、event + correction/supersession、adapter + capability/exposure、artifact/export/policy-gate 五批。
3. 已选择 U-051 read-model + implementation-linkage canonical example pack 作为下一轮首包。
4. 本轮未新增 schema，未改 validator/runtime，未新增示例 corpus，未重写公开文档门户。

## 已执行切片：U-047

### 目标

复盘 documentation / authoring quality backlog，重新审查 `#54-#58` 与当前 README、docs、authoring、retrieval quality 的真实缺口，选出下一段最小切片。

### 验收结果

1. 已读取 `#54-#58`，并按 docs-only、spec-boundary、schema/validator/runtime 候选分类。
2. 已确认 `#54` 大部分被 `spec-aop` 覆盖；后续只需补 examples / authoring guidance。
3. 已确认 `#55` 是下一轮首选：它强化 paired-surface anti-drift 核心能力，且可先做 spec-level 边界。
4. 已确认 `#57/#58` 需要 schema / provenance 独立裁剪，不在 U-047 或 U-048 中混入。

## 已覆盖但 GitHub 仍 open 的 issue

| Issue | 本地覆盖任务 | 后续处理 |
|---|---|---|
| `#54` | `spec-aop` 既有核心规则；U-047 triage；U-049 examples/guidance | 本地最小边界已覆盖；当前不关闭 |
| `#55` | U-047 triage；U-048 | 最小边界已入 `spec/surface-governance.json`；当前不关闭 |
| `#56` | U-047 triage；U-050 example pack plan | 已拆分 example pack；下一步 U-051 首包 |
| `#57` | root `manifest.glossary` 既有简版；U-047 triage | 另立 schema/design 任务 |
| `#58` | decision provenance / provenance summaries 已覆盖一部分内部来源；U-047 triage | 另立 external citation metadata 任务 |

## 下一轮建议

下一轮按任务台账首选 **U-051 read-model + implementation-linkage canonical example pack**。如果开始执行，必须先复审 U-050 质量；只有 example pack plan、operations docs 和验证都合格，才进入 source-first example pack 实作。
