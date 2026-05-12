# AODS Comprehensive Task Plan

状态：U-092 已完成；U-085 到 U-105 执行游标已同步
日期：2026-05-12
适用范围：U-084 runtime boundary research 之后的全量规划；每轮执行前仍必须先做上一轮质量审查

## 目标

本文件把 AODS 后续工作从短队列扩展为长期任务池。任务池覆盖 runtime readiness、release / public sync、implementation drift、fixtures / conformance、validation / routing、authoring / docs、risk / exposure / audit 和远期 runtime PoC 决策。

从下一轮开始，执行规则调整为：

1. 每轮开始先审查上一轮质量；若不合格，先返工，不选择新任务。
2. 审查通过后，从 `aods-task-ledger.zh-CN.md` 未完成任务表按顺序选择 10 个任务执行。
3. 如果未完成任务总数少于 10 个，则选择全部未完成任务。
4. 选中的 10 个任务必须写入当前回合锁定记录。
5. 需要公开 merge、release、破坏性迁移或生产副作用的任务，只能完成 readiness / dry-run / decision record；真正外部写动作需要当前回合明确授权。
6. 每轮结束必须汇报审查结论、返工情况、本轮新增成果、当前状态和遗留风险。

## 任务池分段

| 阶段 | 范围 | 任务 |
|---|---|---|
| S13 | runtime boundary / release closeout planning | U-085 到 U-091 |
| S14 | release / public synchronization | U-093 到 U-102 |
| S15 | implementation drift / evidence hardening | U-103 到 U-112 |
| S16 | fixtures / conformance / examples | U-113 到 U-122 |
| S17 | validation / routing / CLI DX | U-123 到 U-132 |
| S18 | authoring / docs / glossary / citation | U-133 到 U-142 |
| S19 | risk / security / exposure / audit | U-143 到 U-150 |
| S20 | far runtime PoC decision gates | U-151 到 U-160 |

## 当前执行游标

U-085 到 U-095 和 U-096 到 U-105 已完成。下一轮若上一轮质量审查通过，应选择以下 10 个任务：

| 顺序 | 任务 ID | 执行意图 |
|---:|---|---|
| 1 | U-106 | 裁剪 stale evidence refresh workflow boundary |
| 2 | U-107 | 制定 missing reality locator remediation plan |
| 3 | U-108 | 裁剪 implementation repo locator normalization |
| 4 | U-109 | 裁剪 current vs planned implementation summary guard |
| 5 | U-110 | 明确 evidence command non-execution invariant test |
| 6 | U-111 | 裁剪 implementation drift dashboard boundary |
| 7 | U-112 | 裁剪 code ownership mapping boundary |
| 8 | U-113 | 建立 fixture manifest coverage matrix |
| 9 | U-114 | 制定 negative fixture expansion plan |
| 10 | U-115 | 制定 golden export drift report |

## 完整任务清单

| 任务 ID | 阶段 | 类型 | 优先级 | 任务 | 验收标准 | 非目标 |
|---|---|---|---|---|---|---|
| U-085 | S13 | docs / boundary | P2 | Runtime readiness gate matrix | 五类 runtime 候选映射到 authority、evidence、risk、fixture、public sync gate | 不实现 runtime |
| U-086 | S13 | boundary triage | P2 | Workflow runtime entry contract triage | lifecycle / command / audit / dependency 前置条件和 workflow non-goals 明确 | 不实现 workflow engine |
| U-087 | S13 | boundary triage | P2 | Event store and replay contract triage | event identity、ordering、retention、replay、correction projection 前置条件明确 | 不实现 event store |
| U-088 | S13 | boundary triage | P2 | Policy engine and approval runtime triage | risk label 到 policy decision input/output、audit receipt 和 approval boundary 明确 | 不实现 permission broker 或 approval workflow |
| U-089 | S13 | boundary triage | P2 | Remote gateway / adapter runtime triage | exposure upgrade、auth、transport、audit、compatibility 前置条件明确 | 不实现 remote gateway |
| U-090 | S13 | boundary triage | P3 | Migration tool entry contract triage | source/target authority、dry-run、rollback、mapping、destructive-change approval 边界明确 | 不实现 migration executor |
| U-091 | S13 | release / public sync | P1 | PR final readiness / public sync closeout | final validation、PR ready / merge 决策、close-on-merge issue 检查、version / release decision 明确 | 未获当前回合明确授权前不 merge、不 release |
| U-093 | S14 | release / public sync | P1 | PR review response matrix | PR `#63` 的 review、commit、covered issue、deferred issue 状态形成矩阵 | 不改代码、不关闭 issue |
| U-094 | S14 | release planning | P1 | Version bump and changelog route triage | 明确下一 release 是否需要 version bump、tag、changelog entry、README version surface | 不直接 bump、不发布 |
| U-095 | S14 | release docs | P1 | Release notes completeness pass | release note skeleton 覆盖 major changes、non-goals、known deferred runtime、validation evidence | 不发布 release |
| U-096 | S14 | packaging | P2 | Package artifact inventory guard update | `npm pack --dry-run --json` 文件清单与 expected package surface 有审查记录 | 不改 package strategy |
| U-097 | S14 | packaging smoke | P2 | Install smoke from packed tarball | 本地 tarball install / CLI smoke 路线和结果入账 | 不发布 npm |
| U-098 | S14 | public sync | P2 | Public issue close-on-merge audit | PR body 中 close-on-merge issue 与本地覆盖矩阵一致 | 不提前关闭 issue |
| U-099 | S14 | public sync | P2 | Post-merge public state reconciliation plan | PR merge 后 issue、release、docs、branch cleanup 顺序明确 | 不实际 merge |
| U-100 | S14 | release gate | P1 | v0.12 release candidate gate | release:self-check、pack dry-run、validate、benchmark gate 与 blockers 形成 pass/fail decision | 不发布 release |
| U-101 | S14 | release execution | P1 | Release execution playbook dry run | owner 授权前的 release steps、rollback、tag/version conflict checks 可审查 | 不创建 release |
| U-102 | S14 | retrospective | P2 | Post-release retrospective and next milestone triage | release 后复盘模板、next milestone 候选和 public roadmap sync 入口明确 | 不替代实际 release |
| U-103 | S15 | drift / evidence | P1 | Implementation evidence locator matrix v2 | repo locator、path locator、unchecked reason、evidence locator 的状态矩阵明确 | 不 remote clone |
| U-104 | S15 | drift / evidence | P1 | Acceptance criteria coverage report | criteria 与 evidence refs、fixtures、validator rules、manual review posture 的覆盖摘要明确 | 不执行 arbitrary command |
| U-105 | S15 | drift / evidence | P1 | Contract requirement to evidence trace report | stable contract requirement 到 implementation evidence 的 traceability 输出边界明确 | 不做 semantic oracle |
| U-106 | S15 | drift workflow | P2 | Stale evidence refresh workflow boundary | stale evidence 的 owner、refresh trigger、validation gate、manual review path 明确 | 不自动刷新外部证据 |
| U-107 | S15 | drift remediation | P2 | Missing reality locator remediation plan | unresolved / unchecked implementation repo locator 的最小修复路线明确 | 不 fetch sibling repo |
| U-108 | S15 | topology | P2 | Implementation repo locator normalization | locator path / url / descriptive-only 的规范化和错误提示边界明确 | 不改变 root topology semantics |
| U-109 | S15 | report | P2 | Current vs planned implementation summary guard | current/planned/stale/blocked implementation posture 的 report guard 明确 | 不强制所有 planned 变 current |
| U-110 | S15 | safety invariant | P2 | Evidence command non-execution invariant test | validate / reality / fixture smoke 不执行 evidence command 的 invariant 有测试或文档 gate | 不引入 executor |
| U-111 | S15 | observability | P3 | Implementation drift dashboard boundary triage | 若未来做 dashboard，需要哪些静态输入和非目标先入账 | 不建 dashboard |
| U-112 | S15 | governance | P3 | Code ownership mapping boundary triage | ownership mapping 的 authority、path、review owner、fallback 边界明确 | 不自动推断 owner |
| U-113 | S16 | fixtures | P1 | Fixture manifest coverage matrix | 每类 canonical example 的 positive / negative / golden coverage 状态明确 | 不补全部 fixture |
| U-114 | S16 | fixtures | P2 | Negative fixture expansion plan | 下一批 high-value negative fixtures、expected rules 和文件范围明确 | 不一次性扩全量 |
| U-115 | S16 | golden export | P2 | Golden export drift report | golden export drift 的检测、人工接受、拒绝和更新边界明确 | 不自动接受 golden diff |
| U-116 | S16 | fixture tooling | P2 | Fixture smoke output contract snapshot | fixture smoke JSON/text 输出字段稳定性有 snapshot 或 docs gate | 不扩成 conformance runner |
| U-117 | S16 | examples | P2 | Example pack gap audit after PR review | PR review 后 canonical example 残缺、重复和过度承诺形成矩阵 | 不新增示例包 |
| U-118 | S16 | compile determinism | P2 | Source-first compile determinism report | source-first compile 输出稳定性、timestamp pinning、generated output churn 策略明确 | 不改 authoring semantics |
| U-119 | S16 | schema mirror | P2 | Compiled pilot schema mirror audit | compiled-pilot schema 与 root schema 的同步策略和风险点明确 | 不手改 generated schema |
| U-120 | S16 | example maintenance | P3 | Seven-plane pilot freshness review | seven-plane pilot 是否仍覆盖核心 semantics 的审查结论明确 | 不重写 pilot |
| U-121 | S16 | benchmark | P3 | Open-source scenario pack health review | seeded open-source routing scenarios 的覆盖、稳定性和维护成本明确 | 不新增外部依赖 |
| U-122 | S16 | benchmark hygiene | P2 | Benchmark generated artifact hygiene policy | benchmark:test 生成结果 churn 的还原、接受和入账规则明确 | 不默认提交 churn |
| U-123 | S17 | CLI DX | P2 | CLI help coverage for all subcommands | compile / validate / route / fixture 等 help coverage 矩阵明确 | 不重写 CLI parser |
| U-124 | S17 | validation docs | P2 | Validate JSON report schema documentation | validate JSON top-level fields、report summaries、reality/citation outputs 有文档契约 | 不新增 schema file unless scoped |
| U-125 | S17 | validation parity | P2 | Validate text/JSON parity audit | text 和 JSON 输出的信息差、必要保留差异和 future fixes 明确 | 不大改输出 |
| U-126 | S17 | route observability | P2 | Route explanation dependency graph review | route explanation 的 source/reason/dependency 字段覆盖和不足明确 | 不改 ranking |
| U-127 | S17 | remediation | P2 | Remediation guidance coverage matrix | validator rules 中 remediation guidance 覆盖率和缺口明确 | 不自动修复 |
| U-128 | S17 | validation policy | P2 | Validation severity gate consistency review | L1-L4 severity/gate 与 strict 行为一致性审查完成 | 不改 severity policy unless separately scoped |
| U-129 | S17 | CLI output | P3 | Compact vs verbose validation output triage | 是否需要 compact/verbose 模式的需求、风险和最小实现路线明确 | 不实现新模式 |
| U-130 | S17 | routing quality | P2 | Route query corpus coverage audit | common query terms 到 authority module 的覆盖、miss 和 stale route 风险明确 | 不改 scoring |
| U-131 | S17 | routing hygiene | P2 | Route touch-route stale path audit | touch routes 中 stale path、unregistered path、unexpected fallback 的审查完成 | 不重排 authority |
| U-132 | S17 | DX wording | P3 | Error message actionable wording pass | 高噪声错误信息的可操作性问题列表和优先级明确 | 不一次性改全部错误 |
| U-133 | S18 | authoring | P2 | Authoring source lint boundary triage | source-first authoring lint 的可验证字段、非目标和候选 tests 明确 | 不实现 style linter |
| U-134 | S18 | ergonomics | P2 | Changelog delta ergonomics fix plan | `#13` 的真实 pain、schema options、migration risk 和 test plan 明确 | 不直接改 schema |
| U-135 | S18 | schema / validator | P2 | Changelog delta schema/test implementation | 若 U-134 通过，最小 schema/test 改动落地并验证 | 不扩成 changelog framework |
| U-136 | S18 | glossary | P3 | Glossary registry alias lifecycle triage | alias/deprecated term lifecycle、replacement、scope collision 后续边界明确 | 不做 resolver runtime |
| U-137 | S18 | glossary docs | P3 | Glossary canonical-term documentation pass | glossary v2 authoring / consumption guidance 补齐且不夸大 runtime | 不全文扫描 |
| U-138 | S18 | citation | P2 | External citation review workflow triage | citation review_status、claim_posture、authority_relation 的 review workflow 明确 | 不做 crawler |
| U-139 | S18 | citation docs | P2 | External citation freshness policy docs | authoritative citation freshness、stale、withheld、unresolved 的维护指引明确 | 不抓取 URL |
| U-140 | S18 | docs quality | P3 | Documentation density quality pass | agent-primary docs 的 dense / actionable / non-marketing 问题清单明确 | 不重写文档门户 |
| U-141 | S18 | paired surfaces | P3 | Paired surface sync example report | paired human/agent sync quality report 的示例输出和使用边界明确 | 不建 semantic judge |
| U-142 | S18 | docs tooling | P3 | Docs navigation dead-link local checker triage | 本地 docs 链接检查的范围、误报和最小命令路线明确 | 不抓取外网 |
| U-143 | S19 | redaction | P2 | Sensitive example redaction fixture review | examples 中 sensitive placeholder / redaction posture 的 fixture 风险审查完成 | 不做 secret scanner service |
| U-144 | S19 | security docs | P2 | Credential placeholder policy docs | credentials、handles、debug-only payload 在 examples/docs 中的写法规则明确 | 不接入 secret manager |
| U-145 | S19 | exposure | P2 | Remote exposure upgrade checklist | local-only 到 remote-read / remote-write / adapter-facing 的 upgrade checklist 明确 | 不实现 gateway |
| U-146 | S19 | risk report | P2 | Risk taxonomy coverage report | read/write/credential/filesystem/network/cost/production mutation risk 的覆盖摘要明确 | 不做 runtime policy |
| U-147 | S19 | audit report | P2 | Audit metadata completeness report | commands/adapters 的 actor/source/target/receipt/correlation coverage 明确 | 不建 audit store |
| U-148 | S19 | policy boundary | P3 | Policy decision receipt boundary refinement | policy decision 与 receipt/audit anchor 的字段边界和缺口明确 | 不实现 permission broker |
| U-149 | S19 | approval boundary | P3 | Approval label semantics review | human_approval / review / escalation labels 的语义一致性审查完成 | 不建 approval workflow |
| U-150 | S19 | local export safety | P3 | Local-only export safety review | local-only / local-export surfaces 的公开误用风险和 guard 明确 | 不实现 sandbox |
| U-151 | S20 | runtime decision | P3 | Workflow runtime minimal PoC decision gate | workflow runtime 是否值得 PoC 的 prerequisites、success metric、abort criteria 明确 | 不实现 PoC |
| U-152 | S20 | runtime decision | P3 | Event store minimal PoC decision gate | event store / replay PoC 的 prerequisites、data model、risk、abort criteria 明确 | 不实现 PoC |
| U-153 | S20 | runtime decision | P3 | Policy engine minimal PoC decision gate | policy engine PoC 的 input/output、identity model、audit boundary 明确 | 不实现 PoC |
| U-154 | S20 | runtime decision | P3 | Remote gateway minimal PoC decision gate | remote gateway PoC 的 auth、transport、rate/cost、failure semantics 明确 | 不实现 PoC |
| U-155 | S20 | runtime decision | P3 | Migration tool minimal PoC decision gate | migration tool PoC 的 dry-run、rollback、destructive approval、fixtures 明确 | 不实现 PoC |
| U-156 | S20 | conformance decision | P3 | Conformance runner implementation plan | 从 fixture smoke 走向 conformance runner 的 staged implementation plan 明确 | 不实现 runner |
| U-157 | S20 | adapter protocol | P3 | Adapter negotiation protocol plan | full negotiation handshake 的 metadata prerequisites、protocol sketch 和 non-goals 明确 | 不实现 negotiation |
| U-158 | S20 | authority runtime | P3 | Cross-corpus authority resolver research | cross-corpus resolver 的 trust model、fetch policy、cache and failure posture 明确 | 不实现 resolver |
| U-159 | S20 | scheduler research | P3 | Dependency scheduler research | dependency ordering 是否进入 runtime scheduler 的 gate、risks、alternatives 明确 | 不实现 scheduler |
| U-160 | S20 | observability research | P3 | Telemetry / observability store research | dashboard/trace store/telemetry storage 的 need、inputs、privacy risk 明确 | 不建 store |

## 执行批次建议

| 批次 | 任务 | 验证 |
|---|---|---|
| Completed 10 A | U-085、U-086、U-087、U-088、U-089、U-090、U-091、U-093、U-094、U-095 | docs gate、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Completed 10 B | U-096 到 U-105 | release/package/drift docs + validation gates |
| Next 10 | U-106 到 U-115 | drift workflow + fixture coverage docs gate；只有进入 code slice 时再加 focused regression |
| Fixture continuation | U-116 到 U-122 | fixture / benchmark relevant tests + `validate:all` |
| DX block | U-123 到 U-132 | focused CLI / route / validation tests as needed |
| Authoring block | U-133 到 U-142 | source-first compile / docs / schema tests as scoped |
| Risk block | U-143 到 U-150 | stable-contracts or docs gate as scoped |
| Runtime decision block | U-151 到 U-160 | research docs only unless owner explicitly starts PoC |

## 非目标

1. 本次规划不实现任何新 schema、validator、CLI、runtime 或 release action。
2. 不把 PR / issue open 状态直接等同于本地缺能力。
3. 不把远期 runtime decision gate 解读成已批准 runtime PoC。
4. 不把每轮 10 个任务理解为跳过质量门禁；质量门禁失败时本轮只返工。
