# Route Query Corpus Coverage Audit

任务：U-130
状态：已完成
日期：2026-05-12

## 目标

审查常见 query term 到 authority module 的覆盖、miss 和 stale route 风险。当前不改 scoring。

## Query 样本

| Query | intent | 命中策略 | 主要模块 | 判断 |
|---|---|---|---|---|
| route explanation dependency graph | read | query-route | stable-surface contracts、boot protocol、validation | 覆盖 route observability 和 dependency |
| remediation guidance severity validation warning strict | read | query-route | validation | 精准 |
| authoring source lint changelog delta schema | write | query-route | AOP、boot、artifact、surface、authority、stable contracts、validation | write intent 正确扩依赖 |

## 结论

query route 对本轮任务的核心词覆盖可接受。write intent 会扩展依赖，能避免只加载单个匹配模块后漏掉 schema / authority / surface 约束。

## 风险

| 风险 | 说明 | 后续 |
|---|---|---|
| 文档运维词不一定命中具体 docs | operations docs 不是 agent-primary semantic module | 由 task ledger / operations README 承担 |
| query evidence sample 截断 | 排查时仍需打开模块 | 保留 |
| scoring 不透明 | 需要结合 explanation.reason 看证据 | 暂不改 |

## 非目标

- 不改 query scorer。
- 不改 matched term 权重。
- 不新增 embedding 或外部搜索。
