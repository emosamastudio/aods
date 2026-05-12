# Compiled Pilot Schema Mirror Audit

任务：U-119
状态：已完成
日期：2026-05-12

## 目标

审查 compiled-pilot schema 与 root schema 的同步策略和风险点。当前不手改 generated schema。

## Mirror Evidence

命令：

```bash
for p in schema/manifest.schema.json schema/manifest-companion.schema.json schema/module.schema.json; do
  q="examples/compiled-pilot/$p"
  cmp -s "$p" "$q" && printf 'MATCH %s\n' "$p"
  shasum -a 256 "$p" "$q"
done
```

| Schema | 状态 | SHA-256 |
|---|---|---|
| `schema/manifest.schema.json` | MATCH | `b351920c04560085c2112f2be762a258feb39fec01c2eecd26b18b46a1133f48` |
| `schema/manifest-companion.schema.json` | MATCH | `12f10a3b1532453c9615de1930855618ce925b2e8dea5465e3761c3f47c582cc` |
| `schema/module.schema.json` | MATCH | `16d4e42cd4db71885e7d12cde8727acbdca2100fd4ec126d66f365d1c7d9a631` |

`schema/authoring.schema.json` 没有 compiled-pilot mirror；这是预期状态，因为 compiled corpus 不携带 authoring source schema。

## 同步策略

| 场景 | 正确路线 |
|---|---|
| root schema 语义变化 | 改 root schema / compiler，再重新编译 source-first pilot |
| compiled-pilot schema drift | 运行 `npm run compile:pilot`；若仍 drift，检查 compiler copy 逻辑 |
| release 前 schema mirror 校验 | `npm run validate:all` + package self-check |
| generated schema 人工 diff | 默认拒绝，回到 source / compiler 层修复 |

## 风险点

| 风险 | 影响 | 缓解 |
|---|---|---|
| root schema 改了但 pilot 未编译 | example schema 落后，用户复制旧契约 | compile gate 和 diff review |
| 手改 compiled schema | source / compiled authority 分叉 | 禁止手工 semantic edit |
| authoring schema 被误期望出现在 compiled output | 错误判断缺文件 | 明确 compiled output 只镜像 runtime schema |

## 非目标

- 不新增 schema 文件。
- 不手改 `examples/compiled-pilot/schema/`。
- 不把 compiled-pilot schema 当 root authority。
