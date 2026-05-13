# AODS 任务台账

状态：当前权威台账
更新时间：2026-05-13
历史归档：`docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md`

## 台账元信息

| 项 | 内容 |
|---|---|
| 项目 | AODS |
| 状态 | post-v0.9 release adoption evidence complete |
| 更新时间 | 2026-05-13 |
| 当前阶段 | S76 code drift validator hardening |
| 当前回合 | R-2026-05-13-42 |
| 未完成任务数量 | 30 |
| 已完成任务数量 | 606 |

## 当前回合锁定记录

| 字段 | 内容 |
|---|---|
| 回合 ID | R-2026-05-13-42 |
| 开始时间 | 2026-05-13 24:45 Asia/Shanghai |
| 执行者 | 主 agent |
| 选中任务 | U-592、U-593、U-594、U-595、U-596、U-597、U-598、U-599、U-600、U-601 |
| 本轮范围 | 上轮质量复审；release source archive repeatability audit；README install command post-release smoke；package README release link audit；release notes non-goal wording audit；npm publish decision；installed skill package-vs-local drift audit；release hygiene CI reconsideration；hosted repeatability rerun decision；operations archive pruning decision；code drift validator next-slice triage；source-first README non-goal phrase rework |
| 排除范围 | npm publish、CI enablement、hosted repeatability execution、operations archive pruning、installed skill mutation、schema implementation、validator implementation、fixture implementation、runtime implementation、adapter execution、provider calls、auth exchange、dynamic probing、fallback executor、database connection、Polaris sibling repo、`MEMORY.md` |
| 验证计划 | 上轮质量复审；release archive tar/zip audit；README install smoke；package README link audit；release notes audit；installed skill diff; focused scaffold/example-packs test; docs link check；release hygiene final；git diff check；staged set 排除 `MEMORY.md` |
| 新任务处理规则 | 每轮质量复审通过后，从未完成任务表按顺序选择 10 个任务执行；若未完成任务少于 10 个则全部选择。新发现任务必须先进入未完成任务表，不直接插入已锁定回合。 |

## 未完成任务

| 任务 ID | 阶段 | 任务 | 优先级 | 状态 | 验收标准 | 依赖 | 备注 |
|---|---|---|---|---|---|---|---|
| U-602 | S76 | Implementation repo duplicate-id regression review | P1 | 未开始 | 确认 duplicate implementation repo id 是否仍需要 L2 validator coverage | U-601 | - |
| U-603 | S76 | Contract metadata mirror regression audit | P1 | 未开始 | 确认 authoring meta mirror families 是否仍有 compiler drift risk | U-601 | - |
| U-604 | S76 | Lifecycle alias terminology drift fixture revisit | P2 | 未开始 | 复审 `start` vs `begin` 检测是否可用 term_refs 落地 | U-601 | - |
| U-605 | S76 | Glossary deprecated-term strict sample refresh | P2 | 未开始 | 判断 deprecated term strict behavior 是否需要 public example | U-604 | - |
| U-606 | S76 | Route query coverage after structured term refs | P3 | 未开始 | 审查 query terms 是否覆盖 term refs / glossary authority | U-604 | - |
| U-607 | S76 | Evidence freshness post-release fixture gap audit | P2 | 未开始 | 查找 freshness/location diagnostics 的下一个负例缺口 | U-601 | - |
| U-608 | S76 | Validation JSON issue contract stability audit | P2 | 未开始 | 复核 location / suggestion / severity 字段是否稳定 | U-607 | - |
| U-609 | S76 | Conformance report public sample refresh decision | P3 | 未开始 | 决定是否刷新 docs examples conformance sample | U-608 | - |
| U-610 | S76 | Fixture smoke package boundary audit | P3 | 未开始 | 确认 fixture smoke inputs remain package-safe and no secrets | U-609 | - |
| U-611 | S77 | Migration dry-run helper promotion gate review | P2 | 未开始 | 判断 benchmark-only helper 是否可进入 package docs 或继续隐藏 | U-579 | no executor |
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
| 567 | U-562 | S72 | Remote regression issue/body linkage audit | P3 | 2026-05-13 | post-regression audits / #64 snapshot | issue body review | static metadata baseline only；no issue body edit |
| 568 | U-563 | S72 | Event correction issue/body linkage audit | P3 | 2026-05-13 | post-regression audits doc | scope review | static correction graph only；no event store/replay issue linkage |
| 569 | U-564 | S72 | Migration dry-run issue/body linkage audit | P3 | 2026-05-13 | post-regression audits doc | scope review | benchmark-only helper；no public issue linkage |
| 570 | U-565 | S72 | Public docs no-runtime wording audit | P2 | 2026-05-13 | README / docs wording audit | `rg` no-runtime audit | no overclaim found |
| 571 | U-566 | S72 | Source-first example post-regression smoke | P2 | 2026-05-13 | compile / validate / fixture / conformance outputs | `npm run compile:pilot && npm run validate:compiled-pilot && npm run fixture:smoke && npm run conformance:compiled-pilot` | source-first smoke pass |
| 582 | U-577 | S73 | Post-release handoff and ledger closeout | P2 | 2026-05-13 | handoff / ledger / progress / round log | docs link / count check | release state and next pool recorded |
| 583 | U-578 | S73 | Installed skill sync decision after release | P2 | 2026-05-13 | release closeout doc | decision review | no local installed skill mutation this round |
| 584 | U-579 | S73 | Next roadmap task discovery after v0.9 | P2 | 2026-05-13 | task ledger U-582..U-631 | issue / release state review | 50 post-release tasks added |
| 585 | U-580 | S73 | Knowledge base project decision note | P3 | 2026-05-13 | release closeout doc | decision review | no KB write because owner did not explicitly request it |
| 586 | U-581 | S73 | Final post-v0.9 retrospective | P3 | 2026-05-13 | release closeout doc | retrospective review | release / public split / runtime deferral summarized |
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
## 失败或阻塞任务

| 任务 ID | 状态 | 阻塞原因 | 下一步 |
|---|---|---|---|
| 无 | - | 当前无阻塞任务 | 下一轮默认选择 U-602 到 U-611 |

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

完整历史见 `docs/operations/aods-progress-ledger.zh-CN.md`。当前摘要：v0.9 已发布；package / README / skill surface 已同步到 `0.9.0` / `v0.9.0`；GitHub Release `v0.9.0` 已 published；tag source install smoke、README install smoke、archive tar/zip audit、packaged README link audit 和 release notes non-goal audit 通过；本地 installed skill drift 已记录但不覆盖；CI、hosted repeatability、npm publish 和 archive pruning 均保持 no-go；下一阶段进入 code drift validator hardening。
