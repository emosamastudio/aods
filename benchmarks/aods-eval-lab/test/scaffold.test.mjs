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
  assert.match(help, /module category: architecture \| protocol \| schema \| workflow \| policy \| config \| reference \| artifact \| capsule/);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-discoverability-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
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
