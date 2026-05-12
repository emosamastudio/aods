# AODS Final Handoff And Task Discovery

状态：U-199 到 U-200 已完成
日期：2026-05-12
范围：final handoff compaction、post-public-closeout task discovery；`MEMORY.md` local-only，不进仓库

## 结论

U-191 到 U-200 后，当前工作面从“补公开同步”转为“等待 review / merge / release 决策，并准备下一段可验证自动化和 conformance 能力”。本轮没有执行 merge、release、tag、issue close 或 package version bump。下一批任务应先从 release closeout 的低风险 dry-run / audit 开始，再进入本地 hygiene automation 和 conformance runner MVP。

## Current Public State

| 项 | 状态 |
|---|---|
| PR `#63` | ready for review |
| Merge state | clean |
| Changed files | 185 |
| Reviews | 0 |
| Checks | 0 |
| Close-on-merge refs | 20 recognized |
| Deferred open issues | `#13/#41/#59/#60` |
| Latest public release | `v0.7.0` |
| Package version | `0.7.0` |
| Next target | `v0.8.0` / package `0.8.0` after review / merge / owner go-no-go |

## Handoff Compression

下一位接手者只需要先看：

1. `docs/operations/aods-task-ledger.zh-CN.md`
2. `docs/operations/aods-round-log.zh-CN.md`
3. `docs/operations/aods-handoff.zh-CN.md`
4. `docs/operations/aods-release-closeout-readiness-plan.zh-CN.md`
5. `docs/operations/aods-repeatable-local-hygiene-and-skill-alignment.zh-CN.md`
6. `docs/operations/aods-final-handoff-and-task-discovery.zh-CN.md`

`MEMORY.md` 已同步本地状态，但仍必须保持 untracked。

## New Task Discovery

新增 U-201 到 U-230，分三批进入台账。新任务不插入当前回合；下一轮默认选择 U-201 到 U-210。

### Batch AB: Release Closeout Dry-Run

| Task | Goal | Boundary |
|---|---|---|
| U-201 | PR body final freshness refresh | 可更新 PR body；不 merge |
| U-202 | Close-on-merge refs final audit | 只核对 20 refs；不关闭 issue |
| U-203 | Review / checks policy decision record | 不直接新增 CI |
| U-204 | Release notes final body draft | 不创建 release |
| U-205 | Version bump dry-run patch plan | 不修改 package version |
| U-206 | README release link diff plan | 不创建 release link |
| U-207 | Package inventory rerun after final docs | 不发布 npm |
| U-208 | Packed install smoke rerun | local-only |
| U-209 | Release self-check rerun | 生成 churn 必须还原 |
| U-210 | Owner go/no-go packet refresh | 不执行 release |

### Batch AC: Local Hygiene Automation

| Task | Goal | Boundary |
|---|---|---|
| U-211 | Local docs link checker script implementation | 不抓取外网 |
| U-212 | Docs link checker npm script / docs | 不新增 CI |
| U-213 | Secret-like placeholder scan script implementation | 不建 secret scanner service |
| U-214 | Secret scan allowlist docs | 只允许测试合成样本 |
| U-215 | Package public surface guard script | 不发布 npm |
| U-216 | Generated artifact hygiene check script | 不自动接受 generated churn |
| U-217 | PR status snapshot command plan | read-only GitHub |
| U-218 | Issue close reconciliation command plan | 不关闭 issue |
| U-219 | Skill alignment regression | 不发布 skill |
| U-220 | Release hygiene aggregate command plan | 不新增 CI |

### Batch AD: Conformance / Diagnostics Next Slice

| Task | Goal | Boundary |
|---|---|---|
| U-221 | Conformance manifest schema implementation | fixture-only first |
| U-222 | Conformance report JSON schema implementation | 不建 dashboard |
| U-223 | Conformance runner read-only MVP | 不执行 arbitrary commands |
| U-224 | Negative fixture second slice | 小批量 |
| U-225 | Validator dependency diagnostics first slice | 不建 scheduler |
| U-226 | Route dependency docs parity pass | 不改 ranking |
| U-227 | Dependency graph cycle fixture design | 不执行 graph runtime |
| U-228 | Adapter negotiation example fixture | 不实现 handshake |
| U-229 | Cross-corpus resolver no-fetch fixture | 不 remote fetch |
| U-230 | Observability report store no-go refresh | 不建 telemetry store |

## Next Recommended Route

下一轮默认 U-201 到 U-210。理由：它们直接降低 PR `#63` merge / release 前的公开风险，且仍能保持 dry-run / audit 边界，不需要发布授权。
