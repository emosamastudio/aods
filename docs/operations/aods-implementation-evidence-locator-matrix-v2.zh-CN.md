# AODS Implementation Evidence Locator Matrix v2

状态：U-103 已完成
日期：2026-05-12
范围：repo locator、path locator、unchecked reason、evidence locator 状态矩阵；不 remote clone

## 结论

Implementation evidence locator matrix v2 已形成。当前 compiled-pilot reality summary 显示：8 个 linked modules、0 个 unlinked modules、14 条 evidence、13 条 current evidence、1 条 planned evidence、0 stale、0 blocked、0 missing evidence locators。

主要限制不是 evidence metadata 缺失，而是 example implementation repo locator 是示例路径，不存在于当前 repo root，因此 reality check 将这些 repo 标为 unchecked。后续不得把 unchecked repo 误解成 evidence 通过了真实文件检查。

## Topology Snapshot

| Repo id | Locator | Role | Branch | Status | Reality posture |
|---|---|---|---|---|---|
| `shift-ops-control-plane` | `example/shift-ops-control-plane` | service | `main` | current | unchecked: locator path does not exist under repo root |
| `shift-ops-worker` | `example/shift-ops-worker` | worker | `release-next` | partial | unchecked: locator path does not exist under repo root |

## Evidence Summary

| Metric | Value |
|---|---:|
| linked modules | 8 |
| unlinked modules | 0 |
| modules with evidence | 7 |
| modules without evidence | 1 |
| evidence total | 14 |
| current evidence | 13 |
| planned evidence | 1 |
| stale evidence | 0 |
| blocked evidence | 0 |
| missing evidence locators | 0 |
| checked paths | 0 |
| missing paths | 0 |

## Module Matrix

| Module | Repo | Implementation status | Evidence | Acceptance | Locator posture |
|---|---|---|---|---|---|
| `shift-ops-policy` | `shift-ops-control-plane` | current | total=2, current=1 | total=2, satisfied=1, planned=1 | unchecked example repo |
| `shift-ops-readiness-read-model` | `shift-ops-control-plane` | current | total=2, current=2 | total=2, satisfied=2 | unchecked example repo |
| `shift-ops-change-command` | `shift-ops-control-plane` | current | total=2, current=2 | total=2, satisfied=2 | unchecked example repo |
| `shift-ops-change-event-log` | `shift-ops-control-plane` | current | total=2, current=2 | total=2, satisfied=2 | unchecked example repo |
| `shift-ops-adapter-capability` | `shift-ops-worker` | current | total=2, current=2 | total=2, satisfied=2 | unchecked example repo |
| `shift-ops-artifact-export-policy` | `shift-ops-control-plane` | current | total=2, current=2 | total=2, satisfied=2 | unchecked example repo |
| `shift-ops-resource-surface` | `shift-ops-control-plane` | current | total=2, current=2 | total=2, satisfied=2 | unchecked example repo |
| `shift-ops-runbook` | `shift-ops-worker` | partial | no evidence declared | no acceptance criteria declared | unchecked example repo |

## Guardrails

1. `current` evidence means declared metadata posture, not verified external repo contents.
2. `unchecked` repos must stay visible in reports.
3. Reality validation must not remote clone or fetch implementation repos.
4. Evidence commands must not execute during validate / reality / fixture smoke.
5. Missing repo locators should become remediation planning, not silent pass.
