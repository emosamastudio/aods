# Architecture and contracts

This linked Markdown document is referenced from llms.txt as an AI-facing reading surface.

## Lifecycle artifacts

## Release topology

Phase: design.

Expose the services and data boundaries needed for release coordination.

Required facts:

- API Gateway accepts release packet writes and forwards them to the release service.
- Workflow Engine evaluates approval state and staged rollout policy for each release packet.
- Notification Service consumes release and incident events before messaging product, engineering, and support leads.

AODS representation: architecture-contracts/topology.

Human-readable reference view:

```json
{
  "nodes": [
    {
      "id": "web-console",
      "type": "gateway",
      "desc": "Web Console captures release packet edits from release managers."
    },
    {
      "id": "api-gateway",
      "type": "gateway",
      "desc": "API Gateway accepts release packet writes and forwards them to the release service."
    },
    {
      "id": "release-service",
      "type": "service",
      "desc": "Release Service stores release packets and current lifecycle state."
    },
    {
      "id": "workflow-engine",
      "type": "service",
      "desc": "Workflow Engine evaluates approval state and staged rollout policy for each release packet."
    },
    {
      "id": "event-bus",
      "type": "queue",
      "desc": "Event Bus fans release and incident events to downstream consumers."
    },
    {
      "id": "notification-service",
      "type": "service",
      "desc": "Notification Service consumes release and incident events before messaging product, engineering, and support leads."
    },
    {
      "id": "primary-db",
      "type": "database",
      "desc": "Primary DB stores release packets, approvals, and change history."
    }
  ],
  "edges": [
    {
      "from": "web-console",
      "to": "api-gateway",
      "type": "control",
      "protocol": "https",
      "desc": "Release managers submit or edit release packets."
    },
    {
      "from": "api-gateway",
      "to": "release-service",
      "type": "data",
      "protocol": "https",
      "desc": "API Gateway accepts release packet writes and forwards them to the release service."
    },
    {
      "from": "release-service",
      "to": "workflow-engine",
      "type": "control",
      "protocol": "internal-rpc",
      "desc": "Release Service requests approval and rollout evaluation."
    },
    {
      "from": "release-service",
      "to": "primary-db",
      "type": "data",
      "protocol": "postgres",
      "desc": "Release Service persists canonical packet and state history."
    },
    {
      "from": "workflow-engine",
      "to": "event-bus",
      "type": "event",
      "protocol": "kafka",
      "async": true,
      "desc": "Workflow Engine emits approval and rollout outcomes."
    },
    {
      "from": "event-bus",
      "to": "notification-service",
      "type": "event",
      "protocol": "kafka",
      "async": true,
      "desc": "Notification Service consumes release and incident events before messaging product, engineering, and support leads."
    }
  ],
  "groups": [
    {
      "id": "control-plane",
      "label": "Control plane",
      "node_ids": [
        "api-gateway",
        "release-service",
        "workflow-engine"
      ],
      "boundary": "logical"
    },
    {
      "id": "delivery-plane",
      "label": "Delivery plane",
      "node_ids": [
        "event-bus",
        "notification-service"
      ],
      "boundary": "logical"
    }
  ]
}
```

## Release API contract

Phase: design.

Define write, read, and incident creation endpoints against the release service.

Required facts:

- POST /v1/releases creates a release packet and returns the packet id.
- GET /v1/releases/{releaseId} returns the latest release packet, approval state, and rollout lane.
- POST /v1/incidents creates a linked incident record when rollout health degrades.

AODS representation: architecture-contracts/api-contract.

Human-readable reference view:

```json
{
  "provider": "release-service",
  "consumers": [
    "web-console",
    "workflow-engine",
    "support-ops"
  ],
  "protocol": "http",
  "base_url": "https://atlas.example.internal",
  "auth": "oauth2 bearer token",
  "version": "2026-04",
  "endpoints": [
    {
      "id": "create-release",
      "method": "POST",
      "path": "/v1/releases",
      "desc": "POST /v1/releases creates a release packet and returns the packet id.",
      "input": "release-payload-schema",
      "output": {
        "releaseId": "rel_2026_0420_checkout",
        "status": "draft"
      },
      "errors": [
        {
          "code": "400",
          "meaning": "Request failed schema validation.",
          "recovery": "Return field-level errors."
        },
        {
          "code": "409",
          "meaning": "Release packet key already exists.",
          "recovery": "Use the existing packet or a new key."
        }
      ],
      "sla": {
        "latency_p99": "250ms",
        "throughput": "50 rps",
        "availability": "99.95%"
      },
      "idempotent": false,
      "rate_limit": "30 rpm"
    },
    {
      "id": "get-release",
      "method": "GET",
      "path": "/v1/releases/{releaseId}",
      "desc": "GET /v1/releases/{releaseId} returns the latest release packet, approval state, and rollout lane.",
      "output": "release-created-example",
      "idempotent": true,
      "rate_limit": "120 rpm"
    },
    {
      "id": "create-incident",
      "method": "POST",
      "path": "/v1/incidents",
      "desc": "POST /v1/incidents creates a linked incident record when rollout health degrades.",
      "input": {
        "type": "object",
        "required": [
          "releaseId",
          "severity",
          "summary"
        ],
        "properties": {
          "releaseId": {
            "type": "string"
          },
          "severity": {
            "type": "string"
          },
          "summary": {
            "type": "string"
          }
        }
      },
      "output": {
        "incidentId": "inc_2026_0420_checkout",
        "linked": true
      },
      "idempotent": false,
      "rate_limit": "20 rpm"
    }
  ]
}
```

## Release payload schema

Phase: build.

Pin the canonical structure for a release packet.

Required facts:

- Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan.
- Release packet schema requires rolloutWindow.start and rolloutWindow.end in RFC3339 format.
- Release packet schema restricts rollout lanes to canary, staged, or full.

AODS representation: architecture-contracts/json-schema.

Human-readable reference view:

```json
{
  "type": "object",
  "required": [
    "releaseKey",
    "owner",
    "riskTier",
    "rollbackPlan",
    "communicationPlan",
    "rolloutWindow",
    "lanes"
  ],
  "properties": {
    "releaseKey": {
      "type": "string",
      "description": "Release packet identifier. Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."
    },
    "owner": {
      "type": "string",
      "description": "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."
    },
    "riskTier": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "description": "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."
    },
    "rollbackPlan": {
      "type": "string",
      "description": "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."
    },
    "communicationPlan": {
      "type": "string",
      "description": "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."
    },
    "rolloutWindow": {
      "type": "object",
      "required": [
        "start",
        "end"
      ],
      "description": "Release packet schema requires rolloutWindow.start and rolloutWindow.end in RFC3339 format.",
      "properties": {
        "start": {
          "type": "string",
          "format": "date-time"
        },
        "end": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "lanes": {
      "type": "array",
      "description": "Release packet schema restricts rollout lanes to canary, staged, or full.",
      "items": {
        "type": "string",
        "enum": [
          "canary",
          "staged",
          "full"
        ]
      }
    }
  }
}
```

## Release packet example

Phase: build.

Provide a concrete release packet instance for tests and integrations.

Required facts:

- Example packet owner is release-manager@atlas.dev.
- Example packet risk tier is medium and starts with canary before staged rollout.
- Example packet rollout window starts at 2026-04-20T09:00:00Z and ends at 2026-04-20T10:00:00Z.

AODS representation: architecture-contracts/json-example.

Human-readable reference view:

```json
{
  "releaseKey": "REL-2026-0420-CHECKOUT",
  "owner": "release-manager@atlas.dev",
  "riskTier": "medium",
  "rollbackPlan": "Flip checkout flag and drain queued publish jobs.",
  "communicationPlan": "Post to launch room and support status channel.",
  "rolloutWindow": {
    "start": "2026-04-20T09:00:00Z",
    "end": "2026-04-20T10:00:00Z"
  },
  "lanes": [
    "canary",
    "staged"
  ],
  "notes": [
    "Example packet owner is release-manager@atlas.dev.",
    "Example packet risk tier is medium and starts with canary before staged rollout.",
    "Example packet rollout window starts at 2026-04-20T09:00:00Z and ends at 2026-04-20T10:00:00Z."
  ]
}
```

## Client SDK template

Phase: build.

Show the minimum code needed to create a release packet from a client.

Required facts:

- Client template sends releaseKey REL-2026-0420-CHECKOUT to POST /v1/releases.
- Client template includes owner, riskTier, rollbackPlan, communicationPlan, rolloutWindow, and lanes.
- Client template sends an Authorization bearer token.

AODS representation: architecture-contracts/code-template.

Human-readable reference view:

```json
{
  "lang": "javascript",
  "template": "const payload = {\n  releaseKey: 'REL-2026-0420-CHECKOUT',\n  owner: 'release-manager@atlas.dev',\n  riskTier: 'medium',\n  rollbackPlan: 'Flip checkout flag and drain queued publish jobs.',\n  communicationPlan: 'Post to launch room and support status channel.',\n  rolloutWindow: { start: '2026-04-20T09:00:00Z', end: '2026-04-20T10:00:00Z' },\n  lanes: ['canary', 'staged']\n};\nawait fetch('https://atlas.example.internal/v1/releases', {\n  method: 'POST',\n  headers: { Authorization: 'Bearer ${TOKEN}', 'Content-Type': 'application/json' },\n  body: JSON.stringify(payload)\n});",
  "notes": [
    "Client template sends releaseKey REL-2026-0420-CHECKOUT to POST /v1/releases.",
    "Client template includes owner, riskTier, rollbackPlan, communicationPlan, rolloutWindow, and lanes.",
    "Client template sends an Authorization bearer token."
  ]
}
```

## Ops config template

Phase: build.

Pin the environment settings required by the benchmark system.

Required facts:

- Config template requires RELEASE_EVENT_TOPIC and NOTIFY_WEBHOOK_URL.
- Config template requires ROLLOUT_WINDOW_TIMEZONE set to UTC.
- Config template requires PAIR_SYNC_MODE set to agent-primary.

AODS representation: architecture-contracts/config-template.

Human-readable reference view:

```json
{
  "RELEASE_EVENT_TOPIC": "atlas.release.events",
  "NOTIFY_WEBHOOK_URL": "https://notify.example.internal/hooks/releases",
  "ROLLOUT_WINDOW_TIMEZONE": "UTC",
  "PAIR_SYNC_MODE": "agent-primary",
  "notes": [
    "Config template requires RELEASE_EVENT_TOPIC and NOTIFY_WEBHOOK_URL.",
    "Config template requires ROLLOUT_WINDOW_TIMEZONE set to UTC.",
    "Config template requires PAIR_SYNC_MODE set to agent-primary."
  ]
}
```

## Release key regex

Phase: design.

Keep release identifiers stable across docs, APIs, and runbooks.

Required facts:

- Release keys match REL-YYYY-MMDD-SLUG in uppercase.
- Release key sample REL-2026-0420-CHECKOUT must validate cleanly.
- Release key regex prevents ambiguous packet identifiers in docs and APIs.

AODS representation: architecture-contracts/regex.

Human-readable reference view:

```json
{
  "pattern": "^REL-[0-9]{4}-[0-9]{4}-[A-Z0-9-]+$",
  "flags": "",
  "sample": "REL-2026-0420-CHECKOUT",
  "notes": [
    "Release keys match REL-YYYY-MMDD-SLUG in uppercase.",
    "Release key sample REL-2026-0420-CHECKOUT must validate cleanly.",
    "Release key regex prevents ambiguous packet identifiers in docs and APIs."
  ]
}
```

## Role enum

Phase: design.

Expose the minimum stable actor set used across approvals and notifications.

Required facts:

- release-manager owns packet quality and approval completeness.
- engineering-lead owns rollout safety and rollback execution.
- support-lead owns customer-impact communication during release and incident flow.

AODS representation: architecture-contracts/enum-def.

Human-readable reference view:

```json
[
  {
    "id": "release-manager",
    "desc": "release-manager owns packet quality and approval completeness."
  },
  {
    "id": "engineering-lead",
    "desc": "engineering-lead owns rollout safety and rollback execution."
  },
  {
    "id": "support-lead",
    "desc": "support-lead owns customer-impact communication during release and incident flow."
  }
]
```
