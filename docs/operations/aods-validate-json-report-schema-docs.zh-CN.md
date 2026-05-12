# Validate JSON Report Schema Docs

任务：U-124
状态：已完成
日期：2026-05-12

## 目标

文档化 `validate --json` report 的 top-level fields、summary、reality topology 和 citation outputs。当前不新增独立 schema file。

## Base JSON Contract

命令：

```bash
node ./bin/aods.mjs validate . --strict --json | jq '{keys: keys, summary: .summary, level_keys:(.levels|keys), accepted, status, strict}'
```

| 字段 | 类型 / 形状 | 说明 |
|---|---|---|
| `corpus` | string | corpus id |
| `timestamp` | ISO timestamp string | report generated time |
| `levels` | object keyed by `L1`..`L4` | 每层 `pass/errors/warnings` |
| `summary.total_modules` | integer | module count |
| `summary.total_sections` | integer | section count |
| `summary.total_artifacts` | integer | artifact count |
| `summary.total_tokens` | integer | estimated token count |
| `summary.total_surface_pairs` | integer | surface pair count |
| `summary.errors` | integer | total errors |
| `summary.warnings` | integer | total warnings |
| `strict` | boolean | strict gate enabled |
| `accepted` | boolean | final gate result |
| `status` | `pass` / `fail` | final report status |

## Reality Extensions

命令：

```bash
node ./bin/aods.mjs validate ./examples/compiled-pilot --strict --reality --json
```

`--reality` 可增加：

| 字段 | 说明 |
|---|---|
| `topology` | implementation linkage / evidence / locator 摘要 |
| `external_citations` | declared citation posture 摘要 |

当前 `topology` keys：

`linked_modules`, `unlinked_modules`, `checked_paths`, `missing_paths`, `evidence_total`, `modules_with_evidence`, `modules_without_evidence`, `current_evidence`, `planned_evidence`, `stale_evidence`, `blocked_evidence`, `checked_evidence_locators`, `missing_evidence_locators`, `unchecked_repos`, `unchecked_reason`。

当前 `external_citations` keys：

`total`, `modules_with_citations`, `authoritative`, `current_authoritative`, `stale_authoritative`, `unresolved_authoritative`, `withheld_authoritative`, `assumptions`, `unsupported_assumptions`, `current`, `stale`, `unresolved`, `withheld`, `cited_refs`, `stable_decision_refs`, `stable_decision_current_authoritative_refs`, `stable_decision_noncurrent_authoritative_refs`。

## Consumer Guidance

| Consumer | 应使用 |
|---|---|
| CI gate | `accepted`, `status`, `summary.errors`, `summary.warnings`, `strict` |
| rule diagnosis | `levels.*.errors[]`, `levels.*.warnings[]` |
| implementation drift dashboard | `topology` |
| citation hygiene dashboard | `external_citations` |
| human terminal output | text mode |

## 非目标

- 不新增 JSON Schema 文件。
- 不保证 `timestamp` deterministic。
- 不把 optional reality fields 提升为 base report 必填字段。
- 不做 URL fetch 或 external fact validation。
