import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const CLI_PATH = path.join(REPO_ROOT, "bin", "aods.mjs");

function runCli(args) {
  return execFileSync("node", [CLI_PATH, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
}

test("CLI help and compile errors expose allowed enum values", () => {
  const help = runCli(["--help"]);
  assert.match(help, /authoring-module/);
  assert.match(help, /aods compile <source-file> <target-dir> \[--json\] \[--strict\] \[--force\]/);
  assert.match(help, /module category: architecture \| protocol \| schema \| workflow \| policy \| config \| reference \| artifact \| capsule/);
  assert.match(help, /module scaffold pattern: implementation-governance/);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-discoverability-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const invalidPattern = spawnSync("node", [
    CLI_PATH,
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-governance",
    "--pattern",
    "governance-kit"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(invalidPattern.status, 0);
  assert.match(invalidPattern.stderr, /module scaffold pattern/);
  assert.match(invalidPattern.stderr, /implementation-governance/);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.modules[0].category = "plan";
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const result = spawnSync("node", [CLI_PATH, "compile", sourcePath, path.join(tempDir, "compiled"), "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Received: "plan"/);
  assert.match(result.stderr, /Allowed values:/);
  assert.match(result.stderr, /"architecture"/);
});

test("compile --strict turns warning-only output into a failing gate", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-compile-strict-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-log",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-LOG.md"
  ]);

  const cleanCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-clean"),
    "--force",
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(cleanCompile.status, 0);
  assert.match(cleanCompile.stdout, /OK compile corpus/);
  assert.doesNotMatch(cleanCompile.stdout, /strict gate blocked by warnings/);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.surface_pairs[0].sync_source = "bidirectional";
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const warningCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-warning"),
    "--force"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(warningCompile.status, 0);
  assert.match(warningCompile.stdout, /WARN compile corpus/);
  assert.match(warningCompile.stdout, /surface-pair-bidirectional-sync/);

  const strictCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-strict"),
    "--force",
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictCompile.status, 0);
  assert.match(strictCompile.stdout, /FAIL compile corpus/);
  assert.match(strictCompile.stdout, /strict gate blocked by warnings/);
  assert.match(strictCompile.stdout, /target not updated because strict gate failed/);
  assert.match(strictCompile.stdout, /surface-pair-bidirectional-sync/);
  assert.equal(fs.existsSync(path.join(tempDir, "compiled-strict", "manifest.json")), false);

  const preservedRoot = path.join(tempDir, "compiled-preserved");
  fs.mkdirSync(preservedRoot, { recursive: true });
  fs.writeFileSync(path.join(preservedRoot, "sentinel.txt"), "keep me");
  const preservedCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    preservedRoot,
    "--force",
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(preservedCompile.status, 0);
  assert.equal(fs.readFileSync(path.join(preservedRoot, "sentinel.txt"), "utf8"), "keep me");
  assert.equal(fs.existsSync(path.join(preservedRoot, "manifest.json")), false);

  const strictJsonCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-strict-json"),
    "--force",
    "--strict",
    "--json"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictJsonCompile.status, 0);
  const strictJson = JSON.parse(strictJsonCompile.stdout);
  assert.equal(strictJson.strict, true);
  assert.equal(strictJson.status, "fail");
  assert.equal(strictJson.accepted, false);
  assert.equal(strictJson.written, false);
  assert.deepEqual(strictJson.created_files, []);
  assert.equal(strictJson.validation.errors, 0);
  assert.ok(strictJson.validation.warnings > 0);
});

test("authoring scaffold helpers update source, pair surfaces, and compile successfully", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-authoring-scaffold-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority",
    "--role",
    "doc-author"
  ]);
  runCli([
    "scaffold",
    "authoring-touch",
    sourcePath,
    "--match",
    "package.json",
    "--load",
    "demo-system-root",
    "--load",
    "delivery-gates",
    "--intent",
    "write"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-log",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-LOG.md"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  assert.ok(source.modules.some((module) => module.id === "delivery-gates"));
  assert.ok(
    source.boot.by_touch.some(
      (route) =>
        route.match === "package.json" &&
        route.intent === "write" &&
        route.load_modules.includes("delivery-gates")
    )
  );
  assert.ok(
    source.boot.by_touch.some(
      (route) =>
        route.match === "DELIVERY-LOG.md" &&
        route.intent === "write" &&
        route.load_modules.includes("delivery-gates")
    )
  );
  assert.ok(
    source.surface_pairs.some(
      (pair) => pair.pair_id === "pair-delivery-log" && pair.agent_primary === "delivery-gates"
    )
  );
  assert.ok(source.files.some((file) => file.path === "DELIVERY-LOG.md"));
  assert.ok(fs.existsSync(path.join(tempDir, "DELIVERY-LOG.md")));
  assert.ok(
    source.corpus.roles
      .find((role) => role.id === "doc-author")
      .required_modules.includes("delivery-gates")
  );

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);
});

test("implementation-governance pattern scaffolds delivery-governor artifacts", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-governance-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "release-governance",
    "--pattern",
    "implementation-governance",
    "--role",
    "doc-author"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const module = source.modules.find((entry) => entry.id === "release-governance");

  assert.ok(module);
  assert.equal(module.category, "policy");
  assert.equal(module.layer, "detail");
  assert.ok(module.tags.includes("implementation"));
  assert.ok(module.tags.includes("review"));
  assert.ok(module.sections.some((section) => section.sid === "implementation-governance"));
  assert.ok(module.sections.some((section) => section.sid === "review-routing-policy"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "implementation-matrix" && artifact.type === "mapping-table"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "system-gates" && artifact.type === "rule-set"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "runtime-contract-table" && artifact.type === "mapping-table"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "review-routing" && artifact.type === "decision-tree"));
  assert.deepEqual(module.meta.control.timing, ["pre-commit", "ci", "runtime"]);
  assert.equal(module.meta.runtime_contract.side_effects[0], "release-gate-decision");
  assert.ok(
    source.corpus.roles
      .find((role) => role.id === "doc-author")
      .required_modules.includes("release-governance")
  );

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);
});

test("authoring-pair can declare deterministic generated human output", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-generated-pair-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-guide",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-GUIDE.md",
    "--generated-profile",
    "overview",
    "--generated-title",
    "Delivery Guide"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const pair = source.surface_pairs.find((entry) => entry.pair_id === "pair-delivery-guide");
  assert.equal(pair.human_generation.mode, "deterministic");
  assert.equal(pair.human_generation.profile, "overview");
  assert.equal(pair.human_generation.title, "Delivery Guide");
  assert.equal(source.files?.some((file) => file.path === "DELIVERY-GUIDE.md"), false);
  assert.ok(
    source.boot.by_touch.some(
      (route) =>
        route.match === "DELIVERY-GUIDE.md" &&
        route.intent === "write" &&
        route.load_modules.includes("delivery-gates")
    )
  );

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);

  const generatedPath = path.join(compiledRoot, "DELIVERY-GUIDE.md");
  assert.ok(fs.existsSync(generatedPath));
  const generatedText = fs.readFileSync(generatedPath, "utf8");
  assert.match(generatedText, /AODS GENERATED: pair_id=pair-delivery-guide mode=deterministic profile=overview/);
  assert.match(generatedText, /# Delivery Guide/);
  assert.match(generatedText, /Generated deterministically from AODS agent-primary authority/);

  fs.writeFileSync(generatedPath, `${generatedText}manual drift\n`);
  const driftResult = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--strict"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(driftResult.status, 0);
  assert.match(
    `${driftResult.stdout}\n${driftResult.stderr}`,
    /generated human_primary is out of sync with deterministic render/
  );
});
