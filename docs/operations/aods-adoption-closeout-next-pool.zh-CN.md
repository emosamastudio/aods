# AODS adoption closeout / next task pool

日期：2026-05-13
范围：U-622 到 U-631

## 结论

本轮完成 post-v0.9 第一阶段收口：compiled-corpus adoption smoke 通过，外部采用失败模式已整理，README troubleshooting 暂不扩写，release branch/tag 做了只读审计，`MEMORY.md` 暂不压缩，operations archive 后续需要专门处理，下一 release 命名建议采用条件触发，任务池扩展到 U-632 到 U-681。

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `9c88458 Record static records adoption follow-up` |
| Task ledger | 通过 | 当前默认任务为 U-622 到 U-631 |
| 返工项 | 无 | 上轮成果合格，直接进入本轮 |

## U-622 compiled-corpus adoption smoke from release source

在全新目录从 GitHub tag 安装 `v0.9.0`，直接验证包内 compiled corpus：

```sh
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.9.0
./node_modules/.bin/aods validate ./node_modules/aods/examples/compiled-pilot --strict --json
./node_modules/.bin/aods route ./node_modules/aods/examples/compiled-pilot --query "adapter capability fallback metadata" --intent read --stage orientation --json
```

结果：

| 检查 | 结果 |
|---|---|
| installed package version | `0.9.0` |
| validate status | `pass` |
| modules | 11 |
| warnings | 0 |
| route strategy | `query-route` |
| selected modules | `shift-ops-adapter-capability`, `shift-ops-capsule` |

## U-623 external adoption failure-mode packet

最可能的 5 类外部采用失败：

| 失败模式 | 典型表现 | 当前处理 | 下一步 |
|---|---|---|---|
| wrong install source | 安装到旧 tag 或未发布分支 | README 指向 `v0.9.0` | 增加 version ergonomics task |
| source-first vs compiled-corpus 混淆 | 手改 generated corpus 或从 compiled output 反推 source | docs 已说明 source authority | 可补 troubleshooting 短页 |
| strict warnings 被误判为 errors | deprecated term / freshness warning 在 strict 下阻断 | strict 行为已记录 | 给 failure-mode docs 示例 |
| reality validation locator 误解 | 例子 repo locator 不存在，被理解成失败 | `--reality` 才检查 reality，compiled adoption strict pass | troubleshooting 说明 reality 与 normal validate |
| runtime overclaim | 把 capability / event / migration 静态记录当 runtime | README / release notes 明确 no runtime | 继续在 #64 和 docs 中收窄 |

## U-624 README troubleshooting section decision

Decision：暂不扩写主 README。

原因：

- `README.md` 已约 641 行；
- 失败模式需要可维护的短页，而不是再塞主 README；
- 主 README 应只保留 adoption path 和链接。

下一步任务池加入 troubleshooting 短页实现任务。

## U-625 post-v0.9 retrospective issue comment decision

Decision：本轮不向 `#60` 追加 retrospective comment。

原因：

- `#60` 已有 post-v0.9 release comment；
- 本轮主要是本地收口和采用验证，不是新的公开 release；
- 下一次公开同步更适合在 body refresh 或 next owner go/no-go 后执行。

## U-626 release branch/tag cleanup audit

只读审计结果：

- `main` 指向最新提交。
- `v0.9.0` tag 指向 release commit `ea9e44c`，这是预期：tag source intentionally before later operations commits。
- 没有错误的 `v0.9.x` 额外 tag。
- 远端仍有旧 feature / release branches，例如 `release/v0.3.0` 和多条 `feature/*`。

Decision：本轮不删除远端分支。branch cleanup 需要单独 owner packet，避免删除历史上下文。

## U-627 local MEMORY compaction decision

`MEMORY.md` 当前约 381 行，虽然包含历史块顺序不完全连续，但顶部摘要仍能接手。

Decision：暂不压缩。继续保持 local-only，不进仓库。若后续超过 600 行或顶部摘要落后，再做本地压缩。

## U-628 operations archive split follow-up

当前：

- `docs/operations/aods-round-log.zh-CN.md` 约 7576 行；
- archive 目录当前 3 个文件；
- task ledger / handoff 已压缩，round log 仍长。

Decision：需要后续专门任务拆分 round log archive，但本轮不做，以免和收口任务混在一起。

## U-629 v0.10 naming / scope trigger decision

建议：

| 下一版本 | 触发条件 |
|---|---|
| `v0.9.1` | docs / adoption / generated summary / troubleshooting / package surface 小修 |
| `v0.10.0` | 新增 schema、validator 规则、source-first semantic surface、runtime/protocol static records package-facing capability |

当前状态更接近 `v0.9.1` maintenance lane；除非下一轮启动 runtime/protocol static record schema 或新的 validator hardening，否则不应直接命名为 `v0.10.0`。

## U-630 next owner go/no-go packet

当前推荐路线：

1. 先做 adoption / troubleshooting / version ergonomics。
2. 再做 round-log archive split 和 operations hygiene。
3. 然后再决定 runtime/protocol static records 是否进入 schema / validator。

Go：

- 修复外部采用阻碍；
- 改善 CLI version ergonomics；
- 拆分过长 operations 历史；
- 给 `#60/#64` 做低频公开同步。

No-go：

- 不实现 runtime；
- 不删除远端旧分支；
- 不发布 npm；
- 不把 migration helper 提升为 package docs；
- 不在 README 继续扩写大段 troubleshooting。

## U-631 next task pool expansion

新增 U-632 到 U-681。下一轮默认 U-632 到 U-641。

任务设计原则：

- 每轮继续 10 个任务；
- 先处理 adoption / docs / ergonomics；
- 再处理 runtime/protocol 静态记录；
- 最后处理 release planning 和 implementation candidates。

## 验证命令

| 命令 | 结果 |
|---|---|
| fresh compiled-corpus adoption smoke from `v0.9.0` | pass |
| `git ls-remote --heads origin` / `git ls-remote --tags origin 'v0.*'` | pass，只读审计 |
| `gh issue view 60/64 --json ...` | pass，只读审计 |
| `wc -l MEMORY.md docs/operations/aods-round-log.zh-CN.md ...` | pass，size audit |
