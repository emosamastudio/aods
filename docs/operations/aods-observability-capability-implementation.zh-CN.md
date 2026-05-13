# AODS observability / capability implementation

日期：2026-05-13
范围：U-402 到 U-411
状态：已完成

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 上轮提交为 evidence freshness / validator location implementation |
| Task ledger | 通过 | 当前默认任务为 U-402 到 U-411 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮实现 |

## 本轮完成

| 任务 | 结果 | 证据 |
|---|---|---|
| U-402 | 复审 validate text / JSON 信息边界，保持 text compact | `lib/validate.mjs`、focused regression |
| U-403 | 为 capability unsupported / fallback rules 增补 remediation guidance | `lib/validate.mjs` |
| U-404 | 新增 validate issue location 最小 JSON 样例 | `docs/examples/validate-issue-location.sample.json` |
| U-405 | 新增 route skipped-module opt-in 设计 | `lib/route.mjs`、README |
| U-406 | 增加 skipped-module 默认紧凑 / opt-in 展开回归 | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` |
| U-407 | 刷新 observability compact samples 索引和 route skipped sample | `docs/examples/README.md`、`docs/examples/route-skipped-modules.sample.json` |
| U-408 | 同步 `#59` 公开状态 | https://github.com/emosamastudio/aods/issues/59#issuecomment-4437540362 |
| U-409 | capability metadata 支持 unsupported reason | `schema/module.schema.json` |
| U-410 | capability metadata 支持 fallback posture / degraded behavior / consumer action | `schema/module.schema.json` |
| U-411 | capability compatibility matrix 对 partial / unknown 行增加 fallback metadata gate | `lib/validate.mjs`、focused regression |

## 边界

- `--explain-skipped` 是 opt-in；默认 route JSON / text 不携带 skipped modules，避免默认输出膨胀。
- capability metadata 仍是声明式；不做 provider discovery、fallback ranking、auth exchange、dynamic probing 或 adapter execution。
- compatibility matrix 的 partial / unknown 只要求声明 fallback / consumer posture，不证明外部能力真实可用。

## 验证

| 命令 | 结果 |
|---|---|
| `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 通过 |
| `npm run compile:pilot` | 通过 |
| `node --test ./benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 通过 |
| docs examples JSON parse | 通过 |
| route `--explain-skipped --json` smoke | 通过 |
| `npm run validate:all` | 通过 |
| `npm run package:check-surface -- --json` | 通过 |

## 下一步

下一轮默认选择 U-412 到 U-421：capability conformance fixture、capability example pack、README guidance、`#41` public sync，以及 sample package / docs examples / package allowlist / benchmark archive decision。
