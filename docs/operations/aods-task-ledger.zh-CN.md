# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | v0.9 release candidate preparation complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S53 capability close criteria；S54 observability close criteria；S55 public roadmap sync |
| 当前回合 | R-2026-05-13-26 |
| 未完成任务数量 | 40 |
| 已完成任务数量 | 446 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-26 |
| 开始时间 | 2026-05-13 13:30 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-432、U-433、U-434、U-435、U-436、U-437、U-438、U-439、U-440、U-441 |
| 本轮范围 | 上轮质量复审；v0.9.0 version surface audit；changelog preparation；release notes draft；package dry-run audit；packed install smoke；release branch decision；public issue close readiness；go/no-go packet；packaged skill release sync check；post-release checklist refresh |
| 排除范围 | version bump、tag、GitHub Release、issue close、issue body edit、label edit、milestone creation、runtime implementation、schema/runtime semantic change、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release hygiene；npm pack dry-run；packed install smoke；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-442 | S53 | Capability issue close criteria matrix | P2 | 未开始 | 定义 #41 关闭所需 metadata/runtime 边界证据 | U-415 | - |
| U-443 | S53 | Capability protocol boundary doc refresh | P2 | 未开始 | 把 metadata-only 与 runtime protocol 的差异写清楚 | U-442 | - |
| U-444 | S53 | Capability fallback negative conformance fixture | P2 | 未开始 | 缺 fallback metadata 的负例进入 conformance | U-412 | - |
| U-445 | S53 | Capability public close decision | P3 | 未开始 | 根据 U-442 到 U-444 判断 #41 是否关闭或继续 open | U-444 | - |
| U-446 | S54 | Observability issue close criteria matrix | P2 | 未开始 | 定义 #59 关闭所需 validate / route / sample 证据 | U-408 | - |
| U-447 | S54 | Route explanation sample generation decision | P3 | 未开始 | 判断 route samples 是否需要生成器而非手工样例 | U-417 | - |
| U-448 | S54 | Validate issue location schema docs | P2 | 未开始 | 文档化 location envelope 字段语义 | U-404 | - |
| U-449 | S54 | Observability telemetry no-go reaffirmation | P3 | 未开始 | 再次确认无 telemetry store / dashboard 默认实现 | U-446 | - |
| U-450 | S55 | Public roadmap body refresh packet | P2 | 未开始 | 准备 #60 body refresh 草稿或继续 comment-only 决策 | U-429 | - |
| U-451 | S55 | Public milestone mapping packet | P3 | 未开始 | 把 open issues 映射到 v0.9 / later，不创建或创建前先记录 | U-430 | - |
| U-452 | S55 | Public roadmap sync execution | P3 | 未开始 | 按 U-450/U-451 决策同步公开状态 | U-450,U-451 | - |
| U-453 | S56 | Current authority checker spike | P2 | 未开始 | 评估 current-authority checker 最小输入/输出 | U-374 | - |
| U-454 | S56 | Implementation repo path fixture | P2 | 未开始 | 为 repo locator / path locator 增加更小负例或决定不加 | U-396 | - |
| U-455 | S56 | Stale evidence negative fixture | P2 | 未开始 | 为 expired / missing review 增加 negative fixture 或 conformance case | U-393 | - |
| U-456 | S56 | Acceptance freshness cross gate implementation decision | P2 | 未开始 | 判断 criteria 与 evidence freshness 是否需要硬 gate | U-399 | - |
| U-457 | S57 | Archive link checker audit | P2 | 未开始 | 确认 archive 文件纳入 docs link check 且无断链 | U-426 | - |
| U-458 | S57 | Historical stale-current label expansion | P3 | 未开始 | 给更多历史文件标记 current / archive / stale | U-425 | - |
| U-459 | S57 | Operations index generator decision | P3 | 未开始 | 判断是否需要生成 operations index | U-422 | - |
| U-460 | S57 | Task ledger maintenance script decision | P3 | 未开始 | 判断是否需要脚本化 archive split / recent window | U-423 | - |
| U-461 | S58 | GitHub release install smoke plan | P2 | 未开始 | 规划从 release tarball / GitHub source 的安装冒烟 | U-441 | - |
| U-462 | S58 | Source-first quickstart sample audit | P2 | 未开始 | 审查 quickstart 是否覆盖 compile / validate / route / conformance | U-413 | - |
| U-463 | S58 | Package sample documentation pass | P3 | 未开始 | 公开说明 package 内外样例边界 | U-416 | - |
| U-464 | S58 | Examples upgrade guidance | P3 | 未开始 | 说明旧示例如何升级到当前 schema | U-462 | - |
| U-465 | S59 | Local hygiene CI design | P2 | 未开始 | 设计 docs link / secret / package / generated clean CI 接入边界 | U-365 | - |
| U-466 | S59 | Generated clean CI dry-run | P3 | 未开始 | 只做可行性验证，不启用 CI | U-465 | - |
| U-467 | S59 | Docs link CI dry-run | P3 | 未开始 | 只做可行性验证，不启用 CI | U-465 | - |
| U-468 | S59 | Secret scan CI dry-run | P3 | 未开始 | 只做可行性验证，不启用 CI | U-465 | - |
| U-469 | S60 | Benchmark summary refresh decision | P3 | 未开始 | 判断是否需要刷新 benchmark summary 文案 | U-421 | - |
| U-470 | S60 | Hosted repeatability gate decision | P3 | 未开始 | 判断 hosted repeatability 是否恢复为默认 gate | U-469 | - |
| U-471 | S60 | Benchmark archive policy implementation | P3 | 未开始 | 若需要，执行 generated archive policy 小改 | U-421 | - |
| U-472 | S60 | Benchmark result clean audit | P3 | 未开始 | 确认 benchmark generated results 无非预期 churn | U-471 | - |
| U-473 | S61 | Workflow runtime prerequisite refresh | P3 | 未开始 | 刷新 workflow runtime PoC 前置条件，不实现 runtime | U-151 | - |
| U-474 | S61 | Event store prerequisite refresh | P3 | 未开始 | 刷新 event store PoC 前置条件，不实现 runtime | U-152 | - |
| U-475 | S61 | Policy engine prerequisite refresh | P3 | 未开始 | 刷新 policy engine PoC 前置条件，不实现 runtime | U-153 | - |
| U-476 | S61 | Remote gateway prerequisite refresh | P3 | 未开始 | 刷新 remote gateway PoC 前置条件，不实现 runtime | U-154 | - |
| U-477 | S61 | Migration tool prerequisite refresh | P3 | 未开始 | 刷新 migration tool PoC 前置条件，不实现 runtime | U-155 | - |
| U-478 | S62 | Public state refresh after operations split | P2 | 未开始 | 刷新 open issues / releases / milestones 状态 | U-452 | - |
| U-479 | S62 | Next issue triage after v0.9 plan | P2 | 未开始 | 根据公开状态重新排序 issue 队列 | U-478 | - |
| U-480 | S62 | Post-operations split retrospective | P3 | 未开始 | 复盘 archive split 对接手效率的影响 | U-426 | - |
| U-481 | S62 | Next task pool expansion after U-432 | P2 | 未开始 | U-432 到 U-480 消耗后扩展下一任务池 | U-432 到 U-480 | - |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 417 | U-412 | S48 | Capability conformance fixture first slice | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | capability fallback metadata validate case 进入 conformance suite |
| 418 | U-413 | S48 | Capability example pack refresh | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | adapter/capability module 展示 partial / unknown fallback metadata |
| 419 | U-414 | S48 | Capability README guidance refresh | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | README 继续强调 metadata-only |
| 420 | U-415 | S48 | Capability public issue sync | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 同步 #41，不关闭 issue |
| 421 | U-416 | S49 | Conformance sample package promotion design | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | packaged examples/fixtures 继续随包；docs examples 不提升为 package surface |
| 422 | U-417 | S49 | Public sample JSON generation policy | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | public samples 为 hand-curated snippets，非 generated golden outputs |
| 423 | U-418 | S49 | Docs example link checker coverage | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | docs/examples JSON files 被 link checker 覆盖 |
| 424 | U-419 | S49 | Security placeholder scan fixture hardening | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 0 hits；不新增低信号 placeholder fixture |
| 425 | U-420 | S49 | Package surface allowlist maintenance docs refresh | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | allowlist 无新增；docs examples 继续不进入 package |
| 426 | U-421 | S49 | Benchmark generated archive split execution decision | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 当前不拆 archive/index，不执行生成器大改 |
| 427 | U-422 | S50 | Operations index split execution | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 旧 operations README 归档，新 README 变成短入口 |
| 428 | U-423 | S50 | Task ledger archive split execution | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 旧完整任务台账归档，当前台账保留 recent window + active pool |
| 429 | U-424 | S50 | Handoff pruning execution | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 旧完整 handoff 归档，当前 handoff 压缩为入口/状态/风险/下一步 |
| 430 | U-425 | S50 | Historical stale-current label pilot | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | archive 文件标记历史归档，当前入口标记 current |
| 431 | U-426 | S50 | Operations navigation link check after split | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | split 后 docs links / release hygiene 通过 |
| 432 | U-427 | S51 | v0.9.0 release candidate planning | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | v0.9.0 作为下一 minor release candidate，先规划不发布 |
| 433 | U-428 | S51 | v0.8.1 patch release decision | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 不建议 v0.8.1；当前变化包含示例/治理能力，优先 v0.9.0 |
| 434 | U-429 | S51 | Public roadmap issue body refresh decision | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | #60 body 暂不编辑，先形成 v0.9 packet 后再同步 |
| 435 | U-430 | S51 | GitHub milestone creation decision | P3 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 当前无 milestone；暂不创建，先用 U-451 形成映射包 |
| 436 | U-431 | S51 | Next task pool expansion after implementation slices | P2 | 2026-05-13 | 当前台账 / round log / supporting doc | release hygiene / docs link / git diff check | 新增 U-432 到 U-481，下一轮默认 U-432 到 U-441 |
| 437 | U-432 | S52 | v0.9.0 version surface audit | P1 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | release hygiene / npm pack dry-run / packed install smoke / git diff check | 当前发布面仍为 v0.8.0，v0.9.0 仅作为下一候选 |
| 438 | U-433 | S52 | v0.9.0 changelog preparation | P1 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | release hygiene / npm pack dry-run / packed install smoke / git diff check | release notes 输入覆盖 term refs / freshness / observability / capability |
| 439 | U-434 | S52 | v0.9.0 release notes draft | P1 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | release hygiene / npm pack dry-run / packed install smoke / git diff check | 形成 GitHub Release body 草稿，不发布 |
| 440 | U-435 | S52 | v0.9.0 package dry-run audit | P1 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | `npm pack --dry-run` | package `aods@0.8.0` 61 files，dry-run 通过 |
| 441 | U-436 | S52 | v0.9.0 packed install smoke | P1 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | packed install smoke | CLI help / packaged validate / fixture smoke / conformance run 通过 |
| 442 | U-437 | S52 | v0.9.0 release branch decision | P2 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | release hygiene / git diff check | 推荐后续直接从 main 做 version bump；需要 PR 审查时再开 release branch |
| 443 | U-438 | S52 | v0.9.0 public issue close readiness | P2 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | GitHub issue snapshot | #60/#59/#41 都未达到关闭条件，本轮不关闭 |
| 444 | U-439 | S52 | v0.9.0 go/no-go packet | P1 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | release hygiene / npm pack dry-run / packed install smoke | 技术 gate go；公开 release no-go，需版本 bump/tag/release body |
| 445 | U-440 | S52 | Packaged skill release sync check | P2 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | release hygiene skill tests | skill 仍与 v0.8.0 对齐，下一 release bump 时同步 |
| 446 | U-441 | S52 | Post-release checklist refresh | P3 | 2026-05-13 | 当前台账 / round log / release candidate prep doc | docs link / release hygiene | 更新发布执行顺序，不执行 release |

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-442 到 U-451 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；暂不编辑 body | U-450 形成 body refresh packet 后再决定 |
| observability | #59 | 保持 open；已有 location / route skipped / sample 进展 | U-446 定义 close criteria |
| capability | #41 | 保持 open；metadata-only fallback 已落地，runtime protocol 仍 deferred | U-442 定义 close criteria |
| milestone | GitHub milestones | 当前无 milestone | U-451 先形成 mapping packet，不在本轮创建 |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation 已完成但未发布；下一阶段进入 capability / observability close criteria 与 public roadmap refresh packet。
