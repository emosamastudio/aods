# AODS Next Code Drift Slice

状态：U-069 已完成
日期：2026-05-08
范围：选择下一段代码漂移最小切片；不实现全量代码扫描器

## 结论

下一段代码漂移应选择 **U-071 implementation reality locator drift hardening**。理由是它延续现有 deterministic reality path，风险低、价值高，并且能把当前 `validate --reality` 中的 unchecked descriptive locator 从“可见风险”推进到“更可操作的诊断”。

不建议下一步做 behavioral drift、LLM semantic judge、cross-repo crawler 或 conformance runner。那些都依赖更强的 locator / evidence 基础，否则会把漂移检测建立在不可定位的现实面上。

## 候选对比

| 候选 | 当前基础 | 价值 | 风险 | 判断 |
|---|---|---|---|---|
| Topology / implementation locator drift | `project_topology`、module implementation、`validate --reality` 已存在 | 高：直接决定是否能检查真实实现路径 | 低：可 deterministic 检查 locator/path shape | 下一步首选 |
| Implementation evidence drift | evidence schema、summary、reality count 已存在 | 高：可暴露 stale / missing evidence | 中：需要先知道 repo locator 是否可解析 | 排在 locator hardening 后 |
| Acceptance criteria drift | criteria schema 与 gates 已存在 | 中高：能防止 contract-to-test 脱节 | 中：容易扩成 test runner | 后续推进，不先做 executor |
| Read-model freshness drift | freshness profile 已存在 | 中：适合 read model export | 中：source watermark 充分性仍需人工判断 | 后续针对 read-model surfaces |
| External citation drift | citation registry 与 gates 已存在 | 中：能暴露 stale external authority | 中高：容易被误解为 URL checker / fact checker | 后续只做 declared stale/current hygiene |
| Behavioral drift | 当前只有 fixture / benchmark 基础 | 高但不稳定 | 高：需要 oracle 或 scenario harness | 暂不进入 |

## U-071 最小实现建议

| 子项 | 内容 | 验收标准 |
|---|---|---|
| Locator diagnostics | 对 descriptive-only implementation repo locator 输出更具体的 `unchecked_reason` | `validate --reality --json` 能区分 descriptive locator、missing repo root、unresolvable external repo |
| Duplicate / ambiguous locator | 对同一 implementation repo id 或 locator 的歧义继续保持阻断或明确诊断 | focused regression 覆盖 ambiguous reality mapping |
| Path-like evidence smoke check | 只检查可解析 repo root 下的 path-like evidence locator 是否存在 | 不执行 command；只做 path existence |
| Stale evidence visibility | stale evidence 在 reality summary 中保持计数和 warning | 不把 stale 自动升级为 release blocker，除非现有 gate 已定义 |
| Documentation | 更新 code drift roadmap / task ledger / round log | 明确非目标：全量扫描器、LLM judge、remote clone |

## 推荐任务流

1. U-071：implementation reality locator drift hardening。
2. U-072：public docs navigation，把已完成 example packs / registry / citation 用法串到公开入口。
3. U-073：v0.12 backlog triage，把 behavioral drift、citation hygiene、capability negotiation runtime 等后续项重新排队。
4. U-074：release readiness gate。
5. U-075：owner 批准后执行 GitHub public sync。

## 非目标

1. 不 clone / fetch 外部 repo。
2. 不执行 implementation evidence command。
3. 不用 LLM 判定代码是否符合规范。
4. 不做全量静态分析平台。
5. 不把 Polaris sibling repo 作为 AODS 必须绑定的实现现实。
