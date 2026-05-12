#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const jsonMode = process.argv.includes("--json");

const EXPECTED_PACKAGE_FILES = [
  "LICENSE",
  "README.md",
  "README.zh-CN.md",
  "bin/aods.mjs",
  "examples/compiled-pilot-source/README.md",
  "examples/compiled-pilot-source/authoring.json",
  "examples/compiled-pilot-source/fixtures/conformance-manifest.json",
  "examples/compiled-pilot-source/fixtures/fixture-manifest.json",
  "examples/compiled-pilot-source/fixtures/negative/fixture-contract/input.json",
  "examples/compiled-pilot-source/fixtures/negative/fixture-contract/invalid-kind.json",
  "examples/compiled-pilot-source/fixtures/negative/fixture-contract/missing-golden-path.json",
  "examples/compiled-pilot-source/fixtures/negative/fixture-contract/missing-input-path.json",
  "examples/compiled-pilot-source/fixtures/negative/fixture-contract/negative-without-expected-rules.json",
  "examples/compiled-pilot-source/fixtures/negative/fixture-contract/positive-with-expected-rules.json",
  "examples/compiled-pilot/README.md",
  "examples/compiled-pilot/indexes/runtime.json",
  "examples/compiled-pilot/manifest.json",
  "examples/compiled-pilot/modules/shift-ops-adapter-capability.json",
  "examples/compiled-pilot/modules/shift-ops-artifact-export-policy.json",
  "examples/compiled-pilot/modules/shift-ops-capsule.json",
  "examples/compiled-pilot/modules/shift-ops-change-command.json",
  "examples/compiled-pilot/modules/shift-ops-change-event-log.json",
  "examples/compiled-pilot/modules/shift-ops-governance.json",
  "examples/compiled-pilot/modules/shift-ops-policy.json",
  "examples/compiled-pilot/modules/shift-ops-readiness-read-model.json",
  "examples/compiled-pilot/modules/shift-ops-resource-surface.json",
  "examples/compiled-pilot/modules/shift-ops-root.json",
  "examples/compiled-pilot/modules/shift-ops-runbook.json",
  "examples/compiled-pilot/schema/manifest-companion.schema.json",
  "examples/compiled-pilot/schema/manifest.schema.json",
  "examples/compiled-pilot/schema/module.schema.json",
  "lib/claim-diff.mjs",
  "lib/compile.mjs",
  "lib/conformance.mjs",
  "lib/corpus-helpers.mjs",
  "lib/fixture-smoke.mjs",
  "lib/hook.mjs",
  "lib/human-surface.mjs",
  "lib/manifest-runtime.mjs",
  "lib/query-route.mjs",
  "lib/route.mjs",
  "lib/scaffold.mjs",
  "lib/upgrade.mjs",
  "lib/validate.mjs",
  "manifest.json",
  "package.json",
  "schema/authoring.schema.json",
  "schema/conformance-manifest.schema.json",
  "schema/conformance-report.schema.json",
  "schema/manifest-companion.schema.json",
  "schema/manifest.schema.json",
  "schema/module.schema.json",
  "skills/aods-use/SKILL.md",
  "skills/aods-use/skill.json",
  "spec/aop-writing-spec.json",
  "spec/artifact-types.json",
  "spec/authority-governance.json",
  "spec/boot-protocol.json",
  "spec/stable-surface-contracts.json",
  "spec/surface-governance.json",
  "spec/validation-rules.json"
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});
const [pack] = JSON.parse(output);
const actual = pack.files.map((file) => file.path).sort();
const expected = [...EXPECTED_PACKAGE_FILES].sort();
const unexpected = actual.filter((file) => !expected.includes(file));
const missing = expected.filter((file) => !actual.includes(file));
const result = {
  package: pack.id,
  entry_count: actual.length,
  expected_entry_count: expected.length,
  missing,
  unexpected
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    `package surface check: package=${result.package} entry_count=${result.entry_count} missing=${missing.length} unexpected=${unexpected.length}`
  );
  for (const file of missing) console.error(`missing package entry: ${file}`);
  for (const file of unexpected) console.error(`unexpected package entry: ${file}`);
}

if (missing.length > 0 || unexpected.length > 0) {
  process.exitCode = 1;
}
