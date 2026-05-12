# AODS Contract Requirement To Evidence Trace Report

状态：U-105 已完成
日期：2026-05-12
范围：stable contract requirement 到 implementation evidence 的 traceability 输出边界；不做 semantic oracle

## 结论

Contract requirement to evidence trace 可以用现有 metadata 静态生成：`surface_ref` -> `acceptance_criteria.requirement` -> `evidence_refs[]` -> `implementation.evidence[]` -> `repo_id / locator / status` -> reality summary。当前 compiled-pilot 已有足够信息形成 trace report，但不能证明外部代码语义真的满足要求。

这个报告的边界是“能追踪、能发现缺口、能说明未检查原因”，不是 semantic oracle。

## Trace Fields

| Field | Source | Purpose |
|---|---|---|
| `surface_ref` | acceptance criteria | 定位 contract requirement 所属 surface |
| `criteria_id` | acceptance criteria | 稳定 requirement id |
| `requirement` | acceptance criteria | 人类可读要求文本 |
| `status` | acceptance criteria | satisfied / planned / partial / waived / blocked |
| `check_type` | acceptance criteria | 当前主要为 `evidence-ref` |
| `evidence_refs` | acceptance criteria | 指向 implementation evidence |
| `evidence.locator` | implementation evidence | 指向测试、fixture、文件或审查证据 |
| `evidence.status` | implementation evidence | current / planned / stale / blocked |
| `repo_id` | implementation metadata | 关联 project topology implementation repo |
| `reality_posture` | validate --reality | checked / missing / unchecked |

## Sample Trace Matrix

| Requirement family | Surface | Criteria status | Evidence refs | Reality posture |
|---|---|---|---|---|
| approval policy | `shift-ops-policy:approval-policy` | 1 satisfied, 1 planned | `approval-policy-test`, `approval-release-window-check` | unchecked example repo |
| read-model freshness | `shift-ops-readiness-read-model:release-readiness-read-model` | 2 satisfied | `readiness-export-test`, `readiness-watermark-fixture` | unchecked example repo |
| command / receipt | `shift-ops-change-command:*` | 2 satisfied | `change-command-contract-test`, `change-command-receipt-fixture` | unchecked example repo |
| event correction | `shift-ops-change-event-log:*` | 2 satisfied | `change-event-append-test`, `change-event-correction-fixture` | unchecked example repo |
| adapter compatibility | `shift-ops-adapter-capability:*` | 2 satisfied | `adapter-capability-contract-test`, `adapter-exposure-fixture` | unchecked example repo |
| artifact export | `shift-ops-artifact-export-policy:*` | 2 satisfied | `artifact-export-schema-test`, `artifact-policy-gate-fixture` | unchecked example repo |
| resource surface | `shift-ops-resource-surface:*` | 2 satisfied | `resource-scope-contract-test`, `resource-cleanup-fixture` | unchecked example repo |

## Output Boundary

| The report may say | The report must not say |
|---|---|
| requirement has / lacks evidence refs | code behavior is semantically correct |
| evidence is current / planned / stale / blocked by declaration | external implementation is actually current if repo is unchecked |
| locator is checked / missing / unchecked | remote repo was fetched |
| criteria is satisfied / planned by metadata | user workflow is fully covered |
| next remediation target | automatic fix is safe |

## Recommended Next Step

U-106 should define stale evidence refresh workflow: who owns refresh, when stale posture triggers, which validation gate must pass, and how manual review is recorded without executing arbitrary evidence commands.
