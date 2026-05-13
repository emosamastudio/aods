# AODS Agent Handoff

日期：2026-05-13
分支：`main`
状态：v0.8 released；static records and release prep complete
历史归档：`docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md`

## 一句话结论

AODS 是独立权威规范路线。v0.8 已发布，当前 open issue 为 `#60/#64`，`#41/#59` 已关闭，无 milestone，latest release 仍为 `v0.8.0`。U-027 到 U-551 已完成；当前任务池为 U-552 到 U-581，下一轮默认执行 U-552 到 U-561，重点是 v0.9 release notes、npm pack dry-run、packed install smoke、GitHub release source install route、release hygiene CI final decision、hosted repeatability owner packet、archive pruning decision、handoff compaction、final go/no-go 和 runtime follow-up issue body draft。`MEMORY.md` 仍是本地未跟踪文件，不进仓库。

## 必读顺序

| 顺序 | 文件 | 用途 |
|---:|---|---|
| 1 | `manifest.json` | 当前 compiled-corpus-first 根入口 |
| 2 | `README.md` | 公开定位、安装和示例入口 |
| 3 | `docs/README.md` | 内部维护文档入口 |
| 4 | `docs/operations/README.md` | 当前 operations 短入口 |
| 5 | `docs/operations/aods-task-ledger.zh-CN.md` | 当前任务权威 |
| 6 | `docs/operations/aods-round-log.zh-CN.md` | 最近回合记录 |
| 7 | `docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md` | 需要历史细节时再读 |

## 当前 Git 状态

| 项 | 状态 |
|---|---|
| 分支 | `main` |
| 最新提交 | 以 `git log -1 --oneline` 为准 |
| 预期 dirty | 仅 `MEMORY.md` 未跟踪 |
| 发布面 | package / README / skill surface 仍为 `0.8.0` / `v0.8.0` |

## 当前完成摘要

| 范围 | 状态 | 说明 |
|---|---|---|
| Structured term refs | 完成 | schema / compile / validate / source-first example / docs 已落地 |
| Evidence freshness | 完成 | freshness schema、warning、sample、location envelope 已落地 |
| Observability | 完成一轮 | route skipped opt-in、validate location sample、#59 sync 已完成 |
| Capability metadata | 完成一轮 | unsupported reason、fallback posture、compatibility gate、example/conformance 已落地 |
| Operations split | 完成 | 旧长入口和完整历史已归档；当前入口变短 |
| Release planning | 已完成候选准备 | v0.9.0 release notes draft、package dry-run、packed install smoke 和 go/no-go 已入账；仍不发布、不打 tag |
| Public close criteria / sync | 已完成 | `#59/#41` 已按 metadata scope 关闭；`#60` 保持 open；runtime/protocol follow-up 已拆到 `#64` |
| Examples / CI / benchmark policy | 已完成 | source-first README 已补 conformance step；package sample 边界已明确；local hygiene CI 和 hosted repeatability 仍不默认启用 |
| Runtime prerequisites / public state | 已完成刷新 | benchmark generated/reports clean；五类 runtime 仍 no-go；公开状态为 `#60/#59/#41` open、latest release `v0.8.0`、无 milestone |
| Public close / release readiness | 已完成 | `#59` metadata/reporting scope close-ready；`#41` metadata-first close-ready but should split runtime first；package dry-run 和 packed install smoke 通过；不发布、不 bump |
| Runtime fixture prerequisites | 已完成设计 | workflow/event/policy/remote/migration 各 2 个任务的负例设计已落地；下一步判断 implementation candidate |
| Runtime fixture implementation candidates | 已完成判断 | remote adapter mismatch、event correction graph、migration dry-run report 是下一步最稳候选；workflow / policy 继续等静态记录形状 |
| Release hygiene / adoption refresh | 已完成 | release hygiene 仍 green；generated/secret/package guards 无漂移；source-first temp-repo smoke route 已记录；README quickstart smoke 通过；中文 README parity 已修复 |
| Final go/no-go / next pool | 已完成 | benchmark summary generated churn 已撤回；hosted repeatability 不进 gate；`#59` close-ready、`#41` 需 runtime follow-up、`#60` 保持 open；v0.9 仍 no-go；U-532 到 U-581 已排队 |
| Public split / focused regressions | 已完成 | `#59/#41` 已关闭、`#64` 已创建、`#60` 已评论；remote adapter mismatch 和 event correction graph 静态回归已落地；仍不实现 adapter runtime 或 event store |
| Static records / release prep | 已完成 | event correction package boundary、migration dry-run benchmark-only helper、workflow / policy static record shape、focused regression conformance promotion gate 和 v0.9 version bump plan 已落地；仍不 bump、不发布 |

## 当前风险

| 风险 | 当前处理 |
|---|---|
| `MEMORY.md` 误入仓库 | stage 前必须排除；当前保持 untracked |
| README benchmark 手改 | benchmark sync 区块必须改 generator |
| capability 过度承诺 | 当前只做 metadata；runtime negotiation / provider discovery / fallback ranking 仍 deferred |
| public issue 提前关闭 | `#59/#41` 已按范围关闭；`#60/#64` 保持 open；后续关闭必须继续按台账 packet 执行 |
| release version surface 漂移 | 下一 release 必须在同一 version-bump commit 中同步 package / README / skill；当前仍为 v0.8.0 |
| migration dry-run 过度承诺 | 目前只在 benchmark helper / fixture 中记录静态报告；不提供 migrate command、不连接数据库、不进 package adoption surface |
| operations 历史丢失 | 完整旧 README / task ledger / handoff 已在 `docs/operations/archive/` |

## 下一轮建议

| 顺序 | 任务 | 目标 |
|---:|---|---|
| 1 | U-552 到 U-555 | v0.9 release notes body、npm pack dry-run、packed install smoke、GitHub release source install route |
| 2 | U-556 到 U-560 | release hygiene CI final decision、hosted repeatability owner packet、archive pruning decision、handoff compaction、final go/no-go |
| 3 | U-561 到 U-581 | runtime follow-up issue body、post-regression audits、release execution 和 post-release closeout |
