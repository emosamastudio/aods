# AODS structured term refs / evidence freshness gates

日期：2026-05-13
任务：U-342 到 U-351
阶段：S39 structured terminology refs / S40 evidence freshness

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；工作树仅 `MEMORY.md` 未跟踪 |
| 最新提交 | 通过 | `25a498b Document roadmap observability capability gates` 已推送 |
| 任务台账 | 通过 | U-332 到 U-341 已完成，下一批默认为 U-342 到 U-351 |
| 公开事项 | 通过 | open issues 仍为 `#60/#59/#41` |
| 质量门禁 | 通过 | `npm run release:hygiene` 通过 |

返工结论：无返工项。上一轮成果合格，可以进入 U-342 到 U-351。

## U-342：structured term refs schema design

目标：让作者在稳定 surface、section 或 artifact 上显式声明“这里依赖哪些规范术语”，让 validator 检查结构化引用，而不是扫描自由文本。

推荐最小字段：

| 字段 | 语义 | 必需性 |
|---|---|---|
| `term_refs[].term_id` | glossary canonical key，例如 `task-lifecycle-start` | 必需 |
| `term_refs[].scope` | `section` / `artifact` / `contract` / `lifecycle` / `capability` / `resource` | 必需 |
| `term_refs[].usage` | `required` / `allowed` / `deprecated-reference` / `example-only` | 必需 |
| `term_refs[].target_ref` | 本条术语引用影响的 section/artifact/field id | 可选 |
| `term_refs[].owner` | 术语引用维护 owner | 可选 |
| `term_refs[].note` | 人读说明，不参与匹配 | 可选 |

放置位置建议：

| Surface | 放置位置 | 理由 |
|---|---|---|
| module section | `sections[].term_refs[]` | section 是最常见的稳定语义承载面 |
| artifact | `artifacts[].term_refs[]` | 状态机、表格、契约等 artifact 需要精确术语 |
| stable contract metadata | `meta.contract.term_refs[]` 或 profile-specific location | 合同级要求需要独立于正文存在 |

非目标：不扫描 prose，不推断同义词，不允许 alias string 作为 machine ref，不自动 rewrite。

## U-343：structured term refs validator design

Validator gate 分层：

| Rule | Level | 行为 |
|---|---|---|
| `term-ref-unresolved` | L2 | `term_id` 不存在于 glossary 时失败 |
| `term-ref-alias-used` | L2 | machine ref 使用 alias 而非 canonical key 时失败 |
| `term-ref-deprecated-stable` | L2 strict / L3 normal | stable / adapter-facing surface 引用 deprecated term 时 strict 阻断，普通模式 warning |
| `term-ref-replacement-missing` | L2 | deprecated term record 缺 replacement 时失败 |
| `term-ref-scope-mismatch` | L3 | `scope` 与目标 artifact/section 类型明显不匹配时 warning |
| `term-ref-owner-missing` | L3 | stable term ref 缺 owner 时 warning |

检查输入只来自 `term_refs[]` 和 glossary registry。validator 不读取周围自然语言来判断是否“用了 begin 这个词”。

## U-344：structured term refs source-first mirror plan

Source-first 路线：

1. 在 `authoring.schema.json` 为 module sections / artifacts / contract metadata 增加 `term_refs[]`。
2. `compile` 原样复制 `term_refs[]` 到 compiled module。
3. manifest summary 只做计数和高风险摘要，不镜像完整列表。
4. companion glossary 继续作为 canonical term registry。

Manifest summary 建议：

```json
{
  "term_ref_summary": {
    "total": 4,
    "stable_refs": 3,
    "deprecated_refs": 0,
    "unresolved_refs": 0
  }
}
```

验收建议：source-first regression 应覆盖 authoring -> compiled module -> manifest summary 的同步。

## U-345：lifecycle alias negative fixture implementation plan

目标负例：设计 task 生命周期为 `start` / `pend` / `end`，但消费面误写为 `begin`。

Fixture shape：

```json
{
  "id": "stable-contract-lifecycle-term-alias",
  "expected_status": "fail",
  "expected_rules": ["term-ref-alias-used"],
  "input": {
    "glossary": {
      "task-lifecycle-start": {
        "definition": "The first lifecycle state for a task.",
        "aliases": ["begin"],
        "status": "current"
      }
    },
    "term_refs": [
      {
        "term_id": "begin",
        "scope": "lifecycle",
        "usage": "required"
      }
    ]
  }
}
```

关键点：`begin` 可以作为 alias 出现在 glossary record 内，但不能作为 `term_refs[].term_id`。这样错误可被稳定检测，不依赖 prose scan。

## U-346：glossary deprecated term strict behavior decision

决策：采用 profile-dependent 行为。

| 场景 | 行为 |
|---|---|
| stable / adapter-facing surface 引用 deprecated term | strict fail；normal warning |
| internal / experimental surface 引用 deprecated term | warning |
| example-only 引用 deprecated term 且带 replacement note | warning 或 pass，取决于 fixture expected outcome |
| deprecated term 缺 replacement | fail |
| alias 被用作 machine ref | fail |

理由：deprecated term 在迁移说明里可以出现，但 stable machine ref 不能依赖 deprecated vocabulary。

## U-347：glossary term refs public docs

公开 docs 推荐表达：

```json
{
  "glossary": {
    "task-lifecycle-start": {
      "definition": "The first lifecycle state for a task.",
      "aliases": ["begin"],
      "status": "current"
    }
  },
  "sections": [
    {
      "sid": "task-lifecycle",
      "term_refs": [
        {
          "term_id": "task-lifecycle-start",
          "scope": "lifecycle",
          "usage": "required"
        }
      ]
    }
  ]
}
```

文档边界：

- `term_refs[]` 是稳定引用，不是搜索关键词。
- alias 只帮助人理解旧叫法，不可作为 machine ref。
- AODS 检查声明的术语引用，不检查所有正文用词。

## U-348：code drift evidence freshness next slice

下一批 evidence freshness 应从报告可解释性入手，而不是引入 fingerprint 或外部抓取。

推荐最小切片：

| Slice | 输出 |
|---|---|
| stale evidence reason envelope | `reason`, `refresh_hint`, `owner`, `last_reviewed` |
| evidence age summary | `current`, `stale`, `blocked`, `planned`, `missing_locator` counts |
| manual review posture | `manual_review_required`, `review_surface`, `review_reason` |
| reality locator posture | `checked`, `missing`, `unchecked`, `remote-unchecked` |

非目标：不计算代码 fingerprint，不执行 evidence command，不 fetch remote repo。

## U-349：evidence freshness fixture plan

首批 fixture 建议：

| Fixture | 输入 | 期望 |
|---|---|---|
| `evidence-current-with-review-date` | current evidence 有 locator / last_reviewed | pass |
| `evidence-stale-with-refresh-hint` | stale evidence 有 refresh hint | warning |
| `evidence-stale-without-refresh-hint` | stale evidence 缺刷新路径 | strict fail 或 L2 warning，需实现前确认 |
| `evidence-current-missing-locator` | current evidence 缺 locator | warning / strict fail，沿用现有 gate |
| `evidence-remote-unchecked` | remote locator 不 fetch | pass with unchecked posture |

Fixture 不应依赖真实远端仓库；使用 local temp path 和 example remote URL 字符串即可。

## U-350：implementation acceptance manual-review docs refresh

文档更新要点：

| 场景 | 建议说明 |
|---|---|
| acceptance criterion 由 validator 覆盖 | 写明 validator rule id |
| acceptance criterion 由 fixture 覆盖 | 写明 fixture id / expected outcome |
| acceptance criterion 需要 manual review | 写明 reviewer role、review surface、decision evidence |
| manual review 过期 | 与 evidence freshness 一样进入 stale posture |
| waived criterion | 必须写 waiver reason、owner、expiry 或 replacement |

边界：manual review 是可审查证据，不是自动通过。

## U-351：reality unchecked repo remediation docs update

更新方向：

| Unchecked reason | 修复动作 |
|---|---|
| local path missing | 修正 repo locator 或在正确 repo root 下运行 |
| descriptive locator | 改成 path-like locator，或保留 unchecked 并说明原因 |
| remote URL | 保留 unchecked；AODS 不 fetch |
| sibling repo outside root | 显式传入正确 repo root 或在后续多 repo支持中处理 |
| generated example path | 保持 example-only，不把 unchecked 当作 current evidence |

Docs 应强调：unchecked 不是 fail，也不是 proof。它只是说明当前 reality gate 没有足够本地上下文完成检查。

## 下一轮建议

下一轮默认 U-352 到 U-361。优先处理 skill install/update decision、packaged skill drift regression、台账/索引/交接压缩、README adoption smoke 和 release trigger matrix。

## 非目标

- 不实现 schema / validator / compile。
- 不新增 fixture 文件。
- 不扫描自由文本。
- 不执行 evidence command。
- 不抓取远端 repo。
- 不发布 release，不创建 tag，不修改 package version。
