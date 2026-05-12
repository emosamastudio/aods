#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const IGNORED_DIRS = new Set([".git", "node_modules"]);
const IGNORED_PREFIXES = ["benchmarks/aods-eval-lab/generated/"];
const jsonMode = process.argv.includes("--json");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(REPO_ROOT, fullPath).replaceAll(path.sep, "/");
    if (IGNORED_PREFIXES.some((prefix) => relative.startsWith(prefix))) continue;
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripFragment(target) {
  const hashIndex = target.indexOf("#");
  return hashIndex === -1 ? target : target.slice(0, hashIndex);
}

function isLocalRelative(target) {
  if (!target || target.startsWith("#")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return false;
  if (target.startsWith("/")) return false;
  return true;
}

function normalizeLinkTarget(rawTarget) {
  const withoutTitle = rawTarget.trim().replace(/^<([^>]+)>$/, "$1");
  const firstWhitespace = withoutTitle.search(/\s+["'][^"']*["']\s*$/);
  const target = firstWhitespace === -1 ? withoutTitle : withoutTitle.slice(0, firstWhitespace);
  return decodeURI(stripFragment(target));
}

function linkExists(sourceFile, target) {
  const resolved = path.resolve(path.dirname(sourceFile), target);
  return fs.existsSync(resolved);
}

const markdownFiles = walk(REPO_ROOT).sort();
const missing = [];
let checkedLinks = 0;

for (const file of markdownFiles) {
  const text = fs.readFileSync(file, "utf8");
  const inlinePattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  const referencePattern = /^\s*\[[^\]]+\]:\s+(\S+)/gm;
  const patterns = [inlinePattern, referencePattern];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const target = normalizeLinkTarget(match[1]);
      if (!isLocalRelative(target)) continue;
      checkedLinks += 1;
      if (!linkExists(file, target)) {
        missing.push({
          file: path.relative(REPO_ROOT, file),
          target
        });
      }
    }
  }
}

const result = {
  markdown_files: markdownFiles.length,
  checked_relative_links: checkedLinks,
  missing_links: missing
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    `docs link check: markdown_files=${result.markdown_files} checked_relative_links=${result.checked_relative_links} missing=${missing.length}`
  );
  for (const item of missing) {
    console.error(`missing local link: ${item.file} -> ${item.target}`);
  }
}

if (missing.length > 0) {
  process.exitCode = 1;
}
