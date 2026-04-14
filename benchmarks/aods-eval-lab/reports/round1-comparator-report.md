# AODS round-one benchmark evaluation report

## Executive summary

- **Dataset:** Atlas Release Ops benchmark corpus with **7** modules, **5** human surfaces, **27** lifecycle items, **6** shared loading queries, and **7** drift scenarios
- **Internal AODS result:** full lifecycle coverage, full fact preservation, **51.5% larger than the human-doc baseline**, **100.0%** loading hit rate, and **83.3%** combined drift recall
- **External comparison headline:** AODS is the only baseline in round one with **50.0%** native drift recall and **100.0%** loading hit rate, while llms.txt is the smallest corpus and Markdown + YAML has the highest loading precision

**Round-one verdict:** AODS now has a defensible benchmark position. It is not the lightest representation, but it is the only round-one profile that combines full scenario hit rate with native authority and governance controls. That means its value proposition is real for agent-heavy, drift-sensitive programs, but its corpus cost still needs optimization before it can replace lower-friction defaults everywhere.

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
3. **Progressive loading:** can the working set be narrowed without missing required authority
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
- corpus token count
- tokens per benchmark item
- loading hit rate
- loading precision
- loading token savings

AODS-native governance signals remain separate because the other archetypes do not expose equivalent authority and paired-surface contracts in round one.

## AODS self-evaluation baseline

| Dimension | Result |
| --- | --- |
| Validation summary | 7 modules, 10 sections, 21 artifacts, 0 errors, 0 warnings |
| Coverage | 100.0% lifecycle phase coverage, 100.0% structured type coverage, 100.0% generic type coverage |
| Expression escape hatch | 4.8% raw fallback rate, 0 unsupported items |
| Fidelity | 100.0% fact preservation, 100.0% critical fact preservation |
| Corpus size | 9016 estimated human-doc tokens vs 13662 estimated AODS tokens, 51.5% larger than the human-doc baseline |
| Loading | 100.0% hit rate, 71.9% average precision, 100.0% average recall, 52.6% median token savings |
| Drift | 50.0% built-in recall, 66.7% semantic recall, 83.3% combined recall |
| Overhead | 29 bookkeeping entries, 1.07 per artifact, 13 touch routes, 4 roles |

**Internal reading:** AODS already proves lifecycle completeness and information preservation on this corpus. The weak spot is not representational coverage; it is corpus weight and incomplete native drift enforcement.

## Round-one external comparison

- **Smallest corpus:** llms.txt at **9291** estimated tokens
- **Best loading reliability:** AODS with **100.0%** hit rate
- **Best average loading precision:** Markdown + YAML with **94.4%**
- **Strongest native governance:** AODS with **50.0%** native drift recall

### Common metric scoreboard

| Baseline | Corpus tokens | Tokens / benchmark item | Fact preservation | Loading hit rate | Avg loading precision | Median load savings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| AODS | 13662 | 506.00 | 100.0% | 100.0% | 71.9% | 52.6% |
| Markdown + YAML | 9442 | 349.70 | 100.0% | 50.0% | 94.4% | 71.4% |
| llms.txt | 9291 | 344.11 | 100.0% | 50.0% | 94.4% | 69.1% |
| DITA topic corpus | 12973 | 480.48 | 100.0% | 50.0% | 50.0% | 96.1% |

### Native governance signals

These are **not** fair common metrics. They are shown separately because only AODS exposes them as first-class design goals in this round.

| Baseline | Native validation | Paired surfaces | Explicit authority model | Native drift recall |
| --- | --- | --- | --- | ---: |
| AODS | schema + route + hook | yes | yes | 50.0% |
| Markdown + YAML | convention-only | no | no | 0.0% |
| llms.txt | none | no | no | 0.0% |
| DITA topic corpus | xml-structure-only | no | no | 0.0% |

## Interpretation

### What AODS proves

- AODS remains the strongest option when the target problem includes **native authority modeling**, **paired human+agent surfaces**, and **drift-aware governance**.
- AODS is no longer being judged only against itself; it now has external archetype baselines on the same dataset and scenario set.
- AODS demonstrates that progressive loading can hit all shared scenarios on this benchmark, even though it still overfetches more than the lighter baselines.

### What the competitors prove against AODS

- **Markdown + YAML** pressures AODS on simplicity and practical docs-as-code ergonomics.
- **llms.txt** pressures AODS on minimal AI-facing overhead.
- **DITA** pressures AODS on modular structured documentation lineage and reusable topic architecture.
- All three baselines show that AODS does **not** yet win on corpus size, which keeps the compression claim unproven at repository scale.

### Current judgment

For large projects today, the benchmark supports this practical reading:

1. use **AODS** when the problem is specifically about agent authority, scoped loading, paired-surface governance, or drift-sensitive handoff
2. use **Markdown + YAML** when team ergonomics and low-friction authoring matter more than native governance semantics
3. treat **llms.txt** as a lightweight AI publishing layer, not as a replacement for strong lifecycle documentation governance
4. treat **DITA** as the strongest evidence that structured modular documentation existed before AODS and therefore remains the right benchmark family for proving structural value

## Limitations and next steps

- These corpora are **benchmark archetypes**, not full upstream toolchain integrations.
- Token counts use the same deterministic chars-per-token approximation as the AODS self-evaluation report.
- The benchmark corpus is synthetic but lifecycle-complete, so this is a strong laboratory signal rather than a universal field sample.
- Round two should add Backstage or TechDocs runtime execution, plus narrower spec-first comparators such as OpenAPI, AsyncAPI, or TypeSpec for partial-domain benchmarking.

If AODS keeps outperforming these archetypes on loading and governance while reducing corpus cost, then the case for wider adoption becomes materially stronger.
