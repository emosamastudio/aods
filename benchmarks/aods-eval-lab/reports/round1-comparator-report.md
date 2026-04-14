# AODS round-one benchmark evaluation report

## Executive summary

- **Dataset:** Atlas Release Ops benchmark corpus with **7** modules, **5** human surfaces, **27** lifecycle items, **6** shared loading queries, and **7** drift scenarios
- **Internal AODS result:** full lifecycle coverage, full fact preservation, **51.6% larger than the human-doc baseline** by exact bytes, **100.0%** objective touch-route hit rate, and **100.0%** combined drift recall
- **External comparison headline:** AODS is the only baseline in round one with **83.3%** native drift recall, while **llms.txt** is the smallest corpus by exact bytes and **AODS** has the highest objective loading precision

**Round-one verdict:** AODS now has a defensible benchmark position. It is not the lightest representation by exact corpus size, but it is the only round-one profile that combines strong objective loading with native authority and governance controls. That means its value proposition is real for agent-heavy, drift-sensitive programs, but its corpus cost still needs optimization before it can replace lower-friction defaults everywhere.

## Evaluation scope

This report combines two layers of measurement:

1. **Internal self-evaluation:** whether AODS itself satisfies its own claims on lifecycle coverage, fidelity, progressive loading, and drift control
2. **External round-one comparison:** whether AODS still looks meaningful when compared against strong alternative documentation archetypes built from the same source facts

## Benchmark design

| Benchmark property | Value |
| --- | --- |
| System | Atlas Release Ops |
| Modules | 7 |
| Human surfaces | 5 |
| Lifecycle items | 27 |
| Typed artifacts | 21 |
| Prose sections | 6 |
| Shared loading queries | 6 |
| Drift scenarios | 7 |

The benchmark is designed to answer four primary questions:

1. **Coverage:** can the format represent a realistic project lifecycle rather than only narrow technical specs
2. **Fidelity and compression:** do important facts survive the rewrite, and what happens to corpus size
3. **Progressive loading:** can the working set be narrowed without missing required authority under objective touch-route checks
4. **Drift resistance:** can the format and tooling detect divergence between authoritative and human-facing surfaces

## Why these comparators

The first comparison set was chosen to pressure AODS from three different directions rather than from only one neighbor:

| Comparator | Why it was selected | What it pressures |
| --- | --- | --- |
| Markdown + YAML | It is the practical incumbent for large project documentation and the closest real-world default alternative to adopting AODS. | Low-friction authoring, file-level metadata, and TechDocs-style docs-as-code ergonomics. |
| llms.txt + linked Markdown | It is the strongest lightweight AI-facing counter-position: minimal structure, minimal overhead, and direct model consumption. | How much AODS really buys beyond a thin AI entrypoint plus ordinary Markdown detail pages. |
| DITA topic corpus | It is the mature structured-documentation comparator with modular topics, maps, and strong information architecture lineage. | Whether AODS adds value beyond classic structured documentation systems rather than only beating loose Markdown. |

These were chosen before narrower competitors such as OpenAPI or TypeSpec because round one needed **full-lifecycle** comparators, not domain-specific sub-specs. Retrieval runtimes such as GraphRAG were also deferred because they change the execution model, not only the documentation format, and therefore need a different fairness contract.

## Fairness contract

All four baselines use the same canonical dataset and the same shared query set. The main scoreboard only includes cross-format metrics that can be evaluated fairly across all baselines:

- lifecycle coverage
- logical slice coverage
- fact preservation
- corpus byte count
- file count
- bytes per benchmark item
- objective touch-route hit rate
- objective touch-route precision
- objective touch-route byte savings

Advisory metrics are still recorded, but they are not used as the primary round-one judgment:

- estimated token count
- tokens per benchmark item
- exploratory semantic-load hit rate
- exploratory semantic-load precision
- exploratory semantic-load token savings

AODS-native governance signals remain separate because the other archetypes do not expose equivalent authority and paired-surface contracts in round one.

## AODS self-evaluation baseline

| Dimension | Result |
| --- | --- |
| Validation summary | 7 modules, 10 sections, 21 artifacts, 0 errors, 0 warnings |
| Coverage | 100.0% lifecycle phase coverage, 100.0% structured type coverage, 100.0% generic type coverage |
| Expression escape hatch | 4.8% raw fallback rate, 0 unsupported items |
| Fidelity | 100.0% fact preservation, 100.0% critical fact preservation |
| Corpus size (objective) | 36055 human-doc bytes vs 54644 AODS bytes, 51.6% larger than the human-doc baseline |
| Corpus size (advisory) | 9016 estimated human-doc tokens vs 13662 estimated AODS tokens, 51.5% larger than the human-doc baseline |
| Loading (objective) | 100.0% hit rate, 100.0% average precision, 100.0% average recall, 58.5% median byte savings |
| Loading (advisory) | 100.0% hit rate, 43.9% average precision, 100.0% average recall, 37.7% median token savings |
| Drift | 83.3% built-in recall, 66.7% semantic recall, 100.0% combined recall |
| Diversity audit | 1 dataset, domains release-ops, languages en, sync modes agent-primary |
| Overhead | 29 bookkeeping entries, 1.07 per artifact, 13 touch routes, 4 roles |

**Internal reading:** AODS already proves lifecycle completeness and information preservation on this corpus. The weak spot is not representational coverage; it is corpus weight, single-dataset diversity, and incomplete native drift enforcement for semantic conflicts.

## Benchmark objectivity and diversity audit

- **Primary scoreboard basis:** exact bytes + objective touch-route scenarios
- **Advisory-only signals:** estimated token counts + exploratory semantic-load scenarios
- **Dataset count:** 1
- **Domains:** release-ops
- **Languages:** en
- **Scenario split:** 3 objective loading scenarios, 3 exploratory loading scenarios
- **Sync modes present:** agent-primary
- **Sync modes absent:** human-primary, bidirectional
- **Pair scopes absent:** phase, feature

This makes the round-one judgment more objective than the earlier benchmark pass, but it also makes the remaining diversity gaps explicit: the current benchmark is still single-domain, single-language, and centered on agent-primary sync.

## Round-one external comparison

- **Smallest corpus:** llms.txt at **37156** bytes
- **Best objective loading reliability:** AODS with **100.0%** hit rate
- **Best objective loading precision:** AODS with **100.0%**
- **Strongest native governance:** AODS with **83.3%** native drift recall

### Objective common metric scoreboard

| Baseline | Corpus bytes | Files | Bytes / benchmark item | Fact preservation | Objective hit rate | Objective avg precision | Median byte savings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AODS | 54644 | 8 | 2023.85 | 100.0% | 100.0% | 100.0% | 58.5% |
| Markdown + YAML | 37758 | 5 | 1398.44 | 100.0% | 0.0% | 100.0% | 78.7% |
| llms.txt | 37156 | 6 | 1376.15 | 100.0% | 0.0% | 100.0% | 76.6% |
| DITA topic corpus | 51885 | 8 | 1921.67 | 100.0% | 0.0% | 0.0% | 98.6% |

### Advisory metric scoreboard

| Baseline | Estimated tokens | Tokens / benchmark item | Exploratory hit rate | Exploratory avg precision | Median token savings |
| --- | ---: | ---: | ---: | ---: | ---: |
| AODS | 13662 | 506.00 | 100.0% | 43.9% | 37.7% |
| Markdown + YAML | 9442 | 349.70 | 100.0% | 88.9% | 64.1% |
| llms.txt | 9291 | 344.11 | 100.0% | 88.9% | 61.6% |
| DITA topic corpus | 12973 | 480.48 | 100.0% | 100.0% | 63.1% |

### Native governance signals

These are **not** fair common metrics. They are shown separately because only AODS exposes them as first-class design goals in this round.

| Baseline | Native validation | Paired surfaces | Explicit authority model | Native drift recall |
| --- | --- | --- | --- | ---: |
| AODS | schema + route + hook | yes | yes | 83.3% |
| Markdown + YAML | convention-only | no | no | 0.0% |
| llms.txt | none | no | no | 0.0% |
| DITA topic corpus | xml-structure-only | no | no | 0.0% |

## Interpretation

### What AODS proves

- AODS remains the strongest option when the target problem includes **native authority modeling**, **paired human+agent surfaces**, and **drift-aware governance**.
- AODS is no longer being judged only against itself; it now has external archetype baselines on the same dataset and scenario set.
- AODS is now being judged on an objective scoreboard built from exact size metrics and touch-route behavior rather than on heuristic token-only summaries.

### What the competitors prove against AODS

- **Markdown + YAML** pressures AODS on simplicity and practical docs-as-code ergonomics.
- **llms.txt** pressures AODS on minimal AI-facing overhead.
- **DITA** pressures AODS on modular structured documentation lineage and reusable topic architecture.
- All three baselines show that AODS does **not** yet win on corpus size by exact bytes, which keeps the compression claim unproven at repository scale.

### Current judgment

For large projects today, the benchmark supports this practical reading:

1. use **AODS** when the problem is specifically about agent authority, scoped loading, paired-surface governance, or drift-sensitive handoff
2. use **Markdown + YAML** when team ergonomics and low-friction authoring matter more than native governance semantics
3. treat **llms.txt** as a lightweight AI publishing layer, not as a replacement for strong lifecycle documentation governance
4. treat **DITA** as the strongest evidence that structured modular documentation existed before AODS and therefore remains the right benchmark family for proving structural value

## Limitations and next steps

- These corpora are **benchmark archetypes**, not full upstream toolchain integrations.
- Advisory metrics still include deterministic chars-per-token estimates and semantic-load heuristics.
- The benchmark corpus is synthetic but lifecycle-complete, so this is a strong laboratory signal rather than a universal field sample.
- The benchmark still needs more diversity: more than one domain, more than one sync mode, and more than one language surface.
- Round two should add Backstage or TechDocs runtime execution, plus narrower spec-first comparators such as OpenAPI, AsyncAPI, or TypeSpec for partial-domain benchmarking.

If AODS keeps outperforming these archetypes on loading and governance while reducing corpus cost, then the case for wider adoption becomes materially stronger.
