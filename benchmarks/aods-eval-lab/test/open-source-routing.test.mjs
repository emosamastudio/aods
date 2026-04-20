import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { evaluateOpenSourceRouting } from "../src/open-source-routing.mjs";

test("open-source routing ranks targets deterministically on lexical seeds", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "security.md"),
      "# Security model\n\nThe security model defines roles and permissions.\n\n## Operators\n\nOperators review audit evidence.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "a-release.md"),
      "# Release notes\n\nRelease cadence release cadence release cadence.\n\n## Notes\n\nBranch branch branch.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "b-target.md"),
      "# Release process and cadence\n\nRelease cadence branch.\n\n## Checklist\n\nValidate changelog before release.\n"
    );
    fs.writeFileSync(path.join(corpusRoot, "docs", "notes.md"), "# Notes\n\nNothing relevant.\n");
    fs.mkdirSync(path.join(corpusRoot, "docs", "a-ops", "upgrade"), { recursive: true });
    fs.mkdirSync(path.join(corpusRoot, "docs", "z-admin", "upgrading"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "a-ops", "upgrade", "index.md"),
      "# Upgrade notes\n\nAdmin upgrade checklist rollout.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "z-admin", "upgrading", "index.md"),
      "# Upgrade notes\n\nAdmin upgrade checklist rollout.\n\n## Windows\n\nSchedule the upgrading window.\n"
    );
    fs.mkdirSync(path.join(corpusRoot, "docs", "operator-manual"), { recursive: true });
    fs.mkdirSync(path.join(corpusRoot, "docs", "user-guide", "commands"), { recursive: true });
    fs.mkdirSync(path.join(corpusRoot, "docs", "developer-guide", "architecture"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "operator-manual", "architecture.md"),
      "# Architectural overview\n\nThis operator manual architecture describes the API server, repository server, and application controller.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "user-guide", "commands", "disable-manual-sync.md"),
      "# Disable manual sync reference\n\nManual sync command touching the API server, repository server, and application controller.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "user-guide", "commands", "enable-manual-sync.md"),
      "# Enable manual sync reference\n\nManual sync command touching the API server, repository server, and application controller.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "developer-guide", "architecture", "components.md"),
      "# Component architecture\n\nArchitecture components include the API server, repository server, and application controller.\n"
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo",
          label: "Demo",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-security",
              title: "Security model",
              path: "docs/security.md",
              scenario_class: "security-governance",
              grep_terms: ["security model", "roles"]
            },
            {
              id: "demo-tie-break",
              title: "Release process and cadence",
              path: "docs/b-target.md",
              scenario_class: "release-governance",
              grep_terms: ["release", "cadence"]
            },
            {
              id: "demo-zero-hit",
              title: "Missing lexical seed",
              path: "docs/notes.md",
              scenario_class: "ops-architecture",
              grep_terms: ["scheduler", "workers"]
            },
            {
              id: "demo-structure-path",
              title: "admin upgrading",
              path: "docs/z-admin/upgrading/index.md",
              scenario_class: "upgrade-governance",
              grep_terms: ["admin", "upgrade", "checklist"]
            },
            {
              id: "demo-operator-architecture",
              title: "Operator manual architecture",
              path: "docs/operator-manual/architecture.md",
              scenario_class: "ops-architecture",
              grep_terms: ["architecture", "repo server", "application controller", "api server"],
              answer_support: [
                {
                  id: "architecture",
                  match_any: ["architecture"]
                },
                {
                  id: "repo-server",
                  match_any: ["repo server", "repository server"]
                },
                {
                  id: "application-controller",
                  match_any: ["application controller"]
                },
               {
                 id: "api-server",
                 match_any: ["api server"]
                }
               ],
               answer_authority: {
                 allowed_path_prefixes: ["docs/operator-manual/architecture.md"]
               }
             }
           ]
         }
       ]
    });

    assert.equal(results.corpus_count, 1);
    assert.equal(results.scenario_count, 5);
    assert.equal(results.zero_hit_rate, 1 / 5);
    assert.ok(results.median_candidate_file_count >= 1);
    assert.ok(results.mean_target_term_coverage > 0.5);
    assert.ok(results.seed_title_rerank.top_1_hit_rate > results.top_1_hit_rate);
    assert.ok(results.seed_title_rerank.mean_reciprocal_rank > results.mean_reciprocal_rank);
    assert.ok(results.improvement.top_1_hit_rate_delta > 0);
    assert.ok(results.improvement.promoted_to_top_1_count >= 1);
    assert.ok(results.structure_aware_rerank.top_1_hit_rate >= results.seed_title_rerank.top_1_hit_rate);
    assert.ok(results.structure_aware_rerank.mean_reciprocal_rank >= results.seed_title_rerank.mean_reciprocal_rank);
    assert.ok(results.structure_aware_improvement.top_1_hit_rate_delta > 0);
    assert.ok(results.structure_aware_improvement.promoted_to_top_1_count >= 2);
    assert.ok(results.path_family_rerank.top_1_hit_rate >= results.structure_aware_rerank.top_1_hit_rate);
    assert.ok(results.path_family_rerank.mean_reciprocal_rank >= results.structure_aware_rerank.mean_reciprocal_rank);
    assert.ok(results.path_family_improvement.top_1_hit_rate_delta >= results.structure_aware_improvement.top_1_hit_rate_delta);
    assert.ok(results.path_family_delta_vs_structure_aware.top_1_hit_rate_delta > 0);
    assert.equal(results.path_family_delta_vs_structure_aware.promoted_to_top_1_count, 1);
    assert.ok(results.api_surface_rerank.top_1_hit_rate >= results.path_family_rerank.top_1_hit_rate);
    assert.ok(results.api_surface_rerank.mean_reciprocal_rank >= results.path_family_rerank.mean_reciprocal_rank);
    assert.ok(results.api_surface_delta_vs_path_family.top_1_hit_rate_delta >= 0);
    assert.ok(results.section_context.section_hit_rate >= results.api_surface_rerank.top_1_hit_rate);
    assert.equal(results.section_context.section_hit_given_correct_file_rate, 1);
    assert.ok(results.section_context.median_selected_section_bytes > 0);
    assert.ok(results.section_context.median_selected_section_bytes < results.api_surface_rerank.median_top_1_bytes);
    assert.ok(results.section_context.median_context_reduction_vs_top_file > 0);
    assert.equal(results.section_evidence_pack.full_file_evidence_retention_rate, 1);
    assert.equal(results.section_evidence_pack.mean_pack_term_recall_vs_top_file, 1);
    assert.ok(results.section_evidence_pack.median_selected_pack_section_count >= 1);
    assert.ok(results.section_evidence_pack.median_selected_pack_bytes >= results.section_context.median_selected_section_bytes);
    assert.ok(results.section_evidence_pack.median_selected_pack_bytes < results.api_surface_rerank.median_top_1_bytes);
    assert.ok(results.scenario_evidence_bundle.mean_bundle_term_coverage >= results.scenario_evidence_bundle.mean_top_file_term_coverage);
    assert.ok(results.scenario_evidence_bundle.mean_bundle_term_gain_vs_top_file >= 0);
    assert.ok(results.scenario_evidence_bundle.median_selected_bundle_file_count >= 0);
    assert.ok(
      results.scenario_cost_aware_bundle.mean_bundle_term_coverage >=
        results.scenario_evidence_bundle.mean_bundle_term_coverage
    );
    assert.ok(
      results.scenario_cost_aware_bundle.full_scenario_term_coverage_rate >=
        results.scenario_evidence_bundle.full_scenario_term_coverage_rate
    );
    assert.ok(
      results.scenario_cost_aware_bundle.median_selected_bundle_bytes <=
        results.scenario_evidence_bundle.median_selected_bundle_bytes
    );
    assert.equal(results.scenario_cost_aware_bundle_delta_vs_rank.worsened_coverage_count, 0);
    assert.equal(results.scenario_term_reachability.full_reachable_term_coverage_rate, 1);
    assert.equal(results.scenario_term_reachability.scenarios_with_unreachable_terms_rate, 2 / 5);
    assert.equal(results.scenario_term_reachability.exact_gap_explained_by_unreachable_terms_rate, 2 / 5);
    assert.ok(
      results.scenario_claim_support.mean_claim_support_coverage >=
        results.scenario_cost_aware_bundle.mean_bundle_term_coverage
    );
    assert.ok(
      results.scenario_claim_support.full_claim_support_rate >=
        results.scenario_cost_aware_bundle.full_scenario_term_coverage_rate
    );
    assert.equal(results.scenario_claim_support.exact_gap_recovered_rate, 1 / 5);
    assert.equal(results.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate, 1);
    assert.equal(results.scenario_claim_support_pack.mean_pack_claim_support_recall_vs_bundle, 1);
    assert.ok(
      results.scenario_claim_support_pack.full_claim_support_rate >=
        results.scenario_cost_aware_bundle.full_scenario_term_coverage_rate
    );
    assert.ok(
      results.scenario_claim_support_pack.median_selected_pack_bytes <=
        results.scenario_cost_aware_bundle.median_selected_bundle_bytes
    );
    assert.equal(
      results.scenario_answer_check.full_answer_check_rate,
      results.scenario_claim_support_pack.full_claim_support_rate
    );
    assert.equal(results.scenario_answer_check.mean_answer_check_gain_vs_claim_support, 0);
    assert.equal(results.scenario_answer_authority.scoped_scenario_count, 1);
    assert.equal(results.scenario_answer_authority.full_authority_scoped_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority.out_of_scope_answer_recovery_rate, 0);
    assert.equal(results.scenario_answer_authority_reachability.scoped_scenario_count, 1);
    assert.equal(results.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_reachability.authority_gap_explained_by_reachability_rate, 0);
    assert.equal(results.scenario_answer_authority_pack.scoped_scenario_count, 1);
    assert.equal(results.scenario_answer_authority_pack.full_authority_pack_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack, 0);
    assert.equal(results.scenario_answer_authority_local_family.strict_file_scope_scenario_count, 1);
    assert.equal(results.scenario_answer_authority_local_family.full_local_family_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate, 0);
    assert.equal(results.scenario_answer_authority_local_family_pack.strict_file_scope_scenario_count, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.full_local_family_pack_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope, 0);
    assert.ok(
      results.scenario_answer_locality.full_target_local_answer_check_rate <=
        results.scenario_answer_check.full_answer_check_rate
    );
    assert.ok(results.scenario_answer_locality.mean_cross_file_answer_check_gain >= 0);

    const security = results.scenario_results.find((scenario) => scenario.id === "demo-security");
    assert.equal(security.target_rank, 1);
    assert.equal(security.top_1_hit, true);
    assert.deepEqual(security.top_candidates.map((candidate) => candidate.path), ["docs/security.md"]);

    const tieBreak = results.scenario_results.find((scenario) => scenario.id === "demo-tie-break");
    assert.equal(tieBreak.target_rank, 2);
    assert.equal(tieBreak.top_1_hit, false);
    assert.equal(tieBreak.top_3_hit, true);
    assert.deepEqual(
      tieBreak.top_candidates.map((candidate) => candidate.path),
      ["docs/a-release.md", "docs/b-target.md"]
    );
    const rerankedTieBreak = results.seed_title_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-tie-break"
    );
    assert.equal(rerankedTieBreak.target_rank, 1);
    assert.equal(rerankedTieBreak.top_1_hit, true);
    assert.deepEqual(
      rerankedTieBreak.top_candidates.map((candidate) => candidate.path),
      ["docs/b-target.md", "docs/a-release.md"]
    );
    const structurePath = results.scenario_results.find((scenario) => scenario.id === "demo-structure-path");
    assert.equal(structurePath.target_rank, 2);
    assert.equal(structurePath.top_1_hit, false);
    const seedTitleStructurePath = results.seed_title_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-structure-path"
    );
    assert.equal(seedTitleStructurePath.target_rank, 2);
    assert.equal(seedTitleStructurePath.top_1_hit, false);
    const structureAwarePath = results.structure_aware_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-structure-path"
    );
    assert.equal(structureAwarePath.target_rank, 1);
    assert.equal(structureAwarePath.top_1_hit, true);
    assert.deepEqual(
      structureAwarePath.top_candidates.slice(0, 2).map((candidate) => candidate.path),
      ["docs/z-admin/upgrading/index.md", "docs/a-ops/upgrade/index.md"]
    );
    const structureAwareArchitecture = results.structure_aware_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.notEqual(structureAwareArchitecture.target_rank, 1);
    const pathFamilyArchitecture = results.path_family_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(pathFamilyArchitecture.target_rank, 1);
    assert.equal(pathFamilyArchitecture.top_1_hit, true);
    assert.deepEqual(pathFamilyArchitecture.top_candidates[0].path, "docs/operator-manual/architecture.md");
    const apiSurfaceArchitecture = results.api_surface_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(apiSurfaceArchitecture.target_rank, 1);
    assert.equal(apiSurfaceArchitecture.top_1_hit, true);
    assert.deepEqual(apiSurfaceArchitecture.top_candidates[0].path, "docs/operator-manual/architecture.md");
    const sectionTieBreak = results.section_context.scenario_results.find((scenario) => scenario.id === "demo-tie-break");
    assert.equal(sectionTieBreak.file_top_1_hit, true);
    assert.equal(sectionTieBreak.section_match, true);
    assert.equal(sectionTieBreak.selected_section_heading, "Release process and cadence");
    assert.ok(sectionTieBreak.selected_section_bytes < results.api_surface_rerank.scenario_results.find(
      (scenario) => scenario.id === "demo-tie-break"
    ).top_candidates[0].byte_count);
    const sectionStructurePath = results.section_context.scenario_results.find(
      (scenario) => scenario.id === "demo-structure-path"
    );
    assert.equal(sectionStructurePath.file_top_1_hit, true);
    assert.equal(sectionStructurePath.section_match, true);
    assert.equal(sectionStructurePath.selected_section_heading, "Upgrade notes");
    const sectionArchitecture = results.section_context.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(sectionArchitecture.file_top_1_hit, true);
    assert.equal(sectionArchitecture.section_match, true);
    assert.equal(sectionArchitecture.selected_section_heading, "Architectural overview");
    const evidencePackArchitecture = results.section_evidence_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(evidencePackArchitecture.file_top_1_hit, true);
    assert.equal(evidencePackArchitecture.pack_term_recall_vs_top_file, 1);
    assert.ok(evidencePackArchitecture.selected_section_count >= 1);
    const scenarioBundleArchitecture = results.scenario_evidence_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(scenarioBundleArchitecture.covers_all_scenario_terms, false);
    assert.equal(scenarioBundleArchitecture.bundle_term_coverage, 0.75);
    assert.equal(scenarioBundleArchitecture.selected_file_count, 1);
    const costAwareBundleArchitecture = results.scenario_cost_aware_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(costAwareBundleArchitecture.covers_all_scenario_terms, false);
    assert.equal(costAwareBundleArchitecture.bundle_term_coverage, 0.75);
    assert.equal(costAwareBundleArchitecture.selected_file_count, 1);
    const reachabilityArchitecture = results.scenario_term_reachability.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.deepEqual(reachabilityArchitecture.unreachable_terms, ["repo server"]);
    assert.equal(reachabilityArchitecture.reachable_term_coverage, 1);
    assert.equal(reachabilityArchitecture.exact_gap_explained_by_unreachable_terms, true);
    const claimSupportArchitecture = results.scenario_claim_support.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(claimSupportArchitecture.claim_support_coverage, 1);
    assert.equal(claimSupportArchitecture.exact_gap_recovered, true);
    assert.equal(claimSupportArchitecture.claim_results[1].matched_alias, "repository server");
    const claimSupportPackArchitecture = results.scenario_claim_support_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(claimSupportPackArchitecture.claim_support_coverage, 1);
    assert.equal(claimSupportPackArchitecture.pack_claim_support_recall_vs_bundle, 1);
    assert.equal(claimSupportPackArchitecture.pack_covers_bundle_claim_support, true);
    assert.ok(claimSupportPackArchitecture.selected_section_count >= 1);
    const answerCheckArchitecture = results.scenario_answer_check.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(answerCheckArchitecture.answer_check_coverage, 1);
    assert.equal(answerCheckArchitecture.claim_gap_recovered, false);
    const answerLocalityArchitecture = results.scenario_answer_locality.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(answerLocalityArchitecture.target_local_answer_check_coverage, 1);
    assert.equal(answerLocalityArchitecture.cross_file_answer_recovered, false);
    const answerAuthorityArchitecture = results.scenario_answer_authority.scenario_results.find(
      (scenario) => scenario.id === "demo-operator-architecture"
    );
    assert.equal(answerAuthorityArchitecture.authority_scope_declared, true);
    assert.equal(answerAuthorityArchitecture.authority_scoped_answer_check_coverage, 1);
    assert.equal(answerAuthorityArchitecture.requires_out_of_scope_evidence, false);
    const answerAuthorityReachabilityArchitecture =
      results.scenario_answer_authority_reachability.scenario_results.find(
        (scenario) => scenario.id === "demo-operator-architecture"
      );
    assert.equal(answerAuthorityReachabilityArchitecture.authority_reachable_answer_check_coverage, 1);
    assert.equal(answerAuthorityReachabilityArchitecture.authority_reachable_gain_vs_scoped_pack, 0);
    assert.equal(answerAuthorityReachabilityArchitecture.authority_gap_explained_by_reachability, false);

    const zeroHit = results.scenario_results.find((scenario) => scenario.id === "demo-zero-hit");
    assert.equal(zeroHit.target_rank, null);
    assert.equal(zeroHit.candidate_file_count, 0);
    assert.deepEqual(zeroHit.top_candidates, []);
    const zeroHitSection = results.section_context.scenario_results.find((scenario) => scenario.id === "demo-zero-hit");
    assert.equal(zeroHitSection.section_match, false);
    assert.equal(zeroHitSection.selected_section_id, null);
    const zeroHitEvidencePack = results.section_evidence_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitEvidencePack.selected_section_count, 0);
    const zeroHitScenarioBundle = results.scenario_evidence_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitScenarioBundle.selected_file_count, 0);
    const zeroHitCostAwareBundle = results.scenario_cost_aware_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitCostAwareBundle.selected_file_count, 0);
    const zeroHitReachability = results.scenario_term_reachability.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.deepEqual(zeroHitReachability.reachable_terms, []);
    assert.deepEqual(zeroHitReachability.unreachable_terms, ["scheduler", "workers"]);
    assert.equal(zeroHitReachability.reachable_term_coverage, 1);
    assert.equal(zeroHitReachability.exact_gap_explained_by_unreachable_terms, true);
    const zeroHitClaimSupport = results.scenario_claim_support.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitClaimSupport.claim_support_coverage, 0);
    assert.equal(zeroHitClaimSupport.covers_all_claim_support, false);
    const zeroHitClaimSupportPack = results.scenario_claim_support_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitClaimSupportPack.selected_section_count, 0);
    assert.equal(zeroHitClaimSupportPack.claim_support_coverage, 0);
    assert.equal(zeroHitClaimSupportPack.pack_covers_bundle_claim_support, true);
    const zeroHitAnswerCheck = results.scenario_answer_check.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitAnswerCheck.answer_check_coverage, 0);
    assert.equal(zeroHitAnswerCheck.covers_all_answer_checks, false);
    const zeroHitAnswerLocality = results.scenario_answer_locality.scenario_results.find(
      (scenario) => scenario.id === "demo-zero-hit"
    );
    assert.equal(zeroHitAnswerLocality.target_local_answer_check_coverage, 0);
    assert.equal(zeroHitAnswerLocality.requires_cross_file_evidence, false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing api-surface rerank recovers API sibling collisions", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-api-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference", "api"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "authenticators.md"),
      "# Authenticators\n\nAuthenticators overview covering LocalAuthenticator and DummyAuthenticator.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "api", "auth.md"),
      "# Authenticators\n\n## Module: jupyterhub.auth\n\n.. autoconfigurable:: LocalAuthenticator\n\nAPI reference for LocalAuthenticator traitlets.\n"
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-api",
          label: "Demo API",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-api-surface",
              title: "Authenticators",
              path: "docs/reference/api/auth.md",
              scenario_class: "api-reference",
              grep_terms: ["authenticators", "localauthenticator", "autoconfigurable"]
            }
          ]
        }
      ]
    });

    const pathFamily = results.path_family_rerank.scenario_results.find((scenario) => scenario.id === "demo-api-surface");
    assert.equal(pathFamily.target_rank, 2);
    assert.equal(pathFamily.top_1_hit, false);
    assert.deepEqual(pathFamily.top_candidates.map((candidate) => candidate.path), [
      "docs/reference/authenticators.md",
      "docs/reference/api/auth.md"
    ]);

    const apiSurface = results.api_surface_rerank.scenario_results.find((scenario) => scenario.id === "demo-api-surface");
    assert.equal(apiSurface.target_rank, 1);
    assert.equal(apiSurface.top_1_hit, true);
    assert.deepEqual(apiSurface.top_candidates.map((candidate) => candidate.path), [
      "docs/reference/api/auth.md",
      "docs/reference/authenticators.md"
    ]);
    assert.equal(results.api_surface_delta_vs_path_family.promoted_to_top_1_count, 1);
    assert.equal(results.section_context.section_hit_rate, 1);
    const evidencePack = results.section_evidence_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-api-surface"
    );
    assert.equal(evidencePack.pack_term_recall_vs_top_file, 1);
    assert.equal(evidencePack.selected_section_count, 2);
    assert.deepEqual(evidencePack.selected_section_headings, ["Authenticators", "Module: jupyterhub.auth"]);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing scenario-evidence bundle widens coverage across top candidates", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-bundle-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "operations.md"),
      "# Operational overview\n\nDeployment monitoring guidance for operators.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "incidents-big.md"),
      "# Incident response\n\nIncident escalation guidance.\n\nIncident incident incident incident incident incident.\n"
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "incidents-small.md"),
      "# Incident quick reference\n\nIncident runbook.\n"
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-bundle",
          label: "Demo Bundle",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-scenario-bundle",
              title: "Operational overview",
              path: "docs/reference/operations.md",
              scenario_class: "ops-architecture",
              grep_terms: ["deployment", "monitoring", "incident"]
            }
          ]
        }
      ]
    });

    const scenarioBundle = results.scenario_evidence_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-scenario-bundle"
    );
    assert.equal(scenarioBundle.top_file_term_coverage, 2 / 3);
    assert.equal(scenarioBundle.bundle_term_coverage, 1);
    assert.equal(scenarioBundle.bundle_term_gain_vs_top_file, 1 / 3);
    assert.equal(scenarioBundle.selected_file_count, 2);
    assert.deepEqual(scenarioBundle.selected_file_paths, [
      "docs/reference/operations.md",
      "docs/reference/incidents-big.md"
    ]);
    assert.equal(results.scenario_evidence_bundle.full_scenario_term_coverage_rate, 1);
    const costAwareBundle = results.scenario_cost_aware_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-scenario-bundle"
    );
    assert.equal(costAwareBundle.top_file_term_coverage, 2 / 3);
    assert.equal(costAwareBundle.bundle_term_coverage, 1);
    assert.equal(costAwareBundle.bundle_term_gain_vs_top_file, 1 / 3);
    assert.equal(costAwareBundle.selected_file_count, 2);
    assert.deepEqual(costAwareBundle.selected_file_paths, [
      "docs/reference/operations.md",
      "docs/reference/incidents-small.md"
    ]);
    assert.ok(costAwareBundle.selected_bundle_bytes < scenarioBundle.selected_bundle_bytes);
    assert.equal(results.scenario_cost_aware_bundle.full_scenario_term_coverage_rate, 1);
    assert.equal(results.scenario_cost_aware_bundle_delta_vs_rank.worsened_coverage_count, 0);
    assert.equal(results.scenario_cost_aware_bundle_delta_vs_rank.reduced_bytes_count, 1);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing reachability audit separates unreachable phrases from retrieval misses", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-reachability-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "ops.md"),
      "# Ops reference\n\nDeployment monitoring guidance for operators.\n"
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-reachability",
          label: "Demo Reachability",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-reachability-audit",
              title: "Ops reference",
              path: "docs/reference/ops.md",
              scenario_class: "ops-architecture",
              grep_terms: ["deployment", "monitoring", "focus areas"]
            }
          ]
        }
      ]
    });

    const costAwareBundle = results.scenario_cost_aware_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-reachability-audit"
    );
    assert.equal(costAwareBundle.bundle_term_coverage, 2 / 3);
    const reachability = results.scenario_term_reachability.scenario_results.find(
      (scenario) => scenario.id === "demo-reachability-audit"
    );
    assert.deepEqual(reachability.reachable_terms, ["deployment", "monitoring"]);
    assert.deepEqual(reachability.unreachable_terms, ["focus areas"]);
    assert.equal(reachability.reachable_term_coverage, 1);
    assert.equal(reachability.covers_all_reachable_terms, true);
    assert.equal(reachability.exact_gap_explained_by_unreachable_terms, true);
    assert.equal(results.scenario_term_reachability.full_reachable_term_coverage_rate, 1);
    assert.equal(results.scenario_term_reachability.scenarios_with_unreachable_terms_rate, 1);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing answer-check lane recovers concrete answers beyond claim wording gaps", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-answer-check-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "releasing.md"),
      [
        "# Releasing",
        "",
        "## Introduction",
        "General release overview.",
        "",
        "## Checklist",
        "Release automation uses GitHub Actions.",
        "The target release branch must already exist before triggering the release.",
        "Update CHANGELOG.md and VERSION file before starting the automation."
      ].join("\n")
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-answer-check",
          label: "Demo Answer Check",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-answer-check-scenario",
              title: "Releasing",
              path: "docs/reference/releasing.md",
              scenario_class: "release-operations",
              grep_terms: ["releasing", "release manager", "changelog", "version"],
              answer_checks: [
                { id: "release-automation", match_any: ["github actions", "release automation"] },
                { id: "release-branch", match_any: ["release branch"] },
                { id: "changelog", match_any: ["changelog"] },
                { id: "version", match_any: ["version file", "version"] }
              ],
              answer_authority: {
                allowed_path_prefixes: ["docs/reference/"]
              }
            }
          ]
        }
      ]
    });

    const claimSupport = results.scenario_claim_support.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-check-scenario"
    );
    const answerCheck = results.scenario_answer_check.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-check-scenario"
    );

    assert.equal(claimSupport.claim_support_coverage, 0.75);
    assert.equal(answerCheck.answer_check_coverage, 1);
    assert.equal(answerCheck.answer_check_gain_vs_claim_support, 0.25);
    assert.equal(answerCheck.claim_gap_recovered, true);
    assert.equal(answerCheck.exact_gap_recovered, true);
    assert.equal(results.scenario_answer_check.full_answer_check_rate, 1);
    assert.equal(results.scenario_answer_check.claim_gap_recovered_rate, 1);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing answer-locality audit exposes cross-file answer dependence", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-answer-locality-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "releasing.md"),
      [
        "# Releasing",
        "",
        "## Checklist",
        "Release automation uses GitHub Actions.",
        "Update CHANGELOG.md and VERSION file before starting the automation."
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "release-branches.md"),
      [
        "# Release branches",
        "",
        "## Branch policy",
        "The target release branch must already exist before triggering the release."
      ].join("\n")
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-answer-locality",
          label: "Demo Answer Locality",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-answer-locality-scenario",
              title: "Releasing",
              path: "docs/reference/releasing.md",
              scenario_class: "release-operations",
              grep_terms: ["releasing", "changelog", "version", "branch"],
              answer_support: [
                { id: "release-automation", match_any: ["github actions", "release automation"] },
                { id: "release-branch", match_any: ["release branch"] },
                { id: "changelog", match_any: ["changelog"] },
                { id: "version", match_any: ["version file", "version"] }
              ],
              answer_checks: [
                { id: "release-automation", match_any: ["github actions", "release automation"] },
                { id: "release-branch", match_any: ["release branch"] },
                { id: "changelog", match_any: ["changelog"] },
                { id: "version", match_any: ["version file", "version"] }
              ],
              answer_authority: {
                allowed_path_prefixes: ["docs/reference/"]
              }
            }
          ]
        }
      ]
    });

    const claimSupportPack = results.scenario_claim_support_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-locality-scenario"
    );
    const answerCheck = results.scenario_answer_check.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-locality-scenario"
    );
    const answerLocality = results.scenario_answer_locality.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-locality-scenario"
    );
    const answerAuthority = results.scenario_answer_authority.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-locality-scenario"
    );
    const answerAuthorityReachability = results.scenario_answer_authority_reachability.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-locality-scenario"
    );
    const answerAuthorityPack = results.scenario_answer_authority_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-locality-scenario"
    );

    assert.equal(claimSupportPack.selected_file_count, 2);
    assert.equal(answerCheck.answer_check_coverage, 1);
    assert.equal(answerLocality.target_local_answer_check_coverage, 0.75);
    assert.equal(answerLocality.cross_file_answer_check_gain, 0.25);
    assert.equal(answerLocality.requires_cross_file_evidence, true);
    assert.equal(answerLocality.cross_file_answer_recovered, true);
    assert.deepEqual(answerLocality.cross_file_only_answer_check_ids, ["release-branch"]);
    assert.equal(answerAuthority.authority_scope_declared, true);
    assert.equal(answerAuthority.authority_scoped_answer_check_coverage, 1);
    assert.equal(answerAuthority.requires_out_of_scope_evidence, false);
    assert.equal(answerAuthorityReachability.authority_reachable_answer_check_coverage, 1);
    assert.equal(answerAuthorityReachability.authority_reachable_gain_vs_scoped_pack, 0);
    assert.equal(answerAuthorityReachability.authority_gap_explained_by_reachability, false);
    assert.equal(answerAuthorityPack.authority_pack_answer_check_coverage, 1);
    assert.equal(answerAuthorityPack.authority_pack_gain_vs_scoped_pack, 0);
    assert.equal(answerAuthorityPack.authority_pack_recall_vs_reachable, 1);
    assert.equal(answerAuthorityPack.authority_pack_preserves_reachable_answer_support, true);
    assert.equal(results.scenario_answer_locality.full_target_local_answer_check_rate, 0);
    assert.equal(results.scenario_answer_locality.cross_file_answer_recovery_rate, 1);
    assert.equal(results.scenario_answer_authority.full_authority_scoped_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate, 1);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing answer-authority audit exposes out-of-scope answer dependence", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-answer-authority-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "releasing.md"),
      [
        "# Releasing",
        "",
        "## Checklist",
        "Release automation uses GitHub Actions.",
        "Update CHANGELOG.md and VERSION file before starting the automation."
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "release-branches.md"),
      [
        "# Release branches",
        "",
        "## Branch policy",
        "The target release branch must already exist before triggering the release."
      ].join("\n")
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-answer-authority",
          label: "Demo Answer Authority",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-answer-authority-scenario",
              title: "Releasing",
              path: "docs/reference/releasing.md",
              scenario_class: "release-operations",
              grep_terms: ["releasing", "changelog", "version", "branch"],
              answer_checks: [
                { id: "release-automation", match_any: ["github actions", "release automation"] },
                { id: "release-branch", match_any: ["release branch"] },
                { id: "changelog", match_any: ["changelog"] },
                { id: "version", match_any: ["version file", "version"] }
              ],
              answer_authority: {
                allowed_path_prefixes: ["docs/reference/releasing.md"]
              }
            }
          ]
        }
      ]
    });

    const answerAuthority = results.scenario_answer_authority.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-authority-scenario"
    );
    const answerAuthorityReachability = results.scenario_answer_authority_reachability.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-authority-scenario"
    );
    const answerAuthorityPack = results.scenario_answer_authority_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-authority-scenario"
    );
    const answerAuthorityLocalFamily = results.scenario_answer_authority_local_family.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-authority-scenario"
    );
    const answerAuthorityLocalFamilyPack = results.scenario_answer_authority_local_family_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-answer-authority-scenario"
    );

    assert.equal(answerAuthority.authority_scope_declared, true);
    assert.equal(answerAuthority.authority_scoped_answer_check_coverage, 0.75);
    assert.equal(answerAuthority.out_of_scope_answer_check_gain, 0.25);
    assert.equal(answerAuthority.requires_out_of_scope_evidence, true);
    assert.equal(answerAuthority.out_of_scope_answer_recovered, true);
    assert.deepEqual(answerAuthority.out_of_scope_only_answer_check_ids, ["release-branch"]);
    assert.equal(
      answerAuthority.answer_check_authority_results.find((item) => item.id === "release-branch")?.authority_supported,
      false
    );
    assert.equal(answerAuthorityReachability.authority_reachable_answer_check_coverage, 0.75);
    assert.equal(answerAuthorityReachability.authority_reachable_gain_vs_scoped_pack, 0);
    assert.equal(answerAuthorityReachability.authority_gap_explained_by_reachability, false);
    assert.equal(answerAuthorityPack.authority_pack_answer_check_coverage, 0.75);
    assert.equal(answerAuthorityPack.authority_pack_gain_vs_scoped_pack, 0);
    assert.equal(answerAuthorityPack.authority_pack_recall_vs_reachable, 1);
    assert.deepEqual(answerAuthorityPack.authority_pack_missed_reachable_answer_check_ids, []);
    assert.equal(answerAuthorityLocalFamily.strict_target_file_authority_scope, true);
    assert.equal(answerAuthorityLocalFamily.local_family_answer_check_coverage, 1);
    assert.equal(answerAuthorityLocalFamily.local_family_gain_vs_authority_scope, 0.25);
    assert.equal(answerAuthorityLocalFamily.authority_gap_explained_by_local_family, true);
    assert.deepEqual(answerAuthorityLocalFamily.local_family_only_answer_check_ids, ["release-branch"]);
    assert.equal(answerAuthorityLocalFamilyPack.local_family_pack_answer_check_coverage, 1);
    assert.equal(answerAuthorityLocalFamilyPack.local_family_pack_gain_vs_authority_scope, 0.25);
    assert.equal(answerAuthorityLocalFamilyPack.local_family_pack_recall_vs_supported, 1);
    assert.equal(answerAuthorityLocalFamilyPack.local_family_pack_preserves_supported_answer_support, true);
    assert.deepEqual(answerAuthorityLocalFamilyPack.local_family_pack_only_answer_check_ids, ["release-branch"]);
    assert.deepEqual(answerAuthorityLocalFamilyPack.local_family_pack_missed_supported_answer_check_ids, []);
    assert.equal(results.scenario_answer_authority.full_authority_scoped_answer_check_rate, 0);
    assert.equal(results.scenario_answer_authority.out_of_scope_answer_recovery_rate, 1);
    assert.equal(results.scenario_answer_authority.scenarios_requiring_out_of_scope_evidence_rate, 1);
    assert.equal(results.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate, 0);
    assert.equal(results.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.full_authority_pack_answer_check_rate, 0);
    assert.equal(results.scenario_answer_authority_local_family.full_local_family_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family.authority_gap_explained_by_local_family_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family.scenarios_with_missing_local_family_answer_support_rate, 0);
    assert.equal(results.scenario_answer_authority_local_family_pack.full_local_family_pack_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope, 0.25);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing local-family pack preserves nearby answer support while shrinking sibling scope", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-local-family-pack-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "releasing.md"),
      [
        "# Releasing",
        "",
        "## Checklist",
        "Release automation uses GitHub Actions.",
        "Update CHANGELOG.md and VERSION file before starting the automation.",
        "",
        "## Filler",
        "This section is unrelated noise repeated multiple times to make the full local-family scope materially larger.",
        "This section is unrelated noise repeated multiple times to make the full local-family scope materially larger.",
        "This section is unrelated noise repeated multiple times to make the full local-family scope materially larger."
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "release-branches.md"),
      [
        "# Release branches",
        "",
        "## Branch policy",
        "The target release branch must already exist before triggering the release."
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "troubleshooting.md"),
      [
        "# Troubleshooting",
        "",
        "## Noise",
        "This troubleshooting page is intentionally unrelated noise repeated multiple times.",
        "This troubleshooting page is intentionally unrelated noise repeated multiple times.",
        "This troubleshooting page is intentionally unrelated noise repeated multiple times."
      ].join("\n")
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-local-family-pack",
          label: "Demo Local Family Pack",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-local-family-pack-scenario",
              title: "Releasing",
              path: "docs/reference/releasing.md",
              scenario_class: "release-operations",
              grep_terms: ["releasing", "changelog", "version", "branch"],
              answer_checks: [
                { id: "release-automation", match_any: ["github actions", "release automation"] },
                { id: "release-branch", match_any: ["release branch"] },
                { id: "changelog", match_any: ["changelog"] },
                { id: "version", match_any: ["version file", "version"] }
              ],
              answer_authority: {
                allowed_path_prefixes: ["docs/reference/releasing.md"]
              }
            }
          ]
        }
      ]
    });

    const localFamily = results.scenario_answer_authority_local_family.scenario_results.find(
      (scenario) => scenario.id === "demo-local-family-pack-scenario"
    );
    const localFamilyPack = results.scenario_answer_authority_local_family_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-local-family-pack-scenario"
    );

    assert.equal(localFamily.local_family_answer_check_coverage, 1);
    assert.equal(localFamily.authority_gap_explained_by_local_family, true);
    assert.equal(localFamilyPack.local_family_pack_answer_check_coverage, 1);
    assert.equal(localFamilyPack.local_family_pack_gain_vs_authority_scope, 0.25);
    assert.equal(localFamilyPack.local_family_pack_recall_vs_supported, 1);
    assert.equal(localFamilyPack.local_family_pack_preserves_supported_answer_support, true);
    assert.equal(localFamilyPack.selected_file_count, 2);
    assert.ok(localFamilyPack.selected_pack_bytes < localFamilyPack.local_family_scope_bytes);
    assert.ok(localFamilyPack.context_reduction_vs_local_family_scope > 0);
    assert.deepEqual(localFamilyPack.local_family_pack_only_answer_check_ids, ["release-branch"]);
    assert.deepEqual(localFamilyPack.local_family_pack_missed_supported_answer_check_ids, []);
    assert.equal(results.scenario_answer_authority_local_family_pack.full_local_family_pack_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.full_local_family_support_preservation_rate, 1);
    assert.equal(results.scenario_answer_authority_local_family_pack.mean_local_family_pack_gain_vs_authority_scope, 0.25);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing authority-reachability distinguishes pack misses from true authority gaps", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-authority-reachability-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "releasing.md"),
      [
        "# Releasing",
        "",
        "## Checklist",
        "Release automation uses GitHub Actions.",
        "Update CHANGELOG.md and VERSION file before starting the automation.",
        "",
        "## Stability appendix",
        "This appendix contains explanatory detail that is intentionally much longer than the compact sibling file.",
        "This appendix contains explanatory detail that is intentionally much longer than the compact sibling file.",
        "This appendix contains explanatory detail that is intentionally much longer than the compact sibling file.",
        "The target stable line must already exist before triggering the release."
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "release-branches.md"),
      [
        "# Release branches",
        "",
        "## Branch policy",
        "The target release branch must already exist before triggering the release."
      ].join("\n")
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-authority-reachability",
          label: "Demo Authority Reachability",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-authority-reachability-scenario",
              title: "Releasing",
              path: "docs/reference/releasing.md",
              scenario_class: "release-operations",
              grep_terms: ["releasing", "changelog", "version", "branch"],
              answer_checks: [
                { id: "release-automation", match_any: ["github actions", "release automation"] },
                { id: "release-branch", match_any: ["release branch", "stable line"] },
                { id: "changelog", match_any: ["changelog"] },
                { id: "version", match_any: ["version file", "version"] }
              ],
              answer_authority: {
                allowed_path_prefixes: ["docs/reference/releasing.md"]
              }
            }
          ]
        }
      ]
    });

    const answerAuthority = results.scenario_answer_authority.scenario_results.find(
      (scenario) => scenario.id === "demo-authority-reachability-scenario"
    );
    const answerAuthorityReachability = results.scenario_answer_authority_reachability.scenario_results.find(
      (scenario) => scenario.id === "demo-authority-reachability-scenario"
    );
    const answerAuthorityPack = results.scenario_answer_authority_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-authority-reachability-scenario"
    );

    assert.equal(answerAuthority.authority_scoped_answer_check_coverage, 0.75);
    assert.equal(answerAuthority.requires_out_of_scope_evidence, true);
    assert.equal(answerAuthorityReachability.authority_reachable_answer_check_coverage, 1);
    assert.equal(answerAuthorityReachability.authority_reachable_gain_vs_scoped_pack, 0.25);
    assert.equal(answerAuthorityReachability.authority_gap_explained_by_reachability, true);
    assert.deepEqual(answerAuthorityReachability.authority_reachable_only_answer_check_ids, ["release-branch"]);
    assert.equal(answerAuthorityPack.authority_pack_answer_check_coverage, 1);
    assert.equal(answerAuthorityPack.authority_pack_gain_vs_scoped_pack, 0.25);
    assert.equal(answerAuthorityPack.authority_pack_recall_vs_reachable, 1);
    assert.equal(answerAuthorityPack.authority_pack_preserves_reachable_answer_support, true);
    assert.deepEqual(answerAuthorityPack.authority_pack_only_answer_check_ids, ["release-branch"]);
    assert.deepEqual(answerAuthorityPack.authority_pack_missed_reachable_answer_check_ids, []);
    assert.equal(results.scenario_answer_authority_reachability.full_authority_reachable_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_reachability.authority_gap_explained_by_reachability_rate, 1);
    assert.equal(results.scenario_answer_authority_reachability.scenarios_with_missing_authority_answer_support_rate, 0);
    assert.equal(results.scenario_answer_authority_pack.full_authority_pack_answer_check_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.full_authority_reachable_answer_preservation_rate, 1);
    assert.equal(results.scenario_answer_authority_pack.mean_authority_pack_gain_vs_scoped_pack, 0.25);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("open-source routing claim-support pack preserves support while shrinking cross-file bundle bytes", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aods-open-source-routing-claim-pack-"));
  const corpusRoot = path.join(tempRoot, "demo");

  try {
    fs.mkdirSync(path.join(corpusRoot, "docs", "reference"), { recursive: true });
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "operations.md"),
      [
        "# Operations guide",
        "",
        "## Overview",
        "Deployment rollout guidance for operators.",
        "",
        "## Filler",
        "This section is unrelated noise repeated multiple times to make the full file materially larger.",
        "This section is unrelated noise repeated multiple times to make the full file materially larger.",
        "This section is unrelated noise repeated multiple times to make the full file materially larger.",
        "",
        "## Monitoring",
        "Monitoring dashboards track service health and alerts."
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(corpusRoot, "docs", "reference", "incidents.md"),
      [
        "# Incident guide",
        "",
        "## Overview",
        "General incident overview noise.",
        "",
        "## Runbook",
        "Incident escalation steps and incident commander handoff."
      ].join("\n")
    );

    const results = evaluateOpenSourceRouting({
      corpora: [
        {
          id: "demo-claim-pack",
          label: "Demo Claim Pack",
          output_root: corpusRoot,
          scenarios: [
            {
              id: "demo-claim-pack-scenario",
              title: "Operations incident support",
              path: "docs/reference/operations.md",
              scenario_class: "ops-architecture",
              grep_terms: ["deployment", "monitoring", "incident"],
              answer_support: [
                { id: "deployment", match_any: ["deployment"] },
                { id: "monitoring", match_any: ["monitoring"] },
                { id: "incident", match_any: ["incident escalation", "incident commander", "incident"] }
              ]
            }
          ]
        }
      ]
    });

    const claimSupport = results.scenario_claim_support.scenario_results.find(
      (scenario) => scenario.id === "demo-claim-pack-scenario"
    );
    const claimSupportPack = results.scenario_claim_support_pack.scenario_results.find(
      (scenario) => scenario.id === "demo-claim-pack-scenario"
    );
    const answerCheck = results.scenario_answer_check.scenario_results.find(
      (scenario) => scenario.id === "demo-claim-pack-scenario"
    );
    const costAwareBundle = results.scenario_cost_aware_bundle.scenario_results.find(
      (scenario) => scenario.id === "demo-claim-pack-scenario"
    );

    assert.equal(claimSupport.claim_support_coverage, 1);
    assert.equal(claimSupportPack.claim_support_coverage, 1);
    assert.equal(answerCheck.answer_check_coverage, 1);
    assert.equal(claimSupportPack.pack_claim_support_recall_vs_bundle, 1);
    assert.equal(claimSupportPack.pack_covers_bundle_claim_support, true);
    assert.equal(claimSupportPack.selected_file_count, 2);
    assert.equal(claimSupportPack.selected_section_count, 3);
    assert.ok(claimSupportPack.selected_pack_bytes < costAwareBundle.selected_bundle_bytes);
    assert.ok(claimSupportPack.context_reduction_vs_bundle > 0);
    assert.equal(results.scenario_claim_support_pack.full_bundle_claim_support_preservation_rate, 1);
    assert.equal(results.scenario_claim_support_pack.mean_pack_claim_support_recall_vs_bundle, 1);
    assert.ok(results.scenario_claim_support_pack.median_selected_pack_bytes < results.scenario_cost_aware_bundle.median_selected_bundle_bytes);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
