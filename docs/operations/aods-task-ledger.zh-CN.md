# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | examples CI benchmark policy complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S60 benchmark policy；S61 runtime prerequisite refresh；S62 public state / retrospective |
| 当前回合 | R-2026-05-13-29 |
| 未完成任务数量 | 10 |
| 已完成任务数量 | 476 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-29 |
| 开始时间 | 2026-05-13 15:10 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-462、U-463、U-464、U-465、U-466、U-467、U-468、U-469、U-470、U-471 |
| 本轮范围 | 上轮质量复审；source-first quickstart sample audit；package sample documentation pass；examples upgrade guidance；local hygiene CI design；generated clean CI dry-run；docs link CI dry-run；secret scan CI dry-run；benchmark summary refresh decision；hosted repeatability gate decision；benchmark archive policy implementation decision |
| 排除范围 | GitHub Actions enablement、version bump、tag、GitHub Release、benchmark generated churn、hosted runtime gate enablement、runtime implementation、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release hygiene；generated/docs/secret/package dry-runs；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
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
| 447 | U-442 | S53 | Capability issue close criteria matrix | P2 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / focused conformance / docs link / git diff check | #41 metadata criteria 多数满足，runtime/protocol 边界仍需公开收束 |
| 448 | U-443 | S53 | Capability protocol boundary doc refresh | P2 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / focused conformance / docs link / git diff check | 写清 metadata-only contract 与 runtime negotiation 的边界 |
| 449 | U-444 | S53 | Capability fallback negative conformance fixture | P2 | 2026-05-13 | fixture-conventions focused regression | `node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 缺 fallback metadata 的 expected-failure conformance case 通过 |
| 450 | U-445 | S53 | Capability public close decision | P3 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / docs link / git diff check | #41 本轮不关闭；先 public boundary note 或拆 runtime issue |
| 451 | U-446 | S54 | Observability issue close criteria matrix | P2 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / docs link / git diff check | #59 多数满足，location semantics 和 no-go 公开同步后再判断 |
| 452 | U-447 | S54 | Route explanation sample generation decision | P3 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / docs link / git diff check | 继续 hand-curated samples，不上生成器 |
| 453 | U-448 | S54 | Validate issue location schema docs | P2 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / docs link / git diff check | 文档化 location.module_id/sid/path/artifact_id/field/evidence_id 语义 |
| 454 | U-449 | S54 | Observability telemetry no-go reaffirmation | P3 | 2026-05-13 | 当前台账 / round log / public close criteria doc | release hygiene / docs link / git diff check | 再次确认 no telemetry store / dashboard / trace backend |
| 455 | U-450 | S55 | Public roadmap body refresh packet | P2 | 2026-05-13 | 当前台账 / round log / public close criteria doc | GitHub issue snapshot / docs link | 准备 #60 comment-style refresh packet，不直接编辑 body |
| 456 | U-451 | S55 | Public milestone mapping packet | P3 | 2026-05-13 | 当前台账 / round log / public close criteria doc | GitHub milestone API / docs link | 当前无 milestone；暂不创建，先按 v0.9 candidate/later-runtime 映射 |
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

## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-472 到 U-481 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；已评论同步路线图，不编辑 body | 后续 release scope 明确后再刷新 |
| observability | #59 | 保持 open；已评论同步 location semantics / no telemetry boundary | 后续根据 close decision 判断是否关闭 |
| capability | #41 | 保持 open；已评论同步 metadata-first / runtime protocol 边界 | 后续决定关闭 metadata scope 或拆 runtime issue |
| milestone | GitHub milestones | 当前无 milestone；不创建 | release scope 明确后再决定是否创建 v0.9.0 milestone |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.8 已发布；term refs、evidence freshness、validator observability、capability fallback metadata 和 sample maintenance 已完成；operations 文档已拆分归档；v0.9 release candidate preparation 已完成但未发布；public close criteria / roadmap sync packet 已完成且公开同步已执行；source-first / package examples、local hygiene CI design 和 benchmark policy 已完成；下一阶段进入 benchmark clean audit、runtime prerequisite refresh、public state refresh 和 retrospective。
