# Changelog Delta Schema Test Implementation

任务：U-135
状态：已完成
日期：2026-05-12

## 目标

按 U-134 的最小方案落地 schema、validator、test 和 spec 同步。

## 实现

| 文件 | 改动 |
|---|---|
| `schema/module.schema.json` | `changelog_entry.delta.maxLength` 从 300 调整为 500 |
| `lib/validate.mjs` | 新增 `changelog-delta-soft-limit` L3 warning |
| `lib/corpus-helpers.mjs` | `maxLength` error 增加 limit 和 received length |
| `lib/route.mjs` | route stage / intent 增加 allowed value 校验 |
| `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 新增 changelog soft/hard limit regression 和 route invalid arg regression |
| `spec/validation-rules.json` | 同步 schema limit、warning gate、remediation action 和 rule-set |

## 验证

```bash
node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs
```

结果：32/32 pass。

## 非目标

- 不新增 changelog array item schema。
- 不改 release notes 格式。
- 不引入 migration tool。
- 不改变 strict warning gate。
