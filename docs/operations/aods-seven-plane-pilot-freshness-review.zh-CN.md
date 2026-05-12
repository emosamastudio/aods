# Seven-Plane Pilot Freshness Review

任务：U-120
状态：已完成
日期：2026-05-12

## 目标

复审 seven-plane pilot 是否仍覆盖核心 semantics。当前不重写 pilot。

## Validation Evidence

命令：

```bash
node ./bin/aods.mjs validate ./examples/seven-plane-pilot --strict --json
jq '{modules:(.modules|length), boot_by_touch:(.boot_by_touch|length), surface_pairs:(.surface_pairs|length), has_project_topology:has("project_topology")}' examples/seven-plane-pilot/manifest.json
```

| 指标 | 值 |
|---|---:|
| strict validation | pass |
| modules | 12 |
| sections | 23 |
| artifacts | 8 |
| surface_pairs | 1 |
| boot_by_touch | 5 |
| has_project_topology | false |

## Shape Review

| 维度 | 当前状态 |
|---|---|
| categories | architecture=1, capsule=1, policy=9, reference=1 |
| layers | root=1, capsule=1, detail=10 |
| core value | 覆盖七平面拆分、boot_by_touch、paired surface 和 strict corpus validity |
| stale area | 不覆盖 implementation evidence、acceptance criteria、external citation、glossary v2、fixture smoke、topology reality |

## 结论

seven-plane pilot 仍适合作为旧核心结构和七平面写法的 freshness sample；它不应被继续扩成当前全部能力的 canonical example。当前 canonical adoption 路线应继续以 source-first compiled pilot 为主。

## 非目标

- 不重写 seven-plane pilot。
- 不把它升级成 v0.12 feature showcase。
- 不补 implementation topology 或 evidence metadata。
- 不替代 source-first pilot。
