---
name: aods-use
description: Use when working in an AODS-enabled repo or with AODS files and commands such as authoring.json, manifest.json, surface_pairs, boot_by_touch, or aods compile/validate/route/upgrade.
---

# AODS Use

Use this skill as an AODS workflow adapter, not as a second copy of the AODS spec.

## Version alignment

- Release version: `v0.7.0`
- Package version: `0.7.0`
- Compatibility markers: `aods_v=3`, `authoring_v=1`
- Source of truth: installed AODS CLI plus repo `schema/`, `spec/`, and manifest surfaces

## First action

1. Detect repository shape:
   - source-first if `aods/authoring.json` or `authoring.json` exists
   - compiled-corpus-first if `docs/aods/manifest.json` or `manifest.json` exists without an authoring source
2. Identify the task lane: authoring, sync, routing, validation, upgrade, or release alignment.
3. Choose the minimal correct command path before editing:
   - source-first semantic changes: edit authoring source, then `aods compile ...`
   - compiled-corpus checks: `aods validate ... --strict`
   - repo reality checks: `aods validate ... --strict --reality --repo-root <repo-root>`
   - corpus schema refresh: `aods upgrade ...`
   - minimal context loading: `aods route ...`
4. Treat agent-primary surfaces as semantic authority. Human-facing docs do not replace agent-primary authority.

## Use when

- working inside an AODS-enabled repository
- editing `authoring.json`, `manifest.json`, `modules/*.json`, `indexes/runtime.json`, or paired human surfaces
- changing `surface_pairs`, `shared_invariants`, `boot_by_touch`, or generated surface metadata
- deciding whether a change needs `compile`, `validate`, `upgrade`, or `route`
- checking release tag, package version, and corpus compatibility alignment

## Do not use when

- editing generic Markdown outside AODS context
- editing generic JSON that is not part of an AODS corpus
- doing broad docs work where AODS structure is irrelevant

## Operating rules

- Prefer the authoring source as the only writable semantic authority when it exists.
- Use `aods compile` to regenerate compiled corpus output instead of hand-editing generated corpus files.
- Use `aods validate --strict --reality --repo-root <repo-root>` as the final alignment gate for repos with paired current surfaces.
- Use `aods upgrade` only when you intentionally want newer schema/runtime metadata in the compiled corpus and have checked source-first authority first.
- If release tag and installed package version disagree, report the mismatch explicitly. Do not invent a version and do not claim alignment that upstream has not published.

## Trigger contract

Expected trigger: `Upgrade AODS, verify the corpus still matches the latest standard, and fix any paired-surface drift.`

Expected first action: `Detect source-first vs compiled-corpus-first, then choose the minimal AODS command path before editing.`

Negative trigger: `Fix wording in a generic README that does not use AODS.`

Observed result after edit: `Repo tests verify release alignment and the trigger contract for this skill package.`
