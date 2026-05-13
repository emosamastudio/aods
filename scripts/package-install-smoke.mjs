#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const jsonMode = process.argv.includes("--json");

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });
}

function runCli(bin, args, cwd) {
  return run(bin, args, { cwd }).trim();
}

const packOutput = run("npm", ["pack", "--json"]);
const [pack] = JSON.parse(packOutput);
const tarball = path.resolve(pack.filename);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-package-install-smoke-"));

try {
  run("npm", ["init", "-y"], { cwd: tempDir });
  run("npm", ["install", "--silent", "--no-audit", "--no-fund", tarball], { cwd: tempDir });

  const bin = path.join(tempDir, "node_modules", ".bin", process.platform === "win32" ? "aods.cmd" : "aods");
  const version = runCli(bin, ["--version"], tempDir);
  const help = runCli(bin, ["--help"], tempDir);
  const validate = runCli(bin, ["validate", "./node_modules/aods/examples/compiled-pilot", "--strict", "--json"], tempDir);
  const route = runCli(
    bin,
    [
      "route",
      "./node_modules/aods/examples/compiled-pilot",
      "--query",
      "adapter capability fallback metadata",
      "--intent",
      "read",
      "--stage",
      "orientation",
      "--json"
    ],
    tempDir
  );

  const validateReport = JSON.parse(validate);
  const routeReport = JSON.parse(route);
  const result = {
    package: pack.id,
    tarball: pack.filename,
    temp_dir: tempDir,
    version,
    help_includes_version: help.includes("aods --version"),
    validate_status: validateReport.status,
    route_strategy: routeReport.strategy,
    selected_modules: routeReport.recommended_modules?.map((module) => module.id) ?? []
  };

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `package install smoke: package=${result.package} version=${version} validate=${result.validate_status} route=${result.route_strategy}`
    );
  }

  if (
    version !== pack.version ||
    !result.help_includes_version ||
    validateReport.status !== "pass" ||
    routeReport.strategy !== "query-route" ||
    result.selected_modules.length === 0
  ) {
    process.exitCode = 1;
  }
} finally {
  fs.rmSync(tarball, { force: true });
  if (!process.argv.includes("--keep-temp")) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
