# AODS Agent Handoff

日期：2026-05-13
分支：`main`
状态：runtime protocol and release gate refresh complete
历史归档：`docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md`

## 一句话结论

AODS 是独立权威规范路线。v0.9 已发布，GitHub Release `v0.9.0` 已创建，tag source install smoke 已通过。当前 open issue 为 `#60/#64`，`#41/#59` 已关闭，无 milestone。U-027 到 U-771 已完成；runtime protocol / release gate refresh 已完成，static guards 仍不进 conformance，`v0.9.1` / `v0.10.0` 均不触发，package install smoke 和 release hygiene 通过。当前任务池剩余 U-772 到 U-781，下一轮默认执行 U-772 到 U-781。

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
| U-672 到 U-681 | 已完成 | projection guidance、provider discovery candidate、policy/workflow deferral、migration package no-go、route/query regression plan、validate location compatibility、package install smoke、post-v0.9 retrospective 和 no-milestone 决策已完成；任务池扩展到 U-731。 |
| U-682 到 U-691 | 已完成 | provider discovery source-first candidate、missing evidence negative fixture、schema no-go、non-execution regression、auth/probe/fallback/handshake candidate plans 和 `#64` progress sync 已完成。 |
| U-692 到 U-701 | 已完成 | package install smoke 已进 release hygiene；v0.9.1 draft / tag smoke / npm / CI / branch cleanup / next release go-no-go packet 已完成，未发布。 |
| U-702 到 U-711 | 已完成 | route / validate focused regressions 已新增；top-level help parity 修复；docs samples、package allowlist、generated hygiene 和 conformance sample 均确认无需刷新。 |
| U-712 到 U-721 | 已完成 | knowledge base write no-op、installed skill overwrite no-go、operations topic table / task ledger / handoff / round log hygiene、AGENTS proxy / GitHub note parity、`#60/#64` public sync no-op 和 milestone no-go 已完成。 |
| U-722 到 U-731 | 已完成 | final semantic candidate decisions 已完成；provider discovery / projection guidance 进入下一实现候选，policy / workflow / migration / conformance / cross-corpus / v0.10 继续 no-go；任务池扩展到 U-732 到 U-781。 |
| U-732 到 U-741 | 已完成 | provider discovery source-first 静态记录、缺 evidence 负例、network-disabled 非执行规则、focused regression、package boundary no-go 和 `#64` progress sync 已完成。 |
| U-742 到 U-751 | 已完成 | projection guidance coverage audit、缺 guidance 负例、`event-projection-guidance-required` validator rule、focused regression、route behavior、package/conformance/public sync no-go 和 retrospective 已完成。 |
| U-752 到 U-761 | 已完成 | policy decision 最小字段清单、no-engine 审计、missing evidence 负例计划、workflow lifecycle canonical term authority、illegal alias 负例计划、migration dry-run benchmark-only/package/README 边界已完成；未扩 schema / validator / source-first / package / README quickstart。 |
| U-762 到 U-771 | 已完成 | runtime protocol conformance entry checklist / no-go、`v0.9.1` 与 `v0.10.0` trigger refresh、release notes delta、package install smoke、release hygiene、CI / npm / branch cleanup gates 已完成；未发布、未 bump、未启用 CI、未删分支。 |

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
| knowledge base 误写 | 当前 `/Users/emosama/workspace/knowledge` 不具备本规范要求的根 `_index.md` / `_taxonomy.md`；未跨仓库创建结构 |
| v0.10 过早触发 | 当前没有 schema、validator 或 package contract 扩张；下一轮继续以 focused static guards 为主 |
| 远端分支历史清理 | 当前只保留 cleanup candidate packet；未删除任何远端分支 |

## 下一轮建议

| 顺序 | 任务 | 目标 |
|---:|---|---|
| 1 | U-772 到 U-774 | cross-corpus no-fetch posture、knowledge base write trigger、installed skill sync revisit |
| 2 | U-775 到 U-777 | operations topic table sync、handoff compression、round log retention |
| 3 | U-778 到 U-781 | `#60/#64` public sync decision、milestone no-go、next task pool expansion or release closeout decision |
