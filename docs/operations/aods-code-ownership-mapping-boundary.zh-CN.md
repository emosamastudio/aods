# Code Ownership Mapping Boundary Triage

任务：U-112
状态：已完成
日期：2026-05-12

## 目标

定义 code ownership mapping 的 authority、path、review owner、fallback 边界，避免系统自动从路径、仓库名或 CODEOWNERS 猜 owner。

## Authority 顺序

| 层级 | 来源 | 可作为 owner 吗 |
|---|---|---|
| module authority surface | `authority_surface` | 是 |
| implementation repo owner | `project_topology.implementation_repos[]` + owner 明示 | 是，但当前 schema 未显式建模 |
| evidence owner | evidence `authority_surface` | 是 |
| acceptance owner | criterion `authority_surface` | 是 |
| path prefix | `implementation.paths[]` | 否，只能作为定位线索 |
| repo id / locator | `repo_id` / `locator` | 否，只能作为 identity |
| CODEOWNERS | 外部实现仓库文件 | 未来可作为 evidence，但不能自动拉取 |

## 最小 Mapping 候选字段

未来若建 ownership mapping，应保持可审查、非推断：

| 字段 | 说明 |
|---|---|
| `owner_id` | 稳定 owner 标识 |
| `owner_type` | team / role / repo-maintainer / human-review |
| `authority_surface` | 为什么这个 owner 有权 |
| `repo_id` | 适用实现仓库 |
| `path_patterns` | 可选路径范围 |
| `review_gate` | required / advisory / manual-only |
| `fallback_owner` | owner 缺失时的人工兜底 |

## 当前策略

当前不把 ownership mapping 写入 schema。现有 implementation evidence 只要求 `authority_surface`，因此 owner 可追到语义面，但不能追到具体团队。下一步若要落 schema，必须先完成 owner taxonomy 和 review gate 设计。

## 非目标

- 不从路径自动推断 owner。
- 不抓取 CODEOWNERS。
- 不自动请求 review。
- 不把 repo id 当作 team id。
- 不把 unresolved owner 静默视为通过。
