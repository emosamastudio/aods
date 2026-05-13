# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | route validate regression hardening complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S89 operations memory and public sync hygiene |
| 当前回合 | R-2026-05-13-53 |
| 未完成任务数量 | 20 |
| 已完成任务数量 | 716 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-53 |
| 开始时间 | 2026-05-13 35:00 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-702、U-703、U-704、U-705、U-706、U-707、U-708、U-709、U-710、U-711 |
| 本轮范围 | 上轮质量复审；route adoption query miss regression；route overread regression；validate location envelope regression；remediation compatibility audit；docs sample refresh decision；CLI help / install smoke docs parity；strict warning troubleshooting sample decision；package allowlist decision；generated hygiene after package smoke；conformance report sample no-refresh revisit |
| 排除范围 | route ranking rewrite、docs indexer、semantic judge、validator schema breaking change、conformance report schema change、package allowlist expansion、npm publish、version bump、tag creation、GitHub Release creation、workflow creation、installed skill overwrite、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；focused route/validate regression test；package install smoke；release hygiene final；docs link check；package surface check；task ledger count check；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-712 | S89 | Knowledge base write after post-v0.9 retrospective | P3 | 未开始 | 判断是否把复盘写入知识库 | U-680 | KB |
| U-713 | S89 | MEMORY installed skill sync execution decision | P3 | 未开始 | 复核是否仍不覆盖 installed skill | U-659 | local only |
| U-714 | S89 | Operations topic table archive/generator revisit | P3 | 未开始 | 判断 operations topic table 是否需要归档或生成器 | U-655 | - |
| U-715 | S89 | Task ledger new pool archive sync | P3 | 未开始 | 复核新任务池是否需要归档同步 | U-681 | - |
| U-716 | S89 | Handoff next pool compression | P3 | 未开始 | 压缩 handoff 的下一任务池说明 | U-681 | - |
| U-717 | S89 | Round log short-entry discipline check | P3 | 未开始 | 复核 round log 是否继续保持短记录 | U-652 | - |
| U-718 | S89 | AGENTS proxy / GitHub note parity audit | P3 | 未开始 | 复核 AGENTS / MEMORY 对 proxy 和 GitHub 授权记录一致 | U-658 | - |
| U-719 | S89 | Public issue `#60` body checkbox reconciliation decision | P3 | 未开始 | 判断 `#60` body 是否需要再次同步当前状态 | U-681 | GitHub |
| U-720 | S89 | Public issue `#64` runtime fixture progress comment decision | P3 | 未开始 | 判断 `#64` 是否需要补充静态前置进展评论 | U-691 | GitHub |
| U-721 | S89 | Milestone no-go revisit after new pool | P3 | 未开始 | 复核新任务池下是否仍不创建 milestone | U-681 | GitHub |
| U-722 | S90 | Projection guidance source-first candidate | P2 | 未开始 | 判断 projection guidance 是否可进入 source-first candidate | U-672 | no replay |
| U-723 | S90 | Event correction projection negative fixture | P2 | 未开始 | 设计缺 projection guidance evidence 的负例 | U-722 | no event store |
| U-724 | S90 | Policy decision static shape second review | P3 | 未开始 | 第二次复核 policy decision static shape | U-674 | no engine |
| U-725 | S90 | Workflow transition static shape second review | P3 | 未开始 | 第二次复核 workflow transition static shape | U-675 | no engine |
| U-726 | S90 | Migration dry-run package promotion second no-go | P3 | 未开始 | 再次复核 migration dry-run 是否仍不进 package | U-676 | no executor |
| U-727 | S90 | Adapter provider discovery package boundary after fixture | P3 | 未开始 | fixture 后复核 provider discovery 是否可进 package example | U-683 | - |
| U-728 | S90 | Runtime protocol conformance promotion no-go after fixture | P3 | 未开始 | fixture 后复核是否仍不进 conformance suite | U-684/U-685 | - |
| U-729 | S90 | Cross-corpus authority resolver next research trigger | P3 | 未开始 | 判断是否启动 cross-corpus authority resolver 研究 | U-681 | research only |
| U-730 | S90 | Final v0.10 trigger audit | P2 | 未开始 | 复核是否触发 v0.10 schema / package contract bump | U-701/U-728 | - |
| U-731 | S90 | Next comprehensive task discovery | P3 | 未开始 | 扩展下一批任务池或确认进入 release closeout | U-730 | - |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 687 | U-682 | S86 | Provider discovery source-first candidate insertion plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | plan only, no authoring edit |
| 688 | U-683 | S86 | Provider evidence negative fixture implementation plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | first negative fixture candidate sorted |
| 689 | U-684 | S86 | Runtime protocol schema minimal slice decision | P2 | 2026-05-13 | provider discovery hardening doc | release hygiene | schema gate remains closed |
| 690 | U-685 | S86 | Runtime protocol non-execution regression implementation plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | focused regression before conformance |
| 691 | U-686 | S86 | Provider discovery docs short note decision | P3 | 2026-05-13 | provider discovery hardening doc | docs link check | no public docs note yet |
| 692 | U-687 | S86 | Auth boundary source-first candidate plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | second candidate after provider evidence |
| 693 | U-688 | S86 | Probe cost negative fixture plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | network cost boundary candidate |
| 694 | U-689 | S86 | Fallback ranking overclaim regression plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | structured-field first, no text judge |
| 695 | U-690 | S86 | Adapter handshake audit negative fixture plan | P2 | 2026-05-13 | provider discovery hardening doc | docs link check | later candidate after auth/discovery shape |
| 696 | U-691 | S86 | Runtime protocol `#64` progress sync decision | P3 | 2026-05-13 | `https://github.com/emosamastudio/aods/issues/64#issuecomment-4441211144` | `gh issue comment 64` | status comment posted without runtime overclaim |
| 697 | U-692 | S87 | Package install smoke release gate integration decision | P2 | 2026-05-13 | release gate integration doc / `scripts/release-hygiene.mjs` | `npm run release:hygiene` | package smoke integrated into release hygiene |
| 698 | U-693 | S87 | v0.9.1 version bump execution gate | P2 | 2026-05-13 | release gate integration doc | release hygiene | no bump/tag/release this round |
| 699 | U-694 | S87 | v0.9.1 release notes final draft | P3 | 2026-05-13 | release gate integration doc | docs link check | draft ready, not published |
| 700 | U-695 | S87 | v0.9.1 packed install smoke execution | P2 | 2026-05-13 | release gate integration doc | `npm run package:install-smoke -- --json` | current 0.9.0 proof, not v0.9.1 release proof |
| 701 | U-696 | S87 | v0.9.1 source tag install smoke plan | P3 | 2026-05-13 | release gate integration doc | docs link check | tag smoke plan ready |
| 702 | U-697 | S87 | npm publish dry-run / token audit | P3 | 2026-05-13 | release gate integration doc | package surface check | no npm token inspected, publish remains gated |
| 703 | U-698 | S87 | CI workflow draft no-enable packet | P3 | 2026-05-13 | release gate integration doc | docs link check | draft only, no workflow created |
| 704 | U-699 | S87 | Branch cleanup execution packet | P3 | 2026-05-13 | release gate integration doc | `git ls-remote --heads origin` | cleanup candidates reviewed, no deletion |
| 705 | U-700 | S87 | Tag/source release note final wording | P3 | 2026-05-13 | release gate integration doc | docs link check | wording ready for future release notes |
| 706 | U-701 | S87 | Next release go/no-go packet | P2 | 2026-05-13 | release gate integration doc | release hygiene | v0.9.1/npm/CI/branch cleanup all no-go |
| 707 | U-702 | S88 | Route adoption query miss regression implementation | P2 | 2026-05-13 | route/validate regression test | focused test | adoption-style query stays query-route |
| 708 | U-703 | S88 | Route overread regression implementation | P2 | 2026-05-13 | route/validate regression test | focused test | narrow query does not load full corpus |
| 709 | U-704 | S88 | Validate location envelope regression implementation | P2 | 2026-05-13 | route/validate regression test | focused test | location envelope keys and remediation retained |
| 710 | U-705 | S88 | Remediation guidance compatibility audit | P3 | 2026-05-13 | route/validate regression hardening doc | focused test | remediation schema unchanged |
| 711 | U-706 | S88 | Docs sample refresh after route regression | P3 | 2026-05-13 | route/validate regression hardening doc | docs link check | no sample refresh needed |
| 712 | U-707 | S88 | CLI help install smoke docs parity | P3 | 2026-05-13 | top-level help + focused test | focused test / package smoke | route help now includes `--explain-skipped` |
| 713 | U-708 | S88 | Strict warning troubleshooting sample update | P3 | 2026-05-13 | route/validate regression hardening doc | docs link check | no new strict warning sample |
| 714 | U-709 | S88 | Package surface allowlist update for new script decision | P3 | 2026-05-13 | route/validate regression hardening doc | package surface check | package entry count unchanged |
| 715 | U-710 | S88 | Generated hygiene after package smoke script | P3 | 2026-05-13 | route/validate regression hardening doc | release hygiene | tarball/temp/generated clean verified |
| 716 | U-711 | S88 | Conformance report sample no-refresh revisit | P3 | 2026-05-13 | route/validate regression hardening doc | docs link check | conformance sample unchanged |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-712 到 U-721 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 current-status body section 已插入 | 后续继续作为 roadmap index |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` 已追加第二条静态前置进展，后续先做静态前置而非 runtime |
| milestone | GitHub milestones | 当前无 milestone；v0.9 已发布；本轮决定继续不创建 | 新任务池仍由台账驱动 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；route / validate focused regression 已新增并纳入 release hygiene；顶层 help 已补 `--explain-skipped`；docs samples、package allowlist 和 conformance sample 均无需刷新；下一轮默认 U-712 到 U-721。
