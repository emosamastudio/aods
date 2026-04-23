# Product lifecycle

> **Reading surface:** Standalone human-readable example derived from an agent-primary `product-lifecycle` module. In this repository it is published as an illustrative reading surface rather than as a fully linked compiled corpus companion.
>
> **Covers:** goals, non-goals, discovery findings, roadmap milestones, verification plan, architecture decision records (ADRs), and the release summary prompt template.

---

## Goals

**Phase:** vision · **AODS module:** `product-lifecycle/section:vision-brief`

State business outcome, release packet requirements, and explicit non-goals. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

Atlas Release Ops reduces release readiness coordination from two days to under thirty minutes. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

Every approved release must include an owner, a risk tier, a rollback plan, and a communication plan. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### Non-goals

Atlas Release Ops does not replace CI/CD executors or incident paging vendors. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

---

## Discovery findings

**Phase:** discovery

The competitor matrix captures why existing alternatives fail under release-day pressure. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

| Alternative | Strength | Gap |
|---|---|---|
| Spreadsheets | Fast to adopt for ad hoc tracking. | Approval state and rollback ownership drift during release day. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md)) |
| ChatOps bots | Fast commands for narrow release checks. | Do not produce durable release packets with explicit authority. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md)) |
| Traditional ALM suites | Strong audit history for long projects. | Too heavyweight for release-day coordination across product, engineering, and support. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md)) |

---

## Roadmap

**Phase:** planning

Milestones tie design readiness, controlled rollout, and operating readiness together. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### Alpha exit

Alpha exit requires the release packet API, release state machine, and paired README governance to validate cleanly. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### Beta exit

Beta exit requires staged rollout policy, event catalog coverage, and rollback drills to complete without manual coordinator notes. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### General availability

General availability requires the sev1 escalation path, p99 publish latency budget, and change-history audit trail to be active. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

---

## Verification plan

**Phase:** test

Verification defines what must be proven before rollout automation is trusted. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

- Each paired human surface must fail a human-only change under agent-primary sync. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))
- Each rollout risk tier must hit a deterministic branch in the rollout policy tree. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))
- Each rollback strategy class must be replayed in simulation before general availability. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

---

## ADR — Architecture Decision Records

**Phase:** design

Design rationale is persisted in explicit statements instead of implicit habits. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### ADR-01 — Agent-primary modules are authoritative

Agent-primary modules remain authoritative even when paired human docs are easier for operators to scan. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### ADR-02 — Risk scoring lives in the rollout decision tree

Release risk scoring lives in the rollout decision tree instead of freeform checklist prose. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

### ADR-03 — Evidence layer isolation

Raw SQL and low-level migration evidence stay in the evidence layer and do not lead cold-start boot. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

---

## Release summary prompt

**Phase:** build

A prompt template is provided for generating rollout summaries without changing authority rules. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

**Template:** Summarize the release packet for product, engineering, and support. Include owner, risk tier, rollout lanes, and rollback plan. Do not invent approval state that is absent from the packet. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

**Variables:** `owner`, `riskTier`, `lanes`, `rollbackPlan`

**Constraints:**

- Summaries are grounded in owner, risk tier, rollout lanes, and rollback plan. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))
- Inventing approval state that is absent from the release packet is forbidden. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))
- One summary is produced for product, engineering, and support audiences. ([`docs/01-product-lifecycle.md`](01-product-lifecycle.md))

---

## Cross-references

This standalone example does not publish the full companion surface set. Treat it as a single illustrative reading surface, not as a complete docs bundle.
