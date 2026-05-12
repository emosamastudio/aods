# AODS 项目工作规约

状态：当前有效
适用范围：维护 `aods` 标准、CLI、benchmark 和公开发布面

## 项目定位

AODS 不是单一文档包，而是三个互相制约的层：

1. **标准层**：`manifest.json`、`schema/`、`spec/`
2. **参考实现层**：`bin/`、`lib/`
3. **证据层**：`benchmarks/aods-eval-lab/`、公开 benchmark 报告和 README 同步区块

因此，AODS 维护时要优先保证：

1. 规范、实现、证据三层不打架。
2. compiled-corpus-first 的根语义权威不被 README 反客为主。
3. 生成面、公开面和 issue/backlog 判断保持一致。

## 当前权威面

| 面 | 文件 |
|---|---|
| 语义根入口 | `manifest.json` |
| 当前任务权威 | `docs/operations/aods-task-ledger.zh-CN.md` |
| 交接入口 | `docs/operations/aods-handoff.zh-CN.md` |
| 公开说明 | `README.md`、`README.zh-CN.md` |

## AODS 仓库形态规则

1. 当前仓库本身是 **compiled-corpus-first**。
2. 根目录 `manifest.json`、`schema/`、`spec/`、`modules/` 是当前 corpus 的直接语义权威。
3. `examples/compiled-pilot-source/` 只是 source-first 示例；若它发生语义变化，要修改 `authoring.json` 并重新编译示例输出。
4. 人类可读 README 不能替代 AODS 语义面本身。

## 同步规则

| 变化类型 | 必须同步的文件 |
|---|---|
| schema / spec 变化 | `schema/`、`spec/`、相关 `lib/` 校验或路由逻辑、必要时 `README*` 和 examples |
| validator / route / compile 变化 | `lib/`、`bin/`、测试或 benchmark fixture、必要时 `README*` |
| benchmark 公开结论变化 | `benchmarks/aods-eval-lab/src/*.mjs`、生成报告、必要时 `README*` |
| README benchmark sync 区块变化 | `benchmarks/aods-eval-lab/src/summary.mjs`，而不是手改 README sync 区块 |
| 项目治理规则变化 | `docs/README.md`、`docs/operations/README.md`、任务台账、handoff |

## 维护约束

1. 任务必须先进入 `aods-task-ledger.zh-CN.md`，再进入执行回合。
2. 当前回合默认最多 10 个任务；在 owner 明确要求批量推进时，同轮应优先选择 2-4 个低冲突、依赖清晰、验证路径相同或相邻的任务。
3. 新发现任务默认先写入台账，不在当前回合插队；若 owner 在当前上下文中明确要求扩大范围或批量执行，可在上一轮质量审查通过后，把已裁剪、依赖清晰、风险低的新任务纳入同轮 batch。
4. 文档类外部表达必须和当前证据一致，不得把主观愿望写成已验证事实。
5. 若修改 benchmark source 或 AODS 语义面，不能只改生成结果或只改 README 结论。

## 默认验证规则

| 变更类型 | 最低验证 |
|---|---|
| docs / operations / 纯文档措辞 | `git diff --check` |
| AODS 语义面改动 | `npm run validate:all` |
| benchmark source / 报告同步 | `npm run benchmark:test` 和对应生成命令 |
| 发布前收尾 | `npm run release:self-check` |

## 当前已知边界

1. `release:self-check` 用于验证 repo、benchmark 和包内容是否可发布；AODS 的正式版本发布统一在 GitHub Releases 完成，不以 npm registry publish 为完成条件。
2. README benchmark 区块存在生成同步机制，手改会被覆盖。
3. issue backlog 是建议输入，不是自动优先级。AODS owner 必须先判断价值、依赖、风险和可验证性，再决定是否进入任务台账。
4. `#28` 是高价值真实事故，但现在应作为 `#29/#32/#31/#30` governance foundation 的 concrete pilot，而不是孤立字段补丁。

## Issue 读取原则

1. issue 提供信号，不提供命令。
2. 优先处理会改变 AODS 信任边界、authority model、validation gate、safety exposure 的问题。
3. 降低只改善局部 DX、措辞、单字段 ergonomics 的优先级，除非它们阻塞主线 adoption。
4. 任何 roadmap issue 进入实现前，都必须裁剪成可验证的最小切片，避免把 AODS 扩张成没有落地边界的大而全规范。
5. 关闭、降级或合并 issue 时要记录 owner rationale，而不是只按标签或提议者措辞执行。

## 非目标

- 不把公开 README 当成规范根来源。
- 不把 benchmark 结果说成超出当前证据范围的普遍定律。
- 不为了快而跳过 spec / implementation / evidence 三层之间的同步。
