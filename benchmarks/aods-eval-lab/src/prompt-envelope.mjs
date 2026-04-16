import { measureText } from "./helpers.mjs";

export function measureBenchmarkPromptEnvelope({ formatLabel, scenario, resources }) {
  const text = renderBenchmarkPromptEnvelope({ formatLabel, scenario, resources });
  return {
    text,
    ...measureText(text)
  };
}

export function renderBenchmarkPromptEnvelope({ formatLabel, scenario, resources }) {
  const lines = [
    "# Benchmark prompt envelope",
    "",
    `format: ${formatLabel}`,
    `scenario_id: ${scenario.id}`,
    `scenario_class: ${scenario.scenario_class}`,
    `measurement_class: ${scenario.measurement_class}`,
    `mode: ${scenario.touch ? "touch-route" : "query-route"}`,
    `task: ${scenario.description}`
  ];

  if (scenario.role) {
    lines.push(`role: ${scenario.role}`);
  }
  if (scenario.intent) {
    lines.push(`intent: ${scenario.intent}`);
  }
  if (scenario.touch) {
    lines.push(`touch: ${scenario.touch}`);
  }
  if (scenario.concepts?.length) {
    lines.push(`concepts: ${scenario.concepts.join(", ")}`);
  }

  lines.push(
    "",
    "instruction: Use only the context resources below. Keep path labels as citations when grounding claims.",
    "",
    "## Context resources",
    ""
  );

  resources.forEach((resource, index) => {
    lines.push(`--- RESOURCE ${index + 1} ---`);
    lines.push(`path: ${resource.path}`);
    if (resource.title) {
      lines.push(`title: ${resource.title}`);
    }
    if (resource.kind) {
      lines.push(`kind: ${resource.kind}`);
    }
    if (resource.module_ids?.length) {
      lines.push(`module_ids: ${resource.module_ids.join(", ")}`);
    }
    lines.push("content:");
    lines.push(resource.content.trimEnd());
    lines.push(`--- END RESOURCE ${index + 1} ---`, "");
  });

  return lines.join("\n").trimEnd() + "\n";
}
