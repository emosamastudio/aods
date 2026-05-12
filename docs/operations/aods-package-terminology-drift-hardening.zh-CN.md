# AODS package / terminology drift hardening

日期：2026-05-13
范围：U-251 到 U-260
状态：已完成

## 结论

本轮选择的最高价值路线是先把 conformance runner 的包内可用性复验清楚，再把发布前的公开状态、外部使用者示例和术语漂移边界写成可执行记录。

结论如下：

| 事项 | 结论 | 非目标 |
|---|---|---|
| Package install conformance smoke | 本地 tarball 安装后，packaged `aods conformance run` 可读取包内 conformance manifest 并通过 | 不发布 npm |
| CI triage | 当前先不新增 CI workflow；`npm run release:hygiene` 保持本地 release gate | 不直接启用 CI |
| Post-merge issue reconciliation | PR merge 后按 20 个 close refs、4 个 deferred issues、release state、branch state 顺序核对 | 不 merge |
| v0.8 go/no-go | 技术 gate 仍 pass；public release 仍 no-go，直到 version bump、merge、tag/release 决策完成 | 不代替 owner 决策 |
| External conformance examples | 只把 conformance manifest 作为本地验证示例，不宣称 hosted certification | 不建 hosted docs |
| Terminology drift | 能检测结构化字段、枚举、glossary alias、fixture 负例和高风险文档扫描；不能可靠判定所有自然语言同义词 | 不全文自然语言扫描 |

## U-251 package install conformance smoke from tarball

执行方式：

```bash
tmpdir=$(mktemp -d /tmp/aods-pack-smoke.XXXXXX)
npm pack --pack-destination "$tmpdir"
cd "$tmpdir/install"
npm init -y
npm install --save-dev "$tmpdir/aods-0.7.0.tgz"
node ./node_modules/aods/bin/aods.mjs conformance run ./node_modules/aods/examples/compiled-pilot-source/fixtures/conformance-manifest.json --json
```

结果摘要：

| 字段 | 值 |
|---|---:|
| report status | pass |
| cases | 4 |
| passed | 4 |
| failed | 0 |
| expected_failures | 2 |
| package files | 61 |

本轮初始断言把 report status 误设为 `fail`。根因是 conformance report 中负例 case 的 case-level `status` 可以是 `fail`，但只要符合 `expected.status=fail`，suite-level status 仍应为 `pass`。断言已按真实 report contract 重跑并通过；产品代码无需修改。

## U-252 CI triage for release hygiene

推荐结论：暂不启用最小 CI。

| 维度 | 结论 |
|---|---|
| 可重复性 | 本地已有 `npm run release:hygiene`，覆盖 docs link、secret-like scan、package surface、generated clean、skill regression 和 `validate:all` |
| 风险 | 直接加 CI 会把环境差异、网络代理、benchmark 可选依赖、GitHub runner Node 版本差异引入 release gate |
| 成本 | 当前 PR 已 ready 且 merge clean；本轮新增 CI 可能把 release closeout 变成 workflow 调试 |
| 后续入口 | 如要启用，应先只跑 docs link、package surface、generated clean、`validate:all`，再观察误报；不要把 full benchmark 或 hosted repeatability 放进第一版 |

## U-253 post-merge issue close reconciliation execution plan

PR merge 后核对顺序：

1. 读取 PR `#63` 的 merged state、merge commit 和 close refs。
2. 核对以下 20 个 issue 是否被自动关闭：`#33`、`#35`、`#37`、`#38`、`#39`、`#43`、`#44`、`#45`、`#46`、`#47`、`#48`、`#49`、`#50`、`#51`、`#52`、`#54`、`#55`、`#56`、`#57`、`#58`。
3. 核对 deferred issues `#13`、`#41`、`#59`、`#60` 仍保持 open，且没有被 release closeout 误关闭。
4. 如果 intended-close issue 未自动关闭，只追加一条 reconciliation comment，再手动关闭；不要改写历史 PR body。
5. 如果 deferred issue 被误关，重新打开并留言说明其仍是后续路线。
6. 最后核对 release/tag/version state，确认没有把 merge 误当成 release。

## U-254 v0.8 owner go/no-go refresh

当前 owner 决策包刷新为：

| Gate | 状态 | 证据 |
|---|---|---|
| Local release hygiene | pass | `npm run release:hygiene` |
| Package install conformance smoke | pass | local tarball install + packaged conformance run |
| PR mergeability | pass | PR `#63` ready、merge clean、20 close refs recognized |
| Review/checks | conditional | PR 当前 0 reviews、无 GitHub checks；本地 gate 可作为 owner override 证据 |
| Version surface | no-go | package / README / latest release 仍为 `0.7.0`，下一 public release 目标是 `0.8.0` |
| Public release | no-go | 未 merge、未 tag、未创建 GitHub Release |

推荐：继续保持 PR ready，不发布。下一次真正 release execution 前先做 version bump / changelog / release notes 最后一轮。

## U-255 conformance manifest examples for external consumers

外部使用者可以复制的最小边界：

```json
{
  "aods_conformance_manifest_v": 1,
  "suite_id": "local-adoption-smoke",
  "cases": [
    {
      "id": "fixture-manifest-smoke",
      "kind": "fixture-smoke",
      "target": "./fixtures/fixture-manifest.json",
      "expected": {
        "status": "pass"
      }
    },
    {
      "id": "strict-validate",
      "kind": "validate",
      "target": ".",
      "strict": true,
      "expected": {
        "status": "pass"
      }
    }
  ]
}
```

使用口径：

| 项 | 说明 |
|---|---|
| 本地优先 | manifest 指向当前仓库或包内路径 |
| 只读 | runner 只执行 fixture smoke 和 validate case，不执行 arbitrary command |
| 负例可见 | `expected.status=fail` 的 case 是通过 suite 的一部分 |
| 机器消费 | JSON report 是稳定消费入口；text output 只适合人工查看 |
| 不承诺 | 这不是 hosted certification，不代表跨仓库远程认证，也不做语义 judge |

## U-256 terminology drift detection research for lifecycle aliases

用户提出的典型问题是：一个地方把任务生命周期设计为 `start` / `pend` / `end`，另一个地方把 `start` 写成 `begin`。当前能力边界如下：

| 场景 | 当前能否阻止或检测 | 推荐机制 |
|---|---|---|
| 结构化字段 enum 中写错 | 可以 | schema enum / validator |
| manifest/module summary mirror 不一致 | 可以 | validator deterministic mirror rule |
| glossary 已声明 canonical term 和 deprecated term | 可以部分检测 | glossary registry + deterministic reference check |
| conformance fixture 明确期待术语不匹配 | 可以 | negative fixture + expected rules |
| 文档正文中偶发同义词 | 只能只读审查，不能可靠阻断 | 高风险路径 `rg` audit + manual review |
| 未注册的新同义词 | 不应自动判定 | 先要求进入 glossary / alias registry |

因此答案是：如果生命周期词汇进入结构化字段、枚举、glossary 或 fixture，AODS 可以阻止或检测；如果只是普通散文里把 `start` 写成 `begin`，当前不做全量自然语言拦截，最多通过高风险文档审查发现候选问题。

## U-257 lifecycle terminology consistency fixture plan

推荐 fixture 路线：

| Slice | 输入 | 期望规则 |
|---|---|---|
| enum mismatch | lifecycle state 字段使用未声明 `begin` | schema enum failure |
| glossary alias mismatch | canonical `start` 未声明 alias，却出现 `begin` reference | future glossary-term-reference-mismatch |
| deprecated alias | `begin` 明确标为 deprecated replacement=`start` | warning 或 strict-blocking 视 surface stability |
| stable contract mismatch | stable lifecycle contract 使用 `start`，paired consumer 使用 `begin` | future stable-contract-terminology-mismatch |

第一批不做 semantic judge。只接受结构化 ref、explicit glossary mapping、fixture manifest 预期规则这三类可重复输入。

## U-258 glossary term use enforcement boundary

glossary registry 可以作为术语一致性 gate，但只能在以下边界内使用：

| 可 gate | 不 gate |
|---|---|
| canonical term id 是否存在 | 自由文本里每个词是否“含义相同” |
| alias 是否声明 alias_of / replacement | 未注册同义词自动归类 |
| deprecated term 是否给 replacement | 自动 rewrite 文档 |
| linked_surfaces 是否可解析 | 跨仓库远程术语抓取 |
| status 是否 current/deprecated/removed | 用模型判断作者意图 |

推荐后续实现是增加“结构化 term refs”的 validator，而不是扫描所有 prose。

## U-259 stable contract terminology mismatch negative fixture

负例设计：

| 字段 | 值 |
|---|---|
| fixture id | `stable-contract-lifecycle-term-mismatch` |
| target | source-first negative fixture corpus |
| 输入 | contract declares lifecycle states `start` / `pend` / `end`；consumer or summary declares `begin` |
| expected status | fail |
| expected rule | `stable-contract-terminology-mismatch` |
| fail reason | stable consumer 引用了未声明的 lifecycle term |
| non-goal | 不判断普通英文 begin/start 是否同义；只判断未声明 term ref |

进入实现前需要先增加明确字段，例如 `glossary.term_refs[]` 或 stable contract lifecycle term registry。否则 validator 只能扫描 prose，误报风险高。

## U-260 documentation term drift audit

只读审查范围：

| 检查 | 发现 |
|---|---|
| route query | `lifecycle terminology start begin status drift` 正确路由到 authority governance、boot protocol、surface governance |
| spec authority | lifecycle state-machine profile 已明确“lifecycle state”与 human-facing display status 不等价 |
| glossary example | compiled pilot 当前只有 `release-window` aliases 和 `ship window` deprecated term 示例；没有 task lifecycle term registry |
| `begin` 命中 | `spec/boot-protocol.json` 中存在普通操作短语 `begin task execution with active working set`，语义是启动执行，不是 task lifecycle state |
| 高风险结论 | 未发现当前 stable lifecycle contract 中把同一状态同时声明为 `start` 和 `begin` 的结构化冲突 |

后续如果要让 `start` / `begin` 这类错误成为硬失败，必须先把 lifecycle terms 从 prose 提升为结构化权威字段或 glossary ref。

## 下一步

下一轮默认进入 U-261 到 U-270：conformance no-fetch case、adapter capability conformance expansion、observability no-go refresh、package surface guard boundary、generated clean false-positive audit、skill release publish plan、post-merge close verification、release execution dry-run refresh、post-release retrospective 和 next milestone planning。
