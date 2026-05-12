# AODS fixture smoke / conformance docs update

状态：U-175 已完成；U-221 到 U-224 已实现 first slice
日期：2026-05-12
范围：公开 README 与 operations docs 的 fixture / conformance 边界说明

## 结论

公开文档现在应区分三层能力：

| 层级 | 当前状态 | 作用 | 非目标 |
|---|---|---|---|
| Fixture smoke | 已实现 | 检查 fixture manifest 字段、expected outcome、input/golden path | 不执行 command、不验证业务语义 |
| Conformance manifest | 已实现 first slice | 描述 suite/case/expected outcome | 不声明 arbitrary command |
| Conformance runner | 已实现只读 MVP | 按 manifest 执行 fixture-smoke / validate case 并输出 report | 当前不建 dashboard、不接外部服务、不执行任意命令 |

## 本轮文档更新点

1. README fixture smoke 说明补充当前 source-first 示例已有 first-slice negative fixture declarations。
2. `aods-route-json-explanation.zh-CN.md` 更新 dependency explanation 字段契约，避免 route JSON 扩展只存在于代码里。
3. operations 索引加入本轮五份文档，方便后续 agent 从入口恢复上下文。

## 对用户的意义

这轮让示例不只证明“好路径能过”，也证明“坏声明会被拦住”。后续做完整 conformance 时，可以沿着已经明确的 manifest/report 契约推进，而不是把轻量 smoke 命令临时扩成执行框架。

## 保留边界

1. 不改变 fixture smoke JSON 字段。
2. 不把 negative fixture 输入纳入主清单的 golden exports。
3. 不让 README benchmark sync 区块承载 durable wording。
4. 不把 conformance runner 扩成通用命令执行器。
