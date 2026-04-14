# Code-agent retrieval patterns and implications for AODS

**Date:** 2026-04-15  
**Purpose:** test whether current code agents are actually optimized for vector-database retrieval, or whether they more often rely on grep-style search, repository maps, and deterministic file traversal.

## Executive summary

This research pass suggests a practical conclusion:

1. **Current code agents are usually not vector-first systems.**
2. **Their default retrieval style is closer to `grep` / `rg` / file traversal / repo maps / symbol extraction than to semantic embedding stores.**
3. **For AODS, this means the near-term optimization target should be lexical-first and structure-first retrieval, not a mandatory vector-index architecture.**

The strategic implication is important:

- AODS should be easy for agents to **search deterministically**
- AODS should be easy for agents to **route structurally**
- semantic enrichment is still valuable, but it should be an **optional second layer**, not the primary assumption

## Why this matters

AODS has been exploring semantic routing and lower context cost. If the real operating model of mainstream code agents is grep-first, then AODS should optimize for the substrate they actually use:

- stable file paths
- stable identifiers
- canonical terms
- explicit routing metadata
- grep-friendly surfaces
- low-ambiguity summaries

If AODS instead assumes a future where agents always build embeddings and query vector stores, it risks optimizing for a workflow that many current code agents do not actually use.

## Evidence from current agent patterns

### 1. Claude Code appears aligned with grep-style search

Public Claude Code tool references and usage guides consistently describe search and navigation in terms of:

- file search
- grep / regex search
- ripgrep-backed search
- workspace-scoped traversal

In this pass, no public Anthropic source was found that makes a vector index or semantic embedding store a required part of Claude Code's default retrieval loop.

**Interpretation:** Claude Code should be treated as a strong signal for **agentic file search**, not for mandatory vector retrieval.

### 2. Aider is repo-map-first, not vector-db-first

Aider's public documentation emphasizes a **repository map**:

- tree-sitter / lexer-based extraction
- definitions and references
- graph ranking
- token budgeting
- compressed structural context for the LLM

That is a retrieval-and-context system, but not a vector-store-first system.

**Interpretation:** one successful code-agent pattern is **structure compression + ranking + token budgeting**, not semantic embedding infrastructure.

### 3. Codex CLI operationally assumes `rg`

Public OpenAI Codex materials and repository artifacts point to a practical dependence on **ripgrep**:

- `rg` is treated as an expected search utility
- repository search is operationally file-based
- command-line retrieval assumes local traversal rather than a prebuilt semantic index

**Interpretation:** another modern code agent operates in a way that is consistent with **grep-first repo discovery**.

## Working model

The current code-agent ecosystem appears to prefer:

1. **fast lexical search** (`grep`, `rg`, `glob`, `find`)
2. **file and symbol structure**
3. **incremental reading**
4. **token-budgeted summaries or repo maps**

before it prefers:

1. global semantic embedding pipelines
2. vector retrieval as the default substrate

This does not mean vector retrieval is useless. It means it is often **secondary**, **optional**, or **not worth the operational cost** for local code-agent workflows.

## Implications for AODS optimization

### 1. AODS should become more grep-friendly

This implies several concrete standards-level directions:

- keep one canonical term per concept
- keep `module_id`, `artifact_id`, and routing identifiers explicit and stable
- avoid synonym churn in authority-bearing surfaces
- ensure important semantics remain discoverable by literal search, not only by inference
- repeat high-value lexical anchors when needed, especially across paired human/agent surfaces

### 2. AODS routing should be lexical + structural first

The current `semantic-routing` initiative should be reframed:

- **first layer:** lexical and structural scoring
- **second layer:** optional semantic enrichment
- **third layer:** optional vector or embedding-backed ranking

That keeps AODS aligned with how current code agents actually operate.

### 3. Compiled authoring should emit grep-first helper surfaces

If AODS moves toward compiled authoring, the compiler should not emit only governance JSON. It should also emit search-friendly surfaces such as:

- compact capsule summaries
- grep-friendly indexes
- literal authority statements
- stable route tables
- optional `llms.txt`-style entry surfaces

### 4. Benchmark design should explicitly test grep-first retrieval

The benchmark should no longer assume semantic routing is the main next-stage comparator. It should also measure:

- exact-term discovery success
- alias / synonym miss behavior
- multi-hop grep retrieval cost
- loaded prompt-envelope size after grep-first discovery
- number of files and hops needed before the correct authority surface is reached

## What this changes in AODS priorities

This research strengthens three near-term priorities:

1. **compiled authoring** remains P0, because it can emit cleaner grep-friendly and route-friendly surfaces
2. **claim-level semantic diff** remains important, but should not depend on vector retrieval to be useful
3. **semantic routing** should be interpreted as **grep-compatible structured routing**, not as “build a vector database”

## Open questions

This research pass still leaves several questions open:

1. How often do code agents fail on alias-heavy or synonym-heavy corpora without embeddings?
2. When does a repo-map approach outperform naive grep, and when does it not?
3. At what repository size does embedding-backed retrieval become worth the cost for agent workflows?
4. Should AODS define an optional retrieval profile for vector-aware runtimes, while keeping grep-first compatibility as the baseline?

## Current AODS conclusion

For now, AODS should optimize for this assumption:

> **A competent code agent can use grep, file paths, route metadata, and structured summaries immediately. A vector index may exist, but it should be treated as optional acceleration, not as the baseline contract.**

That makes AODS more realistic for present-day agent workflows and better aligned with the actual retrieval behavior of mainstream code agents.

## Reference signals

- Anthropic Claude Code public tool references and usage guides for search/navigation
- Aider repository-map documentation and FAQ
- OpenAI Codex CLI repository materials related to `rg` / ripgrep usage
