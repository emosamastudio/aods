import fs from "node:fs";
import path from "node:path";

import { smokeFixtureManifest } from "./fixture-smoke.mjs";
import { validateCorpus } from "./validate.mjs";

const CONFORMANCE_MANIFEST_VERSION = 0;
const CASE_KINDS = new Set(["fixture-smoke", "validate"]);
const EXPECTED_STATUSES = new Set(["pass", "fail", "warn"]);
const ROOT_KEYS = new Set(["aods_conformance_manifest_v", "suite_id", "description", "cases"]);
const CASE_KEYS = new Set(["id", "kind", "target", "expected"]);
const TARGET_KEYS = new Set(["path", "strict", "reality"]);
const EXPECTED_KEYS = new Set(["status", "rules"]);

export async function runConformanceCommand(argv) {
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    printConformanceUsage();
    return 0;
  }

  const [subcommand, ...args] = argv;
  if (subcommand !== "run") {
    throw new Error(`Unknown conformance command: ${subcommand}`);
  }

  const options = parseRunArgs(args);
  const report = runConformanceManifest(options.manifestPath);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printConformanceReport(report);
  }

  return report.accepted ? 0 : 1;
}

export function runConformanceManifest(manifestPathInput) {
  const manifestPath = path.resolve(manifestPathInput);
  const report = emptyReport(manifestPath);

  if (!fs.existsSync(manifestPath)) {
    addIssue(report, "conformance-manifest-path", `conformance manifest not found at ${manifestPath}`);
    return finalizeReport(report);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    addIssue(report, "conformance-manifest-json", error instanceof Error ? error.message : String(error));
    return finalizeReport(report);
  }

  const manifestDir = path.dirname(manifestPath);
  report.suite_id = typeof manifest.suite_id === "string" ? manifest.suite_id : "";
  report.manifest.version = manifest.aods_conformance_manifest_v ?? null;

  const manifestIssues = validateManifestShape(manifest);
  for (const issue of manifestIssues) {
    addIssue(report, issue.rule, issue.message, issue.case_id);
  }
  if (manifestIssues.length > 0) {
    return finalizeReport(report);
  }

  report.summary.cases = manifest.cases.length;
  for (const testCase of manifest.cases) {
    runCase(report, manifestDir, testCase);
  }

  return finalizeReport(report);
}

function parseRunArgs(argv) {
  const options = {
    manifestPath: "",
    json: false
  };

  const queue = [...argv];
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (!arg.startsWith("-") && !options.manifestPath) {
      options.manifestPath = arg;
      continue;
    }
    throw new Error(`Unknown conformance run arg: ${arg}`);
  }

  if (!options.manifestPath) {
    throw new Error("conformance run requires a conformance manifest path");
  }

  return options;
}

function validateManifestShape(manifest) {
  const issues = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return [{ rule: "conformance-manifest-object", message: "conformance manifest must be a JSON object" }];
  }
  issues.push(...unknownPropertyIssues(manifest, ROOT_KEYS, "manifest"));
  if (manifest.aods_conformance_manifest_v !== CONFORMANCE_MANIFEST_VERSION) {
    issues.push({
      rule: "conformance-manifest-version",
      message: `aods_conformance_manifest_v must be ${CONFORMANCE_MANIFEST_VERSION}`
    });
  }
  if (typeof manifest.suite_id !== "string" || manifest.suite_id.length === 0) {
    issues.push({ rule: "conformance-suite-id", message: "suite_id must be a non-empty string" });
  }
  if (!Array.isArray(manifest.cases)) {
    issues.push({ rule: "conformance-case-list", message: "cases must be an array" });
    return issues;
  }

  const seenIds = new Set();
  for (const [index, testCase] of manifest.cases.entries()) {
    const caseId = typeof testCase?.id === "string" && testCase.id ? testCase.id : `cases[${index}]`;
    if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) {
      issues.push({ rule: "conformance-case-object", case_id: caseId, message: `${caseId} must be an object` });
      continue;
    }
    issues.push(...unknownPropertyIssues(testCase, CASE_KEYS, caseId, caseId));
    if (typeof testCase.id !== "string" || testCase.id.length === 0) {
      issues.push({ rule: "conformance-case-id", case_id: caseId, message: `${caseId}.id must be a non-empty string` });
    } else if (seenIds.has(testCase.id)) {
      issues.push({ rule: "conformance-case-id-unique", case_id: caseId, message: `duplicate conformance case id: ${testCase.id}` });
    }
    seenIds.add(testCase.id);
    if (!CASE_KINDS.has(testCase.kind)) {
      issues.push({ rule: "conformance-case-kind", case_id: caseId, message: `${caseId}.kind must be fixture-smoke or validate` });
    }
    if (typeof testCase.target?.path !== "string" || testCase.target.path.length === 0) {
      issues.push({ rule: "conformance-case-target", case_id: caseId, message: `${caseId}.target.path must be a non-empty string` });
    }
    if (testCase.target && typeof testCase.target === "object" && !Array.isArray(testCase.target)) {
      issues.push(...unknownPropertyIssues(testCase.target, TARGET_KEYS, `${caseId}.target`, caseId));
    }
    if (!EXPECTED_STATUSES.has(testCase.expected?.status)) {
      issues.push({ rule: "conformance-case-expected-status", case_id: caseId, message: `${caseId}.expected.status must be pass, fail, or warn` });
    }
    if (testCase.expected && typeof testCase.expected === "object" && !Array.isArray(testCase.expected)) {
      issues.push(...unknownPropertyIssues(testCase.expected, EXPECTED_KEYS, `${caseId}.expected`, caseId));
    }
    if (testCase.expected?.rules !== undefined && !Array.isArray(testCase.expected.rules)) {
      issues.push({ rule: "conformance-case-expected-rules", case_id: caseId, message: `${caseId}.expected.rules must be an array when present` });
    }
  }
  return issues;
}

function unknownPropertyIssues(value, allowedKeys, label, caseId = undefined) {
  return Object.keys(value)
    .filter((key) => !allowedKeys.has(key))
    .map((key) => ({
      rule: "conformance-manifest-property",
      ...(caseId ? { case_id: caseId } : {}),
      message: `${label}.${key} is not allowed`
    }));
}

function runCase(report, manifestDir, testCase) {
  const targetPath = path.resolve(manifestDir, testCase.target.path);
  const expectedRules = testCase.expected.rules ?? [];
  const caseReport = {
    id: testCase.id,
    kind: testCase.kind,
    status: "fail",
    expected_status: testCase.expected.status,
    target_path: targetPath,
    matched_rules: [],
    missing_rules: [],
    unexpected_rules: []
  };

  let toolReport;
  if (testCase.kind === "fixture-smoke") {
    toolReport = smokeFixtureManifest(targetPath);
  } else {
    toolReport = runValidateCase(targetPath, testCase.target);
  }

  const actualRules = extractRules(toolReport);
  caseReport.status = toolReport.status;
  caseReport.matched_rules = expectedRules.filter((rule) => actualRules.includes(rule));
  caseReport.missing_rules = expectedRules.filter((rule) => !actualRules.includes(rule));
  caseReport.unexpected_rules = actualRules.filter((rule) => expectedRules.length > 0 && !expectedRules.includes(rule));

  const accepted =
    caseReport.status === testCase.expected.status &&
    caseReport.missing_rules.length === 0 &&
    (expectedRules.length === 0 || caseReport.unexpected_rules.length === 0);

  if (accepted) {
    report.summary.passed += 1;
    if (testCase.expected.status === "fail") {
      report.summary.expected_failures += 1;
    }
  } else {
    report.summary.failed += 1;
    addIssue(report, "conformance-case-result", `${testCase.id} did not match expected status/rules`, testCase.id);
  }

  report.cases.push(caseReport);
}

function runValidateCase(targetPath, target) {
  const validationReport = validateCorpus(targetPath, {
    strict: target.strict === true,
    json: true,
    reality: target.reality === true,
    repoRoot: targetPath
  });
  const accepted = validationReport.summary.errors === 0 && (target.strict !== true || validationReport.summary.warnings === 0);
  return {
    status: accepted ? "pass" : "fail",
    issues: validationIssues(validationReport)
  };
}

function extractRules(toolReport) {
  return [...new Set((toolReport.issues ?? []).map((issue) => issue.rule).filter(Boolean))].sort();
}

function validationIssues(validationReport) {
  if (Array.isArray(validationReport.issues)) {
    return validationReport.issues;
  }
  return Object.values(validationReport.levels ?? {}).flatMap((level) => [
    ...(level.errors ?? []),
    ...(level.warnings ?? [])
  ]);
}

function emptyReport(manifestPath) {
  return {
    action: "conformance run",
    status: "pass",
    accepted: true,
    suite_id: "",
    manifest: {
      path: manifestPath,
      version: null
    },
    summary: {
      cases: 0,
      passed: 0,
      failed: 0,
      expected_failures: 0
    },
    cases: [],
    issues: []
  };
}

function addIssue(report, rule, message, caseId = undefined) {
  report.issues.push({
    level: "error",
    rule,
    ...(caseId ? { case_id: caseId } : {}),
    message
  });
}

function finalizeReport(report) {
  report.accepted = report.issues.length === 0 && report.summary.failed === 0;
  report.status = report.accepted ? "pass" : "fail";
  return report;
}

function printConformanceUsage() {
  console.log(`AODS conformance

Usage:
  aods conformance run <conformance-manifest> [--json]

Commands:
  run      Run declared fixture-smoke and validate cases without arbitrary command execution.

Flags:
  --json   Emit JSON conformance report.
  -h, --help Show help.
`);
}

function printConformanceReport(report) {
  console.log(`${report.status.toUpperCase()} conformance run ${report.manifest.path}`);
  console.log(`suite: ${report.suite_id}`);
  console.log(`cases: ${report.summary.cases}`);
  console.log(`passed: ${report.summary.passed}`);
  console.log(`failed: ${report.summary.failed}`);
  if (report.issues.length > 0) {
    console.log("issues:");
    for (const issue of report.issues) {
      const caseLabel = issue.case_id ? ` ${issue.case_id}` : "";
      console.log(`- ${issue.rule}${caseLabel}: ${issue.message}`);
    }
  }
}
