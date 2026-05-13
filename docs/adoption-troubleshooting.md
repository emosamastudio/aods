# AODS Adoption Troubleshooting

This page covers the common adoption failures after installing a tagged release.

## Check The Installed Version

```bash
npx aods --version
```

Expected for the current release:

```text
0.9.0
```

If the version is older, reinstall from the tag:

```bash
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.9.0
```

## Source-First Versus Compiled Corpus

If your project has `authoring.json`, edit that source and regenerate:

```bash
npx aods compile ./aods/authoring.json ./docs/aods --force --strict
```

Do not hand-edit generated compiled output when the source authoring file is the authority.

If your project only has a compiled corpus, validate it directly:

```bash
npx aods validate ./docs/aods --strict
```

## Strict Warnings Block The Gate

`--strict` treats warnings as blockers. This is expected for release gates.

Common warning sources:

- deprecated glossary term refs;
- expired or missing evidence review metadata;
- manual-review implementation criteria.

Run without `--strict` only when you are investigating the issue shape, not when accepting a release.

## Normal Validation Versus Reality Validation

Normal validation checks the corpus:

```bash
npx aods validate ./docs/aods --strict
```

Reality validation additionally checks declared current local surfaces:

```bash
npx aods validate ./docs/aods --strict --reality --repo-root .
```

Use `--reality` only when `surface-inventory` entries are meant to resolve against the local repository. Missing external implementation repos can be intentionally unchecked until they are mapped locally.

## Static Metadata Is Not Runtime Behavior

Capability, event correction, resource, and migration examples are static declarations. They do not:

- discover providers;
- exchange credentials;
- execute adapters;
- replay events;
- run migrations;
- connect to databases;
- create schedulers or policy engines.

Runtime/protocol work is tracked separately and should not be inferred from declarative metadata.
