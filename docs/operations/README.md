# AODS operations 入口

本目录承载 AODS 仓库当前的项目治理面。

## 当前权威文件

| 文件 | 作用 | 权威级别 |
|---|---|---|
| `aods-task-ledger.zh-CN.md` | 当前任务顺序、状态、验收标准、证据 | 最高 |
| `aods-work-rules.zh-CN.md` | 项目专属维护规则和同步要求 | 高 |
| `aods-v0.7-owner-roadmap.zh-CN.md` | v0.7 owner 决策，裁剪 issue roadmap 到可执行范围 | 高 |
| `aods-takeover-plan.zh-CN.md` | 2026-05-07 接手计划、当前回合边界和后续路线 | 高 |
| `aods-dirty-worktree-attribution.zh-CN.md` | 当前 dirty worktree 文件归因、提交拆分和风险边界 | 高 |
| `aods-github-sync-approval.zh-CN.md` | GitHub issue / PR / release 公开动作审批矩阵 | 高 |
| `aods-code-drift-roadmap.zh-CN.md` | 代码漂移路线、implementation evidence 最小切片和后续验证边界 | 高 |
| `aods-v0.8-backlog.zh-CN.md` | v0.7 release 后的 v0.8 backlog triage、open issue 排序和下一 drift 切片 | 高 |
| `aods-v0.9-backlog.zh-CN.md` | v0.8 backlog 清空后的 write/event/governance 候选路线 | 高 |
| `aods-v0.10-backlog.zh-CN.md` | v0.9 backlog 清空后的 risk/exposure/audit hardening 候选路线 | 高 |
| `aods-v0.11-backlog.zh-CN.md` | v0.10 队列收束后的 documentation / authoring quality 候选路线 | 高 |
| `aods-surface-family-example-plan.zh-CN.md` | `#56` surface-family example pack 分批路线、U-051 read-model、U-052 command/receipt、U-053 event/correction、U-054 adapter/capability、U-055 artifact/export/policy-gate、U-058 resource 包结果和本地收束结论 | 高 |
| `aods-expanded-task-plan.zh-CN.md` | U-058 后的扩展任务池、批量执行规则和下一批推荐 | 高 |
| `aods-glossary-registry-plan.zh-CN.md` | `#57` glossary / canonical-term registry v2 boundary、schema/validator/example 后续任务裁剪 | 高 |
| `aods-external-citation-plan.zh-CN.md` | `#58` external citation / provenance metadata boundary、schema/validator/example 后续任务裁剪 | 高 |
| `aods-v0.7-rc-gate.zh-CN.md` | v0.7 release candidate gate、版本面判断和 release note skeleton | 高 |
| `aods-round-log.zh-CN.md` | 当前回合锁定、范围和验证记录 | 高 |
| `aods-progress-ledger.zh-CN.md` | 阶段口径与阶段进度 | 中 |
| `aods-handoff.zh-CN.md` | 接手入口和当前风险边界 | 高 |

## 新 agent 启动顺序

1. 读 `manifest.json`
2. 读 `docs/README.md`
3. 读本文件
4. 读 `aods-task-ledger.zh-CN.md`
5. 读 `aods-work-rules.zh-CN.md`
6. 读 `aods-v0.7-owner-roadmap.zh-CN.md`
7. 读 `aods-takeover-plan.zh-CN.md`
8. 读 `aods-dirty-worktree-attribution.zh-CN.md`
9. 读 `aods-github-sync-approval.zh-CN.md`
10. 读 `aods-code-drift-roadmap.zh-CN.md`
11. 读 `aods-v0.8-backlog.zh-CN.md`
12. 读 `aods-v0.9-backlog.zh-CN.md`
13. 读 `aods-v0.10-backlog.zh-CN.md`
14. 读 `aods-v0.11-backlog.zh-CN.md`
15. 读 `aods-surface-family-example-plan.zh-CN.md`
16. 读 `aods-expanded-task-plan.zh-CN.md`
17. 读 `aods-glossary-registry-plan.zh-CN.md`
18. 读 `aods-external-citation-plan.zh-CN.md`
19. 读 `aods-v0.7-rc-gate.zh-CN.md`
20. 读 `aods-handoff.zh-CN.md`
21. 接续当前回合时再读 `aods-round-log.zh-CN.md`

## 当前维护范围

- 根语义面：
  - `manifest.json`
  - `schema/`
  - `spec/`
  - `modules/`
- CLI / runtime：
  - `bin/`
  - `lib/`
- benchmark：
  - `benchmarks/aods-eval-lab/`
- 发布与公开入口：
  - `README.md`
  - `README.zh-CN.md`
  - `CONTRIBUTING.md`
  - `.github/`
- examples：
  - `examples/compiled-pilot-source/`
  - `examples/compiled-pilot/`
  - `examples/seven-plane-pilot/`

## AODS-specific maintenance notes

1. 公开 README 的 benchmark sync 区块来自 `benchmarks/aods-eval-lab/src/summary.mjs`。
2. `validate:all` 是语义改动后的 repo-level gate；如果变更 benchmark 生成逻辑，还需要补对应 benchmark 命令。
3. `release:self-check` 是发布前总门禁；AODS 的正式版本发布统一走 GitHub Releases，npm registry publish 不再是 release 完成条件。
