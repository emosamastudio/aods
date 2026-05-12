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
  assert.match(skillText, /boot_by_touch/);
  assert.doesNotMatch(skillText, /boot\.by_touch/);

  assert.ok(skillMeta.positive_triggers.some((item) => item.includes("surface_pairs")));
  assert.ok(skillMeta.positive_triggers.some((item) => item.includes("boot_by_touch")));
  assert.ok(skillMeta.positive_triggers.every((item) => !item.includes("boot.by_touch")));
  assert.ok(skillMeta.negative_triggers.some((item) => item.includes("generic README")));

  assert.equal(packageJson.scripts["help"], "node ./bin/aods.mjs --help");
  assert.equal(packageJson.scripts["upgrade"], "node ./bin/aods.mjs upgrade .");
  assert.equal(packageJson.scripts["release:hygiene"], "node ./scripts/release-hygiene.mjs");
  assert.match(skillText, /aods --help/);
  assert.match(skillText, /aods upgrade/);
});

test("release self-check keeps public version surfaces aligned", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const packageLock = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package-lock.json"), "utf8"));
  const readme = fs.readFileSync(path.join(REPO_ROOT, "README.md"), "utf8");
  const readmeZh = fs.readFileSync(path.join(REPO_ROOT, "README.zh-CN.md"), "utf8");
  const version = packageJson.version;
  const releaseTag = `v${version}`;

  assert.equal(packageJson.scripts["release:self-check"], "npm run validate:repo && npm pack --dry-run");
  assert.equal(packageLock.version, version);
  assert.equal(packageLock.packages[""].version, version);

  assert.ok(readme.includes(`**Latest release:** \`${releaseTag}\``));
  assert.ok(readme.includes(`npm install --save-dev git+https://github.com/emosamastudio/aods.git#${releaseTag}`));
  assert.ok(readme.includes(`Git tags and package releases such as \`${releaseTag}\``));

  assert.ok(readmeZh.includes(`**当前最新版本：** \`${releaseTag}\``));
  assert.ok(readmeZh.includes(`npm install --save-dev git+https://github.com/emosamastudio/aods.git#${releaseTag}`));
  assert.ok(readmeZh.includes(`Git tag / package release，例如 \`${releaseTag}\``));
});
