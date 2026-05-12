# Benchmark Generated Artifact Hygiene Policy

任务：U-122
状态：已完成
日期：2026-05-12

## 目标

定义 benchmark generated / reports churn 的还原、接受和入账规则。当前不默认提交 churn。

## 受控路径

| 路径 | 性质 | 默认处理 |
|---|---|---|
| `benchmarks/aods-eval-lab/generated/` | benchmark 生成物 | 无关任务默认恢复 |
| `benchmarks/aods-eval-lab/reports/` | benchmark 报告 | 无关任务默认恢复 |
| `benchmarks/aods-eval-lab/fixtures/` | benchmark fixture | 只有任务明确覆盖时提交 |
| `benchmarks/aods-eval-lab/src/` | benchmark 生成逻辑 | 可作为 durable source 提交 |
| `benchmarks/aods-eval-lab/test/` | benchmark regression | 可作为验证契约提交 |

## 命令影响

| 命令 | 可能影响 |
|---|---|
| `npm run benchmark:evaluate` | generated / reports |
| `npm run benchmark:compare` | reports |
| `npm run benchmark:summary` | README benchmark sync 区块 |
| `npm run benchmark:test` | 通常不应改 source；若产生 churn 必须审查 |
| `npm run release:self-check` | 可能触发 benchmark / package side effects |

## 接受规则

| 情况 | 是否提交 | 条件 |
|---|---|---|
| source / fixture 语义变更导致 expected generated diff | 可以 | 当前任务明确覆盖，diff 已审查 |
| README benchmark sync 变更 | 可以 | 必须来自 `benchmarks/aods-eval-lab/src/summary.mjs` 或对应生成流程 |
| timestamp / ordering / report noise | 不提交 | 恢复 churn，必要时修 determinism |
| open-source corpus refresh | 单独任务 | 记录来源、范围、diff 和风险 |
| 无关测试运行产生 generated diff | 不提交 | `git restore` 受控路径 |

## 本轮执行边界

本轮新增 CLI help regression 和 docs；没有接受 benchmark generated / reports churn。后续验证若产生 churn，提交前必须先恢复，除非任务范围明确写入 benchmark artifact update。

## 非目标

- 不改变 benchmark 生成逻辑。
- 不删除既有 generated corpus。
- 不把 benchmark generated output 当作权威 source。
- 不自动提交 report churn。
