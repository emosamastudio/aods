# Compact vs Verbose Validation Output Triage

任务：U-129
状态：已完成
日期：2026-05-12

## 目标

判断 validate 是否需要 compact / verbose 模式。当前不实现新模式。

## 当前输出

```bash
node ./bin/aods.mjs validate .
```

当前 text 输出包含 result、summary、L1-L4 行。没有 issue 时足够紧凑；有 issue 时输出 rule、module、path、message 和 remediation。JSON 输出继续承担机器消费职责。

## 判断

| 选项 | 价值 | 风险 | 本轮结论 |
|---|---|---|---|
| `--compact` | CI 日志更短 | 需要重新定义 issue 展示省略规则 | 暂不做 |
| `--verbose` | 展示更多 schema context | 可能放大噪声 | 暂不做 |
| message 局部改进 | 成本低，直接减少误判 | 需要回归测试 | 本轮采用 |

## 本轮改动

为 `maxLength` schema error 增加 limit 和 received length 信息，避免把长字符串完整打印后仍不知道超了多少。

## 非目标

- 不新增输出模式。
- 不改变 JSON schema。
- 不改变 warning / error bucket。
