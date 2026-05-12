# Source-First Compile Determinism Report

任务：U-118
状态：已完成
日期：2026-05-12

## 目标

复审 source-first compile 输出稳定性、timestamp pinning 和 generated output churn 策略。当前不改 authoring semantics。

## Determinism Check

命令：

```bash
git diff --quiet -- examples/compiled-pilot && echo clean-before
npm run compile:pilot
git diff --quiet -- examples/compiled-pilot && echo clean-after-first
npm run compile:pilot
git diff --quiet -- examples/compiled-pilot && echo clean-after-second
```

结果：

| 阶段 | 结果 |
|---|---|
| before compile | `clean-before` |
| after first compile | `clean-after-first` |
| after second compile | `clean-after-second` |
| validation during compile | errors=0, warnings=0, modules=11 |

结论：当前 source-first pilot 在未修改 `authoring.json` 时连续编译无 generated diff，输出可视为 deterministic。

## Timestamp Pinning

已有 focused regression 覆盖 authoring source pinning：

```bash
node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs
```

测试项 `authoring source can pin compiled manifest timestamps` 验证 `corpus.created` 与 `corpus.updated` 可从 source 固定到 compiled manifest，重复编译不产生 timestamp churn。

## Churn Policy

| 变动来源 | 处理 |
|---|---|
| `authoring.json` 语义改动 | 先改 source，再 `npm run compile:pilot`，generated diff 与 source diff 一起审查 |
| 编译后只有无意义 churn | 不接受；回退 generated churn 并修 determinism |
| schema mirror 更新 | 通过 compile / upgrade 路线同步，不手改 compiled schema |
| benchmark generated/report churn | 默认恢复，除非当前任务明确更新 benchmark artifact |

## 非目标

- 不修改 source-first 语义。
- 不新增 timestamp 字段。
- 不把 generated output 当作手工语义编辑入口。
- 不把 compile pass 当作 PR ready / release ready。
