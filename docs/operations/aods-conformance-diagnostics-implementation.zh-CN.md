# AODS conformance / diagnostics implementation

状态：U-221 到 U-230 已完成
日期：2026-05-13
范围：conformance manifest/report schema、只读 runner、第二批 negative fixtures、validator dependency diagnostics、docs parity 和 no-fetch/no-telemetry posture

## 结论

本轮把 U-173/U-174 的 conformance proposal 推进到可运行的一阶实现：

| 任务 | 结果 | 验收证据 |
|---|---|---|
| U-221 | `schema/conformance-manifest.schema.json` 落地 | schema checked in；example suite 使用 `aods_conformance_manifest_v=0` |
| U-222 | `schema/conformance-report.schema.json` 落地 | runner JSON report 与 schema 字段一致 |
| U-223 | `aods conformance run` 只读 MVP 落地 | `npm run conformance:compiled-pilot -- --json` pass |
| U-224 | 第二批 negative fixture 落地 | 新增 `fixture-kind`、`fixture-input-path` 负例 |
| U-225 | validator dependency diagnostics first slice 落地 | missing dependency issue 带 `dependency_id` / `available_module_ids_sample`；cycle issue 带 `cycle_path` / `cycle_length` |
| U-226 | route dependency docs parity 已复审 | `aods-route-json-explanation` 与当前 route JSON 字段一致 |
| U-227 | dependency graph cycle fixture design 已固化 | focused regression 构造 two-node cycle；不执行 graph runtime |
| U-228 | adapter negotiation example fixture posture 明确 | 本轮不新增 handshake fixture；保留 metadata-only negotiation，等待 runner 扩展 case kind |
| U-229 | cross-corpus resolver no-fetch fixture posture 明确 | conformance case 只读 repo-local path；不 remote fetch |
| U-230 | observability report store no-go refresh | conformance report 输出到 stdout；不建 telemetry store / dashboard |

## Runner boundary

`aods conformance run <conformance-manifest> [--json]` 当前只支持两类 case：

| kind | 行为 | 非目标 |
|---|---|---|
| `fixture-smoke` | 调用内部 fixture smoke，检查 manifest contract 和本地路径 | 不执行 update command |
| `validate` | 调用内部 validate，按 `strict` / `reality` 计算 pass/fail | 不执行任意 shell 命令、不抓远端 |

runner 不接受 arbitrary command case，不读取网络，不写入报告文件，不自动接受 golden diff。

## Example suite

示例 suite 位于：

`examples/compiled-pilot-source/fixtures/conformance-manifest.json`

当前包含 4 个 case：

1. 主 fixture manifest smoke，应 pass。
2. `fixture-kind` 负例，应 fail 且命中预期 rule。
3. `fixture-input-path` 负例，应 fail 且命中预期 rule。
4. compiled pilot strict reality validation，应 pass。

## Validation snapshot

| 命令 | 结果 |
|---|---|
| `node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 8/8 pass |
| `node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs --test-name-pattern "dependency target\\|CLI help"` | focused pass |
| `npm run conformance:compiled-pilot -- --json` | pass；4 cases、2 expected failures |
| `npm run package:check-surface` | pass；61 package entries |

## Residual boundaries

1. Conformance schema remains v0; it is a local contract, not a public compatibility promise.
2. Adapter negotiation and cross-corpus resolver remain metadata/no-fetch posture; no handshake or remote resolver was implemented.
3. No telemetry store, dashboard, or report database was added.
4. Conformance proves declared cases match tool output; it does not prove business semantics or external implementation correctness.
