# AODS 扩展任务池与批量执行计划

状态：当前执行计划
日期：2026-05-12
适用范围：U-058 resource surface example pack 之后的 v0.11+ / S13 迭代

## 目标

在不破坏“每轮先审查上一轮质量”的前提下，把后续工作从单任务线性推进扩展为可批量执行的任务池。U-092 后，默认执行批次固定为 10 个未完成任务；如果未完成任务少于 10 个，则选择全部。综合任务池详见 `aods-comprehensive-task-plan.zh-CN.md`。

## 批量执行规则

| 规则 | 内容 |
|---|---|
| 质量门禁优先 | 每轮开始必须先复核上一轮成果；发现问题时只做返工和再审查，不推进新任务 |
| 批量准入 | 同轮任务必须共享同一目标阶段、互不覆盖关键语义边界、验证命令可以覆盖合并 diff |
| 默认批量规模 | 每轮质量复审通过后选择 10 个未完成任务；若未完成任务少于 10 个则全部选择 |
| 任务入账 | 所有候选任务先进入 `aods-task-ledger.zh-CN.md`，再进入当前回合锁定记录 |
| 非目标保护 | 批量执行不得把 boundary triage 和 runtime/schema 实现混在一起，除非台账中已明确依赖和验收标准 |
| 外部写操作 | issue comment、issue close、PR、release、merge、破坏性迁移均需当前回合明确授权；可先完成 readiness / dry-run / decision record |

## 当前任务池

| 任务 ID | 阶段 | 类型 | 优先级 | 批量建议 | 任务 | 验收标准 |
|---|---|---|---|---|---|---|
| U-060 | S10 | boundary triage | P1 | 已完成 | 裁剪 glossary / canonical-term registry v2 boundary | 已明确 `manifest.glossary` v1 兼容策略、v2 record 最小字段、deterministic validator gates 和 U-062/U-063/U-064 后续任务 |
| U-061 | S10 | boundary triage | P1 | 已完成 | 裁剪 external citation / provenance metadata boundary | 已明确 internal provenance / decision_provenance / external citation 分工、module-level citation registry、citation refs、stable consumption gates 和 U-065/U-066/U-067 后续任务 |
| U-062 | S10 | schema / compile | P1 | 已完成 | 落地 glossary registry v2 最小 schema 与 authoring compile mirror | root / companion / authoring glossary 支持 v1 string shorthand 与 v2 canonical term record；source-first regression 覆盖 mirror |
| U-063 | S10 | validator | P1 | 已完成 | 落地 glossary registry validator gates | `term_id` key match、alias collision、deprecated replacement missing、linked surface ref missing 均有 deterministic gate；不做自然语言术语扫描 |
| U-064 | S10 | example / regression | P2 | 已完成 | 增加 glossary registry canonical example pack | compiled-pilot source-first example、compiled output、fixture manifest、focused regression 展示 canonical/alias/deprecated term |
| U-065 | S10 | schema / compile | P1 | 已完成 | 落地 external citation metadata 最小 schema | module-level `external_citations[]` 与 local `citation_refs[]` 已进入 module schema；source-first regression 覆盖 compile mirror |
| U-066 | S10 | validator | P1 | 已完成 | 落地 external citation validator gates | citation id unique、citation ref resolution、authoritative completeness、assumption posture、stable currentness 均有 deterministic gate |
| U-067 | S10 | example / regression | P2 | 已完成 | 增加 external citation / provenance canonical example pack | compiled-pilot example 已展示 current external authority、internal decision provenance、unsupported assumption 分界；fixture 与 focused regression 覆盖 |
| U-068 | S11 | public sync triage | P2 | 已完成 | 复盘 GitHub issue 本地覆盖与公开状态差异 | `#54-#58`、`#60/#41` 本地覆盖与公开状态矩阵已完成；不执行公开写操作 |
| U-069 | S11 | drift planning | P1 | 已完成 | 选择下一段代码漂移最小切片 | 已选择 U-071 implementation reality locator drift hardening；排除全量代码扫描器 |
| U-070 | S11 | docs / routing | P2 | 已完成 | 复盘 boot-by-touch / route discoverability 残留 | `#9/#10/#17` 保持 closed；新增 U-076 route help / smoke test 残留任务 |
| U-071 | S11 | validation hardening | P1 | 已完成 | 强化 implementation reality locator drift 检查 | `validate --reality --json` 已输出 structured `topology.unchecked_repos[]` 与 actionable `unchecked_reason`；focused regression + `validate:all` |
| U-072 | S11 | docs / examples | P2 | 已完成 | 更新 public docs navigation for completed example packs | README/operations 已指向 source-first pilot、六类 example pack、glossary registry、external citation / provenance 示例；benchmark sync 区块未手改 |
| U-073 | S11 | backlog triage | P2 | 已完成 | 制定 v0.12 backlog triage | 已将 `#33/#35/#37/#38/#39/#43-#52/#59/#60` 重新分类到 public sync、covered local、deferred runtime 与 v0.12+ 新任务池；未实现新能力 |
| U-074 | S11 | release gate | P1 | 已完成 | 执行 v0.11 累积变更 release readiness gate | `release:self-check`、package dry-run、diff hygiene、release notes skeleton 已通过；不发布 release |
| U-075 | S11 | public sync | P1 | 已完成 | GitHub issue / PR / release public sync execution | PR `#63` 已创建为 draft；已覆盖 issue 设置为 close-on-merge；`#41/#59/#60` 已留言保留；未发布 release |
| U-076 | S11 | route DX | P2 | 已完成 | 增加 route 子命令 help / discoverability smoke test | `node ./bin/aods.mjs route --help` 输出 route 用法、stage、intent；focused CLI regression 覆盖；不改变 route ranking |
| U-077 | S12 | validation hardening | P1 | 已完成 | Implementation evidence stale/current hygiene | `validate --reality` 输出 evidence status counters；stale / missing-current evidence warning 有 remediation；focused regression + `validate:all` 通过 |
| U-078 | S12 | validator / capability | P1 | 已完成 | Capability compatibility metadata deterministic gates | capability compatibility mapping-table 可表达 compatible / incompatible rows；validator 检查 capability id、profile、schema version policy、exposure class 与 expected_result 是否一致 |
| U-079 | S12 | CLI observability | P2 | 已完成 | Validate / route JSON explanation minimal enrichment | `route --json` 已输出 `explanation.source/reason/dependency`；focused regression 覆盖 |
| U-080 | S12 | fixture tooling | P2 | 已完成 | Fixture / golden export smoke runner | `aods fixture smoke` 可读取 example fixture manifest 并验证 expected_status / expected_rules 与 input/golden path；不执行 update command |
| U-081 | S12 | public docs / adoption | P2 | 已完成 | Source-first adoption guide for example packs | README / docs 指向从 authoring source 到 compile / validate / route / fixture smoke 的最小 adoption path；不重复 benchmark sync 区块 |
| U-082 | S12 | citation hygiene | P2 | 已完成 | External citation stale/current hygiene report | `validate` / `validate --json` 已输出 declared citation posture counters；不做 crawler、URL checker、fact checker |
| U-083 | S12 | ergonomics | P3 | 已完成 | Changelog delta ergonomics review | 已复审 `#13`：有效但不阻塞当前 release workflow；本轮只写 public response plan，不改 schema |
| U-084 | S12 | research / boundary | P3 | 已完成 | Runtime-boundary research spike | 已梳理 workflow runtime、event store、policy engine、remote gateway、migration tool 的 metadata-only 边界、进入条件和非目标；不实现 runtime |
| U-085 | S13 | docs / boundary | P2 | 已完成 | Runtime readiness gate matrix | 五类 runtime 候选已映射到 authority、evidence、risk、fixture、public sync gate；不实现 runtime |
| U-086 | S13 | boundary triage | P2 | 已完成 | Workflow runtime entry contract triage | lifecycle / command / audit / dependency 前置条件和 workflow non-goals 已明确；不实现 workflow engine |
| U-087 | S13 | boundary triage | P2 | 已完成 | Event store and replay contract triage | event identity、ordering、retention、replay、correction projection 前置条件已明确；不实现 event store |
| U-088 | S13 | boundary triage | P2 | 已完成 | Policy engine and approval runtime triage | risk label 到 policy decision input/output、audit receipt 和 approval boundary 已明确；不实现 permission broker 或 approval workflow |
| U-089 | S13 | boundary triage | P2 | 已完成 | Remote gateway / adapter runtime triage | exposure upgrade、auth、transport、audit、compatibility 前置条件已明确；不实现 remote gateway |
| U-090 | S13 | boundary triage | P3 | 已完成 | Migration tool entry contract triage | source/target authority、dry-run、rollback、mapping、destructive-change approval 边界已明确；不实现 migration executor |
| U-091 | S13 | release / public sync | P1 | 已完成 | PR final readiness / public sync closeout | PR `#63` 仍为 draft；reviews/checks 为空；version/release 决策明确为本轮不 merge、不 release、不 bump |
| U-092 | S20 | planning | P0 | 已完成 | Comprehensive task backlog and 10-task execution rule | 综合任务池扩展到 U-160；后续每轮复审通过后按顺序选 10 个任务 |
| U-093 | S14 | release / public sync | P1 | 已完成 | PR review response matrix | PR review、covered issue、deferred issue 状态已形成矩阵；不改代码、不关闭 issue |
| U-094 | S14 | release planning | P1 | 已完成 | Version bump and changelog route triage | 下一 release 前必须先 version bump、tag、changelog entry 和 README version surface；本轮不 bump、不发布 |
| U-095 | S14 | release docs | P1 | 已完成 | Release notes completeness pass | release note skeleton 已覆盖 major changes、non-goals、known deferred runtime、validation evidence；本轮不发布 |
| U-096 | S14 | packaging | P2 | 已完成 | Package artifact inventory guard update | `npm pack --dry-run --json` 文件清单与 expected package surface 已审查；不改 package strategy |
| U-097 | S14 | packaging smoke | P2 | 已完成 | Install smoke from packed tarball | 本地 tarball install / CLI help / packaged validate / fixture smoke 已入账；不发布 npm |
| U-098 | S14 | public sync | P2 | 已完成 | Public issue close-on-merge audit | PR body close-on-merge issue 与本地覆盖矩阵一致；不提前关闭 issue |
| U-099 | S14 | public sync | P2 | 已完成 | Post-merge public state reconciliation plan | PR merge 后 issue、release、docs、branch cleanup 顺序已明确；不实际 merge |
| U-100 | S14 | release gate | P1 | 已完成 | v0.12 release candidate gate | release:self-check、pack dry-run、install smoke 与 blockers 已形成 pass/no-go decision；不发布 release |
| U-101 | S14 | release dry-run | P1 | 已完成 | Release execution playbook dry run | owner 授权前的 release steps、rollback、tag/version conflict checks 已可审查；不创建 release |
| U-102 | S14 | retrospective | P2 | 已完成 | Post-release retrospective and next milestone triage | release 后复盘模板、next milestone 候选和 public roadmap sync 入口已明确；不替代实际 release |
| U-103 | S15 | drift / evidence | P1 | 已完成 | Implementation evidence locator matrix v2 | repo locator、path locator、unchecked reason、evidence locator 的状态矩阵已明确；不 remote clone |
| U-104 | S15 | drift / evidence | P1 | 已完成 | Acceptance criteria coverage report | criteria 与 evidence refs、fixtures、validator rules、manual review posture 的覆盖摘要已明确；不执行 arbitrary command |
| U-105 | S15 | drift / evidence | P1 | 已完成 | Contract requirement to evidence trace report | stable contract requirement 到 implementation evidence 的 traceability 输出边界已明确；不做 semantic oracle |
| U-106 | S15 | drift workflow | P2 | 已完成 | Stale evidence refresh workflow boundary | stale evidence owner、refresh trigger、validation gate、manual review path 已明确；不自动刷新外部证据 |
| U-107 | S15 | drift remediation | P2 | 已完成 | Missing reality locator remediation plan | unchecked implementation repo locator 的最小修复路线已明确；不 fetch sibling repo |
| U-108 | S15 | topology | P2 | 已完成 | Implementation repo locator normalization | path / URL / descriptive-only locator 的解释边界已明确；不改变 root topology semantics |
| U-109 | S15 | report | P2 | 已完成 | Current vs planned implementation summary guard | current/planned/stale/blocked implementation posture 的 report guard 已明确；不强制 planned 变 current |
| U-110 | S15 | safety invariant | P2 | 已完成 | Evidence command non-execution invariant test | fixture smoke 不执行 update command 的 regression 已落；validate/reality/fixture smoke non-execution invariant 已入账 |
| U-111 | S15 | observability | P3 | 已完成 | Implementation drift dashboard boundary triage | 未来 dashboard 静态输入、候选面板和非目标已明确；不建 dashboard |
| U-112 | S15 | governance | P3 | 已完成 | Code ownership mapping boundary triage | ownership authority、path、review owner、fallback 边界已明确；不自动推断 owner |
| U-113 | S16 | fixtures | P1 | 已完成 | Fixture manifest coverage matrix | 9 positive、0 negative、9 golden coverage 已入账；不补全部 fixture |
| U-114 | S16 | fixtures | P2 | 已完成 | Negative fixture expansion plan | 下一批 high-value negative fixtures、expected rules 和文件范围已排序；不一次性扩全量 |
| U-115 | S16 | golden export | P2 | 已完成 | Golden export drift report | golden export drift 检测、人工接受、拒绝和更新边界已明确；不自动接受 golden diff |
| U-116 | S16 | fixture tooling | P2 | 已完成 | Fixture smoke output contract snapshot | fixture smoke JSON / text 输出契约已固化；不扩成 conformance runner |
| U-117 | S16 | examples | P2 | 已完成 | Example pack gap audit after PR review | PR `#63` 当前无 review/check；canonical example pack gap matrix 已入账；不新增示例包 |
| U-118 | S16 | compile determinism | P2 | 已完成 | Source-first compile determinism report | compiled-pilot 连续两次 compile 后无 generated diff；timestamp pinning regression 已确认 |
| U-119 | S16 | schema mirror | P2 | 已完成 | Compiled pilot schema mirror audit | compiled-pilot manifest / companion / module schema 与 root schema SHA 一致；不手改 generated schema |
| U-120 | S16 | example maintenance | P3 | 已完成 | Seven-plane pilot freshness review | seven-plane pilot strict pass；定位为旧核心结构示例，不扩成新能力 showcase |
| U-121 | S16 | benchmark | P3 | 已完成 | Open-source scenario pack health review | behavior drift=4、drift=9、loading=9、open-source corpora=4；不新增外部依赖 |
| U-122 | S16 | benchmark hygiene | P2 | 已完成 | Benchmark generated artifact hygiene policy | generated / reports churn 的默认恢复、接受条件和入账规则已定义；不默认提交 churn |
| U-123 | S17 | CLI DX | P2 | 已完成 | CLI help coverage for all subcommands | validate / hook / upgrade / compile / scaffold help 已补齐；focused regression 覆盖所有子命令 |
| U-124 | S17 | validation docs | P2 | 已完成 | Validate JSON report schema documentation | validate base JSON report、topology、external_citations 字段契约已文档化 |
| U-125 | S17 | validation parity | P2 | 已完成 | Validate text/JSON parity audit | text / JSON parity matrix 与保留差异已明确；不大改输出 |
| U-126 | S17 | route observability | P2 | 已完成 | Route explanation dependency graph review | `source/reason/dependency` 覆盖可接受；直接依赖边界已明确 |
| U-127 | S17 | remediation | P2 | 已完成 | Remediation guidance coverage matrix | remediation 覆盖矩阵已入账；新增 changelog delta warning action |
| U-128 | S17 | validation policy | P2 | 已完成 | Validation severity gate consistency review | warning / strict gate 行为一致；changelog warning 回归覆盖 |
| U-129 | S17 | CLI output | P3 | 已完成 | Compact vs verbose validation output triage | 暂不新增输出模式；先改善 maxLength length diagnostics |
| U-130 | S17 | routing quality | P2 | 已完成 | Route query corpus coverage audit | common query terms 覆盖可接受；write intent dependency expansion 已确认 |
| U-131 | S17 | routing hygiene | P2 | 已完成 | Route touch-route stale path audit | 16 条 touch route 无 stale path；operations docs fallback 缺口已记录 |
| U-132 | S17 | DX wording | P3 | 已完成 | Error message actionable wording pass | route invalid stage/intent 与 maxLength diagnostics 已修复并测试 |
| U-133 | S18 | authoring | P2 | 已完成 | Authoring source lint boundary triage | source-first lint 边界保持 schema / compile / validate；不做 style linter |
| U-134 | S18 | ergonomics | P2 | 已完成 | Changelog delta ergonomics fix plan | 选择 300 soft warning + 500 hard fail |
| U-135 | S18 | schema / validator | P2 | 已完成 | Changelog delta schema/test implementation | schema、validator、spec、focused regression 已落地 |

## 下一批推荐

| 批次 | 任务 | 理由 | 验证 |
|---|---|---|---|
| Batch A | U-060 + U-061 | 已完成；两个 boundary triage 已解除 `#57/#58` 的设计不确定性 | `gh issue view 57/58`、`rg` 现状审查、`npm run validate:all`、`git diff --check` |
| Batch B | U-062 + U-063 | 已完成；glossary schema 和 validator 已按同一边界落地，并由 focused regression 覆盖 compile mirror 与 deterministic gates | glossary focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch B2 | U-064 | 已完成；example pack 验证新 glossary registry shape，且未引入 runtime 或 external citation 变更 | compiled-pilot source-first example、fixture manifest、focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch C | U-065 + U-066 | 已完成；citation schema 和 validator 已按同一边界落地，并由 focused regression 覆盖 source-first mirror 与 deterministic gates | citation focused regression、`npm run validate:all`、`git diff --check`；hosted repeatability 依赖外部捕获，不作为本轮 gate |
| Batch C2 | U-067 | 已完成；example pack 验证 external citation registry / provenance refs 的 canonical authoring 用法 | compiled-pilot source-first example、fixture manifest、focused regression、`npm run validate:all` |
| Batch D | U-068 + U-069 + U-070 | 已完成；GitHub public sync、next drift slice、route discoverability residual 均已复盘 | `gh issue list/view`、`rg`、route smoke、`git diff --check`、`npm run validate:all` |
| Batch E | U-071 + U-076 | 已完成；回到代码漂移主线强化 implementation reality locator diagnostics，并补齐 route CLI 自发现小修 | RED/GREEN scaffold regression、`node ./bin/aods.mjs route --help`、`npm run validate:all`、`git diff --check` |
| Batch F | U-072 + U-073 | 已完成；两个 docs/planning 任务低冲突，已先补 public docs navigation，再整理 v0.12 backlog，给 release gate 和 public sync 降低风险 | docs diff review、GitHub issue 只读审查、`npm run validate:all`、`git diff --check` |
| Batch G | U-074 | 已完成；release readiness gate 是 public sync、PR/release 对外动作和 v0.12 新实现前的最低风险前置项 | `npm run release:self-check`、`npm pack --dry-run --json`、`git diff --check`、release notes skeleton |
| Batch H | U-075 | 已完成；U-074 通过后单独执行，用 U-072 public navigation 与 U-073 issue mapping 完成 public sync | PR `#63`、issue close-on-merge 关联、`#41/#59/#60` 留言、operations docs、`npm run validate:all`、`git diff --check` |
| Batch I | U-077 | 已完成；public sync 后的首个 v0.12 drift hardening，承接 U-071 locator diagnostics | RED/GREEN focused regression、`npm run validate:all`、`git diff --check` |
| Batch J | U-078 | 已完成；承接 `#41` metadata-only capability residual，先做 deterministic gates，不进入 handshake runtime | RED/GREEN focused regression、stable-contracts regression、`npm run validate:all`、`git diff --check` |
| Batch K | U-079 | 已完成；承接 `#59` observability residual，做最小 machine-readable explanation enrichment，不重写 CLI output subsystem | RED/GREEN focused regression、stable-contracts regression、route JSON/text smoke、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch L | U-080 | 已完成；承接 `#48` fixture/golden residual，做最小 smoke runner，不进入完整 conformance runner | RED/GREEN fixture regression、fixture JSON/text smoke、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch M | U-081 | 已完成；把 source-first authoring、compile、validate、route、fixture smoke 串成公开 adoption path | RED/GREEN example-pack docs regression、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch N | U-082 + U-083 | 已完成；citation posture 进入 validate report，同时复审 changelog.delta 300 字符限制是否阻塞 release workflow | RED/GREEN scaffold regression、compiled-pilot citation report smoke、GitHub issue `#13` read-only review、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch O | U-084 | 已完成；只做 runtime 边界和进入条件研究，不实现 runtime | route/read evidence、docs gate、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch P | U-085 + U-086 + U-087 + U-088 + U-089 + U-090 + U-091 + U-093 + U-094 + U-095 | 已完成；五类 runtime readiness / entry contract 已收束，PR / release readiness 前置检查已完成 | docs gate、GitHub state review、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch Q | U-096 到 U-105 | 已完成；release/package/drift 前十项已收束为 package smoke、public sync dry-run 和 evidence trace docs | package dry-run、packed install smoke、release:self-check、docs gate、`npm run validate:all`、`git diff --check` |
| Batch R | U-106 到 U-115 | 已完成；drift workflow 与 fixture coverage 前十项已收束，并修复 skill 字段名漂移 | skill package focused test、fixture non-execution regression、docs gate、`validate:all` |
| Batch S | U-116 到 U-125 | 已完成；fixture output、examples、compile/schema freshness、benchmark hygiene、CLI / validation docs 已收束 | focused CLI regression、fixture smoke、compile determinism、schema mirror audit、`validate:all` |
| Batch T | U-126 到 U-135 | 已完成；route/validation DX、authoring lint boundary 和 changelog ergonomics 已收束 | route query/touch evidence、focused scaffold regression、`validate:all` |
| Batch U | U-136 到 U-145 | 下一轮固定 10 任务；glossary/citation/docs/risk/exposure | docs gate or stable-contracts tests as scoped |
| Batch V | U-146 到 U-155 | risk/audit plus far runtime decision gates | docs gate; no runtime PoC |
| Batch W | U-156 到 U-160 | conformance / adapter / resolver / scheduler / observability research | docs gate; no implementation unless separately authorized |

## 当前非目标

1. 不把 glossary v2 扩成全文术语扫描器或自然语言 rewrite 工具。
2. 不把 external citation 扩成 crawler、事实核验器或 cross-corpus resolver。
3. 不把代码漂移路线扩成全量静态分析平台。
4. 不把本地覆盖判断自动同步为 GitHub issue 关闭或公开 release。
5. 不触碰 Polaris sibling repo；AODS 继续作为独立权威规范路线迭代。
6. 不把 U-084 的 runtime boundary research 解读成 workflow engine、event store、policy engine、remote gateway 或 migration tool 已经可以实现。
7. 不用“每轮 10 任务”绕过质量审查；如果上一轮不合格，本轮只返工。
