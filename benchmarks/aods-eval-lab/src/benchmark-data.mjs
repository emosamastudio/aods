function fact(id, text, critical = true) {
  return { id, text, critical };
}

export const SYSTEM = {
  id: "atlas-release-ops",
  name: "Atlas Release Ops",
  purpose: "Independent benchmark corpus for a multi-tenant release coordination and incident-ready rollout system.",
  profile: {
    dataset_class: "synthetic-lifecycle",
    domains: ["release-ops"],
    languages: ["en"],
    sync_modes: ["agent-primary"],
    surface_kinds: ["readme", "markdown-docs", "json-modules"],
    evidence_kinds: ["sql", "json", "markdown"]
  },
  glossary: {
    system: "Atlas Release Ops benchmark corpus",
    release_packet: "Canonical release unit with owner, risk tier, rollback plan, communication plan, and rollout window.",
    paired_surface: "Human-facing file linked to one or more authoritative agent-primary modules.",
    rollout_lane: "One deployment cohort used for canary, staged, or full release decisions."
  }
};

export const MODULE_BLUEPRINTS = [
  {
    id: "atlas-root",
    path: "modules/atlas-root.json",
    scope: "Cold-start routing for the benchmark corpus. Use for first-hop orientation.",
    category: "architecture",
    layer: "root",
    deps: [],
    tags: ["root", "routing", "overview", "benchmark"],
    priority: "critical"
  },
  {
    id: "atlas-capsule",
    path: "modules/atlas-capsule.json",
    scope: "Capsule summary and route fanout across product, architecture, workflow, and operations slices.",
    category: "capsule",
    layer: "capsule",
    deps: [],
    tags: ["capsule", "summary", "routes", "benchmark"],
    priority: "critical"
  },
  {
    id: "product-lifecycle",
    path: "modules/product-lifecycle.json",
    scope: "Goals, non-goals, discovery findings, milestones, authoring prompts, and design rationale.",
    category: "policy",
    layer: "detail",
    deps: [],
    tags: ["product", "goals", "roadmap", "adr", "prompt"],
    priority: "standard"
  },
  {
    id: "architecture-contracts",
    path: "modules/architecture-contracts.json",
    scope: "System topology, release APIs, payload schemas, examples, templates, identifiers, and role enums.",
    category: "reference",
    layer: "detail",
    deps: [],
    tags: ["architecture", "api", "schema", "contracts", "config"],
    priority: "standard"
  },
  {
    id: "delivery-workflows",
    path: "modules/delivery-workflows.json",
    scope: "Approval workflow, publish sequence, rollout policy tree, lifecycle state machine, and analytics pipeline.",
    category: "policy",
    layer: "detail",
    deps: ["architecture-contracts"],
    tags: ["workflow", "rollout", "state", "sequence", "pipeline"],
    priority: "standard"
  },
  {
    id: "operations-governance",
    path: "modules/operations-governance.json",
    scope: "Approval rules, on-call mapping, event catalog, rollback strategy, temporal controls, and validation guidance.",
    category: "policy",
    layer: "detail",
    deps: ["delivery-workflows"],
    tags: ["operations", "governance", "incident", "policy", "slo"],
    priority: "standard"
  },
  {
    id: "evidence-reference",
    path: "modules/evidence-reference.json",
    scope: "Escape-hatch artifacts and evidence-only material such as raw SQL or external snippets.",
    category: "reference",
    layer: "evidence",
    deps: ["operations-governance"],
    tags: ["evidence", "raw", "sql", "escape-hatch"],
    priority: "standard"
  }
];

export const HUMAN_DOCS = [
  {
    path: "README.md",
    title: "Atlas Release Ops overview",
    moduleIds: ["atlas-root", "atlas-capsule"]
  },
  {
    path: "docs/01-product-lifecycle.md",
    title: "Product lifecycle",
    moduleIds: ["product-lifecycle"]
  },
  {
    path: "docs/02-architecture-and-contracts.md",
    title: "Architecture and contracts",
    moduleIds: ["architecture-contracts"]
  },
  {
    path: "docs/03-delivery-workflows.md",
    title: "Delivery workflows",
    moduleIds: ["delivery-workflows"]
  },
  {
    path: "docs/04-operations-and-governance.md",
    title: "Operations and governance",
    moduleIds: ["operations-governance", "evidence-reference"]
  }
];

export const ARTIFACTS = [
  {
    id: "system-overview",
    phase: "vision",
    humanDoc: "README.md",
    moduleId: "atlas-root",
    kind: "section",
    title: "System overview",
    summary: "Use the root layer for system purpose, authority posture, and first-hop routing.",
    section: {
      sid: "system-overview",
      topic: "system purpose and authority posture",
      content_type: "prose",
      criticality: "must"
    },
    facts: [
      fact("overview-system", "Atlas Release Ops is a multi-tenant release coordination system for product launches and incident-ready rollouts."),
      fact("overview-authority", "Authoritative semantics live in agent-primary AODS modules and human docs are paired explanatory surfaces."),
      fact("overview-first-hop", "Cold-start routing begins at atlas-root and summary routing continues through atlas-capsule.")
    ]
  },
  {
    id: "capsule-routing",
    phase: "governance",
    humanDoc: "README.md",
    moduleId: "atlas-capsule",
    kind: "section",
    title: "Capsule routing",
    summary: "Use the capsule when a reader needs quick orientation before loading detail modules.",
    section: {
      sid: "capsule-routing",
      topic: "capsule routes to detailed authority",
      content_type: "rules",
      criticality: "must"
    },
    facts: [
      fact("capsule-product", "Use product-lifecycle for goals, roadmap checkpoints, verification intent, and ADR rationale."),
      fact("capsule-architecture", "Use architecture-contracts for topology, APIs, schemas, examples, templates, identifiers, and enums."),
      fact("capsule-workflows", "Use delivery-workflows for approval flow, publish sequence, rollout decisions, lifecycle states, and analytics lineage."),
      fact("capsule-ops", "Use operations-governance for policy, events, error handling, temporal controls, and paired-surface discipline.")
    ]
  },
  {
    id: "vision-brief",
    phase: "vision",
    humanDoc: "docs/01-product-lifecycle.md",
    moduleId: "product-lifecycle",
    kind: "section",
    title: "Vision brief",
    summary: "State business outcome, release packet requirements, and explicit non-goals.",
    section: {
      sid: "vision-brief",
      topic: "goals and non-goals",
      content_type: "prose",
      criticality: "must"
    },
    facts: [
      fact("vision-cycle-time", "Atlas Release Ops reduces release readiness coordination from two days to under thirty minutes."),
      fact("vision-packet", "Every approved release must include an owner, a risk tier, a rollback plan, and a communication plan."),
      fact("vision-non-goal", "Atlas Release Ops does not replace CI/CD executors or incident paging vendors.")
    ]
  },
  {
    id: "competitor-matrix",
    phase: "discovery",
    humanDoc: "docs/01-product-lifecycle.md",
    moduleId: "product-lifecycle",
    kind: "artifact",
    title: "Competitor matrix",
    summary: "Capture why existing alternatives fail under release-day pressure.",
    artifact: {
      artifact_id: "competitor-matrix",
      type: "mapping-table",
      usage: "Competitive analysis and discovery findings."
    },
    facts: [
      fact("discovery-spreadsheets", "Spreadsheets fail because approval state and rollback ownership drift during release day."),
      fact("discovery-chatops", "ChatOps bots fail because they do not produce durable release packets with explicit authority."),
      fact("discovery-alm", "Traditional ALM suites are too heavyweight for release-day coordination across product, engineering, and support.")
    ],
    content: {
      key_columns: ["alternative"],
      columns: ["alternative", "strength", "gap"],
      rows: [
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
  },
  {
    id: "delivery-plan",
    phase: "planning",
    humanDoc: "docs/01-product-lifecycle.md",
    moduleId: "product-lifecycle",
    kind: "section",
    title: "Delivery plan",
    summary: "Set milestones that tie design readiness, controlled rollout, and operating readiness together.",
    section: {
      sid: "delivery-plan",
      topic: "milestones and acceptance gates",
      content_type: "logic",
      criticality: "should"
    },
    facts: [
      fact("plan-alpha", "Alpha exit requires the release packet API, release state machine, and paired README governance to validate cleanly."),
      fact("plan-beta", "Beta exit requires staged rollout policy, event catalog coverage, and rollback drills to complete without manual coordinator notes."),
      fact("plan-ga", "General availability requires the sev1 escalation path, p99 publish latency budget, and change-history audit trail to be active.")
    ]
  },
  {
    id: "verification-plan",
    phase: "test",
    humanDoc: "docs/01-product-lifecycle.md",
    moduleId: "product-lifecycle",
    kind: "section",
    title: "Verification plan",
    summary: "Define what must be proven before rollout automation is trusted.",
    section: {
      sid: "verification-plan",
      topic: "verification scope",
      content_type: "rules",
      criticality: "should"
    },
    facts: [
      fact("test-paired-surfaces", "Each paired human surface must fail a human-only change under agent-primary sync."),
      fact("test-rollout-tree", "Each rollout risk tier must hit a deterministic branch in the rollout policy tree."),
      fact("test-rollback-sim", "Each rollback strategy class must be replayed in simulation before general availability.")
    ]
  },
  {
    id: "decision-log",
    phase: "design",
    humanDoc: "docs/01-product-lifecycle.md",
    moduleId: "product-lifecycle",
    kind: "section",
    title: "Decision log",
    summary: "Persist design rationale in explicit statements instead of implicit habits.",
    section: {
      sid: "decision-log",
      topic: "frozen design decisions",
      content_type: "rules",
      criticality: "must"
    },
    facts: [
      fact("adr-agent-primary", "Agent-primary modules remain authoritative even when paired human docs are easier for operators to scan."),
      fact("adr-risk-tree", "Release risk scoring lives in the rollout decision tree instead of freeform checklist prose."),
      fact("adr-evidence-layer", "Raw SQL and low-level migration evidence stay in the evidence layer and do not lead cold-start boot.")
    ]
  },
  {
    id: "release-topology",
    phase: "design",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Release topology",
    summary: "Expose the services and data boundaries needed for release coordination.",
    artifact: {
      artifact_id: "release-topology",
      type: "topology",
      usage: "System structure for the release coordination benchmark."
    },
    facts: [
      fact("topology-gateway", "API Gateway accepts release packet writes and forwards them to the release service."),
      fact("topology-workflow", "Workflow Engine evaluates approval state and staged rollout policy for each release packet."),
      fact("topology-events", "Notification Service consumes release and incident events before messaging product, engineering, and support leads.")
    ],
    content: {
      nodes: [
        { id: "web-console", type: "gateway", desc: "Web Console captures release packet edits from release managers." },
        { id: "api-gateway", type: "gateway", desc: "API Gateway accepts release packet writes and forwards them to the release service." },
        { id: "release-service", type: "service", desc: "Release Service stores release packets and current lifecycle state." },
        { id: "workflow-engine", type: "service", desc: "Workflow Engine evaluates approval state and staged rollout policy for each release packet." },
        { id: "event-bus", type: "queue", desc: "Event Bus fans release and incident events to downstream consumers." },
        { id: "notification-service", type: "service", desc: "Notification Service consumes release and incident events before messaging product, engineering, and support leads." },
        { id: "primary-db", type: "database", desc: "Primary DB stores release packets, approvals, and change history." }
      ],
      edges: [
        { from: "web-console", to: "api-gateway", type: "control", protocol: "https", desc: "Release managers submit or edit release packets." },
        { from: "api-gateway", to: "release-service", type: "data", protocol: "https", desc: "API Gateway accepts release packet writes and forwards them to the release service." },
        { from: "release-service", to: "workflow-engine", type: "control", protocol: "internal-rpc", desc: "Release Service requests approval and rollout evaluation." },
        { from: "release-service", to: "primary-db", type: "data", protocol: "postgres", desc: "Release Service persists canonical packet and state history." },
        { from: "workflow-engine", to: "event-bus", type: "event", protocol: "kafka", async: true, desc: "Workflow Engine emits approval and rollout outcomes." },
        { from: "event-bus", to: "notification-service", type: "event", protocol: "kafka", async: true, desc: "Notification Service consumes release and incident events before messaging product, engineering, and support leads." }
      ],
      groups: [
        { id: "control-plane", label: "Control plane", node_ids: ["api-gateway", "release-service", "workflow-engine"], boundary: "logical" },
        { id: "delivery-plane", label: "Delivery plane", node_ids: ["event-bus", "notification-service"], boundary: "logical" }
      ]
    }
  },
  {
    id: "release-api-contract",
    phase: "design",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Release API contract",
    summary: "Define write, read, and incident creation endpoints against the release service.",
    artifact: {
      artifact_id: "release-api-contract",
      type: "api-contract",
      usage: "Release packet service contract."
    },
    facts: [
      fact("api-create-release", "POST /v1/releases creates a release packet and returns the packet id."),
      fact("api-read-release", "GET /v1/releases/{releaseId} returns the latest release packet, approval state, and rollout lane."),
      fact("api-create-incident", "POST /v1/incidents creates a linked incident record when rollout health degrades.")
    ],
    content: {
      provider: "release-service",
      consumers: ["web-console", "workflow-engine", "support-ops"],
      protocol: "http",
      base_url: "https://atlas.example.internal",
      auth: "oauth2 bearer token",
      version: "2026-04",
      endpoints: [
        {
          id: "create-release",
          method: "POST",
          path: "/v1/releases",
          desc: "POST /v1/releases creates a release packet and returns the packet id.",
          input: "release-payload-schema",
          output: { releaseId: "rel_2026_0420_checkout", status: "draft" },
          errors: [
            { code: "400", meaning: "Request failed schema validation.", recovery: "Return field-level errors." },
            { code: "409", meaning: "Release packet key already exists.", recovery: "Use the existing packet or a new key." }
          ],
          sla: { latency_p99: "250ms", throughput: "50 rps", availability: "99.95%" },
          idempotent: false,
          rate_limit: "30 rpm"
        },
        {
          id: "get-release",
          method: "GET",
          path: "/v1/releases/{releaseId}",
          desc: "GET /v1/releases/{releaseId} returns the latest release packet, approval state, and rollout lane.",
          output: "release-created-example",
          idempotent: true,
          rate_limit: "120 rpm"
        },
        {
          id: "create-incident",
          method: "POST",
          path: "/v1/incidents",
          desc: "POST /v1/incidents creates a linked incident record when rollout health degrades.",
          input: {
            type: "object",
            required: ["releaseId", "severity", "summary"],
            properties: {
              releaseId: { type: "string" },
              severity: { type: "string" },
              summary: { type: "string" }
            }
          },
          output: { incidentId: "inc_2026_0420_checkout", linked: true },
          idempotent: false,
          rate_limit: "20 rpm"
        }
      ]
    }
  },
  {
    id: "release-payload-schema",
    phase: "build",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Release payload schema",
    summary: "Pin the canonical structure for a release packet.",
    artifact: {
      artifact_id: "release-payload-schema",
      type: "json-schema",
      usage: "Canonical release packet input."
    },
    facts: [
      fact("schema-owner", "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."),
      fact("schema-window", "Release packet schema requires rolloutWindow.start and rolloutWindow.end in RFC3339 format."),
      fact("schema-lanes", "Release packet schema restricts rollout lanes to canary, staged, or full.")
    ],
    content: {
      type: "object",
      required: ["releaseKey", "owner", "riskTier", "rollbackPlan", "communicationPlan", "rolloutWindow", "lanes"],
      properties: {
        releaseKey: {
          type: "string",
          description: "Release packet identifier. Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan."
        },
        owner: { type: "string", description: "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan." },
        riskTier: { type: "string", enum: ["low", "medium", "high"], description: "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan." },
        rollbackPlan: { type: "string", description: "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan." },
        communicationPlan: { type: "string", description: "Release packet schema requires owner, riskTier, rollbackPlan, and communicationPlan." },
        rolloutWindow: {
          type: "object",
          required: ["start", "end"],
          description: "Release packet schema requires rolloutWindow.start and rolloutWindow.end in RFC3339 format.",
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" }
          }
        },
        lanes: {
          type: "array",
          description: "Release packet schema restricts rollout lanes to canary, staged, or full.",
          items: {
            type: "string",
            enum: ["canary", "staged", "full"]
          }
        }
      }
    }
  },
  {
    id: "release-created-example",
    phase: "build",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Release packet example",
    summary: "Provide a concrete release packet instance for tests and integrations.",
    artifact: {
      artifact_id: "release-created-example",
      type: "json-example",
      usage: "Concrete release packet instance."
    },
    facts: [
      fact("example-owner", "Example packet owner is release-manager@atlas.dev."),
      fact("example-risk", "Example packet risk tier is medium and starts with canary before staged rollout."),
      fact("example-window", "Example packet rollout window starts at 2026-04-20T09:00:00Z and ends at 2026-04-20T10:00:00Z.")
    ],
    content: {
      releaseKey: "REL-2026-0420-CHECKOUT",
      owner: "release-manager@atlas.dev",
      riskTier: "medium",
      rollbackPlan: "Flip checkout flag and drain queued publish jobs.",
      communicationPlan: "Post to launch room and support status channel.",
      rolloutWindow: {
        start: "2026-04-20T09:00:00Z",
        end: "2026-04-20T10:00:00Z"
      },
      lanes: ["canary", "staged"],
      notes: [
        "Example packet owner is release-manager@atlas.dev.",
        "Example packet risk tier is medium and starts with canary before staged rollout.",
        "Example packet rollout window starts at 2026-04-20T09:00:00Z and ends at 2026-04-20T10:00:00Z."
      ]
    }
  },
  {
    id: "client-sdk-template",
    phase: "build",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Client SDK template",
    summary: "Show the minimum code needed to create a release packet from a client.",
    artifact: {
      artifact_id: "client-sdk-template",
      type: "code-template",
      usage: "Minimal Node.js client example."
    },
    facts: [
      fact("code-template-key", "Client template sends releaseKey REL-2026-0420-CHECKOUT to POST /v1/releases."),
      fact("code-template-fields", "Client template includes owner, riskTier, rollbackPlan, communicationPlan, rolloutWindow, and lanes."),
      fact("code-template-auth", "Client template sends an Authorization bearer token.")
    ],
    content: {
      lang: "javascript",
      template:
        "const payload = {\n" +
        "  releaseKey: 'REL-2026-0420-CHECKOUT',\n" +
        "  owner: 'release-manager@atlas.dev',\n" +
        "  riskTier: 'medium',\n" +
        "  rollbackPlan: 'Flip checkout flag and drain queued publish jobs.',\n" +
        "  communicationPlan: 'Post to launch room and support status channel.',\n" +
        "  rolloutWindow: { start: '2026-04-20T09:00:00Z', end: '2026-04-20T10:00:00Z' },\n" +
        "  lanes: ['canary', 'staged']\n" +
        "};\n" +
        "await fetch('https://atlas.example.internal/v1/releases', {\n" +
        "  method: 'POST',\n" +
        "  headers: { Authorization: 'Bearer ${TOKEN}', 'Content-Type': 'application/json' },\n" +
        "  body: JSON.stringify(payload)\n" +
        "});",
      notes: [
        "Client template sends releaseKey REL-2026-0420-CHECKOUT to POST /v1/releases.",
        "Client template includes owner, riskTier, rollbackPlan, communicationPlan, rolloutWindow, and lanes.",
        "Client template sends an Authorization bearer token."
      ]
    }
  },
  {
    id: "ops-config-template",
    phase: "build",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Ops config template",
    summary: "Pin the environment settings required by the benchmark system.",
    artifact: {
      artifact_id: "ops-config-template",
      type: "config-template",
      usage: "Structured release-service environment template."
    },
    facts: [
      fact("config-webhook", "Config template requires RELEASE_EVENT_TOPIC and NOTIFY_WEBHOOK_URL."),
      fact("config-window", "Config template requires ROLLOUT_WINDOW_TIMEZONE set to UTC."),
      fact("config-guard", "Config template requires PAIR_SYNC_MODE set to agent-primary.")
    ],
    content: {
      RELEASE_EVENT_TOPIC: "atlas.release.events",
      NOTIFY_WEBHOOK_URL: "https://notify.example.internal/hooks/releases",
      ROLLOUT_WINDOW_TIMEZONE: "UTC",
      PAIR_SYNC_MODE: "agent-primary",
      notes: [
        "Config template requires RELEASE_EVENT_TOPIC and NOTIFY_WEBHOOK_URL.",
        "Config template requires ROLLOUT_WINDOW_TIMEZONE set to UTC.",
        "Config template requires PAIR_SYNC_MODE set to agent-primary."
      ]
    }
  },
  {
    id: "release-summary-prompt",
    phase: "build",
    humanDoc: "docs/01-product-lifecycle.md",
    moduleId: "product-lifecycle",
    kind: "artifact",
    title: "Release summary prompt",
    summary: "Prompt template for generating rollout summaries without changing authority rules.",
    artifact: {
      artifact_id: "release-summary-prompt",
      type: "prompt-template",
      usage: "LLM prompt for concise release summaries."
    },
    facts: [
      fact("prompt-grounding", "Prompt template grounds summaries in owner, risk tier, rollout lanes, and rollback plan."),
      fact("prompt-authority", "Prompt template forbids inventing approval state that is absent from the release packet."),
      fact("prompt-audience", "Prompt template produces one summary for product, engineering, and support audiences.")
    ],
    content: {
      system: "Summarize release packets without inventing state.",
      template:
        "Summarize the release packet for product, engineering, and support. Include owner, risk tier, rollout lanes, and rollback plan. Do not invent approval state that is absent from the packet.",
      variables: ["owner", "riskTier", "lanes", "rollbackPlan"],
      notes: [
        "Prompt template grounds summaries in owner, risk tier, rollout lanes, and rollback plan.",
        "Prompt template forbids inventing approval state that is absent from the release packet.",
        "Prompt template produces one summary for product, engineering, and support audiences."
      ]
    }
  },
  {
    id: "release-key-regex",
    phase: "design",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Release key regex",
    summary: "Keep release identifiers stable across docs, APIs, and runbooks.",
    artifact: {
      artifact_id: "release-key-regex",
      type: "regex",
      usage: "Canonical release key matcher."
    },
    facts: [
      fact("regex-pattern", "Release keys match REL-YYYY-MMDD-SLUG in uppercase."),
      fact("regex-sample", "Release key sample REL-2026-0420-CHECKOUT must validate cleanly."),
      fact("regex-purpose", "Release key regex prevents ambiguous packet identifiers in docs and APIs.")
    ],
    content: {
      pattern: "^REL-[0-9]{4}-[0-9]{4}-[A-Z0-9-]+$",
      flags: "",
      sample: "REL-2026-0420-CHECKOUT"
    }
  },
  {
    id: "role-enum",
    phase: "design",
    humanDoc: "docs/02-architecture-and-contracts.md",
    moduleId: "architecture-contracts",
    kind: "artifact",
    title: "Role enum",
    summary: "Expose the minimum stable actor set used across approvals and notifications.",
    artifact: {
      artifact_id: "role-enum",
      type: "enum-def",
      usage: "Canonical release roles."
    },
    facts: [
      fact("enum-release-manager", "release-manager owns packet quality and approval completeness."),
      fact("enum-engineering-lead", "engineering-lead owns rollout safety and rollback execution."),
      fact("enum-support-lead", "support-lead owns customer-impact communication during release and incident flow.")
    ],
    content: [
      { id: "release-manager", desc: "release-manager owns packet quality and approval completeness." },
      { id: "engineering-lead", desc: "engineering-lead owns rollout safety and rollback execution." },
      { id: "support-lead", desc: "support-lead owns customer-impact communication during release and incident flow." }
    ]
  },
  {
    id: "release-approval-flow",
    phase: "build",
    humanDoc: "docs/03-delivery-workflows.md",
    moduleId: "delivery-workflows",
    kind: "artifact",
    title: "Release approval flow",
    summary: "Define how a release moves from draft to approved rollout preparation.",
    artifact: {
      artifact_id: "release-approval-flow",
      type: "process-flow",
      usage: "Canonical release approval workflow."
    },
    facts: [
      fact("flow-draft", "Draft review checks packet completeness before any risk evaluation runs."),
      fact("flow-risk", "Risk evaluation branches low and medium tiers to fast review and high tier to extended review."),
      fact("flow-approval", "Approved packets emit a release.packet.approved event and enter scheduled state.")
    ],
    content: {
      entry: "draft-review",
      terminals: ["approved", "held"],
      actors: ["release-manager", "workflow-engine", "engineering-lead"],
      steps: [
        {
          id: "draft-review",
          type: "action",
          actor: "release-manager",
          action: "Draft review checks packet completeness before any risk evaluation runs.",
          next: "risk-evaluation"
        },
        {
          id: "risk-evaluation",
          type: "decision",
          actor: "workflow-engine",
          action: "Risk evaluation branches low and medium tiers to fast review and high tier to extended review.",
          next: {
            "low-or-medium": "fast-review",
            high: "extended-review"
          }
        },
        {
          id: "fast-review",
          type: "action",
          actor: "engineering-lead",
          action: "Confirm packet and rollback readiness in one review pass.",
          next: "approved"
        },
        {
          id: "extended-review",
          type: "action",
          actor: "engineering-lead",
          action: "Escalate for broader review and attach mitigation notes.",
          next: "approved"
        },
        {
          id: "approved",
          type: "emit",
          actor: "workflow-engine",
          action: "Approved packets emit a release.packet.approved event and enter scheduled state.",
          event: "release.packet.approved",
          payload_schema: "architecture-contracts:release-payload-schema",
          next: null
        },
        {
          id: "held",
          type: "action",
          actor: "workflow-engine",
          action: "Stop rollout until packet defects or missing approvals are resolved.",
          next: null
        }
      ]
    }
  },
  {
    id: "publish-sequence",
    phase: "release",
    humanDoc: "docs/03-delivery-workflows.md",
    moduleId: "delivery-workflows",
    kind: "artifact",
    title: "Publish sequence",
    summary: "Show the temporal exchange during release publication.",
    artifact: {
      artifact_id: "publish-sequence",
      type: "sequence",
      usage: "Temporal message exchange for publish."
    },
    facts: [
      fact("sequence-submit", "Release manager submits the approved packet to the release service."),
      fact("sequence-evaluate", "Workflow engine evaluates rollout lane health before the release service advances state."),
      fact("sequence-notify", "Notification service posts publish status after the release service confirms lane advancement.")
    ],
    content: {
      actors: [
        { id: "release-manager", type: "user", desc: "Human coordinator." },
        { id: "release-service", type: "service", desc: "Canonical packet service." },
        { id: "workflow-engine", type: "service", desc: "Policy engine." },
        { id: "notification-service", type: "service", desc: "Outbound messaging service." }
      ],
      messages: [
        { seq: 1, from: "release-manager", to: "release-service", action: "submit approved packet", type: "sync", note: "Release manager submits the approved packet to the release service." },
        { seq: 2, from: "release-service", to: "workflow-engine", action: "evaluate rollout lane", type: "sync", note: "Workflow engine evaluates rollout lane health before the release service advances state." },
        { seq: 3, from: "workflow-engine", to: "release-service", action: "lane approved", type: "response" },
        { seq: 4, from: "release-service", to: "notification-service", action: "publish status update", type: "event", note: "Notification service posts publish status after the release service confirms lane advancement." }
      ]
    }
  },
  {
    id: "rollout-policy-tree",
    phase: "release",
    humanDoc: "docs/03-delivery-workflows.md",
    moduleId: "delivery-workflows",
    kind: "artifact",
    title: "Rollout policy tree",
    summary: "Map risk signals to rollout lane decisions.",
    artifact: {
      artifact_id: "rollout-policy-tree",
      type: "decision-tree",
      usage: "Release rollout policy classifier."
    },
    facts: [
      fact("tree-low", "Low risk releases start in canary and auto-promote to staged after fifteen healthy minutes."),
      fact("tree-medium", "Medium risk releases require manual staged promotion after support lead confirmation."),
      fact("tree-high", "High risk releases stop after canary unless engineering lead approves expanded rollout.")
    ],
    content: {
      root: "risk-tier",
      nodes: [
        {
          id: "risk-tier",
          type: "condition",
          eval: "risk tier?",
          branches: [
            { value: "low", next: "low-path" },
            { value: "medium", next: "medium-path" },
            { value: "high", next: "high-path" }
          ]
        },
        {
          id: "low-path",
          type: "action",
          action: "Low risk releases start in canary and auto-promote to staged after fifteen healthy minutes."
        },
        {
          id: "medium-path",
          type: "action",
          action: "Medium risk releases require manual staged promotion after support lead confirmation."
        },
        {
          id: "high-path",
          type: "action",
          action: "High risk releases stop after canary unless engineering lead approves expanded rollout."
        }
      ]
    }
  },
  {
    id: "release-state-machine",
    phase: "release",
    humanDoc: "docs/03-delivery-workflows.md",
    moduleId: "delivery-workflows",
    kind: "artifact",
    title: "Release state machine",
    summary: "Model the lifecycle states for a release packet.",
    artifact: {
      artifact_id: "release-state-machine",
      type: "state-machine",
      usage: "Release packet lifecycle."
    },
    facts: [
      fact("state-draft", "Release packets start in draft until packet completeness review passes."),
      fact("state-approved", "Approved packets can move to scheduled only after release.packet.approved is emitted."),
      fact("state-rollback", "Released packets enter rolled_back when rollback execution succeeds.")
    ],
    content: {
      initial: "draft",
      terminal: ["released", "rolled_back"],
      states: [
        { id: "draft", desc: "Release packets start in draft until packet completeness review passes." },
        { id: "in_review", desc: "Packet is under active approval review." },
        { id: "approved", desc: "Approved packets can move to scheduled only after release.packet.approved is emitted." },
        { id: "scheduled", desc: "Packet is ready for the rollout window." },
        { id: "released", desc: "Packet has completed rollout successfully." },
        { id: "rolled_back", desc: "Released packets enter rolled_back when rollback execution succeeds." }
      ],
      transitions: [
        { from: "draft", to: "in_review", trigger: "submit_for_review" },
        { from: "in_review", to: "approved", trigger: "release.packet.approved" },
        { from: "approved", to: "scheduled", trigger: "rollout_window_open" },
        { from: "scheduled", to: "released", trigger: "lane_health_green" },
        { from: "released", to: "rolled_back", trigger: "rollback_executed" }
      ]
    }
  },
  {
    id: "analytics-pipeline",
    phase: "operate",
    humanDoc: "docs/03-delivery-workflows.md",
    moduleId: "delivery-workflows",
    kind: "artifact",
    title: "Analytics pipeline",
    summary: "Track how rollout and incident data become dashboards.",
    artifact: {
      artifact_id: "analytics-pipeline",
      type: "data-pipeline",
      usage: "Release and incident analytics lineage."
    },
    facts: [
      fact("pipeline-source", "Analytics pipeline consumes release.packet.approved and incident.created events from the event bus."),
      fact("pipeline-normalize", "Analytics pipeline normalizes packet owner, risk tier, rollout lane, and incident severity before storage."),
      fact("pipeline-sink", "Analytics pipeline writes dashboard-ready facts into warehouse.release_health.")
    ],
    content: {
      source: {
        id: "event-bus",
        type: "queue",
        desc: "Analytics pipeline consumes release.packet.approved and incident.created events from the event bus."
      },
      sink: {
        id: "warehouse.release_health",
        type: "db",
        desc: "Analytics pipeline writes dashboard-ready facts into warehouse.release_health."
      },
      stages: [
        {
          id: "ingest-events",
          transform: "read release.packet.approved and incident.created payloads",
          actor: "analytics-worker"
        },
        {
          id: "normalize-fields",
          transform: "Analytics pipeline normalizes packet owner, risk tier, rollout lane, and incident severity before storage.",
          actor: "analytics-worker"
        },
        {
          id: "load-warehouse",
          transform: "write dashboard-ready release health facts",
          actor: "analytics-worker"
        }
      ],
      ordering: "sequential"
    }
  },
  {
    id: "approval-rules",
    phase: "governance",
    humanDoc: "docs/04-operations-and-governance.md",
    moduleId: "operations-governance",
    kind: "artifact",
    title: "Approval rules",
    summary: "Make approval authority explicit instead of social convention.",
    artifact: {
      artifact_id: "approval-rules",
      type: "rule-set",
      usage: "Release approval and paired-surface governance policy."
    },
    facts: [
      fact("rules-high-risk", "High risk releases require engineering lead approval and support lead acknowledgement."),
      fact("rules-pair-sync", "Human docs cannot change alone when sync_source is agent-primary."),
      fact("rules-window", "No release may enter scheduled outside the declared rollout window.")
    ],
    content: {
      evaluation_mode: "priority-ordered",
      default_action: "pass",
      conflict_resolution: "most-restrictive-wins",
      rules: [
        {
          id: "high-risk-approvals",
          condition: "release.riskTier == 'high'",
          action: "High risk releases require engineering lead approval and support lead acknowledgement.",
          priority: 10,
          source: "governance"
        },
        {
          id: "paired-surface-sync",
          condition: "surface_pair.sync_source == 'agent-primary' AND human.changed == true AND agent.changed == false",
          action: "Human docs cannot change alone when sync_source is agent-primary.",
          priority: 20,
          source: "governance"
        },
        {
          id: "window-guard",
          condition: "now not_in release.rolloutWindow",
          action: "No release may enter scheduled outside the declared rollout window.",
          priority: 30,
          source: "governance"
        }
      ]
    }
  },
  {
    id: "oncall-routing",
    phase: "operate",
    humanDoc: "docs/04-operations-and-governance.md",
    moduleId: "operations-governance",
    kind: "artifact",
    title: "On-call routing",
    summary: "Map incident severity to response ownership.",
    artifact: {
      artifact_id: "oncall-routing",
      type: "mapping-table",
      usage: "Incident severity and owner lookup."
    },
    facts: [
      fact("routing-sev1", "sev1 pages primary and secondary on-call within five minutes."),
      fact("routing-sev2", "sev2 pages primary on-call and support lead within fifteen minutes."),
      fact("routing-sev3", "sev3 creates a queued task for business-hours triage.")
    ],
    content: {
      key_columns: ["severity"],
      columns: ["severity", "owner", "response"],
      rows: [
        ["sev1", "primary+secondary on-call", "sev1 pages primary and secondary on-call within five minutes."],
        ["sev2", "primary on-call + support lead", "sev2 pages primary on-call and support lead within fifteen minutes."],
        ["sev3", "support rotation", "sev3 creates a queued task for business-hours triage."]
      ]
    }
  },
  {
    id: "event-catalog",
    phase: "operate",
    humanDoc: "docs/04-operations-and-governance.md",
    moduleId: "operations-governance",
    kind: "artifact",
    title: "Event catalog",
    summary: "Track durable events and their consumers.",
    artifact: {
      artifact_id: "event-catalog",
      type: "event-catalog",
      usage: "Release and incident event inventory."
    },
    facts: [
      fact("event-approved", "release.packet.approved is emitted by workflow-engine and consumed by release-service and analytics-worker."),
      fact("event-published", "release.packet.published is emitted by release-service and consumed by notification-service."),
      fact("event-incident", "incident.created is emitted by release-service when rollout health degrades.")
    ],
    content: {
      events: [
        {
          name: "release.packet.approved",
          emitter: "workflow-engine",
          consumers: ["release-service", "analytics-worker"],
          desc: "release.packet.approved is emitted by workflow-engine and consumed by release-service and analytics-worker.",
          ordering: "ordered"
        },
        {
          name: "release.packet.published",
          emitter: "release-service",
          consumers: ["notification-service", "analytics-worker"],
          desc: "release.packet.published is emitted by release-service and consumed by notification-service.",
          ordering: "ordered"
        },
        {
          name: "incident.created",
          emitter: "release-service",
          consumers: ["notification-service", "support-ops"],
          desc: "incident.created is emitted by release-service when rollout health degrades.",
          ordering: "idempotent"
        }
      ],
      channels: [
        { id: "atlas.release.events", transport: "kafka", events: ["release.packet.approved", "release.packet.published", "incident.created"] }
      ]
    }
  },
  {
    id: "rollback-strategy",
    phase: "operate",
    humanDoc: "docs/04-operations-and-governance.md",
    moduleId: "operations-governance",
    kind: "artifact",
    title: "Rollback strategy",
    summary: "Define what happens under failure classes.",
    artifact: {
      artifact_id: "rollback-strategy",
      type: "error-strategy",
      usage: "Failure-handling plan for publish and rollback paths."
    },
    facts: [
      fact("error-webhook", "Webhook delivery failures retry three times with exponential backoff before escalation."),
      fact("error-db", "Primary database write failures abort publish and escalate to platform-oncall."),
      fact("error-health", "Negative rollout health triggers compensate by executing the rollback plan.")
    ],
    content: {
      default_strategy: "escalate",
      error_classes: [
        {
          class: "webhook-delivery-failure",
          severity: "medium",
          strategy: {
            type: "retry",
            retry_max: 3,
            retry_delay: "30s",
            retry_backoff: "exponential"
          },
          alerts: [{ channel: "ops-alerts", condition: "after third failure" }],
          match: "notify.*"
        },
        {
          class: "primary-db-write-failure",
          severity: "critical",
          strategy: {
            type: "abort"
          },
          alerts: [{ channel: "platform-oncall", condition: "on first failure" }],
          match: "db.write.*"
        },
        {
          class: "negative-rollout-health",
          severity: "high",
          strategy: {
            type: "compensate",
            compensate_action: "execute rollback plan"
          },
          match: "health.red"
        }
      ],
      fallback_chain: [
        "Webhook delivery failures retry three times with exponential backoff before escalation.",
        "Primary database write failures abort publish and escalate to platform-oncall.",
        "Negative rollout health triggers compensate by executing the rollback plan."
      ]
    }
  },
  {
    id: "temporal-controls",
    phase: "release",
    humanDoc: "docs/04-operations-and-governance.md",
    moduleId: "operations-governance",
    kind: "artifact",
    title: "Temporal controls",
    summary: "Represent windows, deadlines, and SLO timers.",
    artifact: {
      artifact_id: "temporal-controls",
      type: "temporal-pattern",
      usage: "Rollout time and SLO behavior."
    },
    facts: [
      fact("temporal-window", "Rollout window is a UTC deadline window from 09:00 to 10:00."),
      fact("temporal-canary", "Canary health is evaluated every five minutes."),
      fact("temporal-publish", "Publish status must reach notification-service within sixty seconds.")
    ],
    content: {
      timezone: "UTC",
      patterns: [
        {
          id: "rollout-window",
          type: "window",
          expression: "09:00-10:00",
          target: "release rollout",
          on_trigger: "allow scheduled releases",
          on_violation: "hold publish"
        },
        {
          id: "canary-health-check",
          type: "interval",
          expression: "5m",
          target: "canary lane",
          on_trigger: "evaluate lane health"
        },
        {
          id: "publish-sla",
          type: "sla-timer",
          expression: "60s",
          target: "notification-service publish status",
          on_violation: "open sev2 incident"
        }
      ]
    }
  },
  {
    id: "migration-raw",
    phase: "operate",
    humanDoc: "docs/04-operations-and-governance.md",
    moduleId: "evidence-reference",
    kind: "artifact",
    title: "Raw migration evidence",
    summary: "Keep low-level evidence without pretending it is structured lifecycle guidance.",
    artifact: {
      artifact_id: "migration-raw",
      type: "raw",
      usage: "Escape hatch for SQL migration evidence."
    },
    facts: [
      fact("raw-sql", "Raw migration adds release_packets.approval_snapshot as immutable JSONB evidence."),
      fact("raw-layer", "Raw SQL evidence stays in the evidence layer and is not loaded on cold start."),
      fact("raw-limit", "Raw artifacts preserve facts but reduce structured traversability.")
    ],
    content:
      "ALTER TABLE release_packets ADD COLUMN approval_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;\n" +
      "-- Raw migration adds release_packets.approval_snapshot as immutable JSONB evidence.\n" +
      "-- Raw SQL evidence stays in the evidence layer and is not loaded on cold start.\n" +
      "-- Raw artifacts preserve facts but reduce structured traversability.\n"
  }
];

export const LOADING_SCENARIOS = [
  {
    id: "orientation-summary",
    description: "Cold-start reader asks for benchmark orientation.",
    scenario_class: "cold-start-orientation",
    measurement_class: "exploratory",
    role: "product-manager",
    intent: "read",
    concepts: ["overview", "summary", "routes"],
    requiredModules: ["atlas-root", "atlas-capsule"]
  },
  {
    id: "product-doc-edit",
    description: "Doc author edits the product lifecycle human surface.",
    scenario_class: "paired-human-surface-write",
    measurement_class: "objective",
    role: "doc-author",
    intent: "write",
    touch: "docs/01-product-lifecycle.md",
    concepts: ["goals", "roadmap", "adr"],
    requiredModules: ["product-lifecycle", "atlas-capsule"]
  },
  {
    id: "architecture-module-edit",
    description: "Architect edits the architecture contract module.",
    scenario_class: "agent-module-write",
    measurement_class: "objective",
    role: "architect",
    intent: "write",
    touch: "modules/architecture-contracts.json",
    concepts: ["api", "schema", "config"],
    requiredModules: ["atlas-root", "atlas-capsule", "architecture-contracts"]
  },
  {
    id: "workflow-debug",
    description: "Architect debugs rollout policy and rollback behavior.",
    scenario_class: "cross-module-debug-read",
    measurement_class: "exploratory",
    role: "architect",
    intent: "read",
    concepts: ["workflow", "rollback", "risk"],
    requiredModules: ["delivery-workflows", "operations-governance"]
  },
  {
    id: "ops-doc-edit",
    description: "Operator edits the operations and governance human surface.",
    scenario_class: "operations-human-surface-write",
    measurement_class: "objective",
    role: "operator",
    intent: "write",
    touch: "docs/04-operations-and-governance.md",
    concepts: ["incident", "policy", "slo"],
    requiredModules: ["atlas-capsule", "operations-governance", "evidence-reference"]
  },
  {
    id: "release-contract-read",
    description: "Product manager asks about release packet schema and example payloads.",
    scenario_class: "targeted-contract-read",
    measurement_class: "exploratory",
    role: "product-manager",
    intent: "read",
    concepts: ["release", "schema", "api", "packet"],
    requiredModules: ["architecture-contracts"]
  }
];

export const DRIFT_SCENARIOS = [
  {
    id: "control-neutral-sync-edit",
    description: "Paired surfaces get a neutral note without changing benchmark facts.",
    scenario_class: "control-neutral",
    changedFiles: ["README.md", "modules/atlas-capsule.json"],
    isControl: true,
    expectBuiltInDetection: false,
    expectSemanticDetection: false,
    operations: [
      {
        type: "replace",
        file: "README.md",
        find: "Cold-start routing begins at atlas-root and summary routing continues through atlas-capsule.",
        replace:
          "Cold-start routing begins at atlas-root and summary routing continues through atlas-capsule. This note clarifies the same routing rule without changing benchmark facts."
      },
      {
        type: "replace",
        file: "modules/atlas-capsule.json",
        find: "Use product-lifecycle for goals, roadmap checkpoints, verification intent, and ADR rationale.",
        replace:
          "Use product-lifecycle for goals, roadmap checkpoints, verification intent, and ADR rationale. This note clarifies the same routing rule without changing benchmark facts."
      }
    ]
  },
  {
    id: "readme-human-only-drift",
    description: "README changes alone under agent-primary sync.",
    scenario_class: "human-only-drift",
    changedFiles: ["README.md"],
    expectBuiltInDetection: true,
    expectSemanticDetection: true,
    operations: [
      {
        type: "replace",
        file: "README.md",
        find: "Atlas Release Ops is a multi-tenant release coordination system for product launches and incident-ready rollouts.",
        replace: "Atlas Release Ops is a weekly reporting portal for passive release status summaries."
      }
    ]
  },
  {
    id: "manifest-bypass-readme",
    description: "README changes together with manifest metadata but no paired module update.",
    scenario_class: "manifest-bypass",
    changedFiles: ["README.md", "manifest.json"],
    expectBuiltInDetection: true,
    expectSemanticDetection: true,
    operations: [
      {
        type: "replace",
        file: "README.md",
        find: "Authoritative semantics live in agent-primary AODS modules and human docs are paired explanatory surfaces.",
        replace: "Authoritative semantics live in whichever human document was edited most recently."
      },
      {
        type: "replace",
        file: "manifest.json",
        find: "\"updated\": \"2026-04-14T00:00:00Z\"",
        replace: "\"updated\": \"2026-04-14T00:05:00Z\""
      }
    ]
  },
  {
    id: "semantic-pair-conflict",
    description: "Paired human and agent files both change, but to contradictory meanings.",
    scenario_class: "semantic-conflict",
    changedFiles: ["docs/01-product-lifecycle.md", "modules/product-lifecycle.json"],
    expectBuiltInDetection: false,
    expectSemanticDetection: true,
    operations: [
      {
        type: "replace",
        file: "docs/01-product-lifecycle.md",
        find: "Atlas Release Ops reduces release readiness coordination from two days to under thirty minutes.",
        replace: "Atlas Release Ops reduces release readiness coordination from two days to under two hours."
      },
      {
        type: "replace",
        file: "modules/product-lifecycle.json",
        find: "Atlas Release Ops reduces release readiness coordination from two days to under thirty minutes.",
        replace: "Atlas Release Ops reduces release readiness coordination from two days to under forty-five minutes."
      }
    ]
  },
  {
    id: "ops-human-only-drift",
    description: "Operations human surface changes alone.",
    scenario_class: "human-only-drift",
    changedFiles: ["docs/04-operations-and-governance.md"],
    expectBuiltInDetection: true,
    expectSemanticDetection: true,
    operations: [
      {
        type: "replace",
        file: "docs/04-operations-and-governance.md",
        find: "sev1 pages primary and secondary on-call within five minutes.",
        replace: "sev1 pages only the primary on-call after thirty minutes."
      }
    ]
  },
  {
    id: "broken-touch-route",
    description: "Manifest points a touch route at a missing module.",
    scenario_class: "route-integrity",
    changedFiles: ["manifest.json"],
    expectBuiltInDetection: true,
    expectSemanticDetection: false,
    operations: [
      {
        type: "replace",
        file: "manifest.json",
        find:
          "\"load_modules\": [\n        \"atlas-root\",\n        \"atlas-capsule\",\n        \"architecture-contracts\"\n      ],\n      \"reason\": \"Architecture edits need route and contract context.\"",
        replace:
          "\"load_modules\": [\n        \"atlas-root\",\n        \"atlas-capsule\",\n        \"missing-architecture-contracts\"\n      ],\n      \"reason\": \"Architecture edits need route and contract context.\""
      }
    ]
  },
  {
    id: "path-escape-pair",
    description: "Manifest points a paired human surface outside the corpus root.",
    scenario_class: "path-safety",
    changedFiles: ["manifest.json"],
    expectBuiltInDetection: true,
    expectSemanticDetection: false,
    operations: [
      {
        type: "writeSiblingFile",
        siblingPath: "escaped-architecture.md",
        content:
          "# Escaped architecture doc\n\nAPI Gateway accepts release packet writes and forwards them to the release service.\n"
      },
      {
        type: "replace",
        file: "manifest.json",
        find: "\"human_primary\": \"docs/02-architecture-and-contracts.md\"",
        replace: "\"human_primary\": \"../escaped-architecture.md\""
      }
    ]
  }
];

export const ROLE_DEFS = [
  {
    id: "product-manager",
    scope: "Needs goals, roadmap, verification, and summary routing.",
    capabilities: ["read-modules", "edit-human-surfaces"],
    required_modules: ["atlas-root", "atlas-capsule", "product-lifecycle"]
  },
  {
    id: "architect",
    scope: "Needs topology, APIs, workflow semantics, and impact analysis.",
    capabilities: ["read-modules", "edit-agent-surfaces"],
    required_modules: ["atlas-root", "atlas-capsule", "architecture-contracts", "delivery-workflows"]
  },
  {
    id: "operator",
    scope: "Needs policy, incidents, temporal controls, and evidence references.",
    capabilities: ["read-modules", "operate-system"],
    required_modules: ["atlas-root", "atlas-capsule", "operations-governance", "evidence-reference"]
  },
  {
    id: "doc-author",
    scope: "Needs broad authoring context across every paired surface.",
    capabilities: ["write-modules", "validate-corpus"],
    required_modules: ["atlas-root", "atlas-capsule", "product-lifecycle", "architecture-contracts", "delivery-workflows", "operations-governance", "evidence-reference"]
  }
];

export function allFacts() {
  return ARTIFACTS.flatMap((artifact) =>
    artifact.facts.map((item) => ({
      ...item,
      artifactId: artifact.id,
      moduleId: artifact.moduleId,
      humanDoc: artifact.humanDoc
    }))
  );
}

export function humanDocArtifacts(docPath) {
  return ARTIFACTS.filter((artifact) => artifact.humanDoc === docPath);
}

export const STRUCTURED_TYPES = new Set([
  "state-machine",
  "process-flow",
  "sequence",
  "decision-tree",
  "data-pipeline",
  "topology",
  "rule-set",
  "mapping-table",
  "event-catalog",
  "error-strategy",
  "api-contract",
  "temporal-pattern"
]);

export const GENERIC_TYPES = new Set([
  "json-schema",
  "json-example",
  "code-template",
  "config-template",
  "prompt-template",
  "regex",
  "enum-def",
  "raw"
]);
