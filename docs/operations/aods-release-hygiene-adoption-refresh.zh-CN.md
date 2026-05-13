# AODS release hygiene and adoption refresh

日期：2026-05-13
范围：U-512 到 U-521
状态：已完成；未启用 CI / 未发布

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `e646507 Review runtime fixture candidates` |
| Task ledger | 通过 | 当前默认任务为 U-512 到 U-521 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## U-512 release hygiene CI owner packet final

Decision: keep the release hygiene checks as local owner gates for now; do not add GitHub Actions in this round.

| Gate | Current command | Current result | CI readiness |
|---|---|---|---|
| docs links | `npm run docs:check-links` | pass | ready |
| secret-like scan | `npm run security:scan-placeholders` | pass | ready |
| package surface | `npm run package:check-surface` | pass | ready |
| generated clean | `npm run generated:check-clean` | pass | ready, but should remain owner-reviewed when generated outputs intentionally change |
| skill package tests | `node --test benchmarks/aods-eval-lab/test/skill-package.test.mjs` | pass | ready |
| corpus validation | `npm run validate:all` | pass | ready |

Owner packet recommendation:

1. first future CI job should be a single `npm run release:hygiene` job;
2. keep generated clean failures owner-reviewed instead of auto-reverted;
3. do not introduce hosted benchmark repeatability, remote fetches, or release publication into CI.

## U-513 generated clean protected path audit

Current protected paths:

```json
[
  "benchmarks/aods-eval-lab/generated",
  "benchmarks/aods-eval-lab/reports",
  "examples/compiled-pilot"
]
```

Rerun result:

```json
{
  "checked_paths": [
    "benchmarks/aods-eval-lab/generated",
    "benchmarks/aods-eval-lab/reports",
    "examples/compiled-pilot"
  ],
  "dirty_entries": []
}
```

Decision: coverage is still correct. These paths catch benchmark generated/report churn and source-first compiled pilot churn, which are the highest-risk generated surfaces in current release work.

## U-514 secret scan false positive audit

Rerun result:

```json
{
  "scanned_files": 980,
  "hits": 0,
  "allowed_hits": 0,
  "unallowed_hits": []
}
```

Decision: no new allowlist entry is needed. The checker should stay high-signal and concrete: GitHub tokens, OpenAI-style keys, AWS access keys, Slack tokens, and private key headers. Broad words like `token`, `password`, or `secret` remain too noisy for docs-heavy work.

Note: the script still contains one narrow synthetic-test allowlist entry for Slack token sanitizer coverage, but the current scan has zero hits and zero active allowed hits.

## U-515 package allowlist release sync audit

Rerun result:

```json
{
  "package": "aods@0.8.0",
  "entry_count": 61,
  "expected_entry_count": 61,
  "missing": [],
  "unexpected": []
}
```

Decision: no package allowlist change before the next version bump. The package should still include CLI code, schemas, specs, packaged skill, README files, and compiled-pilot examples; it should still exclude operations docs and `docs/examples/*.sample.json`.

## U-516 source-first external adoption smoke plan

Recommended external smoke route for a temporary consumer repository:

```bash
tmp="$(mktemp -d /tmp/aods-adoption-XXXXXX)"
cd "$tmp"
npm init -y
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.8.0
npx aods --help
npx aods scaffold authoring ./aods --sys sample-system --force
npx aods compile ./aods/authoring.json ./docs/aods --force --strict
npx aods validate ./docs/aods --strict
npx aods route ./docs/aods --query "release readiness" --role doc-author --intent read --json
```

Acceptance:

- CLI help starts with `AODS CLI`.
- scaffold creates `authoring.json`.
- compile strict writes a corpus only after validation passes.
- validate strict passes on the compiled corpus.
- route JSON returns a compact explanation.

No current need to run this against a remote package publish because current release source remains `v0.8.0`.

## U-517 docs examples package promotion decision

Decision: keep `docs/examples/*.sample.json` out of the npm package.

Reason:

- `docs/examples` snippets are hand-curated public docs and issue-comment samples.
- Packaged adoption artifacts already live under `examples/compiled-pilot-source/` and `examples/compiled-pilot/`.
- Promoting snippets would require package allowlist churn and release-note explanation without improving first-run adoption.

Promotion gate for a future release:

1. a sample becomes executable release evidence, not just documentation;
2. package allowlist is updated intentionally;
3. `npm run package:check-surface -- --json` passes with the new expected count.

## U-518 validate / route sample refresh after recent fields

Current sample inventory:

| File | Refresh decision |
|---|---|
| `validate-summary.sample.json` | keep; minimal successful validate summary is still current |
| `validate-issue-location.sample.json` | keep; location envelope sample already exists |
| `route-explanation.sample.json` | keep; route explanation fields remain current |
| `route-skipped-modules.sample.json` | keep; skipped-module opt-in sample remains current |
| `unchecked-repo-reality.sample.json` | keep; unchecked repo reality shape remains current |

Validation: every `docs/examples/*.sample.json` parsed successfully as JSON.

Decision: no sample refresh required this round. The only docs-side change needed was Chinese README parity for conformance manifest and route JSON explanation fields.

## U-519 README quickstart command smoke rerun

Smoke commands run locally:

| Command | Result |
|---|---|
| `node ./bin/aods.mjs --help` | pass; first line `AODS CLI` |
| `node ./bin/aods.mjs validate . --json` | pass; `status=pass`, `accepted=true` |
| `node ./bin/aods.mjs route . --query "paired docs drift rules" --role doc-author --intent read --json` | pass; selected `spec-authority-governance`, `spec-aop`, `spec-validation` |
| `node ./bin/aods.mjs fixture smoke ./examples/compiled-pilot-source/fixtures/fixture-manifest.json --json` | pass |
| `node ./bin/aods.mjs conformance run ./examples/compiled-pilot-source/fixtures/conformance-manifest.json --json` | pass; `failed=0` |
| `node ./bin/aods.mjs scaffold authoring /tmp/aods-readme-authoring-source --sys sample-system --force` | pass |
| `node ./bin/aods.mjs compile ./examples/compiled-pilot-source/authoring.json /tmp/aods-readme-compiled-pilot --force --strict` | pass |
| `node ./bin/aods.mjs validate /tmp/aods-readme-compiled-pilot --strict` | pass |

Decision: README quickstart remains runnable. No English README change required.

## U-520 Chinese README parity audit

Findings and fixes:

| Area | Finding | Fix |
|---|---|---|
| example map | Chinese README omitted the conformance manifest link present in English README | added the conformance manifest bullet |
| route JSON explanation | Chinese README described `--json` but omitted the explicit `explanation.source` / `explanation.reason` / `explanation.dependency` fields and dependency edge statuses | added the missing explanation |

Decision: Chinese README is now aligned for the current high-value example and route JSON surfaces.

## U-521 changelog next release draft refresh

Current `v0.9.0` draft body:

```markdown
# AODS v0.9.0

## Highlights

- Structured term references for stable vocabulary and lifecycle contracts.
- Evidence freshness metadata and validation issue location envelopes.
- Validation/routing observability samples and skipped-module opt-in diagnostics.
- Metadata-first capability fallback posture, unsupported reasons, degraded behavior, and consumer actions.
- Packaged source-first and compiled examples with fixture and conformance manifests.
- Release hygiene owner gates for docs links, secret-like scanning, package surface, generated output cleanliness, skill package alignment, and strict corpus validation.

## Validation

- npm run release:hygiene
- npm pack --dry-run
- packed tarball install smoke
- packaged compiled-pilot strict validation
- packaged fixture smoke
- packaged conformance run
- README quickstart smoke

## Non-goals

- No workflow runtime, event store, policy engine, remote gateway, or migration executor.
- No telemetry store, dashboard, provider discovery, auth exchange, fallback ranking, or adapter execution.
- No GitHub Actions enablement in this release unless owner separately approves the CI packet.
```

Decision: draft refreshed in operations docs only. No version bump, tag, GitHub Release, package publish, or changelog framework change.

## 本轮结论

- Release hygiene remains green and is ready to become a future single CI job, but this round does not enable Actions.
- Generated clean, secret-like scan, and package surface allowlists are still correct.
- Source-first external adoption has a concrete temp-repo smoke plan.
- Public sample JSON stays docs-only and out of the package.
- README quickstart commands passed locally.
- Chinese README parity was repaired for conformance manifest and route JSON explanation fields.
