# Example Pack Gap Audit After PR Review

任务：U-117
状态：已完成
日期：2026-05-12

## 目标

在 PR review 状态之后复审 canonical example pack 的残缺、重复和过度承诺风险。当前不新增示例包。

## PR Review Snapshot

命令：

```bash
gh pr view 63 --json number,state,isDraft,headRefName,baseRefName,url,title,latestReviews,statusCheckRollup
```

| 项 | 当前状态 |
|---|---|
| PR | `#63` |
| state | `OPEN` |
| draft | `true` |
| head | `codex/aods-v0.8-backlog` |
| base | `main` |
| latestReviews | `[]` |
| statusCheckRollup | `[]` |

结论：当前没有 GitHub review / check feedback。所谓 “after PR review” 在本轮只能解释为：以当前 PR review 空状态为输入，做本地覆盖和 gap 审计。

## Coverage Matrix

| Example pack | 当前入口 | 覆盖状态 | 主要缺口 |
|---|---|---|---|
| source-first full corpus | `positive-compiled-pilot-source` | positive + golden | negative gap |
| read-model / implementation linkage | `positive-read-model-implementation-linkage-pack` | positive + golden | freshness failure fixture 未覆盖 |
| command / receipt | `positive-command-receipt-pack` | positive + golden | receipt missing / risk mismatch negative 未覆盖 |
| event / correction | `positive-event-correction-supersession-pack` | positive + golden | unresolved correction negative 未覆盖 |
| adapter / capability | `positive-adapter-capability-exposure-pack` | positive + golden | incompatible capability negative 未覆盖 |
| artifact export / policy gate | `positive-artifact-export-policy-gate-pack` | positive + golden | generated export drift negative 未覆盖 |
| resource surface | `positive-resource-surface-pack` | positive + golden | exposure / cleanup mismatch negative 未覆盖 |
| glossary registry | `positive-glossary-registry-pack` | positive + golden | alias collision / unresolved replacement negative 未覆盖 |
| external citation / provenance | `positive-external-citation-provenance-pack` | positive + golden | stale authoritative / unsupported assumption negative 未覆盖 |

## Gap 结论

| Gap | 风险 | 后续任务 |
|---|---|---|
| negative fixture 仍为 0 | examples 只能证明成功路径，不能证明错误会被拦截 | U-114 已排序；后续可进入 fixture implementation |
| warn fixture 仍为 0 | warning posture 缺少 fixture-level 示例 | U-128 / U-129 可合并评估 |
| PR review 为空 | 没有外部 review signal 可响应 | PR ready 前继续保留 review response matrix |
| example pack 覆盖多但仍是单域名样例 | 容易被误读成完整标准库 | docs 必须继续写明 non-goal |

## 非目标

- 不新增示例包。
- 不把 PR review 空状态当作通过评审。
- 不把 positive pack 解释为 conformance coverage。
- 不关闭 GitHub issue 或改变 PR ready 状态。
