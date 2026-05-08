# AODS GitHub Public Sync Triage

状态：U-068 / U-075 已完成
日期：2026-05-08
范围：复盘 GitHub issue 本地覆盖与公开状态差异，并记录 U-075 public sync 执行结果

## 结论

`#54-#58` 的本地覆盖已经明显领先于 GitHub issue 状态。U-072 已把 public docs navigation 指向已完成的 example packs、glossary registry 和 external citation 用法；U-074 release readiness gate 已通过。U-075 已创建 draft PR `#63`，并把已覆盖 issue 设置为 PR 合并时自动关闭。

`#60` 是 umbrella roadmap，继续保持 open。`#41` 的完整 capability negotiation handshake 仍 deferred，继续保持 open。`#59` 的 CLI JSON explanation enrichment 仍是 U-079 residual，也继续保持 open。

## 公开同步快照

| Issue | GitHub 状态 | 本地覆盖 | 缺口 | 建议公开动作 |
|---|---|---|---|---|
| `#54` documentation density rules | OPEN，PR `#63` 合并时关闭 | `spec-aop` 既有规则、U-049 good/bad examples、authoring guidance 和 U-072 public navigation | 等待 PR review / merge | 已通过 PR `#63` 设置 close-on-merge |
| `#55` human-surface sync quality metrics | OPEN，PR `#63` 合并时关闭 | U-048 已定义 exact invariant、semantic coverage、omitted constraint、stale example、authority mismatch、sync report vocabulary | 等待 PR review / merge | 已通过 PR `#63` 设置 close-on-merge |
| `#56` canonical examples | OPEN，PR `#63` 合并时关闭 | U-051 到 U-055 加 U-058 已覆盖 read-model、command、event、adapter、artifact/export/policy-gate、resource 六包，U-072 已集中导航 | 等待 PR review / merge | 已通过 PR `#63` 设置 close-on-merge |
| `#57` glossary registry | OPEN，PR `#63` 合并时关闭 | U-060、U-062、U-063、U-064 已覆盖 boundary、schema/compile、validator、canonical example pack，U-072 已给公开入口 | 等待 PR review / merge | 已通过 PR `#63` 设置 close-on-merge |
| `#58` external citation metadata | OPEN，PR `#63` 合并时关闭 | U-061、U-065、U-066、U-067 已覆盖 boundary、schema/compile、validator、canonical example pack，U-072 已给公开入口 | 等待 PR review / merge；U-082 可继续做 stale/current hygiene | 已通过 PR `#63` 设置 close-on-merge |
| `#60` specification governance roadmap | OPEN，已留言 | v0.7 到 v0.11 多数 foundation、mechanics、quality tasks 已本地推进 | roadmap 仍是 umbrella；后续 drift/release/public sync 还在进行 | 保持 open；已在 `#60` 留言 |
| `#41` capability negotiation | OPEN，已留言 | U-034 已完成 metadata-only matching boundary；U-054 有 adapter example pack | full negotiation handshake、provider discovery、auth/fallback runtime 仍 deferred | 保持 open；已在 `#41` 留言 |
| `#59` validation/routing observability | OPEN，已留言 | U-046 已完成 spec vocabulary；U-076 已补 route help | CLI JSON explanation enrichment 仍是 U-079 residual | 保持 open；已在 `#59` 留言 |

## 审批矩阵

| 动作 | 需要 owner 批准 | 原因 |
|---|---|---|
| issue comment | 是 | 会改变公开项目状态，应先确认措辞和是否提及未发布本地提交 |
| issue close | 是 | 关闭意味着 public acceptance 完成，需和 public docs / release 状态一致 |
| issue label update | 是 | 会改变 backlog 管理语义 |
| PR / release sync | 是 | 需要确认 branch、release note 和是否包含 `MEMORY.md` 排除检查 |

U-075 已由 owner 授权执行；后续 release、PR merge、直接关闭 issue 或 label 变更仍按本矩阵单独确认。

## 下一步

1. PR `#63` 保持 draft review surface；如后续准备合并，先确认 final validation 和是否需要 ready-for-review。
2. 若后续包含 release，先确认目标 version bump、release branch 和 tag；当前 package 仍为 `0.7.0`。
3. 对 `#41/#59/#60/#13` 保持 open，不把 deferred runtime 或低优先级 ergonomics 说成已完成。

## 非目标

1. 不发布 release、不创建 tag、不 bump version。
2. 不直接关闭 issue；已覆盖 issue 只通过 PR `#63` close-on-merge 关联。
3. 不把 `#41` 的 deferred handshake、`#59` 的 CLI JSON enrichment 或 `#60` 的 umbrella roadmap 混同为已完成。
