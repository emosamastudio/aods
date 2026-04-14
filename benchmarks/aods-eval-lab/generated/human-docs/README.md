# Atlas Release Ops overview

This benchmark compares verbose human lifecycle documentation against an equivalent AODS corpus.

## Canonical rules

## System overview

Phase: vision.

Use the root layer for system purpose, authority posture, and first-hop routing.

Required facts:

- Atlas Release Ops is a multi-tenant release coordination system for product launches and incident-ready rollouts.
- Authoritative semantics live in agent-primary AODS modules and human docs are paired explanatory surfaces.
- Cold-start routing begins at atlas-root and summary routing continues through atlas-capsule.

AODS representation: atlas-root/section:system-overview.

Context note: Use the root layer for system purpose, authority posture, and first-hop routing.

## Capsule routing

Phase: governance.

Use the capsule when a reader needs quick orientation before loading detail modules.

Required facts:

- Use product-lifecycle for goals, roadmap checkpoints, verification intent, and ADR rationale.
- Use architecture-contracts for topology, APIs, schemas, examples, templates, identifiers, and enums.
- Use delivery-workflows for approval flow, publish sequence, rollout decisions, lifecycle states, and analytics lineage.
- Use operations-governance for policy, events, error handling, temporal controls, and paired-surface discipline.

AODS representation: atlas-capsule/section:capsule-routing.

Context note: Use the capsule when a reader needs quick orientation before loading detail modules.

## Paired detail surfaces

- docs/01-product-lifecycle.md
- docs/02-architecture-and-contracts.md
- docs/03-delivery-workflows.md
- docs/04-operations-and-governance.md
