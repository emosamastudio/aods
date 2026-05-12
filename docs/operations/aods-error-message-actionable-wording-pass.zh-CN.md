# Error Message Actionable Wording Pass

任务：U-132
状态：已完成
日期：2026-05-12

## 目标

挑出高噪声错误信息，做最低风险的可操作性修复。当前不一次性改完所有错误。

## 本轮修复

| 场景 | 之前 | 现在 |
|---|---|---|
| route stage 错误 | 接受任意字符串，后续输出混乱 | 直接失败并列出允许值 |
| route intent 错误 | 接受任意字符串，后续输出混乱 | 直接失败并列出允许值 |
| schema `maxLength` 错误 | 只说超过限制，长值会造成噪声 | 输出 limit 和 received length |

## 示例

```bash
node ./bin/aods.mjs route . --stage begin --intent read
```

结果会提示 `Invalid route stage`，并列出 `any`、`orientation`、`plan`、`action`、`verification`、`evidence`。

## 回归

`benchmarks/aods-eval-lab/test/scaffold.test.mjs` 已覆盖 route stage / intent 错误和 changelog 501 字符 hard fail 的 received length。

## 非目标

- 不改所有 AJV keyword 输出。
- 不引入 error code registry。
- 不改变 exit code 语义。
