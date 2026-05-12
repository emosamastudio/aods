# AODS Capability Compatibility Gates

状态：U-078 已完成
日期：2026-05-08
适用范围：provider capability 与 consumer requirement 的 metadata-only deterministic compatibility gate

## 目标

U-078 承接 `#41` 的 metadata-only residual。目标不是实现 negotiation handshake，而是让 AODS 能用声明式 matrix 表达 provider / consumer 的兼容与不兼容案例，并由 validator 检查 compatible / incompatible 结果是否与 profile、schema version policy、exposure class 等元数据一致。

## 本轮结果

| 项 | 结果 |
|---|---|
| matrix shape | `mapping-table` 可声明 `provider_capability_id`、`required_capability_id`、profile、schema version policy、exposure class 和 `expected_result` |
| deterministic gate | `compatible` / `incompatible` rows 会按 capability id、contract profile、schema version policy、exposure class 做静态比对 |
| mismatch finding | mislabeled row 输出 L2 `capability-compatibility-mismatch`，并附 `align-capability-compatibility/drift-blocking` remediation |
| canonical example | compiled-pilot adapter capability pack 已展示 `readiness-compatible` 和 `profile-version-exposure-incompatible` 两个案例 |

## 验收标准

| 标准 | 状态 | 证据 |
|---|---|---|
| profile/version/exposure 最小不兼容 case 可表达 | 通过 | `adapter-capability-compatibility-matrix` 中的 `profile-version-exposure-incompatible` |
| focused regression 覆盖 mislabeled compatibility | 通过 | `capability compatibility matrix rejects mislabeled profile version and exposure matches` |
| 不进入 runtime handshake | 通过 | 本轮只读取 mapping-table；未实现 discovery、auth、fallback ranking、dynamic probing |
| repo-level validation 通过 | 通过 | `npm run validate:all` |

## 非目标

1. 不做 runtime discovery、auth exchange、provider selection、fallback ranking 或 dynamic probing。
2. 不执行 provider 行为，也不探测远端服务。
3. 不引入新的 artifact type；本轮复用 `mapping-table`。
4. 不关闭 `#41`，full negotiation handshake 继续 deferred。

## 后续

下一步优先 U-079：validate / route JSON explanation minimal enrichment。若后续继续推进 `#41`，必须另立 runtime protocol 任务，而不是把握手行为塞进 compatibility matrix。
