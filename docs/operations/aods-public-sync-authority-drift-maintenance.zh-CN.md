# AODS public sync / authority drift maintenance

日期：2026-05-13
范围：U-452 到 U-461
状态：已完成

## 质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | 开工时 `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `9ebb0b3 Define public close criteria packet` |
| Task ledger | 通过 | 当前默认任务为 U-452 到 U-461 |
| Release hygiene | 通过 | 开工前 `npm run release:hygiene` 通过 |
| 返工 | 无 | 上轮成果合格，直接进入本轮 |

## U-452 public roadmap sync execution

按上一轮 packet 执行公开同步，但不关闭 issue、不编辑 issue body、不创建 milestone。

| Issue | Action | Link |
|---|---|---|
| `#60` roadmap tracker | comment-style roadmap sync | https://github.com/emosamastudio/aods/issues/60#issuecomment-4437872917 |
| `#59` observability | comment location semantics / no telemetry boundary | https://github.com/emosamastudio/aods/issues/59#issuecomment-4437873116 |
| `#41` capability | comment metadata-first vs runtime negotiation boundary | https://github.com/emosamastudio/aods/issues/41#issuecomment-4437873298 |

当前公开状态：`#60/#59/#41` 均保持 open。

## U-453 current authority checker spike

建议暂不实现独立 checker。当前最小有价值输入 / 输出如下：

| Input | Signal | Output |
|---|---|---|
| `docs/operations/README.md` | status line、current required table、archive table | current entry has required navigation |
| `docs/operations/aods-task-ledger.zh-CN.md` | 当前回合、未完成数量、recent window 行数 | ledger window and next batch are coherent |
| `docs/operations/aods-handoff.zh-CN.md` | 一句话结论、当前风险、下一轮建议 | handoff does not point to stale batch |
| `docs/operations/archive/*.md` | archive status header and source pointer | archive files cannot be mistaken for current authority |

Decision: keep this as manual audit plus docs link / release hygiene for now. Implement a script only if another stale batch pointer or archive/current contradiction appears in two consecutive rounds.

## U-454 implementation repo path fixture decision

No new fixture this round. Existing focused regression already covers the important repo locator states:

| Existing coverage | Evidence |
|---|---|
| missing local implementation repo locator | `reality validation reports actionable unchecked implementation repo locators` |
| remote implementation repo locator | same focused regression |
| remediation hint for local path mapping | expected `create or map the local implementation repo path before treating reality checks as complete` |

Decision: do not add another fixture until a new locator class appears. Next valuable case would be a path-like repo locator that exists but whose declared implementation path is missing under that repo root.

## U-455 stale evidence negative fixture decision

No new fixture this round. Existing focused regression already covers:

| Existing coverage | Evidence |
|---|---|
| time-bound evidence missing review dates | `time-bound implementation evidence reports freshness warnings and issue locations` |
| expired evidence | same focused regression |
| issue location envelope for evidence warnings | same focused regression |

Decision: do not duplicate this as a conformance case yet. Promote to conformance only if external packaged consumers need expected-warning fixture semantics for stale evidence.

## U-456 acceptance freshness cross-gate decision

Decision: no hard gate yet.

Reasoning:

1. Evidence freshness warnings already surface missing review dates and expired evidence.
2. Acceptance criteria can intentionally use manual review, so a hard gate could block legitimate governance workflows.
3. The next tighter rule should be scoped: only stable agent-consumable decisions that rely on expired evidence should become strict failures.

Next step if needed: design a focused rule that links `acceptance_criteria[].evidence_refs[]` to evidence freshness status, without turning every manual-review criterion into a failure.

## U-457 archive link checker audit

`npm run docs:check-links -- --json` reports:

| Metric | Value |
|---|---:|
| markdown_files | 179 |
| checked_relative_links | 88 |
| missing_links | 0 |

Archive files are included in the Markdown file set, and current docs link to the archive files from operations README / handoff / ledger.

## U-458 historical stale-current label expansion

Decision: do not bulk rewrite historical operations docs. Current archive split already labels the three high-risk historical files:

| File | Currentness marker |
|---|---|
| `docs/operations/archive/aods-operations-readme-archive-2026-05-13.zh-CN.md` | archive |
| `docs/operations/archive/aods-task-ledger-archive-2026-05-13.zh-CN.md` | archive |
| `docs/operations/archive/aods-handoff-archive-2026-05-13.zh-CN.md` | archive |
| `docs/operations/README.md` | current entry |
| `docs/operations/aods-task-ledger.zh-CN.md` | current authority |
| `docs/operations/aods-handoff.zh-CN.md` | current handoff |

Next expansion should be targeted only when a specific historical file is being confused with current authority.

## U-459 operations index generator decision

Decision: do not create a generator yet.

The current index is short, human-maintained, and low churn after the archive split. A generator would add maintenance surface before the format stabilizes.

Create a generator only if:

1. current topic records exceed 12 rows, or
2. archive rows exceed manual maintenance comfort, or
3. docs link check misses an index omission that caused onboarding confusion.

## U-460 task ledger maintenance script decision

Decision: do not create a script yet.

Manual maintenance remains acceptable because the live ledger now keeps:

| Ledger area | Current policy |
|---|---|
| unfinished task pool | explicit rows |
| recent completed window | 30 rows |
| full history | archive file + progress ledger + round log |

Create a script only if the 30-row window is violated again or completed/unfinished counts drift in two consecutive rounds.

## U-461 GitHub release install smoke plan

When release execution starts, verify GitHub source install after the version bump/tag:

1. `npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.9.0` in a temp project.
2. `./node_modules/.bin/aods --help`.
3. `./node_modules/.bin/aods validate ./node_modules/aods/examples/compiled-pilot --strict`.
4. `./node_modules/.bin/aods fixture smoke ./node_modules/aods/examples/compiled-pilot-source/fixtures/fixture-manifest.json`.
5. `./node_modules/.bin/aods conformance run ./node_modules/aods/examples/compiled-pilot-source/fixtures/conformance-manifest.json`.

Do not run this against `v0.9.0` before the tag exists. Current published release remains `v0.8.0`.

## 本轮结论

- Public sync comments were posted for `#60/#59/#41`.
- No public issue was closed.
- No milestone was created.
- No version, tag, or release was changed.
- Current checker / operations generator / task-ledger script remain deferred until repeated drift justifies automation.
- Existing tests cover the implementation repo locator and stale evidence cases; no duplicate fixture added.

## 下一步

下一轮默认进入 U-462 到 U-471：source-first quickstart audit、package sample docs、examples upgrade guidance、local hygiene CI design/dry-runs、benchmark summary / hosted repeatability decisions、benchmark archive policy implementation。
