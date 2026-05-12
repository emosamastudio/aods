# AODS Documentation Density Quality Pass

任务：U-140
状态：已完成
日期：2026-05-12
范围：agent-primary docs density / actionability review；不重写文档门户

## 目标

复查 agent-primary spec 内容是否保持 dense、actionable、non-marketing，并记录需要未来拆分或压缩的高密度区域。当前只做质量清单，不做大规模重写。

## 检查方法

| 检查 | 范围 | 结果 |
|---|---|---|
| section count | `spec/*.json` sections | 63 |
| token density top list | section content whitespace token approximation | 最大约 514 tokens |
| filler regex | 常见 filler phrase | 1 个命中，位于 AOP anti-pattern 说明 |
| route relevance | 本轮 query route | 命中 stable contracts、validation、authority governance |

## 高密度 Section

| 排名 | 模块 | section | 近似 tokens | 判断 |
|---:|---|---|---:|---|
| 1 | `spec-validation` | `referential` | 514 | 内容多但为规则聚合，可接受 |
| 2 | `spec-stable-surface-contracts` | `stable-contract-scope-boundary` | 444 | 覆盖面宽，未来改动时可拆 |
| 3 | `spec-validation` | `surface-governance` | 413 | 引用与 surface gate 密集，可接受 |
| 4 | `spec-stable-surface-contracts` | `topology-pilot-design` | 403 | 历史设计边界较长，未来可压缩 |
| 5 | `spec-validation` | `structural` | 322 | schema / module 基础规则集中，暂不拆 |
| 6 | `spec-stable-surface-contracts` | `local-remote-exposure-constraints` | 301 | 本轮 U-145 继续文档化，不改 spec |

## 问题清单

| 问题 | 影响 | 当前处理 |
|---|---|---|
| `spec-validation:referential` 承载太多 rule family | 后续新增规则时容易继续膨胀 | 未来编辑该 section 时优先拆分 |
| `stable-contract-scope-boundary` 是历史汇总段 | 读者可能难以快速定位单一约束 | 保留为 boundary summary，不在本轮重写 |
| filler regex 命中 AOP core rules | 实际是在列反例，不是 filler misuse | 记录为误报 |
| operations docs 数量增长 | 入口表较长 | 本轮补索引，不做门户重构 |

## 质量门槛

| 维度 | 当前判断 |
|---|---|
| Actionable | 规则多为 MUST / SHOULD / gate / non-goal 形式，可执行 |
| Non-marketing | 未发现宣传式陈述 |
| Canonical vocabulary | 本轮新增术语 / 引用 / 暴露文档沿用已有字段 |
| Scope control | 仍保持 metadata-only，不承诺 runtime |

## 非目标

- 不重写 `docs/` 门户。
- 不把 spec 全量拆分。
- 不新增 prose linter。
- 不改 route scorer 或 validation rule shape。
