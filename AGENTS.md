# aods project instructions

This repository uses a file-backed work standard for project execution.

## Read order

1. `manifest.json`
2. `docs/README.md`
3. `docs/operations/README.md`
4. `docs/operations/aods-task-ledger.zh-CN.md`
5. `docs/operations/aods-handoff.zh-CN.md`

## Repository shape

- The repo itself is **compiled-corpus-first**: the root semantic authority is the checked-in corpus (`manifest.json`, `spec/`, `schema/`, `modules/`).
- `examples/compiled-pilot-source/` is a **source-first example**. If you intentionally change that example's semantics, edit `authoring.json` and regenerate the compiled example instead of hand-editing generated output.

## Working rules

- Treat `docs/operations/aods-task-ledger.zh-CN.md` as the single current task authority for project work.
- Keep newly discovered tasks in the ledger first; do not insert them into the current round unless the user explicitly changes scope.
- For AODS semantic changes, validate with the smallest correct path first, then use `npm run validate:all` as the repo-level gate.
- README benchmark blocks between `<!-- BENCHMARK_SYNC:START -->` and `<!-- BENCHMARK_SYNC:END -->` are generated; durable wording changes there must come from `benchmarks/aods-eval-lab/src/summary.mjs`.
- Stay inside this repository unless the user explicitly expands scope to sibling repos or external runtimes.
