import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { getManifestRuntime, getModulePath } from "../../../lib/manifest-runtime.mjs";
import { REPO_ROOT, measureText, readJson } from "./helpers.mjs";

const AODS_CLI = path.join(REPO_ROOT, "bin", "aods.mjs");

export function loadAodsCorpusIndex(paths) {
  const manifestPath = path.join(paths.corpusRoot, "manifest.json");
  const rawManifest = readJson(manifestPath);
  const manifestContent = fs.readFileSync(manifestPath, "utf8");
  const manifestMetrics = measureText(manifestContent);
  const { manifest, companion, companionPath } = getManifestRuntime(paths.corpusRoot, rawManifest);
  const companionContent =
    companion && companionPath ? fs.readFileSync(path.join(paths.corpusRoot, companionPath), "utf8") : "";
  const companionMetrics = companionContent ? measureText(companionContent) : { bytes: 0, tokens_estimated: 0 };
  const moduleRefMap = new Map(manifest.modules.map((module) => [module.id, module]));
  const moduleContentMap = new Map(
    manifest.modules.map((module) => {
      const filePath = path.join(paths.corpusRoot, getModulePath(module));
      return [module.id, fs.readFileSync(filePath, "utf8")];
    })
  );
  const moduleMetricMap = new Map(
    [...moduleContentMap].map(([moduleId, content]) => [moduleId, measureText(content)])
  );

  return {
    manifest,
    rawManifest,
    manifestContent,
    manifestMetrics,
    companion,
    companionPath,
    companionContent,
    companionMetrics,
    moduleRefMap,
    moduleContentMap,
    moduleMetricMap
  };
}

export function buildAodsPromptResources(manifestContent, moduleRefMap, moduleContentMap, moduleRefs, options = {}) {
  return [
    {
      path: "manifest.json",
      title: "AODS manifest",
      kind: "manifest",
      content: manifestContent
    },
    ...(options.supportResources ?? []),
    ...moduleRefs.map((moduleRef) => ({
      path: getModulePath(moduleRef),
      title: moduleRef.id,
      kind: "module",
      module_ids: [moduleRef.id],
      content: moduleContentMap.get(moduleRef.id)
    }))
  ];
}

export function buildFullAodsSupportResources(corpusIndex) {
  if (!corpusIndex.companionContent || !corpusIndex.companionPath) {
    return [];
  }

  return [
    {
      path: corpusIndex.companionPath,
      title: "AODS manifest companion",
      kind: "manifest-companion",
      content: corpusIndex.companionContent
    }
  ];
}

export function buildScenarioAodsSupportResources(corpusIndex, route) {
  const supportResources = [];
  const companion = corpusIndex.companion;
  if (!companion) {
    return supportResources;
  }

  if (companion.glossary && Object.keys(companion.glossary).length > 0) {
    supportResources.push({
      path: `${corpusIndex.companionPath ?? "manifest-companion"}#glossary`,
      title: "AODS glossary slice",
      kind: "manifest-companion-slice",
      content: JSON.stringify({ glossary: companion.glossary }, null, 2)
    });
  }

  if (route.role) {
    const roleDef = (companion.roles ?? []).find((role) => role.id === route.role);
    const bootModules = companion.boot_by_role?.[route.role];
    if (roleDef || bootModules) {
      supportResources.push({
        path: `${corpusIndex.companionPath ?? "manifest-companion"}#role:${route.role}`,
        title: `AODS role slice ${route.role}`,
        kind: "manifest-companion-slice",
        content: JSON.stringify(
          {
            role: roleDef ?? { id: route.role },
            boot_by_role: bootModules ?? []
          },
          null,
          2
        )
      });
    }
  }

  if ((route.matched_touch_routes ?? []).length > 0) {
    supportResources.push({
      path: `${corpusIndex.companionPath ?? "manifest-companion"}#touch:${route.touch ?? "matched"}`,
      title: "AODS touch-route slice",
      kind: "manifest-companion-slice",
      content: JSON.stringify(
        {
          touch: route.touch,
          matched_touch_routes: route.matched_touch_routes
        },
        null,
        2
      )
    });
  }

  if (route.touched_surface_pair) {
    supportResources.push({
      path: `${corpusIndex.companionPath ?? "manifest-companion"}#pair:${route.touched_surface_pair.pair_id}`,
      title: `AODS surface-pair slice ${route.touched_surface_pair.pair_id}`,
      kind: "manifest-companion-slice",
      content: JSON.stringify({ surface_pair: route.touched_surface_pair }, null, 2)
    });
  }

  return supportResources;
}

export function measurePromptSupportResources(resources) {
  return resources.reduce(
    (totals, resource) => {
      const metrics = measureText(resource.content);
      return {
        bytes: totals.bytes + metrics.bytes,
        tokens_estimated: totals.tokens_estimated + metrics.tokens_estimated
      };
    },
    {
      bytes: 0,
      tokens_estimated: 0
    }
  );
}

export function routeScenarioModules(corpusRoot, scenario) {
  const args = ["route", corpusRoot, "--intent", scenario.intent, "--json"];
  if (scenario.role) {
    args.push("--role", scenario.role);
  }
  if (scenario.task_stage) {
    args.push("--stage", scenario.task_stage);
  }
  if (scenario.touch) {
    args.push("--touch", scenario.touch);
  } else if (scenario.query || scenario.concepts?.length) {
    args.push("--query", scenario.query ?? scenario.concepts.join(" "));
  }
  return runAodsJson(args);
}

export function runAodsJson(args) {
  try {
    const output = execFileSync("node", [AODS_CLI, ...args], {
      cwd: REPO_ROOT,
      encoding: "utf8"
    });
    return JSON.parse(output);
  } catch (error) {
    if (typeof error.stdout === "string" && error.stdout.trim()) {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}
