import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadOpenSourceScenarioCatalog, runOpenSourceScenarioCatalog } from "../src/catalog-open-source-corpora.mjs";

test("open-source scenario catalog validates seeded files and writes outputs", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-catalog-"));
  const corpusRoot = path.join(tempRoot, "generated", "open-source-corpora", "demo");
  const manifestPath = path.join(tempRoot, "fixtures", "open-source", "corpora.json");
  const fetchResultsPath = path.join(tempRoot, "generated", "results", "open-source-fetch-results.json");
  const outputJsonPath = path.join(tempRoot, "generated", "results", "open-source-scenario-catalog.json");
  const outputReportPath = path.join(tempRoot, "reports", "open-source-scenario-catalog.md");

  fs.mkdirSync(path.join(corpusRoot, "docs"), { recursive: true });
  fs.writeFileSync(
    path.join(corpusRoot, "docs", "architecture.md"),
    "# Architecture\n\nThe control plane coordinates workers.\n"
  );
  fs.writeFileSync(
    path.join(corpusRoot, "docs", "release.rst"),
    "Release process\n===============\n\nVote before cutting a release candidate.\n"
  );

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        version: 1,
        corpora: [
          {
            id: "demo",
            label: "Demo",
            repo: "https://example.com/demo.git",
            license: "MIT",
            status: "selected",
            pressure: "Demo corpus for catalog testing.",
            allowlist: ["docs"],
            scenario_seeds: [
              {
                id: "architecture",
                title: "Architecture",
                path: "docs/architecture.md",
                scenario_class: "ops-architecture",
                lifecycle_phases: ["design", "operate"],
                benchmark_roles: ["architect"],
                benchmark_dimensions: ["coverage", "routing"],
                grep_terms: ["architecture", "control plane"],
                why: "Architecture seed"
              },
              {
                id: "release",
                title: "Release process",
                path: "docs/release.rst",
                scenario_class: "release-governance",
                lifecycle_phases: ["release", "governance"],
                benchmark_roles: ["release-manager"],
                benchmark_dimensions: ["coverage", "routing"],
                grep_terms: ["release process", "release candidate"],
                answer_support: [
                  {
                    id: "release-process",
                    match_any: ["release process"]
                  },
                  {
                    id: "release-candidate",
                    match_any: ["release candidate", "release candidate."]
                  }
                ],
                answer_checks: [
                  {
                    id: "release-branch",
                    match_any: ["release candidate", "vote"]
                  }
                ],
                answer_authority: {
                  allowed_path_prefixes: ["docs/release.rst"]
                },
                why: "Release seed"
              }
            ]
          }
        ]
      },
      null,
      2
    )
  );

  fs.mkdirSync(path.dirname(fetchResultsPath), { recursive: true });
  fs.writeFileSync(
    fetchResultsPath,
    JSON.stringify(
      {
        corpora: [
          {
            id: "demo",
            output_root: corpusRoot,
            file_count: 2,
            byte_count: 128
          }
        ]
      },
      null,
      2
    )
  );

  const catalog = runOpenSourceScenarioCatalog([], {
    manifestPath,
    fetchResultsPath,
    outputJsonPath,
    outputReportPath
  });

  assert.equal(catalog.summary.corpus_count, 1);
  assert.equal(catalog.summary.scenario_count, 2);
  assert.equal(catalog.summary.scenario_classes["ops-architecture"], 1);
  assert.equal(catalog.summary.scenario_classes["release-governance"], 1);
  assert.equal(catalog.summary.formats.markdown, 1);
  assert.equal(catalog.summary.formats.rst, 1);
  assert.ok(catalog.summary.lifecycle_phases.includes("design"));
  assert.ok(catalog.summary.lifecycle_phases.includes("release"));
  assert.equal(catalog.corpora[0].scenarios[1].answer_support[1].match_any[0], "release candidate");
  assert.equal(catalog.corpora[0].scenarios[1].answer_checks[0].match_any[1], "vote");
  assert.equal(catalog.corpora[0].scenarios[1].answer_authority.allowed_path_prefixes[0], "docs/release.rst");
  assert.ok(fs.existsSync(outputJsonPath));
  assert.ok(fs.existsSync(outputReportPath));

  const report = fs.readFileSync(outputReportPath, "utf8");
  assert.match(report, /Open-source scenario catalog/);
  assert.match(report, /grep-first/);
  assert.match(report, /answer_support/);
  assert.match(report, /answer_checks/);
  assert.match(report, /answer_authority/);
  assert.match(report, /Demo/);
});

test("open-source scenario catalog can rebuild source metrics from local corpus roots", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-catalog-fallback-"));
  const fetchRoot = path.join(tempRoot, "generated", "open-source-corpora");
  const corpusRoot = path.join(fetchRoot, "demo");
  const manifestPath = path.join(tempRoot, "fixtures", "open-source", "corpora.json");
  const missingFetchResultsPath = path.join(tempRoot, "generated", "results", "missing-fetch-results.json");
  const outputJsonPath = path.join(tempRoot, "generated", "results", "open-source-scenario-catalog.json");
  const outputReportPath = path.join(tempRoot, "reports", "open-source-scenario-catalog.md");

  fs.mkdirSync(path.join(corpusRoot, "docs"), { recursive: true });
  fs.writeFileSync(path.join(corpusRoot, "docs", "security.md"), "# Security\n\nReport vulnerabilities privately.\n");

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        version: 1,
        corpora: [
          {
            id: "demo",
            label: "Demo",
            repo: "https://example.com/demo.git",
            license: "MIT",
            status: "selected",
            pressure: "Demo corpus for fallback catalog testing.",
            allowlist: ["docs"],
            scenario_seeds: [
              {
                id: "security",
                title: "Security",
                path: "docs/security.md",
                scenario_class: "security-governance",
                lifecycle_phases: ["operate", "governance"],
                benchmark_roles: ["security-lead"],
                benchmark_dimensions: ["coverage", "routing"],
                grep_terms: ["security", "vulnerability"],
                why: "Security seed"
              }
            ]
          }
        ]
      },
      null,
      2
    )
  );

  const catalog = runOpenSourceScenarioCatalog([], {
    manifestPath,
    fetchResultsPath: missingFetchResultsPath,
    fetchRoot,
    outputJsonPath,
    outputReportPath
  });

  assert.equal(catalog.summary.corpus_count, 1);
  assert.equal(catalog.summary.scenario_count, 1);
  assert.equal(catalog.corpora[0].source_file_count, 1);
  assert.ok(catalog.corpora[0].source_byte_count > 0);
});

test("open-source scenario catalog load invalidates stale output when manifest changes", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-catalog-stale-"));
  const corpusRoot = path.join(tempRoot, "generated", "open-source-corpora", "demo");
  const manifestPath = path.join(tempRoot, "fixtures", "open-source", "corpora.json");
  const fetchResultsPath = path.join(tempRoot, "generated", "results", "open-source-fetch-results.json");
  const outputJsonPath = path.join(tempRoot, "generated", "results", "open-source-scenario-catalog.json");
  const outputReportPath = path.join(tempRoot, "reports", "open-source-scenario-catalog.md");

  fs.mkdirSync(path.join(corpusRoot, "docs"), { recursive: true });
  fs.writeFileSync(path.join(corpusRoot, "docs", "security.md"), "# Security\n\nReport vulnerabilities privately.\n");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        version: 1,
        corpora: [
          {
            id: "demo",
            label: "Demo",
            repo: "https://example.com/demo.git",
            license: "MIT",
            status: "selected",
            pressure: "Demo corpus for stale-output testing.",
            allowlist: ["docs"],
            scenario_seeds: [
              {
                id: "security",
                title: "Security",
                path: "docs/security.md",
                scenario_class: "security-governance",
                lifecycle_phases: ["operate", "governance"],
                benchmark_roles: ["security-lead"],
                benchmark_dimensions: ["coverage", "routing"],
                grep_terms: ["security", "vulnerability"],
                why: "Security seed"
              }
            ]
          }
        ]
      },
      null,
      2
    )
  );
  fs.mkdirSync(path.dirname(fetchResultsPath), { recursive: true });
  fs.writeFileSync(
    fetchResultsPath,
    JSON.stringify(
      {
        corpora: [
          {
            id: "demo",
            output_root: corpusRoot,
            file_count: 1,
            byte_count: 64
          }
        ]
      },
      null,
      2
    )
  );

  runOpenSourceScenarioCatalog([], {
    manifestPath,
    fetchResultsPath,
    outputJsonPath,
    outputReportPath
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        version: 1,
        corpora: [
          {
            id: "demo",
            label: "Demo",
            repo: "https://example.com/demo.git",
            license: "MIT",
            status: "selected",
            pressure: "Demo corpus for stale-output testing.",
            allowlist: ["docs"],
            scenario_seeds: [
              {
                id: "security",
                title: "Security",
                path: "docs/security.md",
                scenario_class: "security-governance",
                lifecycle_phases: ["operate", "governance"],
                benchmark_roles: ["security-lead"],
                benchmark_dimensions: ["coverage", "routing"],
                grep_terms: ["security", "vulnerability"],
                answer_support: [
                  {
                    id: "security",
                    match_any: ["security"]
                  }
                ],
                why: "Security seed"
              }
            ]
          }
        ]
      },
      null,
      2
    )
  );

  const catalog = loadOpenSourceScenarioCatalog({
    manifestPath,
    fetchResultsPath,
    outputJsonPath,
    outputReportPath
  });

  assert.equal(catalog.corpora[0].scenarios[0].answer_support[0].id, "security");
});
