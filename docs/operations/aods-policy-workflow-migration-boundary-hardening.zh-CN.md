# AODS policy / workflow / migration boundary hardening

日期：2026-05-13
范围：U-752 到 U-761
状态：已完成

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `3f3bae9 Require projection guidance for corrections` |
| Task ledger | 通过 | U-752 到 U-761 是当前默认下一轮任务 |
| Handoff | 通过 | handoff 指向 projection guidance static guard implementation complete |
| 返工 | 无 | 上轮成果合格，直接进入 policy / workflow / migration boundary hardening |

## 本轮目标

本轮不新增 schema、validator、source-first example、package sample 或 README quickstart。目标是把三个容易被误读成执行能力的方向重新划清边界：

| 方向 | 本轮处理 | 明确排除 |
|---|---|---|
| policy decision | 定义最小字段清单和未来缺 evidence 负例计划 | policy engine、permission broker、approval workflow、IAM integration |
| workflow transition | 复核生命周期状态词 authority 和非法别名负例计划 | workflow engine、scheduler、executor、natural-language scanner |
| migration dry-run | 复核 benchmark-only dry-run 边界和 README wording | migration executor、`aods migrate`、package adoption surface |

## U-752 policy decision minimal field checklist

policy decision 是静态判断摘要，不是真实授权、真实审批或命令执行证明。当前最小字段建议仍停留在 checklist，不进入 schema。

| 字段 | 必要性 | 边界 |
|---|---|---|
| `policy_decision_id` | should | 稳定引用 id；不代表 receipt |
| `input_ref` 或 `input_snapshot_ref` | must | 指向被判断输入；避免 decision 脱离输入上下文 |
| `actor_ref` | must | 声明动作主体；不校验真实身份 |
| `source_surface` | must | 声明判断来源；不读取远程系统 |
| `target_ref` | must | 声明被操作对象；不授予访问权 |
| `operation` | must | 声明动作类型；不执行动作 |
| `risk_labels` | must | 声明风险族；不等同自动风控 |
| `evidence_refs` | must | 指向证据锚点；缺失时不能稳定消费 |
| `decision` | must | 值域沿用 `allow`、`deny`、`review_required`、`escalate`、`blocked` |
| `reason` | must | 解释判断依据；不能写成执行结果 |
| `gate` | should | 声明后续门禁；不创建审批任务 |
| `required_evidence` | should | 声明继续前缺什么；不自动补证据 |
| `receipt_ref` | should | 可回链 receipt；不替代 receipt |
| `audit_anchor` | should | 可回链 actor/source/target/decision；不是 durable audit backend |
| `approval_context` | optional | 只能记录审批上下文；不能声称审批已完成 |

## U-753 policy decision no-engine docs audit

现有文档没有发现需要返工的 policy engine 误导：

| 文件 | 结论 |
|---|---|
| `README.md` | 示例非目标已经明确列出不实现 command executor、event store、adapter negotiation runtime、resource scheduler、crawler、fact checker；未承诺 policy engine |
| `docs/adoption-troubleshooting.md` | 已把创建 schedulers 或 policy engines 列为非目标 |
| `docs/operations/aods-policy-decision-receipt-boundary-refinement.zh-CN.md` | 明确 policy decision、receipt、audit anchor 不能互相替代 |
| `docs/operations/aods-policy-engine-minimal-poc-decision-gate.zh-CN.md` | 当前结论仍是 no-go for implementation |

本轮不改 README。继续保持 policy decision 是可审计的静态判断摘要，而不是权限系统。

## U-754 policy decision missing evidence fixture plan

未来若进入 focused regression，优先设计以下负例：

| 候选规则 | 触发条件 | 预期结果 |
|---|---|---|
| `policy-decision-evidence-required` | stable policy decision 声明 `decision` 但缺 `evidence_refs` 或 `input_snapshot_ref` | strict validate fail |
| `policy-decision-approval-overclaim` | `review_required` / `allow` 文案声称真实审批完成，但没有 `receipt_ref` / `audit_anchor` | strict validate fail 或 focused warning |
| `policy-decision-execution-overclaim` | decision 字段或 reason 写成命令已执行、权限已授予 | strict validate fail |

当前只记录计划，不新增 fixture。进入实现前还需要稳定 source-first 字段形状和 issue location 预期。

## U-755 policy decision promotion gate no-go

policy decision 本轮仍不进入 schema / validator / source-first example：

| Gate | 当前状态 | 决策 |
|---|---|---|
| schema field shape | checklist 已有，但还没有稳定 artifact type | no-go |
| source-first positive example | 缺少与 receipt / audit anchor 同场景的最小闭环 | no-go |
| negative fixture | 已有候选，但未选最小实现切片 | no-go |
| public wording | 非目标清晰，暂无 README 改动需要 | no-go |

下一步若继续，应先做 `policy-decision-evidence-required` 的小负例，而不是直接实现 policy engine。

## U-756 workflow transition state vocabulary authority audit

当前生命周期状态词 authority 由 checked-in glossary 和 structured term refs 承担。示例里 `task-lifecycle-start` 是 canonical term，`begin` 是 alias，`task-begin` 是 deprecated term。

| 层 | 当前能力 | 边界 |
|---|---|---|
| glossary canonical term | `examples/compiled-pilot/indexes/runtime.json` 声明 `task-lifecycle-start` | 可以定义权威词 |
| alias | `begin` 作为 alias 帮助读者理解 | 不能作为机器引用值 |
| deprecated term | `task-begin` 有 replacement | strict gate 会阻断 stable deprecated ref |
| `term_refs[]` | section / artifact / contract metadata 可引用 canonical term id | 检测结构化引用，不扫描任意自然语言 prose |
| manifest summary | `term_ref_summary` mirror 结构化引用 | 是 bootstrap 摘要，不是 runtime resolver |

因此，对于 “start / pend / end 被另一个地方写成 begin” 这类问题，当前能稳定检测的是机器可读字段中的 canonical term drift；如果只是普通段落里随手写了 begin，当前不会做自然语言语义扫描。

## U-757 workflow transition illegal alias fixture plan

未来负例应复用 structured term refs 机制，而不是新建 workflow engine：

| 候选规则 | 触发条件 | 预期结果 |
|---|---|---|
| `workflow-transition-illegal-alias` | workflow / lifecycle 结构化记录用 `begin` 作为 `term_id` | strict validate fail，复用 `term-ref-alias-used` 或包一层更具体 remediation |
| `workflow-transition-deprecated-term` | stable 结构化记录引用 `task-begin` | strict validate fail，复用 `term-ref-deprecated-stable` |
| `workflow-transition-state-evidence-required` | transition 记录有 from/to state 但缺 authority/evidence refs | future focused fail |

当前只记录计划。最小实现应先覆盖 alias-vs-canonical，不实现状态机运行时。

## U-758 workflow transition no-engine docs audit

现有文档没有发现需要返工的 workflow engine 误导：

| 文件 | 结论 |
|---|---|
| `README.md` | dependency edges 已声明不自动扩展 route，也不作为 scheduler |
| `docs/adoption-troubleshooting.md` | 已明确不创建 schedulers 或 policy engines |
| `docs/operations/aods-workflow-runtime-minimal-poc-decision-gate.zh-CN.md` | workflow runtime 仍是 no-go for implementation |
| `docs/operations/aods-structured-term-refs-implementation.zh-CN.md` | 已明确不做 prose semantic scanning、runtime resolver 或自动 rewrite |

本轮不改 README。workflow transition 的下一步仍是静态状态词和证据边界，不是 engine。

## U-759 workflow transition source-first promotion no-go

workflow transition 本轮仍不进 source-first example：

| Gate | 当前状态 | 决策 |
|---|---|---|
| canonical vocabulary | 已有 `task-lifecycle-start` 正例 | 只覆盖术语引用，不覆盖完整 transition |
| transition field set | from/to state、actor、trigger、evidence、timestamp、rollback 尚未稳定 | no-go |
| negative fixture | illegal alias 候选已有，但未落地 | no-go |
| runtime posture | scheduler / executor / engine 仍明确排除 | no-go |

下一步若继续，应优先做结构化 alias 负例，不做 source-first workflow transition 正例。

## U-760 migration dry-run package boundary audit

migration dry-run 当前仍是 benchmark-only 静态报告 helper：

| Surface | 当前状态 | 决策 |
|---|---|---|
| `benchmarks/aods-eval-lab/src/migration-dry-run-report.mjs` | 静态报告 helper，拒绝 executor-shaped fields | 保留 benchmark-only |
| `benchmarks/aods-eval-lab/fixtures/migration-dry-run/static-report.json` | 静态 fixture | 不进 package adoption surface |
| `examples/compiled-pilot-source/README.md` | 明确 benchmark-only migration dry-run reports 不进 npm/GitHub package adoption surface | 保持 |
| package allowlist | 当前 entry count 仍以 package surface guard 为准 | 不扩大 |

本轮不把 dry-run helper 暴露为 CLI，不加入 package sample，不新增 adoption 文档。

## U-761 migration README wording audit

README 中只存在 `upgrade --dry-run` 示例，没有发现 `aods migrate` 或自动迁移承诺：

| 检查点 | 结论 |
|---|---|
| `README.md` | 只有 upgrade dry-run；没有 migration command |
| `bin/aods.mjs` / `lib/upgrade.mjs` | `--dry-run` 属于 upgrade 子命令 |
| benchmark README | 明确 migration dry-run reports 是 benchmark-only static reports |
| operations docs | migration tool 多次记录为 no-go for implementation |

本轮不改 README。继续避免把 upgrade dry-run 误写成 migration dry-run。

## 本轮验收

| 验收项 | 结果 | 证据 |
|---|---|---|
| policy field checklist | 通过 | 本文 U-752 |
| policy no-engine audit | 通过 | 本文 U-753 |
| policy missing evidence fixture plan | 通过 | 本文 U-754 |
| policy promotion no-go | 通过 | 本文 U-755 |
| workflow vocabulary authority audit | 通过 | 本文 U-756 |
| workflow illegal alias fixture plan | 通过 | 本文 U-757 |
| workflow no-engine audit | 通过 | 本文 U-758 |
| workflow source-first no-go | 通过 | 本文 U-759 |
| migration package boundary audit | 通过 | 本文 U-760 |
| migration README wording audit | 通过 | 本文 U-761 |

## 下一步建议

下一轮默认进入 U-762 到 U-771：runtime protocol conformance entry checklist / no-go packet、release trigger refresh、release notes maintenance、package install smoke、release hygiene、CI / npm / branch cleanup gates。
