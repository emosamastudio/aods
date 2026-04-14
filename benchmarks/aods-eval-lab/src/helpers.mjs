import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
export const SRC_ROOT = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(SRC_ROOT, "..");
export const REPO_ROOT = path.resolve(PROJECT_ROOT, "..", "..");

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function emptyDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value);
}

export function estimateTokens(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return Math.ceil(text.length / 4);
}

export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatRatio(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "n/a";
}

export function median(values) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function dedupe(values) {
  return [...new Set(values)];
}

export function flatten(array) {
  return array.flatMap((item) => item);
}

export function copyDir(sourceDir, targetDir) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

export function replaceText(filePath, findText, replaceTextValue) {
  const original = fs.readFileSync(filePath, "utf8");
  if (!original.includes(findText)) {
    throw new Error(`Replacement anchor not found in ${filePath}: ${findText}`);
  }
  fs.writeFileSync(filePath, original.replace(findText, replaceTextValue));
}

export function appendText(filePath, text) {
  const original = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, original + text);
}
