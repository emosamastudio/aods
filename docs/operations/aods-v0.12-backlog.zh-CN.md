# AODS v0.12 Backlog Triage

状态：U-073 已完成；U-075 已执行；U-077/U-078/U-079/U-080/U-081/U-082/U-083/U-084/U-092 已完成
日期：2026-05-08
适用范围：U-072 public docs navigation 后的 v0.12+ 后续路线；不实现新能力

## 北极星

AODS 继续作为独立的 agent-first 权威规范系统推进。v0.12+ 不应追求“大而全 runtime”，而应继续解决 AODS 自身的核心问题：让规范、实现位置、证据、验收、风险、公开文档和 GitHub backlog 的状态保持可审查、可验证、可发布。

## 结论

当前最高价值、最低风险路线不是立刻扩新 schema，也不是启动完整 runtime handshake。**U-074 release readiness gate 已完成**，**U-075 GitHub public sync 已执行**，**U-077 implementation evidence stale/current hygiene 已完成**，**U-078 capability compatibility metadata deterministic gates 已完成**，**U-079 route JSON explanation minimal enrichment 已完成**，**U-080 fixture / golden export smoke runner 已完成**，**U-081 source-first adoption guide 已完成**，**U-082 external citation hygiene report 已完成**，**U-083 changelog delta ergonomics review 已完成**，**U-084 runtime-boundary research spike 已完成**。draft PR `#63` 已创建，已覆盖 issue 设置为 PR 合并时自动关闭，`#41/#59/#60` 已留言保留。

v0.12 的剩余 validation/reporting hardening 已收束。U-084 之后，S13 当前首选方向是 **runtime readiness gate matrix**：先把 workflow runtime、event store、policy engine、remote gateway、migration tool 统一映射到 authority、evidence、risk、fixture 和 public sync gate，再决定是否逐类做 entry contract triage。U-092 已把长期任务池扩展到 U-160，并把后续执行规则改为每轮质量复审通过后选择 10 个未完成任务；少于 10 个时全选。

## GitHub 输入快照

| Issue | 当前公开状态 | 本地覆盖 | v0.12 判断 |
|---|---|---|---|
| `#33` command / receipt / event triad | OPEN，PR `#63` 合并时关闭 | U-035 + U-052 已覆盖最小边界和 canonical example | 不重复实现 executor / event bus |
| `#35` read-model freshness | OPEN，PR `#63` 合并时关闭 | U-032 + U-051 已覆盖 freshness / watermark 和 example；U-077 已补 implementation evidence stale/current hygiene | citation stale hygiene 可由 U-082 承接 |
| `#37` lifecycle state machines | OPEN，PR `#63` 合并时关闭 | U-045 已覆盖 spec boundary | workflow runtime 继续 deferred |
| `#38` decision provenance | OPEN，PR `#63` 合并时关闭 | U-031 + U-067 已覆盖 decision provenance refs 和 citation refs | full provenance store deferred |
| `#39` correction / supersession | OPEN，PR `#63` 合并时关闭 | U-036 + U-053 已覆盖 event correction example | event store/replay deferred |
| `#41` capability negotiation | OPEN，已留言 | U-034 + U-054 覆盖 metadata-only matching boundary；U-078 已补 deterministic compatibility gates | 保持 open；full handshake/discovery/auth/fallback ranking 继续 deferred |
| `#43` drift remediation workflow | OPEN，PR `#63` 合并时关闭 | U-030 已覆盖 validator remediation guidance | approval workflow deferred |
| `#44` risk taxonomy | OPEN，PR `#63` 合并时关闭 | U-042 已覆盖 spec boundary | runtime policy engine deferred |
| `#45` audit log | OPEN，PR `#63` 合并时关闭 | U-044 + U-052/U-054 已覆盖 commands/adapters audit vocabulary | audit store deferred |
| `#46` local/remote exposure | OPEN，PR `#63` 合并时关闭 | U-043 + U-054/U-058 已覆盖 exposure vocabulary and examples | remote gateway deferred |
| `#47` known gaps | OPEN，PR `#63` 合并时关闭 | U-037 已覆盖 partial implementation / known-gap vocabulary | roadmap runtime deferred |
| `#48` fixture / golden export | OPEN，PR `#63` 合并时关闭 | U-033 + example fixture manifests 已覆盖 conventions；U-080 已补 minimal fixture smoke runner | 完整 conformance runner / automatic golden update deferred |
| `#49` implementation acceptance criteria | OPEN，PR `#63` 合并时关闭 | U-029 + U-051/U-052/U-054/U-058 已覆盖 criteria linkage and examples | test executor deferred |
| `#50` authority hierarchy | OPEN，PR `#63` 合并时关闭 | U-038 已覆盖 overlap / canonical / derived / alias vocabulary | conflict resolver deferred |
| `#51` dependency ordering | OPEN，PR `#63` 合并时关闭 | U-039 已覆盖 dependency vocabulary | scheduler deferred |
| `#52` deprecation / migration | OPEN，PR `#63` 合并时关闭 | U-040 已覆盖 migration vocabulary | automatic migration deferred |
| `#54` density rules | OPEN，PR `#63` 合并时关闭 | U-049 + U-072 已覆盖 guidance and public navigation | 等待 PR review / merge |
| `#55` sync quality metrics | OPEN，PR `#63` 合并时关闭 | U-048 已覆盖 quality dimensions | new diff engine deferred |
| `#56` canonical examples | OPEN，PR `#63` 合并时关闭 | U-051 到 U-055、U-058、U-072 已覆盖六类 surface pack navigation | 等待 PR review / merge |
| `#57` glossary registry | OPEN，PR `#63` 合并时关闭 | U-060/U-062/U-063/U-064 + U-072 已覆盖 boundary/schema/validator/example/navigation | 等待 PR review / merge |
| `#58` external citation | OPEN，PR `#63` 合并时关闭 | U-061/U-065/U-066/U-067 + U-072 + U-082 已覆盖 boundary/schema/validator/example/navigation/hygiene report | 等待 PR review / merge；不做 crawler/fact checker |
| `#59` validation/routing observability | OPEN，已留言 | U-046 覆盖 spec vocabulary；U-076 补 route help；U-079 已补 route JSON explanation | 完整 observability runtime deferred |
| `#60` umbrella roadmap | OPEN，已留言 | v0.7-v0.11 多数 foundation/mechanics 已本地完成 | 保持 open；作为 public roadmap tracker |

## v0.12+ 推荐任务池

| 顺序 | 建议任务 ID | 优先级 | 类型 | 目标 | 验收标准 | 非目标 |
|---:|---|---|---|---|---|---|
| 1 | U-074 | P1 | release gate | 执行 v0.11 累积变更 release readiness gate | 已完成：`release:self-check`、package dry-run、diff hygiene、release notes skeleton 通过 | 不发布 release |
| 2 | U-075 | P1 | public sync | 执行 GitHub issue / PR / release public sync | 已完成：draft PR `#63`、issue close-on-merge 关联、`#41/#59/#60` 留言、未发布 release | 不把 deferred runtime issue 误关 |
| 3 | U-077 | P1 | validation hardening | implementation evidence stale/current hygiene | 已完成：evidence status counters、stale/missing-current warning remediation、focused regression、`validate:all` | 不执行 evidence command；不做行为 oracle |
| 4 | U-078 | P1 | validator / capability | capability compatibility metadata deterministic gates | 已完成：mapping-table matrix、mismatch validator gate、canonical compatible/incompatible example、focused regression | 不做 handshake、discovery、auth、fallback ranking |
| 5 | U-079 | P2 | CLI observability | validate / route JSON explanation minimal enrichment | 已完成：`route --json` 输出 `explanation.source/reason/dependency`；focused regression 覆盖 | 不重写 CLI output subsystem；不建 dashboard |
| 6 | U-080 | P2 | fixture tooling | fixture / golden export smoke runner | 已完成：`aods fixture smoke` 可读取 example fixture manifest 并验证 expected outcome 与 input/golden path | 不做完整 conformance runner 或自动 golden update |
| 7 | U-081 | P2 | public docs / adoption | source-first adoption guide for example packs | 已完成：README / docs 指向从 authoring source 到 compile / validate / route / fixture smoke 的最小 adoption path | 不写成营销页；不夸大 coverage |
| 8 | U-082 | P2 | citation hygiene | external citation stale/current hygiene report | 已完成：`validate` / `validate --json` 输出 declared citation posture counters；focused regression 覆盖 | 不做 crawler、URL checker、fact checker |
| 9 | U-083 | P3 | ergonomics | changelog.delta length ergonomics review | 已完成：`#13` 有效但不阻塞当前 release workflow；已写 public response plan | 不因单字段 ergonomics 抢主线 |
| 10 | U-084 | P3 | research / boundary | runtime-boundary research spike | 已完成：梳理 workflow runtime、event store、policy engine、remote gateway、migration tool 的边界和进入条件 | 不实现 runtime |
| 11 | U-085 | P2 | docs / boundary | runtime readiness gate matrix | 将五类 runtime 候选映射到 authority、evidence、risk、fixture、public sync gate | 不实现 runtime |
| 12 | U-086 | P2 | boundary triage | workflow runtime entry contract triage | 明确 lifecycle / command / audit / dependency 前置条件和 workflow non-goals | 不实现 workflow engine |
| 13 | U-087 | P2 | boundary triage | event store and replay contract triage | 明确 event identity、ordering、retention、replay、correction projection 前置条件 | 不实现 event store |
| 14 | U-088 | P2 | boundary triage | policy engine and approval runtime triage | 明确 risk label 到 policy decision input/output、audit receipt 和 approval boundary | 不实现 permission broker 或 approval workflow |
| 15 | U-089 | P2 | boundary triage | remote gateway / adapter runtime triage | 明确 exposure upgrade、auth、transport、audit、compatibility 前置条件 | 不实现 remote gateway |
| 16 | U-090 | P3 | boundary triage | migration tool entry contract triage | 明确 source/target authority、dry-run、rollback、mapping、destructive-change approval 边界 | 不实现 migration executor |
| 17 | U-091 | P1 | release / public sync | PR final readiness / public sync closeout | final validation、PR ready / merge 决策、close-on-merge issue 检查、version / release decision 明确 | 未获 owner 明确指令前不 merge、不 release |
| 18 | U-092 | P0 | planning | comprehensive task backlog and 10-task execution rule | 已完成：综合任务池扩展到 U-160；后续每轮复审通过后按顺序选 10 个任务 | 不实现新能力 |

## 下一轮推荐

1. 下一轮固定选择 10 个任务：U-085、U-086、U-087、U-088、U-089、U-090、U-091、U-093、U-094、U-095。
2. PR `#63` 后续 ready / merge 前，U-091 只能先完成 readiness / dry-run / decision record；真正 merge / release 需要当前回合明确授权。
3. `#13` 保持 P3 open；除非后续 release workflow 被实际阻塞，否则只按 U-134/U-135 路线处理。

## 非目标

1. U-084 已完成但不代表任何 runtime 已实现；后续仍必须先走 U-085 readiness gate。
2. 不把 GitHub issue open 状态直接等同于本地未完成；必须区分本地覆盖、public sync 和 deferred runtime。
3. 不把 `#41` 的 full negotiation handshake、`#37` 的 workflow runtime、`#39` 的 event store、`#44` 的 policy engine 或 `#52` 的 migration tool 混进 v0.12 首轮。
4. 不触碰 Polaris sibling repo；AODS 仍按独立规范路线推进。
5. 不用每轮 10 任务规则跳过上一轮质量审查；质量不合格时只返工。
