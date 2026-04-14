# AODS Eval Lab

Primary regression and benchmark harness for the AODS repository.

## Purpose

This lab turns AODS from a claim into a repeatable benchmark. It measures whether the standard and reference implementation can:

1. cover a full project-design lifecycle
2. preserve facts while rewriting human docs into agent-first structures
3. reduce load cost through progressive disclosure
4. detect or prevent documentation drift
5. keep governance overhead at an acceptable level

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
npm run benchmark:test
```

From this directory directly:

```bash
npm run generate
npm run evaluate
npm test
```

## Outputs

- `fixtures/source/` canonical benchmark dataset
- `fixtures/scenarios/` touch-routing and drift scenarios
- `generated/human-docs/` verbose human baseline
- `generated/aods-corpus/` generated AODS corpus under test
- `generated/results/evaluation-results.json` machine-readable metrics
- `reports/aods-evaluation-report.md` human-readable report

`generated/` and `reports/` are committed on purpose. They are not disposable build artifacts; they are the published regression baseline for the current repository state.

## Reading the results

Start with `reports/aods-evaluation-report.md` for the narrative judgment, then inspect `generated/results/evaluation-results.json` for exact metrics and scenario-level detail.

The most decision-relevant dimensions are:

- **coverage:** whether AODS can represent the lifecycle breadth
- **fidelity:** whether key facts survive compression
- **loading:** whether routing narrows the working set without missing needed modules
- **drift:** whether validator and hook logic catch structural and semantic divergence
- **overhead:** how much governance bookkeeping the corpus introduces

## Editing workflow

1. change the AODS spec or implementation at the repo root
2. run `npm run validate:all`
3. run `npm run benchmark:evaluate`
4. run `npm run benchmark:test`
5. review the updated report and JSON results before committing
