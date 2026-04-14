# Audit evidence

This linked Markdown document is referenced from llms.txt as an AI-facing reading surface.

## Lifecycle artifacts

## Audit evidence overview

Phase: operate.

Describe how evidence bundles and blocked states behave under audit review.

Required facts:

- Every approved change links ticket evidence, validation evidence, and communication evidence.
- Missing evidence keeps a change in blocked state even after technical rollout completes.

AODS representation: harbor-audit-evidence/section:audit-evidence-overview.

Context note: Describe how evidence bundles and blocked states behave under audit review.

## Evidence retention window

Phase: governance.

Represent retention and audit snapshot timing.

Required facts:

- Audit evidence is retained for seven years.
- Nightly evidence snapshots run at 02:15 UTC.
- Legal hold suppresses deletion even after the normal retention window expires.

AODS representation: harbor-audit-evidence/temporal-pattern.

Human-readable reference view:

```json
{
  "timezone": "UTC",
  "patterns": [
    {
      "id": "harbor-retention-period",
      "type": "window",
      "expression": "7y",
      "target": "Audit evidence is retained for seven years.",
      "on_trigger": "allow retention countdown",
      "on_violation": "open compliance review"
    },
    {
      "id": "harbor-nightly-snapshot",
      "type": "interval",
      "expression": "02:15 UTC daily",
      "target": "evidence snapshot",
      "on_trigger": "Nightly evidence snapshots run at 02:15 UTC."
    },
    {
      "id": "harbor-legal-hold",
      "type": "window",
      "expression": "while legal_hold == true",
      "target": "Legal hold suppresses deletion even after the normal retention window expires.",
      "on_violation": "block deletion"
    }
  ]
}
```

## Audit evidence query

Phase: operate.

Keep low-level evidence query text as an explicit raw escape hatch.

Required facts:

- Auditors can query change approvals by change_id, approver_role, and evidence_status.
- The evidence query is stored as raw SQL because benchmark escape hatches must stay measurable.
- Evidence query snapshots are immutable once attached to an approved change record.

AODS representation: harbor-audit-evidence/raw.

Human-readable reference view:

```json
"SELECT change_id, approver_role, evidence_status\nFROM audit_change_approvals\nWHERE approved_at >= NOW() - INTERVAL '30 days';\n-- Auditors can query change approvals by change_id, approver_role, and evidence_status.\n-- The evidence query is stored as raw SQL because benchmark escape hatches must stay measurable.\n-- Evidence query snapshots are immutable once attached to an approved change record.\n"
```
