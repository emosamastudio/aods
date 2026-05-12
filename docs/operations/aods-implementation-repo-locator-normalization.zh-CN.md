# Implementation Repo Locator Normalization

任务：U-108
状态：已完成
日期：2026-05-12

## 目标

统一 implementation repo locator 的解释边界，让 path / URL / descriptive-only 三类 locator 在 validation report 中可预测、可维护。

## Locator 类型

| 类型 | 示例 | Validator 行为 | 维护要求 |
|---|---|---|---|
| 相对路径 | `example/shift-ops-worker` | 在 `--repo-root` 下解析 | 必须保持 corpus-contained / repo-root-contained |
| 远端 URL | `https://github.com/example/repo` | 标为 remote unchecked | 不自动 fetch，不当作 missing path |
| SSH URL | `git@github.com:org/repo.git` | 标为 remote unchecked | 不自动 fetch，不当作 missing path |
| 描述性占位 | `prod-worker` | 当前会表现为不可解析路径 | 应改成明确路径或 URL |
| 绝对路径 | `/tmp/repo` | 不应作为可移植 corpus locator | 应改为相对 repo root |
| 越界路径 | `../repo` | 阻断或不可接受 | 必须改成 repo root 内路径 |

## Evidence Locator 规则

implementation evidence locator 只有在 linked implementation repo root 已解析后才检查路径存在性。

| evidence kind | 是否 path-like 检查 |
|---|---|
| `test` | 是 |
| `fixture` | 是 |
| `file-contract` | 是 |
| `ci-check` | 否，只作为检查名或外部状态锚点 |
| `exported-symbol` | 否，只作为符号锚点 |
| `manual-review` | 否，只作为人工复审锚点 |

## 当前示例规范化结论

| repo id | locator | 类型 | 当前 posture |
|---|---|---|---|
| `shift-ops-control-plane` | `example/shift-ops-control-plane` | 相对路径 | 当前 repo root 下不可解析，保持 unchecked |
| `shift-ops-worker` | `example/shift-ops-worker` | 相对路径 | 当前 repo root 下不可解析，保持 unchecked |

## 报错边界

| 规则 | 含义 |
|---|---|
| `implementation-path-contained` | path 尝试逃出 linked repo root |
| `implementation-path-exists` | implementation path 在已解析 repo root 下不存在 |
| `implementation-evidence-locator-contained` | evidence locator 尝试逃出 linked repo root |
| `implementation-evidence-locator-exists` | path-like evidence locator 在已解析 repo root 下不存在 |

## 非目标

- 不改变 root topology semantics。
- 不自动推断 monorepo / multi-repo 布局。
- 不把 CI 名称解析成远端 CI API 调用。
