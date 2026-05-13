# AODS operations 入口

状态：当前入口
更新时间：2026-05-13
历史归档：`archive/aods-operations-readme-archive-2026-05-13.zh-CN.md`

## 当前必读

| 顺序 | 文件 | 用途 |
|---:|---|---|
| 1 | [aods-task-ledger.zh-CN.md](./aods-task-ledger.zh-CN.md) | 当前任务权威、下一轮任务池和最近完成项 |
| 2 | [aods-handoff.zh-CN.md](./aods-handoff.zh-CN.md) | 当前状态、风险、下一步 |
| 3 | [aods-round-log.zh-CN.md](./aods-round-log.zh-CN.md) | 最近回合记录；完整历史仍在本文件内 |
| 4 | [aods-progress-ledger.zh-CN.md](./aods-progress-ledger.zh-CN.md) | 阶段进度口径 |
| 5 | [aods-work-rules.zh-CN.md](./aods-work-rules.zh-CN.md) | 项目专属工作规约 |

## 当前专题记录

| 文件 | 说明 |
|---|---|
| [aods-structured-term-refs-implementation.zh-CN.md](./aods-structured-term-refs-implementation.zh-CN.md) | U-382 到 U-391 structured term refs implementation |
| [aods-evidence-freshness-and-location-implementation.zh-CN.md](./aods-evidence-freshness-and-location-implementation.zh-CN.md) | U-392 到 U-401 evidence freshness / validator location implementation |
| [aods-observability-capability-implementation.zh-CN.md](./aods-observability-capability-implementation.zh-CN.md) | U-402 到 U-411 observability / capability implementation |
| [aods-capability-sample-maintenance.zh-CN.md](./aods-capability-sample-maintenance.zh-CN.md) | U-412 到 U-421 capability / sample maintenance |
| [aods-operations-split-release-planning.zh-CN.md](./aods-operations-split-release-planning.zh-CN.md) | U-422 到 U-431 operations split / release planning |
| [aods-v0.9-release-candidate-prep.zh-CN.md](./aods-v0.9-release-candidate-prep.zh-CN.md) | U-432 到 U-441 v0.9 release candidate preparation |
| [aods-public-close-criteria-roadmap-sync.zh-CN.md](./aods-public-close-criteria-roadmap-sync.zh-CN.md) | U-442 到 U-451 public close criteria / roadmap sync packet |
| [aods-public-sync-authority-drift-maintenance.zh-CN.md](./aods-public-sync-authority-drift-maintenance.zh-CN.md) | U-452 到 U-461 public sync / authority drift maintenance |
| [aods-examples-ci-benchmark-policy.zh-CN.md](./aods-examples-ci-benchmark-policy.zh-CN.md) | U-462 到 U-471 examples / CI / benchmark policy |
| [aods-runtime-prereq-public-state-retro.zh-CN.md](./aods-runtime-prereq-public-state-retro.zh-CN.md) | U-472 到 U-481 runtime prerequisites / public state / retrospective |
| [aods-public-close-release-readiness.zh-CN.md](./aods-public-close-release-readiness.zh-CN.md) | U-482 到 U-491 public close / release readiness |
| [aods-runtime-fixture-prerequisite-design.zh-CN.md](./aods-runtime-fixture-prerequisite-design.zh-CN.md) | U-492 到 U-501 runtime fixture prerequisite design |
| [aods-runtime-fixture-implementation-candidates.zh-CN.md](./aods-runtime-fixture-implementation-candidates.zh-CN.md) | U-502 到 U-511 runtime fixture implementation candidates |
| [aods-release-hygiene-adoption-refresh.zh-CN.md](./aods-release-hygiene-adoption-refresh.zh-CN.md) | U-512 到 U-521 release hygiene / adoption / docs parity refresh |
| [aods-final-go-no-go-and-next-pool.zh-CN.md](./aods-final-go-no-go-and-next-pool.zh-CN.md) | U-522 到 U-531 final go/no-go / public split / next task pool |
| [aods-public-split-focused-regressions.zh-CN.md](./aods-public-split-focused-regressions.zh-CN.md) | U-532 到 U-541 public split execution / focused regressions |
| [aods-static-records-release-prep.zh-CN.md](./aods-static-records-release-prep.zh-CN.md) | U-542 到 U-551 static records / release prep |
| [aods-release-execution-prep-final.zh-CN.md](./aods-release-execution-prep-final.zh-CN.md) | U-552 到 U-561 release execution prep final |
| [aods-post-regression-audits-version-bump.zh-CN.md](./aods-post-regression-audits-version-bump.zh-CN.md) | U-562 到 U-571 post-regression audits / v0.9 version bump |
| [aods-v0.9-release-closeout.zh-CN.md](./aods-v0.9-release-closeout.zh-CN.md) | U-572 到 U-581 v0.9 release closeout / next task discovery |

## 当前公开示例入口

| 示例面 | 入口 | 说明 |
|---|---|---|
| Source-first pilot | [examples/compiled-pilot-source/authoring.json](../../examples/compiled-pilot-source/authoring.json) | 当前示例源权威；语义改动先改这里再编译。 |
| Compiled pilot | [examples/compiled-pilot/](../../examples/compiled-pilot/) | 编译后的 agent / human 双 surface 示例输出。 |
| Fixture smoke | [examples/compiled-pilot-source/fixtures/fixture-manifest.json](../../examples/compiled-pilot-source/fixtures/fixture-manifest.json) | 供 `npm run fixture:smoke` 检查声明和 golden path。 |
| Conformance suite | [examples/compiled-pilot-source/fixtures/conformance-manifest.json](../../examples/compiled-pilot-source/fixtures/conformance-manifest.json) | 只读 conformance runner 输入。 |
| Public sample snippets | [docs/examples/](../examples/) | 短 `validate --json` / `route --json` 样例；当前不进 npm package。 |

## 历史归档

| 文件 | 内容 |
|---|---|
| [archive/aods-operations-readme-archive-2026-05-13.zh-CN.md](./archive/aods-operations-readme-archive-2026-05-13.zh-CN.md) | 拆分前完整 operations README |
| [archive/aods-task-ledger-archive-2026-05-13.zh-CN.md](./archive/aods-task-ledger-archive-2026-05-13.zh-CN.md) | 拆分前完整任务台账 |
| [archive/aods-handoff-archive-2026-05-13.zh-CN.md](./archive/aods-handoff-archive-2026-05-13.zh-CN.md) | 拆分前完整 handoff |

## 维护边界

1. 公开 README 的 benchmark sync 区块来自 `benchmarks/aods-eval-lab/src/summary.mjs`。
2. 语义改动后先跑最小正确验证，再跑 `npm run validate:all`；发布前跑 `npm run release:hygiene`。
3. `MEMORY.md` 是本地记忆文件，必须保持不进仓库。
4. GitHub 公开动作已授权，但每次仍要记录链接和意图；默认不提前关闭 issue。
5. runtime negotiation、provider discovery、fallback ranking、adapter execution 仍是 deferred，不因 capability metadata 示例或 focused regression 自动实现。
