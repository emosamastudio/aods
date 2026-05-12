# AODS Sensitive Example Redaction Fixture Review

任务：U-143
状态：已完成
日期：2026-05-12
范围：examples sensitive placeholder / redaction posture risk review；不做 secret scanner service

## 目标

审查 examples 中是否存在真实敏感值、危险凭据形状或误导性的 redaction posture，并记录当前 fixture 风险。当前只做本地样本审查，不接入 secret scanner service。

## 本轮检查结果

| 检查项 | 结果 |
|---|---|
| secret-like pattern scan | 125 个文本文件，0 个高置信命中 |
| compiled-pilot module `meta.redaction` | 0 个 module 声明 redaction record |
| placeholder locator | 仅发现 `example.test` / `example/...` 形式 |
| redaction model authority | `spec/stable-surface-contracts:redaction-policy-model` 已存在 |

## 当前样本姿态

| 样本类型 | 当前写法 | 判断 |
|---|---|---|
| external citation URL | `https://example.test/...` | 安全占位，不是真实外部依赖 |
| implementation repo locator | `example/shift-ops-control-plane`、`example/shift-ops-worker` | 示例路径，不代表真实 repo |
| adapter credential boundary | 只写 credential boundary / risk label | 未存储凭据 |
| redaction payload | compiled pilot 未放入真实敏感 payload | 风险低 |

## Redaction Fixture Gap

| Gap | 影响 | 当前结论 |
|---|---|---|
| 没有 dedicated sensitive fixture | 无法用示例展示 `has_sensitive_payloads=true` 的完整字段 | 记录为后续可选 negative / positive fixture，不插入本轮任务 |
| 没有真实 masking sample | 不影响当前 metadata-first 模型 | 当前 redaction 不做 transform |
| 没有 secret scanner service | 符合非目标 | 本轮只做本地 pattern review |

## 风险控制规则

| 规则 | 说明 |
|---|---|
| 示例不得使用真实凭据形状 | 避免复制后触发安全事故或误报 |
| 示例 locator 使用 reserved domains / example paths | 不把示例变成真实远端依赖 |
| `handle-only` 只能表达 opaque handle | 不放底层 secret |
| `debug-only` 不得进入 stable public output | 只允许本地诊断或 evidence surface |

## 非目标

- 不接入 secret manager。
- 不接入 secret scanner service。
- 不做运行时 redaction transform。
- 不新增 fixture，除非后续台账单独裁剪。
