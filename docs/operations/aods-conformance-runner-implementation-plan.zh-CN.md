# AODS Conformance Runner Implementation Plan

任务：U-156
状态：已完成
日期：2026-05-12
范围：从 fixture smoke 走向 conformance runner 的 staged implementation plan；不实现 runner

## 目标

定义 conformance runner 的最小进入路线，避免把当前 `fixture smoke` 直接扩成测试平台。当前只做实现计划，不新增 CLI、schema、validator 或 runner。

## 当前基线

| 面 | 已有能力 | 边界 |
|---|---|---|
| fixture manifest | `aods_fixture_manifest_v=1`、positive / negative、expected_status、expected_rules、golden_exports | 当前示例只有 9 个 positive fixtures，0 negative fixtures |
| fixture smoke | `action/status/accepted/manifest/summary/issues` JSON 契约稳定 | 只检查声明和路径，不执行 update command |
| validation report | `validate --json` 有 levels、summary、topology、external_citations | 尚未定义 conformance report schema |
| golden exports | update command + review gate 已声明 | 不自动接受 golden diff |

## Implementation Stages

| 阶段 | 目标 | 验收标准 | 不做 |
|---|---|---|---|
| Stage 0 | 保持当前 fixture smoke | JSON / text 契约继续稳定；non-execution regression 继续通过 | 不新增 runner |
| Stage 1 | 定义 conformance manifest v0 | 明确 suite、case、expected_rules、input corpus、golden output、skip/xfail posture | 不执行外部命令 |
| Stage 2 | 定义 conformance report schema | report 能汇总 pass/fail/warn/skip/xfail、rule coverage、fixture coverage、golden drift | 不建 dashboard |
| Stage 3 | 最小 runner dry-run | 只读取 fixtures 和 validate output，生成 report，不改文件 | 不自动更新 golden |
| Stage 4 | Negative fixture gate | high-value negative fixtures 能稳定触发 expected rule | 不扩成全量标准认证 |

## Minimal Contract Candidate

| 字段 | 说明 |
|---|---|
| `suite_id` | conformance suite stable id |
| `suite_scope` | corpus / module / authoring-source / fixture-pack |
| `cases[]` | fixture case refs |
| `case.expected_status` | pass / fail / warn / skip / xfail |
| `case.expected_rules[]` | expected validation rule ids |
| `case.golden_refs[]` | optional golden export refs |
| `runner_mode` | dry-run / validate-only / report-only |
| `report_schema_version` | machine-readable report version |

## Entry Criteria

| Gate | Required before implementation |
|---|---|
| negative fixtures | At least one negative fixture per targeted rule family |
| report schema | Stable JSON fields for machine consumers |
| no execution invariant | Runner must not execute update commands by default |
| golden drift policy | Golden update remains review-gated |
| public wording | Docs must say this is not certification or runtime compliance |

## Risks

| 风险 | 控制 |
|---|---|
| 把 smoke runner 误当成 conformance | Stage 0 / Stage 1 分开 |
| expected_rules 变成 brittle exact text matching | 只匹配 rule id，不匹配 prose |
| 自动 golden update 破坏审查 | 默认 report-only，update 另立任务 |
| conformance 被外部误读成标准认证 | public wording 必须限制为 repo-local check |

## Decision

当前建议：不实现 runner。下一步若继续，应先做 Stage 1 文档 + report schema proposal，再决定是否进入 CLI dry-run。

## 非目标

- 不实现 conformance runner。
- 不自动更新 golden。
- 不执行 fixture update command。
- 不创建认证体系、dashboard 或远程测试平台。
