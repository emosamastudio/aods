# AODS evaluation report

## Executive summary

This repository uses `benchmarks/aods-eval-lab` as its primary regression harness. The harness regenerates one lifecycle-complete benchmark corpus and evaluates AODS for coverage, fidelity, compression, progressive loading, drift prevention, and authoring overhead.

- **Coverage:** lifecycle phase coverage 100.0%, structured type coverage 100.0%, generic type coverage 100.0%.
- **Fidelity:** critical fact preservation 100.0% with overall fact preservation 100.0%.
- **Exact corpus size:** human docs 36055 bytes across 5 files; AODS corpus 54644 bytes across 8 files.
- **Objective loading gate:** touch-route hit rate 100.0%, average recall 100.0%, median byte savings 58.5%.
- **Drift prevention:** built-in recall 83.3%, combined recall 100.0%, built-in false-positive rate 0.0%.
- **Advisory metrics:** token estimates and semantic-load scenarios remain exploratory rather than release-gating signals.

## Scope and independence

- **System under test:** `.`
- **Benchmark harness:** `benchmarks/aods-eval-lab`
- **Corpus design:** synthetic but lifecycle-complete release coordination system with paired human surfaces and seven agent-facing modules
- **Scoring posture:** deterministic metrics first, narrative judgment second

## Dataset composition

| Dimension | Value |
| --- | --- |
| Total benchmark items | 27 |
| Prose sections | 6 |
| Typed artifacts | 21 |
| Paired surfaces | 5 |
| Modules | 7 |
| Touch routes | 13 |

## Validation baseline

- **Errors:** 0
- **Warnings:** 0
- **Modules:** 7
- **Sections:** 10
- **Artifacts:** 21

## Results by dimension

### 1. Lifecycle coverage and expression breadth

- Lifecycle phase coverage is **100.0%** across 9 phases.
- Structured artifact coverage is **100.0%** for the 12 structured types.
- Generic artifact coverage is **100.0%** for the 8 generic types.
- Raw fallback rate is **4.8%**, driven by one SQL evidence artifact kept intentionally in the evidence layer.

### 2. Information-preserving compression

- Critical fact preservation is **100.0%**.
- Overall fact preservation is **100.0%**.
- Exact human-doc size: **36055 bytes**, **1318 lines**, **5 files**
- Exact AODS corpus size: **54644 bytes**, **1580 lines**, **8 files**
- Estimated human-doc tokens: **9016**
- Estimated AODS tokens: **13662**
- Compression ratio (human/AODS): **0.66**
- Token reduction vs human docs: **-51.5%**
- Median per-artifact compression ratio: **1.23**
- Interpretation: **exact size and estimated token views agree on the same result: local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark.**

### 3. Objective touch-route loading gate

- Full-load exact corpus size: **54644 bytes**
- Objective scenarios: **3**
- Hit rate across objective touch-route scenarios: **100.0%**
- Average precision: **100.0%**
- Average recall: **100.0%**
- Median byte savings vs full load: **58.5%**
- Median token savings vs full load: **58.5%**

| Objective scenario | Class | Hit | Byte savings |
| --- | --- | --- | ---: |
| product-doc-edit | paired-human-surface-write | hit | 67.7% |
| architecture-module-edit | agent-module-write | hit | 46.7% |
| ops-doc-edit | operations-human-surface-write | hit | 58.5% |

### 4. Exploratory semantic loading

- Exploratory scenarios: **3**
- Hit rate across exploratory semantic scenarios: **100.0%**
- Average precision: **43.9%**
- Average recall: **100.0%**
- Median byte savings vs full load: **37.7%**
- Interpretation: **semantic-load scenarios are still useful for research, but they are not treated as objective release gates because the current reference CLI does not implement semantic routing.**

### 5. Drift prevention

- Built-in drift recall: **83.3%**
- Semantic drift recall: **66.7%**
- Combined recall: **100.0%**
- Built-in false-positive rate: **0.0%**

| Scenario | Built-in | Semantic audit |
| --- | --- | --- |
| control-neutral-sync-edit | missed | missed |
| readme-human-only-drift | detected | detected |
| manifest-bypass-readme | detected | detected |
| semantic-pair-conflict | missed | detected |
| ops-human-only-drift | detected | detected |
| broken-touch-route | detected | missed |
| path-escape-pair | detected | missed |

### 6. Sample diversity and coverage audit

- Dataset count: **1**
- Dataset class: **synthetic-lifecycle**
- Domains: **release-ops**
- Languages: **en**
- Roles exercised in scenarios: **4/4**
- Loading scenario split: **3 objective**, **3 exploratory**
- Drift scenario classes: **control-neutral, human-only-drift, manifest-bypass, semantic-conflict, route-integrity, path-safety**
- Sync modes present: **agent-primary**
- Sync modes absent: **human-primary, bidirectional**
- Pair scopes absent: **phase, feature**

**Expansion check:** the current benchmark is lifecycle-complete but still single-dataset, single-domain, single-language, and single sync-mode. That means coverage across artifact families is strong, but diversity across corpus families is still narrow and can be expanded objectively.

### 7. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **29**
- Bookkeeping entries per benchmark item: **1.07**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only heuristic token and semantic-load signals.

### Limits and failure modes

- Built-in anti-drift checks miss semantic conflicts when paired human and agent files both change.

- The reference implementation validates structure and routing better than semantic truth.
- Progressive loading is strongest for touch-routed authoring flows; semantic query loading still depends on corpus metadata quality and remains exploratory.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- Sample diversity is still limited because the current benchmark contains one synthetic system, one domain, and one language.

## Bottom line

**Coverage is strong, the objective touch-route gate is now cleanly measurable, full-fidelity representation is achievable, but compression is mixed and anti-drift protection is still incomplete at semantic-conflict level.** In this benchmark AODS preserves meaning, yet the whole corpus expands by about 51.5% because governance overhead outweighs local artifact compression. The benchmark itself is more objective than before, but sample diversity still needs expansion beyond one synthetic release-ops corpus.

## Appendix: reproducibility

```bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
```
