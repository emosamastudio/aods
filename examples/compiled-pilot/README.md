<!-- AODS GENERATED: pair_id=pair-shift-ops-readme mode=deterministic profile=overview -->
# shift-ops-pilot

Generated deterministically from AODS agent-primary authority. Do not edit manually.

## Pair contract

- Pair ID: `pair-shift-ops-readme`
- Sync source: `agent-primary`
- Agent primary: `shift-ops-capsule`
- Agent supporting: `shift-ops-root`, `shift-ops-policy`, `shift-ops-runbook`

## Canonical facts

- Production database schema changes require two approvers.
- sev1 pages primary and secondary on-call within five minutes.

## Coverage

- `shift-ops-capsule` (capsule): Summary routing for shift operations. Use after root load to decide whether policy or runbook detail should open next.
- `shift-ops-root` (architecture): Root routing for the shift operations pilot. Use at cold start before loading capsule or detail authority.
- `shift-ops-policy` (policy): Authoritative approval policy for operational changes and production release windows.
- `shift-ops-runbook` (workflow): Authoritative incident runbook for sev1 response and immediate stabilization.

## Agent-derived sections

### shift-ops-capsule

Summary routing for shift operations. Use after root load to decide whether policy or runbook detail should open next.

#### capsule summary and next routes

Route change approval questions to shift-ops-policy:approval-policy. Route sev1 response questions to shift-ops-runbook:incident-response. Production database schema changes require two approvers. sev1 pages primary and secondary on-call within five minutes.

### shift-ops-root

Root routing for the shift operations pilot. Use at cold start before loading capsule or detail authority.

#### root routing overview

Use shift-ops-capsule:system-capsule for summary routing. Open README.md when a human-facing overview is needed. Keep this root module short and route-oriented.

Artifacts:
- `route-table` (mapping-table): First-hop routing from cold start.

### shift-ops-policy

Authoritative approval policy for operational changes and production release windows.

#### approval gates and release windows

Production database schema changes require two approvers. Standard changes may deploy only inside the published release window. Emergency changes require a written rollback owner and explicit incident linkage. Approval evidence names the release window, database owner, and rollback owner before execution closes.

Artifacts:
- `approval-rules` (rule-set): Constraint set for approving production changes.

### shift-ops-runbook

Authoritative incident runbook for sev1 response and immediate stabilization.

#### sev1 response path

sev1 pages primary and secondary on-call within five minutes. The incident commander confirms customer impact, opens the bridge, and assigns rollback authority before mitigation begins. Recovery updates stay on the bridge until impact and rollback state are explicit. The bridge record names the rollback owner, active mitigation step, and next checkpoint before closure.

Artifacts:
- `sev1-flow` (process-flow): Ordered sev1 response workflow.
