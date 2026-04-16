import fs from "node:fs";
import path from "node:path";

import { getManifestRuntime } from "./manifest-runtime.mjs";
import { buildQueryRouteIndex, resolveQueryRoute } from "./query-route.mjs";

export async function runRouteCommand(argv) {
  const options = parseArgs(argv);
  const rootPath = path.resolve(options.root);
  const manifestPath = path.join(rootPath, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found at ${manifestPath}`);
  }

  const rawManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const { manifest } = getManifestRuntime(rootPath, rawManifest);
  const moduleById = new Map((manifest.modules ?? []).map((entry) => [entry.id, entry]));
  const queryIndex = options.query ? buildQueryRouteIndex(rootPath, manifest) : null;
  const touchPath = normalizeTouchPath(options.touch, rootPath);
  const route = resolveRoute({
    rootPath,
    manifest,
    moduleById,
    queryIndex,
    role: options.role,
    touchPath,
    stage: options.stage,
    intent: options.intent,
    query: options.query
  });

  if (options.json) {
    console.log(JSON.stringify(route, null, 2));
  } else {
    printRoute(route, rootPath);
  }

  return 0;
}

function parseArgs(argv) {
  const options = {
    root: ".",
    role: "",
    touch: "",
    query: "",
    stage: "any",
    intent: "any",
    json: false
  };

  const queue = [...argv];
  if (queue.length > 0 && !queue[0].startsWith("-")) {
    options.root = queue.shift();
  }

  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--role") {
      options.role = requireValue(arg, queue);
      continue;
    }
    if (arg === "--touch") {
      options.touch = requireValue(arg, queue);
      continue;
    }
    if (arg === "--query") {
      options.query = requireValue(arg, queue);
      continue;
    }
    if (arg === "--stage") {
      options.stage = requireValue(arg, queue);
      continue;
    }
    if (arg === "--intent") {
      options.intent = requireValue(arg, queue);
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    throw new Error(`Unknown route arg: ${arg}`);
  }

  return options;
}

function resolveRoute({ rootPath, manifest, moduleById, queryIndex, role, touchPath, stage, intent, query }) {
  const bootModules = Array.isArray(manifest.boot_by_role?.[role])
    ? manifest.boot_by_role[role]
    : [...(manifest.boot_sequence ?? [])];
  const baseModules = selectContextModules(bootModules, moduleById);
  const touchMatches = resolveTouchMatches(manifest.boot_by_touch ?? [], touchPath, intent);
  const touchedModule = resolveTouchedModule(manifest.modules ?? [], touchPath);
  const touchedSurfacePair = resolveTouchedSurfacePair(manifest.surface_pairs ?? [], touchPath);
  const queryRoute = query && queryIndex
    ? resolveQueryRoute({
      manifest,
      queryIndex,
      role,
      stage,
      intent,
      query
    })
    : null;

  let recommendedModules = [];
  let strategy = role ? "role-bootstrap" : "default-bootstrap";
  const reasons = [];

  if (touchMatches.length > 0) {
    recommendedModules = dedupe([
      ...touchMatches.flatMap((route) => route.load_modules),
      ...expandDependencies(touchedModule, moduleById),
      ...(touchedModule ? [touchedModule] : [])
    ]);
    strategy = "touch-route";
    for (const route of touchMatches) {
      reasons.push(`${route.match} -> ${route.reason}`);
    }
  } else if (touchedSurfacePair) {
    recommendedModules = dedupe([
      ...selectContextModules(baseModules, moduleById),
      touchedSurfacePair.agent_primary,
      ...(touchedSurfacePair.agent_supporting ?? [])
    ]);
    strategy = "surface-pair";
    reasons.push(`surface pair ${touchedSurfacePair.pair_id} governs ${touchPath}`);
  } else if (touchedModule) {
    recommendedModules = dedupe([
      ...selectContextModules(baseModules, moduleById),
      ...expandDependencies(touchedModule, moduleById),
      touchedModule
    ]);
    strategy = "touched-module";
    reasons.push(`module path ${touchPath} maps to ${touchedModule}`);
  } else if (queryRoute && queryRoute.selectedModuleIds.length > 0) {
    recommendedModules = dedupe([
      ...queryRoute.selectedModuleIds.flatMap((moduleId) =>
        intent === "write" ? [...expandDependencies(moduleId, moduleById), moduleId] : [moduleId]
      )
    ]);
    strategy = "query-route";
    reasons.push(...queryRoute.reasons);
  } else {
    recommendedModules = dedupe(bootModules);
    if (role) {
      reasons.push(`role ${role} maps to boot_by_role`);
    } else {
      reasons.push("fallback to boot_sequence");
    }
  }

  return {
    corpus_root: rootPath,
    role: role || null,
    touch: touchPath || null,
    query: query || null,
    stage: queryRoute?.task_stage ?? (stage && stage !== "any" ? stage : null),
    task_stage_source: queryRoute?.task_stage_source ?? (stage && stage !== "any" ? "explicit" : null),
    intent,
    strategy,
    reasons,
    base_modules: describeModules(bootModules, moduleById),
    matched_touch_routes: touchMatches.map((route) => ({
      match: route.match,
      intent: route.intent,
      reason: route.reason,
      load_modules: route.load_modules
    })),
    matched_query_modules: queryRoute?.matchedModules ?? [],
    touched_module: touchedModule,
    touched_surface_pair: touchedSurfacePair
      ? {
          pair_id: touchedSurfacePair.pair_id,
          scope: touchedSurfacePair.scope,
          sync_source: touchedSurfacePair.sync_source,
          human_primary: touchedSurfacePair.human_primary,
          agent_primary: touchedSurfacePair.agent_primary,
          agent_supporting: touchedSurfacePair.agent_supporting ?? []
        }
      : null,
    recommended_modules: describeModules(recommendedModules, moduleById)
  };
}

function resolveTouchMatches(routes, touchPath, intent) {
  if (!touchPath) {
    return [];
  }

  const matches = routes.filter((route) => {
    const routeIntent = route.intent ?? "any";
    const intentMatches = intent === "any" || routeIntent === "any" || routeIntent === intent;
    return intentMatches && globMatches(route.match, touchPath);
  });

  if (matches.length === 0) {
    return [];
  }

  const bestScore = Math.max(...matches.map((route) => specificityScore(route.match)));
  return matches.filter((route) => specificityScore(route.match) === bestScore);
}

function resolveTouchedModule(modules, touchPath) {
  if (!touchPath) {
    return null;
  }
  const normalizedTouch = normalizePath(touchPath);
  return modules.find((entry) => normalizePath(entry.path) === normalizedTouch)?.id ?? null;
}

function resolveTouchedSurfacePair(surfacePairs, touchPath) {
  if (!touchPath) {
    return null;
  }
  const normalizedTouch = normalizePath(touchPath);
  return (
    surfacePairs.find((pair) => {
      if (normalizePath(pair.human_primary ?? "") === normalizedTouch) {
        return true;
      }
      return (pair.human_supporting ?? []).some((item) => normalizePath(item) === normalizedTouch);
    }) ?? null
  );
}

function selectContextModules(moduleIds, moduleById) {
  const preferred = moduleIds.filter((moduleId) => {
    const layer = moduleById.get(moduleId)?.layer;
    return layer === "root" || layer === "capsule";
  });
  return preferred.length > 0 ? preferred : moduleIds;
}

function expandDependencies(moduleId, moduleById) {
  if (!moduleId || !moduleById.has(moduleId)) {
    return [];
  }

  const ordered = [];
  const seen = new Set();

  function dfs(currentId) {
    if (seen.has(currentId) || !moduleById.has(currentId)) {
      return;
    }
    seen.add(currentId);
    for (const depId of moduleById.get(currentId)?.deps ?? []) {
      dfs(depId);
      if (!ordered.includes(depId)) {
        ordered.push(depId);
      }
    }
  }

  dfs(moduleId);
  return ordered;
}

function describeModules(moduleIds, moduleById) {
  return moduleIds
    .filter((moduleId) => moduleById.has(moduleId))
    .map((moduleId) => {
      const entry = moduleById.get(moduleId);
      return {
        id: entry.id,
        path: entry.path,
        layer: entry.layer,
        category: entry.category,
        scope: entry.scope
      };
    });
}

function printRoute(route, rootPath) {
  console.log(`ROUTE ${rootPath}`);
  console.log(
    `strategy=${route.strategy} intent=${route.intent}${route.stage ? ` stage=${route.stage}` : ""}${route.role ? ` role=${route.role}` : ""}${
      route.touch ? ` touch=${route.touch}` : ""
    }${route.query ? ` query=${JSON.stringify(route.query)}` : ""}`
  );
  console.log(`modules=${route.recommended_modules.length}`);
  for (const module of route.recommended_modules) {
    console.log(`  load ${module.id} layer=${module.layer} category=${module.category} path=${module.path}`);
  }
  for (const match of route.matched_query_modules ?? []) {
    console.log(`  query ${match.id} score=${match.score} matched=${match.matched_terms.join(", ")}`);
  }
  for (const reason of route.reasons) {
    console.log(`  why ${reason}`);
  }
}

function normalizeTouchPath(value, rootPath) {
  if (!value) {
    return "";
  }

  const resolvedPath = path.isAbsolute(value) ? value : path.resolve(rootPath, value);
  const relative = path.relative(rootPath, resolvedPath);
  if (relative === "" || relative === ".") {
    return "";
  }
  if (relative === ".." || relative.startsWith(".." + path.sep) || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new Error(`Touched path must stay inside corpus root: ${value}`);
  }
  return normalizePath(relative);
}

function globMatches(pattern, value) {
  return globToRegExp(pattern).test(normalizePath(value));
}

function globToRegExp(pattern) {
  const normalized = normalizePath(pattern);
  let regex = "^";

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === "*" && next === "*") {
      regex += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      regex += "[^/]*";
      continue;
    }
    if (char === "?") {
      regex += "[^/]";
      continue;
    }
    regex += escapeRegex(char);
  }

  regex += "$";
  return new RegExp(regex);
}

function specificityScore(pattern) {
  return normalizePath(pattern).replace(/[*?]/g, "").length;
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function normalizePath(value) {
  return String(value ?? "").replaceAll(path.sep, "/");
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function requireValue(flag, queue) {
  if (queue.length === 0) {
    throw new Error(`Missing value for ${flag}`);
  }
  return queue.shift();
}
