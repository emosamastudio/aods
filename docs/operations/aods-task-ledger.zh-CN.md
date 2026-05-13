# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | code drift validator hardening review complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S77 static records follow-up |
| 当前回合 | R-2026-05-13-43 |
| 未完成任务数量 | 20 |
| 已完成任务数量 | 616 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-43 |
| 开始时间 | 2026-05-13 25:30 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-602、U-603、U-604、U-605、U-606、U-607、U-608、U-609、U-610、U-611 |
| 本轮范围 | 上轮质量复审；implementation repo duplicate-id regression review；contract metadata mirror regression audit；lifecycle alias terminology drift fixture revisit；glossary deprecated-term strict sample refresh；route query coverage after structured term refs；evidence freshness post-release fixture gap audit；validation JSON issue contract stability audit；conformance report public sample refresh decision；fixture smoke package boundary audit；migration dry-run helper promotion gate review |
| 排除范围 | schema implementation、validator implementation、compiler implementation、fixture implementation、conformance sample refresh、package docs promotion、runtime implementation、adapter execution、provider calls、auth exchange、dynamic probing、fallback executor、migration executor、database connection、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；focused scaffold/example-packs/fixture/migration tests；route query checks；deprecated-term strict temp smoke；fixture smoke JSON；conformance JSON；package surface JSON；secret placeholder scan；docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-612 | S77 | Event correction static record next-slice review | P2 | 未开始 | 评估 event correction graph 是否需要更多 static invariants | U-579 | no replay |
| U-613 | S77 | Remote adapter mismatch static protocol next-slice | P2 | 未开始 | 评估 capability mismatch 是否需要 protocol record only | U-586 | no adapter execution |
| U-614 | S77 | Workflow transition fixture entry criteria review | P3 | 未开始 | 判断 workflow static record 是否足够进入 fixture | U-579 | no engine |
| U-615 | S77 | Policy decision fixture entry criteria review | P3 | 未开始 | 判断 policy static record 是否足够进入 fixture | U-579 | no engine |
| U-616 | S77 | Static records README consolidation decision | P3 | 未开始 | 判断是否需要一页 public static records adoption doc | U-611/U-612 | - |
| U-617 | S78 | Benchmark generated summary source audit after release | P3 | 未开始 | 确认 release 后 benchmark generated 没有 stale version/source mismatch | U-572 | - |
| U-618 | S78 | Benchmark hosted cost language refresh decision | P3 | 未开始 | 判断 hosted repeatability language 是否仍准确 | U-599 | - |
| U-619 | S78 | Benchmark package artifact inventory sample update | P3 | 未开始 | 判断是否记录 v0.9 pack inventory snapshot | U-576 | - |
| U-620 | S78 | Public docs density audit after v0.9 | P3 | 未开始 | 审查 README 是否过长并给出拆分建议 | U-575 | - |
| U-621 | S79 | Source-first adoption quickstart rerun from fresh repo | P2 | 未开始 | 从空目录安装 v0.9 并跑 source-first quickstart route | U-593 | - |
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
| 587 | U-582 | S74 | `#60` roadmap body refresh packet after v0.9 | P1 | 2026-05-13 | post-v0.9 roadmap/runtime prereqs doc | issue body review | packet prepared; no `#60` body edit this round |
| 588 | U-583 | S74 | `#64` runtime/protocol issue body refresh execution | P1 | 2026-05-13 | `#64` updated body | `gh issue edit 64` / `gh issue view 64` | metadata baseline and runtime entry criteria now explicit |
| 589 | U-584 | S74 | Public open issue label / priority audit after v0.9 | P2 | 2026-05-13 | issue snapshots | `gh issue view 60/64` | labels kept |
| 590 | U-585 | S74 | Milestone creation decision after v0.9 | P3 | 2026-05-13 | milestones API / prereqs doc | `gh api repos/.../milestones` | keep no milestone |
| 591 | U-586 | S74 | Runtime/protocol static record shape plan | P1 | 2026-05-13 | prereqs doc | design review | provider discovery/auth/probing/selection/fallback/handshake records defined |
| 592 | U-587 | S74 | Runtime/protocol trust boundary matrix | P1 | 2026-05-13 | prereqs doc | design review | credential/cost/network/mutation/provider/audit/fallback/exposure boundaries listed |
| 593 | U-588 | S74 | Adapter handshake metadata schema feasibility | P2 | 2026-05-13 | prereqs doc | design review | feasible later; no schema this round |
| 594 | U-589 | S74 | Provider discovery non-execution invariant plan | P2 | 2026-05-13 | prereqs doc | release hygiene | validate/fixture/conformance must not call providers |
| 595 | U-590 | S74 | Fallback ranking deferral contract | P2 | 2026-05-13 | prereqs doc | design review | fallback metadata remains non-executing |
| 596 | U-591 | S74 | Runtime/protocol negative fixture candidate list | P2 | 2026-05-13 | prereqs doc | design review | seven candidate negative fixtures listed; not implemented |
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
## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-612 到 U-621 |

## 负责人判断 / issue 分类

| 分类 | Issue | 判断 | 下一步 |
|---|---|---|---|
| public roadmap | #60 | 保持 open；v0.9 post-release status comment 已发布；body refresh packet 已准备 | 后续若 owner 接受，再执行 body edit |
| observability | #59 | 已关闭 metadata/reporting scope | 后续 runtime/dashboard/trace backend 不在当前 release 范围 |
| capability | #41 | 已关闭 metadata-first scope；runtime/protocol 已拆到 `#64` | `#64` body 已更新，后续先做静态前置而非 runtime |
| milestone | GitHub milestones | 当前无 milestone；v0.9 已发布；本轮决定继续不创建 | 下一轮默认进入 code drift validator hardening |

## 新发现任务暂存区

新增任务必须按优先级和依赖关系插入“未完成任务”表后，才能从暂存区移除。

| 发现时间 | 来源 | 建议任务 ID | 阶段 | 优先级 | 任务 | 验收标准 | 依赖 | 与失败任务关系 |
|---|---|---|---|---|---|---|---|---|
| 无 | - | - | - | - | 当前无新暂存任务 | 新任务必须先写入未完成任务表 | - | - |

## 进度记录

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；package / README / skill surface 已同步到 `0.9.0` / `v0.9.0`；code drift validator hardening review 已确认 duplicate implementation repo id、stable contract metadata mirror、structured term alias / deprecated strict behavior、freshness issue contract、conformance sample、fixture smoke package boundary 和 migration dry-run helper promotion gate 均无新增实现需求；下一阶段进入 static records follow-up。
