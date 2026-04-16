const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+|\n+/g;

export function collectModuleSemanticText(module) {
  const parts = [module.context ?? "", ...(module.assumptions ?? [])];
  for (const section of module.sections ?? []) {
    parts.push(section.topic ?? "", section.content ?? "");
  }
  for (const artifact of module.artifacts ?? []) {
    parts.push(artifact.artifact_id ?? "", artifact.type ?? "", artifact.usage ?? "", flattenSemanticValue(artifact.content));
  }
  return parts.join("\n");
}

export function detectPairedSurfaceClaimConflicts(agentText, humanText) {
  const agentClaims = indexClaims(extractClaims(agentText, "agent"));
  const humanClaims = indexClaims(extractClaims(humanText, "human"));
  const conflicts = [];
  const seen = new Set();

  for (const [key, humanClaim] of humanClaims) {
    const agentClaim = agentClaims.get(key);
    if (!agentClaim) {
      continue;
    }

    if (hasEquivalentValues(agentClaim.values, humanClaim.values)) {
      continue;
    }

    const signature = `${humanClaim.family}|${key}`;
    if (seen.has(signature)) {
      continue;
    }
    seen.add(signature);
    conflicts.push({
      family: humanClaim.family,
      key,
      agentValues: [...agentClaim.values].sort(),
      humanValues: [...humanClaim.values].sort(),
      agentSentence: agentClaim.sentences[0] ?? "",
      humanSentence: humanClaim.sentences[0] ?? ""
    });
  }

  return conflicts;
}

function extractClaims(text, source) {
  const claims = [];
  for (const sentence of splitIntoSentences(text)) {
    const claim =
      extractRangeClaim(sentence, source) ??
      extractRequirementListClaim(sentence, source) ??
      extractPreconditionRequirementClaim(sentence, source) ??
      extractPreconditionBypassClaim(sentence, source) ??
      extractTimedActionClaim(sentence, source) ??
      extractStateTransitionClaim(sentence, source) ??
      extractApiClaim(sentence, source);
    if (claim) {
      claims.push(claim);
    }
  }
  return claims;
}

function indexClaims(claims) {
  const indexed = new Map();
  for (const claim of claims) {
    const current = indexed.get(claim.key);
    if (!current) {
      indexed.set(claim.key, {
        family: claim.family,
        values: new Set([claim.value]),
        sentences: [claim.sentence],
        source: claim.source
      });
      continue;
    }
    current.values.add(claim.value);
    if (!current.sentences.includes(claim.sentence)) {
      current.sentences.push(claim.sentence);
    }
  }
  return indexed;
}

function hasEquivalentValues(left, right) {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
}

function splitIntoSentences(text) {
  return normalizeHumanText(text)
    .split(SENTENCE_SPLIT_REGEX)
    .map((sentence) => sentence.trim())
    .map((sentence) => sentence.replace(/^[*-]\s+/, ""))
    .filter((sentence) => sentence.length >= 16);
}

function normalizeHumanText(text) {
  return String(text ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .split("\n")
    .filter((line) => !/^\s*\|.*\|\s*$/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, ""))
    .join("\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRangeClaim(sentence, source) {
  const match = sentence.match(/^(.+?)\s+reduces\s+(.+?)\s+from\s+(.+?)\s+to\s+(.+?)\.?$/i);
  if (!match) {
    return null;
  }
  const [, subject, metric, fromValue, toValue] = match;
  return {
    family: "range",
    key: `range|${normalizeConcept(subject)}|${normalizeConcept(metric)}`,
    value: `${normalizeConcept(fromValue)}=>${normalizeConcept(toValue)}`,
    sentence,
    source
  };
}

function extractRequirementListClaim(sentence, source) {
  const match = sentence.match(/^(.+?)\s+must\s+include\s+(.+?)\.?$/i);
  if (!match) {
    return null;
  }
  const [, subject, listText] = match;
  const items = canonicalizeList(listText);
  if (items.length === 0) {
    return null;
  }
  return {
    family: "must-include",
    key: `must-include|${normalizeConcept(subject)}`,
    value: items.join("|"),
    sentence,
    source
  };
}

function extractPreconditionRequirementClaim(sentence, source) {
  const match = sentence.match(/^(.+?)\s+require(?:s)?\s+(.+?)\s+before\s+(.+?)\.?$/i);
  if (!match) {
    return null;
  }
  const [, subject, objectText, actionText] = match;
  return {
    family: "precondition",
    key: `precondition|${normalizeConcept(subject)}|${normalizeConcept(actionText)}`,
    value: `require|${normalizeConcept(objectText)}`,
    sentence,
    source
  };
}

function extractPreconditionBypassClaim(sentence, source) {
  const match = sentence.match(/^(.+?)\s+can\s+(.+?)\s+without\s+(.+?)(?:\s+when\s+(.+?))?\.?$/i);
  if (!match) {
    return null;
  }
  const [, subject, actionText, objectText, conditionText = ""] = match;
  return {
    family: "precondition",
    key: `precondition|${normalizeConcept(subject)}|${normalizeConcept(actionText)}`,
    value: `without|${normalizeConcept(objectText)}|${normalizeConcept(conditionText)}`,
    sentence,
    source
  };
}

function extractTimedActionClaim(sentence, source) {
  const match = sentence.match(/^(.+?)\s+(pages?|reaches?|arrives?|expires?)\s+(.+?)\s+(within|after)\s+(.+?)\.?$/i);
  if (!match) {
    return null;
  }
  const [, subject, verb, targetText, timingMode, timingText] = match;
  return {
    family: "timed-action",
    key: `timed-action|${normalizeConcept(subject)}|${normalizeConcept(verb)}`,
    value: `${normalizeConcept(targetText)}|${normalizeConcept(timingMode)}|${normalizeConcept(timingText)}`,
    sentence,
    source
  };
}

function extractStateTransitionClaim(sentence, source) {
  const match = sentence.match(/^(.+?)\s+enter(?:s)?\s+([a-z0-9_-]+)\s+state\.?$/i);
  if (!match) {
    return null;
  }
  const [, subject, state] = match;
  return {
    family: "state-transition",
    key: `state-transition|${normalizeConcept(subject)}`,
    value: normalizeConcept(state),
    sentence,
    source
  };
}

function extractApiClaim(sentence, source) {
  const match = sentence.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)\s+(.+?)\.?$/i);
  if (!match) {
    return null;
  }
  const [, method, routePath, effectText] = match;
  return {
    family: "api-contract",
    key: `api-contract|${method.toUpperCase()}|${normalizeConcept(routePath)}`,
    value: normalizeConcept(effectText),
    sentence,
    source
  };
}

function canonicalizeList(text) {
  return Array.from(
    new Set(
      String(text ?? "")
        .replace(/\s+and\s+/gi, ", ")
        .split(",")
        .map((item) => normalizeConcept(item))
        .filter(Boolean)
    )
  ).sort();
}

function normalizeConcept(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\b(every|each|the|a|an)\b/g, " ")
    .replace(/[^a-z0-9/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function flattenSemanticValue(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => flattenSemanticValue(item)).filter(Boolean).join(" ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .flatMap(([key, item]) => [key, flattenSemanticValue(item)])
      .filter(Boolean)
      .join(" ");
  }
  return "";
}
