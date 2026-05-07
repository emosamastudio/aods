# AODS v0.9 Backlog Triage

状态：当前 v0.9 候选路线
日期：2026-05-07
适用范围：v0.8 backlog 清空后的 open issue / owner roadmap 复盘

## 结论

v0.9 不应从 runtime handshake、跨 repo fetch、完整事件总线或行为 oracle 开始。当前最高价值路线是继续收束 write-capable 和 event-facing stable surfaces 的最小审计语义，让 AODS 在进入更深的 runtime / conformance 前先能表达“写入请求、尝试记录、状态后果之间如何追踪”。

已执行的最小切片包括 **U-035 command / receipt / event triad boundary**、**U-036 event correction / supersession boundary**、**U-037 partial implementation / known-gap metadata boundary**、**U-038 ownership and authority hierarchy boundary** 和 **U-039 dependency ordering between surfaces boundary**。U-035 覆盖 GitHub issue `#33` 的最低可验证边界，只做 spec / metadata vocabulary，不新增 command executor、event bus runtime、correction semantics 或 exactly-once delivery guarantee。U-036 覆盖 GitHub issue `#39` 的最低可验证边界，只做 correction / supersession / retraction / projection guidance vocabulary，不实现 event store、automatic replay 或历史数据迁移。U-037 覆盖 GitHub issue `#47` 的最低可验证边界，只做 partial / known-gap metadata vocabulary，不实现全量 roadmap system、自动豁免或 release override。U-038 覆盖 GitHub issue `#50` 的最低可验证边界，只做 ownership / authority hierarchy vocabulary，不实现自动冲突解析器、ownership inference 或 cross-corpus authority runtime。U-039 覆盖 GitHub issue `#51` 的最低可验证边界，只做 dependency ordering vocabulary，不实现 package manager、runtime scheduler 或 cross-repo dependency executor。

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
| 3 | Partial implementation / known-gap metadata | `#47` | 让 planned / partial / waived gaps 可被 agent 和 release gate 读取 | 不做全量 roadmap system 或自动豁免机制 |
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

## 已执行切片：U-036

### 目标

定义 append-only event surfaces 的 correction、supersession、retraction 和 projection guidance 最小边界，避免 event surfaces 把历史记录改写、撤回或替换语义留给自然语言解释。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| correction_event | 新事件声明 correction_of、actor/source、reason、corrected fields、replacement posture | 不改写原事件 |
| supersession_link | supersedes / superseded_by / replacement_event / effective_at 可追踪 | 不自动解决冲突 |
| retraction | retracted_event、retraction reason、replacement event、consumer visibility、audit anchor | 不做删除或擦除流程 |
| projection_guidance | read model、timeline、export、audit view 如何显示 correction posture | 不自动 replay 或迁移 read model |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 event correction / supersession section 和 mapping artifacts。
2. `manifest.json` scope 已同步 event correction。
3. focused regression 覆盖 correction section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 event store、replay runtime 或数据迁移。

## 已执行切片：U-037

### 目标

定义 partial implementation / known-gap metadata 的最小边界，避免 planned、partial、waived 或 known gap 状态只靠自然语言说明，导致 agent 或 release gate 无法判断是否可以稳定消费。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| gap_identity | gap_id、surface_ref、gap_kind、declared_at、authority_surface | 不建 roadmap item identity service |
| missing_capability | missing_capabilities、affected contract fields、lifecycle states、evidence refs | 不做自动 capability discovery |
| blocking_posture | blocking_status、severity floor、target posture、release gate | 不做 automatic waiver 或 release override |
| remediation_plan | owner、expected_remediation、review gate、due posture | 不做全量项目 roadmap system |
| consumer_guidance | allowed use、downgrade path、human review requirement | 不执行 runtime fallback |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 partial implementation / known-gap section 和 mapping artifacts。
2. `manifest.json` scope 已同步 known gap vocabulary。
3. focused regression 覆盖 known-gap section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 roadmap system、automatic waiver、release override 或 validator bypass。

## 已执行切片：U-038

### 目标

定义 overlapping stable surfaces 的 ownership and authority hierarchy 最小边界，避免多个模块、section、artifact、人类 surface、generated index、command、event 或 view 描述同一 claim 时，由 agent 自行猜测谁是权威。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| canonical_authority | overlap_scope、canonical_surface、authority_owner、authority_reason、conflict_policy | 不替 domain authority 做 truth decision |
| derived_surface | source_authority、derivation_rule、freshness_posture、divergence_policy | 不做自动 regeneration |
| alias_surface | alias_of、allowed_use、deprecation_posture、replacement_ref | 不做 runtime redirect |
| conflict_policy | canonical-wins、derived-refresh-required、human-review-required、block-consumption、deprecated-alias | 不做 automatic conflict resolver |
| migration_guidance | replacement_ref、compatibility_window、consumer_action、removal_posture | 不做 automatic migration tool |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 ownership and authority hierarchy section 和 mapping artifacts。
2. `manifest.json` scope 与 runtime summary 已同步 authority hierarchy posture。
3. focused regression 覆盖 ownership section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 automatic conflict resolver、ownership inference、cross-corpus authority runtime 或 automatic migration tool。

## 已执行切片：U-039

### 目标

定义 stable surfaces 之间的 dependency ordering 最小边界，让命令、receipt、event、adapter、export、generated index、validator 和 route 可以表达它们依赖、阻塞、派生、发出或消费哪些 surface，而不是让消费者把每个 surface 当成独立可用。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| requires | hard dependency；target 缺失或不稳定时阻断 stable use | 不做 package manager resolution |
| blocks | 声明 promotion、routing、release 或 stable consumption 被什么阻断 | 不做 automatic approval workflow |
| derives_from | generated / projected / summarized / indexed / exported surface 的 source 和 derivation rule | 不做 automatic build runner |
| emits | command、workflow、adapter、event source 产生 receipt、event、projection、export 或 generated surface | 不做 event bus runtime |
| consumes | command、adapter、validator、route、export 或 generated artifact 读取的 input surface | 不做 runtime data fetch |
| optional_dependency | 非阻塞依赖、fallback behavior、degraded posture | 不执行 automatic fallback |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 surface dependency ordering section 和 mapping artifacts。
2. `manifest.json` scope 与 runtime summary 已同步 dependency ordering posture。
3. focused regression 覆盖 dependency section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 package manager、runtime scheduler、cross-repo dependency executor 或 automatic topological build runner。

## 下一轮建议

下一轮若继续当前路线，首选 **U-040 deprecation and migration format boundary**，覆盖 issue `#52`。它应只定义 deprecation fields、replacement links、migration guidance、affected versions、removal version 和 validation behavior，不应实现 automatic migration tool。
