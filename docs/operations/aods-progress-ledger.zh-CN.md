# AODS 进度台账

状态：当前进度口径

## 进度口径定义

| 维度 | 含义 | 只有在何种证据下才允许提升 |
|---|---|---|
| 最近阶段目标 | 当前阶段主线任务的完成度 | 当前阶段高优先任务完成并有验证证据 |
| v1.0 | AODS 作为公开标准 + CLI + benchmark 参考实现的成熟度 | 规范、实现、公开文档、发布检查、关键 issue 主线一致推进 |
| 最终系统 | AODS 作为长期 agent-first governance system 的完善度 | 在 v1 基础上继续补齐 topology、gating、capability negotiation、release discipline 等能力 |

## 阶段定义

| 阶段 | 目标 | 退出标准 |
|---|---|---|
| S0 项目治理接入 | 建立 file-backed 任务治理面 | 任务台账、round log、handoff、progress ledger、agent 入口落盘 |
| S1 Specification governance foundation | 定义 AODS 稳定 surface 的 authority、exposure、redaction、completeness 基础 | v0.7 must-build foundation 被 owner 裁剪并形成最小可验证实现 |
| S2 Concrete pilot / external reality | 用 `project_topology` 和 implementation linkage 修复 design-only green loop | `validate --reality` 能显式暴露 linked implementation reality 或未检查状态 |
| S3 Validation / adapter mechanics | 补齐 severity、versioning、refs、adapter capability 等消费机制 | P1 mechanics 与 S1 foundation 一致 |
| S4 Release / adoption hardening | 强化发布对齐和外部采用信任面 | release checklist 稳定，关键发布阻塞有清晰处理路径 |
| v1 | 稳定可对外复用 | S0-S3 关键面都达到可维护状态 |

## 进度记录

| 日期 | 最近阶段目标 | v1.0 | 最终系统 | 证据 | 说明 |
|---|---:|---:|---:|---|---|
| 2026-04-23 | 100% | 60% | 35% | 公开文档 hardening、GitHub contribution surfaces、issue backlog review | 公开表达面和下一主线判断已收束。 |
| 2026-05-02 | 100% | 65% | 40% | `U-001` 完成 | 项目治理面已落盘；下一步进入 topology / external reality 主线。 |
| 2026-05-02 | 100% | 66% | 42% | `U-001A` 完成 | 台账改为 owner-led roadmap：先裁剪 governance foundation，再把 `#28` 作为 concrete pilot，而不是按 issue 标签机械执行。 |
| 2026-05-02 | 100% | 68% | 44% | `U-002` 完成 | v0.7 owner roadmap 已落盘；must-build / should-build / defer / legacy issue 决策已明确。 |
| 2026-05-02 | 100% | 70% | 46% | `U-003`、`U-004`、`U-016`、`U-017`、`U-019` 完成 | 第一轮 foundation implementation 完成 stable authority / lifecycle/exposure，并关闭两个低风险 validator DX 项与 stale issue hygiene。 |
| 2026-05-02 | 100% | 75% | 52% | `U-005`、`U-006`、`U-007`、`U-012` 完成 | stable-surface contract layer 已落盘：redaction、contract completeness、topology design-only pilot、schema versioning guidance 进入 spec/schema/validator，并通过 focused + repo-level validation。 |
| 2026-05-02 | 100% | 80% | 58% | `U-008`、`U-011`、`U-014` 完成 | root topology 已从 design-only 进入 schema + compiled-authoring + example 链路；severity/gating 与 adapter minimum contract 也已形成统一 spec vocabulary。 |
| 2026-05-02 | 100% | 85% | 63% | `U-009`、`U-010`、`U-013`、`U-018` 完成 | module-level implementation linkage 与 topology-aware reality summary 已落盘；cross-surface ref boundary 和 invariant normalization 也已进入 spec/validator，当前只剩 release alignment blocked work。 |
| 2026-05-02 | 100% | 88% | 66% | `U-015` 完成 | release alignment checklist 已收敛；正式版本发布统一走 GitHub Releases，repo 当前台账已无未完成任务。 |
| 2026-05-12 | 100% | 99% | 99% | `U-126` 到 `U-135` 完成 | route / validation DX、authoring lint boundary 和 changelog ergonomics 已收束；changelog delta 采用 300 soft warning + 500 hard fail，并由 focused regression 覆盖。 |
| 2026-05-12 | 100% | 99% | 99% | `U-136` 到 `U-145` 完成 | glossary alias lifecycle、canonical-term docs、external citation workflow/freshness、documentation density、paired surface report、docs link checker、sensitive/redaction fixture review、credential placeholder policy 和 remote exposure upgrade checklist 已收束；不建 resolver、crawler、semantic judge、secret scanner 或 gateway。 |
| 2026-05-12 | 100% | 99% | 99% | `U-146` 到 `U-155` 完成 | risk taxonomy coverage、audit metadata completeness、policy decision / receipt / approval labels、local-only export safety 和五类 runtime PoC decision gates 已收束；不建 workflow engine、event store、policy engine、remote gateway 或 migration executor。 |
| 2026-05-12 | 100% | 99% | 99% | `U-156` 到 `U-160` 完成 | conformance runner plan、adapter negotiation protocol plan、cross-corpus authority resolver research、dependency scheduler research 和 telemetry / observability store research 已收束；当前任务池无未完成任务。 |
| 2026-05-12 | 100% | 99% | 99% | `U-161` 到 `U-170` 完成 | post-backlog 任务池扩展到 U-200；公开状态刷新发现 PR `#63` close-on-merge recognition gap，下一步默认进入 negative fixtures / conformance / dependency diagnostics 本地切片。 |
| 2026-05-12 | 100% | 99% | 99% | `U-171` 到 `U-180` 完成 | 首批 negative fixtures 已落地，conformance manifest/report proposal 已明确，route dependency diagnostics 已扩展，PR generated artifact 接受/还原策略已入账；下一步默认进入 PR public sync / release planning。 |
| 2026-05-12 | 100% | 99% | 99% | `U-181` 到 `U-190` 完成 | PR `#63` close-on-merge 识别已修复并切为 ready for review；`#13/#41/#59/#60` 已公开同步并保持 open；下一 public release 目标定为 `v0.8.0`，RC 技术门禁通过但不发布。 |
| 2026-05-12 | 100% | 99% | 99% | `U-191` 到 `U-200` 完成 | release closeout readiness、PR split/checks/package guard、post-merge checklist、local docs link / secret-like scan repeatability、`aods-use` skill alignment 和 handoff compaction 已完成；任务池扩展到 U-230，下一轮默认 U-201 到 U-210。 |
| 2026-05-13 | 100% | 99% | 99% | `U-201` 到 `U-210` 完成 | PR body final freshness、20 close refs audit、review/checks policy、release notes body draft、version/README dry-run plan、package inventory、packed install smoke、release self-check 和 owner go/no-go packet 已完成；release 仍因 version surface 未 bump 而 no-go。 |
| 2026-05-13 | 100% | 99% | 99% | `U-211` 到 `U-220` 完成 | local docs link、secret-like scan、package surface、generated churn、skill alignment 和 release hygiene aggregate 已变成可重复本地命令；下一轮默认进入 U-221 到 U-230 conformance / diagnostics slice。 |
| 2026-05-13 | 100% | 99% | 99% | `U-221` 到 `U-230` 完成 | conformance manifest/report schema、只读 runner、negative fixture second slice、validator dependency diagnostics、route docs parity 和 no-fetch/no-telemetry posture 已完成；当前任务池清空，下一步需要重新发现任务或进入 release/public decision。 |
| 2026-05-13 | 100% | 99% | 99% | `U-231` 到 `U-240` 完成 | post-conformance 任务池已扩展到 U-270；conformance manifest/report schema 回归、unknown-property rejection、non-execution invariant、route terminology sanity、coverage snapshot 和 release hygiene rerun 已完成；下一轮默认 U-241 到 U-250。 |
| 2026-05-13 | 100% | 99% | 99% | `U-241` 到 `U-250` 完成 | post-conformance release gate、packed conformance install smoke、PR body refresh、release notes / version dry-run plan、README conformance docs plan 和 conformance fail/warn/text regressions 已完成；下一轮默认 U-251 到 U-260。 |
