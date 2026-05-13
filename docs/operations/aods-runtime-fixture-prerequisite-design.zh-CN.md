# AODS runtime fixture prerequisite design

日期：2026-05-13
范围：U-492 到 U-501
状态：已完成；未实现 runtime / fixtures

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `0f1b0d5 Prepare public close and release readiness` |
| Task ledger | 通过 | 当前默认任务为 U-492 到 U-501 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## 设计原则

本轮只设计 fixture prerequisites，不新增 schema、validator、conformance case 或 runtime。所有候选 fixture 都必须满足：

1. 只检查 checked-in metadata，不执行 command、transition、remote call、migration 或 policy action。
2. 负例必须命中确定性 rule id，不能依赖模型判断或外部系统。
3. 先进入 focused regression；只有 packaged consumers 需要时，再提升到 conformance suite。
4. 每个 fixture 都要证明一个 runtime no-go 边界，而不是暗示 runtime 已存在。

## U-492 workflow lifecycle negative fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| invalid transition | transition uses a lifecycle alias such as `begin` instead of canonical `start` | `term-ref-*` / future `workflow-transition-*` | focused regression first |
| missing guard | transition changes state without guard / approval / freshness boundary | future `workflow-guard-required` | focused regression first |
| terminal restart | terminal state transitions back to active state without correction link | future `workflow-terminal-transition` | design only |

Do not implement scheduler, retry runtime, cleanup executor, or transition execution.

## U-493 workflow receipt audit fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| missing receipt | executable transition lacks command / receipt linkage | future `workflow-receipt-required` | focused regression first |
| missing audit anchor | transition has receipt but no actor/source/target/correlation evidence | future `workflow-audit-anchor-required` | focused regression first |
| dependency conflict | transition consumes a blocked dependency as if it were executable | future `workflow-dependency-conflict` | design only |

Best next implementation slice: reuse existing command / receipt / audit vocabulary instead of introducing workflow runtime fields first.

## U-494 event duplicate ordering fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| duplicate event id | two event declarations share the same event id under one subject | future `event-id-unique` | focused regression first |
| out-of-order without posture | event sequence declares an earlier event after a later event without conflict posture | future `event-ordering-posture-required` | design only |
| global clock claim | event ordering depends on global wall-clock certainty | future `event-global-ordering-unsupported` | design only |

Do not implement event store, replay engine, event bus, projection service, or exactly-once guarantees.

## U-495 event correction projection fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| correction missing target | correction references an event id that does not exist | future `event-correction-target` | focused regression first |
| supersession cycle | event A supersedes B while B supersedes A | future `event-supersession-cycle` | focused regression first |
| missing projection guidance | correction changes read-model meaning without projection guidance | future `event-projection-guidance-required` | design only |

Best next implementation slice: start with correction target and supersession cycle because they are static graph checks.

## U-496 policy decision negative fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| missing actor | decision input has operation and target but no actor ref | future `policy-actor-required` | focused regression first |
| missing target | decision input has actor and operation but no target ref | future `policy-target-required` | focused regression first |
| stale evidence | decision depends on expired evidence without review posture | future `policy-evidence-current-required` | design only |

Do not implement permission broker, IAM integration, approval workflow, or secret access.

## U-497 policy approval audit fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| missing approval receipt | high-risk operation claims allow without approval receipt | future `policy-approval-receipt-required` | focused regression first |
| missing audit anchor | decision has receipt but no audit anchor | future `policy-audit-anchor-required` | focused regression first |
| ambiguous decision | decision value mixes allow / review_required semantics | future `policy-decision-vocabulary` | design only |

Best next implementation slice: define a static policy decision fixture schema in test data before touching runtime concepts.

## U-498 remote exposure upgrade fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| local-only remote read | local-only surface is referenced as remote-readable | future `remote-exposure-upgrade-required` | focused regression first |
| remote write without receipt | remote-write surface lacks receipt / rollback / idempotency posture | future `remote-write-receipt-required` | focused regression first |
| missing auth boundary | remote-capable surface has no actor/token/scope boundary | future `remote-auth-boundary-required` | design only |

Do not implement remote gateway, auth runtime, rate limiter, network broker, or remote read/write.

## U-499 remote adapter mismatch fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| provider mismatch | consumer requirement demands a capability the provider does not declare | existing `capability-compatibility-*` / future `adapter-capability-mismatch` | focused regression first |
| runtime probing required | compatibility row can only be resolved by dynamic probing | future `adapter-runtime-probing-unsupported` | design only |
| missing rate/cost posture | remote adapter declares capability but no quota / budget posture | future `adapter-rate-cost-required` | design only |

Best next implementation slice: extend existing capability matrix regressions instead of creating a gateway runtime.

## U-500 migration dry-run report fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| missing source authority | dry-run report names target but not source authority/version | future `migration-source-authority-required` | focused regression first |
| missing mapping | dry-run report proposes changes without field/command/event mapping | future `migration-mapping-required` | focused regression first |
| unsupported semantic gap | dry-run report hides manual/unsupported cases | future `migration-semantic-gap-required` | design only |

Do not implement migration executor, file rewrite, schema rewrite, remote fetch, or destructive action.

## U-501 migration destructive approval fixture design

| Fixture | Broken contract | Expected rule family | Candidate target |
|---|---|---|---|
| destructive without approval | destructive change has no approval gate | future `migration-destructive-approval-required` | focused regression first |
| missing rollback posture | irreversible change lacks rollback / backup expectation | future `migration-rollback-posture-required` | focused regression first |
| executed disguised as dry-run | report claims changes already applied | future `migration-dry-run-only` | focused regression first |

Best next implementation slice: model dry-run report validation as static JSON fixture validation before any migration command exists.

## Recommended next implementation order

| Order | Candidate | Reason |
|---:|---|---|
| 1 | Event correction target / supersession cycle | Pure static graph checks, low coupling |
| 2 | Remote adapter mismatch | Builds on existing capability matrix |
| 3 | Migration dry-run report shape | Can remain pure JSON fixture |
| 4 | Policy actor/target/audit | Needs a small static decision shape |
| 5 | Workflow lifecycle/receipt | Highest risk of implying execution, keep last |

## 本轮结论

- Ten runtime prerequisite fixture designs are ready for candidate implementation review.
- The next round should decide which designs can become focused regressions.
- No runtime, scheduler, store, policy engine, gateway, migration executor, remote call, or destructive action was introduced.
