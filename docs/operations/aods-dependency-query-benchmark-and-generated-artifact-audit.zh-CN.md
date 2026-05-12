# AODS dependency query benchmark / generated artifact audit

状态：U-179、U-180 已完成
日期：2026-05-12
范围：route dependency query regression；PR `#63` generated artifact read-only audit

## Dependency query regression

新增 focused regression 覆盖 query：

```bash
node ./bin/aods.mjs route . --query "surface dependency ordering optional dependency scheduler" --stage plan --intent read --json
```

期望结果：

| 项 | 期望 |
|---|---|
| selected module | `spec-stable-surface-contracts` |
| edge count | 2 |
| selected edges | 0 |
| unselected edges | 2 |
| missing edges | 0 |
| dependency statuses | 两条都是 `unselected` |

这条 regression 只验证 routing explanation，不引入外部 benchmark data、不更新 generated results。

## PR generated artifact audit

使用代理后的 GitHub 只读查询显示 PR `#63` 当前为 open draft、merge clean、0 reviews、0 checks、171 changed files。

| Artifact family | PR 中的路径 | 接受策略 |
|---|---|---|
| Generated schema mirror | `benchmarks/aods-eval-lab/generated/aods-corpus/schema/*.schema.json` | 若源 schema/spec 变更导致 mirror 更新，可接受，但 release 前需重新跑 gate。 |
| Benchmark result JSON | `benchmarks/aods-eval-lab/generated/results/*.json`、`generated/history/*.json` | 默认不接受临时 churn；只有 benchmark generator 或 public benchmark conclusion 变化时才保留。 |
| Benchmark reports | `benchmarks/aods-eval-lab/reports/*.md` | 默认和 result JSON 同步处理；不单独手改。 |

## 本轮决策

1. 本轮没有新增 benchmark generated result/report churn。
2. 后续 U-181 到 U-183 准备 PR ready 前，必须再次审查 generated result/report 是否仍应存在于 PR。
3. 如果只是本地测试环境造成的 timestamp/sample churn，应在 ready 前还原。
4. 如果 schema mirror 是语义变更的派生结果，应保留并在 PR body 中说明生成来源。

## 非目标

1. 不更新 PR body。
2. 不把 PR 转 ready。
3. 不关闭 issue、不发布 release。
4. 不重跑 hosted repeatability 捕获。
