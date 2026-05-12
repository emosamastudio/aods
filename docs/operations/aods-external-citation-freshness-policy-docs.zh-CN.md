# AODS External Citation Freshness Policy Docs

任务：U-139
状态：已完成
日期：2026-05-12
范围：authoritative citation freshness maintenance；不抓取 URL

## 目标

明确 authoritative citation 的 freshness 维护规则：什么情况下保持 current，什么时候降为 stale、unresolved 或 withheld，以及这些状态如何影响 stable agent-consumable decision。

## Review Status Policy

| 状态 | 使用条件 | Stable decision 影响 | 维护动作 |
|---|---|---|---|
| `current` | locator / version_or_date 已人工确认仍可支撑 claim | 可支撑 stable decision | 保持 version/date 和 reviewer 证据 |
| `stale` | 已知外部材料更新、过期或不再覆盖 claim | 不应支撑 stable decision | 刷新 citation 或降低 claim |
| `unresolved` | 还没确认材料是否有效，或只是待验证假设 | 不应支撑 stable decision | 明确 owner 和复查条件 |
| `withheld` | 因权限、安全或隐私不能公开材料 | 不应直接支撑 public stable decision | 补内部 review note 或替代公开证据 |

## Freshness 触发器

| Trigger | 处理 |
|---|---|
| 外部 API / 标准 / policy 有新版本 | 更新 `version_or_date`，重新评估 claim posture |
| citation locator 失效 | 降为 `stale` 或替换 locator |
| claim 从背景信息升级为稳定依据 | 必须补 locator、version/date、authority relation 和 current review |
| 假设被本地证据验证 | 改为 supporting-evidence 或 external-authority；同步 uncertainty |
| 权限不允许公开来源 | 使用 `withheld`，并降低公开 stable consumption 承诺 |

## Stable Consumption Gate

| 场景 | 允许吗 | 说明 |
|---|---|---|
| stable decision 引用 current authoritative citation | 允许 | 当前 compiled pilot 属于此类 |
| stable decision 引用 stale authoritative citation | 不允许 | validator 已有 noncurrent citation gate |
| stable decision 引用 unresolved assumption | 不允许 | 只能作为风险说明 |
| section 引用 background-context | 允许 | 不等于 stable authority |

## 当前 compiled-pilot 快照

| 指标 | 值 |
|---|---:|
| total citations | 2 |
| current authoritative | 1 |
| stale authoritative | 0 |
| unresolved authoritative | 0 |
| unsupported assumptions | 1 |
| stable decision noncurrent authoritative refs | 0 |

## 非目标

- 不抓取 URL。
- 不判断远端内容是否真的改变。
- 不把 review_status 自动提升为 current。
- 不允许 withheld 材料绕过 stable consumption gate。
