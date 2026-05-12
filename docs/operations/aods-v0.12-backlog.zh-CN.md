# AODS v0.12 Backlog Triage

状态：U-073 已完成；U-075 已执行；U-077/U-078/U-079/U-080/U-081/U-082/U-083/U-084/U-085-U-125 已完成；U-092 已完成
日期：2026-05-12
适用范围：U-072 public docs navigation 后的 v0.12+ 后续路线；不实现新能力

## 北极星

AODS 继续作为独立的 agent-first 权威规范系统推进。v0.12+ 不应追求“大而全 runtime”，而应继续解决 AODS 自身的核心问题：让规范、实现位置、证据、验收、风险、公开文档和 GitHub backlog 的状态保持可审查、可验证、可发布。

## 结论

当前最高价值、最低风险路线不是立刻扩新 schema，也不是启动完整 runtime handshake。**U-074 release readiness gate 已完成**，**U-075 GitHub public sync 已执行**，**U-077 implementation evidence stale/current hygiene 已完成**，**U-078 capability compatibility metadata deterministic gates 已完成**，**U-079 route JSON explanation minimal enrichment 已完成**，**U-080 fixture / golden export smoke runner 已完成**，**U-081 source-first adoption guide 已完成**，**U-082 external citation hygiene report 已完成**，**U-083 changelog delta ergonomics review 已完成**，**U-084 runtime-boundary research spike 已完成**，**U-085 到 U-090 runtime readiness / entry contract triage 已完成**，**U-091/U-093/U-094/U-095 PR / release readiness docs 已完成**，**U-096 到 U-105 package / release / drift evidence docs 已完成**，**U-106 到 U-115 drift workflow / fixture coverage docs 已完成**，**U-116 到 U-125 fixture output / examples / benchmark hygiene / CLI validation docs 已完成**。draft PR `#63` 已创建，已覆盖 issue 设置为 PR 合并时自动关闭，`#41/#59/#60` 已留言保留。

v0.12 的剩余 validation/reporting hardening 已收束。U-085 到 U-090 已确认 workflow runtime、event store、policy engine、remote gateway、migration tool 当前均不应直接实现；后续若推进，只能先走 PoC decision gate。U-096 到 U-105 已确认 package inventory / install smoke / release candidate 技术门禁通过，但 PR `#63` 仍保持 draft，当前不 merge、不 release、不 bump version。U-106 到 U-115 已确认 evidence refresh、locator remediation、non-execution invariant、fixture coverage 和 golden drift 边界。U-116 到 U-125 已确认 fixture smoke output contract、example pack gaps、compile determinism、schema mirror、seven-plane freshness、open-source scenarios、benchmark generated hygiene、CLI help coverage、validate JSON docs 和 text/JSON parity。U-092 已把长期任务池扩展到 U-160，并把后续执行规则改为每轮质量复审通过后选择 10 个未完成任务；少于 10 个时全选。下一批固定选择 U-126 到 U-135。

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
| 11 | U-085 | P2 | docs / boundary | runtime readiness gate matrix | 已完成：五类 runtime 候选映射到 authority、evidence、risk、fixture、public sync gate | 不实现 runtime |
| 12 | U-086 | P2 | boundary triage | workflow runtime entry contract triage | 已完成：lifecycle / command / audit / dependency 前置条件和 workflow non-goals 明确 | 不实现 workflow engine |
| 13 | U-087 | P2 | boundary triage | event store and replay contract triage | 已完成：event identity、ordering、retention、replay、correction projection 前置条件明确 | 不实现 event store |
| 14 | U-088 | P2 | boundary triage | policy engine and approval runtime triage | 已完成：risk label 到 policy decision input/output、audit receipt 和 approval boundary 明确 | 不实现 permission broker 或 approval workflow |
| 15 | U-089 | P2 | boundary triage | remote gateway / adapter runtime triage | 已完成：exposure upgrade、auth、transport、audit、compatibility 前置条件明确 | 不实现 remote gateway |
| 16 | U-090 | P3 | boundary triage | migration tool entry contract triage | 已完成：source/target authority、dry-run、rollback、mapping、destructive-change approval 边界明确 | 不实现 migration executor |
| 17 | U-091 | P1 | release / public sync | PR final readiness / public sync closeout | 已完成：PR 仍为 draft；reviews/checks 为空；本轮不 merge、不 release、不 bump | 未获 owner 明确指令前不 merge、不 release |
| 18 | U-092 | P0 | planning | comprehensive task backlog and 10-task execution rule | 已完成：综合任务池扩展到 U-160；后续每轮复审通过后按顺序选 10 个任务 | 不实现新能力 |
| 19 | U-093 | P1 | release / public sync | PR review response matrix | 已完成：PR review、covered issue、deferred issue 状态形成矩阵 | 不改代码、不关闭 issue |
| 20 | U-094 | P1 | release planning | version bump and changelog route triage | 已完成：下一 release 前必须 version bump、tag、changelog entry、README version surface | 不直接 bump、不发布 |
| 21 | U-095 | P1 | release docs | release notes completeness pass | 已完成：release note skeleton 覆盖 major changes、non-goals、known deferred runtime、validation evidence | 不发布 release |
| 22 | U-096 | P2 | packaging | package artifact inventory guard update | 已完成：pack dry-run JSON 清单 51 files / 207.5 kB 已审查 | 不改 package strategy |
| 23 | U-097 | P2 | packaging smoke | install smoke from packed tarball | 已完成：本地 tarball install、CLI help、strict validation、fixture smoke 通过 | 不发布 npm |
| 24 | U-098 | P2 | public sync | public issue close-on-merge audit | 已完成：PR body close list 与本地覆盖矩阵一致；deferred refs 保持 open | 不提前关闭 issue |
| 25 | U-099 | P2 | public sync | post-merge public state reconciliation plan | 已完成：merge 后 issue、release、docs、branch cleanup 顺序明确 | 不实际 merge |
| 26 | U-100 | P1 | release gate | v0.12 release candidate gate | 已完成：release:self-check、package inventory、install smoke 通过；public release no-go | 不发布 release |
| 27 | U-101 | P1 | release dry-run | release execution playbook dry run | 已完成：授权后发布步骤、conflict checks、rollback guidance 明确 | 不创建 release |
| 28 | U-102 | P2 | retrospective | post-release retrospective and next milestone triage | 已完成：release 后复盘模板和 next milestone 候选明确 | 不替代实际 release |
| 29 | U-103 | P1 | drift / evidence | implementation evidence locator matrix v2 | 已完成：repo/path/evidence locator 与 unchecked posture 已入账 | 不 remote clone |
| 30 | U-104 | P1 | drift / evidence | acceptance criteria coverage report | 已完成：14 criteria、13 satisfied、1 planned、all evidence-ref 已入账 | 不执行 arbitrary command |
| 31 | U-105 | P1 | drift / evidence | contract requirement to evidence trace report | 已完成：requirement -> criteria -> evidence -> locator trace boundary 已定义 | 不做 semantic oracle |
| 32 | U-106 | P2 | drift workflow | stale evidence refresh workflow boundary | 已完成：owner、trigger、validation gate、manual review path 已定义 | 不自动刷新外部证据 |
| 33 | U-107 | P2 | drift remediation | missing reality locator remediation plan | 已完成：unchecked repo locator 修复顺序已定义 | 不 fetch sibling repo |
| 34 | U-108 | P2 | topology | implementation repo locator normalization | 已完成：path / URL / descriptive-only locator 边界已定义 | 不改变 root topology semantics |
| 35 | U-109 | P2 | report | current vs planned implementation summary guard | 已完成：current/planned/stale/blocked report guard 已定义 | 不强制 planned 变 current |
| 36 | U-110 | P2 | safety invariant | evidence command non-execution invariant test | 已完成：fixture smoke non-execution regression 已落，non-execution invariant 已入账 | 不引入 executor |
| 37 | U-111 | P3 | observability | implementation drift dashboard boundary triage | 已完成：未来 dashboard 静态输入和非目标已定义 | 不建 dashboard |
| 38 | U-112 | P3 | governance | code ownership mapping boundary triage | 已完成：owner authority、path、review owner、fallback 边界已定义 | 不自动推断 owner |
| 39 | U-113 | P1 | fixtures | fixture manifest coverage matrix | 已完成：9 positive、0 negative、9 golden coverage 已入账 | 不补全部 fixture |
| 40 | U-114 | P2 | fixtures | negative fixture expansion plan | 已完成：下一批 high-value negative fixtures 已排序 | 不一次性扩全量 |
| 41 | U-115 | P2 | golden export | golden export drift report | 已完成：golden diff 检测、人工接受/拒绝边界已定义 | 不自动接受 golden diff |
| 42 | U-116 | P2 | fixture tooling | fixture smoke output contract snapshot | 已完成：JSON / text 输出字段已固化，机器消费优先 JSON | 不扩成 conformance runner |
| 43 | U-117 | P2 | examples | example pack gap audit after PR review | 已完成：PR 当前无 review/check；example pack gap matrix 已入账 | 不新增示例包 |
| 44 | U-118 | P2 | compile determinism | source-first compile determinism report | 已完成：compiled-pilot 连续两次 compile 后无 diff | 不改 authoring semantics |
| 45 | U-119 | P2 | schema mirror | compiled pilot schema mirror audit | 已完成：compiled-pilot schema 与 root schema SHA 一致 | 不手改 generated schema |
| 46 | U-120 | P3 | example maintenance | seven-plane pilot freshness review | 已完成：strict pass；保留为旧核心结构示例 | 不重写 pilot |
| 47 | U-121 | P3 | benchmark | open-source scenario pack health review | 已完成：scenario / corpus fixture 统计和维护成本已入账 | 不新增外部依赖 |
| 48 | U-122 | P2 | benchmark hygiene | benchmark generated artifact hygiene policy | 已完成：generated / reports churn 接受和恢复规则已定义 | 不默认提交 churn |
| 49 | U-123 | P2 | CLI DX | CLI help coverage for all subcommands | 已完成：所有子命令 help coverage 有 focused regression | 不重写 CLI parser |
| 50 | U-124 | P2 | validation docs | validate JSON report schema documentation | 已完成：base report、topology、citation 字段契约已文档化 | 不新增 schema file |
| 51 | U-125 | P2 | validation parity | validate text/JSON parity audit | 已完成：text / JSON parity matrix 和保留差异已明确 | 不大改输出 |

## 下一轮推荐

1. 下一轮固定选择 10 个任务：U-126、U-127、U-128、U-129、U-130、U-131、U-132、U-133、U-134、U-135。
2. PR `#63` 后续 ready / merge 前，package inventory、install smoke、close-on-merge audit、release candidate gate 和 release playbook dry run 已有当前证据；真正 merge / release 仍需要当前回合明确授权。
3. `#13` 保持 P3 open；除非后续 release workflow 被实际阻塞，否则只按 U-134/U-135 路线处理。

## 非目标

1. U-084 到 U-090 已完成但不代表任何 runtime 已实现；后续仍必须先走 U-151 到 U-155 的 PoC decision gate。
2. 不把 GitHub issue open 状态直接等同于本地未完成；必须区分本地覆盖、public sync 和 deferred runtime。
3. 不把 `#41` 的 full negotiation handshake、`#37` 的 workflow runtime、`#39` 的 event store、`#44` 的 policy engine 或 `#52` 的 migration tool 混进 v0.12 首轮。
4. 不触碰 Polaris sibling repo；AODS 仍按独立规范路线推进。
5. 不用每轮 10 任务规则跳过上一轮质量审查；质量不合格时只返工。
