# AODS adoption sample pack and next task discovery

日期：2026-05-13
任务：U-372 到 U-381
阶段：S43 public docs / sample adoption；S44 next implementation planning

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| 最新提交 | 通过 | `9790dc9 Document CI public sync adoption follow-up` 已推送 |
| 任务台账 | 通过 | U-362 到 U-371 已完成，下一批默认为 U-372 到 U-381 |
| 公开事项 | 通过 | open issues 仍为 `#60/#59/#41` |
| 质量门禁 | 通过 | `npm run release:hygiene` 通过 |

返工结论：无返工项。上一轮成果合格，可以进入 U-372 到 U-381。

## U-372：Resource surface adoption example in README

Decision: keep the README resource entry as a table link, not an inline JSON snippet.

Reason:

- README already links to `examples/compiled-pilot/modules/shift-ops-resource-surface.json`.
- Inline resource JSON would make the first-run path longer without improving adoption.
- Resource surface remains metadata-only; README must not imply resource scheduler, cleanup executor, or permission broker support.

## U-373：Docs density current-authority metadata check

Decision: do not build a prose density linter.

Recommended future checker boundary:

| Check | Input | Gate |
|---|---|---|
| current authority marker | operations doc title / top metadata / index row | warning only |
| stale-current contradiction | title says current but index marks historical, or inverse | warning first |
| authority doc missing index row | `docs/operations/*.md` not listed in operations README | error candidate |
| task evidence missing current doc | completed task row references missing doc | error candidate |

Non-goals:

- No prose quality scoring.
- No LLM judge.
- No rewrite suggestion engine.

## U-374：Paired-surface sync current sample refresh

Current public sample route:

- `README.md` explains paired human / structured surfaces at a conceptual level.
- `docs/operations/aods-paired-surface-sync-example-report.zh-CN.md` remains the richer maintenance example.

Refresh decision:

| Surface | Decision |
|---|---|
| README | Keep conceptual; do not add a full paired report. |
| operations example | Keep as maintenance authority for current paired-surface report shape. |
| future docs sample | Add only after validator emits a stable paired-surface report envelope. |

## U-375：Validation JSON sample pack for public docs

Added:

- `docs/examples/validate-summary.sample.json`
- `docs/examples/README.md`

Sample scope:

- successful strict validate summary;
- L1-L4 pass shape;
- no location/remediation future fields until those fields are implemented.

Command evidence:

```bash
node ./bin/aods.mjs validate . --json
```

## U-376：Route JSON sample pack for public docs

Added:

- `docs/examples/route-explanation.sample.json`

Sample scope:

- `explanation.source`;
- `explanation.reason.selected_module_ids`;
- dependency coverage with selected and unselected examples;
- no full trace of every unselected module.

Command evidence:

```bash
node ./bin/aods.mjs route . --query "paired docs drift rules" --role doc-author --intent read --json
```

## U-377：Conformance report sample package inclusion decision

Decision: do not include docs sample JSON in the npm package yet.

Reason:

- `package.json` currently excludes `docs/`.
- The package already includes executable examples and conformance manifests under `examples/`.
- Adding curated docs samples to package would require expanding `scripts/check-package-surface.mjs` allowlist and release notes.

Future promotion gate:

1. decide whether samples are release artifacts or maintenance docs;
2. add package allowlist entries only if they are release artifacts;
3. rerun `npm run package:check-surface`.

## U-378：Benchmark generated artifact archive policy revisit

Decision: keep current generated hygiene policy.

Current policy remains:

- generated benchmark outputs are checked by `npm run generated:check-clean`;
- durable wording changes must come from source generator files;
- generated report churn should be accepted only when benchmark source or expected outputs intentionally changed.

No archive split is needed this round.

## U-379：Security placeholder scan pattern review

Review result:

| Area | Decision |
|---|---|
| GitHub tokens | keep current high-signal patterns |
| OpenAI-style keys | keep current pattern |
| AWS access keys | keep current pattern |
| Slack tokens | keep current pattern and existing synthetic-test allowlist |
| private keys | keep current pattern |

Decision: no new broad placeholder terms this round.

Reason: adding generic words such as `token`, `secret`, or `password` would create high noise in documentation examples. Keep this checker focused on secret-like concrete patterns.

## U-380：GitHub issue label / milestone hygiene review

Current open issues:

| Issue | Labels | Milestone | Decision |
|---|---|---|---|
| `#60` | `enhancement`, `priority/p0`, `area/governance` | none | keep |
| `#59` | `enhancement`, `priority/p3`, `area/validation`, `area/routing` | none | keep |
| `#41` | `enhancement`, `priority/p1`, `area/governance`, `area/schema` | none | keep |

Decision: no GitHub label or milestone edits this round.

Reason:

- Labels still match current work split.
- Milestones are not required until implementation scope is selected.
- Public comments from U-367 to U-369 are enough current-state sync.

## U-381：Next task pool expansion after S38

Added U-382 to U-431 to the task ledger.

Next recommended route:

1. implement structured term refs as the next low-risk semantic slice;
2. then add lifecycle alias negative fixtures;
3. then add evidence freshness and validation location envelope;
4. keep runtime systems behind entry gates.

## 下一轮建议

下一轮默认 U-382 到 U-391：structured term refs schema、compile mirror、validator gates、source-first example and docs.

## 非目标

- 不把 docs sample JSON 纳入 npm package。
- 不启用 CI。
- 不编辑 GitHub labels or milestones。
- 不关闭 `#41/#59/#60`。
- 不实现 runtime scheduler、resource executor、policy engine、remote gateway 或 migration tool。
