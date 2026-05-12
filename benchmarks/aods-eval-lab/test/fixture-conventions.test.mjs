import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";

import { REPO_ROOT } from "../src/helpers.mjs";

const CLI_PATH = path.join(REPO_ROOT, "bin", "aods.mjs");
const FIXTURE_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot-source",
  "fixtures",
  "fixture-manifest.json"
);
const CONFORMANCE_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "examples",
  "compiled-pilot-source",
  "fixtures",
  "conformance-manifest.json"
);
const NEGATIVE_FIXTURE_RULES = new Set([
  "fixture-golden-path",
  "fixture-positive-rules",
  "fixture-negative-rules",
  "fixture-kind",
  "fixture-input-path"
]);

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

test("compiled-pilot source declares first-slice negative fixture contracts", () => {
  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const manifestDir = path.dirname(FIXTURE_MANIFEST_PATH);
  const negativeFixtures = fixtureManifest.fixtures.filter((fixture) => fixture.kind === "negative");

  assert.equal(negativeFixtures.length, 5);
  for (const fixture of negativeFixtures) {
    assert.equal(fixture.input.kind, "fixture-manifest");
    assert.equal(fixture.expected_status, "fail");
    assert.equal(fixture.expected_rules.length, 1);
    assert.ok(NEGATIVE_FIXTURE_RULES.has(fixture.expected_rules[0]));
    assert.ok(fs.existsSync(path.resolve(manifestDir, fixture.input.path)));
  }
});

test("fixture smoke command reports declared fixture and golden export coverage as JSON", () => {
  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const positiveFixtures = fixtureManifest.fixtures.filter((fixture) => fixture.kind === "positive");
  const negativeFixtures = fixtureManifest.fixtures.filter((fixture) => fixture.kind === "negative");
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
  assert.equal(report.summary.kind.positive, 9);
  assert.equal(report.summary.kind.negative, 5);
  assert.equal(report.summary.expected_status.pass, positiveFixtures.length);
  assert.equal(report.summary.expected_status.fail, negativeFixtures.length);
  assert.equal(report.summary.expected_status.warn, 0);
  assert.equal(report.summary.expected_rules, 5);
  assert.equal(report.summary.golden_exports, 9);
  assert.deepEqual(report.issues, []);
});

test("conformance manifest schema and report schema are checked in", () => {
  const manifestSchema = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "schema", "conformance-manifest.schema.json"), "utf8"));
  const reportSchema = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "schema", "conformance-report.schema.json"), "utf8"));
  const conformanceManifest = JSON.parse(fs.readFileSync(CONFORMANCE_MANIFEST_PATH, "utf8"));

  assert.equal(manifestSchema.title, "AODS Conformance Manifest");
  assert.equal(reportSchema.title, "AODS Conformance Report");
  assert.equal(conformanceManifest.aods_conformance_manifest_v, 0);
  assert.equal(conformanceManifest.suite_id, "compiled-pilot-fixture-conformance");
  assert.ok(conformanceManifest.cases.some((testCase) => testCase.kind === "fixture-smoke"));
  assert.ok(conformanceManifest.cases.some((testCase) => testCase.kind === "validate"));
});

test("conformance runner consumes declared fixture and validate cases without arbitrary commands", () => {
  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", CONFORMANCE_MANIFEST_PATH, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);

  assert.equal(report.action, "conformance run");
  assert.equal(report.status, "pass");
  assert.equal(report.accepted, true);
  assert.equal(report.suite_id, "compiled-pilot-fixture-conformance");
  assert.equal(report.summary.cases, 4);
  assert.equal(report.summary.passed, 4);
  assert.equal(report.summary.failed, 0);
  assert.equal(report.summary.expected_failures, 2);
  assert.deepEqual(report.issues, []);
  assert.ok(report.cases.some((testCase) => testCase.id === "compiled-pilot-strict-reality"));
});

test("conformance manifest and report match their checked-in schemas", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const manifestSchema = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "schema", "conformance-manifest.schema.json"), "utf8"));
  const reportSchema = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "schema", "conformance-report.schema.json"), "utf8"));
  const conformanceManifest = JSON.parse(fs.readFileSync(CONFORMANCE_MANIFEST_PATH, "utf8"));

  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", CONFORMANCE_MANIFEST_PATH, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);

  assert.equal(ajv.validate(manifestSchema, conformanceManifest), true, JSON.stringify(ajv.errors, null, 2));
  assert.equal(ajv.validate(reportSchema, report), true, JSON.stringify(ajv.errors, null, 2));
});

test("conformance runner rejects arbitrary command-shaped manifest properties", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-conformance-non-execution-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const markerPath = path.join(tempDir, "command-executed");
  const conformanceManifest = JSON.parse(fs.readFileSync(CONFORMANCE_MANIFEST_PATH, "utf8"));
  conformanceManifest.cases = [
    {
      ...conformanceManifest.cases[0],
      command: `node -e "require('fs').writeFileSync(${JSON.stringify(markerPath)}, 'executed')"`
    }
  ];
  const tempManifestPath = path.join(tempDir, "conformance-manifest.json");
  fs.writeFileSync(tempManifestPath, `${JSON.stringify(conformanceManifest, null, 2)}\n`);

  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", tempManifestPath, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(markerPath), false);
  const report = JSON.parse(result.stdout);
  assert.equal(report.action, "conformance run");
  assert.equal(report.status, "fail");
  assert.equal(report.accepted, false);
  assert.ok(report.issues.some((issue) => issue.rule === "conformance-manifest-property"));
});

test("conformance runner reports expected-rules mismatch details", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-conformance-rules-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const conformanceManifest = JSON.parse(fs.readFileSync(CONFORMANCE_MANIFEST_PATH, "utf8"));
  conformanceManifest.cases = [
    {
      ...conformanceManifest.cases.find((testCase) => testCase.id === "negative-fixture-invalid-kind"),
      target: {
        path: path.join(
          REPO_ROOT,
          "examples",
          "compiled-pilot-source",
          "fixtures",
          "negative",
          "fixture-contract",
          "invalid-kind.json"
        )
      },
      expected: {
        status: "fail",
        rules: ["fixture-input-path"]
      }
    }
  ];
  const tempManifestPath = path.join(tempDir, "conformance-manifest.json");
  fs.writeFileSync(tempManifestPath, `${JSON.stringify(conformanceManifest, null, 2)}\n`);

  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", tempManifestPath, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.notEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "fail");
  assert.equal(report.summary.failed, 1);
  assert.deepEqual(report.cases[0].missing_rules, ["fixture-input-path"]);
  assert.deepEqual(report.cases[0].unexpected_rules, ["fixture-kind"]);
  assert.ok(report.issues.some((issue) => issue.rule === "conformance-case-result"));
});

test("conformance runner supports warn expectations as an explicit design state", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-conformance-warn-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const conformanceManifest = JSON.parse(fs.readFileSync(CONFORMANCE_MANIFEST_PATH, "utf8"));
  conformanceManifest.cases = [
    {
      ...conformanceManifest.cases[0],
      target: {
        path: FIXTURE_MANIFEST_PATH
      },
      expected: {
        status: "warn",
        rules: []
      }
    }
  ];
  const tempManifestPath = path.join(tempDir, "conformance-manifest.json");
  fs.writeFileSync(tempManifestPath, `${JSON.stringify(conformanceManifest, null, 2)}\n`);

  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", tempManifestPath, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.notEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.cases[0].expected_status, "warn");
  assert.equal(report.cases[0].status, "pass");
  assert.ok(report.issues.some((issue) => issue.rule === "conformance-case-result"));
});

test("conformance validate failing-corpus cases expose validation rules", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-conformance-validate-fail-"));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const conformanceManifest = {
    aods_conformance_manifest_v: 0,
    suite_id: "validate-failing-corpus",
    cases: [
      {
        id: "empty-corpus-fails-validation",
        kind: "validate",
        target: {
          path: "empty-corpus",
          strict: true
        },
        expected: {
          status: "fail",
          rules: ["manifest-exists", "manifest-schema-exists", "module-schema-exists"]
        }
      }
    ]
  };
  fs.mkdirSync(path.join(tempDir, "empty-corpus"));
  const tempManifestPath = path.join(tempDir, "conformance-manifest.json");
  fs.writeFileSync(tempManifestPath, `${JSON.stringify(conformanceManifest, null, 2)}\n`);

  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", tempManifestPath, "--json"],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.expected_failures, 1);
  assert.deepEqual(report.cases[0].matched_rules, ["manifest-exists", "manifest-schema-exists", "module-schema-exists"]);
});

test("conformance text output keeps the stable smoke fields", () => {
  const result = spawnSync(
    "node",
    [CLI_PATH, "conformance", "run", CONFORMANCE_MANIFEST_PATH],
    { cwd: REPO_ROOT, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /^PASS conformance run /);
  assert.match(result.stdout, /suite: compiled-pilot-fixture-conformance/);
  assert.match(result.stdout, /cases: 4/);
  assert.match(result.stdout, /passed: 4/);
  assert.match(result.stdout, /failed: 0/);
});

test("negative fixture contract inputs fail with expected smoke rules", () => {
  const fixtureManifest = JSON.parse(fs.readFileSync(FIXTURE_MANIFEST_PATH, "utf8"));
  const manifestDir = path.dirname(FIXTURE_MANIFEST_PATH);
  const negativeFixtures = fixtureManifest.fixtures.filter((fixture) => fixture.kind === "negative");

  for (const fixture of negativeFixtures) {
    const result = spawnSync(
      "node",
      [CLI_PATH, "fixture", "smoke", path.resolve(manifestDir, fixture.input.path), "--json"],
      { cwd: REPO_ROOT, encoding: "utf8" }
    );

    assert.notEqual(result.status, 0, `${fixture.id} unexpectedly passed`);
    const report = JSON.parse(result.stdout);
    assert.equal(report.action, "fixture smoke");
    assert.equal(report.status, "fail");
    assert.equal(report.accepted, false);
    assert.deepEqual(
      [...new Set(report.issues.map((issue) => issue.rule))].sort(),
      [...fixture.expected_rules].sort()
    );
    for (const expectedRule of fixture.expected_rules) {
      assert.ok(
        report.issues.some((issue) => issue.rule === expectedRule),
        `${fixture.id} did not report ${expectedRule}`
      );
    }
  }
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
