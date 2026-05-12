# AODS Remote Exposure Upgrade Checklist

任务：U-145
状态：已完成
日期：2026-05-12
范围：local-only / local-export 到 remote-read / remote-write / adapter-facing 的 upgrade checklist；不实现 gateway

## 目标

把 local-only 或 local-export surface 升级为 remote-read、remote-write 或 adapter-facing 前必须确认的事项写成 checklist。当前只定义升级审查，不实现 remote gateway、auth runtime 或 network broker。

## Upgrade Checklist

| Gate | remote-read | remote-write | adapter-facing |
|---|---|---|---|
| source surface | 必须指向 checked-in authority surface | 必须指向 checked-in authority surface | 必须指向 adapter authority surface |
| target exposure class | `remote-read` | `remote-write` | `adapter-facing` |
| upgrade gate | 记录 owner、reason、review date | 记录 owner、reason、approval boundary | 记录 provider / consumer review |
| auth boundary | 声明 actor / tenant / token scope | 声明 actor / tenant / token scope / impersonation policy | 声明 adapter identity 和 auth boundary |
| redaction | 声明 redaction floor | 声明 redaction floor 和 payload boundary | 声明 provider posture 和 consumer floor |
| freshness | 声明 freshness requirement | 声明 state freshness / command precondition | 声明 freshness posture |
| compatibility | 声明 schema / version policy | 声明 command / receipt / event compatibility | 声明 capability compatibility |
| risk labels | network / cost / credential | network / cost / credential / production mutation | network / cost / credential / adapter risk |
| audit anchor | 记录 read audit expectation | 记录 actor/source/target/receipt/correlation | 记录 adapter_id/capability_id/correlation |
| rollback / failure | 记录 stale or denied behavior | 记录 idempotency、rollback、policy decision | 记录 mismatch / timeout behavior |

## Block Conditions

| 条件 | 处理 |
|---|---|
| 没有 checked-in authority surface | 不升级 |
| 没有 auth boundary | 不升级为 remote-read / remote-write / adapter-facing |
| 没有 redaction floor | 不升级 |
| remote-write 没有 receipt / audit anchor | 不升级 |
| adapter-facing 没有 capability compatibility evidence | 不升级 |
| local-only reason 仍成立 | 保持 local-only |

## 当前证据

| 面 | 证据 |
|---|---|
| stable contract | `spec-stable-surface-contracts:local-remote-exposure-constraints` |
| readiness triage | `aods-remote-gateway-entry-triage.zh-CN.md` |
| example adapter surface | `shift-ops-adapter-capability:adapter-exposure-audit` |
| example resource surface | `shift-ops-resource-surface:resource-risk-exposure` |
| future validator hook | `local-remote-exposure-boundary` 目前仍是 future L3 warning |

## Review Output Template

| 字段 | 填写要求 |
|---|---|
| `source_surface` | canonical surface ref |
| `target_exposure_class` | remote-read / remote-write / adapter-facing |
| `upgrade_gate` | owner + reason + approval or review record |
| `risk_labels` | network / credential / cost / production mutation as applicable |
| `redaction` | floor and payload posture |
| `auth` | actor / principal / token-scope boundary |
| `freshness` | source freshness or state precondition |
| `compatibility` | schema / capability compatibility policy |
| `audit_anchor` | authority, receipt, event, or evidence ref |
| `consumer_guidance` | what consumers may and may not rely on |

## 非目标

- 不实现 remote gateway。
- 不实现 auth runtime。
- 不实现 network broker。
- 不自动升级 exposure class。
- 不把 checklist 结果当成运行时许可。
