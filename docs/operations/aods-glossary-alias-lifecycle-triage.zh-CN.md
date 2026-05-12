# AODS Glossary Alias Lifecycle Triage

任务：U-136
状态：已完成
日期：2026-05-12
范围：glossary registry alias / deprecated term lifecycle；不实现 resolver runtime

## 目标

明确 glossary v2 中 canonical term、alias、deprecated term、replacement 和 scope collision 的维护边界。当前只做声明、校验和文档约束，不做运行时术语解析器。

## 当前模型

| 面 | 当前能力 | 证据 |
|---|---|---|
| v1 shorthand | glossary value 可继续使用 string definition | `schema/manifest.schema.json` |
| v2 term record | 支持 `term_id`、`definition`、`aliases`、`deprecated_terms`、`scope`、`owner`、`linked_surfaces`、`status` | `schema/manifest.schema.json` |
| alias uniqueness | 同一 scope 内 current term alias 不能指向多个 canonical term | `lib/validate.mjs` `glossary-alias-unique` |
| key / term_id mirror | `term_id` 存在时必须匹配 glossary key | `lib/validate.mjs` `glossary-term-id-match` |
| replacement ref | deprecated term replacement 必须解析到 current term | `lib/validate.mjs` `glossary-deprecated-replacement-ref` |
| surface ref | linked surface 必须解析到已存在 surface ref | `lib/validate.mjs` `glossary-linked-surface-ref` |

## Lifecycle Decision

| 状态 | 允许内容 | 消费规则 | 维护动作 |
|---|---|---|---|
| `current` | `definition`、`aliases`、`owner`、`linked_surfaces` | 作为 canonical term 使用 | 新增 alias 前先检查 scope collision |
| `deprecated` | 只作为 deprecated term 记录或兼容提示 | 不作为新内容的 canonical term | 必须给出 replacement 和 reason |
| `reserved` | 保留未来术语，不承诺当前定义 | 不应被正文引用为已生效术语 | 进入 current 前必须补定义和 owner |

## Alias 规则

| 规则 | 说明 |
|---|---|
| alias 归 current term 所有 | alias 是 canonical term 的输入别名，不是独立术语 |
| alias 在同一 scope 内唯一 | `release slot` 不能同时指向两个 current term |
| alias 不替代 canonical id | 机器引用、linked surface、replacement 使用 canonical term id |
| alias 变更是兼容事件 | 删除 alias 可能影响 authoring / human docs，应记录原因 |

## Deprecated Term 规则

| 字段 | 规则 |
|---|---|
| `term` | 旧词面，可与 alias 文案相同，但不再推荐新写入 |
| `replacement` | 必须指向 current canonical term id |
| `reason` | 必须说明为什么替换 |
| `status` | 当前只接受 deprecated 语义；不要把 deprecated 当 current 消费 |

## 当前 Example Snapshot

| 项 | 值 |
|---|---|
| canonical term | `release-window` |
| aliases | `release slot`、`deployment window` |
| deprecated term | `ship window` |
| replacement | `release-window` |
| linked surfaces | `shift-ops-policy:approval-policy`、`shift-ops-readiness-read-model:release-readiness-read-model` |

## 风险与后续

| 风险 | 当前处理 | 后续条件 |
|---|---|---|
| 自然语言正文仍可误用旧词 | 当前不全文扫描 | 只有有明确误用样本时才规划术语扫描器 |
| scope 语义过宽 | 先用 validator 检查同 scope alias collision | 多 corpus 后再评估 cross-scope 规则 |
| replacement 不表达迁移窗口 | 先记录 replacement / reason | 需要 release migration 时再和 migration guidance 合并 |

## 非目标

- 不做 glossary resolver runtime。
- 不做全文术语扫描或自动 rewrite。
- 不做跨 corpus 术语合并。
- 不把 alias 当成稳定引用 id。
