# AODS conformance expansion / release execution readiness closeout

日期：2026-05-13
范围：U-261 到 U-270
状态：部分完成，post-merge / post-release 任务等待外部状态

## 结论

本轮完成可在 PR 合并前安全推进的 7 项：no-fetch conformance case、adapter capability conformance expansion、observability store no-go、package surface allowlist boundary、generated clean false-positive audit、`aods-use` skill release plan、v0.8 release execution dry-run refresh。

3 项需要真实后置状态，当前不能伪造完成：

| 任务 | 当前状态 | 原因 |
|---|---|---|
| U-267 Post-merge issue close verification execution | 阻塞 | PR `#63` 当前仍 `OPEN`，`mergedAt=null` |
| U-269 Post-release retrospective update | 阻塞 | 最新 GitHub Release 仍是 `v0.7.0`，没有 v0.8 release |
| U-270 Next milestone planning after v0.8 closeout | 阻塞 | v0.8 尚未 closeout，不能基于未发生状态规划最终 closeout |

## U-261 cross-corpus no-fetch conformance case design

当前 conformance runner 只支持两类 case：

| kind | 行为 | fetch posture |
|---|---|---|
| `fixture-smoke` | 读取本地 fixture manifest 或 fixture input | 不 remote fetch |
| `validate` | 对本地 corpus path 运行 validate | 不 remote fetch |

no-fetch case 设计：

```json
{
  "id": "cross-corpus-ref-no-fetch",
  "kind": "validate",
  "target": {
    "path": "./fixtures/cross-corpus-no-fetch",
    "strict": true
  },
  "expected": {
    "status": "fail",
    "rules": [
      "cross-corpus-unresolved-ref"
    ]
  }
}
```

边界：

- 负例 corpus 可声明外部 ref 或 URL-shaped locator。
- runner 只能验证本地声明和 expected rules。
- runner 不 clone、不 curl、不解析远端 corpus、不使用 token。
- 如果未来增加 cross-corpus resolver，必须新增 explicit fetch policy 字段，默认仍是 no-fetch。

## U-262 adapter capability conformance case expansion

推荐扩展为 metadata-only conformance case，不实现 handshake。

候选 case：

| case | 输入 | expected rule |
|---|---|---|
| provider requirement compatible | provider capability 与 consumer requirement 的 profile/version/exposure 匹配 | pass |
| capability id mismatch | provider capability id 不满足 consumer required id | `capability-compatibility-id` |
| schema policy mismatch | provider policy 低于 required policy | `capability-compatibility-schema-policy` |
| exposure mismatch | provider local-only 被 consumer remote-read 使用 | `capability-compatibility-exposure` |

验收边界：

- 只比较 metadata。
- 不发起 adapter negotiation session。
- 不做 auth exchange、provider discovery、fallback ranking、dynamic probing。

## U-263 observability report store no-go second refresh

二次结论：仍不建 report store。

| 输入 | 当前已有出口 | 是否需要 store |
|---|---|---|
| validate report | stdout JSON / text | 否 |
| fixture smoke report | stdout JSON / text | 否 |
| conformance report | stdout JSON / text | 否 |
| route explanation | stdout JSON | 否 |

原因：

- 当前主要风险是 report contract 是否稳定，不是历史存储缺失。
- store 会引入保留期、隐私、远端传输、索引 schema、迁移和清理问题。
- release closeout 需要的是可重复命令和本地证据，不是 dashboard。

进入条件：

- 有多个独立 corpus 需要长期趋势比较。
- 有明确 opt-in、retention、redaction、local-only/remote policy。
- report schema 已稳定到足以迁移。

## U-264 package surface guard auto-update boundary

当前 `scripts/check-package-surface.mjs` 使用显式 allowlist。推荐继续保留人工更新边界。

允许更新 allowlist 的条件：

| 条件 | 要求 |
|---|---|
| 新文件是 public package surface | README、CLI、lib、schema、spec、example、skill 等被 package 消费的文件 |
| 有明确任务来源 | schema/runner/example/skill/package surface 任务 |
| 有验证证据 | `npm run package:check-surface -- --json` missing=0 unexpected=0 |
| 有人审查语义 | 不能只因为 `npm pack` 出现新文件就自动接受 |

不允许自动接受：

- benchmark reports / generated run noise。
- local notes、`MEMORY.md`、临时文件。
- secret-like fixture 或 token。
- 未入账的新 runtime surface。

## U-265 generated clean false-positive audit

当前 generated clean guard 检查：

| path | 目的 |
|---|---|
| `benchmarks/aods-eval-lab/generated` | benchmark generated corpus |
| `benchmarks/aods-eval-lab/reports` | benchmark/report churn |
| `examples/compiled-pilot` | source-first compiled output |

误报边界：

| 场景 | 处理 |
|---|---|
| `compile:pilot` 后生成物与 source 语义一致 | 可接受，但必须与 source change 同 commit |
| `release:self-check` 导致 benchmark report churn | 默认恢复，除非本轮明确接受 benchmark output |
| 用户正在编辑 generated fixture | 不自动恢复；先确认是否属于本轮任务 |
| 路径外生成物 | 当前 guard 不覆盖；如变成 release surface，先扩 checked_paths |

漏报边界：

- guard 不检查所有生成物，只检查当前高风险三组路径。
- package tarball 仍由 package surface guard 负责。
- docs link、secret-like pattern 由独立 hygiene commands 负责。

## U-266 aods-use skill release publish plan

当前 package 内 skill 已对齐 release `v0.7.0` / package `0.7.0`，并覆盖 compile、validate、route、upgrade、fixture/conformance、release alignment。

发布同步路线：

1. repo packaged skill 先随 package 进入 PR。
2. release 前跑 `node --test benchmarks/aods-eval-lab/test/skill-package.test.mjs`。
3. v0.8 release 如果 bump package version，必须同步 `skills/aods-use/skill.json` 的 `skill_version` / `aligned_release`。
4. 本地已安装 skill 可在 release 后另行更新；不把本轮作为 skill 发布任务。
5. 如果技能市场或外部安装面存在单独版本，需要单独 changelog 和 smoke，不混入 AODS package release。

非目标：本轮不发布 skill，不改本地安装 skill，不创建技能分发流水线。

## U-267 post-merge issue close verification execution

当前执行状态：阻塞。

证据：

| 字段 | 值 |
|---|---|
| PR state | OPEN |
| mergedAt | null |
| mergeCommit | null |
| close refs recognized | 20 |
| open issues | 24 |

PR 合并后执行命令：

```bash
gh pr view 63 --json state,mergedAt,mergeCommit,closingIssuesReferences
gh issue list --state open --limit 100 --json number,title,state,url
```

通过条件：

- intended-close issue `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58` 已关闭。
- deferred issue `#13/#41/#59/#60` 仍 open。
- 若 intended-close 未关闭，追加 reconciliation comment 后手动关闭。
- 若 deferred 被误关，重开并说明后续路线。

## U-268 v0.8 release execution dry-run refresh

当前 release state：

| Surface | 当前值 |
|---|---|
| package version | `0.7.0` |
| latest release | `v0.7.0` |
| latest tag | `v0.7.0` |
| target next release | `v0.8.0` |
| PR state | open / merge clean |

dry-run sequence：

1. 确认 PR `#63` merged 或 owner 明确要求先 release branch。
2. bump `package.json` / `package-lock.json` 到 `0.8.0`。
3. 更新 README / README.zh-CN release link 和 release notes body。
4. 跑 `npm run release:self-check`，如产生 benchmark/report churn，按 U-265 判断是否接受。
5. tag dry-run：确认 `git tag --sort=-version:refname` 没有 `v0.8.0`。
6. GitHub Release dry-run：确认 release body、closed issues、deferred issues、rollback notes。
7. 真正执行时创建 tag / GitHub Release；不发布 npm，除非 owner 改 release 策略。

rollback guidance：

- tag 创建失败：不创建 release，修正后重试。
- release 创建失败但 tag 已存在：删除 draft release 或补发 release；不要重写已公开 tag，除非 owner 明确要求。
- issue close reconciliation 失败：用 U-267 步骤修复 issue 状态，不重写 release。

## U-269 post-release retrospective update

当前执行状态：阻塞。

原因：v0.8 release 尚未发生。模板已刷新为 release 后执行：

| 检查 | 记录内容 |
|---|---|
| release evidence | tag、release URL、merge commit、package version |
| closed issues | intended-close 20 个 issue 是否关闭 |
| deferred issues | `#13/#41/#59/#60` 是否保持 open 且说明清楚 |
| local gates | release:self-check、package guard、generated clean、conformance smoke |
| public docs | README links、release notes、example commands |
| follow-up | next milestone task pool 和风险 |

## U-270 next milestone planning after v0.8 closeout

当前执行状态：阻塞。

原因：v0.8 未 closeout，不能把未发生的 release 结果当作规划输入。

候选方向先只保留为 pre-closeout backlog：

| 候选 | 进入条件 | 非目标 |
|---|---|---|
| structured term refs | U-256 到 U-260 证明 prose-only 不够稳定 | 不做全文自然语言 scanner |
| conformance no-fetch expansion | U-261 design 进入 fixture | 不 remote fetch |
| adapter compatibility cases | U-262 metadata case 成熟 | 不实现 handshake |
| package/release hygiene | U-264/U-265 继续稳定 | 不自动接受 package/generated diff |
| runtime PoC reconsideration | v0.8 release 后 owner 明确选择 | 不默认启动 runtime |

下一轮如果 PR 仍未 merge，应优先处理 release decision 或继续扩展结构化 term refs / conformance cases；如果 PR 已 merge，则先执行 U-267。
