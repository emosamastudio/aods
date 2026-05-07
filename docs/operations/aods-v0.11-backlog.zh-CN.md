# AODS v0.11 Backlog Triage

状态：当前 v0.11 候选路线
日期：2026-05-08
适用范围：v0.10 risk/exposure/audit hardening 队列收束后的 documentation / authoring quality backlog

## 北极星

AODS 继续作为独立的 agent-first 权威规范系统推进。作者体验和文档质量不是单纯润色问题，而是影响 agent 路由、抽取、验证、paired surface 同步和长期可维护性的信任边界。

## 结论

v0.11 不应从全量示例库、glossary schema v2、外部 citation registry 或文档门户重写开始。当前最高价值、最低风险路线是先定义 paired human/agent surface 的同步质量维度，把 exact invariant、semantic coverage、omitted constraints、stale examples、authority mismatch 和 reporting format 裁剪成 spec-level 最小边界。

已执行的最小切片包括 **U-047 documentation / authoring quality backlog triage**、**U-048 human-surface synchronization quality metrics boundary**、**U-049 agent-primary density examples and authoring guidance**、**U-050 canonical surface-family example pack triage**、**U-051 read-model + implementation-linkage canonical example pack**、**U-052 command + receipt canonical example pack**、**U-053 event + correction/supersession canonical example pack**、**U-054 adapter + capability/exposure canonical example pack**、**U-055 artifact/export/policy-gate canonical example pack**、**U-056 surface-family example pack 收束复盘**、**U-057 resource surface boundary triage**、**U-058 resource surface canonical example pack** 和 **U-059 expanded task pool / batch execution planning**。U-051 到 U-055 加 U-058 已落地六个能被现有 compile / validate / fixture convention 验证的示例包。`#56` residual resource gap 已由 U-058 本地补齐；U-059 已把后续任务池扩展到 U-060 到 U-075。下一轮首选 Batch A：**U-060 glossary / canonical-term registry v2 boundary triage** 与 **U-061 external citation / provenance metadata boundary triage**，先同时解除 `#57/#58` 的边界不确定性，再进入 schema / validator 实现。

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
| 3 | Canonical surface-family example pack triage | `#56` | 把 read model、command、event、resource、adapter、artifact/export/policy-gate 示例拆成可维护批次 | U-050 完成分批；U-051 到 U-055 完成五包；U-056 确认 resource residual gap；U-057 完成 resource boundary triage；U-058 完成 resource example pack |
| 4 | Glossary / canonical-term registry v2 design | `#57` | 为 aliases、deprecated terms、scope、owner、linked surfaces 建立 schema 候选 | 下一轮 Batch A 的 U-060；先裁剪边界，不直接实现 deprecated-term validator |
| 5 | External citation and provenance metadata design | `#58` | 区分 internal authority、external source、inferred guidance、unresolved assumption | 下一轮 Batch A 的 U-061；不实现 citation crawler 或 unsupported factual claim detector |

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

## 已执行切片：U-051

### 目标

在 compiled-pilot source-first example 中加入 read-model + implementation-linkage canonical example pack，并让 source、compiled output、fixture manifest 和 regression 都可验证。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-readiness-read-model`。
2. `examples/compiled-pilot/modules/shift-ops-readiness-read-model.json` 已由 `npm run compile:pilot` 生成。
3. compiled manifest 已包含 read-model contract summary、implementation evidence summary 和 acceptance criteria summary。
4. fixture manifest 已新增 `positive-read-model-implementation-linkage-pack`。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已覆盖 source-first、compiled output、manifest summary 和 fixture metadata。
6. 本轮未新增 schema，未改 validator/runtime，未覆盖 command/event/adapter，不执行 evidence command。

## 已执行切片：U-052

### 目标

在 compiled-pilot source-first example 中加入 command + receipt canonical example pack，并让 source、compiled output、fixture manifest 和 regression 都可验证。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-change-command`。
2. `examples/compiled-pilot/modules/shift-ops-change-command.json` 已由 `npm run compile:pilot` 生成。
3. compiled manifest 已包含 command contract summary、implementation evidence summary 和 acceptance criteria summary。
4. fixture manifest 已新增 `positive-command-receipt-pack`。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已覆盖 source-first、compiled output、manifest summary 和 fixture metadata。
6. 本轮未新增 schema，未改 validator/runtime，未覆盖 event/adapter，不实现 command executor，不建 event bus。

## 已执行切片：U-053

### 目标

在 compiled-pilot source-first example 中加入 event + correction/supersession canonical example pack，并让 source、compiled output、fixture manifest 和 regression 都可验证。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-change-event-log`。
2. `examples/compiled-pilot/modules/shift-ops-change-event-log.json` 已由 `npm run compile:pilot` 生成。
3. compiled manifest 已包含 implementation evidence summary 和 acceptance criteria summary；未伪造 unsupported event contract profile。
4. fixture manifest 已新增 `positive-event-correction-supersession-pack`。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已覆盖 source-first、compiled output、manifest summary 和 fixture metadata。
6. 本轮未新增 schema，未改 validator/runtime，未覆盖 adapter，不实现 event store、replay、migration 或 event bus runtime。

## 已执行切片：U-054

### 目标

在 compiled-pilot source-first example 中加入 adapter + capability/exposure canonical example pack，并让 source、compiled output、fixture manifest 和 regression 都可验证。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-adapter-capability`。
2. `examples/compiled-pilot/modules/shift-ops-adapter-capability.json` 已由 `npm run compile:pilot` 生成。
3. compiled manifest 已包含 implementation evidence summary 和 acceptance criteria summary；未新增 schema 或 unsupported capability profile。
4. fixture manifest 已新增 `positive-adapter-capability-exposure-pack`。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已覆盖 source-first、compiled output、manifest summary 和 fixture metadata。
6. 本轮未新增 schema，未改 validator/runtime，未覆盖 artifact/export/policy-gate，不实现 negotiation handshake、auth runtime、dynamic probing 或 remote gateway。

## 已执行切片：U-055

### 目标

在 compiled-pilot source-first example 中加入 artifact/export/policy-gate canonical example pack，并让 source、compiled output、fixture manifest 和 regression 都可验证。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-artifact-export-policy`。
2. `examples/compiled-pilot/modules/shift-ops-artifact-export-policy.json` 已由 `npm run compile:pilot` 生成。
3. compiled manifest 已包含 implementation evidence summary 和 acceptance criteria summary；未新增 schema 或 unsupported export contract profile。
4. fixture manifest 已新增 `positive-artifact-export-policy-gate-pack`。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已覆盖 source-first、compiled output、manifest summary 和 fixture metadata。
6. 本轮未新增 schema，未改 validator/runtime，不实现 conformance runner、自动 golden update 或全量 fixture 迁移。

## 已执行切片：U-056

### 目标

复盘 U-051 到 U-055 五个 example pack 的收束质量，确认 `#56` 是否仍有 resource example 残留，并制定下一阶段 backlog triage。

### 验收结果

1. 已只读审查 GitHub `#56/#57/#58`。
2. 已确认 `#56` 原验收要求 read model、command、event、resource、adapter、artifact、export、policy-gate examples。
3. 已确认 U-051 到 U-055 覆盖 read-model、command、event、adapter、artifact/export/policy-gate，但没有独立 resource surface example。
4. 已确认当前不关闭或评论 `#56`，因为 resource residual gap 仍存在。
5. 已确认 `#57/#58` 需要 schema/provenance 独立裁剪，但排在 U-057 resource boundary triage 之后。

## 已执行切片：U-057

### 目标

裁剪 resource surface canonical example boundary 与最小示例路线，明确 resource 在 AODS 中与 `runtime_contract.resources`、local/remote exposure、risk taxonomy、lifecycle cleanup、surface inventory 的关系。

### 验收结果

1. 已确认 `runtime_contract.resources` 是模块执行环境假设，不等同于 stable resource surface profile。
2. 已确认 risk taxonomy、local/remote exposure、audit target、lifecycle cleanup 已提供足够 vocabulary 支撑 resource example。
3. 已裁剪 resource 最小字段为 identity、kind、scope、owner、authority surface、read/write risk、exposure class、cleanup posture、evidence anchor、consumer guidance。
4. 已决定 U-058 可进入 source-first compiled-pilot resource example pack。
5. 未新增 schema、validator、runtime、scheduler、cleanup executor 或 permission broker。

## 已执行切片：U-058

### 目标

在 compiled-pilot source-first example 中加入 resource surface canonical example pack，展示 resource identity、scope、owner、read/write risk、exposure class、lifecycle cleanup posture、implementation evidence 和 acceptance criteria。

### 验收结果

1. 已新增 `shift-ops-resource-surface` source-first module，并由 `npm run compile:pilot` 生成 compiled module。
2. 已覆盖 resource identity、kind、scope、owner、authority surface、consumer guidance、read/write risk、exposure class、credential boundary、approval boundary、cleanup posture、lifecycle signal、evidence anchor 和 acceptance criterion。
3. 已同步 fixture manifest，新增 `positive-resource-surface-pack` 和 `resource-surface-module` golden export。
4. 已扩展 focused regression，先看到缺少 resource module 的 RED，再落地 source-first pack 并 GREEN。
5. 未新增 schema、validator、resource runtime、scheduler、cleanup executor、permission broker、remote gateway 或 policy engine。

## 已执行切片：U-059

### 目标

扩展 U-058 之后的任务池，并把 owner 最新要求的“先尽可能多规划任务、每轮多完成几个任务”转化为不破坏质量门禁的 batch execution 规则。

### 验收结果

1. 已新增 `docs/operations/aods-expanded-task-plan.zh-CN.md`，定义批量准入、默认批量规模、非目标保护和外部写操作边界。
2. 已将任务台账未完成队列扩展为 U-060 到 U-075，覆盖 glossary、external citation、代码漂移、route discoverability、public docs、v0.12 triage、release gate 和 GitHub public sync。
3. 已更新 work rules，允许在 owner 明确要求时，把已裁剪、依赖清晰、低冲突任务纳入同轮 batch。
4. 已选择下一轮 Batch A：U-060 glossary boundary 与 U-061 external citation boundary。
5. 本轮未新增 schema，未改 validator/runtime，未改 compile 输出，未执行公开 GitHub 写操作。

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
| `#56` | U-047 triage；U-050 example pack plan；U-051 read-model首包；U-052 command + receipt；U-053 event + correction/supersession；U-054 adapter + capability/exposure；U-055 artifact/export/policy-gate；U-056 收束复盘；U-057 resource boundary triage；U-058 resource example pack | 本地已补齐 read-model、command、event、adapter、artifact/export/policy-gate 和 resource 六包；公开 issue 状态仍需 owner 批准后再同步 |
| `#57` | root `manifest.glossary` 既有简版；U-047 triage；U-059 expanded task pool | U-060 先裁剪 boundary，再决定 schema / validator 最小实现 |
| `#58` | decision provenance / provenance summaries 已覆盖一部分内部来源；U-047 triage；U-059 expanded task pool | U-061 先裁剪 external citation boundary，再决定 schema / validator 最小实现 |

## 下一轮建议

下一轮按任务台账首选 **Batch A：U-060 glossary / canonical-term registry v2 boundary triage + U-061 external citation / provenance metadata boundary triage**。如果开始执行，必须先复审 U-059 质量；只有扩展任务池、批量执行规则、handoff、round log 和 docs navigation 都合格，才进入 `#57/#58` 的 boundary triage。
