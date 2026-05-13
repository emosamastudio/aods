# AODS observability next slice

状态：已完成
日期：2026-05-13

## 结论

本轮完成 U-281 到 U-290。当前 `route --json` 已经有可消费的 `explanation.source`、`explanation.reason`、`explanation.dependency`；下一步不应重写 route ranking，也不应输出全量未选模块。当前 `validate --json` 的 issue 已有 `level`、`rule`、`message`、`module_id`、`sid`、`path` 和部分 rule-specific 字段，但没有统一 `location` 对象，也不是所有 rule 都有 `remediation`。

因此 `#59` 的下一阶段应走两条小路线：

1. validator issue location envelope：把已有定位字段规范成稳定输出边界。
2. validator suggested-action coverage：给高价值 rule 补最小 remediation，而不是建立 dashboard、trace store 或 telemetry backend。

## U-281 validator source-location audit

当前 validation issue 输出现状：

| 字段 | 当前状态 | 说明 |
|---|---|---|
| `level` | 已有 | L1/L2/L3/L4 |
| `rule` | 已有 | 可作为 machine-readable rule id |
| `message` | 已有 | 人类可读说明 |
| `module_id` | 部分已有 | module-scoped issue 才稳定出现 |
| `sid` | 部分已有 | section-scoped issue 才稳定出现 |
| `path` | 部分已有 | schema / JSON pointer / corpus path 混用 |
| `severity_class` | 部分已有 | 只有部分 richer diagnostic 使用 |
| `remediation` | 部分已有 | implementation / contract drift 等 rule 已覆盖 |

缺口：调用方要把 issue 定位回文件、JSON pointer、模块或 section 时，需要理解多个可选字段的历史含义。

## U-282 validator issue location minimal schema

建议后续最小 schema：

```json
{
  "location": {
    "source_path": "modules/example.json",
    "json_pointer": "/sections/0/content",
    "module_id": "example-module",
    "sid": "example-section",
    "artifact_id": null,
    "surface_ref": null
  }
}
```

字段边界：

| 字段 | 规则 |
|---|---|
| `source_path` | repo/corpus relative path；未知时为 `null` |
| `json_pointer` | JSON Pointer；不是 JSON 结构定位时为 `null` |
| `module_id` | module-scoped issue 的 module id |
| `sid` | section-scoped issue 的 section id |
| `artifact_id` | artifact-scoped issue 的 artifact id |
| `surface_ref` | paired surface / glossary / citation / topology 等跨 surface ref |

非目标：不保证 line/column，不读取 sourcemap，不改 Ajv error semantics，不把 validator 改成 IDE diagnostic server。

## U-283 validator location regression plan

后续 focused regression 应覆盖：

| Fixture | Expected |
|---|---|
| invalid manifest schema path | `location.source_path="manifest.json"` and `location.json_pointer` from Ajv instance path |
| module schema failure | `location.source_path` points at module path and `module_id` is present |
| missing section ref | `module_id` and `sid` are present when source section is known |
| topology duplicate repo id | `location.json_pointer` points at `project_topology.implementation_repos` |
| surface pair generated drift | `surface_ref` or pair id is present |

The first implementation slice should add location envelope while preserving existing top-level fields for compatibility.

## U-284 validator suggested-action coverage audit

Current `remediation` coverage is strongest for implementation and contract drift findings. Many basic L1/L2 rules still only return a prose message.

| Rule family | Current action quality | Next value |
|---|---|---|
| schema parse / schema validation | low | tell author which file or field to fix |
| missing module / missing path refs | medium | suggest add module, fix id, or remove stale ref |
| topology duplicate repo id | medium | suggest rename duplicate or remove stale repo |
| glossary / citation refs | medium | suggest add target record or fix ref |
| surface pair drift | high | already has clearer sync path in surrounding docs |
| implementation evidence / acceptance | high | existing remediation vocabulary is useful |

## U-285 suggested-action next slice

Choose these three rule groups first:

| Rule group | Why first | Suggested action |
|---|---|---|
| `module-path-exists` / `module-json-parse` | frequent authoring failure | fix path, add file, or remove manifest entry |
| `implementation-repo-id-unique` | identity ambiguity affects reality checks | rename duplicate repo id or remove stale entry |
| `boot-by-touch-module-ref` / `role-required-module` | routing correctness issue | add missing module or update route/role ref |

These are deterministic and do not require semantic inference.

## U-286 route skipped-module semantics audit

`route --json` already exposes:

- selected modules in `recommended_modules`
- matched modules in `matched_query_modules`
- selected and unselected declared dependencies in `explanation.dependency`

It should not output every skipped module by default. In large corpora, that would be noisy and could turn a small working-set route into an implicit full-corpus report.

## U-287 route skipped-module boundary design

Recommended boundary:

| Field | Emit when | Meaning |
|---|---|---|
| `explanation.skipped` | only when `--explain-skipped` or a future explicit flag is used | bounded list, not all modules |
| `skipped[].module_id` | explicit explain mode only | module considered but not selected |
| `skipped[].reason` | explicit explain mode only | below threshold, dependency not expanded, role mismatch, layer mismatch, or touch miss |
| `skipped[].consumer_guidance` | explicit explain mode only | load manually, refine query, use touch route, or inspect deps |

Non-goals: no ranking rewrite, no default full skipped list, no trace store, no dashboard.

## U-288 route explanation docs refresh

README now states that `route --json` includes `explanation.source`, `explanation.reason`, and `explanation.dependency`, and that dependency status can be `selected`, `unselected`, or `missing`.

## U-289 observability example output pack

Suggested future sample files:

| Sample | Purpose |
|---|---|
| `docs/examples/route-explanation.sample.json` | stable route explanation snapshot |
| `docs/examples/validate-issue-location.sample.json` | future validation location envelope example |
| `docs/examples/validate-remediation.sample.json` | future suggested-action example |

Do not add generated samples until their output shape is stable enough to avoid churn.

## U-290 public status refresh

`#59` should remain open. Current coverage is enough to show progress, but validator location and suggested-action consistency still need follow-up tasks U-281 to U-285 before closing.
