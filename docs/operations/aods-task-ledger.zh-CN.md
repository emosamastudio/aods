# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | final go/no-go complete；next task pool expanded |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S69 public close / runtime split；S70 focused regressions；S71 release execution |
| 当前回合 | R-2026-05-13-35 |
| 未完成任务数量 | 50 |
| 已完成任务数量 | 536 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-35 |
| 开始时间 | 2026-05-13 19:05 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-522、U-523、U-524、U-525、U-526、U-527、U-528、U-529、U-530、U-531 |
| 本轮范围 | 上轮质量复审；benchmark summary source no-churn check；hosted repeatability retry policy research；open issue label hygiene read-only audit；milestone naming decision packet；runtime issue split proposal；metadata close versus runtime follow-up proposal；post-release closeout playbook refresh；next task pool expansion；archive pruning risk review；final v0.9 go/no-go packet |
| 排除范围 | generated benchmark churn commit、hosted benchmark execution、GitHub issue close、GitHub issue create、GitHub milestone create、version bump、tag、GitHub Release、package publish、runtime implementation、schema implementation、validator implementation、conformance case implementation、installed skill mutation、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release hygiene；benchmark summary churn inspection；GitHub issue/release/milestone snapshot；task ledger count check；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-532 | S69 | Public close execution packet for `#59` | P1 | 未开始 | 准备并执行或明确推迟 `#59` metadata/reporting close comment | U-527 | - |
| U-533 | S69 | Capability runtime follow-up issue creation decision | P1 | 未开始 | 决定是否创建 `#41` runtime/protocol follow-up issue | U-526/U-527 | - |
| U-534 | S69 | Capability metadata close execution packet for `#41` | P1 | 未开始 | 在 follow-up 决策后准备 close/comment packet | U-533 | - |
| U-535 | S69 | Roadmap tracker `#60` final pre-release comment | P2 | 未开始 | 准备或发布 v0.9 pre-release roadmap comment | U-532/U-534 | - |
| U-536 | S69 | Milestone creation execution decision | P3 | 未开始 | 若 public split 清晰，决定是否创建 `v0.9.0` milestone | U-535 | - |
| U-537 | S70 | Remote adapter mismatch regression plan | P1 | 未开始 | 定义最小测试位置和 fixture row | U-505 | - |
| U-538 | S70 | Remote adapter mismatch regression implementation | P1 | 未开始 | focused regression 覆盖 provider mismatch | U-537 | - |
| U-539 | S70 | Remote adapter mismatch docs sync | P2 | 未开始 | 同步 README / operations 说明，避免 runtime gateway 承诺 | U-538 | - |
| U-540 | S70 | Event correction metadata shape decision | P1 | 未开始 | 选择 correction target / supersession cycle 最小静态 shape | U-503 | - |
| U-541 | S70 | Event correction focused regression implementation | P1 | 未开始 | 增加 correction missing target / cycle focused tests | U-540 | - |
| U-542 | S70 | Event correction docs and package boundary sync | P2 | 未开始 | 说明仍不实现 event store / replay | U-541 | - |
| U-543 | S70 | Migration dry-run static report shape decision | P2 | 未开始 | 定义 benchmark-only report fields | U-506 | - |
| U-544 | S70 | Migration dry-run benchmark helper implementation | P2 | 未开始 | 增加静态 report helper / fixture，不加 migrate command | U-543 | - |
| U-545 | S70 | Migration dry-run report docs sync | P3 | 未开始 | 明确 benchmark-only 和 no executor 边界 | U-544 | - |
| U-546 | S70 | Workflow transition static record design | P2 | 未开始 | 设计 minimal workflow transition record shape | U-502 | - |
| U-547 | S70 | Workflow fixture candidate re-evaluation | P2 | 未开始 | 基于 U-546 判断是否进入 focused regression | U-546 | - |
| U-548 | S70 | Policy decision static record design | P2 | 未开始 | 设计 actor / target / decision enum / evidence refs shape | U-504 | - |
| U-549 | S70 | Policy fixture candidate re-evaluation | P2 | 未开始 | 基于 U-548 判断是否进入 focused regression | U-548 | - |
| U-550 | S70 | Runtime fixture conformance promotion gate | P2 | 未开始 | 判断哪些 focused regressions 可进入 package conformance | U-538/U-541/U-544 | - |
| U-551 | S71 | v0.9 version bump patch plan refresh | P1 | 未开始 | 列出 package / lockfile / README / skill release surfaces | U-532/U-535 | - |
| U-552 | S71 | v0.9 release notes body final refresh | P1 | 未开始 | 合并 public close/split 和 focused regression 状态 | U-551 | - |
| U-553 | S71 | npm pack dry-run final rerun | P1 | 未开始 | `npm pack --dry-run --json` pass 并记录 entry count | U-551 | - |
| U-554 | S71 | packed install smoke final rerun | P1 | 未开始 | tarball install help / validate / fixture / conformance pass | U-553 | - |
| U-555 | S71 | GitHub release source install smoke final route | P2 | 未开始 | tag 后 source install smoke route 准备 | U-552 | - |
| U-556 | S71 | Release hygiene CI enablement decision final | P3 | 未开始 | 最终决定是否启用单 job Actions | U-512/U-531 | - |
| U-557 | S71 | Hosted repeatability owner-run packet | P3 | 未开始 | 若 owner 要求，准备 cost/timeboxed manual run packet | U-523 | - |
| U-558 | S71 | Archive current operations pruning decision | P3 | 未开始 | release 前决定是否继续不归档 current logs | U-530 | - |
| U-559 | S71 | Handoff pre-release compaction | P3 | 未开始 | 压缩 public split / release execution 状态 | U-552 | - |
| U-560 | S71 | Final release go/no-go rerun | P1 | 未开始 | public split、version bump、package smoke 后最终判断 | U-551 到 U-559 | - |
| U-561 | S72 | Runtime follow-up issue body draft | P2 | 未开始 | 准备 later-runtime issue body 草稿 | U-533 | - |
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
| 507 | U-502 | S65 | Workflow fixture implementation candidate | P1 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | release hygiene / docs link / git diff check | not first candidate；needs static workflow transition record |
| 508 | U-503 | S65 | Event fixture implementation candidate | P1 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | release hygiene / docs link / git diff check | correction target / supersession cycle are ready candidates after shape decision |
| 509 | U-504 | S65 | Policy fixture implementation candidate | P1 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | release hygiene / docs link / git diff check | defer until static policy decision shape exists |
| 510 | U-505 | S65 | Remote fixture implementation candidate | P1 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | release hygiene / docs link / git diff check | adapter mismatch is ready candidate via existing capability matrix |
| 511 | U-506 | S65 | Migration fixture implementation candidate | P1 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | release hygiene / docs link / git diff check | dry-run static report is benchmark-only candidate, not validator yet |
| 512 | U-507 | S65 | Runtime fixture conformance grouping | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | release hygiene / docs link / git diff check | keep out of conformance until package-consumable shape exists |
| 513 | U-508 | S66 | Task ledger window automation reconsideration | P3 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | count check / release hygiene | no automation；unfinished=30 completedRecent=30 before completion |
| 514 | U-509 | S66 | Operations index stale link audit | P3 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | docs link / release hygiene | index updated; no stale link |
| 515 | U-510 | S66 | Handoff compaction refresh | P3 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | docs link / release hygiene | handoff refreshed for U-027..U-511 complete and next U-512..U-521 |
| 516 | U-511 | S66 | Installed skill update decision | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture implementation candidates doc | skill diff review / release hygiene | do not overwrite installed skill this round |
| 517 | U-512 | S66 | Release hygiene CI owner packet final | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | release hygiene | keep as local owner gate；future single job only |
| 518 | U-513 | S66 | Generated clean protected path audit | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | `npm run generated:check-clean -- --json` | dirty_entries=[]；protected paths still correct |
| 519 | U-514 | S66 | Secret scan false positive audit | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | `npm run security:scan-placeholders -- --json` | hits=0；no new allowlist |
| 520 | U-515 | S66 | Package allowlist release sync audit | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | `npm run package:check-surface -- --json` | aods@0.8.0 entry_count=61 missing=0 unexpected=0 |
| 521 | U-516 | S67 | Source-first external adoption smoke plan | P2 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | README smoke / release hygiene | temp-repo smoke route documented |
| 522 | U-517 | S67 | Docs examples package promotion decision | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | package surface / docs sample parse | keep docs examples out of npm package |
| 523 | U-518 | S67 | Validate route sample refresh after recent fields | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | docs sample JSON parse | no sample refresh needed |
| 524 | U-519 | S67 | README quickstart command smoke rerun | P2 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | README quickstart smoke | help / validate / route / fixture / conformance / scaffold / compile pass |
| 525 | U-520 | S67 | Chinese README parity audit | P3 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | docs link / release hygiene | conformance manifest and route JSON parity repaired |
| 526 | U-521 | S67 | Changelog next release draft refresh | P2 | 2026-05-13 | 当前台账 / round log / release hygiene adoption refresh doc | docs link / release hygiene | v0.9 draft refreshed in operations doc only |
| 527 | U-522 | S67 | Benchmark summary source no-churn check | P3 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | `npm run benchmark:summary` / generated diff inspection | generated timestamp/version churn reverted；summary source unchanged |
| 528 | U-523 | S67 | Hosted repeatability retry policy research | P3 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | release hygiene / docs link | optional owner-run field evidence only；not a gate |
| 529 | U-524 | S68 | Open issue label hygiene read-only audit | P3 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | `gh issue list` | open issues #60/#59/#41 labels still match |
| 530 | U-525 | S68 | Milestone naming decision packet | P3 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | GitHub milestones API | milestone list empty；do not create yet |
| 531 | U-526 | S68 | Runtime issue split proposal | P2 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | docs link / release hygiene | propose focused regressions + static shape + later-runtime split |
| 532 | U-527 | S68 | Metadata close versus runtime follow-up proposal | P2 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | GitHub snapshot / release hygiene | #59 close-ready；#41 close only after runtime follow-up；#60 stays open |
| 533 | U-528 | S68 | Post-release closeout playbook refresh | P3 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | docs link / release hygiene | closeout order refreshed |
| 534 | U-529 | S68 | Next task pool expansion after U-482 | P2 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | task ledger count check | added U-532 to U-581 |
| 535 | U-530 | S68 | Archive pruning risk review | P3 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | docs link / release hygiene | no archive pruning this round |
| 536 | U-531 | S68 | Final v0.9 go/no-go packet | P1 | 2026-05-13 | 当前台账 / round log / final go/no-go doc | release hygiene / GitHub snapshot | v0.9 remains no-go until public close/split and version bump |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-532 到 U-541 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 pre-release roadmap comment 仍待执行 | 下一轮 public close/split execution packet |
| observability | #59 | close-ready for metadata/reporting scope；本轮不关闭 | 下一轮准备 close/comment execution |
| capability | #41 | metadata-first scope close-ready；runtime/protocol 需先拆 follow-up | 下一轮决定是否创建 runtime/protocol follow-up |
| milestone | GitHub milestones | 当前无 milestone；本轮不创建 | release scope 接近执行时再决定 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation 已完成但未发布；public close criteria / roadmap sync packet 已完成且公开同步已执行；source-first / package examples、local hygiene CI design 和 benchmark policy 已完成；benchmark clean audit、runtime prerequisite refresh、public state refresh、retrospective、下一任务池扩展、public close readiness、release readiness 复核、runtime fixture prerequisite design、implementation candidate review、release hygiene adoption refresh、中文 README parity repair、final go/no-go 和下一任务池扩展已完成；v0.9 仍 no-go，下一阶段进入 public close/split、focused regressions 和 release execution。
