# AODS Approval Label Semantics Review

任务：U-149
状态：已完成
日期：2026-05-12
范围：human_approval / review / escalation label 语义一致性；不建立 approval workflow

## 目标

复核审批、复审、升级和阻断相关 label 的语义，避免后续出现同一动作被多个词表示，或同一词在不同 surface 上代表不同后果。

## 结论

当前 label 可以分为三层：risk taxonomy 中的 `human_approval` 描述“是否需要人介入”；policy decision 中的 `review_required` / `escalate` / `blocked` 描述“当前判断结果”；receipt 中的 `needs-review` 描述“本次检查输出”。这三层语义可兼容，但必须保持引用关系，不得互相替代。

## Label Semantics

| label | 所属层 | 语义 | 允许动作 |
|---|---|---|---|
| `human_approval` | risk taxonomy | 该 surface 或动作存在人工审批要求 | 作为风险字段消费，不自动创建审批流程 |
| `approval_required` | approval gate field | 当前 gate 需要审批 | 记录 reason、gate_level、approver_role |
| `review_required` | policy decision | 当前证据不足或需要复核 | 生成 needs-review receipt 或阻断继续执行 |
| `escalate` | policy decision | 当前 agent 权限 / 上下文不足 | 要求更明确授权，不自动通过 |
| `blocked` | policy decision | 明确不可继续 | 不执行，不生成 accepted receipt |
| `needs-review` | receipt status | 本次 validation outcome 等待复核 | 指向 policy decision 和 audit anchor |
| `expert-review` / `human-review` | docs / guidance | 描述复核路线或角色 | 只能作为指导，不等同批准结果 |

## Consistency Rules

| 规则 | 说明 |
|---|---|
| risk label 只描述风险 | `human_approval` 不代表已批准 |
| decision label 只描述判断 | `review_required` 和 `escalate` 不代表审批已发起 |
| receipt label 只描述输出 | `needs-review` 不代表后续有人处理 |
| approval gate 必须写 reason | 只写 “manual review” 不足以形成稳定消费面 |
| blocked 优先级最高 | 一旦明确 blocked，不应再用 softer label 弱化 |

## 当前问题和处理

| 观察 | 结论 |
|---|---|
| command receipt 使用 `needs-review` | 可接受；它是 receipt status，不是 policy decision value |
| policy triage 使用 `review_required` / `escalate` | 可接受；它们属于 decision posture |
| risk taxonomy 使用 `human_approval` | 可接受；它是 risk family |
| docs 中出现 expert / human review 描述 | 可接受；但只能作为 guidance，不能当作 machine decision |

## 非目标

- 不建立 approval workflow。
- 不实现 approver assignment、notification、queue 或 SLA。
- 不把 review label 自动转成允许执行。
- 不新增 schema 或 validator rule。
