# AODS CI / public sync / adoption follow-up

日期：2026-05-13
任务：U-362 到 U-371
阶段：S42 CI owner packet；S43 public sync / adoption docs

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| 最新提交 | 通过 | `d727358 Document skill index release maintenance gates` 已推送 |
| 任务台账 | 通过 | U-352 到 U-361 已完成，下一批默认为 U-362 到 U-371 |
| 公开事项 | 通过 | open issues 仍为 `#60/#59/#41` |
| 质量门禁 | 通过 | `npm run release:hygiene` 通过 |

返工结论：无返工项。上一轮成果合格，可以进入 U-362 到 U-371。

## U-362：CI minimal workflow owner packet

推荐最小 CI workflow 只跑低噪声、本地已稳定的 gate：

| Gate | Command | CI suitability |
|---|---|---|
| docs links | `npm run docs:check-links` | yes |
| package surface | `npm run package:check-surface -- --json` | yes |
| generated clean | `npm run generated:check-clean -- --json` | yes, but only after generated churn policy stays stable |
| corpus validation | `npm run validate:all` | yes |
| release aggregate | `npm run release:hygiene` | yes as one job, but slower |

Owner packet recommendation: start with a single `release:hygiene` job only after archive/index split reduces governance-doc churn. Until then, keep these as local release gates.

## U-363：docs link checker CI feasibility rerun

Rerun result:

| Command | Result |
|---|---|
| `npm run docs:check-links` | `markdown_files=167 checked_relative_links=61 missing=0` |

CI decision: feasible, low risk.

Reasoning:

- It checks only local relative links.
- It does not fetch remote URLs.
- It already excludes noisy generated external corpus areas.

Recommended trigger: pull request and push to `main` once CI is introduced.

## U-364：package surface CI feasibility rerun

Rerun result:

```json
{
  "package": "aods@0.8.0",
  "entry_count": 61,
  "expected_entry_count": 61,
  "missing": [],
  "unexpected": []
}
```

CI decision: feasible, low risk.

Reasoning:

- It prevents accidental npm package surface drift.
- It is deterministic.
- The allowlist flow is already documented.

## U-365：generated clean CI feasibility rerun

Rerun result:

```json
{
  "checked_paths": [
    "benchmarks/aods-eval-lab/generated",
    "benchmarks/aods-eval-lab/reports",
    "examples/compiled-pilot"
  ],
  "dirty_entries": []
}
```

CI decision: feasible after archive/index split, but not first CI gate.

Reasoning:

- The check is deterministic, but generated docs/examples are touched often during maintenance.
- It should remain a release gate now and become CI once the current governance docs are less noisy.

## U-366：runtime no-go public issue sync decision

Decision: sync runtime no-go publicly as part of `#60` status refresh.

Executed public comment:

- `#60`: https://github.com/emosamastudio/aods/issues/60#issuecomment-4437175500

The comment explicitly says runtime systems remain out of scope until separately authorized: provider discovery, auth exchange, fallback execution, remote gateway, telemetry store, dashboard, and runtime scheduler are not included.

## U-367：capability negotiation public status refresh

Executed public comment:

- `#41`: https://github.com/emosamastudio/aods/issues/41#issuecomment-4437172240

Status synchronized:

- unsupported reason metadata;
- fallback posture / degraded behavior / consumer action metadata;
- conformance fixture candidates for unsupported, partial, and unknown outcomes;
- no runtime discovery, auth exchange, provider selection, fallback execution, dynamic probing, or remote adapter calls.

## U-368：observability public status refresh

Executed public comment:

- `#59`: https://github.com/emosamastudio/aods/issues/59#issuecomment-4437174015

Status synchronized:

- validator issue location envelope;
- suggested-action coverage;
- route skipped-module opt-in, not default full trace;
- compact validate / route JSON sample packs;
- no telemetry store, dashboard, trace backend, route ranking rewrite, or output subsystem rewrite.

## U-369：governance roadmap public status refresh

Executed public comment:

- `#60`: https://github.com/emosamastudio/aods/issues/60#issuecomment-4437175500

Decision: use a comment this round, not body edit.

Reason:

- Comment is enough to update public status without rewriting the long historical tracker body.
- Body edit can be revisited after U-380 label / milestone hygiene and after the remaining task pool closes.

## U-370：conformance external adoption example follow-up

Current external adoption path is sufficient but long.

Recommendation:

| Surface | Decision |
|---|---|
| README | Keep short command path only. |
| `examples/compiled-pilot-source/README.md` | Best place for full adoption detail. |
| operations docs | Keep maintenance / decision context. |
| package docs | Do not add sample JSON to package until U-377 decision. |

No README change this round because the public README already includes install, compile, validate, route, fixture smoke, and conformance commands.

## U-371：external citation adoption example in README

Decision: do not promote the external citation snippet into README yet.

Reason:

- README already links to the compiled pilot governance module and runtime glossary / citation examples.
- Adding raw JSON now would lengthen the README without improving first-run adoption.
- Better path: create compact sample packs first, then link README to those samples.

Future route: revisit after U-375 / U-376 sample packs and U-377 package inclusion decision.

## 下一轮建议

下一轮默认 U-372 到 U-381：resource surface README decision, docs current-authority metadata check, paired-surface sample refresh, validate/route JSON sample packs, conformance sample package inclusion, benchmark archive policy, secret-placeholder scan review, GitHub label/milestone hygiene, and next task discovery.

## 非目标

- 不启用 CI。
- 不创建 GitHub workflow。
- 不编辑 release/tag/package version。
- 不关闭 `#41/#59/#60`。
- 不编辑 GitHub labels or milestones。
- 不把 external citation JSON 直接塞进 README。
