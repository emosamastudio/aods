---
name: aods-use
description: Use when working in an AODS-enabled repo or with AODS files and commands such as authoring.json, manifest.json, surface_pairs, boot.by_touch, or aods compile/validate/route.
---

# AODS Use

Use this skill as an operations adapter, not as a second copy of the AODS spec.

## Version alignment

- Release version: `v0.7.0`
- Package version: `0.7.0`
- Compatibility markers: `aods_v=3`, `authoring_v=1`
- Source of truth: installed AODS CLI plus repo `schema/`, `spec/`, and manifest surfaces

## Use when

- working inside an AODS-enabled repository
- editing `authoring.json`, `manifest.json`, `modules/*.json`, or `indexes/runtime.json`
- changing `surface_pairs`, `shared_invariants`, or `boot.by_touch`
- deciding whether to use `aods compile`, `aods validate`, `aods route`, or authoring scaffold helpers

## Do not use when

- editing generic Markdown outside AODS context
- editing generic JSON that is not part of an AODS corpus
- doing broad docs work where AODS structure is irrelevant

## First action

1. Detect repository shape:
   - source-first if `authoring.json` exists
   - compiled-corpus-first if `manifest.json` exists without `authoring.json`
2. Identify the task lane: authoring, sync, routing, or validation.
3. Choose the minimal correct AODS path before editing:
   - authoring structure: `aods scaffold authoring-module`, `aods scaffold authoring-touch`, `aods scaffold authoring-pair`
   - source-first changes that must regenerate output: `aods compile ...`
   - structural or paired-surface edits: `aods validate ... --strict`
   - minimal context loading or routing checks: `aods route ...`
4. Treat `agent-primary` as authority. Human-oriented docs do not replace agent-primary semantic authority.

## Trigger contract

Expected trigger: `Update surface_pairs in authoring.json and make sure shared_invariants still pass.`

Expected first action: `Detect source-first vs compiled-corpus-first, then choose the minimal AODS command path before editing.`

Negative trigger: `Fix wording in a generic README that does not use AODS.`

Observed result after edit: `Repo tests verify release alignment and the trigger contract for this skill package.`
