# AODS projection guidance static guard implementation

日期：2026-05-13
范围：U-742 到 U-751
状态：完成

## 本轮结论

上一轮 provider discovery static guard 复审通过，无需返工。本轮补齐 event correction 的 projection guidance 静态保护：当 correction / supersession row 改变事件含义时，必须声明 `projection_guidance`，让消费者知道应保留、标记、阻断还是替换，而不是自行推断或触发 replay。

## 实现清单

| 任务 | 结果 | 证据 |
|---|---|---|
| U-742 Projection guidance existing coverage audit | confirmed compiled pilot already has `projection_guidance` column and values | `change-event-correction-graph` |
| U-743 Projection guidance missing negative fixture design | focused regression copies compiled pilot and removes guidance from corrected row | `route-validate-regression.test.mjs` |
| U-744 Projection guidance validator issue shape | added deterministic rule `event-projection-guidance-required` with remediation | `lib/validate.mjs` |
| U-745 Projection guidance focused regression | positive guidance rows + missing guidance negative case covered | focused test 6 tests pass |
| U-746 Projection guidance no-replay wording audit | remediation explicitly says “without replaying history”; README already says no event store / runtime | focused test / README audit |
| U-747 Projection guidance route query behavior | route query selects only `shift-ops-change-event-log`, skipped=10 | route query smoke |
| U-748 Projection guidance conformance promotion no-go | remains focused-regression-only | this doc |
| U-749 Projection guidance package sample boundary | package surface unchanged | package surface check |
| U-750 Projection guidance public issue sync decision | no GitHub comment; this is a narrow validator guard, not new runtime/protocol status | this doc |
| U-751 Projection guidance implementation retrospective | static guard value and boundary summarized here | this doc |

## 新增规则

| Rule | Level | 触发条件 | Remediation action |
|---|---|---|---|
| `event-projection-guidance-required` | L2 | `change-event-correction-graph` row has `correction_of` or `supersedes` but empty `projection_guidance` | `add-event-projection-guidance` |

## 非目标

1. 不实现 event store。
2. 不重放历史事件。
3. 不刷新 read model。
4. 不迁移历史数据。
5. 不判断当前事实。
6. 不进入 conformance suite。
7. 不扩大 package adoption surface。

## 验证

| 验证项 | 结果 |
|---|---|
| focused regression | 通过，6 tests |
| `npm run validate:compiled-pilot` | 通过，sections=23, artifacts=27 |
| route query smoke | 通过，`event correction projection guidance` 只选中 `shift-ops-change-event-log` |
| docs link check | 通过；markdown_files=212, missing_links=0 |
| package surface check | 通过；entry_count=61 |
| release hygiene | 通过；包含 docs links、security scan、package surface、package install smoke、generated clean、focused tests、validate:all |

## 下一轮建议

下一轮默认 U-752 到 U-761：进入 policy decision / workflow transition / migration dry-run 的边界清单、no-engine 文档审计、未来负例计划和 package boundary audit。
