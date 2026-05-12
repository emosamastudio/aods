# AODS Next Milestone Options

任务：U-169、U-170
状态：已完成
日期：2026-05-12
范围：任务池归零后的下一里程碑选项、roadmap / changelog follow-up plan；不执行公开写操作

## Current Position

U-085 到 U-160 已完成，当前不缺“再写一份边界文档”的短期方向。下一阶段应在两条路线中选择：

1. 公开收口路线：修复 PR body、同步 deferred issues、ready for review、再做 release decision。
2. 本地能力路线：补 negative fixtures、conformance manifest/report、dependency diagnostics，把已有边界转成更强的验证能力。

## Milestone Options

| 选项 | 价值 | 风险 | 推荐度 |
|---|---|---|---|
| Public closeout | 让已完成的大量本地工作进入公开 review / merge 路线 | 需要公开写操作和 owner release decision | 高，需授权 |
| Negative fixtures first slice | 把当前 0 negative fixture 的缺口补起来 | 需要小心选择 rule family，避免全量扩张 | 高，可本地执行 |
| Conformance report design | 承接 U-156，先定义 report schema | 易过早扩成 runner | 中 |
| Dependency diagnostics | 承接 U-159，先做 validator / route diagnostics | 需要 schema/validator 变更 | 中 |
| Release execution | 真正发布下一个版本 | PR 仍 draft、version 未 bump、checks/reviews 缺失 | 暂不推荐 |

## Recommended Next If Public Writes Are Authorized

| 顺序 | 动作 |
|---:|---|
| 1 | 更新 PR `#63` body，修复 close syntax 和 summary scope |
| 2 | 评论 `#13/#41/#59/#60` 同步本地状态 |
| 3 | 再跑 `validate:all`、`benchmark:test`、`release:self-check` |
| 4 | 决定是否把 PR 标为 ready for review |

## Recommended Next If Public Writes Are Not Authorized

| 顺序 | 动作 |
|---:|---|
| 1 | U-171 negative fixture first-slice selection |
| 2 | U-172 negative fixture implementation first slice |
| 3 | U-173 / U-174 conformance manifest and report schema proposal |
| 4 | U-176 / U-177 dependency diagnostics design and implementation |

## Roadmap / Changelog Follow-up

| Issue | Public posture | Local evidence |
|---|---|---|
| `#60` roadmap | keep open | U-160 后已进入 public closeout / conformance next slice |
| `#13` changelog delta | can comment when authorized | 300 soft warning + 500 hard limit 已本地实现 |
| `#41` capability negotiation | keep open | metadata gates complete；runtime negotiation still no-go |
| `#59` observability | keep open | route JSON explanation complete；store/dashboard still no-go |

## Decision

下一轮默认选择 U-171 到 U-180 的本地 next slice，除非用户明确要求执行公开写操作。这样能继续提高验证能力，同时不改变公开项目状态。
