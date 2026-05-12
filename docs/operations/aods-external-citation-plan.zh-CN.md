# AODS External Citation / Provenance Metadata Boundary

状态：U-061/U-065/U-066/U-067 已完成
日期：2026-05-08
对应 GitHub issue：`#58`

## 目标

把 external-source citation 与既有 provenance / decision_provenance 分开，定义 AODS 对外部标准、API、文档和假设的最小可验证 metadata 边界。

## 当前状态

| 面 | 现状 | 判断 |
|---|---|---|
| `module.meta.provenance` | 表达 memory_role、sources、confidence、review_chain | 适合内部来源和 review trace，不足以表达 external locator、retrieved date、authority relation |
| `manifest.modules[].provenance` | 只镜像 memory_role + confidence | bootstrap summary 应继续轻量，不承载 citation 详情 |
| artifact `decision_provenance` | 支持 consumer_surface、basis、source_refs、evidence_refs、evidence_status、consumption_gate | 已能阻断 unresolved evidence 的 stable consumption，但不是外部 citation registry |
| prompt envelope citations | benchmark prompt 里要求 path labels as citations | 这是评测提示行为，不是 corpus schema |
| AOP uncertainty markers | 已要求标记 unknown / assumptions | external citation 应提供结构化承载面，不替代 AOP 写作规则 |

## 最小模型

外部 citation 应作为 module-level registry 加局部 refs，而不是在每个 prose 字段里重复完整来源。

| 字段 | 必要性 | 含义 |
|---|---|---|
| `citation_id` | 必须 | module 内稳定 id，供 section / artifact / decision_provenance 引用 |
| `source_type` | 必须 | `standard`、`api-doc`、`paper`、`legal-policy`、`web-page`、`repository`、`human-note`、`assumption` |
| `locator` | 条件必须 | URL、repo path、DOI、document id 或 human note id；`assumption` 可无外部 locator |
| `version_or_date` | 条件必须 | 外部标准版本、API version、commit/tag、publication date 或 access date |
| `authority_relation` | 必须 | `external-authority`、`supporting-evidence`、`background-context`、`inferred-guidance`、`unsupported-assumption` |
| `claim_posture` | 必须 | `authoritative-claim`、`quoted-source`、`paraphrase`、`derived-guidance`、`assumption` |
| `uncertainty` | 可选 | `none`、`low`、`medium`、`high`，用于标记时效性或解释风险 |
| `review_status` | 必须 | `current`、`stale`、`unresolved`、`withheld` |

Sections、artifacts 或 decision records 只引用 `citation_refs[]`，并继续用现有 `refs[]` / `source_refs[]` 表达 corpus 内部 authority。

## 与既有 provenance 的分工

| 概念 | 归属 | 说明 |
|---|---|---|
| internal authority | `refs[]`、module refs、authority hierarchy | AODS 自身语义胜出，不靠 external citation 决定 |
| module review trace | `module.meta.provenance` | 记录 sources/review_chain/confidence，保持 manifest summary 轻量 |
| external factual support | `external_citations[]` + `citation_refs[]` | 记录外部来源、版本、authority relation 和 claim posture |
| agent-consumable decision evidence | `decision_provenance` | 继续阻断 stale/unresolved evidence 的 stable consumption |
| unresolved assumption | citation `authority_relation=unsupported-assumption` 或 decision evidence status | 必须显式降低 stable claim posture |

## Validator 边界

| Gate | 等级建议 | 说明 |
|---|---|---|
| citation id uniqueness | L1/L2 error | module 内唯一 |
| citation ref resolution | L2 error | section / artifact / decision 引用必须解析到 declared citation |
| authoritative external claim completeness | L2 error | `authority_relation=external-authority` 或 `claim_posture=authoritative-claim` 必须声明 locator 与 version/date |
| unresolved stable claim | L2 error | `review_status=unresolved/stale/withheld` 不得支撑 stable agent-consumable authoritative claim |
| unsupported assumption posture | L3 warning 或 strict L2 | assumption 可存在，但不能伪装成 authority；strict stable surfaces 应阻断 |

## 后续任务

| 任务 | 内容 | 非目标 |
|---|---|---|
| U-065 | 已完成：落地 external citation schema / source-first compile mirror | 不 fetch 外部 URL，不做事实核验 |
| U-066 | 已完成：落地 citation refs 和 stable consumption validator gates | 不做 unsupported factual claim detector |
| U-067 | 已完成：增加 compiled-pilot external citation / provenance example pack | 不实现 crawler 或 cross-corpus resolver |

## 已落地结果

| 项 | 文件 | 说明 |
|---|---|---|
| Schema | `schema/module.schema.json`、generated schema copies | `module.meta.external_citations[]`、section/artifact/provenance `citation_refs[]` 已进入 module schema |
| Validator | `lib/validate.mjs` | 覆盖 citation id uniqueness、ref resolution、authoritative completeness、assumption posture、stable currentness |
| Regression | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | source-first positive mirror 与 negative gate regression 已覆盖 |
| Example pack | `examples/compiled-pilot-source/authoring.json`、`examples/compiled-pilot/modules/shift-ops-governance.json`、`examples/compiled-pilot-source/fixtures/fixture-manifest.json`、`benchmarks/aods-eval-lab/test/example-packs.test.mjs` | governance module 展示 current external authority、unsupported assumption、section/artifact/provenance citation refs 和 golden export fixture |

## 非目标

1. 不实现 crawler、remote fetch、URL availability check 或 fact checker。
2. 不用 LLM 判断 paraphrase 是否忠实；摘要忠实性仍归人工 review。
3. 不把 external citation 提升为 corpus internal authority；外部来源只能支撑或限定 claim posture。
4. 不改变 existing decision_provenance 的 evidence gate，只补外部来源表达面。
