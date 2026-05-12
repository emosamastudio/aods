# AODS Workflow Runtime Entry Contract Triage

状态：U-086 已完成
日期：2026-05-12
范围：workflow runtime 的 entry contract；不实现 workflow engine

## 结论

Workflow runtime 当前只能进入 entry contract 设计，不能进入实现。AODS 已经能描述 lifecycle state machine、command / receipt、audit metadata 和 dependency ordering，但还没有 runtime 级对象身份、状态持久化、失败语义、fixture 组合和公开承诺边界。

## 已有权威输入

| 输入 | 当前作用 |
|---|---|
| Lifecycle state-machine profile | 描述 initial / terminal state、transition、guard、timeout、retry、cancel、cleanup |
| Command / receipt / event triad | 描述 write-capable surface 的 command、receipt、event/projection linkage |
| Audit-log metadata | 描述 actor、source、target、idempotency、policy decision、receipt、correlation |
| Dependency ordering | 描述 requires、blocks、derives_from、emits、consumes 等静态关系 |
| Implementation evidence / acceptance criteria | 描述 current/planned/stale evidence 和验收姿态 |

## Entry Contract 必须补齐

| 领域 | 必填问题 | 失败姿态 |
|---|---|---|
| Object identity | runtime 操作的 workflow object 如何绑定 authority surface 和 stable id | 无 identity 时不得执行 |
| State source | 当前状态来自 checked-in corpus、runtime store 还是外部系统 | 未声明时只能只读诊断 |
| Transition semantics | transition 的 guard、precondition、postcondition 和 terminal behavior 如何表达 | guard 不完整时禁止自动推进 |
| Command boundary | 哪些 transition 会触发 command，receipt 怎么回写或引用 | 无 receipt anchor 时禁止声称已执行 |
| Retry / timeout / cancel | retry 上限、timeout、cancel、cleanup 的可审查策略 | 未声明时按 manual review 处理 |
| Dependency ordering | dependency conflict、blocked state、optional dependency 的 runtime 处理 | 冲突时停止，不自动重排 |
| Audit linkage | actor/source/target/policy/correlation 怎么形成 receipt | 无 audit receipt 时不得进入 stable runtime |
| Fixture set | positive transition、invalid transition、timeout、cancel、blocked dependency fixture | fixture 不足时不得 PoC |

## Non-Goals

1. 不实现 workflow engine。
2. 不实现 scheduler、queue、retry runtime 或 cleanup executor。
3. 不把 lifecycle metadata 直接解释成可执行状态机。
4. 不写跨仓库 workflow runtime，也不执行 arbitrary command。
5. 不承诺 exactly-once transition 或 durable state store。

## PoC 进入条件

Workflow runtime PoC 只有在以下条件同时满足后才可进入 U-151：

1. 至少一个 canonical workflow object 有完整 object identity、state source、transition 和 receipt contract。
2. negative fixtures 能阻断 invalid transition、missing guard、missing receipt 和 dependency conflict。
3. validate / fixture smoke 的输出能解释为什么一个 workflow 只读、可执行、blocked 或需要人工确认。
4. PR / release notes 明确 PoC 范围，不把它描述成通用 workflow engine。
