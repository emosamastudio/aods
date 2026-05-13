# AODS capability sample maintenance

日期：2026-05-13
范围：U-412 到 U-421
状态：已完成

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `e04e47b Implement observability capability diagnostics` |
| Task ledger | 通过 | 当前默认任务为 U-412 到 U-421 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## 本轮完成

| 任务 | 结果 | 证据 |
|---|---|---|
| U-412 | 增加 capability fallback conformance slice | `examples/compiled-pilot-source/fixtures/conformance-manifest.json` |
| U-413 | 刷新 adapter/capability example pack | `examples/compiled-pilot-source/authoring.json`、compiled output |
| U-414 | README guidance 强调 metadata-only fallback | `README.md`、`README.zh-CN.md` |
| U-415 | 同步 `#41` 公开状态 | https://github.com/emosamastudio/aods/issues/41#issuecomment-4437606295 |
| U-416 | sample package promotion decision | `docs/examples/README.md`、package surface check |
| U-417 | public sample JSON generation policy | `docs/examples/README.md` |
| U-418 | docs example link checker coverage | `docs/examples/README.md` 链接到每个 JSON sample |
| U-419 | security placeholder fixture hardening decision | secret-like scan 0 hits；不新增低价值 placeholder fixture |
| U-420 | package surface allowlist maintenance docs refresh | package surface 仍只包含 packaged compiled pilot / fixtures |
| U-421 | benchmark generated archive split decision | generated clean gate 继续覆盖；本轮不拆 archive/index |

## 样例策略

| 样例类型 | 当前策略 | 原因 |
|---|---|---|
| `examples/compiled-pilot-source/fixtures/*` | 随包发布 | 这是可执行 adoption / conformance surface |
| `examples/compiled-pilot/*` | 随包发布 | 这是已编译示例 corpus |
| `docs/examples/*.sample.json` | 不随包发布 | 这是公开文档和 issue 的 hand-curated snippet，不是 golden output |
| `benchmarks/aods-eval-lab/generated/*` | 不拆 archive/index | 当前 generated clean gate 已能约束预期生成物；拆分会制造低价值 churn |

## 边界

- capability fallback 仍是声明式元数据，不执行 provider discovery、auth exchange、fallback ranking、dynamic probing 或 adapter calls。
- public sample JSON 继续 hand-curated；如果未来要生成，必须先新增生成器和 golden review gate。
- security placeholder scan 当前 0 hits；没有足够信号新增 placeholder fixture，避免制造误报维护成本。

## 验证

| 命令 | 结果 |
|---|---|
| `node --test ./benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 通过 |
| `node --test ./benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 通过 |
| `npm run docs:check-links -- --json` | 通过，`docs/examples` JSON links 已覆盖 |
| `npm run compile:pilot` | 通过 |

## 下一步

下一轮默认选择 U-422 到 U-431：operations index split、task ledger archive split、handoff pruning、split 后 link check，以及 v0.9 / v0.8.1 / roadmap / milestone / task pool planning。
