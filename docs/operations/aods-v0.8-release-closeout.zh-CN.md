# AODS v0.8 发布收口记录

状态：已完成
日期：2026-05-13

## 结论

PR `#63` 已合并，GitHub Release `v0.8.0` 已创建，package / README / packaged skill release surface 已统一到 `0.8.0` / `v0.8.0`。本轮完成 U-267、U-269、U-270，S31 任务池清空。

## 发布事实

| 项 | 结果 |
|---|---|
| PR | `#63` merged |
| Merge commit | `468eb9f2d19623eb2016d842a6c687e91d7da929` |
| Version bump commit | `661d66a` |
| Release | `https://github.com/emosamastudio/aods/releases/tag/v0.8.0` |
| Release state | published, non-draft, non-prerelease |
| Package version | `0.8.0` |
| Release target | `main` |
| MEMORY policy | `MEMORY.md` remains untracked and excluded |

## Issue close verification

PR `#63` recognized and closed the intended close-on-merge issue set:

`#33`、`#35`、`#37`、`#38`、`#39`、`#43`、`#44`、`#45`、`#46`、`#47`、`#48`、`#49`、`#50`、`#51`、`#52`、`#54`、`#55`、`#56`、`#57`、`#58`。

The remaining open public issues are intentionally deferred:

| Issue | Reason |
|---|---|
| `#13` | changelog ergonomics follow-up, not release-blocking |
| `#41` | capability negotiation remains future protocol/runtime work |
| `#59` | observability metadata follow-up remains open |
| `#60` | governance roadmap remains umbrella / next-stage planning |

## Verification

| Gate | Command | Result |
|---|---|---|
| Release hygiene | `npm run release:hygiene` | PASS on `aods@0.8.0` |
| Docs links | included in release hygiene | `missing=0` |
| Secret-like placeholder scan | included in release hygiene | `hits=0` |
| Package surface | included in release hygiene | `entry_count=61 missing=0 unexpected=0` |
| Generated clean | included in release hygiene | `dirty_entries=0` |
| Skill package regression | included in release hygiene | 2 tests pass |
| Corpus validation | included in release hygiene | root / seven-plane / compiled-pilot PASS |

## Retrospective

What worked:

- Keeping merge, version bump, release creation, and issue verification as separate gates avoided treating a local green build as a public release.
- The aggregate release hygiene command reduced release risk because it covered docs links, placeholder scanning, package surface, generated output, skill alignment, and validation together.
- The close-on-merge issue list matched the intended scope after PR body refresh, so public issue closure did not require manual cleanup.

What to keep:

- Continue to keep `MEMORY.md` local-only.
- Keep GitHub Releases as the release channel unless the owner explicitly changes the policy.
- Continue doing version surface checks across `package.json`, lockfile, README files, and packaged skills before every public release.

What remains:

- Open public issues `#13/#41/#59/#60` are the only current public backlog anchors.
- Next milestone planning should start from those issues and the existing runtime / governance no-go boundaries, not by reopening already closed conformance-era work.

## Next milestone candidates

| Candidate | Value | Boundary |
|---|---|---|
| Governance roadmap refinement | Turns remaining umbrella work into smaller verifiable slices | no runtime system by default |
| Observability metadata follow-up | Improves validation/routing explanations without building a telemetry store | stdout / JSON report first |
| Capability negotiation follow-up | Advances adapter compatibility from metadata toward protocol design | no handshake/runtime until prerequisites pass |
| Changelog ergonomics follow-up | Improves authoring quality for multi-change releases | keep deterministic validation limits |
