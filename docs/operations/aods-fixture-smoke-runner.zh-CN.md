# AODS fixture smoke runner

状态：U-080 已完成
日期：2026-05-08
适用范围：fixture / golden export manifest 的最小冒烟检查

## 结论

`aods fixture smoke <fixture-manifest> [--json]` 已成为 fixture / golden export 约定的最小机器门禁。它读取 fixture manifest，检查 manifest version、convention、expected outcome 字段和声明的 input / golden path 是否存在。

该命令不执行 `golden_exports[].update_command`，不自动更新 golden output，不做跨仓库抓取，也不判断完整 conformance。

## 命令契约

| 项 | 内容 |
|---|---|
| 命令 | `node ./bin/aods.mjs fixture smoke ./examples/compiled-pilot-source/fixtures/fixture-manifest.json` |
| npm script | `npm run fixture:smoke` |
| JSON | 加 `--json` 输出机器可读报告 |
| 成功条件 | 无 smoke issues |
| 失败条件 | manifest version / convention / expected_status / expected_rules / input path / golden path 任一检查失败 |

## JSON 报告

| 字段 | 含义 |
|---|---|
| `action` | 固定为 `fixture smoke` |
| `status` | `pass` 或 `fail` |
| `accepted` | 无 issues 时为 `true` |
| `manifest.path` | 解析后的 fixture manifest 绝对路径 |
| `summary.fixtures` | 被检查 fixture 数量 |
| `summary.expected_status` | `pass/fail/warn/invalid` 计数 |
| `summary.golden_exports` | 被检查 golden export 引用数量 |
| `issues[].rule` | 失败规则，如 `fixture-expected-status`、`fixture-expected-rules`、`fixture-golden-path` |

## 非目标

1. 不执行任意 update command。
2. 不自动接受或更新 golden exports。
3. 不把 fixture manifest 扩成完整 conformance runner。
4. 不做 remote fetch、cross-repo clone、LLM judge 或行为 oracle。

## 验证

| 验证项 | 命令 | 结果 |
|---|---|---|
| RED regression | `node --test ./benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 初次失败于 `Unknown command: fixture` |
| GREEN focused regression | `node --test ./benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 3/3 pass |
| CLI smoke JSON | `node ./bin/aods.mjs fixture smoke ./examples/compiled-pilot-source/fixtures/fixture-manifest.json --json` | 输出 pass report |

## 后续

U-081 可继续补 source-first adoption guide，把 authoring source、compile、validate、route、fixture smoke 串成公开可读的最小采用路径。完整 conformance runner、自动 golden update 和跨仓库 fixture 迁移仍需单独任务。
