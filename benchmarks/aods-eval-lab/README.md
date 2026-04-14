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

Token estimates and semantic-load heuristics are still emitted, but they are treated as **advisory** signals rather than release-gating metrics.

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
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
```

From this directory directly:

```bash
npm run generate
npm run evaluate
npm run compare
npm test
```

## Outputs

- `fixtures/source/` canonical benchmark dataset
- `fixtures/scenarios/` touch-routing and drift scenarios
- `generated/human-docs/` verbose human baseline
- `generated/aods-corpus/` generated AODS corpus under test
- `generated/results/evaluation-results.json` machine-readable metrics
- `generated/results/round1-comparator-results.json` machine-readable horizontal comparison results
- `reports/aods-evaluation-report.md` human-readable report
- `reports/round1-comparator-report.md` human-readable full round-one benchmark evaluation report

`generated/` and `reports/` are committed on purpose. They are not disposable build artifacts; they are the published regression baseline for the current repository state.

## Reading the results

Start with `reports/round1-comparator-report.md` for the full published evaluation, then inspect `reports/aods-evaluation-report.md` and the JSON result files for exact baseline metrics and scenario-level detail.

The most decision-relevant dimensions are:

- **coverage:** whether AODS can represent the lifecycle breadth
- **fidelity:** whether key facts survive compression
- **exact corpus size:** whether governance overhead inflates or reduces the full corpus on disk
- **task-time context footprint:** how many bytes and estimated tokens are actually loaded for one routed task, both as raw payload and as a rendered prompt-envelope proxy
- **objective loading:** whether runtime-backed touch routing narrows the working set without missing needed modules
- **diversity audit:** how broad the benchmark is across domains, languages, sync modes, roles, and scenario classes
- **drift:** whether validator and hook logic catch structural and semantic divergence
- **overhead:** how much governance bookkeeping the corpus introduces

Treat these two size signals separately:

- **full-corpus size** answers repository-scale cost
- **task-time context footprint** answers context-window pressure during work
- **rendered prompt-envelope footprint** is the closer benchmark proxy to what a live agent runtime would actually receive

A larger AODS corpus does not automatically mean a larger task-time context if routing keeps the loaded working set small. The benchmark now reports repository size, loaded payload size, and rendered prompt-envelope size explicitly.

## Editing workflow

1. change the AODS spec or implementation at the repo root
2. run `npm run validate:all`
3. run `npm run benchmark:evaluate`
4. run `npm run benchmark:compare`
5. run `npm run benchmark:test`
6. review the updated reports and JSON results before committing
