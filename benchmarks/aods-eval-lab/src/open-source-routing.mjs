import fs from "node:fs";
import path from "node:path";

import { loadOpenSourceScenarioCatalog } from "./catalog-open-source-corpora.mjs";
import { measureText, median } from "./helpers.mjs";

const TEXT_EXTENSIONS = new Set([".md", ".mdx", ".rst", ".txt"]);

export function evaluateOpenSourceRouting(catalog = loadOpenSourceScenarioCatalog()) {
  const corpusIndexes = new Map(
    (catalog.corpora ?? []).map((corpus) => [corpus.id, buildCorpusIndex(corpus.output_root)])
  );
  const baselineResults = (catalog.corpora ?? []).flatMap((corpus) =>
    (corpus.scenarios ?? []).map((scenario) =>
      runScenario(corpus, scenario, corpusIndexes.get(corpus.id) ?? [], "baseline")
    )
  );
  const seedTitleRerankResults = (catalog.corpora ?? []).flatMap((corpus) =>
    (corpus.scenarios ?? []).map((scenario) =>
      runScenario(corpus, scenario, corpusIndexes.get(corpus.id) ?? [], "seed-title-rerank")
    )
  );
  const structureAwareRerankResults = (catalog.corpora ?? []).flatMap((corpus) =>
    (corpus.scenarios ?? []).map((scenario) =>
      runScenario(corpus, scenario, corpusIndexes.get(corpus.id) ?? [], "structure-aware-rerank")
    )
  );
  const pathFamilyRerankResults = (catalog.corpora ?? []).flatMap((corpus) =>
    (corpus.scenarios ?? []).map((scenario) =>
      runScenario(corpus, scenario, corpusIndexes.get(corpus.id) ?? [], "path-family-rerank")
    )
  );
  const apiSurfaceRerankResults = (catalog.corpora ?? []).flatMap((corpus) =>
    (corpus.scenarios ?? []).map((scenario) =>
      runScenario(corpus, scenario, corpusIndexes.get(corpus.id) ?? [], "api-surface-rerank")
    )
  );

  if (baselineResults.length === 0) {
    return {
      corpus_count: 0,
      scenario_count: 0,
      top_1_hit_rate: 0,
      top_3_hit_rate: 0,
      mean_reciprocal_rank: 0,
      zero_hit_rate: 0,
      median_candidate_file_count: 0,
      mean_target_term_coverage: 0,
      median_top_1_bytes: 0,
      median_top_1_tokens_estimated: 0,
      scenario_results: [],
      seed_title_rerank: {
        top_1_hit_rate: 0,
        top_3_hit_rate: 0,
        mean_reciprocal_rank: 0,
        zero_hit_rate: 0,
        median_candidate_file_count: 0,
        mean_target_term_coverage: 0,
        median_top_1_bytes: 0,
        median_top_1_tokens_estimated: 0,
        scenario_results: []
      },
      structure_aware_rerank: {
        top_1_hit_rate: 0,
        top_3_hit_rate: 0,
        mean_reciprocal_rank: 0,
        zero_hit_rate: 0,
        median_candidate_file_count: 0,
        mean_target_term_coverage: 0,
        median_top_1_bytes: 0,
        median_top_1_tokens_estimated: 0,
        scenario_results: []
      },
      path_family_rerank: {
        top_1_hit_rate: 0,
        top_3_hit_rate: 0,
        mean_reciprocal_rank: 0,
        zero_hit_rate: 0,
        median_candidate_file_count: 0,
        mean_target_term_coverage: 0,
        median_top_1_bytes: 0,
        median_top_1_tokens_estimated: 0,
        scenario_results: []
      },
      api_surface_rerank: {
        top_1_hit_rate: 0,
        top_3_hit_rate: 0,
        mean_reciprocal_rank: 0,
        zero_hit_rate: 0,
        median_candidate_file_count: 0,
        mean_target_term_coverage: 0,
        median_top_1_bytes: 0,
        median_top_1_tokens_estimated: 0,
        scenario_results: []
      },
      improvement: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      structure_aware_improvement: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      structure_aware_delta_vs_seed_title: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      path_family_improvement: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      path_family_delta_vs_structure_aware: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      api_surface_improvement: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      api_surface_delta_vs_path_family: {
        top_1_hit_rate_delta: 0,
        top_3_hit_rate_delta: 0,
        mean_reciprocal_rank_delta: 0,
        promoted_to_top_1_count: 0,
        worsened_top_3_count: 0
      },
      section_context: {
        scenario_count: 0,
        file_top_1_hit_rate: 0,
        section_hit_rate: 0,
        section_hit_given_correct_file_rate: 0,
        zero_selected_section_rate: 0,
        median_selected_section_bytes: 0,
        median_selected_section_tokens_estimated: 0,
        median_context_reduction_vs_top_file: 0,
        scenario_results: []
      },
      section_evidence_pack: {
        scenario_count: 0,
        file_top_1_hit_rate: 0,
        full_file_evidence_retention_rate: 0,
        mean_selected_term_coverage: 0,
        mean_file_term_coverage: 0,
        mean_pack_term_recall_vs_top_file: 0,
        zero_selected_pack_rate: 0,
        median_selected_pack_section_count: 0,
        median_selected_pack_bytes: 0,
        median_selected_pack_tokens_estimated: 0,
        median_context_reduction_vs_top_file: 0,
        scenario_results: []
      },
      scenario_evidence_bundle: {
        scenario_count: 0,
        file_top_1_hit_rate: 0,
        full_scenario_term_coverage_rate: 0,
        mean_top_file_term_coverage: 0,
        mean_bundle_term_coverage: 0,
        mean_bundle_term_gain_vs_top_file: 0,
        zero_selected_bundle_rate: 0,
        median_selected_bundle_file_count: 0,
        median_selected_bundle_bytes: 0,
        median_selected_bundle_tokens_estimated: 0,
        median_context_growth_vs_top_file: 0,
        scenario_results: []
      },
      scenario_cost_aware_bundle: {
        scenario_count: 0,
        file_top_1_hit_rate: 0,
        full_scenario_term_coverage_rate: 0,
        mean_top_file_term_coverage: 0,
        mean_bundle_term_coverage: 0,
        mean_bundle_term_gain_vs_top_file: 0,
        zero_selected_bundle_rate: 0,
        median_selected_bundle_file_count: 0,
        median_selected_bundle_bytes: 0,
        median_selected_bundle_tokens_estimated: 0,
        median_context_growth_vs_top_file: 0,
        scenario_results: []
      },
      scenario_cost_aware_bundle_delta_vs_rank: {
        full_scenario_term_coverage_rate_delta: 0,
        mean_bundle_term_coverage_delta: 0,
        median_selected_bundle_bytes_delta: 0,
        median_context_growth_vs_top_file_delta: 0,
        improved_coverage_count: 0,
        worsened_coverage_count: 0,
        reduced_bytes_count: 0
      },
      scenario_term_reachability: {
        scenario_count: 0,
        full_reachable_term_coverage_rate: 0,
        mean_reachable_term_coverage: 0,
        scenarios_with_unreachable_terms_rate: 0,
        mean_unreachable_term_share: 0,
        median_unreachable_term_count: 0,
        exact_gap_explained_by_unreachable_terms_rate: 0,
        scenario_results: []
      },
      scenario_claim_support: {
        scenario_count: 0,
        full_claim_support_rate: 0,
        mean_claim_support_coverage: 0,
        mean_claim_support_gain_vs_exact: 0,
        exact_gap_recovered_rate: 0,
        scenarios_with_alias_groups_rate: 0,
        scenario_results: []
      },
      scenario_claim_support_pack: {
        scenario_count: 0,
        full_bundle_claim_support_preservation_rate: 0,
        full_claim_support_rate: 0,
        mean_claim_support_coverage: 0,
        mean_pack_claim_support_recall_vs_bundle: 0,
        exact_gap_recovered_rate: 0,
        zero_selected_pack_rate: 0,
        median_selected_pack_section_count: 0,
        median_selected_pack_file_count: 0,
        median_selected_pack_bytes: 0,
        median_selected_pack_tokens_estimated: 0,
        median_context_reduction_vs_bundle: 0,
        scenario_results: []
      },
      scenario_answer_check: {
        scenario_count: 0,
        full_answer_check_rate: 0,
        mean_answer_check_coverage: 0,
        mean_answer_check_gain_vs_claim_support: 0,
        claim_gap_recovered_rate: 0,
        exact_gap_recovered_rate: 0,
        scenarios_with_explicit_answer_checks_rate: 0,
        scenario_results: []
      },
      scenario_answer_locality: {
        scenario_count: 0,
        full_target_local_answer_check_rate: 0,
        mean_target_local_answer_check_coverage: 0,
        mean_cross_file_answer_check_gain: 0,
        cross_file_answer_recovery_rate: 0,
        scenarios_requiring_cross_file_evidence_rate: 0,
        scenarios_with_explicit_answer_checks_rate: 0,
        scenario_results: []
      },
      scenario_answer_authority: {
        scenario_count: 0,
        scoped_scenario_count: 0,
        full_authority_scoped_answer_check_rate: 0,
        mean_authority_scoped_answer_check_coverage: 0,
        mean_out_of_scope_answer_check_gain: 0,
        out_of_scope_answer_recovery_rate: 0,
        scenarios_requiring_out_of_scope_evidence_rate: 0,
        scenarios_with_explicit_answer_authority_rate: 0,
        scenario_results: []
      },
      scenario_answer_authority_reachability: {
        scenario_count: 0,
        scoped_scenario_count: 0,
        full_authority_reachable_answer_check_rate: 0,
        mean_authority_reachable_answer_check_coverage: 0,
        mean_authority_reachable_gain_vs_scoped_pack: 0,
        authority_gap_explained_by_reachability_rate: 0,
        scenarios_with_missing_authority_answer_support_rate: 0,
        scenario_results: []
      },
      scenario_answer_authority_pack: {
        scenario_count: 0,
        scoped_scenario_count: 0,
        full_authority_pack_answer_check_rate: 0,
        mean_authority_pack_answer_check_coverage: 0,
        mean_authority_pack_gain_vs_scoped_pack: 0,
        full_authority_reachable_answer_preservation_rate: 0,
        mean_authority_pack_recall_vs_reachable: 0,
        zero_selected_pack_rate: 0,
        median_selected_pack_section_count: 0,
        median_selected_pack_file_count: 0,
        median_selected_pack_bytes: 0,
        median_selected_pack_tokens_estimated: 0,
        median_context_reduction_vs_authority_scope: 0,
        scenario_results: []
      },
      scenario_answer_authority_local_family: {
        scenario_count: 0,
        strict_file_scope_scenario_count: 0,
        full_local_family_answer_check_rate: 0,
        mean_local_family_answer_check_coverage: 0,
        mean_local_family_gain_vs_authority_scope: 0,
        authority_gap_explained_by_local_family_rate: 0,
        scenarios_with_missing_local_family_answer_support_rate: 0,
        scenario_results: []
      },
      scenario_answer_authority_local_family_pack: {
        scenario_count: 0,
        strict_file_scope_scenario_count: 0,
        full_local_family_pack_answer_check_rate: 0,
        mean_local_family_pack_answer_check_coverage: 0,
        mean_local_family_pack_gain_vs_authority_scope: 0,
        full_local_family_support_preservation_rate: 0,
        mean_local_family_pack_recall_vs_supported: 0,
        zero_selected_pack_rate: 0,
        median_selected_pack_section_count: 0,
        median_selected_pack_file_count: 0,
        median_selected_pack_bytes: 0,
        median_selected_pack_tokens_estimated: 0,
        median_context_reduction_vs_local_family_scope: 0,
        scenario_results: []
      }
    };
  }

  const baselineSummary = summarizeScenarioResults(catalog.corpora.length, baselineResults);
  const rerankSummary = summarizeScenarioResults(catalog.corpora.length, seedTitleRerankResults);
  const structureAwareSummary = summarizeScenarioResults(catalog.corpora.length, structureAwareRerankResults);
  const pathFamilySummary = summarizeScenarioResults(catalog.corpora.length, pathFamilyRerankResults);
  const apiSurfaceSummary = summarizeScenarioResults(catalog.corpora.length, apiSurfaceRerankResults);
  const sectionContextSummary = summarizeSectionContext(
    apiSurfaceRerankResults,
    corpusIndexes,
    (catalog.corpora ?? []).map((corpus) => [corpus.id, corpus.label])
  );
  const sectionEvidencePackSummary = summarizeSectionEvidencePack(
    apiSurfaceRerankResults,
    corpusIndexes,
    (catalog.corpora ?? []).map((corpus) => [corpus.id, corpus.label])
  );
  const scenarioEvidenceBundleSummary = summarizeScenarioEvidenceBundle(
    apiSurfaceRerankResults,
    corpusIndexes,
    (catalog.corpora ?? []).map((corpus) => [corpus.id, corpus.label])
  );
  const scenarioCostAwareBundleSummary = summarizeScenarioCostAwareBundle(
    apiSurfaceRerankResults,
    corpusIndexes,
    (catalog.corpora ?? []).map((corpus) => [corpus.id, corpus.label])
  );
  const scenarioTermReachabilitySummary = summarizeScenarioTermReachability(
    scenarioCostAwareBundleSummary,
    corpusIndexes
  );
  const scenarioClaimSupportSummary = summarizeScenarioClaimSupport(
    scenarioCostAwareBundleSummary,
    corpusIndexes
  );
  const scenarioClaimSupportPackSummary = summarizeScenarioClaimSupportPack(
    scenarioCostAwareBundleSummary,
    corpusIndexes,
    (catalog.corpora ?? []).map((corpus) => [corpus.id, corpus.label])
  );
  const scenarioAnswerCheckSummary = summarizeScenarioAnswerCheck(
    scenarioClaimSupportPackSummary,
    corpusIndexes
  );
  const scenarioAnswerLocalitySummary = summarizeScenarioAnswerLocality(
    scenarioClaimSupportPackSummary,
    corpusIndexes
  );
  const scenarioAnswerAuthoritySummary = summarizeScenarioAnswerAuthority(
    scenarioClaimSupportPackSummary,
    corpusIndexes
  );
  const scenarioAnswerAuthorityReachabilitySummary = summarizeScenarioAnswerAuthorityReachability(
    scenarioClaimSupportPackSummary,
    scenarioAnswerAuthoritySummary,
    corpusIndexes
  );
  const scenarioAnswerAuthorityPackSummary = summarizeScenarioAnswerAuthorityPack(
    scenarioClaimSupportPackSummary,
    scenarioAnswerAuthoritySummary,
    scenarioAnswerAuthorityReachabilitySummary,
    corpusIndexes
  );
  const scenarioAnswerAuthorityLocalFamilySummary = summarizeScenarioAnswerAuthorityLocalFamily(
    scenarioClaimSupportPackSummary,
    scenarioAnswerAuthoritySummary,
    corpusIndexes
  );
  const scenarioAnswerAuthorityLocalFamilyPackSummary = summarizeScenarioAnswerAuthorityLocalFamilyPack(
    scenarioClaimSupportPackSummary,
    scenarioAnswerAuthorityLocalFamilySummary,
    corpusIndexes
  );
  return {
    ...baselineSummary,
    seed_title_rerank: rerankSummary,
    structure_aware_rerank: structureAwareSummary,
    path_family_rerank: pathFamilySummary,
    api_surface_rerank: apiSurfaceSummary,
    improvement: summarizeImprovement(baselineResults, seedTitleRerankResults),
    structure_aware_improvement: summarizeImprovement(baselineResults, structureAwareRerankResults),
    structure_aware_delta_vs_seed_title: summarizeImprovement(seedTitleRerankResults, structureAwareRerankResults),
    path_family_improvement: summarizeImprovement(baselineResults, pathFamilyRerankResults),
    path_family_delta_vs_structure_aware: summarizeImprovement(structureAwareRerankResults, pathFamilyRerankResults),
    api_surface_improvement: summarizeImprovement(baselineResults, apiSurfaceRerankResults),
    api_surface_delta_vs_path_family: summarizeImprovement(pathFamilyRerankResults, apiSurfaceRerankResults),
    section_context: sectionContextSummary,
    section_evidence_pack: sectionEvidencePackSummary,
    scenario_evidence_bundle: scenarioEvidenceBundleSummary,
    scenario_cost_aware_bundle: scenarioCostAwareBundleSummary,
    scenario_cost_aware_bundle_delta_vs_rank: summarizeScenarioBundleDelta(
      scenarioEvidenceBundleSummary,
      scenarioCostAwareBundleSummary
    ),
    scenario_term_reachability: scenarioTermReachabilitySummary,
    scenario_claim_support: scenarioClaimSupportSummary,
    scenario_claim_support_pack: scenarioClaimSupportPackSummary,
    scenario_answer_check: scenarioAnswerCheckSummary,
    scenario_answer_locality: scenarioAnswerLocalitySummary,
    scenario_answer_authority: scenarioAnswerAuthoritySummary,
    scenario_answer_authority_reachability: scenarioAnswerAuthorityReachabilitySummary,
    scenario_answer_authority_pack: scenarioAnswerAuthorityPackSummary,
    scenario_answer_authority_local_family: scenarioAnswerAuthorityLocalFamilySummary,
    scenario_answer_authority_local_family_pack: scenarioAnswerAuthorityLocalFamilyPackSummary
  };
}

function runScenario(corpus, scenario, corpusIndex, profile) {
  const grepTerms = (scenario.grep_terms ?? []).map((term) => term.toLowerCase());
  const title = scenario.title ?? "";
  const rankedCandidates = corpusIndex
    .map((file) => {
      const score = scoreFile(file, grepTerms, title, corpusIndex, profile);
      return {
        path: file.path,
        byte_count: file.byte_count,
        tokens_estimated: file.tokens_estimated,
        matched_term_count: score.matched_term_count,
        total_term_hits: score.total_term_hits,
        title_exact_heading: score.title_exact_heading,
        title_token_overlap: score.title_token_overlap,
        basename_token_overlap: score.basename_token_overlap,
        basename_exact_title: score.basename_exact_title,
        compact_basename_exact: score.compact_basename_exact,
        compact_path_contains_title: score.compact_path_contains_title,
        path_has_api_segment: score.path_has_api_segment,
        api_surface_marker_score: score.api_surface_marker_score,
        query_api_surface_signal: score.query_api_surface_signal,
        path_sequence_overlap: score.path_sequence_overlap,
        path_token_overlap: score.path_token_overlap,
        weighted_term_score: score.weighted_term_score
      };
    })
    .filter((file) => file.matched_term_count > 0)
    .sort((left, right) => compareCandidates(left, right, profile));

  const targetPath = normalizeRelativePath(scenario.path);
  const targetFile = corpusIndex.find((file) => file.path === targetPath);
  if (!targetFile) {
    throw new Error(`Open-source routing target file missing from corpus index: ${corpus.id}/${scenario.path}`);
  }
  const targetScore = scoreFile(targetFile, grepTerms, title, corpusIndex, profile);
  const targetRank = rankedCandidates.findIndex((candidate) => candidate.path === targetPath);

  return {
    id: scenario.id,
    corpus_id: corpus.id,
    corpus_label: corpus.label,
    title: scenario.title,
    scenario_class: scenario.scenario_class,
    profile,
    target_path: targetPath,
    grep_terms: scenario.grep_terms ?? [],
    answer_support: scenario.answer_support ?? [],
    answer_checks: scenario.answer_checks ?? [],
    answer_authority: scenario.answer_authority ?? null,
    candidate_file_count: rankedCandidates.length,
    target_rank: targetRank === -1 ? null : targetRank + 1,
    reciprocal_rank: targetRank === -1 ? 0 : 1 / (targetRank + 1),
    target_term_coverage: grepTerms.length === 0 ? 0 : targetScore.matched_term_count / grepTerms.length,
    top_1_hit: targetRank === 0,
    top_3_hit: targetRank !== -1 && targetRank < 3,
    top_candidates: rankedCandidates.slice(0, 3)
  };
}

function buildCorpusIndex(corpusRoot) {
  return listDocFiles(corpusRoot).map((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const measured = measureText(content);
    const heading = extractHeading(content);
    const relativePath = normalizeRelativePath(path.relative(corpusRoot, filePath));
    return {
      path: relativePath,
      normalized_path: normalizeText(relativePath),
      compact_path: compactText(normalizeText(relativePath)),
      path_has_api_segment: tokenize(normalizeText(relativePath)).includes("api") ? 1 : 0,
      content_lower: content.toLowerCase(),
      normalized_content: normalizeText(content),
      heading_lower: heading.toLowerCase(),
      normalized_heading: normalizeText(heading),
      basename_lower: path.basename(filePath).toLowerCase(),
      normalized_basename: normalizeText(path.basename(filePath, path.extname(filePath))),
      compact_basename: compactText(normalizeText(path.basename(filePath, path.extname(filePath)))),
      api_surface_marker_score: countApiSurfaceMarkers(content.toLowerCase()),
      byte_count: measured.bytes,
      tokens_estimated: measured.tokens_estimated,
      sections: extractSections(relativePath, content, heading || path.basename(filePath, path.extname(filePath)))
    };
  });
}

function listDocFiles(rootDir) {
  const files = [];

  function walk(dirPath) {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.name === ".git") {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return files;
}

function scoreFile(file, grepTerms, title, corpusIndex, profile) {
  let matchedTermCount = 0;
  let totalTermHits = 0;
  let weightedTermScore = 0;

  const normalizedTitle = normalizeText(title);
  const compactTitle = compactText(normalizedTitle);
  const titleTokens = tokenize(normalizedTitle);
  const queryApiSurfaceSignal = detectApiSurfaceQuerySignal(normalizedTitle, grepTerms);
  const titleExactHeading = normalizedTitle !== "" && file.normalized_heading === normalizedTitle ? 1 : 0;
  const titleTokenOverlap = overlapRatio(titleTokens, tokenize(file.normalized_heading));
  const basenameTokenOverlap = overlapRatio(titleTokens, tokenize(file.normalized_basename));
  const basenameExactTitle = normalizedTitle !== "" && file.normalized_basename === normalizedTitle ? 1 : 0;
  const compactBasenameExact = compactTitle !== "" && file.compact_basename === compactTitle ? 1 : 0;
  const compactPathContainsTitle = compactTitle !== "" && file.compact_path.includes(compactTitle) ? 1 : 0;
  const pathTokens = tokenize(file.normalized_path);
  const pathTokenOverlap = overlapRatio(titleTokens, pathTokens);
  const pathSequenceOverlap = contiguousSequenceOverlapRatio(titleTokens, pathTokens);

  for (const term of grepTerms) {
    const hits = countOccurrences(file.content_lower, term);
    if (hits > 0) {
      matchedTermCount += 1;
      totalTermHits += hits;
      const documentFrequency = countTermDocuments(term, corpusIndex);
      const corpusSize = corpusIndex.length;
      const inverseDocumentFrequency = Math.log((corpusSize + 1) / (documentFrequency + 1)) + 1;
      weightedTermScore += inverseDocumentFrequency * Math.min(hits, 3);
    }
  }

  return {
    matched_term_count: matchedTermCount,
    total_term_hits: totalTermHits,
    title_exact_heading: titleExactHeading,
    title_token_overlap: titleTokenOverlap,
    basename_token_overlap: basenameTokenOverlap,
    basename_exact_title: basenameExactTitle,
    compact_basename_exact: compactBasenameExact,
    compact_path_contains_title: compactPathContainsTitle,
    path_has_api_segment: file.path_has_api_segment,
    api_surface_marker_score: file.api_surface_marker_score,
    query_api_surface_signal: queryApiSurfaceSignal,
    path_sequence_overlap: pathSequenceOverlap,
    path_token_overlap: pathTokenOverlap,
    weighted_term_score: weightedTermScore
  };
}

function countOccurrences(content, search) {
  if (!search) {
    return 0;
  }
  return content.split(search).length - 1;
}

function collectMatchedTerms(contentLower, grepTerms) {
  return new Set(grepTerms.filter((term) => countOccurrences(contentLower, term) > 0));
}

function countApiSurfaceMarkers(contentLower) {
  return (
    countOccurrences(contentLower, ".. automodule::") * 2 +
    countOccurrences(contentLower, ".. autoconfigurable::") * 2 +
    countOccurrences(contentLower, "## module:")
  );
}

function detectApiSurfaceQuerySignal(normalizedTitle, grepTerms) {
  const combined = [normalizedTitle, ...grepTerms].filter(Boolean);
  const tokens = new Set(combined.flatMap((term) => tokenize(term)));
  return (
    combined.some(
      (term) =>
        term.includes("autoconfigurable") || term.includes("automodule") || term.includes(".") || term.includes("_")
    ) ||
    tokens.has("module") ||
    (tokens.has("api") && tokens.has("reference"))
  )
    ? 1
    : 0;
}

function normalizeRelativePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function summarizeScenarioResults(corpusCount, scenarioResults) {
  return {
    corpus_count: corpusCount,
    scenario_count: scenarioResults.length,
    top_1_hit_rate: scenarioResults.filter((scenario) => scenario.top_1_hit).length / scenarioResults.length,
    top_3_hit_rate: scenarioResults.filter((scenario) => scenario.top_3_hit).length / scenarioResults.length,
    mean_reciprocal_rank:
      scenarioResults.reduce((sum, scenario) => sum + scenario.reciprocal_rank, 0) / scenarioResults.length,
    zero_hit_rate: scenarioResults.filter((scenario) => scenario.candidate_file_count === 0).length / scenarioResults.length,
    median_candidate_file_count: median(scenarioResults.map((scenario) => scenario.candidate_file_count)),
    mean_target_term_coverage:
      scenarioResults.reduce((sum, scenario) => sum + scenario.target_term_coverage, 0) / scenarioResults.length,
    median_top_1_bytes: median(scenarioResults.map((scenario) => scenario.top_candidates[0]?.byte_count ?? 0)),
    median_top_1_tokens_estimated: median(
      scenarioResults.map((scenario) => scenario.top_candidates[0]?.tokens_estimated ?? 0)
    ),
    scenario_results: scenarioResults
  };
}

function summarizeImprovement(baselineResults, rerankedResults) {
  const rerankedById = new Map(rerankedResults.map((scenario) => [scenario.id, scenario]));
  return {
    top_1_hit_rate_delta:
      rerankedResults.filter((scenario) => scenario.top_1_hit).length / rerankedResults.length -
      baselineResults.filter((scenario) => scenario.top_1_hit).length / baselineResults.length,
    top_3_hit_rate_delta:
      rerankedResults.filter((scenario) => scenario.top_3_hit).length / rerankedResults.length -
      baselineResults.filter((scenario) => scenario.top_3_hit).length / baselineResults.length,
    mean_reciprocal_rank_delta:
      rerankedResults.reduce((sum, scenario) => sum + scenario.reciprocal_rank, 0) / rerankedResults.length -
      baselineResults.reduce((sum, scenario) => sum + scenario.reciprocal_rank, 0) / baselineResults.length,
    promoted_to_top_1_count: baselineResults.filter((scenario) => {
      const reranked = rerankedById.get(scenario.id);
      return !scenario.top_1_hit && reranked?.top_1_hit;
    }).length,
    worsened_top_3_count: baselineResults.filter((scenario) => {
      const reranked = rerankedById.get(scenario.id);
      return scenario.top_3_hit && reranked && !reranked.top_3_hit;
    }).length
  };
}

function summarizeSectionContext(rerankedResults, corpusIndexes, corpusLabels) {
  const corpusLabelMap = new Map(corpusLabels);
  const scenarioResults = rerankedResults.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const targetFile = corpusIndex.find((file) => file.path === scenario.target_path);
    if (!targetFile) {
      throw new Error(`Open-source section context target file missing: ${scenario.corpus_id}/${scenario.target_path}`);
    }

    const title = scenario.title ?? "";
    const grepTerms = (scenario.grep_terms ?? []).map((term) => term.toLowerCase());
    const targetSection = selectBestSection(targetFile.sections, title, grepTerms);
    const selectedFile = scenario.top_candidates[0]
      ? corpusIndex.find((file) => file.path === scenario.top_candidates[0].path) ?? null
      : null;
    const selectedSection = selectedFile ? selectBestSection(selectedFile.sections, title, grepTerms) : null;
    const selectedSections = selectedFile ? rankSections(selectedFile.sections, title, grepTerms) : [];
    const targetSectionRankWithinSelectedFile =
      selectedFile && selectedFile.path === targetFile.path
        ? selectedSections.findIndex((section) => section.id === targetSection?.id) + 1 || null
        : null;

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: corpusLabelMap.get(scenario.corpus_id) ?? scenario.corpus_label,
      target_path: scenario.target_path,
      title,
      file_top_1_hit: scenario.top_1_hit,
      selected_file_path: selectedFile?.path ?? null,
      target_section_id: targetSection?.id ?? null,
      target_section_heading: targetSection?.heading ?? null,
      selected_section_id: selectedSection?.id ?? null,
      selected_section_heading: selectedSection?.heading ?? null,
      selected_section_bytes: selectedSection?.byte_count ?? 0,
      selected_section_tokens_estimated: selectedSection?.tokens_estimated ?? 0,
      context_reduction_vs_top_file:
        selectedFile && selectedSection ? 1 - selectedSection.byte_count / selectedFile.byte_count : 0,
      section_match:
        selectedFile?.path === targetFile.path && selectedSection?.id != null && selectedSection.id === targetSection?.id,
      target_section_rank_within_selected_file: targetSectionRankWithinSelectedFile
    };
  });

  const correctFileCases = scenarioResults.filter((scenario) => scenario.file_top_1_hit);
  return {
    scenario_count: scenarioResults.length,
    file_top_1_hit_rate:
      scenarioResults.length === 0 ? 0 : correctFileCases.length / scenarioResults.length,
    section_hit_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.section_match).length / scenarioResults.length,
    section_hit_given_correct_file_rate:
      correctFileCases.length === 0
        ? 1
        : correctFileCases.filter((scenario) => scenario.section_match).length / correctFileCases.length,
    zero_selected_section_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.selected_section_id == null).length / scenarioResults.length,
    median_selected_section_bytes: median(scenarioResults.map((scenario) => scenario.selected_section_bytes)),
    median_selected_section_tokens_estimated: median(
      scenarioResults.map((scenario) => scenario.selected_section_tokens_estimated)
    ),
    median_context_reduction_vs_top_file: median(
      scenarioResults.map((scenario) => scenario.context_reduction_vs_top_file)
    ),
    scenario_results: scenarioResults
  };
}

function summarizeSectionEvidencePack(rerankedResults, corpusIndexes, corpusLabels) {
  const corpusLabelMap = new Map(corpusLabels);
  const scenarioResults = rerankedResults.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const targetFile = corpusIndex.find((file) => file.path === scenario.target_path);
    if (!targetFile) {
      throw new Error(`Open-source section evidence target file missing: ${scenario.corpus_id}/${scenario.target_path}`);
    }

    const title = scenario.title ?? "";
    const grepTerms = (scenario.grep_terms ?? []).map((term) => term.toLowerCase());
    const selectedFile = scenario.top_candidates[0]
      ? corpusIndex.find((file) => file.path === scenario.top_candidates[0].path) ?? null
      : null;
    const selectedPack = selectedFile ? selectSectionEvidencePack(selectedFile.sections, title, grepTerms) : [];
    const selectedFileMatchedTerms = selectedFile ? collectMatchedTerms(selectedFile.content_lower, grepTerms) : new Set();
    const selectedPackMatchedTerms = new Set(
      selectedPack.flatMap((section) => Array.from(collectMatchedTerms(section.content_lower, grepTerms)))
    );
    const selectedPackBytes = selectedPack.reduce((sum, section) => sum + section.byte_count, 0);
    const selectedPackTokensEstimated = selectedPack.reduce((sum, section) => sum + section.tokens_estimated, 0);

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: corpusLabelMap.get(scenario.corpus_id) ?? scenario.corpus_label,
      target_path: scenario.target_path,
      title,
      file_top_1_hit: scenario.top_1_hit,
      selected_file_path: selectedFile?.path ?? null,
      selected_section_ids: selectedPack.map((section) => section.id),
      selected_section_headings: selectedPack.map((section) => section.heading),
      selected_section_count: selectedPack.length,
      selected_pack_bytes: selectedPackBytes,
      selected_pack_tokens_estimated: selectedPackTokensEstimated,
      selected_term_coverage:
        grepTerms.length === 0 ? 1 : selectedPackMatchedTerms.size / grepTerms.length,
      file_term_coverage:
        grepTerms.length === 0 ? 1 : selectedFileMatchedTerms.size / grepTerms.length,
      pack_term_recall_vs_top_file:
        selectedFileMatchedTerms.size === 0 ? 1 : selectedPackMatchedTerms.size / selectedFileMatchedTerms.size,
      context_reduction_vs_top_file:
        selectedFile && selectedPackBytes > 0 ? 1 - selectedPackBytes / selectedFile.byte_count : 0,
      pack_covers_file_evidence: selectedPackMatchedTerms.size === selectedFileMatchedTerms.size
    };
  });

  const correctFileCases = scenarioResults.filter((scenario) => scenario.file_top_1_hit);
  return {
    scenario_count: scenarioResults.length,
    file_top_1_hit_rate:
      scenarioResults.length === 0 ? 0 : correctFileCases.length / scenarioResults.length,
    full_file_evidence_retention_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.pack_covers_file_evidence).length / scenarioResults.length,
    mean_selected_term_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.selected_term_coverage, 0) / scenarioResults.length,
    mean_file_term_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.file_term_coverage, 0) / scenarioResults.length,
    mean_pack_term_recall_vs_top_file:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.pack_term_recall_vs_top_file, 0) /
          scenarioResults.length,
    zero_selected_pack_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.selected_section_count === 0).length / scenarioResults.length,
    median_selected_pack_section_count: median(scenarioResults.map((scenario) => scenario.selected_section_count)),
    median_selected_pack_bytes: median(scenarioResults.map((scenario) => scenario.selected_pack_bytes)),
    median_selected_pack_tokens_estimated: median(
      scenarioResults.map((scenario) => scenario.selected_pack_tokens_estimated)
    ),
    median_context_reduction_vs_top_file: median(
      scenarioResults.map((scenario) => scenario.context_reduction_vs_top_file)
    ),
    scenario_results: scenarioResults
  };
}

function summarizeScenarioEvidenceBundle(rerankedResults, corpusIndexes, corpusLabels) {
  return summarizeScenarioEvidenceBundleWithSelector(
    rerankedResults,
    corpusIndexes,
    corpusLabels,
    selectScenarioEvidenceBundle
  );
}

function summarizeScenarioCostAwareBundle(rerankedResults, corpusIndexes, corpusLabels) {
  return summarizeScenarioEvidenceBundleWithSelector(
    rerankedResults,
    corpusIndexes,
    corpusLabels,
    selectScenarioEvidenceBundleCostAware
  );
}

function summarizeScenarioEvidenceBundleWithSelector(rerankedResults, corpusIndexes, corpusLabels, selectBundle) {
  const corpusLabelMap = new Map(corpusLabels);
  const scenarioResults = rerankedResults.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const grepTerms = (scenario.grep_terms ?? []).map((term) => term.toLowerCase());
    const candidateFiles = (scenario.top_candidates ?? [])
      .map((candidate) => corpusIndex.find((file) => file.path === candidate.path) ?? null)
      .filter(Boolean);
    const topFile = candidateFiles[0] ?? null;
    const selectedBundle = selectBundle(candidateFiles, grepTerms);
    const topFileMatchedTerms = topFile ? collectMatchedTerms(topFile.content_lower, grepTerms) : new Set();
    const bundleMatchedTerms = new Set(
      selectedBundle.flatMap((file) => Array.from(collectMatchedTerms(file.content_lower, grepTerms)))
    );
    const selectedBundleBytes = selectedBundle.reduce((sum, file) => sum + file.byte_count, 0);
    const selectedBundleTokensEstimated = selectedBundle.reduce((sum, file) => sum + file.tokens_estimated, 0);

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: corpusLabelMap.get(scenario.corpus_id) ?? scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      grep_terms: scenario.grep_terms ?? [],
      answer_support: scenario.answer_support ?? [],
      answer_checks: scenario.answer_checks ?? [],
      answer_authority: scenario.answer_authority ?? null,
      file_top_1_hit: scenario.top_1_hit,
      top_file_path: topFile?.path ?? null,
      selected_file_paths: selectedBundle.map((file) => file.path),
      selected_file_count: selectedBundle.length,
      selected_bundle_bytes: selectedBundleBytes,
      selected_bundle_tokens_estimated: selectedBundleTokensEstimated,
      top_file_term_coverage:
        grepTerms.length === 0 ? 1 : topFileMatchedTerms.size / grepTerms.length,
      bundle_term_coverage:
        grepTerms.length === 0 ? 1 : bundleMatchedTerms.size / grepTerms.length,
      bundle_term_gain_vs_top_file:
        grepTerms.length === 0 ? 0 : (bundleMatchedTerms.size - topFileMatchedTerms.size) / grepTerms.length,
      context_growth_vs_top_file:
        topFile && topFile.byte_count > 0 ? selectedBundleBytes / topFile.byte_count - 1 : 0,
      covers_all_scenario_terms: grepTerms.length === 0 || bundleMatchedTerms.size === grepTerms.length
    };
  });

  const correctFileCases = scenarioResults.filter((scenario) => scenario.file_top_1_hit);
  return {
    scenario_count: scenarioResults.length,
    file_top_1_hit_rate:
      scenarioResults.length === 0 ? 0 : correctFileCases.length / scenarioResults.length,
    full_scenario_term_coverage_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.covers_all_scenario_terms).length / scenarioResults.length,
    mean_top_file_term_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.top_file_term_coverage, 0) / scenarioResults.length,
    mean_bundle_term_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.bundle_term_coverage, 0) / scenarioResults.length,
    mean_bundle_term_gain_vs_top_file:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.bundle_term_gain_vs_top_file, 0) /
          scenarioResults.length,
    zero_selected_bundle_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.selected_file_count === 0).length / scenarioResults.length,
    median_selected_bundle_file_count: median(scenarioResults.map((scenario) => scenario.selected_file_count)),
    median_selected_bundle_bytes: median(scenarioResults.map((scenario) => scenario.selected_bundle_bytes)),
    median_selected_bundle_tokens_estimated: median(
      scenarioResults.map((scenario) => scenario.selected_bundle_tokens_estimated)
    ),
    median_context_growth_vs_top_file: median(
      scenarioResults.map((scenario) => scenario.context_growth_vs_top_file)
    ),
    scenario_results: scenarioResults
  };
}

function summarizeScenarioTermReachability(bundleSummary, corpusIndexes) {
  const scenarioResults = bundleSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const grepTerms = (scenario.grep_terms ?? []).map((term) => term.toLowerCase());
    const reachableTerms = grepTerms.filter((term) =>
      corpusIndex.some((file) => file.content_lower.includes(term))
    );
    const unreachableTerms = grepTerms.filter((term) => !reachableTerms.includes(term));
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const reachableMatchedTerms = new Set(
      selectedFiles.flatMap((file) => Array.from(collectMatchedTerms(file.content_lower, reachableTerms)))
    );
    const reachableTermCoverage =
      reachableTerms.length === 0 ? 1 : reachableMatchedTerms.size / reachableTerms.length;
    const exactGapExplainedByUnreachableTerms =
      !scenario.covers_all_scenario_terms && reachableTermCoverage === 1;

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      reachable_terms: reachableTerms,
      unreachable_terms: unreachableTerms,
      reachable_term_count: reachableTerms.length,
      unreachable_term_count: unreachableTerms.length,
      reachable_term_coverage: reachableTermCoverage,
      covers_all_reachable_terms: reachableTermCoverage === 1,
      exact_gap_explained_by_unreachable_terms: exactGapExplainedByUnreachableTerms
    };
  });

  return {
    scenario_count: scenarioResults.length,
    full_reachable_term_coverage_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.covers_all_reachable_terms).length /
          scenarioResults.length,
    mean_reachable_term_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.reachable_term_coverage, 0) /
          scenarioResults.length,
    scenarios_with_unreachable_terms_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.unreachable_term_count > 0).length /
          scenarioResults.length,
    mean_unreachable_term_share:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => {
            const totalTermCount = scenario.reachable_term_count + scenario.unreachable_term_count;
            return sum + (totalTermCount === 0 ? 0 : scenario.unreachable_term_count / totalTermCount);
          }, 0) / scenarioResults.length,
    median_unreachable_term_count: median(scenarioResults.map((scenario) => scenario.unreachable_term_count)),
    exact_gap_explained_by_unreachable_terms_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.exact_gap_explained_by_unreachable_terms).length /
          scenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioClaimSupport(bundleSummary, corpusIndexes) {
  const scenarioResults = bundleSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const claimGroups = normalizeClaimSupportGroups(scenario.answer_support, scenario.grep_terms);
    const claimResults = claimGroups.map((claimGroup) => {
      const matchedAlias = claimGroup.match_any.find((alias) =>
        selectedFiles.some((file) => file.content_lower.includes(alias))
      );
      return {
        id: claimGroup.id,
        match_any: claimGroup.match_any,
        supported: Boolean(matchedAlias),
        matched_alias: matchedAlias ?? null
      };
    });
    const supportedClaimCount = claimResults.filter((claim) => claim.supported).length;
    const claimSupportCoverage = claimResults.length === 0 ? 1 : supportedClaimCount / claimResults.length;
    const exactGapRecovered = !scenario.covers_all_scenario_terms && claimSupportCoverage === 1;

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      claim_group_count: claimResults.length,
      alias_group_count: claimResults.filter((claim) => claim.match_any.length > 1).length,
      supported_claim_count: supportedClaimCount,
      claim_support_coverage: claimSupportCoverage,
      claim_support_gain_vs_exact: claimSupportCoverage - scenario.bundle_term_coverage,
      covers_all_claim_support: claimSupportCoverage === 1,
      exact_gap_recovered: exactGapRecovered,
      claim_results: claimResults
    };
  });

  return {
    scenario_count: scenarioResults.length,
    full_claim_support_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.covers_all_claim_support).length / scenarioResults.length,
    mean_claim_support_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.claim_support_coverage, 0) /
          scenarioResults.length,
    mean_claim_support_gain_vs_exact:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.claim_support_gain_vs_exact, 0) /
          scenarioResults.length,
    exact_gap_recovered_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.exact_gap_recovered).length / scenarioResults.length,
    scenarios_with_alias_groups_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.alias_group_count > 0).length / scenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioClaimSupportPack(bundleSummary, corpusIndexes, corpusLabels) {
  const corpusLabelMap = new Map(corpusLabels);
  const scenarioResults = bundleSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const claimGroups = normalizeClaimSupportGroups(scenario.answer_support, scenario.grep_terms);
    const bundleMatchedClaims = collectMatchedClaimIdsFromFiles(selectedFiles, claimGroups);
    const selectedPack = selectScenarioClaimSupportPack(
      selectedFiles,
      scenario.title ?? "",
      claimGroups,
      bundleMatchedClaims
    );
    const selectedPackMatchedClaims = collectMatchedClaimIdsFromSections(selectedPack, claimGroups);
    const selectedPackBytes = selectedPack.reduce((sum, section) => sum + section.byte_count, 0);
    const selectedPackTokensEstimated = selectedPack.reduce(
      (sum, section) => sum + section.tokens_estimated,
      0
    );

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: corpusLabelMap.get(scenario.corpus_id) ?? scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      grep_terms: scenario.grep_terms ?? [],
      answer_support: scenario.answer_support ?? [],
      answer_checks: scenario.answer_checks ?? [],
      answer_authority: scenario.answer_authority ?? null,
      covers_all_scenario_terms: scenario.covers_all_scenario_terms,
      selected_file_paths: scenario.selected_file_paths,
      selected_section_ids: selectedPack.map((section) => section.id),
      selected_section_headings: selectedPack.map((section) => section.heading),
      selected_section_count: selectedPack.length,
      selected_file_count: new Set(selectedPack.map((section) => section.file_path)).size,
      selected_pack_bytes: selectedPackBytes,
      selected_pack_tokens_estimated: selectedPackTokensEstimated,
      bundle_claim_support_coverage:
        claimGroups.length === 0 ? 1 : bundleMatchedClaims.size / claimGroups.length,
      claim_support_coverage:
        claimGroups.length === 0 ? 1 : selectedPackMatchedClaims.size / claimGroups.length,
      pack_claim_support_recall_vs_bundle:
        bundleMatchedClaims.size === 0 ? 1 : selectedPackMatchedClaims.size / bundleMatchedClaims.size,
      context_reduction_vs_bundle:
        scenario.selected_bundle_bytes > 0 ? 1 - selectedPackBytes / scenario.selected_bundle_bytes : 0,
      pack_covers_bundle_claim_support: selectedPackMatchedClaims.size === bundleMatchedClaims.size,
      covers_all_claim_support:
        claimGroups.length === 0 ? true : selectedPackMatchedClaims.size === claimGroups.length,
      exact_gap_recovered:
        !scenario.covers_all_scenario_terms &&
        claimGroups.length > 0 &&
        selectedPackMatchedClaims.size === claimGroups.length
    };
  });

  return {
    scenario_count: scenarioResults.length,
    full_bundle_claim_support_preservation_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.pack_covers_bundle_claim_support).length /
          scenarioResults.length,
    full_claim_support_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.covers_all_claim_support).length / scenarioResults.length,
    mean_claim_support_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.claim_support_coverage, 0) /
          scenarioResults.length,
    mean_pack_claim_support_recall_vs_bundle:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.pack_claim_support_recall_vs_bundle, 0) /
          scenarioResults.length,
    exact_gap_recovered_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.exact_gap_recovered).length / scenarioResults.length,
    zero_selected_pack_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.selected_section_count === 0).length /
          scenarioResults.length,
    median_selected_pack_section_count: median(
      scenarioResults.map((scenario) => scenario.selected_section_count)
    ),
    median_selected_pack_file_count: median(scenarioResults.map((scenario) => scenario.selected_file_count)),
    median_selected_pack_bytes: median(scenarioResults.map((scenario) => scenario.selected_pack_bytes)),
    median_selected_pack_tokens_estimated: median(
      scenarioResults.map((scenario) => scenario.selected_pack_tokens_estimated)
    ),
    median_context_reduction_vs_bundle: median(
      scenarioResults.map((scenario) => scenario.context_reduction_vs_bundle)
    ),
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerCheck(packSummary, corpusIndexes) {
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const selectedSections = collectSectionsByIds(selectedFiles, scenario.selected_section_ids);
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const {
      results: answerCheckResults,
      supported_count: supportedAnswerCheckCount,
      coverage: answerCheckCoverage
    } = evaluateAnswerChecksOnSections(answerChecks, selectedSections);

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: answerCheckResults.length,
      supported_answer_check_count: supportedAnswerCheckCount,
      answer_check_coverage: answerCheckCoverage,
      answer_check_gain_vs_claim_support: answerCheckCoverage - scenario.claim_support_coverage,
      covers_all_answer_checks: answerCheckCoverage === 1,
      claim_gap_recovered: scenario.claim_support_coverage < 1 && answerCheckCoverage === 1,
      exact_gap_recovered: !scenario.covers_all_scenario_terms && answerCheckCoverage === 1,
      explicit_answer_check: (scenario.answer_checks ?? []).length > 0,
      answer_check_results: answerCheckResults
    };
  });

  return {
    scenario_count: scenarioResults.length,
    full_answer_check_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.covers_all_answer_checks).length / scenarioResults.length,
    mean_answer_check_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.answer_check_coverage, 0) /
          scenarioResults.length,
    mean_answer_check_gain_vs_claim_support:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.answer_check_gain_vs_claim_support, 0) /
          scenarioResults.length,
    claim_gap_recovered_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.claim_gap_recovered).length / scenarioResults.length,
    exact_gap_recovered_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.exact_gap_recovered).length / scenarioResults.length,
    scenarios_with_explicit_answer_checks_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.explicit_answer_check).length / scenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerLocality(packSummary, corpusIndexes) {
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const selectedSections = collectSectionsByIds(selectedFiles, scenario.selected_section_ids);
    const targetLocalSections = selectedSections.filter((section) => section.file_path === scenario.target_path);
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const fullPackEvaluation = evaluateAnswerChecksOnSections(answerChecks, selectedSections);
    const targetLocalEvaluation = evaluateAnswerChecksOnSections(answerChecks, targetLocalSections);
    const targetLocalResultsById = new Map(
      targetLocalEvaluation.results.map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const crossFileOnlyAnswerCheckIds = fullPackEvaluation.results
      .filter(
        (answerCheck) =>
          answerCheck.supported && !(targetLocalResultsById.get(answerCheck.id)?.supported ?? false)
      )
      .map((answerCheck) => answerCheck.id);

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: fullPackEvaluation.results.length,
      answer_check_coverage: fullPackEvaluation.coverage,
      target_local_supported_answer_check_count: targetLocalEvaluation.supported_count,
      target_local_answer_check_coverage: targetLocalEvaluation.coverage,
      cross_file_answer_check_gain: fullPackEvaluation.coverage - targetLocalEvaluation.coverage,
      target_local_covers_all_answer_checks: targetLocalEvaluation.coverage === 1,
      requires_cross_file_evidence: targetLocalEvaluation.coverage < fullPackEvaluation.coverage,
      cross_file_answer_recovered:
        targetLocalEvaluation.coverage < 1 && fullPackEvaluation.coverage === 1,
      explicit_answer_check: (scenario.answer_checks ?? []).length > 0,
      selected_section_count: selectedSections.length,
      target_local_selected_section_count: targetLocalSections.length,
      cross_file_only_answer_check_ids: crossFileOnlyAnswerCheckIds,
      answer_check_locality_results: fullPackEvaluation.results.map((answerCheck) => ({
        id: answerCheck.id,
        supported: answerCheck.supported,
        target_local_supported: targetLocalResultsById.get(answerCheck.id)?.supported ?? false,
        matched_alias: answerCheck.matched_alias,
        supporting_file_paths: answerCheck.supporting_file_paths
      }))
    };
  });

  return {
    scenario_count: scenarioResults.length,
    full_target_local_answer_check_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.target_local_covers_all_answer_checks).length /
          scenarioResults.length,
    mean_target_local_answer_check_coverage:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.target_local_answer_check_coverage, 0) /
          scenarioResults.length,
    mean_cross_file_answer_check_gain:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.reduce((sum, scenario) => sum + scenario.cross_file_answer_check_gain, 0) /
          scenarioResults.length,
    cross_file_answer_recovery_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.cross_file_answer_recovered).length /
          scenarioResults.length,
    scenarios_requiring_cross_file_evidence_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.requires_cross_file_evidence).length /
          scenarioResults.length,
    scenarios_with_explicit_answer_checks_rate:
      scenarioResults.length === 0
        ? 0
        : scenarioResults.filter((scenario) => scenario.explicit_answer_check).length / scenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerAuthority(packSummary, corpusIndexes) {
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const selectedSections = collectSectionsByIds(selectedFiles, scenario.selected_section_ids);
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const fullPackEvaluation = evaluateAnswerChecksOnSections(answerChecks, selectedSections);
    const allowedPathPrefixes = normalizeAnswerAuthorityScope(scenario.answer_authority);
    const authorityScopeDeclared = allowedPathPrefixes.length > 0;
    const authorityScopedSections = authorityScopeDeclared
      ? selectedSections.filter((section) => pathMatchesAuthorityScope(section.file_path, allowedPathPrefixes))
      : [];
    const authorityEvaluation = authorityScopeDeclared
      ? evaluateAnswerChecksOnSections(answerChecks, authorityScopedSections)
      : null;
    const authorityResultsById = new Map(
      (authorityEvaluation?.results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const outOfScopeOnlyAnswerCheckIds = authorityScopeDeclared
      ? fullPackEvaluation.results
          .filter(
            (answerCheck) =>
              answerCheck.supported && !(authorityResultsById.get(answerCheck.id)?.supported ?? false)
          )
          .map((answerCheck) => answerCheck.id)
      : [];

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: fullPackEvaluation.results.length,
      answer_check_coverage: fullPackEvaluation.coverage,
      authority_scope_declared: authorityScopeDeclared,
      allowed_path_prefixes: allowedPathPrefixes,
      authority_supported_answer_check_count: authorityEvaluation?.supported_count ?? null,
      authority_scoped_answer_check_coverage: authorityEvaluation?.coverage ?? null,
      out_of_scope_answer_check_gain:
        authorityEvaluation == null ? null : fullPackEvaluation.coverage - authorityEvaluation.coverage,
      authority_covers_all_answer_checks: authorityEvaluation?.coverage === 1,
      requires_out_of_scope_evidence:
        authorityEvaluation == null ? null : authorityEvaluation.coverage < fullPackEvaluation.coverage,
      out_of_scope_answer_recovered:
        authorityEvaluation == null ? null : authorityEvaluation.coverage < 1 && fullPackEvaluation.coverage === 1,
      explicit_answer_check: (scenario.answer_checks ?? []).length > 0,
      selected_section_count: selectedSections.length,
      authority_selected_section_count: authorityScopedSections.length,
      out_of_scope_only_answer_check_ids: outOfScopeOnlyAnswerCheckIds,
      answer_check_authority_results: fullPackEvaluation.results.map((answerCheck) => ({
        id: answerCheck.id,
        supported: answerCheck.supported,
        authority_supported: authorityResultsById.get(answerCheck.id)?.supported ?? false,
        matched_alias: answerCheck.matched_alias,
        supporting_file_paths: answerCheck.supporting_file_paths
      }))
    };
  });

  const scopedScenarioResults = scenarioResults.filter((scenario) => scenario.authority_scope_declared);
  return {
    scenario_count: scenarioResults.length,
    scoped_scenario_count: scopedScenarioResults.length,
    full_authority_scoped_answer_check_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.authority_covers_all_answer_checks).length /
          scopedScenarioResults.length,
    mean_authority_scoped_answer_check_coverage:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.authority_scoped_answer_check_coverage ?? 0),
            0
          ) / scopedScenarioResults.length,
    mean_out_of_scope_answer_check_gain:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce((sum, scenario) => sum + (scenario.out_of_scope_answer_check_gain ?? 0), 0) /
          scopedScenarioResults.length,
    out_of_scope_answer_recovery_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.out_of_scope_answer_recovered).length /
          scopedScenarioResults.length,
    scenarios_requiring_out_of_scope_evidence_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.requires_out_of_scope_evidence).length /
          scopedScenarioResults.length,
    scenarios_with_explicit_answer_authority_rate:
      scenarioResults.length === 0 ? 0 : scopedScenarioResults.length / scenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerAuthorityReachability(packSummary, authoritySummary, corpusIndexes) {
  const authorityById = new Map(authoritySummary.scenario_results.map((scenario) => [scenario.id, scenario]));
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const authorityAudit = authorityById.get(scenario.id) ?? null;
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const authorityScopeDeclared = authorityAudit?.authority_scope_declared ?? false;
    const allowedPathPrefixes = authorityAudit?.allowed_path_prefixes ?? [];
    const authorityFiles = authorityScopeDeclared
      ? corpusIndex.filter((file) => pathMatchesAuthorityScope(file.path, allowedPathPrefixes))
      : [];
    const authoritySections = authorityFiles.flatMap((file) => file.sections);
    const reachableEvaluation = authorityScopeDeclared
      ? evaluateAnswerChecksOnSections(answerChecks, authoritySections)
      : null;
    const authorityAuditResultsById = new Map(
      (authorityAudit?.answer_check_authority_results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const authorityReachableResultsById = new Map(
      (reachableEvaluation?.results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const authorityReachableOnlyAnswerCheckIds = authorityScopeDeclared
      ? (reachableEvaluation?.results ?? [])
          .filter(
            (answerCheck) =>
              answerCheck.supported && !(authorityAuditResultsById.get(answerCheck.id)?.authority_supported ?? false)
          )
          .map((answerCheck) => answerCheck.id)
      : [];
    const authorityReachableCoverage = reachableEvaluation?.coverage ?? null;
    const authorityScopedCoverage = authorityAudit?.authority_scoped_answer_check_coverage ?? null;

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: answerChecks.length,
      authority_scope_declared: authorityScopeDeclared,
      allowed_path_prefixes: allowedPathPrefixes,
      authority_scoped_answer_check_coverage: authorityScopedCoverage,
      authority_reachable_supported_answer_check_count: reachableEvaluation?.supported_count ?? null,
      authority_reachable_answer_check_coverage: authorityReachableCoverage,
      authority_reachable_gain_vs_scoped_pack:
        authorityReachableCoverage == null || authorityScopedCoverage == null
          ? null
          : authorityReachableCoverage - authorityScopedCoverage,
      authority_gap_explained_by_reachability:
        authorityReachableCoverage == null || authorityScopedCoverage == null
          ? null
          : authorityScopedCoverage < 1 && authorityReachableCoverage === 1,
      authority_scope_missing_answer_support:
        authorityReachableCoverage == null ? null : authorityReachableCoverage < 1,
      authority_reachable_file_count: authorityFiles.length,
      authority_reachable_section_count: authoritySections.length,
      authority_reachable_only_answer_check_ids: authorityReachableOnlyAnswerCheckIds,
      answer_check_authority_reachability_results: answerChecks.map((answerCheck) => ({
        id: answerCheck.id,
        authority_supported: authorityAuditResultsById.get(answerCheck.id)?.authority_supported ?? false,
        authority_reachable_supported:
          authorityReachableResultsById.get(answerCheck.id)?.supported ?? false,
        matched_alias: authorityReachableResultsById.get(answerCheck.id)?.matched_alias ?? null,
        authority_reachable_supporting_file_paths:
          authorityReachableResultsById.get(answerCheck.id)?.supporting_file_paths ?? []
      }))
    };
  });

  const scopedScenarioResults = scenarioResults.filter((scenario) => scenario.authority_scope_declared);
  return {
    scenario_count: scenarioResults.length,
    scoped_scenario_count: scopedScenarioResults.length,
    full_authority_reachable_answer_check_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.authority_reachable_answer_check_coverage === 1).length /
          scopedScenarioResults.length,
    mean_authority_reachable_answer_check_coverage:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.authority_reachable_answer_check_coverage ?? 0),
            0
          ) / scopedScenarioResults.length,
    mean_authority_reachable_gain_vs_scoped_pack:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.authority_reachable_gain_vs_scoped_pack ?? 0),
            0
          ) / scopedScenarioResults.length,
    authority_gap_explained_by_reachability_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.authority_gap_explained_by_reachability).length /
          scopedScenarioResults.length,
    scenarios_with_missing_authority_answer_support_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.authority_scope_missing_answer_support).length /
          scopedScenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerAuthorityPack(
  packSummary,
  authoritySummary,
  authorityReachabilitySummary,
  corpusIndexes
) {
  const authorityById = new Map(authoritySummary.scenario_results.map((scenario) => [scenario.id, scenario]));
  const authorityReachabilityById = new Map(
    authorityReachabilitySummary.scenario_results.map((scenario) => [scenario.id, scenario])
  );
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const selectedFiles = scenario.selected_file_paths
      .map((selectedPath) => corpusIndex.find((file) => file.path === selectedPath) ?? null)
      .filter(Boolean);
    const selectedSections = collectSectionsByIds(selectedFiles, scenario.selected_section_ids);
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const authorityAudit = authorityById.get(scenario.id) ?? null;
    const authorityReachabilityAudit = authorityReachabilityById.get(scenario.id) ?? null;
    const authorityAuditResultsById = new Map(
      (authorityAudit?.answer_check_authority_results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const authorityReachabilityResultsById = new Map(
      (authorityReachabilityAudit?.answer_check_authority_reachability_results ?? []).map((answerCheck) => [
        answerCheck.id,
        answerCheck
      ])
    );
    const authorityScopeDeclared = authorityAudit?.authority_scope_declared ?? false;
    const allowedPathPrefixes = authorityAudit?.allowed_path_prefixes ?? [];
    const authorityFiles = authorityScopeDeclared
      ? corpusIndex.filter((file) => pathMatchesAuthorityScope(file.path, allowedPathPrefixes))
      : [];
    const authoritySections = authorityFiles.flatMap((file) => file.sections);
    const authorityScopeBytes = authorityFiles.reduce((sum, file) => sum + file.byte_count, 0);
    const authorityScopedSections = authorityScopeDeclared
      ? selectedSections.filter((section) => pathMatchesAuthorityScope(section.file_path, allowedPathPrefixes))
      : [];
    const authorityReachableTargetIds = new Set(
      (authorityReachabilityAudit?.answer_check_authority_reachability_results ?? [])
        .filter((answerCheck) => answerCheck.authority_reachable_supported)
        .map((answerCheck) => answerCheck.id)
    );
    const selectedPack = authorityScopeDeclared
      ? selectScenarioSupportPack(authorityFiles, scenario.title ?? "", answerChecks, authorityReachableTargetIds)
      : [];
    const selectedPackBytes = selectedPack.reduce((sum, section) => sum + section.byte_count, 0);
    const selectedPackTokensEstimated = selectedPack.reduce(
      (sum, section) => sum + section.tokens_estimated,
      0
    );
    const selectedPackEvaluation = authorityScopeDeclared
      ? evaluateAnswerChecksOnSections(answerChecks, selectedPack)
      : null;
    const selectedPackResultsById = new Map(
      (selectedPackEvaluation?.results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const preservedReachableAnswerCheckCount = [...authorityReachableTargetIds].filter(
      (answerCheckId) => selectedPackResultsById.get(answerCheckId)?.supported ?? false
    ).length;
    const authorityPackRecallVsReachable =
      !authorityScopeDeclared
        ? null
        : authorityReachableTargetIds.size === 0
          ? 1
          : preservedReachableAnswerCheckCount / authorityReachableTargetIds.size;
    const authorityPackOnlyAnswerCheckIds = authorityScopeDeclared
      ? (selectedPackEvaluation?.results ?? [])
          .filter(
            (answerCheck) =>
              answerCheck.supported && !(authorityAuditResultsById.get(answerCheck.id)?.authority_supported ?? false)
          )
          .map((answerCheck) => answerCheck.id)
      : [];
    const authorityPackMissedReachableAnswerCheckIds = authorityScopeDeclared
      ? [...authorityReachableTargetIds].filter(
          (answerCheckId) => !(selectedPackResultsById.get(answerCheckId)?.supported ?? false)
        )
      : [];

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: answerChecks.length,
      authority_scope_declared: authorityScopeDeclared,
      allowed_path_prefixes: allowedPathPrefixes,
      authority_scoped_answer_check_coverage: authorityAudit?.authority_scoped_answer_check_coverage ?? null,
      authority_reachable_answer_check_coverage:
        authorityReachabilityAudit?.authority_reachable_answer_check_coverage ?? null,
      authority_pack_supported_answer_check_count: selectedPackEvaluation?.supported_count ?? null,
      authority_pack_answer_check_coverage: selectedPackEvaluation?.coverage ?? null,
      authority_pack_gain_vs_scoped_pack:
        selectedPackEvaluation?.coverage == null || authorityAudit?.authority_scoped_answer_check_coverage == null
          ? null
          : selectedPackEvaluation.coverage - authorityAudit.authority_scoped_answer_check_coverage,
      authority_pack_recall_vs_reachable: authorityPackRecallVsReachable,
      authority_pack_preserves_reachable_answer_support: authorityPackRecallVsReachable === 1,
      authority_pack_covers_all_answer_checks: selectedPackEvaluation?.coverage === 1,
      selected_section_ids: selectedPack.map((section) => section.id),
      selected_section_headings: selectedPack.map((section) => section.heading),
      selected_section_count: selectedPack.length,
      selected_file_count: new Set(selectedPack.map((section) => section.file_path)).size,
      selected_pack_bytes: selectedPackBytes,
      selected_pack_tokens_estimated: selectedPackTokensEstimated,
      authority_scope_file_count: authorityFiles.length,
      authority_scope_section_count: authoritySections.length,
      authority_scope_bytes: authorityScopeBytes,
      context_reduction_vs_authority_scope:
        authorityScopeBytes > 0 ? 1 - selectedPackBytes / authorityScopeBytes : 0,
      authority_pack_only_answer_check_ids: authorityPackOnlyAnswerCheckIds,
      authority_pack_missed_reachable_answer_check_ids: authorityPackMissedReachableAnswerCheckIds,
      answer_check_authority_pack_results: answerChecks.map((answerCheck) => ({
        id: answerCheck.id,
        authority_supported: authorityAuditResultsById.get(answerCheck.id)?.authority_supported ?? false,
        authority_reachable_supported:
          authorityReachabilityResultsById.get(answerCheck.id)?.authority_reachable_supported ?? false,
        authority_pack_supported: selectedPackResultsById.get(answerCheck.id)?.supported ?? false,
        matched_alias: selectedPackResultsById.get(answerCheck.id)?.matched_alias ?? null,
        authority_pack_supporting_file_paths:
          selectedPackResultsById.get(answerCheck.id)?.supporting_file_paths ?? []
      }))
    };
  });

  const scopedScenarioResults = scenarioResults.filter((scenario) => scenario.authority_scope_declared);
  return {
    scenario_count: scenarioResults.length,
    scoped_scenario_count: scopedScenarioResults.length,
    full_authority_pack_answer_check_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.authority_pack_covers_all_answer_checks).length /
          scopedScenarioResults.length,
    mean_authority_pack_answer_check_coverage:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.authority_pack_answer_check_coverage ?? 0),
            0
          ) / scopedScenarioResults.length,
    mean_authority_pack_gain_vs_scoped_pack:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.authority_pack_gain_vs_scoped_pack ?? 0),
            0
          ) / scopedScenarioResults.length,
    full_authority_reachable_answer_preservation_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.authority_pack_preserves_reachable_answer_support)
            .length / scopedScenarioResults.length,
    mean_authority_pack_recall_vs_reachable:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.authority_pack_recall_vs_reachable ?? 0),
            0
          ) / scopedScenarioResults.length,
    zero_selected_pack_rate:
      scopedScenarioResults.length === 0
        ? 0
        : scopedScenarioResults.filter((scenario) => scenario.selected_section_count === 0).length /
          scopedScenarioResults.length,
    median_selected_pack_section_count: median(
      scopedScenarioResults.map((scenario) => scenario.selected_section_count)
    ),
    median_selected_pack_file_count: median(scopedScenarioResults.map((scenario) => scenario.selected_file_count)),
    median_selected_pack_bytes: median(scopedScenarioResults.map((scenario) => scenario.selected_pack_bytes)),
    median_selected_pack_tokens_estimated: median(
      scopedScenarioResults.map((scenario) => scenario.selected_pack_tokens_estimated)
    ),
    median_context_reduction_vs_authority_scope: median(
      scopedScenarioResults.map((scenario) => scenario.context_reduction_vs_authority_scope)
    ),
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerAuthorityLocalFamily(packSummary, authoritySummary, corpusIndexes) {
  const authorityById = new Map(authoritySummary.scenario_results.map((scenario) => [scenario.id, scenario]));
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const authorityAudit = authorityById.get(scenario.id) ?? null;
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const allowedPathPrefixes = authorityAudit?.allowed_path_prefixes ?? [];
    const strictTargetFileAuthorityScope = isExactTargetFileAuthorityScope(scenario.target_path, allowedPathPrefixes);
    const localFamilyScopePrefix = strictTargetFileAuthorityScope
      ? deriveLocalFamilyScopePrefix(scenario.target_path)
      : null;
    const localFamilyFiles = strictTargetFileAuthorityScope
      ? corpusIndex.filter((file) => pathMatchesAuthorityScope(file.path, [localFamilyScopePrefix]))
      : [];
    const localFamilySections = localFamilyFiles.flatMap((file) => file.sections);
    const localFamilyEvaluation = strictTargetFileAuthorityScope
      ? evaluateAnswerChecksOnSections(answerChecks, localFamilySections)
      : null;
    const authorityResultsById = new Map(
      (authorityAudit?.answer_check_authority_results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const localFamilyResultsById = new Map(
      (localFamilyEvaluation?.results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const localFamilyOnlyAnswerCheckIds = strictTargetFileAuthorityScope
      ? (localFamilyEvaluation?.results ?? [])
          .filter(
            (answerCheck) =>
              answerCheck.supported && !(authorityResultsById.get(answerCheck.id)?.authority_supported ?? false)
          )
          .map((answerCheck) => answerCheck.id)
      : [];
    const localFamilyCoverage = localFamilyEvaluation?.coverage ?? null;
    const authorityScopedCoverage = authorityAudit?.authority_scoped_answer_check_coverage ?? null;

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: answerChecks.length,
      authority_scope_declared: authorityAudit?.authority_scope_declared ?? false,
      strict_target_file_authority_scope: strictTargetFileAuthorityScope,
      local_family_scope_prefix: localFamilyScopePrefix,
      authority_scoped_answer_check_coverage: authorityScopedCoverage,
      local_family_supported_answer_check_count: localFamilyEvaluation?.supported_count ?? null,
      local_family_answer_check_coverage: localFamilyCoverage,
      local_family_gain_vs_authority_scope:
        localFamilyCoverage == null || authorityScopedCoverage == null
          ? null
          : localFamilyCoverage - authorityScopedCoverage,
      authority_gap_explained_by_local_family:
        localFamilyCoverage == null || authorityScopedCoverage == null
          ? null
          : authorityScopedCoverage < 1 && localFamilyCoverage === 1,
      local_family_missing_answer_support: localFamilyCoverage == null ? null : localFamilyCoverage < 1,
      local_family_file_count: localFamilyFiles.length,
      local_family_section_count: localFamilySections.length,
      local_family_only_answer_check_ids: localFamilyOnlyAnswerCheckIds,
      answer_check_local_family_results: answerChecks.map((answerCheck) => ({
        id: answerCheck.id,
        authority_supported: authorityResultsById.get(answerCheck.id)?.authority_supported ?? false,
        local_family_supported: localFamilyResultsById.get(answerCheck.id)?.supported ?? false,
        matched_alias: localFamilyResultsById.get(answerCheck.id)?.matched_alias ?? null,
        local_family_supporting_file_paths:
          localFamilyResultsById.get(answerCheck.id)?.supporting_file_paths ?? []
      }))
    };
  });

  const strictScopeScenarioResults = scenarioResults.filter((scenario) => scenario.strict_target_file_authority_scope);
  return {
    scenario_count: scenarioResults.length,
    strict_file_scope_scenario_count: strictScopeScenarioResults.length,
    full_local_family_answer_check_rate:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.filter((scenario) => scenario.local_family_answer_check_coverage === 1).length /
          strictScopeScenarioResults.length,
    mean_local_family_answer_check_coverage:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.local_family_answer_check_coverage ?? 0),
            0
          ) / strictScopeScenarioResults.length,
    mean_local_family_gain_vs_authority_scope:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.local_family_gain_vs_authority_scope ?? 0),
            0
          ) / strictScopeScenarioResults.length,
    authority_gap_explained_by_local_family_rate:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.filter((scenario) => scenario.authority_gap_explained_by_local_family).length /
          strictScopeScenarioResults.length,
    scenarios_with_missing_local_family_answer_support_rate:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.filter((scenario) => scenario.local_family_missing_answer_support).length /
          strictScopeScenarioResults.length,
    scenario_results: scenarioResults
  };
}

function summarizeScenarioAnswerAuthorityLocalFamilyPack(packSummary, localFamilySummary, corpusIndexes) {
  const localFamilyById = new Map(localFamilySummary.scenario_results.map((scenario) => [scenario.id, scenario]));
  const scenarioResults = packSummary.scenario_results.map((scenario) => {
    const corpusIndex = corpusIndexes.get(scenario.corpus_id) ?? [];
    const answerChecks = normalizeAnswerChecks(
      scenario.answer_checks,
      scenario.answer_support,
      scenario.grep_terms
    );
    const localFamilyAudit = localFamilyById.get(scenario.id) ?? null;
    const strictTargetFileAuthorityScope = localFamilyAudit?.strict_target_file_authority_scope ?? false;
    const localFamilyScopePrefix = localFamilyAudit?.local_family_scope_prefix ?? null;
    const localFamilyFiles =
      strictTargetFileAuthorityScope && localFamilyScopePrefix != null
        ? corpusIndex.filter((file) => pathMatchesAuthorityScope(file.path, [localFamilyScopePrefix]))
        : [];
    const localFamilySections = localFamilyFiles.flatMap((file) => file.sections);
    const localFamilyScopeBytes = localFamilyFiles.reduce((sum, file) => sum + file.byte_count, 0);
    const localFamilyResultsById = new Map(
      (localFamilyAudit?.answer_check_local_family_results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const localFamilyTargetIds = new Set(
      (localFamilyAudit?.answer_check_local_family_results ?? [])
        .filter((answerCheck) => answerCheck.local_family_supported)
        .map((answerCheck) => answerCheck.id)
    );
    const selectedPack =
      strictTargetFileAuthorityScope && localFamilyScopePrefix != null
        ? selectScenarioSupportPack(localFamilyFiles, scenario.title ?? "", answerChecks, localFamilyTargetIds)
        : [];
    const selectedPackBytes = selectedPack.reduce((sum, section) => sum + section.byte_count, 0);
    const selectedPackTokensEstimated = selectedPack.reduce((sum, section) => sum + section.tokens_estimated, 0);
    const selectedPackEvaluation =
      strictTargetFileAuthorityScope && localFamilyScopePrefix != null
        ? evaluateAnswerChecksOnSections(answerChecks, selectedPack)
        : null;
    const selectedPackResultsById = new Map(
      (selectedPackEvaluation?.results ?? []).map((answerCheck) => [answerCheck.id, answerCheck])
    );
    const preservedSupportedAnswerCheckCount = [...localFamilyTargetIds].filter(
      (answerCheckId) => selectedPackResultsById.get(answerCheckId)?.supported ?? false
    ).length;
    const localFamilyPackRecallVsSupported =
      !strictTargetFileAuthorityScope
        ? null
        : localFamilyTargetIds.size === 0
          ? 1
          : preservedSupportedAnswerCheckCount / localFamilyTargetIds.size;
    const localFamilyPackOnlyAnswerCheckIds = strictTargetFileAuthorityScope
      ? (selectedPackEvaluation?.results ?? [])
          .filter(
            (answerCheck) =>
              answerCheck.supported && !(localFamilyResultsById.get(answerCheck.id)?.authority_supported ?? false)
          )
          .map((answerCheck) => answerCheck.id)
      : [];
    const localFamilyPackMissedSupportedAnswerCheckIds = strictTargetFileAuthorityScope
      ? [...localFamilyTargetIds].filter(
          (answerCheckId) => !(selectedPackResultsById.get(answerCheckId)?.supported ?? false)
        )
      : [];
    const localFamilyCoverage = localFamilyAudit?.local_family_answer_check_coverage ?? null;
    const authorityScopedCoverage = localFamilyAudit?.authority_scoped_answer_check_coverage ?? null;

    return {
      id: scenario.id,
      corpus_id: scenario.corpus_id,
      corpus_label: scenario.corpus_label,
      target_path: scenario.target_path,
      title: scenario.title ?? "",
      answer_check_count: answerChecks.length,
      authority_scope_declared: localFamilyAudit?.authority_scope_declared ?? false,
      strict_target_file_authority_scope: strictTargetFileAuthorityScope,
      local_family_scope_prefix: localFamilyScopePrefix,
      authority_scoped_answer_check_coverage: authorityScopedCoverage,
      local_family_answer_check_coverage: localFamilyCoverage,
      local_family_pack_supported_answer_check_count: selectedPackEvaluation?.supported_count ?? null,
      local_family_pack_answer_check_coverage: selectedPackEvaluation?.coverage ?? null,
      local_family_pack_gain_vs_authority_scope:
        selectedPackEvaluation?.coverage == null || authorityScopedCoverage == null
          ? null
          : selectedPackEvaluation.coverage - authorityScopedCoverage,
      local_family_pack_recall_vs_supported: localFamilyPackRecallVsSupported,
      local_family_pack_preserves_supported_answer_support: localFamilyPackRecallVsSupported === 1,
      local_family_pack_covers_all_answer_checks: selectedPackEvaluation?.coverage === 1,
      selected_section_ids: selectedPack.map((section) => section.id),
      selected_section_headings: selectedPack.map((section) => section.heading),
      selected_section_count: selectedPack.length,
      selected_file_count: new Set(selectedPack.map((section) => section.file_path)).size,
      selected_pack_bytes: selectedPackBytes,
      selected_pack_tokens_estimated: selectedPackTokensEstimated,
      local_family_scope_file_count: localFamilyFiles.length,
      local_family_scope_section_count: localFamilySections.length,
      local_family_scope_bytes: localFamilyScopeBytes,
      context_reduction_vs_local_family_scope:
        localFamilyScopeBytes > 0 ? 1 - selectedPackBytes / localFamilyScopeBytes : 0,
      local_family_pack_only_answer_check_ids: localFamilyPackOnlyAnswerCheckIds,
      local_family_pack_missed_supported_answer_check_ids: localFamilyPackMissedSupportedAnswerCheckIds,
      answer_check_local_family_pack_results: answerChecks.map((answerCheck) => ({
        id: answerCheck.id,
        authority_supported: localFamilyResultsById.get(answerCheck.id)?.authority_supported ?? false,
        local_family_supported: localFamilyResultsById.get(answerCheck.id)?.local_family_supported ?? false,
        local_family_pack_supported: selectedPackResultsById.get(answerCheck.id)?.supported ?? false,
        matched_alias: selectedPackResultsById.get(answerCheck.id)?.matched_alias ?? null,
        local_family_pack_supporting_file_paths:
          selectedPackResultsById.get(answerCheck.id)?.supporting_file_paths ?? []
      }))
    };
  });

  const strictScopeScenarioResults = scenarioResults.filter((scenario) => scenario.strict_target_file_authority_scope);
  return {
    scenario_count: scenarioResults.length,
    strict_file_scope_scenario_count: strictScopeScenarioResults.length,
    full_local_family_pack_answer_check_rate:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.filter((scenario) => scenario.local_family_pack_covers_all_answer_checks)
            .length / strictScopeScenarioResults.length,
    mean_local_family_pack_answer_check_coverage:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.local_family_pack_answer_check_coverage ?? 0),
            0
          ) / strictScopeScenarioResults.length,
    mean_local_family_pack_gain_vs_authority_scope:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.local_family_pack_gain_vs_authority_scope ?? 0),
            0
          ) / strictScopeScenarioResults.length,
    full_local_family_support_preservation_rate:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.filter((scenario) => scenario.local_family_pack_preserves_supported_answer_support)
            .length / strictScopeScenarioResults.length,
    mean_local_family_pack_recall_vs_supported:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.reduce(
            (sum, scenario) => sum + (scenario.local_family_pack_recall_vs_supported ?? 0),
            0
          ) / strictScopeScenarioResults.length,
    zero_selected_pack_rate:
      strictScopeScenarioResults.length === 0
        ? 0
        : strictScopeScenarioResults.filter((scenario) => scenario.selected_section_count === 0).length /
          strictScopeScenarioResults.length,
    median_selected_pack_section_count: median(
      strictScopeScenarioResults.map((scenario) => scenario.selected_section_count)
    ),
    median_selected_pack_file_count: median(
      strictScopeScenarioResults.map((scenario) => scenario.selected_file_count)
    ),
    median_selected_pack_bytes: median(strictScopeScenarioResults.map((scenario) => scenario.selected_pack_bytes)),
    median_selected_pack_tokens_estimated: median(
      strictScopeScenarioResults.map((scenario) => scenario.selected_pack_tokens_estimated)
    ),
    median_context_reduction_vs_local_family_scope: median(
      strictScopeScenarioResults.map((scenario) => scenario.context_reduction_vs_local_family_scope)
    ),
    scenario_results: scenarioResults
  };
}

function normalizeClaimSupportGroups(answerSupport, grepTerms) {
  const declaredGroups = normalizeDeclaredSupportGroups(answerSupport, "claim");
  if (declaredGroups.length > 0) {
    return declaredGroups;
  }

  return (grepTerms ?? []).map((term) => ({
    id: String(term),
    match_any: [String(term).toLowerCase()]
  }));
}

function normalizeAnswerChecks(answerChecks, answerSupport, grepTerms) {
  const declaredChecks = normalizeDeclaredSupportGroups(answerChecks, "answer-check");
  if (declaredChecks.length > 0) {
    return declaredChecks;
  }
  return normalizeClaimSupportGroups(answerSupport, grepTerms);
}

function normalizeAnswerAuthorityScope(answerAuthority) {
  if (!answerAuthority || typeof answerAuthority !== "object") {
    return [];
  }
  return dedupeStrings(
    (answerAuthority.allowed_path_prefixes ?? [])
      .map((entry) => normalizeRelativePath(String(entry ?? "")))
      .filter(Boolean)
  );
}

function isExactTargetFileAuthorityScope(targetPath, allowedPathPrefixes) {
  const normalizedTargetPath = normalizeRelativePath(String(targetPath ?? ""));
  return allowedPathPrefixes.length === 1 && allowedPathPrefixes[0] === normalizedTargetPath;
}

function deriveLocalFamilyScopePrefix(targetPath) {
  const normalizedTargetPath = normalizeRelativePath(String(targetPath ?? ""));
  const directoryPath = path.posix.dirname(normalizedTargetPath);
  return directoryPath === "." ? "" : `${directoryPath}/`;
}

function pathMatchesAuthorityScope(filePath, allowedPathPrefixes) {
  return allowedPathPrefixes.some((prefix) =>
    prefix === "" || (prefix.endsWith("/") ? filePath.startsWith(prefix) : filePath === prefix)
  );
}

function normalizeDeclaredSupportGroups(groups, fallbackPrefix) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return [];
  }

  return groups
    .map((group, index) => {
      if (typeof group === "string") {
        return {
          id: group,
          match_any: [group.toLowerCase()]
        };
      }
      const aliases = Array.isArray(group.match_any)
        ? dedupeStrings(group.match_any.map((alias) => String(alias).toLowerCase()))
        : [];
      return {
        id: String(group.id ?? `${fallbackPrefix}-${index + 1}`),
        match_any: aliases
      };
    })
    .filter((group) => group.match_any.length > 0);
}

function evaluateAnswerChecksOnSections(answerChecks, sections) {
  const results = answerChecks.map((answerCheck) => {
    const matchedAlias = answerCheck.match_any.find((alias) =>
      sections.some((section) => section.content_lower.includes(alias))
    );
    const supportingFilePaths = matchedAlias
      ? dedupeStrings(
          sections
            .filter((section) => section.content_lower.includes(matchedAlias))
            .map((section) => section.file_path)
        )
      : [];
    return {
      id: answerCheck.id,
      match_any: answerCheck.match_any,
      supported: Boolean(matchedAlias),
      matched_alias: matchedAlias ?? null,
      supporting_file_paths: supportingFilePaths
    };
  });
  const supportedCount = results.filter((answerCheck) => answerCheck.supported).length;
  return {
    results,
    supported_count: supportedCount,
    coverage: results.length === 0 ? 1 : supportedCount / results.length
  };
}

function collectMatchedClaimIds(textLower, claimGroups, allowedClaimIds = null) {
  return collectMatchedSupportIds(textLower, claimGroups, allowedClaimIds);
}

function collectMatchedSupportIds(textLower, supportGroups, allowedSupportIds = null) {
  return new Set(
    supportGroups
      .filter(
        (supportGroup) =>
          (allowedSupportIds == null || allowedSupportIds.has(supportGroup.id)) &&
          supportGroup.match_any.some((alias) => textLower.includes(alias))
      )
      .map((supportGroup) => supportGroup.id)
  );
}

function collectMatchedClaimIdsFromFiles(files, claimGroups, allowedClaimIds = null) {
  return collectMatchedSupportIdsFromFiles(files, claimGroups, allowedClaimIds);
}

function collectMatchedSupportIdsFromFiles(files, supportGroups, allowedSupportIds = null) {
  return new Set(
    files.flatMap((file) =>
      Array.from(collectMatchedSupportIds(file.content_lower, supportGroups, allowedSupportIds))
    )
  );
}

function collectMatchedClaimIdsFromSections(sections, claimGroups, allowedClaimIds = null) {
  return collectMatchedSupportIdsFromSections(sections, claimGroups, allowedClaimIds);
}

function collectMatchedSupportIdsFromSections(sections, supportGroups, allowedSupportIds = null) {
  return new Set(
    sections.flatMap((section) =>
      Array.from(collectMatchedSupportIds(section.content_lower, supportGroups, allowedSupportIds))
    )
  );
}

function summarizeScenarioBundleDelta(previousSummary, currentSummary) {
  const previousById = new Map(previousSummary.scenario_results.map((scenario) => [scenario.id, scenario]));
  const currentScenarios = currentSummary.scenario_results;
  return {
    full_scenario_term_coverage_rate_delta:
      currentSummary.full_scenario_term_coverage_rate - previousSummary.full_scenario_term_coverage_rate,
    mean_bundle_term_coverage_delta:
      currentSummary.mean_bundle_term_coverage - previousSummary.mean_bundle_term_coverage,
    median_selected_bundle_bytes_delta:
      currentSummary.median_selected_bundle_bytes - previousSummary.median_selected_bundle_bytes,
    median_context_growth_vs_top_file_delta:
      currentSummary.median_context_growth_vs_top_file - previousSummary.median_context_growth_vs_top_file,
    improved_coverage_count: currentScenarios.filter((scenario) => {
      const previous = previousById.get(scenario.id);
      return previous && scenario.bundle_term_coverage > previous.bundle_term_coverage;
    }).length,
    worsened_coverage_count: currentScenarios.filter((scenario) => {
      const previous = previousById.get(scenario.id);
      return previous && scenario.bundle_term_coverage < previous.bundle_term_coverage;
    }).length,
    reduced_bytes_count: currentScenarios.filter((scenario) => {
      const previous = previousById.get(scenario.id);
      return previous && scenario.selected_bundle_bytes < previous.selected_bundle_bytes;
    }).length
  };
}

function compareCandidates(left, right, profile) {
  if (profile === "api-surface-rerank") {
    if (left.query_api_surface_signal || right.query_api_surface_signal) {
      return (
        right.title_exact_heading - left.title_exact_heading ||
        right.api_surface_marker_score - left.api_surface_marker_score ||
        right.path_has_api_segment - left.path_has_api_segment ||
        right.weighted_term_score - left.weighted_term_score ||
        right.matched_term_count - left.matched_term_count ||
        right.compact_path_contains_title - left.compact_path_contains_title ||
        right.path_sequence_overlap - left.path_sequence_overlap ||
        right.path_token_overlap - left.path_token_overlap ||
        right.compact_basename_exact - left.compact_basename_exact ||
        right.basename_exact_title - left.basename_exact_title ||
        right.title_token_overlap - left.title_token_overlap ||
        right.basename_token_overlap - left.basename_token_overlap ||
        right.total_term_hits - left.total_term_hits ||
        left.path.localeCompare(right.path)
      );
    }
    return compareCandidates(left, right, "path-family-rerank");
  }
  if (profile === "path-family-rerank") {
    return (
      right.title_exact_heading - left.title_exact_heading ||
      right.compact_path_contains_title - left.compact_path_contains_title ||
      right.path_sequence_overlap - left.path_sequence_overlap ||
      right.path_token_overlap - left.path_token_overlap ||
      right.compact_basename_exact - left.compact_basename_exact ||
      right.basename_exact_title - left.basename_exact_title ||
      right.title_token_overlap - left.title_token_overlap ||
      right.basename_token_overlap - left.basename_token_overlap ||
      right.matched_term_count - left.matched_term_count ||
      right.weighted_term_score - left.weighted_term_score ||
      right.total_term_hits - left.total_term_hits ||
      left.path.localeCompare(right.path)
    );
  }
  if (profile === "structure-aware-rerank") {
    return (
      right.title_exact_heading - left.title_exact_heading ||
      right.compact_basename_exact - left.compact_basename_exact ||
      right.basename_exact_title - left.basename_exact_title ||
      right.title_token_overlap - left.title_token_overlap ||
      right.compact_path_contains_title - left.compact_path_contains_title ||
      right.path_token_overlap - left.path_token_overlap ||
      right.basename_token_overlap - left.basename_token_overlap ||
      right.matched_term_count - left.matched_term_count ||
      right.weighted_term_score - left.weighted_term_score ||
      right.total_term_hits - left.total_term_hits ||
      left.path.localeCompare(right.path)
    );
  }
  if (profile === "seed-title-rerank") {
    return (
      right.title_exact_heading - left.title_exact_heading ||
      right.title_token_overlap - left.title_token_overlap ||
      right.basename_token_overlap - left.basename_token_overlap ||
      right.matched_term_count - left.matched_term_count ||
      right.weighted_term_score - left.weighted_term_score ||
      right.total_term_hits - left.total_term_hits ||
      left.path.localeCompare(right.path)
    );
  }
  return (
    right.matched_term_count - left.matched_term_count ||
    right.total_term_hits - left.total_term_hits ||
    left.path.localeCompare(right.path)
  );
}

function rankSections(sections, title, grepTerms) {
  return sections
    .map((section) => ({
      ...section,
      section_score: scoreSection(section, title, grepTerms)
    }))
    .sort((left, right) => compareSections(left, right));
}

function selectBestSection(sections, title, grepTerms) {
  return rankSections(sections, title, grepTerms)[0] ?? null;
}

function selectSectionEvidencePack(sections, title, grepTerms) {
  const rankedSections = rankSections(sections, title, grepTerms);
  if (rankedSections.length === 0) {
    return [];
  }

  const selectedSections = [rankedSections[0]];
  const coveredTerms = collectMatchedTerms(rankedSections[0].content_lower, grepTerms);
  const fileMatchedTerms = new Set(
    rankedSections.flatMap((section) => Array.from(collectMatchedTerms(section.content_lower, grepTerms)))
  );
  if (fileMatchedTerms.size === 0) {
    return selectedSections;
  }

  for (const section of rankedSections.slice(1)) {
    if (coveredTerms.size >= fileMatchedTerms.size) {
      break;
    }
    const sectionTerms = collectMatchedTerms(section.content_lower, grepTerms);
    if (![...sectionTerms].some((term) => !coveredTerms.has(term))) {
      continue;
    }
    selectedSections.push(section);
    for (const term of sectionTerms) {
      coveredTerms.add(term);
    }
  }

  return selectedSections.sort((left, right) => left.section_index - right.section_index);
}

function selectScenarioEvidenceBundle(candidateFiles, grepTerms) {
  if (candidateFiles.length === 0) {
    return [];
  }

  const selectedFiles = [candidateFiles[0]];
  const coveredTerms = collectMatchedTerms(candidateFiles[0].content_lower, grepTerms);
  if (coveredTerms.size >= grepTerms.length) {
    return selectedFiles;
  }

  for (const file of candidateFiles.slice(1)) {
    if (coveredTerms.size >= grepTerms.length) {
      break;
    }
    const fileTerms = collectMatchedTerms(file.content_lower, grepTerms);
    if (![...fileTerms].some((term) => !coveredTerms.has(term))) {
      continue;
    }
    selectedFiles.push(file);
    for (const term of fileTerms) {
      coveredTerms.add(term);
    }
  }

  return selectedFiles;
}

function selectScenarioEvidenceBundleCostAware(candidateFiles, grepTerms) {
  if (candidateFiles.length === 0) {
    return [];
  }

  const selectedFiles = [candidateFiles[0]];
  const coveredTerms = collectMatchedTerms(candidateFiles[0].content_lower, grepTerms);
  if (coveredTerms.size >= grepTerms.length) {
    return selectedFiles;
  }

  const remainingFiles = candidateFiles.slice(1);
  while (coveredTerms.size < grepTerms.length && remainingFiles.length > 0) {
    let bestIndex = -1;
    let bestScore = -1;
    let bestGain = 0;

    for (let index = 0; index < remainingFiles.length; index += 1) {
      const file = remainingFiles[index];
      const fileTerms = collectMatchedTerms(file.content_lower, grepTerms);
      const uncoveredGain = [...fileTerms].filter((term) => !coveredTerms.has(term)).length;
      if (uncoveredGain === 0) {
        continue;
      }
      const score = uncoveredGain / Math.max(file.byte_count, 1);
      if (score > bestScore || (score === bestScore && uncoveredGain > bestGain)) {
        bestIndex = index;
        bestScore = score;
        bestGain = uncoveredGain;
      }
    }

    if (bestIndex === -1) {
      break;
    }

    const [pickedFile] = remainingFiles.splice(bestIndex, 1);
    selectedFiles.push(pickedFile);
    for (const term of collectMatchedTerms(pickedFile.content_lower, grepTerms)) {
      coveredTerms.add(term);
    }
  }

  return selectedFiles;
}

function selectScenarioClaimSupportPack(selectedFiles, title, claimGroups, targetClaimIds) {
  return selectScenarioSupportPack(selectedFiles, title, claimGroups, targetClaimIds);
}

function selectScenarioSupportPack(selectedFiles, title, supportGroups, targetSupportIds) {
  if (selectedFiles.length === 0) {
    return [];
  }

  const targetSupport =
    targetSupportIds instanceof Set
      ? new Set(targetSupportIds)
      : collectMatchedSupportIdsFromFiles(selectedFiles, supportGroups);
  if (targetSupport.size === 0) {
    return [];
  }

  const supportTerms = dedupeStrings(supportGroups.flatMap((supportGroup) => supportGroup.match_any));
  const rankedSections = rankSections(
    selectedFiles.flatMap((file) => file.sections),
    title,
    supportTerms
  );
  const selectedSections = [];
  const coveredSupport = new Set();
  while (coveredSupport.size < targetSupport.size) {
    let bestSection = null;
    let bestUncoveredSupport = [];
    let bestScore = -1;
    for (const section of rankedSections) {
      if (selectedSections.includes(section)) {
        continue;
      }
      const sectionSupport = collectMatchedSupportIds(section.content_lower, supportGroups, targetSupport);
      const uncoveredSupport = [...sectionSupport].filter((supportId) => !coveredSupport.has(supportId));
      if (uncoveredSupport.length === 0) {
        continue;
      }
      const uncoveredScore = uncoveredSupport.length / Math.max(section.byte_count, 1);
      if (uncoveredScore > bestScore) {
        bestSection = section;
        bestUncoveredSupport = uncoveredSupport;
        bestScore = uncoveredScore;
        continue;
      }
      if (uncoveredScore === bestScore && bestSection) {
        if (uncoveredSupport.length > bestUncoveredSupport.length) {
          bestSection = section;
          bestUncoveredSupport = uncoveredSupport;
          continue;
        }
        if (
          uncoveredSupport.length === bestUncoveredSupport.length &&
          compareSections(section, bestSection) < 0
        ) {
          bestSection = section;
          bestUncoveredSupport = uncoveredSupport;
        }
      }
    }
    if (!bestSection) {
      break;
    }
    selectedSections.push(bestSection);
    for (const supportId of bestUncoveredSupport) {
      coveredSupport.add(supportId);
    }
  }

  const selectedFileOrder = new Map(selectedFiles.map((file, index) => [file.path, index]));
  return selectedSections.sort(
    (left, right) =>
      (selectedFileOrder.get(left.file_path) ?? Number.MAX_SAFE_INTEGER) -
        (selectedFileOrder.get(right.file_path) ?? Number.MAX_SAFE_INTEGER) ||
      left.section_index - right.section_index
  );
}

function extractHeading(text) {
  const markdownMatch = text.match(/^#\s+(.+)$/m);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }

  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length - 1; index += 1) {
    const title = lines[index].trim();
    const underline = lines[index + 1].trim();
    if (title === "" || underline === "") {
      continue;
    }
    if (/^[=~`:#*+\-^"]+$/.test(underline) && underline.length >= title.length) {
      return title;
    }
  }

  return "";
}

function extractSections(filePath, content, fallbackHeading) {
  const lines = content.split(/\r?\n/);
  const headings = findHeadings(lines);
  if (headings.length === 0) {
    return [buildSection(filePath, fallbackHeading, content, 1)];
  }

  return headings.map((heading, index) => {
    const startLine = index === 0 ? 0 : heading.line_index;
    const nextHeading = headings[index + 1];
    const endLine = nextHeading ? nextHeading.line_index : lines.length;
    const sectionText = lines.slice(startLine, endLine).join("\n");
    return buildSection(filePath, heading.heading, sectionText, index + 1);
  });
}

function findHeadings(lines) {
  const headings = [];
  for (let index = 0; index < lines.length; index += 1) {
    const markdownMatch = lines[index].match(/^#{1,6}\s+(.+)$/);
    if (markdownMatch) {
      headings.push({ heading: markdownMatch[1].trim(), line_index: index });
      continue;
    }
    if (index < lines.length - 1) {
      const title = lines[index].trim();
      const underline = lines[index + 1].trim();
      if (title !== "" && underline !== "" && /^[=~`:#*+\-^"]+$/.test(underline) && underline.length >= title.length) {
        headings.push({ heading: title, line_index: index });
        index += 1;
      }
    }
  }
  return headings;
}

function buildSection(filePath, heading, text, sectionIndex) {
  const measured = measureText(text);
  return {
    id: `${filePath}#section-${sectionIndex}`,
    file_path: filePath,
    heading,
    normalized_heading: normalizeText(heading),
    content_lower: text.toLowerCase(),
    byte_count: measured.bytes,
    tokens_estimated: measured.tokens_estimated,
    section_index: sectionIndex
  };
}

function collectSectionsByIds(files, sectionIds) {
  const wantedIds = new Set(sectionIds ?? []);
  return files.flatMap((file) => file.sections.filter((section) => wantedIds.has(section.id)));
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function dedupeStrings(values) {
  return [...new Set((values ?? []).filter((value) => value !== ""))];
}

function compactText(text) {
  return text.replace(/\s+/g, "");
}

function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}

function contiguousSequenceOverlapRatio(queryTokens, candidateTokens) {
  if (queryTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  let bestRun = 0;
  for (let queryStart = 0; queryStart < queryTokens.length; queryStart += 1) {
    for (let candidateStart = 0; candidateStart < candidateTokens.length; candidateStart += 1) {
      let run = 0;
      while (
        queryStart + run < queryTokens.length &&
        candidateStart + run < candidateTokens.length &&
        queryTokens[queryStart + run] === candidateTokens[candidateStart + run]
      ) {
        run += 1;
      }
      if (run > bestRun) {
        bestRun = run;
      }
    }
  }
  return bestRun / queryTokens.length;
}

function overlapRatio(leftTokens, rightTokens) {
  if (leftTokens.length === 0) {
    return 0;
  }
  const rightSet = new Set(rightTokens);
  return leftTokens.filter((token) => rightSet.has(token)).length / leftTokens.length;
}

function countTermDocuments(term, corpusIndex) {
  return corpusIndex.filter((file) => file.content_lower.includes(term)).length;
}

function scoreSection(section, title, grepTerms) {
  const normalizedTitle = normalizeText(title);
  const titleTokens = tokenize(normalizedTitle);
  const titleExactHeading = normalizedTitle !== "" && section.normalized_heading === normalizedTitle ? 1 : 0;
  const titleTokenOverlap = overlapRatio(titleTokens, tokenize(section.normalized_heading));
  let matchedTermCount = 0;
  let totalTermHits = 0;

  for (const term of grepTerms) {
    const hits = countOccurrences(section.content_lower, term);
    if (hits > 0) {
      matchedTermCount += 1;
      totalTermHits += hits;
    }
  }

  return {
    title_exact_heading: titleExactHeading,
    title_token_overlap: titleTokenOverlap,
    matched_term_count: matchedTermCount,
    total_term_hits: totalTermHits
  };
}

function compareSections(left, right) {
  return (
    right.section_score.title_exact_heading - left.section_score.title_exact_heading ||
    right.section_score.title_token_overlap - left.section_score.title_token_overlap ||
    right.section_score.matched_term_count - left.section_score.matched_term_count ||
    right.section_score.total_term_hits - left.section_score.total_term_hits ||
    left.byte_count - right.byte_count ||
    left.section_index - right.section_index
  );
}
