# AODS Credential Placeholder Policy Docs

任务：U-144
状态：已完成
日期：2026-05-12
范围：credentials / handles / debug-only payload writing policy；不接入 secret manager

## 目标

定义 examples 和 docs 中 credential placeholder、handle、debug-only payload 的写法规则，避免示例被误读为真实凭据、真实远端服务或可执行配置。

## Placeholder Policy

| 场景 | 推荐写法 | 禁止写法 |
|---|---|---|
| 外部 URL | `https://example.test/...` | 真实生产 URL |
| repo locator | `example/<repo-name>` 或 descriptive-only locator | 私有仓库真实路径 |
| credential handle | `credential-handle:<purpose>` | 可被解析为真实 token 的字符串 |
| token scope | `token-scope:<scope-name>` | 真实 token 前缀 |
| debug payload | `debug-only:<sample-name>` | 客户数据、账号、真实日志片段 |
| secret value | 不写值，只写 boundary / posture | `password=...`、`api_key=...`、`secret=...` |

## 文档写法规则

| 规则 | 说明 |
|---|---|
| 只声明 boundary，不写 secret | 例如 credential_boundary、auth_boundary、redaction_floor |
| 使用 obvious placeholder | reader 能一眼看出不是可用值 |
| 避免真实 token 形状 | 不使用常见云厂商、平台、API key 前缀 |
| 标明 non-goal | 写清楚不实现 auth runtime、secret manager、remote gateway |
| handle-only 不等于 secret | handle 是 opaque reference，不能展开为值 |
| debug-only 不等于 public safe | debug-only 不应进入 stable public output |

## Review Checklist

| 检查 | 通过标准 |
|---|---|
| 是否有真实密钥前缀 | 无 |
| 是否有 `password=` / `api_key=` / `secret=` / `token=` 形式 | 无真实值 |
| 是否有真实生产 host | 无 |
| 是否有 customer / account identifier | 无 |
| 是否说明 credential posture | 有 boundary 或 non-goal |

## 当前仓库结果

| 检查 | 结果 |
|---|---|
| 高置信 secret-like scan | 0 hits |
| placeholder URL | 使用 `example.test` |
| placeholder repo locator | 使用 `example/...` |
| credential handling | 只作为 risk / boundary 文案出现 |

## 非目标

- 不接入 secret manager。
- 不做凭据轮换。
- 不做运行时身份认证。
- 不把 placeholder policy 当成完整安全框架。
