# AODS Runtime Boundary Research

状态：U-084 已完成
日期：2026-05-08
适用范围：workflow runtime、event store、policy engine、remote gateway、migration tool 的边界和进入条件；不实现 runtime

## 结论

U-084 的结论是：AODS 当前已经有足够多的 metadata-only 边界来描述稳定消费、实现证据、风险、曝光、审计、生命周期、事件修正、依赖顺序和迁移姿态，但这些边界不能被解释为 runtime 已经存在。

下一阶段不应直接实现 workflow engine、event store、policy engine、remote gateway 或 migration tool。更稳妥的路线是先补一层 runtime readiness gate matrix，把每类未来 runtime 的进入条件写成可审查清单，再逐项做 triage。这样可以避免把规范字段、示例、路由说明或验证报告误当作已经能执行副作用的系统。

## 证据来源

| 来源 | 用途 | 结论 |
|---|---|---|
| `node ./bin/aods.mjs route . --query "workflow runtime event store policy engine remote gateway migration tool boundary" --stage plan --intent read --json` | 选择当前权威语义入口 | route 推荐 `spec-stable-surface-contracts`，并指向 `spec-authority-governance` / `spec-surface-governance` 依赖 |
| `spec/stable-surface-contracts.json` | 读取 stable surface metadata 与 deferred runtime non-goals | 当前 contract layer 明确排除 command execution、event store replay、runtime scheduler、policy engine、remote gateway、migration tool 等 |
| `spec/authority-governance.json` | 读取 authority chain、lifecycle promotion 和 ref trust posture | stable consumption 需要显式 authority chain；refs 是 canonical identifiers，不是 runtime fetch instructions |
| `docs/operations/aods-v0.12-backlog.zh-CN.md` | 读取 v0.12+ 当前排序 | U-084 是 validation/reporting hardening 后的首选 research spike |
| `docs/operations/aods-expanded-task-plan.zh-CN.md` | 读取批量执行规则 | boundary triage 不得和 runtime/schema 实现混在同一轮，除非台账已明确依赖和验收标准 |

## 总边界

| 类别 | AODS 当前负责 | AODS 当前不负责 |
|---|---|---|
| 规范权威 | 声明谁拥有稳定语义、谁可消费、什么姿态可发布 | 自动跨仓 fetch、自动猜测 authority、运行时动态发现 |
| 契约元数据 | 声明 contract profile、schema versioning、redaction、risk、audit、freshness、evidence、acceptance | 执行命令、授权副作用、调度任务、重放事件、迁移数据 |
| 验证 | 做 deterministic schema / validator / fixture smoke 检查 | 做事实核验、语义忠实度判断、远程探测、任意命令执行 |
| 示例 | 展示 source-first authoring 与 canonical metadata 用法 | 声明生产 runtime 已实现、覆盖所有业务场景、提供自动执行保证 |
| 公开同步 | 用 PR / issue / release 把本地覆盖与公开状态对齐 | 把 open issue 直接等同为本地缺能力，或提前关闭 deferred runtime |

## Workflow Runtime

| 项 | 边界 |
|---|---|
| 当前已有 | lifecycle state-machine profile、command / receipt / event linkage、dependency ordering、audit metadata、risk labels、implementation evidence 和 acceptance criteria |
| 当前不做 | workflow engine、runtime scheduler、retry runtime、cleanup executor、state persistence runtime、target inventory runtime |
| 易误读点 | lifecycle transition metadata 只说明状态和审查姿态，不代表 AODS 能调度、重试、取消或清理真实任务 |
| 进入条件 | stable workflow/object profile 已存在；command / receipt / audit linkage 当前有效；风险和人工审批姿态已声明；event/receipt persistence model 已裁剪；fixture 或 conformance smoke 计划存在；implementation evidence 可解析；rollback、cancel、timeout、retry 语义已明确 |

## Event Store

| 项 | 边界 |
|---|---|
| 当前已有 | append-only event shape、correction event、supersession link、retraction、projection guidance、event / projection refs |
| 当前不做 | event store runtime、ordering service、retention backend、delivery guarantee、automatic replay、historical data migration |
| 易误读点 | correction / supersession vocabulary 只是消费姿态，不会重建 read model，也不会判断 domain truth |
| 进入条件 | event identity 和 ordering key 已稳定；retention / deletion posture 已声明；replay scope 和 projection target 已裁剪；correction projection policy 可验证；idempotency / exactly-once 期望明确；negative fixture 覆盖历史 rewrite 禁止；implementation evidence 与 storage ownership 可审查 |

## Policy Engine

| 项 | 边界 |
|---|---|
| 当前已有 | risk taxonomy、validation severity / gate policy、policy decision fields、human approval labels、audit anchor |
| 当前不做 | runtime policy engine、permission broker、identity evaluator、dynamic risk scanner、approval workflow、cost accounting runtime |
| 易误读点 | risk labels 描述风险姿态，不授予或拒绝运行时权限；human_approval 只是契约字段，不是审批流 |
| 进入条件 | policy input vocabulary 已稳定；actor / identity / scope model 已裁剪；allow / deny / review / escalate output semantics 明确；audit receipt 和 evidence anchors 可验证；policy owner 和 escalation owner 已声明；deterministic fixtures 覆盖关键分支；不依赖隐藏副作用或远程事实 |

## Remote Gateway

| 项 | 边界 |
|---|---|
| 当前已有 | local-only、local-export、remote-read、remote-write、adapter-facing exposure classes；capability provider / consumer metadata；auth、version、freshness、redaction、audit expectations |
| 当前不做 | remote API gateway、auth runtime、network broker、remote transport runtime、runtime discovery、auth exchange、fallback ranking、dynamic probing |
| 易误读点 | remote-capable exposure class 只说明可以如何被审查，不代表已经有网络服务、认证链路或传输重试 |
| 进入条件 | exposure upgrade gate 已通过；auth / identity / tenant boundary 已裁剪；redaction、risk、freshness、rate / cost posture 已声明；transport error semantics 明确；audit anchor 可落地；compatibility fixtures 覆盖 provider / consumer；remote failure 不会被 validator 静默当作成功 |

## Migration Tool

| 项 | 边界 |
|---|---|
| 当前已有 | deprecation metadata、replacement refs、migration guidance、affected versions、removal version、field / command / event / export mapping |
| 当前不做 | automatic migration tool、consumer rewrite、runtime compatibility shim、stored data transform、cross-corpus resolver |
| 易误读点 | migration guidance 是人工和 agent 的审查输入，不会自动改文件、改数据、改事件或提供兼容层 |
| 进入条件 | source / target authority 已稳定；迁移是 reversible 还是 irreversible 已分类；consumer impact 和 compatibility window 已声明；dry-run / report format 已裁剪；rollback plan 和 validation gate 明确；fixture / golden evidence 覆盖；破坏性迁移需要 human approval |

## Cross-Cutting Entry Gates

任何 runtime 方向进入实现前，至少需要先满足以下门槛：

1. Authority chain 完整：owner、lifecycle、contract profile、redaction / exposure / compatibility posture 都存在。
2. Metadata-only contract 已通过 schema、validator 和必要 fixture smoke。
3. Implementation evidence 和 acceptance criteria 是 current，并能说明实现位置、验收方式和缺口。
4. Risk、redaction、audit、approval posture 已声明，且不会把声明字段误当作实际授权。
5. 至少有一个 positive fixture、一个 negative fixture 或等价 conformance smoke 计划。
6. 外部 fetch、fact checking、remote probing、command execution、write side effect 必须显式入账，默认禁止。
7. Public PR / issue / release sync 与 runtime 实现分开裁剪，不能用公开同步状态替代技术验收。

## 后续任务建议

| 建议任务 ID | 优先级 | 类型 | 目标 | 验收标准 | 非目标 |
|---|---|---|---|---|---|
| U-085 | P2 | docs / boundary | Runtime readiness gate matrix | 将 workflow runtime、event store、policy engine、remote gateway、migration tool 映射到 authority、evidence、risk、fixture、public sync gate | 不实现 runtime |
| U-086 | P2 | boundary triage | Workflow runtime entry contract triage | 明确 lifecycle / command / audit / dependency 前置条件和 workflow non-goals | 不实现 workflow engine |
| U-087 | P2 | boundary triage | Event store and replay contract triage | 明确 event identity、ordering、retention、replay、correction projection 前置条件 | 不实现 event store |
| U-088 | P2 | boundary triage | Policy engine and approval runtime triage | 明确 risk label 到 policy decision input/output、audit receipt 和 approval boundary | 不实现 permission broker 或 approval workflow |
| U-089 | P2 | boundary triage | Remote gateway / adapter runtime triage | 明确 exposure upgrade、auth、transport、audit、compatibility 前置条件 | 不实现 remote gateway |
| U-090 | P3 | boundary triage | Migration tool entry contract triage | 明确 source/target authority、dry-run、rollback、mapping、destructive-change approval 边界 | 不实现 migration executor |
| U-091 | P1 | release / public sync | PR final readiness / public sync closeout | final validation、PR ready / merge 决策、close-on-merge issue 检查、version / release decision 明确 | 未获 owner 明确指令前不 merge、不 release |

## 下一轮推荐

1. 首选 U-085：先把五类 runtime 候选统一成一张 readiness gate matrix。
2. 次选 U-086 + U-087：继续做低冲突 boundary triage，仍不实现 runtime。
3. U-091 需要在 owner 明确要推进 PR ready / merge / release 时单独执行。
