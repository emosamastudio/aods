# AODS Surface-family Example Pack Plan

状态：U-057 resource 边界已裁剪，resource example pack 待落地
日期：2026-05-07
适用范围：GitHub `#56` common AODS surface family examples

## 结论

`#56` 不应一次性变成全量示例库。当前最高价值、最低风险路线是先做 example pack triage，再选择 schema/runtime 已稳定的最小示例包。

已落地五包为 **U-051 read-model + implementation-linkage canonical example pack**、**U-052 command + receipt canonical example pack**、**U-053 event + correction/supersession canonical example pack**、**U-054 adapter + capability/exposure canonical example pack** 和 **U-055 artifact/export/policy-gate canonical example pack**。原因：read-model freshness、implementation evidence、acceptance criteria、fixture/golden convention、command/receipt/audit/risk 边界、event correction/supersession guidance、adapter capability/exposure guidance、artifact export policy gate 都已经能用现有 validator 和 compiled-pilot source-first 结构验证。

U-056 收束复盘结论：`#56` 原验收仍包含 `resource` family，当前五包没有独立 resource surface example。`#56` 不应关闭。

U-057 边界裁剪结论：resource 暂不作为新的 schema profile 或 runtime object。当前最小可执行路线是把 resource surface 表达为 declared resource scope：包含 resource identity、scope、owner、read/write risk、exposure class、lifecycle cleanup posture、implementation evidence 和 acceptance criteria。下一轮首选 **U-058 resource surface canonical example pack**；仍不实现 schema、validator、resource runtime、scheduler、cleanup executor 或 permission broker。

## 输入信号

| 来源 | 信号 | 判断 |
|---|---|---|
| GitHub `#56` | 需要 read model、command、event、resource、adapter、artifact、export、policy-gate canonical examples | 范围完整但过宽，必须分批 |
| GitHub `#57` | 需要 glossary / canonical-term registry 支持 aliases、deprecated terms、scope、owner、linked surfaces | 有价值但需要 schema/design，排在 resource residual gap 之后 |
| GitHub `#58` | 需要 external-source citation / provenance metadata | 有价值但需要 provenance/schema 独立裁剪，排在 resource residual gap 之后 |
| U-032 | read-model freshness / watermark profile 已落地 | 适合作为首个 example pack |
| U-027/U-029 | implementation evidence 和 acceptance criteria 已落地 | 能与 read-model example 串成 contract-to-evidence 闭环 |
| U-033 | fixture/golden export convention 已落地 | example pack 可放入 source-first example + fixture manifest |
| U-034/U-035/U-036 | capability、command、event 边界已定义但 runtime 非目标多 | 后续分批，不抢首包 |

## 分批路线

| 批次 | Surface family | 目标 | 验收边界 | 非目标 |
|---:|---|---|---|---|
| 1 | read-model + implementation-linkage | 展示 stable read model 如何声明 freshness、watermark、implementation evidence、acceptance criteria | 已完成 U-051：source-first example、compiled output、fixture manifest、focused regression、`validate:all` | 不新增 runtime fetcher、不执行 evidence command、不做全量 domain model |
| 2 | command + receipt | 展示 write-capable surface 的 command、receipt、audit metadata 和 risk taxonomy | 已完成 U-052：source-first example、compiled output、fixture manifest、focused regression、`validate:all` | 不实现 command executor、不建 event bus |
| 3 | event + correction/supersession | 展示 append-only event、correction_of、supersedes、projection guidance | 已完成 U-053：source-first example、compiled output、fixture manifest、focused regression、`validate:all` | 不实现 event store、不做 replay/migration |
| 4 | adapter + capability/exposure | 展示 provider capability、consumer requirement、local/remote exposure、audit notes | 已完成 U-054：source-first example、compiled output、fixture manifest、focused regression、`validate:all` | 不做 negotiation handshake、不做 auth runtime |
| 5 | artifact/export/policy-gate | 展示 artifact type、golden export、policy gate 与 validation notes | 已完成 U-055：source-first example、compiled output、fixture manifest、focused regression、`validate:all` | 不做 conformance runner、不迁移全部 examples |
| 6 | resource | 展示 resource surface 的 identity、scope、ownership、read/write risk、exposure、lifecycle cleanup 和 validation notes | U-057 已裁剪边界；下一轮 U-058 落地 source-first example pack | 不做 resource runtime、不做 scheduler/cleanup executor、不新增 schema |

## U-056 收束复盘

### 审查输入

| 来源 | 结论 |
|---|---|
| GitHub `#56` | 原验收明确要求 read model、command、event、resource、adapter、artifact、export、policy-gate examples。 |
| U-051 到 U-055 | 已覆盖 read-model、command、event、adapter、artifact/export/policy-gate。 |
| 当前 spec/schema | `runtime_contract.resources`、risk taxonomy、local/remote exposure、lifecycle cleanup 都提到 resource，但尚无独立 resource surface example 或 resource profile。 |
| GitHub `#57/#58` | 都有价值，但会触及 schema/provenance，不应抢在 residual resource gap 之前执行。 |

### 复盘结论

1. 已裁剪五包质量合格，均有 source-first example、compiled output、fixture manifest、focused regression 和 repo-level validation。
2. `#56` 仍 open 是合理状态，因为 resource family 尚未独立覆盖。
3. 直接补 resource example 存在范围风险：resource 在当前 AODS 中横跨 runtime resources、local/remote exposure、risk taxonomy、lifecycle cleanup 和 surface inventory，不应在未裁剪边界前写 example。
4. 下一步应先做 U-057 resource surface boundary triage；若边界稳定，再新增 resource canonical example pack。
5. `#57` glossary registry 和 `#58` external citation metadata 继续保留为后续 schema/provenance 设计任务。

## 已执行：U-051 最小包

### 目标

在 `examples/compiled-pilot-source/` 中加入一个 read-model + implementation-linkage canonical example pack，并让 compiled output 和 fixture manifest 可验证。

### 建议范围

| 文件 | 变更 |
|---|---|
| `examples/compiled-pilot-source/authoring.json` | 新增或扩展一个 read-model module，声明 stable contract、read_model freshness/watermark、implementation evidence、acceptance criteria |
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 增加对应 positive fixture / golden export 记录 |
| `examples/compiled-pilot/` | 由 `npm run compile:pilot` 生成，不手写 |
| `benchmarks/aods-eval-lab/test/` | 新增 focused regression，检查 source-first example、compiled output、fixture metadata |
| `docs/operations/` | 更新 ledger、handoff、round log 和本计划 |

### 验收标准

1. 首包只覆盖 read-model + implementation-linkage，不覆盖 command/event/adapter。
2. Source-first example 能通过 `npm run compile:pilot` 生成 compiled corpus。
3. Compiled output 保留 stable read-model contract、freshness/watermark、implementation evidence summary、acceptance criteria summary。
4. Fixture manifest 明确该 example pack 的 positive status 和 golden export。
5. `node --test` focused regression、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` 通过。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-readiness-read-model`。
2. `examples/compiled-pilot/modules/shift-ops-readiness-read-model.json` 已由 `npm run compile:pilot` 生成。
3. 模块包含 read-model contract、freshness/watermark、implementation evidence、acceptance criteria。
4. `examples/compiled-pilot-source/fixtures/fixture-manifest.json` 已新增 positive read-model implementation-linkage fixture。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 覆盖 source-first、compiled module、compiled manifest summary 和 fixture metadata。

## 已执行：U-052 最小包

### 目标

在 compiled-pilot source-first example 中加入 command + receipt canonical example pack，展示 write-capable stable surface 如何声明 command shape、receipt output、audit metadata、risk taxonomy 和 implementation acceptance linkage。

### 验收边界

| 文件 | 变更 |
|---|---|
| `examples/compiled-pilot-source/authoring.json` | 新增或扩展一个 command module，声明 stable command contract、receipt output、audit metadata、risk posture、implementation evidence、acceptance criteria |
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 增加对应 positive fixture / golden export 记录 |
| `examples/compiled-pilot/` | 由 `npm run compile:pilot` 生成 |
| `benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 扩展 focused regression |

### 非目标

不实现 command executor，不建 event bus，不加入 correction/supersession semantics，不接入 approval workflow runtime。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-change-command`。
2. `examples/compiled-pilot/modules/shift-ops-change-command.json` 已由 `npm run compile:pilot` 生成。
3. 模块包含 command contract、receipt output、audit/risk posture、implementation evidence、acceptance criteria。
4. `examples/compiled-pilot-source/fixtures/fixture-manifest.json` 已新增 positive command receipt fixture。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已扩展覆盖 command source、compiled module、manifest summary 和 fixture metadata。

## 已执行：U-053 最小包

### 目标

在 compiled-pilot source-first example 中加入 event + correction/supersession canonical example pack，展示 append-only event surface 如何声明 event shape、correction_of、supersedes、retraction/projection guidance 和 implementation acceptance linkage。

### 验收边界

| 文件 | 变更 |
|---|---|
| `examples/compiled-pilot-source/authoring.json` | 新增或扩展一个 event module，声明 append-only event shape、correction/supersession guidance、implementation evidence、acceptance criteria |
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 增加对应 positive fixture / golden export 记录 |
| `examples/compiled-pilot/` | 由 `npm run compile:pilot` 生成 |
| `benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 扩展 focused regression |

### 非目标

不实现 event store，不做 replay/migration，不建 event bus runtime，不加入 exactly-once delivery guarantee。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-change-event-log`。
2. `examples/compiled-pilot/modules/shift-ops-change-event-log.json` 已由 `npm run compile:pilot` 生成。
3. 模块包含 append-only event shape、correction/supersession/retraction/projection guidance、implementation evidence、acceptance criteria。
4. `examples/compiled-pilot-source/fixtures/fixture-manifest.json` 已新增 positive event correction/supersession fixture。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已扩展覆盖 event source、compiled module、manifest summary 和 fixture metadata。

## 已执行：U-054 最小包

### 目标

在 compiled-pilot source-first example 中加入 adapter + capability/exposure canonical example pack，展示 adapter-facing surface 如何声明 provider capability、consumer requirement、local/remote exposure、audit notes 和 implementation acceptance linkage。

### 验收边界

| 文件 | 变更 |
|---|---|
| `examples/compiled-pilot-source/authoring.json` | 新增或扩展一个 adapter module，声明 provider capability、consumer requirement、exposure posture、audit notes、implementation evidence、acceptance criteria |
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 增加对应 positive fixture / golden export 记录 |
| `examples/compiled-pilot/` | 由 `npm run compile:pilot` 生成 |
| `benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 扩展 focused regression |

### 非目标

不实现 negotiation handshake，不做 auth runtime，不做 dynamic probing，不建 remote API gateway。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-adapter-capability`。
2. `examples/compiled-pilot/modules/shift-ops-adapter-capability.json` 已由 `npm run compile:pilot` 生成。
3. 模块包含 provider capability、consumer requirement、exposure/audit posture、implementation evidence、acceptance criteria。
4. `examples/compiled-pilot-source/fixtures/fixture-manifest.json` 已新增 positive adapter capability/exposure fixture。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已扩展覆盖 adapter source、compiled module、manifest summary 和 fixture metadata。

## U-055 候选包

### 目标

在 compiled-pilot source-first example 中加入 artifact/export/policy-gate canonical example pack，展示 artifact type、golden export、policy gate、validation notes 和 implementation acceptance linkage。

### 验收边界

| 文件 | 变更 |
|---|---|
| `examples/compiled-pilot-source/authoring.json` | 新增或扩展一个 artifact/export/policy-gate module，声明 artifact type、golden export、policy gate、validation notes、implementation evidence、acceptance criteria |
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 增加对应 positive fixture / golden export 记录 |
| `examples/compiled-pilot/` | 由 `npm run compile:pilot` 生成 |
| `benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 扩展 focused regression |

### 非目标

不实现 conformance runner，不做自动 golden update，不迁移全部 examples，不重写 fixture convention。

### 验收结果

1. `examples/compiled-pilot-source/authoring.json` 已新增 `shift-ops-artifact-export-policy`。
2. `examples/compiled-pilot/modules/shift-ops-artifact-export-policy.json` 已由 `npm run compile:pilot` 生成。
3. 模块包含 artifact export surface、golden export review、policy gate / validation notes、implementation evidence、acceptance criteria。
4. `examples/compiled-pilot-source/fixtures/fixture-manifest.json` 已新增 `positive-artifact-export-policy-gate-pack`。
5. `benchmarks/aods-eval-lab/test/example-packs.test.mjs` 已扩展覆盖 artifact/export source、compiled module、manifest summary 和 fixture metadata。
6. 本轮未新增 schema，未改 validator/runtime，未实现 conformance runner、自动 golden update 或全量 fixture 迁移。

## U-056 已执行

### 目标

复盘 U-051 到 U-055 五个 example pack 的收束质量，确认 `#56` 是否仍有 resource example 残留，并制定下一阶段 backlog triage。

### 验收边界

| 文件 | 变更 |
|---|---|
| `docs/operations/aods-surface-family-example-plan.zh-CN.md` | 标记五包收束结果、残留问题和下一阶段建议 |
| `docs/operations/aods-v0.11-backlog.zh-CN.md` | 标记 `#56` example pack 队列状态，并选择 `#57/#58` 或残留 resource 作为下一阶段候选 |
| `docs/operations/aods-task-ledger.zh-CN.md` | 写入下一阶段任务，不直接执行 schema/provenance 变更 |
| `docs/operations/aods-round-log.zh-CN.md` | 记录复核和 triage 证据 |

### 非目标

不关闭或评论 GitHub issue，不实现 schema/provenance 变更，不新增 example pack，不重写文档门户。

### 验收结果

1. 已只读审查 GitHub `#56/#57/#58`。
2. 已确认 `#56` 已完成五个已裁剪 example pack，但仍有 `resource` residual gap。
3. 已确认当前不关闭或评论 `#56`，因为原验收未完全覆盖。
4. 已确认 `#57/#58` 不进入下一轮首选，避免在 resource residual gap 之前扩成 schema/provenance 工作。
5. 已新增 U-057 resource surface boundary triage 作为下一轮首选。

## 已执行切片：U-057

### 目标

裁剪 resource surface canonical example boundary 与最小示例路线，明确 resource 在 AODS 中与 `runtime_contract.resources`、local/remote exposure、risk taxonomy、lifecycle cleanup、surface inventory 的关系。

### 验收边界

| 文件 | 变更 |
|---|---|
| `docs/operations/aods-surface-family-example-plan.zh-CN.md` | 增加 resource family 边界、非目标和是否进入 example pack 的建议 |
| `docs/operations/aods-v0.11-backlog.zh-CN.md` | 更新 `#56/#57/#58` 后续排序 |
| `docs/operations/aods-task-ledger.zh-CN.md` | 写入 resource example pack 或 schema/provenance 后续任务 |
| `docs/operations/aods-round-log.zh-CN.md` | 记录复核和 triage 证据 |

### 非目标

不实现 schema、validator、resource runtime、scheduler、cleanup executor、permission broker 或 source-first resource example pack。

### 验收结果

1. 已审查当前 resource 语义：`runtime_contract.resources` 描述模块预期读取或触碰的环境资源；risk taxonomy、local/remote exposure、audit target、lifecycle cleanup 都已有 resource vocabulary。
2. 已确认 resource 不应在本阶段新增 schema profile；它应先作为 declared resource surface 示例表达。
3. 已裁剪 resource example 最小字段：`resource_id`、`resource_kind`、`resource_scope`、`owner`、`authority_surface`、`read_risk`、`write_risk`、`exposure_class`、`cleanup_posture`、`evidence_anchor`、`consumer_guidance`。
4. 已决定进入 U-058 source-first resource example pack，补齐 `#56` residual gap。
5. `#57/#58` 继续排在 resource example pack 之后，避免过早进入 glossary schema 或 external citation provenance。

## 下一轮任务：U-058

### 目标

在 compiled-pilot source-first example 中加入 resource surface canonical example pack，展示 resource identity、scope、owner、read/write risk、exposure class、lifecycle cleanup posture、implementation evidence 和 acceptance criteria。

### 验收边界

| 文件 | 变更 |
|---|---|
| `examples/compiled-pilot-source/authoring.json` | 新增或扩展一个 resource surface module，声明 resource identity、scope、risk、exposure、cleanup、implementation evidence、acceptance criteria |
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 增加对应 positive fixture / golden export 记录 |
| `examples/compiled-pilot/` | 由 `npm run compile:pilot` 生成 |
| `benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 扩展 focused regression |
| `docs/operations/` | 更新 ledger、handoff、round log 和本计划 |

### 非目标

不新增 schema，不改 validator/runtime，不实现 resource runtime、scheduler、cleanup executor、permission broker、remote gateway 或 policy engine。

## Deferred

| Deferred item | 原因 |
|---|---|
| 全量 example library | 会扩大维护面，并且会把 `#56` 与后续 schema/runtime 工作耦合 |
| command/event runtime examples | 需要先确认 write/event runtime semantics 是否还要继续扩展 |
| adapter negotiation examples | 需要等待 capability/exposure/audit metadata 更稳定 |
| glossary registry schema | 需要先关闭 `#56` resource residual gap，再进入 `#57` schema/design |
| external citation metadata | 需要先关闭 `#56` resource residual gap，再进入 `#58` provenance/schema |
| docs portal linking | 公开文档导航需另立任务，不能混入 example pack 首包 |
