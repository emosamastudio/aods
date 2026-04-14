import fs from "node:fs";
import path from "node:path";

import {
  ARTIFACTS,
  HUMAN_DOCS,
  MODULE_BLUEPRINTS,
  SYSTEM,
  humanDocArtifacts
} from "./benchmark-data.mjs";
import { renderHumanArtifact } from "./generate-fixtures.mjs";
import {
  PROJECT_ROOT,
  dedupe,
  emptyDir,
  ensureDir,
  estimateTokens,
  writeJson,
  writeText
} from "./helpers.mjs";

const MODULE_BY_ID = new Map(MODULE_BLUEPRINTS.map((blueprint) => [blueprint.id, blueprint]));

export function buildComparatorCorpora(paths) {
  const comparatorsRoot = path.join(paths.generatedRoot, "comparators");
  emptyDir(comparatorsRoot);

  const markdownYaml = buildMarkdownYamlProfile(path.join(comparatorsRoot, "markdown-yaml"));
  const llmsTxt = buildLlmsTxtProfile(path.join(comparatorsRoot, "llms-txt"));
  const dita = buildDitaProfile(path.join(comparatorsRoot, "dita"));

  const profiles = [markdownYaml, llmsTxt, dita];
  writeJson(path.join(paths.resultsRoot, "round1-comparator-profiles.json"), profiles);
  return profiles;
}

function buildMarkdownYamlProfile(rootDir) {
  const units = HUMAN_DOCS.map((doc) => {
    const artifacts = humanDocArtifacts(doc.path);
    const moduleTags = dedupe(doc.moduleIds.flatMap((moduleId) => MODULE_BY_ID.get(moduleId)?.tags ?? []));
    const phases = dedupe(artifacts.map((artifact) => artifact.phase));
    const artifactTypes = dedupe(
      artifacts.filter((artifact) => artifact.kind === "artifact").map((artifact) => artifact.artifact.type)
    );
    const content = [
      renderYamlFrontmatter({
        profile: "markdown-yaml",
        title: doc.title,
        modules: doc.moduleIds,
        phases,
        tags: moduleTags,
        artifact_types: artifactTypes
      }),
      renderMarkdownDoc(doc, "This Markdown plus YAML baseline models a TechDocs-style documentation slice.")
    ].join("");
    writeText(path.join(rootDir, doc.path), content);
    return {
      id: doc.path,
      path: doc.path,
      title: doc.title,
      summary: `${doc.title} covers ${doc.moduleIds.join(", ")}.`,
      module_ids: doc.moduleIds,
      phases,
      tags: [...moduleTags, ...artifactTypes],
      tokens_estimated: estimateTokens(content)
    };
  });

  return {
    id: "markdown-yaml",
    label: "Markdown + YAML",
    archetype: "TechDocs-style docs-as-code baseline",
    corpus_root: path.relative(PROJECT_ROOT, rootDir),
    index_tokens_estimated: 0,
    corpus_tokens_estimated: units.reduce((sum, unit) => sum + unit.tokens_estimated, 0),
    loadable_unit_count: units.length,
    counted_files: units.map((unit) => unit.path),
    touch_map: buildDocTouchMap(units),
    units,
    governance: {
      native_validation: "convention-only",
      paired_surface_support: false,
      explicit_authority_model: false,
      native_drift_recall: 0
    }
  };
}

function buildLlmsTxtProfile(rootDir) {
  const docs = HUMAN_DOCS.map((doc) => {
    const artifacts = humanDocArtifacts(doc.path);
    const moduleTags = dedupe(doc.moduleIds.flatMap((moduleId) => MODULE_BY_ID.get(moduleId)?.tags ?? []));
    const phases = dedupe(artifacts.map((artifact) => artifact.phase));
    const content = renderMarkdownDoc(
      doc,
      "This linked Markdown document is referenced from llms.txt as an AI-facing reading surface."
    );
    writeText(path.join(rootDir, doc.path), content);
    return {
      id: doc.path,
      path: doc.path,
      title: doc.title,
      summary: buildDocSummary(doc),
      module_ids: doc.moduleIds,
      phases,
      tags: moduleTags,
      tokens_estimated: estimateTokens(content)
    };
  });

  const llmsTxt = renderLlmsTxt(docs);
  const llmsFull = renderLlmsFull(docs, rootDir);
  writeText(path.join(rootDir, "llms.txt"), llmsTxt);
  writeText(path.join(rootDir, "llms-full.txt"), llmsFull);

  return {
    id: "llms-txt",
    label: "llms.txt",
    archetype: "Lightweight AI-facing baseline",
    corpus_root: path.relative(PROJECT_ROOT, rootDir),
    index_tokens_estimated: estimateTokens(llmsTxt),
    corpus_tokens_estimated:
      estimateTokens(llmsTxt) + docs.reduce((sum, unit) => sum + unit.tokens_estimated, 0),
    loadable_unit_count: docs.length,
    counted_files: ["llms.txt", ...docs.map((unit) => unit.path)],
    optional_files: ["llms-full.txt"],
    touch_map: buildDocTouchMap(docs),
    units: docs,
    governance: {
      native_validation: "none",
      paired_surface_support: false,
      explicit_authority_model: false,
      native_drift_recall: 0
    }
  };
}

function buildDitaProfile(rootDir) {
  const topicRoot = path.join(rootDir, "topics");
  ensureDir(topicRoot);

  const units = MODULE_BLUEPRINTS.map((blueprint) => {
    const artifacts = ARTIFACTS.filter((artifact) => artifact.moduleId === blueprint.id);
    const phases = dedupe(artifacts.map((artifact) => artifact.phase));
    const artifactTypes = dedupe(
      artifacts.filter((artifact) => artifact.kind === "artifact").map((artifact) => artifact.artifact.type)
    );
    const content = renderDitaTopic(blueprint, artifacts, phases, artifactTypes);
    const filePath = `topics/${blueprint.id}.dita`;
    writeText(path.join(rootDir, filePath), content);
    return {
      id: blueprint.id,
      path: filePath,
      title: blueprint.id,
      summary: blueprint.scope,
      module_ids: [blueprint.id],
      phases,
      tags: [...blueprint.tags, ...artifactTypes],
      tokens_estimated: estimateTokens(content)
    };
  });

  const ditamap = renderDitaMap(units);
  writeText(path.join(rootDir, "atlas-release-ops.ditamap"), ditamap);

  return {
    id: "dita",
    label: "DITA topic corpus",
    archetype: "Structured modular documentation baseline",
    corpus_root: path.relative(PROJECT_ROOT, rootDir),
    index_tokens_estimated: estimateTokens(ditamap),
    corpus_tokens_estimated:
      estimateTokens(ditamap) + units.reduce((sum, unit) => sum + unit.tokens_estimated, 0),
    loadable_unit_count: units.length,
    counted_files: ["atlas-release-ops.ditamap", ...units.map((unit) => unit.path)],
    touch_map: buildDitaTouchMap(units),
    units,
    governance: {
      native_validation: "xml-structure-only",
      paired_surface_support: false,
      explicit_authority_model: false,
      native_drift_recall: 0
    }
  };
}

function renderMarkdownDoc(doc, intro) {
  const artifacts = humanDocArtifacts(doc.path);
  const lines = [`# ${doc.title}`, "", intro, ""];
  if (path.basename(doc.path) === "README.md") {
    lines.push("## Canonical rules", "");
  } else {
    lines.push("## Lifecycle artifacts", "");
  }

  for (const artifact of artifacts) {
    lines.push(renderHumanArtifact(artifact));
  }

  if (path.basename(doc.path) === "README.md") {
    const relatedDocs = HUMAN_DOCS.filter(
      (candidate) => inferDatasetIdFromDocPath(candidate.path) === inferDatasetIdFromDocPath(doc.path) && candidate.path !== doc.path
    );
    lines.push(
      "## Linked detail surfaces",
      "",
      ...relatedDocs.map((candidate) => `- ${candidate.path}`),
      ""
    );
  }

  return lines.join("\n").trimEnd() + "\n";
}

function inferDatasetIdFromDocPath(docPath) {
  return docPath.startsWith("harbor/") ? "harbor" : "atlas";
}

function renderYamlFrontmatter(fields) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      if (value.length === 0) {
        lines.push("  []");
      } else {
        for (const item of value) {
          lines.push(`  - ${yamlScalar(item)}`);
        }
      }
      continue;
    }
    lines.push(`${key}: ${yamlScalar(value)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function yamlScalar(value) {
  return JSON.stringify(String(value));
}

function buildDocSummary(doc) {
  return doc.moduleIds.map((moduleId) => MODULE_BY_ID.get(moduleId)?.scope ?? moduleId).join(" ");
}

function renderLlmsTxt(docs) {
  const lines = [
    `# ${SYSTEM.name}`,
    "",
    "> AI-facing entrypoint for the AODS benchmark pack corpus.",
    "",
    "## Documents",
    ""
  ];
  for (const doc of docs) {
    lines.push(`- [${doc.title}](${doc.path}): ${doc.summary}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderLlmsFull(docs, rootDir) {
  const lines = [`# ${SYSTEM.name} full context`, ""];
  for (const doc of docs) {
    lines.push(`## ${doc.title}`, "");
    lines.push(fs.readFileSync(path.join(rootDir, doc.path), "utf8").trimEnd(), "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

function renderDitaTopic(blueprint, artifacts, phases, artifactTypes) {
  const body = artifacts.map((artifact) => renderDitaArtifact(artifact)).join("\n");
  const keywords = dedupe([...blueprint.tags, ...artifactTypes, ...phases])
    .map((tag) => `        <keyword>${escapeXml(tag)}</keyword>`)
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<topic id="${escapeXml(blueprint.id)}">`,
    `  <title>${escapeXml(blueprint.id)}</title>`,
    `  <shortdesc>${escapeXml(blueprint.scope)}</shortdesc>`,
    "  <prolog>",
    "    <metadata>",
    "      <keywords>",
    keywords,
    "      </keywords>",
    `      <othermeta name="module-id" content="${escapeXml(blueprint.id)}"/>`,
    `      <othermeta name="layer" content="${escapeXml(blueprint.layer)}"/>`,
    `      <othermeta name="category" content="${escapeXml(blueprint.category)}"/>`,
    "    </metadata>",
    "  </prolog>",
    "  <body>",
    body,
    "  </body>",
    "</topic>",
    ""
  ].join("\n");
}

function renderDitaArtifact(artifact) {
  const lines = [
    `    <section id="${escapeXml(artifact.id)}">`,
    `      <title>${escapeXml(artifact.title)}</title>`,
    `      <p>${escapeXml(artifact.summary)}</p>`,
    "      <ul>"
  ];
  for (const item of artifact.facts) {
    lines.push(`        <li>${escapeXml(item.text)}</li>`);
  }
  lines.push("      </ul>");
  if (artifact.kind === "artifact") {
    lines.push(`      <codeblock outputclass="${escapeXml(artifact.artifact.type)}">`);
    lines.push(escapeXml(JSON.stringify(artifact.content, null, 2)));
    lines.push("      </codeblock>");
  }
  lines.push("    </section>");
  return lines.join("\n");
}

function renderDitaMap(units) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<map>",
    `  <title>${escapeXml(SYSTEM.name)}</title>`,
    '  <topicref href="topics/atlas-root.dita" navtitle="atlas-root">',
    '    <topicref href="topics/atlas-capsule.dita" navtitle="atlas-capsule">',
    '      <topicref href="topics/product-lifecycle.dita" navtitle="product-lifecycle"/>',
    '      <topicref href="topics/architecture-contracts.dita" navtitle="architecture-contracts"/>',
    '      <topicref href="topics/delivery-workflows.dita" navtitle="delivery-workflows"/>',
    '      <topicref href="topics/operations-governance.dita" navtitle="operations-governance">',
    '        <topicref href="topics/evidence-reference.dita" navtitle="evidence-reference"/>',
    "      </topicref>",
    "    </topicref>",
    "  </topicref>",
    "</map>",
    ""
  ].join("\n");
}

function buildDocTouchMap(units) {
  const touchMap = Object.fromEntries(units.map((unit) => [unit.path, [unit.id]]));
  for (const blueprint of MODULE_BLUEPRINTS) {
    const mapped = units.filter((unit) => unit.module_ids.includes(blueprint.id)).map((unit) => unit.id);
    touchMap[blueprint.path] = dedupe(mapped);
  }
  return touchMap;
}

function buildDitaTouchMap(units) {
  const byModule = new Map(units.map((unit) => [unit.id, unit.path]));
  const touchMap = {};
  for (const blueprint of MODULE_BLUEPRINTS) {
    touchMap[blueprint.path] = [byModule.get(blueprint.id)];
  }
  for (const doc of HUMAN_DOCS) {
    touchMap[doc.path] = doc.moduleIds.map((moduleId) => byModule.get(moduleId));
  }
  return touchMap;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
