# AODS public sample snippets

This directory contains compact public sample snippets for docs and issue discussions.

These files are hand-curated from current CLI output shapes. They are not generated golden outputs, and they are not part of the npm package surface unless a future release task explicitly promotes them.

| File | Purpose |
|---|---|
| [`validate-summary.sample.json`](./validate-summary.sample.json) | Minimal successful `validate --json` shape for public docs. |
| [`validate-issue-location.sample.json`](./validate-issue-location.sample.json) | Minimal issue `location` envelope shape for `validate --json` consumers. |
| [`route-explanation.sample.json`](./route-explanation.sample.json) | Minimal `route --json` explanation shape showing selected and unselected dependencies. |
| [`route-skipped-modules.sample.json`](./route-skipped-modules.sample.json) | Minimal `route --explain-skipped --json` shape for opt-in skipped-module diagnostics. |
| [`unchecked-repo-reality.sample.json`](./unchecked-repo-reality.sample.json) | Minimal `validate --reality --json` topology shape when a linked implementation repo is intentionally unchecked. |
