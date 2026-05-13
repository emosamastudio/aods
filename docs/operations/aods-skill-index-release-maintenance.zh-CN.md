# AODS skill / index / release maintenance gates

日期：2026-05-13
任务：U-352 到 U-361
阶段：S41 skill / governance-surface maintenance；S42 release trigger policy

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| 最新提交 | 通过 | `8237134 Plan structured term refs and evidence freshness` 已推送 |
| 任务台账 | 通过 | U-342 到 U-351 已完成，下一批默认为 U-352 到 U-361 |
| 公开事项 | 通过 | open issues 仍为 `#60/#59/#41` |
| 质量门禁 | 通过 | `npm run release:hygiene` 通过 |

返工结论：无返工项。上一轮成果合格，可以进入 U-352 到 U-361。

## U-352：package skill install update execution decision

决策：本轮不覆盖本机已安装的 `aods-use` skill。

原因：

- 当前回合目标是维护面决策和发布边界，不是改变本机全局 agent 配置。
- 现有工作规则仍是：只有 owner 明确要求“更新本地已安装 skill”时，才复制仓库内 packaged skill 到 `/Users/emosama/.agents/skills/aods-use/`。
- 仓库内 packaged skill 已经是当前发布面的权威版本；本地 installed skill drift 已被记录，不影响仓库发布面。

可执行更新步骤：

```bash
cp skills/aods-use/SKILL.md /Users/emosama/.agents/skills/aods-use/SKILL.md
cp skills/aods-use/skill.json /Users/emosama/.agents/skills/aods-use/skill.json
sed -n '1,120p' /Users/emosama/.agents/skills/aods-use/SKILL.md
npm run release:hygiene
```

验收：installed skill 包含 version alignment、`upgrade` lane、fixture/conformance command、`aods --help` discovery rule。

## U-353：packaged skill drift regression follow-up

当前 drift：

| Area | Installed local skill | Repo packaged skill |
|---|---|---|
| version alignment | absent | `v0.8.0` / `0.8.0` |
| lane vocabulary | authoring / sync / routing / validation / release | adds `upgrade` |
| fixture / conformance | absent | `aods fixture smoke` / `aods conformance run` |
| CLI discovery | absent | `aods --help` |
| release surface | generic | explicit release/package compatibility markers |

Recommended regression expansion:

| Regression | Acceptance |
|---|---|
| packaged skill mentions every shipped CLI family | validate/route/hook/upgrade/compile/conformance/fixture/scaffold all present |
| packaged skill release version matches package version | release tag and package version checked together |
| installed skill drift detector remains read-only | check reports drift without writing `/Users/emosama/.agents` |
| trigger contract stays narrow | generic README edits do not trigger AODS-specific workflow |

Do not make the regression depend on the owner machine's installed skill. The test should only validate packaged release files; installed drift remains an operations check.

## U-354：task ledger archive split execution plan

The current task ledger has more than 350 completed rows. It still works as authority, but it is increasingly expensive as a first read.

Recommended split:

| Step | Action | Acceptance |
|---|---|---|
| 1 | Keep current metadata, current lock, unfinished tasks, blocked tasks, and latest 50 completed rows in live ledger. | New agent can find current state quickly. |
| 2 | Move older completed rows into `docs/operations/archive/aods-task-ledger-completed-YYYYMMDD.zh-CN.md`. | All historical rows remain searchable. |
| 3 | Add archive pointer and row count to live ledger. | No completed task silently disappears. |
| 4 | Run docs link check and `git diff --check`. | Split is mechanical and reversible. |

Do not split during a semantic schema/validator implementation round.

## U-355：operations index current-pack split execution plan

The operations index should stop being a flat list of almost every historical document.

Recommended structure:

1. Current authority pack: task ledger, handoff, round log, progress ledger, operations README, latest task batch docs.
2. Current implementation planning pack: active gate docs for `#60/#59/#41`, structured term refs, release trigger matrix.
3. Historical milestone pack: v0.7, v0.8, conformance, release closeout docs.
4. Archive index: everything else, grouped by phase.

Acceptance: first screen tells a new agent what to read now; historical traceability remains linked but no longer dominates the page.

## U-356：current handoff pack pruning

The handoff file should be a short current-state bridge, not a full history mirror.

Recommended pruning:

| Keep in live handoff | Move or summarize |
|---|---|
| one-line current state | long completed task tables |
| current branch / latest commit / dirty state | old PR readiness history |
| current open issues and next task range | per-round details already in round log |
| current non-goals / risks | historical no-go evidence |
| 8 to 12 latest docs in read order | full 130+ doc read list |

Acceptance: new handoff fits in one practical read while still pointing to task ledger and archive for details.

## U-357：historical docs stale-current label audit

Historical docs should not be rewritten to pretend they are current, but they should not be mistaken for current authority.

Label policy:

| Doc type | Label |
|---|---|
| current task ledger / handoff / round log / operations index | `状态：当前权威...` |
| completed task batch docs | `状态：已完成；历史记录` |
| old release readiness / PR readiness docs | `状态：历史快照；不代表当前 release state` |
| release closeout docs | `状态：发布后记录；当前 release surface 以 README / GitHub Release 为准` |
| research / decision docs | `状态：决策记录；后续实现以 task ledger 为准` |

Execution should be batched after archive split so label churn does not touch too many files twice.

## U-358：README adoption checklist command smoke

Smoke commands run this round:

| Command | Result |
|---|---|
| `node ./bin/aods.mjs --help` | pass |
| `npm run compile:pilot` | pass |
| `node ./bin/aods.mjs validate ./examples/compiled-pilot --strict` | pass |
| `node ./bin/aods.mjs route . --query "adopt v0.8 safely compile validate route fixture conformance" --stage plan --intent read --json` | pass |
| `npm run docs:check-links` | pass |
| `npm run package:check-surface -- --json` | pass |

Conclusion: public adoption checklist is still executable for local source usage. The install-from-release path was already checked in U-307 and does not need to be repeated every docs-only round.

## U-359：v0.8.1 vs v0.9.0 release trigger matrix

| Change type | Release route |
|---|---|
| operations docs only | no release |
| README wording only, no package/docs command change | no release |
| public docs command changes that affect adoption | consider `v0.8.1` if package surface or release instructions change |
| bug fix to existing v0.8 behavior | `v0.8.1` |
| backward-compatible schema / validator / CLI feature | `v0.9.0` |
| new metadata fields with validator gates | `v0.9.0` unless purely docs-only |
| breaking schema / CLI behavior | no automatic version; require explicit major/version policy decision |
| packaged skill release-alignment fix only | `v0.8.1` if published package contents change |

Next candidate if structured term refs are implemented: `v0.9.0`, because it adds new schema/validator capability.

## U-360：next release notes skeleton refresh

Draft skeleton only; no tag or version bump this round.

```markdown
# AODS v0.9.0 candidate notes

## Highlights

- Structured terminology references for stable surfaces.
- Deterministic glossary-backed term reference validation.
- Capability fallback / unsupported reason metadata.
- Validator location envelope and suggested-action coverage improvements.

## Validation

- npm run release:hygiene
- focused schema / validator regressions
- fixture smoke / conformance cases for new metadata

## Compatibility

- Backward-compatible additions unless a future implementation changes required fields.
- No runtime provider execution, remote fetch, telemetry backend, or dashboard.

## Public issue posture

- Advances `#41` and `#59`.
- Keeps `#60` as roadmap tracker.
```

## U-361：GitHub release asset policy decision

Current `v0.8.0` release has no attached binary/package assets. GitHub source archives plus repository package source are sufficient for now.

Decision: keep GitHub release assets empty by default.

Rationale:

- This is a Node package / source-distributed CLI; source archive and tag are enough for current users.
- `npm pack` output is reproducible locally and package surface guard already checks expected files.
- Attaching tarballs manually creates another release surface that can drift.

Re-entry trigger:

- External users request offline install artifact.
- npm registry publication becomes part of release policy.
- Release process adds signed checksums or SBOM artifacts.

## 下一轮建议

下一轮默认 U-362 到 U-371：CI owner packet、three CI feasibility reruns、runtime no-go public sync decision, and public status refresh for `#41/#59/#60` plus adoption snippets.

## 非目标

- 不覆盖本机 installed skill。
- 不执行 archive split。
- 不批量重写历史 docs。
- 不启用 CI。
- 不创建 release、tag 或 package artifact。
