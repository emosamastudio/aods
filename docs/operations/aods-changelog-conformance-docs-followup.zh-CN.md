# AODS Changelog 与 Conformance 文档后续

状态：已完成
日期：2026-05-13
覆盖任务：U-311 到 U-320

## 结论

本轮完成 post-close changelog 文档审查、strict warning 行为说明、conformance 使用说明、report sample、no-fetch 边界、expected-failure 语义、generated guard 和 package surface allowlist 说明。没有新增 runtime、provider execution、remote fetch、CI 或 package publish。

## Changelog Post-Close Audit

`#13` 已在 v0.8 后关闭为 completed。当前可执行语义是：

| 长度 | 普通 validate / compile | strict validate / compile | 说明 |
|---:|---|---|---|
| `<= 300` | pass | pass | 推荐范围 |
| `301-500` | warning | fail | `changelog-delta-soft-limit` L3 warning；strict 把 warning 当失败 |
| `> 500` | error | error | schema hard limit |

Current authority surfaces already reflect this behavior:

- `schema/module.schema.json` keeps the hard `maxLength: 500`.
- `lib/validate.mjs` emits `changelog-delta-soft-limit` when delta is over 300 and at most 500.
- `README.md` and `README.zh-CN.md` now include the 300 / 500 behavior table.
- `#13` is no longer an open public blocker.

Historical docs that say `#13` was open or non-blocking before v0.8 are left unchanged as time-specific evidence.

## Regression Naming Cleanup

The focused scaffold regression was renamed from a generic soft-limit name to:

`changelog delta warns in normal validation, blocks strict validation, and hard-fails above schema limit`

This name now states all three behaviors directly:

- normal mode emits warning and exits successfully for 301-500 characters;
- strict mode fails on the same warning and does not write the target;
- over 500 characters fails schema validation.

No additional test split was needed because the current test already exercises all three paths in one fixture setup.

## Strict-Warning Behavior

`--strict` does not create a new severity class. It changes gate behavior:

| Finding bucket | Normal gate | Strict gate |
|---|---|---|
| errors | fail | fail |
| warnings | pass with warning | fail |
| no errors / no warnings | pass | pass |

For changelog delta, this means an author can keep a 350-character delta during local drafting, but release or strict gates will require either tightening the wording or splitting unrelated changes before acceptance.

## Conformance Suite Release Docs

Use the compiled-pilot conformance suite as the external smoke path:

```bash
npm run conformance:compiled-pilot
node ./bin/aods.mjs conformance run ./examples/compiled-pilot-source/fixtures/conformance-manifest.json --json
```

Current suite:

| Case | Kind | Expected | Meaning |
|---|---|---|---|
| `fixture-manifest-smoke` | fixture-smoke | pass | fixture manifest contract is valid |
| `negative-fixture-invalid-kind` | fixture-smoke | fail | invalid fixture kind is rejected |
| `negative-fixture-missing-input-path` | fixture-smoke | fail | missing input path is rejected |
| `compiled-pilot-strict-reality` | validate | pass | compiled-pilot strict reality validation passes |

## Conformance Report Sample

A compact JSON sample is stored at:

`docs/operations/aods-conformance-report-sample.json`

It mirrors the current compiled-pilot conformance report shape and keeps only the fields needed for docs and adoption examples.

## No-Fetch / No-Provider Boundary

The conformance runner is intentionally read-only:

- It reads local fixture manifests and local corpus paths.
- It invokes local fixture-smoke and validate logic.
- It does not remote fetch, clone, call providers, execute adapters, run golden update commands, or contact external systems.

This keeps conformance useful for release documentation without turning it into a runtime executor.

## Expected-Failure Semantics

`expected_status: "fail"` means the case is supposed to fail for declared rules. If the observed failure matches the expected status and required rules, the case status is counted as passing for the suite.

Current example:

| Case | Observed status | Expected status | Suite interpretation |
|---|---|---|---|
| `negative-fixture-invalid-kind` | fail | fail | pass |
| `negative-fixture-missing-input-path` | fail | fail | pass |

The suite summary can therefore be `status: "pass"` while `summary.expected_failures` is greater than zero.

## Generated Clean Guard Docs

`npm run generated:check-clean -- --json` checks exactly these paths:

| Path | Why it is checked |
|---|---|
| `benchmarks/aods-eval-lab/generated` | benchmark generated machine outputs |
| `benchmarks/aods-eval-lab/reports` | benchmark generated human reports |
| `examples/compiled-pilot` | compiled source-first pilot output |

Dirty entries mean a command changed generated material. Accept the diff only when it is caused by an intentional source/schema/generator change; otherwise rerun or restore before committing.

## Package Surface Allowlist Docs

`npm run package:check-surface -- --json` compares `npm pack --dry-run --json` against the explicit allowlist in `scripts/check-package-surface.mjs`.

Allowlist review flow:

1. Add or remove package files only when the public package surface intentionally changes.
2. Update `EXPECTED_PACKAGE_FILES` in `scripts/check-package-surface.mjs`.
3. Run `npm run package:check-surface -- --json`.
4. Run `npm run release:hygiene`.
5. Document why the package surface changed in release notes or operations docs.

Current result: `entry_count=61`, `missing=[]`, `unexpected=[]`.

## Verification

| Gate | Result |
|---|---|
| Previous round quality review | pass |
| `npm run release:hygiene` before and after edits | pass |
| conformance JSON sample source | `node ./bin/aods.mjs conformance run ... --json` pass |
| generated clean JSON source | `dirty_entries=[]` |
| package surface JSON source | `missing=[]`, `unexpected=[]` |
