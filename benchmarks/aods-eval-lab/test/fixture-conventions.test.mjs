import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { REPO_ROOT } from "../src/helpers.mjs";

const CLI_PATH = path.join(REPO_ROOT, "bin", "aods.mjs");
const FIXTURE_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot-source",
  "fixtures",
  "fixture-manifest.json"
);

test("compiled-pilot source declares a conventional fixture and golden export", () => {
  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const manifestDir = path.dirname(FIXTURE_MANIFEST_PATH);

  assert.equal(fixtureManifest.aods_fixture_manifest_v, 1);
  assert.equal(fixtureManifest.convention, "aods-fixture-golden-v1");
  assert.equal(fixtureManifest.update_policy.review_gate, "manual-diff");
  assert.ok(Array.isArray(fixtureManifest.fixtures));

  const fixture = fixtureManifest.fixtures.find((entry) => entry.id === "positive-compiled-pilot-source");
  assert.ok(fixture);
  assert.equal(fixture.kind, "positive");
  assert.equal(fixture.expected_status, "pass");
  assert.deepEqual(fixture.expected_rules, []);
  assert.equal(fixture.input.kind, "authoring-source");
  assert.ok(fs.existsSync(path.resolve(manifestDir, fixture.input.path)));

  const goldenExport = fixture.golden_exports.find((entry) => entry.id === "compiled-pilot-corpus");
  assert.ok(goldenExport);
  assert.equal(goldenExport.kind, "compiled-corpus");
  assert.equal(goldenExport.update_command, "npm run compile:pilot");
  assert.ok(fs.existsSync(path.resolve(manifestDir, goldenExport.path)));
});

test("fixture smoke command reports declared fixture and golden export coverage as JSON", () => {
  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const result = spawnSync(
    "node",
    [CLI_PATH, "fixture", "smoke", FIXTURE_MANIFEST_PATH, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);

  assert.equal(report.action, "fixture smoke");
  assert.equal(report.status, "pass");
  assert.equal(report.accepted, true);
  assert.equal(report.manifest.path, FIXTURE_MANIFEST_PATH);
  assert.equal(report.summary.fixtures, fixtureManifest.fixtures.length);
  assert.equal(report.summary.expected_status.pass, fixtureManifest.fixtures.length);
  assert.ok(report.summary.golden_exports > 0);
  assert.deepEqual(report.issues, []);
});

test("fixture smoke command rejects invalid expected outcome contracts", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-fixture-smoke-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));
  const tempManifestPath = path.join(tempDir, "fixture-manifest.json");
  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  fixtureManifest.fixtures = [
    {
      ...fixtureManifest.fixtures[0],
      expected_status: "maybe",
      expected_rules: "validation-rule-id"
    }
  ];
  fs.writeFileSync(tempManifestPath, JSON.stringify(fixtureManifest, null, 2));

  const result = spawnSync(
    "node",
    [CLI_PATH, "fixture", "smoke", tempManifestPath, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.notEqual(result.status, 0);
  const report = JSON.parse(result.stdout);

  assert.equal(report.action, "fixture smoke");
  assert.equal(report.status, "fail");
  assert.equal(report.accepted, false);
  assert.ok(report.issues.some((issue) => issue.rule === "fixture-expected-status"));
  assert.ok(report.issues.some((issue) => issue.rule === "fixture-expected-rules"));
});

test("fixture smoke command never executes declared update commands", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-fixture-non-execution-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const inputPath = path.join(tempDir, "authoring.json");
  const goldenPath = path.join(tempDir, "compiled.json");
  const markerPath = path.join(tempDir, "command-executed");
  fs.writeFileSync(inputPath, "{}\n");
  fs.writeFileSync(goldenPath, "{}\n");

  const fixtureManifest = {
    aods_fixture_manifest_v: 1,
    convention: "aods-fixture-golden-v1",
    update_policy: {
      review_gate: "manual-diff",
      commands: [
        `node -e "require('fs').writeFileSync(${JSON.stringify(markerPath)}, 'executed')"`
      ]
    },
    fixtures: [
      {
        id: "positive-non-execution-boundary",
        kind: "positive",
        input: {
          kind: "authoring-source",
          path: "authoring.json"
        },
        expected_status: "pass",
        expected_rules: [],
        golden_exports: [
          {
            id: "compiled",
            kind: "compiled-corpus",
            path: "compiled.json",
            schema_version: "aods_v3",
            update_command: `node -e "require('fs').writeFileSync(${JSON.stringify(markerPath)}, 'executed')"`,
            review_gate: "manual-diff"
          }
        ]
      }
    ]
  };
  const tempManifestPath = path.join(tempDir, "fixture-manifest.json");
  fs.writeFileSync(tempManifestPath, `${JSON.stringify(fixtureManifest, null, 2)}\n`);

  const result = spawnSync(
    "node",
    [CLI_PATH, "fixture", "smoke", tempManifestPath, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(markerPath), false);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.fixtures, 1);
  assert.equal(report.summary.golden_exports, 1);
  assert.deepEqual(report.issues, []);
});
