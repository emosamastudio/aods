# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | final static closeout and next pool expansion complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S96 policy workflow migration next candidates |
| 当前回合 | R-2026-05-13-60 |
| 未完成任务数量 | 50 |
| 已完成任务数量 | 786 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-60 |
| 开始时间 | 2026-05-13 23:36 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-772、U-773、U-774、U-775、U-776、U-777、U-778、U-779、U-780、U-781 |
| 本轮范围 | 上轮质量复审；cross-corpus no-fetch posture audit；knowledge base write trigger；installed skill sync revisit；operations topic table sync；handoff compression；round log retention；`#60` roadmap body refresh；`#64` static prerequisite sync decision；milestone no-go；next task pool expansion |
| 排除范围 | remote fetch、cross-repo mutation、knowledge base structure creation、installed skill overwrite、operations generator、issue close、milestone creation、runtime implementation、version bump、tag creation、GitHub Release creation、npm publish、CI workflow creation、remote branch deletion、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；GitHub open issue / milestone read；docs link check；package surface check；release hygiene final；task ledger count check；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-782 | S96 | Policy decision source-first field shape preflight | P2 | 未开始 | 确认 policy decision 最小字段是否能嵌入现有 example pack | U-755 | no engine |
| U-783 | S96 | Policy decision evidence negative fixture design | P2 | 未开始 | 选定 `policy-decision-evidence-required` 最小负例 | U-782 | plan |
| U-784 | S96 | Policy decision validator rule no-go / go gate | P2 | 未开始 | 判断是否进入 validator 或继续文档候选 | U-783 | gate |
| U-785 | S96 | Policy decision public wording guard | P3 | 未开始 | 复核 README 是否仍不应提 policy decision guard | U-784 | docs |
| U-786 | S96 | Workflow illegal alias focused fixture preflight | P2 | 未开始 | 判断是否复用 `term-ref-alias-used` 覆盖 begin-vs-start | U-757 | terminology |
| U-787 | S96 | Workflow deprecated term strict gate audit | P3 | 未开始 | 复核 `term-ref-deprecated-stable` 是否足够覆盖 workflow 语境 | U-786 | terminology |
| U-788 | S96 | Workflow transition evidence shape checklist | P3 | 未开始 | 定义 from/to state、actor、trigger、evidence、timestamp 最小边界 | U-758 | no engine |
| U-789 | S96 | Migration dry-run static helper next negative candidate | P3 | 未开始 | 选择 missing mapping / executed disguised as dry-run 的下一负例 | U-760 | benchmark-only |
| U-790 | S96 | Migration dry-run package no-go after next candidate | P3 | 未开始 | 复核 benchmark-only helper 仍不进 package | U-789 | no command |
| U-791 | S96 | Next focused implementation candidate selection | P2 | 未开始 | 从 policy/workflow/migration 中选一个最小实现候选 | U-790 | planning |
| U-792 | S97 | Cross-corpus authority resolver trust model refresh | P3 | 未开始 | 复核 no-fetch trust model 是否需要补文档 | U-772 | no fetch |
| U-793 | S97 | Cross-corpus cache freshness no-go packet | P3 | 未开始 | 明确不实现 cache freshness runtime | U-792 | no resolver |
| U-794 | S97 | External citation and cross-corpus boundary audit | P3 | 未开始 | 区分 external citation 与 cross-corpus resolver | U-793 | docs |
| U-795 | S97 | Route query authority scope regression candidate | P2 | 未开始 | 判断是否需要 route authority-scope focused regression | U-794 | route |
| U-796 | S97 | Validation remediation stale wording audit | P3 | 未开始 | 复核新增 static guards remediation 是否有执行暗示 | U-795 | docs/code |
| U-797 | S97 | Package surface guard after operations growth | P3 | 未开始 | 再次确认 operations docs 不进 package | U-796 | package |
| U-798 | S97 | Release hygiene runtime duration snapshot | P3 | 未开始 | 记录 release hygiene 当前耗时和可维护性 | U-797 | gate |
| U-799 | S97 | CI no-enable trigger matrix refresh | P3 | 未开始 | 复核何时启用 CI | U-798 | no workflow |
| U-800 | S97 | Npm publish trigger matrix refresh | P3 | 未开始 | 复核何时 publish | U-798 | no publish |
| U-801 | S97 | Branch cleanup execution eligibility audit | P3 | 未开始 | 逐分支判断是否需要独立 cleanup 回合 | U-798 | no delete |
| U-802 | S98 | Public issue `#60` checklist reconciliation plan | P3 | 未开始 | 判断是否需要把已关闭历史 issue 勾选或保持文本说明 | U-778 | GitHub |
| U-803 | S98 | Public issue `#64` next sync trigger matrix | P3 | 未开始 | 定义下次 comment / body edit 条件 | U-779 | GitHub |
| U-804 | S98 | Milestone creation criteria packet | P3 | 未开始 | 明确 milestone 何时才有价值 | U-780 | GitHub |
| U-805 | S98 | Release closeout readiness after next candidate | P2 | 未开始 | 下一候选完成后重新判断 release closeout | U-791 | release |
| U-806 | S98 | v0.9.1 release notes draft consolidation | P3 | 未开始 | 汇总 maintenance patch notes 但不发布 | U-805 | docs |
| U-807 | S98 | v0.10 semantic trigger watchlist | P3 | 未开始 | 维护 schema/package/conformance trigger 列表 | U-805 | version |
| U-808 | S98 | Installed skill sync owner packet refresh | P3 | 未开始 | 复核是否建议用户显式同步 installed skill | U-774 | local |
| U-809 | S98 | Knowledge base structure prerequisite packet | P3 | 未开始 | 如仍需 KB，列出创建根结构的前置条件 | U-773 | KB |
| U-810 | S98 | Operations archive trigger review | P3 | 未开始 | 判断 round log / handoff 是否需要再归档 | U-777 | ops |
| U-811 | S98 | Task ledger automation trigger review | P3 | 未开始 | 判断是否需要脚本化 ledger count / roll-forward | U-810 | ops |
| U-812 | S99 | Provider discovery conformance promotion revisit | P3 | 未开始 | 复核 provider guard 是否仍不进 conformance | U-763 | no-go |
| U-813 | S99 | Projection guidance conformance promotion revisit | P3 | 未开始 | 复核 projection guard 是否仍不进 conformance | U-763 | no-go |
| U-814 | S99 | Policy decision conformance prerequisite checklist | P3 | 未开始 | 定义未来 policy guard 进 conformance 前置 | U-784 | checklist |
| U-815 | S99 | Workflow terminology conformance prerequisite checklist | P3 | 未开始 | 定义未来 alias guard 进 conformance 前置 | U-786 | checklist |
| U-816 | S99 | Migration dry-run conformance prerequisite checklist | P3 | 未开始 | 定义 benchmark helper 进 conformance 前置 | U-789 | checklist |
| U-817 | S99 | Runtime protocol source-first second candidate audit | P2 | 未开始 | 判断是否需要第二个 runtime/protocol source-first record | U-812 | candidate |
| U-818 | S99 | Adapter handshake static record candidate revisit | P3 | 未开始 | 复核 handshake 是否仍只停留 proposal | U-817 | no runtime |
| U-819 | S99 | Fallback ranking non-execution guard revisit | P3 | 未开始 | 复核 fallback ranking 是否需要 static negative plan | U-818 | no executor |
| U-820 | S99 | Auth boundary credential non-use guard revisit | P3 | 未开始 | 复核 auth boundary 是否需要 credential non-use fixture | U-818 | no auth |
| U-821 | S99 | Dynamic probing cost/network guard revisit | P3 | 未开始 | 复核 probing posture 是否需要 cost/network fixture | U-818 | no probe |
| U-822 | S100 | Compiled pilot source-first candidate backlog audit | P3 | 未开始 | 复核 compiled-pilot source 是否过载 | U-791 | source-first |
| U-823 | S100 | Seven-plane pilot relevance audit after static guards | P3 | 未开始 | 判断旧 pilot 是否仍只作基础示例 | U-822 | docs |
| U-824 | S100 | Public samples stale audit after route/validate guards | P3 | 未开始 | 复核 docs/examples 是否需要刷新 | U-823 | docs |
| U-825 | S100 | README non-goal density audit | P3 | 未开始 | 判断 README 非目标是否过密或仍清晰 | U-824 | docs |
| U-826 | S100 | Chinese README parity audit after static guards | P3 | 未开始 | 复核中文 README 是否需同步 | U-825 | docs |
| U-827 | S100 | Release self-check dry-run trigger audit | P2 | 未开始 | 判断是否需要跑 `release:self-check` | U-805 | release |
| U-828 | S100 | Package tarball inventory refresh trigger | P3 | 未开始 | 判断是否需要新 `npm pack --dry-run --json` baseline | U-827 | package |
| U-829 | S100 | Hosted repeatability no-rerun refresh | P3 | 未开始 | 复核 hosted repeatability 是否仍不跑 | U-828 | benchmark |
| U-830 | S100 | Final maintenance closeout go/no-go | P2 | 未开始 | 判断是否进入 release closeout 或继续 hardening | U-829 | planning |
| U-831 | S100 | Next task pool expansion after S96-S100 | P3 | 未开始 | 扩展或停止下一批任务池 | U-830 | planning |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 757 | U-752 | S93 | Policy decision minimal field checklist | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | checklist only, no schema |
| 758 | U-753 | S93 | Policy decision no-engine docs audit | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | no README change |
| 759 | U-754 | S93 | Policy decision missing evidence fixture plan | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | future negative fixture |
| 760 | U-755 | S93 | Policy decision promotion gate no-go | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | release hygiene | no schema/source-first |
| 761 | U-756 | S93 | Workflow transition state vocabulary authority audit | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | canonical lifecycle refs remain authority |
| 762 | U-757 | S93 | Workflow transition illegal alias fixture plan | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | future begin-vs-start negative fixture |
| 763 | U-758 | S93 | Workflow transition no-engine docs audit | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | no engine wording retained |
| 764 | U-759 | S93 | Workflow transition source-first promotion no-go | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | release hygiene | no source-first example |
| 765 | U-760 | S93 | Migration dry-run package boundary audit | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | package surface check | benchmark-only |
| 766 | U-761 | S93 | Migration dry-run README wording audit | P3 | 2026-05-13 | policy workflow migration boundary hardening doc | docs link check | no `aods migrate` |
| 767 | U-762 | S94 | Runtime protocol conformance entry checklist | P3 | 2026-05-13 | runtime release gate refresh doc | docs link check | entry checklist only |
| 768 | U-763 | S94 | Runtime protocol conformance no-go packet | P3 | 2026-05-13 | runtime release gate refresh doc | release hygiene | no new conformance case |
| 769 | U-764 | S94 | v0.9.1 patch trigger refresh | P2 | 2026-05-13 | runtime release gate refresh doc | release hygiene | no patch release |
| 770 | U-765 | S94 | v0.10 trigger refresh after static guards | P2 | 2026-05-13 | runtime release gate refresh doc | package surface check | no schema/package contract bump |
| 771 | U-766 | S94 | Release notes maintenance delta refresh | P3 | 2026-05-13 | runtime release gate refresh doc | docs link check | draft only |
| 772 | U-767 | S94 | Package install smoke after static guards | P2 | 2026-05-13 | package install smoke JSON | `npm run package:install-smoke -- --json` | package=0.9.0 pass |
| 773 | U-768 | S94 | Release hygiene final rerun after guards | P2 | 2026-05-13 | release hygiene output | `npm run release:hygiene` | aggregate pass |
| 774 | U-769 | S94 | CI owner gate refresh after new tests | P3 | 2026-05-13 | runtime release gate refresh doc | release hygiene | no workflow |
| 775 | U-770 | S94 | Npm publish no-go refresh after guards | P3 | 2026-05-13 | runtime release gate refresh doc | package surface check | no publish/token |
| 776 | U-771 | S94 | Branch cleanup owner packet refresh | P3 | 2026-05-13 | remote heads snapshot | `git ls-remote --heads origin` | no branch deletion |
| 777 | U-772 | S95 | Cross-corpus resolver no-fetch posture audit | P3 | 2026-05-13 | final static closeout and next pool doc | docs link check | no fetch/resolver |
| 778 | U-773 | S95 | Knowledge base write trigger after static guards | P3 | 2026-05-13 | final static closeout and next pool doc | KB structure read | no KB write |
| 779 | U-774 | S95 | Installed skill sync revisit after static guards | P3 | 2026-05-13 | final static closeout and next pool doc | skill diff read | owner-requested sync only |
| 780 | U-775 | S95 | Operations topic table sync after new docs | P3 | 2026-05-13 | operations README | docs link check | hand-maintained |
| 781 | U-776 | S95 | Handoff compression after new task pool | P3 | 2026-05-13 | handoff | docs link check | points to U-782..U-831 |
| 782 | U-777 | S95 | Round log short-entry retention after new pool | P3 | 2026-05-13 | round log | docs link check | no archive split |
| 783 | U-778 | S95 | Public issue `#60` roadmap body refresh after static guards | P3 | 2026-05-13 | `#60` body updated | `gh issue edit 60` | roadmap refreshed |
| 784 | U-779 | S95 | Public issue `#64` static prerequisite sync after guards | P3 | 2026-05-13 | final static closeout and next pool doc | issue read | no new comment |
| 785 | U-780 | S95 | Milestone no-go after new task pool | P3 | 2026-05-13 | milestone read | `gh api repos/emosamastudio/aods/milestones` | no milestone |
| 786 | U-781 | S95 | Next task pool expansion or release closeout decision | P3 | 2026-05-13 | task ledger U-782..U-831 | task ledger count check | expanded 50 tasks |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-782 到 U-791 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 current-status body section 已插入 | 后续继续作为 roadmap index |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` 已追加 provider discovery 静态前置进展，后续仍先做静态前置而非 runtime |
| milestone | GitHub milestones | 当前无 milestone；v0.9 已发布；本轮再次决定继续不创建 | 新任务池仍由台账驱动 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；final static closeout 已完成，cross-corpus 继续 no-fetch，KB 不写入，installed skill 不覆盖，`#60` roadmap body 已刷新，`#64` 不追加评论，无 milestone；任务池扩展到 U-782 到 U-831，下一轮默认 U-782 到 U-791。
