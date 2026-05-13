# AODS Release Gate Integration

日期：2026-05-13
回合：R-2026-05-13-52
范围：U-692 到 U-701

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `9da1eb4 Plan provider discovery hardening` |
| 台账指针 | 通过 | 当前默认任务为 U-692 到 U-701 |
| 返工需要 | 无 | 上轮 provider discovery hardening 成果可继续承接 |

## U-692 package install smoke release gate integration decision

Decision：将 `npm run package:install-smoke` 纳入 `npm run release:hygiene`。

理由：

1. package surface allowlist 只能证明 tarball 内容没有多或少；
2. install smoke 能证明 tarball 安装后的 binary、版本、help、packaged example validate / route 都可用；
3. 该检查在本地约 6 秒，可接受；
4. 脚本会删除 tarball 和临时目录，不应留下生成漂移。

Implementation：`scripts/release-hygiene.mjs` 新增 `npm run package:install-smoke` 步骤，放在 package surface check 之后、generated clean 之前。

验收标准：

| Gate | Expected |
|---|---|
| packed install | temporary project can install current tarball |
| version | installed `aods --version` equals package version |
| help | installed help includes version command |
| validate | packaged compiled-pilot validates with strict JSON |
| route | packaged compiled-pilot route returns `query-route` and non-empty selected modules |
| cleanup | no tarball or generated churn remains |

## U-693 v0.9.1 version bump execution gate

Decision：本轮不 bump `0.9.1`，不创建 tag，不创建 release。

`v0.9.1` 仍是 maintenance patch candidate。可以进入 release execution 的条件：

| Gate | Required before execution |
|---|---|
| owner intent | 明确选择 release execution，而不是继续维护 main |
| version surfaces | `package.json`, lockfile, README, skill release markers 全部一致 |
| release hygiene | 包含 package install smoke 的 `npm run release:hygiene` 通过 |
| release notes | 明确 maintenance-only 和 runtime/protocol non-goals |
| channel | 明确 GitHub Release only / npm publish / both |

No-go reason：本轮新增的是 release gate hardening 和 operations decisions，不需要马上发 patch。

## U-694 v0.9.1 release notes final draft

如果后续选择发布，建议 release notes 使用以下草稿。

```markdown
## AODS v0.9.1

Maintenance patch focused on adoption ergonomics, package install verification, and operations clarity.

### Added

- CLI version output via `aods --version`, `aods -v`, and `aods version`.
- Short adoption quickstart and troubleshooting docs.
- Packaged install smoke command for local release verification.
- Runtime/protocol static prerequisite notes for provider discovery, auth boundaries, probing posture, fallback posture, and adapter handshake.

### Changed

- README install verification now includes a direct version check.
- `npm run release:hygiene` now verifies packed install, installed binary output, packaged example validation, and route output.
- Operations handoff and round log are shorter, with full history archived.
- Public trackers now distinguish shipped metadata behavior from deferred runtime/protocol work.

### Non-goals

- No runtime/protocol negotiation implementation.
- No provider discovery execution.
- No auth exchange.
- No dynamic network probing.
- No automatic provider selection.
- No fallback ranking or executor.
- No adapter runtime call.
- No database connection or production mutation.

### Validation

- `npm run release:hygiene`
- `npm run package:install-smoke -- --json`
- tag/source install smoke after tag creation
```

## U-695 v0.9.1 packed install smoke execution

Executed against current `0.9.0` package surface, because no version bump happened this round.

| Field | Value |
|---|---|
| package | `aods@0.9.0` |
| version | `0.9.0` |
| validate | `pass` |
| route | `query-route` |
| selected modules | `shift-ops-adapter-capability`, `shift-ops-capsule` |

This is a release-gate proof, not a `v0.9.1` release proof.

## U-696 v0.9.1 source tag install smoke plan

If `v0.9.1` is later tagged, run a fresh source install smoke from the tag.

Suggested commands:

```bash
tmpdir="$(mktemp -d)"
git clone --depth 1 --branch v0.9.1 https://github.com/emosamastudio/aods.git "$tmpdir/aods"
cd "$tmpdir/aods"
npm ci
npm run release:hygiene
npm run package:install-smoke -- --json
node ./bin/aods.mjs --version
```

验收：

1. checked out tag must report `0.9.1`;
2. `npm run release:hygiene` passes from clean tag checkout;
3. `package:install-smoke` passes from tag source;
4. release notes non-goals match actual shipped behavior.

## U-697 npm publish dry-run / token audit

Decision：继续不执行 npm publish，不读取或打印 token。

Audit result：

| Gate | Status |
|---|---|
| package allowlist | current package surface stable at 61 entries |
| packed install smoke | available and integrated into release hygiene |
| npm registry owner decision | not provided |
| npm token / provenance policy | not provided, not inspected |
| publish command | not run |

后续如果 owner 要 npm publish，先做 `npm pack --dry-run --json` 和 registry login/provenance decision，再执行 publish。

## U-698 CI workflow draft no-enable packet

Decision：准备最小 CI 草案，但本轮不创建 workflow。

最小 CI 候选：

```yaml
name: release-hygiene
on:
  pull_request:
  push:
    branches: [main]
jobs:
  release-hygiene:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run release:hygiene
```

No-enable reason：

1. owner has not requested CI enablement;
2. hosted runtime cost / failure triage ownership is not assigned;
3. local release hygiene is currently stable;
4. no external contribution pressure requires CI yet.

## U-699 branch cleanup execution packet

Decision：本轮不删除远端分支。

Remote heads reviewed:

| Branch | Decision |
|---|---|
| `main` | keep |
| `codex/aods-v0.8-backlog` | cleanup candidate |
| `feature/generated-human-surfaces` | cleanup candidate |
| `feature/implementation-governance-patterns` | cleanup candidate |
| `feature/repository-reality-sensor` | cleanup candidate |
| `feature/strict-compile-gate` | cleanup candidate |
| `feature/strict-validate-status` | cleanup candidate |
| `feature/unregistered-module-warning` | cleanup candidate |
| `feature/versioned-aods-skill` | cleanup candidate |
| `integration/v0.5.0-trust-batch-1` | historical, keep unless explicit cleanup round |
| `release/v0.3.0` | historical, keep unless explicit cleanup round |

虽然用户已授权 GitHub 操作，但分支删除是不可逆的历史清理动作；当前最高价值仍是 release gate hardening，不混入 branch deletion。

## U-700 tag/source release note final wording

Recommended wording for future release notes:

```markdown
This release was cut from tag `v0.9.1`. Later commits on `main` may contain additional operations notes or planning documents. Install from the tag or release archive when you need the exact released behavior.
```

Do not add this to README now. It belongs in release notes when a new tag is actually created.

## U-701 next release go/no-go packet

Decision：`v0.9.1` remains no-go for execution this round.

| Release path | Decision | Reason |
|---|---|---|
| GitHub Release `v0.9.1` | no-go | no owner release intent this round |
| npm publish | no-go | registry/token/provenance decision absent |
| branch cleanup | no-go | separate cleanup round recommended |
| CI workflow enablement | no-go | owner/maintenance burden not assigned |
| v0.10 | no-go | no schema/validator/package contract expansion |

Ready-to-release improvements now available:

1. `package:install-smoke` exists;
2. `release:hygiene` now includes install smoke;
3. release notes draft is ready;
4. source tag smoke plan is ready.

## 本轮验证

| 验证项 | 命令或方式 | 结果 |
|---|---|---|
| Remote branch/tag audit | `git ls-remote --heads origin` / `git ls-remote --tags origin 'v0.*'` | 通过 |
| Package install smoke | `npm run package:install-smoke -- --json` | 通过 |
| Release hygiene | `npm run release:hygiene` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 通过 |
| Package surface | `npm run package:check-surface -- --json` | 通过 |

## 后续建议

下一轮默认 U-702 到 U-711：route adoption query miss regression、route overread regression、validate location envelope regression、remediation compatibility audit、docs sample refresh、CLI help parity、strict warning troubleshooting sample、package allowlist decision、generated hygiene after package smoke 和 conformance sample no-refresh revisit。
