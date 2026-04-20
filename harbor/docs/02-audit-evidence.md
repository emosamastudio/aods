# Harbor Audit Evidence

> **Paired surface** — authoritative content is sourced from `modules/harbor-audit-evidence.json` (agent-primary).  
> Capsule routing context is in `modules/harbor-capsule.json`.  
> For change approval rules and sign-off authority, see `modules/harbor-change-control.json`.

> **Compliance lead note (2026-04-20)** — Added explicit evidence bundle definitions, a pre-submission checklist, and a compliance review triggers section for practitioner use. Retention rules, snapshot cadence, legal-hold behavior, and the auditor SQL query are transcribed without modification from `modules/harbor-audit-evidence.json`. All changes remain grounded in `modules/harbor-audit-evidence.json` and `modules/harbor-capsule.json`. No policy values have been altered.

---

## Overview

Every approved change must carry three categories of evidence: **ticket evidence**, **validation evidence**, and **communication evidence**. A change that is missing any of these remains in **blocked state** even after its technical rollout has completed. Auditors examine evidence bundles and blocked-state records as the primary basis for external review.

*Authority: `modules/harbor-audit-evidence.json` § `audit-evidence-overview`*

---

## Evidence Bundle Requirements

Each evidence bundle is attached to an approved change and consists of three required evidence categories. All three must be present for a change to exit blocked state.

*Authority: `modules/harbor-audit-evidence.json` § `audit-evidence-overview`*

| Evidence Category | Description | Blocked if Missing |
|---|---|---|
| **Ticket evidence** | The canonical change ticket or request record linking the work item to the approved change. | Yes |
| **Validation evidence** | Test results, sign-off records, or verification artifacts demonstrating the change was validated prior to rollout. | Yes |
| **Communication evidence** | Notification or announcement records confirming that relevant stakeholders were informed. | Yes |

### Blocked-state behavior

- A change enters **blocked state** when any required evidence category is absent from its bundle.
- Blocked state persists **even after technical rollout completes** — rollout completion alone does not satisfy evidence requirements.
- Auditors treat blocked-state records as findings during external review. Resolve missing evidence before closing a change record.

---

## Pre-Submission Checklist

Before submitting a change for approval, confirm every item below. A change bundle that fails any check will remain in or enter **blocked state**.

*Authority: `modules/harbor-audit-evidence.json` § `audit-evidence-overview`, artifact `evidence-retention-window`*

- [ ] **Ticket evidence** is linked — the canonical change ticket is attached and accessible in the bundle.
- [ ] **Validation evidence** is attached — test results, sign-off records, or verification artifacts are present.
- [ ] **Communication evidence** is attached — stakeholder notification or announcement records are included.
- [ ] All three evidence categories are present. **Do not proceed if any category is missing** — technical rollout completion does not override a blocked state caused by missing evidence.
- [ ] Verify that the nightly evidence snapshot at **02:15 UTC** (`harbor-nightly-snapshot`) will capture the complete bundle before the change is closed.
- [ ] If a legal hold is active (`legal_hold == true`), confirm deletion is blocked on all evidence artifacts for this change (`harbor-legal-hold`).

---

## Retention Policy

Retention windows are defined as temporal patterns. All times are expressed in **UTC**.

*Authority: `modules/harbor-audit-evidence.json` artifact `evidence-retention-window`*

| Pattern ID | Type | Expression | Rule |
|---|---|---|---|
| `harbor-retention-period` | window | `7y` | Audit evidence is retained for **seven years**. Violation triggers an open compliance review. |
| `harbor-nightly-snapshot` | interval | `02:15 UTC daily` | Nightly evidence snapshots run at **02:15 UTC**. |
| `harbor-legal-hold` | window | `while legal_hold == true` | Legal hold **suppresses deletion** even after the normal seven-year window expires. Violation blocks deletion. |

### Key retention rules

- The seven-year retention countdown begins only after `allow retention countdown` is triggered (`harbor-retention-period`).
- Nightly snapshots are the mechanism for capturing point-in-time evidence state (`harbor-nightly-snapshot`).
- When `legal_hold == true`, the standard retention period is suspended; deletion is blocked until the hold is released (`harbor-legal-hold`).

---

## Audit Evidence Query

The query below is the canonical escape-hatch for auditor-oriented SQL evidence. It is stored as raw SQL because escape-hatch artifacts must remain directly measurable. **Evidence query snapshots are immutable once attached to an approved change record.**

*Authority: `modules/harbor-audit-evidence.json` artifact `audit-evidence-query`*

```sql
SELECT change_id, approver_role, evidence_status
FROM audit_change_approvals
WHERE approved_at >= NOW() - INTERVAL '30 days';
-- Auditors can query change approvals by change_id, approver_role, and evidence_status.
-- The evidence query is stored as raw SQL because benchmark escape hatches must stay measurable.
-- Evidence query snapshots are immutable once attached to an approved change record.
```

---

## Routing

Use `modules/harbor-capsule.json` for quick orientation across the Harbor regulated change-control slice.

*Authority: `modules/harbor-capsule.json` § `harbor-capsule-routing`*

| Need | Module |
|---|---|
| Change approval rules, exception handling, SOP sign-off authority | `modules/harbor-change-control.json` |
| Evidence bundles, retention policy, audit query references | `modules/harbor-audit-evidence.json` *(this surface)* |
| First-hop Harbor orientation | `modules/harbor-root.json` |
