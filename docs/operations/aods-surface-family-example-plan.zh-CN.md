# AODS Surface-family Example Pack Plan

状态：U-051 首包已落地
日期：2026-05-07
适用范围：GitHub `#56` common AODS surface family examples

## 结论

`#56` 不应一次性变成全量示例库。当前最高价值、最低风险路线是先做 example pack triage，再选择一个 schema/runtime 已稳定的最小示例包。

已落地首包为 **U-051 read-model + implementation-linkage canonical example pack**。原因：read-model freshness、implementation evidence、acceptance criteria、fixture/golden convention 已经落地，能够用现有 validator 和 compiled-pilot source-first 结构验证；command/event/adapter/policy-gate 仍更容易扩散到 runtime 或协议栈。

下一轮首选 **U-052 command + receipt canonical example pack**。它展示 write-capable stable surface 的 command、receipt、audit metadata、risk taxonomy 和 implementation acceptance linkage；仍不实现 command executor 或 event bus。

## 输入信号

| 来源 | 信号 | 判断 |
|---|---|---|
| GitHub `#56` | 需要 read model、command、event、resource、adapter、artifact、export、policy-gate canonical examples | 范围完整但过宽，必须分批 |
| U-032 | read-model freshness / watermark profile 已落地 | 适合作为首个 example pack |
| U-027/U-029 | implementation evidence 和 acceptance criteria 已落地 | 能与 read-model example 串成 contract-to-evidence 闭环 |
| U-033 | fixture/golden export convention 已落地 | example pack 可放入 source-first example + fixture manifest |
| U-034/U-035/U-036 | capability、command、event 边界已定义但 runtime 非目标多 | 后续分批，不抢首包 |

## 分批路线

| 批次 | Surface family | 目标 | 验收边界 | 非目标 |
|---:|---|---|---|---|
| 1 | read-model + implementation-linkage | 展示 stable read model 如何声明 freshness、watermark、implementation evidence、acceptance criteria | 已完成 U-051：source-first example、compiled output、fixture manifest、focused regression、`validate:all` | 不新增 runtime fetcher、不执行 evidence command、不做全量 domain model |
| 2 | command + receipt | 展示 write-capable surface 的 command、receipt、audit metadata 和 risk taxonomy | 下一轮首选：minimal authoring example + compile/validate regression | 不实现 command executor、不建 event bus |
| 3 | event + correction/supersession | 展示 append-only event、correction_of、supersedes、projection guidance | example module + validation notes | 不实现 event store、不做 replay/migration |
| 4 | adapter + capability/exposure | 展示 provider capability、consumer requirement、local/remote exposure、audit notes | adapter-facing example + docs link | 不做 negotiation handshake、不做 auth runtime |
| 5 | artifact/export/policy-gate | 展示 artifact type、golden export、policy gate 与 validation notes | fixture/golden example expansion | 不做 conformance runner、不迁移全部 examples |

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

## U-052 候选包

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

## Deferred

| Deferred item | 原因 |
|---|---|
| 全量 example library | 会扩大维护面，并且会把 `#56` 与后续 schema/runtime 工作耦合 |
| command/event runtime examples | 需要先确认 write/event semantics 是否还要继续扩展 |
| adapter negotiation examples | 需要等待 capability/exposure/audit metadata 更稳定 |
| docs portal linking | 公开文档导航需另立任务，不能混入 example pack 首包 |
