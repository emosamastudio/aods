#!/usr/bin/env node

import { runCompileCommand } from "../lib/compile.mjs";
import { runConformanceCommand } from "../lib/conformance.mjs";
import { runFixtureCommand } from "../lib/fixture-smoke.mjs";
import { runHookCommand } from "../lib/hook.mjs";
import { runRouteCommand } from "../lib/route.mjs";
import { runScaffoldCommand } from "../lib/scaffold.mjs";
import { runUpgradeCommand } from "../lib/upgrade.mjs";
import { runValidateCommand } from "../lib/validate.mjs";

function printUsage() {
  console.log(`AODS CLI

Usage:
  aods validate [root] [--json] [--strict] [--reality] [--repo-root <path>]
  aods route [root] [--role <role-id>] [--touch <path>] [--query <text>] [--stage <stage>] [--intent <intent>] [--json]
  aods hook pre-commit [root] [--staged] [--repo-root <path>] [--file <path>]... [--json]
  aods upgrade [root] [--json] [--dry-run] [--no-bump]
  aods compile <source-file> <target-dir> [--json] [--strict] [--force]
  aods conformance run <conformance-manifest> [--json]
  aods fixture smoke <fixture-manifest> [--json]
  aods scaffold corpus <target-dir> --sys <system-id> [--purpose <text>] [--force]
  aods scaffold authoring <target-dir> --sys <system-id> [--purpose <text>] [--force]
  aods scaffold module <corpus-root> <module-id> [--path <relative-path>] [--category <category>] [--layer <layer>] [--pattern <pattern>] [--scope <text>] [--priority <priority>] [--tag <tag>]... [--dep <module-id>]... [--route <target>]... [--boot] [--force]
  aods scaffold authoring-module <source-file> <module-id> [--path <relative-path>] [--category <category>] [--layer <layer>] [--pattern <pattern>] [--scope <text>] [--priority <priority>] [--tag <tag>]... [--dep <module-id>]... [--role <role-id>]... [--route <target>]... [--boot] [--force]
  aods scaffold authoring-touch <source-file> --match <path> --load <module-id>... [--intent <intent>] [--reason <text>] [--force]
  aods scaffold authoring-pair <source-file> --pair-id <pair-id> --agent-primary <module-id> --human-primary <path> [--agent-supporting <module-id>]... [--human-supporting <path>]... [--scope <scope>] [--sync-source <sync-source>] [--status <status>] [--source-path <relative-path>] [--generated-profile <profile>] [--generated-mode <mode>] [--generated-title <text>] [--route-intent <intent>] [--route-reason <text>] [--force]

Commands:
  validate   Validate AODS corpus rooted at [root]. Default: current directory.
  route      Resolve minimal module load set for a role, touched file, lexical query, and optional task stage.
  hook       Run hookable enforcement helpers such as pre-commit validation.
  upgrade    Sync schemas and refresh manifest metadata for an existing corpus.
  compile    Compile concise authoring JSON into an AODS corpus and optionally fail on warnings.
  conformance Run declared fixture-smoke and validate cases without arbitrary command execution.
  fixture   Check fixture manifest contracts and declared input/golden paths.
  scaffold   Generate new corpus, authoring source, compiled-corpus modules, or safe authoring-source mutations.

Flags:
  --json     Emit JSON report matching validation report shape.
  --strict   Exit non-zero on warnings as well as errors.
  --reality  Run opt-in surface reality checks for declared current surfaces.
  --repo-root Resolve repo-based surface-inventory checks from this path. Ignored for base=corpus. Default: corpus root.
  --stage    Route with explicit task stage: orientation | plan | action | verification | evidence.
  -h, --help Show help.

Allowed values:
  module category: architecture | protocol | schema | workflow | policy | config | reference | artifact | capsule
  module layer: root | capsule | detail | evidence
  module priority: critical | standard | supplementary
  module scaffold pattern: implementation-governance
  route intent: any | read | write | validate | sync
  pair scope: system | phase | feature | module
  pair sync_source: agent-primary | human-primary | bidirectional
  pair status: paired | draft | deprecated
  pair generated mode: deterministic
  pair generated profile: overview | checklist
  surface inventory base: corpus | repo
  surface inventory state: current | reserved | future
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

    if (command === "compile") {
      const exitCode = await runCompileCommand(args);
      process.exitCode = exitCode;
      return;
    }

    if (command === "conformance") {
      const exitCode = await runConformanceCommand(args);
      process.exitCode = exitCode;
      return;
    }

    if (command === "fixture") {
      const exitCode = await runFixtureCommand(args);
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
