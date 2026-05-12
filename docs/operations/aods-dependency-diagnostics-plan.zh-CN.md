# AODS dependency diagnostics plan

状态：U-176、U-177、U-178 已完成
日期：2026-05-12
范围：route JSON dependency explanation 最小扩展；validator diagnostics 仍为计划

## 结论

dependency ordering 暂不进入 scheduler。当前最高价值切片是让 `route --json` 明确展示选中模块和声明依赖之间的覆盖状态，同时给 validator 后续诊断留出稳定字段方向。

## Route JSON 扩展

`explanation.dependency` 保留既有字段，并新增：

| 字段 | 说明 |
|---|---|
| `edge_count` | dependency edge 总数 |
| `selected_edge_count` | dependency 已在 recommended modules 中的边数 |
| `unselected_edge_count` | dependency 存在但未被选中的边数 |
| `missing_edge_count` | dependency id 不存在的边数 |
| `missing_dependency_ids` | 不存在的 dependency id 去重列表 |
| `coverage` | `{selected, unselected, missing}` 机器可读摘要 |
| `edges[].dependency_exists` | dependency id 是否存在于 manifest modules |
| `edges[].dependency_status` | `selected`、`unselected`、`missing` |

这能让调用方不用解析 prose 就知道：当前工作集是否漏选了依赖、漏选的是存在依赖还是坏引用。

## Validator diagnostics plan

| 诊断 | 进入条件 | 建议字段 | 本轮状态 |
|---|---|---|---|
| missing dependency target | `deps[]` 指向不存在 module id | `module_id`、`dependency_id`、`available_module_ids_sample` | 已有 L2 ref gate；后续可改善 report shape |
| dependency cycle | declared deps 形成环 | `cycle_path`、`cycle_length`、`severity` | 暂不实现；需要先确认是否禁止环 |
| optional fallback ambiguity | optional dependency 指向多个候选或缺少 fallback | `dependency_id`、`fallback_policy`、`consumer_surface` | 暂不实现；需要 stable surface metadata 更具体 |
| selected-but-unexpanded dependency | route query 命中模块但依赖未展开 | `selected_module_ids`、`unselected_dependency_ids` | route JSON 已覆盖 |

## 非目标

1. 不改变 route ranking 或 query scoring。
2. 不自动把 dependency 加入 recommended modules。
3. 不实现 graph database、scheduler、package manager 或 cross-repo executor。
4. 不把 validator 改成 dependency planner。
