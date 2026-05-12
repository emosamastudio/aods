# AODS External Citation Review Workflow Triage

任务：U-138
状态：已完成
日期：2026-05-12
范围：external citation review workflow；不做 crawler

## 目标

把 external citation 的 review workflow 固化为可维护步骤：先声明来源，再分类 authority relation、claim posture、review status 和 uncertainty，最后由 validate report 暴露风险。

## Workflow

| 步骤 | 输入 | 输出 | Gate |
|---|---|---|---|
| 1. Source intake | 外部材料或人工假设 | `citation_id`、`source_type` | id 必须 module-local 唯一 |
| 2. Locator review | URL、repo、paper、policy 或 note | `locator`、`version_or_date` | authoritative source 必须有 locator 和 version/date |
| 3. Authority classification | 材料与本 corpus 的关系 | `authority_relation` | unsupported assumption 不能被当 external authority |
| 4. Claim classification | 引用方式 | `claim_posture` | assumption posture 必须和 source/relation 对齐 |
| 5. Review status | 当前维护判断 | `review_status` | stable decision 不能依赖 stale/unresolved/withheld authoritative citation |
| 6. Ref attachment | section / artifact / decision | `citation_refs[]` | refs 必须解析到 module registry |

## 字段解释

| 字段 | 允许值 | 维护含义 |
|---|---|---|
| `authority_relation` | external-authority / supporting-evidence / background-context / inferred-guidance / unsupported-assumption | 说明外部材料对本 corpus 的权威程度 |
| `claim_posture` | authoritative-claim / quoted-source / paraphrase / derived-guidance / assumption | 说明本 corpus 如何使用该材料 |
| `review_status` | current / stale / unresolved / withheld | 说明该材料当前能否支撑稳定消费 |
| `uncertainty` | none / low / medium / high | 说明维护者对引用判断的把握 |

## 当前 Example Snapshot

| citation | posture | review | 判断 |
|---|---|---|---|
| `release-calendar-api-doc` | external authority + authoritative claim | current | 可支撑 stable decision |
| `launch-window-exception-assumption` | unsupported assumption + assumption | unresolved | 只能作为待验证假设 |

## Review 输出

| 输出面 | 当前字段 |
|---|---|
| JSON report | `external_citations.total`、`current_authoritative`、`stale_authoritative`、`unsupported_assumptions`、`stable_decision_noncurrent_authoritative_refs` |
| Text report | `citations total=... authoritative=... current_authoritative=...` |
| Validator issue | duplicate id、unresolved ref、authoritative completeness、assumption posture、stable decision noncurrent citation |

## 非目标

- 不抓取 URL。
- 不做事实核验。
- 不做 claim detector。
- 不做 LLM faithfulness judge。
- 不把 external citation 变成 cross-corpus resolver。
