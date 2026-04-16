# AODS round-one benchmark evaluation report

## Executive summary

- **Dataset:** AODS Benchmark Pack benchmark corpus with **11** modules, **8** human surfaces, **36** lifecycle items, **9** shared loading queries, and **9** drift scenarios
- **Internal AODS result:** full lifecycle coverage, full fact preservation, **0.3% smaller than the human-doc baseline** by exact bytes, **100.0%** objective touch-route hit rate, objective median rendered prompt envelope **12372 bytes**, and **100.0%** combined drift recall
- **External comparison headline:** AODS is the only baseline in round one with **100.0%** native drift recall, while **AODS** is the smallest corpus by exact bytes and **AODS** has the highest objective loading precision
- **External field sample:** 3 open-source corpora, 17 grep-first scenario seeds, formats rst=4, markdown=13

**Round-one verdict:** AODS now has a defensible benchmark position. It is not the lightest representation by exact corpus size, but it is the only round-one profile that combines strong objective loading with native authority and governance controls. That means its value proposition is real for agent-heavy, drift-sensitive programs, but its corpus cost still needs optimization before it can replace lower-friction defaults everywhere.

## Evaluation scope

This report combines two layers of measurement:

1. **Internal self-evaluation:** whether AODS itself satisfies its own claims on lifecycle coverage, fidelity, progressive loading, and drift control
2. **External round-one comparison:** whether AODS still looks meaningful when compared against strong alternative documentation archetypes built from the same source facts
3. **External field-sample supplement:** whether the benchmark is now grounded by real open-source grep-first documentation slices without breaking the round-one fairness contract

## Benchmark design

| Benchmark property | Value |
| --- | --- |
| System | AODS Benchmark Pack |
| Modules | 11 |
| Human surfaces | 8 |
| Lifecycle items | 36 |
| Typed artifacts | 26 |
| Prose sections | 10 |
| Shared loading queries | 9 |
| Drift scenarios | 9 |

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
- objective median loaded bytes
- objective median prompt-envelope bytes
- objective touch-route hit rate
- objective touch-route precision
- objective touch-route byte savings

Advisory metrics are still recorded, but they are not used as the primary round-one judgment:

- estimated token count
- tokens per benchmark item
- exploratory query-route hit rate
- exploratory query-route precision
- exploratory query-route token savings

AODS-native governance signals remain separate because the other archetypes do not expose equivalent authority and paired-surface contracts in round one.

## AODS self-evaluation baseline

| Dimension | Result |
| --- | --- |
| Validation summary | 11 modules, 10 sections, 26 artifacts, 0 errors, 0 warnings |
| Coverage | 100.0% lifecycle phase coverage, 100.0% structured type coverage, 100.0% generic type coverage |
| Expression escape hatch | 7.7% raw fallback rate, 0 unsupported items |
| Fidelity | 100.0% fact preservation, 100.0% critical fact preservation |
| Corpus size (objective) | 45372 human-doc bytes vs 45243 AODS bytes, 0.3% smaller than the human-doc baseline |
| Corpus size (advisory) | 11346 estimated human-doc tokens vs 11315 estimated AODS tokens, 0.3% smaller than the human-doc baseline |
| Task-time context footprint (payload) | 10839 median loaded bytes, 2713 median loaded estimated tokens, 15906 max loaded bytes |
| Task-time context footprint (rendered prompt) | 12372 median prompt-envelope bytes, 3093 median prompt-envelope estimated tokens, 1590 median overhead bytes |

| Loading (objective) | 100.0% hit rate, 100.0% average precision, 100.0% average recall, 76.0% median byte savings |
| Loading (advisory) | 100.0% hit rate, 100.0% average precision, 100.0% average recall, 74.2% median token savings |
| Drift | 100.0% built-in recall, 100.0% semantic-applicable recall, 100.0% structural-governance recall, 100.0% combined recall |
| Diversity audit | 2 synthetic dataset, domains release-ops, regulated-change-control, languages en, sync modes agent-primary, human-primary, external field sample 3 corpora / 17 seeds |
| Overhead | 45 bookkeeping entries, 1.25 per artifact, 21 touch routes, 5 roles |

**Internal reading:** AODS already proves lifecycle completeness and information preservation on this corpus. The weak spot is not representational coverage; it is corpus weight. Diversity is materially better than before because the benchmark now has an external field-sample supplement, but the fair common scoreboard is still narrower than a true field matrix. The benchmark now treats repository-scale corpus bytes, loaded payload bytes, rendered prompt-envelope bytes, and one supplemental runtime request-body sample as separate measurements.

## Benchmark objectivity and diversity audit

- **Primary scoreboard basis:** exact bytes + objective touch-route scenarios
- **Context-footprint basis:** objective median rendered prompt-envelope bytes remain the shared scoreboard metric, while the new AODS-only local runtime sample shows what one real Copilot CLI provider request body looks like on top of that routed prompt
- **Advisory-only signals:** estimated token counts + exploratory query-route scenarios
- **Dataset count:** 2
- **Domains:** release-ops, regulated-change-control
- **Languages:** en
- **Scenario split:** 5 objective loading scenarios, 4 exploratory loading scenarios
- **Sync modes present:** agent-primary, human-primary
- **Sync modes absent:** bidirectional
- **Pair scopes absent:** phase, feature
- **External field sample:** 3 corpora, 17 scenario seeds, phases build, design, governance, operate, planning, release, vision, benchmark dimensions coverage, drift, routing

This makes the round-one judgment more objective than the earlier benchmark pass, and it also makes the remaining diversity gaps explicit: the common scoreboard is multi-domain and includes both agent-primary and human-primary sync, while the new open-source field sample adds real corpora pressure. Even so, language coverage is still English-only and the field sample is not yet a full fair cross-toolchain matrix.

## External field-sample supplement

- **Open-source corpora:** 3
- **Scenario seeds:** 17
- **Formats:** rst=4, markdown=13
- **Benchmark roles:** architect, developer, maintainer, operator, product-manager, project-manager, release-manager, security-lead, sre
- **Why this stays separate from the main scoreboard:** these corpora are not generated from the shared canonical source facts, so they strengthen diversity and routing realism but do not satisfy the round-one fairness contract for direct cross-format scoring.

## Round-one external comparison

- **Smallest corpus:** AODS at **45243** bytes
- **Best objective loading reliability:** AODS with **100.0%** hit rate
- **Best objective loading precision:** AODS with **100.0%**
- **Strongest native governance:** AODS with **100.0%** native drift recall

### Objective common metric scoreboard

| Baseline | Corpus bytes | Files | Bytes / benchmark item | Fact preservation | Median loaded bytes | Median prompt-envelope bytes | Objective hit rate | Objective avg precision | Median byte savings |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AODS | 45243 | 13 | 1256.75 | 100.0% | 10839 | 12372 | 100.0% | 100.0% | 76.0% |
| Markdown + YAML | 47894 | 8 | 1330.39 | 100.0% | 5234 | 5844 | 0.0% | 100.0% | 89.1% |
| llms.txt | 46977 | 9 | 1304.92 | 100.0% | 6480 | 7178 | 0.0% | 100.0% | 86.2% |
| DITA topic corpus | 65595 | 12 | 1822.08 | 100.0% | 718 | 1320 | 0.0% | 0.0% | 98.9% |

### Advisory metric scoreboard

| Baseline | Estimated tokens | Tokens / benchmark item | Exploratory hit rate | Exploratory avg precision | Median token savings |
| --- | ---: | ---: | ---: | ---: | ---: |
| AODS | 11315 | 314.31 | 100.0% | 100.0% | 74.2% |
| Markdown + YAML | 11977 | 332.69 | 100.0% | 91.7% | 77.2% |
| llms.txt | 11747 | 326.31 | 100.0% | 91.7% | 74.4% |
| DITA topic corpus | 16403 | 455.64 | 100.0% | 100.0% | 76.4% |

### Native governance signals

These are **not** fair common metrics. They are shown separately because only AODS exposes them as first-class design goals in this round.

| Baseline | Native validation | Paired surfaces | Explicit authority model | Native drift recall |
| --- | --- | --- | --- | ---: |
| AODS | schema + route + hook | yes | yes | 100.0% |
| Markdown + YAML | convention-only | no | no | 0.0% |
| llms.txt | none | no | no | 0.0% |
| DITA topic corpus | xml-structure-only | no | no | 0.0% |

## Interpretation

### What AODS proves

- AODS remains the strongest option when the target problem includes **native authority modeling**, **paired human+agent surfaces**, and **drift-aware governance**.
- AODS is no longer being judged only against itself; it now has external archetype baselines on the same dataset and scenario set.
- AODS is now being judged on an objective scoreboard built from exact size metrics, loaded payload size, rendered prompt-envelope size, and touch-route behavior rather than on heuristic token-only summaries.

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
- Advisory metrics still include deterministic chars-per-token estimates and exploratory query-route proxies.
- The common scoreboard still uses renderer-based prompt-envelope bytes; the new runtime capture is currently an AODS-only supplemental sample, not a fair cross-baseline runtime matrix.
- The benchmark corpus is synthetic but lifecycle-complete, so this is a strong laboratory signal rather than a universal field sample.
- The benchmark still needs more diversity: more languages, more real-world corpora, and more runtime-backed toolchain samples.
- The benchmark still needs more diversity: more languages, more real-world corpora beyond the current three-project supplement, and more runtime-backed toolchain samples.
- Round two should add Backstage or TechDocs runtime execution, plus narrower spec-first comparators such as OpenAPI, AsyncAPI, or TypeSpec for partial-domain benchmarking.

If AODS keeps outperforming these archetypes on loading and governance while reducing corpus cost, then the case for wider adoption becomes materially stronger.
