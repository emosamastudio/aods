# AODS GitHub 同步审批矩阵

状态：当前审批矩阵
日期：2026-05-07

## GitHub 快照

| 项 | 状态 |
|---|---|
| Repo | `emosamastudio/aods` |
| URL | `https://github.com/emosamastudio/aods` |
| 可见性 | public |
| 默认分支 | `main` |
| 最近远端 push | 2026-04-23T07:57:26Z |
| open PR | 0 |
| open issues | 37 |
| 本文动作 | 只制定审批矩阵，不评论、不关闭、不打 label、不创建 PR、不 push |

## 外部动作原则

1. 任何 GitHub 公开写操作都需要 owner 明确确认。
2. issue 关闭应发生在对应 PR merge 之后，不在本地 dirty 阶段提前关闭。
3. 对“只完成最小边界、未完成完整机制”的 issue，优先评论说明裁剪范围，不直接关闭。
4. release 只走 GitHub Releases；npm registry publish 不是当前完成条件。

## PR 审批矩阵

| 动作 | 建议 | 需要确认 | 风险 |
|---|---|---|---|
| 创建 governance/docs PR | 可选，建议先做 | 是否按 `docs: add AODS operations governance` 单独 PR | docs 文件多且均为 untracked；需要确认 `MEMORY.md` 是否排除。 |
| 创建 v0.7 semantic PR | 建议 | 是否将 U-021 review fix 合并在同一个 semantic PR 中 | 语义、runtime、schema、example、test 高耦合；拆细需要 hunk staging。 |
| 创建 benchmark evidence PR / commit | 可选 | generated reports 是否作为 release evidence 提交 | generated JSON / reports 有 churn，需避免混入行为 PR。 |
| 创建 release PR 或直接 release branch | 暂不做 | v0.7 版本号、release note、是否 draft release | 需要先完成 dirty 归因和 owner 审批。 |

## 可在 PR merge 后关闭的 issues

这些 issue 在本地 v0.7 worktree 中已有对应实现或最小设计边界，但应等 PR merge 后再关闭。

| Issue | 本地任务 | 建议公开动作 | 关闭条件 |
|---|---|---|---|
| `#29` Define AODS governance for implementation surfaces that exceed specification | U-003 | PR merge 后评论并关闭 | authority governance spec merge |
| `#32` Define stability and exposure lifecycle for AODS-declared surfaces | U-004 | PR merge 后评论并关闭 | lifecycle / exposure state machine merge |
| `#31` Make redaction and sensitive-surface rules first-class AODS validation targets | U-005、U-021 | PR merge 后评论并关闭 | redaction schema + validator + compile mirror merge |
| `#30` Define contract completeness profiles for AODS surface types | U-006、U-021 | PR merge 后评论并关闭 | contract profile schema + validator + compile mirror merge |
| `#28` AODS authoring loop can mask the existence of a separate implementation repository entirely | U-007、U-008、U-009、U-010 | PR merge 后评论并关闭 | project topology + implementation linkage + reality summary merge |
| `#42` Define validation severity levels and gating policy | U-011 | PR merge 后评论并关闭 | validation severity / gate matrix merge |
| `#40` Define schema versioning and compatibility policy for stable surfaces | U-012、U-021 | PR merge 后评论并关闭 | schema versioning policy + mirror validation merge |
| `#34` Define cross-surface reference integrity and unresolved-ref semantics | U-013 | PR merge 后评论并关闭或标记 follow-up | spec boundary merge；若 owner 认为需要 runtime resolution，则保留 |
| `#36` Define adapter-facing minimum contract profile | U-014 | PR merge 后评论并关闭 | minimum adapter-facing contract merge |
| `#53` Define release alignment checklist for AODS packages and generated corpora | U-015 | PR merge 后评论并关闭 | GitHub Releases-only strategy merge |
| `#17` boot_by_touch is silently empty by default with no tooling guidance or documentation | U-016 | PR merge 后评论并关闭 | large-corpus advisory merge |
| `#10` Make capsule-shorter-than-detail warnings easier to diagnose | U-017 | PR merge 后评论并关闭 | improved warning diagnostics merge |
| `#9` Reduce brittle invariant duplication in paired surfaces | U-018 | PR merge 后评论并关闭 | normalized invariant matching merge |

## 应评论但保留 open 的 issues

| Issue | 原因 | 建议公开动作 |
|---|---|---|
| `#60` AODS specification governance roadmap | umbrella roadmap，v0.7 只完成一批 foundation / pilot / validation 工作，代码漂移仍有后续 | PR merge 后评论进度摘要，保留 open 或拆成新 milestone。 |
| `#41` Define capability negotiation for agent and adapter consumers | U-014 只落 minimum contract，不做 negotiation handshake | 评论说明已完成 minimum adapter contract，完整 negotiation deferred。 |
| `#13` changelog.delta 300-character hard limit | 已被判断为 P3 / deferred，且已有留言 | 当前不动作。 |

## 暂不动作的 deferred / later issues

| 范围 | Issue | 处理 |
|---|---|---|
| write/event/adapter mechanics | `#33`、`#35`、`#37`、`#38`、`#39` | 暂不动；等 v0.7 foundation merge 后重新排队。 |
| later research / profiles | `#43` 到 `#52`、`#54` 到 `#59` | 暂不动；避免把 v0.7 扩成大而全规范。 |

## 需要 owner 确认的问题

1. 是否按 `aods-dirty-worktree-attribution.zh-CN.md` 的 4 组拆分创建 PR / commit。
2. `MEMORY.md` 是否进入公开 repo，还是保留为本地 agent memory。
3. `#34` 是否在 spec boundary merge 后关闭，还是保留到 runtime cross-corpus resolution。
4. `#60` 是继续作为 umbrella open issue，还是在 v0.7 PR merge 后关闭并创建新的 drift-focused issue。
5. benchmark generated JSON / reports 是否作为 release evidence 提交。
