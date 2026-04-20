# AODS evaluation report

## Executive summary

This repository uses `benchmarks/aods-eval-lab` as its primary regression harness. The harness regenerates a multi-domain benchmark pack and evaluates AODS for coverage, fidelity, compression, progressive loading, real-corpus routing, drift prevention, release-surface trust, and authoring overhead.

- **Coverage:** lifecycle phase coverage 100.0%, structured type coverage 100.0%, generic type coverage 100.0%.
- **Fidelity:** critical fact preservation 100.0% with overall fact preservation 100.0%.
- **Exact corpus size:** human docs 45372 bytes across 8 files; AODS corpus 45243 bytes across 13 files.
- **Task-time context footprint:** objective touch-route median rendered prompt envelope 12372 bytes and 3093 estimated tokens.
- **Objective loading gate:** touch-route hit rate 100.0%, average recall 100.0%, median byte savings 76.0%.
- **Real-corpus routing:** baseline top-1 hit rate 40.0%, top-3 hit rate 75.0%, MRR 59.9%, seed-title rerank top-1 70.0%, structure-aware rerank top-1 80.0%, path-family rerank top-1 85.0%, API-surface rerank top-1 100.0%, section-context median 450 bytes, section-evidence pack full-file retention 100.0% with median pack 1120 bytes, rank-order top-3 scenario-evidence bundle exact full coverage 65.0% with median bundle 12796 bytes, cost-aware top-3 scenario-evidence bundle exact full coverage 65.0% with median bundle 12113 bytes, reachability-audited reachable full coverage 100.0% with 35.0% scenarios containing unreachable exact phrases, claim-support full coverage 85.0% with 20.0% exact-gap recovery, claim-support pack preservation 100.0% with median pack 1605 bytes, answer-check full coverage 100.0% with 15.0% claim-gap recovery, target-local answer-check full coverage 55.0% with 45.0% cross-file recovery, authority-scoped answer-check full coverage 65.0% across 20 scoped scenarios with 35.0% out-of-scope recovery, authority-reachability mean coverage 90.0% with 7.5% gain vs the scoped pack and 35.0% scenarios still missing authority-local answer support, an authority-aware answer pack preserves 100.0% of reachable in-scope support with 7.5% gain vs the scoped pack at median 1120 bytes, a local-family audit reaches 100.0% full coverage across 18 strict exact-file scopes, and a local-family answer pack preserves 100.0% of family-supported answer checks at median 969 bytes.
- **Drift prevention:** built-in recall 100.0%, combined recall 100.0%, built-in false-positive rate 0.0%, route-behavior drift recall 100.0% with built-in route-behavior recall 100.0%.
- **Release-surface trust:** generated-surface recall 100.0%, reality recall 100.0%, combined false-positive rate 0.0%.
- **Runtime-backed local matrix:** 9 scenarios, objective median exact provider request body 25975 bytes vs rendered benchmark prompt 12372 bytes (2.10x), exploratory median exact provider request body 26675 bytes, across 2 local CLI runtime profiles; the primary AODS combined full-run median over 9 scenarios is 1 provider request(s) totaling 25975 bytes, with objective median 1 request(s) / 25975 bytes and exploratory median 1 request(s) / 26675 bytes; representative detail stays at 1 request(s) / 25975 bytes; the local Claude Code profile shows 14879 objective-median request bytes on the same AODS scenario set and combined full-run median 4 request(s) / 96260 bytes, objective median 4 request(s) / 96260 bytes, exploratory median 4 request(s) / 99060 bytes, representative detail 4 request(s) / 96260 bytes, plus claude-code-hosted-anthropic-relay at 14879 bytes in hosted relay-backed mode with combined full-run median 4 request(s) / 128582 bytes, objective median 5 request(s) / 157342 bytes, exploratory median 2 request(s) / 49544 bytes, representative detail 4 request(s) / 129595 bytes; hosted-vs-local combined median delta is 32322 bytes, of which 48211 bytes sit in tool-loop traffic; across 3 successful hosted captures, the hosted/local total-delta band spans 15865 bytes and the tool-loop delta band spans 14459 bytes; the hosted split should be read as directional field evidence rather than as a canonical fixed loop shape because successful hosted runs still vary in how they decompose follow-up vs tool-loop traffic.
- **Real-corpus routing:** top-1 hit rate 40.0%, top-3 hit rate 75.0%, MRR 59.9%, seed-title rerank top-1 70.0%, structure-aware rerank top-1 80.0%, path-family rerank top-1 85.0%, API-surface rerank top-1 100.0%; section-context hit 100.0% with median selected section 450 bytes, and section-evidence pack retains full top-file grep evidence on 100.0% of scenarios with median pack 1120 bytes; cost-aware top-3 scenario-evidence bundle reaches full exact scenario-term coverage on 65.0% of scenarios with median bundle 12113 bytes, while the reachability audit shows 100.0% full reachable-term coverage and 35.0% of scenarios still contain unreachable exact grep phrases; the claim-support lane then recovers full normalized claim support on 85.0% of scenarios, the answer-check lane reaches 100.0% full concrete-answer coverage with 15.0% claim-gap recovery, the answer-locality audit keeps 55.0% full target-local concrete-answer coverage with 45.0% cross-file recovery, the authority-scoped answer lane keeps 65.0% full scoped concrete-answer coverage across 20 explicitly scoped scenarios with 35.0% out-of-scope recovery, while authority-reachability lifts mean in-scope coverage to 90.0% with 7.5% mean gain vs the scoped pack, 65.0% full in-scope reachable coverage, and 35.0% scenarios still missing authority-local answer support; an authority-aware answer pack then preserves 100.0% of authority-reachable answer support with 7.5% mean gain vs the scoped pack at median 1120 bytes and 70.8% median reduction vs the full authority scope; widening strict exact-file scopes to the target directory family then reaches 100.0% full coverage across 18 strict-file scenarios with 19.4% mean gain vs the exact scope; a local-family answer pack then preserves 100.0% of family-supported answer checks with 19.4% mean gain vs the exact scope at median 969 bytes and 99.0% median reduction vs the full family scope; the claim-support pack preserves bundled claim support on 100.0% of scenarios with median pack 1605 bytes across 3 sections.
- **External sample supplement:** 3 open-source corpora and 20 grep-first scenario seeds now supplement the synthetic benchmark pack.
- **Judgment:** AODS passes this benchmark on the four core questions separately: full-lifecycle/file-surface coverage is complete, benchmark facts survive the rewrite, task-time progressive loading materially reduces working-set context, and declared anti-drift/trust controls catch the current benchmark hazards. The main tradeoff is that value comes from governed routing and validation rather than from shrinking the entire repository corpus.
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

### 4. Runtime-backed provider matrix (supplemental)

- Runtime profile: **copilot-cli-local-openai** using **copilot-cli** in offline local-provider mode
- Total runtime profiles captured: **3**
- Local CLI runtime profiles captured: **2**
- Hosted relay-backed runtime profiles captured: **1**
- Shared round-one runtime captures: **4** baselines
- AODS captured scenarios: **9**
- Objective touch-route median exact provider request body: **25975 bytes**, **6492 estimated tokens**
- Objective touch-route median rendered benchmark prompt: **12372 bytes**
- Objective touch-route median runtime-added overhead: **13690 bytes**
- Exploratory query-route median exact provider request body: **26675 bytes**
- Combined median request/prompt ratio: **2.10x**
- Primary profile AODS combined full-run median: **1** provider request(s), **25975 bytes** total request body, **9** scenarios covered
- Primary profile AODS objective full-run median: **1** provider request(s), **25975 bytes** total request body, classed as **1** first request, **0** follow-up prompt request(s), **0** tool-loop request(s), and **0** auxiliary side request(s), with **0 bytes** in tool-loop traffic
- Primary profile AODS exploratory full-run median: **1** provider request(s), **26675 bytes** total request body, classed as **1** first request, **0** follow-up prompt request(s), **0** tool-loop request(s), and **0** auxiliary side request(s), with **0 bytes** in tool-loop traffic
- Primary profile representative full run: **1** provider request(s), **25975 bytes** total request body, split into **1** first request, **0** follow-up prompt request(s), **0** tool-loop request(s), and **0** auxiliary side request(s); tool-loop traffic contributes **0 bytes**
- Secondary local runtime: **claude-code-local-anthropic** with AODS objective median exact provider request body **14879 bytes** and ratio **1.20x**
- Secondary local combined full-run median: **4** provider request(s), **96260 bytes** total request body, **9** scenarios covered
- Secondary local objective full-run median: **4** provider request(s), **96260 bytes** total request body, classed as **1** first request, **1** follow-up prompt request(s), **2** tool-loop request(s), and **0** auxiliary side request(s), with **66516 bytes** in tool-loop traffic
- Secondary local exploratory full-run median: **4** provider request(s), **99060 bytes** total request body, classed as **1** first request, **1** follow-up prompt request(s), **2** tool-loop request(s), and **0** auxiliary side request(s), with **67916 bytes** in tool-loop traffic
- Secondary local representative full run: **4** provider request(s), **96260 bytes** total request body, split into **1** first request, **1** follow-up prompt request(s), **2** tool-loop request(s), and **0** auxiliary side request(s); tool-loop traffic contributes **66516 bytes**
- Hosted field runtime: **claude-code-hosted-anthropic-relay** with AODS objective median exact provider request body **14879 bytes** and ratio **1.20x**
- Hosted combined full-run median: **4** provider request(s), **128582 bytes** total request body, **9** scenarios covered
- Hosted objective full-run median: **5** provider request(s), **157342 bytes** total request body, classed as **1** first request, **0** follow-up prompt request(s), **4** tool-loop request(s), and **0** auxiliary side request(s), with **144893 bytes** in tool-loop traffic
- Hosted exploratory full-run median: **2** provider request(s), **49544 bytes** total request body, classed as **1** first request, **0** follow-up prompt request(s), **1** tool-loop request(s), and **0** auxiliary side request(s), with **33965 bytes** in tool-loop traffic
- Hosted representative full run: **4** provider request(s), **129595 bytes** total request body, split into **1** first request, **0** follow-up prompt request(s), **3** tool-loop request(s), and **0** auxiliary side request(s); tool-loop traffic contributes **114716 bytes**
- Hosted-vs-local combined median delta: **32322 bytes**, split into **0** first-request bytes, **-14865** follow-up prompt bytes, **48211** tool-loop bytes, and **0** auxiliary bytes
- Hosted-vs-local combined median request delta: **0** request(s), split into **-1** extra follow-up prompt request(s) and **1** extra tool-loop request(s)
- Hosted-vs-local delta shares: **149.2%** tool-loop, **-46.0%** follow-up prompt, **0.0%** first-request
- Heaviest hosted-vs-local tool-loop delta scenario: **ops-doc-edit** with **142133** extra tool-loop bytes and **125614** total extra bytes
- Hosted repeatability successful runs: **3**
- Hosted repeatability total-delta band: **16457 - 32322 bytes** (span **15865**)
- Hosted repeatability first-request delta band: **0 - 0 bytes** (span **0**)
- Hosted repeatability tool-loop delta band: **33752 - 48211 bytes** (span **14459**)
- Largest captured request: **architecture-module-edit** at **31660 bytes**
- Smallest captured request: **orientation-summary** at **21310 bytes**
- Interpretation: **the benchmark prompt-envelope proxy is directionally useful, but first-request cost, combined full-run median cost, subgroup medians, and representative request-loop detail are different measurements. Copilot stays close to a single provider request across the current AODS scenario set, while Claude Code expands the same routed prompts into a clearer loop of first request, follow-up prompt retries, and tool-loop traffic across both objective and exploratory lanes; the hosted lane is especially heavier because the hosted/local median delta is now explicitly attributable mostly to repeated tool-loop requests rather than the first request envelope. The current hosted repeatability audit keeps the first-request delta comparatively stable while showing that the follow-up-vs-tool-loop split still moves across successful runs, so this hosted attribution should be read as directional field evidence rather than as a canonical fixed hosted loop.**


### 5. Exploratory query routing

- Exploratory scenarios: **4**
- Hit rate across exploratory query-route scenarios: **100.0%**
- Average precision: **100.0%**
- Average recall: **100.0%**
- Median loaded working set: **11672.5 bytes**, **2920 estimated tokens**
- Median rendered prompt envelope: **12803.5 bytes**, **3201.5 estimated tokens**
- Median byte savings vs full load: **74.2%**
- Interpretation: **these scenarios now call the real CLI query router, but they remain advisory because the prompts are still synthetic benchmark queries rather than field-captured production tasks. Their rendered prompt-envelope numbers are therefore informative, not release-gating.**

### 6. Open-source routing benchmark

- Corpora: **3**
- Scenario seeds: **20**
- Top-1 hit rate: **40.0%**
- Top-3 hit rate: **75.0%**
- Mean reciprocal rank: **59.9%**
- Zero-hit rate: **0.0%**
- Median candidate file count: **31.5**
- Mean target term coverage: **77.5%**
- Median top-ranked candidate size: **14015 bytes**, **3415.5 estimated tokens**
- Seed-title rerank top-1 hit rate: **70.0%**
- Seed-title rerank top-3 hit rate: **95.0%**
- Seed-title rerank MRR: **83.8%**
- Rerank improvement: **30.0%** top-1 delta, **20.0%** top-3 delta, **23.9%** MRR delta, **9** promotions to top 1, **0** worsened top-3 cases
- Structure-aware rerank top-1 hit rate: **80.0%**
- Structure-aware rerank top-3 hit rate: **95.0%**
- Structure-aware rerank MRR: **88.8%**
- Structure-aware improvement vs baseline: **40.0%** top-1 delta, **20.0%** top-3 delta, **28.9%** MRR delta, **11** promotions to top 1, **0** worsened top-3 cases
- Structure-aware delta vs seed-title rerank: **10.0%** top-1 delta, **0.0%** top-3 delta, **5.0%** MRR delta
- Path-family rerank top-1 hit rate: **85.0%**
- Path-family rerank top-3 hit rate: **100.0%**
- Path-family rerank MRR: **92.5%**
- Path-family improvement vs baseline: **45.0%** top-1 delta, **25.0%** top-3 delta, **32.6%** MRR delta, **12** promotions to top 1, **0** worsened top-3 cases
- Path-family delta vs structure-aware rerank: **5.0%** top-1 delta, **5.0%** top-3 delta, **3.8%** MRR delta
- API-surface rerank top-1 hit rate: **100.0%**
- API-surface rerank top-3 hit rate: **100.0%**
- API-surface rerank MRR: **100.0%**
- API-surface improvement vs baseline: **60.0%** top-1 delta, **25.0%** top-3 delta, **40.1%** MRR delta, **12** promotions to top 1, **0** worsened top-3 cases
- API-surface delta vs path-family rerank: **15.0%** top-1 delta, **0.0%** top-3 delta, **7.5%** MRR delta
- Section-context hit rate: **100.0%**
- Section-context hit rate when API-surface top file is correct: **100.0%**
- Median selected section size: **450 bytes**, **113 estimated tokens**
- Median context reduction vs reranked top file: **93.2%**
- Section-evidence pack full file-evidence retention rate: **100.0%**
- Section-evidence pack mean selected term coverage: **77.5%**
- Section-evidence pack mean term recall vs reranked top file: **100.0%**
- Median evidence pack size: **1120 bytes**, **281 estimated tokens**, across **2 sections**
- Median evidence-pack reduction vs reranked top file: **66.1%**
- Scenario-evidence bundle full scenario-term coverage rate: **65.0%**
- Scenario-evidence bundle mean top-file term coverage: **77.5%**
- Scenario-evidence bundle mean bundle term coverage: **91.3%**
- Scenario-evidence bundle mean gain vs top file: **13.8%**
- Median scenario-evidence bundle size: **12796 bytes**, **3199 estimated tokens**, across **1 files**
- Median scenario-evidence bundle growth vs top file: **0.0%**
- Cost-aware scenario-evidence full scenario-term coverage rate: **65.0%**
- Cost-aware scenario-evidence mean bundle term coverage: **91.3%**
- Cost-aware scenario-evidence mean gain vs top file: **13.8%**
- Median cost-aware scenario-evidence bundle size: **12113 bytes**, **3029 estimated tokens**, across **1 files**
- Median cost-aware scenario-evidence bundle growth vs top file: **0.0%**
- Cost-aware scenario-evidence delta vs rank-order bundle: **0.0%** full-coverage delta, **0.0%** mean coverage delta, **-683.5 bytes** median-byte delta, **6** reduced-byte scenarios, **0** worsened-coverage scenarios
- Reachability audit full reachable-term coverage rate: **100.0%**
- Reachability audit scenarios with unreachable exact terms: **35.0%**
- Reachability audit mean unreachable-term share: **8.8%**
- Reachability audit exact-gap-explained-by-unreachable-terms rate: **35.0%**
- Claim-support full coverage rate: **85.0%**
- Claim-support mean coverage: **96.3%**
- Claim-support mean gain vs exact bundle coverage: **5.0%**
- Claim-support exact-gap recovered rate: **20.0%**
- Claim-support pack full bundle-preservation rate: **100.0%**
- Claim-support pack full coverage rate: **85.0%**
- Claim-support pack mean recall vs bundle claim support: **100.0%**
- Median claim-support pack size: **1605 bytes**, **402 estimated tokens**, across **3 sections**, **1 files**
- Median claim-support pack reduction vs cost-aware bundle: **76.6%**
- Answer-check full coverage rate: **100.0%**
- Answer-check mean coverage: **100.0%**
- Answer-check mean gain vs claim-support coverage: **3.8%**
- Answer-check claim-gap recovered rate: **15.0%**
- Answer-check exact-gap recovered rate: **35.0%**
- Target-local answer-check full coverage rate: **55.0%**
- Target-local answer-check mean coverage: **78.8%**
- Cross-file answer-check mean gain vs target-local: **21.3%**
- Cross-file answer-check recovery rate: **45.0%**
- Scenarios requiring cross-file answer evidence: **45.0%**
- Authority-scoped answer-check full coverage rate: **65.0%** across **20** explicitly scoped scenarios
- Authority-scoped answer-check mean coverage: **82.5%**
- Explicit answer-authority scenario rate: **100.0%**
- Out-of-scope answer-check mean gain vs authority scope: **17.5%**
- Out-of-scope answer recovery rate: **35.0%**
- Scenarios requiring out-of-scope answer evidence: **35.0%**
- Authority-reachable answer-check full coverage rate: **65.0%**
- Authority-reachable answer-check mean coverage: **90.0%**
- Authority-reachable mean gain vs scoped pack: **7.5%**
- Authority-gap explained by reachability rate: **0.0%**
- Scenarios still missing authority-local answer support: **35.0%**
- Authority-aware answer-pack full coverage rate: **65.0%**
- Authority-aware answer-pack mean coverage: **90.0%**
- Authority-aware answer-pack mean gain vs scoped pack: **7.5%**
- Authority-aware reachable-support preservation rate: **100.0%**
- Authority-aware mean recall vs reachable support: **100.0%**
- Authority-aware median pack bytes: **1120**
- Authority-aware median reduction vs full authority scope: **70.8%**
- Strict exact-file authority local-family full coverage rate: **100.0%** across **18** strict-file scenarios
- Local-family mean gain vs exact-file authority scope: **19.4%**
- Exact-file authority gaps explained by local family rate: **38.9%**
- Scenarios still missing local-family answer support: **0.0%**
- Local-family answer-pack full coverage rate: **100.0%**
- Local-family answer-pack mean coverage: **100.0%**
- Local-family answer-pack mean gain vs exact-file authority scope: **19.4%**
- Local-family support-preservation rate: **100.0%**
- Local-family median pack bytes: **969**
- Local-family median reduction vs full family scope: **99.0%**
- Interpretation: **this is now a multi-lane deterministic benchmark over real open-source corpora. The file baseline shows how far pure lexical routing gets, the seed-title rerank lane shows what title-only heuristics recover, the structure-aware rerank lane adds file-path and basename structure signals, the path-family rerank lane prioritizes strong title-in-path matches to suppress command-reference noise, and the new API-vs-reference sibling seeds show where those same path-first heuristics can still over-promote broader conceptual pages over the intended module-level API surface. The API-surface rerank lane then adds module/directive signals to recover those collisions without losing the earlier path-family wins. The section-context lane answers whether the intended heading survives compression, the section-evidence-pack lane answers whether a small multi-section bundle can preserve the reranked top file's available lexical evidence, the rank-order scenario-evidence-bundle lane answers whether the current routed top-3 shortlist is enough to cover broader answer-support evidence across files, the cost-aware scenario-evidence-bundle lane shows how much of that answer-support can be kept while cutting bundle cost, the reachability audit separates retrieval misses from benchmark phrases that never appear anywhere in the source corpus, the claim-support lane shows how much of the remaining exact-gap pressure disappears once the benchmark allows deterministic per-scenario alias groups for clearly equivalent wording, the claim-support-pack lane then tests whether that normalized answer support can be preserved while shrinking the multi-file bundle down to a smaller cross-file section pack, the answer-check lane tests whether that compressed pack can still support a concrete scenario answer even when the benchmark seed wording itself has drifted away from the source docs, the answer-locality audit shows how often that concrete answer remains target-local versus relying on cross-file borrowed evidence, the authority-scoped lane distinguishes acceptable in-scope cross-file support from out-of-scope answer recovery, the authority-reachability lane separates true authority gaps from pack-selection misses inside the declared scope, the authority-aware pack lane shows that the benchmark can recover all currently reachable in-scope answer support while still heavily compressing the declared authority scope, the local-family lane shows that the remaining strict exact-file authority misses are still documented nearby in sibling docs under the same target family rather than being missing from the broader documentation slice, and the new local-family pack lane shows that this sibling-local answer support can also be preserved in a much smaller family-scoped section pack.**

| Scenario | Corpus | Baseline rank | Seed-title rank | Structure-aware rank | Path-family rank | API-surface rank | Section hit | Evidence pack | Scenario bundle | Cost-aware bundle | Reachability audit | Claim support | Claim-support pack | Answer check | Answer locality | Answer authority | Authority reachability | Authority pack | Local family | Local family pack | Top candidates |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apache-airflow-production-deployment | Apache Airflow | 2 | 1 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 4 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | airflow-core/docs/security/security_model.rst (4 terms/104 hits)<br>airflow-core/docs/administration-and-deployment/production-deployment.rst (4 terms/39 hits)<br>RELEASE_NOTES.rst (3 terms/190 hits) |
| apache-airflow-security-model | Apache Airflow | 2 | 1 | 1 | 1 | 1 | hit | 100.0% / 1 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | RELEASE_NOTES.rst (4 terms/148 hits)<br>airflow-core/docs/security/security_model.rst (4 terms/129 hits)<br>airflow-core/docs/core-concepts/auth-manager/index.rst (3 terms/37 hits) |
| apache-airflow-release-process | Apache Airflow | 1 | 1 | 1 | 1 | 1 | hit | 100.0% / 1 sec | 75.0% / 1 files | 75.0% / 1 files | 100.0% / 1 unreachable | 75.0% | 75.0% / 1 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | airflow-core/docs/release-process.rst (3 terms/8 hits)<br>airflow-core/docs/security/vulnerabilities-in-3rd-party-dependencies.rst (3 terms/7 hits)<br>airflow-core/docs/core-concepts/dags.rst (1 terms/75 hits) |
| apache-airflow-project-governance | Apache Airflow | 1 | 1 | 1 | 1 | 1 | hit | 100.0% / 1 sec | 100.0% / 2 files | 100.0% / 2 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 75.0% +cross-file | 75.0% +out-of-scope | 75.0% +missing-support | 75.0% / 100.0% reachable | 100.0% +family-scope | 100.0% / 100.0% support +recovered | GOVERNANCE.md (3 terms/7 hits)<br>RELEASE_NOTES.rst (2 terms/4 hits)<br>airflow-core/docs/howto/set-up-database.rst (2 terms/2 hits) |
| apache-airflow-observability-metrics | Apache Airflow | 3 | 1 | 1 | 1 | 1 | hit | 100.0% / 1 sec | 100.0% / 2 files | 100.0% / 2 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 3 | 100.0% | 50.0% +cross-file | 100.0% | 100.0% | 100.0% / 100.0% reachable | n/a | n/a | RELEASE_NOTES.rst (4 terms/70 hits)<br>airflow-core/docs/administration-and-deployment/logging-monitoring/logging-architecture.rst (3 terms/9 hits)<br>airflow-core/docs/administration-and-deployment/logging-monitoring/metrics.rst (2 terms/31 hits) |
| argo-cd-operator-architecture | Argo CD | 50 | 4 | 4 | 1 | 1 | hit | 100.0% / 3 sec | 100.0% / 2 files | 100.0% / 2 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 4 | 100.0% | 50.0% +cross-file | 50.0% +out-of-scope | 75.0% +missing-support | 75.0% / 100.0% reachable +recovered | 100.0% +family-scope | 100.0% / 100.0% support +recovered | docs/developer-guide/architecture/components.md (4 terms/10 hits)<br>docs/operator-manual/metrics.md (3 terms/22 hits)<br>docs/proposals/backend-support-appset.md (3 terms/13 hits) |
| argo-cd-release-cadence | Argo CD | 4 | 1 | 1 | 1 | 1 | hit | 100.0% / 3 sec | 75.0% / 2 files | 75.0% / 2 files | 100.0% / 1 unreachable | 100.0% | 100.0% / 2 | 100.0% | 25.0% +cross-file | 25.0% +out-of-scope | 75.0% +missing-support | 75.0% / 100.0% reachable +recovered | 100.0% +family-scope | 100.0% / 100.0% support +recovered | SECURITY.md (3 terms/4 hits)<br>docs/user-guide/tracking_strategies.md (2 terms/16 hits)<br>docs/developer-guide/releasing.md (2 terms/14 hits) |
| argo-cd-releasing-runbook | Argo CD | 1 | 1 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 75.0% / 1 files | 75.0% / 1 files | 100.0% / 1 unreachable | 75.0% | 75.0% / 3 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/developer-guide/releasing.md (3 terms/14 hits)<br>docs/operator-manual/upgrading/2.6-2.7.md (2 terms/12 hits)<br>SECURITY.md (2 terms/10 hits) |
| argo-cd-roadmap | Argo CD | 31 | 1 | 1 | 1 | 1 | hit | 100.0% / 1 sec | 75.0% / 2 files | 75.0% / 2 files | 100.0% / 1 unreachable | 75.0% | 75.0% / 3 | 100.0% | 50.0% +cross-file | 50.0% +out-of-scope | 50.0% +missing-support | 50.0% / 100.0% reachable | 100.0% +family-scope | 100.0% / 100.0% support +recovered | docs/proposals/proxy-extensions.md (2 terms/8 hits)<br>docs/proposals/001-proposal-template.md (2 terms/7 hits)<br>docs/proposals/parameterized-config-management-plugins.md (2 terms/7 hits) |
| argo-cd-security-policy | Argo CD | 1 | 1 | 1 | 1 | 1 | hit | 100.0% / 4 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | SECURITY.md (4 terms/36 hits)<br>docs/operator-manual/security.md (2 terms/14 hits)<br>docs/operator-manual/upgrading/2.14-3.0.md (2 terms/10 hits) |
| argo-cd-design-proposal | Argo CD | 1 | 1 | 1 | 1 | 1 | hit | 100.0% / 3 sec | 100.0% / 2 files | 100.0% / 2 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 4 | 100.0% | 75.0% +cross-file | 100.0% | 100.0% | 100.0% / 100.0% reachable | n/a | n/a | docs/proposals/config-management-plugin-v2.md (3 terms/18 hits)<br>docs/proposals/parameterized-config-management-plugins.md (3 terms/11 hits)<br>docs/proposals/002-ui-extensions.md (3 terms/6 hits) |
| jupyterhub-technical-overview | JupyterHub | 2 | 1 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/source/reference/changelog.md (4 terms/7982 hits)<br>docs/source/reference/technical-overview.md (4 terms/74 hits)<br>docs/source/reference/services.md (3 terms/193 hits) |
| jupyterhub-monitoring | JupyterHub | 2 | 1 | 1 | 1 | 1 | hit | 100.0% / 1 sec | 100.0% / 2 files | 100.0% / 2 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 3 | 100.0% | 75.0% +cross-file | 75.0% +out-of-scope | 75.0% +missing-support | 75.0% / 100.0% reachable | 100.0% +family-scope | 100.0% / 100.0% support +recovered | docs/source/reference/changelog.md (4 terms/56 hits)<br>docs/source/reference/monitoring.md (3 terms/18 hits)<br>docs/source/explanation/capacity-planning.md (3 terms/7 hits) |
| jupyterhub-upgrading | JupyterHub | 4 | 2 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 100.0% / 2 files | 100.0% / 2 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 0.0% +cross-file | 0.0% +out-of-scope | 75.0% +missing-support | 75.0% / 100.0% reachable +recovered | 100.0% +family-scope | 100.0% / 100.0% support +recovered | docs/source/reference/changelog.md (4 terms/98 hits)<br>docs/source/howto/upgrading-v5.md (4 terms/17 hits)<br>docs/source/explanation/database.md (3 terms/62 hits) |
| jupyterhub-web-security | JupyterHub | 2 | 2 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 75.0% / 1 files | 75.0% / 1 files | 100.0% / 1 unreachable | 100.0% | 100.0% / 3 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/source/reference/changelog.md (3 terms/22 hits)<br>docs/source/explanation/websecurity.md (3 terms/10 hits)<br>docs/source/reference/technical-overview.md (2 terms/5 hits) |
| jupyterhub-roadmap | JupyterHub | 2 | 1 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 75.0% / 2 files | 75.0% / 2 files | 100.0% / 1 unreachable | 100.0% | 100.0% / 4 | 100.0% | 75.0% +cross-file | 75.0% +out-of-scope | 75.0% +missing-support | 75.0% / 100.0% reachable | 100.0% +family-scope | 100.0% / 100.0% support +recovered | docs/source/reference/changelog.md (3 terms/10 hits)<br>docs/source/contributing/roadmap.md (2 terms/15 hits)<br>docs/source/reference/gallery-jhub-deployments.md (2 terms/2 hits) |
| jupyterhub-security-basics | JupyterHub | 11 | 1 | 1 | 1 | 1 | hit | 100.0% / 2 sec | 75.0% / 1 files | 75.0% / 1 files | 100.0% / 1 unreachable | 100.0% | 100.0% / 2 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/source/reference/changelog.md (3 terms/73 hits)<br>docs/source/reference/services.md (3 terms/66 hits)<br>docs/source/howto/rest.md (3 terms/34 hits) |
| jupyterhub-authenticators-api-reference | JupyterHub | 1 | 2 | 2 | 2 | 1 | hit | 100.0% / 4 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 3 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/source/reference/api/auth.md (4 terms/11 hits)<br>docs/source/reference/authenticators.md (2 terms/9 hits)<br>docs/source/tutorial/getting-started/authenticators-users-basics.md (2 terms/7 hits) |
| jupyterhub-services-api-reference | JupyterHub | 1 | 2 | 2 | 2 | 1 | hit | 100.0% / 3 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/source/reference/api/service.md (4 terms/5 hits)<br>docs/source/reference/api/auth.md (1 terms/5 hits)<br>docs/source/reference/api/proxy.md (1 terms/2 hits) |
| jupyterhub-spawners-api-reference | JupyterHub | 1 | 2 | 2 | 2 | 1 | hit | 100.0% / 3 sec | 100.0% / 1 files | 100.0% / 1 files | 100.0% / 0 unreachable | 100.0% | 100.0% / 2 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% / 100.0% reachable | 100.0% | 100.0% / 100.0% support | docs/source/reference/api/spawner.md (4 terms/6 hits)<br>docs/source/reference/changelog.md (2 terms/10 hits)<br>docs/source/reference/spawners.md (2 terms/3 hits) |

### 7. Drift prevention

- Built-in drift recall: **100.0%**
- Semantic drift recall on applicable scenarios: **100.0%** across **6** cases
- Semantic recall across all drift cases: **75.0%**
- Structural governance recall on semantic-not-applicable cases: **100.0%** across **2** cases
- Combined recall: **100.0%**
- Built-in false-positive rate: **0.0%**
- Route-behavior drift recall: **100.0%** across **3** runtime-companion mutations
- Built-in route-behavior recall: **100.0%**
- Underreach recall: **100.0%**
- Overreach recall: **100.0%**
- Route-behavior false-positive rate: **0.0%**

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

| Route-behavior scenario | Loading scenario | Behavior class | Built-in | Route behavior | Missing required modules | Unexpected loaded modules |
| --- | --- | --- | --- | --- | --- | --- |
| control-route-reason-edit | ops-doc-edit | control | missed | missed | none | none |
| ops-touch-underreach-evidence | ops-doc-edit | underreach | detected | detected | evidence-reference | none |
| architecture-touch-underreach-root | architecture-module-edit | underreach | detected | detected | atlas-root | none |
| ops-touch-overreach-architecture | ops-doc-edit | overreach | detected | detected | none | architecture-contracts |

### 8. Release-surface trust gates

- Generated-surface recall: **100.0%** across **1** hazard scenarios
- Generated-surface false-positive rate: **0.0%**
- Release-surface reality recall: **100.0%** across **4** hazard scenarios
- Release-surface reality false-positive rate: **0.0%**
- Combined recall: **100.0%**
- Combined false-positive rate: **0.0%**
- Interpretation: **the compiled pilot now acts as a deterministic release-surface trust probe: generated human surfaces must stay byte-for-byte aligned with the agent-primary render, and `--reality` must reject missing, duplicate, placeholder-only, and wrong-kind current surfaces.**

| Scenario | Category | Expected rule | Outcome | Detected rules |
| --- | --- | --- | --- | --- |
| generated-surface-control | generated-human-surface | none | clean | none |
| generated-surface-drift | generated-human-surface | surface-pair-generated-human-primary | detected | surface-pair-generated-human-primary |
| reality-control | reality-validation | none | clean | none |
| reality-missing-current | reality-validation | surface-inventory-current-missing | detected | surface-inventory-current-missing |
| reality-kind-mismatch | reality-validation | surface-inventory-kind | detected | surface-inventory-kind |
| reality-duplicate-current | reality-validation | surface-inventory-duplicate-current | detected | surface-inventory-duplicate-current |
| reality-placeholder-directory | reality-validation | surface-inventory-placeholder-directory | detected | surface-inventory-placeholder-directory |

### 9. Sample diversity and coverage audit

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
- External scenario seeds: **20**
- External sample formats: **rst=4, markdown=16**
- External sample phases: **build, design, governance, operate, planning, release, vision**
- External sample benchmark dimensions: **coverage, drift, routing**

**Expansion check:** the main benchmark now spans multiple synthetic datasets and more than one sync mode, while the external sample supplement adds real open-source corpora for grep-first field realism. Coverage across artifact families remains strong, but language coverage is still limited and the fair common scoreboard is still narrower than a full multi-toolchain field matrix.

### 10. Authoring overhead

- Bookkeeping entries (modules + pairs + touch routes + roles): **45**
- Bookkeeping entries per benchmark item: **1.25**

## Interpretation

### Strengths

1. AODS can represent the full benchmark lifecycle without unsupported gaps.
2. The structured artifact catalog is broad enough to cover architecture, workflow, contract, policy, and operations material in one corpus.
3. The main release-gating benchmark now rests on objective touch-route behavior and exact corpus size rather than only advisory token and exploratory query-route signals.
4. The benchmark now includes a deterministic real-corpus routing probe over 20 curated open-source grep-first seeds, a seed-title rerank lane, a structure-aware rerank lane, a path-family rerank lane, an API-surface rerank lane, separate section-context, section-evidence-pack, rank-order scenario-evidence-bundle, cost-aware scenario-evidence-bundle, claim-support-pack, answer-check, answer-locality, and authority-scoped answer lanes, plus a reachability audit that separates retrieval misses from exact scenario phrases that never appear anywhere in the corpus, a claim-support lane that allows deterministic per-scenario alias groups for clearly equivalent wording, explicit scenario answer checks that distinguish wording drift from concrete answer-support gaps, a target-locality audit that shows when concrete answers depend on cross-file borrowed evidence, and explicit answer-authority scopes that distinguish acceptable in-scope borrowing from out-of-scope recovery.
5. The benchmark now makes repository-scale corpus weight, raw loaded payload size, rendered prompt-envelope size, and multi-runtime request-body matrices over the current round-one baseline prompts explicit instead of conflating them.
6. The benchmark now includes a deterministic release-surface trust probe instead of assuming generated human surfaces and current inventory declarations remain trustworthy.
7. The benchmark now includes a first behavior-drift lane that mutates the runtime companion directly and measures route underreach and overreach at the loaded-module-set level.
8. The benchmark now answers the core product questions separately instead of hiding them inside one aggregate score: representability, information preservation, task-time context control, and anti-drift/trust behavior each have their own measurable lane.

### Limits and failure modes

- Some concrete answers are only fully supported after the compressed pack borrows evidence from neighboring files rather than staying entirely grounded in the target document.
- Even when the benchmark declares explicit answer-authority scopes, some concrete answers are still only recovered by borrowing evidence from out-of-scope files.
- Some concrete answers still remain unsupported even after re-checking every section inside the declared authority scope.
- Some exact-file authority gaps are actually local-family distribution problems: the answers exist in sibling docs under the same target directory rather than in the target file alone.
- Some remaining claim-support misses are now explained by benchmark wording realism rather than by concrete answer insufficiency.
- Some real-corpus scenario seeds include exact grep phrases that never appear anywhere in the source corpus, so exact scenario-term coverage now mixes retrieval performance with scenario-phrase realism.

- The reference implementation now validates declared cross-surface invariants, but it still does not prove semantic equivalence beyond declared anchors.
- Progressive loading is strongest for touch-routed authoring flows; query routing still depends on corpus metadata quality and remains exploratory.
- Real-corpus routing and section compression are still heuristic; they do not yet test semantic chunk ranking or answer synthesis quality.
- Compression is not automatically positive at corpus scale; routing and pairing metadata can erase local gains even when artifact-local compression exists.
- The main scoreboard still relies on renderer-based prompt-envelope metrics across the full scenario set; the runtime-backed supplement now spans multiple local CLI profiles and one hosted relay lane, but the hosted request-loop split is still run-sensitive and should be read as directional field evidence rather than as a canonical fixed hosted loop.
- Sample diversity is stronger than before because it now includes an external open-source scenario supplement, but the pack remains English-only and narrower than a true multi-toolchain field sample.
- Release-surface trust is currently proven on the compiled pilot release surfaces; it is not yet a broader multi-corpus field benchmark.
- Behavior drift is now measurable for runtime companion route mutations, but it is still synthetic and narrower than a full autonomous execution trace benchmark.

## Bottom line

**AODS passes this benchmark on coverage, fidelity, task-time progressive loading, and anti-drift / trust controls.** It does not win by shrinking the entire repository corpus: full-corpus bytes stay roughly flat because governance metadata offsets local artifact compression. Instead, the practical gain comes from routing the working set down to a **12372-byte** median prompt envelope with **76.0%** median byte savings vs full load while keeping **100.0%** objective touch-route hit rate and **100.0%** built-in drift recall. The hosted runtime supplement also shows that when field cost grows beyond the local lane, the current successful hosted-vs-local median delta is **32322 bytes** and the extra cost is concentrated in **tool-loop traffic rather than the first request envelope**. Across **3** successful hosted captures, that hosted/local total-delta band spans **15865 bytes** while the first-request delta stays at **0 - 0 bytes**, so the hosted split should be read as directional field evidence rather than as a canonical fixed hosted loop. The benchmark is now much more objective and closer to field reality, but it still needs broader language coverage and a larger fair cross-toolchain field matrix.

## Appendix: reproducibility

```bash
cd <repo-root>
npm install
npm run validate:all
npm run benchmark:runtime-capture   # optional supplemental sample
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:test
npm run benchmark:summary
```
