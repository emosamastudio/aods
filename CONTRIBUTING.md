# Contributing to AODS

Thanks for contributing to AODS.

AODS is both:

- an open-source standard + CLI
- an open discussion around the broader **agent-primary** thesis

That means valuable contributions are not limited to code. Real-world adoption notes, failure cases, counterexamples, and benchmark challenges are all useful.

## Where to contribute

### Use GitHub Discussions for open-ended topics

Use [GitHub Discussions](https://github.com/emosamastudio/aods/discussions) when you want to:

- debate the `agent-primary` thesis
- discuss whether AODS fits a project category
- compare AODS with `llms.txt`, Markdown + YAML, DITA, or RAG-style approaches
- propose benchmark directions, research questions, or conceptual objections
- ask broad usage questions before you have a concrete bug

### Use GitHub Issues for concrete repo work

Use [GitHub Issues](https://github.com/emosamastudio/aods/issues) when you want to:

- report a CLI or validation bug
- share a structured adoption report
- submit a failure case or counterexample with reproducible detail
- propose a concrete documentation or implementation change

## The most helpful contribution types

### 1. Adoption reports

The best adoption reports usually include:

- project type and size
- how agents are used today
- where routing / authority / drift currently fail
- which part of AODS helped, and which part still felt heavy or unclear
- whether your example can be shared publicly

### 2. Failure cases and counterexamples

These are especially valuable. Please include:

- what the agent was trying to do
- what authoritative information existed
- where the current AODS model did not fit or failed
- whether the problem is routing, authority, anti-drift, authoring overhead, or benchmark realism
- minimal reproduction steps if the problem is implementation-specific

### 3. Code, spec, and benchmark changes

Code contributions are welcome for:

- `schema/` and `spec/`
- `bin/` and `lib/`
- `benchmarks/aods-eval-lab/`
- examples and companion docs

## Ground rules for claims

Please keep public claims aligned with the current repository evidence:

- AODS currently demonstrates benchmark strength on coverage, fidelity, task-time progressive loading, and anti-drift / trust controls.
- The practical win is governed routing and validation, **not** simplistic full-repository compression.
- Hosted runtime evidence is useful field evidence, but hosted loop decomposition is still treated as repeat-sensitive rather than as a fixed universal law.

If you think these claims are wrong or incomplete, please open a discussion or issue with evidence. That kind of challenge is welcome.

## Local workflow

For documentation-only changes, small targeted edits are usually enough.

For behavior or release-surface changes, the most useful local checks are:

```bash
npm install
npm run validate:all
npm run benchmark:test
```

For full release-grade verification:

```bash
npm run release:self-check
```

Official AODS version publication is handled through **GitHub Releases**. `release:self-check` verifies repo and package readiness locally; it does not require npm registry publication.

## Communication

English and Chinese contributions are both welcome.

If you are unsure whether something belongs in Issues or Discussions, prefer:

- **Discussions** for open-ended reasoning
- **Issues** for concrete repository actions
