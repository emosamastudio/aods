import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { runAodsJson } from "./aods-loading.mjs";
import { compilePilotCorpus, updateSurfaceInventoryEntry } from "./compiled-pilot.mjs";
import { copyDir } from "./helpers.mjs";

const GENERATED_HUMAN_SURFACE = "generated-human-surface";
const REALITY_VALIDATION = "reality-validation";

const RELEASE_SURFACE_SCENARIOS = [
  {
    id: "generated-surface-control",
    category: GENERATED_HUMAN_SURFACE,
    description: "Clean deterministic generated human surface passes strict validation.",
    validateArgs: ["--strict"],
    isControl: true
  },
  {
    id: "generated-surface-drift",
    category: GENERATED_HUMAN_SURFACE,
    description: "Manual drift in a generated human surface is rejected by deterministic re-render validation.",
    validateArgs: ["--strict"],
    expectedRule: "surface-pair-generated-human-primary",
    mutate(corpusRoot) {
      fs.appendFileSync(path.join(corpusRoot, "README.md"), "manual drift\n");
    }
  },
  {
    id: "reality-control",
    category: REALITY_VALIDATION,
    description: "Clean compiled pilot passes strict reality validation.",
    validateArgs: ["--strict", "--reality"],
    isControl: true
  },
  {
    id: "reality-missing-current",
    category: REALITY_VALIDATION,
    description: "Missing current release surface is rejected by reality validation.",
    validateArgs: ["--strict", "--reality"],
    expectedRule: "surface-inventory-current-missing",
    mutate(corpusRoot) {
      updateSurfaceInventoryEntry(corpusRoot, "pilot-readme", (entry) => {
        entry.path = "missing-current.md";
      });
    }
  },
  {
    id: "reality-kind-mismatch",
    category: REALITY_VALIDATION,
    description: "Wrong current surface kind is rejected by reality validation.",
    validateArgs: ["--strict", "--reality"],
    expectedRule: "surface-inventory-kind",
    mutate(corpusRoot) {
      updateSurfaceInventoryEntry(corpusRoot, "pilot-readme", (entry) => {
        entry.path = "modules";
      });
    }
  },
  {
    id: "reality-duplicate-current",
    category: REALITY_VALIDATION,
    description: "Duplicate current surface declarations are rejected by reality validation.",
    validateArgs: ["--strict", "--reality"],
    expectedRule: "surface-inventory-duplicate-current",
    mutate(corpusRoot) {
      updateSurfaceInventoryEntry(corpusRoot, "draft-release-checklist", (entry) => {
        entry.path = "./README.md";
        entry.kind = "file";
        entry.state = "current";
      });
    }
  },
  {
    id: "reality-placeholder-directory",
    category: REALITY_VALIDATION,
    description: "Placeholder-only current directories are rejected by reality validation.",
    validateArgs: ["--strict", "--reality"],
    expectedRule: "surface-inventory-placeholder-directory",
    mutate(corpusRoot) {
      updateSurfaceInventoryEntry(corpusRoot, "module-directory", (entry) => {
        entry.path = "scratch-placeholder";
      });
      fs.mkdirSync(path.join(corpusRoot, "scratch-placeholder"), { recursive: true });
      fs.writeFileSync(path.join(corpusRoot, "scratch-placeholder", ".gitkeep"), "");
    }
  }
];

export function evaluateReleaseSurfaceTrust() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-release-surface-"));
  const baselineRoot = path.join(tempRoot, "baseline");

  try {
    compilePilotCorpus(baselineRoot);
    const scenarioResults = RELEASE_SURFACE_SCENARIOS.map((scenario) =>
      runReleaseSurfaceScenario(tempRoot, baselineRoot, scenario)
    );
    const generatedHumanSurface = summarizeCategory(
      scenarioResults.filter((scenario) => scenario.category === GENERATED_HUMAN_SURFACE)
    );
    const realityValidation = summarizeCategory(
      scenarioResults.filter((scenario) => scenario.category === REALITY_VALIDATION)
    );
    const hazardScenarios = scenarioResults.filter((scenario) => !scenario.is_control);
    const controlScenarios = scenarioResults.filter((scenario) => scenario.is_control);

    return {
      scenario_results: scenarioResults,
      generated_human_surface: generatedHumanSurface,
      reality_validation: realityValidation,
      combined_recall:
        hazardScenarios.length === 0 ? 1 : hazardScenarios.filter((scenario) => scenario.success).length / hazardScenarios.length,
      combined_false_positive_rate:
        controlScenarios.length === 0 ? 0 : controlScenarios.filter((scenario) => !scenario.success).length / controlScenarios.length
    };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runReleaseSurfaceScenario(tempRoot, baselineRoot, scenario) {
  const corpusRoot = path.join(tempRoot, scenario.id);
  copyDir(baselineRoot, corpusRoot);
  scenario.mutate?.(corpusRoot);

  const report = runAodsJson(["validate", corpusRoot, ...scenario.validateArgs, "--json"]);
  const detectedRules = collectRules(report);
  const hasIssue = report.summary.errors > 0 || report.summary.warnings > 0;
  const matchedExpectedRule = scenario.expectedRule ? detectedRules.includes(scenario.expectedRule) : null;

  return {
    id: scenario.id,
    category: scenario.category,
    description: scenario.description,
    validate_mode: scenario.validateArgs.includes("--reality") ? "strict+reality" : "strict",
    is_control: Boolean(scenario.isControl),
    expected_rule: scenario.expectedRule ?? null,
    detected_rules: detectedRules,
    has_issue: hasIssue,
    matched_expected_rule: matchedExpectedRule,
    success: scenario.isControl ? !hasIssue && report.accepted : matchedExpectedRule === true,
    accepted: report.accepted,
    status: report.status,
    summary_errors: report.summary.errors,
    summary_warnings: report.summary.warnings
  };
}

function collectRules(report) {
  return [
    ...new Set(
      Object.values(report.levels)
        .flatMap((level) => [...level.errors, ...level.warnings])
        .map((issue) => issue.rule)
    )
  ];
}

function summarizeCategory(scenarios) {
  const controlScenarios = scenarios.filter((scenario) => scenario.is_control);
  const hazardScenarios = scenarios.filter((scenario) => !scenario.is_control);

  return {
    scenario_count: scenarios.length,
    control_count: controlScenarios.length,
    hazard_count: hazardScenarios.length,
    recall:
      hazardScenarios.length === 0 ? 1 : hazardScenarios.filter((scenario) => scenario.success).length / hazardScenarios.length,
    false_positive_rate:
      controlScenarios.length === 0
        ? 0
        : controlScenarios.filter((scenario) => !scenario.success).length / controlScenarios.length
  };
}
