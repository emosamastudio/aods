# AODS Packed Tarball Install Smoke

状态：U-097 已完成
日期：2026-05-12
范围：本地 tarball install / CLI smoke；不发布 npm

## 结论

Packed tarball install smoke 通过。本轮用 `npm pack --pack-destination` 生成本地 `aods-0.7.0.tgz`，在临时空项目中安装，并执行 CLI help、packaged compiled-pilot strict reality validation、packaged fixture smoke。

这证明当前 package artifact 安装后能运行核心 CLI 和示例校验路径。它不代表 npm registry publish，也不代表下一 release 已授权。

## Smoke Environment

| 项 | 值 |
|---|---|
| Temp root | `/tmp/aods-install-smoke.e02osc` |
| Packed tarball | `/tmp/aods-install-smoke.e02osc/pack/aods-0.7.0.tgz` |
| Install target | local temporary npm project |
| Install mode | `npm install --save-dev <local tarball>` |
| Package version | `0.7.0` |

## Smoke Results

| Check | Command | Result | Evidence |
|---|---|---|---|
| CLI help | `node ./node_modules/aods/bin/aods.mjs --help` | pass | help lists validate / route / hook / upgrade / compile / fixture / scaffold |
| Packaged corpus validation | `node ./node_modules/aods/bin/aods.mjs validate ./node_modules/aods/examples/compiled-pilot --strict --reality` | pass | modules=11, sections=22, artifacts=25, errors=0, warnings=0 |
| Packaged fixture smoke | `node ./node_modules/aods/bin/aods.mjs fixture smoke ./node_modules/aods/examples/compiled-pilot-source/fixtures/fixture-manifest.json --json` | pass | fixtures=9, positive=9, golden_exports=9, issues=[] |

## Non-Goals

1. 不发布到 npm registry。
2. 不做 global install。
3. 不测试外部项目真实迁移。
4. 不改变 package version。
5. 不把 packaged examples 解释为 runtime implementation。

## Follow-Up

Packed install smoke 已为 U-100 release candidate gate 提供本地安装证据。下一步仍需 U-098 close-on-merge audit 和 U-100 release gate decision。
