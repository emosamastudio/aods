# AODS Telemetry / Observability Store Research

任务：U-160
状态：已完成
日期：2026-05-12
范围：dashboard / trace store / telemetry storage 的 need、inputs、privacy risk；不建 store

## 目标

研究 AODS 是否需要 telemetry / observability store，并定义可消费输入、隐私风险和进入条件。当前只做研究，不创建数据库、dashboard、trace backend 或持久遥测采集。

## Current Inputs

| 输入 | 已有字段 | 可消费程度 |
|---|---|---|
| `validate --json` | status、accepted、levels、summary、topology、external_citations | high |
| `route --json` | explanation.source / reason / dependency | high |
| `fixture smoke --json` | action、status、accepted、manifest、summary、issues | high |
| benchmark reports | generated metrics and comparison output | medium; generated churn must be controlled |
| operations ledger | task status、evidence、round log | high for project governance, low for machine schema |

## Store Need Assessment

| Need | Store required now | Reason |
|---|---|---|
| local validation gate | no | command output is enough |
| release readiness history | no | operations docs and git history are enough |
| drift trend dashboard | not yet | dashboard boundary exists, but report schema and privacy policy need hardening |
| cross-run telemetry | not yet | generated artifacts already create churn |
| multi-repo observability | no | cross-corpus resolver / remote gateway are no-go |

## Privacy / Safety Risks

| 风险 | 控制 |
|---|---|
| path leakage | store should redact home paths or keep local-only |
| token / secret leakage | never store raw command payloads or env |
| external URL leakage | citation / remote locator metadata must keep posture and review status |
| stale truth | stored reports expire and cannot override checked-in authority |
| accidental public artifact | telemetry outputs must be excluded from release package unless explicitly approved |

## Minimal Future Shape

| 层 | 候选 |
|---|---|
| report envelope | run_id、command、started_at、ended_at、status、schema_version |
| validation summary | accepted、errors、warnings、rule counts |
| route summary | selected modules、fallback、dependency edges |
| fixture summary | fixtures、negative count、golden count、issues |
| retention | local-only default, explicit export gate |

## Entry Criteria

| Gate | Required before implementation |
|---|---|
| report schemas | validate / route / fixture report fields stable |
| privacy policy | path, payload, env, URL and credential redaction policy defined |
| retention policy | local-only, exportable, and package-excluded behavior explicit |
| dashboard consumer | concrete dashboard or release gate needs stored history |
| no-runtime overreach | store does not become policy engine or scheduler |

## Decision

当前建议：不建 telemetry / observability store。下一步若继续，应先定义 local-only report archive format，并证明它能减少 release / drift review 工作量。

## 非目标

- 不建 store、database、dashboard、trace backend 或 graph database。
- 不采集 raw payload、env、secret、remote response 或 user data。
- 不把 stored report 当成当前 authority。
- 不对外发布 telemetry artifacts。
