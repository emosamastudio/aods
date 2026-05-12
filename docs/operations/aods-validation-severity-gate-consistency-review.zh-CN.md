# Validation Severity Gate Consistency Review

任务：U-128
状态：已完成
日期：2026-05-12

## 目标

审查 L1-L4、warning、strict gate 与 runtime 输出是否一致。当前只做一处与 U-135 相关的 warning 行为回归，不重写 severity policy。

## Gate Matrix

| 类别 | 普通 validate | strict validate | strict compile | 本轮判断 |
|---|---|---|---|---|
| L1 schema error | fail | fail | fail | 一致 |
| L2 reference / drift error | fail | fail | fail | 一致 |
| L3 warning | pass | fail | fail | 一致 |
| L4 warning | pass | fail | fail | 一致 |

## 本轮验证

新增 changelog delta soft warning 回归：

| 输入 | 结果 |
|---|---|
| 350 字符 delta | 普通 compile pass，输出 warning |
| 350 字符 delta + strict compile | fail，目标目录不写入 |
| validate JSON | pass，L3 warnings 包含 remediation |
| 501 字符 delta | schema hard fail |

## 结论

当前 severity policy 与 runtime bucket 一致：warning 不阻断普通 validate/compile，但 strict 会阻断；schema hard limit 继续作为 error。无需在本轮改 severity taxonomy。

## 非目标

- 不新增 severity_class runtime 字段。
- 不改变 strict 语义。
- 不把 warning 升级为 release-blocking。
