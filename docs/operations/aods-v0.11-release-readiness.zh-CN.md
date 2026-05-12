# AODS v0.11 Release Readiness Gate

状态：U-074 已完成
日期：2026-05-08
范围：v0.11 累积变更 release readiness gate；不发布 release

## 结论

U-074 release readiness gate 通过。当前分支的 repo validation、benchmark 全套、benchmark regression tests、package dry-run 和 diff hygiene 均已通过。

本轮不发布 release。当前 package version 仍为 `0.7.0`，dry-run 产物也是 `aods-0.7.0.tgz`；若下一轮 U-075 决定创建新的 GitHub Release，必须先确认目标版本号和 release branch / tag 策略，不能把本地累积变更直接作为新的 `v0.7.0` 发布。

## 上轮质量返工

| 问题 | 处理 | 结果 |
|---|---|---|
| U-072 README Example map 指向 `examples/compiled-pilot/`，但 pack dry-run 原先只包含 `examples/compiled-pilot-source/` | `package.json.files` 增加 `examples/compiled-pilot/` | 第二次 `npm pack --dry-run` 显示 compiled-pilot README 和 modules 已进入 tarball |

## Gate 结果

| Gate | 命令或证据 | 结果 | 说明 |
|---|---|---|---|
| Previous-round review | `git show HEAD`、path smoke、`npm run validate:all` | 通过 | U-072/U-073 提交只包含 README / docs / operations；`MEMORY.md` 未跟踪；导航目标路径存在 |
| Root strict validation | `npm run validate:strict` via `release:self-check` | 通过 | root corpus L1-L4 pass，errors=0 warnings=0 |
| Seven-plane pilot validation | `npm run validate:pilot` via `release:self-check` | 通过 | seven-plane pilot L1-L4 pass |
| Compiled-pilot strict reality | `npm run validate:compiled-pilot` via `release:self-check` | 通过 | source-first pilot 编译成功；compiled-pilot strict reality pass |
| Benchmark evaluate / compare / summary | `npm run benchmark:all` via `release:self-check` | 通过 | benchmark reports / generated results 已刷新；metric diff 为时间窗口刷新，无核心指标退化 |
| Benchmark tests | `npm run benchmark:test` via `release:self-check` | 通过 | 74/74 pass |
| Package dry run | `npm pack --dry-run` via `release:self-check` | 通过 | `aods-0.7.0.tgz`；50 files；package size 199.5 kB；unpacked size 1.0 MB |
| Package content smoke | `npm pack --dry-run --json` | 通过 | `examples/compiled-pilot/README.md` 和 `examples/compiled-pilot/modules/shift-ops-resource-surface.json` 均包含在 pack 文件列表 |
| Diff hygiene | `git diff --check` | 通过 | whitespace clean |

## Release Notes Skeleton

### AODS next release candidate

Version: TBD. Current package surface still says `0.7.0`; choose the next public version before creating a release tag.

Highlights:

- Adds implementation evidence and acceptance-criteria linkage for stable implementation alignment.
- Adds drift remediation guidance, decision provenance, read-model freshness, and fixture / golden export conventions.
- Defines metadata-only command / receipt / event, correction / supersession, known-gap, authority hierarchy, dependency, migration, risk, exposure, audit, lifecycle, and observability boundaries.
- Adds source-first canonical example packs for read-model, command/receipt, event/correction, adapter/capability, artifact/export/policy-gate, resource surface, glossary registry, and external citation / provenance.
- Strengthens implementation reality diagnostics with structured unchecked repo locator reporting.
- Adds `aods route --help` discoverability.
- Updates public docs navigation so examples, glossary, and citation surfaces are easier to inspect.
- Packages compiled-pilot outputs with the release package so README example links resolve inside the dry-run tarball.

Validation:

- `npm run release:self-check` passed on 2026-05-08.
- Benchmark regression tests passed: 74/74.
- Dry-run package: `aods-0.7.0.tgz`, 50 files, 199.5 kB package size, 1.0 MB unpacked.

Known non-goals:

- No command executor, event store, adapter negotiation runtime, resource scheduler, policy engine, crawler, fact checker, migration tool, or behavioral oracle is included.
- GitHub public issue sync and release publication are deferred to U-075.

## 下一步

1. U-075 前确认目标公开动作：issue comments / closes、PR、release 是否同轮执行。
2. 若创建 release，先确认目标 version bump 和 release branch/tag。
3. U-075 执行前再次确认 staged set 和 final tree 不含 `MEMORY.md`。
