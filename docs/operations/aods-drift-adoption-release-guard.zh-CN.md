# AODS Drift / Adoption / Release Guard Follow-up

状态：已完成
日期：2026-05-13
覆盖任务：U-321 到 U-330

## 结论

本轮完成最后一批 post-v0.8 follow-up：重新复查 code drift 路线、判断 terminology drift 是否能进入 hard gate、选择 glossary enforcement 的最小下一切片、决定暂不实现 lifecycle alias negative fixture、评估 docs density lint、补 external citation / resource surface 采用说明、汇总 runtime no-go、补 v0.8 adoption checklist，并定义下一 release naming guard。

本轮不改 schema、不改 validator、不新增 fixture。原因是当前最容易出错的点是把 prose-level 术语和 runtime intent 误做成 deterministic gate。更稳妥的路线是先增加结构化 term refs 的设计和采用说明，再进入负例实现。

## U-321 Code Drift Next Slice Revisit

Current code drift coverage is now strong enough for evidence visibility, but not yet for behavior oracle:

| Drift layer | Current status | Next best action |
|---|---|---|
| topology drift | `project_topology` and implementation repo locator checks exist | keep hardening unchecked locator docs, no remote fetch |
| implementation evidence drift | evidence status / locator / acceptance criteria are visible | next slice should focus on evidence freshness documentation and structured term refs |
| contract drift | stable metadata mirrors and criteria linkage exist | avoid semantic judge; use fixtures and explicit references |
| terminology drift | only structured glossary / enum / fixture paths are deterministic | add structured term refs before hard gate |
| behavior drift | not a deterministic AODS capability yet | defer to conformance fixtures / golden cases / external project tests |

Recommended next slice: structured terminology references for stable contracts and glossary-linked surfaces. This is more valuable than a broad code scanner because it turns a real drift pattern (`start` vs `begin`) into data that validator can check without guessing prose.

## U-322 Stable Terminology Drift Implementation Gate

Decision: do not implement a hard terminology drift gate in this round.

| Candidate gate | Decision | Reason |
|---|---|---|
| scan all prose for `begin` vs `start` | reject | high false-positive risk |
| infer synonyms with a model | reject | nondeterministic and not acceptable as authority |
| use existing glossary aliases only | partial | good for registered aliases, but not enough for stable contract term usage |
| add structured term refs first | accept as next design route | deterministic and testable |

Hard gate entry condition:

- stable contract or artifact rows carry explicit `term_refs[]`;
- glossary registry has current / deprecated / replacement records;
- validator checks only declared refs, not free text;
- fixture demonstrates mismatch with a named expected rule.

## U-323 Glossary Enforcement Next Slice

Minimum implementation route for a future round:

| Step | File surface | Acceptance |
|---|---|---|
| 1 | schema design doc | define `term_refs[]` placement for sections, artifacts, or stable contract rows |
| 2 | schema | allow refs to glossary term ids, not alias strings |
| 3 | validator | reject unresolved term refs and deprecated term refs on stable surfaces |
| 4 | source-first compile | mirror term refs from authoring to compiled corpus |
| 5 | fixture | include `start` canonical term and `begin` deprecated / unregistered mismatch |

Non-goal: no automatic rewrite, no NLP scan, no cross-corpus glossary resolver.

## U-324 Lifecycle Alias Negative Fixture Decision

Decision: defer fixture implementation.

Reason: a good negative fixture needs a structured field to fail on. Without `term_refs[]` or a lifecycle term registry, the fixture would need to rely on prose matching, which would make the expected failure rule unstable.

Future fixture shape:

```json
{
  "id": "stable-contract-lifecycle-term-mismatch",
  "expected_status": "fail",
  "expected_rules": [
    "stable-contract-term-ref-mismatch"
  ],
  "input": {
    "canonical_terms": ["start", "pend", "end"],
    "consumer_term_refs": ["begin"]
  }
}
```

Do not implement this until the rule has a structured input.

## U-325 Docs Density Lint Feasibility

Decision: do not add a docs density linter now.

| Check | Result |
|---|---|
| Existing docs volume | operations docs are large and historical by design |
| Good deterministic signal | current authority docs can be checked for links and stale current-state claims |
| Weak deterministic signal | line count, heading count, or word count alone would create noise |
| Better next action | archive split / current handoff pack before lint |

Feasible later lint:

- current authority docs must have status/date;
- current handoff must name next task range;
- current operations index must link the latest follow-up doc;
- historical docs may be exempt.

## U-326 External Citation Public Docs Snippet

Adoption snippet:

```json
{
  "meta": {
    "external_citations": [
      {
        "citation_id": "node-api-doc",
        "source_type": "api-doc",
        "locator": "https://example.invalid/api",
        "version_or_date": "2026-05-13",
        "authority_relation": "external-authority",
        "claim_posture": "authoritative-claim",
        "review_status": "current"
      }
    ]
  },
  "sections": [
    {
      "sid": "api-contract",
      "citation_refs": ["node-api-doc"]
    }
  ]
}
```

Usage rule: external citations support or constrain claims, but they do not replace internal AODS authority. AODS validates declared citation posture; it does not fetch URLs or fact-check the source.

## U-327 Resource Surface Docs Follow-up

Resource surface warning:

| A resource surface can declare | It does not provide |
|---|---|
| `resource_id`, `resource_kind`, `resource_scope` | resource runtime |
| owner and authority surface | permission broker |
| risk and exposure posture | scheduler |
| cleanup expectation | cleanup executor |
| evidence and acceptance criteria | production resource control |

Use resource surfaces to document what a consumer may rely on and what must be reviewed before exposure changes. Do not treat the example pack as an implementation of resource lifecycle management.

## U-328 Runtime No-Go Summary

Deferred runtime remains explicit:

| Runtime | Status | Entry condition |
|---|---|---|
| workflow engine | deferred | lifecycle object model, command receipt, persistence and retry semantics must be designed |
| event store / replay | deferred | event identity, ordering, retention, correction projection and replay scope must be designed |
| policy engine | deferred | input/output decision model, identity, approval and audit receipt must be designed |
| remote gateway | deferred | auth, transport, rate/cost, redaction and failure semantics must be designed |
| migration executor | deferred | dry-run, rollback, destructive approval and fixture coverage must be designed |
| cross-corpus resolver | deferred | trust, fetch, cache and conflict policy must be designed |
| telemetry store | deferred | privacy, retention, opt-in and report contract must be designed |

Metadata, examples, validation reports and conformance smoke do not imply any of these runtimes exist.

## U-329 v0.8 Adoption Checklist

Shortest adoption path:

1. Install from the GitHub Release tag or current package source.
2. Start with source-first authoring if the project can own `authoring.json`.
3. Run `aods compile` and `aods validate --strict`.
4. Add `--reality --repo-root <repo>` only when current surfaces need path checks.
5. Use `aods route --query ... --json` to load the smallest authority set.
6. Add fixture smoke or conformance manifest only after examples are stable.
7. Treat warnings as release blockers by running strict gates before publishing.
8. Do not claim runtime behavior unless the runtime is separately implemented and evidenced.

This checklist is now mirrored in the public README.

## U-330 Next Release Naming Guard

Current public latest release is `v0.8.0`, and package version is `0.8.0`. Next release naming guard:

| Scenario | Version route |
|---|---|
| docs-only follow-up | no release by default |
| backward-compatible schema / validator feature | `v0.9.0` candidate |
| patch to v0.8 behavior or docs with package impact | `v0.8.1` candidate |
| breaking schema / CLI behavior | reserve for later major decision, not automatic |

Before any next release:

1. choose version target and write it in operations docs;
2. update package and README version surfaces together;
3. run `npm run release:hygiene`;
4. check GitHub releases and tags;
5. create release only after version surface, tag and notes agree.

## Verification

| Gate | Result |
|---|---|
| Previous round quality review | pass |
| open public issue snapshot | `#60/#59/#41` |
| route query for drift / terminology / release surfaces | selected validation, authority governance and stable contracts |
| release list | latest `v0.8.0` |
| final release hygiene | pass |
