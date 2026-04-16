import path from "node:path";

export const HUMAN_GENERATION_MODES = new Set(["deterministic"]);
export const HUMAN_GENERATION_MODE_VALUES = [...HUMAN_GENERATION_MODES];
export const HUMAN_GENERATION_PROFILES = new Set(["overview", "checklist"]);
export const HUMAN_GENERATION_PROFILE_VALUES = [...HUMAN_GENERATION_PROFILES];

export function hasGeneratedHumanPrimary(pair) {
  return isPlainObject(pair?.human_generation);
}

export function renderGeneratedHumanPrimary({ manifest, pair, moduleMap }) {
  if (!hasGeneratedHumanPrimary(pair)) {
    return null;
  }

  const generation = pair.human_generation;
  if (generation.mode !== "deterministic") {
    throw new Error(`Unsupported human_generation.mode for ${pair.pair_id}: ${generation.mode}`);
  }

  const modules = collectPairModules(manifest, pair, moduleMap);
  const title = generation.title || defaultHumanTitle(manifest, pair);
  switch (generation.profile) {
    case "overview":
      return renderOverviewSurface({ title, pair, modules });
    case "checklist":
      return renderChecklistSurface({ title, pair, modules });
    default:
      throw new Error(`Unsupported human_generation.profile for ${pair.pair_id}: ${generation.profile}`);
  }
}

function collectPairModules(manifest, pair, moduleMap) {
  const moduleRefById = new Map((manifest.modules ?? []).map((entry) => [entry.id, entry]));
  const orderedIds = dedupeStrings([pair.agent_primary, ...(pair.agent_supporting ?? [])]);
  const modules = [];

  for (const moduleId of orderedIds) {
    const module = resolveModule(moduleMap, moduleId);
    const moduleRef = moduleRefById.get(moduleId);
    if (!module || !moduleRef) {
      throw new Error(
        `Cannot render generated human surface for ${pair.pair_id}: missing paired module ${moduleId}`
      );
    }
    modules.push({
      id: moduleId,
      scope: moduleRef.scope ?? "",
      category: moduleRef.category ?? "",
      module
    });
  }

  return modules;
}

function resolveModule(moduleMap, moduleId) {
  const value = moduleMap.get(moduleId);
  if (!value) {
    return null;
  }
  if (value.module) {
    return value.module;
  }
  if (value.content) {
    return value.content;
  }
  return value;
}

function renderOverviewSurface({ title, pair, modules }) {
  const lines = [
    generatedMarker(pair),
    `# ${title}`,
    "",
    "Generated deterministically from AODS agent-primary authority. Do not edit manually.",
    "",
    "## Pair contract",
    "",
    `- Pair ID: \`${pair.pair_id}\``,
    `- Sync source: \`${pair.sync_source}\``,
    `- Agent primary: \`${pair.agent_primary}\``
  ];

  if (Array.isArray(pair.agent_supporting) && pair.agent_supporting.length > 0) {
    lines.push(`- Agent supporting: ${pair.agent_supporting.map((value) => `\`${value}\``).join(", ")}`);
  }

  pushCanonicalFacts(lines, pair);

  lines.push("## Coverage", "");
  for (const entry of modules) {
    lines.push(`- \`${entry.id}\` (${entry.category}): ${entry.scope}`);
  }

  lines.push("", "## Agent-derived sections", "");
  for (const entry of modules) {
    lines.push(`### ${entry.id}`);
    if (entry.scope) {
      lines.push("", entry.scope, "");
    }

    const sections = entry.module.sections ?? [];
    if (sections.length === 0) {
      lines.push("No prose sections declared.", "");
    } else {
      for (const section of sections) {
        lines.push(`#### ${section.topic ?? section.sid ?? "section"}`, "", section.content ?? "", "");
      }
    }

    const artifacts = entry.module.artifacts ?? [];
    if (artifacts.length > 0) {
      lines.push("Artifacts:");
      for (const artifact of artifacts) {
        lines.push(`- \`${artifact.artifact_id}\` (${artifact.type}): ${artifact.usage ?? "No usage note."}`);
      }
      lines.push("");
    }
  }

  return finalizeText(lines);
}

function renderChecklistSurface({ title, pair, modules }) {
  const lines = [
    generatedMarker(pair),
    `# ${title}`,
    "",
    "Generated deterministically from AODS agent-primary authority. Do not edit manually.",
    ""
  ];

  pushCanonicalFacts(lines, pair);

  const checklistItems = buildChecklistItems(modules);
  lines.push("## Checklist", "");
  if (checklistItems.length === 0) {
    lines.push("- [ ] No deterministic checklist items derived from the current agent authority.");
  } else {
    lines.push(...checklistItems);
  }
  lines.push("", "## Reference sections", "");

  for (const entry of modules) {
    lines.push(`### ${entry.id}`);
    for (const section of entry.module.sections ?? []) {
      lines.push(`- ${section.topic ?? section.sid ?? "section"}: ${section.content ?? ""}`);
    }
    lines.push("");
  }

  return finalizeText(lines);
}

function buildChecklistItems(modules) {
  const items = [];

  for (const entry of modules) {
    for (const artifact of entry.module.artifacts ?? []) {
      if (artifact.type === "rule-set") {
        for (const rule of artifact.content?.rules ?? []) {
          const clause = typeof rule.condition === "string" && rule.condition.length > 0 ? ` when \`${rule.condition}\`` : "";
          items.push(`- [ ] ${rule.action ?? "Apply rule"}${clause}.`);
        }
      }
      if (artifact.type === "decision-tree") {
        const nodesById = new Map((artifact.content?.nodes ?? []).map((node) => [node.id, node]));
        const rootNode = nodesById.get(artifact.content?.root);
        for (const branch of rootNode?.branches ?? []) {
          const targetNode = nodesById.get(branch.next);
          const targetAction = targetNode?.action ?? `follow \`${branch.next}\``;
          items.push(`- [ ] If ${branch.value}, ${targetAction}.`);
        }
      }
    }
  }

  return items;
}

function pushCanonicalFacts(lines, pair) {
  if (!Array.isArray(pair.shared_invariants) || pair.shared_invariants.length === 0) {
    return;
  }

  lines.push("", "## Canonical facts", "");
  for (const invariant of pair.shared_invariants) {
    lines.push(`- ${invariant}`);
  }
  lines.push("");
}

function generatedMarker(pair) {
  return `<!-- AODS GENERATED: pair_id=${pair.pair_id} mode=${pair.human_generation.mode} profile=${pair.human_generation.profile} -->`;
}

function defaultHumanTitle(manifest, pair) {
  const fileName = pair.human_primary ?? "";
  const base = path.basename(fileName, path.extname(fileName));
  if (base.toLowerCase() === "readme") {
    return manifest.sys;
  }
  return base
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");
}

function finalizeText(lines) {
  return `${trimTrailingBlankLines(lines).join("\n")}\n`;
}

function trimTrailingBlankLines(lines) {
  const result = [...lines];
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }
  return result;
}

function dedupeStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
