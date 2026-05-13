# AODS Adoption Quickstart

Use this page when you want the shortest release-tag smoke for a new project.

## Install

```bash
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.9.0
npx aods --version
npx aods --help
```

The expected version is `0.9.0`.

## Source-First Path

Use this path when your project can own `authoring.json` and regenerate the compiled corpus.

```bash
npx aods scaffold authoring ./aods --sys my-system --purpose "Agent-first docs for my system" --force
npx aods compile ./aods/authoring.json ./docs/aods --force --strict
npx aods validate ./docs/aods --strict
npx aods route ./docs/aods --query "delivery gate policy" --intent read --stage orientation --json
```

Add `--reality --repo-root .` only after your corpus declares current local surfaces that should exist in the repository.

## Compiled-Corpus Path

Use this path when you are consuming a checked-in compiled corpus directly.

```bash
npx aods validate ./docs/aods --strict
npx aods route ./docs/aods --query "authority governance" --intent read --stage orientation --json
```

To smoke the packaged example after installing from the release tag:

```bash
npx aods validate ./node_modules/aods/examples/compiled-pilot --strict
npx aods route ./node_modules/aods/examples/compiled-pilot --query "adapter capability fallback metadata" --intent read --stage orientation --json
```

The compiled-pilot example is declarative. It does not execute adapters, replay events, connect to databases, call providers, or run migrations.

## Conformance Smoke

Use the packaged conformance command when you need a minimal machine-readable compatibility smoke. Keep the public docs command-sized; do not copy the full JSON report into project README files.

```bash
npx aods conformance ./node_modules/aods/examples/compiled-pilot-source/fixtures/conformance-manifest.json --json
```
