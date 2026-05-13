# AODS Route / Validate Regression Hardening

日期：2026-05-13
回合：R-2026-05-13-53
范围：U-702 到 U-711

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `91f4f90 Integrate package install smoke into release hygiene` |
| 台账指针 | 通过 | 当前默认任务为 U-702 到 U-711 |
| 返工需要 | 无 | 上轮 release gate integration 成果可继续承接 |

## U-702 route adoption query miss regression implementation

Implemented：新增 `benchmarks/aods-eval-lab/test/route-validate-regression.test.mjs`。

回归名：`route keeps adoption-style queries on query-route with skipped diagnostics`

覆盖内容：

| Assertion | Purpose |
|---|---|
| `strategy=query-route` | 防止采用式查询退回默认 boot |
| `fallback=false` | 明确不是 fallback route |
| selected modules non-empty | 防止 query miss |
| matched query modules non-empty | 证明命中来自 query anchors |
| skipped modules present with `--explain-skipped` | 保留未加载解释 |

Boundary：当前 route 只索引 AODS corpus semantic modules，不索引普通 operations / adoption docs。因此本轮不把 adoption docs 强行塞进 route index。

## U-703 route overread regression implementation

Implemented：同一测试文件新增窄查询 overread 回归。

回归名：`route narrow runtime protocol query does not overread the full corpus`

覆盖内容：

| Assertion | Purpose |
|---|---|
| selected modules non-empty | 窄查询仍能命中 |
| selected modules < full corpus | 防止全量加载 |
| skipped modules non-empty | 未选模块保持显式可解释 |
| protocol-related module selected or explicitly skipped | 不吞掉 runtime/protocol 相关上下文 |

Decision：不改变 route ranking。本轮只把现有期望固化为测试。

## U-704 validate location envelope regression implementation

Implemented：同一测试文件新增 validate issue location 回归。

方法：

1. 复制 `examples/compiled-pilot` 到临时目录；
2. 移除 capability compatibility partial row 的 fallback metadata；
3. 执行 `validate --strict --json`，预期退出码为 1；
4. 检查 `capability-fallback-metadata-required` issue 的 location / remediation shape。

断言：

| Field | Expected |
|---|---|
| `module_id` | `shift-ops-adapter-capability` |
| `location.module_id` | same module id |
| `location.sid` | key remains present, may be null |
| `location.path` | key remains present, may be null |
| `location.evidence_id` | may be null but key compatibility is reviewed |
| `remediation.action` | `add-capability-fallback-metadata` |
| `remediation.gate` | `drift-blocking` |

## U-705 remediation guidance compatibility audit

Decision：兼容性通过。

本轮没有改 remediation schema，只新增回归锁定已有结构。当前 JSON consumer 仍可读取：

| Field | Compatibility |
|---|---|
| `issue.remediation.action` | stable string |
| `issue.remediation.gate` | stable string |
| `issue.remediation.guidance` | human guidance string |
| `issue.location` | object remains present |

No schema break detected.

## U-706 docs sample refresh after route regression

Decision：不刷新 `docs/examples/*.sample.json`。

原因：

1. route JSON shape 未改变；
2. validate JSON issue shape 未改变；
3. 本轮只是新增 regression tests 和 top-level help parity；
4. hand-curated public snippets无需为相同 shape 重新生成。

## U-707 CLI help install smoke docs parity

Implemented：顶层 CLI help 的 route usage 现在包含 `--explain-skipped`，与 `aods route --help` 和 README 描述保持一致。

新增测试：`top-level help documents route skipped-module diagnostics flag`

同时复核：

| Surface | Result |
|---|---|
| `node ./bin/aods.mjs --help` | includes route `--explain-skipped` and `aods --version` |
| `node ./bin/aods.mjs --version` | `0.9.0` |
| `npm run package:install-smoke -- --json` | package install / help / validate / route pass |

## U-708 strict warning troubleshooting sample update

Decision：不新增 strict warning sample。

原因：

1. 当前本轮没有新增 warning shape；
2. `docs/examples/validate-issue-location.sample.json` 已覆盖 issue location；
3. troubleshooting 样例若现在扩写，会重复现有 validate JSON 说明。

后续触发条件：新增 warning rule 或 strict 行为变化时再刷新。

## U-709 package surface allowlist update for new script decision

Decision：无需更新 package surface allowlist。

原因：

1. 新增回归测试不属于 npm package files；
2. `scripts/release-hygiene.mjs` 已在仓库脚本面，但 scripts 目录不进入 npm package；
3. package entry count 仍为 61。

验证：`npm run package:check-surface -- --json`

## U-710 generated hygiene after package smoke script

Decision：通过。

本轮复核点：

| Check | Result |
|---|---|
| `package:install-smoke` removes tarball | pass |
| temp install dir cleaned unless `--keep-temp` | pass |
| `release:hygiene` after install smoke | pass |
| generated clean | pass |

## U-711 conformance report sample no-refresh revisit

Decision：不刷新 `docs/operations/aods-conformance-report-sample.json`。

原因：

1. conformance runner output 未改变；
2. 新增 route / validate regression test 不改变 conformance report schema；
3. release hygiene 增加 package install smoke，但不改变 conformance report。

## 本轮验证

| 验证项 | 命令或方式 | 结果 |
|---|---|---|
| Focused regression | `node --test benchmarks/aods-eval-lab/test/route-validate-regression.test.mjs` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 通过 |
| Package surface | `npm run package:check-surface -- --json` | 通过 |
| Package install smoke | `npm run package:install-smoke -- --json` | 通过 |
| Release hygiene | `npm run release:hygiene` | 通过 |

## 后续建议

下一轮默认 U-712 到 U-721：knowledge base write decision、installed skill sync decision、operations topic table / task ledger / handoff / round log hygiene、AGENTS proxy parity、public issue `#60/#64` sync decisions 和 milestone no-go revisit。
