# AODS final semantic candidate decisions

日期：2026-05-13
范围：U-722 到 U-731
状态：完成

## 本轮结论

上一轮 operations public sync hygiene 复审通过，无需返工。本轮把最后一批 S90 候选任务收束为下一阶段工作池：优先推进 provider discovery 的 source-first 正例和 missing evidence 负例；projection guidance 只进入“缺失 guidance 的静态负例”设计；policy decision、workflow transition、migration dry-run、runtime protocol conformance、cross-corpus resolver 和 v0.10 仍不进入实现或发布。

## 决策表

| 任务 | 决策 | 理由 | 下一步 |
|---|---|---|---|
| U-722 Projection guidance source-first candidate | 暂不作为独立 source-first 正例；只作为 event correction negative fixture 的必需字段推进 | 当前 compiled-pilot 已有 projection guidance；独立正例会被误读为 replay/projection runtime | 下一阶段先做缺 projection guidance 的负例和 focused regression |
| U-723 Event correction projection negative fixture | 进入下一批实现候选 | 负例能直接检测“更正事件改变读取含义但没有解释指导”的漂移，且不需要 event store | 设计 `event-projection-guidance-required` fixture |
| U-724 Policy decision static shape second review | 继续 deferred | policy decision 仍容易被误解为 policy engine 或权限授予 | 先补 minimal field checklist 和 no-engine wording，不进 schema |
| U-725 Workflow transition static shape second review | 继续 deferred | workflow transition 容易被误解为 scheduler / workflow engine | 先补 state vocabulary authority 和 illegal alias / transition plan |
| U-726 Migration dry-run package promotion second no-go | 继续 no-go | 当前只有 benchmark-only static report，不是 migrate command | 不进 package quickstart，不新增 `aods migrate` |
| U-727 Adapter provider discovery package boundary after fixture | 暂不进 package example | provider discovery 正例和 missing evidence 负例尚未落地 | 先做 source-first candidate + focused negative fixture |
| U-728 Runtime protocol conformance promotion no-go after fixture | 继续 no-go | 还没有 runtime/protocol source-first 正例和稳定 negative fixture | focused regression 稳定后再复核 conformance |
| U-729 Cross-corpus authority resolver next research trigger | 不启动新 research | 既有 trust model / fetch policy / cache posture 研究已足够；当前没有新的跨库实现需求 | 保持 no-fetch / no-resolver posture |
| U-730 Final v0.10 trigger audit | 不触发 v0.10 | 没有 schema、validator 或 package contract 扩张；当前只是候选与边界决策 | 不 bump、不 tag、不 release |
| U-731 Next comprehensive task discovery | 已扩展下一批任务 | 需要继续保持每轮 10 项的执行节奏 | 新增 U-732 到 U-781 |

## 下一阶段优先级

| 优先级 | 方向 | 原因 |
|---:|---|---|
| 1 | Provider discovery source-first + missing evidence negative fixture | 已有字段草案，风险最低，价值最高 |
| 2 | Projection guidance missing negative fixture | 能回应 event correction 解释漂移，不触发 runtime |
| 3 | Policy / workflow static readiness checklist | 继续收窄边界，避免过早实现 |
| 4 | Release hygiene / public sync / CI owner gate | 保持发布面稳定，不制造新发布 |
| 5 | Cross-corpus / knowledge / operations closeout | 只做 no-fetch 和记录卫生 |

## v0.10 触发审计

| 触发项 | 当前状态 | 结论 |
|---|---|---|
| schema expansion | 未发生 | 不触发 |
| validator contract expansion | 未发生 | 不触发 |
| package adoption surface expansion | 未发生 | 不触发 |
| runtime/protocol implementation | 未发生 | 不触发 |
| conformance suite expansion | 未发生 | 不触发 |
| public release owner intent | 未提供 | 不触发 |

## 新任务池边界

新增 U-732 到 U-781 只代表排队候选，不代表全部都会实现。每轮仍按台账规则先复审上一轮，若合格再选择 10 项执行。任何 runtime、network、auth、provider call、fallback executor、database mutation、cross-corpus fetch、version bump、tag、release、npm publish 或 CI enablement 都必须在对应任务中再次显式 go/no-go。

## 验证

| 验证项 | 结果 |
|---|---|
| 上轮质量复审 | 通过；latest commit `6659d7d` 与 origin/main 一致 |
| 历史专题交叉读取 | 通过；已复核 projection guidance、provider discovery、runtime protocol、release gate 相关记录 |
| docs link check | 通过；markdown_files=210, missing_links=0 |
| package surface check | 通过；entry_count=61 |
| release hygiene | 通过；包含 docs links、security scan、package surface、package install smoke、generated clean、focused tests、validate:all |
