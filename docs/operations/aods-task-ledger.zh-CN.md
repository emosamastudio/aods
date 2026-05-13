# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | adoption ergonomics hardening complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S82 runtime/protocol static records |
| 当前回合 | R-2026-05-13-46 |
| 未完成任务数量 | 40 |
| 已完成任务数量 | 646 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-46 |
| 开始时间 | 2026-05-13 28:00 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-632、U-633、U-634、U-635、U-636、U-637、U-638、U-639、U-640、U-641 |
| 本轮范围 | 上轮质量复审；README troubleshooting short page implementation；external adoption quickstart doc split；compiled corpus smoke package sample docs；release source archive validation script decision；CLI version ergonomics review；npm publish criteria packet refresh；installed skill refresh owner action packet；docs examples package inclusion revisit；conformance public sample minimal doc decision；compiled-corpus validation troubleshooting sample |
| 排除范围 | schema implementation、validator semantic implementation、fixture implementation、workflow engine、policy engine、event store、event replay、adapter execution、provider calls、auth exchange、dynamic probing、fallback executor、migration executor、database connection、public issue write、npm publish、installed skill overwrite、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；CLI version focused regression；docs link check；package surface check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-642 | S82 | Provider discovery static record proposal | P2 | 未开始 | 设计 provider discovery 静态记录字段，不做 live discovery | U-613 | no runtime |
| U-643 | S82 | Auth boundary static record proposal | P2 | 未开始 | 设计 credential / exchange / redaction / audit boundary 静态记录 | U-642 | no auth |
| U-644 | S82 | Probing posture no-network fixture design | P2 | 未开始 | 设计 network/cost/mutation posture 负例，不执行 probe | U-642 | no network |
| U-645 | S82 | Provider selection no-auto-select design | P3 | 未开始 | 设计 provider selection 静态策略，不自动选择 provider | U-642 | no provider call |
| U-646 | S82 | Fallback policy no-ranking fixture design | P3 | 未开始 | 设计 fallback policy 静态记录，禁止 runtime ranking overclaim | U-645 | no fallback executor |
| U-647 | S82 | Adapter handshake static metadata proposal | P2 | 未开始 | 设计 adapter handshake 静态元数据，不调用 adapter | U-643 | no adapter |
| U-648 | S82 | `#64` status comment decision | P3 | 未开始 | 判断是否给 runtime/protocol tracker 追加静态前置状态评论 | U-647 | GitHub |
| U-649 | S82 | Runtime protocol negative fixture candidate sort | P2 | 未开始 | 排序 provider/auth/probe/fallback/handshake 负例候选 | U-642/U-647 | - |
| U-650 | S82 | Static protocol package boundary decision | P3 | 未开始 | 判断哪些 runtime/protocol 静态记录可进入 package examples | U-649 | - |
| U-651 | S82 | Runtime protocol schema gate decision | P2 | 未开始 | 决定是否进入 schema/validator 实现前置 | U-650 | no implementation yet |
| U-652 | S83 | Round log archive split execution | P2 | 未开始 | 拆分过长 round log，保留当前入口短历史 | U-628 | - |
| U-653 | S83 | Task ledger automation script feasibility | P3 | 未开始 | 评估台账计数 / recent window 自动检查脚本 | U-652 | - |
| U-654 | S83 | Handoff summary shrink pass | P3 | 未开始 | 压缩 handoff completed summary，降低接手成本 | U-652 | - |
| U-655 | S83 | Operations README topic table pruning | P3 | 未开始 | 判断专题表是否拆归档或生成 | U-654 | - |
| U-656 | S83 | Local MEMORY compaction action | P3 | 未开始 | 若超过阈值则本地压缩 MEMORY，仍不进仓库 | U-627 | local-only |
| U-657 | S83 | Knowledge base write decision after closeout | P3 | 未开始 | 判断是否需要 KB 项目决策记录；无明确触发则不写 | U-630 | KB |
| U-658 | S83 | AGENTS / MEMORY drift check | P3 | 未开始 | 复核工作规约与本地记忆是否冲突 | U-656 | local-only |
| U-659 | S83 | aods-use installed skill sync explicit plan | P3 | 未开始 | 整理 repo skill 到 installed skill 的显式同步步骤 | U-638 | local-only |
| U-660 | S83 | `#60` body refresh execution decision | P2 | 未开始 | 决定是否执行 roadmap body current-status 插入 | U-625 | GitHub |
| U-661 | S83 | `#64` label / body audit after static records | P3 | 未开始 | 审查 runtime/protocol tracker 是否需 label/body refresh | U-648 | GitHub |
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
| 617 | U-612 | S77 | Event correction static record next-slice review | P2 | 2026-05-13 | static records adoption follow-up | docs / regression review | no replay/store; next invariant only if narrow |
| 618 | U-613 | S77 | Remote adapter mismatch static protocol next-slice | P2 | 2026-05-13 | static records adoption follow-up | docs / #64 scope review | protocol-record-only; no adapter execution |
| 619 | U-614 | S77 | Workflow transition fixture entry criteria review | P3 | 2026-05-13 | static records adoption follow-up | design review | not fixture-ready |
| 620 | U-615 | S77 | Policy decision fixture entry criteria review | P3 | 2026-05-13 | static records adoption follow-up | design review | not fixture-ready |
| 621 | U-616 | S77 | Static records README consolidation decision | P3 | 2026-05-13 | README density audit | `wc -l` | use linked short doc later, not main README expansion |
| 622 | U-617 | S78 | Benchmark generated summary source audit after release | P3 | 2026-05-13 | refreshed generated summary | `npm run benchmark:summary` | fixed stale assessed_version 0.7.0 -> 0.9.0 |
| 623 | U-618 | S78 | Benchmark hosted cost language refresh decision | P3 | 2026-05-13 | static records adoption follow-up | hosted report/source review | wording still accurate |
| 624 | U-619 | S78 | Benchmark package artifact inventory sample update | P3 | 2026-05-13 | pack inventory snapshot | `npm pack --dry-run --json` | aods@0.9.0, 61 entries |
| 625 | U-620 | S78 | Public docs density audit after v0.9 | P3 | 2026-05-13 | README density audit | `wc -l` | no split this round; prefer linked docs later |
| 626 | U-621 | S79 | Source-first adoption quickstart rerun from fresh repo | P2 | 2026-05-13 | fresh install smoke | install / compile / validate / route | v0.9 source-first adoption pass |
| 627 | U-622 | S79 | Compiled-corpus adoption smoke from release source | P2 | 2026-05-13 | adoption closeout doc | install / validate / route | package compiled corpus validates from `v0.9.0` |
| 628 | U-623 | S79 | External adoption failure-mode packet | P3 | 2026-05-13 | adoption closeout doc | failure-mode review | five likely adoption failures listed |
| 629 | U-624 | S79 | README troubleshooting section decision | P3 | 2026-05-13 | adoption closeout doc | docs density review | no main README expansion; short doc later |
| 630 | U-625 | S80 | Post-v0.9 retrospective issue comment decision | P3 | 2026-05-13 | issue #60 audit | `gh issue view 60` | no new comment this round |
| 631 | U-626 | S80 | Release branch/tag cleanup audit | P3 | 2026-05-13 | branch/tag audit | `git ls-remote --heads/--tags` | no deletion; old branches need owner packet |
| 632 | U-627 | S80 | Local MEMORY compaction decision | P3 | 2026-05-13 | size audit | `wc -l MEMORY.md` | no compaction; local-only |
| 633 | U-628 | S80 | Operations archive split follow-up | P3 | 2026-05-13 | size audit | `wc -l docs/operations/aods-round-log.zh-CN.md` | add follow-up task for archive split |
| 634 | U-629 | S80 | v0.10 naming / scope trigger decision | P2 | 2026-05-13 | adoption closeout doc | release naming review | v0.9.1 for maintenance; v0.10 for semantic/schema changes |
| 635 | U-630 | S80 | Next owner go/no-go packet | P2 | 2026-05-13 | adoption closeout doc | owner packet review | adoption / ops hygiene first; runtime no-go |
| 636 | U-631 | S80 | Next task pool expansion after first post-release slice | P3 | 2026-05-13 | task ledger U-632..U-681 | task discovery | 50 new tasks added |
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

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-642 到 U-651 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 post-release status comment 已发布；body refresh packet 已准备 | 后续若 owner 接受，再执行 body edit |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` body 已更新，后续先做静态前置而非 runtime |
| milestone | GitHub milestones | 当前无 milestone；v0.9 已发布；本轮决定继续不创建 | 后续按 owner go/no-go packet 决定 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；adoption ergonomics hardening 已完成；quickstart / troubleshooting 短页已落地；compiled-corpus package sample、conformance command-only sample、normal vs reality validation troubleshooting 已记录；CLI 已支持 `--version` / `version`；npm publish、installed skill overwrite 和 release archive script 仍保持 owner gate / 后续任务；剩余任务为 U-642 到 U-681，下一轮默认 U-642 到 U-651。
