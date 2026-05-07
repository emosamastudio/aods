<!-- AODS GENERATED: pair_id=pair-shift-ops-readme mode=deterministic profile=overview -->
# shift-ops-pilot

Generated deterministically from AODS agent-primary authority. Do not edit manually.

## Pair contract

- Pair ID: `pair-shift-ops-readme`
- Sync source: `agent-primary`
- Agent primary: `shift-ops-capsule`
- Agent supporting: `shift-ops-root`, `shift-ops-policy`, `shift-ops-readiness-read-model`, `shift-ops-change-command`, `shift-ops-change-event-log`, `shift-ops-adapter-capability`, `shift-ops-resource-surface`, `shift-ops-governance`, `shift-ops-runbook`

## Canonical facts

- Production database schema changes require two approvers.
- sev1 pages primary and secondary on-call within five minutes.

## Coverage

- `shift-ops-capsule` (capsule): Summary routing for shift operations detail modules.
- `shift-ops-root` (architecture): Root routing for the shift operations pilot. Use at cold start before loading capsule or detail authority.
- `shift-ops-policy` (policy): Authoritative approval policy for operational changes and production release windows.
- `shift-ops-readiness-read-model` (reference): Canonical read-model example for release readiness status, freshness, watermark, implementation evidence, and acceptance criteria.
- `shift-ops-change-command` (workflow): Canonical command + receipt example for operational change requests without implementing a command executor.
- `shift-ops-change-event-log` (reference): Canonical event + correction/supersession example for operational change history without implementing an event store.
- `shift-ops-adapter-capability` (protocol): Canonical adapter + capability/exposure example for shift operations integration surfaces without implementing negotiation runtime.
- `shift-ops-resource-surface` (reference): Canonical resource surface example for declared resource identity, scope, risk, exposure, lifecycle cleanup, evidence, and acceptance criteria without implementing a resource runtime.
- `shift-ops-governance` (policy): Implementation governance authority for release readiness, acceptance evidence, and review routing for shift operations changes.
- `shift-ops-runbook` (workflow): Authoritative incident runbook for sev1 response and immediate stabilization.

## Agent-derived sections

### shift-ops-capsule

Summary routing for shift operations detail modules.

#### capsule summary and next routes

Routes: policy, readiness, command, event, adapter, artifact export, resource, governance, runbook. Production database schema changes require two approvers. sev1 pages primary and secondary on-call within five minutes.

### shift-ops-root

Root routing for the shift operations pilot. Use at cold start before loading capsule or detail authority.

#### root routing overview

Use shift-ops-capsule:system-capsule for summary routing. Open README.md when a human-facing overview is needed. Route delivery-readiness and final gate questions to shift-ops-governance:implementation-governance. Route change command and receipt questions to shift-ops-change-command:change-command. Route event correction questions to shift-ops-change-event-log:change-event-correction-supersession. Route adapter capability questions to shift-ops-adapter-capability:adapter-provider-capability. Route artifact export and policy-gate questions to shift-ops-artifact-export-policy:artifact-export-surface. Route resource scope, risk, exposure, and cleanup posture questions to shift-ops-resource-surface:resource-identity-scope. Use surface-inventory only when validating current corpus surfaces. Keep this root module short and route-oriented.

Artifacts:
- `route-table` (mapping-table): First-hop routing from cold start.
- `surface-inventory` (surface-inventory): Optional reality sensor for the compiled pilot. Current entries must exist when validate runs with --reality.

### shift-ops-policy

Authoritative approval policy for operational changes and production release windows.

#### approval gates and release windows

Production database schema changes require two approvers. Standard changes may deploy only inside the published release window. Emergency changes require a written rollback owner and explicit incident linkage. Approval evidence names the release window, database owner, and rollback owner before execution closes.

Artifacts:
- `approval-rules` (rule-set): Constraint set for approving production changes.

### shift-ops-readiness-read-model

Canonical read-model example for release readiness status, freshness, watermark, implementation evidence, and acceptance criteria.

#### release readiness read model

Read model exposes release readiness status for release-manager decisions. Record identity=release_id, status, blocking_gate, last_approval_at, snapshot_id, exported_at, source_watermark, and staleness. Missing release_id means no current readiness record. Missing watermark means stale and requires manual review.

Artifacts:
- `readiness-field-table` (mapping-table): Canonical field guide for the release readiness read-model example pack.

### shift-ops-change-command

Canonical command + receipt example for operational change requests without implementing a command executor.

#### change command contract

Change command envelope requires command_id, change_id, requested_by, mode, idempotency_key, target_release_id, requested_at, and policy_context. Validator checks approval policy and release readiness preconditions before a receipt is emitted. This example does not execute the operational change.

#### change command receipt

Receipt output records receipt_id, command_id, change_id, status, policy_decision, audit_ref, correlation_id, emitted_at, and reason. Status values are accepted, rejected, or needs-review. Receipt confirms validation outcome only; it is not proof that the command executed.

Artifacts:
- `change-command-field-table` (mapping-table): Canonical field guide for the change command envelope.
- `change-command-receipt-table` (mapping-table): Canonical field guide for the change command receipt.
- `change-command-audit-risk-table` (mapping-table): Audit and risk posture for write-capable command surfaces.

### shift-ops-change-event-log

Canonical event + correction/supersession example for operational change history without implementing an event store.

#### append-only change event

Change event record is append-only. Required fields are event_id, event_type, receipt_ref, emitted_at, schema_version, ordering_key, payload_hash, and actor_ref. The original event is preserved even when later records correct, supersede, or retract its meaning.

#### event correction and supersession

Correction event names correction_of, correction_actor, correction_source, correction_reason, corrected_fields, supersedes, superseded_by, replacement_event, effective_at, and retraction_reason when applicable. Correction does not mutate the original event. Supersession links identify which event currently carries preferred truth.

#### projection guidance for corrected events

Projection guidance states whether read models, timelines, exports, and audit views should preserve, mark, hide, or replace corrected records. Guidance values are historical, advisory, blocking, or replacement. Consumers must not infer domain truth from correction metadata alone.

Artifacts:
- `change-event-field-table` (mapping-table): Canonical field guide for append-only change events.
- `change-event-correction-table` (mapping-table): Correction and supersession fields for append-only event surfaces.
- `change-event-projection-guidance-table` (mapping-table): Consumer guidance for corrected event projection.

### shift-ops-adapter-capability

Canonical adapter + capability/exposure example for shift operations integration surfaces without implementing negotiation runtime.

#### adapter provider capability claim

Provider capability claim names adapter_id, capability_id, contract_profile, schema_version_policy, transport_scope, freshness_posture, redaction_posture, limits, and evidence_anchor. Capability claim is metadata only and does not create runtime discovery, auth exchange, fallback ranking, or dynamic probing.

#### adapter consumer requirement

Consumer requirement names required capability_id, accepted contract_profile, required_schema_version_policy, transport_scope need, freshness requirement, redaction floor, exposure class, and blocking posture. Compatibility result may be compatible, incompatible, partial, or unknown; it does not select providers or execute adapters.

#### adapter exposure and audit posture

Adapter-facing exposure requires exposure_class, auth_boundary, redaction_floor, freshness_requirement, compatibility_policy, risk_labels, audit_anchor, and consumer_guidance. Audit notes record actor, source, target, adapter_id, capability_id, policy_decision, timestamp, and correlation_id. This example does not host a remote gateway.

Artifacts:
- `adapter-capability-table` (mapping-table): Canonical provider capability fields for adapter-facing surfaces.
- `adapter-consumer-requirement-table` (mapping-table): Canonical consumer requirement fields for metadata-only capability comparison.
- `adapter-exposure-audit-table` (mapping-table): Exposure and audit posture for adapter-facing capability claims.

### shift-ops-resource-surface

Canonical resource surface example for declared resource identity, scope, risk, exposure, lifecycle cleanup, evidence, and acceptance criteria without implementing a resource runtime.

#### resource identity and scope

Resource surface declares resource_id, resource_kind, resource_scope, owner, authority_surface, and consumer_guidance. Resource scope is a declared contract surface; it does not create a resource runtime or permission broker.

#### resource risk and exposure posture

Resource risk posture declares read_risk, write_risk, exposure_class, credential_boundary, and approval_boundary. Risk labels guide consumers; they do not enforce runtime policy or perform dynamic scanning.

#### resource cleanup and evidence linkage

Resource cleanup posture declares cleanup_posture, lifecycle_signal, evidence_anchor, acceptance_criterion, and non_goal. Cleanup evidence is reviewable metadata only; this example does not schedule cleanup or execute remediation.

Artifacts:
- `resource-scope-table` (mapping-table): Canonical fields for declared resource surface identity and scope.
- `resource-risk-exposure-table` (mapping-table): Risk and exposure posture fields for declared resources.
- `resource-cleanup-evidence-table` (mapping-table): Cleanup posture and evidence anchors for declared resource surfaces.

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
