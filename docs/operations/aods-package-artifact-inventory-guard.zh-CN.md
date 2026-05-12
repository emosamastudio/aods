# AODS Package Artifact Inventory Guard

状态：U-096 已完成
日期：2026-05-12
范围：`npm pack --dry-run --json` 包清单审查；不改变 package strategy

## 结论

当前 package artifact inventory guard 通过。`npm pack --dry-run --json` 输出显示包名仍为 `aods@0.7.0`，产物名为 `aods-0.7.0.tgz`，总计 51 个条目，package size 207,491 bytes，unpacked size 1,061,701 bytes。

这只能证明当前 package surface 可审查，不代表可以发布新版本。因为 version、tag 和 latest GitHub Release 仍是 `v0.7.0`，下一次公开 release 前必须先完成 version bump / tag / release branch decision。

## Inventory Summary

| 项 | 当前值 | 判断 |
|---|---|---|
| Package id | `aods@0.7.0` | 与当前 package version 一致 |
| Filename | `aods-0.7.0.tgz` | 说明未做 version bump |
| Entry count | 51 | 与 expected package surface 匹配 |
| Package size | 207.5 kB | 较上一轮 50 files 后新增 package entry 可解释 |
| Unpacked size | 1.1 MB | 可接受 |
| Bundled deps | none | 无 bundled dependency 风险 |

## Expected Surface Check

| Surface | 代表路径 | 结果 | 说明 |
|---|---|---|---|
| CLI entry | `bin/aods.mjs` | included | `package.json` bin 指向该文件 |
| Runtime libraries | `lib/*.mjs` | included | compile / validate / route / fixture / scaffold 等运行文件进入包 |
| Root corpus | `manifest.json`、`spec/`、`schema/` | included | compiled-corpus-first 权威面进入包 |
| Public docs | `README.md`、`README.zh-CN.md`、`LICENSE` | included | 安装和许可入口进入包 |
| Skill | `skills/aods-use/` | included | release-aligned skill 进入包 |
| Source-first example | `examples/compiled-pilot-source/` | included | authoring source、README、fixture manifest 进入包 |
| Compiled example | `examples/compiled-pilot/` | included | manifest、schema、modules、README 进入包 |
| Internal operations docs | `docs/operations/` | excluded | 正常；不是 package runtime surface |
| Benchmarks/tests | `benchmarks/` | excluded | 正常；不是 release package surface |

## Guard Decision

| 决策项 | 结论 |
|---|---|
| Package inventory | pass |
| Package strategy | unchanged |
| npm registry publish | not in scope |
| GitHub Release readiness | blocked by version / PR draft / release authorization |
| Required next check | U-097 install smoke from packed tarball |
