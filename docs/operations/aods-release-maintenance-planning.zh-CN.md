# AODS Release Maintenance Planning

日期：2026-05-13
回合：R-2026-05-13-49
范围：U-662 到 U-671

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `947d08b Archive round log and sync operations hygiene` |
| 台账指针 | 通过 | 当前默认任务为 U-662 到 U-671 |
| 返工需要 | 无 | 上轮 operations hygiene 成果可继续承接 |

## U-662 v0.9.1 patch release candidate gate

Decision：`v0.9.1` 可以作为 patch maintenance candidate，但本轮不 bump、不打 tag、不发布。

适合进入 `v0.9.1` 的已完成增量：

- adoption quickstart / troubleshooting 短页；
- CLI version ergonomics：`aods --version` / `aods version` / `aods -v`；
- operations archive / handoff compaction；
- public issue status refresh；
- runtime/protocol static record proposals。

Patch gate：

| Gate | 要求 |
|---|---|
| version surfaces | `package.json` / `package-lock.json` / README install text / skill release markers 统一改为 `0.9.1` / `v0.9.1` |
| generated clean | `npm run generated:check-clean` 通过 |
| docs/package hygiene | docs link、secret scan、package surface 通过 |
| install smoke | 从 tag 或 packed tarball 安装后跑 `aods --version`、`aods --help`、compiled-pilot validate / route |
| release notes | 明确这是 maintenance patch，不包含 runtime/protocol implementation |
| owner decision | 明确选择 GitHub Release only / npm publish / both |

## U-663 v0.10 semantic scope proposal

Decision：`v0.10.0` 尚未触发。

触发条件：

| Trigger | 说明 |
|---|---|
| schema / validator changes | runtime/protocol static records 进入 schema 或 validator gates |
| package example promotion | provider discovery / auth / probing / fallback / handshake 进入 package examples |
| conformance expansion | runtime/protocol static records 进入 conformance suite |
| public contract expansion | README 或 release notes 宣称新的稳定语义 surface |

当前只完成 proposal 和 owner gates，不进入 `v0.10.0`。

## U-664 next changelog skeleton

当前仓库没有根 `CHANGELOG.md`。本轮只准备 release notes / changelog skeleton，不新增根 changelog 文件。

建议下一 release notes skeleton：

```markdown
## AODS v0.9.1

Maintenance patch focused on adoption ergonomics and operations hygiene.

### Added

- CLI version output via `aods --version`, `aods -v`, and `aods version`.
- Short adoption quickstart and troubleshooting docs.
- Runtime/protocol static-record proposal document.

### Changed

- README install verification now includes a version check.
- Operations handoff and round log are shorter, with full history archived.
- Public roadmap tracker `#60` now starts with current v0.9 status.

### Non-goals

- No runtime/protocol negotiation implementation.
- No provider discovery execution.
- No auth exchange.
- No dynamic probing.
- No fallback executor.
- No adapter runtime.
- No database connection or production mutation.

### Validation

- `npm run release:hygiene`
- `npm pack --dry-run --json`
- packed or tag install smoke
```

## U-665 package tarball inventory diff baseline

Current dry-run baseline:

| Field | Value |
|---|---:|
| package | `aods@0.9.0` |
| filename | `aods-0.9.0.tgz` |
| entryCount | 61 |
| size | 224593 |
| unpackedSize | 1146078 |
| shasum | `8b90424f4f9a6dbf4888b5aaaa3a1f407fe35a3e` |

Package contents remain allowlisted and do not include `docs/operations/` or `docs/examples/`.

## U-666 release notes post-v0.9 delta draft

Draft delta from `v0.9.0` to current `main`:

| Area | Delta | Release wording |
|---|---|---|
| CLI | version command added | “Install verification is now direct via `aods --version`.” |
| Adoption docs | quickstart / troubleshooting split | “New short docs reduce first-run ambiguity.” |
| Runtime/protocol | static proposals only | “Runtime/protocol remains deferred; this release only records static prerequisite shape.” |
| Operations | round log archive and handoff compaction | “Maintainer handoff is shorter; full history remains archived.” |
| Public roadmap | `#60` current status inserted; `#64` static prerequisite comment | “Public trackers now distinguish shipped metadata scope from deferred runtime work.” |

## U-667 branch cleanup owner packet

Remote heads snapshot:

| Branch | Decision |
|---|---|
| `main` | keep |
| `codex/aods-v0.8-backlog` | deletion candidate after owner confirms no open PR / no forensic need |
| `feature/generated-human-surfaces` | deletion candidate after owner confirms superseded |
| `feature/implementation-governance-patterns` | deletion candidate after owner confirms merged/superseded |
| `feature/repository-reality-sensor` | deletion candidate after owner confirms merged/superseded |
| `feature/strict-compile-gate` | deletion candidate after owner confirms merged/superseded |
| `feature/strict-validate-status` | deletion candidate after owner confirms merged/superseded |
| `feature/unregistered-module-warning` | deletion candidate after owner confirms merged/superseded |
| `feature/versioned-aods-skill` | deletion candidate after owner confirms merged/superseded |
| `integration/v0.5.0-trust-batch-1` | historical branch; delete only with explicit cleanup approval |
| `release/v0.3.0` | historical branch; delete only with explicit cleanup approval |

本轮不删除任何远端分支。

## U-668 tag/source mismatch docs note decision

Decision：不在 README 加 tag/source mismatch 说明。

理由：

1. `v0.9.0` tag 保持 release point；后续 operations docs commits 在 `main` 上是正常维护增量；
2. README 若解释每次 tag 与 main 的差异，会增加采用噪音；
3. 下一 release notes skeleton 会清楚说明 `v0.9.0` 到 patch candidate 的差异。

若用户从 tag 安装，只应看到 `0.9.0` 行为；若从 `main` 读文档，则看到后续维护状态。

## U-669 npm publish owner gate packet

Decision：本轮不执行 npm publish。

Owner gate：

| Gate | 要求 |
|---|---|
| registry decision | owner 明确选择 npm registry 发布，而不是 GitHub tag only |
| token / provenance | npm token / provenance policy 准备好 |
| package name | 确认 `aods` 名称可用 / owner 有权限 |
| dry run | `npm pack --dry-run --json` 与 allowlist 一致 |
| install smoke | 从 npm package 安装后跑 `aods --version`、`validate`、`route` |
| rollback | 明确 deprecate / unpublish policy 和 GitHub Release 对应关系 |

## U-670 CI enablement owner packet refresh

Decision：本轮仍不启用 GitHub Actions。

当前 `.github/` 仅有 issue templates 和 copilot instructions，无 workflow files。

可启用的最小 CI 候选：

```yaml
npm ci
npm run docs:check-links
npm run package:check-surface
npm run generated:check-clean
npm run validate:all
```

暂不启用原因：

1. release hygiene 本地 gate 当前稳定；
2. CI 会增加令牌、权限和失败 triage 维护；
3. 还没有外部贡献压力要求必须自动化。

## U-671 hosted repeatability rerun trigger

Decision：默认不跑 hosted repeatability。

Rerun trigger：

| Trigger | 是否需要 hosted repeatability |
|---|---|
| 修改 benchmark attribution / summary source | yes |
| 新增 hosted runtime measurement path | yes |
| 发布声称 hosted repeatability 改善 | yes |
| 仅 docs / operations / CLI version ergonomics | no |
| 仅 package inventory / release notes | no |

当前增量不需要重新跑 hosted repeatability。

## 本轮验证

| 验证项 | 命令或方式 | 结果 |
|---|---|---|
| Package inventory | `npm pack --dry-run --json` | 通过，61 entries |
| Remote branch/tag audit | `git ls-remote --heads origin` / `git ls-remote --tags origin 'v0.*'` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 通过 |
| Release hygiene | `npm run release:hygiene` | 通过 |

## 后续建议

下一轮默认 U-672 到 U-681：projection guidance static invariant、provider discovery example candidate、policy / workflow source-first candidates、migration dry-run promotion no-go、route query failure regression、validate location compatibility、package install smoke automation、final retrospective 和 next milestone decision。
