# Change control

This document is the human-facing paired surface for harbor-change-control.

## Lifecycle artifacts

## Change policy brief

Phase: planning.

State mandatory fields, rollback discipline, and human-primary SOP posture for regulated change control.

Required facts:

- Every material change request must declare regulated asset, risk class, approver set, rollback owner, and evidence bundle.
- Emergency changes require a documented rollback owner before execution.
- The regulator-facing SOP is the declared human-primary surface for Harbor change control.

AODS representation: harbor-change-control/section:change-policy-brief.

Context note: State mandatory fields, rollback discipline, and human-primary SOP posture for regulated change control.

## Risk class matrix

Phase: discovery.

Capture how regulated change classes alter approval depth.

Required facts:

- Risk class III changes require clinical QA and data stewardship approval.
- Risk class II changes require data stewardship approval before scheduling.
- Risk class I changes can auto-approve only when no schema, PHI, or retention behavior changes.

AODS representation: harbor-change-control/mapping-table.

Human-readable reference view:

```json
{
  "key_columns": [
    "risk_class"
  ],
  "columns": [
    "risk_class",
    "approval_depth",
    "notes"
  ],
  "rows": [
    [
      "I",
      "auto-approve eligible",
      "Risk class I changes can auto-approve only when no schema, PHI, or retention behavior changes."
    ],
    [
      "II",
      "data stewardship review",
      "Risk class II changes require data stewardship approval before scheduling."
    ],
    [
      "III",
      "clinical QA + data stewardship",
      "Risk class III changes require clinical QA and data stewardship approval."
    ]
  ]
}
```

## Approval decision tree

Phase: design.

Map regulated change signals to approval paths.

Required facts:

- Emergency changes require retrospective approval within twenty-four hours.
- Changes that alter PHI retention cannot skip security review.
- Waivers expire at the next review board checkpoint.

AODS representation: harbor-change-control/decision-tree.

Human-readable reference view:

```json
{
  "root": "change-kind",
  "nodes": [
    {
      "id": "change-kind",
      "type": "condition",
      "eval": "change kind?",
      "branches": [
        {
          "value": "standard",
          "next": "standard-path"
        },
        {
          "value": "emergency",
          "next": "emergency-path"
        },
        {
          "value": "waiver",
          "next": "waiver-path"
        }
      ]
    },
    {
      "id": "standard-path",
      "type": "action",
      "action": "Changes that alter PHI retention cannot skip security review."
    },
    {
      "id": "emergency-path",
      "type": "action",
      "action": "Emergency changes require retrospective approval within twenty-four hours."
    },
    {
      "id": "waiver-path",
      "type": "action",
      "action": "Waivers expire at the next review board checkpoint."
    }
  ]
}
```

## Exception handling flow

Phase: build.

Define how regulated exceptions are opened, approved, and closed.

Required facts:

- Exception flow records sponsor, approving authority, expiry time, and remediation task.
- Expired exceptions block further deployment until closed.
- Approved exceptions attach validation evidence before activation.

AODS representation: harbor-change-control/process-flow.

Human-readable reference view:

```json
{
  "entry": "record-exception",
  "terminals": [
    "exception-active",
    "exception-blocked"
  ],
  "actors": [
    "change-manager",
    "quality-reviewer"
  ],
  "steps": [
    {
      "id": "record-exception",
      "type": "action",
      "actor": "change-manager",
      "action": "Exception flow records sponsor, approving authority, expiry time, and remediation task.",
      "next": "attach-evidence"
    },
    {
      "id": "attach-evidence",
      "type": "action",
      "actor": "change-manager",
      "action": "Approved exceptions attach validation evidence before activation.",
      "next": "check-expiry"
    },
    {
      "id": "check-expiry",
      "type": "decision",
      "actor": "quality-reviewer",
      "action": "Exception expired?",
      "next": {
        "no": "exception-active",
        "yes": "exception-blocked"
      }
    },
    {
      "id": "exception-active",
      "type": "action",
      "actor": "quality-reviewer",
      "action": "Exception remains active until its planned expiry.",
      "next": null
    },
    {
      "id": "exception-blocked",
      "type": "action",
      "actor": "quality-reviewer",
      "action": "Expired exceptions block further deployment until closed.",
      "next": null
    }
  ]
}
```
