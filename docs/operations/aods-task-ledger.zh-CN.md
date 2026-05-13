# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | release execution prep final complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S72 post-regression audits pending；S73 release execution pending |
| 当前回合 | R-2026-05-13-38 |
| 未完成任务数量 | 20 |
| 已完成任务数量 | 566 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-38 |
| 开始时间 | 2026-05-13 21:30 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-552、U-553、U-554、U-555、U-556、U-557、U-558、U-559、U-560、U-561 |
| 本轮范围 | 上轮质量复审；v0.9 release notes body final refresh；npm pack dry-run final rerun；packed install smoke final rerun；GitHub release source install smoke route；release hygiene CI final decision；hosted repeatability owner-run packet；archive current operations pruning decision；handoff pre-release compaction；final release go/no-go rerun；runtime follow-up issue body draft |
| 排除范围 | hosted benchmark execution、GitHub milestone create、version bump、tag、GitHub Release、package publish、workflow engine、policy engine、adapter runtime implementation、event store / replay implementation、migration executor、database connection、CI enablement、installed skill mutation、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release hygiene；npm pack dry-run；packed install smoke；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-562 | S72 | Remote regression issue/body linkage audit | P3 | 未开始 | 确认 remote focused regression 是否应挂到 follow-up issue | U-538 | - |
| U-563 | S72 | Event correction issue/body linkage audit | P3 | 未开始 | 确认 event correction focused regression 是否应挂到 follow-up issue | U-541 | - |
| U-564 | S72 | Migration dry-run issue/body linkage audit | P3 | 未开始 | 确认 migration helper 是否需要公开 issue linkage | U-544 | - |
| U-565 | S72 | Public docs no-runtime wording audit | P2 | 未开始 | 全局审查 README / docs 是否误承诺 runtime | U-539/U-542/U-545 | - |
| U-566 | S72 | Source-first example post-regression smoke | P2 | 未开始 | focused regression 后复跑 source-first compile / validate / conformance | U-538/U-541/U-544 | - |
| U-567 | S72 | Package surface post-regression audit | P2 | 未开始 | focused regression 后检查 package allowlist 是否变化 | U-566 | - |
| U-568 | S72 | Docs examples post-regression refresh decision | P3 | 未开始 | 判断 docs/examples 是否需要新增 regression sample | U-566 | - |
| U-569 | S72 | Benchmark generated post-regression audit | P3 | 未开始 | focused regression 后确认 generated churn 是否合理 | U-544 | - |
| U-570 | S72 | Security placeholder post-regression audit | P3 | 未开始 | 新 fixtures 后复查 secret-like scan | U-566 | - |
| U-571 | S73 | v0.9 version bump implementation | P1 | 未开始 | 专门 commit bump package / lockfile / README / skill surfaces | U-560 | - |
| U-572 | S73 | v0.9 tag and GitHub release execution | P1 | 未开始 | 创建 tag / GitHub Release | U-571 | - |
| U-573 | S73 | GitHub release source install smoke execution | P1 | 未开始 | 从 tag 安装并验证 help / validate / fixture / conformance | U-572 | - |
| U-574 | S73 | Public issue close execution after release | P1 | 未开始 | 按 accepted packet 关闭 metadata-scoped issues | U-573 | - |
| U-575 | S73 | Roadmap tracker post-release refresh | P2 | 未开始 | 更新 `#60` post-release 状态 | U-574 | - |
| U-576 | S73 | Post-release package artifact audit | P2 | 未开始 | release asset / tarball / source tag 一致性审查 | U-572 | - |
| U-577 | S73 | Post-release handoff and ledger closeout | P2 | 未开始 | 刷新 handoff / ledger / progress / round log | U-574 | - |
| U-578 | S73 | Installed skill sync decision after release | P2 | 未开始 | 决定是否同步本地 installed skill | U-572 | - |
| U-579 | S73 | Next roadmap task discovery after v0.9 | P2 | 未开始 | 从公开状态和 runtime split 发现下一任务池 | U-577 | - |
| U-580 | S73 | Knowledge base project decision note | P3 | 未开始 | 若 owner 要求，记录 release decision 到 KB | U-572 | AGENTS KB rule only if decision write is requested |
| U-581 | S73 | Final post-v0.9 retrospective | P3 | 未开始 | 复盘 release / public split / runtime deferral | U-579 | - |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 537 | U-532 | S69 | Public close execution packet for `#59` | P1 | 2026-05-13 | GitHub issue `#59` closed / 当前台账 / round log | `gh issue close 59` | metadata/reporting scope closed；runtime/dashboard/trace backend not implemented |
| 538 | U-533 | S69 | Capability runtime follow-up issue creation decision | P1 | 2026-05-13 | GitHub issue `#64` created / public split focused regressions doc | `gh issue create` | runtime/protocol follow-up split to `#64` |
| 539 | U-534 | S69 | Capability metadata close execution packet for `#41` | P1 | 2026-05-13 | GitHub issue `#41` closed / current issue snapshot | `gh issue close 41` | metadata-first scope closed after `#64` split |
| 540 | U-535 | S69 | Roadmap tracker `#60` final pre-release comment | P2 | 2026-05-13 | `https://github.com/emosamastudio/aods/issues/60#issuecomment-4438866046` | `gh issue comment 60` | roadmap remains open；release still no-go |
| 541 | U-536 | S69 | Milestone creation execution decision | P3 | 2026-05-13 | GitHub milestones API / public split focused regressions doc | milestones API | milestones=[]；no milestone created this round |
| 542 | U-537 | S70 | Remote adapter mismatch regression plan | P1 | 2026-05-13 | scaffold focused test plan / public split focused regressions doc | focused test review | use capability_id mismatch row, no remote gateway |
| 543 | U-538 | S70 | Remote adapter mismatch regression implementation | P1 | 2026-05-13 | validator / scaffold test / source-first example | focused tests | `provider-capability-mismatch` row covered by `capability-compatibility-mismatch` |
| 544 | U-539 | S70 | Remote adapter mismatch docs sync | P2 | 2026-05-13 | source-first README / compiled README / operations doc | docs link / compile | metadata-only docs synced；no adapter execution promised |
| 545 | U-540 | S70 | Event correction metadata shape decision | P1 | 2026-05-13 | validation rules / source-first example / operations doc | compile / validate | static `event_id` + `correction_of` + `supersedes` mapping-table selected |
| 546 | U-541 | S70 | Event correction focused regression implementation | P1 | 2026-05-13 | validator / scaffold test / example pack test | focused tests | missing target and supersession cycle covered without replay/store |
| 547 | U-542 | S70 | Event correction docs and package boundary sync | P2 | 2026-05-13 | source-first README / static records release prep doc | docs link | packaged static example only；no event store/replay |
| 548 | U-543 | S70 | Migration dry-run static report shape decision | P2 | 2026-05-13 | static records release prep doc / migration report helper | focused test | report fields defined with no-execution guards |
| 549 | U-544 | S70 | Migration dry-run benchmark helper implementation | P2 | 2026-05-13 | benchmark helper / fixture / test | `node --test benchmarks/aods-eval-lab/test/migration-dry-run-report.test.mjs` | benchmark-only helper, no migrate command |
| 550 | U-545 | S70 | Migration dry-run report docs sync | P3 | 2026-05-13 | benchmark README / operations doc | docs link | no executor / no database connection boundary documented |
| 551 | U-546 | S70 | Workflow transition static record design | P2 | 2026-05-13 | static records release prep doc | docs link | minimal workflow transition table shape selected |
| 552 | U-547 | S70 | Workflow fixture candidate re-evaluation | P2 | 2026-05-13 | static records release prep doc | docs link | defer focused regression until static artifact exists |
| 553 | U-548 | S70 | Policy decision static record design | P2 | 2026-05-13 | static records release prep doc | docs link | actor / target / decision / evidence refs shape selected |
| 554 | U-549 | S70 | Policy fixture candidate re-evaluation | P2 | 2026-05-13 | static records release prep doc | docs link | defer focused regression until evidence/audit refs are bound |
| 555 | U-550 | S70 | Runtime fixture conformance promotion gate | P2 | 2026-05-13 | static records release prep doc | docs link | remote/event need negative fixture packs first；migration remains benchmark-only |
| 556 | U-551 | S71 | v0.9 version bump patch plan refresh | P1 | 2026-05-13 | static records release prep doc | docs link / release hygiene | version surfaces and verification order listed; no bump this round |
| 557 | U-552 | S71 | v0.9 release notes body final refresh | P1 | 2026-05-13 | release execution prep final doc | docs link | body includes public split, focused regressions, static reports, non-goals |
| 558 | U-553 | S71 | npm pack dry-run final rerun | P1 | 2026-05-13 | `npm pack --dry-run --json` | pack dry-run | aods@0.8.0, entry_count=61, unpackedSize=1145313 |
| 559 | U-554 | S71 | packed install smoke final rerun | P1 | 2026-05-13 | temp tarball install smoke | help / validate / fixture / conformance | installed aods@0.8.0 smoke pass |
| 560 | U-555 | S71 | GitHub release source install smoke final route | P2 | 2026-05-13 | release execution prep final doc | route review | route prepared; do not run before v0.9.0 tag exists |
| 561 | U-556 | S71 | Release hygiene CI enablement decision final | P3 | 2026-05-13 | release execution prep final doc | release hygiene | no CI enablement this round; local gate remains authority |
| 562 | U-557 | S71 | Hosted repeatability owner-run packet | P3 | 2026-05-13 | release execution prep final doc | packet review | optional supplemental only; not v0.9 gate |
| 563 | U-558 | S71 | Archive current operations pruning decision | P3 | 2026-05-13 | release execution prep final doc | docs review | no pruning before release/post-release reconciliation |
| 564 | U-559 | S71 | Handoff pre-release compaction | P3 | 2026-05-13 | handoff / task ledger / progress / round log | docs link | handoff advanced to U-561 complete and next U-562..U-571 |
| 565 | U-560 | S71 | Final release go/no-go rerun | P1 | 2026-05-13 | release execution prep final doc | release hygiene / pack / install smoke | release remains NO-GO until version bump/tag/source install |
| 566 | U-561 | S72 | Runtime follow-up issue body draft | P2 | 2026-05-13 | release execution prep final doc / #64 snapshot | issue body draft review | draft prepared; no body edit this round |
## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-562 到 U-571 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 pre-release roadmap comment 已发布 | 下一轮做 post-regression public docs/no-runtime audit 和 version bump implementation route |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` 作为后续 runtime/protocol follow-up |
| milestone | GitHub milestones | 当前无 milestone；final go/no-go 仍 release NO-GO | version bump/tag 执行前再决定 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation 已完成但未发布；public close criteria / roadmap sync packet 已完成且公开同步已执行；source-first / package examples、local hygiene CI design 和 benchmark policy 已完成；benchmark clean audit、runtime prerequisite refresh、public state refresh、retrospective、下一任务池扩展、public close readiness、release readiness 复核、runtime fixture prerequisite design、implementation candidate review、release hygiene adoption refresh、中文 README parity repair、final go/no-go 和下一任务池扩展已完成；v0.9 仍 no-go；release notes、pack dry-run、packed install smoke、source install route、CI decision、hosted repeatability packet、archive pruning decision、handoff compaction、final go/no-go 和 #64 body draft 已完成；下一阶段进入 post-regression audits 和 version bump implementation。
