# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | static records adoption follow-up complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S79 adoption / closeout follow-up |
| 当前回合 | R-2026-05-13-44 |
| 未完成任务数量 | 10 |
| 已完成任务数量 | 626 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-44 |
| 开始时间 | 2026-05-13 26:20 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-612、U-613、U-614、U-615、U-616、U-617、U-618、U-619、U-620、U-621 |
| 本轮范围 | 上轮质量复审；event correction static record next-slice review；remote adapter mismatch static protocol next-slice；workflow transition fixture entry criteria review；policy decision fixture entry criteria review；static records README consolidation decision；benchmark generated summary source audit after release；benchmark hosted cost language refresh decision；benchmark package artifact inventory sample update；public docs density audit after v0.9；source-first adoption quickstart rerun from fresh repo |
| 排除范围 | schema implementation、validator implementation、fixture implementation、workflow engine、policy engine、event store、event replay、adapter execution、provider calls、auth exchange、dynamic probing、fallback executor、migration executor、database connection、public issue edits、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；runtime/static records docs review；benchmark summary source audit；npm pack dry-run JSON；README density count；fresh repo v0.9 install / compile / validate / route；docs link check；targeted generated review；final hygiene after commit；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-622 | S79 | Compiled-corpus adoption smoke from release source | P2 | 未开始 | 从 release source 验证 compiled corpus validate path | U-593 | - |
| U-623 | S79 | External adoption failure-mode packet | P3 | 未开始 | 整理用户采用时最可能失败的 5 类问题 | U-621 | - |
| U-624 | S79 | README troubleshooting section decision | P3 | 未开始 | 判断是否需要新增 troubleshooting 或保持 docs 精简 | U-623 | - |
| U-625 | S80 | Post-v0.9 retrospective issue comment decision | P3 | 未开始 | 决定是否把 retrospective 摘要同步到 `#60` | U-581 | - |
| U-626 | S80 | Release branch/tag cleanup audit | P3 | 未开始 | 确认无临时分支或错误 tag | U-572 | - |
| U-627 | S80 | Local MEMORY compaction decision | P3 | 未开始 | 判断本地 MEMORY 是否需要压缩，仍不进仓库 | U-581 | local-only |
| U-628 | S80 | Operations archive split follow-up | P3 | 未开始 | 决定是否归档旧 round log sections | U-600 | - |
| U-629 | S80 | v0.10 naming / scope trigger decision | P2 | 未开始 | 判断下一 release 目标应为 v0.9.1 还是 v0.10.0 | U-601 | - |
| U-630 | S80 | Next owner go/no-go packet | P2 | 未开始 | 汇总下一阶段推荐路线和 no-go 边界 | U-629 | - |
| U-631 | S80 | Next task pool expansion after first post-release slice | P3 | 未开始 | 若 U-582 到 U-591 后仍需扩展，新增下一批任务 | U-630 | - |

## 最近已完成任务

完整历史见归档文件。当前台账只保留最近 30 项，降低接手成本。

| 完成顺序 | 任务 ID | 阶段 | 任务 | 优先级 | 完成时间 | 验收证据 | 验证命令 | 备注 |
|---:|---|---|---|---|---|---|---|---|
| 597 | U-592 | S75 | Release source archive repeatability audit | P2 | 2026-05-13 | archive tar/zip audit | `gh api .../tarball` / `gh api .../zipball` | archives contain `aods@0.9.0`; tag source intentionally before later ops commits |
| 598 | U-593 | S75 | README install command post-release smoke | P2 | 2026-05-13 | temp install from README command | `npm install ...#v0.9.0` / CLI help | installed `aods@0.9.0` |
| 599 | U-594 | S75 | Package README release link audit | P3 | 2026-05-13 | packed README grep | `npm pack` / `rg v0.9.0` | English and Chinese README release links/install snippets point to v0.9 |
| 600 | U-595 | S75 | Release notes public non-goal wording audit | P3 | 2026-05-13 | release body grep | `gh release view v0.9.0 --json body` | runtime/gateway/migration/provider non-goals explicit |
| 601 | U-596 | S75 | npm publish decision after GitHub release | P2 | 2026-05-13 | adoption evidence doc | decision review | no npm publish without dedicated registry authorization |
| 602 | U-597 | S75 | Installed skill package-vs-local drift audit | P2 | 2026-05-13 | skill diff | `diff -u` | repo skill v0.9 newer; no local overwrite |
| 603 | U-598 | S75 | Release hygiene CI reconsideration after v0.9 | P3 | 2026-05-13 | adoption evidence doc | release hygiene | no CI enablement this round |
| 604 | U-599 | S75 | Hosted repeatability post-release rerun decision | P3 | 2026-05-13 | adoption evidence doc | decision review | no hosted rerun; supplemental only |
| 605 | U-600 | S75 | Operations archive pruning after release | P3 | 2026-05-13 | adoption evidence doc | docs review | no pruning until post-release slices settle |
| 606 | U-601 | S76 | Code drift validator next-slice triage | P1 | 2026-05-13 | adoption evidence doc / focused tests | scaffold + example-packs tests | next route U-602/U-603 review then U-604 lifecycle alias |
| 607 | U-602 | S76 | Implementation repo duplicate-id regression review | P1 | 2026-05-13 | code drift validator hardening review | focused scaffold regression | L2 coverage already present |
| 608 | U-603 | S76 | Contract metadata mirror regression audit | P1 | 2026-05-13 | code drift validator hardening review | focused scaffold regression | redaction / contract / schema_versioning summaries covered |
| 609 | U-604 | S76 | Lifecycle alias terminology drift fixture revisit | P2 | 2026-05-13 | code drift validator hardening review | route query / source example review | detects alias only through structured term refs, not prose |
| 610 | U-605 | S76 | Glossary deprecated-term strict sample refresh | P2 | 2026-05-13 | deprecated-term strict temp smoke | temp compile + strict validate | no public sample refresh |
| 611 | U-606 | S76 | Route query coverage after structured term refs | P3 | 2026-05-13 | route query outputs | `aods route ... --json` | root corpus routes to validation / authority governance |
| 612 | U-607 | S76 | Evidence freshness post-release fixture gap audit | P2 | 2026-05-13 | code drift validator hardening review | scaffold regression / sample review | no conformance promotion yet |
| 613 | U-608 | S76 | Validation JSON issue contract stability audit | P2 | 2026-05-13 | `docs/examples/validate-issue-location.sample.json` review | sample review | location / remediation shape stable |
| 614 | U-609 | S76 | Conformance report public sample refresh decision | P3 | 2026-05-13 | conformance JSON output | `npm run conformance:compiled-pilot -- --json` | no long public JSON sample refresh |
| 615 | U-610 | S76 | Fixture smoke package boundary audit | P3 | 2026-05-13 | fixture/package/security outputs | fixture smoke / package surface / secret scan | package-safe, no secrets |
| 616 | U-611 | S77 | Migration dry-run helper promotion gate review | P2 | 2026-05-13 | migration dry-run regression | migration dry-run report test | stays benchmark-only, no executor |
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
## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-622 到 U-631 |

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

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；static records / adoption follow-up 已完成；event correction 与 remote adapter 保持静态记录路线，workflow / policy 尚不进 fixture；benchmark executive summary 已刷新到 assessed version `0.9.0`；fresh repo source-first adoption smoke 通过；下一阶段进入 adoption / closeout follow-up。
