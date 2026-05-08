# compiled-pilot source

This directory contains the concise authoring source for the compiled pilot corpus.

## Adoption path

Use this directory when you want to learn or adapt the current source-first example packs.

1. Edit `authoring.json` first. Do not hand-edit `examples/compiled-pilot/`; that directory is generated output.
2. Regenerate the compiled example:

```bash
npm run compile:pilot
```

3. Validate the regenerated output:

```bash
npm run validate:compiled-pilot
```

4. Smoke-check the fixture and golden export declarations:

```bash
npm run fixture:smoke
```

5. Route to the smallest relevant authority before changing a pack:

```bash
node ./bin/aods.mjs route ./examples/compiled-pilot --query "release readiness evidence and acceptance criteria" --intent read --stage orientation
```

Run `npm run validate:all` before treating changes as repository-ready. If a change updates example semantics, review the generated diff in `examples/compiled-pilot/` and the fixture manifest together.

These packs are adoption examples. They are not a command executor, event store, adapter runtime, resource scheduler, crawler, or fact checker.

## What this pilot demonstrates

- concise authoring JSON compiled into a full AODS corpus
- routed root -> capsule -> detail loading
- paired README governance with `shared_invariants`
- implementation-governance detail with acceptance matrix, system gates, and review routing
- optional `surface-inventory` reality checks for current compiled surfaces
- explicit separation between change policy and incident response authority
- deterministic generated human output from an agent-primary surface pair

## Generated human surface example

`authoring.json` declares `pair-shift-ops-readme` with:

- `human_primary = README.md`
- `human_generation.mode = deterministic`
- `human_generation.profile = overview`

When you run `npx aods compile`, the compiled corpus emits `README.md` from the paired agent modules instead of copying a hand-authored human file from `files[]`. Use the policy module for release-window and approval questions. Use the governance module for delivery readiness, acceptance evidence, and final review-route questions. Use the runbook module for sev1 response and rollback ownership questions.
