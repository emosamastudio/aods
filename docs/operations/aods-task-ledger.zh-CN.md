# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | operations hygiene synced |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S84 release maintenance planning |
| 当前回合 | R-2026-05-13-48 |
| 未完成任务数量 | 20 |
| 已完成任务数量 | 666 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-48 |
| 开始时间 | 2026-05-13 30:00 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-652、U-653、U-654、U-655、U-656、U-657、U-658、U-659、U-660、U-661 |
| 本轮范围 | 上轮质量复审；round log archive split execution；task ledger automation script feasibility；handoff summary shrink pass；operations README topic table pruning；local MEMORY compaction action；knowledge base write decision after closeout；AGENTS / MEMORY drift check；aods-use installed skill sync explicit plan；`#60` body refresh execution decision；`#64` label / body audit after static records |
| 排除范围 | schema implementation、validator implementation、fixture implementation、conformance promotion、package example promotion、runtime、npm publish、installed skill overwrite、knowledge-base write、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；round log archive link check；task ledger count check；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-662 | S84 | v0.9.1 patch release candidate gate | P2 | 未开始 | 若只含 docs/adoption/ergonomics，准备 v0.9.1 gate | U-629 | - |
| U-663 | S84 | v0.10 semantic scope proposal | P2 | 未开始 | 若进入 schema/validator/static records package surface，定义 v0.10 scope | U-651 | - |
| U-664 | S84 | Next changelog skeleton | P3 | 未开始 | 准备下一 release changelog skeleton | U-662/U-663 | - |
| U-665 | S84 | Package tarball inventory diff baseline | P3 | 未开始 | 保存 v0.9.0 pack inventory baseline 用于下一 release diff | U-619 | - |
| U-666 | S84 | Release notes post-v0.9 delta draft | P3 | 未开始 | 草拟下一 release notes delta，不发布 | U-664 | - |
| U-667 | S84 | Branch cleanup owner packet | P3 | 未开始 | 整理旧远端分支删除候选，不执行删除 | U-626 | GitHub |
| U-668 | S84 | Tag/source mismatch docs note decision | P3 | 未开始 | 判断是否说明 release tag 早于后续 ops docs commits | U-626 | - |
| U-669 | S84 | npm publish owner gate packet | P3 | 未开始 | 梳理 npm 发布前置授权、token、rollback | U-637 | npm |
| U-670 | S84 | CI enablement owner packet refresh | P3 | 未开始 | 重新评估 docs/package/generated hygiene CI 是否开启 | U-598 | CI |
| U-671 | S84 | Hosted repeatability rerun trigger | P3 | 未开始 | 定义何时 rerun hosted repeatability，默认不跑 | U-618 | hosted |
| U-672 | S85 | Projection guidance static invariant design | P2 | 未开始 | 设计 event correction projection guidance 静态约束 | U-612 | no replay |
| U-673 | S85 | Adapter provider discovery example candidate | P2 | 未开始 | 判断是否在 source-first example 增加 provider discovery static record | U-642 | no provider call |
| U-674 | S85 | Policy decision static record source-first candidate | P3 | 未开始 | 判断 policy decision 静态记录是否可进 example | U-615 | no engine |
| U-675 | S85 | Workflow transition static record source-first candidate | P3 | 未开始 | 判断 workflow transition 静态记录是否可进 example | U-614 | no engine |
| U-676 | S85 | Migration dry-run package promotion no-go revisit | P3 | 未开始 | 复核 migration helper 是否继续 benchmark-only | U-611 | no executor |
| U-677 | S85 | Route query failure modes regression plan | P2 | 未开始 | 设计 adoption query miss / overread 的 focused regression | U-623 | - |
| U-678 | S85 | Validate issue location compatibility regression | P3 | 未开始 | 复核 location envelope backward compatibility | U-608 | - |
| U-679 | S85 | Package install smoke automation script | P2 | 未开始 | 评估是否脚本化 release tag install smoke | U-621/U-622 | - |
| U-680 | S85 | Final post-v0.9 retrospective packet | P3 | 未开始 | 整理 v0.9 后第一阶段复盘 | U-630 | - |
| U-681 | S85 | Next milestone / no-milestone final decision | P3 | 未开始 | 结合下一 release 命名决定是否继续 no milestone | U-630 | GitHub |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 637 | U-632 | S81 | README troubleshooting short page implementation | P2 | 2026-05-13 | `docs/adoption-troubleshooting.md` | docs link check | linked from README without expanding main README |
| 638 | U-633 | S81 | External adoption quickstart doc split | P3 | 2026-05-13 | `docs/adoption-quickstart.md` | docs link check | source-first and compiled-corpus paths split |
| 639 | U-634 | S81 | Compiled corpus smoke package sample docs | P3 | 2026-05-13 | compiled-corpus quickstart section | docs link check | package compiled-pilot validate / route sample documented |
| 640 | U-635 | S81 | Release source archive validation script decision | P3 | 2026-05-13 | adoption ergonomics hardening doc | release hygiene | no script this round; U-679 keeps automation review |
| 641 | U-636 | S81 | CLI version ergonomics review | P2 | 2026-05-13 | `bin/aods.mjs` / scaffold regression | focused scaffold regression | `--version`, `-v`, and `version` supported |
| 642 | U-637 | S81 | npm publish criteria packet refresh | P3 | 2026-05-13 | adoption ergonomics hardening doc | release hygiene | no npm publish; owner gate retained |
| 643 | U-638 | S81 | Installed skill refresh owner action packet | P3 | 2026-05-13 | adoption ergonomics hardening doc | release hygiene | no local installed skill overwrite |
| 644 | U-639 | S81 | Docs examples package inclusion revisit | P3 | 2026-05-13 | package surface check | `npm run package:check-surface -- --json` | `docs/examples/` remains out of package |
| 645 | U-640 | S81 | Conformance public sample minimal doc decision | P3 | 2026-05-13 | `docs/adoption-quickstart.md` | docs link check | command-only smoke, no long JSON sample |
| 646 | U-641 | S81 | Compiled-corpus validation troubleshooting sample | P2 | 2026-05-13 | `docs/adoption-troubleshooting.md` | docs link check | normal vs reality validation sample documented |
| 647 | U-642 | S82 | Provider discovery static record proposal | P2 | 2026-05-13 | runtime protocol static records doc | docs link check | static declared discovery only, no live lookup |
| 648 | U-643 | S82 | Auth boundary static record proposal | P2 | 2026-05-13 | runtime protocol static records doc | docs link check | credential class / secret posture / exchange owner fields proposed |
| 649 | U-644 | S82 | Probing posture no-network fixture design | P2 | 2026-05-13 | runtime protocol static records doc | docs link check | no-network fixture candidate sorted |
| 650 | U-645 | S82 | Provider selection no-auto-select design | P3 | 2026-05-13 | runtime protocol static records doc | docs link check | auto-select stays forbidden |
| 651 | U-646 | S82 | Fallback policy no-ranking fixture design | P3 | 2026-05-13 | runtime protocol static records doc | docs link check | runtime ranking / failover stays forbidden |
| 652 | U-647 | S82 | Adapter handshake static metadata proposal | P2 | 2026-05-13 | runtime protocol static records doc | docs link check | input/output/auth/audit static fields proposed, no adapter call |
| 653 | U-648 | S82 | `#64` status comment decision | P3 | 2026-05-13 | `https://github.com/emosamastudio/aods/issues/64#issuecomment-4440776438` | `gh issue comment 64` | short status comment posted without runtime overclaim |
| 654 | U-649 | S82 | Runtime protocol negative fixture candidate sort | P2 | 2026-05-13 | runtime protocol static records doc | docs link check | provider evidence / auth / probe cost first |
| 655 | U-650 | S82 | Static protocol package boundary decision | P3 | 2026-05-13 | runtime protocol static records doc | package surface check | do not promote to package examples yet |
| 656 | U-651 | S82 | Runtime protocol schema gate decision | P2 | 2026-05-13 | runtime protocol static records doc | release hygiene | no schema/validator implementation until shape and source-first candidate stabilize |
| 657 | U-652 | S83 | Round log archive split execution | P2 | 2026-05-13 | round log archive | docs link check | current round log shortened, full history archived |
| 658 | U-653 | S83 | Task ledger automation script feasibility | P3 | 2026-05-13 | operations hygiene sync doc | task ledger count check | no script until repeated drift |
| 659 | U-654 | S83 | Handoff summary shrink pass | P3 | 2026-05-13 | `docs/operations/aods-handoff.zh-CN.md` | docs link check | completed summary compressed |
| 660 | U-655 | S83 | Operations README topic table pruning | P3 | 2026-05-13 | operations hygiene sync doc | docs link check | no generator; archive link updated |
| 661 | U-656 | S83 | Local MEMORY compaction action | P3 | 2026-05-13 | local `MEMORY.md` | local-only review | compacted and kept untracked |
| 662 | U-657 | S83 | Knowledge base write decision after closeout | P3 | 2026-05-13 | operations hygiene sync doc | docs link check | no KB write this round |
| 663 | U-658 | S83 | AGENTS / MEMORY drift check | P3 | 2026-05-13 | operations hygiene sync doc | docs link check | no conflict found |
| 664 | U-659 | S83 | aods-use installed skill sync explicit plan | P3 | 2026-05-13 | operations hygiene sync doc | skill diff review | no installed skill overwrite |
| 665 | U-660 | S83 | `#60` body refresh execution decision | P2 | 2026-05-13 | `https://github.com/emosamastudio/aods/issues/60` | `gh issue edit 60` | current-status section inserted |
| 666 | U-661 | S83 | `#64` label / body audit after static records | P3 | 2026-05-13 | issue #64 audit | `gh issue view 64` | no label/body edit needed |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-662 到 U-671 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 current-status body section 已插入 | 后续继续作为 roadmap index |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` body 已更新，后续先做静态前置而非 runtime |
| milestone | GitHub milestones | 当前无 milestone；v0.9 已发布；本轮决定继续不创建 | 后续按 owner go/no-go packet 决定 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；operations hygiene sync 已完成；round log 已归档拆分，handoff 已压缩，local MEMORY 已压缩但不进仓库；`#60` body current-status 已插入，`#64` labels/body 审查后不改；剩余任务为 U-662 到 U-681，下一轮默认 U-662 到 U-671。
