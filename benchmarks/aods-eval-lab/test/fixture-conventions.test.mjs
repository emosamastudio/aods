import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

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
