# AODS route JSON explanation 最小增强

状态：U-079 已完成
日期：2026-05-08
范围：`#59` validation / routing observability residual；不重写 CLI output subsystem

## 结论

`aods route --json` 现在输出顶层 `explanation` 对象，包含 `source`、`reason`、`dependency` 三个机器可读子对象。这个改动把 U-046 的 observability vocabulary 从纯规范边界推进到 route JSON 的最小可消费实现，同时保持文本输出、route ranking、query scoring 和 validator 输出不变。

## 字段契约

| 字段 | 内容 | 用途 |
|---|---|---|
| `explanation.source` | `kind`、`role`、`touch`、`query`、`stage`、`stage_source`、`intent` | 说明本次 route 由哪个输入和策略产生。 |
| `explanation.reason` | `strategy`、`fallback`、`selected_module_ids`、`matched_touch_routes`、`matched_query_module_ids`、`touched_module`、`touched_surface_pair`、`text` | 让 agent 不解析 prose 也能知道哪些模块被选中以及命中来源。 |
| `explanation.dependency` | `source`、`mode`、`selected_module_ids`、`edge_count`、`selected_edge_count`、`unselected_edge_count`、`missing_edge_count`、`dependency_ids`、`selected_dependency_ids`、`unselected_dependency_ids`、`missing_dependency_ids`、`coverage`、`edges` | 暴露 `manifest.modules[].deps` 的依赖边，解释工作集和声明依赖之间的关系。 |
| `explanation.dependency.edges[]` | `module_id`、`dependency_id`、`dependency_selected`、`dependency_exists`、`dependency_status` | 逐条说明 declared dependency 是否存在，以及状态是 `selected`、`unselected` 还是 `missing`。 |

## 验收证据

| 验收项 | 命令或方式 | 结果 |
|---|---|---|
| RED regression | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs --test-name-pattern "route JSON includes"` | 按预期失败于 `route.explanation` 缺失。 |
| GREEN regression | `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs --test-name-pattern "route JSON includes"` | 通过；scaffold 31/31。 |
| Stable contract sync | `node --test ./benchmarks/aods-eval-lab/test/stable-contracts.test.mjs` | 通过；observability field table 已包含 `route_json_explanation`。 |
| Route smoke | `node ./bin/aods.mjs route . --query "boot_by_touch route discoverability warnings" --stage plan --intent read --json` | 输出 `explanation.source/reason/dependency`。 |
| Text output smoke | `node ./bin/aods.mjs route . --query "boot_by_touch route discoverability warnings" --stage plan --intent read` | 文本输出仍保持原 route 摘要形态。 |
| Benchmark suite | `npm run benchmark:test` | 通过；77/77 pass；测试产生的 generated result churn 已还原。 |

## 非目标

1. 不改变 route ranking、query scoring、touch route 优先级或 dependency expansion 规则。
2. 不重写 CLI text output 或 validation JSON output。
3. 不建立 dashboard、trace store、graph database、telemetry backend 或 skipped-module 完整报告。
4. 不把 route JSON explanation 扩展成 runtime scheduler 或 dependency executor。

## 下一步

下一轮优先 U-080：fixture / golden export smoke runner。U-079 完成后，`#59` 的最小 CLI JSON explanation residual 已本地覆盖；完整 observability runtime 仍保持 deferred。
