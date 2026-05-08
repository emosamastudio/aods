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
| U-064 | S10 | example / regression | P2 | 已完成 | 增加 glossary registry canonical example pack | compiled-pilot source-first example、compiled output、fixture manifest、focused regression 展示 canonical/alias/deprecated term |
| U-065 | S10 | schema / compile | P1 | 已完成 | 落地 external citation metadata 最小 schema | module-level `external_citations[]` 与 local `citation_refs[]` 已进入 module schema；source-first regression 覆盖 compile mirror |
| U-066 | S10 | validator | P1 | 已完成 | 落地 external citation validator gates | citation id unique、citation ref resolution、authoritative completeness、assumption posture、stable currentness 均有 deterministic gate |
| U-067 | S10 | example / regression | P2 | 已完成 | 增加 external citation / provenance canonical example pack | compiled-pilot example 已展示 current external authority、internal decision provenance、unsupported assumption 分界；fixture 与 focused regression 覆盖 |
| U-068 | S11 | public sync triage | P2 | 已完成 | 复盘 GitHub issue 本地覆盖与公开状态差异 | `#54-#58`、`#60/#41` 本地覆盖与公开状态矩阵已完成；不执行公开写操作 |
| U-069 | S11 | drift planning | P1 | 已完成 | 选择下一段代码漂移最小切片 | 已选择 U-071 implementation reality locator drift hardening；排除全量代码扫描器 |
| U-070 | S11 | docs / routing | P2 | 已完成 | 复盘 boot-by-touch / route discoverability 残留 | `#9/#10/#17` 保持 closed；新增 U-076 route help / smoke test 残留任务 |
| U-071 | S11 | validation hardening | P1 | 已完成 | 强化 implementation reality locator drift 检查 | `validate --reality --json` 已输出 structured `topology.unchecked_repos[]` 与 actionable `unchecked_reason`；focused regression + `validate:all` |
| U-072 | S11 | docs / examples | P2 | 已完成 | 更新 public docs navigation for completed example packs | README/operations 已指向 source-first pilot、六类 example pack、glossary registry、external citation / provenance 示例；benchmark sync 区块未手改 |
| U-073 | S11 | backlog triage | P2 | 已完成 | 制定 v0.12 backlog triage | 已将 `#33/#35/#37/#38/#39/#43-#52/#59/#60` 重新分类到 public sync、covered local、deferred runtime 与 v0.12+ 新任务池；未实现新能力 |
| U-074 | S11 | release gate | P1 | 已完成 | 执行 v0.11 累积变更 release readiness gate | `release:self-check`、package dry-run、diff hygiene、release notes skeleton 已通过；不发布 release |
| U-075 | S11 | public sync | P1 | 已完成 | GitHub issue / PR / release public sync execution | PR `#63` 已创建为 draft；已覆盖 issue 设置为 close-on-merge；`#41/#59/#60` 已留言保留；未发布 release |
| U-076 | S11 | route DX | P2 | 已完成 | 增加 route 子命令 help / discoverability smoke test | `node ./bin/aods.mjs route --help` 输出 route 用法、stage、intent；focused CLI regression 覆盖；不改变 route ranking |
| U-077 | S12 | validation hardening | P1 | 已完成 | Implementation evidence stale/current hygiene | `validate --reality` 输出 evidence status counters；stale / missing-current evidence warning 有 remediation；focused regression + `validate:all` 通过 |
| U-078 | S12 | validator / capability | P1 | 已完成 | Capability compatibility metadata deterministic gates | capability compatibility mapping-table 可表达 compatible / incompatible rows；validator 检查 capability id、profile、schema version policy、exposure class 与 expected_result 是否一致 |
| U-079 | S12 | CLI observability | P2 | 已完成 | Validate / route JSON explanation minimal enrichment | `route --json` 已输出 `explanation.source/reason/dependency`；focused regression 覆盖 |
| U-080 | S12 | fixture tooling | P2 | 已完成 | Fixture / golden export smoke runner | `aods fixture smoke` 可读取 example fixture manifest 并验证 expected_status / expected_rules 与 input/golden path；不执行 update command |
| U-081 | S12 | public docs / adoption | P2 | 已完成 | Source-first adoption guide for example packs | README / docs 指向从 authoring source 到 compile / validate / route / fixture smoke 的最小 adoption path；不重复 benchmark sync 区块 |
| U-082 | S12 | citation hygiene | P2 | 已完成 | External citation stale/current hygiene report | `validate` / `validate --json` 已输出 declared citation posture counters；不做 crawler、URL checker、fact checker |
| U-083 | S12 | ergonomics | P3 | 已完成 | Changelog delta ergonomics review | 已复审 `#13`：有效但不阻塞当前 release workflow；本轮只写 public response plan，不改 schema |
| U-084 | S12 | research / boundary | P3 | 低优先级 | Runtime-boundary research spike | 梳理 workflow runtime、event store、policy engine、remote gateway、migration tool 的边界和进入条件；不实现 runtime |

## 下一批推荐

| 批次 | 任务 | 理由 | 验证 |
|---|---|---|---|
| Batch A | U-060 + U-061 | 已完成；两个 boundary triage 已解除 `#57/#58` 的设计不确定性 | `gh issue view 57/58`、`rg` 现状审查、`npm run validate:all`、`git diff --check` |
| Batch B | U-062 + U-063 | 已完成；glossary schema 和 validator 已按同一边界落地，并由 focused regression 覆盖 compile mirror 与 deterministic gates | glossary focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch B2 | U-064 | 已完成；example pack 验证新 glossary registry shape，且未引入 runtime 或 external citation 变更 | compiled-pilot source-first example、fixture manifest、focused regression、`npm run validate:all`、`npm run benchmark:test` |
| Batch C | U-065 + U-066 | 已完成；citation schema 和 validator 已按同一边界落地，并由 focused regression 覆盖 source-first mirror 与 deterministic gates | citation focused regression、`npm run validate:all`、`git diff --check`；hosted repeatability 依赖外部捕获，不作为本轮 gate |
| Batch C2 | U-067 | 已完成；example pack 验证 external citation registry / provenance refs 的 canonical authoring 用法 | compiled-pilot source-first example、fixture manifest、focused regression、`npm run validate:all` |
| Batch D | U-068 + U-069 + U-070 | 已完成；GitHub public sync、next drift slice、route discoverability residual 均已复盘 | `gh issue list/view`、`rg`、route smoke、`git diff --check`、`npm run validate:all` |
| Batch E | U-071 + U-076 | 已完成；回到代码漂移主线强化 implementation reality locator diagnostics，并补齐 route CLI 自发现小修 | RED/GREEN scaffold regression、`node ./bin/aods.mjs route --help`、`npm run validate:all`、`git diff --check` |
| Batch F | U-072 + U-073 | 已完成；两个 docs/planning 任务低冲突，已先补 public docs navigation，再整理 v0.12 backlog，给 release gate 和 public sync 降低风险 | docs diff review、GitHub issue 只读审查、`npm run validate:all`、`git diff --check` |
| Batch G | U-074 | 已完成；release readiness gate 是 public sync、PR/release 对外动作和 v0.12 新实现前的最低风险前置项 | `npm run release:self-check`、`npm pack --dry-run --json`、`git diff --check`、release notes skeleton |
| Batch H | U-075 | 已完成；U-074 通过后单独执行，用 U-072 public navigation 与 U-073 issue mapping 完成 public sync | PR `#63`、issue close-on-merge 关联、`#41/#59/#60` 留言、operations docs、`npm run validate:all`、`git diff --check` |
| Batch I | U-077 | 已完成；public sync 后的首个 v0.12 drift hardening，承接 U-071 locator diagnostics | RED/GREEN focused regression、`npm run validate:all`、`git diff --check` |
| Batch J | U-078 | 已完成；承接 `#41` metadata-only capability residual，先做 deterministic gates，不进入 handshake runtime | RED/GREEN focused regression、stable-contracts regression、`npm run validate:all`、`git diff --check` |
| Batch K | U-079 | 已完成；承接 `#59` observability residual，做最小 machine-readable explanation enrichment，不重写 CLI output subsystem | RED/GREEN focused regression、stable-contracts regression、route JSON/text smoke、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch L | U-080 | 已完成；承接 `#48` fixture/golden residual，做最小 smoke runner，不进入完整 conformance runner | RED/GREEN fixture regression、fixture JSON/text smoke、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch M | U-081 | 已完成；把 source-first authoring、compile、validate、route、fixture smoke 串成公开 adoption path | RED/GREEN example-pack docs regression、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch N | U-082 + U-083 | 已完成；citation posture 进入 validate report，同时复审 changelog.delta 300 字符限制是否阻塞 release workflow | RED/GREEN scaffold regression、compiled-pilot citation report smoke、GitHub issue `#13` read-only review、`npm run validate:all`、`npm run benchmark:test`、`git diff --check` |
| Batch O | U-084 | 下一批首选；只做 runtime 边界和进入条件研究，不实现 runtime | docs gate、`npm run validate:all`、`git diff --check` |

## 当前非目标

1. 不把 glossary v2 扩成全文术语扫描器或自然语言 rewrite 工具。
2. 不把 external citation 扩成 crawler、事实核验器或 cross-corpus resolver。
3. 不把代码漂移路线扩成全量静态分析平台。
4. 不把本地覆盖判断自动同步为 GitHub issue 关闭或公开 release。
5. 不触碰 Polaris sibling repo；AODS 继续作为独立权威规范路线迭代。
