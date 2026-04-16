# AODS Eval Lab

Primary regression and benchmark harness for the AODS repository.

## Purpose

This lab turns AODS from a claim into a repeatable benchmark. It measures whether the standard and reference implementation can:

1. cover a full project-design lifecycle
2. preserve facts while rewriting human docs into agent-first structures
3. keep exact corpus size competitive after governance overhead
4. reduce load cost through objective touch-route progressive disclosure
5. detect or prevent documentation drift
6. make benchmark diversity and sample coverage explicit
7. keep governance overhead at an acceptable level

Token estimates and exploratory query-route scenarios are still emitted, but they are treated as **advisory** signals rather than release-gating metrics.

The lab now also supports an **optional runtime-backed local capture**. That supplement records one exact Copilot CLI provider request body for a routed AODS scenario, so the prompt-envelope proxy can be compared against a real runtime payload shape.

## Repository role

- **Repo root:** AODS standard, schemas, CLI, and example corpus
- **This directory:** benchmark source, fixtures, generated corpora, and regression report
- **Regression posture:** `aods-eval-lab` is the main baseline used to detect behavior changes in the standard or implementation

This directory is **not** the standard. It is the measurement layer for the standard.

## Commands

Validate first from the repository root, then run the benchmark:

```bash
npm run validate:all
npm run benchmark:generate
npm run benchmark:fetch-open-corpora
npm run benchmark:catalog-open-corpora
npm run benchmark:runtime-capture
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:summary
npm run benchmark:test
```

From this directory directly:

```bash
npm run generate
npm run fetch-open-corpora
npm run catalog-open-corpora
npm run runtime-capture
npm run evaluate
npm run compare
npm run summary
npm test
```

## Outputs

- `fixtures/source/` canonical benchmark dataset
- `fixtures/scenarios/` touch-routing and drift scenarios
- `fixtures/open-source/corpora.json` reproducible manifest for fetched open-source benchmark sources plus curated scenario seeds
- `generated/human-docs/` verbose human baseline
- `generated/aods-corpus/` generated AODS corpus under test
- `generated/open-source-corpora/` sparse-fetched open-source source slices for benchmark-v2 work
- `generated/results/evaluation-results.json` machine-readable metrics
- `generated/results/open-source-fetch-results.json` machine-readable fetch summary for open-source source slices
- `generated/results/open-source-scenario-catalog.json` machine-readable scenario catalog for benchmark-v2 seed selection
- `generated/results/runtime-capture-results.json` supplemental local runtime-capture metrics
- `generated/results/round1-comparator-results.json` machine-readable horizontal comparison results
- `generated/results/benchmark-summary-results.json` current-vs-previous benchmark delta summary
- `generated/history/latest-evaluation-results.json` saved prior evaluation baseline for run-over-run comparison
- `generated/history/latest-round1-comparator-results.json` saved prior comparison baseline for run-over-run comparison
- `reports/aods-evaluation-report.md` human-readable report
- `reports/open-source-scenario-catalog.md` human-readable catalog of curated open-source benchmark seeds
- `reports/runtime-capture-report.md` human-readable runtime-backed capture supplement
- `reports/round1-comparator-report.md` human-readable full round-one benchmark evaluation report
- `reports/benchmark-summary-report.md` human-readable current-vs-previous delta table

`generated/` and `reports/` are committed on purpose. They are not disposable build artifacts; they are the published regression baseline for the current repository state.

## Reading the results

Start with `reports/round1-comparator-report.md` for the full published evaluation, then inspect `reports/aods-evaluation-report.md` and the JSON result files for exact baseline metrics and scenario-level detail.

The round-one comparison now keeps a strict separation:

- the **fair common scoreboard** still uses the shared synthetic canonical dataset
- the **open-source scenario catalog** acts as a real-world field-sample supplement for diversity and grep-first routing realism

The most decision-relevant dimensions are:

- **coverage:** whether AODS can represent the lifecycle breadth
- **fidelity:** whether key facts survive compression
- **exact corpus size:** whether governance overhead inflates or reduces the full corpus on disk
- **task-time context footprint:** how many bytes and estimated tokens are actually loaded for one routed task, both as raw payload and as a rendered prompt-envelope proxy
- **runtime-backed local capture:** what one exact Copilot CLI provider request body looks like on top of the routed benchmark prompt
- **objective loading:** whether runtime-backed touch routing narrows the working set without missing needed modules
- **diversity audit:** how broad the benchmark is across domains, languages, sync modes, roles, and scenario classes
- **drift:** whether validator and hook logic catch structural and semantic divergence
- **overhead:** how much governance bookkeeping the corpus introduces

For benchmark-v2 preparation, the open-source scenario catalog keeps **grep-aligned lexical anchors** (`grep_terms`) next to each curated seed path. That makes the next benchmark wave match how many current code agents actually retrieve documentation: grep-first, path-aware, and only then broader context loading.

Treat these size signals separately:

- **full-corpus size** answers repository-scale cost
- **task-time context footprint** answers context-window pressure during work
- **rendered prompt-envelope footprint** is the closer benchmark proxy to what a live agent runtime would actually receive
- **runtime request-body footprint** is the exact byte count for one local Copilot CLI request profile; it is supplemental, not yet a shared scoreboard metric

A larger AODS corpus does not automatically mean a larger task-time context if routing keeps the loaded working set small. The benchmark now reports repository size, loaded payload size, rendered prompt-envelope size, and one supplemental runtime request-body sample separately.

## Editing workflow

1. change the AODS spec or implementation at the repo root
2. run `npm run validate:all`
3. optionally run `npm run benchmark:fetch-open-corpora`
4. optionally run `npm run benchmark:catalog-open-corpora`
5. optionally run `npm run benchmark:runtime-capture`
6. run `npm run benchmark:evaluate`
7. run `npm run benchmark:compare`
8. run `npm run benchmark:summary`
9. run `npm run benchmark:test`
10. review the updated reports and JSON results before committing
