# Route Explanation Dependency Graph Review

任务：U-126
状态：已完成
日期：2026-05-12

## 目标

审查 `route --json` 的 `explanation.source`、`explanation.reason`、`explanation.dependency` 字段是否足以解释本轮 route 决策。当前不改 ranking。

## 审查命令

```bash
node ./bin/aods.mjs route . --query "route explanation dependency graph" --stage verification --intent read --json
node ./bin/aods.mjs route . --touch schema/module.schema.json --intent write --json
```

## 结论

| 字段 | 当前覆盖 | 判断 |
|---|---|---|
| `source` | strategy、role、touch、query、stage、stage_source、intent | 足够解释入口来源 |
| `reason` | selected module ids、matched touch/query、fallback、文本原因 | 足够解释为什么选中 |
| `dependency` | deps source、selected ids、dependency ids、selected/unselected ids、edges | 足够解释直接依赖图 |

## 边界

依赖图只展开当前 selected modules 的 `manifest.modules[].deps` 直接边，不做 transitive closure，也不把 write intent 的 dependency expansion 误称为全图。这个边界是合理的：route 输出要解释本次加载决策，不承担 dependency scheduler 或 graph database 职责。

## 不足

| 不足 | 影响 | 本轮处理 |
|---|---|---|
| fallback route 仍可能让新手误以为命中具体路径 | docs / operations 路径没有专门 touch route 时解释较弱 | 记录到 U-131 |
| dependency edge 只说明 selected 与否，不说明为何未选中 | 审查 write/read 差异时需要看 intent | 保留，不改 ranking |
| query evidence sample 会截断 | 人类审查时偶尔需要回源 | 保留 JSON 结构，不扩 verbose 模式 |

## 非目标

- 不改 route scoring。
- 不改 query index。
- 不引入 transitive graph 输出。
- 不把 route 变成 scheduler。
