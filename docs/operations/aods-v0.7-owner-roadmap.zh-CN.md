# AODS v0.7 Owner Roadmap

状态：当前 owner 决策
日期：2026-05-02
适用范围：裁剪 `#60/#29-#59/#28` 到 v0.7 可执行范围

## 负责人结论

v0.7 不追求把 issue 面板里的 governance roadmap 全部实现。v0.7 的目标是建立 **最小可验证的 specification governance foundation**，并用 `#28` 的多 repo 真实事故作为第一个 concrete pilot。

GitHub issue 是输入信号，不是执行命令。最终优先级按 AODS 的信任边界、可验证性、依赖关系和 spec sprawl 风险决定。

## v0.7 must-build

| Issue | Owner 决策 | v0.7 最小切片 | 非目标 |
|---|---|---|---|
| `#29` implementation surfaces exceed specification | 必做 | 定义 “No stable surface without AODS authority”；术语包括 `specified`、`implemented`、`partial`、`unspecified`、`experimental`、`over-implemented`；给出默认政策和 remediation flow | 不做语言级 implementation scanner；不阻止 internal experimentation |
| `#32` stability / exposure lifecycle | 必做 | 定义最小 lifecycle / exposure state：`internal`、`experimental`、`local-only`、`adapter-facing`、`stable`、`deprecated`、`removed`；定义允许转换和至少一个 validator warning | 不做复杂 approval matrix；不做完整 operational state machine |
| `#31` redaction / sensitive-surface policy | 必做 | 定义最小 sensitive classes：`secret`、`credential`、`token`、`local_path`、`runtime_payload`、`debug_payload`；定义 `omitted`、`redacted`、`handle-only`、`debug-only` policy；给出至少一个负例 validator target | 不做 redaction SDK；不承诺自动识别所有敏感值 |
| `#30` contract completeness profiles | 必做但裁剪 | 只落 v0.7 最小 profile：`read-model`、`command`，以及 `implementation-linkage` pilot profile；每类只定义稳定消费所需最少字段 | 不覆盖所有 surface family；不一次性标准化 resource / artifact / adapter / event / export |
| `#42` validation severity / gating | 必做最小版 | 定义新 governance findings 的 severity：`info`、`warning`、`strict-error`、`release-blocking`、`security-blocking`、`drift-blocking`；说明 compile / validate / strict / reality / release gate 的最小关系 | 不重写整个 validator 输出体系；不一次性迁移所有旧 warning |
| `#28` implementation repo visibility | 必做 pilot | 加 `project_topology.implementation_repos[]` 和 module-level `implementation` linkage；`validate --reality` 输出 linked impl repo 摘要或未检查告警 | 不做跨 repo CI dispatch；不做 codegen fingerprint drift gate；不关闭为 duplicate |

## v0.7 should-build if foundation finishes cleanly

| Issue | Owner 决策 | 最小切片 |
|---|---|---|
| `#40` schema versioning / compatibility | 最小 guidance，可实现则实现 | stable profile 必须有 version 字段或解释为何沿用 corpus/schema version；先服务 v0.7 新增 profiles |
| `#34` cross-surface refs | 设计优先，实现可后置 | 定义 ref owner / target / resolution status / unresolved severity；先服务 implementation linkage 和 profile refs |

## defer to v0.8+

| Issue | 决策理由 |
|---|---|
| `#33` command / receipt / event triads | 高价值但会扩大 write-capable surface 范围；先让 `command` completeness profile 稳定 |
| `#35` snapshot / freshness / watermark metadata | 需要 read-model profile 后再标准化 |
| `#36` adapter-facing minimum contract profile | 与 `#41` 强耦合；先保留 exposure state，不急着完整 adapter contract |
| `#37` lifecycle state machines | 过早标准化会锁死具体业务形态 |
| `#38` evidence / provenance requirements | 重要但依赖 completeness、refs、severity 成熟 |
| `#39` correction / supersession semantics | event-specific；等 event profile 进入主线 |
| `#41` capability negotiation | 依赖 `#36/#40`，v0.7 做会过早 |
| `#43-#52` | workflow / engineering support，等 foundation 和 core mechanics 后再排 |
| `#54-#59` | authoring/documentation quality，适合 v0.8/v0.9 或社区贡献 |

## legacy issue 决策

| Issue | Owner 决策 |
|---|---|
| `#17` empty `boot_by_touch` advisory | 保留，P2。是真 DX 问题，但不改变 AODS 信任边界。 |
| `#10` capsule diagnostic | 保留，P2。局部验证体验优化。 |
| `#9` shared invariant brittleness | 保留，P2。等 severity/gating 最小模型后再改，避免削弱同步约束。 |
| `#16` compile docs | 倾向关闭。README 当前已覆盖 compile / strict compile / source-first workflow。 |
| `#13` changelog delta limit | 降级或关闭。属于局部 ergonomics，不进入 v0.7 主线。 |

## v0.7 acceptance gate

v0.7 owner-level gate：

1. P0 foundation 不只是写文档，至少有 schema/spec/examples 或 validator target 之一落地。
2. 新增 governance 规则必须有明确 severity 和 gate 行为。
3. `#28` pilot 必须能让两 repo / 多 repo topology 在 `validate --reality` 输出中可见。
4. `npm run validate:all` 必须通过。
5. 如果改 benchmark-facing public wording，必须从 generator 更新并同步报告。

## explicit non-goals

1. 不在 v0.7 一次性覆盖所有 surface family。
2. 不实现跨语言 implementation scanner。
3. 不实现跨 repo CI dispatch 或 codegen fingerprint gate。
4. 不把 adapter capability negotiation 放进 v0.7 release blocker。
5. 不因为 issue label 是 P0/P1 就自动执行；所有 issue 必须经过 owner 裁剪。
