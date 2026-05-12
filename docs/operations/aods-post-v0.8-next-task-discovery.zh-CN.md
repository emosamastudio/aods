# AODS post-v0.8 next task discovery

状态：已完成
日期：2026-05-13

## 结论

v0.8 发布后，当前公开未关闭问题只剩 `#60/#59/#41`。`#13` 已由 v0.8 的 changelog delta 两级限制实现覆盖，本轮已公开评论并关闭。

下一阶段不直接启动 runtime。最高价值路线是把剩余公开锚点拆成 metadata-first、validator-first、report-first 的小任务：先让状态、解释、兼容和差距可验证，再决定是否进入协议或运行时。

## 本轮完成项

| 任务 | 结论 | 证据 |
|---|---|---|
| U-271 post-v0.8 backlog discovery | 已从 release closeout 和 open issues 生成新任务池 | 本文档、task ledger |
| U-272 public issue state classification | 当前 open issues 为 `#60/#59/#41` | `gh issue list --state open` |
| U-273 `#13` changelog current-state audit | 已实现 300 warning / 500 hard limit | `schema/module.schema.json`、`spec/validation-rules.json`、focused history |
| U-274 `#13` public close execution | 已评论并关闭为 completed | `https://github.com/emosamastudio/aods/issues/13#issuecomment-4433981216` |
| U-275 `#60` roadmap public status refresh | 已评论 v0.8 后剩余范围 | `https://github.com/emosamastudio/aods/issues/60#issuecomment-4433985187` |
| U-276 `#59` observability coverage audit | route JSON 已有 explanation；validator observability 仍不完整 | `aods-route-json-explanation.zh-CN.md`、`validation-rules.json` |
| U-277 `#59` next slice decision | 下一步优先 validation issue source-location / json-pointer enrichment | 不建 telemetry store |
| U-278 `#41` capability coverage audit | metadata matrix 已覆盖 provider/consumer comparison；runtime negotiation 未覆盖 | `aods-capability-compatibility-gates.zh-CN.md` |
| U-279 `#41` next slice decision | 下一步优先 capability protocol surface design，不做 handshake implementation | 保持 metadata-first |
| U-280 next task pool expansion | 新增 U-281 到 U-330 | task ledger |

## Issue-by-issue state

| Issue | 当前状态 | 本轮判断 |
|---|---|---|
| `#13` changelog delta limit | closed | v0.8 已实现 two-tier behavior，公开关闭 |
| `#41` capability negotiation | open | 已有 metadata-only compatibility matrix；剩余是 protocol / fallback / unsupported-feature design |
| `#59` validation / routing observability | open | route explanation 已有最小实现；validator issue explainability 仍有增量空间 |
| `#60` governance roadmap | open | 作为剩余路线 umbrella 保留；本轮已评论 v0.8 后状态 |

## Next task pool

| Task | Priority | Theme | Acceptance |
|---|---|---|---|
| U-281 | P1 | Validator source-location audit | 列出当前 validation issue 是否含 file/json pointer/sid/module 信息，以及缺口 |
| U-282 | P1 | Validator issue location minimal schema | 设计 `location` / `json_pointer` / `source_path` 输出边界 |
| U-283 | P1 | Validator location regression plan | 规划 positive / negative fixture，不改 runtime |
| U-284 | P1 | Validator suggested-action coverage audit | 统计哪些 rule 已有 remediation，哪些只有 prose message |
| U-285 | P1 | Validator suggested-action next slice | 选择 3 个高价值 rule 补 remediation 的最小实现路线 |
| U-286 | P2 | Route skipped-module semantics audit | 判断 `route --json` 是否需要 skipped modules，而不是默认输出全量未选模块 |
| U-287 | P2 | Route skipped-module boundary design | 设计 no-dashboard / no-ranking-change 的 skipped explanation |
| U-288 | P2 | Route explanation docs refresh | 把 current explanation shape 写成 public README 或 docs snippet |
| U-289 | P2 | Observability example output pack | 增加 validate / route JSON sample 文档，不改变 CLI |
| U-290 | P2 | `#59` public status refresh | 在 issue 上同步当前已覆盖与剩余切片 |
| U-291 | P1 | Capability unsupported-feature audit | 审查现有 metadata 是否能表达 unsupported / partial / unknown |
| U-292 | P1 | Capability fallback semantics boundary | 设计 fallback metadata，不做 fallback execution |
| U-293 | P1 | Capability protocol surface sketch | 定义 future provider/consumer exchange 的静态 surface，不实现 handshake |
| U-294 | P1 | Capability conformance fixture plan | 规划 provider/consumer mismatch fixture |
| U-295 | P2 | Capability matrix docs refresh | 将 matrix columns / expected_result 写成 adoption guidance |
| U-296 | P2 | `#41` public status refresh | 在 issue 上同步 metadata coverage 与 deferred runtime scope |
| U-297 | P1 | Governance roadmap issue body audit | 检查 `#60` tracker checklist 与 closed issue mismatch |
| U-298 | P1 | Governance roadmap next milestone split | 将 `#60` 拆成 S33/S34/S35 候选 milestone |
| U-299 | P1 | Closed issue traceability table | 生成 closed issues -> local task -> release evidence 表 |
| U-300 | P1 | Public tracker update plan | 规划是否编辑 `#60` body 或继续 comment-only |
| U-301 | P2 | Release-to-issue close report | 写 v0.8 closed issues public report |
| U-302 | P2 | Post-v0.8 docs stale reference audit | 找出仍说 PR open / release no-go 的非历史段落 |
| U-303 | P2 | Handoff stale risk compression | 精简 handoff 中过长的历史风险，保留当前入口 |
| U-304 | P2 | Operations index pruning plan | 规划 operations README 是否需要分层索引 |
| U-305 | P2 | Task ledger archive split plan | 规划已完成 285+ 任务是否需要 archive 视图 |
| U-306 | P2 | Release hygiene CI reconsideration | 基于 v0.8 结果重新判断是否启用轻量 CI |
| U-307 | P2 | Package install smoke repeat | 对 v0.8 GitHub tag 做 fresh install smoke |
| U-308 | P2 | GitHub release artifact audit | 核对 release tag / source archive / README links |
| U-309 | P2 | `aods-use` installed-skill drift check | 比较 repo packaged skill 与本地安装 skill |
| U-310 | P2 | Skill install/update route plan | 规划是否更新用户本地 skill，不直接覆盖 |
| U-311 | P2 | Changelog issue post-close audit | 确认 `#13` 关闭后无残留 blocker 引用 |
| U-312 | P3 | Changelog docs example refresh | 增加 300/500 行为示例 |
| U-313 | P3 | Changelog regression naming cleanup | 审查 test name 是否清楚表达 warning vs hard fail |
| U-314 | P3 | Strict-warning behavior docs | 明确 normal validate 与 strict validate 对 warning 的差异 |
| U-315 | P2 | Conformance suite release docs | 为外部使用者写本地 conformance run 示例 |
| U-316 | P2 | Conformance report sample | 保存一个小型 JSON report sample |
| U-317 | P2 | Conformance no-fetch public note | 明确 runner 不 remote fetch / 不执行 provider |
| U-318 | P2 | Fixture expected-fail docs | 解释 suite pass with expected failures 的语义 |
| U-319 | P2 | Generated clean guard docs | 记录哪些目录被视为 generated hygiene |
| U-320 | P2 | Package surface allowlist docs | 记录 allowlist 变更审查流程 |
| U-321 | P2 | Code drift next slice revisit | 复查 implementation evidence / acceptance 后下一步 |
| U-322 | P2 | Stable terminology drift implementation gate | 判断 start/begin fixture 是否应该落地 |
| U-323 | P2 | Glossary enforcement next slice | 选择 structured term refs 的最小实现路线 |
| U-324 | P2 | Lifecycle alias negative fixture | 如果 U-322 通过，则实现最小负例 |
| U-325 | P3 | Docs density lint feasibility | 只做 feasibility，不做 linter |
| U-326 | P3 | External citation public docs | 提供 citation registry adoption snippet |
| U-327 | P3 | Resource surface docs follow-up | 提供 resource surface non-runtime warning |
| U-328 | P3 | Runtime no-go summary refresh | 汇总哪些 runtime 仍 deferred |
| U-329 | P3 | v0.8 adoption checklist | 写最短采用检查清单 |
| U-330 | P3 | Next release naming guard | 规划 v0.8 后下一 release 的版本面守卫 |

## Recommended next batch

下一轮默认选择 U-281 到 U-290。原因：它们围绕 `#59`，风险最低，能提升验证和路由结果的可解释性，不需要启动 runtime，也不需要改公开 release 状态。
