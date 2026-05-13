# AODS evidence freshness and location implementation

日期：2026-05-13
范围：U-392 到 U-401
状态：已完成

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `08d8a56 Implement structured term refs` |
| Task ledger | 通过 | U-392 到 U-401 是当前默认下一轮任务 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## 本轮完成

| 任务 | 结果 | 证据 |
|---|---|---|
| U-392 | implementation evidence 可声明 `reviewed_at`、`expires_at`、`refresh_cadence` | `schema/module.schema.json` |
| U-393 | validator 对 time-bound 缺复审日期和过期证据发 deterministic warning | `lib/validate.mjs`、focused regression |
| U-394 | fresh / expired / missing-review fixture 进入 scaffold regression | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` |
| U-395 | README 说明 evidence freshness 是声明式，不执行刷新命令 | `README.md`、`README.zh-CN.md` |
| U-396 | unchecked repo JSON 增加 `reason_code` 和 `remediation_hint` | `lib/validate.mjs` |
| U-397 | 保存 unchecked repo JSON 样例 | `docs/examples/unchecked-repo-reality.sample.json` |
| U-398 | manual-review acceptance criteria guidance 进入公开 README | `README.md`、`README.zh-CN.md` |
| U-399 | criteria 与 evidence freshness cross-check 设计为非执行检查 | 本文件“行为边界” |
| U-400 | public issue `#60` 同步本轮状态 | https://github.com/emosamastudio/aods/issues/60#issuecomment-4437453826 |
| U-401 | validate JSON issue 增加统一 `location` envelope | `lib/validate.mjs`、focused regression |

## 行为边界

- `reviewed_at`、`expires_at`、`refresh_cadence` 是声明式元数据。
- validator 不执行 `command`，也不自动刷新证据。
- `freshness_policy=time-bound` 且缺少 `reviewed_at` 或 `expires_at` 时发 warning。
- `expires_at` 早于当前 UTC 日期时发 warning；strict gate 会阻断 warning。
- manual-review criteria 仍是人工复审债务，不被当作自动证明。
- criteria 与 evidence freshness 的交叉检查保持非执行：criteria 可以引用 evidence id，validator 只检查引用和 freshness posture，不运行测试、不调用 CI、不访问远端仓库。
- unchecked repo 不是通过证明，也不是失败证明；它只说明当前本地 reality gate 没有足够上下文检查该 repo。

## 验证记录

| 命令 | 结果 | 说明 |
|---|---|---|
| `node --test ./benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 通过 | 覆盖 evidence freshness warning、issue location、unchecked repo reason code |
| `npm run compile:pilot` | 通过 | source-first example 重新生成 |
| `node -e "JSON.parse(...unchecked-repo-reality.sample.json...)"` | 通过 | public sample JSON 可解析 |

## 下一步

下一轮默认进入 U-402 到 U-411：validator location text parity、suggested-action next rule batch、validate sample refresh、route skipped-module opt-in、observability public sync、capability unsupported / fallback schema。
