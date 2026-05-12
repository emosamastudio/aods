# AODS Policy Engine Minimal PoC Decision Gate

任务：U-153
状态：已完成
日期：2026-05-12
范围：policy engine PoC 的 input/output、identity model、audit boundary；不实现 PoC

## Decision

当前结论：No-go for implementation。policy engine 只有在 policy decision 输入输出、actor/target identity、risk label、approval gate 和 audit receipt 都稳定后，才允许做最小 PoC。

## Candidate Input / Output

| 面 | 字段 | 说明 |
|---|---|---|
| input | actor_ref、source_surface、target_ref、operation、risk_labels、evidence_refs、approval_context | 只用 checked-in metadata，不读取真实权限系统 |
| output | decision、reason、gate、required_evidence、receipt_ref、audit_anchor | 输出 policy decision，不授予真实权限 |
| identity | actor kind、delegation、tenant/scope、target environment | 只声明边界，不校验真实身份 |

## Prerequisites

| Gate | 进入条件 |
|---|---|
| decision schema | allow / deny / review_required / escalate / blocked 语义稳定 |
| receipt boundary | receipt status 与 policy decision 的映射已文档化 |
| audit boundary | actor/source/target/policy/receipt/correlation 字段齐全 |
| approval labels | human_approval、review、escalation label 不混用 |
| negative fixtures | missing actor、missing target、missing approval receipt、stale evidence 可被识别 |
| public wording | 文档明确 “not a permission system” |

## Success Metrics

| 指标 | 通过标准 |
|---|---|
| deterministic decision | 相同 checked-in input 得到相同 decision |
| traceability | decision 能指向 evidence、receipt 和 audit anchor |
| no real permission | 不接入真实 IAM、token、secret 或 approval queue |
| explainable denial | deny / blocked / review_required 有可读 reason |

## Abort Criteria

| 条件 | 处理 |
|---|---|
| 需要真实身份系统才能判断 | abort |
| policy decision 被当成执行许可 | abort |
| approval workflow 语义不清 | abort |
| audit receipt 不能回链输入 snapshot | abort |

## 非目标

- 不实现 policy engine。
- 不实现 permission broker、approval workflow、IAM integration 或 secret access。
- 不把静态 decision 当成真实授权。
