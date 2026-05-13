# AODS public split / focused regressions

状态：当前专题记录
更新时间：2026-05-13

## 范围

| 项 | 内容 |
|---|---|
| 任务范围 | U-532 到 U-541 |
| 回合 | R-2026-05-13-36 |
| 目标 | 完成公开事项收口与 runtime/protocol 拆分，并落地两组低风险 focused regressions |
| 非目标 | 不发布、不 bump version、不打 tag、不创建 GitHub Release、不发布 package、不实现 adapter runtime、不实现 event store / replay、不创建 milestone |

## 上轮质量审查

| 检查 | 结论 | 证据 |
|---|---|---|
| 上轮提交 | 通过 | 最新提交 `d7bf0ec Document final go no-go task pool` |
| 工作树 | 通过 | 开工前仅 `MEMORY.md` 未跟踪 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入 U-532 到 U-541 |

## 公开事项执行

| 任务 | 结果 | 证据 | 说明 |
|---|---|---|---|
| U-532 `#59` close | 已完成 | `gh issue close 59` | metadata/reporting 范围已收口；telemetry store、dashboard、trace backend、graph database、route ranking rewrite 仍非目标 |
| U-533 runtime/protocol follow-up | 已完成 | `#64` created | 将 provider discovery、auth exchange、dynamic probing、fallback ranking、adapter call handshake 等后续范围单独跟踪 |
| U-534 `#41` close | 已完成 | `gh issue close 41` | metadata-first capability 范围已收口；runtime/protocol 后续已拆到 `#64` |
| U-535 `#60` roadmap comment | 已完成 | `https://github.com/emosamastudio/aods/issues/60#issuecomment-4438866046` | 公开说明 `#41/#59/#64` 状态和下一步 focused regression / release no-go |
| U-536 milestone decision | 已完成 | GitHub milestones API 返回 `[]` | 本轮不创建 milestone；version bump / release execution 前再决策 |

## Focused regressions

| 任务 | 结果 | 文件 | 验收 |
|---|---|---|---|
| U-537 remote adapter mismatch plan | 已完成 | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 复用 capability compatibility matrix；新增 provider capability 与 required capability 不一致的负例 |
| U-538 remote adapter mismatch implementation | 已完成 | `lib/validate.mjs`、`benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`examples/compiled-pilot-source/authoring.json` | `provider-capability-mismatch` 行若错误标为 compatible，会触发 `capability-compatibility-mismatch` |
| U-539 remote adapter mismatch docs sync | 已完成 | `examples/compiled-pilot-source/README.md`、`examples/compiled-pilot/README.md` | 明确示例只验证 metadata，不执行 adapter 或 remote gateway |
| U-540 event correction shape decision | 已完成 | `spec/validation-rules.json`、`examples/compiled-pilot-source/authoring.json` | 采用 `event_id` / `correction_of` / `supersedes` 的静态 mapping-table；不引入 event store / replay |
| U-541 event correction implementation | 已完成 | `lib/validate.mjs`、`benchmarks/aods-eval-lab/test/scaffold.test.mjs`、`benchmarks/aods-eval-lab/test/example-packs.test.mjs` | missing correction target 和 supersession cycle 都有负例覆盖 |

## 验证记录

| 验证项 | 命令 | 结果 |
|---|---|---|
| Source-first compile | `npm run compile:pilot` | 通过 |
| Focused tests | `node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 通过 |
| Final gate | `npm run release:hygiene` | pre-commit 因预期 generated dirty 暂不通过；提交后复跑 |

## 边界

本轮新增的是静态检查和示例负例，不改变 release version，也不进入 runtime execution。能力匹配仍只比较声明的 metadata；事件修正关系只验证同一表内目标存在和替代链不成环，不读取事件存储、不重放历史、不选择当前事实。
