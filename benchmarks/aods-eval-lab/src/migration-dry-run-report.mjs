export const MIGRATION_DRY_RUN_REPORT_V = 1;

export const MIGRATION_DRY_RUN_REQUIRED_FIELDS = [
  "report_id",
  "source_authority",
  "target_authority",
  "migration_kind",
  "dry_run_status",
  "change_summary",
  "object_counts",
  "risk_labels",
  "approval_requirements",
  "rollback_plan",
  "non_execution_guards"
];

export const MIGRATION_DRY_RUN_STATUS = new Set(["pass", "warn", "blocked"]);

const DISALLOWED_EXECUTION_FIELDS = new Set([
  "execute_command",
  "apply_command",
  "mutation_command",
  "executor",
  "connection_string",
  "credentials"
]);

export function buildMigrationDryRunReport(input) {
  const report = {
    migration_dry_run_report_v: MIGRATION_DRY_RUN_REPORT_V,
    ...input
  };
  validateMigrationDryRunReport(report);
  return report;
}

export function validateMigrationDryRunReport(report) {
  const missing = MIGRATION_DRY_RUN_REQUIRED_FIELDS.filter((field) => report[field] == null);
  const disallowed = Object.keys(report).filter((field) => DISALLOWED_EXECUTION_FIELDS.has(field));
  const errors = [];

  if (report.migration_dry_run_report_v !== MIGRATION_DRY_RUN_REPORT_V) {
    errors.push(`migration_dry_run_report_v must be ${MIGRATION_DRY_RUN_REPORT_V}`);
  }
  for (const field of missing) {
    errors.push(`missing required field: ${field}`);
  }
  for (const field of disallowed) {
    errors.push(`execution field is not allowed in static dry-run report: ${field}`);
  }
  if (report.dry_run_status != null && !MIGRATION_DRY_RUN_STATUS.has(report.dry_run_status)) {
    errors.push("dry_run_status must be pass, warn, or blocked");
  }
  if (!Array.isArray(report.change_summary)) {
    errors.push("change_summary must be an array");
  }
  if (!Array.isArray(report.risk_labels)) {
    errors.push("risk_labels must be an array");
  }
  if (!Array.isArray(report.non_execution_guards) || report.non_execution_guards.length === 0) {
    errors.push("non_execution_guards must name at least one no-execution guard");
  }

  return {
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}
