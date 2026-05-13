import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { REPO_ROOT } from "../src/helpers.mjs";

const CLI_PATH = path.join(REPO_ROOT, "bin", "aods.mjs");

function runCli(args, options = {}) {
  const expectedStatus = options.expectedStatus ?? 0;
  const spawnOptions = { ...options };
  delete spawnOptions.expectedStatus;
  const result = spawnSync("node", [CLI_PATH, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    ...spawnOptions
  });
  assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test("route keeps adoption-style queries on query-route with skipped diagnostics", () => {
  const report = runCli([
    "route",
    ".",
    "--query",
    "install version first validation troubleshooting",
    "--intent",
    "read",
    "--stage",
    "orientation",
    "--explain-skipped",
    "--json"
  ]);

  assert.equal(report.strategy, "query-route");
  assert.equal(report.explanation.reason.fallback, false);
  assert.ok(report.recommended_modules.length > 0);
  assert.ok(report.matched_query_modules.length > 0);
  assert.ok(report.skipped_modules.length > 0);
  assert.equal(report.explanation.skipped.skipped_module_count, report.skipped_modules.length);
});

test("route narrow runtime protocol query does not overread the full corpus", () => {
  const report = runCli([
    "route",
    ".",
    "--query",
    "runtime protocol provider discovery",
    "--intent",
    "read",
    "--stage",
    "orientation",
    "--explain-skipped",
    "--json"
  ]);

  const selectedIds = report.recommended_modules.map((entry) => entry.id);
  const skippedIds = report.skipped_modules.map((entry) => entry.id);

  assert.equal(report.strategy, "query-route");
  assert.ok(selectedIds.length > 0);
  assert.ok(selectedIds.length < report.base_modules.length + skippedIds.length);
  assert.ok(skippedIds.length > 0);
  assert.ok(skippedIds.includes("spec-stable-surface-contracts") || selectedIds.includes("spec-stable-surface-contracts"));
});

test("validate compatibility issues keep location envelope and remediation fields", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-validate-location-regression-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const corpusRoot = path.join(tempDir, "compiled-pilot-missing-capability-fallback");
  fs.cpSync(path.join(REPO_ROOT, "examples", "compiled-pilot"), corpusRoot, { recursive: true });

  const modulePath = path.join(corpusRoot, "modules", "shift-ops-adapter-capability.json");
  const module = JSON.parse(fs.readFileSync(modulePath, "utf8"));
  const fallbackArtifact = module.artifacts.find(
    (entry) => entry.artifact_id === "adapter-capability-compatibility-matrix"
  );
  const partialRow = fallbackArtifact.content.rows.find((row) => row[0] === "readiness-partial-cached");
  partialRow[10] = "";
  partialRow[11] = "";
  partialRow[12] = "";
  partialRow[13] = "";
  module.meta.contract.capability = {
    capability_id: "readiness.query",
    support_status: "partial"
  };
  fs.writeFileSync(modulePath, `${JSON.stringify(module, null, 2)}\n`);

  const report = runCli(["validate", corpusRoot, "--strict", "--json"], { expectedStatus: 1 });
  const issues = Object.values(report.levels).flatMap((level) => [...level.errors, ...level.warnings]);
  const issue = issues.find((entry) => entry.rule === "capability-fallback-metadata-required");

  assert.ok(issue);
  assert.equal(issue.module_id, "shift-ops-adapter-capability");
  assert.equal(issue.location.module_id, "shift-ops-adapter-capability");
  assert.ok(Object.hasOwn(issue.location, "sid"));
  assert.ok(Object.hasOwn(issue.location, "path"));
  assert.equal(issue.location.evidence_id ?? null, null);
  assert.equal(issue.remediation.action, "add-capability-fallback-metadata");
  assert.equal(issue.remediation.gate, "drift-blocking");
  assert.match(issue.remediation.guidance, /fallback posture/);
});

test("provider discovery remains static and requires evidence", (t) => {
  const providerModulePath = path.join(
    REPO_ROOT,
    "examples",
    "compiled-pilot",
    "modules",
    "shift-ops-adapter-capability.json"
  );
  const providerModule = JSON.parse(fs.readFileSync(providerModulePath, "utf8"));
  const discoveryArtifact = providerModule.artifacts.find(
    (entry) => entry.artifact_id === "adapter-provider-discovery-table"
  );

  assert.ok(discoveryArtifact);
  const columns = discoveryArtifact.content.columns;
  const evidenceIndex = columns.indexOf("evidence_refs");
  const networkAllowedIndex = columns.indexOf("network_allowed");
  const discoveryRow = discoveryArtifact.content.rows[0];

  assert.equal(discoveryRow[evidenceIndex], "adapter-capability-contract-test");
  assert.equal(discoveryRow[networkAllowedIndex], "false");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-provider-discovery-regression-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const corpusRoot = path.join(tempDir, "compiled-pilot-missing-provider-evidence");
  fs.cpSync(path.join(REPO_ROOT, "examples", "compiled-pilot"), corpusRoot, { recursive: true });

  const modulePath = path.join(corpusRoot, "modules", "shift-ops-adapter-capability.json");
  const module = JSON.parse(fs.readFileSync(modulePath, "utf8"));
  const artifact = module.artifacts.find((entry) => entry.artifact_id === "adapter-provider-discovery-table");
  const negativeEvidenceIndex = artifact.content.columns.indexOf("evidence_refs");
  const negativeNetworkAllowedIndex = artifact.content.columns.indexOf("network_allowed");
  artifact.content.rows[0][negativeEvidenceIndex] = "";
  artifact.content.rows[0][negativeNetworkAllowedIndex] = "true";
  fs.writeFileSync(modulePath, `${JSON.stringify(module, null, 2)}\n`);

  const report = runCli(["validate", corpusRoot, "--strict", "--json"], { expectedStatus: 1 });
  const issues = Object.values(report.levels).flatMap((level) => [...level.errors, ...level.warnings]);
  const evidenceIssue = issues.find((entry) => entry.rule === "runtime-protocol-provider-evidence");
  const networkIssue = issues.find((entry) => entry.rule === "runtime-protocol-provider-network-disabled");

  assert.ok(evidenceIssue);
  assert.equal(evidenceIssue.module_id, "shift-ops-adapter-capability");
  assert.equal(evidenceIssue.artifact_id, "adapter-provider-discovery-table");
  assert.equal(evidenceIssue.remediation.action, "add-provider-discovery-evidence");
  assert.match(evidenceIssue.remediation.guidance, /static evidence anchors/);

  assert.ok(networkIssue);
  assert.equal(networkIssue.module_id, "shift-ops-adapter-capability");
  assert.equal(networkIssue.remediation.action, "disable-provider-discovery-network");
  assert.match(networkIssue.remediation.guidance, /static/);
});

test("top-level help documents route skipped-module diagnostics flag", () => {
  const result = spawnSync("node", [CLI_PATH, "--help"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /aods route \[root\].*--explain-skipped.*--json/);
  assert.match(result.stdout, /aods --version/);
});
