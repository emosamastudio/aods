# AODS Docs Navigation Dead-Link Local Checker Triage

任务：U-142
状态：已完成
日期：2026-05-12
范围：local Markdown link checker triage；不抓取外网

## 目标

明确本地 docs 链接检查的范围、误报和最小命令路线。当前不引入外部爬虫，不检查远端 URL。

## 本轮检查结果

| 指标 | 值 |
|---|---:|
| Markdown files scanned | 89 |
| Local markdown links checked | 61 |
| Missing local targets | 0 |

## 最小命令路线

本轮使用 Node 脚本扫描 `docs/`、`README.md`、`README.zh-CN.md`、`CONTRIBUTING.md` 中的 Markdown link。

| 处理 | 说明 |
|---|---|
| 检查相对路径 | 解析为当前 Markdown 文件所在目录的相对路径 |
| 忽略外部链接 | `http://`、`https://`、`mailto:` 不抓取 |
| 忽略纯 anchor | 当前不校验 heading anchor |
| 忽略空 target | 避免把占位格式误报 |

## 当前判断

| 项 | 判断 |
|---|---|
| 是否需要立刻新增 npm script | 暂不需要 |
| 是否存在断链阻塞 | 未发现 |
| 是否需要外网检查 | 不需要，且不符合当前任务边界 |
| 是否需要纳入 release gate | 只有断链反复出现时再纳入 |

## 误报边界

| 类型 | 当前处理 | 原因 |
|---|---|---|
| heading anchor | 不校验 | 中文 heading anchor 转换规则容易误报 |
| HTML / raw URL | 不校验 | 当前文档以 Markdown link 为主 |
| generated README sync block | 不改写 | benchmark sync 区块由生成脚本维护 |
| 外部站点可达性 | 不检查 | 网络状态和远端站点不应影响本地 docs gate |

## 非目标

- 不抓取外网。
- 不校验所有 heading anchor。
- 不新增 CI gate。
- 不重写 docs navigation。
