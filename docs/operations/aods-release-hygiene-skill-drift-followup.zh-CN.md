# AODS 发布后卫生与 Skill 漂移复审

状态：已完成
日期：2026-05-13
覆盖任务：U-301 到 U-310

## 结论

v0.8 发布后的公开状态与本地发布面一致：GitHub Release `v0.8.0` 为 published / non-draft / non-prerelease，tag 存在，package fresh install smoke 通过，公开 open issues 当前只剩 `#60/#59/#41`。

本轮没有启用 CI，也没有覆盖用户本地安装的 `aods-use` skill。原因是当前高价值动作是确认发布后入口和采用路径不误导接手者；CI 与本地 skill 覆盖都需要 owner 单独决定触发方式和影响范围。

## Release-to-Issue Close Report

| 分类 | Issue | 当前状态 | 证据 |
|---|---|---|---|
| v0.8 close-on-merge closed | `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58` | closed by PR `#63` merge | `aods-v0.8-release-closeout.zh-CN.md` |
| post-v0.8 manually closed | `#13` | closed as completed | U-274 public close execution |
| still open | `#60/#59/#41` | intentionally open | `gh issue list --state open` snapshot |

Closeout policy:

- Do not reopen closed conformance-era issues unless new evidence contradicts the v0.8 closeout.
- Keep `#60` as the umbrella governance tracker until its public body can be updated from a reviewed traceability table.
- Keep `#59` and `#41` open because validator observability and capability negotiation still have planned follow-up slices.

## Stale Reference Audit

| Surface | Finding | Action |
|---|---|---|
| `docs/operations/README.md` maintenance note | Current note still said U-267/U-269/U-270 were blocked by unmerged PR and unreleased v0.8. | Updated to current post-v0.8 state. |
| `docs/operations/aods-v0.8-release-closeout.zh-CN.md` | Remaining open issue list still included `#13`. | Updated remaining open anchors to `#60/#59/#41`; recorded `#13` as closed after release. |
| historical readiness docs | Older release readiness / PR readiness files intentionally preserve pre-merge no-go state. | Left unchanged; they are historical evidence, not current authority. |
| handoff risk table | Risk section is long and mixes historical risks with current risks. | Added a current-priority risk snapshot before the historical table instead of deleting prior traceability. |

Rule for future stale-reference cleanup: patch current authority surfaces first (`aods-task-ledger`, `aods-handoff`, operations index, latest closeout docs), and leave historical round documents intact unless they are explicitly marked as current.

## Handoff Risk Compression

Current-priority risks are now summarized in `aods-handoff.zh-CN.md` before the longer historical table:

| Risk | Current handling |
|---|---|
| Local-only memory file | Keep `MEMORY.md` untracked and excluded from staged set. |
| Release surface drift | Run `npm run release:hygiene` before any future release. |
| Public issue state drift | Treat `#60/#59/#41` as the only open public anchors. |
| Skill install drift | Compare packaged skill with installed skill before asking the owner to update. |
| Runtime scope creep | Keep runtime work behind explicit entry gates. |

## Operations Index Pruning Plan

The operations index is now useful but too long for first-time orientation. Recommended split:

| Step | Action | Acceptance |
|---|---|---|
| 1 | Keep `docs/operations/README.md` as the current top-level index. | It contains only current authority docs plus milestone families. |
| 2 | Move old per-round doc listing into an archive index. | Historical documents remain reachable but stop dominating the first screen. |
| 3 | Add a short "current handoff pack" section. | New agent can load 6 to 10 docs before deep history. |
| 4 | Keep generated / benchmark wording warnings near the top. | Release and README edit hazards stay visible. |

No archive split is performed in this round because it would touch many links without increasing the current release confidence.

## Task Ledger Archive Split Plan

The task ledger has passed 300 completed tasks, so the current file is doing two jobs: current authority and history archive. Recommended split:

| Step | Action | Acceptance |
|---|---|---|
| 1 | Keep metadata, current lock, unfinished tasks, blocked tasks, and next recommendations in `aods-task-ledger.zh-CN.md`. | Current state fits in one short read. |
| 2 | Move completed rows before the latest milestone to `docs/operations/archive/`. | Historical evidence remains searchable and linked. |
| 3 | Keep the latest 30 to 50 completed rows in the live ledger. | Recent continuity remains available without huge scroll. |
| 4 | Add a checksum or date marker for moved history. | Future agents can verify no rows were dropped. |

Do not perform this split in the same round as semantic code changes or public release operations.

## Release Hygiene CI Reconsideration

Decision: do not enable CI yet.

Rationale:

- `npm run release:hygiene` is already a reliable local aggregate gate for docs links, secret-like placeholders, package surface, generated cleanliness, skill package regression, and corpus validation.
- Current repository has no existing workflow baseline, so adding CI now would introduce platform noise without a new release blocker being observed.
- CI should be reconsidered after the operations index / task ledger archive split, because a smaller governance surface will reduce false positive triage cost.

Re-entry trigger:

- A release or PR regresses a check that `release:hygiene` would have caught locally.
- External contributors begin opening PRs without local project context.
- Owner explicitly wants GitHub checks as a merge gate.

## Package Install Smoke Repeat

Command path:

```bash
source ~/.zshrc >/dev/null 2>&1 || true
proxy_on >/dev/null 2>&1 || true
tmp=$(mktemp -d)
cd "$tmp"
npm init -y >/dev/null
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.8.0
npx aods --help
```

Result:

| Check | Result |
|---|---|
| install from GitHub tag | pass |
| dependency audit | 0 vulnerabilities |
| packaged CLI help | pass |
| CLI surface | includes validate, route, hook, upgrade, compile, conformance, fixture, scaffold |

## GitHub Release Artifact Audit

| Item | Result |
|---|---|
| Release URL | `https://github.com/emosamastudio/aods/releases/tag/v0.8.0` |
| Release state | published |
| Draft / prerelease | false / false |
| Target | `main` |
| Published at | `2026-05-12T19:13:42Z` |
| Tag ref | `661d66a1f153d481f1c19feadeea218e4656b4cd refs/tags/v0.8.0` |
| Assets | none |

No corrective GitHub action was needed.

## Installed Skill Drift Check

Repo packaged skill is newer than the locally installed skill under `/Users/emosama/.agents/skills/aods-use`.

| Area | Installed local skill | Repo packaged skill |
|---|---|---|
| skill version | `0.1.0` | `0.8.0` |
| aligned release | `aods_v3` | `v0.8.0` |
| lanes | authoring / sync / routing / validation / release alignment | adds `upgrade` |
| command discovery | no explicit `aods --help` rule | explicit `aods --help` rule |
| fixture / conformance | not mentioned | `aods fixture smoke` / `aods conformance run` |
| source of truth | older installed CLI / repo authoring paths | package, bin, schema, spec |

Risk: an agent using the installed skill may miss current CLI commands or release-alignment expectations.

## Skill Install / Update Route Plan

Recommended route:

1. Do not overwrite the installed skill silently.
2. If the owner asks to update the local skill, copy `skills/aods-use/SKILL.md` and `skills/aods-use/skill.json` into `/Users/emosama/.agents/skills/aods-use/`.
3. After updating, re-open the installed `SKILL.md` and verify it contains version alignment, `upgrade`, fixture/conformance, and `aods --help`.
4. Run the repo skill package regression through `npm run release:hygiene`.

This round stops at drift detection and update planning.

## Verification

| Gate | Result |
|---|---|
| Previous round quality review | pass |
| `npm run release:hygiene` before and after edits | pass |
| v0.8 fresh install smoke | pass |
| GitHub release audit | pass |
| GitHub open issue snapshot | `#60/#59/#41` |
