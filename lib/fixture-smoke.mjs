import fs from "node:fs";
import path from "node:path";

const FIXTURE_MANIFEST_VERSION = 1;
const FIXTURE_CONVENTION = "aods-fixture-golden-v1";
const FIXTURE_KINDS = new Set(["positive", "negative"]);
const EXPECTED_STATUSES = new Set(["pass", "fail", "warn"]);

export async function runFixtureCommand(argv) {
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    printFixtureUsage();
    return 0;
  }

  const [subcommand, ...args] = argv;
  if (subcommand !== "smoke") {
    throw new Error(`Unknown fixture command: ${subcommand}`);
  }

  const options = parseSmokeArgs(args);
  const report = smokeFixtureManifest(options.manifestPath);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printSmokeReport(report);
  }

  return report.accepted ? 0 : 1;
}

export function smokeFixtureManifest(manifestPathInput) {
  const manifestPath = path.resolve(manifestPathInput);
  const report = emptyReport(manifestPath);

  if (!fs.existsSync(manifestPath)) {
    addIssue(report, {
      rule: "fixture-manifest-path",
      message: `fixture manifest not found at ${manifestPath}`
    });
    return finalizeReport(report);
  }

  let fixtureManifest;
  try {
    fixtureManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    addIssue(report, {
      rule: "fixture-manifest-json",
      message: error instanceof Error ? error.message : String(error)
    });
    return finalizeReport(report);
  }

  const manifestDir = path.dirname(manifestPath);
  if (!fixtureManifest || typeof fixtureManifest !== "object" || Array.isArray(fixtureManifest)) {
    addIssue(report, {
      rule: "fixture-manifest-object",
      message: "fixture manifest must be a JSON object"
    });
    return finalizeReport(report);
  }

  report.manifest.version = fixtureManifest.aods_fixture_manifest_v ?? null;
  report.manifest.convention = fixtureManifest.convention ?? null;
  report.manifest.update_policy = fixtureManifest.update_policy ?? null;

  if (fixtureManifest.aods_fixture_manifest_v !== FIXTURE_MANIFEST_VERSION) {
    addIssue(report, {
      rule: "fixture-manifest-version",
      message: `aods_fixture_manifest_v must be ${FIXTURE_MANIFEST_VERSION}`
    });
  }

  if (fixtureManifest.convention !== FIXTURE_CONVENTION) {
    addIssue(report, {
      rule: "fixture-convention",
      message: `convention must be ${FIXTURE_CONVENTION}`
    });
  }

  if (fixtureManifest.update_policy?.review_gate !== "manual-diff") {
    addIssue(report, {
      rule: "fixture-update-policy",
      message: "update_policy.review_gate must be manual-diff"
    });
  }

  if (!Array.isArray(fixtureManifest.fixtures)) {
    addIssue(report, {
      rule: "fixture-list",
      message: "fixtures must be an array"
    });
    return finalizeReport(report);
  }

  report.summary.fixtures = fixtureManifest.fixtures.length;
  for (const [index, fixture] of fixtureManifest.fixtures.entries()) {
    smokeFixture(report, manifestDir, fixture, index);
  }

  return finalizeReport(report);
}

function parseSmokeArgs(argv) {
  const options = {
    manifestPath: "",
    json: false
  };

  const queue = [...argv];
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (!arg.startsWith("-") && !options.manifestPath) {
      options.manifestPath = arg;
      continue;
    }
    throw new Error(`Unknown fixture smoke arg: ${arg}`);
  }

  if (!options.manifestPath) {
    throw new Error("fixture smoke requires a fixture manifest path");
  }

  return options;
}

function smokeFixture(report, manifestDir, fixture, index) {
  const fixturePath = `fixtures[${index}]`;
  const fixtureId = typeof fixture?.id === "string" && fixture.id ? fixture.id : fixturePath;

  if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
    addIssue(report, {
      rule: "fixture-entry",
      fixture_id: fixtureId,
      message: `${fixturePath} must be an object`
    });
    return;
  }

  if (typeof fixture.id !== "string" || fixture.id.length === 0) {
    addIssue(report, {
      rule: "fixture-id",
      fixture_id: fixtureId,
      message: `${fixturePath}.id must be a non-empty string`
    });
  }

  if (!FIXTURE_KINDS.has(fixture.kind)) {
    addIssue(report, {
      rule: "fixture-kind",
      fixture_id: fixtureId,
      message: `${fixtureId}.kind must be positive or negative`
    });
  } else {
    report.summary.kind[fixture.kind] += 1;
  }

  if (!EXPECTED_STATUSES.has(fixture.expected_status)) {
    addIssue(report, {
      rule: "fixture-expected-status",
      fixture_id: fixtureId,
      message: `${fixtureId}.expected_status must be pass, fail, or warn`
    });
    report.summary.expected_status.invalid += 1;
  } else {
    report.summary.expected_status[fixture.expected_status] += 1;
  }

  if (!Array.isArray(fixture.expected_rules) || !fixture.expected_rules.every((rule) => typeof rule === "string")) {
    addIssue(report, {
      rule: "fixture-expected-rules",
      fixture_id: fixtureId,
      message: `${fixtureId}.expected_rules must be an array of rule id strings`
    });
  } else {
    report.summary.expected_rules += fixture.expected_rules.length;
    if (fixture.kind === "positive" && fixture.expected_status === "pass" && fixture.expected_rules.length > 0) {
      addIssue(report, {
        rule: "fixture-positive-rules",
        fixture_id: fixtureId,
        message: `${fixtureId} is a positive pass fixture and must not expect validation rule failures`
      });
    }
    if (fixture.kind === "negative" && fixture.expected_status === "fail" && fixture.expected_rules.length === 0) {
      addIssue(report, {
        rule: "fixture-negative-rules",
        fixture_id: fixtureId,
        message: `${fixtureId} is a negative fail fixture and must name expected validation rules`
      });
    }
  }

  if (!fixture.input || typeof fixture.input !== "object" || Array.isArray(fixture.input)) {
    addIssue(report, {
      rule: "fixture-input",
      fixture_id: fixtureId,
      message: `${fixtureId}.input must be an object`
    });
  } else {
    smokePath(report, manifestDir, fixtureId, "fixture-input-path", fixture.input.path);
  }

  if (fixture.golden_exports !== undefined && !Array.isArray(fixture.golden_exports)) {
    addIssue(report, {
      rule: "fixture-golden-list",
      fixture_id: fixtureId,
      message: `${fixtureId}.golden_exports must be an array when present`
    });
  }

  const goldenExports = Array.isArray(fixture.golden_exports) ? fixture.golden_exports : [];
  report.summary.golden_exports += goldenExports.length;
  for (const [goldenIndex, goldenExport] of goldenExports.entries()) {
    if (!goldenExport || typeof goldenExport !== "object" || Array.isArray(goldenExport)) {
      addIssue(report, {
        rule: "fixture-golden-entry",
        fixture_id: fixtureId,
        message: `${fixtureId}.golden_exports[${goldenIndex}] must be an object`
      });
      continue;
    }
    smokePath(report, manifestDir, fixtureId, "fixture-golden-path", goldenExport.path);
  }
}

function smokePath(report, manifestDir, fixtureId, rule, relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    addIssue(report, {
      rule,
      fixture_id: fixtureId,
      message: `${fixtureId} declares an empty path`
    });
    return;
  }

  const resolvedPath = path.resolve(manifestDir, relativePath);
  if (!fs.existsSync(resolvedPath)) {
    addIssue(report, {
      rule,
      fixture_id: fixtureId,
      path: relativePath,
      resolved_path: resolvedPath,
      message: `${fixtureId} path does not exist: ${relativePath}`
    });
  }
}

function emptyReport(manifestPath) {
  return {
    action: "fixture smoke",
    status: "pass",
    accepted: true,
    manifest: {
      path: manifestPath,
      version: null,
      convention: null,
      update_policy: null
    },
    summary: {
      fixtures: 0,
      kind: {
        positive: 0,
        negative: 0
      },
      expected_status: {
        pass: 0,
        fail: 0,
        warn: 0,
        invalid: 0
      },
      expected_rules: 0,
      golden_exports: 0
    },
    issues: []
  };
}

function addIssue(report, issue) {
  report.issues.push({
    level: "error",
    ...issue
  });
}

function finalizeReport(report) {
  report.accepted = report.issues.length === 0;
  report.status = report.accepted ? "pass" : "fail";
  return report;
}

function printFixtureUsage() {
  console.log(`AODS fixture

Usage:
  aods fixture smoke <fixture-manifest> [--json]

Commands:
  smoke     Check fixture manifest contracts and declared input/golden paths without updating exports.

Flags:
  --json    Emit JSON fixture smoke report.
  -h, --help Show help.
`);
}

function printSmokeReport(report) {
  const header = `${report.status.toUpperCase()} fixture smoke ${report.manifest.path}`;
  console.log(header);
  console.log(`fixtures: ${report.summary.fixtures}`);
  console.log(`golden_exports: ${report.summary.golden_exports}`);
  if (report.issues.length > 0) {
    console.log("issues:");
    for (const issue of report.issues) {
      const fixtureLabel = issue.fixture_id ? ` ${issue.fixture_id}` : "";
      console.log(`- ${issue.rule}${fixtureLabel}: ${issue.message}`);
    }
  }
}
