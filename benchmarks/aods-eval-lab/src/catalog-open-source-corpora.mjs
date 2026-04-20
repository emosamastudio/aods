import fs from "node:fs";
import path from "node:path";

import { PROJECT_ROOT, dedupe, measureFiles, measureText, readJson, writeJson, writeText } from "./helpers.mjs";

const DEFAULT_MANIFEST_PATH = path.join(PROJECT_ROOT, "fixtures", "open-source", "corpora.json");
const DEFAULT_FETCH_RESULTS_PATH = path.join(PROJECT_ROOT, "generated", "results", "open-source-fetch-results.json");
const DEFAULT_FETCH_ROOT = path.join(PROJECT_ROOT, "generated", "open-source-corpora");
const DEFAULT_OUTPUT_JSON = path.join(PROJECT_ROOT, "generated", "results", "open-source-scenario-catalog.json");
const DEFAULT_OUTPUT_REPORT = path.join(PROJECT_ROOT, "reports", "open-source-scenario-catalog.md");

export function buildOpenSourceScenarioCatalog(overrides = {}) {
  const options = buildOptions(overrides);
  const manifest = readJson(options.manifestPath);
  const selectedCorpora = selectCorpora(manifest.corpora ?? [], options.ids);
  const fetchById = buildFetchIndex(selectedCorpora, options);

  const corpora = selectedCorpora.map((corpus) => catalogCorpus(corpus, fetchById.get(corpus.id)));
  const scenarioEntries = corpora.flatMap((corpus) => corpus.scenarios);
  return {
    generated_at: new Date().toISOString(),
    manifest_path: options.manifestPath,
    fetch_results_path: options.fetchResultsPath,
    corpora,
    summary: {
      corpus_count: corpora.length,
      scenario_count: scenarioEntries.length,
      lifecycle_phases: dedupe(scenarioEntries.flatMap((scenario) => scenario.lifecycle_phases)).sort(),
      benchmark_dimensions: dedupe(scenarioEntries.flatMap((scenario) => scenario.benchmark_dimensions)).sort(),
      benchmark_roles: dedupe(scenarioEntries.flatMap((scenario) => scenario.benchmark_roles)).sort(),
      scenario_classes: countValues(scenarioEntries.flatMap((scenario) => [scenario.scenario_class])),
      formats: countValues(scenarioEntries.flatMap((scenario) => [scenario.format]))
    }
  };
}

export function loadOpenSourceScenarioCatalog(overrides = {}) {
  const options = buildOptions(overrides);
  if (isCatalogOutputFresh(options)) {
    return readJson(options.outputJsonPath);
  }
  return buildOpenSourceScenarioCatalog(options);
}

export function runOpenSourceScenarioCatalog(argv = [], overrides = {}) {
  const options = parseArgs(argv, overrides);
  const catalog = buildOpenSourceScenarioCatalog(options);

  writeJson(options.outputJsonPath, catalog);
  writeText(options.outputReportPath, renderReport(catalog));

  if (options.json) {
    console.log(JSON.stringify(catalog, null, 2));
  } else {
    printSummary(catalog);
  }

  return catalog;
}

function buildOptions(overrides = {}) {
  return {
    ids: [...(overrides.ids ?? [])],
    manifestPath: overrides.manifestPath ?? DEFAULT_MANIFEST_PATH,
    fetchResultsPath: overrides.fetchResultsPath ?? DEFAULT_FETCH_RESULTS_PATH,
    fetchRoot: overrides.fetchRoot ?? DEFAULT_FETCH_ROOT,
    outputJsonPath: overrides.outputJsonPath ?? DEFAULT_OUTPUT_JSON,
    outputReportPath: overrides.outputReportPath ?? DEFAULT_OUTPUT_REPORT,
    json: overrides.json ?? false
  };
}

function parseArgs(argv, overrides) {
  const options = buildOptions(overrides);

  const queue = [...argv];
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--id") {
      options.ids.push(requireValue(arg, queue));
      continue;
    }
    if (arg === "--manifest") {
      options.manifestPath = path.resolve(requireValue(arg, queue));
      continue;
    }
    if (arg === "--fetch-results") {
      options.fetchResultsPath = path.resolve(requireValue(arg, queue));
      continue;
    }
    if (arg === "--fetch-root") {
      options.fetchRoot = path.resolve(requireValue(arg, queue));
      continue;
    }
    if (arg === "--output-json") {
      options.outputJsonPath = path.resolve(requireValue(arg, queue));
      continue;
    }
    if (arg === "--output-report") {
      options.outputReportPath = path.resolve(requireValue(arg, queue));
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    throw new Error(`Unknown catalog-open-source-corpora arg: ${arg}`);
  }

  return options;
}

function isCatalogOutputFresh(options) {
  if (!fs.existsSync(options.outputJsonPath)) {
    return false;
  }
  const outputMtimeMs = fs.statSync(options.outputJsonPath).mtimeMs;
  if (fs.statSync(options.manifestPath).mtimeMs > outputMtimeMs) {
    return false;
  }
  if (!fs.existsSync(options.fetchResultsPath)) {
    return false;
  }
  if (fs.statSync(options.fetchResultsPath).mtimeMs > outputMtimeMs) {
    return false;
  }
  return true;
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

function buildFetchIndex(selectedCorpora, options) {
  if (fs.existsSync(options.fetchResultsPath)) {
    const fetchResults = readJson(options.fetchResultsPath);
    return new Map((fetchResults.corpora ?? []).map((corpus) => [corpus.id, corpus]));
  }

  return new Map(
    selectedCorpora.map((corpus) => {
      const outputRoot = path.join(options.fetchRoot, corpus.id);
      if (!fs.existsSync(outputRoot)) {
        throw new Error(
          `Missing fetch results and local corpus root for ${corpus.id}. Run fetch-open-corpora first.`
        );
      }
      const measured = measureFiles(listFiles(outputRoot));
      return [
        corpus.id,
        {
          id: corpus.id,
          output_root: outputRoot,
          file_count: measured.file_count,
          byte_count: measured.byte_count
        }
      ];
    })
  );
}

function catalogCorpus(corpus, fetched) {
  if (!fetched) {
    throw new Error(`Missing fetch result for corpus ${corpus.id}. Run fetch-open-corpora first.`);
  }
  if (!Array.isArray(corpus.scenario_seeds) || corpus.scenario_seeds.length === 0) {
    throw new Error(`Corpus ${corpus.id} has no scenario_seeds.`);
  }

  const corpusRoot = path.resolve(fetched.output_root);
  const scenarios = corpus.scenario_seeds.map((seed) => catalogSeed(corpus, corpusRoot, seed));
  return {
    id: corpus.id,
    label: corpus.label,
    repo: corpus.repo,
    license: corpus.license,
    pressure: corpus.pressure,
    output_root: corpusRoot,
    source_file_count: fetched.file_count,
    source_byte_count: fetched.byte_count,
    scenario_count: scenarios.length,
    scenarios
  };
}

function catalogSeed(corpus, corpusRoot, seed) {
  const filePath = resolveInsideRoot(corpusRoot, seed.path);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Scenario seed missing for ${corpus.id}/${seed.id}: ${seed.path}`);
  }

  const text = fs.readFileSync(filePath, "utf8");
  const measured = measureText(text);
  return {
    id: `${corpus.id}-${seed.id}`,
    corpus_id: corpus.id,
    corpus_label: corpus.label,
    title: seed.title,
    path: seed.path,
    heading: extractHeading(text, seed.title),
    format: inferFormat(seed.path),
    scenario_class: seed.scenario_class,
    lifecycle_phases: seed.lifecycle_phases ?? [],
    benchmark_roles: seed.benchmark_roles ?? [],
    benchmark_dimensions: seed.benchmark_dimensions ?? [],
    grep_terms: seed.grep_terms ?? [],
    answer_support: seed.answer_support ?? [],
    answer_checks: seed.answer_checks ?? [],
    answer_authority: seed.answer_authority ?? null,
    why: seed.why,
    byte_count: measured.bytes,
    line_count: measured.lines,
    tokens_estimated: measured.tokens_estimated
  };
}

function resolveInsideRoot(rootDir, relativePath) {
  const resolved = path.resolve(rootDir, relativePath);
  const normalizedRoot = path.resolve(rootDir);
  if (resolved !== normalizedRoot && !resolved.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error(`Scenario seed path escapes corpus root: ${relativePath}`);
  }
  return resolved;
}

function inferFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".rst") {
    return "rst";
  }
  if (ext === ".md" || ext === ".mdx") {
    return "markdown";
  }
  return ext.replace(/^\./, "") || "unknown";
}

function extractHeading(text, fallbackTitle) {
  const markdownMatch = text.match(/^#\s+(.+)$/m);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }

  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length - 1; index += 1) {
    const title = lines[index].trim();
    const underline = lines[index + 1].trim();
    if (title === "" || underline === "") {
      continue;
    }
    if (/^[=~`:#*+\-^"]+$/.test(underline) && underline.length >= title.length) {
      return title;
    }
  }

  return fallbackTitle;
}

function countValues(values) {
  return values.reduce((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
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

function renderReport(catalog) {
  const corpusRows = catalog.corpora
    .map(
      (corpus) =>
        `| ${corpus.label} | ${corpus.license} | ${corpus.scenario_count} | ${corpus.source_file_count} | ${corpus.source_byte_count} | ${corpus.pressure} |`
    )
    .join("\n");

  const corpusSections = catalog.corpora
    .map((corpus) => {
      const rows = corpus.scenarios
        .map(
          (scenario) =>
            `| ${scenario.title} | ${scenario.scenario_class} | ${scenario.lifecycle_phases.join(", ")} | ${scenario.benchmark_roles.join(", ")} | \`${scenario.path}\` | ${scenario.byte_count} |`
        )
        .join("\n");
      return `## ${corpus.label}

| Seed | Class | Lifecycle phases | Benchmark roles | File | Bytes |
| --- | --- | --- | --- | --- | ---: |
${rows}
`;
    })
    .join("\n");

  return `# Open-source scenario catalog

## Summary

- Selected corpora: **${catalog.summary.corpus_count}**
- Scenario seeds: **${catalog.summary.scenario_count}**
- Lifecycle phases represented: ${catalog.summary.lifecycle_phases.join(", ")}
- Benchmark dimensions represented: ${catalog.summary.benchmark_dimensions.join(", ")}
- Benchmark roles represented: ${catalog.summary.benchmark_roles.join(", ")}
- Scenario classes: ${formatCountSummary(catalog.summary.scenario_classes)}
- Formats: ${formatCountSummary(catalog.summary.formats)}

These scenario seeds are curated for **grep-first / lexical-addressable** benchmark work. Each seed carries concrete file paths plus \`grep_terms\`, some seeds declare optional \`answer_support\` alias groups so benchmark-v2 can distinguish exact-string misses from claim-support coverage, some now declare explicit \`answer_checks\` so the benchmark can distinguish wording gaps from concrete answer-support gaps, and some also declare \`answer_authority\` scopes so the benchmark can separate acceptable in-scope cross-file support from out-of-scope borrowing.

## Corpus overview

| Corpus | License | Seeds | Source files | Source bytes | Why this corpus stays in the pack |
| --- | --- | ---: | ---: | ---: | --- |
${corpusRows}

${corpusSections}`;
}

function formatCountSummary(counts) {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function printSummary(catalog) {
  console.log("OK catalog open-source corpora");
  console.log(`corpora=${catalog.summary.corpus_count} scenarios=${catalog.summary.scenario_count}`);
  for (const corpus of catalog.corpora) {
    console.log(`  cataloged ${corpus.id} scenarios=${corpus.scenario_count}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOpenSourceScenarioCatalog(process.argv.slice(2));
}
