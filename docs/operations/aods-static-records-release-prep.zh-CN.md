# AODS static records / release prep

状态：当前专题记录
更新时间：2026-05-13

## 范围

| 项 | 内容 |
|---|---|
| 任务范围 | U-542 到 U-551 |
| 回合 | R-2026-05-13-37 |
| 目标 | 补齐 event correction package 边界、migration dry-run 静态报告、workflow / policy 静态记录形状、focused regression 晋级判断和 v0.9 version bump plan |
| 非目标 | 不执行 migration、不连接数据库、不新增 migrate CLI、不实现 workflow engine、不实现 policy engine、不 bump version、不打 tag、不创建 GitHub Release、不发布 package |

## U-542 event correction docs / package boundary

| 结论 | 内容 |
|---|---|
| Package boundary | source-first pilot 和 compiled pilot 继续进 npm package；event correction graph 是示例和 validator 静态检查，不是事件存储 |
| Runtime boundary | 不 replay event、不查询 event store、不判断当前事实，只检查同一 artifact 内 `correction_of` 目标存在和 `supersedes` 不成环 |
| 验收 | source-first README、compiled README、operations 专题共同声明 no event store / no replay |

## U-543 到 U-545 migration dry-run static report

| 字段 | 要求 |
|---|---|
| `report_id` | 稳定报告 ID |
| `source_authority` | 产生 dry-run 判断的权威 surface |
| `target_authority` | 被检查的目标 surface |
| `migration_kind` | 迁移类型，例如 `db-schema-change` |
| `dry_run_status` | `pass` / `warn` / `blocked` |
| `change_summary` | 只记录预期变化，不执行变化 |
| `object_counts` | tables / columns / destructive operations 等静态计数 |
| `risk_labels` | schema-change、requires-approval、rollback-required 等 |
| `approval_requirements` | approver count、owner、evidence ref |
| `rollback_plan` | rollback owner 与 checkpoint |
| `non_execution_guards` | 必须声明 benchmark-only、no database connection、no migration command、no mutation |

实现位置：

| 文件 | 作用 |
|---|---|
| `benchmarks/aods-eval-lab/src/migration-dry-run-report.mjs` | benchmark-only 静态报告 helper / validator |
| `benchmarks/aods-eval-lab/fixtures/migration-dry-run/static-report.json` | 静态 fixture |
| `benchmarks/aods-eval-lab/test/migration-dry-run-report.test.mjs` | 保证无 executor-shaped 字段 |

## U-546 / U-547 workflow transition static record

最小形状：

| 字段 | 说明 |
|---|---|
| `workflow_id` | 稳定流程 ID |
| `from_state` | 起始状态 |
| `event` | 触发事件 |
| `to_state` | 目标状态 |
| `guard_refs` | 前置条件 refs |
| `receipt_ref` | 静态结果凭据 ref |
| `failure_action` | 不满足时的处理 |
| `non_goal` | 明确不执行 workflow engine |

晋级判断：暂不进入本轮 focused regression。原因是已有 command/receipt 示例能表达 transition 语义，但缺少独立 workflow transition artifact 与负例 fixture；下一步应先在 source-first example 中增加静态 transition table，再考虑 validator hard gate。

## U-548 / U-549 policy decision static record

最小形状：

| 字段 | 说明 |
|---|---|
| `decision_id` | 稳定决策 ID |
| `actor_ref` | 决策主体 |
| `target_ref` | 决策对象 |
| `decision` | allow / deny / needs-review / blocked |
| `policy_ref` | 权威策略 ref |
| `evidence_refs` | 支撑证据 refs |
| `audit_ref` | 审计锚点 |
| `expiry` | 需要时声明时效 |
| `non_goal` | 明确不执行 policy engine |

晋级判断：暂不进入本轮 focused regression。原因是 policy decision 需要先绑定 evidence refs 和 audit refs 的静态字段，再决定哪些 mismatch 应成为 validator rule；不应先做 prose scanner。

## U-550 conformance promotion gate

| Candidate | 判断 | 原因 |
|---|---|---|
| remote adapter mismatch | 暂不晋级 package conformance | 已有 focused test；进入 package conformance 前需要负例 fixture manifest 形状 |
| event correction graph | 暂不晋级 package conformance | validator 规则已覆盖；需要新增 negative fixture pack 后再晋级 |
| migration dry-run report | 不晋级 package conformance | 目前是 benchmark-only helper，不属于 npm package adoption surface |

## U-551 v0.9 version bump patch plan

改号必须专门一轮执行，且与 tag / release 分离：

| Surface | 目标 |
|---|---|
| `package.json` | `0.8.0` -> `0.9.0` |
| `package-lock.json` | root package version 同步到 `0.9.0` |
| `README.md` | latest release / install snippets / public version wording 同步到 `v0.9.0` |
| `README.zh-CN.md` | 与英文 README 的版本面保持一致 |
| `skills/aods-use/SKILL.md` | release-aligned wording 如涉及版本必须同步 |
| release notes body | 合并 public split、focused regressions、package/version gate 状态 |
| npm pack dry-run | 改号后必须审查 tarball version 和 entry list |

验收顺序：

1. version surface patch only。
2. `npm run release:hygiene`。
3. `npm pack --dry-run --json`。
4. packed install smoke。
5. final go/no-go 后再进入 tag / GitHub Release / publish。
