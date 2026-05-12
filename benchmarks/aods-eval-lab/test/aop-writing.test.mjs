import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const AOP_PATH = path.join(REPO_ROOT, "spec", "aop-writing-spec.json");

test("AOP defines agent-primary density guidance examples", () => {
  const module = JSON.parse(fs.readFileSync(AOP_PATH, "utf8"));

  const section = module.sections.find((entry) => entry.sid === "agent-primary-density-examples");
  assert.ok(section);
  assert.match(section.content, /canonical terms/);
  assert.match(section.content, /explicit constraints/);
  assert.match(section.content, /uncertainty markers/);
  assert.match(section.content, /good\/bad examples/);
  assert.match(section.content, /does not introduce style linter/);
  assert.match(section.content, /does not rewrite documentation portal/);

  const guidance = module.artifacts.find((entry) => entry.artifact_id === "aop-authoring-guidance-table");
  assert.ok(guidance);
  assert.deepEqual(guidance.content.rows.map((row) => row[0]), [
    "canonical_terms",
    "explicit_constraints",
    "uncertainty_markers",
    "labeled_examples"
  ]);

  const examples = module.artifacts.find((entry) => entry.artifact_id === "aop-good-bad-example-table");
  assert.ok(examples);
  assert.equal(examples.content.columns[0], "pattern");
  assert.equal(examples.content.columns[1], "bad");
  assert.equal(examples.content.columns[2], "good");
  assert.ok(examples.content.rows.some((row) => row[0] === "canonical_terms"));
  assert.ok(examples.content.rows.some((row) => row[0] === "explicit_constraints"));
  assert.ok(examples.content.rows.some((row) => row[0] === "uncertainty_markers"));
});
