# AODS evaluation report

## Executive summary

This repository uses `benchmarks/aods-eval-lab` as its primary regression harness. The harness regenerates a multi-domain benchmark pack and evaluates AODS for coverage, fidelity, compression, progressive loading, drift prevention, and authoring overhead.

- **Coverage:** lifecycle phase coverage 100.0%, structured type coverage 100.0%, generic type coverage 100.0%.
- **Fidelity:** critical fact preservation 100.0% with overall fact preservation 100.0%.
- **Exact corpus size:** human docs 44915 bytes across 8 files; AODS corpus 71309 bytes across 12 files.
- **Task-time context footprint:** objective touch-route median loaded working set 24360 bytes and 6091 estimated tokens.
- **Objective loading gate:** touch-route hit rate 100.0%, average recall 100.0%, median byte savings 65.8%.
- **Drift prevention:** built-in recall 100.0%, combined recall 100.0%, built-in false-positive rate 0.0%.
- **Advisory metrics:** token estimates and semantic-load scenarios remain exploratory rather than release-gating signals.

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
| Touch routes | 20 |

## Validation baseline

- **Errors:** 0
- **Warnings:** 0
- **Modules:** 11
- **Sections:** 14
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
- Exact human-doc size: **44915 bytes**, **1643 lines**, **8 files**
- Exact AODS corpus size: **71309 bytes**, **2106 lines**, **12 files**
- Estimated human-doc tokens: **11232**
- Estimated AODS tokens: **17829**
- Compression ratio (human/AODS): **0.63**
- Token reduction vs human docs: **-58.7%**
- Median per-artifact compression ratio: **1.23**
- Interpretation: **exact size and estimated token views agree on the same result: local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark. This is a repository-scale measurement, not a direct reading of task-time context pressure.**

### 3. Objective touch-route loading gate and working-set context footprint

- Full-load exact corpus size: **71309 bytes**
- Objective scenarios: **5**
- Hit rate across objective touch-route scenarios: **100.0%**
- Average precision: **100.0%**
- Average recall: **100.0%**
- Median loaded working set: **24360 bytes**, **6091 estimated tokens**
- Max loaded working set: **35817 bytes**, **8955 estimated tokens**
- Median byte savings vs full load: **65.8%**
- Median token savings vs full load: **65.8%**
- Interpretation: **route_bytes and route_tokens_estimated are the current benchmark proxy for actual task-time context occupancy. A larger full corpus does not automatically imply a larger per-task context if routing keeps the working set small.**

| Objective scenario | Class | Hit | Byte savings |
| --- | --- | --- | ---: |
| product-doc-edit | paired-human-surface-write | hit | 65.8% |
| architecture-module-edit | agent-module-write | hit | 49.8% |
| ops-doc-edit | operations-human-surface-write | hit | 58.8% |
| harbor-change-control-edit | human-primary-sop-write | hit | 66.2% |
| harbor-audit-evidence-edit | audit-evidence-write | hit | 69.5% |

### 4. Exploratory semantic loading

- Exploratory scenarios: **4**
- Hit rate across exploratory semantic scenarios: **100.0%**
- Average precision: **33.3%**
- Average recall: **100.0%**
- Median loaded working set: **50332 bytes**, **12584 estimated tokens**
- Median byte savings vs full load: **29.4%**
- Interpretation: **semantic-load scenarios are still useful for research, but they are not treated as objective release gates because the current reference CLI does not implement semantic routing. Their loaded working-set numbers are therefore informative, not authoritative.**

### 5. Drift prevention

- Built-in drift recall: **100.0%**
- Semantic drift recall: **71.4%**
- Combined recall: **100.0%**
- Built-in false-positive rate: **0.0%**

| Scenario | Built-in | Semantic audit |
| --- | --- | --- |
| control-neutral-sync-edit | missed | missed |
| readme-human-only-drift | detected | detected |
| manifest-bypass-readme | detected | detected |
| semantic-pair-conflict | detected | detected |
| ops-human-only-drift | detected | detected |
| harbor-human-primary-human-only-drift | detected | detected |
| broken-touch-route | detected | missed |
| path-escape-pair | detected | missed |

### 6. Sample diversity and coverage audit

- Dataset count: **2**
- Dataset class: **synthetic-lifecycle-pack**
- Domains: **release-ops, regulated-change-control**
- Languages: **en**
- Dataset breakdown: **atlas=7 modules/5 docs/27 items; harbor=4 modules/3 docs/9 items**
- Roles exercised in scenarios: **5/5**
- Loading scenario split: **5 objective**, **4 exploratory**
- Drift scenario classes: **control-neutral, human-only-drift, manifest-bypass, semantic-conflict, human-primary-drift, route-integrity, path-safety**
- Sync modes present: **agent-primary, human-primary**
- Sync modes absent: **bidirectional**
- Pair scopes absent: **phase, feature**

**Expansion check:** the current benchmark now spans multiple synthetic datasets and more than one sync mode, so diversity is stronger than the original single-corpus baseline. Coverage across artifact families remains strong, but language coverage and real-world toolchain diversity are still limited.

### 7. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **44**
- Bookkeeping entries per benchmark item: **1.22**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only heuristic token and semantic-load signals.
4. The benchmark now makes repository-scale corpus weight and task-time working-set context footprint explicit instead of conflating them.

### Limits and failure modes

- No declared-invariant or known governance scenario remains a built-in miss in the current benchmark pack.

- The reference implementation now validates declared cross-surface invariants, but it still does not prove semantic equivalence beyond declared anchors.
- Progressive loading is strongest for touch-routed authoring flows; semantic query loading still depends on corpus metadata quality and remains exploratory.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- Sample diversity is still limited because the current benchmark remains synthetic, English-only, and narrower than a true multi-toolchain field sample.

## Bottom line

**Coverage is strong, the objective touch-route gate is cleanly measurable, full-fidelity representation is achievable, and built-in anti-drift is materially stronger once shared_invariants are declared.** In this benchmark pack AODS preserves meaning, yet corpus weight may still grow because governance overhead can outweigh local artifact compression. The benchmark is now more objective and more diverse than the original single-corpus baseline, but it still needs broader language and field-sample coverage.

## Appendix: reproducibility

```bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
```
