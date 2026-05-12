# Stale Evidence Refresh Workflow Boundary

任务：U-106
状态：已完成
日期：2026-05-12

## 目标

把 stale implementation evidence 的处理边界写清楚：谁负责、什么时候刷新、刷新后走什么验证、什么时候必须人工复审。这个文件只定义维护流程，不自动抓取外部仓库，也不自动执行 evidence command。

## 当前事实

| 输入 | 结果 |
|---|---|
| `node ./bin/aods.mjs validate ./examples/compiled-pilot --strict --reality --json` | pass |
| linked modules | 8 |
| evidence total | 14 |
| current evidence | 13 |
| planned evidence | 1 |
| stale evidence | 0 |
| blocked evidence | 0 |
| unchecked repo roots | `shift-ops-control-plane`、`shift-ops-worker` 示例路径未在当前 repo root 下解析 |

当前示例没有 stale evidence；本 workflow 是为未来出现 `implementation-evidence-stale` 或 `implementation-current-evidence-missing` 时提供固定处理顺序。

## Owner 边界

| 对象 | Owner |
|---|---|
| `module.meta.implementation.evidence[]` | 声明该 evidence 的 module authority owner |
| `module.meta.implementation.acceptance_criteria[]` | 对应 `surface_ref` 的 authority owner |
| `manifest.project_topology.implementation_repos[]` | design corpus maintainer，只维护 repo identity 和 locator，不替实现仓库背书 |
| 外部实现仓库中的测试、文件、CI 事实 | 对应 implementation repo owner |

如果 owner 不明确，不能把 stale evidence 直接改成 current；必须先保留 stale/planned posture，并开后续任务确认 owner。

## Refresh Trigger

| Trigger | 必须动作 |
|---|---|
| authority surface contract 改变 | 重新确认 evidence 是否仍覆盖新 contract |
| implementation path / repo locator 改变 | 跑 reality validation；若 repo 不可解析，记录 unchecked reason |
| release candidate 前 | 确认 current evidence 至少覆盖所有 current implementation linkage |
| validator 报 `implementation-evidence-stale` | owner 刷新证据或降级 implementation posture |
| validator 报 `implementation-current-evidence-missing` | 增加 current evidence，或把 current linkage 降级为 partial/planned |
| evidence 对应测试、fixture、文件被删除 | 更新 locator、恢复路径，或把证据标为 stale/blocked |

## Refresh Procedure

1. 定位 evidence：从 `module.meta.implementation.evidence[].id` 找到 `acceptance_criteria[].evidence_refs`。
2. 确认 owner：检查 `authority_surface`、`repo_id`、`project_topology.implementation_repos[]`。
3. 不执行命令：只读取声明和路径；需要运行外部测试时，由 implementation repo owner 在其仓库执行并提交结果。
4. 更新 posture：只允许基于 owner 提供的新证据把 stale/planned 改为 current。
5. 复跑 gate：至少跑 `validate --strict`；涉及 locator 时加 `--reality --repo-root <root>`。
6. 记录人工判断：如果无法自动验证，使用 manual-review criterion，并保留 warning debt。

## Validation Gate

| 情况 | Gate |
|---|---|
| 只改本 corpus 的 evidence posture | `npm run validate:all` |
| 改 implementation repo locator 或 path | `node ./bin/aods.mjs validate <root> --strict --reality --repo-root <repo-root>` |
| 改 fixture / golden evidence | `npm run fixture:smoke` + relevant compile/validate command |
| release 前刷新 | `npm run release:self-check` |

## 非目标

- 不自动 fetch sibling repo。
- 不自动执行 evidence locator 或 update command。
- 不把 planned evidence 强行提升为 current。
- 不用 dashboard 结果替代 authority owner 的判断。
