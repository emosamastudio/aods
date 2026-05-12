# AODS Paired Surface Sync Example Report

任务：U-141
状态：已完成
日期：2026-05-12
范围：paired human/agent sync quality report example；不建 semantic judge

## 目标

给 paired surface sync quality report 提供一个可复制的示例格式，说明如何记录 agent-primary、人类页面、shared invariants 和 sync boundary。

## 当前 Pair Snapshot

| 字段 | 值 |
|---|---|
| pair_id | `pair-shift-ops-readme` |
| agent_primary | `shift-ops-capsule` |
| human_primary | `README.md` |
| sync_source | `agent-primary` |
| status | `paired` |
| shared invariant count | 2 |

## Example Report

| 检查项 | 结果 | 说明 |
|---|---|---|
| pair identity | pass | pair id、agent primary、human primary 均存在 |
| authority source | pass | `sync_source=agent-primary`，人类页面不能反向发明事实 |
| human generation | pass | `mode=deterministic`、`profile=overview` 已声明 |
| shared invariants | pass | 2 条 invariant 已声明 |
| validation posture | pass | compiled pilot strict + reality validation 通过 |
| semantic judge | not applicable | 当前不做自然语言语义判分 |

## Shared Invariants

| 序号 | invariant | 当前用途 |
|---:|---|---|
| 1 | Production database schema changes require two approvers. | 防止 README 漏掉高风险变更审批要求 |
| 2 | sev1 pages primary and secondary on-call within five minutes. | 防止 README 漏掉事故响应约束 |

## 使用边界

| 可用 | 不可用 |
|---|---|
| 记录 pair 是否存在 | 判断 README 所有段落语义是否完整 |
| 记录 shared invariant 是否声明 | 自动证明人类页面无遗漏 |
| 记录 sync source | 让人类页面的权威方向可见 |
| 记录 validation posture | 替代人工审阅 |

## 后续触发

| Trigger | 动作 |
|---|---|
| `agent_primary` 改变 | 重新生成或复核 human surface |
| `shared_invariants` 改变 | 检查 human surface 是否保留关键约束 |
| `sync_source` 改变 | 做 authority review |
| README 加入新承诺 | 回查 agent-primary 是否已有 authority |

## 非目标

- 不建 semantic judge。
- 不做 LLM-based faithfulness scoring。
- 不自动重写 README。
- 不把 human surface 当 authority source。
