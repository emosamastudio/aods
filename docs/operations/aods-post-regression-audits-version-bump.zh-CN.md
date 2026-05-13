# AODS post-regression audits and v0.9 version bump

日期：2026-05-13
范围：U-562 到 U-571
状态：已完成；tag / GitHub Release / source install smoke 仍待下一轮执行

## 结论

本轮完成 focused regression 之后的公开关联审查、no-runtime wording 审查、source-first smoke、package surface、generated 和 security 复核，并把 release-facing version surface 从 `0.8.0` / `v0.8.0` bump 到 `0.9.0` / `v0.9.0`。

当前 repo package / README / packaged skill 已指向 `0.9.0` / `v0.9.0`，但远端 GitHub tag 和 GitHub Release 尚未创建。下一轮必须优先执行 U-572 到 U-573，把远端 release 状态补齐后再处理 issue closeout。

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 一致，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `a0f7853 Finalize release execution prep` |
| Task ledger state | 通过 | 当前默认任务为 U-562 到 U-571 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工项 | 无 | 上轮成果合格，直接进入本轮任务 |

## Issue linkage audit

| 任务 | 结论 | 处理 |
|---|---|---|
| U-562 remote regression linkage | `#64` 已覆盖 runtime / protocol 后续方向；本轮 regression 只作为静态 metadata baseline 证据 | 不编辑 issue body，不新增 issue |
| U-563 event correction linkage | 当前实现只检查静态 correction graph，不实现 event store / replay | 不挂到 `#64`，不新增公开 issue |
| U-564 migration dry-run linkage | 当前 helper 只在 benchmark 目录生成静态 dry-run report，不提供 migrate command 或数据库连接 | 不新增公开 issue |

## Public no-runtime wording audit

审查范围：

- `README.md`
- `README.zh-CN.md`
- `docs/operations/`
- `examples/compiled-pilot-source/README.md`
- benchmark README / reports 入口

结论：公开文档中的 runtime / execution / migration 相关表述仍处在 non-goal、deferred、route prepared、benchmark-only 或 owner-run packet 语境内，没有发现把 runtime engine、adapter runtime、event store、policy engine、migration executor 或 database connection 误说成已实现的 public claim。

## Verification

| 验证项 | 命令 | 结果 | 说明 |
|---|---|---|---|
| Source-first compile | `npm run compile:pilot` | 通过 | compiled pilot 与 authoring source 同步 |
| Compiled pilot validate | `npm run validate:compiled-pilot` | 通过 | strict + reality gate 通过；example locator unchecked reason 保持预期 |
| Fixture smoke | `npm run fixture:smoke` | 通过 | fixtures=15，golden_exports=10 |
| Conformance | `npm run conformance:compiled-pilot` | 通过 | cases=5，passed=5 |
| Package surface pre-bump | `npm run package:check-surface -- --json` | 通过 | package `aods@0.8.0`，entry_count=61 |
| Generated clean pre-bump | `npm run generated:check-clean -- --json` | 通过 | dirty_entries=[] |
| Security placeholder scan pre-bump | `npm run security:scan-placeholders -- --json` | 通过 | hits=0 |
| npm pack pre-bump | `npm pack --dry-run --json` | 通过 | `aods@0.8.0`，entryCount=61 |

## Version bump

| 文件 | 变更 |
|---|---|
| `package.json` | `version` bump 到 `0.9.0` |
| `package-lock.json` | root / package version bump 到 `0.9.0` |
| `README.md` | latest release、download link、install snippet、adoption heading bump 到 `v0.9.0` / v0.9 |
| `README.zh-CN.md` | 与英文 README 同步 bump 到 `v0.9.0` / v0.9 |
| `skills/aods-use/SKILL.md` | release/package version bump 到 `v0.9.0` / `0.9.0` |
| `skills/aods-use/skill.json` | `skill_version=0.9.0`，`aligned_release=v0.9.0` |

## Docs/examples refresh decision

不新增 public examples 或 docs examples sample。

理由：

1. remote adapter mismatch 和 event correction graph 的 regression 已由 source-first example / scaffold tests 覆盖，公开短样例继续保持 validate / route JSON 的低噪声入口。
2. migration dry-run report 是 benchmark-only helper，不应进入 package adoption surface 或 README quickstart。
3. workflow / policy static records 仍未进入 focused regression，当前不适合新增 public adoption sample。

## Current release boundary

| 项 | 状态 |
|---|---|
| package / README / skill surface | 已 bump 到 `0.9.0` / `v0.9.0` |
| latest GitHub release | 仍为 `v0.8.0`，等待 U-572 |
| `v0.9.0` tag | 未创建，等待 U-572 |
| GitHub Release `v0.9.0` | 未创建，等待 U-572 |
| source install smoke from tag | 未运行，等待 U-573 |

下一轮默认先执行 U-572 到 U-581。优先顺序：创建 tag / GitHub Release，随后从 tag 做 source install smoke，再处理 public issue closeout、roadmap refresh 和 post-release package artifact audit。
