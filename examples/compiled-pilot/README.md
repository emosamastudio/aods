<!-- AODS GENERATED: pair_id=pair-shift-ops-readme mode=deterministic profile=overview -->
# shift-ops-pilot

Generated deterministically from AODS agent-primary authority. Do not edit manually.

## Pair contract

- Pair ID: `pair-shift-ops-readme`
- Sync source: `agent-primary`
- Agent primary: `shift-ops-capsule`
- Agent supporting: `shift-ops-root`, `shift-ops-policy`, `shift-ops-governance`, `shift-ops-runbook`

## Canonical facts

- Production database schema changes require two approvers.
- sev1 pages primary and secondary on-call within five minutes.

## Coverage

- `shift-ops-capsule` (capsule): Summary routing for shift operations. Use after root load to decide whether policy, governance, or runbook detail should open next.
- `shift-ops-root` (architecture): Root routing for the shift operations pilot. Use at cold start before loading capsule or detail authority.
- `shift-ops-policy` (policy): Authoritative approval policy for operational changes and production release windows.
- `shift-ops-governance` (policy): Implementation governance authority for release readiness, acceptance evidence, and review routing for shift operations changes.
- `shift-ops-runbook` (workflow): Authoritative incident runbook for sev1 response and immediate stabilization.

## Agent-derived sections

### shift-ops-capsule

Summary routing for shift operations. Use after root load to decide whether policy, governance, or runbook detail should open next.

#### capsule summary and next routes

Approval: shift-ops-policy:approval-policy. Delivery readiness: shift-ops-governance:implementation-governance. sev1: shift-ops-runbook:incident-response. Production database schema changes require two approvers. sev1 pages primary and secondary on-call within five minutes.

### shift-ops-root

Root routing for the shift operations pilot. Use at cold start before loading capsule or detail authority.

#### root routing overview

Use shift-ops-capsule:system-capsule for summary routing. Open README.md when a human-facing overview is needed. Route delivery-readiness and final gate questions to shift-ops-governance:implementation-governance. Use surface-inventory only when validating current corpus surfaces. Keep this root module short and route-oriented.

Artifacts:
- `route-table` (mapping-table): First-hop routing from cold start.
- `surface-inventory` (surface-inventory): Optional reality sensor for the compiled pilot. Current entries must exist when validate runs with --reality.

### shift-ops-policy

Authoritative approval policy for operational changes and production release windows.

#### approval gates and release windows

Production database schema changes require two approvers. Standard changes may deploy only inside the published release window. Emergency changes require a written rollback owner and explicit incident linkage. Approval evidence names the release window, database owner, and rollback owner before execution closes.

Artifacts:
- `approval-rules` (rule-set): Constraint set for approving production changes.

### shift-ops-governance

Implementation governance authority for release readiness, acceptance evidence, and review routing for shift operations changes.

#### implementation governance overview

Use this module to govern release readiness for production changes in shift operations. Do not mark a change delivery-ready until required acceptance evidence, required approval evidence, rollback ownership, and required review route are all recorded.

#### scripted expert human review split

Scripted checks cover deterministic release-window and evidence-completeness rules. Expert review covers database schema, control-flow, or rollback-risk changes. Human review covers emergency fixes, launch-window exceptions, or other irreversible customer-visible changes. Route to the strictest required lane when multiple routes apply.

#### pattern customization checklist

Keep this module aligned with shift-ops-policy approval rules and shift-ops-runbook incident constraints. Split it only if routine change governance and emergency-change governance diverge in owner, cadence, or retained evidence.

Artifacts:
- `implementation-matrix` (mapping-table): Track implementation status, acceptance evidence, and review ownership per workstream.
- `system-gates` (rule-set): Final rules that determine whether implementation may move to delivery-ready state.
- `runtime-contract-table` (mapping-table): Track runtime entities or control flows and the contract each one must satisfy before release.
- `review-routing` (decision-tree): Route changes into scripted, expert, or human review lanes before execution.

### shift-ops-runbook

Authoritative incident runbook for sev1 response and immediate stabilization.

#### sev1 response path

sev1 pages primary and secondary on-call within five minutes. The incident commander confirms customer impact, opens the bridge, and assigns rollback authority before mitigation begins. Recovery updates stay on the bridge until impact and rollback state are explicit. The bridge record names the rollback owner, active mitigation step, and next checkpoint before closure.

Artifacts:
- `sev1-flow` (process-flow): Ordered sev1 response workflow.
