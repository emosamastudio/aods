# AODS roadmap / observability / capability next gates

日期：2026-05-13
任务：U-332 到 U-341
阶段：S38 post-v0.8 roadmap / observability / capability gates

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| 最新提交 | 通过 | `87e89bb Plan next post-v0.8 task batch` 已推送 |
| 任务台账 | 通过 | U-331 已完成，U-332 到 U-381 已入未完成任务池 |
| 公开事项 | 通过 | open issues 仍为 `#60/#59/#41` |
| 质量门禁 | 通过 | `npm run release:hygiene` 通过 |

返工结论：无返工项。上一轮成果合格，可以进入 U-332 到 U-341。

## U-332：`#60` public tracker body refresh plan

`#60` issue body 仍保留 v0.6 时期的全量 checklist，当前 comments 已记录 v0.7、PR `#63`、v0.8.0 和 post-v0.8 状态。问题不是公开信息缺失，而是 issue body 的 checkbox 仍全空，读者需要翻 comments 才能理解当前路线。

推荐刷新方式：

1. 保留 issue body 的历史 dependency map，不直接删除原上下文。
2. 在 body 顶部新增 “Current status as of v0.8.0” 区块。
3. 把已关闭 issue 聚合为 “completed in v0.7/v0.8”，避免逐项重开/重关历史 checkbox。
4. 把 remaining anchors 明确为 `#41`、`#59`、`#60`。
5. 把 runtime / dashboard / provider execution 标成 explicit non-goals until separately authorized。

## U-333：closed issue checklist reconciliation matrix

| `#60` body cluster | 当前处理结果 | 证据 / 备注 |
|---|---|---|
| P0 foundation `#29/#30/#31/#32` | 已覆盖并关闭 | v0.7 foundation + v0.8 close-on-merge |
| P1 mechanics `#33/#34/#35/#36/#37/#38/#39/#40/#42` | 已覆盖并关闭 | command/event/freshness/provenance/lifecycle/versioning/severity 等已进入 released surface；`#41` 仍 open |
| Capability negotiation `#41` | 仍 open | metadata / compatibility gates 已有；fallback / unsupported / protocol / fixtures 仍待做 |
| P2 workflow/support `#43` 到 `#53` | 已覆盖或 release 后收束 | `#43/#44/#45/#46/#47/#48/#49/#50/#51/#52` 已关闭；release alignment 已随 v0.8.0 收束 |
| P3 docs/tooling `#54/#55/#56/#57/#58` | 已覆盖并关闭 | density、sync quality、examples、glossary、citation 已完成 |
| Observability `#59` | 仍 open | route explanation 已有；validator location envelope / suggested actions / skipped opt-in / samples 仍待做 |
| Roadmap tracker `#60` | 仍 open | 用作 umbrella tracker，不作为单一 release blocker |

## U-334：`#60` public update execution decision

决策：本轮不直接编辑 `#60` body，也不直接发布新 comment。原因是本轮同时在定义 `#59/#41` 的下一批 implementation gates；更稳妥的公开动作是在 U-369 统一执行，让 tracker comment/body 与本地任务池执行结果一致。

预留公开更新方案：

| 动作 | 建议 | 理由 |
|---|---|---|
| body edit | 建议执行，但放到 U-369 | body 旧 checklist 容易误导，需要顶部 current status |
| comment | 建议执行，但放到 U-369 | comments 可记录本轮 U-332 到 U-341 的新切片 |
| close `#60` | 不建议 | 仍需要 umbrella roadmap tracker |
| milestone/label change | 后续 U-380 再审 | 当前 labels 仍可接受 |

## U-335：`#59` validator location implementation gate

建议进入实现，但必须是最小实现。

最小 location envelope：

| 字段 | 语义 | 必需性 |
|---|---|---|
| `kind` | `manifest` / `module` / `artifact` / `section` / `surface_pair` / `fixture` / `unknown` | 必需 |
| `path` | repo-relative file path when known | 可选 |
| `module_id` | issue 所属 module id | 可选 |
| `artifact_id` | issue 所属 artifact id | 可选 |
| `section_id` | issue 所属 section id | 可选 |
| `json_pointer` | schema / JSON path when deterministic | 可选 |

约束：

- 不追求 source map。
- 不做 line/column guarantee。
- 不改变现有 `path/module/sid` 字段的兼容性；先增量附加 `location`。
- 只为高置信 issue family 添加 envelope。

验收建议：focused validator regression 覆盖至少一个 manifest-level、module-level、artifact-level issue。

## U-336：`#59` suggested-action implementation gate

建议进入实现，优先补 deterministic rules，不做大而全 remediation framework。

下一批优先规则：

| 规则族 | 建议 action | 原因 |
|---|---|---|
| implementation evidence missing/current mismatch | add-current-evidence / refresh-evidence | 与 code drift 主线直接相关 |
| acceptance criteria missing | add-acceptance-criteria | 已有 stable contract requirement |
| capability incompatible / unknown | adjust-capability-matrix / declare-fallback | 与 `#41` 后续直接相连 |
| external citation stale / unsupported assumption | refresh-citation / mark-assumption | 已有 citation posture |
| changelog delta too long | shorten-delta / split-change | 已有 300/500 行为 |

验收建议：JSON issue 至少包含 `suggested_action.id`、`gate`、`guidance`；text output 不需要完整展开全部字段。

## U-337：route skipped-module opt-in implementation feasibility

结论：可做，但必须 opt-in。

推荐接口：

```text
aods route . --query "..." --json --include-skipped
```

输出边界：

- 默认 `route --json` 不输出全 corpus skipped list。
- `--include-skipped` 输出 compact list：`module_id`、`reason`、`score` 或 `matched=false`。
- 对 dependency-unselected 和 query-not-selected 分开表示。
- 保留 output-size guard；大型 corpus 可截断并给 `truncated=true`。

非目标：不做 full trace store、ranking explanation rewrite、dashboard、telemetry backend。

## U-338：observability sample output pack implementation plan

建议新增小型 sample pack，而不是把长 JSON 塞进 README。

候选文件：

| 文件 | 内容 |
|---|---|
| `docs/operations/aods-validate-json-sample.json` | 一个 compact validation report，覆盖 `summary`、`levels`、`issue.location`、`suggested_action` |
| `docs/operations/aods-route-json-sample.json` | 一个 compact route report，覆盖 `explanation.source/reason/dependency` 和可选 skipped summary |
| README / README.zh-CN | 只放命令和字段索引 |

验收建议：sample 从真实命令输出裁剪生成，不能手写幻想字段。

## U-339：`#41` unsupported reason schema gate design

建议进入 metadata-only schema / validator 切片。

最小字段：

| 字段 | 语义 |
|---|---|
| `unsupported_reason.id` | 稳定原因 id，例如 `missing_schema_version`、`unsupported_exposure`、`missing_command_family` |
| `unsupported_reason.message` | 人读摘要 |
| `unsupported_reason.required_capability` | consumer 要求但 provider 不满足的 capability |
| `unsupported_reason.provider_capability` | 被比较的 provider capability |
| `unsupported_reason.consumer_action` | `fail-fast` / `degrade` / `choose-another-provider` / `manual-review` |

约束：只解释静态 capability matrix，不执行 provider，不探测远端。

## U-340：`#41` fallback metadata schema gate design

建议与 U-339 同批实现或紧邻实现。

最小字段：

| 字段 | 语义 |
|---|---|
| `fallback.posture` | `none` / `degraded` / `manual` / `alternate-provider` |
| `fallback.degraded_capabilities` | 降级后仍可用能力 |
| `fallback.lost_capabilities` | 降级后不可用能力 |
| `fallback.consumer_action` | consumer 应采取的动作 |
| `fallback.risk_note` | 降级风险摘要 |

validator gate：当 compatibility row 的 `expected_result` 为 `partial` 或 `unknown` 时，若 surface 标为 stable / adapter-facing，应要求 fallback 或 unsupported reason 至少存在一个。

## U-341：capability conformance fixture first implementation decision

首批 fixture 建议选择三个负/边界 case：

| Fixture | 输入 | 期望 |
|---|---|---|
| `capability-unsupported-missing-reason` | incompatible row 无 unsupported reason | strict fail |
| `capability-partial-missing-fallback` | partial row 无 fallback posture | strict fail |
| `capability-unknown-manual-review` | unknown row 有 manual review action | pass 或 expected warning，取决于 validator gate |

实施顺序：

1. 先做 U-339 / U-340 schema + validator。
2. 再把 fixture 写入 compiled-pilot source-first fixture manifest。
3. 最后补 conformance sample 或 fixture smoke expected outcome。

## 下一轮建议

下一轮优先 U-342 到 U-351。理由：本轮已经把 `#59/#41/#60` 的公开和实现入口锁住，下一轮应推进 structured term refs 和 evidence freshness，解决用户曾提到的 `start` / `begin` 生命周期术语漂移检测问题。

## 非目标

- 不编辑 GitHub issue body/comment；公开执行留给 U-367 到 U-369。
- 不实现 schema / validator / fixture；本轮只锁 gate。
- 不做 runtime discovery、auth exchange、provider selection、fallback execution、dynamic probing。
- 不做 telemetry backend、trace store、dashboard。
- 不发布 release，不创建 tag，不修改 package version。
