# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | policy workflow migration boundary hardening complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S94 runtime protocol and release gate refresh |
| 当前回合 | R-2026-05-13-58 |
| 未完成任务数量 | 20 |
| 已完成任务数量 | 766 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-58 |
| 开始时间 | 2026-05-13 23:19 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-752、U-753、U-754、U-755、U-756、U-757、U-758、U-759、U-760、U-761 |
| 本轮范围 | 上轮质量复审；policy decision minimal field checklist；policy no-engine docs audit；missing evidence fixture plan；promotion no-go；workflow vocabulary authority audit；illegal alias fixture plan；workflow no-engine docs audit；source-first promotion no-go；migration dry-run package boundary audit；README wording audit |
| 排除范围 | policy engine、permission broker、approval workflow、IAM integration、workflow engine、scheduler、executor、natural-language scanner、migration executor、`aods migrate`、package adoption surface expansion、README quickstart expansion、schema/validator/source-first promotion、npm publish、version bump、tag creation、GitHub Release creation、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；docs link check；package surface check；release hygiene final；task ledger count check；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
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
| 737 | U-732 | S91 | Provider discovery source-first preflight | P2 | 2026-05-13 | provider discovery static guard implementation doc | source diff / compile | insertion point and no-network boundary confirmed |
| 738 | U-733 | S91 | Provider discovery positive source-first candidate | P2 | 2026-05-13 | `examples/compiled-pilot-source/authoring.json` | `npm run compile:pilot` | source-first static record added |
| 739 | U-734 | S91 | Provider discovery generated output review | P2 | 2026-05-13 | compiled pilot diff | `npm run validate:compiled-pilot` | sections=23 artifacts=27 |
| 740 | U-735 | S91 | Provider discovery missing evidence negative fixture | P2 | 2026-05-13 | focused regression | `node --test benchmarks/aods-eval-lab/test/route-validate-regression.test.mjs` | missing evidence fails deterministically |
| 741 | U-736 | S91 | Provider evidence validator issue shape | P2 | 2026-05-13 | `lib/validate.mjs` | focused regression | `runtime-protocol-provider-evidence` |
| 742 | U-737 | S91 | Provider discovery focused regression | P2 | 2026-05-13 | route/validate regression test | focused regression | 5 tests pass |
| 743 | U-738 | S91 | Provider discovery non-execution assertion | P2 | 2026-05-13 | `runtime-protocol-provider-network-disabled` | focused regression / route smoke | `network_allowed=false` enforced |
| 744 | U-739 | S91 | Provider discovery docs wording after fixture | P3 | 2026-05-13 | provider discovery static guard implementation doc | docs link check | operations-only wording, README unchanged |
| 745 | U-740 | S91 | Provider discovery package boundary after implementation | P3 | 2026-05-13 | package surface check | `npm run package:check-surface -- --json` | entry_count remains 61 |
| 746 | U-741 | S91 | Provider discovery `#64` progress sync after implementation | P3 | 2026-05-13 | `https://github.com/emosamastudio/aods/issues/64#issuecomment-4442371004` | `gh issue comment 64` | static prerequisite sync only |
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

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-762 到 U-771 |

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

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；policy / workflow / migration boundary hardening 已完成，policy decision 最小字段清单、workflow lifecycle canonical term authority 和 migration dry-run benchmark-only 边界已复核；schema / validator / source-first / package / README quickstart 均未扩大；下一轮默认 U-762 到 U-771。
