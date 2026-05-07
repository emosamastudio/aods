# AODS Glossary / Canonical-Term Registry Boundary

状态：U-060 已完成
日期：2026-05-08
对应 GitHub issue：`#57`

## 目标

把当前 `manifest.glossary` 的简表能力裁剪成 glossary / canonical-term registry v2 的最小边界，为后续 schema、compile、validator 和 example pack 任务提供稳定输入。

## 当前状态

| 面 | 现状 | 判断 |
|---|---|---|
| `manifest.glossary` | root glossary 是 object，value 只能是 200 字以内 string | 这是 v1 shorthand，适合冷启动定义，不足以表达 aliases / deprecated terms / owner |
| `manifest-companion.glossary` | companion 可外置 glossary，benchmark loader 会把 glossary slice 注入上下文 | v2 应继续兼容 companion 外置，不应强迫 root manifest 变大 |
| `authoring.corpus.glossary` | authoring schema 与 manifest 一样只支持 key-string | v2 需要 source-first compile mirror，不应只改 compiled schema |
| `lib/compile.mjs` | build manifest companion 时直接复制 `source.corpus.glossary` | v2 可继续复制结构，但需要 schema 允许 record shape |
| module section `content_type=glossary` | 只表示 section 内容类型 | 不能替代 root canonical registry；section glossary 可以链接 registry，但不应成为全局索引 |
| AOP authoring guidance | 已建议 canonical terms 和 aliases only in glossary / migration note | v2 registry 是已有写作规则的结构化承载面 |
| authority hierarchy | stable contracts 已有 alias / deprecation / migration vocabulary | v2 glossary 应复用这些语义，不另造 runtime resolver |

## 最小模型

| 字段 | 必要性 | 含义 |
|---|---|---|
| `term_id` | 必须 | 稳定 canonical key；继续兼容 v1 object key |
| `definition` | 必须 | 面向 agent 的短定义，替代 v1 string value |
| `aliases[]` | 可选 | 允许的同义词、历史写法或外部命名；只用于 routing / authoring guidance，不自动 rewrite |
| `deprecated_terms[]` | 可选 | 已废弃写法；每项必须有 `term`、`replacement`、`reason`、`status` |
| `scope` | 可选 | `system`、`module`、`surface` 或 explicit ref scope，限制术语适用范围 |
| `owner` | 可选但推荐 | 负责术语语义的 module、role 或 surface ref |
| `linked_surfaces[]` | 可选 | 与术语直接相关的 module / section / artifact refs |
| `status` | 可选 | `current`、`deprecated`、`reserved`；不引入 runtime lifecycle engine |

## 兼容策略

1. v1 string glossary 保持合法，并被解释为 `{ definition: "<string>", status: "current" }` 的 shorthand。
2. v2 record glossary 可以与 v1 string entries 混用，便于现有 corpora 渐进迁移。
3. companion export 继续承载 glossary；manifest root 只在未外置时直接携带 glossary。
4. compiled-pilot 和 generated benchmark schema 必须跟随 schema source 更新，不能手改 generated output。

## Validator 边界

| Gate | 等级建议 | 说明 |
|---|---|---|
| duplicate term id | L1/L2 error | object key 已天然唯一；record `term_id` 若声明必须与 key 一致 |
| alias collision | L2 error | 同一 scope 内 alias 不得指向多个 current terms |
| deprecated replacement missing | L2 error | deprecated term 的 replacement 必须指向 current term id 或 declared alias target |
| linked surface unresolved | L2 error | `linked_surfaces[]` 只做 deterministic ref resolution |
| deprecated natural-language usage | L3 warning，后置任务 | 只在明确 section / artifact 声明扫描范围时做；不做全文 NLP 或 rewrite |

## 后续任务

| 任务 | 内容 | 非目标 |
|---|---|---|
| U-062 | 落地 schema / authoring / compile mirror：允许 v1 string 或 v2 record glossary | 不做 validator lint，不改 routing resolver |
| U-063 | 落地 deterministic validator gates：term id、alias collision、deprecated replacement、linked surface refs | 不做全文术语扫描或自动迁移 |
| U-064 | 在 compiled-pilot 增加 glossary registry canonical example pack | 不新增 runtime resolver |

## 非目标

1. 不实现 term resolver runtime、migration tool、自动 rewrite 或 NLP 术语扫描。
2. 不让 section-level glossary 替代 root canonical registry。
3. 不把 aliases 当成 authority conflict resolver；冲突仍归 authority hierarchy / migration posture。
4. 不要求所有 corpora 立刻迁移到 v2 record shape。
