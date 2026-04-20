# Open-source scenario catalog

## Summary

- Selected corpora: **3**
- Scenario seeds: **20**
- Lifecycle phases represented: build, design, governance, operate, planning, release, vision
- Benchmark dimensions represented: coverage, drift, routing
- Benchmark roles represented: architect, developer, maintainer, operator, product-manager, project-manager, release-manager, security-lead, sre
- Scenario classes: architecture-reference=1, design-proposal=1, observability-operations=1, observability-reference=1, ops-architecture=2, project-governance=1, reference-api=3, release-governance=2, release-operations=1, release-upgrade=1, roadmap-governance=2, security-explanation=1, security-governance=2, tutorial-security=1
- Formats: markdown=16, rst=4

These scenario seeds are curated for **grep-first / lexical-addressable** benchmark work. Each seed carries concrete file paths plus `grep_terms`, some seeds declare optional `answer_support` alias groups so benchmark-v2 can distinguish exact-string misses from claim-support coverage, some now declare explicit `answer_checks` so the benchmark can distinguish wording gaps from concrete answer-support gaps, and some also declare `answer_authority` scopes so the benchmark can separate acceptable in-scope cross-file support from out-of-scope borrowing.

## Corpus overview

| Corpus | License | Seeds | Source files | Source bytes | Why this corpus stays in the pack |
| --- | --- | ---: | ---: | ---: | --- |
| Apache Airflow | Apache-2.0 | 5 | 104 | 1327467 | Balanced lifecycle corpus with architecture, deployment, security, release, and governance slices. |
| Argo CD | Apache-2.0 | 6 | 426 | 6411630 | Strong mix of ops, developer, release, roadmap, and proposal material for dual-surface governance tests. |
| JupyterHub | BSD-3-Clause | 9 | 66 | 746026 | Clean explanation/how-to/reference/tutorial split with release and security material for task-routing benchmarks. |

## Apache Airflow

| Seed | Class | Lifecycle phases | Benchmark roles | File | Bytes |
| --- | --- | --- | --- | --- | ---: |
| Production deployment | ops-architecture | design, release, operate | architect, operator | `airflow-core/docs/administration-and-deployment/production-deployment.rst` | 15114 |
| Security model | security-governance | build, operate, governance | security-lead, operator | `airflow-core/docs/security/security_model.rst` | 47817 |
| Release process | release-governance | release, governance | release-manager, maintainer | `airflow-core/docs/release-process.rst` | 5810 |
| Project governance | project-governance | planning, governance | project-manager, maintainer | `GOVERNANCE.md` | 1161 |
| Metrics | observability-operations | operate | operator, sre | `airflow-core/docs/administration-and-deployment/logging-monitoring/metrics.rst` | 5016 |

## Argo CD

| Seed | Class | Lifecycle phases | Benchmark roles | File | Bytes |
| --- | --- | --- | --- | --- | ---: |
| Operator manual architecture | ops-architecture | design, operate | architect, operator | `docs/operator-manual/architecture.md` | 1397 |
| Release process and cadence | release-governance | planning, release, governance | release-manager, maintainer | `docs/developer-guide/release-process-and-cadence.md` | 7246 |
| Releasing | release-operations | release, operate | release-manager, operator | `docs/developer-guide/releasing.md` | 5748 |
| Roadmap | roadmap-governance | vision, planning, governance | product-manager, maintainer | `docs/roadmap.md` | 245 |
| Security policy | security-governance | build, operate, governance | security-lead, maintainer | `SECURITY.md` | 4650 |
| Config management plugin v2 proposal | design-proposal | design, build | architect, developer | `docs/proposals/config-management-plugin-v2.md` | 13780 |

## JupyterHub

| Seed | Class | Lifecycle phases | Benchmark roles | File | Bytes |
| --- | --- | --- | --- | --- | ---: |
| Technical overview | architecture-reference | design, operate | architect, operator | `docs/source/reference/technical-overview.md` | 6204 |
| Monitoring | observability-reference | operate | operator, sre | `docs/source/reference/monitoring.md` | 2065 |
| Upgrading | release-upgrade | release, operate | operator, maintainer | `docs/source/howto/upgrading.md` | 5030 |
| Web security | security-explanation | design, operate, governance | security-lead, architect | `docs/source/explanation/websecurity.md` | 12938 |
| Contributing roadmap | roadmap-governance | vision, planning, governance | product-manager, maintainer | `docs/source/contributing/roadmap.md` | 3466 |
| Security basics tutorial | tutorial-security | build, operate | developer, operator | `docs/source/tutorial/getting-started/security-basics.md` | 8519 |
| Authenticators | reference-api | build, operate | developer, maintainer | `docs/source/reference/api/auth.md` | 644 |
| Services | reference-api | build, operate | developer, maintainer | `docs/source/reference/api/service.md` | 326 |
| Spawners | reference-api | build, operate | developer, maintainer | `docs/source/reference/api/spawner.md` | 424 |
