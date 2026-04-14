#!/usr/bin/env node

import { runHookCommand } from "../lib/hook.mjs";
import { runRouteCommand } from "../lib/route.mjs";
import { runScaffoldCommand } from "../lib/scaffold.mjs";
import { runUpgradeCommand } from "../lib/upgrade.mjs";
import { runValidateCommand } from "../lib/validate.mjs";

function printUsage() {
  console.log(`AODS CLI

Usage:
  aods validate [root] [--json] [--strict]
  aods route [root] [--role <role-id>] [--touch <path>] [--intent <intent>] [--json]
  aods hook pre-commit [root] [--staged] [--repo-root <path>] [--file <path>]... [--json]
  aods upgrade [root] [--json] [--dry-run] [--no-bump]
  aods scaffold corpus <target-dir> --sys <system-id> [--purpose <text>] [--force]
  aods scaffold module <corpus-root> <module-id> [--path <relative-path>] [--category <category>] [--layer <layer>] [--scope <text>] [--priority <priority>] [--tag <tag>]... [--dep <module-id>]... [--route <target>]... [--boot] [--force]

Commands:
  validate   Validate AODS corpus rooted at [root]. Default: current directory.
  route      Resolve minimal module load set for a role and/or touched file.
  hook       Run hookable enforcement helpers such as pre-commit validation.
  upgrade    Sync schemas and refresh manifest metadata for an existing corpus.
  scaffold   Generate new corpus or module skeletons.

Flags:
  --json     Emit JSON report matching validation report shape.
  --strict   Exit non-zero on warnings as well as errors.
  -h, --help Show help.
`);
}

async function main(argv) {
  const [command, ...args] = argv;

  if (!command || command === "-h" || command === "--help") {
    printUsage();
    return;
  }

  try {
    if (command === "validate") {
      const exitCode = await runValidateCommand(args);
      process.exitCode = exitCode;
      return;
    }

    if (command === "route") {
      const exitCode = await runRouteCommand(args);
      process.exitCode = exitCode;
      return;
    }

    if (command === "hook") {
      const exitCode = await runHookCommand(args);
      process.exitCode = exitCode;
      return;
    }

    if (command === "upgrade") {
      const exitCode = await runUpgradeCommand(args);
      process.exitCode = exitCode;
      return;
    }

    if (command === "scaffold") {
      const exitCode = await runScaffoldCommand(args);
      process.exitCode = exitCode;
      return;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exitCode = 1;
}

await main(process.argv.slice(2));
