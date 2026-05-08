# AODS v0.12 Backlog Triage

状态：U-073 已完成；U-075 已执行；U-077/U-078/U-079/U-080 已完成
日期：2026-05-08
适用范围：U-072 public docs navigation 后的 v0.12+ 后续路线；不实现新能力

## 北极星

AODS 继续作为独立的 agent-first 权威规范系统推进。v0.12+ 不应追求“大而全 runtime”，而应继续解决 AODS 自身的核心问题：让规范、实现位置、证据、验收、风险、公开文档和 GitHub backlog 的状态保持可审查、可验证、可发布。

## 结论

当前最高价值、最低风险路线不是立刻扩新 schema，也不是启动完整 runtime handshake。**U-074 release readiness gate 已完成**，**U-075 GitHub public sync 已执行**，**U-077 implementation evidence stale/current hygiene 已完成**，**U-078 capability compatibility metadata deterministic gates 已完成**，**U-079 route JSON explanation minimal enrichment 已完成**，**U-080 fixture / golden export smoke runner 已完成**。draft PR `#63` 已创建，已覆盖 issue 设置为 PR 合并时自动关闭，`#41/#59/#60` 已留言保留。下一步进入 source-first adoption guide。

v0.12 当前首选实现方向是 **source-first adoption guide for example packs**。理由是 U-080 已把 `#48` residual 收束为 `aods fixture smoke` 最小门禁，下一步应把 authoring source、compile、validate、route 和 fixture smoke 串成公开可读的采用路径，同时继续不重复 benchmark sync 区块、不夸大 coverage。

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
| `#58` external citation | OPEN，PR `#63` 合并时关闭 | U-061/U-065/U-066/U-067 + U-072 已覆盖 boundary/schema/validator/example/navigation | U-082 可做 stale citation hygiene |
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
| 7 | U-081 | P2 | public docs / adoption | source-first adoption guide for example packs | README / docs 指向从 authoring source 到 compile / validate / route / fixture smoke 的最小 adoption path；不重复 benchmark sync 区块 | 不写成营销页；不夸大 coverage |
| 8 | U-082 | P2 | citation hygiene | external citation stale/current hygiene report | declared authoritative citation 的 stale / assumption / unsupported posture 有更清晰 report 或 example；focused regression 或 docs gate 覆盖 | 不做 crawler、URL checker、fact checker |
| 9 | U-083 | P3 | ergonomics | changelog.delta length ergonomics review | 重新评估 `#13` 是否仍真实阻塞 release workflow；若不阻塞，只写 public response plan | 不因单字段 ergonomics 抢主线 |
| 10 | U-084 | P3 | research / boundary | runtime-boundary research spike | 梳理 workflow runtime、event store、policy engine、remote gateway、migration tool 的边界和进入条件 | 不实现 runtime |

## 下一轮推荐

1. 执行 U-081：source-first adoption guide for example packs。
2. 若 U-081 范围过大，降级到 U-082：external citation stale/current hygiene report。
3. PR `#63` 后续 ready / merge 前，复跑 final validation，并确认不把 `MEMORY.md` 纳入仓库。

## 非目标

1. 本轮不实现 U-077 到 U-084。
2. 不把 GitHub issue open 状态直接等同于本地未完成；必须区分本地覆盖、public sync 和 deferred runtime。
3. 不把 `#41` 的 full negotiation handshake、`#37` 的 workflow runtime、`#39` 的 event store、`#44` 的 policy engine 或 `#52` 的 migration tool 混进 v0.12 首轮。
4. 不触碰 Polaris sibling repo；AODS 仍按独立规范路线推进。
