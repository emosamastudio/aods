# AODS runtime protocol and release gate refresh

日期：2026-05-13
范围：U-762 到 U-771
状态：已完成

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `23de438 Document policy workflow migration boundaries` |
| Remote state | 通过 | `origin/main` 指向 `23de43821d24505f6329c454be747c6c1980576e` |
| Task ledger | 通过 | U-762 到 U-771 是当前默认下一轮任务 |
| 返工 | 无 | 上轮成果合格，直接进入 runtime protocol / release gate refresh |

## 本轮目标

本轮只刷新进入条件和发布门禁，不发布版本、不 bump、不打 tag、不启用 CI、不删除远端分支、不执行 npm publish。

| 方向 | 本轮处理 | 明确排除 |
|---|---|---|
| runtime protocol conformance | 定义进入 checklist，复核 no-go | 新 conformance case、runtime negotiation、provider call |
| release trigger | 复核 `v0.9.1` / `v0.10.0` 是否触发 | version bump、tag、GitHub Release |
| package / hygiene | 执行 install smoke 和 release hygiene | package surface expansion、npm publish |
| owner gates | 刷新 CI、npm、branch cleanup 判断 | workflow file、token inspection、branch deletion |

## U-762 runtime protocol conformance entry checklist

Runtime protocol static guards 进入 conformance suite 前，至少需要满足以下条件：

| Gate | 最小要求 | 当前状态 |
|---|---|---|
| stable positive source-first record | provider discovery 或 projection guidance 已有 source-first / compiled positive 行 | provider discovery 有；projection guidance 仍借 event log 行表达 |
| stable negative fixture | 缺 evidence、network allowed、缺 projection guidance 等负例已在 focused regression 稳定 | focused regression 已有，但尚未设计成 conformance manifest case |
| no-execution invariant | fixture 不需要网络、凭证、provider call、adapter call、数据库或远程写入 | provider discovery 和 projection guidance 满足 |
| issue shape stability | validator rule、remediation、location envelope 已稳定 | provider / projection 已稳定 |
| package relevance | 外部 packaged consumers 会从 conformance case 获益，而不只是维护者内部回归 | 尚未证明 |
| public wording | README 能解释它是静态协议前置，不是 runtime certification | 尚未需要扩写 |

结论：entry checklist 已清楚，但还不进入 conformance。当前 focused regression 足够覆盖维护者内部漂移风险。

## U-763 runtime protocol conformance no-go packet

本轮继续 no-go for conformance promotion。

| 候选 | 当前证据 | No-go 原因 |
|---|---|---|
| provider discovery static guards | `runtime-protocol-provider-evidence`、`runtime-protocol-provider-network-disabled` focused regression 通过 | 还没有外部使用者要求 packaged conformance case；README 不应扩写成 runtime protocol certification |
| projection guidance guard | `event-projection-guidance-required` focused regression 通过 | 它是 event correction 解释漂移 guard，不是独立 runtime protocol suite |
| policy / workflow / migration | 只有 checklist / fixture plan / no-go | 不具备进入 conformance 的字段形状 |

下一次复核触发条件：新增第二个 runtime/protocol source-first 正例，或外部 packaged consumer 需要稳定 conformance report 覆盖这些 static guards。

## U-764 v0.9.1 patch trigger refresh

`v0.9.1` 仍可以作为 maintenance patch candidate，但本轮不触发 release execution。

| 增量 | Patch 候选价值 | 是否足以发布 |
|---|---|---|
| provider discovery static guard | 增强维护者回归保护 | 否 |
| projection guidance static guard | 增强 correction / supersession 漂移保护 | 否 |
| policy / workflow / migration boundary docs | 降低过度承诺风险 | 否 |
| package install smoke / release hygiene 已稳定 | 发布前 gate 更可靠 | 否 |

本轮没有用户要求发布，也没有安全修复、破坏性 bugfix 或外部采用阻塞，因此继续 no-go。

## U-765 v0.10 trigger refresh after static guards

`v0.10.0` 仍未触发。

| Trigger | 当前状态 | 结论 |
|---|---|---|
| schema expansion | 未发生 | 不触发 |
| package contract expansion | package entry count 仍为 61 | 不触发 |
| conformance suite expansion | 未新增 case | 不触发 |
| public stable contract expansion | README quickstart 未扩写 | 不触发 |
| runtime/protocol implementation | 未实现 | 不触发 |
| npm publish channel change | 未执行 | 不触发 |

当前仍是 `0.9.0` maintenance-on-main 状态。

## U-766 release notes maintenance delta refresh

如果后续发布 `v0.9.1`，建议 release notes delta 追加本轮之后的维护内容：

```markdown
### Added

- Static validation guards for provider discovery evidence and no-network posture.
- Static validation guard requiring projection guidance for correction / supersession event rows.
- Maintainer boundary notes for policy decisions, workflow lifecycle vocabulary, and benchmark-only migration dry-run reports.

### Changed

- `npm run release:hygiene` remains the aggregate local gate and includes packaged install smoke.
- Operations handoff and task ledger now point to runtime protocol / release gate refresh follow-ups.

### Non-goals

- No runtime protocol negotiation implementation.
- No provider lookup, auth exchange, dynamic probing, fallback execution, adapter call, database connection, or production mutation.
- No policy engine, workflow engine, scheduler, migration command, or automatic rewrite.
- No npm publish unless owner separately chooses the registry path.

### Validation

- `npm run package:install-smoke -- --json`
- `npm run release:hygiene`
- `npm run package:check-surface -- --json`
```

本轮不新增根 `CHANGELOG.md`，也不改 release surfaces。

## U-767 package install smoke after static guards

执行结果：

| Field | Value |
|---|---|
| package | `aods@0.9.0` |
| tarball | `aods-0.9.0.tgz` |
| version | `0.9.0` |
| help includes version | true |
| validate status | pass |
| route strategy | query-route |
| selected modules | `shift-ops-adapter-capability`, `shift-ops-capsule` |

结论：新增静态 guard 和 operations 文档没有破坏打包安装后的基本使用路径。

## U-768 release hygiene final rerun after guards

`npm run release:hygiene` 通过。覆盖项：

| Gate | 结果 |
|---|---|
| docs link check | pass，markdown_files=213，missing=0 |
| secret-like scan | pass，hits=0 |
| package surface | pass，entry_count=61 |
| package install smoke | pass，version=0.9.0 |
| generated clean | pass，dirty_entries=0 |
| skill package tests | pass，2 tests |
| route / validate focused regression | pass，6 tests |
| validate:all | pass，root / seven-plane pilot / compiled pilot strict gates pass |

结论：当前 main 可继续作为维护线，不需要发 patch 来修复 gate。

## U-769 CI owner gate refresh after new tests

Decision：仍不启用 GitHub Actions。

| 判断点 | 当前状态 |
|---|---|
| 新 tests | focused regression 已稳定，release hygiene 本地可重复 |
| `.github/workflows` | 仍未创建 |
| owner cost | CI failure triage、hosted runtime、权限策略仍无新 owner 需求 |
| 外部贡献压力 | 当前无 |

后续如果启用，仍建议只创建一个最小 job：`npm ci` 后跑 `npm run release:hygiene`。本轮不写 workflow 文件。

## U-770 npm publish no-go refresh after guards

Decision：仍不执行 npm publish，不读取 token，不做 registry 操作。

| Gate | 当前状态 |
|---|---|
| owner registry intent | 未提出 |
| npm token / provenance policy | 未检查，未需要 |
| package dry-run / allowlist | package surface pass，entry_count=61 |
| packed install smoke | pass |
| rollback / deprecate policy | 未进入执行 |

当前发布权威仍是 GitHub Release `v0.9.0` 与 source/tag install path。

## U-771 branch cleanup owner packet refresh

远端分支快照：

| Branch | 决策 |
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

本轮不删除远端分支。理由：当前最高价值是维护线门禁刷新；分支删除是历史清理动作，应独立成清理回合，并在清理前逐一核对 PR / forensic need。

## 本轮验收

| 验收项 | 结果 | 证据 |
|---|---|---|
| runtime conformance checklist | 通过 | 本文 U-762 |
| runtime conformance no-go | 通过 | 本文 U-763 |
| `v0.9.1` trigger refresh | 通过 | 本文 U-764 |
| `v0.10` trigger refresh | 通过 | 本文 U-765 |
| release notes delta refresh | 通过 | 本文 U-766 |
| package install smoke | 通过 | `npm run package:install-smoke -- --json` |
| release hygiene | 通过 | `npm run release:hygiene` |
| CI owner gate | 通过 | 本文 U-769 |
| npm publish no-go | 通过 | 本文 U-770 |
| branch cleanup packet | 通过 | 本文 U-771 |

## 下一步建议

下一轮默认进入 U-772 到 U-781：cross-corpus no-fetch posture、knowledge base write trigger、installed skill sync revisit、operations topic table sync、handoff / round log retention、public issue sync decision、milestone no-go、next task pool expansion or release closeout decision。
