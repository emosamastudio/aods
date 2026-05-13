import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  buildMigrationDryRunReport,
  validateMigrationDryRunReport
} from "../src/migration-dry-run-report.mjs";
import { PROJECT_ROOT, readJson } from "../src/helpers.mjs";

test("migration dry-run report fixture stays static and non-executing", () => {
  const fixture = readJson(path.join(PROJECT_ROOT, "fixtures", "migration-dry-run", "static-report.json"));
  const result = validateMigrationDryRunReport(fixture);

  assert.equal(result.status, "pass");
  assert.equal(fixture.dry_run_status, "warn");
  assert.equal(fixture.object_counts.destructive_operations, 0);
  assert.ok(fixture.non_execution_guards.includes("no-migration-command"));
  assert.equal("execute_command" in fixture, false);
  assert.equal("connection_string" in fixture, false);
});

test("migration dry-run report helper rejects executor-shaped fields", () => {
  const report = buildMigrationDryRunReport({
    report_id: "safe-static-report",
    source_authority: "source:authority",
    target_authority: "target:authority",
    migration_kind: "schema-change",
    dry_run_status: "blocked",
    change_summary: [],
    object_counts: {
      destructive_operations: 0
    },
    risk_labels: [],
    approval_requirements: {
      approver_count: 1
    },
    rollback_plan: {
      owner: "database-owner"
    },
    non_execution_guards: [
      "benchmark-only"
    ]
  });

  assert.equal(report.migration_dry_run_report_v, 1);

  const unsafe = validateMigrationDryRunReport({
    ...report,
    execute_command: "migrate --apply"
  });
  assert.equal(unsafe.status, "fail");
  assert.ok(unsafe.errors.some((entry) => entry.includes("execute_command")));
});
