# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | post-regression audits and v0.9 version bump complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S73 release execution pending |
| 当前回合 | R-2026-05-13-39 |
| 未完成任务数量 | 10 |
| 已完成任务数量 | 576 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-39 |
| 开始时间 | 2026-05-13 22:20 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-562、U-563、U-564、U-565、U-566、U-567、U-568、U-569、U-570、U-571 |
| 本轮范围 | 上轮质量复审；remote/event/migration focused regression issue linkage audit；public docs no-runtime wording audit；source-first post-regression smoke；package surface / docs examples / generated / security audits；v0.9 version bump implementation；operations ledger/handoff/progress/round-log refresh |
| 排除范围 | tag、GitHub Release、package publish、public issue closeout、roadmap post-release comment、installed skill mutation、workflow engine、policy engine、adapter runtime implementation、event store / replay implementation、migration executor、database connection、CI enablement、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；source-first compile / validate / fixture / conformance；package surface；generated clean；security scan；skill package tests；npm pack dry-run；packed install smoke；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
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
| 547 | U-542 | S70 | Event correction docs and package boundary sync | P2 | 2026-05-13 | source-first README / static records release prep doc | docs link | packaged static example only；no event store/replay |
| 548 | U-543 | S70 | Migration dry-run static report shape decision | P2 | 2026-05-13 | static records release prep doc / migration report helper | focused test | report fields defined with no-execution guards |
| 549 | U-544 | S70 | Migration dry-run benchmark helper implementation | P2 | 2026-05-13 | benchmark helper / fixture / test | `node --test benchmarks/aods-eval-lab/test/migration-dry-run-report.test.mjs` | benchmark-only helper, no migrate command |
| 550 | U-545 | S70 | Migration dry-run report docs sync | P3 | 2026-05-13 | benchmark README / operations doc | docs link | no executor / no database connection boundary documented |
| 551 | U-546 | S70 | Workflow transition static record design | P2 | 2026-05-13 | static records release prep doc | docs link | minimal workflow transition table shape selected |
| 552 | U-547 | S70 | Workflow fixture candidate re-evaluation | P2 | 2026-05-13 | static records release prep doc | docs link | defer focused regression until static artifact exists |
| 553 | U-548 | S70 | Policy decision static record design | P2 | 2026-05-13 | static records release prep doc | docs link | actor / target / decision / evidence refs shape selected |
| 554 | U-549 | S70 | Policy fixture candidate re-evaluation | P2 | 2026-05-13 | static records release prep doc | docs link | defer focused regression until evidence/audit refs are bound |
| 555 | U-550 | S70 | Runtime fixture conformance promotion gate | P2 | 2026-05-13 | static records release prep doc | docs link | remote/event need negative fixture packs first；migration remains benchmark-only |
| 556 | U-551 | S71 | v0.9 version bump patch plan refresh | P1 | 2026-05-13 | static records release prep doc | docs link / release hygiene | version surfaces and verification order listed; no bump this round |
| 557 | U-552 | S71 | v0.9 release notes body final refresh | P1 | 2026-05-13 | release execution prep final doc | docs link | body includes public split, focused regressions, static reports, non-goals |
| 558 | U-553 | S71 | npm pack dry-run final rerun | P1 | 2026-05-13 | `npm pack --dry-run --json` | pack dry-run | aods@0.8.0, entry_count=61, unpackedSize=1145313 |
| 559 | U-554 | S71 | packed install smoke final rerun | P1 | 2026-05-13 | temp tarball install smoke | help / validate / fixture / conformance | installed aods@0.8.0 smoke pass |
| 560 | U-555 | S71 | GitHub release source install smoke final route | P2 | 2026-05-13 | release execution prep final doc | route review | route prepared; do not run before v0.9.0 tag exists |
| 561 | U-556 | S71 | Release hygiene CI enablement decision final | P3 | 2026-05-13 | release execution prep final doc | release hygiene | no CI enablement this round; local gate remains authority |
| 562 | U-557 | S71 | Hosted repeatability owner-run packet | P3 | 2026-05-13 | release execution prep final doc | packet review | optional supplemental only; not v0.9 gate |
| 563 | U-558 | S71 | Archive current operations pruning decision | P3 | 2026-05-13 | release execution prep final doc | docs review | no pruning before release/post-release reconciliation |
| 564 | U-559 | S71 | Handoff pre-release compaction | P3 | 2026-05-13 | handoff / task ledger / progress / round log | docs link | handoff advanced to U-561 complete and next U-562..U-571 |
| 565 | U-560 | S71 | Final release go/no-go rerun | P1 | 2026-05-13 | release execution prep final doc | release hygiene / pack / install smoke | release remains NO-GO until version bump/tag/source install |
| 566 | U-561 | S72 | Runtime follow-up issue body draft | P2 | 2026-05-13 | release execution prep final doc / #64 snapshot | issue body draft review | draft prepared; no body edit this round |
| 567 | U-562 | S72 | Remote regression issue/body linkage audit | P3 | 2026-05-13 | post-regression audits / #64 snapshot | issue body review | static metadata baseline only；no issue body edit |
| 568 | U-563 | S72 | Event correction issue/body linkage audit | P3 | 2026-05-13 | post-regression audits doc | scope review | static correction graph only；no event store/replay issue linkage |
| 569 | U-564 | S72 | Migration dry-run issue/body linkage audit | P3 | 2026-05-13 | post-regression audits doc | scope review | benchmark-only helper；no public issue linkage |
| 570 | U-565 | S72 | Public docs no-runtime wording audit | P2 | 2026-05-13 | README / docs wording audit | `rg` no-runtime audit | no overclaim found |
| 571 | U-566 | S72 | Source-first example post-regression smoke | P2 | 2026-05-13 | compile / validate / fixture / conformance outputs | `npm run compile:pilot && npm run validate:compiled-pilot && npm run fixture:smoke && npm run conformance:compiled-pilot` | source-first smoke pass |
| 572 | U-567 | S72 | Package surface post-regression audit | P2 | 2026-05-13 | package surface / pack dry-run | `npm run package:check-surface -- --json`、`npm pack --dry-run --json` | package entries remain 61 |
| 573 | U-568 | S72 | Docs examples post-regression refresh decision | P3 | 2026-05-13 | post-regression audits doc | docs/examples review | no new public sample needed |
| 574 | U-569 | S72 | Benchmark generated post-regression audit | P3 | 2026-05-13 | generated clean output | `npm run generated:check-clean -- --json` | no generated churn |
| 575 | U-570 | S72 | Security placeholder post-regression audit | P3 | 2026-05-13 | secret-like scan output | `npm run security:scan-placeholders -- --json` | hits=0 |
| 576 | U-571 | S73 | v0.9 version bump implementation | P1 | 2026-05-13 | package / lockfile / README / skill surfaces | version surface audit / skill tests | surfaces bumped to `0.9.0` / `v0.9.0`；tag/release pending |
## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-572 到 U-581 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 pre-release roadmap comment 已发布 | release 后刷新 roadmap tracker |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` 作为后续 runtime/protocol follow-up |
| milestone | GitHub milestones | 当前无 milestone；package surface 已 bump 但 release 未创建 | tag/release 执行前再决定是否仍无需 milestone |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation、public close criteria / roadmap sync、examples / CI / benchmark policy、runtime prerequisite refresh、public close readiness、runtime fixture prerequisite design、focused regressions、static records 和 release execution prep final 已完成；post-regression audits 已完成；package / README / skill surface 已 bump 到 `0.9.0` / `v0.9.0`；下一阶段进入 tag / GitHub Release / source install smoke 和 post-release closeout。
