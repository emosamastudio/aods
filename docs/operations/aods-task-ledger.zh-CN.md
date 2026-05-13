# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | runtime fixture prerequisite design complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S65 runtime fixture implementation candidates；S66 operations / package hygiene；S67 adoption / docs parity；S68 public split / final go-no-go |
| 当前回合 | R-2026-05-13-32 |
| 未完成任务数量 | 30 |
| 已完成任务数量 | 506 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-32 |
| 开始时间 | 2026-05-13 17:10 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-492、U-493、U-494、U-495、U-496、U-497、U-498、U-499、U-500、U-501 |
| 本轮范围 | 上轮质量复审；workflow lifecycle / receipt fixture design；event duplicate / correction fixture design；policy decision / approval audit fixture design；remote exposure / adapter mismatch fixture design；migration dry-run / destructive approval fixture design |
| 排除范围 | runtime implementation、schema implementation、validator implementation、conformance case implementation、workflow engine、event store、policy engine、remote gateway、migration executor、remote call、destructive action、issue close、version bump、tag、GitHub Release、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release hygiene；runtime gate docs review；fixture/conformance shape review；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-502 | S65 | Workflow fixture implementation candidate | P1 | 未开始 | 判断 U-492/U-493 是否可落地 focused regression | U-492/U-493 | - |
| U-503 | S65 | Event fixture implementation candidate | P1 | 未开始 | 判断 U-494/U-495 是否可落地 focused regression | U-494/U-495 | - |
| U-504 | S65 | Policy fixture implementation candidate | P1 | 未开始 | 判断 U-496/U-497 是否可落地 focused regression | U-496/U-497 | - |
| U-505 | S65 | Remote fixture implementation candidate | P1 | 未开始 | 判断 U-498/U-499 是否可落地 focused regression | U-498/U-499 | - |
| U-506 | S65 | Migration fixture implementation candidate | P1 | 未开始 | 判断 U-500/U-501 是否可落地 focused regression | U-500/U-501 | - |
| U-507 | S65 | Runtime fixture conformance grouping | P2 | 未开始 | 判断 runtime prerequisite fixtures 是否应进入 conformance suite | U-502 到 U-506 | - |
| U-508 | S66 | Task ledger window automation reconsideration | P3 | 未开始 | 审查 30 行窗口是否再次漂移，决定是否脚本化 | U-480 | - |
| U-509 | S66 | Operations index stale link audit | P3 | 未开始 | 复查 current operations index 与专题记录链接 | U-480 | - |
| U-510 | S66 | Handoff compaction refresh | P3 | 未开始 | 再压缩 handoff 当前状态和下一步 | U-481 | - |
| U-511 | S66 | Installed skill update decision | P2 | 未开始 | 再次判断是否同步本地 installed `aods-use` skill | U-485 | - |
| U-512 | S66 | Release hygiene CI owner packet final | P3 | 未开始 | 汇总 CI owner packet，但不启用 Actions | U-465 | - |
| U-513 | S66 | Generated clean protected path audit | P3 | 未开始 | 审查 generated clean path 是否覆盖当前高风险输出 | U-472 | - |
| U-514 | S66 | Secret scan false positive audit | P3 | 未开始 | 审查 secret-like scanner allowlist 是否仍为空且合理 | U-468 | - |
| U-515 | S66 | Package allowlist release sync audit | P3 | 未开始 | 审查 package allowlist 是否需要随 v0.9 release 调整 | U-488 | - |
| U-516 | S67 | Source-first external adoption smoke plan | P2 | 未开始 | 规划独立 temp repo 采用 source-first pilot 的 smoke 路线 | U-462 | - |
| U-517 | S67 | Docs examples package promotion decision | P3 | 未开始 | 判断 `docs/examples/*.sample.json` 是否继续不进 package | U-463 | - |
| U-518 | S67 | Validate route sample refresh after recent fields | P3 | 未开始 | 审查 public samples 是否需要同步 recent JSON fields | U-402/U-448 | - |
| U-519 | S67 | README quickstart command smoke rerun | P2 | 未开始 | 复跑 README quickstart commands | U-462 | - |
| U-520 | S67 | Chinese README parity audit | P3 | 未开始 | 审查中文 README 是否需要同步核心发布/示例入口 | U-519 | - |
| U-521 | S67 | Changelog next release draft refresh | P2 | 未开始 | 刷新下一 release changelog draft，不发布 | U-487 | - |
| U-522 | S67 | Benchmark summary source no-churn check | P3 | 未开始 | 审查 summary generator 是否因 docs 变化需要更新 | U-469 | - |
| U-523 | S67 | Hosted repeatability retry policy research | P3 | 未开始 | 研究 hosted repeatability 的 cost/retry/timeout 条件，不启用 gate | U-470 | - |
| U-524 | S68 | Open issue label hygiene read-only audit | P3 | 未开始 | 只读审查 open issue labels 是否仍匹配当前排序 | U-478 | - |
| U-525 | S68 | Milestone naming decision packet | P3 | 未开始 | 为 v0.9 / later-runtime milestone 命名做决策包 | U-491 | - |
| U-526 | S68 | Runtime issue split proposal | P2 | 未开始 | 为 runtime deferred work 准备 issue split proposal | U-473 到 U-477 | - |
| U-527 | S68 | Metadata close versus runtime follow-up proposal | P2 | 未开始 | 汇总 `#41/#59` 是否拆 close/follow-up 的建议 | U-482/U-483 | - |
| U-528 | S68 | Post-release closeout playbook refresh | P3 | 未开始 | 刷新 release 后 issue/release/docs/branch cleanup 顺序 | U-490 | - |
| U-529 | S68 | Next task pool expansion after U-482 | P2 | 未开始 | U-482 到 U-528 消耗后扩展下一任务池 | U-482 到 U-528 | - |
| U-530 | S68 | Archive pruning risk review | P3 | 未开始 | 审查 archive 是否需要再拆分或保持现状 | U-480 | - |
| U-531 | S68 | Final v0.9 go/no-go packet | P1 | 未开始 | 整合 release、public close、runtime deferral 后给出最终 go/no-go | U-485 到 U-528 | - |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 477 | U-472 | S60 | Benchmark result clean audit | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | `npm run generated:check-clean -- --json` | benchmark generated/reports dirty_entries=[] |
| 478 | U-473 | S61 | Workflow runtime prerequisite refresh | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | release hygiene / docs link / git diff check | 仍 no-go；先 lifecycle/transition/receipt fixtures |
| 479 | U-474 | S61 | Event store prerequisite refresh | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | release hygiene / docs link / git diff check | 仍 no-go；先 duplicate/out-of-order/correction fixtures |
| 480 | U-475 | S61 | Policy engine prerequisite refresh | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | release hygiene / docs link / git diff check | 仍 no-go；先 decision/receipt/approval/audit fixtures |
| 481 | U-476 | S61 | Remote gateway prerequisite refresh | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | release hygiene / docs link / git diff check | 仍 no-go；先 exposure/auth/rate/adapter mismatch fixtures |
| 482 | U-477 | S61 | Migration tool prerequisite refresh | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | release hygiene / docs link / git diff check | 仍 no-go；先 source/target/mapping/rollback/destructive approval fixtures |
| 483 | U-478 | S62 | Public state refresh after operations split | P2 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | GitHub issue/release/milestone snapshot | open issues #60/#59/#41；latest release v0.8.0；无 milestone |
| 484 | U-479 | S62 | Next issue triage after v0.9 plan | P2 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | GitHub snapshot / release hygiene | 下一优先级：public close packets、release readiness、runtime fixture prerequisites |
| 485 | U-480 | S62 | Post-operations split retrospective | P3 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | docs link / release hygiene | current operations 短入口有效；暂不脚本化维护 |
| 486 | U-481 | S62 | Next task pool expansion after U-432 | P2 | 2026-05-13 | 当前台账 / round log / runtime prereq public state retro doc | docs link / release hygiene | 新增 U-482 到 U-531；下一轮默认 U-482 到 U-491 |
| 487 | U-482 | S63 | Observability public close readiness packet | P2 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | GitHub issue snapshot / release hygiene | #59 metadata/reporting scope close-ready；不关闭 |
| 488 | U-483 | S63 | Capability metadata close scope packet | P2 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | GitHub issue snapshot / release hygiene | #41 metadata-first close-ready only if runtime/protocol split first |
| 489 | U-484 | S63 | Roadmap tracker v0.9 refresh packet | P2 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | GitHub issue snapshot / release hygiene | #60 保持 umbrella tracker；准备 comment packet，不发布 |
| 490 | U-485 | S63 | v0.9 release readiness recheck | P1 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | `npm run release:hygiene` | 技术 gate pass；release execution 仍 no-go |
| 491 | U-486 | S63 | Version bump no-go/go decision refresh | P1 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | package/lock version audit | 不自动 bump；需 public close/sync 决策后专门 version-bump commit |
| 492 | U-487 | S63 | Release notes final body sync | P1 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | docs link / release hygiene | v0.9 draft body 刷新，未发布 |
| 493 | U-488 | S63 | Package dry-run rerun | P2 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | `npm pack --dry-run --json` | aods@0.8.0，61 entries，unpacked 1,136,618 bytes |
| 494 | U-489 | S63 | Packed install smoke rerun | P2 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | local tarball install smoke | help / validate / fixture / conformance pass |
| 495 | U-490 | S63 | GitHub release source install smoke route | P2 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | docs link / release hygiene | tag 后 smoke route 已记录；v0.9 tag 前不运行 |
| 496 | U-491 | S63 | Public milestone creation decision packet | P3 | 2026-05-13 | 当前台账 / round log / public close release readiness doc | milestones API / release hygiene | 当前无 milestones；本轮不创建 |
| 497 | U-492 | S64 | Workflow lifecycle negative fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | invalid transition / missing guard / terminal restart fixture designs ready |
| 498 | U-493 | S64 | Workflow receipt audit fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | missing receipt / audit anchor / dependency conflict designs ready |
| 499 | U-494 | S64 | Event duplicate ordering fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | duplicate id / out-of-order / global clock claim designs ready |
| 500 | U-495 | S64 | Event correction projection fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | missing correction target / supersession cycle / projection guidance designs ready |
| 501 | U-496 | S64 | Policy decision negative fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | missing actor / missing target / stale evidence designs ready |
| 502 | U-497 | S64 | Policy approval audit fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | missing approval receipt / audit anchor / ambiguous decision designs ready |
| 503 | U-498 | S64 | Remote exposure upgrade fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | local-only remote read / remote-write receipt / auth boundary designs ready |
| 504 | U-499 | S64 | Remote adapter mismatch fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | provider mismatch / runtime probing / rate-cost posture designs ready |
| 505 | U-500 | S64 | Migration dry-run report fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | missing source authority / mapping / semantic gap designs ready |
| 506 | U-501 | S64 | Migration destructive approval fixture design | P2 | 2026-05-13 | 当前台账 / round log / runtime fixture prerequisite design doc | release hygiene / docs link / git diff check | destructive approval / rollback / dry-run-only designs ready |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-502 到 U-511 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；roadmap comment packet 已准备但未发布 | public close/sync 执行轮再 comment |
| observability | #59 | close-ready for metadata/reporting scope；本轮不关闭 | 关闭前发 final public close comment |
| capability | #41 | metadata-first scope close-ready；runtime/protocol 需先拆 follow-up | 下一步做 runtime issue split proposal |
| milestone | GitHub milestones | 当前无 milestone；本轮不创建 | release scope 接近执行时再决定 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation 已完成但未发布；public close criteria / roadmap sync packet 已完成且公开同步已执行；source-first / package examples、local hygiene CI design 和 benchmark policy 已完成；benchmark clean audit、runtime prerequisite refresh、public state refresh、retrospective、下一任务池扩展、public close readiness、release readiness 复核和 runtime fixture prerequisite design 已完成；下一阶段进入 runtime fixture implementation candidate review 和 package hygiene。
