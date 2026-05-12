# AODS Remote Gateway And Adapter Runtime Triage

状态：U-089 已完成
日期：2026-05-12
范围：remote gateway / adapter runtime 的 entry contract；不实现 remote gateway

## 结论

Remote gateway / adapter runtime 当前不应实现。AODS 已经有 exposure class、capability compatibility、audit metadata 和 local/remote upgrade vocabulary，但还缺 auth / identity model、transport failure semantics、rate/cost boundary、credential handling、fixture matrix 和 public wording。

## 已有权威输入

| 输入 | 当前作用 |
|---|---|
| Exposure class | local-only、local-export、remote-read、remote-write、adapter-facing |
| Capability compatibility | provider capability 与 consumer requirement 的 deterministic match |
| Audit-log metadata | actor/source/target/command/idempotency/policy/receipt/correlation |
| Risk taxonomy | network、credential、external send、cost、production mutation 等风险 |
| Resource surface example | 描述资源 identity、scope、owner、cleanup 和 exposure posture |

## Entry Contract 必须补齐

| 领域 | 必填问题 | 失败姿态 |
|---|---|---|
| Exposure upgrade | 从 local-only 到 remote-* 的升级 gate、owner 和 public wording | 未通过 upgrade gate 时保持 local-only |
| Auth / identity | actor、tenant、token scope、credential storage、impersonation 是否允许 | 不完整时禁止 remote write |
| Transport | timeout、retry、rate limit、partial failure、idempotency、backoff | 不完整时只能 dry-run / read-only |
| Capability matching | provider / consumer 如何在 runtime 前完成 compatibility check | mismatch 时禁止调用 |
| Audit | remote call 的 request id、receipt、correlation、policy decision | 无 audit anchor 时禁止 stable exposure |
| Cost / quota | cost risk、quota owner、limit exceeded 的处理 | 不完整时禁止 automatic retry |
| Fixture set | local-only blocked、remote-read allowed、remote-write denied、adapter mismatch、transport timeout | fixture 不足时不得 PoC |

## Non-Goals

1. 不实现 remote API gateway。
2. 不实现 auth runtime、token broker、network broker 或 sandbox。
3. 不做 dynamic discovery、provider probing 或 fallback ranking。
4. 不自动把 local-only surface 升级为 remote-capable。
5. 不承诺跨仓库远程执行。

## PoC 进入条件

Remote gateway / adapter PoC 只有在以下条件同时满足后才可进入 U-154：

1. 至少一个 adapter-facing surface 有完整 auth、exposure、compatibility 和 audit contract。
2. local-only / remote-read / remote-write / adapter mismatch 的 fixtures 可复查。
3. rate limit、timeout、partial failure 和 idempotency 有稳定失败语义。
4. public docs 明确 PoC 不代表通用网关或身份系统。
