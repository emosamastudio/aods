# AODS v0.9 Backlog Triage

状态：当前 v0.9 候选路线
日期：2026-05-07
适用范围：v0.8 backlog 清空后的 open issue / owner roadmap 复盘

## 结论

v0.9 不应从 runtime handshake、跨 repo fetch、完整事件总线或行为 oracle 开始。当前最高价值路线是继续收束 write-capable 和 event-facing stable surfaces 的最小审计语义，让 AODS 在进入更深的 runtime / conformance 前先能表达“写入请求、尝试记录、状态后果之间如何追踪”。

本轮首选并已执行的最小切片是 **U-035 command / receipt / event triad boundary**。它覆盖 GitHub issue `#33` 的最低可验证边界，只做 spec / metadata vocabulary，不新增 command executor、event bus runtime、correction semantics 或 exactly-once delivery guarantee。

## 输入信号

| 来源 | 信号 | 判断 |
|---|---|---|
| GitHub `#33` | write-capable surfaces 需要 command / receipt / event triad | P1，承接 command completeness profile 和 evidence / acceptance criteria |
| GitHub `#39` | append-only event surfaces 需要 correction / supersession semantics | P1，但应在 triad vocabulary 之后做 |
| GitHub `#47` | partial implementation / known gap metadata | P2，适合作为 governance hardening |
| GitHub `#50` | overlapping surfaces ownership and authority hierarchy | P2，适合作为 authority hardening |
| GitHub `#51/#52` | dependency ordering、deprecation / migration format | P2，依赖 authority hierarchy 和 lifecycle 已有基础 |

## 排序

| 顺序 | 任务 | Issue | 价值 | 非目标 |
|---:|---|---|---|---|
| 1 | Command / receipt / event triad boundary | `#33` | 给 write-capable stable surfaces 建立最小 audit linkage | 不执行 command；不建 event bus；不做 correction semantics |
| 2 | Event correction / supersession boundary | `#39` | 让 append-only surfaces 能表达更正、撤回、替换和 projection guidance | 不做 event store；不改历史数据；不实现 replay runtime |
| 3 | Partial implementation / known-gap metadata | `#47` | 让 planned / partial / waived gaps 可被 agent 和 release gate 读取 | 不做全量 roadmap system |
| 4 | Ownership and authority hierarchy | `#50` | 处理 overlapping surfaces 的 canonical / derived / alias / conflict policy | 不做自动冲突解析器 |
| 5 | Dependency ordering between surfaces | `#51` | 给 surface lifecycle 和 migration 顺序提供可读拓扑 | 不做 package manager |
| 6 | Deprecation and migration format | `#52` | 让 deprecated / removed surfaces 有稳定迁移说明 | 不做自动迁移工具 |

## 已执行切片：U-035

### 目标

定义 write-capable stable surfaces 的 command、receipt、event or projection、triad linkage 最小边界，避免 command profile 只说明 side effects 却没有 durable audit trail。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| command | 写入意图、actor boundary、payload schema、preconditions、idempotency、authorization | 不执行 command |
| receipt | durable attempt record、status、rejection category、observable outputs、audit anchor | 不实现 receipt store |
| event_or_projection | 可观察状态后果、ordering key、replay posture、consumer guidance | 不实现 event bus 或 projection runtime |
| triad_linkage | command / receipt / event_or_projection 的可追踪 ref 链 | 不保证 exactly-once delivery |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 triad section 和 mapping artifacts。
2. `manifest.json` scope 已同步 command receipt event triad。
3. focused regression 覆盖 triad section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不执行任意 command。

## 下一轮建议

下一轮若继续当前路线，首选 **U-036 event correction / supersession boundary**，覆盖 issue `#39`。它应只定义 append-only event surfaces 的 correction_of、supersedes、retraction reason、replacement event 和 projection guidance，不应实现 event store、replay runtime 或数据迁移。
