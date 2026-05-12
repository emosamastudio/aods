# Open-Source Scenario Pack Health Review

任务：U-121
状态：已完成
日期：2026-05-12

## 目标

复审 seeded open-source routing scenarios 的覆盖、稳定性和维护成本。当前不新增外部依赖。

## Scenario Snapshot

命令：

```bash
jq -s '{behavior_drift_count:.[0]|length, drift_count:.[1]|length, loading_count:.[2]|length}' \
  benchmarks/aods-eval-lab/fixtures/scenarios/behavior-drift-scenarios.json \
  benchmarks/aods-eval-lab/fixtures/scenarios/drift-scenarios.json \
  benchmarks/aods-eval-lab/fixtures/scenarios/loading-scenarios.json
```

| Scenario pack | Count |
|---|---:|
| behavior drift | 4 |
| drift | 9 |
| loading | 9 |

## Corpus Snapshot

命令：

```bash
jq '{version, strategy, corpora_count:(.corpora|length), corpus_ids:[.corpora[].id]}' benchmarks/aods-eval-lab/fixtures/open-source/corpora.json
```

| 项 | 值 |
|---|---|
| version | 1 |
| strategy | `path-allowlist sparse checkout` |
| corpora_count | 4 |
| corpus_ids | `apache-airflow`, `argo-cd`, `jupyterhub`, `backstage` |

## Health Review

| 维度 | 结论 |
|---|---|
| 覆盖 | 覆盖 loading、routing drift、behavior drift 三类 benchmark 入口 |
| 稳定性 | fixture 文件固定在仓库中；测试不需要即时访问外部网络 |
| 维护成本 | generated open-source corpora 体积较大，默认不应随无关任务更新 |
| 风险 | 若上游 sparse source 重新抓取，内容变化会影响 benchmark baseline，需要单独任务接受 |

## 后续策略

| 场景 | 动作 |
|---|---|
| 普通开发轮 | 使用现有 fixture / generated 基线，不刷新外部 corpus |
| benchmark source 改动 | 运行 benchmark focused test 并审查 generated/report diff |
| 外部 corpus refresh | 必须单独立任务，记录抓取来源、diff 规模和接受原因 |

## 非目标

- 不新增 corpus。
- 不抓取外部仓库。
- 不改变 benchmark scoring。
- 不提交无关 generated churn。
