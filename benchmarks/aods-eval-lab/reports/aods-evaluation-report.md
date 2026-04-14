# AODS evaluation report

## Executive summary

This repository uses `benchmarks/aods-eval-lab` as its primary regression harness. The harness regenerates one lifecycle-complete benchmark corpus and evaluates AODS for coverage, fidelity, compression, progressive loading, drift prevention, and authoring overhead.

- **Coverage:** lifecycle phase coverage 100.0%, structured type coverage 100.0%, generic type coverage 100.0%.
- **Fidelity:** critical fact preservation 100.0% with overall fact preservation 100.0%.
- **Compression:** mixed outcome: median per-artifact ratio 1.23, but full-corpus ratio 0.66 because manifest, routing, and pairing overhead add substantial tokens.
- **Progressive loading:** hit rate 100.0%, average recall 100.0%, median token savings 52.6%.
- **Drift prevention:** built-in recall 50.0%, combined recall 83.3%, built-in false-positive rate 0.0%.

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
- Estimated human-doc tokens: **9016**
- Estimated AODS tokens: **13662**
- Compression ratio (human/AODS): **0.66**
- Token reduction vs human docs: **-51.5%**
- Median per-artifact compression ratio: **1.23**
- Interpretation: **local artifact compression exists, but full-corpus governance overhead makes the generated AODS corpus larger than the paired human docs in this benchmark.**

### 3. Progressive loading and token cost

- Full-load token estimate: **13662**
- Hit rate across 6 scenarios: **100.0%**
- Average precision: **71.9%**
- Average recall: **100.0%**
- Median token savings vs full load: **52.6%**
- Median overfetch ratio: **1.14**

### 4. Drift prevention

- Built-in drift recall: **50.0%**
- Semantic drift recall: **66.7%**
- Combined recall: **83.3%**
- Built-in false-positive rate: **0.0%**

| Scenario | Built-in | Semantic audit |
| --- | --- | --- |
| control-neutral-sync-edit | missed | missed |
| readme-human-only-drift | detected | detected |
| manifest-bypass-readme | missed | detected |
| semantic-pair-conflict | missed | detected |
| ops-human-only-drift | detected | detected |
| broken-touch-route | detected | missed |
| path-escape-pair | missed | missed |

### 5. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **29**
- Bookkeeping entries per benchmark item: **1.07**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. Touch-routed authoring loads reduce token cost substantially against full-corpus loading.

### Limits and failure modes

- Built-in anti-drift checks miss semantic conflicts when paired human and agent files both change.
- README plus manifest metadata can bypass paired-surface blocking without updating the authoritative module.
- Relative path escape through ../ can move a paired human surface outside the corpus root without validator rejection.

- The reference implementation validates structure and routing better than semantic truth.
- Progressive loading is strongest for touch-routed authoring flows; semantic query loading still depends on corpus metadata quality and external heuristics.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains.
- Token counts remain heuristic rather than tokenizer-exact.

## Bottom line

**Coverage is strong, progressive loading is useful, full-fidelity representation is achievable, but compression is mixed and anti-drift protection is only partial.** In this benchmark AODS preserves meaning, yet the whole corpus expands by about 51.5% because governance overhead outweighs local artifact compression. The strongest current weakness remains semantic drift: validator and hook logic can block some paired-surface mistakes, but they do not prove that compressed summaries, paired docs, and supporting modules still agree in meaning.

## Appendix: reproducibility

```bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:evaluate
npm run benchmark:test
```
