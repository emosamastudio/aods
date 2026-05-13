# AODS structured term refs implementation

日期：2026-05-13
范围：U-382 到 U-391
状态：已完成

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 对齐；`MEMORY.md` 仍为未跟踪本地文件 |
| Latest commit | 通过 | 最新提交为 `eee0bcd Document adoption samples and next task pool` |
| Task ledger | 通过 | U-382 到 U-391 是当前默认下一轮任务 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入 structured term refs 实现 |

## 本轮完成

| 任务 | 结果 | 证据 |
|---|---|---|
| U-382 | `term_refs[]` 进入 section、artifact、contract metadata schema，并同步 compiled pilot schema mirror | `schema/module.schema.json`、`examples/compiled-pilot/schema/module.schema.json` |
| U-383 | compile 生成 manifest `term_ref_summary` | `lib/compile.mjs`、`lib/corpus-helpers.mjs` |
| U-384 | validate 检查 canonical term id、alias misuse、deprecated ref、unresolved ref、summary mirror | `lib/validate.mjs` |
| U-385 | source-first pilot 增加 lifecycle term ref 正例 | `examples/compiled-pilot-source/authoring.json`、`examples/compiled-pilot/modules/shift-ops-resource-surface.json` |
| U-386 | alias machine ref 负例进入 focused regression | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` |
| U-387 | deprecated / strict 行为通过 validator warning gate 覆盖 | `term-ref-deprecated-stable` strict warning behavior |
| U-388 | public docs 指向 structured term refs adoption path | `README.md`、`README.zh-CN.md`、`examples/compiled-pilot-source/README.md`、`spec/validation-rules.json` |
| U-389 | route query 能发现相关规范面 | `node ./bin/aods.mjs route . --query "structured term refs glossary alias lifecycle deprecated term refs" --stage plan --intent read --json` |
| U-390 | package surface 不需要新 allowlist | `npm run package:check-surface -- --json` |
| U-391 | 公开 issue 只评论 `#60`，不关闭、不改 body | https://github.com/emosamastudio/aods/issues/60#issuecomment-4437377073 |

## 行为边界

- 结构化引用必须指向 glossary canonical term id。
- glossary alias 可以帮助人读懂旧叫法，但不能作为机器引用值。
- deprecated term ref 会产生 warning，strict gate 会阻断。
- unresolved term ref 是失败。
- manifest summary 是 bootstrap 摘要，必须与 module content 重新计算结果一致。
- 当前不做 prose semantic scanning，不自动重写旧文档，不抓取外部仓库，不实现 runtime resolver。

## 验证记录

| 命令 | 结果 | 说明 |
|---|---|---|
| `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 通过 | 覆盖 source-first compile、alias machine ref strict fail |
| `node --test ./benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 通过 | 覆盖 compiled-pilot term_ref_summary 与 source-first example |
| `npm run compile:pilot` | 通过 | 生成 compiled-pilot 与 schema mirrors |
| `npm run validate:all` | 通过 | repo-level validation gate |
| `npm run package:check-surface -- --json` | 通过 | package allowlist 无新增入口 |

## 下一步

下一轮默认进入 U-392 到 U-401：evidence freshness schema / validator / fixture、unchecked repo remediation sample、manual-review docs、validator location envelope。
