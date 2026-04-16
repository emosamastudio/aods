# compiled-pilot source

This directory contains the concise authoring source for the compiled pilot corpus.

## What this pilot demonstrates

- concise authoring JSON compiled into a full AODS corpus
- routed root -> capsule -> detail loading
- paired README governance with `shared_invariants`
- deterministic generated human output from an agent-primary surface pair

## Generated human surface example

`authoring.json` declares `pair-shift-ops-readme` with:

- `human_primary = README.md`
- `human_generation.mode = deterministic`
- `human_generation.profile = overview`

When you run `npx aods compile`, the compiled corpus emits `README.md` from the paired agent modules instead of copying a hand-authored human file from `files[]`.
