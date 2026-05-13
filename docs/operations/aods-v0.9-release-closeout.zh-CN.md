# AODS v0.9 release closeout

日期：2026-05-13
范围：U-572 到 U-581
状态：已完成

## 结论

`v0.9.0` 已发布到 GitHub Release，tag 已推送，远端 tag source install smoke 已通过。当前公开 open issue 为 `#60` 和 `#64`：`#60` 继续作为 roadmap tracker，`#64` 继续跟踪 runtime/protocol negotiation，均不在本轮关闭。

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 一致，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `ea9e44c Bump release surfaces to 0.9.0` |
| Tag state | 通过 | 开工时 `v0.9.0` tag 不存在，符合 U-572 执行前置 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工项 | 无 | 上轮成果合格，直接进入发布执行 |

## Release execution

| 项 | 结果 |
|---|---|
| tag | `v0.9.0` |
| tag target | `ea9e44c7819f450f636d8157bd0eade91c893cad` |
| release URL | `https://github.com/emosamastudio/aods/releases/tag/v0.9.0` |
| draft | false |
| prerelease | false |
| assets | `[]` |
| package dry-run | `aods@0.9.0`, entryCount=61 |

Release body 覆盖：

- structured term references
- evidence freshness / location diagnostics
- validation and routing observability metadata
- metadata-first capability support
- capability mismatch and event correction graph examples
- benchmark-only migration dry-run static report
- current non-goals for runtime, replay, policy engine, gateway, migration executor, telemetry store, dynamic probing, and adapter execution

## Source install smoke

从远端 tag 安装：

```bash
npm install --prefix "$tmp" git+https://github.com/emosamastudio/aods.git#v0.9.0
```

| Check | Result |
|---|---|
| installed package | `aods@0.9.0` |
| CLI help | PASS |
| packaged compiled-pilot strict validation | PASS |
| packaged fixture smoke | PASS |
| packaged conformance run | PASS |

## Public issue closeout

| Issue | 状态 | 本轮动作 | 说明 |
|---|---|---|---|
| `#60` | open | posted post-release comment | roadmap tracker remains open for next planning slice |
| `#64` | open | no close | runtime/protocol negotiation remains deferred and tracked here |
| `#59` | closed | no action | metadata/reporting scope already closed |
| `#41` | closed | no action | metadata-first capability scope already closed |

`#60` post-release comment:

`https://github.com/emosamastudio/aods/issues/60#issuecomment-4439759877`

## Installed skill decision

Decision: do not mutate local installed skill files in this round.

Reason:

1. The packaged repo skill is release-aligned and included in `aods@0.9.0`.
2. Local installed skill mutation changes operator environment, not repository release state.
3. The owner did not explicitly request installing / overwriting local skill files in this round.

## Knowledge base decision

Decision: no KB write in this round.

Reason: U-580 is conditional on explicit owner request for a project decision note. This round records the release closeout inside the repository operations authority; no separate KB write was requested.

## Post-v0.9 task discovery

Next pool focuses on four threads:

1. Public roadmap and issue body hygiene after the release.
2. Runtime/protocol static prerequisite work for `#64` without implementing runtime calls.
3. Release/adoption evidence hardening after `v0.9.0`.
4. Code drift and validation hardening that can improve trust without adding new runtime systems.

No milestone is created in this round. Current GitHub milestones remain empty.

## Retrospective

| 主题 | 结论 |
|---|---|
| What worked | Keeping version bump, tag/release, and source install smoke as separate auditable tasks made the release state explicit. |
| What to keep | Keep `npm run release:hygiene`, package surface guard, generated clean guard, skill alignment test, and tag source install smoke as release gates. |
| What to avoid | Do not collapse metadata support into runtime promises; keep `#64` open until protocol records and risk boundaries are explicit. |
| Next best route | First refresh public roadmap/body state, then define runtime/protocol static records and fixture gates before any implementation discussion. |
