#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const jsonMode = process.argv.includes("--json");
const GENERATED_PATHS = [
  "benchmarks/aods-eval-lab/generated",
  "benchmarks/aods-eval-lab/reports",
  "examples/compiled-pilot"
];

const output = execFileSync("git", ["status", "--porcelain", "--", ...GENERATED_PATHS], {
  encoding: "utf8"
});
const dirty = output
  .split("\n")
  .map((line) => line.trimEnd())
  .filter(Boolean);
const result = {
  checked_paths: GENERATED_PATHS,
  dirty_entries: dirty
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`generated hygiene check: dirty_entries=${dirty.length}`);
  for (const entry of dirty) console.error(entry);
}

if (dirty.length > 0) {
  process.exitCode = 1;
}
