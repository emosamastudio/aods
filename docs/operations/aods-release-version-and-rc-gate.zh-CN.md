# AODS release version and RC gate refresh

状态：U-188 到 U-190 已完成
日期：2026-05-12
范围：next release version decision、version/changelog preparation、release candidate gate rerun

## Version decision

下一 public release 目标版本选择为 `v0.8.0` / package `0.8.0`。理由：

1. 当前 public latest 是 `v0.7.0`，package 仍为 `0.7.0`。
2. PR `#63` 是 `v0.7.0` 之后的第一个大批量 public review surface。
3. 变更包含新 schema / validator / CLI / examples / docs 能力，应使用 minor bump，而不是 patch bump。
4. 内部文档中的 v0.11 / v0.12 是 backlog 阶段名，不应直接映射为 public package version。

本轮不修改 `package.json`、`package-lock.json`、README version surface、tag 或 release。version bump 应在 PR review / merge 路线明确后单独执行。

## Changelog / release notes preparation

下一 release notes 应覆盖：

| Section | Content |
|---|---|
| Major changes | drift evidence、acceptance criteria、remediation、provenance/freshness、canonical examples、glossary/citation、route/reality diagnostics、fixture smoke、negative fixtures、dependency diagnostics |
| Non-goals | no workflow runtime、event store、policy engine、remote gateway、migration executor、capability negotiation runtime、observability store |
| Validation | `validate:all`、`benchmark:test`、`release:self-check`、fixture / route focused regression、package dry-run |
| Public sync | PR `#63` ready for review；20 close-on-merge refs recognized；`#13/#41/#59/#60` kept open |
| Release caveat | version bump / tag / release remain separate follow-up actions |

## RC gate rerun

`npm run release:self-check` passed after public sync.

| Gate | Result |
|---|---|
| root strict validation | pass |
| seven-plane pilot strict validation | pass |
| compiled-pilot strict reality validation | pass |
| benchmark all | pass |
| pack dry-run | pass |
| package name/version | `aods@0.7.0` |
| tarball | `aods-0.7.0.tgz` |
| package files | 55 |
| package size | 210.2 kB |
| unpacked size | 1.1 MB |

## Release verdict

Technical gate passes, but public release is still no-go until:

1. PR `#63` is reviewed and merged.
2. version surfaces are bumped to `0.8.0` / `v0.8.0`.
3. README release links are updated.
4. a GitHub Release body is prepared from the release notes.
5. owner explicitly starts release publication.
