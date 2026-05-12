# AODS Acceptance Criteria Coverage Report

状态：U-104 已完成
日期：2026-05-12
范围：criteria 与 evidence refs、fixtures、validator rules、manual review posture 的覆盖摘要；不执行 arbitrary command

## 结论

Compiled-pilot 当前有 14 条 acceptance criteria：13 条 satisfied，1 条 planned，0 partial，0 waived，0 blocked，0 manual_review。所有 criteria 都使用 `evidence-ref` 作为 check_type，说明当前覆盖模型是静态 contract-to-evidence linkage，不执行任意命令。

主要缺口是 `shift-ops-policy` 的 release window review 仍为 planned；另一个边界是 implementation repos 是示例路径，reality check 只能报告 unchecked，不能证明外部代码真实存在。

## Coverage Summary

| Metric | Value |
|---|---:|
| acceptance criteria total | 14 |
| satisfied | 13 |
| planned | 1 |
| partial | 0 |
| waived | 0 |
| blocked | 0 |
| manual_review | 0 |
| check_type `evidence-ref` | 14 |

## Criteria Matrix

| Surface | Criteria | Status | Evidence refs |
|---|---|---|---|
| `shift-ops-policy:approval-policy` | `approval-policy-contract` | satisfied | `approval-policy-test` |
| `shift-ops-policy:approval-policy` | `approval-release-window-review` | planned | `approval-release-window-check` |
| `shift-ops-readiness-read-model:release-readiness-read-model` | `readiness-read-model-contract` | satisfied | `readiness-export-test` |
| `shift-ops-readiness-read-model:release-readiness-read-model` | `readiness-watermark-contract` | satisfied | `readiness-watermark-fixture` |
| `shift-ops-change-command:change-command` | `change-command-contract` | satisfied | `change-command-contract-test` |
| `shift-ops-change-command:change-command-receipt` | `change-receipt-contract` | satisfied | `change-command-receipt-fixture` |
| `shift-ops-change-event-log:change-event` | `change-event-append-contract` | satisfied | `change-event-append-test` |
| `shift-ops-change-event-log:change-event-correction-supersession` | `change-event-correction-contract` | satisfied | `change-event-correction-fixture` |
| `shift-ops-adapter-capability:adapter-provider-capability` | `adapter-provider-capability-contract` | satisfied | `adapter-capability-contract-test` |
| `shift-ops-adapter-capability:adapter-consumer-requirement` | `adapter-consumer-requirement-contract` | satisfied | `adapter-exposure-fixture` |
| `shift-ops-artifact-export-policy:artifact-export-surface` | `artifact-export-contract` | satisfied | `artifact-export-schema-test` |
| `shift-ops-artifact-export-policy:artifact-policy-gate` | `artifact-policy-gate-contract` | satisfied | `artifact-policy-gate-fixture` |
| `shift-ops-resource-surface:resource-identity-scope` | `resource-scope-contract` | satisfied | `resource-scope-contract-test` |
| `shift-ops-resource-surface:resource-cleanup-evidence` | `resource-cleanup-contract` | satisfied | `resource-cleanup-fixture` |

## Validator / Fixture Posture

| Posture | Current support |
|---|---|
| unresolved evidence ref | validator rejects |
| duplicate criteria id | validator rejects |
| manual review criteria | validator keeps visible as warning posture |
| stale current evidence | reality summary reports stale/current counters |
| fixture smoke | fixture manifest smoke checks declared input/golden path and expected status |
| arbitrary command execution | intentionally not supported |

## Next Gaps

1. Planned policy criterion needs refresh workflow boundary in U-106.
2. Unchecked implementation repo locators need remediation planning in U-107/U-108.
3. Criteria coverage should become a stable report contract before dashboard work.
