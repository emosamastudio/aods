# AODS GitHub Public Sync Triage

状态：U-068 已完成
日期：2026-05-08
范围：只读复盘 GitHub issue 本地覆盖与公开状态差异；不执行公开写操作

## 结论

`#54-#58` 的本地覆盖已经明显领先于 GitHub issue 状态。U-072 已把 public docs navigation 指向已完成的 example packs、glossary registry 和 external citation 用法；下一步应先执行 U-074 release readiness gate，再在 U-075 中统一评论或关闭相关 issue。

`#60` 是 umbrella roadmap，继续保持 open。`#41` 的完整 capability negotiation handshake 仍 deferred，继续保持 open。

## 只读审查快照

| Issue | GitHub 状态 | 本地覆盖 | 缺口 | 建议公开动作 |
|---|---|---|---|---|
| `#54` documentation density rules | OPEN | `spec-aop` 既有规则、U-049 good/bad examples、authoring guidance 和 U-072 public navigation | public issue 尚未同步本地覆盖 | U-074 后 owner 批准评论；可建议关闭 |
| `#55` human-surface sync quality metrics | OPEN | U-048 已定义 exact invariant、semantic coverage、omitted constraint、stale example、authority mismatch、sync report vocabulary | public issue 尚未同步本地覆盖 | U-074 后 owner 批准评论；可建议关闭 |
| `#56` canonical examples | OPEN | U-051 到 U-055 加 U-058 已覆盖 read-model、command、event、adapter、artifact/export/policy-gate、resource 六包，U-072 已集中导航 | public issue 尚未同步本地覆盖 | U-074 后 owner 批准评论；建议关闭 |
| `#57` glossary registry | OPEN | U-060、U-062、U-063、U-064 已覆盖 boundary、schema/compile、validator、canonical example pack，U-072 已给公开入口 | public issue 尚未同步本地覆盖 | U-074 后 owner 批准评论；建议关闭 |
| `#58` external citation metadata | OPEN | U-061、U-065、U-066、U-067 已覆盖 boundary、schema/compile、validator、canonical example pack，U-072 已给公开入口 | public issue 尚未同步本地覆盖 | U-074 后 owner 批准评论；建议关闭 |
| `#60` specification governance roadmap | OPEN | v0.7 到 v0.11 多数 foundation、mechanics、quality tasks 已本地推进 | roadmap 仍是 umbrella；后续 drift/release/public sync 还在进行 | 保持 open；release/readiness 后再追加进度评论 |
| `#41` capability negotiation | OPEN | U-034 已完成 metadata-only matching boundary；U-054 有 adapter example pack | full negotiation handshake、provider discovery、auth/fallback runtime 仍 deferred | 保持 open；不要关闭为已完成 |

## 审批矩阵

| 动作 | 需要 owner 批准 | 原因 |
|---|---|---|
| issue comment | 是 | 会改变公开项目状态，应先确认措辞和是否提及未发布本地提交 |
| issue close | 是 | 关闭意味着 public acceptance 完成，需和 public docs / release 状态一致 |
| issue label update | 是 | 会改变 backlog 管理语义 |
| PR / release sync | 是 | 需要确认 branch、release note 和是否包含 `MEMORY.md` 排除检查 |

## 下一步

1. 执行 U-074 release readiness gate，确认当前 v0.11 累积变更可对外说明。
2. 执行 U-075 public sync execution；评论/关闭 issue 前再次确认 staged set 不含 `MEMORY.md`。
3. 对 `#41/#60` 保持 open，只同步当前 metadata-only / roadmap 进度，不把 deferred runtime 说成已完成。

## 非目标

1. 本轮不评论、不关闭、不改 label。
2. 本轮不创建 PR、不发布 release。
3. 本轮不把 `#41` 的 deferred handshake 混同于 U-034/U-054 的 metadata-only coverage。
