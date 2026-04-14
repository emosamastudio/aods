# north-star-os

Human-facing overview for the AODS v3 seven-plane pilot corpus.

## What this example models

This example models a seven-plane agent operating system:

1. Experience Plane
2. Gateway Plane
3. Control Plane
4. Harness / Runtime Plane
5. Agent Capability Plane
6. Portfolio / Project Plane
7. Knowledge & Resources Plane

Plus:

- Governance Spine
- Work Graph Backbone

## Agent entrypoints

- Root: `north-star-os-root`
- Capsule: `north-star-os-capsule`
- Canonical roster: `north-star-os-detail`

## Why this example exists

This corpus is the first non-self-referential AODS v3 example. It demonstrates:

- layered loading: root -> capsule -> detail
- explicit authority separation
- agent/human surface pairing through `surface_pairs`
- structured artifacts inside a real multi-module system
