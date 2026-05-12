# Current vs Planned Implementation Summary Guard

任务：U-109
状态：已完成
日期：2026-05-12

## 目标

明确 current / planned / stale / blocked implementation posture 在 report 中如何解释，避免把 planned 误当 failure，也避免 current 没有 current evidence 时静默通过。

## 当前示例摘要

| 指标 | 值 |
|---|---:|
| linked modules | 8 |
| modules with evidence | 7 |
| modules without evidence | 1 |
| evidence total | 14 |
| current evidence | 13 |
| planned evidence | 1 |
| stale evidence | 0 |
| blocked evidence | 0 |
| acceptance criteria total | 14 |
| satisfied criteria | 13 |
| planned criteria | 1 |

## Guard 规则

| Posture | 允许性 | Gate |
|---|---|---|
| current implementation + current evidence | 允许 | pass |
| current implementation + planned evidence | 允许但必须可见 | summary 计入 planned |
| current implementation + no current evidence | warning；strict 下阻断 | `implementation-current-evidence-missing` |
| stale evidence | warning；strict 下阻断 | `implementation-evidence-stale` |
| blocked / partial / waived blocking criterion | error | `implementation-acceptance-criteria-blocking-unsatisfied` |
| manual review criterion | warning；strict 下阻断 | `implementation-acceptance-criteria-manual-review` |

## 当前例外

`shift-ops-policy` 有 1 条 planned evidence 和 1 条 planned acceptance criterion。这个状态不等同于失败，但 release/readiness 文档必须继续把它显示为 planned，不能在摘要中合并进 current。

`shift-ops-runbook` 是 partial implementation，当前没有 evidence summary / acceptance summary。它不能被展示成 current coverage。

## Report 要求

1. 所有 implementation summary 必须分开展示 current、planned、stale、blocked。
2. planned 不能被用于证明 current readiness。
3. stale 不能被自动刷新；必须走 U-106 workflow。
4. partial module 不能和 current module 混在同一个 readiness 计数里。

## 非目标

- 不要求所有 planned 立即变 current。
- 不把 manual-review 全部禁止；但必须显示 warning debt。
- 不把 dashboard 汇总作为唯一 release gate。
