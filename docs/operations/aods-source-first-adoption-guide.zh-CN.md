# AODS source-first adoption guide

状态：U-081 已完成
日期：2026-05-08
适用范围：source-first example packs 的公开采用路径

## 人话说明

这轮补的是一份实操说明：新人想改示例时，先看哪里、改哪里、跑哪些检查，都能按顺序走。价值是减少“直接改生成结果”“忘记重新检查”“把示例误认为后台能力已经实现”这类维护错误。

## 已落地入口

| 入口 | 用途 |
|---|---|
| `examples/compiled-pilot-source/README.md` | source-first example packs 的最小采用路径 |
| `README.md` | 公开英文入口，指向采用说明 |
| `README.zh-CN.md` | 公开中文入口，指向采用说明 |

## 采用路径

| 步骤 | 命令或位置 | 说明 |
|---|---|---|
| 1 | `examples/compiled-pilot-source/authoring.json` | 先改源权威，不手改生成目录 |
| 2 | `npm run compile:pilot` | 重新生成 compiled example |
| 3 | `npm run validate:compiled-pilot` | 校验生成结果 |
| 4 | `npm run fixture:smoke` | 冒烟检查 fixture / golden export 声明 |
| 5 | `node ./bin/aods.mjs route ./examples/compiled-pilot --query ...` | 改动前先找到最小相关权威 |
| 6 | `npm run validate:all` | 合入前跑全仓语义门禁 |

## 明确非目标

1. 不新增新的 example pack。
2. 不改 benchmark sync 区块。
3. 不声称示例代表命令执行器、事件存储、适配器运行时、资源调度器、爬虫或事实核验器已经实现。
4. 不触碰 Polaris sibling repo。

## 验证

| 验证项 | 命令 | 结果 |
|---|---|---|
| RED regression | `node --test ./benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 初次失败于缺少 adoption path |
| GREEN focused regression | `node --test ./benchmarks/aods-eval-lab/test/example-packs.test.mjs` | 9/9 pass |

## 后续

下一轮首选 U-082：external citation stale/current hygiene report。该任务应继续保持窄边界，不做 crawler、URL checker 或 fact checker。
