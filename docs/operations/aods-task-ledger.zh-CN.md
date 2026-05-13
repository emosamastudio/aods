# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | runtime protocol and release gate refresh complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S95 final static guard closeout and public sync |
| 当前回合 | R-2026-05-13-59 |
| 未完成任务数量 | 10 |
| 已完成任务数量 | 776 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-59 |
| 开始时间 | 2026-05-13 23:28 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-762、U-763、U-764、U-765、U-766、U-767、U-768、U-769、U-770、U-771 |
| 本轮范围 | 上轮质量复审；runtime protocol conformance entry checklist；conformance no-go packet；v0.9.1 patch trigger refresh；v0.10 trigger refresh；release notes maintenance delta refresh；package install smoke；release hygiene final rerun；CI owner gate refresh；npm publish no-go refresh；branch cleanup owner packet refresh |
| 排除范围 | runtime negotiation、provider call、adapter execution、new conformance case、schema/validator/source-first promotion、package adoption surface expansion、README quickstart expansion、CI workflow creation、npm publish、version bump、tag creation、GitHub Release creation、remote branch deletion、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；package install smoke；docs link check；package surface check；release hygiene final；task ledger count check；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
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
| 747 | U-742 | S92 | Projection guidance existing coverage audit | P2 | 2026-05-13 | projection guidance static guard implementation doc | source/read audit | `projection_guidance` column already present |
| 748 | U-743 | S92 | Projection guidance missing negative fixture design | P2 | 2026-05-13 | focused regression | focused test | removes guidance from corrected row |
| 749 | U-744 | S92 | Projection guidance validator issue shape | P2 | 2026-05-13 | `lib/validate.mjs` | focused test | `event-projection-guidance-required` |
| 750 | U-745 | S92 | Projection guidance focused regression | P2 | 2026-05-13 | route/validate regression test | focused regression | 6 tests pass |
| 751 | U-746 | S92 | Projection guidance no-replay wording audit | P3 | 2026-05-13 | remediation / README audit | docs link check | no replay wording retained |
| 752 | U-747 | S92 | Projection guidance route query behavior | P3 | 2026-05-13 | route query smoke | route query | selected only `shift-ops-change-event-log` |
| 753 | U-748 | S92 | Projection guidance conformance promotion no-go | P3 | 2026-05-13 | projection guidance static guard implementation doc | release hygiene | remains focused-regression-only |
| 754 | U-749 | S92 | Projection guidance package sample boundary | P3 | 2026-05-13 | package surface check | package surface check | package surface unchanged |
| 755 | U-750 | S92 | Projection guidance public issue sync decision | P3 | 2026-05-13 | projection guidance static guard implementation doc | docs link check | no GitHub comment |
| 756 | U-751 | S92 | Projection guidance implementation retrospective | P3 | 2026-05-13 | projection guidance static guard implementation doc | docs link check | value/boundary summarized |
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

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-772 到 U-781 |

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

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；runtime protocol / release gate refresh 已完成，static guards 仍不进 conformance，`v0.9.1` / `v0.10.0` 均不触发，package install smoke 和 release hygiene 通过；CI / npm publish / branch cleanup 均继续 no-go；下一轮默认 U-772 到 U-781。
