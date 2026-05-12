# AODS Post-Release Retrospective And Next Milestone Triage

状态：U-102 已完成
日期：2026-05-12
范围：release 后复盘模板、next milestone 候选和 public roadmap sync 入口；不替代实际 release

## 结论

Post-release retrospective 模板和 next milestone triage 入口已定义。由于本轮没有 release，本文件不记录真实 post-release 结果，只提供未来 release 后的固定复盘格式。

## Retrospective Template

| Area | Questions | Evidence |
|---|---|---|
| Release scope | 实际发布了哪些 major changes？哪些明确未发布？ | GitHub Release body、tag diff |
| Validation | release 前后哪些 gate 通过？是否有 waived gate？ | `release:self-check`、pack dry-run、install smoke |
| Public sync | covered issues 是否关闭？deferred issues 是否保持 open？ | issue state snapshot |
| Package | packaged files 是否符合 inventory guard？安装冒烟是否通过？ | dry-run JSON、install smoke log |
| Docs | README latest release、install command、release notes 是否一致？ | README diff、release URL |
| Drift | implementation evidence / acceptance criteria 是否有新的 stale / unchecked posture？ | validate reality summary |
| Follow-up | 哪些问题进入下一 milestone？哪些不做？ | task ledger and GitHub issue comments |

## Next Milestone Candidates

| Candidate | Source Tasks | Why |
|---|---|---|
| Drift / evidence hardening | U-103 到 U-112 | 继续解决规范与实现证据之间的可追踪性 |
| Fixture / conformance | U-113 到 U-122 | 提高 example packs、fixture smoke、golden export 的覆盖和稳定性 |
| CLI / validation docs | U-123 到 U-132 | 让 validate / route 输出契约更可消费 |
| Authoring / docs / citation | U-133 到 U-142 | 收束 source-first authoring、changelog ergonomics、glossary/citation 指引 |
| Risk / exposure / audit | U-143 到 U-150 | 加强安全、远程暴露和 audit metadata 的静态检查 |
| Far runtime decisions | U-151 到 U-160 | 只做 PoC decision gate，不直接实现 runtime |

## Public Roadmap Sync

| Public item | Sync rule |
|---|---|
| Umbrella roadmap issue | release 后 comment 一次，不把它关闭 |
| Deferred runtime issues | 只在进入对应 PoC decision gate 后更新 |
| Changelog ergonomics issue | 只有当 release workflow 实际受阻时提升优先级 |
| PR body | merge 前后保持 close/deferred issue list 同步 |

## Current Recommendation

当前没有 release，因此下一步仍按任务台账执行 U-106 到 U-115 的 drift workflow 与 fixture coverage 任务。
