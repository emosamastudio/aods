# AODS post-v0.8 第二轮任务发现

日期：2026-05-13
任务：U-331
阶段：S38 post-v0.8 second task discovery

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| 最新提交 | 通过 | 最新提交为 `dc62037 Document drift adoption release guard` |
| 任务台账 | 通过 | U-321 到 U-330 已完成，未完成任务数量为 0 |
| 公开事项 | 通过 | 当前 open issues 为 `#60/#59/#41` |
| 质量门禁 | 通过 | `npm run release:hygiene` 通过 |

返工结论：无返工项。上一轮成果合格，可以进入新任务发现。

## 输入快照

| 来源 | 当前状态 | 对后续任务的影响 |
|---|---|---|
| `#60` roadmap tracker | issue body 仍是旧 checklist；comments 已记录 v0.7、v0.8 和 post-v0.8 状态 | 下一轮优先做 tracker body/comment refresh plan，避免公开路线和本地台账继续分叉 |
| `#59` observability | route JSON explanation 已有 `source/reason/dependency`；validation JSON 已有 rule/level/message/path 等基础字段 | 剩余高价值切片是 validator location envelope、suggested actions、skipped-module opt-in 和 sample output pack |
| `#41` capability negotiation | provider/consumer metadata 和 compatibility gates 已有；full runtime negotiation 仍 deferred | 剩余高价值切片是 unsupported reason、fallback posture、static protocol surface 和 partial/unknown fixtures |
| structured term refs | 上轮已确认 prose scan 不适合直接 hard gate | 下一步必须先落结构化 term references，再做 lifecycle alias negative fixture |
| release naming | v0.8.1 / v0.9.0 guard 已有决策 | 需要补 release trigger matrix 和 future notes skeleton，避免 docs-only change 误触发 release |
| runtime no-go | 五类 runtime 仍未满足进入条件 | 需要持续把 no-go 显式同步到公开 tracker，避免把 metadata work 误解成 runtime 交付 |

## 本轮决策

1. 本轮只执行 U-331：任务发现、任务池扩展、交接更新。
2. 新发现任务全部进入未完成任务表，不在本轮直接实现。
3. 下一轮默认从 U-332 到 U-341 选择 10 个任务，先处理公开 tracker 与两个仍 open 的核心 issue，再进入 structured term refs。
4. 仍不启动 runtime、provider execution、remote fetch、CI workflow enablement、release/tag mutation 或 Polaris sibling repo 工作。

## 新任务池

| 任务 ID | 主题 | 优先级 | 验收标准 |
|---|---|---|---|
| U-332 | `#60` public tracker body refresh plan | P1 | 形成 issue body/comment refresh packet，明确哪些旧 checklist 已完成、哪些保留 |
| U-333 | closed issue checklist reconciliation matrix | P1 | 把 `#60` 旧 checklist 与 v0.8 close-on-merge 结果逐项对齐 |
| U-334 | `#60` public update execution decision | P1 | 决定采用 comment、body edit 或两者组合，并记录风险 |
| U-335 | `#59` validator location implementation gate | P1 | 明确 location envelope 是否进入实现，以及最小字段/回归测试 |
| U-336 | `#59` suggested-action implementation gate | P1 | 选出高价值 deterministic rules 的 remediation coverage 下一批 |
| U-337 | route skipped-module opt-in implementation feasibility | P2 | 明确 CLI flag / JSON field / output-size guard，不做 full trace |
| U-338 | observability sample output pack implementation plan | P2 | 规划 validate/route JSON 示例包与公开 docs 入口 |
| U-339 | `#41` unsupported reason schema gate design | P1 | 定义 unsupported reason 的 metadata-only schema / validator 边界 |
| U-340 | `#41` fallback metadata schema gate design | P1 | 定义 fallback posture、degraded behavior、consumer action 字段 |
| U-341 | capability conformance fixture first implementation decision | P1 | 选择 partial / unknown / unsupported-feature 的首批 fixture |
| U-342 | structured term refs schema design | P1 | 定义 term_refs 最小字段、owner、scope、target surface |
| U-343 | structured term refs validator design | P1 | 设计 unresolved / deprecated / alias mismatch 的 deterministic gates |
| U-344 | structured term refs source-first mirror plan | P1 | 明确 authoring source、compile、manifest summary mirror 的同步路径 |
| U-345 | lifecycle alias negative fixture implementation plan | P2 | 用 term_refs 方案重新设计 `start` vs `begin` 负例 |
| U-346 | glossary deprecated term strict behavior decision | P2 | 决定 deprecated term 是 warning、strict block 还是 profile-dependent |
| U-347 | glossary term refs public docs | P2 | 给 README / operations docs 增加 term refs 使用边界 |
| U-348 | code drift evidence freshness next slice | P2 | 选出 evidence freshness 的下一批 validator/report 小切片 |
| U-349 | evidence freshness fixture plan | P2 | 规划 stale/current/blocked evidence fixture 覆盖 |
| U-350 | implementation acceptance manual-review docs refresh | P3 | 更新 manual review posture 和 acceptance criteria 使用说明 |
| U-351 | reality unchecked repo remediation docs update | P3 | 更新 unchecked repo locator 的修复流程 |
| U-352 | package skill install update execution decision | P2 | 决定是否更新本地 installed skill，并记录 owner-trigger rule |
| U-353 | packaged skill drift regression follow-up | P2 | 扩充 packaged skill 与 CLI/help/release surface 的漂移检查 |
| U-354 | task ledger archive split execution plan | P3 | 规划台账历史拆分，不破坏当前权威入口 |
| U-355 | operations index current-pack split execution plan | P3 | 规划 operations README 当前/历史分层 |
| U-356 | current handoff pack pruning | P3 | 压缩 handoff 必读列表，只保留当前高价值入口 |
| U-357 | historical docs stale-current label audit | P3 | 给旧 release/readiness 文档补 stale/current 标签策略 |
| U-358 | README adoption checklist command smoke | P3 | 验证 README adoption checklist 的命令仍可运行 |
| U-359 | v0.8.1 vs v0.9.0 release trigger matrix | P2 | 建立 patch/minor/docs-only release trigger 表 |
| U-360 | next release notes skeleton refresh | P2 | 更新下一 release notes skeleton，不创建 tag |
| U-361 | GitHub release asset policy decision | P3 | 决定是否继续只用 GitHub source archive，还是附加 pack artifact |
| U-362 | CI minimal workflow owner packet | P2 | 给 docs link / generated clean / package surface / validate gate 做 owner packet |
| U-363 | docs link checker CI feasibility rerun | P3 | 复查 docs link checker 是否适合进入 CI |
| U-364 | package surface CI feasibility rerun | P3 | 复查 package surface guard 是否适合进入 CI |
| U-365 | generated clean CI feasibility rerun | P3 | 复查 generated clean guard 是否适合进入 CI |
| U-366 | runtime no-go public issue sync decision | P3 | 决定是否把 runtime no-go 再同步到 `#60` |
| U-367 | capability negotiation public status refresh | P3 | 更新 `#41` 的当前覆盖/剩余工作状态 |
| U-368 | observability public status refresh | P3 | 更新 `#59` 的当前覆盖/剩余工作状态 |
| U-369 | governance roadmap public status refresh | P3 | 更新 `#60` 的 roadmap 状态 |
| U-370 | conformance external adoption example follow-up | P3 | 审查 external adoption example 是否需要更短路径 |
| U-371 | external citation adoption example in README | P3 | 评估是否把 citation snippet 从 operations 提到 public README |
| U-372 | resource surface adoption example in README | P3 | 评估是否把 resource surface snippet 从 operations 提到 public README |
| U-373 | docs density current-authority metadata check | P3 | 规划 authority/currentness metadata checker，不做 prose linter |
| U-374 | paired-surface sync current sample refresh | P3 | 更新 paired sync sample 与现有 validator JSON 字段 |
| U-375 | validation JSON sample pack for public docs | P2 | 保存最小 validate JSON sample，避免 README 过长 |
| U-376 | route JSON sample pack for public docs | P2 | 保存最小 route JSON sample，覆盖 selected/dependency/no full trace |
| U-377 | conformance report sample package inclusion decision | P3 | 决定 sample JSON 是否进入 npm package |
| U-378 | benchmark generated artifact archive policy revisit | P3 | 复查 generated report 是否需要归档策略 |
| U-379 | security placeholder scan pattern review | P3 | 复查 secret-like placeholder 扫描误报/漏报 |
| U-380 | GitHub issue label / milestone hygiene review | P3 | 审查 open issue label/milestone 是否需要调整 |
| U-381 | next task pool expansion after S38 | P2 | 当前 50 项消耗后再次发现任务 |

## 下一轮推荐

下一轮选择 U-332 到 U-341。价值最高、风险最低的顺序是先同步公开 tracker，再处理 observability 和 capability 的 metadata/validator 入口，最后决定首批 conformance fixture。这样可以先降低公开路线漂移，再进入实现。

## 非目标

- 不实现 runtime discovery、auth exchange、provider selection、fallback execution、remote adapter call。
- 不做 full-corpus trace store、dashboard、telemetry backend。
- 不用 prose scan 作为术语 hard gate。
- 不发布 release，不创建 tag，不修改 package version。
- 不把 `MEMORY.md` 纳入仓库。
