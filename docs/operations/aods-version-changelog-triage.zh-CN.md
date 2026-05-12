# AODS Version Bump And Changelog Route Triage

状态：U-094 已完成
日期：2026-05-12
范围：下一 release 的 version bump、tag、changelog、README version surface；不 bump、不发布

## 结论

下一次 public release 必须先做 version bump 和 release branch / tag 决策。当前 package version 是 `0.7.0`，本地 tag 和 GitHub latest release 也是 `v0.7.0`，但 PR `#63` 包含大量 v0.7 后变更。不能把这些累积变更再次以 `v0.7.0` 发布。

本轮不改 `package.json`、README version surface、tag 或 release notes，只记录 release 前路线。

## 当前版本面

| Surface | 当前值 | 判断 |
|---|---|---|
| `package.json` | `0.7.0` | 下一 release 前必须 bump |
| Local latest tag | `v0.7.0` | 不可复用 |
| GitHub latest release | `v0.7.0` | 当前公开 latest |
| README install examples | `v0.7.0` | 新 release 前需要同步 |
| PR `#63` release position | no release published | 与当前 triage 一致 |

## 下一 Release Route

| 步骤 | 必须完成 | 非目标 |
|---|---|---|
| Version decision | owner 明确目标版本号，例如 next minor / patch | 不在本轮猜版本 |
| Changelog route | 汇总 PR `#63` 的 major changes、non-goals、known deferred runtime、validation evidence | 不把每个内部任务都写成公开 changelog |
| Package surface | `npm pack --dry-run --json` 与 package inventory 审查 | 不发布 npm registry |
| README version surface | README / README.zh-CN install 和 latest release 指向新 tag | 不手改 benchmark sync 区块 |
| Tag / release | release branch、tag、GitHub Release body、rollback path 明确 | 未授权不 tag、不 release |

## Changelog Delta 判断

| 主题 | 是否进入下一 release notes | 说明 |
|---|---|---|
| Implementation evidence / drift hardening | 是 | 这是 v0.7 后最主要增量 |
| Acceptance criteria / remediation / provenance / freshness | 是 | 直接改善规范到证据的闭环 |
| Canonical example packs | 是 | 提供公开采用路径 |
| Glossary / external citation | 是 | 新的 authoring / provenance 能力 |
| Route JSON / fixture smoke / citation report | 是 | 可验证性和诊断能力 |
| Runtime boundary / entry triage | 作为 non-goal / roadmap | 只说明未实现 runtime |
| `changelog.delta` 300 字符问题 | 不作为 release blocker | 继续由后续 U-134/U-135 处理 |

## 后续任务

| 任务 | 目的 |
|---|---|
| U-096 | package artifact inventory guard |
| U-097 | install smoke from packed tarball |
| U-098 | public issue close-on-merge audit |
| U-100 | release candidate gate |
| U-101 | release execution playbook dry run |
