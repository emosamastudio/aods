# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | runtime prerequisites public state retrospective complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S63 public close / release readiness；S64 runtime fixture prerequisites；S65 operations / package hygiene；S66 next discovery |
| 当前回合 | R-2026-05-13-30 |
| 未完成任务数量 | 50 |
| 已完成任务数量 | 486 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-30 |
| 开始时间 | 2026-05-13 15:50 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-472、U-473、U-474、U-475、U-476、U-477、U-478、U-479、U-480、U-481 |
| 本轮范围 | 上轮质量复审；benchmark result clean audit；workflow/event/policy/remote/migration runtime prerequisite refresh；public state refresh；next issue triage；post-operations split retrospective；next task pool expansion |
| 排除范围 | runtime implementation、workflow engine、event store、policy engine、remote gateway、migration executor、GitHub issue close、issue body edit、milestone creation、version bump、tag、GitHub Release、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release hygiene；generated clean JSON；GitHub public state snapshot；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-482 | S63 | Observability public close readiness packet | P2 | 未开始 | 为 `#59` 准备 close / keep-open 判断包，不关闭 issue | U-479 | - |
| U-483 | S63 | Capability metadata close scope packet | P2 | 未开始 | 为 `#41` 拆清 metadata close scope 与 runtime follow-up | U-479 | - |
| U-484 | S63 | Roadmap tracker v0.9 refresh packet | P2 | 未开始 | 为 `#60` 准备 v0.9 readiness / later-runtime comment packet | U-479 | - |
| U-485 | S63 | v0.9 release readiness recheck | P1 | 未开始 | 复跑 release readiness，不 bump、不 tag、不发布 | U-432 | - |
| U-486 | S63 | Version bump no-go/go decision refresh | P1 | 未开始 | 更新 0.8.0 -> 0.9.0 是否进入执行的 owner packet | U-485 | - |
| U-487 | S63 | Release notes final body sync | P1 | 未开始 | 刷新 v0.9 release notes body，保持未发布草稿 | U-486 | - |
| U-488 | S63 | Package dry-run rerun | P2 | 未开始 | `npm pack --dry-run` 复核 package surface | U-485 | - |
| U-489 | S63 | Packed install smoke rerun | P2 | 未开始 | 本地 tarball install smoke 复核 CLI / validate / conformance | U-488 | - |
| U-490 | S63 | GitHub release source install smoke route | P2 | 未开始 | 规划 tag 后 GitHub source install smoke 的最小命令 | U-489 | - |
| U-491 | S63 | Public milestone creation decision packet | P3 | 未开始 | 决定是否创建 v0.9.0 milestone，不直接创建 | U-484 | - |
| U-492 | S64 | Workflow lifecycle negative fixture design | P2 | 未开始 | 设计 invalid transition / alias lifecycle negative fixture，不实现 runtime | U-473 | - |
| U-493 | S64 | Workflow receipt audit fixture design | P2 | 未开始 | 设计 missing receipt / audit anchor negative fixture | U-473 | - |
| U-494 | S64 | Event duplicate ordering fixture design | P2 | 未开始 | 设计 duplicate / out-of-order event negative fixture | U-474 | - |
| U-495 | S64 | Event correction projection fixture design | P2 | 未开始 | 设计 correction / supersession projection fixture | U-474 | - |
| U-496 | S64 | Policy decision negative fixture design | P2 | 未开始 | 设计 missing actor/target/evidence policy negative fixture | U-475 | - |
| U-497 | S64 | Policy approval audit fixture design | P2 | 未开始 | 设计 approval receipt / audit anchor fixture | U-475 | - |
| U-498 | S64 | Remote exposure upgrade fixture design | P2 | 未开始 | 设计 local-only blocked / remote-read allowed fixture | U-476 | - |
| U-499 | S64 | Remote adapter mismatch fixture design | P2 | 未开始 | 设计 provider capability vs consumer requirement mismatch fixture | U-476 | - |
| U-500 | S64 | Migration dry-run report fixture design | P2 | 未开始 | 设计 source/target/mapping dry-run report fixture | U-477 | - |
| U-501 | S64 | Migration destructive approval fixture design | P2 | 未开始 | 设计 destructive approval / rollback negative fixture | U-477 | - |
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
| 457 | U-452 | S55 | Public roadmap sync execution | P3 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | GitHub issue comments / docs link / release hygiene | 已评论同步 #60/#59/#41；不关闭、不编辑 body |
| 458 | U-453 | S56 | Current authority checker spike | P2 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | docs link / release hygiene | 暂不实现 checker；重复 stale 指针再脚本化 |
| 459 | U-454 | S56 | Implementation repo path fixture | P2 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | existing scaffold regression / docs link | 现有 missing/remote locator 回归已覆盖；暂不新增重复 fixture |
| 460 | U-455 | S56 | Stale evidence negative fixture | P2 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | existing scaffold regression / docs link | 现有 missing review / expired evidence 回归已覆盖；暂不升 conformance |
| 461 | U-456 | S56 | Acceptance freshness cross gate implementation decision | P2 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | docs link / release hygiene | 不加 hard gate；先只考虑 stable decision + expired evidence 的窄规则 |
| 462 | U-457 | S57 | Archive link checker audit | P2 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | `npm run docs:check-links -- --json` | archive files 纳入 179 个 markdown 文件，missing=0 |
| 463 | U-458 | S57 | Historical stale-current label expansion | P3 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | docs link / release hygiene | 不批量改历史；只在混淆时定向扩展 label |
| 464 | U-459 | S57 | Operations index generator decision | P3 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | docs link / release hygiene | 不建 generator；current index 仍短且低 churn |
| 465 | U-460 | S57 | Task ledger maintenance script decision | P3 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | docs link / release hygiene | 不建脚本；30 行窗口若再次漂移再脚本化 |
| 466 | U-461 | S58 | GitHub release install smoke plan | P2 | 2026-05-13 | 当前台账 / round log / public sync maintenance doc | docs link / release hygiene | 规划 v0.9 tag 后 GitHub source install smoke，不提前运行 |
| 467 | U-462 | S59 | Source-first quickstart sample audit | P2 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | release hygiene / docs link / git diff check | source-first README 补入 conformance step 和 fixture/conformance 边界 |
| 468 | U-463 | S59 | Package sample documentation pass | P2 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | package surface dry-run / release hygiene | package example 与 docs snippet 边界已写清 |
| 469 | U-464 | S59 | Examples upgrade guidance | P3 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | docs link / release hygiene | 旧 source-first examples 升级路线已写入 source README |
| 470 | U-465 | S59 | Local hygiene CI design | P2 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | release hygiene / dry-run gates | 记录 CI 形状但不启用 GitHub Actions |
| 471 | U-466 | S59 | Generated clean CI dry-run | P2 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | `npm run generated:check-clean -- --json` | 通过，dirty_entries=[] |
| 472 | U-467 | S59 | Docs link CI dry-run | P2 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | `npm run docs:check-links -- --json` | 通过，missing=0 |
| 473 | U-468 | S59 | Secret scan CI dry-run | P2 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | `npm run security:scan-placeholders -- --json` | 通过，hits=0 |
| 474 | U-469 | S60 | Benchmark summary refresh decision | P3 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | release hygiene / git diff check | 无 benchmark source/metric 变更，本轮不刷新 README sync 区块 |
| 475 | U-470 | S60 | Hosted repeatability gate decision | P3 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | release hygiene / git diff check | hosted repeatability 仍为 supplemental lane，不进默认 release gate |
| 476 | U-471 | S60 | Benchmark archive policy implementation | P3 | 2026-05-13 | 当前台账 / round log / examples CI benchmark policy doc | release hygiene / git diff check | 保持 generated/reports 作为 committed baseline |
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

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-482 到 U-491 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；最新公开状态仍为 roadmap tracker | 下一轮准备 v0.9 readiness / later-runtime refresh packet |
| observability | #59 | 保持 open；metadata 和 samples 多数已完成，但 close packet 尚未形成 | 下一轮准备 close readiness packet |
| capability | #41 | 保持 open；metadata scope 与 runtime negotiation scope 需要拆分 | 下一轮准备 metadata close scope packet |
| milestone | GitHub milestones | 当前无 milestone；不创建 | 下一轮准备 milestone creation decision packet |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation 已完成但未发布；public close criteria / roadmap sync packet 已完成且公开同步已执行；source-first / package examples、local hygiene CI design 和 benchmark policy 已完成；benchmark clean audit、runtime prerequisite refresh、public state refresh、retrospective 和下一任务池扩展已完成；下一阶段进入 public close readiness、v0.9 release readiness、runtime fixture prerequisites 和 package hygiene。
