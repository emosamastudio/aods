# AODS post-conformance release hardening

状态：U-241 到 U-250 已完成
日期：2026-05-13
范围：release candidate gate、packed install conformance smoke、PR body refresh、release notes refresh、version bump dry-run plan、README conformance docs plan、conformance warn/fail/text regressions；不 merge、不 tag、不创建 GitHub Release、不发布 npm、不改 package version。

## 结论

本轮在 conformance runner 和 schema hardening 后重跑 release gate，并把 package install smoke 扩展到 packaged `aods conformance run`。技术门禁通过，但 public release 仍保持 no-go，原因是 package / lockfile / README release surface 仍停在 `0.7.0`，需要单独版本补丁和 release 执行。

## 任务结果

| 任务 | 结果 | 证据 |
|---|---|---|
| U-241 | release candidate gate after conformance hardening | `npm run release:self-check` 通过；benchmark tests 90/90；pack dry-run 61 files |
| U-242 | packed install smoke after conformance runner | temp install 后 packaged `aods conformance run ... --json` 通过 |
| U-243 | PR body refresh after conformance hardening | PR `#63` body 已刷新到 conformance / release hardening 口径 |
| U-244 | release notes refresh | 本文件 release notes draft 纳入 conformance runner、schema hardening、package install smoke |
| U-245 | version bump dry-run plan | version patch 必须覆盖 `package.json`、`package-lock.json`、README release links / version wording、release notes body |
| U-246 | public README conformance command docs plan | 建议 release patch 将 conformance command 作为 local verification command 公开；不得描述为 hosted certification |
| U-247 | conformance warn-status fixture design | focused regression 固化 `warn` expected status 是 manifest-supported design state，但当前 runner 不制造 warn runtime status |
| U-248 | expected-rules mismatch negative test | focused regression 固化 `missing_rules` / `unexpected_rules` 输出 |
| U-249 | validate failing-corpus fixture | focused regression 固化 validate case 可展开 L1-L4 validation rules |
| U-250 | conformance text output snapshot | focused regression 固化 text smoke fields：status、suite、cases、passed、failed |

## Release notes draft delta

```markdown
### Added

- Add a read-only conformance runner for fixture-smoke and validate cases.
- Add checked-in conformance manifest and report schemas.
- Add conformance regressions for schema validation, rule mismatch diagnostics, validate failure rules, warn expected-state design, and text output smoke.
- Extend packed install smoke to verify packaged conformance execution.

### Validation

- npm run release:self-check
- node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs
- packaged tarball install smoke with aods conformance run

### Not included

- No arbitrary command execution in conformance manifests.
- No hosted certification service, telemetry store, dashboard, tag, GitHub Release, or npm publish.
```

## Version bump dry-run plan

| Surface | Required change for release patch | Notes |
|---|---|---|
| `package.json` | `version: 0.8.0` | package dry-run currently still emits `aods@0.7.0` |
| `package-lock.json` | root package version to `0.8.0` | must stay aligned with `package.json` |
| `README.md` / `README.zh-CN.md` | release link / version wording update | avoid claiming npm publication unless explicitly done |
| GitHub Release body | include conformance runner and hardening delta | can reuse draft above |
| tag | `v0.8.0` only after merge and final gate | not created in this round |

## README conformance command decision

Conformance should be documented as a local verification command once the release patch is prepared:

```bash
npm run conformance:compiled-pilot -- --json
```

Do not describe this as external certification, hosted validation, or remote corpus verification. The current runner is repo-local and intentionally does not execute arbitrary command fields.

## Non-goals

1. 不 merge PR。
2. 不关闭 issue。
3. 不创建 tag / GitHub Release。
4. 不发布 npm。
5. 不把 conformance runner 扩展成命令执行器、远程抓取器或认证服务。
