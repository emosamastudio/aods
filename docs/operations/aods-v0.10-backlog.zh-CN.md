# AODS v0.10 Backlog Triage

状态：当前 v0.10 候选路线
日期：2026-05-07
适用范围：v0.9 write/event/governance 队列清空后的 open issue / owner roadmap 复盘

## 北极星

AODS 继续作为独立的 agent-first 权威规范系统推进。它要解决的问题不是为某个下游项目写适配层，而是让规范、实现位置、证据、验证、风险、权限和漂移处理形成可审查的稳定闭环。

## 结论

v0.10 不应从完整 state-machine schema、runtime observability、外部 citation registry 或 docs ergonomics 开始。当前最高价值、最低风险路线是先定义 agent-consumable surfaces 的标准风险分类，再用这套风险词汇支撑 local/remote exposure、audit log、long-running lifecycle 和 validation/routing observability。

已执行的最小切片包括 **U-041 v0.10 backlog triage**、**U-042 standard risk taxonomy boundary**、**U-043 local-only versus remote-capable constraints**、**U-044 audit-log requirements for commands and adapters** 和 **U-045 lifecycle state-machine profile for operational objects**。U-041 负责重新排序 open issue / owner roadmap，避免重复执行已覆盖 issue。U-042 覆盖 GitHub issue `#44` 的最低可验证边界，只做 canonical risk categories、read/write risk distinction、cost、credential、filesystem、network、external-send、production-mutation、human-approval 和 capability negotiation interaction vocabulary，不实现 runtime policy engine、permission broker、dynamic risk scanner 或 approval workflow。U-043 覆盖 GitHub issue `#46` 的最低可验证边界，只做 local-only、local-export、remote-read、remote-write、adapter-facing 和 upgrade gates 的 exposure vocabulary，不实现 remote API gateway、auth runtime、network broker 或 automatic exposure upgrader。U-044 覆盖 GitHub issue `#45` 的最低可验证边界，只做 commands/adapters action trace 的 audit metadata vocabulary，不实现 audit log store、workflow engine、SIEM integration 或 observability backend。U-045 覆盖 GitHub issue `#37` 的最低可验证边界，只做 lifecycle state-machine profile vocabulary，不实现 workflow engine、scheduler、retry runtime 或 cleanup executor。

## 输入信号

| 来源 | 信号 | 判断 |
|---|---|---|
| GitHub `#44` | agent-consumable surfaces 需要统一 risk labels | P2，但对安全边界和后续 `#45/#46/#41` 是共同前置词汇 |
| GitHub `#45` | commands / adapters 需要 audit-log requirements | 有价值，但应依赖 risk taxonomy 和 command triad vocabulary |
| GitHub `#46` | local-only 和 remote-capable surfaces 需要约束区分 | 有价值，但应复用 risk taxonomy 和 exposure lifecycle |
| GitHub `#37` | long-running operational objects 需要 state-machine profile | P1，但实现面更大，应在 risk / audit vocabulary 后再裁剪 |
| GitHub `#59` | validation / routing decisions 需要 observability metadata | P3，可作为后续 tooling transparency 切片 |
| GitHub `#60` | 总路线 tracker | 作为 roadmap 输入，不直接作为实现任务 |

## 排序

| 顺序 | 任务 | Issue | 价值 | 非目标 |
|---:|---|---|---|---|
| 1 | Standard risk taxonomy boundary | `#44` | 给 agent-consumable read/write/adapter/resource surfaces 建立统一风险词汇 | 不做 runtime policy engine、permission broker、dynamic risk scanner |
| 2 | Local-only versus remote-capable constraints | `#46` | 防止 local export 被误当 adapter/API-safe contract | 不做 remote API gateway 或 auth runtime |
| 3 | Audit-log requirements for commands and adapters | `#45` | 把 command / receipt / event triad 的 audit 字段收束为可检查 shape | 不实现 audit log store |
| 4 | Lifecycle state-machine profile for operational objects | `#37` | 给 long-running objects 的 state、terminal、retry、cancel、timeout 建立最小 profile | 不做 workflow engine |
| 5 | Observability metadata for validation and routing | `#59` | 解释 why loaded / why failed / why skipped，提升 agent debug 能力 | 不重写 CLI output subsystem |
| 6 | Documentation / authoring quality backlog | `#54-#58` | 提升长期作者体验和 retrieval quality | 不抢风险 / exposure / audit 主线 |

## 下一切片：U-046

### 目标

定义 validation 和 routing decisions 的 observability metadata 最小边界，让 validate/route output 能解释 rule id、severity、source location、dependency path、routing reason、selected/skipped modules 和 suggested next action。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| rule_identity | validation rule id、severity、source、layer | 不重写 validator engine |
| source_location | file、json pointer、section/artifact ref、line/column when available | 不实现 source map runtime |
| dependency_path | dependency chain、ref path、blocking edge、missing target | 不做 graph database |
| routing_reason | why loaded、why selected、why skipped、score/fallback posture | 不重写 route ranking |
| selected_skipped_modules | selected modules、skipped modules、skip reason、consumer guidance | 不做 UI report builder |
| suggested_next_action | remediation hint、owner, gate, command or review guidance | 不实现 automatic fixer |

### 验收标准

1. `spec/stable-surface-contracts.json` 定义 validation/routing observability metadata section、field table 和 non-goals。
2. `manifest.json` scope / runtime summary 同步 validation-routing observability posture。
3. focused stable contract regression 覆盖 observability section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator/runtime output，不重写 CLI output subsystem。

## 已完成切片：U-041

### 目标

在 v0.9 队列清空后，重新审查 open issue backlog / owner roadmap，避免直接把 `#60` 路线图 issue 当作实现任务，也避免重复执行已由 U-029 到 U-040 覆盖的 issue。

### 验收结果

1. open issue list 已重新读取，`#44/#45/#46/#37/#59/#60` 已作为候选重点审查。
2. 已确认下一段路线是 risk / exposure / audit hardening，而不是 runtime handshake、workflow engine 或 docs-only ergonomics。
3. `U-042` 已写入任务台账作为下一轮首选。
4. 本轮只更新 operations 路线和台账，不改语义 spec / schema / validator。

## 已执行切片：U-042

### 目标

定义 agent-consumable surfaces 的标准风险分类，让 AODS 能用统一词汇表达读取、写入、凭据、文件系统、网络、外部发送、成本、生产变更和人工审批风险。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| read_risk | 读取 surface 时可能暴露的敏感、陈旧、局部或权限信息 | 不做 automatic sensitive-data scanner |
| write_risk | command、adapter、resource、generated output 或 release 造成的状态变化 | 不做 runtime policy engine |
| credential_risk | token、secret、credential、handle-only、debug-only exposure 姿态 | 不做 secret manager |
| filesystem_risk | local path、repo path、generated output、stored artifact 的读写风险 | 不做 sandbox 或 filesystem broker |
| network_risk | remote read/write、external fetch、public endpoint、egress 风险 | 不做 network broker |
| external_send_risk | email、issue、PR、release、public post 等外部发送风险 | 不执行外部动作 |
| cost_risk | paid API、compute、storage、quota、rate limit 消耗 | 不做 cost accounting runtime |
| production_mutation_risk | production data/config/deploy/release 的变更风险 | 不做 deploy controller |
| human_approval | 风险何时需要 review、approval、strict gate、release gate 或 security gate | 不做 approval workflow |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 risk taxonomy section、field table 和 non-goals。
2. `manifest.json` scope / runtime summary 已同步 risk taxonomy posture。
3. focused regression 覆盖 risk taxonomy section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 runtime policy engine、permission broker、dynamic risk scanner、approval workflow 或 cost accounting runtime。

## 已执行切片：U-043

### 目标

定义 local-only versus remote-capable constraints 最小边界，防止 local export、debug evidence 或 repo-local material 被误当成 adapter/API-safe contract。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| local_only | 只允许本地 agent、repo、diagnostic、debug 或 evidence 消费的 surface | 不做 sandbox 或 local policy runtime |
| local_export | 本地生成、只在声明 export boundary 内共享的 file/artifact | 不做 export distribution runtime |
| remote_read | 允许远程、API、hosted 或 adapter consumer 读取的 surface | 不做 remote API gateway |
| remote_write | 允许远程 consumer 通过 command、adapter、resource 或 workflow 变更状态 | 不做 command executor 或 auth runtime |
| adapter_facing | adapter capability claim 可被稳定消费的 exposure class | 不做 negotiation session 或 provider discovery |
| upgrade_gate | 从 local-only/local-export 升级到 remote-read/remote-write/adapter-facing 的 review/authority gate | 不做 automatic exposure upgrader |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 local/remote exposure constraints section、field table 和 non-goals。
2. `manifest.json` scope / runtime summary 已同步 local-remote exposure posture。
3. focused regression 覆盖 exposure section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 remote API gateway、auth runtime、network broker、sandbox、remote transport runtime 或 automatic exposure upgrader。

## 已执行切片：U-044

### 目标

定义 commands 和 adapters 的 audit-log requirements 最小边界，让 AODS 能用统一字段表达 actor、source、target、command、idempotency key、policy decision、receipt reference、timestamp 和 correlation identifiers。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| audit_actor | 请求动作的人、agent、service 或 adapter principal | 不实现 identity provider |
| audit_source | 发起动作的 surface、command、adapter capability 或 workflow | 不实现 workflow engine |
| audit_target | 被读取或写入的对象、resource、environment 或 endpoint | 不实现 target inventory runtime |
| command_reference | command_ref、payload schema、schema version、side effect class、retry posture | 不执行 command |
| idempotency_key | idempotency key、duplicate policy、retry group、replay posture | 不实现 exactly-once runtime |
| policy_decision | allow/deny/review/blocked 等决策与决策来源 | 不实现 policy engine |
| receipt_reference | receipt_ref、event_or_projection_ref、status、failure category、observable outputs | 不实现 audit log store 或 event bus |
| timestamp | requested_at、accepted_at/rejected_at、completed_at、emitted_at | 不实现 observability backend |
| correlation_identifier | correlation_id、trace_id、run_id、task_id、parent command | 不实现 distributed tracing runtime |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 commands/adapters audit-log requirements section、field table 和 non-goals。
2. `manifest.json` scope / runtime summary 已同步 command-adapter audit posture。
3. focused regression 覆盖 audit-log section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 audit log store、workflow engine、SIEM integration、observability backend、policy engine、identity provider 或 event bus runtime。

## 已执行切片：U-045

### 目标

定义 long-running operational objects 的 lifecycle state-machine profile 最小边界，让 AODS 能区分 lifecycle state 与 display status，并表达 initial states、terminal states、transitions、guards、timeout/expiration、retry、cancellation、cleanup 和 event/receipt links。

### 最小模型

| 项 | 含义 | 非目标 |
|---|---|---|
| state_identity | state_id、state_kind、lifecycle_state、display_status、owner surface | 不做 UI status framework |
| initial_state | creation/resume/import trigger 和 entry conditions | 不做 object factory |
| terminal_state | finality、replacement/correction posture、consumer guidance | 不做 workflow engine |
| transition | from/to、trigger、actor boundary、authority surface、event/receipt link | 不执行 transition |
| guard | precondition、policy/risk/approval gate、freshness/dependency check | 不实现 policy engine |
| timeout_expiration | timeout_at、expires_at、timeout/expiration action、consumer guidance | 不做 scheduler |
| retry_policy | retryable states、retry limit、backoff、idempotency、terminal behavior | 不做 retry runtime |
| cancellation_semantics | cancel actor、allowed states、side effects、receipt、terminal state | 不做 workflow engine |
| cleanup_semantics | cleanup trigger、resource scope、retained evidence、deletion posture | 不做 cleanup executor |
| event_receipt_link | receipt_ref、event/projection ref、audit anchor、correction/supersession link | 不做 event bus runtime |

### 验收结果

1. `spec/stable-surface-contracts.json` 定义 lifecycle state-machine profile section、field table 和 non-goals。
2. `manifest.json` scope / runtime summary 已同步 lifecycle-state-machine posture。
3. focused regression 覆盖 lifecycle profile section、field table 和 non-goals。
4. 本轮不新增 schema，不改 validator runtime，不实现 workflow engine、scheduler、retry runtime、cleanup executor、state persistence runtime 或 operational dashboard。

## 已覆盖但 GitHub 仍 open 的 issue

| Issue | 本地覆盖任务 | 后续处理 |
|---|---|---|
| `#33` | U-035 command / receipt / event triad | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#35` | U-032 read-model freshness / watermark | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#37` | U-045 lifecycle state-machine profile | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#38` | U-031 decision provenance boundary | full provenance registry 可另立任务；当前不重复执行 |
| `#39` | U-036 event correction / supersession | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#41` | U-034 capability negotiation re-triage | metadata-only boundary 已覆盖；完整 protocol 继续 deferred |
| `#45` | U-044 audit-log requirements | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#43` | U-030 drift remediation workflow | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#47` | U-037 partial implementation / known-gap metadata | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#48` | U-033 fixture / golden export conventions | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#49` | U-029 implementation acceptance criteria | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#50` | U-038 ownership / authority hierarchy | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#51` | U-039 dependency ordering | 后续公开同步时可评论或关闭；当前不重复执行 |
| `#52` | U-040 deprecation / migration format | 后续公开同步时可评论或关闭；当前不重复执行 |

## 下一轮建议

下一轮按任务台账首选 **U-046 observability metadata for validation and routing decisions**，覆盖 GitHub issue `#59`。如果开始执行，必须先复审 U-045 质量；只有 lifecycle profile 的 spec、manifest、focused regression、operations docs 和验证都合格，才进入下一段 validation/routing observability metadata 实现。
