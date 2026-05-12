# AODS local hygiene automation

状态：U-211 到 U-220 已完成
日期：2026-05-13
范围：本地只读检查、命令入口、人工核对步骤；不新增 CI、不发布 npm、不抓取外网、不关闭 issue

## 结论

本轮把上一轮只在文档里描述的手工检查，收敛为可重复的本地命令：

| 任务 | 命令 / 证据 | 结论 |
|---|---|---|
| U-211 | `scripts/check-doc-links.mjs` | 本地 Markdown relative link checker 已落地；排除生成的外部语料目录，不抓取外网 |
| U-212 | `npm run docs:check-links` | 149 个 Markdown 文件、61 个本地相对链接、0 missing |
| U-213 | `scripts/scan-secret-placeholders.mjs` | 高置信 secret-like placeholder scan 已落地 |
| U-214 | 本文件 allowlist 说明 | allowlist 只允许已知合成测试样本边界；真实命中不隐藏 |
| U-215 | `scripts/check-package-surface.mjs` | package entry allowlist / diff guard 已落地；当前 55/55 entries matched |
| U-216 | `scripts/check-generated-clean.mjs` | generated / reports / compiled pilot churn 检查已落地；当前 0 dirty entries |
| U-217 | PR snapshot command | read-only PR state snapshot 已文档化 |
| U-218 | issue reconciliation command | merge 后 issue close/open verification 已文档化；不关闭 issue |
| U-219 | `benchmarks/aods-eval-lab/test/skill-package.test.mjs` | packaged skill 与 CLI command surface drift regression 已扩展 |
| U-220 | `scripts/release-hygiene.mjs` / `npm run release:hygiene` | 本地 release hygiene aggregate command 已落地；不新增 CI |

## npm scripts

| 命令 | 作用 | 外部副作用 |
|---|---|---|
| `npm run docs:check-links` | 检查仓库维护文档和示例中的本地相对链接 | 无；不抓外网 |
| `npm run security:scan-placeholders` | 扫描高置信 token / private key 形态 | 无；不接入 secret service |
| `npm run package:check-surface` | `npm pack --dry-run --json` 后比对 package file allowlist | 只 dry-run，不发布 |
| `npm run generated:check-clean` | 检查 benchmark generated、reports、compiled pilot 是否有未接受 churn | 无；不自动接受 churn |
| `npm run release:hygiene` | 串联 docs link、secret scan、package surface、generated clean、skill regression、`validate:all` | 无；不新增 CI、不发布 |

## allowlist boundary

Secret-like scan 的 allowlist 只用于已知测试夹具，目标是保留 sanitizer / redaction regression 的合成样本表达能力。当前扫描结果为 0 hit；若未来 synthetic test 需要组合出完整 token，allowlist 必须同时满足：

1. 文件路径固定在测试文件内。
2. pattern id 固定，不能按目录或全局通配。
3. 文档说明为什么是合成样本。
4. 真实源码、文档、生成报告中的命中不得通过 allowlist 隐藏。

## GitHub read-only commands

PR 状态快照：

```bash
source ~/.zshrc && proxy_on >/dev/null && gh pr view 63 --json isDraft,mergeStateStatus,changedFiles,reviews,closingIssuesReferences,headRefOid,url,title
```

merge 后 issue reconciliation：

```bash
source ~/.zshrc && proxy_on >/dev/null && gh issue list --state open --json number,title,url
source ~/.zshrc && proxy_on >/dev/null && gh issue list --state closed --json number,title,url,closedAt
```

核对规则：

| 类别 | 期望 |
|---|---|
| close-on-merge issues | `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58` 在 PR merge 后应关闭 |
| deferred issues | `#13/#41/#59/#60` 应继续 open，除非 owner 另行授权 |
| release state | version bump、tag、GitHub Release publication 仍需单独授权 |

## Verification snapshot

| 命令 | 结果 |
|---|---|
| `npm run docs:check-links` | pass；149 Markdown files、61 local links、0 missing |
| `npm run security:scan-placeholders` | pass；0 hits |
| `npm run package:check-surface` | pass；package `aods@0.7.0`、55 expected entries、0 missing、0 unexpected |
| `npm run generated:check-clean` | pass；0 dirty entries |
| `node --test benchmarks/aods-eval-lab/test/skill-package.test.mjs` | pass；2/2 |

## Non-goals

1. 不新增 CI workflow；这些命令先作为本地 release hygiene gate。
2. 不抓取外部链接；Markdown checker 只检查本地相对路径。
3. 不发布 npm 包；package guard 使用 dry-run。
4. 不自动接受 generated churn；dirty 时应先人工判断再恢复或入账。
5. 不关闭 issue；GitHub 命令只读。
