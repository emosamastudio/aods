# AODS Glossary Canonical Term Documentation Pass

任务：U-137
状态：已完成
日期：2026-05-12
范围：glossary v2 authoring / consumption guidance；不全文扫描

## 目标

补齐 glossary v2 的作者和消费者使用说明，让 canonical term、alias、deprecated term 和 linked surface 的边界可执行，同时避免把 glossary 夸大成运行时语义解析器。

## 作者规则

| 场景 | 推荐写法 | 原因 |
|---|---|---|
| 简单稳定定义 | 使用 v1 string shorthand | 低成本、兼容旧 corpus |
| 有 alias / deprecated term | 使用 v2 term record | validator 能检查 alias 和 replacement |
| 术语有明确 owner | 填 `owner` | 后续变更可找到责任面 |
| 术语绑定 surface | 填 `linked_surfaces` | 让消费者知道定义影响哪些 authority surface |
| 术语尚未生效 | 使用 `status=reserved` | 防止被误当 current term |

## 消费者规则

| 规则 | 说明 |
|---|---|
| 以 glossary key 为 canonical id | `term_id` 只是可选镜像，必须匹配 key |
| alias 只用于识别同义写法 | 机器 ref 和 replacement 不使用 alias |
| deprecated term 只用于迁移提示 | 新内容应写 replacement canonical term |
| linked surface 不是自动加载指令 | 它是影响范围提示，仍由 route / boot 选择实际加载面 |
| string shorthand 不提供 lifecycle | 需要 alias / deprecated / owner 时升级到 v2 record |

## Do / Don't

| Do | Don't |
|---|---|
| 用 `release-window` 作为稳定术语 id | 用 `deployment window` 作为机器引用 id |
| 给 deprecated term 写 replacement 和 reason | 只在正文说“旧词不用了” |
| 对高影响术语声明 owner | 让多个模块各自解释同一概念 |
| 用 linked surfaces 标记影响范围 | 期待 glossary 自动修改相关正文 |

## 当前边界

| 能力 | 当前状态 |
|---|---|
| schema 表达 | 已支持 v1 string 和 v2 record |
| authoring compile | source-first 示例会 mirror 到 compiled companion |
| validator gates | key mirror、alias collision、replacement、linked surface ref 已覆盖 |
| runtime resolver | 未实现，且当前不需要 |
| full-text scan | 未实现，避免误报和维护成本 |

## 验收记录

- 当前 compiled pilot 有 `release-window` v2 example。
- validator 能阻断 alias collision、replacement missing 和 linked surface missing。
- 本文档把 authoring / consumption guidance 补齐，未引入新 schema 或 runtime 承诺。

## 非目标

- 不全文扫描 module content。
- 不自动替换旧词。
- 不做自然语言同义词发现。
- 不改变现有 glossary schema。
