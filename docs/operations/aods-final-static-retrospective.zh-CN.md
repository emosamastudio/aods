# AODS Final Static Retrospective

日期：2026-05-13
回合：R-2026-05-13-50
范围：U-672 到 U-681

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅本轮文件改动和本地 `MEMORY.md` |
| 最新提交 | 通过 | `a2a048a Document release maintenance gates` |
| 台账指针 | 通过 | 当前默认任务为 U-672 到 U-681 |
| 返工需要 | 无 | 上轮 release maintenance planning 可继续承接 |

## U-672 projection guidance static invariant design

Decision：允许进入下一静态设计池，但不实现 replay、event store 或 projection runtime。

`event correction projection guidance` 只记录“消费者如何理解更正后的可见性”，不是重新执行历史事件。

建议静态字段：

| Field | Purpose |
|---|---|
| `projection_guidance_id` | 稳定标识这条 guidance |
| `event_ref` | 指向被更正或被解释的事件记录 |
| `correction_ref` | 指向更正记录或替代证据 |
| `projection_surface_ref` | 指向受影响的 surface / report / summary |
| `visibility_posture` | `historical` / `advisory` / `replacement` / `blocking` |
| `consumer_action` | 消费者应保留、标记、替换或阻断的动作 |
| `audit_anchor` | 指向可审计证据，而非运行时状态 |

静态 invariant：

1. guidance 必须同时有原事件引用和更正引用；
2. guidance 不允许声明已重放、已修复生产数据或已刷新外部系统；
3. `blocking` posture 必须有 remediation 或 owner decision；
4. guidance 只影响解释，不改变历史记录本身。

## U-673 adapter provider discovery example candidate

Decision：作为下一阶段 source-first candidate，但本轮不改 example。

推荐第一个候选是“provider discovery 缺少 evidence”负例，因为它最能体现 AODS 当前价值：声明可以存在，但没有证据就不能被当成已发现能力。

进入 example 前置条件：

| Gate | 要求 |
|---|---|
| shape stable | provider discovery 静态字段稳定 |
| no provider call | fixture 不能触发网络或 provider lookup |
| validator target clear | 检查点只验证 evidence / source / posture，不做 runtime negotiation |
| docs wording bounded | 示例文案必须说明这是 declared discovery，不是自动发现 |

## U-674 policy decision static record source-first candidate

Decision：暂不进入 source-first example。

原因：policy decision 目前只有记录形状，还没有足够稳定的最低字段组合。如果现在进入 example，容易被误读为已经有 policy engine 或 approval workflow。

后续触发条件：

1. 稳定区分 policy claim、decision、receipt 和 approval；
2. 明确 decision 的 owner、input evidence、scope 和 expiry；
3. 至少有一个负例能证明“缺少 decision evidence”会被发现；
4. public docs 不暗示自动执行 policy。

## U-675 workflow transition static record source-first candidate

Decision：暂不进入 source-first example。

原因：workflow transition 更容易被误解为 workflow engine。当前只适合继续做静态记录研究，不适合进入 packaged adoption path。

后续触发条件：

| Gate | 要求 |
|---|---|
| state vocabulary | start / pend / end 等状态词有 authority record |
| transition evidence | transition 需要 evidence / actor / timestamp posture |
| no engine wording | 不出现 scheduler、executor、automatic transition 语义 |
| negative fixture | 能检测错误 lifecycle alias 或非法 transition reference |

## U-676 migration dry-run package promotion no-go revisit

Decision：继续 no-go；migration dry-run 只保留在 benchmark / fixture 边界，不进入 package adoption surface。

原因：

1. 当前 helper 只是静态报告，不是迁移工具；
2. package adoption surface 若出现 migration dry-run，用户可能误以为可以直接执行数据迁移；
3. 真实迁移需要数据库权限、回滚策略、锁策略和生产变更审计，不属于当前 release 语义。

可接受边界：

| Allowed | Not allowed |
|---|---|
| benchmark fixture report | package quickstart command |
| static dry-run shape docs | `aods migrate` command |
| no-production-mutation invariant | database connection |
| owner gate packet | production migration executor |

## U-677 route query failure modes regression plan

Plan：下一阶段可实现两个 focused regression。

| Regression | 目标 | 验收 |
|---|---|---|
| adoption query miss | 查询安装、版本、首次校验时应命中 adoption / troubleshooting docs | route JSON includes expected modules / skipped reasons |
| overread guard | 窄查询不应把 runtime/protocol proposal 当成 adoption 必读 | selected modules 保持小集合，非相关模块进入 skipped |

实现原则：

1. 只检查 route selection，不引入 semantic judge；
2. fixture query 用真实采用问题，而不是为测试构造的关键词；
3. 失败输出应说明是 query recall 还是 over-selection；
4. 不扩大 package surface。

## U-678 validate issue location compatibility regression

Decision：保持兼容，下一阶段再按最小回归补充。

当前 location envelope 仍应保证：

| Field | Compatibility expectation |
|---|---|
| `module_id` | 指出关联模块或为空 |
| `sid` | 指出 schema / invariant / rule 标识 |
| `path` | 指向 JSON path 或文档路径 |
| `evidence_id` | 能关联证据时必须保留 |
| `remediation` | 新增提示不能破坏既有消费者 |

下一步若实现回归，只验证 JSON shape 稳定，不要求新增错误类型。

## U-679 package install smoke automation script

Implemented：新增 `npm run package:install-smoke`。

脚本做四件事：

1. `npm pack --json` 生成当前 tarball；
2. 在临时目录安装 tarball；
3. 调用安装后的 `aods --version` / `aods --help`；
4. 对 packaged `examples/compiled-pilot` 执行 `validate --strict --json` 和 `route --json`。

验证结果：

| Field | Value |
|---|---|
| package | `aods@0.9.0` |
| version | `0.9.0` |
| help includes version | yes |
| validate status | `pass` |
| route strategy | `query-route` |
| selected modules | `shift-ops-adapter-capability`, `shift-ops-capsule` |

该脚本适合进入 release gate，但仍不等价于 npm registry install smoke。

## U-680 final post-v0.9 retrospective packet

Post-v0.9 第一阶段已收束。

已完成价值：

| Area | Outcome |
|---|---|
| Adoption | 快速开始、故障排查、版本检查和 package sample smoke 更清楚 |
| Public state | `#60/#64` 保持 open 且区分已发布 metadata 与 deferred runtime |
| Static protocol | provider discovery / auth / probing / fallback / handshake 有 proposal，但不实现 runtime |
| Release discipline | v0.9.1 patch gate、v0.10 trigger、npm / CI / hosted owner gates 已明确 |
| Operations | round log / handoff / memory 已压缩，历史归档可查 |

本阶段保留边界：

1. 不实现 runtime negotiation；
2. 不自动发现 provider；
3. 不执行 auth exchange；
4. 不动态 probing；
5. 不做 fallback ranking / executor；
6. 不连接数据库或执行迁移。

## U-681 next milestone / no-milestone final decision

Decision：继续 no milestone。

理由：

1. 当前仍是 file-backed task ledger 驱动，每轮范围足够清楚；
2. `v0.9.1` 只是 patch candidate，还没有 owner 发布决策；
3. `v0.10.0` 尚未触发，因为没有 schema / validator / package contract expansion；
4. GitHub milestone 会制造额外同步面，当前收益低。

下一轮任务池扩展到 U-682 到 U-731；默认每轮选 10 个，先从 provider discovery 静态负例和 release gate 自动化继续。

## 本轮验证

| 验证项 | 命令或方式 | 结果 |
|---|---|---|
| Package install smoke | `npm run package:install-smoke -- --json` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 待最终复跑 |
| Package surface | `npm run package:check-surface -- --json` | 待最终复跑 |
| Release hygiene | `npm run release:hygiene` | 待最终复跑 |

## 后续建议

下一轮默认 U-682 到 U-691：provider discovery source-first candidate insertion plan、provider evidence negative fixture plan、runtime protocol schema minimal slice decision、runtime protocol non-execution regression、provider discovery docs note、auth boundary source-first plan、probe cost negative fixture、fallback ranking overclaim regression、adapter handshake audit fixture 和 `#64` progress sync。
