# AODS Policy Decision Receipt Boundary Refinement

任务：U-148
状态：已完成
日期：2026-05-12
范围：policy decision、receipt、audit anchor 的字段边界；不实现 permission broker

## 目标

把 policy decision、receipt 和 audit anchor 的责任拆开，避免后续把“策略判断”“回执记录”“审计索引”混成同一个字段。本文是边界细化，不引入权限系统、审批运行时或执行器。

## 结论

policy decision 是“基于声明输入和策略上下文得出的判断摘要”；receipt 是“对一次命令或检查结果的可引用输出”；audit anchor 是“把 actor/source/target/decision/receipt 串起来的索引”。三者可以互相引用，但不能互相替代。

## Boundary Matrix

| 面 | 回答的问题 | 稳定字段 | 不能代表什么 |
|---|---|---|---|
| policy decision | 是否允许、拒绝、需要复审、升级或阻断 | decision、reason、risk_labels、gate、policy_ref、evidence_ref | 不代表命令已执行；不代表审批人已实际批准 |
| receipt | 这次命令 / 检查输出了什么结果 | receipt_id、command_id、status、policy_decision、audit_ref、correlation_id、emitted_at、reason | 不代表生产状态已改变；不替代 audit log |
| audit anchor | 如何追溯 actor/source/target/receipt | actor、source、target、policy_decision、receipt_reference、timestamp、correlation_identifier | 不保存完整事件流；不证明远程系统也记录了同一事实 |

## Decision Vocabulary

| 决策姿态 | 用法 | 后续动作 |
|---|---|---|
| allow | 静态条件满足，可继续到下一人工或技术 gate | 仍需 receipt / audit anchor |
| deny | 静态条件不满足 | 写明原因和阻断证据 |
| review_required | 需要人工或 owner 复核 | 不自动升级成 approval |
| escalate | 当前上下文无法自行判断，需要更高权限或更明确授权 | 保持 blocked until evidence |
| blocked | 明确不可继续 | 不执行，不创建成功 receipt |

## Receipt Status Boundary

| receipt status | 语义 | 与 policy decision 的关系 |
|---|---|---|
| accepted | 输入和前置条件通过，已生成接受回执 | 通常引用 allow，但仍不是执行完成证明 |
| rejected | 输入或策略检查失败，已生成拒绝回执 | 通常引用 deny 或 blocked |
| needs-review | 需要复审，已生成待复核回执 | 通常引用 review_required 或 escalate |

## Missing Pieces Kept Out

| 缺口 | 当前处理 |
|---|---|
| permission broker | 保持非目标；policy decision 不是真实权限授予 |
| approval workflow | 保持非目标；review_required 不自动创建审批任务 |
| executor receipt | 保持非目标；当前 receipt 只覆盖 validation outcome |
| durable audit backend | 保持非目标；audit anchor 只是规范引用点 |

## 验收结论

当前字段边界足以支撑 U-147 的 audit completeness，也足以为 U-149 的 approval label semantics 提供清晰基础。后续若要实现 policy engine PoC，必须先把 decision input/output schema、identity model 和 audit receipt contract 固化，而不能直接复用 receipt status 当权限结果。

## 非目标

- 不实现 permission broker。
- 不实现 policy engine。
- 不实现 approval workflow。
- 不执行命令或写入远程系统。
