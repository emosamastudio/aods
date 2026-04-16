import fs from "node:fs";
import path from "node:path";

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "read",
  "show",
  "the",
  "to",
  "what",
  "when",
  "where",
  "with",
  "write"
]);

const ROUTING_QUERY_TERMS = new Set(["overview", "summary", "route", "routes", "routing", "orientation"]);

const TASK_STAGE_TERMS = {
  orientation: ["orientation", "overview", "summary", "start", "bootstrap", "route", "routing"],
  plan: ["plan", "planning", "roadmap", "milestone", "goal", "goals", "adr"],
  action: ["action", "edit", "write", "change", "implement", "fix", "deploy", "rollout"],
  verification: ["verification", "verify", "validate", "review", "check", "test", "debug", "approval"],
  evidence: ["evidence", "proof", "audit", "log", "trace", "retention", "raw"]
};

const TERM_ALIASES = {
  adr: ["decision", "architecture", "record"],
  api: ["contract", "endpoint", "interface"],
  audit: ["evidence", "compliance"],
  docs: ["documentation", "readme"],
  exception: ["waiver"],
  overview: ["summary", "orientation"],
  packet: ["release"],
  policy: ["governance", "rule"],
  routes: ["routing", "route"],
  route: ["routing", "routes"],
  schema: ["contract", "payload"],
  slo: ["sla", "timer"],
  summary: ["overview", "capsule"]
};

const ANCHOR_WEIGHTS = {
  module_id: 10,
  tag: 8,
  scope: 7,
  control_role: 7,
  human_path: 6,
  section_topic: 6,
  artifact_id: 6,
  artifact_usage: 5,
  runtime_effect: 5,
  capsule_hint: 5,
  provenance_role: 4,
  runtime_output: 4,
  shared_invariant: 4,
  context: 4,
  section_sid: 3,
  section_content: 2,
  artifact_content: 1,
  artifact_type: 2
};

const INTENT_LAYER_BONUS = {
  any: { root: 1, capsule: 1, detail: 1, evidence: 0 },
  read: { root: 1, capsule: 2, detail: 1, evidence: 0 },
  write: { root: 0, capsule: 1, detail: 2, evidence: 0 }
};

const LAYER_TIEBREAKER = {
  any: { root: 0, capsule: 1, detail: 2, evidence: 3 },
  read: { capsule: 0, root: 1, detail: 2, evidence: 3 },
  write: { detail: 0, capsule: 1, root: 2, evidence: 3 }
};

const TASK_STAGE_LAYER_BONUS = {
  orientation: { root: 6, capsule: 5, detail: 1, evidence: 0 },
  plan: { root: 1, capsule: 3, detail: 4, evidence: 0 },
  action: { root: 0, capsule: 1, detail: 5, evidence: 1 },
  verification: { root: 0, capsule: 1, detail: 4, evidence: 3 },
  evidence: { root: 0, capsule: 0, detail: 2, evidence: 6 }
};

const TASK_STAGE_CATEGORY_BONUS = {
  orientation: { architecture: 3, protocol: 3, capsule: 4, reference: 1 },
  plan: { architecture: 2, policy: 4, capsule: 2, protocol: 1 },
  action: { workflow: 4, policy: 3, config: 3, reference: 2, artifact: 2 },
  verification: { policy: 4, reference: 3, protocol: 2, artifact: 2 },
  evidence: { reference: 4, artifact: 3, policy: 1 }
};

const TASK_STAGE_CONTROL_BONUS = {
  verification: { sensor: 5, hybrid: 3 },
  action: { guide: 2, hybrid: 2 },
  evidence: { hybrid: 1 }
};

export function buildQueryRouteIndex(rootPath, manifest) {
  const componentByModuleId = buildDependencyComponents(manifest.modules ?? []);
  const surfacePairByAgent = new Map(
    (manifest.surface_pairs ?? [])
      .filter((pair) => typeof pair.agent_primary === "string" && pair.agent_primary.length > 0)
      .map((pair) => [pair.agent_primary, pair])
  );

  return new Map(
    (manifest.modules ?? []).map((moduleRef) => {
      const module = readModuleJson(rootPath, moduleRef.path);
      return [
        moduleRef.id,
        {
          id: moduleRef.id,
          layer: moduleRef.layer,
          category: moduleRef.category,
          deps: moduleRef.deps ?? [],
          componentId: componentByModuleId.get(moduleRef.id) ?? null,
          controlRole: moduleRef.control?.role ?? module?.meta?.control?.role ?? null,
          provenanceRole: moduleRef.provenance?.memory_role ?? module?.meta?.provenance?.memory_role ?? null,
          anchors: buildModuleAnchors(moduleRef, module, surfacePairByAgent.get(moduleRef.id))
        }
      ];
    })
  );
}

export function resolveQueryRoute({ manifest, queryIndex, role, intent, query, stage }) {
  const roleModules = new Set(manifest.boot_by_role?.[role] ?? []);
  const roleComponentIds = new Set(
    [...roleModules]
      .map((moduleId) => queryIndex.get(moduleId)?.componentId)
      .filter(Boolean)
  );
  const queryProfile = createQueryProfile(query, stage);

  if (queryProfile.terms.length === 0) {
    return {
      selectedModuleIds: [],
      matchedModules: [],
      reasons: [],
      task_stage: queryProfile.taskStage,
      task_stage_source: queryProfile.taskStageSource
    };
  }

  const scoredModules = [...queryIndex.values()]
    .map((profile) => scoreModuleProfile(profile, queryProfile, roleModules, roleComponentIds, intent))
    .filter((profile) => profile.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      const layerOrder = LAYER_TIEBREAKER[intent] ?? LAYER_TIEBREAKER.any;
      return (layerOrder[left.layer] ?? 99) - (layerOrder[right.layer] ?? 99);
    });

  if (scoredModules.length === 0) {
    return {
      selectedModuleIds: [],
      matchedModules: [],
      reasons: [
        ...(queryProfile.taskStage ? [`task stage ${queryProfile.taskStage} (${queryProfile.taskStageSource})`] : []),
        `query "${query}" matched no lexical anchors`
      ],
      task_stage: queryProfile.taskStage,
      task_stage_source: queryProfile.taskStageSource
    };
  }

  const selected = selectTopMatches(scoredModules, queryProfile);
  return {
    selectedModuleIds: selected.map((profile) => profile.id),
    matchedModules: selected.map((profile) => ({
      id: profile.id,
      score: profile.score,
      layer: profile.layer,
      category: profile.category,
      matched_terms: profile.matchedTerms,
      evidence: profile.evidence
    })),
    reasons: selected.map(
      (profile) =>
        `${profile.id} score=${profile.score} via ${profile.evidence
          .slice(0, 2)
          .map((evidence) => `${evidence.label} "${evidence.sample}"`)
          .join("; ")}`
    ),
    task_stage: queryProfile.taskStage,
    task_stage_source: queryProfile.taskStageSource
  };
}

function readModuleJson(rootPath, relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("Query routing cannot index a module without a relative path.");
  }

  const absolutePath = path.join(rootPath, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Query routing cannot index missing module file: ${relativePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch {
    throw new Error(`Query routing cannot index invalid module JSON: ${relativePath}`);
  }
}

function buildModuleAnchors(moduleRef, module, pair) {
  const anchors = [
    createAnchor("module_id", moduleRef.id),
    createAnchor("scope", moduleRef.scope),
    ...(moduleRef.tags ?? []).map((tag) => createAnchor("tag", tag))
  ];

  if (moduleRef.control?.role) {
    anchors.push(createAnchor("control_role", moduleRef.control.role));
  }
  if (moduleRef.provenance?.memory_role) {
    anchors.push(createAnchor("provenance_role", moduleRef.provenance.memory_role));
  }
  if (Array.isArray(moduleRef.runtime_contract?.side_effects)) {
    anchors.push(createAnchor("runtime_effect", moduleRef.runtime_contract.side_effects));
  }
  if (Array.isArray(moduleRef.runtime_contract?.outputs)) {
    anchors.push(createAnchor("runtime_output", moduleRef.runtime_contract.outputs));
  }

  if (module?.context) {
    anchors.push(createAnchor("context", module.context));
  }

  for (const section of module?.sections ?? []) {
    anchors.push(createAnchor("section_sid", section.sid));
    anchors.push(createAnchor("section_topic", section.topic));
    anchors.push(createAnchor("section_content", section.content));
  }

  for (const artifact of module?.artifacts ?? []) {
    anchors.push(createAnchor("artifact_id", artifact.artifact_id));
    anchors.push(createAnchor("artifact_type", artifact.type));
    anchors.push(createAnchor("artifact_usage", artifact.usage));
    for (const text of collectArtifactAnchorText(artifact.content)) {
      anchors.push(createAnchor("artifact_content", text));
    }
  }

  if (module?.meta?.capsule) {
    anchors.push(createAnchor("capsule_hint", module.meta.capsule.read_when));
    anchors.push(createAnchor("capsule_hint", module.meta.capsule.core_question));
    anchors.push(createAnchor("capsule_hint", module.meta.capsule.frozen_decisions));
    anchors.push(createAnchor("capsule_hint", module.meta.capsule.routes_to));
  }

  if (pair) {
    anchors.push(createAnchor("human_path", pair.human_primary));
    anchors.push(createAnchor("human_path", path.basename(pair.human_primary ?? "")));
    for (const humanPath of pair.human_supporting ?? []) {
      anchors.push(createAnchor("human_path", humanPath));
      anchors.push(createAnchor("human_path", path.basename(humanPath)));
    }
    for (const invariant of pair.shared_invariants ?? []) {
      anchors.push(createAnchor("shared_invariant", invariant));
    }
  }

  return anchors.filter(Boolean);
}

function createAnchor(label, value) {
  const text = stringifyAnchorValue(value);
  if (!text) {
    return null;
  }

  return {
    label,
    sample: text.length > 96 ? `${text.slice(0, 93)}...` : text,
    normalized: normalizeText(text),
    weight: ANCHOR_WEIGHTS[label] ?? 1
  };
}

function collectArtifactAnchorText(value) {
  const results = [];
  collectArtifactAnchorTextInto(value, results);
  return [...new Set(results)];
}

function collectArtifactAnchorTextInto(value, results) {
  if (typeof value === "string") {
    for (const line of splitArtifactAnchorText(value)) {
      results.push(line);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectArtifactAnchorTextInto(item, results);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const nestedValue of Object.values(value)) {
    collectArtifactAnchorTextInto(nestedValue, results);
  }
}

function splitArtifactAnchorText(value) {
  return String(value ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function stringifyAnchorValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(" ");
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function createQueryProfile(query, stage) {
  const normalizedStage = normalizeTaskStage(stage);
  const terms = tokenize(query).map((term) => ({
    term,
    variants: [term, ...(TERM_ALIASES[term] ?? [])]
  }));

  const phrases = [];
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.includes(" ")) {
    phrases.push(normalizedQuery);
  }

  const inferredTaskStage = normalizedStage ?? inferTaskStage(terms.map((term) => term.term));

  return {
    raw: query,
    normalized: normalizedQuery,
    terms,
    phrases,
    taskStage: inferredTaskStage,
    taskStageSource: normalizedStage ? "explicit" : inferredTaskStage ? "inferred" : null,
    isRoutingQuery: terms.some((term) => ROUTING_QUERY_TERMS.has(term.term)) || inferredTaskStage === "orientation"
  };
}

function scoreModuleProfile(profile, queryProfile, roleModules, roleComponentIds, intent) {
  const evidence = [];
  const matchedTerms = new Set();
  let score = roleModules.has(profile.id) ? 2 : 0;
  if (profile.componentId && roleComponentIds.has(profile.componentId)) {
    score += 3;
    evidence.push({
      label: "role_component",
      sample: profile.componentId,
      match: "role"
    });
  }
  score += INTENT_LAYER_BONUS[intent]?.[profile.layer] ?? INTENT_LAYER_BONUS.any[profile.layer] ?? 0;

  const taskStage = queryProfile.taskStage;
  if (taskStage) {
    const stageBonus =
      (TASK_STAGE_LAYER_BONUS[taskStage]?.[profile.layer] ?? 0) +
      (TASK_STAGE_CATEGORY_BONUS[taskStage]?.[profile.category] ?? 0) +
      (TASK_STAGE_CONTROL_BONUS[taskStage]?.[profile.controlRole] ?? 0) +
      (taskStage === "evidence" && profile.provenanceRole === "evidence" ? 3 : 0);
    if (stageBonus > 0) {
      score += stageBonus;
      evidence.push({
        label: "task_stage",
        sample: `${profile.layer}/${profile.category}`,
        match: taskStage
      });
    }
  }

  for (const phrase of queryProfile.phrases) {
    for (const anchor of profile.anchors) {
      if (phrase.length >= 12 && anchor.normalized.includes(phrase)) {
        score += anchor.weight + 4;
        evidence.push({
          label: anchor.label,
          sample: anchor.sample,
          match: phrase
        });
        break;
      }
    }
  }

  for (const term of queryProfile.terms) {
    const match = findAnchorMatch(profile.anchors, term.variants);
    if (!match) {
      continue;
    }
    matchedTerms.add(term.term);
    score += match.anchor.weight;
    if (match.variant !== term.term) {
      score += 1;
    }
    evidence.push({
      label: match.anchor.label,
      sample: match.anchor.sample,
      match: match.variant
    });
  }

  if (matchedTerms.size === queryProfile.terms.length && matchedTerms.size > 1) {
    score += 3;
  }

  return {
    id: profile.id,
    layer: profile.layer,
    category: profile.category,
    componentId: profile.componentId,
    score,
    matchedTerms: [...matchedTerms],
    evidence: dedupeEvidence(evidence)
  };
}

function findAnchorMatch(anchors, variants) {
  for (const variant of variants) {
    const normalizedVariant = normalizeText(variant);
    if (!normalizedVariant) {
      continue;
    }
    for (const anchor of anchors) {
      if (anchor.normalized.includes(normalizedVariant)) {
        return { anchor, variant: normalizedVariant };
      }
    }
  }
  return null;
}

function selectTopMatches(scoredModules, queryProfile) {
  const bestScore = scoredModules[0]?.score ?? 0;
  const threshold = Math.max(6, Math.ceil(bestScore * 0.55));
  const shortlisted = scoredModules.filter((profile) => profile.score >= threshold).slice(0, 4);
  if (shortlisted.length === 0) {
    return scoredModules.slice(0, 1);
  }

  if (queryProfile?.isRoutingQuery) {
    return selectRoutingMatches(shortlisted);
  }

  const targeted = shortlisted.filter((profile) => profile.category !== "capsule");
  return selectTargetedMatches(targeted.length > 0 ? targeted : shortlisted);
}

function selectRoutingMatches(shortlisted) {
  const [primary] = shortlisted;
  if (!primary) {
    return [];
  }

  const primaryPrefix = modulePrefix(primary.id);
  const samePrefix = shortlisted.filter((profile) => modulePrefix(profile.id) === primaryPrefix);
  const selected = [primary];
  const preferredRoot = samePrefix.find((profile) => profile.layer === "root" && profile.id !== primary.id);
  if (preferredRoot) {
    selected.push(preferredRoot);
  }

  for (const candidate of samePrefix) {
    if (!selected.some((profile) => profile.id === candidate.id)) {
      selected.push(candidate);
    }
    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}

function selectTargetedMatches(shortlisted) {
  const [primary, ...rest] = shortlisted;
  if (!primary) {
    return [];
  }

  const selected = [primary];
  const selectedTerms = new Set(primary.matchedTerms);
  const sameComponent = rest.filter((profile) => sharesComponent(primary, profile));
  const crossComponent = rest.filter((profile) => !sharesComponent(primary, profile));

  appendTargetedMatches(selected, sameComponent, selectedTerms, primary, false);
  if (selected.length < 3) {
    appendTargetedMatches(selected, crossComponent, selectedTerms, primary, true);
  }

  return selected;
}

function appendTargetedMatches(selected, candidates, selectedTerms, primary, crossComponent) {
  const minScore = crossComponent ? Math.max(10, Math.ceil(primary.score * 0.85)) : Math.max(8, Math.ceil(primary.score * 0.7));
  const maxGap = crossComponent ? 2 : 6;

  for (const candidate of candidates) {
    const scoreGap = primary.score - candidate.score;
    const addsNewTerms = candidate.matchedTerms.some((term) => !selectedTerms.has(term));
    const strongEnough = candidate.score >= minScore || scoreGap <= maxGap;
    if (!strongEnough) {
      continue;
    }
    if (crossComponent && !addsNewTerms) {
      continue;
    }
    selected.push(candidate);
    for (const term of candidate.matchedTerms) {
      selectedTerms.add(term);
    }
    if (selected.length === 3) {
      break;
    }
  }
}

function sharesComponent(left, right) {
  return Boolean(left.componentId) && left.componentId === right.componentId;
}

function buildDependencyComponents(moduleRefs) {
  const adjacency = new Map((moduleRefs ?? []).map((moduleRef) => [moduleRef.id, new Set()]));

  for (const moduleRef of moduleRefs ?? []) {
    for (const depId of moduleRef.deps ?? []) {
      if (!adjacency.has(depId)) {
        continue;
      }
      adjacency.get(moduleRef.id)?.add(depId);
      adjacency.get(depId)?.add(moduleRef.id);
    }
  }

  const componentByModuleId = new Map();
  let nextComponent = 1;

  for (const moduleId of adjacency.keys()) {
    if (componentByModuleId.has(moduleId)) {
      continue;
    }

    const componentId = `component-${nextComponent}`;
    nextComponent += 1;
    const queue = [moduleId];

    while (queue.length > 0) {
      const currentId = queue.pop();
      if (!currentId || componentByModuleId.has(currentId)) {
        continue;
      }
      componentByModuleId.set(currentId, componentId);
      for (const neighborId of adjacency.get(currentId) ?? []) {
        if (!componentByModuleId.has(neighborId)) {
          queue.push(neighborId);
        }
      }
    }
  }

  return componentByModuleId;
}

function normalizeTaskStage(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = normalizeText(value);
  return normalized && Object.hasOwn(TASK_STAGE_TERMS, normalized) ? normalized : null;
}

function inferTaskStage(terms) {
  let bestStage = null;
  let bestScore = 0;
  for (const [stage, stageTerms] of Object.entries(TASK_STAGE_TERMS)) {
    const score = terms.reduce((total, term) => total + (stageTerms.includes(term) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestStage = stage;
    }
  }
  return bestScore > 0 ? bestStage : null;
}

function modulePrefix(moduleId) {
  return String(moduleId ?? "").split(/[-_]/)[0];
}

function dedupeEvidence(evidence) {
  const seen = new Set();
  return evidence.filter((item) => {
    const key = `${item.label}|${item.sample}|${item.match}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function tokenize(text) {
  return [...new Set(normalizeText(text).split(" ").filter((term) => term.length >= 2 && !STOPWORDS.has(term)))];
}

function normalizeText(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
