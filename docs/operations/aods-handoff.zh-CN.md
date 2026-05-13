# AODS Agent Handoff

日期：2026-05-13
分支：`main`
状态：v0.8 released；public close release readiness complete
历史归档：`docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md`

## 一句话结论

AODS 是独立权威规范路线。v0.8 已发布，当前 open issue 为 `#60/#59/#41`。U-027 到 U-491 已完成；当前任务池剩余 U-492 到 U-531，下一轮默认执行 U-492 到 U-501，重点是 workflow/event/policy/remote/migration runtime prerequisite fixture design。`MEMORY.md` 仍是本地未跟踪文件，不进仓库。

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
| Public close criteria / sync | 已完成 | `#41/#59/#60` 均保持 open；已评论同步边界和状态，不关闭、不编辑 body |
| Examples / CI / benchmark policy | 已完成 | source-first README 已补 conformance step；package sample 边界已明确；local hygiene CI 和 hosted repeatability 仍不默认启用 |
| Runtime prerequisites / public state | 已完成刷新 | benchmark generated/reports clean；五类 runtime 仍 no-go；公开状态为 `#60/#59/#41` open、latest release `v0.8.0`、无 milestone |
| Public close / release readiness | 已完成 | `#59` metadata/reporting scope close-ready；`#41` metadata-first close-ready but should split runtime first；package dry-run 和 packed install smoke 通过；不发布、不 bump |

## 当前风险

| 风险 | 当前处理 |
|---|---|
| `MEMORY.md` 误入仓库 | stage 前必须排除；当前保持 untracked |
| README benchmark 手改 | benchmark sync 区块必须改 generator |
| capability 过度承诺 | 当前只做 metadata；runtime negotiation / provider discovery / fallback ranking 仍 deferred |
| public issue 提前关闭 | `#60/#59/#41` 保持 open；按 packet 先同步公开边界，不直接关闭 |
| release version surface 漂移 | 下一 release 必须在同一 version-bump commit 中同步 package / README / skill；当前仍为 v0.8.0 |
| operations 历史丢失 | 完整旧 README / task ledger / handoff 已在 `docs/operations/archive/` |

## 下一轮建议

| 顺序 | 任务 | 目标 |
|---:|---|---|
| 1 | U-492 到 U-493 | workflow lifecycle / receipt fixture design |
| 2 | U-494 到 U-495 | event duplicate / correction fixture design |
| 3 | U-496 到 U-497 | policy decision / approval audit fixture design |
| 4 | U-498 到 U-499 | remote exposure / adapter mismatch fixture design |
| 5 | U-500 到 U-501 | migration dry-run / destructive approval fixture design |
