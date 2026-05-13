# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | final semantic candidate decisions complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S91 provider discovery and static guard implementation |
| 当前回合 | R-2026-05-13-55 |
| 未完成任务数量 | 50 |
| 已完成任务数量 | 736 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-55 |
| 开始时间 | 2026-05-13 22:50 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-722、U-723、U-724、U-725、U-726、U-727、U-728、U-729、U-730、U-731 |
| 本轮范围 | 上轮质量复审；projection guidance source-first candidate；event correction projection negative fixture；policy decision static shape second review；workflow transition static shape second review；migration dry-run package promotion second no-go；adapter provider discovery package boundary after fixture；runtime protocol conformance promotion no-go；cross-corpus authority resolver next research trigger；final v0.10 trigger audit；next comprehensive task discovery |
| 排除范围 | source-first authoring edit、schema/validator/runtime implementation、event store/replay/projection runtime、policy engine、workflow engine、migration executor、provider call/auth/probing/fallback executor、conformance promotion、cross-corpus fetch/resolver、npm publish、version bump、tag creation、GitHub Release creation、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；historical topic cross-read；docs link check；package surface check；release hygiene final；task ledger count check；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-732 | S91 | Provider discovery source-first preflight | P2 | 未开始 | 确认插入位置、字段、非执行边界和回滚范围 | U-722/U-727 | no network |
| U-733 | S91 | Provider discovery positive source-first candidate | P2 | 未开始 | 在 authoring source 中加入最小 provider discovery 静态记录并编译 | U-732 | source-first |
| U-734 | S91 | Provider discovery generated output review | P2 | 未开始 | 复核 compiled pilot 生成差异只来自 source-first candidate | U-733 | generated |
| U-735 | S91 | Provider discovery missing evidence negative fixture | P2 | 未开始 | 增加缺 evidence refs 的负例 fixture 或 focused input | U-733 | no provider call |
| U-736 | S91 | Provider evidence validator issue shape | P2 | 未开始 | 定义 deterministic issue code / severity / remediation | U-735 | JSON output |
| U-737 | S91 | Provider discovery focused regression | P2 | 未开始 | 增加正例不误报、负例报错的 focused regression | U-735/U-736 | test |
| U-738 | S91 | Provider discovery non-execution assertion | P2 | 未开始 | 验证 validate/route/package smoke 不执行网络或 adapter | U-737 | no mock network |
| U-739 | S91 | Provider discovery docs wording after fixture | P3 | 未开始 | 判断是否需要内部或公开短说明 | U-737 | no adoption API |
| U-740 | S91 | Provider discovery package boundary after implementation | P3 | 未开始 | 复核是否仍不进入 package examples / README quickstart | U-737 | package no-go |
| U-741 | S91 | Provider discovery `#64` progress sync after implementation | P3 | 未开始 | 若实现落地，决定是否给 `#64` 补充静态前置进展 | U-737 | GitHub |
| U-742 | S92 | Projection guidance existing coverage audit | P2 | 未开始 | 复核 compiled-pilot 当前 projection guidance 覆盖点 | U-723 | no replay |
| U-743 | S92 | Projection guidance missing negative fixture design | P2 | 未开始 | 定义缺 projection guidance 的 event correction 负例 | U-742 | no event store |
| U-744 | S92 | Projection guidance validator issue shape | P2 | 未开始 | 定义 issue code / severity / remediation | U-743 | JSON output |
| U-745 | S92 | Projection guidance focused regression | P2 | 未开始 | 增加负例 regression，证明 correction 改变含义时必须有 guidance | U-744 | test |
| U-746 | S92 | Projection guidance no-replay wording audit | P3 | 未开始 | 复核 README/docs 是否仍明确不做 replay/runtime | U-745 | docs |
| U-747 | S92 | Projection guidance route query behavior | P3 | 未开始 | 确认 route 查询 event correction 时能找到正确示例但不过读 | U-745 | route |
| U-748 | S92 | Projection guidance conformance promotion no-go | P3 | 未开始 | focused regression 后复核是否仍不进 conformance | U-745 | conformance no-go |
| U-749 | S92 | Projection guidance package sample boundary | P3 | 未开始 | 判断 package sample 是否无需刷新 | U-745 | package |
| U-750 | S92 | Projection guidance public issue sync decision | P3 | 未开始 | 判断是否需要公开同步，默认不新增评论 | U-745 | GitHub |
| U-751 | S92 | Projection guidance implementation retrospective | P3 | 未开始 | 总结 event correction static guard 的价值和边界 | U-745 | ops |
| U-752 | S93 | Policy decision minimal field checklist | P3 | 未开始 | 列出 policy claim / decision / receipt / approval 最小字段边界 | U-724 | no engine |
| U-753 | S93 | Policy decision no-engine docs audit | P3 | 未开始 | 复核文档是否误导为 policy engine | U-752 | docs |
| U-754 | S93 | Policy decision missing evidence fixture plan | P3 | 未开始 | 设计缺 decision evidence 的未来负例 | U-752 | plan only |
| U-755 | S93 | Policy decision promotion gate no-go | P3 | 未开始 | 复核是否仍不进 schema / validator / source-first | U-754 | no-go |
| U-756 | S93 | Workflow transition state vocabulary authority audit | P3 | 未开始 | 复核 start / pend / end 等状态词权威入口 | U-725 | terminology |
| U-757 | S93 | Workflow transition illegal alias fixture plan | P3 | 未开始 | 设计 begin vs start 等非法别名负例 | U-756 | plan only |
| U-758 | S93 | Workflow transition no-engine docs audit | P3 | 未开始 | 复核 docs 是否误导为 workflow engine | U-756 | docs |
| U-759 | S93 | Workflow transition source-first promotion no-go | P3 | 未开始 | 判断是否仍不进入 source-first example | U-757 | no-go |
| U-760 | S93 | Migration dry-run package boundary audit | P3 | 未开始 | 再次确认 migration dry-run 不进 package adoption surface | U-726 | no executor |
| U-761 | S93 | Migration dry-run README wording audit | P3 | 未开始 | 复核 README / docs 没有暗示迁移命令 | U-760 | docs |
| U-762 | S94 | Runtime protocol conformance entry checklist | P3 | 未开始 | 定义进入 conformance 的最小前置条件 | U-728 | checklist |
| U-763 | S94 | Runtime protocol conformance no-go packet | P3 | 未开始 | provider/projection focused regression 后复核 conformance no-go | U-762 | no-go |
| U-764 | S94 | v0.9.1 patch trigger refresh | P2 | 未开始 | 复核 provider/projection guard 是否触发 patch release | U-737/U-745 | release no-go |
| U-765 | S94 | v0.10 trigger refresh after static guards | P2 | 未开始 | 复核是否仍无 schema/package contract bump | U-763 | version no-go |
| U-766 | S94 | Release notes maintenance delta refresh | P3 | 未开始 | 更新未来 patch notes 草稿但不发布 | U-764 | docs |
| U-767 | S94 | Package install smoke after static guards | P2 | 未开始 | 执行 package install smoke 验证新增 guards 未破坏打包 | U-737/U-745 | smoke |
| U-768 | S94 | Release hygiene final rerun after guards | P2 | 未开始 | 执行 release hygiene 并记录结果 | U-767 | gate |
| U-769 | S94 | CI owner gate refresh after new tests | P3 | 未开始 | 新 focused tests 增加后复核是否仍不启用 CI | U-768 | no workflow |
| U-770 | S94 | Npm publish no-go refresh after guards | P3 | 未开始 | 复核 npm publish 是否仍 no-go | U-768 | no publish |
| U-771 | S94 | Branch cleanup owner packet refresh | P3 | 未开始 | 复核远端分支清理是否仍不混入本线 | U-768 | no delete |
| U-772 | S95 | Cross-corpus resolver no-fetch posture audit | P3 | 未开始 | 复核 no-fetch / no-resolver 仍一致 | U-729 | no fetch |
| U-773 | S95 | Knowledge base write trigger after static guards | P3 | 未开始 | 判断新静态 guard 是否构成 KB 写入触发 | U-751 | KB |
| U-774 | S95 | Installed skill sync revisit after static guards | P3 | 未开始 | 复核 repo skill 是否需要 owner-requested installed sync | U-768 | local only |
| U-775 | S95 | Operations topic table sync after new docs | P3 | 未开始 | 更新 operations README 并判断是否仍手维护 | U-751 | docs |
| U-776 | S95 | Handoff compression after new task pool | P3 | 未开始 | 压缩 handoff 当前完成与下一步 | U-781 | handoff |
| U-777 | S95 | Round log short-entry retention after new pool | P3 | 未开始 | 判断是否需要再次归档或继续短记录 | U-781 | round log |
| U-778 | S95 | Public issue `#60` roadmap body refresh after static guards | P3 | 未开始 | 判断 roadmap body 是否需要补当前状态 | U-768 | GitHub |
| U-779 | S95 | Public issue `#64` static prerequisite sync after guards | P3 | 未开始 | 判断 `#64` 是否需要新评论 | U-768 | GitHub |
| U-780 | S95 | Milestone no-go after new task pool | P3 | 未开始 | 复核是否仍不创建 milestone | U-781 | GitHub |
| U-781 | S95 | Next task pool expansion or release closeout decision | P3 | 未开始 | 扩展下一批任务池或确认进入 closeout | U-780 | planning |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
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
| 717 | U-712 | S89 | Knowledge base write after post-v0.9 retrospective | P3 | 2026-05-13 | operations public sync hygiene doc | knowledge structure read / docs link check | no KB write; required root navigation files absent |
| 718 | U-713 | S89 | MEMORY installed skill sync execution decision | P3 | 2026-05-13 | operations public sync hygiene doc | skill diff / docs link check | installed skill not overwritten |
| 719 | U-714 | S89 | Operations topic table archive/generator revisit | P3 | 2026-05-13 | operations public sync hygiene doc | docs link check | hand-maintained table retained |
| 720 | U-715 | S89 | Task ledger new pool archive sync | P3 | 2026-05-13 | task ledger | task ledger count check | no archive split needed |
| 721 | U-716 | S89 | Handoff next pool compression | P3 | 2026-05-13 | handoff | docs link check | next pool compressed to U-722..U-731 |
| 722 | U-717 | S89 | Round log short-entry discipline check | P3 | 2026-05-13 | round log | docs link check | short-entry discipline retained |
| 723 | U-718 | S89 | AGENTS proxy / GitHub note parity audit | P3 | 2026-05-13 | operations public sync hygiene doc / MEMORY | docs link check | proxy and GitHub authorization notes aligned |
| 724 | U-719 | S89 | Public issue `#60` body checkbox reconciliation decision | P3 | 2026-05-13 | `gh issue view 60` | GitHub issue read / docs link check | no body/comment edit |
| 725 | U-720 | S89 | Public issue `#64` runtime fixture progress comment decision | P3 | 2026-05-13 | `gh issue view 64` | GitHub issue read / docs link check | no new comment |
| 726 | U-721 | S89 | Milestone no-go revisit after new pool | P3 | 2026-05-13 | `gh api repos/emosamastudio/aods/milestones` | GitHub milestone read / docs link check | zero milestones; no create |
| 727 | U-722 | S90 | Projection guidance source-first candidate | P2 | 2026-05-13 | final semantic candidate decisions doc | historical topic read / docs link check | no standalone source-first正例；推进缺 guidance 负例 |
| 728 | U-723 | S90 | Event correction projection negative fixture | P2 | 2026-05-13 | final semantic candidate decisions doc | docs link check | queued `event-projection-guidance-required` |
| 729 | U-724 | S90 | Policy decision static shape second review | P3 | 2026-05-13 | final semantic candidate decisions doc | docs link check | deferred; no policy engine/schema |
| 730 | U-725 | S90 | Workflow transition static shape second review | P3 | 2026-05-13 | final semantic candidate decisions doc | docs link check | deferred; no workflow engine/schema |
| 731 | U-726 | S90 | Migration dry-run package promotion second no-go | P3 | 2026-05-13 | final semantic candidate decisions doc | package surface check | remains benchmark-only, no package adoption |
| 732 | U-727 | S90 | Adapter provider discovery package boundary after fixture | P3 | 2026-05-13 | final semantic candidate decisions doc | package surface check | no package example before source-first+fixture |
| 733 | U-728 | S90 | Runtime protocol conformance promotion no-go after fixture | P3 | 2026-05-13 | final semantic candidate decisions doc | release hygiene | conformance promotion remains no-go |
| 734 | U-729 | S90 | Cross-corpus authority resolver next research trigger | P3 | 2026-05-13 | final semantic candidate decisions doc | docs link check | no new research; keep no-fetch |
| 735 | U-730 | S90 | Final v0.10 trigger audit | P2 | 2026-05-13 | final semantic candidate decisions doc | release hygiene | no schema/package contract bump |
| 736 | U-731 | S90 | Next comprehensive task discovery | P3 | 2026-05-13 | task ledger U-732..U-781 | task ledger count check | expanded next pool to 50 tasks |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-732 到 U-741 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 current-status body section 已插入 | 后续继续作为 roadmap index |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` 已追加第二条静态前置进展，后续先做静态前置而非 runtime |
| milestone | GitHub milestones | 当前无 milestone；v0.9 已发布；本轮再次决定继续不创建 | 新任务池仍由台账驱动 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；final semantic candidate decisions 已完成；projection guidance 独立 source-first no-go、event correction 缺 guidance 负例进入下一候选；policy/workflow/migration/runtime conformance/cross-corpus/v0.10 均继续 no-go；任务池扩展到 U-732 到 U-781，下一轮默认 U-732 到 U-741。
