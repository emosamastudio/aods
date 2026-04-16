# AODS

[English](./README.md) | [简体中文](./README.zh-CN.md)

AODS 是一套文档标准和 CLI，适合那些希望让 AI agent 基于清晰、可验证、可治理的事实源工作，而不是从零散项目文档里拼接上下文的团队。

**当前最新版本：** `v0.4.0`

在这份 README 里，**面向人阅读的文档** 指 README、SOP、检查清单这类主要给人看的文件；**面向 agent 的结构化文档** 指那些可以被 agent 和工具路由、校验、比较的结构化文件。为了兼容，schema 和 CLI 仍然保留 `human_primary`、`agent_primary`、`sync_source=agent-primary` 这类字段名。

## 问题是什么

大多数项目文档首先是为人写的。这会给 code agent 带来四类常见失败：

1. **检索成本高且容易歧义。** 许多 agent 的工作方式更接近 `grep`-first 和按文件结构定位，路由弱、术语不稳定，就会浪费上下文。
2. **权威来源是隐式的。** README、运维文档、实现细节之间即使冲突，也没有内建机制说明“到底谁说了算”。
3. **给人看的文档，和 agent 真正依赖的结构化事实源，容易越改越不一致。** README 改了，agent 依赖的主来源没改；或者反过来。
4. **仓库总体体积与单任务上下文成本被混为一谈。** 语料库很大，并不等于单个任务的 working set 很大，但多数文档格式无法把这点测量清楚。

AODS 的存在，就是因为现有方案通常只解决其中一个切面。Markdown 好写，`llms.txt` 很轻，DITA 在结构化出版上更成熟，但它们都没有把 **agent 路由、面向人文档与结构化事实源之间的受治理配对、以及可测的 anti-drift** 组合进同一个系统。

## AODS 的实现路径

AODS 走的是一条明确的路径，而不是泛化地宣称“所有场景都能压缩”：

1. **先把语料库结构化成 agent 友好的形式。** 用 typed JSON modules 和 typed artifacts，而不只是长篇 prose 文档。
2. **渐进式加载。** 先读一个很小的入口索引（`root`），再经过摘要路由层（`capsule`），最后按需打开 `detail` 或 `evidence` 模块。这个路由既可以从触达文件（`--touch`）开始，也可以从自然语言查询（`--query`）开始。
3. **显式声明主来源。** 把一份面向人阅读的文档和一份面向 agent 的结构化源文件绑定起来，并声明哪一侧主导、哪些事实必须保持一致。
4. **尽早拦截明显矛盾。** validator 会保守地检查几类高信号冲突，例如数字前后变化、必填项列表、时间窗口、执行前置条件。
5. **强制执行契约。** 通过 schema validation、route checks、pre-commit enforcement 阻止格式错误和不安全同步。
6. **降低编写成本。** 把 AODS 逐步推进成“编译产物”，避免团队长期手写每一个 JSON 文件。

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
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.4.0
```

2. 确认 CLI 可用：

```bash
npx aods --help
```

3. 在你的项目里初始化一份新的 AODS 编写源（authoring source）：

```bash
npx aods scaffold authoring ./aods --sys my-system --purpose "Agent-first docs for my system" --force
```

4. 把它编译并校验成你自己仓库里的 AODS 文档目录：

```bash
npx aods compile ./aods/authoring.json ./docs/aods --force --strict
npx aods validate ./docs/aods --strict --reality
npx aods validate ./docs/aods --strict --reality --repo-root .
```

当你希望 `compile` 自己就是 acceptance gate 时，用 `compile --strict`。它仍然会写出目标 corpus，但如果有 warning，会直接非零退出，并把阻断的 warning 打出来，而不是先表现成一次“看起来成功”的编译。只有在你的 corpus 里声明了 `surface-inventory`，并且你想让 AODS 进一步检查这些标记为 **current** 的 surface 时，才需要加 `--reality`。当 `content.base: "corpus"` 时，路径从 corpus root 解析；当 `content.base: "repo"` 时，路径优先从 `--repo-root` 解析，如果没有传，就回退到 corpus root。`reserved` 和 `future` 只表示预留或未来规划，不要求它们现在就已经落地。对于标记为 current 的目录，AODS 还会检查里面是否有真实内容，而不只是 `.gitkeep` 之类的占位文件。

```json
{"type":"surface-inventory","content":{"base":"repo","entries":[{"surface_id":"web-src","path":"apps/web/src","kind":"directory","state":"current"}]}}
```

5. 常见改动优先用 scaffold helpers，而不是每次都手改一大片 JSON：

```bash
npx aods scaffold authoring-module ./aods/authoring.json delivery-gates --category policy --layer detail --scope "Delivery gate authority" --role doc-author
npx aods scaffold authoring-touch ./aods/authoring.json --match package.json --load my-system-root --load delivery-gates --intent write
npx aods scaffold authoring-pair ./aods/authoring.json --pair-id pair-delivery-log --agent-primary delivery-gates --human-primary DELIVERY-LOG.md
npx aods scaffold authoring-pair ./aods/authoring.json --pair-id pair-delivery-guide --agent-primary delivery-gates --human-primary DELIVERY-GUIDE.md --generated-profile overview --generated-title "Delivery Guide"
```

6. 如果你需要实现阶段治理，不要从零拼一套结构，直接用现成 pattern：

```bash
npx aods scaffold authoring-module ./aods/authoring.json release-governance --pattern implementation-governance --role doc-author
```

这个 pattern 会直接起出四类治理骨架：

- 实现 / 验收矩阵
- 最终系统 gate 规则
- runtime contract 表
- scripted / expert / human 三类 review 路由树

### 可选：安装与发布版本对齐的 Copilot skill

如果你希望别的 agent 在 AODS 仓库里工作时，不用先加载整套规范再开始，可以把同一 release tag 下的 `skills/aods-use/` 复制到对应 agent 的 skills 目录。

这个 skill 故意保持很薄，只负责帮助 agent：

- 判断当前仓库是 source-first 还是 compiled-corpus-first
- 选择最小且正确的 AODS 命令路径
- 明确 `agent-primary` 才是 authority，不把面向人阅读的文档当成第二套真相源

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
| **Full-corpus size** | **45243 bytes**，人类文档基线是 **45372 bytes** | AODS 在仓库尺度上当前 **小 0.3%** |
| **Objective median loaded payload** | **10839 bytes** | 路由后的 working set 明显小于全库 |
| **Objective median prompt envelope** | **12372 bytes** | 更接近真实上下文窗口占用 |
| **Task-stage coverage** | **100.0%**，覆盖 **5** 个显式阶段 | benchmark 结果现在显式标注 orientation、plan、action、verification、evidence |
| **补充型 runtime 样本** | **本轮未采集** | runtime capture 仍是可选补充项，当前这次 benchmark 没有采样 |
| **Objective touch-route hit rate** | **100.0%** | 所有 objective routing 场景都命中了所需模块 |
| **Objective median byte savings vs full load** | **76.0%** | 路由后的工作集显著小于 full-load |
| **Built-in drift recall** | **100.0%** | 当前 validator + hook 层能抓到当前 benchmark 中的全部风险 |
| **Built-in false-positive rate** | **0.0%** | 当前 control 场景没有误报 |
| **Benchmark diversity** | **2 个数据集**、**5 个任务阶段** | 比最初的单语料基线更强，但仍是 synthetic 且 English-only |

## 横向对比

| 基线 | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **AODS** | 100.0% | 100.0% | 45243 | 100.0% | 10839 | 12372 |
| **Markdown + YAML** | 100.0% | 100.0% | 47894 | 0.0% | 5234 | 5844 |
| **llms.txt** | 100.0% | 100.0% | 46977 | 0.0% | 6480 | 7178 |
| **DITA topic corpus** | 100.0% | 100.0% | 65595 | 0.0% | 718 | 1320 |

**怎么读这张表：** 非 AODS 基线在 bytes 上更轻，但它们在 benchmark 的 objective touch-route contract 上是 **0.0%**，因为这些格式没有提供 AODS 风格的原生 routing 和 paired-surface governance。所以它们更小的 loaded bytes，**不等价于**“在受治理检索上做到同样的事”。

## 最新 benchmark 变化

| 指标 | 当前 | 上一次 | 相对上次变化 | 解读 |
| --- | --- | --- | --- | --- |
| 生命周期覆盖率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| 事实保真率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| AODS 精确语料字节数 | 45243 bytes | 45243 bytes | +0 bytes | 持平 |
| Objective touch-route 命中率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| Objective 中位加载字节数 | 10839 bytes | 10839 bytes | +0 bytes | 持平 |
| Objective 中位 prompt-envelope 字节数 | 12372 bytes | 12372 bytes | +0 bytes | 持平 |
| 内建 drift recall | 100.0% | 100.0% | +0.0 pts | 持平 |
| 内建误报率 | 0.0% | 0.0% | +0.0 pts | 持平 |
| 外部样本语料数 | 3 | 3 | +0 | 持平 |
| 外部样本场景数 | 17 | 17 | +0 | 持平 |
| 任务阶段覆盖率 | 100.0% | 100.0% | +0.0 pts | 持平 |
| Runtime request-body 字节数 | n/a | n/a | n/a | 没有更早基线 |
| Exploratory query precision | 100.0% | 100.0% | +0.0 pts | 持平 |
<!-- BENCHMARK_SYNC:END -->

## 为什么 AODS 有价值

AODS 的价值 **不主要在于当前 benchmark 里它的全库体积略小于“给人阅读的文档”基线**，而在于它把那些原本只能靠团队默契维持的文档治理问题，变成了明确、可验证的契约：

1. **它让 agent 按规则少加载，而不是靠猜。** `root -> capsule -> detail` 是明确契约，不是含糊的约定。
2. **它让团队可以把给人看的文档和结构化事实源绑定起来管理。** `surface_pairs`、`sync_source`、`shared_invariants` 再加上保守型成对语义检查，把漂移从“协作习惯问题”变成“技术可控问题”。
3. **它把仓库总体体积和单任务上下文成本拆开测量。** benchmark 已经证明这两个信号不是一回事，而且最近几轮优化同时改善了这两项指标。
4. **它正在变得更容易落地。** compiled-authoring 路径现在已经支持 artifact-first modules，不再为了满足格式而强行补很多 synthetic prose。

所以当前 AODS 的价值主张是：

> **当你需要一个带治理、对 AI 友好、具备显式路由和防漂移能力的项目文档系统时，用 AODS；如果你的唯一目标只是把仓库做得最小，那 AODS 目前不是最佳答案。**

这个仓库中有两条规则保持不变：

- 当 pair 标记为 `sync_source=agent-primary` 时，面向人阅读的文档不能替代语义主来源。
- 仅仅更新 manifest 元数据，并不等于面向 agent 的内容已经同步。

## 当前限制

benchmark 也清楚地表明了当前限制：

- AODS **还不是**一个被证明能做“全库压缩”的格式。
- 内建 anti-drift 仍然是保守型的。它现在能抓一小部分高信号矛盾，但还不是通用语义推理器。
- benchmark 中的启发式语义检测在当前场景包上的分数是 **75.0%**。
- 主 scoreboard 仍然使用整套场景共享的 renderer-based prompt-envelope 指标。现在仓库里已经补上了一个本地 Copilot CLI runtime-capture 补充样本，但还不是完整的 runtime-backed 场景矩阵。
- benchmark 仍然是 synthetic 且 English-only。
- `bidirectional` 仍然是一个被明确 gated 的实验性 sync mode：reference hook 会在这类成对文档发生变更时要求人工复核，而不是假装自动双向合并已经解决。
- benchmark pack 还没有覆盖 `phase`、`feature` 这几类 pair scope。

## 快速开始

```bash
npm install
npm run validate:all
npm run route -- --touch spec/validation-rules.json --role doc-author
npm run route -- --query "paired docs drift rules" --role doc-author --intent read
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
node ./bin/aods.mjs validate . --strict --reality
node ./bin/aods.mjs validate . --strict --reality --repo-root ..
```

### 对触达文件做 scoped routing

```bash
npm run route -- --touch spec/validation-rules.json --role doc-author
node ./bin/aods.mjs route . --query "paired docs drift rules" --role doc-author --intent read
node ./bin/aods.mjs route . --query "audit evidence retention" --role doc-author --intent read --stage evidence
node ./bin/aods.mjs route . --touch spec/validation-rules.json --role doc-author
```

如果你已经知道改动落在哪个文件，用 `--touch`。如果你只知道“我要找哪类问题”，可以直接用自然语言的 `--query`，CLI 会按 module metadata、成对文档关系和 compact artifact semantics 里的词法 + 结构锚点去找最可能的权威模块。如果你已经知道当前任务所处阶段，但还不知道目标文件，可以额外给 `--stage`（`orientation`、`plan`、`action`、`verification`、`evidence`）来细化路由。

Routing precedence：

1. `boot_by_touch`
2. 命中的成对文档或命中的 module
3. 词法 + 结构的 `--query` routing
4. `boot_by_role`
5. `boot_sequence`

### 从精简 authoring source 编译

```bash
node ./bin/aods.mjs scaffold authoring ./tmp/authoring-source --sys sample-system --force
npm run compile:pilot
node ./bin/aods.mjs compile ./examples/compiled-pilot-source/authoring.json ./tmp/compiled-pilot --force --strict
```

authoring source 现在会按照 `schema/authoring.schema.json` 校验，所以 compiled authoring 已经不再只是一次性的 pilot 格式，而是正式契约。module 现在既可以是 section-first，也可以是 artifact-first，或者两者混合；编译后的 AODS 只要求至少有一个 `section` 或 `artifact`。

CLI 现在也直接提供了三类高频改动路径：

- 安全地向 `authoring.json` 增加 module
- 安全地追加或替换 touch route
- 初始化一份面向人阅读的配套文档，并同时注册它与结构化源文件之间的配对元数据

paired human output 现在有两种建模方式：

- 通过 `files[]` 声明的手工 human 文件
- 在 surface pair 上通过 `human_generation` 显式声明的 opt-in deterministic generated output

对于实现阶段治理较重的项目，`scaffold authoring-module --pattern implementation-governance` 会直接生成一份“交付治理模块”骨架，里面已经包含：

- 实现矩阵
- system gate 规则
- runtime contract 表
- scripted、expert、human 三类审批 / 复核路由

`compile` 命令会生成：

- 面向 machine-first loading 的 compact `manifest.json`
- 带计算后 `tokens_approx` 的 compact module JSON
- 面向 glossary、`boot_by_role`、`boot_by_touch`、`surface_pairs` 和 runtime role profiles 的 compact `indexes/runtime.json`
- 拷贝后的 AODS schemas
- 声明过的面向人阅读文件，例如 `README.md`
- 按 pair opt-in 生成的 deterministic human-oriented 文件，例如 overview 或 checklist surface

`compile --strict` 会把这一步真正变成 gate：warning 仍然会写出输出，但不会再返回成功形态的结果。

当 `boot_by_role` 已经存在时，编译产物里的 companion `roles` 会被压缩成 runtime role profile：保留 `id` 和可选的 `capabilities`；只有当 `required_modules` 与 boot binding 不一致时才会额外保留。

### 运行 hook enforcement

```bash
npm run hook:pre-commit
node ./bin/aods.mjs hook pre-commit . --file README.md --file spec/surface-governance.json
```

Hook 行为：

- 只校验受影响的 corpus
- 当 `sync_source=agent-primary` 且没有成对的 agent 结构化文件变化时，阻止不安全的面向人文档单独修改
- 当 `sync_source=human-primary` 且没有成对的面向人文档变化时，阻止不安全的 agent 结构化文件单独修改
- 当 `sync_source=bidirectional` 的 pair 发生变更时，要求人工复核，因为自动合并协议仍然是实验性的
- 在 `agent-primary` 下允许合法的 deterministic regenerated human 文件通过，但会把手工改动的 generated output 识别为 drift
- 强制检查成对文档上声明的 `shared_invariants`
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

### Scaffold 新 corpus 或 authoring source

```bash
node ./bin/aods.mjs scaffold corpus ../my-corpus --sys my-system
node ./bin/aods.mjs scaffold module ../my-corpus control-plane --category policy --layer detail --scope "Control plane semantics"
node ./bin/aods.mjs scaffold authoring-module ./examples/compiled-pilot-source/authoring.json shift-ops-log --category reference --layer detail --scope "Shift operations log authority"
node ./bin/aods.mjs scaffold authoring-touch ./examples/compiled-pilot-source/authoring.json --match README.md --load shift-ops-capsule --load shift-ops-policy --intent write
node ./bin/aods.mjs scaffold authoring-pair ./examples/compiled-pilot-source/authoring.json --pair-id pair-shift-ops-log --agent-primary shift-ops-runbook --human-primary SHIFT-OPS-LOG.md
node ./bin/aods.mjs scaffold authoring-pair ./examples/compiled-pilot-source/authoring.json --pair-id pair-shift-ops-guide --agent-primary shift-ops-policy --human-primary SHIFT-OPS-GUIDE.md --generated-profile checklist
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

- **读者入口：** 这个 README
- **Agent bootstrap：** `manifest.json`
- **AODS 内部评估报告：** `benchmarks/aods-eval-lab/reports/aods-evaluation-report.md`
- **第一轮横向对比报告：** `benchmarks/aods-eval-lab/reports/round1-comparator-report.md`
- **机器可读评估结果：** `benchmarks/aods-eval-lab/generated/results/evaluation-results.json`
- **机器可读对比结果：** `benchmarks/aods-eval-lab/generated/results/round1-comparator-results.json`
- **Research archive 索引：** `research/README.md`

## 许可证

本项目采用 **MIT License**，详见 [`LICENSE`](./LICENSE)。

## Versioning

AODS 现在区分两条版本线：

- **发布版本：** Git tag / package release，例如 `v0.4.0`
- **与发布版对齐的 skill 版本：** `skills/` 下的技能与同一个 release tag 对齐
- **Schema 兼容版本：** 各 surface 内部使用的兼容性标记，例如 `aods_v` 和 `authoring_v`

这些 schema 标记依然用于兼容和升级，但不再作为 README 里的对外产品标签。对外文档默认应该使用发布版本，而不是遗留的 schema-generation branding。
