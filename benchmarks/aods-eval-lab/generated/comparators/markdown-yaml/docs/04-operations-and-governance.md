---
profile: "markdown-yaml"
title: "Operations and governance"
modules:
  - "operations-governance"
  - "evidence-reference"
phases:
  - "governance"
  - "operate"
  - "release"
tags:
  - "operations"
  - "governance"
  - "incident"
  - "policy"
  - "slo"
  - "evidence"
  - "raw"
  - "sql"
  - "escape-hatch"
artifact_types:
  - "rule-set"
  - "mapping-table"
  - "event-catalog"
  - "error-strategy"
  - "temporal-pattern"
  - "raw"
---
# Operations and governance

This Markdown plus YAML baseline models a TechDocs-style documentation slice.

## Lifecycle artifacts

## Approval rules

Phase: governance.

Make approval authority explicit instead of social convention.

Required facts:

- High risk releases require engineering lead approval and support lead acknowledgement.
- Human docs cannot change alone when sync_source is agent-primary.
- No release may enter scheduled outside the declared rollout window.

AODS representation: operations-governance/rule-set.

Human-readable reference view:

```json
{
  "evaluation_mode": "priority-ordered",
  "default_action": "pass",
  "conflict_resolution": "most-restrictive-wins",
  "rules": [
    {
      "id": "high-risk-approvals",
      "condition": "release.riskTier == 'high'",
      "action": "High risk releases require engineering lead approval and support lead acknowledgement.",
      "priority": 10,
      "source": "governance"
    },
    {
      "id": "paired-surface-sync",
      "condition": "surface_pair.sync_source == 'agent-primary' AND human.changed == true AND agent.changed == false",
      "action": "Human docs cannot change alone when sync_source is agent-primary.",
      "priority": 20,
      "source": "governance"
    },
    {
      "id": "window-guard",
      "condition": "now not_in release.rolloutWindow",
      "action": "No release may enter scheduled outside the declared rollout window.",
      "priority": 30,
      "source": "governance"
    }
  ]
}
```

## On-call routing

Phase: operate.

Map incident severity to response ownership.

Required facts:

- sev1 pages primary and secondary on-call within five minutes.
- sev2 pages primary on-call and support lead within fifteen minutes.
- sev3 creates a queued task for business-hours triage.

AODS representation: operations-governance/mapping-table.

Human-readable reference view:

```json
{
  "key_columns": [
    "severity"
  ],
  "columns": [
    "severity",
    "owner",
    "response"
  ],
  "rows": [
    [
      "sev1",
      "primary+secondary on-call",
      "sev1 pages primary and secondary on-call within five minutes."
    ],
    [
      "sev2",
      "primary on-call + support lead",
      "sev2 pages primary on-call and support lead within fifteen minutes."
    ],
    [
      "sev3",
      "support rotation",
      "sev3 creates a queued task for business-hours triage."
    ]
  ]
}
```

## Event catalog

Phase: operate.

Track durable events and their consumers.

Required facts:

- release.packet.approved is emitted by workflow-engine and consumed by release-service and analytics-worker.
- release.packet.published is emitted by release-service and consumed by notification-service.
- incident.created is emitted by release-service when rollout health degrades.

AODS representation: operations-governance/event-catalog.

Human-readable reference view:

```json
{
  "events": [
    {
      "name": "release.packet.approved",
      "emitter": "workflow-engine",
      "consumers": [
        "release-service",
        "analytics-worker"
      ],
      "desc": "release.packet.approved is emitted by workflow-engine and consumed by release-service and analytics-worker.",
      "ordering": "ordered"
    },
    {
      "name": "release.packet.published",
      "emitter": "release-service",
      "consumers": [
        "notification-service",
        "analytics-worker"
      ],
      "desc": "release.packet.published is emitted by release-service and consumed by notification-service.",
      "ordering": "ordered"
    },
    {
      "name": "incident.created",
      "emitter": "release-service",
      "consumers": [
        "notification-service",
        "support-ops"
      ],
      "desc": "incident.created is emitted by release-service when rollout health degrades.",
      "ordering": "idempotent"
    }
  ],
  "channels": [
    {
      "id": "atlas.release.events",
      "transport": "kafka",
      "events": [
        "release.packet.approved",
        "release.packet.published",
        "incident.created"
      ]
    }
  ]
}
```

## Rollback strategy

Phase: operate.

Define what happens under failure classes.

Required facts:

- Webhook delivery failures retry three times with exponential backoff before escalation.
- Primary database write failures abort publish and escalate to platform-oncall.
- Negative rollout health triggers compensate by executing the rollback plan.

AODS representation: operations-governance/error-strategy.

Human-readable reference view:

```json
{
  "default_strategy": "escalate",
  "error_classes": [
    {
      "class": "webhook-delivery-failure",
      "severity": "medium",
      "strategy": {
        "type": "retry",
        "retry_max": 3,
        "retry_delay": "30s",
        "retry_backoff": "exponential"
      },
      "alerts": [
        {
          "channel": "ops-alerts",
          "condition": "after third failure"
        }
      ],
      "match": "notify.*"
    },
    {
      "class": "primary-db-write-failure",
      "severity": "critical",
      "strategy": {
        "type": "abort"
      },
      "alerts": [
        {
          "channel": "platform-oncall",
          "condition": "on first failure"
        }
      ],
      "match": "db.write.*"
    },
    {
      "class": "negative-rollout-health",
      "severity": "high",
      "strategy": {
        "type": "compensate",
        "compensate_action": "execute rollback plan"
      },
      "match": "health.red"
    }
  ],
  "fallback_chain": [
    "Webhook delivery failures retry three times with exponential backoff before escalation.",
    "Primary database write failures abort publish and escalate to platform-oncall.",
    "Negative rollout health triggers compensate by executing the rollback plan."
  ]
}
```

## Temporal controls

Phase: release.

Represent windows, deadlines, and SLO timers.

Required facts:

- Rollout window is a UTC deadline window from 09:00 to 10:00.
- Canary health is evaluated every five minutes.
- Publish status must reach notification-service within sixty seconds.

AODS representation: operations-governance/temporal-pattern.

Human-readable reference view:

```json
{
  "timezone": "UTC",
  "patterns": [
    {
      "id": "rollout-window",
      "type": "window",
      "expression": "09:00-10:00",
      "target": "release rollout",
      "on_trigger": "allow scheduled releases",
      "on_violation": "hold publish"
    },
    {
      "id": "canary-health-check",
      "type": "interval",
      "expression": "5m",
      "target": "canary lane",
      "on_trigger": "evaluate lane health"
    },
    {
      "id": "publish-sla",
      "type": "sla-timer",
      "expression": "60s",
      "target": "notification-service publish status",
      "on_violation": "open sev2 incident"
    }
  ]
}
```

## Raw migration evidence

Phase: operate.

Keep low-level evidence without pretending it is structured lifecycle guidance.

Required facts:

- Raw migration adds release_packets.approval_snapshot as immutable JSONB evidence.
- Raw SQL evidence stays in the evidence layer and is not loaded on cold start.
- Raw artifacts preserve facts but reduce structured traversability.

AODS representation: evidence-reference/raw.

Human-readable reference view:

```json
"ALTER TABLE release_packets ADD COLUMN approval_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;\n-- Raw migration adds release_packets.approval_snapshot as immutable JSONB evidence.\n-- Raw SQL evidence stays in the evidence layer and is not loaded on cold start.\n-- Raw artifacts preserve facts but reduce structured traversability.\n"
```
