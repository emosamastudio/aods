# AODS Provider Discovery Hardening

日期：2026-05-13
回合：R-2026-05-13-51
范围：U-682 到 U-691

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `3bca138 Close static retrospective and add install smoke` |
| 台账指针 | 通过 | 当前默认任务为 U-682 到 U-691 |
| 返工需要 | 无 | 上轮 retrospective、package install smoke 和新任务池成果可继续承接 |

## 北极星

本阶段目标是把 runtime/protocol 静态记录从“字段草案”推进到“可测试候选”。推进顺序必须继续保持：

1. 先选 source-first candidate；
2. 再做 focused negative fixture；
3. 再决定是否进入 schema / validator；
4. 最后才考虑 package / conformance / public adoption surface。

本轮不实现 provider call、auth exchange、network probing、provider auto-selection、fallback executor、adapter call、remote gateway、database connection 或 production mutation。

## U-682 provider discovery source-first candidate insertion plan

Decision：provider discovery 可以作为下一 source-first candidate，但本轮只制定插入计划，不改 `authoring.json`。

最小正例：

| Field | Candidate value | Reason |
|---|---|---|
| `provider_discovery_id` | stable local id | 让记录可被引用 |
| `provider_id` | existing adapter/provider-like static id | 避免引入真实外部 provider |
| `capability_id` | existing capability metadata id | 贴近现有 capability surface |
| `discovery_source` | `fixture` or `manual-review` | 明确不是 live discovery |
| `transport_scope` | `none` or `local` | 禁止远端读取 |
| `freshness_posture` | `current` or `partial` | 复用 evidence freshness 语义 |
| `evidence_refs` | existing static evidence ids | 第一 gate 必须围绕证据 |
| `network_allowed` | `false` | 保持非执行边界 |

插入路径：

1. 在 `examples/compiled-pilot-source/authoring.json` 增加一条最小静态记录；
2. 使用 `npm run compile:pilot` 生成 compiled pilot；
3. 使用 scoped validation 确认无 schema drift；
4. 只在 focused regression 稳定后，再考虑 package / docs exposure。

No-go 条件：

| No-go | 原因 |
|---|---|
| 需要真实 provider endpoint | 会变成 live discovery |
| 需要 credential 或 token | 越过 auth boundary |
| 需要网络探测 | 越过 probing posture |
| 需要 provider ranking | 越过 selection/fallback 边界 |

## U-683 provider evidence negative fixture implementation plan

Decision：第一负例应为 provider discovery 缺 `evidence_refs`。

推荐检查名：`runtime-protocol-provider-evidence`

负例目标：

| 维度 | 要求 |
|---|---|
| 输入 | provider discovery record 声明 provider/capability，但 `evidence_refs=[]` 或缺失 |
| 输出 | validation / fixture report 必须产生 deterministic issue |
| 严重度 | 初始建议 strict 下 error，normal 下 warning 或 error 需跟现有模式对齐 |
| remediation | 提示补充 evidence ref 或降低 freshness posture |
| 非目标 | 不检查 provider 是否真实存在于网络，不查询 endpoint |

推荐实现顺序：

1. 先做 source-first 正例；
2. 再复制为 focused negative fixture；
3. 加 JSON 输出断言；
4. 最后才评估是否纳入 conformance suite。

## U-684 runtime protocol schema minimal slice decision

Decision：暂不进入 schema implementation，但记录一个最小候选切片。

最小可进入 schema 的候选只有 provider discovery，不包含 auth/probe/fallback/handshake。

候选 schema slice：

| Element | Required now? | Note |
|---|---:|---|
| `provider_discovery_id` | yes | stable id |
| `provider_id` | yes | static id, not endpoint |
| `capability_id` | yes | existing capability ref |
| `discovery_source` | yes | enum |
| `transport_scope` | yes | enum |
| `freshness_posture` | yes | enum aligned with evidence semantics |
| `evidence_refs` | yes | non-empty array |
| `network_allowed` | yes | must be false in current examples |

Schema gate remains closed until:

1. source-first candidate reviewed;
2. negative fixture is implemented;
3. JSON issue shape is stable;
4. `#64` wording remains clear that runtime/protocol is deferred.

## U-685 runtime protocol non-execution regression implementation plan

Decision：需要一个 non-execution regression，但应先作为 focused regression，不进 conformance。

Regression intent：任何 runtime/protocol static record 都不得让 validation、fixture、route 或 package smoke 执行外部动作。

推荐断言：

| Assertion | Expected |
|---|---|
| `network_allowed=false` | validation 不发起网络 |
| `exchange_required=true` | validation 仍不交换凭据 |
| `allowed_probe_kind=network-read` | validation 只检查 cost/approval 字段 |
| `call_allowed=false` | adapter 不被调用 |
| fallback metadata present | 不执行 ranking / failover |

实现策略：

1. 只测试 command output 和静态 issue；
2. 不使用 network mock，避免测试误导为“代码里有联网路径”；
3. 若未来需要 runtime adapter test，必须另建 runtime harness，不混入 current validator suite。

## U-686 provider discovery docs short note decision

Decision：暂不新增 public docs note。

原因：

1. 当前还没有 source-first candidate 和负例；
2. public docs 过早出现 provider discovery 会提高误解风险；
3. internal operations doc 已足够承接下一轮实现。

可新增 public note 的触发条件：

| Trigger | Required wording |
|---|---|
| focused regression landed | “declared discovery only” |
| source-first candidate stable | “does not call provider” |
| package exposure considered | “not an adoption API” |

## U-687 auth boundary source-first candidate plan

Decision：auth boundary 可作为第二 source-first candidate，但必须排在 provider evidence 之后。

最小候选：

| Field | Candidate |
|---|---|
| `auth_boundary_id` | stable local id |
| `credential_class` | `none` or `handle-only` |
| `secret_handling_posture` | `none`, `omit`, or `handle-only` |
| `exchange_required` | `false` for first positive example |
| `redaction_floor` | existing redaction posture |
| `audit_anchor` | static evidence / receipt placeholder |
| `credential_material_allowed` | `false` |

禁区：

1. 不放 token、secret、session、OAuth payload；
2. 不做 exchange；
3. 不检查 credential validity；
4. 不要求真实 provider account。

## U-688 probe cost negative fixture plan

Decision：第三候选负例为 `network_allowed=true` 但缺 `cost_ceiling`。

推荐检查名：`runtime-protocol-probe-cost`

负例含义：

| Bad shape | Expected issue |
|---|---|
| `network_allowed=true` without `cost_ceiling` | implicit network/cost risk |
| `allowed_probe_kind=network-read` without `approval_ref` when required | missing owner approval |
| `mutation_allowed=true` without approval | production mutation boundary violation |

本轮只规划第一种，mutation 相关负例继续推后。

## U-689 fallback ranking overclaim regression plan

Decision：需要防止 fallback metadata 被误读为 ranking / failover。

推荐检查名：`runtime-protocol-fallback-ranking`

负例触发语义：

| Overclaim | Expected handling |
|---|---|
| `ranking_allowed=true` | fail strict |
| wording claims automatic best provider | fail or warning, depending field location |
| `consumer_action=use-degraded` without explicit degraded behavior | deterministic issue |
| fallback refs exist but no manual escalation | issue with remediation |

第一实现只检查 structured fields，不做自由文本语义判定。

## U-690 adapter handshake audit negative fixture plan

Decision：adapter-facing handshake 缺审计锚点是第四候选负例。

推荐检查名：`runtime-protocol-handshake-audit`

负例规则：

| Condition | Required |
|---|---|
| `transport_scope=adapter-facing` | `auth_boundary_ref` |
| `call_allowed=false` | always |
| handshake exists | `input_contract_ref` and `output_contract_ref` |
| adapter-facing or remote | `audit_receipt_ref` or `audit_anchor` |

该负例价值高，但依赖 provider discovery / auth boundary shape 稳定，因此排在后面。

## U-691 runtime protocol `#64` progress sync decision

Decision：给 `#64` 追加一条短进展评论。

评论边界：

1. 只说明下一实现候选排序；
2. 明确 schema / validator 尚未实现；
3. 明确没有 runtime/protocol negotiation；
4. 不关闭 issue，不改 label，不创建 milestone。

Executed：`https://github.com/emosamastudio/aods/issues/64#issuecomment-4441211144`

建议评论内容：

```markdown
Second static prerequisite pass completed locally:

- first source-first candidate remains provider discovery with static evidence refs.
- first negative fixture candidate is missing provider discovery evidence.
- schema work is still gated until the source-first candidate and focused negative fixture stabilize.
- public docs should stay quiet until the fixture exists, to avoid implying runtime discovery.

Still non-goals: no provider calls, no auth exchange, no network probing, no provider auto-selection, no fallback ranking/execution, no adapter call, no database connection, and no production mutation.
```

## 本轮验证

| 验证项 | 命令或方式 | 结果 |
|---|---|---|
| GitHub issue read | `gh issue view 64 --json ...` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 待最终复跑 |
| Package surface | `npm run package:check-surface -- --json` | 待最终复跑 |
| Release hygiene | `npm run release:hygiene` | 待最终复跑 |

## 后续建议

下一轮默认 U-692 到 U-701：把 package install smoke 纳入 release gate 的决策、v0.9.1 bump gate、release notes final draft、packed/source install smoke、npm publish audit、CI draft no-enable packet、branch cleanup packet、tag/source wording 和 next release go/no-go。
