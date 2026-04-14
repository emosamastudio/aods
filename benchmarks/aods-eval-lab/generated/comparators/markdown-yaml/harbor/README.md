---
profile: "markdown-yaml"
title: "Harbor Change Control overview"
modules:
  - "harbor-root"
  - "harbor-capsule"
phases:
  - "vision"
  - "governance"
tags:
  - "root"
  - "harbor"
  - "routing"
  - "compliance"
  - "capsule"
  - "summary"
artifact_types:
  []
---
# Harbor Change Control overview

This Markdown plus YAML baseline models a TechDocs-style documentation slice.

## Canonical rules

## Harbor system overview

Phase: vision.

Use the root layer for regulated change-control purpose, authority posture, and first-hop routing.

Required facts:

- Harbor Change Control coordinates regulated production changes for clinical data systems and external auditor review.
- Human-primary SOP pages are allowed only when the pair declares sync_source=human-primary explicitly.
- Cold-start routing begins at harbor-root and summary routing continues through harbor-capsule.

AODS representation: harbor-root/section:harbor-system-overview.

Context note: Use the root layer for regulated change-control purpose, authority posture, and first-hop routing.

## Harbor capsule routing

Phase: governance.

Use the capsule for quick change-control orientation.

Required facts:

- Use harbor-change-control for approval rules, exception handling, and sign-off authority.
- Use harbor-audit-evidence for evidence bundles, retention policy, and audit query references.

AODS representation: harbor-capsule/section:harbor-capsule-routing.

Context note: Use the capsule for quick change-control orientation.

## Linked detail surfaces

- harbor/docs/01-change-control.md
- harbor/docs/02-audit-evidence.md
