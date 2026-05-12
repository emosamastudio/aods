#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const STEPS = [
  ["npm", ["run", "docs:check-links"]],
  ["npm", ["run", "security:scan-placeholders"]],
  ["npm", ["run", "package:check-surface"]],
  ["npm", ["run", "generated:check-clean"]],
  ["node", ["--test", "benchmarks/aods-eval-lab/test/skill-package.test.mjs"]],
  ["npm", ["run", "validate:all"]]
];

for (const [command, args] of STEPS) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nrelease hygiene: PASS");
