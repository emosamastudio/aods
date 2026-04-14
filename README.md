# AODS v3

Agent-Optimized Documentation System: a spec-first documentation standard for agent-readable corpora, packaged here with a reference CLI and a benchmark regression baseline.

## TL;DR

| Surface | Meaning |
| --- | --- |
| **Spec** | `manifest.json`, `schema/`, and `spec/` define the normative AODS standard |
| **Reference implementation** | `bin/`, `lib/`, and `.githooks/` provide one executable implementation of validation, routing, upgrade, and hook behavior |
| **Benchmark** | `benchmarks/aods-eval-lab/` is a regression harness that measures the current implementation against a fixed benchmark pack |

## Why this repository exists

AODS makes four strong claims:

1. it can represent project knowledge across the full design and delivery lifecycle
2. it can preserve meaning while rewriting human docs into agent-first structures
3. it can support progressive disclosure so agents do not need full-corpus loads for every task
4. it can reduce drift between agent-facing and human-facing surfaces

This repository exists to keep the whole loop in one place:

- **standard:** the normative corpus, schemas, and artifact definitions
- **reference implementation:** the `aods` CLI plus validation, routing, upgrade, and hook logic
- **benchmark baseline:** `benchmarks/aods-eval-lab`, which measures whether the current implementation still satisfies the intended goals

If you only read one thing:

- **human orientation:** start here
- **agent bootstrap:** start at `manifest.json`
- **regression signal:** start at `benchmarks/aods-eval-lab/reports/round1-comparator-report.md`

## Normative vs non-normative

- **Normative:** `manifest.json`, `schema/`, and `spec/`
- **Non-normative but executable:** `bin/`, `lib/`, `.githooks/`, and `examples/`
- **Non-normative measurement layer:** `benchmarks/aods-eval-lab/`

Two rules matter:

1. **The reference implementation is not the standard.** It is one executable realization of the standard.
2. **Benchmark results do not define conformance.** Conformance comes from the spec and schemas; the benchmark measures how well the current implementation satisfies the repository's design goals.

## Repository map

| Path | Role |
| --- | --- |
| `manifest.json` | Root index and agent entrypoint for the AODS standard corpus |
| `schema/` | JSON Schemas for manifests, modules, and typed artifacts |
| `spec/` | Normative AODS modules: writing rules, boot protocol, artifact catalog, surface governance, and validation |
| `bin/aods.mjs` | Reference CLI entrypoint |
| `lib/` | CLI implementation for validate, route, hook, scaffold, and upgrade |
| `research/` | Non-normative archive of external landscape scans, comparator analysis, and benchmark rationale |
| `.githooks/` | Optional git hook integration |
| `examples/seven-plane-pilot/` | Example AODS corpus used as a non-self-referential sample |
| `benchmarks/aods-eval-lab/` | Primary regression harness and benchmark baseline |

## What AODS is

AODS is a corpus format for agent-readable documentation with these core properties:

- **deterministic structure:** JSON modules plus typed artifacts
- **progressive disclosure:** root -> capsule -> detail -> evidence
- **authority-safe pairing:** Human surfaces do not replace agent-primary semantic authority.
- **scoped authoring support:** `boot_by_touch` routes let tools load the smallest useful subset for a file-level edit
- **validation-aware governance:** schemas, hooks, integrity rules, and optional `shared_invariants` can reject malformed or unsafely synchronized corpora

## Quick start

```bash
npm install
npm run validate:all
npm run route -- --touch spec/validation-rules.json --role doc-author
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
```

## Working with the standard

### Validate the corpus

```bash
npm run validate
npm run validate:json
npm run validate:strict
npm run validate:pilot
npm run validate:all
```

Direct CLI usage:

```bash
node ./bin/aods.mjs validate .
node ./bin/aods.mjs validate . --json
node ./bin/aods.mjs validate . --strict
```

### Route scoped module loads

Use `route` when a task is anchored to one touched file and you want the minimal useful module set.

```bash
npm run route -- --touch spec/validation-rules.json --role doc-author
node ./bin/aods.mjs route . --touch spec/validation-rules.json --role doc-author
```

Routing precedence:

1. `boot_by_touch`
2. `boot_by_role`
3. `boot_sequence`

### Run hook-based enforcement

```bash
npm run hook:pre-commit
node ./bin/aods.mjs hook pre-commit . --file README.md --file spec/surface-governance.json
```

Hook behavior:

- validates only the affected corpus or corpora
- fails human-only paired-surface edits when `sync_source=agent-primary` and no paired agent module changed
- Manifest metadata alone does not satisfy agent-primary semantic synchronization.
- declared `shared_invariants` must remain present in both `agent_primary` and `human_primary`
- forces full-corpus validation for broad implementation changes such as `lib/`, `schema/`, or `.githooks/`

Optional git hook installation:

```bash
git config core.hooksPath .githooks
```

### Upgrade corpora to the latest schemas

```bash
npm run upgrade -- --dry-run
node ./bin/aods.mjs upgrade .
node ./bin/aods.mjs upgrade ./examples/seven-plane-pilot --dry-run
```

`upgrade` synchronizes canonical schemas, refreshes `tokens_approx`, updates manifest timestamps, and bumps `sys_v` unless `--no-bump` is used.

### Scaffold new corpora or modules

```bash
node ./bin/aods.mjs scaffold corpus ../my-corpus --sys my-system
node ./bin/aods.mjs scaffold module ../my-corpus control-plane --category policy --layer detail --scope "Control plane semantics"
```

## Benchmark baseline

`benchmarks/aods-eval-lab/` is the main regression gate for this repository.

It answers these questions:

1. **coverage:** can AODS represent the full benchmark lifecycle?
2. **fidelity:** do critical facts survive the rewrite into AODS?
3. **corpus size:** does the corpus reduce or inflate exact on-disk size overall?
4. **loading:** does objective touch-route disclosure hit the right modules with acceptable overfetch?
5. **drift:** do validator and hook rules catch divergence between human and agent surfaces?
6. **diversity:** how broad is the benchmark sample across domains, sync modes, roles, and scenario classes?
7. **overhead:** how much governance bookkeeping is required?

Validation comes first, then benchmarking:

```bash
npm run validate:all
npm run benchmark:generate
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
npm run validate:repo
```

Important outputs:

- `benchmarks/aods-eval-lab/reports/aods-evaluation-report.md`
- `benchmarks/aods-eval-lab/reports/round1-comparator-report.md`
- `benchmarks/aods-eval-lab/generated/results/evaluation-results.json`
- `benchmarks/aods-eval-lab/generated/results/round1-comparator-results.json`
- `benchmarks/aods-eval-lab/generated/aods-corpus/`
- `benchmarks/aods-eval-lab/generated/human-docs/`

`generated/` and `reports/` are committed intentionally. They are baseline artifacts for regression review, not throwaway build output.

## Current benchmark reading

At the current baseline, the benchmark shows:

- **coverage:** strong
- **fidelity:** strong
- **objective loading gate:** strong
- **exact corpus size:** mixed at corpus scale; AODS is larger than the human-doc baseline on this corpus
- **anti-drift:** strong for declared invariants and paired-surface governance; semantic equivalence is still only partially native beyond declared anchors
- **benchmark objectivity:** materially improved because the main scoreboards now use exact bytes and touch-route scenarios
- **benchmark diversity:** materially improved; the current pack is multi-domain and includes both agent-primary and human-primary sync, but it is still synthetic and English-only

That means AODS already behaves like a serious agent-first documentation format and routing system, with stronger built-in governance than the earlier baseline and a more objective, broader benchmark harness, but not yet like a fully proven semantic-equivalence system, guaranteed corpus-wide compression standard, or field-validated multi-language benchmark winner.

## Example corpus

`examples/seven-plane-pilot/` is the first non-self-referential AODS v3 corpus in this repository. It demonstrates:

- seven planes
- governance spine
- work-graph backbone
- root -> capsule -> detail loading
- paired human surfaces via `surface_pairs`

## Artifact catalog

### 12 structured types

- `state-machine`
- `process-flow`
- `sequence`
- `decision-tree`
- `data-pipeline`
- `topology`
- `rule-set`
- `mapping-table`
- `event-catalog`
- `error-strategy`
- `api-contract`
- `temporal-pattern`

### 8 generic types

- `json-schema`
- `json-example`
- `code-template`
- `config-template`
- `prompt-template`
- `regex`
- `enum-def`
- `raw`

## Contributor workflow

When changing the standard or implementation:

1. update the relevant spec, schema, or CLI files
2. run `npm run validate:all`
3. run `npm run benchmark:evaluate`
4. run `npm run benchmark:compare`
5. run `npm run benchmark:test`
6. inspect the updated report and JSON metrics
7. commit code changes together with any intentional baseline updates

When evaluating AODS itself, do not rely on README claims alone; treat the round-one benchmark evaluation report as the operational truth source and the AODS-only report as its internal baseline appendix.

## Schema version

AODS v3 — 2026-04-13
