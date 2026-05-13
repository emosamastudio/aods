# AODS public close criteria / roadmap sync packet

日期：2026-05-13
范围：U-442 到 U-451
状态：已完成；未执行公开关闭

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `6448bf6 Prepare v0.9 release candidate packet` |
| Task ledger | 通过 | 当前默认任务为 U-442 到 U-451 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## Capability close criteria

`#41` 当前不应关闭。已完成的部分足以覆盖 metadata-first capability posture，但还没有把“完整 negotiation”降级为公开 issue 范围，或另开更小的 runtime/protocol issue。

| Criteria | 当前证据 | 关闭判断 |
|---|---|---|
| Provider capability metadata | schema / compiled pilot / README 已覆盖 | 已满足 |
| Consumer requirement metadata | compiled pilot compatibility matrix 已覆盖 | 已满足 |
| Deterministic compatibility matching | validator 对 compatible / incompatible / partial / unknown 行有 gate | 已满足 |
| Unsupported reason / fallback / degraded behavior / consumer action | schema、validator、example、README 已覆盖 | 已满足 |
| Negative conformance evidence | 本轮新增 expected-failure conformance regression | 已满足 |
| Static protocol boundary | 需要一份公开可读的 metadata-only vs runtime protocol 边界说明 | 未满足 |
| Runtime negotiation scope decision | 原 issue 标题仍暗示完整 negotiation；需决定关闭并另开 runtime issue，或继续 open | 未满足 |

### Static protocol boundary

当前 AODS 支持的是静态 capability contract：

1. Provider 声明自己能提供什么能力、契约 profile、版本策略、暴露等级和 fallback posture。
2. Consumer 声明自己需要什么能力、接受什么契约 profile、版本策略和暴露等级。
3. Validator 只比较声明式 metadata，并报告 mismatch、partial、unknown 或缺失 fallback metadata。
4. AODS 不执行 provider discovery、auth exchange、dynamic probing、provider selection、fallback ranking、adapter calls 或 runtime handshake。

关闭 `#41` 前必须公开说明：若把 issue 收束为 metadata-first negotiation，则可以关闭；若坚持完整 runtime negotiation，则继续保持 open，并把 metadata work 标记为 partial completion。

## Capability negative conformance fixture

本轮新增 focused conformance regression：

| Check | Result |
|---|---|
| Test | `conformance runner captures missing capability fallback metadata as an expected negative case` |
| File | `benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` |
| Method | 复制 packaged compiled pilot 到临时目录，删除 partial capability row 和 module contract 的 fallback metadata，再用 conformance runner 断言 expected failure |
| Expected rules | `capability-fallback-metadata-required`、`capability-fallback-posture-required`、`capability-unsupported-reason-required` |
| Reason for temp fixture | 避免把刻意破坏的 corpus 文件加入 package surface，同时把负例纳入 conformance runner 行为 |

## Observability close criteria

`#59` 当前也不应关闭。validate / route 已有机器可读输出，但公开 issue 的“example outputs”和 location 字段语义还需要更明确的收束。

| Criteria | 当前证据 | 关闭判断 |
|---|---|---|
| Machine-readable validation fields | validate JSON 有 rule / level / message / remediation / location | 已满足 |
| Machine-readable routing explanation | route JSON 有 explanation.source / reason / dependency | 已满足 |
| Selected and skipped module explanation | selected 默认可见，skipped 通过 `--explain-skipped` opt-in | 已满足 |
| Suggested action / remediation | 高价值确定性规则已有 remediation | 部分满足 |
| Dependency path reporting | route dependency edges 有 selected / unselected / missing | 已满足 |
| Public sample outputs | docs/examples 有 validate / route snippets | 已满足 |
| Stable location field semantics | 本轮补充字段语义；若要关闭 issue，应同步到 README 或 public issue comment | 部分满足 |
| Telemetry / dashboard boundary | 需要再次公开确认 no-go | 部分满足 |

## Validate issue location field semantics

`validate --json` issue `location` envelope 是稳定的机器消费入口；旧的 top-level fields 保留兼容，但新消费者优先读 `location`。

| Field | Meaning | Null behavior |
|---|---|---|
| `location.module_id` | issue 所属模块 id | corpus / manifest 级问题可为 `null` |
| `location.sid` | issue 所属 section id | 非 section 问题可为 `null` |
| `location.path` | 文件路径或 schema path / reality locator path | 无稳定 path 时为 `null` |
| `location.artifact_id` | issue 所属 artifact id | 非 artifact 问题省略或为 `null` |
| `location.field` | issue 所属结构化字段 | 字段不可定位时省略或为 `null` |
| `location.evidence_id` | issue 所属 implementation evidence id | 非 evidence 问题省略或为 `null` |

Text output intentionally stays compact and does not mirror every location subfield.

## Observability telemetry no-go

AODS 当前不创建 telemetry store、dashboard、trace backend、graph database 或 full output subsystem rewrite。

| Deferred item | Reason |
|---|---|
| Telemetry store | 需要隐私、保留期限、采样、成本和 opt-in 策略 |
| Dashboard | 需要稳定 report contract 和用户场景，不应先于 CLI/report metadata |
| Trace backend | 会引入 runtime storage 和 correlation lifecycle |
| Route ranking rewrite | 当前需求是解释已有选择，不是替换选择算法 |
| Full output subsystem rewrite | 当前小步扩展足以满足 sample / issue closure 前置 |

## Public roadmap body refresh packet

建议暂不直接编辑 `#60` body。下一次公开同步可用以下正文结构替换旧的 checklist 或补为新 comment：

```markdown
## Current roadmap state after v0.8

Published release: v0.8.0
Next candidate: v0.9.0, not yet released

Closed foundation and governance work:
- stable authority / lifecycle / redaction / contract profile
- topology and implementation linkage
- evidence freshness and location diagnostics
- structured term refs
- conformance, fixture, sample, package, and release hygiene surfaces

Remaining open anchors:
- #41 capability negotiation: metadata-first capability posture is implemented; runtime/protocol negotiation remains deferred unless split into a new issue
- #59 validation/routing observability: validate/route JSON metadata and samples exist; close criteria now focus on location semantics and no telemetry/dashboard boundary

Explicit non-goals for the next release:
- no workflow runtime
- no event store
- no policy engine
- no remote gateway
- no migration executor
- no telemetry store or dashboard
- no adapter runtime discovery, auth exchange, provider selection, fallback ranking, or adapter execution
```

推荐动作：先以 comment 方式同步，等 `#41/#59` close criteria 完成后再决定是否重写 body。

## Public milestone mapping packet

当前 GitHub milestones 为空。本轮不创建 milestone。

| Public item | Suggested mapping | Reason |
|---|---|---|
| `v0.9.0` candidate | 不建 milestone，先用 release packet 管理 | 版本尚未 bump / tag / release |
| `#41` | `v0.9 candidate` 或 `later-runtime` | 取决于是否把 metadata-first scope 作为关闭口径 |
| `#59` | `v0.9 candidate` | close criteria 主要是 docs/sample/report 边界 |
| `#60` | roadmap tracker，不挂单一版本 | umbrella issue 不应伪装成 release blocker |

若后续创建 milestone，建议只创建一个 `v0.9.0` milestone，且只挂明确要在 release 前关闭的 issue，不把 runtime deferred work 塞入同一 milestone。

## 本轮结论

- `#41`：不关闭。下一步先补 public boundary note 或拆 runtime/protocol issue。
- `#59`：不关闭。下一步先同步 location semantics 和 telemetry/dashboard no-go。
- `#60`：不编辑 body。下一步先 comment-style roadmap refresh，避免把旧 checklist 大改成未发布承诺。
- Milestone：不创建。下一步先决定 release scope，再决定是否创建 `v0.9.0` milestone。

## 下一步

下一轮默认进入 U-452 到 U-461：按本 packet 决策执行公开同步、current-authority checker spike、implementation / stale evidence fixtures、acceptance freshness gate decision、archive link audit、historical label expansion、operations / task-ledger automation decision，以及 GitHub release install smoke plan。
