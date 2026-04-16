# AODS v3

[English](./README.md) | [简体中文](./README.zh-CN.md)

Agent-Optimized Documentation System：一套面向 agent 的规范优先文档标准，用来构建既能被 agent 读取、又能被验证器和 hooks 治理、同时还能与人类可读表面协同的文档语料库。

## 问题是什么

大多数项目文档首先是为人写的。这会给 code agent 带来四类常见失败：

1. **检索成本高且容易歧义。** 许多 agent 的工作方式更接近 `grep`-first 和 file-structure-first，路由弱、术语不稳定，就会浪费上下文。
2. **权威来源是隐式的。** README、运维文档、实现细节之间即使冲突，也没有原生机制说明“到底谁说了算”。
3. **人类表面与 agent 表面容易漂移。** README 改了，agent-facing source of truth 没改；或者反过来。
4. **仓库总体体积与任务时上下文被混为一谈。** 语料库很大，并不等于单个任务的 working set 很大，但多数文档格式无法把这点测量清楚。

AODS 的存在，就是因为现有方案通常只解决其中一个切面。Markdown 栈更易写，`llms.txt` 更轻量，DITA 在结构化文档上更成熟，但它们都没有把 **agent 路由、双表面治理、可测的 anti-drift** 组合进同一个格式。

## AODS 的实现路径

AODS 走的是一条明确的路径，而不是泛化地宣称“所有场景都能压缩”：

1. **先把语料库结构化成 agent 友好的形式。** 用 typed JSON modules 和 typed artifacts，而不只是 prose 文档。
2. **渐进式加载。** 从 `root` 开始，通过 `capsule` 路由，再打开 `detail` 或 `evidence`。在实际使用里，这个路由既可以从触达文件（`--touch`）开始，也可以从自然语言查询（`--query`）开始。
3. **显式声明权威来源。** 用 `surface_pairs`、`sync_source`、`shared_invariants` 明确一对 human/agent 文件之间的关系，以及哪一侧是主导来源。
4. **尽早拦截明显矛盾。** validator 现在会保守地检查几类高信号的关键说法，例如“从 A 到 B”的变化、必填项列表、时间窗口、执行前置条件。
5. **强制执行契约。** 通过 schema validation、route checks、pre-commit enforcement 阻止格式错误和不安全同步。
6. **降低 authoring 成本。** 把 AODS 逐步推进成“编译产物”，而不是要求所有 corpus 长期手写 JSON。

这个仓库把三层东西放在了一起：

| 层 | 内容 |
| --- | --- |
| **Standard** | `manifest.json`、`schema/`、`spec/` 定义 AODS 的规范性契约 |
| **Reference implementation** | `bin/` 和 `lib/` 实现 validate、route、compile、scaffold、upgrade、hook |
| **Benchmark** | `benchmarks/aods-eval-lab/` 用来衡量实现是否真的兑现了这些主张 |

## 安装

### 在另一个项目里使用 AODS

要求 **Node 18+**。

1. 先把带版本 tag 的 GitHub 发布版安装到你的项目里：

```bash
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.2.0
```

2. 确认 CLI 可用：

```bash
npx aods --help
```

3. 在你的项目里 scaffold 一套新的 AODS authoring surface：

```bash
npx aods scaffold authoring ./aods --sys my-system --purpose "Agent-first docs for my system" --force
```

4. 把它编译并校验成你自己仓库里的 corpus：

```bash
npx aods compile ./aods/authoring.json ./docs/aods --force
npx aods validate ./docs/aods --strict
```

### 直接克隆仓库

如果你要本地拿到完整标准仓、benchmark 实验室和 examples，用这种方式：

```bash
git clone https://github.com/emosamastudio/aods.git
cd aods
npm install
npm run validate:all
```

## Benchmark 如何设计

`benchmarks/aods-eval-lab/` 是这个仓库的回归基线。它测试七件事：

1. 生命周期覆盖率
2. 事实保真
3. 全库体积
4. 任务时上下文占用
5. anti-drift 效果
6. 样本多样性
7. authoring overhead

benchmark 明确区分了三种“大小”信号：

| 信号 | 含义 |
| --- | --- |
| **Full-corpus size** | 整个文档系统的磁盘体积 |
| **Loaded payload** | 被路由加载的文件内容本体 |
| **Rendered prompt envelope** | payload 再加上 labels、separators、prompt scaffold text 之后的体积 |

这点很重要，因为 **仓库更大，并不自动等于单个任务的上下文更大**。

现在这个实验室还多了一个 **可选的本地 runtime-capture 补充测试**。它会记录一个 routed AODS 场景在 Copilot CLI 里的真实 provider request body，这样 benchmark 就能把自己的 rendered prompt-envelope 代理值和真实 runtime payload 形状放到一起比较。

为了做横向对比，benchmark 选择了三个外部基线：

| 基线 | 为什么选它 |
| --- | --- |
| **Markdown + YAML** | 大多数团队实际在用的 docs-as-code 主流基线 |
| **`llms.txt`** | 最轻量的 AI-facing 方案，也是 AODS 的反向设计哲学 |
| **DITA topic corpus** | 与 AODS 在结构化文档方向上最接近的“结构亲缘体” |

<!-- BENCHMARK_SYNC:START -->
## 当前 benchmark 结果

| 维度 | 当前结果 | 解读 |
| --- | --- | --- |
| **Coverage** | **100.0%** 生命周期、**100.0%** structured types、**100.0%** generic types | 当前 benchmark pack 可以被 AODS 完整表达 |
| **Fidelity** | **100.0%** fact preservation、**100.0%** critical fact preservation | 当前样本上的信息重写没有丢失 |
| **Full-corpus size** | **68543 bytes**，人类文档基线是 **44915 bytes** | AODS 在仓库尺度上当前 **大 52.6%** |
| **Objective median loaded payload** | **14022 bytes** | 路由后的 working set 明显小于全库 |
| **Objective median prompt envelope** | **15555 bytes** | 更接近真实上下文窗口占用 |
| **Task-stage coverage** | **100.0%**，覆盖 **5** 个显式阶段 | benchmark 结果现在显式标注 orientation、plan、action、verification、evidence |
| **补充型 runtime 样本** | **本轮未采集** | runtime capture 仍是可选补充项，当前这次 benchmark 没有采样 |
| **Objective touch-route hit rate** | **100.0%** | 所有 objective routing 场景都命中了所需模块 |
| **Objective median byte savings vs full load** | **79.5%** | 路由后的工作集显著小于 full-load |
| **Built-in drift recall** | **100.0%** | 当前 validator + hook 层能抓到当前 benchmark 中的全部风险 |
| **Built-in false-positive rate** | **0.0%** | 当前 control 场景没有误报 |
| **Benchmark diversity** | **2 个数据集**、**5 个任务阶段** | 比最初的单语料基线更强，但仍是 synthetic 且 English-only |

## 横向对比

| 基线 | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **AODS** | 100.0% | 100.0% | 68543 | 100.0% | 14022 | 15555 |
| **Markdown + YAML** | 100.0% | 100.0% | 47437 | 0.0% | 5234 | 5844 |
| **llms.txt** | 100.0% | 100.0% | 46520 | 0.0% | 6480 | 7178 |
| **DITA topic corpus** | 100.0% | 100.0% | 65038 | 0.0% | 718 | 1320 |

**怎么读这张表：** 非 AODS 基线在 bytes 上更轻，但它们在 benchmark 的 objective touch-route contract 上是 **0.0%**，因为这些格式没有提供 AODS 风格的原生 routing 和 paired-surface governance。所以它们更小的 loaded bytes，**不等价于**“在受治理检索上做到同样的事”。

## 最新 benchmark 变化

| 指标 | 当前 | 上一次 | 相对上次变化 | 解读 |
| --- | --- | --- | --- | --- |
| 生命周期覆盖率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| 事实保真率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| AODS 精确语料字节数 | 68543 bytes | 68543 bytes | +0 bytes | 持平 |
| Objective touch-route 命中率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| Objective 中位加载字节数 | 14022 bytes | 14022 bytes | +0 bytes | 持平 |
| Objective 中位 prompt-envelope 字节数 | 15555 bytes | 15555 bytes | +0 bytes | 持平 |
| 内建 drift recall | 100.0% | 100.0% | +0.0 pts | 持平 |
| 内建误报率 | 0.0% | 0.0% | +0.0 pts | 持平 |
| 外部样本语料数 | 3 | 3 | +0 | 持平 |
| 外部样本场景数 | 17 | 17 | +0 | 持平 |
| 任务阶段覆盖率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| Runtime request-body 字节数 | n/a | n/a | n/a | 没有更早基线 |
| Exploratory query precision | 83.3% | 83.3% | +0.0 pts | 持平 |
<!-- BENCHMARK_SYNC:END -->

## 为什么 AODS 有价值

AODS 的价值 **不在于它当前一定是最小的格式**，而在于它把 agent workflow 的关键 tradeoff 变成了显式、可验证的系统能力：

1. **它给 agent 提供了原生 routing model。** `root -> capsule -> detail` 是契约，不是约定俗成。
2. **它给 human/agent 混合文档提供了权威来源模型。** `surface_pairs`、`sync_source`、`shared_invariants` 加上保守型成对语义对比，把漂移从“协作习惯问题”变成“技术可控问题”。
3. **它区分了仓库尺度体积和任务时上下文成本。** benchmark 现在已经明确证明这两个信号不是一回事。
4. **它正在变得更可落地。** 新的 compiled-authoring pilot 说明这个项目正在摆脱“永远手写 JSON”的使用门槛。

所以当前 AODS 的价值主张是：

> **当你需要一个带治理、agent-first、具有显式 routing 和 anti-drift 能力的文档系统时，用 AODS；如果你唯一目标只是最小仓库体积，那 AODS 目前不是最佳答案。**

这个仓库中有两条 authority 规则保持不变：

- Human surfaces do not replace agent-primary semantic authority.
- Manifest metadata alone does not satisfy agent-primary semantic synchronization.

## 当前限制

benchmark 也清楚地表明了当前限制：

- AODS **还不是**一个被证明能做“全库压缩”的格式。
- 内建 anti-drift 仍然是保守型的。它现在能抓一小部分高信号矛盾，但还不是通用语义推理器。
- benchmark 中的启发式语义检测在当前场景包上的分数是 **75.0%**。
- 主 scoreboard 仍然使用整套场景共享的 renderer-based prompt-envelope 指标。现在仓库里已经补上了一个本地 Copilot CLI runtime-capture 补充样本，但还不是完整的 runtime-backed 场景矩阵。
- benchmark 仍然是 synthetic 且 English-only。
- `bidirectional` 仍然是一个被明确 gated 的实验性 sync mode：reference hook 会在这类 pair 发生变更时要求人工复核，而不是假装自动双向合并已经解决。
- benchmark pack 还没有覆盖 `phase`、`feature` 这几类 pair scope。

## 快速开始

```bash
npm install
npm run validate:all
npm run route -- --touch spec/validation-rules.json --role doc-author
npm run route -- --query "paired surface drift rules" --role doc-author --intent read
npm run compile:pilot
npm run benchmark:runtime-capture   # 可选的补充样本
npm run benchmark:evaluate
npm run benchmark:compare
npm run benchmark:summary
npm run benchmark:test
```

## 如何使用这套标准

### 校验 corpus

```bash
npm run validate
npm run validate:json
npm run validate:strict
npm run validate:pilot
npm run validate:compiled-pilot
npm run validate:all
```

直接使用 CLI：

```bash
node ./bin/aods.mjs validate .
node ./bin/aods.mjs validate . --json
node ./bin/aods.mjs validate . --strict
```

### 对触达文件做 scoped routing

```bash
npm run route -- --touch spec/validation-rules.json --role doc-author
node ./bin/aods.mjs route . --query "paired surface drift rules" --role doc-author --intent read
node ./bin/aods.mjs route . --query "audit evidence retention" --role doc-author --intent read --stage evidence
node ./bin/aods.mjs route . --touch spec/validation-rules.json --role doc-author
```

如果你已经知道改动落在哪个文件，用 `--touch`。如果你只知道“我要找哪类问题”，可以直接用自然语言的 `--query`，CLI 会按字面词和结构锚点去找最可能的权威模块。如果你已经知道当前任务所处阶段，但还不知道目标文件，可以额外给 `--stage`（`orientation`、`plan`、`action`、`verification`、`evidence`）来细化路由。

Routing precedence：

1. `boot_by_touch`
2. touched surface-pair 或 touched module
3. 词法 + 结构的 `--query` routing
4. `boot_by_role`
5. `boot_sequence`

### 从精简 authoring source 编译

```bash
node ./bin/aods.mjs scaffold authoring ./tmp/authoring-source --sys sample-system --force
npm run compile:pilot
node ./bin/aods.mjs compile ./examples/compiled-pilot-source/authoring.json ./tmp/compiled-pilot --force
```

authoring source 现在会按照 `schema/authoring.schema.json` 校验，所以 compiled authoring 已经不再只是一个一次性的 pilot 格式，而是一个正式 contract。

`compile` 命令会生成：

- `manifest.json`
- 带计算后 `tokens_approx` 的 module JSON
- 拷贝后的 AODS schemas
- 声明过的人类可读文件，例如 `README.md`

### 运行 hook enforcement

```bash
npm run hook:pre-commit
node ./bin/aods.mjs hook pre-commit . --file README.md --file spec/surface-governance.json
```

Hook 行为：

- 只校验受影响的 corpus
- 当 `sync_source=agent-primary` 且没有成对 agent module 变化时，阻止不安全的人类表面单独修改
- 当 `sync_source=human-primary` 且没有成对 human surface 变化时，阻止不安全的 agent module 单独修改
- 当 `sync_source=bidirectional` 的 pair 发生变更时，要求人工复核，因为 merge protocol 仍然是实验性的
- 强制检查 paired human/agent surfaces 上声明的 `shared_invariants`
- 当改动触及 `lib/`、`schema/`、`.githooks/` 这类实现层时，提升为更广泛的校验

可选的 git hook 安装：

```bash
git config core.hooksPath .githooks
```

### 升级到最新 schema

```bash
npm run upgrade -- --dry-run
node ./bin/aods.mjs upgrade .
node ./bin/aods.mjs upgrade ./examples/seven-plane-pilot --dry-run
```

### Scaffold 新 corpus 或 module

```bash
node ./bin/aods.mjs scaffold corpus ../my-corpus --sys my-system
node ./bin/aods.mjs scaffold module ../my-corpus control-plane --category policy --layer detail --scope "Control plane semantics"
```

## 仓库结构

| 路径 | 作用 |
| --- | --- |
| `manifest.json` | AODS 标准语料库的根索引与 agent 入口 |
| `schema/` | manifests 与 modules 的规范性 JSON Schemas |
| `spec/` | 规范性标准模块 |
| `bin/aods.mjs` | Reference CLI 入口 |
| `lib/` | validate、route、compile、hook、scaffold、upgrade 的实现 |
| `benchmarks/aods-eval-lab/` | 主 benchmark harness 与已发布报告 |
| `research/` | 非规范性的 landscape scans 与 benchmark rationale |
| `examples/seven-plane-pilot/` | 手写示例 corpus |
| `examples/compiled-pilot-source/` | 精简 compiled-authoring source |
| `examples/compiled-pilot/` | 生成后的 compiled-authoring output corpus |
| `.githooks/` | 可选 git hook 集成 |

## Normative 与 non-normative

- **Normative:** `manifest.json`、`schema/`、`spec/`
- **Non-normative but executable:** `bin/`、`lib/`、`.githooks/`、`examples/`
- **Non-normative measurement layer:** `benchmarks/aods-eval-lab/`
- **Non-normative research archive:** `research/`

有两条规则要记住：

1. **Reference implementation 不是标准本身。**
2. **Benchmark 结果不定义 conformance。**

## 关键资源

- **人类阅读入口：** 这个 README
- **Agent bootstrap：** `manifest.json`
- **AODS 内部评估报告：** `benchmarks/aods-eval-lab/reports/aods-evaluation-report.md`
- **第一轮横向对比报告：** `benchmarks/aods-eval-lab/reports/round1-comparator-report.md`
- **机器可读评估结果：** `benchmarks/aods-eval-lab/generated/results/evaluation-results.json`
- **机器可读对比结果：** `benchmarks/aods-eval-lab/generated/results/round1-comparator-results.json`
- **Research archive 索引：** `research/README.md`

## 许可证

本项目采用 **MIT License**，详见 [`LICENSE`](./LICENSE)。

## Schema version

AODS v3 - 2026-04-13
