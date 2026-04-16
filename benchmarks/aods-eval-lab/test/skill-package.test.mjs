import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

test("aods-use skill stays release-aligned and keeps a narrow trigger contract", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const skillMeta = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "skills", "aods-use", "skill.json"), "utf8")
  );
  const skillText = fs.readFileSync(path.join(REPO_ROOT, "skills", "aods-use", "SKILL.md"), "utf8");

  assert.equal(skillMeta.name, "aods-use");
  assert.equal(skillMeta.skill_version, packageJson.version);
  assert.equal(skillMeta.aligned_release, `v${packageJson.version}`);
  assert.deepEqual(skillMeta.compatibility, {
    aods_v: 3,
    authoring_v: 1
  });
  assert.equal(skillMeta.entrypoint, "SKILL.md");

  assert.match(skillText, /Use when working in an AODS-enabled repo/);
  assert.match(skillText, /Detect source-first vs compiled-corpus-first/);
  assert.match(skillText, /Expected trigger:/);
  assert.match(skillText, /Expected first action:/);
  assert.match(skillText, /Negative trigger:/);
  assert.match(skillText, /Observed result after edit:/);

  assert.ok(skillMeta.positive_triggers.some((item) => item.includes("surface_pairs")));
  assert.ok(skillMeta.negative_triggers.some((item) => item.includes("generic README")));
});
