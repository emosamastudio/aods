# AODS Cross-corpus Authority Resolver Research

任务：U-158
状态：已完成
日期：2026-05-12
范围：cross-corpus resolver 的 trust model、fetch policy、cache and failure posture；不实现 resolver

## 目标

研究跨 corpus authority resolver 是否应进入后续实现路线，并先定义信任模型、获取策略、缓存策略和失败姿态。当前只做研究，不实现 resolver、remote fetch、cache store 或 cross-repo mutation。

## Problem

AODS 当前可以表达 canonical refs、authority hierarchy、implementation repo locator 和 external citations，但不会自动解析另一个 corpus。这个限制是安全的：它避免 agent 把远程内容、缓存内容或 sibling repo 内容误当成本仓权威。

## Trust Model Candidate

| Trust tier | 说明 | 可用于 stable consumption |
|---|---|---|
| local checked-in corpus | 当前仓库已提交内容 | yes |
| local generated mirror | 由当前 source 生成且 validate 通过 | yes, if generation clean |
| local sibling corpus | 本机路径可读但不属于当前仓库 | only with explicit locator and owner approval |
| pinned remote corpus | commit/tag/hash 固定的远程 corpus | only after fetch policy and cache policy exist |
| floating remote corpus | branch/head/latest URL | no |
| unverified cache | 无 origin / hash / timestamp 证明的缓存 | no |

## Fetch Policy Candidate

| Policy | 行为 | 适用场景 |
|---|---|---|
| no-fetch default | resolver 默认不联网 | 当前安全基线 |
| explicit pinned fetch | 只允许 commit/tag/hash pinned locator | 后续 PoC 候选 |
| allowlist fetch | 只允许 owner-approved domains / repos | release 前需要审批 |
| offline cache read | 只读本地缓存并校验 hash | 仅可作为 advisory |
| floating fetch | 读取 latest / branch head | 当前禁止 |

## Cache / Failure Posture

| 面 | 规则 |
|---|---|
| cache key | corpus locator + commit/tag/hash + schema version |
| cache metadata | fetched_at、source_locator、hash、validator_status |
| stale cache | advisory only；不能用于 stable decision |
| fetch failure | report unresolved，不 fallback 到 stale truth |
| schema mismatch | block stable consumption |
| authority conflict | canonical local authority wins unless explicit override exists |

## Entry Criteria

| Gate | Required before implementation |
|---|---|
| locator schema | external corpus locator must separate id, transport, version, trust posture |
| validation gate | fetched corpus must pass validate before consumption |
| conflict policy | local-vs-remote authority conflict behavior must be explicit |
| cache policy | freshness, invalidation, and no-stale-truth behavior defined |
| public wording | docs must say resolver is not a truth oracle |

## Decision

当前建议：不实现 resolver。最小可行下一步是一个 read-only resolver design proposal，仍保持 no-fetch default，并只允许 pinned local fixture corpus 做 PoC。

## 非目标

- 不实现 cross-corpus resolver。
- 不自动 fetch remote corpus。
- 不缓存或信任 floating branch content。
- 不决定 domain truth。
- 不写入 sibling repo 或 remote repo。
