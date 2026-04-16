# AODS

[English](./README.md) | [简体中文](./README.zh-CN.md)

AODS is a documentation standard and CLI for teams that want AI agents to work from a clear, governed source of truth instead of piecing together context from scattered project docs.

**Latest release:** `v0.4.0`

In this README, **human-oriented docs** means files mainly written for people to read, such as README files, SOPs, or checklists. **Agent-oriented docs** means structured files that agents and tooling can route, validate, and compare. For compatibility, the schema and CLI still use field names such as `human_primary`, `agent_primary`, and `sync_source=agent-primary`.

## The problem

Project documentation is usually optimized for people first. That creates four recurring failures for code agents:

1. **Retrieval is expensive or ambiguous.** Agents often work `grep`-first and file-structure-first, so weak routing and inconsistent terminology waste context.
2. **Authority is implicit.** README files, operational notes, and implementation details can disagree without any built-in way to say which one leads.
3. **The docs people read and the structured source agents rely on drift apart.** A README can change while the agent-oriented source of truth stays stale, or the inverse.
4. **Repository size and per-task context get conflated.** A large corpus is not always a large working set, but most documentation formats do not make that distinction measurable.

AODS exists because the current alternatives each solve only one slice of that problem. Markdown is easy to write, `llms.txt` is lightweight, and DITA is mature for structured publishing, but none of them combine agent routing, governed pairing between reader-friendly docs and structured sources, and measurable anti-drift behavior in one system.

## The AODS path

AODS takes a specific path instead of claiming universal compression:

1. **Structure the corpus for agents.** Use typed JSON modules and typed artifacts instead of only long prose pages.
2. **Load progressively.** Start from a small entry index (`root`), route through a summary layer (`capsule`), then open `detail` or `evidence` modules. Routing can start from either a touched file (`--touch`) or a natural-language query (`--query`).
3. **Make ownership explicit.** Link a human-oriented document and an agent-oriented source file, then declare which side leads and which facts must stay aligned.
4. **Catch obvious contradictions early.** The validator checks a small, conservative set of high-signal conflicts such as before-and-after numeric changes, must-include lists, time windows, and execution preconditions.
5. **Enforce the contract.** Use schema validation, route checks, and pre-commit enforcement to block malformed or unsafe sync changes.
6. **Reduce authoring overhead.** Move AODS toward a compiled target so teams do not need to hand-author every JSON file.

This repository contains all three layers in one place:

| Layer | What it contains |
| --- | --- |
| **Standard** | `manifest.json`, `schema/`, and `spec/` define the normative AODS contract |
| **Reference implementation** | `bin/` and `lib/` implement validate, route, compile, scaffold, upgrade, and hook behavior |
| **Benchmark** | `benchmarks/aods-eval-lab/` measures whether the implementation actually earns its claims |

## Install

### Use AODS in another project

Requires **Node 18+**.

1. Install the tagged GitHub release into your project:

```bash
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.4.0
```

2. Verify the CLI is available:

```bash
npx aods --help
```

3. Scaffold a new AODS authoring source in your project:

```bash
npx aods scaffold authoring ./aods --sys my-system --purpose "Agent-first docs for my system" --force
```

4. Compile and validate the AODS docs bundle you will keep in your own repository:

```bash
npx aods compile ./aods/authoring.json ./docs/aods --force
npx aods validate ./docs/aods --strict
npx aods validate ./docs/aods --strict --reality
npx aods validate ./docs/aods --strict --reality --repo-root .
```

Use `--reality` only when your corpus declares `surface-inventory` artifacts and you want AODS to verify declared **current** surfaces. For `content.base: "corpus"`, paths resolve from the corpus root. For `content.base: "repo"`, paths resolve from `--repo-root` when supplied; otherwise they also resolve from the corpus root. `reserved` and `future` entries stay as planned surfaces, so they are recorded without being required to exist yet. Current directories must contain real material, not only placeholder files such as `.gitkeep`.

```json
{"type":"surface-inventory","content":{"base":"repo","entries":[{"surface_id":"web-src","path":"apps/web/src","kind":"directory","state":"current"}]}}
```

5. Use scaffold helpers for common changes instead of hand-editing dense JSON:

```bash
npx aods scaffold authoring-module ./aods/authoring.json delivery-gates --category policy --layer detail --scope "Delivery gate authority" --role doc-author
npx aods scaffold authoring-touch ./aods/authoring.json --match package.json --load my-system-root --load delivery-gates --intent write
npx aods scaffold authoring-pair ./aods/authoring.json --pair-id pair-delivery-log --agent-primary delivery-gates --human-primary DELIVERY-LOG.md
npx aods scaffold authoring-pair ./aods/authoring.json --pair-id pair-delivery-guide --agent-primary delivery-gates --human-primary DELIVERY-GUIDE.md --generated-profile overview --generated-title "Delivery Guide"
```

6. When you need implementation-phase governance, scaffold the ready-made pattern instead of inventing it from scratch:

```bash
npx aods scaffold authoring-module ./aods/authoring.json release-governance --pattern implementation-governance --role doc-author
```

That pattern creates a starter module with four governance structures already wired in:

- an implementation / acceptance matrix
- final system gate rules
- a runtime contract table
- a scripted / expert / human review routing tree

### Optional: install the release-aligned Copilot skill

If you want another agent to work inside an AODS repo without loading the whole standard first, copy `skills/aods-use/` from the same release tag into that agent's skills directory.

This skill is intentionally thin. It helps an agent:

- detect whether the repo is source-first or compiled-corpus-first
- choose the minimal correct AODS command path
- respect `agent-primary` authority instead of treating human-oriented docs as a second source of truth

### Clone the repository directly

Use this mode if you want the full standard repo, benchmark lab, and examples locally:

```bash
git clone https://github.com/emosamastudio/aods.git
cd aods
npm install
npm run validate:all
```

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

The lab now also includes an **optional local runtime-capture supplement**. It records one exact Copilot CLI provider request body for a routed AODS scenario, so the benchmark can compare its rendered prompt-envelope proxy against a real runtime payload shape.

For horizontal comparison, the benchmark uses three outside baselines:

| Baseline | Why it was chosen |
| --- | --- |
| **Markdown + YAML** | The practical docs-as-code incumbent for most teams |
| **`llms.txt`** | The minimal AI-facing alternative and the opposite design philosophy from AODS |
| **DITA topic corpus** | The closest structural cousin in modular documentation |

<!-- BENCHMARK_SYNC:START -->
## Current benchmark result

| Dimension | Current result | Reading |
| --- | --- | --- |
| **Coverage** | **100.0%** lifecycle, **100.0%** structured types, **100.0%** generic types | The benchmark pack is fully representable in AODS |
| **Fidelity** | **100.0%** fact preservation, **100.0%** critical fact preservation | Information survived the rewrite on the current pack |
| **Full-corpus size** | **45243 bytes** vs human-doc baseline **45372 bytes** | AODS is currently **0.3% smaller** at repository scale |
| **Objective median loaded payload** | **10839 bytes** | Routed working set stays far below full-corpus size |
| **Objective median prompt envelope** | **12372 bytes** | Closer proxy to actual context-window occupation |
| **Task-stage coverage** | **100.0%** across **5** explicit stages | Routed scenarios now declare orientation, plan, action, verification, and evidence explicitly |
| **Supplemental runtime sample** | **not captured in current run** | Runtime capture remains optional and is absent from the latest benchmark pass |
| **Objective touch-route hit rate** | **100.0%** | All objective routing scenarios hit the required modules |
| **Objective median byte savings vs full load** | **76.0%** | Routed work is materially smaller than full-load work |
| **Built-in drift recall** | **100.0%** | Current validator and hook layer catches all current benchmark hazards |
| **Built-in false-positive rate** | **0.0%** | No misfire on the benchmark control scenario set |
| **Benchmark diversity** | **2 datasets**, **5 task stages** | Stronger than the original single-corpus pack, still synthetic and English-only |

## Horizontal comparison

| Baseline | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **AODS** | 100.0% | 100.0% | 45243 | 100.0% | 10839 | 12372 |
| **Markdown + YAML** | 100.0% | 100.0% | 47894 | 0.0% | 5234 | 5844 |
| **llms.txt** | 100.0% | 100.0% | 46977 | 0.0% | 6480 | 7178 |
| **DITA topic corpus** | 100.0% | 100.0% | 65595 | 0.0% | 718 | 1320 |

**How to read this table:** the non-AODS baselines stay lighter on bytes, but they score **0.0%** on the benchmark's objective touch-route contract because they do not provide AODS-style native routing and paired-surface governance. Their smaller loaded byte counts are therefore not evidence of equivalent governed retrieval.

## Latest benchmark delta

| Metric | Current | Previous | Delta vs previous | Reading |
| --- | --- | --- | --- | --- |
| Lifecycle phase coverage | 100.0% | 100.0% | +0.0 pts | flat |
| Fact preservation rate | 100.0% | 100.0% | +0.0 pts | flat |
| AODS exact corpus bytes | 45243 bytes | 45243 bytes | +0 bytes | flat |
| Objective touch-route hit rate | 100.0% | 100.0% | +0.0 pts | flat |
| Objective median loaded bytes | 10839 bytes | 10839 bytes | +0 bytes | flat |
| Objective median prompt-envelope bytes | 12372 bytes | 12372 bytes | +0 bytes | flat |
| Built-in drift recall | 100.0% | 100.0% | +0.0 pts | flat |
| Built-in false-positive rate | 0.0% | 0.0% | +0.0 pts | flat |
| External sample corpus count | 3 | 3 | +0 | flat |
| External sample scenario count | 17 | 17 | +0 | flat |
| Task stage coverage | 100.0% | 100.0% | +0.0 pts | flat |
| Runtime request-body bytes | n/a | n/a | n/a | no prior baseline |
| Exploratory query precision | 100.0% | 100.0% | +0.0 pts | flat |
<!-- BENCHMARK_SYNC:END -->

## Why AODS is valuable

AODS is valuable **not mainly because the current benchmark is slightly smaller than the reader-oriented doc baseline on full-corpus size**, but because it turns documentation tradeoffs that are usually handled by habit into explicit, testable contracts:

1. **It gives agents a native routing model.** `root -> capsule -> detail` is a real contract, not a vague convention.
2. **It gives teams a governed way to keep reader-friendly docs and structured sources aligned.** `surface_pairs`, `sync_source`, `shared_invariants`, and conservative paired-claim checks turn drift from a social problem into a technical one.
3. **It separates repository-scale weight from per-task context cost.** The benchmark now proves those are different signals, and recent optimization waves improved both without weakening governance.
4. **It is getting easier to adopt.** The compiled-authoring path now supports artifact-first modules instead of forcing synthetic prose just to satisfy the format.

The current value proposition is therefore:

> **Use AODS when you need governed, AI-friendly project documentation with explicit routing and drift controls, not when your only goal is the smallest possible repository size.**

Two authority rules stay invariant in this repository:

- Human surfaces do not replace agent-primary semantic authority.
- Manifest metadata alone does not satisfy agent-primary semantic synchronization.

In plain words: a reader-friendly document cannot overrule the structured source of truth, and metadata-only updates do not count as real content sync.

## Current limits

The benchmark still shows clear limits:

- AODS is **not yet** a proven corpus-wide compression format.
- Built-in anti-drift is still conservative. It now catches a small set of high-signal contradictions, but it is not a general-purpose meaning checker.
- The benchmark's advisory semantic heuristic scores **75.0%** on the current scenario pack.
- The main scoreboard still uses renderer-based prompt-envelope metrics across the whole scenario set. The repo now also ships one local Copilot CLI runtime-capture supplement, but not yet a full runtime-backed scenario matrix.
- The benchmark is still synthetic and English-only.
- `bidirectional` remains an explicitly gated experimental sync mode: the reference hook requires manual review when paired docs in this mode change instead of pretending auto-merge is solved.
- `phase` and `feature` pair scopes are not yet covered in the benchmark pack.

## Quick start

```bash
npm install
npm run validate:all
npm run route -- --touch spec/validation-rules.json --role doc-author
npm run route -- --query "paired docs drift rules" --role doc-author --intent read
npm run compile:pilot
npm run benchmark:runtime-capture   # optional supplemental sample
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:summary
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
node ./bin/aods.mjs validate . --strict --reality
node ./bin/aods.mjs validate . --strict --reality --repo-root ..
```

### Route scoped module loads

```bash
npm run route -- --touch spec/validation-rules.json --role doc-author
node ./bin/aods.mjs route . --query "paired docs drift rules" --role doc-author --intent read
node ./bin/aods.mjs route . --query "audit evidence retention" --role doc-author --intent read --stage evidence
node ./bin/aods.mjs route . --touch spec/validation-rules.json --role doc-author
```

Use `--touch` when you already know which file changed. Use `--query` when you only know the task in plain words and want the CLI to find the likely authority modules by lexical and structural anchors from module metadata, paired docs, and compact artifact semantics. Add `--stage` when the task phase is clear (`orientation`, `plan`, `action`, `verification`, `evidence`) but the exact file target is not.

Routing precedence:

1. `boot_by_touch`
2. touched paired doc or touched module
3. lexical + structural `--query` routing
4. `boot_by_role`
5. `boot_sequence`

### Compile a concise authoring source

```bash
node ./bin/aods.mjs scaffold authoring ./tmp/authoring-source --sys sample-system --force
npm run compile:pilot
node ./bin/aods.mjs compile ./examples/compiled-pilot-source/authoring.json ./tmp/compiled-pilot --force
```

Authoring sources now validate against `schema/authoring.schema.json`, so compiled authoring is a real contract rather than a one-off pilot format. Modules may be section-first, artifact-first, or mixed; compiled AODS only requires at least one `section` or `artifact`.

The CLI now exposes safe authoring mutation paths for three common edits:

- add a module to `authoring.json`
- add or replace a touch route safely
- scaffold a human-oriented companion file and register its pairing metadata

Paired human outputs can now be modeled in two ways:

- manual human files declared through `files[]`
- opt-in deterministic generated outputs declared per pair with `human_generation`

For implementation-heavy projects, `scaffold authoring-module --pattern implementation-governance` creates a ready-made delivery-governor module with:

- an implementation matrix
- system gate rules
- a runtime contract table
- review routing between scripted, expert, and human approval lanes

The compile command emits:

- compact `manifest.json` for machine-first loading
- compact module JSON files with computed `tokens_approx`
- compact `indexes/runtime.json` companion slices for glossary, `boot_by_role`, `boot_by_touch`, `surface_pairs`, and runtime role profiles
- copied AODS schemas
- declared manual human-oriented files such as `README.md`
- opt-in deterministic generated human-oriented files such as overview or checklist surfaces

When `boot_by_role` is present, compiled companion `roles` are reduced to runtime role profiles: `id` plus optional `capabilities`. `required_modules` is kept only when it differs from the boot binding.

### Run hook-based enforcement

```bash
npm run hook:pre-commit
node ./bin/aods.mjs hook pre-commit . --file README.md --file spec/surface-governance.json
```

Hook behavior:

- validates only the affected corpus or corpora
- blocks unsafe edits to human-oriented docs when `sync_source=agent-primary` and no paired agent-oriented module changed
- blocks unsafe edits to agent-oriented modules when `sync_source=human-primary` and no paired human-oriented doc changed
- requires manual review for changed `sync_source=bidirectional` pairs because automatic merge behavior is still experimental
- accepts valid deterministic regenerated human files under `agent-primary`, but flags manual drift in generated outputs
- enforces declared `shared_invariants` across paired docs
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

### Scaffold new corpora or authoring sources

```bash
node ./bin/aods.mjs scaffold corpus ../my-corpus --sys my-system
node ./bin/aods.mjs scaffold module ../my-corpus control-plane --category policy --layer detail --scope "Control plane semantics"
node ./bin/aods.mjs scaffold authoring-module ./examples/compiled-pilot-source/authoring.json shift-ops-log --category reference --layer detail --scope "Shift operations log authority"
node ./bin/aods.mjs scaffold authoring-touch ./examples/compiled-pilot-source/authoring.json --match README.md --load shift-ops-capsule --load shift-ops-policy --intent write
node ./bin/aods.mjs scaffold authoring-pair ./examples/compiled-pilot-source/authoring.json --pair-id pair-shift-ops-log --agent-primary shift-ops-runbook --human-primary SHIFT-OPS-LOG.md
node ./bin/aods.mjs scaffold authoring-pair ./examples/compiled-pilot-source/authoring.json --pair-id pair-shift-ops-guide --agent-primary shift-ops-policy --human-primary SHIFT-OPS-GUIDE.md --generated-profile checklist
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

- **Reader-friendly overview:** this README
- **Agent bootstrap:** `manifest.json`
- **Internal AODS evaluation:** `benchmarks/aods-eval-lab/reports/aods-evaluation-report.md`
- **Round-one comparison report:** `benchmarks/aods-eval-lab/reports/round1-comparator-report.md`
- **Machine-readable evaluation results:** `benchmarks/aods-eval-lab/generated/results/evaluation-results.json`
- **Machine-readable comparison results:** `benchmarks/aods-eval-lab/generated/results/round1-comparator-results.json`
- **Research archive index:** `research/README.md`

## License

This project is released under the **MIT License**. See [`LICENSE`](./LICENSE).

## Versioning

AODS now uses two version tracks:

- **Release version:** Git tags and package releases such as `v0.4.0`
- **Release-aligned skill version:** packaged skills under `skills/` stay aligned to the same release tag
- **Schema compatibility:** surface-local markers such as `aods_v` and `authoring_v`

Schema markers remain important for compatibility and migration, but they are no longer the public product label in README files. Public-facing docs should refer to the release version, not legacy schema-generation branding.
