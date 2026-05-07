# AODS Dirty Worktree 归因计划

状态：当前拆分计划
日期：2026-05-07

## 快照

| 项 | 数量 / 状态 |
|---|---|
| 分支 | `main` |
| 与远端关系 | `main...origin/main`，当前 HEAD 与远端一致 |
| tracked modified | 27 个文件 |
| untracked | 14 个文件 |
| tracked diff 规模 | 2310 insertions / 44 deletions |
| 本文动作 | 只归因，不 stage、不 commit、不 push |

## 文件组归因

| 组 | 文件 | 来源任务 | 判断 |
|---|---|---|---|
| A. 项目治理 / work standard | `.github/copilot-instructions.md`、`AGENTS.md`、`docs/README.md`、`docs/operations/*.md`、`CONTRIBUTING.md` | U-001、U-001A、U-002、U-015、U-020 | 可作为 governance/docs 组审查；其中 `aods-takeover-plan.zh-CN.md` 和本文件属于 2026-05-07 接手新增。 |
| B. 本地 agent 记忆边界 | `MEMORY.md` | owner 明确边界记录 | 默认不放入公开 PR，除非 owner 确认 repo 要保存 agent memory。 |
| C. v0.7 authority / contract / topology 语义 | `manifest.json`、`spec/authority-governance.json`、`spec/surface-governance.json`、`spec/stable-surface-contracts.json`、`spec/validation-rules.json`、`schema/authoring.schema.json`、`schema/manifest.schema.json`、`schema/module.schema.json` | U-003 到 U-014、U-021 | 这是 v0.7 主语义组；`spec/validation-rules.json` 同时包含 review fix 的新 rule，需要和 runtime/test 一起审。 |
| D. compiler / validator / helper 实现 | `lib/compile.mjs`、`lib/corpus-helpers.mjs`、`lib/validate.mjs` | U-008 到 U-010、U-016 到 U-018、U-021 | 文件内混有多项任务，不适合只按文件拆成多个 PR；如果拆细，需要 hunk 级 staging。 |
| E. source-first / compiled pilot example | `examples/compiled-pilot-source/authoring.json`、`examples/compiled-pilot/**` | U-008、U-009、U-021 验证链路 | 语义变更必须与 example 一起审；compiled-pilot 输出应由 source-first example 再生成，不手改。 |
| F. benchmark / generated evidence | `benchmarks/aods-eval-lab/generated/**`、`benchmarks/aods-eval-lab/reports/**` | benchmark 运行输出 | 单独作为 evidence artifact 组处理；提交前需要确认这些生成结果是否属于本次 release evidence。 |
| G. regression test | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | U-008 到 U-010、U-016 到 U-018、U-021 | 与 C/D/E 强耦合；可随主语义 PR 一起走，或 hunk 级拆出 review fix 测试。 |

## 推荐拆分

| 顺序 | 建议提交 / PR | 包含 | 不包含 | 原因 |
|---:|---|---|---|---|
| 1 | `docs: add AODS operations governance` | A 组，按需要包含 `CONTRIBUTING.md` | `MEMORY.md`、runtime/spec/schema | 先让接手标准、任务台账、handoff 成为可审查真相。 |
| 2 | `feat: add stable surface contracts and topology validation` | C/D/E/G 组 | benchmark generated reports | 这是 v0.7 主实现；中间状态高度耦合，建议作为一个语义 PR 审查。 |
| 3 | `test: refresh AODS benchmark evidence` | F 组 | source / schema / runtime code | generated 输出单独审，避免把行为变更和报告 churn 混在一起。 |
| 4 | `chore: record AODS local memory boundary` | `MEMORY.md` | 其他文件 | 仅在 owner 确认 repo-level `MEMORY.md` 应公开保存时执行。 |

## Hunk 级拆分提醒

如果 owner 要把 `U-021` review fix 做成独立 PR，需要从下列文件做 hunk 级拆分：

| 文件 | 需要拆出的 U-021 hunk |
|---|---|
| `lib/compile.mjs` | `buildManifestRedaction`、`buildManifestContract`、`buildManifestSchemaVersioning`，以及 module ref 传参中的 `redaction` / `contract` / `schemaVersioning`。 |
| `lib/corpus-helpers.mjs` | `createModuleRef()` 的 stable metadata summary 字段。 |
| `lib/validate.mjs` | `implementation-repo-id-unique` duplicate id 检查。 |
| `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | stable metadata source-first regression 和 duplicate repo id negative regression。 |
| `spec/stable-surface-contracts.json`、`spec/validation-rules.json` | 对应 changelog / validation rule 记录。 |

该拆分技术上可行，但成本高于单个 v0.7 semantic PR；因为 U-021 依赖前置 stable contract / topology schema 语义，否则单独 patch 无法成立。

## 暂不执行的动作

- 不运行 `git add`。
- 不创建 commit。
- 不创建或推送 branch。
- 不修改 GitHub issue / PR / release。
- 不回滚 generated outputs 或 `MEMORY.md`。

## 下一步建议

1. owner 确认是否接受上述 4 组拆分。
2. 若接受，先准备 governance/docs 组的 staged diff。
3. 再准备 v0.7 semantic PR，并把 `U-021` 作为其中的 post-review stabilization note。
4. GitHub issue 同步进入 `U-023`，逐项列审批矩阵后再执行公开动作。
