#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const IGNORED_DIRS = new Set([".git", "node_modules"]);
const jsonMode = process.argv.includes("--json");

const PATTERNS = [
  { id: "github-classic-token", regex: /ghp_[A-Za-z0-9_]{30,}/g },
  { id: "github-fine-grained-token", regex: /github_pat_[A-Za-z0-9_]{40,}/g },
  { id: "openai-api-key", regex: /\bsk-[A-Za-z0-9]{32,}\b/g },
  { id: "aws-access-key", regex: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { id: "slack-token", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { id: "private-key", regex: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g }
];

const ALLOWLIST = [
  {
    file: "benchmarks/aods-eval-lab/test/open-source-fetch.test.mjs",
    patternId: "slack-token",
    reason: "synthetic sanitizer regression token assembled in test code"
  }
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function isTextFile(file) {
  const sample = fs.readFileSync(file);
  return !sample.includes(0);
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function isAllowed(hit) {
  return ALLOWLIST.some((entry) => entry.file === hit.file && entry.patternId === hit.pattern_id);
}

const hits = [];

for (const file of walk(REPO_ROOT).sort()) {
  if (!isTextFile(file)) continue;
  const relative = path.relative(REPO_ROOT, file);
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of PATTERNS) {
    for (const match of text.matchAll(pattern.regex)) {
      const position = lineAndColumn(text, match.index ?? 0);
      hits.push({
        file: relative,
        pattern_id: pattern.id,
        line: position.line,
        column: position.column,
        sample: match[0].slice(0, 12) + "...",
        allowed: false
      });
    }
  }
}

for (const hit of hits) {
  hit.allowed = isAllowed(hit);
}

const unallowed = hits.filter((hit) => !hit.allowed);
const result = {
  scanned_files: walk(REPO_ROOT).length,
  hits: hits.length,
  allowed_hits: hits.length - unallowed.length,
  unallowed_hits: unallowed
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    `secret-like scan: hits=${result.hits} allowed=${result.allowed_hits} unallowed=${unallowed.length}`
  );
  for (const hit of unallowed) {
    console.error(`${hit.file}:${hit.line}:${hit.column} ${hit.pattern_id} ${hit.sample}`);
  }
}

if (unallowed.length > 0) {
  process.exitCode = 1;
}
