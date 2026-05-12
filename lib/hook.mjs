import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { getManifestCompanionPath, getManifestRuntime, getModulePath } from "./manifest-runtime.mjs";
import { hasGeneratedHumanPrimary, renderGeneratedHumanPrimary } from "./human-surface.mjs";
import { printReport, validateCorpus } from "./validate.mjs";

const GLOBAL_PREFIXES = ["bin/", "lib/", "schema/", ".githooks/"];
const GLOBAL_FILES = new Set(["package.json", "package-lock.json"]);

export async function runHookCommand(argv) {
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    printHookUsage();
    return 0;
  }

  const [hookName, ...args] = argv;
  if (hookName !== "pre-commit") {
    throw new Error(`Unknown hook subcommand: ${hookName ?? "(missing)"}`);
  }

  const options = parseArgs(args);
  const packageRoot = path.resolve(options.root);
  const repoRoot = path.resolve(options.repoRoot || packageRoot);
  const corpora = discoverCorpora(packageRoot);
  const changedFiles = collectChangedFiles(options, repoRoot, packageRoot);

  if (changedFiles.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ hook: "pre-commit", status: "skipped", reason: "no-relevant-files" }, null, 2));
    } else {
      console.log("SKIP hook pre-commit");
      console.log("reason=no relevant AODS files changed");
    }
    return 0;
  }

  const corporaToValidate = determineCorporaToValidate(changedFiles, corpora, packageRoot);
  if (corporaToValidate.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ hook: "pre-commit", status: "skipped", reason: "no-corpora-selected" }, null, 2));
    } else {
      console.log("SKIP hook pre-commit");
      console.log("reason=no AODS corpora selected");
    }
    return 0;
  }

  const results = [];
  let hasErrors = false;
  let hasWarnings = false;

  if (!options.json) {
    console.log(`HOOK pre-commit root=${packageRoot}`);
    console.log(`files=${changedFiles.length} corpora=${corporaToValidate.length}`);
  }

  for (const corpusRoot of corporaToValidate) {
    const report = validateCorpus(corpusRoot);
    const hookIssues = evaluateSurfaceDrift(corpusRoot, packageRoot, changedFiles);
    results.push({
      corpus: corpusRoot,
      report,
      hook_issues: hookIssues
    });
    hasErrors ||= report.summary.errors > 0;
    hasWarnings ||= report.summary.warnings > 0;
    hasErrors ||= hookIssues.some((issue) => issue.severity === "error");
    hasWarnings ||= hookIssues.some((issue) => issue.severity === "warning");
    if (!options.json) {
      printReport(report, corpusRoot);
      printHookIssues(corpusRoot, hookIssues);
    }
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          hook: "pre-commit",
          status: hasErrors || (options.strict && hasWarnings) ? "fail" : "pass",
          changed_files: changedFiles,
          corpora: results
        },
        null,
        2
      )
    );
  }

  return hasErrors || (options.strict && hasWarnings) ? 1 : 0;
}

function printHookUsage() {
  console.log(`AODS hook

Usage:
  aods hook pre-commit [root] [--staged] [--repo-root <path>] [--file <path>]... [--json] [--no-strict]

Commands:
  pre-commit  Run pre-commit validation and paired-surface drift checks.

Flags:
  --staged     Inspect staged git changes.
  --repo-root  Resolve changed files from this git repository root.
  --file       Check an explicit file path. May be repeated.
  --json       Emit JSON hook report.
  --no-strict  Do not fail on warnings.
  -h, --help   Show help.
`);
}

function parseArgs(argv) {
  const options = {
    root: ".",
    repoRoot: "",
    staged: false,
    strict: true,
    json: false,
    files: []
  };

  const queue = [...argv];
  if (queue.length > 0 && !queue[0].startsWith("-")) {
    options.root = queue.shift();
  }

  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--repo-root") {
      options.repoRoot = requireValue(arg, queue);
      continue;
    }
    if (arg === "--staged") {
      options.staged = true;
      continue;
    }
    if (arg === "--file") {
      options.files.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--no-strict") {
      options.strict = false;
      continue;
    }
    throw new Error(`Unknown hook arg: ${arg}`);
  }

  return options;
}

function collectChangedFiles(options, repoRoot, packageRoot) {
  const explicitFiles = options.files
    .map((filePath) => mapExplicitFileToPackageRelative(filePath, repoRoot, packageRoot))
    .filter(Boolean);
  if (explicitFiles.length > 0) {
    return dedupe(explicitFiles);
  }

  const diffArgs = options.staged ? ["diff", "--cached", "--name-only", "-z"] : ["diff", "--name-only", "-z"];
  const rawOutput = execFileSync("git", diffArgs, { cwd: repoRoot });
  const repoRelativeFiles = rawOutput
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((filePath) => mapDiffPathToPackageRelative(filePath, repoRoot, packageRoot))
    .filter(Boolean);

  return dedupe(repoRelativeFiles);
}

function discoverCorpora(packageRoot) {
  const corpora = [];

  function walk(dirPath) {
    const baseName = path.basename(dirPath);
    if (baseName === "node_modules" || baseName === ".git") {
      return;
    }

    if (fs.existsSync(path.join(dirPath, "manifest.json")) && fs.existsSync(path.join(dirPath, "schema", "manifest.schema.json"))) {
      corpora.push(dirPath);
    }

    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      walk(path.join(dirPath, entry.name));
    }
  }

  walk(packageRoot);
  return dedupe(corpora).sort((left, right) => right.length - left.length);
}

function determineCorporaToValidate(changedFiles, corpora, packageRoot) {
  if (changedFiles.some((filePath) => isGlobalChange(filePath))) {
    return corpora;
  }

  const selected = new Set();
  const corpusRelatives = corpora.map((corpusRoot) => ({
    root: corpusRoot,
    relative: normalizePath(path.relative(packageRoot, corpusRoot))
  }));

  for (const filePath of changedFiles) {
    const match = corpusRelatives.find(({ relative }) => {
      if (relative === "") {
        return true;
      }
      return filePath === relative || filePath.startsWith(`${relative}/`);
    });
    if (match) {
      selected.add(match.root);
    }
  }

  return [...selected];
}

function evaluateSurfaceDrift(corpusRoot, packageRoot, changedFiles) {
  const manifestPath = path.join(corpusRoot, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  const rawManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  let manifest = rawManifest;
  let companionPath = getManifestCompanionPath(rawManifest);
  try {
    const runtime = getManifestRuntime(corpusRoot, rawManifest);
    manifest = runtime.manifest;
    companionPath = runtime.companionPath;
  } catch (error) {
    return [
      {
        severity: "error",
        rule: "manifest-companion-load",
        message: error.message
      }
    ];
  }
  const corpusFiles = changedFiles
    .map((filePath) => mapToCorpusRelative(filePath, packageRoot, corpusRoot))
    .filter(Boolean);
  const changedSet = new Set(corpusFiles);
  const metadataTouched = changedSet.has("manifest.json") || (companionPath ? changedSet.has(companionPath) : false);
  const modulePathById = new Map((manifest.modules ?? []).map((entry) => [entry.id, normalizePath(getModulePath(entry))]));
  const issues = [];

  for (const pair of manifest.surface_pairs ?? []) {
    if (pair.status !== "paired") {
      continue;
    }

    const humanFiles = [pair.human_primary, ...(pair.human_supporting ?? [])].map(normalizePath);
    const humanTouched = humanFiles.filter((filePath) => changedSet.has(filePath));
    const agentFiles = [pair.agent_primary, ...(pair.agent_supporting ?? [])]
      .map((moduleId) => modulePathById.get(moduleId))
      .filter(Boolean);
    const touchedAgentFiles = agentFiles.filter((filePath) => changedSet.has(filePath));
    const agentTouched = agentFiles.some((filePath) => changedSet.has(filePath));
    if (!agentTouched && humanTouched.length === 0) {
      continue;
    }

    const generatedHumanPrimaryIsSynced = isGeneratedHumanPrimarySynced(corpusRoot, manifest, pair);

    if (pair.sync_source === "agent-primary" && humanTouched.length > 0 && !agentTouched) {
      if (generatedHumanPrimaryIsSynced) {
        continue;
      }
      const metadataNote = metadataTouched ? " manifest or companion index changes alone do not satisfy agent-primary sync." : "";
      issues.push({
        severity: "error",
        rule: "surface-drift-human-only",
        pair_id: pair.pair_id,
        message: `human surface changed without paired agent module update under agent-primary sync: ${humanTouched.join(", ")}.${metadataNote}`
      });
    }

    if (pair.sync_source === "human-primary" && agentTouched && humanTouched.length === 0) {
      const metadataNote = metadataTouched ? " manifest or companion index changes alone do not satisfy human-primary sync." : "";
      issues.push({
        severity: "error",
        rule: "surface-drift-agent-only",
        pair_id: pair.pair_id,
        message: `agent module changed without paired human surface update under human-primary sync: ${touchedAgentFiles.join(", ")}.${metadataNote}`
      });
    }

    if (pair.sync_source === "bidirectional" && (agentTouched || humanTouched.length > 0)) {
      const changedSides = [
        ...(agentTouched ? ["agent"] : []),
        ...(humanTouched.length > 0 ? ["human"] : [])
      ];
      issues.push({
        severity: "warning",
        rule: "surface-drift-bidirectional-review",
        pair_id: pair.pair_id,
        message: `bidirectional pair changed on ${changedSides.join("+")} side(s); merge protocol remains experimental and requires manual review before commit.`
      });
    }
  }

  return issues;
}

function isGeneratedHumanPrimarySynced(corpusRoot, manifest, pair) {
  if (!hasGeneratedHumanPrimary(pair)) {
    return false;
  }

  const humanPath = normalizePath(pair.human_primary ?? "");
  if (!humanPath) {
    return false;
  }

  const resolvedHumanPath = path.join(corpusRoot, humanPath);
  if (!fs.existsSync(resolvedHumanPath)) {
    return false;
  }

  const modulePathById = new Map((manifest.modules ?? []).map((entry) => [entry.id, normalizePath(getModulePath(entry))]));
  const moduleMap = new Map();
  for (const [moduleId, modulePath] of modulePathById) {
    const resolvedModulePath = path.join(corpusRoot, modulePath);
    if (!fs.existsSync(resolvedModulePath)) {
      return false;
    }
    try {
      moduleMap.set(moduleId, { module: JSON.parse(fs.readFileSync(resolvedModulePath, "utf8")) });
    } catch {
      return false;
    }
  }

  try {
    const expected = renderGeneratedHumanPrimary({
      manifest,
      pair,
      moduleMap
    });
    const actual = fs.readFileSync(resolvedHumanPath, "utf8");
    return expected === actual;
  } catch {
    return false;
  }
}

function isGlobalChange(filePath) {
  return GLOBAL_FILES.has(filePath) || GLOBAL_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

function mapExplicitFileToPackageRelative(filePath, repoRoot, packageRoot) {
  const candidates = [];

  if (path.isAbsolute(filePath)) {
    candidates.push(path.resolve(filePath));
  } else {
    candidates.push(path.resolve(packageRoot, filePath));
    if (repoRoot !== packageRoot) {
      candidates.push(path.resolve(repoRoot, filePath));
    }
  }

  for (const candidate of candidates) {
    const relative = normalizePath(path.relative(packageRoot, candidate));
    if (relative !== "" && !relative.startsWith("../") && !path.isAbsolute(relative)) {
      return relative;
    }
  }

  return "";
}

function mapDiffPathToPackageRelative(filePath, repoRoot, packageRoot) {
  const packageRelativeRoot = normalizePath(path.relative(repoRoot, packageRoot));
  const normalizedFile = normalizePath(filePath);

  if (packageRelativeRoot === "") {
    return normalizedFile;
  }
  if (normalizedFile === packageRelativeRoot) {
    return "";
  }
  if (!normalizedFile.startsWith(packageRelativeRoot + "/")) {
    return "";
  }
  return normalizedFile.slice(packageRelativeRoot.length + 1);
}

function mapToCorpusRelative(filePath, packageRoot, corpusRoot) {
  const corpusRelativeRoot = normalizePath(path.relative(packageRoot, corpusRoot));
  const normalizedFile = normalizePath(filePath);

  if (corpusRelativeRoot === "") {
    return normalizedFile;
  }
  if (!normalizedFile.startsWith(`${corpusRelativeRoot}/`)) {
    return "";
  }
  return normalizedFile.slice(corpusRelativeRoot.length + 1);
}

function printHookIssues(corpusRoot, issues) {
  if (issues.length === 0) {
    return;
  }

  console.log(`HOOK ISSUES ${corpusRoot}`);
  for (const issue of issues) {
    console.log(`  ${issue.severity.toUpperCase()} ${issue.rule} @ ${issue.pair_id} -> ${issue.message}`);
  }
}

function normalizePath(value) {
  return String(value ?? "").replaceAll(path.sep, "/");
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function requireValue(flag, queue) {
  if (queue.length === 0) {
    throw new Error(`Missing value for ${flag}`);
  }
  return queue.shift();
}
