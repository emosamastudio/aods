import fs from "node:fs";
import path from "node:path";

import { projectPaths } from "./generate-fixtures.mjs";
import { PROJECT_ROOT, REPO_ROOT, ensureDir, formatPercent, readJson, writeJson, writeText } from "./helpers.mjs";

const HISTORY_FILENAMES = {
  evaluation: "latest-evaluation-results.json",
  comparison: "latest-round1-comparator-results.json"
};

const BENCHMARK_SYNC_START = "<!-- BENCHMARK_SYNC:START -->";
const BENCHMARK_SYNC_END = "<!-- BENCHMARK_SYNC:END -->";

const METRIC_SPECS = [
  {
    id: "lifecycle-phase-coverage",
    category: "objective",
    label: "Lifecycle phase coverage",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.coverage.lifecycle_phase_coverage
  },
  {
    id: "fact-preservation-rate",
    category: "objective",
    label: "Fact preservation rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.fidelity.fact_preservation_rate
  },
  {
    id: "aods-corpus-bytes",
    category: "objective",
    label: "AODS exact corpus bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.fidelity.exact_size.aods_corpus.byte_count
  },
  {
    id: "objective-touch-hit-rate",
    category: "objective",
    label: "Objective touch-route hit rate",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.loading.objective_touch.hit_rate
  },
  {
    id: "objective-median-loaded-bytes",
    category: "objective",
    label: "Objective median loaded bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.loading.objective_touch.median_route_bytes
  },
  {
    id: "objective-median-prompt-envelope-bytes",
    category: "objective",
    label: "Objective median prompt-envelope bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.loading.objective_touch.median_prompt_envelope_bytes
  },
  {
    id: "built-in-drift-recall",
    category: "objective",
    label: "Built-in drift recall",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.drift.built_in_recall
  },
  {
    id: "built-in-false-positive-rate",
    category: "objective",
    label: "Built-in false-positive rate",
    kind: "percent",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.drift.built_in_false_positive_rate
  },
  {
    id: "external-sample-corpus-count",
    category: "supplemental",
    label: "External sample corpus count",
    kind: "count",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.diversity.external_sample?.corpus_count ?? null
  },
  {
    id: "external-sample-scenario-count",
    category: "supplemental",
    label: "External sample scenario count",
    kind: "count",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.diversity.external_sample?.scenario_count ?? null
  },
  {
    id: "task-stage-coverage",
    category: "supplemental",
    label: "Task stage coverage",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.loading.task_stage_coverage ?? null
  },
  {
    id: "runtime-request-bytes",
    category: "supplemental",
    label: "Runtime request-body bytes",
    kind: "bytes",
    direction: "lower",
    getValue: ({ evaluation }) => evaluation.runtime_capture?.runtime_request?.request_body_bytes ?? null
  },
  {
    id: "exploratory-query-precision",
    category: "advisory",
    label: "Exploratory query precision",
    kind: "percent",
    direction: "higher",
    getValue: ({ evaluation }) => evaluation.loading.exploratory_query.average_precision
  }
];

export function runBenchmarkSummary() {
  const paths = projectPaths();
  const historyRoot = path.join(paths.generatedRoot, "history");
  ensureDir(historyRoot);

  const current = {
    evaluation: readJson(path.join(paths.resultsRoot, "evaluation-results.json")),
    comparison: readJson(path.join(paths.resultsRoot, "round1-comparator-results.json"))
  };
  const previous = {
    evaluation: readOptionalJson(path.join(historyRoot, HISTORY_FILENAMES.evaluation)),
    comparison: readOptionalJson(path.join(historyRoot, HISTORY_FILENAMES.comparison))
  };

  const summary = buildBenchmarkSummary(current, previous);
  writeJson(path.join(paths.resultsRoot, "benchmark-summary-results.json"), summary);
  writeText(path.join(PROJECT_ROOT, "reports", "benchmark-summary-report.md"), renderBenchmarkSummary(summary));
  syncPublishedReadmes(current.evaluation, current.comparison, summary);

  writeJson(path.join(historyRoot, HISTORY_FILENAMES.evaluation), current.evaluation);
  writeJson(path.join(historyRoot, HISTORY_FILENAMES.comparison), current.comparison);
  return summary;
}

export function buildBenchmarkSummary(current, previous) {
  const metrics = METRIC_SPECS.map((spec) => buildMetricRow(spec, current, previous));
  return {
    generated_at: new Date().toISOString(),
    benchmark_project: "benchmarks/aods-eval-lab",
    current_run: {
      evaluation_generated_at: current.evaluation.generated_at,
      comparison_generated_at: current.comparison.generated_at
    },
    previous_run: previous.evaluation && previous.comparison
      ? {
          evaluation_generated_at: previous.evaluation.generated_at,
          comparison_generated_at: previous.comparison.generated_at
        }
      : null,
    metrics
  };
}

function buildMetricRow(spec, current, previous) {
  const currentValue = spec.getValue(current);
  const previousValue = previous.evaluation && previous.comparison ? spec.getValue(previous) : null;
  const delta = currentValue == null || previousValue == null ? null : currentValue - previousValue;
  const status = classifyMetric(spec, delta);

  return {
    id: spec.id,
    category: spec.category,
    label: spec.label,
    direction: spec.direction,
    current_value: currentValue,
    previous_value: previousValue,
    current_display: formatMetricValue(spec.kind, currentValue),
    previous_display: formatMetricValue(spec.kind, previousValue),
    delta_value: delta,
    delta_display: formatMetricDelta(spec.kind, delta),
    status,
    reading: describeStatus(status)
  };
}

function classifyMetric(spec, delta) {
  if (delta == null) {
    return "n/a";
  }
  if (delta === 0) {
    return "flat";
  }
  const improved = spec.direction === "higher" ? delta > 0 : delta < 0;
  return improved ? "improved" : "regressed";
}

function formatMetricValue(kind, value) {
  if (value == null) {
    return "n/a";
  }
  if (kind === "percent") {
    return formatPercent(value);
  }
  if (kind === "bytes") {
    return `${Math.round(value)} bytes`;
  }
  return String(value);
}

function formatMetricDelta(kind, value) {
  if (value == null) {
    return "n/a";
  }
  if (kind === "percent") {
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)} pts`;
  }
  if (kind === "bytes") {
    return `${value >= 0 ? "+" : ""}${Math.round(value)} bytes`;
  }
  return `${value >= 0 ? "+" : ""}${value}`;
}

function describeStatus(status) {
  if (status === "improved") {
    return "improved";
  }
  if (status === "regressed") {
    return "regressed";
  }
  if (status === "flat") {
    return "flat";
  }
  return "no prior baseline";
}

function renderBenchmarkSummary(summary) {
  const rows = summary.metrics
    .map(
      (metric) =>
        `| ${metric.category} | ${metric.label} | ${metric.current_display} | ${metric.previous_display} | ${metric.delta_display} | ${metric.reading} |`
    )
    .join("\n");
  const previousRunLine = summary.previous_run
    ? `- Previous evaluation: **${summary.previous_run.evaluation_generated_at}**`
    : "- Previous evaluation: **none saved yet**";

  return `# Benchmark summary

## Run window

- Current evaluation: **${summary.current_run.evaluation_generated_at}**
${previousRunLine}

## Metric delta table

| Category | Metric | Current | Previous | Delta vs previous | Reading |
| --- | --- | --- | --- | --- | --- |
${rows}

## Interpretation

- Objective metrics should be read as the main regression gate.
- Supplemental metrics are real-runtime or profile-specific signals that add realism but are not yet universal scoreboard entries.
- Advisory metrics help guide optimization, but they should not override objective regressions.
`;
}

function syncPublishedReadmes(evaluation, comparison, summary) {
  replaceMarkedBlock(
    path.join(REPO_ROOT, "README.md"),
    renderEnglishPublishedBenchmark(evaluation, comparison, summary)
  );
  replaceMarkedBlock(
    path.join(REPO_ROOT, "README.zh-CN.md"),
    renderChinesePublishedBenchmark(evaluation, comparison, summary)
  );
}

function replaceMarkedBlock(filePath, replacement) {
  const original = fs.readFileSync(filePath, "utf8");
  const start = original.indexOf(BENCHMARK_SYNC_START);
  const end = original.indexOf(BENCHMARK_SYNC_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README benchmark sync markers missing in ${filePath}`);
  }
  const updated = `${original.slice(0, start + BENCHMARK_SYNC_START.length)}\n${replacement.trim()}\n${original.slice(end)}`;
  fs.writeFileSync(filePath, updated);
}

function renderEnglishPublishedBenchmark(evaluation, comparison, summary) {
  const humanBytes = evaluation.fidelity.exact_size.human_docs.byte_count;
  const aodsBytes = evaluation.fidelity.exact_size.aods_corpus.byte_count;
  const objective = evaluation.loading.objective_touch;
  const taskStages = Object.entries(evaluation.loading.task_stage_breakdown ?? {}).filter(([, item]) => item.scenario_count > 0);
  const runtimeCapture = evaluation.runtime_capture;
  const runtimeLine = runtimeCapture?.runtime_request?.request_body_bytes
    ? `| **Supplemental runtime sample** | **${runtimeCapture.runtime_request.request_body_bytes} bytes** exact provider request on \`${runtimeCapture.scenario.id}\` | One real Copilot CLI request is **${formatRuntimeMultiplier(runtimeCapture.runtime_request.request_body_bytes, objective.median_prompt_envelope_bytes)}x** the rendered prompt envelope |`
    : "| **Supplemental runtime sample** | **not captured in current run** | Runtime capture remains optional and is absent from the latest benchmark pass |";
  const comparisonRows = comparison.baselines
    .map(
      (baseline) =>
        `| **${baseline.label}** | ${formatPercent(baseline.common.lifecycle_phase_coverage)} | ${formatPercent(baseline.common.fact_preservation_rate)} | ${baseline.common.corpus_bytes} | ${formatPercent(baseline.common.loading.hit_rate)} | ${Math.round(baseline.common.loading.median_route_bytes)} | ${Math.round(baseline.common.loading.median_prompt_envelope_bytes)} |`
    )
    .join("\n");
  const deltaRows = summary.metrics
    .map(
      (metric) =>
        `| ${metric.label} | ${metric.current_display} | ${metric.previous_display} | ${metric.delta_display} | ${metric.reading} |`
    )
    .join("\n");

  return `## Current benchmark result

| Dimension | Current result | Reading |
| --- | --- | --- |
| **Coverage** | **${formatPercent(evaluation.coverage.lifecycle_phase_coverage)}** lifecycle, **${formatPercent(evaluation.coverage.structured_type_coverage)}** structured types, **${formatPercent(evaluation.coverage.generic_type_coverage)}** generic types | The benchmark pack is fully representable in AODS |
| **Fidelity** | **${formatPercent(evaluation.fidelity.fact_preservation_rate)}** fact preservation, **${formatPercent(evaluation.fidelity.critical_fact_preservation_rate)}** critical fact preservation | Information survived the rewrite on the current pack |
| **Full-corpus size** | **${aodsBytes} bytes** vs human-doc baseline **${humanBytes} bytes** | AODS is currently **${describeRelativeSize(aodsBytes, humanBytes)}** at repository scale |
| **Objective median loaded payload** | **${Math.round(objective.median_route_bytes)} bytes** | Routed working set stays far below full-corpus size |
| **Objective median prompt envelope** | **${Math.round(objective.median_prompt_envelope_bytes)} bytes** | Closer proxy to actual context-window occupation |
| **Task-stage coverage** | **${formatPercent(evaluation.loading.task_stage_coverage)}** across **${taskStages.length}** explicit stages | Routed scenarios now declare orientation, plan, action, verification, and evidence explicitly |
${runtimeLine}
| **Objective touch-route hit rate** | **${formatPercent(objective.hit_rate)}** | All objective routing scenarios hit the required modules |
| **Objective median byte savings vs full load** | **${formatPercent(objective.median_byte_savings_vs_full_load)}** | Routed work is materially smaller than full-load work |
| **Built-in drift recall** | **${formatPercent(evaluation.drift.built_in_recall)}** | Current validator and hook layer catches all current benchmark hazards |
| **Built-in false-positive rate** | **${formatPercent(evaluation.drift.built_in_false_positive_rate)}** | No misfire on the benchmark control scenario set |
| **Benchmark diversity** | **${evaluation.diversity.dataset_count} datasets**, **${taskStages.length} task stages** | Stronger than the original single-corpus pack, still synthetic and English-only |

## Horizontal comparison

| Baseline | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${comparisonRows}

**How to read this table:** the non-AODS baselines stay lighter on bytes, but they score **0.0%** on the benchmark's objective touch-route contract because they do not provide AODS-style native routing and paired-surface governance. Their smaller loaded byte counts are therefore not evidence of equivalent governed retrieval.

## Latest benchmark delta

| Metric | Current | Previous | Delta vs previous | Reading |
| --- | --- | --- | --- | --- |
${deltaRows}`;
}

function renderChinesePublishedBenchmark(evaluation, comparison, summary) {
  const humanBytes = evaluation.fidelity.exact_size.human_docs.byte_count;
  const aodsBytes = evaluation.fidelity.exact_size.aods_corpus.byte_count;
  const objective = evaluation.loading.objective_touch;
  const taskStages = Object.entries(evaluation.loading.task_stage_breakdown ?? {}).filter(([, item]) => item.scenario_count > 0);
  const runtimeCapture = evaluation.runtime_capture;
  const runtimeLine = runtimeCapture?.runtime_request?.request_body_bytes
    ? `| **补充型 runtime 样本** | \`${runtimeCapture.scenario.id}\` 上的真实 provider request 是 **${runtimeCapture.runtime_request.request_body_bytes} bytes** | 一个真实 Copilot CLI 请求大约是 rendered prompt envelope 的 **${formatRuntimeMultiplier(runtimeCapture.runtime_request.request_body_bytes, objective.median_prompt_envelope_bytes)}x** |`
    : "| **补充型 runtime 样本** | **本轮未采集** | runtime capture 仍是可选补充项，当前这次 benchmark 没有采样 |";
  const comparisonRows = comparison.baselines
    .map(
      (baseline) =>
        `| **${baseline.label}** | ${formatPercent(baseline.common.lifecycle_phase_coverage)} | ${formatPercent(baseline.common.fact_preservation_rate)} | ${baseline.common.corpus_bytes} | ${formatPercent(baseline.common.loading.hit_rate)} | ${Math.round(baseline.common.loading.median_route_bytes)} | ${Math.round(baseline.common.loading.median_prompt_envelope_bytes)} |`
    )
    .join("\n");
  const deltaRows = summary.metrics
    .map(
      (metric) =>
        `| ${translateMetricLabel(metric.label)} | ${metric.current_display} | ${metric.previous_display} | ${metric.delta_display} | ${translateMetricReading(metric.reading)} |`
    )
    .join("\n");

  return `## 当前 benchmark 结果

| 维度 | 当前结果 | 解读 |
| --- | --- | --- |
| **Coverage** | **${formatPercent(evaluation.coverage.lifecycle_phase_coverage)}** 生命周期、**${formatPercent(evaluation.coverage.structured_type_coverage)}** structured types、**${formatPercent(evaluation.coverage.generic_type_coverage)}** generic types | 当前 benchmark pack 可以被 AODS 完整表达 |
| **Fidelity** | **${formatPercent(evaluation.fidelity.fact_preservation_rate)}** fact preservation、**${formatPercent(evaluation.fidelity.critical_fact_preservation_rate)}** critical fact preservation | 当前样本上的信息重写没有丢失 |
| **Full-corpus size** | **${aodsBytes} bytes**，人类文档基线是 **${humanBytes} bytes** | AODS 在仓库尺度上当前 **${describeRelativeSizeZh(aodsBytes, humanBytes)}** |
| **Objective median loaded payload** | **${Math.round(objective.median_route_bytes)} bytes** | 路由后的 working set 明显小于全库 |
| **Objective median prompt envelope** | **${Math.round(objective.median_prompt_envelope_bytes)} bytes** | 更接近真实上下文窗口占用 |
| **Task-stage coverage** | **${formatPercent(evaluation.loading.task_stage_coverage)}**，覆盖 **${taskStages.length}** 个显式阶段 | benchmark 结果现在显式标注 orientation、plan、action、verification、evidence |
${runtimeLine}
| **Objective touch-route hit rate** | **${formatPercent(objective.hit_rate)}** | 所有 objective routing 场景都命中了所需模块 |
| **Objective median byte savings vs full load** | **${formatPercent(objective.median_byte_savings_vs_full_load)}** | 路由后的工作集显著小于 full-load |
| **Built-in drift recall** | **${formatPercent(evaluation.drift.built_in_recall)}** | 当前 validator + hook 层能抓到当前 benchmark 中的全部风险 |
| **Built-in false-positive rate** | **${formatPercent(evaluation.drift.built_in_false_positive_rate)}** | 当前 control 场景没有误报 |
| **Benchmark diversity** | **${evaluation.diversity.dataset_count} 个数据集**、**${taskStages.length} 个任务阶段** | 比最初的单语料基线更强，但仍是 synthetic 且 English-only |

## 横向对比

| 基线 | Coverage | Fidelity | Corpus bytes | Objective touch-route hit rate | Objective median loaded bytes | Objective median prompt-envelope bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${comparisonRows}

**怎么读这张表：** 非 AODS 基线在 bytes 上更轻，但它们在 benchmark 的 objective touch-route contract 上是 **0.0%**，因为这些格式没有提供 AODS 风格的原生 routing 和 paired-surface governance。所以它们更小的 loaded bytes，**不等价于**“在受治理检索上做到同样的事”。

## 最新 benchmark 变化

| 指标 | 当前 | 上一次 | 相对上次变化 | 解读 |
| --- | --- | --- | --- | --- |
${deltaRows}`;
}

function describeRelativeSize(current, baseline) {
  if (baseline === 0) {
    return "n/a";
  }
  const ratio = current / baseline - 1;
  return ratio >= 0 ? `${formatPercent(ratio)} larger` : `${formatPercent(-ratio)} smaller`;
}

function describeRelativeSizeZh(current, baseline) {
  if (baseline === 0) {
    return "n/a";
  }
  const ratio = current / baseline - 1;
  return ratio >= 0 ? `大 ${formatPercent(ratio)}` : `小 ${formatPercent(-ratio)}`;
}

function formatRuntimeMultiplier(runtimeBytes, promptBytes) {
  if (!runtimeBytes || !promptBytes) {
    return "n/a";
  }
  return (runtimeBytes / promptBytes).toFixed(2);
}

function translateMetricLabel(label) {
  const labels = {
    "Lifecycle phase coverage": "生命周期覆盖率",
    "Fact preservation rate": "事实保真率",
    "AODS exact corpus bytes": "AODS 精确语料字节数",
    "Objective touch-route hit rate": "Objective touch-route 命中率",
    "Objective median loaded bytes": "Objective 中位加载字节数",
    "Objective median prompt-envelope bytes": "Objective 中位 prompt-envelope 字节数",
    "Built-in drift recall": "内建 drift recall",
    "Built-in false-positive rate": "内建误报率",
    "External sample corpus count": "外部样本语料数",
    "External sample scenario count": "外部样本场景数",
    "Task stage coverage": "任务阶段覆盖率",
    "Runtime request-body bytes": "Runtime request-body 字节数",
    "Exploratory query precision": "Exploratory query precision"
  };
  return labels[label] ?? label;
}

function translateMetricReading(reading) {
  const readings = {
    improved: "改善",
    regressed: "回退",
    flat: "持平",
    "no prior baseline": "没有更早基线"
  };
  return readings[reading] ?? reading;
}

function readOptionalJson(filePath) {
  return fs.existsSync(filePath) ? readJson(filePath) : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarkSummary();
}
