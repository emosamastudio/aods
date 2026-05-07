# AODS v0.8 Backlog Triage

状态：v0.8 backlog 决策
日期：2026-05-07
适用范围：v0.7 release 后的 open issue 复盘、代码漂移主线排序、下一最小实现切片选择

执行状态：U-029 implementation acceptance criteria、U-030 drift remediation workflow、U-031 decision provenance boundary、U-032 read-model freshness / watermark profile、U-033 fixture and golden export conventions、U-034 capability negotiation re-triage 已完成；当前 v0.8 backlog 已清空，下一轮应先重新复盘 open issues / owner roadmap。

## 结论

v0.8 不应先做完整 capability negotiation，也不应直接进入行为级代码理解。当前最推荐路线是沿着 U-027 implementation evidence 继续推进，把“证据存在”升级为“规范 contract 与证据之间有机器可读的验收关系”。

最后一个最小切片为 **capability negotiation re-triage**：在 acceptance criteria、remediation、decision provenance、read-model freshness、fixture/golden conventions 都已落地后，重新裁剪 provider capability、consumer requirement、compatibility matching 的最低可验证边界。它只做 metadata / spec 级边界判断，不直接实现完整 negotiation handshake。

## 输入信号

| 来源 | 当前判断 |
|---|---|
| GitHub open issues | 当前 24 个 open issue；`#60` 仍是总路线 tracker；`#41/#33/#35/#37/#38/#39` 保留为 P1 mechanics；`#43/#48/#49` 是 v0.8 后续支撑能力 |
| v0.7 owner roadmap | P0 foundation 和 `#28` concrete pilot 已完成；v0.8 应接 deferred mechanics，而不是重做 foundation |
| 代码漂移路线 | U-027 已完成 evidence visibility；U-029 已连接 contract requirement 与 evidence；U-030 已让 drift findings 指向 remediation action；U-031 已让 agent-consumable decisions 声明 source/evidence/summary 边界；U-032 已让 read-model 声明 snapshot/export/watermark/staleness；U-033 已让 fixture/golden 约定可引用稳定样例 |
| 当前实现基础 | `project_topology`、module `implementation`、`implementation.evidence[]`、manifest `evidence_summary`、`validate --reality` 均已存在 |

## v0.8 排序原则

1. 优先解决 trust boundary 和 code drift 的下一个最小闭环。
2. 优先复用现有 schema / compiler / validator 管线，避免新增外部执行模型。
3. 不把 issue label 当作自动排序；按依赖关系和可验证性排序。
4. 新任务必须先进入 ledger；每轮只执行当前锁定任务。
5. AODS 保持独立规范路线，不把 Polaris 集成当作完成条件。

## 推荐主线

| 顺序 | 建议任务 | 对应 issue | 价值 | 非目标 |
|---:|---|---|---|---|
| 1 | Implementation acceptance criteria 最小模型 | `#49`、`#43`、`#60` | 把 contract drift 从“有证据”推进到“证据对应哪个 requirement” | 不执行任意 command；不做行为 oracle |
| 2 | Drift remediation workflow 最小模型 | `#43`、`#60` | validator finding 能指向 add-authority / mark-experimental / waive / remove / migrate 等处理路径 | 不做完整审批系统 |
| 3 | Decision provenance boundary | `#38`、`#60` | 为 agent-consumable decisions 定义 evidence / source / derived summary 的最低 provenance 要求 | 不做全 surface family provenance 框架 |
| 4 | Read-model freshness / watermark profile | `#35`、`#60` | 将 snapshot / stale / partial semantics 接到 read-model profile | 不覆盖 write/event profile |
| 5 | Fixture and golden export conventions | `#48`、`#60` | 为后续 drift 和 conformance test 提供稳定目录和命名规则 | 不要求所有 repo 立即迁移 |
| 6 | Capability negotiation re-triage | `#41`、`#60` | 在 adapter profile 和 acceptance criteria 稳定后再决定最小 provider/consumer metadata | 不在当前阶段实现完整 negotiation handshake |

## 已完成切片：Implementation Acceptance Criteria

### 完成目标

让 AODS 能声明“某个 contract requirement 应由哪些 evidence / fixture / manual review / validation hook 证明”，从而把 stable contract metadata、implementation linkage 和 evidence summary 串成一个可审查闭环。

### 已落地的最小数据模型

| 字段 | 含义 | 最小约束 |
|---|---|---|
| `id` | requirement / criterion 本地标识 | module 内唯一 |
| `surface_ref` | 对应 stable surface 或 contract 段落 | 必填 |
| `requirement` | 人类可读的验收要求 | 必填，短文本 |
| `check_type` | 验收方式 | `evidence-ref`、`validator-rule`、`fixture`、`manual-review` |
| `evidence_refs` | 引用 `implementation.evidence[].id` | `check_type=evidence-ref` 时至少一个 |
| `blocking` | 是否阻断 strict / release / drift gate | 必填，最小枚举 |
| `status` | 当前状态 | `planned`、`satisfied`、`partial`、`waived`、`blocked` |
| `authority_surface` | 哪个规范段落拥有该 criterion | 必填 |

### 已落地的 Validator 最小规则

| 规则 | 级别 | 触发 |
|---|---|---|
| `acceptance-criteria-required` | L2 | stable / adapter-facing / implementation-linked module 无 criteria |
| `acceptance-criteria-evidence-ref-resolves` | L2 | criterion 引用了不存在的 evidence id |
| `acceptance-criteria-authority-surface-required` | L2 | criterion 无 owner |
| `acceptance-criteria-blocked` | L2 或 L3 | blocking criterion 状态为 `blocked` / `partial` / `waived` |
| `acceptance-criteria-manual-review` | L3 | criterion 只靠 manual review，提示不可自动证明 |

### 验收结果

1. spec 明确 criteria 是 contract-to-evidence linkage，不是 arbitrary executor。
2. schema / compiler / manifest summary 能表达最小 criteria。
3. validator 覆盖 duplicate id、missing evidence ref、missing criteria、manual review warning。
4. compiled-pilot source-first example 至少展示一个 satisfied criterion 和一个 planned / manual criterion。
5. `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test` 通过。

## Deferred 任务边界

| Issue | v0.8 处理方式 |
|---|---|
| `#41` capability negotiation | U-034 已完成 re-triage；只保留 provider/consumer/matching/evidence-link 的 metadata-only 边界，完整 handshake 继续 deferred。 |
| `#33/#39` write/event mechanics | 继续延后。command / event surface 会扩大写能力和 correction semantics，需等 criteria / remediation 先稳定。 |
| `#35` freshness | U-032 已完成最小 declared metadata + missing freshness gate；后续只在有真实 stale/partial fixture 需求时扩展。 |
| `#48` fixture / golden export | U-033 已完成最小 convention 与 compiled-pilot source example；后续 runner 或全量迁移必须另立任务。 |
| `#37` long-running lifecycle | 后续结合 operational object profile 处理。 |
| `#54-#59` docs / ergonomics | 适合间歇性处理或社区贡献，不进入当前主线。 |
| `#13` changelog ergonomics | 保持 P3，除非 release workflow 再次暴露真实阻塞。 |

## 已完成切片：Fixture and Golden Export Conventions

### 完成目标

为后续 drift 和 conformance work 定义最低成本的 fixture / golden export 约定，让 criteria、validator rule、read-model snapshot 和 remediation finding 都能引用稳定样例，而不是依赖临时测试目录。

### 已落地的最小约定

| 项 | 含义 | 最小约束 |
|---|---|---|
| `fixtures/positive/` | 预期通过的 corpus 或 authoring source | 命名包含能力域和场景 |
| `fixtures/negative/` | 预期失败的 corpus 或 authoring source | 命名包含触发 validator rule |
| `golden/exports/` | 稳定输出快照 | 需要记录生成命令和 schema version |
| `fixture-manifest` | fixture 元数据入口 | 声明 purpose、expected_status、expected_rules |
| update workflow | golden 更新路径 | 明确何时人工审查、何时重新生成 |

### 验收结果

1. docs/spec 明确 positive / negative fixture 与 golden export 的目录、命名、更新流程。
2. 至少一个现有 compiled-pilot 或 benchmark scenario 能映射到 convention。
3. 不引入完整 conformance runner；只建立后续 runner 可消费的稳定约定。
4. `npm run validate:all`、`npm run benchmark:test`、`git diff --check` 通过。

## 已完成切片：Capability Negotiation Re-triage

### 完成目标

重新判断 capability negotiation 的最低可验证边界，避免把 adapter-facing contract 扩成完整协议栈。当前推荐只做 provider capability、consumer requirement、compatibility matching 的 metadata/spec 层裁剪。

### 已落地的最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| provider capability | provider 声明可提供的稳定能力、profile、版本和限制 | 不做 runtime discovery |
| consumer requirement | consumer 声明需要的能力、profile、版本和必需条件 | 不做自动绑定 |
| compatibility matching | deterministic metadata comparison 的最低规则 | 不做 handshake / auth / negotiation session |
| evidence link | capability claim 可链接 implementation evidence 或 acceptance criteria | 不执行 provider command |

### 验收结果

1. spec 明确 negotiation 与 adapter-facing minimum contract 的边界。
2. 本轮不新增 schema；只保留 metadata-only spec boundary，不引入 runtime session。
3. validator/runtime 不扩张；future deterministic metadata checks 需另立任务。
4. `npm run validate:all`、`npm run benchmark:test`、`git diff --check` 通过。

## 下一轮建议

当前 v0.8 backlog 任务已清空。下一轮应重新审查 GitHub open issues、owner roadmap 和近期实现风险，再把新任务写回 `aods-task-ledger.zh-CN.md` 后执行。

## 完成后的价值

1. AODS 能说清楚 stable contract 为什么被认为已实现。
2. `implementation.evidence[]` 不再只是孤立证据列表，而能挂到具体 requirement。
3. drift remediation 和 conformance fixtures 会有稳定入口。
4. adapter capability 不再被误读成完整 negotiation runtime。
5. 后续 Polaris 或任何外部系统都可以消费同一套 criteria，而不需要 AODS 写专用集成。
