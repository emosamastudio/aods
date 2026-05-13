# AODS Operations Hygiene Sync

日期：2026-05-13
回合：R-2026-05-13-48
范围：U-652 到 U-661

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `a348084 Document runtime protocol static records` |
| 台账指针 | 通过 | 当前默认任务为 U-652 到 U-661 |
| 返工需要 | 无 | 上轮 runtime/protocol static record proposal 成果可继续承接 |

## U-652 round log archive split execution

执行：将拆分前完整 `docs/operations/aods-round-log.zh-CN.md` 复制到 `docs/operations/archive/aods-round-log-archive-2026-05-13.zh-CN.md`。

当前 `aods-round-log.zh-CN.md` 改为短入口：

- 保留当前回合 R-2026-05-13-48 详情；
- 保留最近两轮摘要；
- 历史细节指向 archive。

验收：当前入口从 7768 行降到短读面，完整历史仍可 grep / 链接访问。

## U-653 task ledger automation script feasibility

Decision：暂不新增脚本。

理由：

1. 当前人工 `awk` 检查已经足够稳定；
2. 台账窗口仍只有 30 个未完成任务和 30 个最近完成项；
3. 真正的重复风险在 round log / handoff 长度，不在计数本身。

保留手动检查命令：

```bash
awk 'BEGIN{section="";u=0;c=0} /^## 未完成任务/{section="u"; next} /^## 最近已完成任务/{section="c"; next} /^## /{if(section=="u"||section=="c") section=""} section=="u" && /^\| U-[0-9]+ /{u++} section=="c" && /^\| [0-9]+ \| U-[0-9]+ /{c++} END{print "unfinished=" u; print "recent_completed=" c}' docs/operations/aods-task-ledger.zh-CN.md
```

自动化触发条件：连续两轮出现计数漂移、next pointer 漂移或 recent window 行数漂移。

## U-654 handoff summary shrink pass

执行：压缩 handoff 当前完成摘要，把多轮细项合并为阶段范围摘要。

目标：接手者先读状态、风险、下一步；需要历史细节时再读专题页和 archive。

## U-655 operations README topic table pruning

Decision：本轮不拆分 operations README topic table，也不生成索引。

理由：

1. 当前 topic table 仍是 30 项以内的近期专题入口；
2. round log 已完成归档，最大的阅读成本已经下降；
3. topic table 生成器会引入新的维护面，当前收益不足。

执行：只更新 round log archive 链接和当前专题入口。

## U-656 local MEMORY compaction action

执行：本地 `MEMORY.md` 压缩到当前状态 + 最近回合摘要。该文件仍保持 untracked，不进仓库。

保留信息：

- AODS / Polaris 解耦边界；
- GitHub 授权和 proxy 经验；
- 当前任务池 / release / issue 状态；
- installed skill 不自动覆盖；
- 最近三轮回合摘要。

## U-657 knowledge base write decision after closeout

Decision：本轮不写知识库。

理由：

1. 本轮是项目内部操作治理，不是外部研究或跨项目架构决策；
2. 关键状态已经在本仓库 file-backed operations 面落地；
3. 没有新增需要进入 `~/workspace/knowledge/` 的通用研究结论。

## U-658 AGENTS / MEMORY drift check

结果：未发现冲突。

| Surface | 结论 |
|---|---|
| `/Users/emosama/workspace/AGENTS.md` | 要求每轮复审、汇报格式、`proxy_on` 经验和 project-local MEMORY；当前遵守 |
| repo `AGENTS.md` | 要求 compiled-corpus-first、task ledger 单一权威、语义变更先最小验证；当前遵守 |
| local `MEMORY.md` | 记录 AODS 独立、GitHub 授权、MEMORY 不进仓库；当前遵守 |

## U-659 aods-use installed skill sync explicit plan

Decision：不自动覆盖 installed skill。

Repo packaged skill 比 installed skill 多：

- release/package version alignment；
- `upgrade` lane；
- fixture/conformance command path；
- `aods --help` command discovery；
- release alignment trigger notes。

显式同步步骤：

```bash
cp skills/aods-use/SKILL.md /Users/emosama/.agents/skills/aods-use/SKILL.md
```

该动作只应在 owner 明确要求刷新 installed skill 时执行，并保持 local-only，不进仓库提交。

## U-660 `#60` body refresh execution decision

执行：已更新 `#60` 正文顶部 current status 区块。

链接：`https://github.com/emosamastudio/aods/issues/60`

范围：

- 保留旧 dependency map；
- 顶部补 v0.9.0 已完成能力；
- 指向 `#64` 作为 runtime/protocol 后续；
- 不关闭 `#60`。

## U-661 `#64` label / body audit after static records

Decision：不改 `#64` label 或 body。

当前 `#64`：

- state：open；
- labels：`enhancement`、`priority/p2`、`area/governance`；
- body：仍明确 runtime/protocol deferred；
- 最新评论：`https://github.com/emosamastudio/aods/issues/64#issuecomment-4440776438`。

该状态仍准确，不需要重复评论或正文编辑。

## 本轮验证

| 验证项 | 命令或方式 | 结果 |
|---|---|---|
| Task ledger count | `awk ... docs/operations/aods-task-ledger.zh-CN.md` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 通过 |
| Release hygiene | `npm run release:hygiene` | 通过 |
| Staged set | `git diff --cached --name-only` | 排除 `MEMORY.md` |

## 后续建议

下一轮默认 U-662 到 U-671：v0.9.1 patch release candidate gate、v0.10 semantic scope proposal、changelog skeleton、package inventory baseline、release notes delta、branch cleanup packet、tag/source mismatch note、npm publish owner gate、CI owner packet 和 hosted repeatability trigger。
