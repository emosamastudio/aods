# Remediation Guidance Coverage Matrix

任务：U-127
状态：已完成
日期：2026-05-12

## 目标

审查 validator rule 的 remediation guidance 覆盖率和缺口。当前只补本轮新增的 changelog warning remediation，不做全量自动修复。

## 当前覆盖

| 类别 | 已有 action | gate | 判断 |
|---|---:|---|---|
| implementation evidence | 5 | drift-blocking / warning | 覆盖 current、stale、missing locator |
| implementation acceptance | 6 | drift-blocking / warning | 覆盖 criteria、evidence refs、manual review |
| decision provenance | 5 | drift-blocking | 覆盖 source/evidence/summary/current evidence |
| external citation | 5 | drift-blocking | 覆盖 id、refs、authority completeness、assumption posture、currentness |
| read-model freshness | 1 | drift-blocking | 覆盖 freshness metadata |
| capability compatibility | 3 | drift-blocking | 覆盖 profile/result/table columns |
| changelog delta | 1 | warning | 本轮新增 |

## 本轮新增

新增 `changelog-delta-soft-limit` remediation：

| 字段 | 值 |
|---|---|
| action | `tighten-changelog-delta` |
| gate | `warning` |
| guidance | 优先把 delta 控制在 300 字符以内，必要时拆分无关变更；500 字符仍是硬拦截 |

## 缺口

| 缺口 | 风险 | 后续建议 |
|---|---|---|
| L1 schema error 多数没有 rule-specific remediation | schema shape 错误仍要靠 AJV 信息理解 | 先继续改善 message，不急着为所有 schema keyword 建 action |
| AOP warnings 没有细分 remediation | style warning 可能不够直接 | 等 U-140 docs density 后再判断 |
| route / touch fallback 不是 validator issue | 不能进入 remediation schema | 继续放在 route docs 和 touch route audit 中 |

## 非目标

- 不把所有 schema error 都包装成专用 rule。
- 不改变 error / warning gate。
- 不引入自动修复命令。
