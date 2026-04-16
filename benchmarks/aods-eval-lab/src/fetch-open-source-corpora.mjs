import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { PROJECT_ROOT, ensureDir, measureFiles, readJson, writeJson, writeText } from "./helpers.mjs";

const MANIFEST_PATH = path.join(PROJECT_ROOT, "fixtures", "open-source", "corpora.json");
const DEFAULT_OUTPUT_ROOT = path.join(PROJECT_ROOT, "generated", "open-source-corpora");
const SECRET_REPLACERS = [
  {
    pattern: /xox[baprs]-[0-9A-Za-z-]{20,}/g,
    replace: "<REDACTED-SLACK-TOKEN>"
  },
  {
    pattern: /-----BEGIN ([A-Z0-9 ]*PRIVATE KEY)-----[\s\S]*?-----END \1-----/g,
    replace: (_match, label) =>
      `<REDACTED-${String(label).trim().replaceAll(/\s+/g, "-").replaceAll("-PRIVATE", "")}-EXAMPLE>`
  }
];

export function runOpenSourceFetch(argv = []) {
  const options = parseArgs(argv);
  const manifest = readJson(MANIFEST_PATH);
  const corpora = selectCorpora(manifest.corpora ?? [], options.ids);

  if (corpora.length === 0) {
    throw new Error("No open-source corpora selected for fetch.");
  }

  ensureDir(options.outputRoot);
  const results = corpora.map((corpus) => fetchCorpus(corpus, options.outputRoot));
  const report = {
    generated_at: new Date().toISOString(),
    output_root: options.outputRoot,
    corpora: results
  };

  writeJson(path.join(PROJECT_ROOT, "generated", "results", "open-source-fetch-results.json"), report);
  writeText(path.join(PROJECT_ROOT, "reports", "open-source-corpora-report.md"), renderReport(report));

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  return report;
}

function parseArgs(argv) {
  const options = {
    ids: [],
    outputRoot: DEFAULT_OUTPUT_ROOT,
    json: false
  };

  const queue = [...argv];
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--id") {
      options.ids.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--output-dir") {
      options.outputRoot = path.resolve(requireValue(arg, queue));
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    throw new Error(`Unknown fetch-open-source-corpora arg: ${arg}`);
  }

  return options;
}

function requireValue(flag, queue) {
  if (queue.length === 0) {
    throw new Error(`Missing value for ${flag}`);
  }
  return queue.shift();
}

function selectCorpora(corpora, ids) {
  if (ids.length > 0) {
    const selected = corpora.filter((corpus) => ids.includes(corpus.id));
    const missing = ids.filter((id) => !selected.some((corpus) => corpus.id === id));
    if (missing.length > 0) {
      throw new Error(`Unknown corpus id(s): ${missing.join(", ")}`);
    }
    return selected;
  }
  return corpora.filter((corpus) => corpus.status === "selected");
}

function fetchCorpus(corpus, outputRoot) {
  const targetRoot = path.join(outputRoot, corpus.id);
  fs.rmSync(targetRoot, { recursive: true, force: true });
  runGit(["clone", "--depth", "1", "--filter=blob:none", "--sparse", corpus.repo, targetRoot], PROJECT_ROOT);
  runGit(["sparse-checkout", "set", "--no-cone", ...corpus.allowlist], targetRoot);
  fs.rmSync(path.join(targetRoot, ".git"), { recursive: true, force: true });

  const files = listFiles(targetRoot);
  const sanitized = sanitizeFetchedFiles(files);
  const measured = measureFiles(files);
  return {
    id: corpus.id,
    label: corpus.label,
    repo: corpus.repo,
    license: corpus.license,
    status: corpus.status,
    pressure: corpus.pressure,
    output_root: targetRoot,
    file_count: measured.file_count,
    byte_count: measured.byte_count,
    sanitized_file_count: sanitized.sanitizedFileCount,
    sanitized_match_count: sanitized.sanitizedMatchCount,
    allowlist: corpus.allowlist
  };
}

export function sanitizeFetchedText(text) {
  let sanitized = String(text ?? "");
  let replacementCount = 0;

  for (const replacer of SECRET_REPLACERS) {
    sanitized = sanitized.replace(replacer.pattern, (...args) => {
      replacementCount += 1;
      return typeof replacer.replace === "function" ? replacer.replace(...args) : replacer.replace;
    });
  }

  return {
    text: sanitized,
    replacementCount
  };
}

function sanitizeFetchedFiles(filePaths) {
  let sanitizedFileCount = 0;
  let sanitizedMatchCount = 0;

  for (const filePath of filePaths) {
    const original = fs.readFileSync(filePath, "utf8");
    const sanitized = sanitizeFetchedText(original);
    if (sanitized.replacementCount === 0) {
      continue;
    }
    fs.writeFileSync(filePath, sanitized.text);
    sanitizedFileCount += 1;
    sanitizedMatchCount += sanitized.replacementCount;
  }

  return {
    sanitizedFileCount,
    sanitizedMatchCount
  };
}

function runGit(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `git ${args.join(" ")} failed`);
  }
}

function listFiles(rootDir) {
  const files = [];

  function walk(dirPath) {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.name === ".git") {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      files.push(fullPath);
    }
  }

  walk(rootDir);
  return files;
}

function printReport(report) {
  console.log(`OK fetch open-source corpora`);
  console.log(`output_root=${report.output_root}`);
  for (const corpus of report.corpora) {
    console.log(
      `  fetched ${corpus.id} license=${corpus.license} files=${corpus.file_count} bytes=${corpus.byte_count}`
    );
  }
}

function renderReport(report) {
  const rows = report.corpora
    .map(
      (corpus) =>
        `| ${corpus.label} | ${corpus.license} | ${corpus.file_count} | ${corpus.byte_count} | ${corpus.sanitized_match_count ?? 0} | ${corpus.pressure} |`
    )
    .join("\n");

  return `# Open-source corpora fetch report

## Summary

- Output root: \`${report.output_root}\`
- Selected corpora: **${report.corpora.length}**

## Corpus table

| Corpus | License | Files | Bytes | Redactions | Why it was selected |
| --- | --- | ---: | ---: | ---: | --- |
${rows}
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOpenSourceFetch(process.argv.slice(2));
}
