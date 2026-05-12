# AODS negative fixture first slice

状态：U-171、U-172 已完成
日期：2026-05-12
范围：source-first compiled-pilot fixture manifest；不实现完整 conformance runner

## 结论

本轮把 U-114 中排序最高的三类 fixture contract 负例落地为首批 negative fixtures。主 fixture manifest 现在包含 12 个 fixture：9 个 positive、3 个 negative、9 个 golden exports、3 个 expected rules。

## 首批负例

| Fixture | 目标规则 | 价值 | 输入文件 |
|---|---|---|---|
| `negative-fixture-missing-golden-path` | `fixture-golden-path` | 防止 golden export 声明指向不存在路径 | `examples/compiled-pilot-source/fixtures/negative/fixture-contract/missing-golden-path.json` |
| `negative-fixture-positive-with-expected-rules` | `fixture-positive-rules` | 防止 positive/pass fixture 暗含失败规则 | `examples/compiled-pilot-source/fixtures/negative/fixture-contract/positive-with-expected-rules.json` |
| `negative-fixture-negative-without-expected-rules` | `fixture-negative-rules` | 防止 negative/fail fixture 没有可审查规则名 | `examples/compiled-pilot-source/fixtures/negative/fixture-contract/negative-without-expected-rules.json` |

## 实现边界

1. 主清单只声明负例输入和 expected rule，不执行这些负例的 update command。
2. 每个负例输入都是一个独立 fixture manifest，用 `aods fixture smoke <negative-manifest> --json` 验证其按预期失败。
3. 本轮不把 fixture smoke 扩成 runner，不新增执行器、不远程抓取、不自动接受 golden diff。

## 验收证据

| 验收项 | 命令或方式 | 结果 |
|---|---|---|
| 主清单 smoke | `npm run fixture:smoke -- --json` | pass；fixtures=12、positive=9、negative=3、golden_exports=9 |
| Negative declaration regression | `node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 覆盖 3 个负例声明 |
| Negative execution regression | `node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 每个负例输入都按 expected rule 失败 |

## 后续

下一批 negative fixtures 应优先覆盖 source-first compile、validator stable contract mirror、topology locator 和 route invalid enum，而不是一次性迁移全部历史场景。
