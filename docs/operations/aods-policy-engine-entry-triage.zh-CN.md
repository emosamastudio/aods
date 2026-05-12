# AODS Policy Engine And Approval Runtime Triage

状态：U-088 已完成
日期：2026-05-12
范围：policy engine / approval runtime 的 entry contract；不实现 permission broker 或 approval workflow

## 结论

Policy engine 当前只能做输入输出边界 triage，不能进入实现。AODS 已经有 risk taxonomy、human approval、exposure class 和 audit metadata，但还没有 stable policy decision contract、identity model、override boundary、receipt shape 和 deterministic fixture matrix。

## 已有权威输入

| 输入 | 当前作用 |
|---|---|
| Risk taxonomy | 描述 read/write/credential/filesystem/network/cost/production mutation 等风险 |
| Exposure constraints | 描述 local-only、local-export、remote-read、remote-write、adapter-facing |
| Audit-log metadata | 描述 actor/source/target/policy decision/receipt/correlation |
| Capability compatibility gates | 描述 provider/consumer compatibility 的 deterministic metadata check |
| Validation severity / remediation | 提供 warning/error/gate 与修复建议 vocabulary |

## Entry Contract 必须补齐

| 领域 | 必填问题 | 失败姿态 |
|---|---|---|
| Decision input | actor、source、target、action、risk labels、exposure、freshness、redaction、capability posture | input 不完整时默认 review_required |
| Decision output | allow、deny、review_required、escalate、blocked 的稳定枚举和原因 | output 不明时不得执行 |
| Approval boundary | 哪些状态只是 label，哪些需要 human approval receipt | 无 receipt 时不得声称已批准 |
| Override policy | override 的 owner、reason、expiry、audit anchor | 无 expiry / owner 时禁止 override |
| Audit receipt | policy decision id、input snapshot、result、correlation id、timestamp | 无 receipt 时只允许 dry-run |
| Determinism | 同一输入是否必须得到同一输出；哪些字段可随环境变化 | 不确定时不得作为 blocking gate |
| Fixture set | allow、deny、review、escalate、missing input、override、stale evidence | fixture 不足时不得 PoC |

## Non-Goals

1. 不实现 permission broker。
2. 不实现 approval workflow、身份系统或通知系统。
3. 不做 dynamic risk scanner。
4. 不做 cost accounting runtime。
5. 不把 policy label 当成真实授权。

## PoC 进入条件

Policy engine PoC 只有在以下条件同时满足后才可进入 U-153：

1. policy decision input/output schema 已在 docs 或 schema planning 中稳定。
2. audit receipt 能引用 decision input snapshot 和 result。
3. negative fixtures 能阻断 missing actor、missing target、missing approval receipt 和 stale evidence。
4. public docs 明确它不是权限系统，也不是审批流。
