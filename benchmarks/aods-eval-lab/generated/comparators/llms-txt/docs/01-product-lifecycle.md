# Product lifecycle

This linked Markdown document is referenced from llms.txt as an AI-facing reading surface.

## Lifecycle artifacts

## Vision brief

Phase: vision.

State business outcome, release packet requirements, and explicit non-goals.

Required facts:

- Atlas Release Ops reduces release readiness coordination from two days to under thirty minutes.
- Every approved release must include an owner, a risk tier, a rollback plan, and a communication plan.
- Atlas Release Ops does not replace CI/CD executors or incident paging vendors.

AODS representation: product-lifecycle/section:vision-brief.

Context note: State business outcome, release packet requirements, and explicit non-goals.

## Competitor matrix

Phase: discovery.

Capture why existing alternatives fail under release-day pressure.

Required facts:

- Spreadsheets fail because approval state and rollback ownership drift during release day.
- ChatOps bots fail because they do not produce durable release packets with explicit authority.
- Traditional ALM suites are too heavyweight for release-day coordination across product, engineering, and support.

AODS representation: product-lifecycle/mapping-table.

Human-readable reference view:

```json
{
  "key_columns": [
    "alternative"
  ],
  "columns": [
    "alternative",
    "strength",
    "gap"
  ],
  "rows": [
    [
      "spreadsheets",
      "Fast to adopt for ad hoc tracking.",
      "Spreadsheets fail because approval state and rollback ownership drift during release day."
    ],
    [
      "chatops bots",
      "Fast commands for narrow release checks.",
      "ChatOps bots fail because they do not produce durable release packets with explicit authority."
    ],
    [
      "traditional alm suites",
      "Strong audit history for long projects.",
      "Traditional ALM suites are too heavyweight for release-day coordination across product, engineering, and support."
    ]
  ]
}
```

## Delivery plan

Phase: planning.

Set milestones that tie design readiness, controlled rollout, and operating readiness together.

Required facts:

- Alpha exit requires the release packet API, release state machine, and paired README governance to validate cleanly.
- Beta exit requires staged rollout policy, event catalog coverage, and rollback drills to complete without manual coordinator notes.
- General availability requires the sev1 escalation path, p99 publish latency budget, and change-history audit trail to be active.

AODS representation: product-lifecycle/section:delivery-plan.

Context note: Set milestones that tie design readiness, controlled rollout, and operating readiness together.

## Verification plan

Phase: test.

Define what must be proven before rollout automation is trusted.

Required facts:

- Each paired human surface must fail a human-only change under agent-primary sync.
- Each rollout risk tier must hit a deterministic branch in the rollout policy tree.
- Each rollback strategy class must be replayed in simulation before general availability.

AODS representation: product-lifecycle/section:verification-plan.

Context note: Define what must be proven before rollout automation is trusted.

## Decision log

Phase: design.

Persist design rationale in explicit statements instead of implicit habits.

Required facts:

- Agent-primary modules remain authoritative even when paired human docs are easier for operators to scan.
- Release risk scoring lives in the rollout decision tree instead of freeform checklist prose.
- Raw SQL and low-level migration evidence stay in the evidence layer and do not lead cold-start boot.

AODS representation: product-lifecycle/section:decision-log.

Context note: Persist design rationale in explicit statements instead of implicit habits.

## Release summary prompt

Phase: build.

Prompt template for generating rollout summaries without changing authority rules.

Required facts:

- Prompt template grounds summaries in owner, risk tier, rollout lanes, and rollback plan.
- Prompt template forbids inventing approval state that is absent from the release packet.
- Prompt template produces one summary for product, engineering, and support audiences.

AODS representation: product-lifecycle/prompt-template.

Human-readable reference view:

```json
{
  "system": "Summarize release packets without inventing state.",
  "template": "Summarize the release packet for product, engineering, and support. Include owner, risk tier, rollout lanes, and rollback plan. Do not invent approval state that is absent from the packet.",
  "variables": [
    "owner",
    "riskTier",
    "lanes",
    "rollbackPlan"
  ],
  "notes": [
    "Prompt template grounds summaries in owner, risk tier, rollout lanes, and rollback plan.",
    "Prompt template forbids inventing approval state that is absent from the release packet.",
    "Prompt template produces one summary for product, engineering, and support audiences."
  ]
}
```
