# AODS v0.8 Backlog Triage

状态：v0.8 backlog 决策
日期：2026-05-07
适用范围：v0.7 release 后的 open issue 复盘、代码漂移主线排序、下一最小实现切片选择

## 结论

v0.8 不应先做完整 capability negotiation，也不应直接进入行为级代码理解。当前最推荐路线是沿着 U-027 implementation evidence 继续推进，把“证据存在”升级为“规范 contract 与证据之间有机器可读的验收关系”。

下一最小切片应为 **implementation acceptance criteria**：让 stable / adapter-facing / implementation-linked module 能声明 contract requirement、check type、expected evidence、blocking posture 和 validation hook。它直接服务代码漂移问题，且能复用现有 topology、implementation linkage、evidence summary、strict/reality gate，不需要引入跨仓库执行器。

## 输入信号

| 来源 | 当前判断 |
|---|---|
| GitHub open issues | 当前 24 个 open issue；`#60` 仍是总路线 tracker；`#41/#33/#35/#37/#38/#39` 保留为 P1 mechanics；`#43/#48/#49` 是 v0.8 后续支撑能力 |
| v0.7 owner roadmap | P0 foundation 和 `#28` concrete pilot 已完成；v0.8 应接 deferred mechanics，而不是重做 foundation |
| 代码漂移路线 | U-027 已完成 evidence visibility；下一步应连接 contract requirement 与 evidence |
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

## 下一轮建议：Implementation Acceptance Criteria

### 目标

让 AODS 能声明“某个 contract requirement 应由哪些 evidence / fixture / manual review / validation hook 证明”，从而把 stable contract metadata、implementation linkage 和 evidence summary 串成一个可审查闭环。

### 最小数据模型候选

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

### Validator 最小规则候选

| 规则 | 级别 | 触发 |
|---|---|---|
| `acceptance-criteria-required` | L2 | stable / adapter-facing / implementation-linked module 无 criteria |
| `acceptance-criteria-evidence-ref-resolves` | L2 | criterion 引用了不存在的 evidence id |
| `acceptance-criteria-authority-surface-required` | L2 | criterion 无 owner |
| `acceptance-criteria-blocked` | L2 或 L3 | blocking criterion 状态为 `blocked` / `partial` / `waived` |
| `acceptance-criteria-manual-review` | L3 | criterion 只靠 manual review，提示不可自动证明 |

### 验收标准

1. spec 明确 criteria 是 contract-to-evidence linkage，不是 arbitrary executor。
2. schema / compiler / manifest summary 能表达最小 criteria。
3. validator 覆盖 duplicate id、missing evidence ref、missing criteria、manual review warning。
4. compiled-pilot source-first example 至少展示一个 satisfied criterion 和一个 planned / manual criterion。
5. `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`npm run validate:all`、`npm run benchmark:test` 通过。

## Deferred 任务边界

| Issue | v0.8 处理方式 |
|---|---|
| `#41` capability negotiation | 继续保留，不作为下一实现切片。缺 acceptance criteria 前直接做 negotiation 会过早扩大 schema。 |
| `#33/#39` write/event mechanics | 继续延后。command / event surface 会扩大写能力和 correction semantics，需等 criteria / remediation 先稳定。 |
| `#35` freshness | 作为 criteria 后的 read-model profile 切片；不抢当前第一位。 |
| `#37` long-running lifecycle | 后续结合 operational object profile 处理。 |
| `#54-#59` docs / ergonomics | 适合间歇性处理或社区贡献，不进入当前主线。 |
| `#13` changelog ergonomics | 保持 P3，除非 release workflow 再次暴露真实阻塞。 |

## 完成后的价值

1. AODS 能说清楚 stable contract 为什么被认为已实现。
2. `implementation.evidence[]` 不再只是孤立证据列表，而能挂到具体 requirement。
3. drift remediation 和 conformance fixtures 会有稳定入口。
4. 后续 Polaris 或任何外部系统都可以消费同一套 criteria，而不需要 AODS 写专用集成。
