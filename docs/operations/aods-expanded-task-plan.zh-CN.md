# AODS 扩展任务池与批量执行计划

状态：当前执行计划
日期：2026-05-08
适用范围：U-058 resource surface example pack 之后的 v0.11+ 迭代

## 目标

在不破坏“每轮先审查上一轮质量”的前提下，把后续工作从单任务线性推进扩展为可批量执行的任务池。批量执行只适用于依赖清晰、文件冲突低、验证路径明确的任务；schema、validator、compile、release 或公开 GitHub 写操作仍必须单独裁剪并保留明确 gate。

## 批量执行规则

| 规则 | 内容 |
|---|---|
| 质量门禁优先 | 每轮开始必须先复核上一轮成果；发现问题时只做返工和再审查，不推进新任务 |
| 批量准入 | 同轮任务必须共享同一目标阶段、互不覆盖关键语义边界、验证命令可以覆盖合并 diff |
| 默认批量规模 | docs-only triage 可一次 2-4 个任务；schema / validator / compile 任务默认一次 1-2 个；release / public GitHub 写操作默认单独执行 |
| 任务入账 | 所有候选任务先进入 `aods-task-ledger.zh-CN.md`，再进入当前回合锁定记录 |
| 非目标保护 | 批量执行不得把 boundary triage 和 runtime/schema 实现混在一起，除非台账中已明确依赖和验收标准 |
| 外部写操作 | issue comment、issue close、PR、release 均需 owner 明确授权，不能因本地计划完成而自动执行 |

## 当前任务池

| 任务 ID | 阶段 | 类型 | 优先级 | 批量建议 | 任务 | 验收标准 |
|---|---|---|---|---|---|---|
| U-060 | S10 | boundary triage | P1 | 已完成 | 裁剪 glossary / canonical-term registry v2 boundary | 已明确 `manifest.glossary` v1 兼容策略、v2 record 最小字段、deterministic validator gates 和 U-062/U-063/U-064 后续任务 |
| U-061 | S10 | boundary triage | P1 | 已完成 | 裁剪 external citation / provenance metadata boundary | 已明确 internal provenance / decision_provenance / external citation 分工、module-level citation registry、citation refs、stable consumption gates 和 U-065/U-066/U-067 后续任务 |
| U-062 | S10 | schema / compile | P1 | 已完成 | 落地 glossary registry v2 最小 schema 与 authoring compile mirror | root / companion / authoring glossary 支持 v1 string shorthand 与 v2 canonical term record；source-first regression 覆盖 mirror |
| U-063 | S10 | validator | P1 | 已完成 | 落地 glossary registry validator gates | `term_id` key match、alias collision、deprecated replacement missing、linked surface ref missing 均有 deterministic gate；不做自然语言术语扫描 |
| U-064 | S10 | example / regression | P2 | 下一批首选 | 增加 glossary registry canonical example pack | compiled-pilot source-first example、compiled output、fixture manifest、focused regression 展示 canonical/alias/deprecated term |
| U-065 | S10 | schema / compile | P1 | U-061 后独立或与 U-066 同轮 | 落地 external citation metadata 最小 schema | artifact 或 surface-level citation 支持 source type、locator、claim posture、access date、authority relation；compile mirror 覆盖 source-first |
| U-066 | S10 | validator | P1 | U-065 后可同轮 | 落地 external citation validator gates | stable agent-consumable external claims 必须有可解析 citation posture；unresolved/unsupported posture 不能被标成 authoritative fact |
| U-067 | S10 | example / regression | P2 | 可与 U-066 同轮 | 增加 external citation / provenance canonical example pack | compiled-pilot example 展示 external source、internal decision provenance、unsupported assumption 分界；fixture 与 focused regression 覆盖 |
| U-068 | S11 | public sync triage | P2 | docs-only 可同轮 | 复盘 GitHub issue 本地覆盖与公开状态差异 | `#54-#58`、`#60/#41` 等 issue 的本地覆盖、剩余缺口、是否建议评论/关闭形成审批矩阵；不执行公开写操作 |
| U-069 | S11 | drift planning | P1 | 可与 U-068 同轮 | 选择下一段代码漂移最小切片 | 从 topology、implementation linkage、evidence、acceptance、freshness、citation 中选择下一个 deterministic drift gate；排除全量代码扫描器 |
| U-070 | S11 | docs / routing | P2 | 可与 U-069 同轮 | 复盘 boot-by-touch / route discoverability 残留 | 审查 `#9/#10/#17` 和当前 routing warnings，确定是否需要低风险 route authoring guidance 或测试；不削弱 strict gate |
| U-071 | S11 | validation hardening | P1 | U-069 后 | 强化 implementation reality locator drift 检查 | 对 duplicate/descriptive locator、missing path、stale evidence locator 的诊断做最小改进；focused regression + `validate:all` |
| U-072 | S11 | docs / examples | P2 | 可与 U-068 同轮 | 更新 public docs navigation for completed example packs | README/operations 指向六类 example pack 现状；benchmark sync 区块只从 generator 改；不夸大 coverage |
| U-073 | S11 | backlog triage | P2 | docs-only 可同轮 | 制定 v0.12 backlog triage | 将 `#33/#35/#37/#38/#39/#43-#52/#59/#60` 中未覆盖项重新排序到 v0.12+；不实现新能力 |
| U-074 | S11 | release gate | P1 | 单独执行 | 执行 v0.11 累积变更 release readiness gate | `release:self-check`、必要 focused tests、diff hygiene、release notes skeleton；不发布 release |
| U-075 | S11 | public sync | P1 | 需 owner 授权，单独执行 | GitHub issue / PR / release public sync execution | 仅在 owner 明确批准后评论/关闭 issue、创建 PR 或 release；同步前确认 staged set 不含 `MEMORY.md` |

## 下一批推荐

| 批次 | 任务 | 理由 | 验证 |
|---|---|---|---|
| Batch A | U-060 + U-061 | 已完成；两个 boundary triage 已解除 `#57/#58` 的设计不确定性 | `gh issue view 57/58`、`rg` 现状审查、`npm run validate:all`、`git diff --check` |
| Batch B | U-062 + U-063 | 已完成；glossary schema 和 validator 已按同一边界落地，并由 focused regression 覆盖 compile mirror 与 deterministic gates | glossary focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch B2 | U-064 | 下一批首选；example pack 可验证新 glossary registry shape，且不引入 runtime 或 external citation 变更 | compiled-pilot source-first example、fixture manifest、focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch C | U-065 + U-066 | citation schema 和 validator 依赖同一边界，可一起闭合 external citation 的 stable-consumption gate | citation focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch D | U-068 + U-069 + U-070 | 都是 docs/read-only triage，可扩展下一阶段任务池但不改变语义面 | `gh issue list/view`、`rg`、`git diff --check`、`npm run validate:all` |

## 当前非目标

1. 不把 glossary v2 扩成全文术语扫描器或自然语言 rewrite 工具。
2. 不把 external citation 扩成 crawler、事实核验器或 cross-corpus resolver。
3. 不把代码漂移路线扩成全量静态分析平台。
4. 不把本地覆盖判断自动同步为 GitHub issue 关闭或公开 release。
5. 不触碰 Polaris sibling repo；AODS 继续作为独立权威规范路线迭代。
