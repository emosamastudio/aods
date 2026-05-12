# AODS Repeatable Local Hygiene And Skill Alignment

状态：U-196 到 U-198 已完成
日期：2026-05-12
范围：local docs link checker automation plan、secret-like scan repeatability plan、aods-use skill release alignment check；不抓取外网、不建 secret scanner service、不发布 skill

## 结论

当前本地 hygiene 可用作 release 前人工 gate，但还不需要进入 CI。docs link checker 无断链；secret-like scan 只有一个测试中的合成 token 样本，排除该测试后无高置信命中；随包 `aods-use` skill 已补齐 `upgrade` 和 release alignment 触发说明，但本轮不发布 skill。

## U-196 Local Docs Link Checker Automation Plan

本轮复查命令扫描 `README.md`、`README.zh-CN.md`、`CONTRIBUTING.md` 和 `docs/`。

| 指标 | 结果 |
|---|---:|
| Markdown files scanned | 125 |
| Local markdown links checked | 61 |
| Missing local targets | 0 |

建议的后续自动化路线：

| Step | 内容 | 是否进入本轮 |
|---|---|---|
| Script | 把当前 Node one-liner 固化为本地脚本 | 否，后续单独任务 |
| Scope | 只查本地 Markdown 相对链接 | 是 |
| Exclusions | 外部 URL、mailto、纯 anchor、heading anchor | 是 |
| Gate | release 前人工运行 | 是 |
| CI | 只有断链问题反复出现后再评估 | 否 |

## U-197 Secret-Like Scan Repeatability Plan

本轮使用高置信 pattern 检查常见 token / private key 形状：

| 检查 | 结果 |
|---|---|
| 全仓高置信 scan | 1 hit |
| Hit 归因 | `benchmarks/aods-eval-lab/test/open-source-fetch.test.mjs` 中的合成 `xoxb-1234567890` 断言样本 |
| 排除该测试后的 scan | 0 hits |
| 文档 / 示例风险 | 未发现真实 secret-like value |

后续 repeatable route 应使用 allowlist，而不是扩大成 secret scanner service：

| 规则 | 说明 |
|---|---|
| 允许合成 fixture | 只允许在测试中出现，必须用于 sanitization assertion |
| 禁止真实 token shape | docs / examples / package surface 不应出现可复制 token |
| 只跑本地文件 | 不抓取外网、不查历史提交 |
| 不替代安全审计 | 这是 release hygiene，不是完整 secret scanning service |

## U-198 aods-use Skill Alignment Check

| Surface | 状态 | 判断 |
|---|---|---|
| Repo packaged skill | `skills/aods-use/` included in npm package | 本轮已补齐 `upgrade` / release alignment wording |
| Package metadata | `skill_version=0.7.0`、`aligned_release=v0.7.0` | 与当前 package `0.7.0` 对齐 |
| Local Codex skill | `/Users/emosama/.codex/skills/aods-use/SKILL.md` | 与 repo packaged skill 原先一致 |
| Local agents skill | `/Users/emosama/.agents/skills/aods-use/SKILL.md` | 已包含更完整的 upgrade / release alignment route |

本轮只修 repo packaged skill，使下一次 package dry-run 包含更准确的使用说明。不修改本机安装位置，不发布 skill，不声称 `v0.8.0` 已发布。

## Future Automation Candidates

| Candidate | 价值 | 风险 |
|---|---|---|
| `check:docs-links` | 低成本发现断链 | anchor 规则容易误报 |
| `check:secret-placeholders` | 防止示例误放 token shape | 需要维护 allowlist |
| `check:skill-alignment` | 防止随包 skill 漂移 | 需要明确本机 skill 与 repo skill 谁是发布源 |
| release hygiene aggregate | 一条命令跑本地 docs / secret / package guard | 可能变成过重 release gate |
