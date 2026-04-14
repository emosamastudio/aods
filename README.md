# AODS v3

Agent-Optimized Documentation System: a spec-first documentation standard for corpora that must be readable by agents, governable by validators and hooks, and still bridge back to human-facing surfaces.

## The problem

Project documentation is usually optimized for humans first. That creates four recurring failures for code agents:

1. **Retrieval is expensive or ambiguous.** Agents often work `grep`-first and file-structure-first, so weak routing and inconsistent terminology increase context waste.
2. **Authority is implicit.** Human docs, operational notes, and implementation details can disagree without any native way to say which surface wins.
3. **Human and agent surfaces drift.** A README can change while the agent-facing source of truth stays stale, or the inverse.
4. **Repository size and task-time context get conflated.** A large corpus is not always a large working set, but most documentation formats do not make that distinction measurable.

AODS exists because the current alternatives each solve only one slice of that problem. Markdown stacks are ergonomic, `llms.txt` is lightweight, and DITA is structurally mature, but none of them combine structured agent routing, dual-surface governance, and measurable anti-drift behavior in one format.

## The AODS path

AODS takes a specific path instead of claiming universal compression:

1. **Structure the corpus for agents.** Use typed JSON modules and typed artifacts instead of only prose documents.
2. **Load progressively.** Start from `root`, route through `capsule`, then open `detail` or `evidence`.
3. **Make authority explicit.** Encode `surface_pairs`, `sync_source`, and `shared_invariants` so human and agent surfaces can be checked rather than merely trusted.
4. **Enforce the contract.** Use schema validation, route checks, and pre-commit enforcement to block malformed or unsafe sync changes.
5. **Reduce authoring overhead.** Move AODS toward a compiled target instead of requiring every corpus to be hand-authored JSON.

This repository contains all three layers in one place:

| Layer | What it contains |
| --- | --- |
| **Standard** | `manifest.json`, `schema/`, and `spec/` define the normative AODS contract |
| **Reference implementation** | `bin/` and `lib/` implement validate, route, compile, scaffold, upgrade, and hook behavior |
| **Benchmark** | `benchmarks/aods-eval-lab/` measures whether the implementation actually earns its claims |

## Benchmark design

`benchmarks/aods-eval-lab/` is the regression harness for this repo. It tests seven things:

1. lifecycle coverage
2. fact preservation
3. full-corpus size
4. task-time context footprint
5. anti-drift effectiveness
6. sample diversity
7. authoring overhead

The benchmark explicitly separates three size signals:

| Signal | Meaning |
| --- | --- |
| **Full-corpus size** | Total on-disk weight of the documentation system |
| **Loaded payload** | Routed file contents only |
| **Rendered prompt envelope** | Loaded payload plus labels, separators, and prompt scaffold text |

That distinction matters because **a larger repository does not automatically mean a larger per-task context footprint**.

For horizontal comparison, the benchmark uses three outside baselines:

| Baseline | Why it was chosen |
| --- | --- |
| **Markdown + YAML** | The practical docs-as-code incumbent for most teams |
| **`llms.txt`** | The minimal AI-facing alternative and the opposite design philosophy from AODS |
| **DITA topic corpus** | The closest structural cousin in modular documentation |

## Current benchmark result

| Dimension | Current result | Reading |
| --- | --- | --- |
| **Coverage** | **100.0%** lifecycle, **100.0%** structured types, **100.0%** generic types | The benchmark pack is fully representable in AODS |
| **Fidelity** | **100.0%** fact preservation, **100.0%** critical fact preservation | Information survived the rewrite on the current pack |
| **Full-corpus size** | **71309 bytes** vs human-doc baseline **44915 bytes** | AODS is currently **58.8% larger** at repository scale |
| **Objective median loaded payload** | **24360 bytes** | Routed working set stays far below full-corpus size |
| **Objective median prompt envelope** | **25216 bytes** | Closer proxy to actual context-window occupation |
| **Objective touch-route hit rate** | **100.0%** | All objective routing scenarios hit the required modules |
| **Objective median byte savings vs full load** | **65.8%** | Routed work is materially smaller than full-load work |
| **Built-in drift recall** | **100.0%** | Current validator and hook layer catches the declared benchmark hazards |
| **Built-in false-positive rate** | **0.0%** | No misfire on the benchmark control scenario set |
| **Benchmark diversity** | **2 datasets**, **2 sync modes** | Stronger than the original single-corpus pack, still synthetic and English-only |

## Horizontal comparison

The comparison table below uses only the benchmark's shared, cross-format metrics.

| Baseline | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **AODS** | 100.0% | 100.0% | 71309 | 100.0% | 24360 | 25216 |
| **Markdown + YAML** | 100.0% | 100.0% | 47437 | 0.0% | 5234 | 5844 |
| **`llms.txt`** | 100.0% | 100.0% | 46520 | 0.0% | 6480 | 7178 |
| **DITA topic corpus** | 100.0% | 100.0% | 65038 | 0.0% | 718 | 1320 |

**How to read this table:** the non-AODS baselines stay lighter on bytes, but they score **0.0%** on the benchmark's objective touch-route contract because they do not provide AODS-style native routing and paired-surface governance. Their smaller loaded byte counts are therefore not evidence of equivalent governed retrieval.

## What improved in this optimization phase

| Area | Earlier state | Current state | Improvement |
| --- | ---: | ---: | ---: |
| **Built-in drift recall** | 50.0% | 100.0% | **+50.0 pts** |
| **Combined drift recall** | 83.3% | 100.0% | **+16.7 pts** |
| **Built-in false-positive rate** | 0.0% | 0.0% | held |
| **Benchmark datasets** | 1 | 2 | **+1 dataset** |
| **Sync modes covered** | 1 | 2 | **+1 sync mode** |
| **Context metric model** | loaded payload only | payload + rendered prompt envelope | more realistic context proxy |

This round also adds the first **compiled authoring pilot**:

- new `compile` command in the reference CLI
- `examples/compiled-pilot-source/` as the concise authoring layer
- `examples/compiled-pilot/` as the generated corpus
- current pilot output: **2 source files -> 8 generated corpus files**

## Why AODS is valuable

AODS is valuable **not because it is currently the smallest format**, but because it makes the agent-workflow tradeoff explicit and enforceable:

1. **It gives agents a native routing model.** `root -> capsule -> detail` is a real contract, not a documentation convention.
2. **It gives mixed human/agent documentation an authority model.** `surface_pairs`, `sync_source`, and `shared_invariants` turn drift from a social problem into a technical one.
3. **It separates repository-scale weight from task-time context cost.** The benchmark now proves those are different signals.
4. **It is becoming more adoptable.** The new compiled-authoring pilot shows the repo is moving away from "hand-author every JSON artifact forever."

The current value proposition is therefore:

> **Use AODS when you need governed, agent-first documentation with explicit routing and anti-drift behavior, not when your only goal is smallest possible repository size.**

Two authority rules stay invariant in this repository:

- Human surfaces do not replace agent-primary semantic authority.
- Manifest metadata alone does not satisfy agent-primary semantic synchronization.

## Current limits

The benchmark still shows clear limits:

- AODS is **not yet** a proven corpus-wide compression format.
- Semantic drift recall is **71.4%**; undeclared semantic conflicts are still not fully native.
- The prompt-envelope metric is benchmark-rendered, not yet captured from a live runtime serialization path.
- The benchmark is still synthetic and English-only.
- `bidirectional`, `phase`, and `feature` pair scopes are not yet covered in the benchmark pack.

## Quick start

```bash
npm install
npm run validate:all
npm run route -- --touch spec/validation-rules.json --role doc-author
npm run compile:pilot
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
npm run validate:compiled-pilot
npm run validate:all
```

Direct CLI usage:

```bash
node ./bin/aods.mjs validate .
node ./bin/aods.mjs validate . --json
node ./bin/aods.mjs validate . --strict
```

### Route scoped module loads

```bash
npm run route -- --touch spec/validation-rules.json --role doc-author
node ./bin/aods.mjs route . --touch spec/validation-rules.json --role doc-author
```

Routing precedence:

1. `boot_by_touch`
2. `boot_by_role`
3. `boot_sequence`

### Compile a concise authoring source

```bash
npm run compile:pilot
node ./bin/aods.mjs compile ./examples/compiled-pilot-source/authoring.json ./tmp/compiled-pilot --force
```

The compile command emits:

- `manifest.json`
- module JSON files with computed `tokens_approx`
- copied AODS schemas
- declared human-facing files such as `README.md`

### Run hook-based enforcement

```bash
npm run hook:pre-commit
node ./bin/aods.mjs hook pre-commit . --file README.md --file spec/surface-governance.json
```

Hook behavior:

- validates only the affected corpus or corpora
- blocks unsafe human-only edits when `sync_source=agent-primary` and no paired agent module changed
- enforces declared `shared_invariants` across paired human and agent surfaces
- forces broader validation for implementation-layer changes such as `lib/`, `schema/`, or `.githooks/`

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

### Scaffold new corpora or modules

```bash
node ./bin/aods.mjs scaffold corpus ../my-corpus --sys my-system
node ./bin/aods.mjs scaffold module ../my-corpus control-plane --category policy --layer detail --scope "Control plane semantics"
```

## Repository structure

| Path | Role |
| --- | --- |
| `manifest.json` | Root index and agent entrypoint for the AODS standard corpus |
| `schema/` | Normative JSON Schemas for manifests and modules |
| `spec/` | Normative standard modules |
| `bin/aods.mjs` | Reference CLI entrypoint |
| `lib/` | Reference implementation for validate, route, compile, hook, scaffold, and upgrade |
| `benchmarks/aods-eval-lab/` | Primary benchmark harness and published reports |
| `research/` | Non-normative landscape scans and benchmark rationale |
| `examples/seven-plane-pilot/` | Hand-authored example corpus |
| `examples/compiled-pilot-source/` | Concise compiled-authoring source |
| `examples/compiled-pilot/` | Generated compiled-authoring output corpus |
| `.githooks/` | Optional git hook integration |

## Normative vs non-normative

- **Normative:** `manifest.json`, `schema/`, `spec/`
- **Non-normative but executable:** `bin/`, `lib/`, `.githooks/`, `examples/`
- **Non-normative measurement layer:** `benchmarks/aods-eval-lab/`
- **Non-normative research archive:** `research/`

Two rules matter:

1. **The reference implementation is not the standard.**
2. **Benchmark results do not define conformance.**

## Key resources

- **Human orientation:** this README
- **Agent bootstrap:** `manifest.json`
- **Internal AODS evaluation:** `benchmarks/aods-eval-lab/reports/aods-evaluation-report.md`
- **Round-one comparison report:** `benchmarks/aods-eval-lab/reports/round1-comparator-report.md`
- **Machine-readable evaluation results:** `benchmarks/aods-eval-lab/generated/results/evaluation-results.json`
- **Machine-readable comparison results:** `benchmarks/aods-eval-lab/generated/results/round1-comparator-results.json`
- **Research archive index:** `research/README.md`

## License

This project is released under the **MIT License**. See [`LICENSE`](./LICENSE).

## Schema version

AODS v3 - 2026-04-13
