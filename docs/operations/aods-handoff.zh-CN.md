# AODS Agent Handoff

日期：2026-05-13
分支：`main`
状态：release maintenance planned
历史归档：`docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md`

## 一句话结论

AODS 是独立权威规范路线。v0.9 已发布，GitHub Release `v0.9.0` 已创建，tag source install smoke 已通过。当前 open issue 为 `#60/#64`，`#41/#59` 已关闭，无 milestone。U-027 到 U-671 已完成；v0.9.1 可作为 maintenance patch candidate 但本轮未 bump/tag/release，v0.10 尚未触发，npm publish / CI enablement / hosted repeatability / branch cleanup 均保持 owner gate。当前任务池为 U-672 到 U-681，下一轮默认执行全部剩余任务，重点是 projection guidance static invariant、example candidates、package promotion no-go、route/query regression、install smoke automation、retrospective 和 milestone/no-milestone final decision。

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
| 发布面 | package / README / skill surface 已为 `0.9.0` / `v0.9.0`；GitHub Release `v0.9.0` 已 published |

## 当前完成摘要

| 范围 | 状态 | 说明 |
|---|---|---|
| U-027 到 U-431 | 已完成 | authority / exposure / redaction / topology / evidence / observability / capability metadata / operations split / release planning 的基础面已落地。历史细节见 operations archive 和专题记录。 |
| U-432 到 U-581 | 已完成 | v0.9 release candidate、public close/split、focused regressions、version bump、GitHub Release `v0.9.0`、source install smoke 和 post-release sync 已完成。 |
| U-582 到 U-621 | 已完成 | `#60/#64` runtime/protocol 前置、release/adoption evidence、code drift review、static records follow-up、benchmark version refresh 和 fresh adoption smoke 已完成。 |
| U-622 到 U-641 | 已完成 | adoption closeout、quickstart / troubleshooting 短页、compiled-corpus package sample、CLI version ergonomics 和 owner gates 已完成。 |
| U-642 到 U-651 | 已完成 | provider discovery、auth boundary、probing posture、provider selection、fallback policy 和 adapter handshake 的静态记录 proposal 已完成；schema / validator / package promotion / runtime 均未推进。 |
| U-652 到 U-661 | 已完成 | round log 已归档拆分；handoff 已压缩；local MEMORY 已压缩但不进仓库；`#60` body 已刷新；`#64` labels/body 暂不改。 |
| U-662 到 U-671 | 已完成 | v0.9.1 patch gate、v0.10 trigger、release notes skeleton、package inventory baseline、branch cleanup packet、npm / CI / hosted owner gates 已完成；未发布。 |

## 当前风险

| 风险 | 当前处理 |
|---|---|
| `MEMORY.md` 误入仓库 | stage 前必须排除；当前保持 untracked |
| README benchmark 手改 | benchmark sync 区块必须改 generator |
| capability 过度承诺 | 当前只做 metadata；runtime negotiation / provider discovery / fallback ranking 仍 deferred |
| public issue 提前关闭 | `#59/#41` 已按范围关闭；`#60/#64` 保持 open；后续关闭必须继续按台账 packet 执行 |
| release version surface 漂移 | package / README / skill / GitHub Release 均为 v0.9；后续要避免 README 提前指向未发布版本 |
| migration dry-run 过度承诺 | 目前只在 benchmark helper / fixture 中记录静态报告；不提供 migrate command、不连接数据库、不进 package adoption surface |
| operations 历史丢失 | 完整旧 README / task ledger / handoff 已在 `docs/operations/archive/` |

## 下一轮建议

| 顺序 | 任务 | 目标 |
|---:|---|---|
| 1 | U-672 到 U-676 | 做 projection guidance invariant、provider discovery example candidate、policy / workflow source-first candidates 和 migration package promotion no-go |
| 2 | U-677 到 U-679 | 做 route query failure regression plan、validate location compatibility regression 和 package install smoke automation script decision |
| 3 | U-680 到 U-681 | 做 final post-v0.9 retrospective packet 和 next milestone / no-milestone final decision |
