# Negative Fixture Expansion Plan

任务：U-114
状态：已完成
日期：2026-05-12

## 目标

为下一批 high-value negative fixtures 排序，明确 expected rules 和文件范围；本任务不一次性补全 fixtures。

## 当前缺口

fixture manifest 当前 9 个 fixture 全部是 positive/pass，`expected_rules=0`。这足以证明 golden export path 存在，但不能证明常见失败样例被 fixture manifest 捕获。

## 下一批 Negative Fixture 候选

| 优先级 | Fixture 候选 | expected_status | expected_rules | 覆盖风险 |
|---:|---|---|---|---|
| 1 | missing implementation evidence ref | fail | `implementation-acceptance-criteria-evidence-ref` | criteria 指向不存在 evidence |
| 2 | stale stable decision evidence | fail | `decision-provenance-stable-evidence` | stable consumption 依赖 stale/unresolved evidence |
| 3 | duplicate glossary alias | fail | glossary alias collision rule | canonical term registry 漂移 |
| 4 | unsafe authoritative citation | fail | external citation authoritative locator/version rule | 外部权威引用缺少可复核定位 |
| 5 | golden path missing | fail | `fixture-golden-path` | fixture manifest 自身路径退化 |
| 6 | positive fixture with expected rules | fail | `fixture-positive-rules` | fixture contract 写反 |
| 7 | negative fail without expected rules | fail | `fixture-negative-rules` | negative fixture 不可审查 |

## 文件范围

| 范围 | 策略 |
|---|---|
| `examples/compiled-pilot-source/fixtures/fixture-manifest.json` | 先追加少量 negative fixture 声明 |
| `examples/compiled-pilot-source/fixtures/negative/` | 若需要独立输入，单独建目录 |
| `benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | 保持 manifest contract smoke |
| `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 继续承载 schema/validator negative semantics |

## 执行规则

1. 每次最多补 2-3 个 negative fixtures。
2. 每个 negative fixture 必须有稳定 expected rule。
3. 不为了 fixture 覆盖复制整套 authoring source。
4. 不让 fixture smoke 负责执行 compile 或 validate。

## 非目标

- 不一次性扩全量。
- 不建立 conformance runner。
- 不把 fixture manifest 变成 validator 的第二实现。
