# AODS evaluation report

## Executive summary

This repository uses `benchmarks/aods-eval-lab` as its primary regression harness. The harness regenerates a multi-domain benchmark pack and evaluates AODS for coverage, fidelity, compression, progressive loading, drift prevention, and authoring overhead.

- **Coverage:** lifecycle phase coverage 100.0%, structured type coverage 100.0%, generic type coverage 100.0%.
- **Fidelity:** critical fact preservation 100.0% with overall fact preservation 100.0%.
- **Exact corpus size:** human docs 45372 bytes across 8 files; AODS corpus 45243 bytes across 13 files.
- **Task-time context footprint:** objective touch-route median rendered prompt envelope 12372 bytes and 3093 estimated tokens.
- **Objective loading gate:** touch-route hit rate 100.0%, average recall 100.0%, median byte savings 76.0%.
- **Drift prevention:** built-in recall 100.0%, combined recall 100.0%, built-in false-positive rate 0.0%.
- **Runtime-backed local sample:** not generated in this run.
- **External sample supplement:** 3 open-source corpora and 17 grep-first scenario seeds now supplement the synthetic benchmark pack.
- **Advisory metrics:** token estimates and query-route scenarios remain exploratory rather than release-gating signals.

## Scope and independence

- **System under test:** `.`
- **Benchmark harness:** `benchmarks/aods-eval-lab`
- **Corpus design:** synthetic multi-domain benchmark pack with paired human surfaces and 11 agent-facing modules
- **Scoring posture:** deterministic metrics first, narrative judgment second

## Dataset composition

| Dimension | Value |
| --- | --- |
| Total benchmark items | 36 |
| Prose sections | 10 |
| Typed artifacts | 26 |
| Paired surfaces | 8 |
| Modules | 11 |
| Touch routes | 21 |

## Validation baseline

- **Errors:** 0
- **Warnings:** 0
- **Modules:** 11
- **Sections:** 10
- **Artifacts:** 26

## Results by dimension

### 1. Lifecycle coverage and expression breadth

- Lifecycle phase coverage is **100.0%** across 9 phases.
- Structured artifact coverage is **100.0%** for the 12 structured types.
- Generic artifact coverage is **100.0%** for the 8 generic types.
- Raw fallback rate is **7.7%**, driven by one SQL evidence artifact kept intentionally in the evidence layer.

### 2. Information-preserving compression

- Critical fact preservation is **100.0%**.
- Overall fact preservation is **100.0%**.
- Exact human-doc size: **45372 bytes**, **1651 lines**, **8 files**
- Exact AODS corpus size: **45243 bytes**, **26 lines**, **13 files**
- Estimated human-doc tokens: **11346**
- Estimated AODS tokens: **11315**
- Compression ratio (human/AODS): **1.00**
- Token reduction vs human docs: **0.3%**
- Median per-artifact compression ratio: **1.22**
- Interpretation: **exact size and estimated token views agree on the same result: local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark. This is a repository-scale measurement, not a direct reading of task-time context pressure.**

### 3. Objective touch-route loading gate and working-set context footprint

- Full-load exact corpus size: **45243 bytes**
- Objective scenarios: **5**
- Hit rate across objective touch-route scenarios: **100.0%**
- Average precision: **100.0%**
- Average recall: **100.0%**
- Median loaded payload: **10839 bytes**, **2713 estimated tokens**
- Median rendered prompt envelope: **12372 bytes**, **3093 estimated tokens**
- Median prompt-envelope overhead: **1590 bytes**, **395 estimated tokens**
- Max rendered prompt envelope: **17404 bytes**, **4351 estimated tokens**
- Median byte savings vs full load: **76.0%**
- Median token savings vs full load: **76.0%**
- Median prompt-envelope savings vs fully rendered full-load prompt: **74.0%**
- Interpretation: **loaded payload measures routed file content only. Rendered prompt envelope adds separators, path labels, and scaffold text, so it is the closer shared benchmark proxy to actual context-window occupation. A larger full corpus does not automatically imply a larger per-task context if routing keeps the working set small.**

| Objective scenario | Class | Hit | Byte savings |
| --- | --- | --- | ---: |
| product-doc-edit | paired-human-surface-write | hit | 76.0% |
| architecture-module-edit | agent-module-write | hit | 64.8% |
| ops-doc-edit | operations-human-surface-write | hit | 73.5% |
| harbor-change-control-edit | human-primary-sop-write | hit | 78.7% |
| harbor-audit-evidence-edit | audit-evidence-write | hit | 81.4% |

### 4. Runtime-backed local provider capture (supplemental)

- No runtime capture artifact was loaded for this run.
- Interpretation: **the main benchmark still falls back to rendered prompt-envelope metrics until a runtime capture sample is generated.**


### 5. Exploratory query routing

- Exploratory scenarios: **4**
- Hit rate across exploratory query-route scenarios: **100.0%**
- Average precision: **100.0%**
- Average recall: **100.0%**
- Median loaded working set: **11672.5 bytes**, **2920 estimated tokens**
- Median rendered prompt envelope: **12803.5 bytes**, **3201.5 estimated tokens**
- Median byte savings vs full load: **74.2%**
- Interpretation: **these scenarios now call the real CLI query router, but they remain advisory because the prompts are still synthetic benchmark queries rather than field-captured production tasks. Their rendered prompt-envelope numbers are therefore informative, not release-gating.**

### 6. Drift prevention

- Built-in drift recall: **100.0%**
- Semantic drift recall on applicable scenarios: **100.0%** across **6** cases
- Semantic recall across all drift cases: **75.0%**
- Structural governance recall on semantic-not-applicable cases: **100.0%** across **2** cases
- Combined recall: **100.0%**
- Built-in false-positive rate: **0.0%**

| Scenario | Built-in | Semantic audit |
| --- | --- | --- |
| control-neutral-sync-edit | missed | missed |
| readme-human-only-drift | detected | detected |
| manifest-bypass-readme | detected | detected |
| semantic-pair-conflict | detected | detected |
| undeclared-claim-pair-conflict | detected | detected |
| ops-human-only-drift | detected | detected |
| harbor-human-primary-human-only-drift | detected | detected |
| broken-touch-route | detected | missed |
| path-escape-pair | detected | missed |

### 7. Sample diversity and coverage audit

- Dataset count: **2**
- Dataset class: **synthetic-lifecycle-pack**
- Domains: **release-ops, regulated-change-control**
- Languages: **en**
- Dataset breakdown: **atlas=7 modules/5 docs/27 items; harbor=4 modules/3 docs/9 items**
- Roles exercised in scenarios: **5/5**
- Loading scenario split: **5 objective**, **4 exploratory**
- Drift scenario classes: **control-neutral, human-only-drift, manifest-bypass, semantic-conflict, claim-conflict, human-primary-drift, route-integrity, path-safety**
- Sync modes present: **agent-primary, human-primary**
- Sync modes absent: **bidirectional**
- Pair scopes absent: **phase, feature**
- External sample corpora: **3**
- External scenario seeds: **17**
- External sample formats: **rst=4, markdown=13**
- External sample phases: **build, design, governance, operate, planning, release, vision**
- External sample benchmark dimensions: **coverage, drift, routing**

**Expansion check:** the main benchmark now spans multiple synthetic datasets and more than one sync mode, while the external sample supplement adds real open-source corpora for grep-first field realism. Coverage across artifact families remains strong, but language coverage is still limited and the fair common scoreboard is still narrower than a full multi-toolchain field matrix.

### 8. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **45**
- Bookkeeping entries per benchmark item: **1.25**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only advisory token and exploratory query-route signals.
4. The benchmark now makes repository-scale corpus weight, raw loaded payload size, rendered prompt-envelope size, and one runtime-backed request-body sample explicit instead of conflating them.

### Limits and failure modes

- No declared-invariant or known governance scenario remains a built-in miss in the current benchmark pack.

- The reference implementation now validates declared cross-surface invariants, but it still does not prove semantic equivalence beyond declared anchors.
- Progressive loading is strongest for touch-routed authoring flows; query routing still depends on corpus metadata quality and remains exploratory.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- The main scoreboard still relies on renderer-based prompt-envelope metrics across the full scenario set; the runtime-backed sample is currently one supplemental local Copilot CLI capture, not yet a full runtime matrix.
- Sample diversity is stronger than before because it now includes an external open-source scenario supplement, but the pack remains English-only and narrower than a true multi-toolchain field sample.

## Bottom line

**Coverage is strong, the objective touch-route gate is cleanly measurable, full-fidelity representation is achievable, and built-in anti-drift is materially stronger once shared_invariants are declared.** In this benchmark pack AODS preserves meaning, yet corpus weight may still grow because governance overhead can outweigh local artifact compression. The benchmark is now more objective and is no longer limited to a purely synthetic reading, but it still needs broader language coverage and a larger fair cross-toolchain field matrix.

## Appendix: reproducibility

```bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:runtime-capture   # optional supplemental sample
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
```
