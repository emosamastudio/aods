# Delivery workflows

This document is the human-facing paired surface for delivery-workflows.

## Lifecycle artifacts

## Release approval flow

Phase: build.

Define how a release moves from draft to approved rollout preparation.

Required facts:

- Draft review checks packet completeness before any risk evaluation runs.
- Risk evaluation branches low and medium tiers to fast review and high tier to extended review.
- Approved packets emit a release.packet.approved event and enter scheduled state.

AODS representation: delivery-workflows/process-flow.

Human-readable reference view:

```json
{
  "entry": "draft-review",
  "terminals": [
    "approved",
    "held"
  ],
  "actors": [
    "release-manager",
    "workflow-engine",
    "engineering-lead"
  ],
  "steps": [
    {
      "id": "draft-review",
      "type": "action",
      "actor": "release-manager",
      "action": "Draft review checks packet completeness before any risk evaluation runs.",
      "next": "risk-evaluation"
    },
    {
      "id": "risk-evaluation",
      "type": "decision",
      "actor": "workflow-engine",
      "action": "Risk evaluation branches low and medium tiers to fast review and high tier to extended review.",
      "next": {
        "low-or-medium": "fast-review",
        "high": "extended-review"
      }
    },
    {
      "id": "fast-review",
      "type": "action",
      "actor": "engineering-lead",
      "action": "Confirm packet and rollback readiness in one review pass.",
      "next": "approved"
    },
    {
      "id": "extended-review",
      "type": "action",
      "actor": "engineering-lead",
      "action": "Escalate for broader review and attach mitigation notes.",
      "next": "approved"
    },
    {
      "id": "approved",
      "type": "emit",
      "actor": "workflow-engine",
      "action": "Approved packets emit a release.packet.approved event and enter scheduled state.",
      "event": "release.packet.approved",
      "payload_schema": "architecture-contracts:release-payload-schema",
      "next": null
    },
    {
      "id": "held",
      "type": "action",
      "actor": "workflow-engine",
      "action": "Stop rollout until packet defects or missing approvals are resolved.",
      "next": null
    }
  ]
}
```

## Publish sequence

Phase: release.

Show the temporal exchange during release publication.

Required facts:

- Release manager submits the approved packet to the release service.
- Workflow engine evaluates rollout lane health before the release service advances state.
- Notification service posts publish status after the release service confirms lane advancement.

AODS representation: delivery-workflows/sequence.

Human-readable reference view:

```json
{
  "actors": [
    {
      "id": "release-manager",
      "type": "user",
      "desc": "Human coordinator."
    },
    {
      "id": "release-service",
      "type": "service",
      "desc": "Canonical packet service."
    },
    {
      "id": "workflow-engine",
      "type": "service",
      "desc": "Policy engine."
    },
    {
      "id": "notification-service",
      "type": "service",
      "desc": "Outbound messaging service."
    }
  ],
  "messages": [
    {
      "seq": 1,
      "from": "release-manager",
      "to": "release-service",
      "action": "submit approved packet",
      "type": "sync",
      "note": "Release manager submits the approved packet to the release service."
    },
    {
      "seq": 2,
      "from": "release-service",
      "to": "workflow-engine",
      "action": "evaluate rollout lane",
      "type": "sync",
      "note": "Workflow engine evaluates rollout lane health before the release service advances state."
    },
    {
      "seq": 3,
      "from": "workflow-engine",
      "to": "release-service",
      "action": "lane approved",
      "type": "response"
    },
    {
      "seq": 4,
      "from": "release-service",
      "to": "notification-service",
      "action": "publish status update",
      "type": "event",
      "note": "Notification service posts publish status after the release service confirms lane advancement."
    }
  ]
}
```

## Rollout policy tree

Phase: release.

Map risk signals to rollout lane decisions.

Required facts:

- Low risk releases start in canary and auto-promote to staged after fifteen healthy minutes.
- Medium risk releases require manual staged promotion after support lead confirmation.
- High risk releases stop after canary unless engineering lead approves expanded rollout.

AODS representation: delivery-workflows/decision-tree.

Human-readable reference view:

```json
{
  "root": "risk-tier",
  "nodes": [
    {
      "id": "risk-tier",
      "type": "condition",
      "eval": "risk tier?",
      "branches": [
        {
          "value": "low",
          "next": "low-path"
        },
        {
          "value": "medium",
          "next": "medium-path"
        },
        {
          "value": "high",
          "next": "high-path"
        }
      ]
    },
    {
      "id": "low-path",
      "type": "action",
      "action": "Low risk releases start in canary and auto-promote to staged after fifteen healthy minutes."
    },
    {
      "id": "medium-path",
      "type": "action",
      "action": "Medium risk releases require manual staged promotion after support lead confirmation."
    },
    {
      "id": "high-path",
      "type": "action",
      "action": "High risk releases stop after canary unless engineering lead approves expanded rollout."
    }
  ]
}
```

## Release state machine

Phase: release.

Model the lifecycle states for a release packet.

Required facts:

- Release packets start in draft until packet completeness review passes.
- Approved packets can move to scheduled only after release.packet.approved is emitted.
- Released packets enter rolled_back when rollback execution succeeds.

AODS representation: delivery-workflows/state-machine.

Human-readable reference view:

```json
{
  "initial": "draft",
  "terminal": [
    "released",
    "rolled_back"
  ],
  "states": [
    {
      "id": "draft",
      "desc": "Release packets start in draft until packet completeness review passes."
    },
    {
      "id": "in_review",
      "desc": "Packet is under active approval review."
    },
    {
      "id": "approved",
      "desc": "Approved packets can move to scheduled only after release.packet.approved is emitted."
    },
    {
      "id": "scheduled",
      "desc": "Packet is ready for the rollout window."
    },
    {
      "id": "released",
      "desc": "Packet has completed rollout successfully."
    },
    {
      "id": "rolled_back",
      "desc": "Released packets enter rolled_back when rollback execution succeeds."
    }
  ],
  "transitions": [
    {
      "from": "draft",
      "to": "in_review",
      "trigger": "submit_for_review"
    },
    {
      "from": "in_review",
      "to": "approved",
      "trigger": "release.packet.approved"
    },
    {
      "from": "approved",
      "to": "scheduled",
      "trigger": "rollout_window_open"
    },
    {
      "from": "scheduled",
      "to": "released",
      "trigger": "lane_health_green"
    },
    {
      "from": "released",
      "to": "rolled_back",
      "trigger": "rollback_executed"
    }
  ]
}
```

## Analytics pipeline

Phase: operate.

Track how rollout and incident data become dashboards.

Required facts:

- Analytics pipeline consumes release.packet.approved and incident.created events from the event bus.
- Analytics pipeline normalizes packet owner, risk tier, rollout lane, and incident severity before storage.
- Analytics pipeline writes dashboard-ready facts into warehouse.release_health.

AODS representation: delivery-workflows/data-pipeline.

Human-readable reference view:

```json
{
  "source": {
    "id": "event-bus",
    "type": "queue",
    "desc": "Analytics pipeline consumes release.packet.approved and incident.created events from the event bus."
  },
  "sink": {
    "id": "warehouse.release_health",
    "type": "db",
    "desc": "Analytics pipeline writes dashboard-ready facts into warehouse.release_health."
  },
  "stages": [
    {
      "id": "ingest-events",
      "transform": "read release.packet.approved and incident.created payloads",
      "actor": "analytics-worker"
    },
    {
      "id": "normalize-fields",
      "transform": "Analytics pipeline normalizes packet owner, risk tier, rollout lane, and incident severity before storage.",
      "actor": "analytics-worker"
    },
    {
      "id": "load-warehouse",
      "transform": "write dashboard-ready release health facts",
      "actor": "analytics-worker"
    }
  ],
  "ordering": "sequential"
}
```
