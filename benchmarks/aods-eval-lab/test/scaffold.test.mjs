import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { REPO_ROOT } from "../src/helpers.mjs";

const CLI_PATH = path.join(REPO_ROOT, "bin", "aods.mjs");

function runCli(args) {
  return execFileSync("node", [CLI_PATH, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
}

test("CLI help and compile errors expose allowed enum values", () => {
  const help = runCli(["--help"]);
  assert.match(help, /authoring-module/);
  assert.match(help, /aods compile <source-file> <target-dir> \[--json\] \[--strict\] \[--force\]/);
  assert.match(help, /module category: architecture \| protocol \| schema \| workflow \| policy \| config \| reference \| artifact \| capsule/);
  assert.match(help, /module scaffold pattern: implementation-governance/);

  const routeHelp = runCli(["route", "--help"]);
  assert.match(routeHelp, /aods route \[root\] \[--role <role-id>\]/);
  assert.match(routeHelp, /--stage <stage>/);
  assert.match(routeHelp, /route intent: any \| read \| write \| validate \| sync/);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-discoverability-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const invalidPattern = spawnSync("node", [
    CLI_PATH,
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-governance",
    "--pattern",
    "governance-kit"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(invalidPattern.status, 0);
  assert.match(invalidPattern.stderr, /module scaffold pattern/);
  assert.match(invalidPattern.stderr, /implementation-governance/);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.modules[0].category = "plan";
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const result = spawnSync("node", [CLI_PATH, "compile", sourcePath, path.join(tempDir, "compiled"), "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Received: "plan"/);
  assert.match(result.stderr, /Allowed values:/);
  assert.match(result.stderr, /"architecture"/);
});

test("compile --strict turns warning-only output into a failing gate", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-compile-strict-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-log",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-LOG.md"
  ]);

  const cleanCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-clean"),
    "--force",
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(cleanCompile.status, 0);
  assert.match(cleanCompile.stdout, /OK compile corpus/);
  assert.doesNotMatch(cleanCompile.stdout, /strict gate blocked by warnings/);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.surface_pairs[0].sync_source = "bidirectional";
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const warningCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-warning"),
    "--force"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(warningCompile.status, 0);
  assert.match(warningCompile.stdout, /WARN compile corpus/);
  assert.match(warningCompile.stdout, /surface-pair-bidirectional-sync/);

  const strictCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-strict"),
    "--force",
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictCompile.status, 0);
  assert.match(strictCompile.stdout, /FAIL compile corpus/);
  assert.match(strictCompile.stdout, /strict gate blocked by warnings/);
  assert.match(strictCompile.stdout, /target not updated because strict gate failed/);
  assert.match(strictCompile.stdout, /surface-pair-bidirectional-sync/);
  assert.equal(fs.existsSync(path.join(tempDir, "compiled-strict", "manifest.json")), false);

  const preservedRoot = path.join(tempDir, "compiled-preserved");
  fs.mkdirSync(preservedRoot, { recursive: true });
  fs.writeFileSync(path.join(preservedRoot, "sentinel.txt"), "keep me");
  const preservedCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    preservedRoot,
    "--force",
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(preservedCompile.status, 0);
  assert.equal(fs.readFileSync(path.join(preservedRoot, "sentinel.txt"), "utf8"), "keep me");
  assert.equal(fs.existsSync(path.join(preservedRoot, "manifest.json")), false);

  const strictJsonCompile = spawnSync("node", [
    CLI_PATH,
    "compile",
    sourcePath,
    path.join(tempDir, "compiled-strict-json"),
    "--force",
    "--strict",
    "--json"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictJsonCompile.status, 0);
  const strictJson = JSON.parse(strictJsonCompile.stdout);
  assert.equal(strictJson.strict, true);
  assert.equal(strictJson.status, "fail");
  assert.equal(strictJson.accepted, false);
  assert.equal(strictJson.written, false);
  assert.deepEqual(strictJson.created_files, []);
  assert.equal(strictJson.validation.errors, 0);
  assert.ok(strictJson.validation.warnings > 0);
});

test("authoring source can pin compiled manifest timestamps", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-authoring-timestamps-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.created = "2026-01-02T03:04:05Z";
  source.corpus.updated = "2026-01-02T03:04:05Z";
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  let manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  assert.equal(manifest.created, "2026-01-02T03:04:05Z");
  assert.equal(manifest.updated, "2026-01-02T03:04:05Z");

  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  assert.equal(manifest.created, "2026-01-02T03:04:05Z");
  assert.equal(manifest.updated, "2026-01-02T03:04:05Z");
});

test("authoring source can compile root project topology", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-authoring-topology-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "example/demo-docs",
      role: "design",
      branch: "main",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "example/demo-api",
        role: "service",
        branch: "main",
        status: "current"
      },
      {
        id: "demo-worker",
        locator: "example/demo-worker",
        role: "worker",
        branch: "release-next",
        status: "planned"
      }
    ],
    topology_type: "multi-repo",
    status: "partial",
    notes: "Compile path should preserve root topology metadata."
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));

  assert.deepEqual(manifest.project_topology, source.corpus.project_topology);
});

test("authoring source compiles glossary registry v2 records", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-glossary-registry-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  source.corpus.glossary = {
    system: "Demo system shorthand definition",
    "release-window": {
      definition: "Approved deployment window for production changes.",
      aliases: [
        "release slot",
        "deployment window"
      ],
      deprecated_terms: [
        {
          term: "ship window",
          replacement: "release-window",
          reason: "Use one canonical term for release coordination.",
          status: "deprecated"
        }
      ],
      scope: "system",
      owner: detailModule.id,
      linked_surfaces: [
        `${detailModule.id}:${detailModule.sections[0].sid}`
      ],
      status: "current"
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  const companion = JSON.parse(fs.readFileSync(path.join(compiledRoot, manifest.companion_index), "utf8"));

  assert.deepEqual(companion.glossary, source.corpus.glossary);
});

test("glossary registry validation rejects ambiguous aliases and unresolved refs during compile", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-glossary-registry-invalid-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  source.corpus.glossary = {
    "release-window": {
      definition: "Approved deployment window for production changes.",
      aliases: [
        "window"
      ],
      deprecated_terms: [
        {
          term: "ship window",
          replacement: "missing-term",
          reason: "Replacement must resolve to a current term.",
          status: "deprecated"
        }
      ],
      linked_surfaces: [
        `${detailModule.id}:missing-section`
      ],
      status: "current"
    },
    "maintenance-window": {
      definition: "Operational maintenance interval.",
      aliases: [
        "window"
      ],
      status: "current"
    },
    "ops-window": {
      definition: "Module-scoped operational interval.",
      deprecated_terms: [
        {
          term: "module-only",
          replacement: "release-window",
          reason: "Replacement must resolve inside the same scope.",
          status: "deprecated"
        }
      ],
      scope: "module:ops",
      status: "current"
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, compiledRoot, "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /glossary-alias-unique/);
  assert.match(compile.stdout, /glossary-deprecated-replacement-ref/);
  assert.match(compile.stdout, /module-only -> release-window/);
  assert.match(compile.stdout, /glossary-linked-surface-ref/);
});

test("authoring source compiles external citation registry and local refs", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-external-citation-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    external_citations: [
      {
        citation_id: "api-doc-release-window",
        source_type: "api-doc",
        locator: "https://example.test/docs/release-window",
        version_or_date: "2026-05-08",
        authority_relation: "external-authority",
        claim_posture: "authoritative-claim",
        uncertainty: "low",
        review_status: "current"
      },
      {
        citation_id: "operator-assumption",
        source_type: "assumption",
        authority_relation: "unsupported-assumption",
        claim_posture: "assumption",
        uncertainty: "high",
        review_status: "unresolved"
      }
    ]
  };
  detailModule.sections[0].citation_refs = [
    "api-doc-release-window"
  ];
  detailModule.artifacts = [
    ...(detailModule.artifacts ?? []),
    {
      artifact_id: "citation-backed-decision",
      type: "decision-tree",
      usage: "Demonstrates external citation refs on a stable decision artifact.",
      citation_refs: [
        "api-doc-release-window"
      ],
      decision_provenance: {
        consumer_surface: "agent-consumable",
        basis: "source-evidence",
        source_refs: [
          `${detailModule.id}:${detailModule.sections[0].sid}`
        ],
        evidence_status: "current",
        consumption_gate: "stable",
        citation_refs: [
          "api-doc-release-window"
        ]
      },
      content: {
        root: "route",
        nodes: [
          {
            id: "route",
            type: "action",
            action: "use current external citation only after local authority review"
          }
        ]
      }
    }
  ];
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);

  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  const detailRef = manifest.modules.find((entry) => entry.id === detailModule.id);
  const compiled = JSON.parse(fs.readFileSync(path.join(compiledRoot, detailRef.path), "utf8"));
  assert.deepEqual(compiled.meta.external_citations, detailModule.meta.external_citations);
  assert.deepEqual(compiled.sections[0].citation_refs, [
    "api-doc-release-window"
  ]);
  const decisionArtifact = compiled.artifacts.find((artifact) => artifact.artifact_id === "citation-backed-decision");
  assert.deepEqual(decisionArtifact.decision_provenance.citation_refs, [
    "api-doc-release-window"
  ]);
});

test("external citation validation rejects missing and unsafe authoritative refs", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-external-citation-invalid-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    external_citations: [
      {
        citation_id: "stale-authority",
        source_type: "api-doc",
        authority_relation: "external-authority",
        claim_posture: "authoritative-claim",
        review_status: "stale"
      },
      {
        citation_id: "stale-authority",
        source_type: "api-doc",
        locator: "https://example.test/duplicate",
        version_or_date: "2026-05-08",
        authority_relation: "supporting-evidence",
        claim_posture: "paraphrase",
        review_status: "current"
      },
      {
        citation_id: "assumption-as-authority",
        source_type: "assumption",
        authority_relation: "external-authority",
        claim_posture: "authoritative-claim",
        review_status: "current"
      }
    ]
  };
  detailModule.sections[0].citation_refs = [
    "missing-citation"
  ];
  detailModule.artifacts = [
    ...(detailModule.artifacts ?? []),
    {
      artifact_id: "unsafe-cited-decision",
      type: "decision-tree",
      usage: "Negative citation validation fixture.",
      decision_provenance: {
        consumer_surface: "agent-consumable",
        basis: "source-evidence",
        source_refs: [
          `${detailModule.id}:${detailModule.sections[0].sid}`
        ],
        evidence_status: "current",
        consumption_gate: "stable",
        citation_refs: [
          "stale-authority"
        ]
      },
      content: {
        root: "route",
        nodes: [
          {
            id: "route",
            type: "action",
            action: "invalid stable citation posture"
          }
        ]
      }
    }
  ];
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, compiledRoot, "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /external-citation-id-unique/);
  assert.match(compile.stdout, /external-citation-ref/);
  assert.match(compile.stdout, /external-citation-authoritative-completeness/);
  assert.match(compile.stdout, /external-citation-assumption-posture/);
  assert.match(compile.stdout, /external-citation-stable-current/);
});

test("authoring source compiles implementation linkage and reports topology-aware reality summary", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-authoring-implementation-linkage-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      branch: "main",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        branch: "main",
        status: "current"
      }
    ],
    topology_type: "multi-repo",
    status: "partial"
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js",
        "test/change.test.js"
      ],
      status: "current",
      pr_refs: [
        "PR-77"
      ],
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "change-handler-test",
          kind: "test",
          locator: "test/change.test.js",
          status: "current",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        },
        {
          id: "change-handler-ci",
          kind: "ci-check",
          locator: "demo-api-change-handler",
          status: "planned",
          freshness_policy: "on-schema-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ],
      acceptance_criteria: [
        {
          id: "change-handler-contract",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Change handler tests prove the declared approval contract still matches implementation behavior.",
          check_type: "evidence-ref",
          evidence_refs: [
            "change-handler-test"
          ],
          blocking: "strict",
          status: "satisfied",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const manifestPath = path.join(compiledRoot, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const detailRef = manifest.modules.find((entry) => entry.id === detailModule.id);
  assert.deepEqual(detailRef.implementation, {
    repo_id: "demo-api",
    paths: [
      "src/handlers/change.js",
      "test/change.test.js"
    ],
    status: "current",
    pr_refs: [
      "PR-77"
    ],
    authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
    evidence_summary: {
      total: 2,
      current: 1,
      planned: 1,
      stale: 0,
      blocked: 0
    },
    acceptance_summary: {
      total: 1,
      satisfied: 1,
      planned: 0,
      partial: 0,
      waived: 0,
      blocked: 0,
      manual_review: 0
    }
  });

  const realityJson = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--reality", "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(realityJson.status, 0);
  const realityReport = JSON.parse(realityJson.stdout);
  assert.deepEqual(realityReport.topology, {
    linked_modules: 1,
    unlinked_modules: 0,
    checked_paths: 0,
    missing_paths: 0,
    evidence_total: 2,
    modules_with_evidence: 1,
    modules_without_evidence: 0,
    current_evidence: 1,
    planned_evidence: 1,
    stale_evidence: 0,
    blocked_evidence: 0,
    checked_evidence_locators: 0,
    missing_evidence_locators: 0,
    unchecked_repos: [
      {
        repo_id: "demo-api",
        locator: "external/demo-api",
        reason: "locator path does not exist under --repo-root"
      }
    ],
    unchecked_reason: "demo-api locator path does not exist under --repo-root: external/demo-api"
  });
  assert.equal(realityReport.levels.L3.warnings.some((issue) => issue.rule === "topology-reality-unchecked"), false);

  detailRef.implementation.repo_id = "demo-worker";
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const mismatchValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(mismatchValidate.status, 0);
  assert.match(mismatchValidate.stdout, /implementation-metadata-match/);

  const detailPath = path.join(compiledRoot, detailRef.path);
  const detail = JSON.parse(fs.readFileSync(detailPath, "utf8"));
  detail.meta.implementation.repo_id = "demo-worker";
  fs.writeFileSync(detailPath, `${JSON.stringify(detail, null, 2)}\n`);
  const invalidRepoValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(invalidRepoValidate.status, 0);
  assert.match(invalidRepoValidate.stdout, /implementation-repo-ref/);
});

test("current implementation linkage requires declared evidence", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-evidence-required-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, path.join(tempDir, "compiled"), "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /implementation-evidence-required/);
});

test("current implementation linkage requires acceptance criteria", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-criteria-required-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "change-handler-test",
          kind: "test",
          locator: "test/change.test.js",
          status: "current",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, path.join(tempDir, "compiled"), "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /implementation-acceptance-criteria-required/);
});

test("implementation acceptance criteria must resolve evidence refs and unique ids", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-criteria-refs-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "change-handler-test",
          kind: "test",
          locator: "test/change.test.js",
          status: "current",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ],
      acceptance_criteria: [
        {
          id: "change-handler-contract",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Change handler tests prove the declared approval contract still matches implementation behavior.",
          check_type: "evidence-ref",
          evidence_refs: [
            "missing-evidence"
          ],
          blocking: "strict",
          status: "satisfied",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        },
        {
          id: "change-handler-contract",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Duplicate criterion ids must be rejected before stable consumption.",
          check_type: "manual-review",
          blocking: "none",
          status: "planned",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, path.join(tempDir, "compiled"), "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /implementation-acceptance-criteria-id-unique/);
  assert.match(compile.stdout, /implementation-acceptance-criteria-evidence-ref/);
});

test("manual implementation acceptance criteria stay visible as warnings", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-criteria-manual-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "change-handler-review",
          kind: "manual-review",
          locator: "review/change-handler",
          status: "current",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ],
      acceptance_criteria: [
        {
          id: "change-handler-manual-review",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Reviewer confirms the declared contract still maps to implementation behavior.",
          check_type: "manual-review",
          blocking: "none",
          status: "satisfied",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(validate.status, 0);
  assert.match(validate.stdout, /implementation-acceptance-criteria-manual-review/);
});

test("validator JSON includes remediation guidance for implementation drift findings", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-remediation-guidance-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "change-handler-test",
          kind: "test",
          locator: "test/change.test.js",
          status: "current",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ],
      acceptance_criteria: [
        {
          id: "change-handler-contract",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Change handler tests prove the declared approval contract still matches implementation behavior.",
          check_type: "evidence-ref",
          evidence_refs: [
            "change-handler-test"
          ],
          blocking: "strict",
          status: "satisfied",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  const detailRef = manifest.modules.find((entry) => entry.id === detailModule.id);
  const detailPath = path.join(compiledRoot, detailRef.path);
  const detail = JSON.parse(fs.readFileSync(detailPath, "utf8"));
  delete detail.meta.implementation.acceptance_criteria;
  fs.writeFileSync(detailPath, `${JSON.stringify(detail, null, 2)}\n`);

  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(validate.status, 0);
  const report = JSON.parse(validate.stdout);
  const issue = report.levels.L2.errors.find((entry) => entry.rule === "implementation-acceptance-criteria-required");
  assert.ok(issue);
  assert.deepEqual(issue.remediation, {
    action: "add-acceptance-criteria",
    gate: "drift-blocking",
    guidance: "Declare module.meta.implementation.acceptance_criteria[] that links the current implementation contract to evidence, validator rules, fixtures, or manual review."
  });

  const textValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(textValidate.status, 0);
  assert.match(textValidate.stdout, /remediation=add-acceptance-criteria\/drift-blocking/);
});

test("decision provenance blocks stable consumption when evidence is unresolved", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-decision-provenance-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);

  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  const detailRef = manifest.modules.find((entry) => entry.id === detailModule.id);
  const detailPath = path.join(compiledRoot, detailRef.path);
  const detail = JSON.parse(fs.readFileSync(detailPath, "utf8"));
  detail.artifacts = [
    ...(detail.artifacts ?? []),
    {
      artifact_id: "approval-routing",
      type: "decision-tree",
      usage: "Selects the approval path for agent-visible changes.",
      decision_provenance: {
        consumer_surface: "agent-consumable",
        basis: "source-evidence",
        source_refs: [
          `${detail.module_id}:${detail.sections[0].sid}`
        ],
        evidence_refs: [
          "missing-review-evidence"
        ],
        evidence_status: "unresolved",
        consumption_gate: "stable"
      },
      content: {
        root: "route",
        nodes: [
          {
            id: "route",
            type: "condition",
            eval: "change.kind",
            branches: [
              {
                value: "policy",
                next: "require-review"
              }
            ],
            default: "allow"
          },
          {
            id: "require-review",
            type: "action",
            action: "require maintainer review"
          },
          {
            id: "allow",
            type: "action",
            action: "allow local iteration"
          }
        ]
      }
    }
  ];
  fs.writeFileSync(detailPath, `${JSON.stringify(detail, null, 2)}\n`);

  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(validate.status, 0);
  const report = JSON.parse(validate.stdout);
  assert.ok(report.levels.L2.errors.some((entry) => entry.rule === "decision-provenance-evidence-ref"));
  assert.ok(report.levels.L2.errors.some((entry) => entry.rule === "decision-provenance-stable-evidence"));
});

test("reality validation rejects missing path-like implementation evidence locators", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-evidence-reality-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const repoRoot = path.join(tempDir, "external", "demo-api");
  fs.mkdirSync(path.join(repoRoot, "src", "handlers"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "src", "handlers", "change.js"), "export function handleChange() {}\n");

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "missing-change-test",
          kind: "test",
          locator: "test/change.test.js",
          status: "current",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ],
      acceptance_criteria: [
        {
          id: "change-handler-contract",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Change handler tests prove the declared approval contract still matches implementation behavior.",
          check_type: "evidence-ref",
          evidence_refs: [
            "missing-change-test"
          ],
          blocking: "strict",
          status: "satisfied",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const realityValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--reality", "--repo-root", tempDir], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(realityValidate.status, 0);
  assert.match(realityValidate.stdout, /implementation-evidence-locator-exists/);
  assert.match(realityValidate.stdout, /missing_evidence_locators=1/);
});

test("reality validation summarizes stale and current implementation evidence posture", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-evidence-posture-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      }
    ]
  };
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    implementation: {
      repo_id: "demo-api",
      paths: [
        "src/handlers/change.js"
      ],
      status: "current",
      authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`,
      evidence: [
        {
          id: "stale-change-test",
          kind: "test",
          locator: "test/change.test.js",
          status: "stale",
          freshness_policy: "on-contract-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        },
        {
          id: "planned-change-ci",
          kind: "ci-check",
          locator: "demo-api-change-handler",
          status: "planned",
          freshness_policy: "on-schema-change",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ],
      acceptance_criteria: [
        {
          id: "change-handler-contract",
          surface_ref: `${detailModule.id}:${detailModule.sections[0].sid}`,
          requirement: "Change handler tests prove the declared approval contract still matches implementation behavior.",
          check_type: "evidence-ref",
          evidence_refs: [
            "stale-change-test"
          ],
          blocking: "strict",
          status: "satisfied",
          authority_surface: `${detailModule.id}:${detailModule.sections[0].sid}`
        }
      ]
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const realityValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--reality", "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(realityValidate.status, 0);
  const report = JSON.parse(realityValidate.stdout);

  assert.equal(report.topology.evidence_total, 2);
  assert.equal(report.topology.current_evidence, 0);
  assert.equal(report.topology.planned_evidence, 1);
  assert.equal(report.topology.stale_evidence, 1);
  assert.equal(report.topology.blocked_evidence, 0);
  assert.ok(report.levels.L3.warnings.some((entry) => entry.rule === "implementation-evidence-stale" && entry.remediation?.action === "refresh-evidence"));
  assert.ok(report.levels.L3.warnings.some((entry) => entry.rule === "implementation-current-evidence-missing" && entry.remediation?.action === "refresh-current-evidence"));
});

test("reality validation reports actionable unchecked implementation repo locators", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-locator-reality-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "remote-detail",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Remote implementation authority"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "missing-api",
        locator: "external/missing-api",
        role: "service",
        status: "current"
      },
      {
        id: "remote-api",
        locator: "https://github.com/example/remote-api",
        role: "service",
        status: "current"
      }
    ]
  };

  const linkedModules = [
    { module: source.modules.find((entry) => entry.layer === "detail" && entry.id !== "remote-detail"), repoId: "missing-api" },
    { module: source.modules.find((entry) => entry.id === "remote-detail"), repoId: "remote-api" }
  ];
  for (const { module, repoId } of linkedModules) {
    module.meta = {
      ...(module.meta ?? {}),
      implementation: {
        repo_id: repoId,
        paths: [
          "src/handler.js"
        ],
        status: "current",
        authority_surface: `${module.id}:${module.sections[0].sid}`,
        evidence: [
          {
            id: `${repoId}-manual-review`,
            kind: "manual-review",
            locator: "review-record",
            status: "current",
            authority_surface: `${module.id}:${module.sections[0].sid}`
          }
        ],
        acceptance_criteria: [
          {
            id: `${repoId}-criterion`,
            surface_ref: `${module.id}:${module.sections[0].sid}`,
            requirement: "Manual review confirms implementation locator status before stable consumption.",
            check_type: "manual-review",
            blocking: "strict",
            status: "satisfied",
            authority_surface: `${module.id}:${module.sections[0].sid}`
          }
        ]
      }
    };
  }
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const realityValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--reality", "--repo-root", tempDir, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(realityValidate.status, 0);
  const report = JSON.parse(realityValidate.stdout);
  assert.deepEqual(report.topology.unchecked_repos, [
    {
      repo_id: "missing-api",
      locator: "external/missing-api",
      reason: "locator path does not exist under --repo-root"
    },
    {
      repo_id: "remote-api",
      locator: "https://github.com/example/remote-api",
      reason: "remote locator cannot be resolved from --repo-root"
    }
  ]);
  assert.match(report.topology.unchecked_reason, /missing-api locator path does not exist under --repo-root: external\/missing-api/);
  assert.match(report.topology.unchecked_reason, /remote-api remote locator cannot be resolved from --repo-root: https:\/\/github.com\/example\/remote-api/);
});

test("authoring source compiles stable contract metadata summaries", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-authoring-stable-contract-summaries-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    redaction: {
      has_sensitive_payloads: true,
      sensitive_classes: [
        "secret"
      ],
      redaction_posture: "handle-only",
      exposure_policy: "Stable consumers may receive handles only."
    },
    contract: {
      profile: "read-model",
      required_fields: [
        "source",
        "fields",
        "freshness"
      ],
      read_model: {
        source: "demo-system",
        fields: [
          "id",
          "status"
        ],
        identity: "id",
        freshness: {
          snapshot_id: "demo-snapshot-1",
          exported_at: "2026-05-07T00:00:00Z",
          source_watermark: "demo-watermark-1",
          staleness: "current"
        },
        absence_semantics: "Missing records are absent from the source snapshot.",
        failure_semantics: "Validation fails if the snapshot cannot be exported."
      }
    },
    schema_versioning: {
      breaking_policy: "versioned",
      compatibility_window: "one minor release",
      removal_guidance: "Declare a replacement before removal."
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  const detailRef = manifest.modules.find((entry) => entry.id === detailModule.id);

  assert.deepEqual(detailRef.redaction, {
    has_sensitive_payloads: true,
    redaction_posture: "handle-only"
  });
  assert.deepEqual(detailRef.contract, {
    profile: "read-model"
  });
  assert.deepEqual(detailRef.schema_versioning, {
    breaking_policy: "versioned"
  });
  runCli(["validate", compiledRoot, "--strict"]);
});

test("stable read-model contracts require freshness and watermark metadata", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-read-model-freshness-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const detailModule = source.modules.find((entry) => entry.layer === "detail");
  detailModule.meta = {
    ...(detailModule.meta ?? {}),
    contract: {
      profile: "read-model"
    }
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, compiledRoot, "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /read-model-freshness-required/);
  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  assert.notEqual(validate.status, 0);
  const report = JSON.parse(validate.stdout);
  assert.ok(report.levels.L2.errors.some((entry) => entry.rule === "read-model-freshness-required"));
});

test("project topology rejects duplicate implementation repo ids", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-duplicate-implementation-repos-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.corpus.project_topology = {
    design_repo: {
      id: "demo-docs",
      locator: "docs",
      role: "design",
      status: "current"
    },
    implementation_repos: [
      {
        id: "demo-api",
        locator: "external/demo-api",
        role: "service",
        status: "current"
      },
      {
        id: "demo-api",
        locator: "external/demo-worker",
        role: "worker",
        status: "partial"
      }
    ]
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  const compile = spawnSync("node", [CLI_PATH, "compile", sourcePath, compiledRoot, "--force"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(compile.status, 0);
  assert.match(compile.stdout, /implementation-repo-id-unique/);
});

test("authoring scaffold helpers update source, pair surfaces, and compile successfully", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-authoring-scaffold-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority",
    "--role",
    "doc-author"
  ]);
  runCli([
    "scaffold",
    "authoring-touch",
    sourcePath,
    "--match",
    "package.json",
    "--load",
    "demo-system-root",
    "--load",
    "delivery-gates",
    "--intent",
    "write"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-log",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-LOG.md"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  assert.ok(source.modules.some((module) => module.id === "delivery-gates"));
  assert.ok(
    source.boot.by_touch.some(
      (route) =>
        route.match === "package.json" &&
        route.intent === "write" &&
        route.load_modules.includes("delivery-gates")
    )
  );
  assert.ok(
    source.boot.by_touch.some(
      (route) =>
        route.match === "DELIVERY-LOG.md" &&
        route.intent === "write" &&
        route.load_modules.includes("delivery-gates")
    )
  );
  assert.ok(
    source.surface_pairs.some(
      (pair) => pair.pair_id === "pair-delivery-log" && pair.agent_primary === "delivery-gates"
    )
  );
  assert.ok(source.files.some((file) => file.path === "DELIVERY-LOG.md"));
  assert.ok(fs.existsSync(path.join(tempDir, "DELIVERY-LOG.md")));
  assert.ok(
    source.corpus.roles
      .find((role) => role.id === "doc-author")
      .required_modules.includes("delivery-gates")
  );

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);
});

test("validate --strict turns warning-only output into a failing gate", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-validate-strict-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-log",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-LOG.md"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  source.surface_pairs[0].sync_source = "bidirectional";
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const warningRoot = path.join(tempDir, "compiled-warning");
  runCli(["compile", sourcePath, warningRoot, "--force"]);

  const strictValidate = spawnSync("node", [
    CLI_PATH,
    "validate",
    warningRoot,
    "--strict"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictValidate.status, 0);
  assert.match(strictValidate.stdout, /FAIL .*compiled-warning/);
  assert.match(strictValidate.stdout, /strict gate blocked by warnings/);
  assert.match(strictValidate.stdout, /L3 FAIL errors=0 warnings=1/);
  assert.match(strictValidate.stdout, /surface-pair-bidirectional-sync/);

  const strictValidateJson = spawnSync("node", [
    CLI_PATH,
    "validate",
    warningRoot,
    "--strict",
    "--json"
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictValidateJson.status, 0);
  const strictValidateReport = JSON.parse(strictValidateJson.stdout);
  assert.equal(strictValidateReport.strict, true);
  assert.equal(strictValidateReport.accepted, false);
  assert.equal(strictValidateReport.status, "fail");
  assert.equal(strictValidateReport.levels.L3.pass, false);
  assert.equal(strictValidateReport.summary.errors, 0);
  assert.equal(strictValidateReport.summary.warnings, 1);
});

test("large corpora warn when boot_by_touch is empty", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-empty-touch-routes-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  for (let index = 1; index <= 9; index += 1) {
    runCli([
      "scaffold",
      "authoring-module",
      sourcePath,
      `policy-module-${index}`,
      "--category",
      "policy",
      "--layer",
      "detail",
      "--scope",
      `Policy module ${index}`
    ]);
  }

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  const manifestPath = path.join(compiledRoot, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  delete manifest.boot_by_touch;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const runtimePath = path.join(compiledRoot, "indexes", "runtime.json");
  const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
  runtime.boot_by_touch = [];
  fs.writeFileSync(runtimePath, `${JSON.stringify(runtime)}\n`);

  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(validate.status, 0);
  assert.match(validate.stdout, /WARN boot-by-touch-empty-large-corpus/);

  const strictValidate = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--strict"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(strictValidate.status, 0);
  assert.match(strictValidate.stdout, /boot-by-touch-empty-large-corpus/);
});

test("capsule size diagnostics include compared token counts", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-capsule-diagnostics-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);

  const manifest = JSON.parse(fs.readFileSync(path.join(compiledRoot, "manifest.json"), "utf8"));
  const capsuleRef = manifest.modules.find((entry) => entry.category === "capsule");
  const detailRef = manifest.modules.find((entry) => entry.layer === "detail");
  const capsulePath = path.join(compiledRoot, capsuleRef.path);
  const detailPath = path.join(compiledRoot, detailRef.path);
  const capsule = JSON.parse(fs.readFileSync(capsulePath, "utf8"));
  const detail = JSON.parse(fs.readFileSync(detailPath, "utf8"));

  capsule.sections[0].content = Array.from({ length: 80 }, (_, index) => `capsule detail ${index}`).join(" ");
  detail.sections[0].content = "short detail.";
  fs.writeFileSync(capsulePath, `${JSON.stringify(capsule, null, 2)}\n`);
  fs.writeFileSync(detailPath, `${JSON.stringify(detail, null, 2)}\n`);

  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.equal(validate.status, 0);
  assert.match(validate.stdout, /WARN capsule-shorter-than-detail/);
  assert.match(validate.stdout, /capsule content \(\d+ tokens approx\) is not shorter than routed module/);
  assert.match(validate.stdout, /\(\d+ tokens approx\)/);
});

test("stable contract metadata requires mirror and sensitive completeness", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-stable-contract-metadata-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);

  const manifestPath = path.join(compiledRoot, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const detailRef = manifest.modules.find((entry) => entry.layer === "detail");
  const detailPath = path.join(compiledRoot, detailRef.path);
  const detail = JSON.parse(fs.readFileSync(detailPath, "utf8"));

  detail.meta = {
    ...(detail.meta ?? {}),
    redaction: {
      has_sensitive_payloads: true,
      redaction_posture: "redact"
    },
    contract: {
      profile: "read-model"
    },
    schema_versioning: {
      breaking_policy: "versioned"
    }
  };
  fs.writeFileSync(detailPath, `${JSON.stringify(detail, null, 2)}\n`);

  detailRef.redaction = {
    has_sensitive_payloads: false,
    redaction_posture: "none"
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const validate = spawnSync("node", [CLI_PATH, "validate", compiledRoot], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(validate.status, 0);
  assert.match(validate.stdout, /redaction-metadata-match/);
  assert.match(validate.stdout, /redaction-sensitive-completeness/);
  assert.match(validate.stdout, /contract-metadata-mirror/);
  assert.match(validate.stdout, /schema-versioning-metadata-mirror/);
});

test("shared invariants tolerate case and punctuation normalization without weakening drift checks", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-shared-invariants-normalized-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-guide",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-GUIDE.md"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const module = source.modules.find((entry) => entry.id === "delivery-gates");
  module.sections[0].content = "Rollback owner must be named before execution.";
  const humanFile = source.files.find((file) => file.path === "DELIVERY-GUIDE.md");
  delete humanFile.source_path;
  humanFile.content = "rollback owner must be named before execution";
  source.surface_pairs.find((pair) => pair.pair_id === "pair-delivery-guide").shared_invariants = [
    "Rollback owner must be named before execution."
  ];
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);
});

test("implementation-governance pattern scaffolds delivery-governor artifacts", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-implementation-governance-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "release-governance",
    "--pattern",
    "implementation-governance",
    "--role",
    "doc-author"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const module = source.modules.find((entry) => entry.id === "release-governance");

  assert.ok(module);
  assert.equal(module.category, "policy");
  assert.equal(module.layer, "detail");
  assert.ok(module.tags.includes("implementation"));
  assert.ok(module.tags.includes("review"));
  assert.ok(module.sections.some((section) => section.sid === "implementation-governance"));
  assert.ok(module.sections.some((section) => section.sid === "review-routing-policy"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "implementation-matrix" && artifact.type === "mapping-table"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "system-gates" && artifact.type === "rule-set"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "runtime-contract-table" && artifact.type === "mapping-table"));
  assert.ok(module.artifacts.some((artifact) => artifact.artifact_id === "review-routing" && artifact.type === "decision-tree"));
  assert.deepEqual(module.meta.control.timing, ["pre-commit", "ci", "runtime"]);
  assert.equal(module.meta.runtime_contract.side_effects[0], "release-gate-decision");
  assert.ok(
    source.corpus.roles
      .find((role) => role.id === "doc-author")
      .required_modules.includes("release-governance")
  );

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);
});

test("authoring-pair can declare deterministic generated human output", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aods-generated-pair-"));
  runCli(["scaffold", "authoring", tempDir, "--sys", "demo-system", "--force"]);

  const sourcePath = path.join(tempDir, "authoring.json");
  runCli([
    "scaffold",
    "authoring-module",
    sourcePath,
    "delivery-gates",
    "--category",
    "policy",
    "--layer",
    "detail",
    "--scope",
    "Delivery gate authority"
  ]);
  runCli([
    "scaffold",
    "authoring-pair",
    sourcePath,
    "--pair-id",
    "pair-delivery-guide",
    "--agent-primary",
    "delivery-gates",
    "--human-primary",
    "DELIVERY-GUIDE.md",
    "--generated-profile",
    "overview",
    "--generated-title",
    "Delivery Guide"
  ]);

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const pair = source.surface_pairs.find((entry) => entry.pair_id === "pair-delivery-guide");
  assert.equal(pair.human_generation.mode, "deterministic");
  assert.equal(pair.human_generation.profile, "overview");
  assert.equal(pair.human_generation.title, "Delivery Guide");
  assert.equal(source.files?.some((file) => file.path === "DELIVERY-GUIDE.md"), false);
  assert.ok(
    source.boot.by_touch.some(
      (route) =>
        route.match === "DELIVERY-GUIDE.md" &&
        route.intent === "write" &&
        route.load_modules.includes("delivery-gates")
    )
  );

  const compiledRoot = path.join(tempDir, "compiled");
  runCli(["compile", sourcePath, compiledRoot, "--force"]);
  runCli(["validate", compiledRoot, "--strict"]);

  const generatedPath = path.join(compiledRoot, "DELIVERY-GUIDE.md");
  assert.ok(fs.existsSync(generatedPath));
  const generatedText = fs.readFileSync(generatedPath, "utf8");
  assert.match(generatedText, /AODS GENERATED: pair_id=pair-delivery-guide mode=deterministic profile=overview/);
  assert.match(generatedText, /# Delivery Guide/);
  assert.match(generatedText, /Generated deterministically from AODS agent-primary authority/);

  fs.writeFileSync(generatedPath, `${generatedText}manual drift\n`);
  const driftResult = spawnSync("node", [CLI_PATH, "validate", compiledRoot, "--strict"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  assert.notEqual(driftResult.status, 0);
  assert.match(
    `${driftResult.stdout}\n${driftResult.stderr}`,
    /generated human_primary is out of sync with deterministic render/
  );
});
